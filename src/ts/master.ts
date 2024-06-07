import Lazy from 'vanilla-lazyload';
import * as M from 'materialize-css';
import mustache from 'mustache';
import { IData, ICardData, IEducationLevel, IEducationForm, IRequirement, IPreparedData, ISection } from "./lib/card";
import template from './lib/template';

let cards_data:IData;
declare var ymaps:any;
(window as any).cards_data = cards_data = {elements: []};
let filterParams = {
	quickSearch: "",
	level: "Бакалавриат/специалитет",
	requirements: []
}

document.addEventListener('DOMContentLoaded', () => {
	
	new Lazy({}, document.querySelectorAll('.lazy'));						// Динамическая загрузка изображений
	M.Sidenav.init(document.querySelector('.sidenav'), { edge: 'right' });	// Сайднав (боковая панель навигации)
	$('body').on('click', '.card .footer a', view3DMap);					// Просмотр 3D-карты 
	$('body').on('click', '.faq-header', toggleFAQ);						// Отображение блоков вопрос-ответ

	initCalculator();
	initMap();
});

function toggleFAQ(e:JQuery.ClickEvent){
	e.preventDefault();
	let _this = <HTMLElement>e.currentTarget;
	let answer = _this.nextElementSibling;
	$(answer).slideToggle('fast');
	$(this).toggleClass('active');
}

/**
 *  Просмотр 3D карты
 */
function view3DMap(e:JQuery.ClickEvent){
	let el = <HTMLElement>e.currentTarget;
	let edge = el.id;
	let map = document.querySelector('#territory img');

	$('.card .footer a').removeClass('active');
	el.classList.add('active');

	map.className = `lazy ${edge}`;
}

// Инициализация приложения
function initCalculator(){

	fetch('/data/data.json')
	.then(response => response.json())
	.then(data => {
		let filteredData = filter(data);
		cards_data = data;
		render(filteredData);
	})

	$('body').on('change', '[name="level"]', filterByLevel); // Эвент изменения уровня образования
	$('body').on('input', '[name="search"]', filterByText); //  Эвент ввода поискового запроса
	$('body').on('click', '.tag', filterByTags); //  Эвент клика на предметы ЕГЭ (теги)
	$('body').on('click', '.education-form', switchFormType); //   Эвент переключения типа образования в карточке
	$('body').on('click', '#calc-apply', runFilters); //   Запуск фильтрации
	$('body').on('click', '#calc-reset', resetFilters); //   Сброс фильтрации
	$('body').on('click', '.faculty-header', toggleFaculty); //Переключение отображения факультета
	$('body').on('click', '.spec-card .title', toggleTitle); //Отображение полного текста названия факультета
}

/**
 * Отображение полного названия факультета
 */
function toggleTitle(e:JQuery.ClickEvent){
	$(e.currentTarget).toggleClass('expanded');
}

/**
 * Фильтрация по уровню (Бакалавриат/Специалитет/Магистратура)
  */
function filterByLevel(e:JQuery.ChangeEvent):void{
	let input = <HTMLInputElement>e.currentTarget;
	let tab = input.parentElement;
	$('.calculator-head .pseudo-tab').removeClass('active');
	tab?.classList.add('active');
	filterParams.level = e.currentTarget.value;
	let filteredData = filter(cards_data);
	document.querySelector('.calculator-app')?.setAttribute('data-level', e.currentTarget.value);
	document.querySelector('.filters')?.setAttribute('data-level', e.currentTarget.value);
	render(filteredData);
}

/**
 * Фильтрация по тексту (быстрый поиск)
  */
function filterByText():void{
	filterParams.quickSearch = this.value;
	const filteredData = filter(cards_data);
	render(filteredData);
	if(this.value != ""){
		$('.section-wrapper').show();
	}
}

/**
 * Применение фильтров к данным
 * @param data {IData} Данные
 * @returns {IData} Отфильтрованные данные
 */
function filter(data:IData):IData{

	// Уровень образования
	let outputArray = data.elements.filter((el:ICardData) => {
	
		if(el.education_levels){

			return el.education_levels.filter((level:IEducationLevel) => {
				if(filterParams.level == "Бакалавриат/специалитет"){
					return level.name == "Бакалавриат" || level.name == "Специалитет";
				}else{
					return level.name == filterParams.level
				}
			}).length > 0;
		}
	})

	// Быстрый поиск
	if(filterParams.quickSearch != ""){
		
		outputArray = outputArray.filter((el:ICardData) => {

			let needleS = (el.speciality || "").toLowerCase();
			let needleF = el.faculty.toLowerCase();
			let needleP = (el.profile || "").toLowerCase();
			let search = filterParams.quickSearch.toLowerCase().trim();

			return needleS.indexOf(search) >= 0  || needleF.indexOf(search) >= 0 || needleP.indexOf(search) >= 0 ;
		})
	}

	// Требования
	if(filterParams.level == "Бакалавриат" || filterParams.level == 'Специалитет' || filterParams.level=="Бакалавриат/специалитет"){

		if(filterParams.requirements.length >= 3){

			// Первый проход (обязательные предметы)
			let necessary = outputArray.filter((el:ICardData) => {
				
				let necArray = el.requirements?.filter((r:IRequirement) => {
					return r.classname === 'required';
				})
	
				let necStrArray = necArray?.map((r:IRequirement) => {
					return r.name
				});
	
				let necIntersect = filterParams.requirements.filter(val => necStrArray?.includes(val));
				return necIntersect.length >= 2
	
			});
	
			// Второй проход (необязательные предметы)
			let optional = necessary.filter((el:ICardData) => {
				let optArray = el.requirements?.filter((r:IRequirement) => {
					return r.classname === 'optional';
				});
	
				let optStrArray = optArray?.map((r:IRequirement) => {
					return r.name;
				})
	
				let optIntersect = filterParams.requirements.filter(val => optStrArray?.includes(val));
				return optIntersect.length >= 1;
			});
	
			outputArray = optional;
		}

	}

	// Сортировка массива перед выдачей
	(outputArray as any) = sort(outputArray);

	let output:IData = {
		elements: outputArray
	}

	return output;
}

/**
 * Сортировка объектов по параметру
 * @param {string} property Параметр, по которому надлежит сортировать
 * @returns {Array} Отсортированный массив
 */
function sort(input:Array<ICardData>):Array<ICardData> | null{

	let sortedArray = [...input]; // Копия оригинального массива для изменений

	if(!sortedArray.length) return null;

    sortedArray.sort((a:ICardData, b:ICardData) => {
		const nameA = a.faculty.toLowerCase();
		const nameB = b.faculty.toLowerCase();

		if(nameA < nameB) return -1;
        if (nameA > nameB) return 1;

        return 0;
	})

	// Создание заголовка факультета для первого элемента
	let firstElementFaculty = sortedArray[0].faculty;
	let newElement:ICardData = {
		faculty: firstElementFaculty
	};

	sortedArray.unshift(newElement); // Добавляем заголовок в начало списка

	for(let i=1; i<sortedArray.length-1;i++){
		let nextCardData =  sortedArray[i+1];
		let currentCardData = sortedArray[i];

		if(nextCardData.faculty != currentCardData.faculty){
					
			let newElement:ICardData = {
				faculty: nextCardData.faculty
			}
	
			sortedArray = InsertArray(sortedArray, (i+1), newElement);
		}
	}

	return sortedArray;
}

/**
 * Вставка в указанный индекс массива нового элемента
 * @param {Array<ICardData>} arr Входной массив
 * @param {number} index Индекс, куда поместить новый элемент
 * @param {ICardData} newElement Новый элемент
 * @returns {Array<ICardData>} Массив со вставленным элементом
 */
function InsertArray(arr:Array<ICardData>, index:number, newElement:ICardData):ICardData[]{
	let newArray =  [
		...arr.slice(0,index),
		newElement,
		...arr.slice(index)
	]
	return newArray;
}

/**
 * Вывод данных с помощью Template-машины
 * @param {IData} data Данные для генерации
 */
function render(data:IData):void{
	
	let preparedData:IPreparedData = groupData(data);
	let output = mustache.render(template, preparedData);
	let educationForm = filterParams.level;

	let outputContainer = document.querySelector('#output');
	if(outputContainer) outputContainer.innerHTML = output;

	document.querySelectorAll('.faculty-header').forEach((headerEl:Element) => {
		let header = <HTMLElement>headerEl;
		if(header.nextElementSibling?.className == 'faculty-header') header.remove();
	})

	document.querySelectorAll('.spec-card').forEach((cardEl:Element) => {

		let card = <HTMLElement>cardEl;
		if(!card) return;
		
		// Обновление кодов в карточке
		let id = parseInt(card.dataset['id'] || "0");

		if(id == 0) return;

		let cardData = cards_data.elements[id - 1];
		let selectedLevel = document.querySelector(".calculator-head .active")?.textContent?.trim();
		let level = cardData.education_levels?.filter((l:IEducationLevel) => {
			if(selectedLevel == "Бакалавриат/специалитет"){
				return l.name == "Бакалавриат" || l.name == "Специалитет";
			}else{
				return l.name == selectedLevel
			}
		})[0];

		if(!level) return;
		let code = level.code;
		let freeVacations = level.forms[0].vacations.free.total;
		let paidVacations = level.forms[0].vacations.paid.total;

		let cardCode = card.querySelector('.code');
		if(cardCode) cardCode.textContent = code;

		document.querySelectorAll('.education-level').forEach((levelEl:Element) => {

			let level = <HTMLElement>levelEl;

			level.querySelectorAll('.education-form').forEach((formEl:Element) => {

				let form = <HTMLFormElement>formEl;
				form.classList.remove('active');
			});
			level.querySelector('.education-form:first-of-type')?.classList.add('active');
		})

		// Обновление данных по количеству мест
		let freeValue = card.querySelector('.number-free .number-value');
		let paidValue = card.querySelector('.number-paid .number-value');

		if(freeValue && paidValue){
			freeValue.textContent = freeVacations.toString();
			paidValue.textContent = paidVacations.toString();
		}
	})
}

/**
 * Клик по тегу (ЕГЭ)
  */
function filterByTags(e:JQuery.ClickEvent):void{

	let el = <HTMLElement>e.currentTarget;
	let content = el.textContent;
	$(el).toggleClass('active');

	let selectedTags = document.querySelectorAll('label.active');
	filterParams.requirements = [];
	selectedTags.forEach((tagEl:Element) => {
		let tag = <HTMLElement>tagEl;
		if(tag.textContent){
			(filterParams.requirements as string[]).push(tag.textContent);
		}
	});

	let className = selectedTags.length >= 3 ? "bttn" : "bttn disabled";
	document.querySelector('#filter')?.setAttribute('class', className);
}

/**
 * Запуск фильтрации
 */
function runFilters(e:Event, fast:boolean = false):void{

	if(filterParams.requirements.length > 0 && filterParams.requirements.length < 3){
		alert("Пожалуйста, выберите не менее 3-х предметов!");
		return;
	}

	let filteredData = filter(cards_data);
	render(filteredData);

	if(!fast){
		$('.section-wrapper').slideDown();
		$('.faculty-header').addClass('active');
	}
}

/**
 * Переключение типа образования в карточке
  */
function switchFormType(e:JQuery.ClickEvent):void{
	let card = $(e.currentTarget).parents('.spec-card').get(0);
	if(!card) return;
	let id = parseInt(card?.dataset['id'] || "0");
	let selectedForm = e.currentTarget.textContent;

	card?.querySelectorAll('.education-form').forEach((formEl:Element) => {
		let form = <HTMLElement>formEl;
		form.classList.remove("active");
	})

	e.currentTarget.classList.add('active');
	
	let entry = cards_data.elements.filter((el:ICardData) => {
		return el.id == id
	})[0];

	if(!entry) return;

	// Получаем уровень
	let level:IEducationLevel | null = null;
	if(entry.education_levels){
		level = entry.education_levels.filter((level:IEducationLevel) => {
			if(filterParams.level == "Бакалавриат/специалитет"){
				return level.name == "Бакалавриат" || level.name == "Специалитет";
			}else{
				return level.name == filterParams.level;
			}
		})[0];
	}

	if(!level) return;

	// Получаем форму обучения
	let form:IEducationForm = level.forms.filter((f:IEducationForm) => {
		return f.name == selectedForm;
	})[0];

	let numberFree = card.querySelector('.number-free .number-value');
	let numberPaid = card.querySelector('.number-paid .number-value');
	let duration = card.querySelector('.number-duration .number-value');
	let price = card.querySelector('.number-cost .number-value');

	if(!numberFree || !numberPaid || !duration) return;

	numberFree.textContent = form.vacations.free.total.toString();
	numberPaid.textContent = form.vacations.paid.total.toString();
	duration.textContent = form.duration.toString();
	price.textContent = form.price.toString() + " ₽/год";
	
}

/**
 * Сброс фильтров
 */
function resetFilters(){
	filterParams.requirements = [];
	document.querySelectorAll('.tags label').forEach(el => {
		el.classList.remove('active');
	})
	runFilters(null, true);
}

/**
 * Переключение отображения факультета
 */
function toggleFaculty(e:JQuery.ClickEvent){
	let fheader = $(e.currentTarget);
	let sectionCards = fheader.next();

	let already = sectionCards.is(':visible');
	let classname = already ? "faculty-header" : "faculty-header active";
	fheader[0].className = classname;

	sectionCards.slideToggle({
		duration: 'fast'
	});
}

/**
 * Подготовка данных к передаче шаблонизатору
 * @param {IData} data Данные для упорядочивания
 * @returns {IPreparedData} Подготовленные данные
 */
function groupData(data:IData):IPreparedData{

	let elements:ICardData[] = data.elements;

	if(!elements) return {
		sections: []
	};

	let sections = elements.filter((el:ICardData) => {
		return el.id == null;
	});

	let sectionIndex = 0;
	let preparedData:IPreparedData = {
		sections: []
	};
	
	let section:ISection = {
		name: "",
		sectionContent: []
	};

	data.elements.forEach((card:ICardData) => {

		if(card.id == null){
			if(section.name == ""){
				section = {
					name: card.faculty,
					sectionContent: []
				}
			}else{
				if(section.name != card.faculty){
					preparedData.sections.push(section);
					section = {
						name: card.faculty,
						sectionContent: []
					}
				}
			}
		}else{
			let necessary = card.requirements?.filter((r:IRequirement) => {
				return r.classname == "required";
			})
			let optional = card.requirements?.filter((r:IRequirement) => {
				return r.classname == "optional";
			})
			card.necessary = necessary;
			card.optional = optional;
			section.sectionContent.push(card);
		}
	});

	if(preparedData.sections.length == 0 && section.sectionContent.length > 0){
		preparedData.sections.push(section);
	}

	return preparedData;

}

/**
 * Подгрузка скрипта
 * @param {string} url Адрес скрипта
 * @param {void} callback Обработчик, запускаемый по окончании загрузки
 */
function loadScript(url:string, callback:()=>any){
	let script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = url;
	script.onload = callback;
	document.body.appendChild(script);

	if((script as any).readyState){ //IE
		(script as any).onreadystatechange = function(){
			if((script as any).readyState === "loaded" || (script as any).readyState === "complete"){
				(script as any).onreadystatechange = null;
				callback();
			}
		}
	}else{
		script.onload = callback;
	}

	script.src = url;
	document.getElementsByTagName("head")[0].appendChild(script);
}

/**
 * Инициализация карты
 */
function initMap(){
	loadScript("https://api-maps.yandex.ru/2.1/?lang=ru_RU", () => {
		ymaps.ready(() => {
			
			let map = new ymaps.Map('map', {
				center: [45.045410, 38.930008],
				zoom: 17
			})

			map.behaviors.disable('scrollZoom');

			// Маркер института
			let facultyMarker = new ymaps.Placemark([45.046726, 38.928506]);
			facultyMarker.options.set('iconLayout', 'default#image');
			facultyMarker.options.set('iconImageHref', '/img/faculty_marker.svg')
			facultyMarker.options.set('iconImageSize', [60, 72]);
			facultyMarker.options.set('iconImageOffset', [-30, -72])
			map.geoObjects.add(facultyMarker);

			// Маркер парковки
			let parkingMarker = new ymaps.Placemark([45.044483, 38.928892]);
			parkingMarker.options.set('iconLayout', 'default#image');
			parkingMarker.options.set('iconImageHref', '/img/parking_marker.svg')
			parkingMarker.options.set('iconImageSize', [40, 64]);
			parkingMarker.options.set('iconImageOffset', [-20, -64])
			map.geoObjects.add(parkingMarker);
		})
	})
}