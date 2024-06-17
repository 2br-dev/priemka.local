import mustache from 'mustache';
import template from './template';
import fullcard_tpl from './fullcardtpl';
import dataTpl from './data_tpl';

import { 
	IData, 
	ICardData, 
	IEducationLevel, 
	IEducationForm, 
	IRequirement, 
	IPreparedData, 
	ISection,
	IURLCardData
 } from "./card_interfaces";

class Calculator{

	outputContainer:HTMLElement;
	cards_data:IData;
	selectedCase:ICardData;
	filterParams = {
		quickSearch: "",
		level: "Бакалавриат/специалитет",
		requirements: []
	}

	constructor(container:HTMLElement | string){
		if(typeof(container) == "string"){
			this.outputContainer = <HTMLElement>document.querySelector(container.toString());
		}else{
			this.outputContainer = <HTMLElement>container;
		}
		this.cards_data = {elements: []};
	}

	init(){
		fetch('/data/data.json')
		.then(response => response.json())
		.then(data => {
			let filteredData = this.filter(data);
			this.cards_data = data;
			this.render(filteredData);
			
			// Если в GET параметрах открыты координаты карточки, открываем её
			if(window.location.search != ""){
				let URLParamsString = window.location.search.substring(1);
				let URLParams = new URLSearchParams(URLParamsString);
				let id = parseInt(URLParams.get("id"));
				let form = URLParams.get("form");
				let level = URLParams.get("level");
	
				this.openCard(null, {
					id: id,
					form: form,
					level: level
				})
			}
		})
	
		$('body').on('change', '[name="level"]', this.filterByLevel.bind(this)); 		// Эвент изменения уровня образования
		$('body').on('input', '[name="search"]', this.filterByText.bind(this)); 		// Эвент ввода поискового запроса
		$('body').on('click', '.tag', this.filterByTags.bind(this)); 					// Эвент клика на предметы ЕГЭ (теги)
		$('body').on('click', '.education-form', this.switchFormType.bind(this)); 		// Эвент переключения типа образования в карточке
		$('body').on('click', '#calc-apply', this.runFilters.bind(this)); 				// Запуск фильтрации
		$('body').on('click', '#calc-reset', this.resetFilters.bind(this)); 			// Сброс фильтрации
		$('body').on('click', '.faculty-header', this.toggleFaculty.bind(this)); 		// Переключение отображения факультета
		$('body').on('click', '.spec-card', this.openCard.bind(this));					// Открытие подробных данных о факультете
		$('body').on('click', '.faculty-modal-close', this.closeCard.bind(this));		// Закрытие модального окна при клике на нём
		$('body').on('click', '#share', this.shareModal.bind(this));					// Поделиться
		$('body').on('click', '.faculty-modal-wrapper', this.closeOutside.bind(this))	// Закрытие модального окна по клику мимо
		$('body').on('click', '.form-switcher a', this.switchModalForm.bind(this));		// Переключение формы обучения в модальном окне
		$('body').on('keyup', this.closeCardEsc.bind(this));							// Закрытие модального окна по Esc

	}

	// Закрытие модального окна по нажатию Escape
	closeCardEsc(e:JQuery.KeyUpEvent){
		if(e.key == "Escape"){
			this.closeCard();
		}
	}

	/**
	 * Переключение формы образования в модальном окне
	 */
	switchModalForm(e:JQuery.ClickEvent){
		e.preventDefault();
		let el = <HTMLElement>e.currentTarget;
		let formName = el.textContent;

		let level:IEducationLevel = this.selectedCase.education_levels?.filter((l:IEducationLevel) => {
			return l.name = this.selectedCase.selectedLevel?.name;
		})[0];

		if(!level.forms){
			console.error(level);
			return null;
		}
		let form:IEducationForm = level.forms.filter((f:IEducationForm) => {
			return f.name == formName;
		})[0];

		let output = mustache.render(dataTpl, form);
		this.selectedCase.selectedForm = form;

		$('.form-switcher a').removeClass('selected');
		$(el).addClass('selected');

		$('.speciality-data-wrapper').html(output);
	}

	/**
	 * Закрытие модального окна при клике мимо
	 */
	closeOutside(e:JQuery.ClickEvent){
		e.preventDefault();
		let path = Array.from(e.originalEvent?.composedPath());
		let filteredNodes = path.filter((el:HTMLElement) => {
			if(el.classList){
				return el.classList.contains("faculty-modal");
			}
		})
		if(!filteredNodes.length){
			this.closeCard();
		}
	}

	/**
	 * Фильтрация по уровню (Бакалавриат/Специалитет/Магистратура)
	 */
	filterByLevel(e:JQuery.ChangeEvent):void{
		let input = <HTMLInputElement>e.currentTarget;
		let tab = input.parentElement;
		$('.calculator-head .pseudo-tab').removeClass('active');
		tab?.classList.add('active');
		this.filterParams.level = e.currentTarget.value;
		let filteredData = this.filter(this.cards_data);
		document.querySelector('.calculator-app')?.setAttribute('data-level', e.currentTarget.value);
		document.querySelector('.filters')?.setAttribute('data-level', e.currentTarget.value);
		this.render(filteredData);
	}

	/**
	 * Фильтрация по тексту (быстрый поиск)
	 */
	filterByText(e:Event):void{
		let el = <HTMLInputElement>e.currentTarget;
		this.filterParams.quickSearch = el.value;
		const filteredData = this.filter(this.cards_data);
		this.render(filteredData);
		if(el.value != ""){
			$('.section-wrapper').show();
		}
	}

	/**
	 * Применение фильтров к данным
	 * @param data {IData} Данные
	 * @returns {IData} Отфильтрованные данные
	 */
	filter(data:IData):IData{

		// Уровень образования
		let outputArray = data.elements.filter((el:ICardData) => {
		
			if(el.education_levels){

				return el.education_levels.filter((level:IEducationLevel) => {
					if(this.filterParams.level == "Бакалавриат/специалитет"){
						return level.name == "Бакалавриат" || level.name == "Специалитет";
					}else{
						return level.name == this.filterParams.level
					}
				}).length > 0;
			}
		})

		// Быстрый поиск
		if(this.filterParams.quickSearch != ""){
			
			outputArray = outputArray.filter((el:ICardData) => {

				let needleS = (el.speciality.name || "").toLowerCase();
				let needleF = el.faculty.name.toLowerCase();
				let needleP = (el.profile || "").toLowerCase();
				let search = this.filterParams.quickSearch.toLowerCase().trim();

				return needleS.indexOf(search) >= 0  || needleF.indexOf(search) >= 0 || needleP.indexOf(search) >= 0 ;
			})
		}

		// Требования
		if(this.filterParams.level == "Бакалавриат" || this.filterParams.level == 'Специалитет' || this.filterParams.level=="Бакалавриат/специалитет"){

			if(this.filterParams.requirements.length >= 3){

				// Первый проход (обязательные предметы)
				let necessary = outputArray.filter((el:ICardData) => {
					
					let necArray = el.requirements?.filter((r:IRequirement) => {
						return r.classname === 'required';
					})
		
					let necStrArray = necArray?.map((r:IRequirement) => {
						return r.name
					});
		
					let necIntersect = this.filterParams.requirements.filter(val => necStrArray?.includes(val));
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
		
					let optIntersect = this.filterParams.requirements.filter(val => optStrArray?.includes(val));
					return optIntersect.length >= 1;
				});
		
				outputArray = optional;
			}

		}

		// Сортировка массива перед выдачей
		(outputArray as any) = this.sort(outputArray);

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
	sort(input:Array<ICardData>):Array<ICardData> | null{

		let sortedArray = [...input]; // Копия оригинального массива для изменений

		if(!sortedArray.length) return null;

		sortedArray.sort((a:ICardData, b:ICardData) => {

			// Вывод отладочной информации об ошибочных данных
			// console.log(a.id + ":" + b.id);

			const nameA = a.faculty.name.toLowerCase();
			const nameB = b.faculty.name.toLowerCase();

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
		
				sortedArray = this.InsertArray(sortedArray, (i+1), newElement);
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
	InsertArray(arr:Array<ICardData>, index:number, newElement:ICardData):ICardData[]{
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
	render(data:IData):void{
		
		let preparedData:IPreparedData = this.groupData(data);
		let output = mustache.render(template, preparedData);
		let educationForm = this.filterParams.level;

		this.outputContainer.innerHTML = output;

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

			let cardData = this.cards_data.elements.filter((c:ICardData) => {
				return c.id == id
			})[0];
			if(cardData){

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
			}
		})
	}

	/**
	 * Клик по тегу (ЕГЭ)
	 */
	filterByTags(e:JQuery.ClickEvent):void{

		let el = <HTMLElement>e.currentTarget;
		let content = el.textContent;
		$(el).toggleClass('active');

		let selectedTags = document.querySelectorAll('label.active');
		this.filterParams.requirements = [];
		selectedTags.forEach((tagEl:Element) => {
			let tag = <HTMLElement>tagEl;
			if(tag.textContent){
				(this.filterParams.requirements as string[]).push(tag.textContent);
			}
		});

		let className = selectedTags.length >= 3 ? "bttn" : "bttn disabled";
		document.querySelector('#filter')?.setAttribute('class', className);
	}

	/**
	 * Запуск фильтрации
	 */
	runFilters(e:Event, fast:boolean = false):void{

		if(this.filterParams.requirements.length > 0 && this.filterParams.requirements.length < 3){
			alert("Пожалуйста, выберите не менее 3-х предметов!");
			return;
		}

		let filteredData = this.filter(this.cards_data);
		this.render(filteredData);

		if(!fast){
			$('.section-wrapper').slideDown();
			$('.faculty-header').addClass('active');
		}
	}

	/**
	 * Переключение типа образования в карточке
	 */
	switchFormType(e:JQuery.ClickEvent):void{
		let card = $(e.currentTarget).parents('.spec-card').get(0);
		if(!card) return;
		let id = parseInt(card?.dataset['id'] || "0");
		let selectedForm = e.currentTarget.textContent;

		card?.querySelectorAll('.education-form').forEach((formEl:Element) => {
			let form = <HTMLElement>formEl;
			form.classList.remove("active");
		})

		e.currentTarget.classList.add('active');
		
		let entry = this.cards_data.elements.filter((el:ICardData) => {
			return el.id == id
		})[0];

		if(!entry) return;

		// Получаем уровень
		let level:IEducationLevel | null = null;
		if(entry.education_levels){
			level = entry.education_levels.filter((level:IEducationLevel) => {
				if(this.filterParams.level == "Бакалавриат/специалитет"){
					return level.name == "Бакалавриат" || level.name == "Специалитет";
				}else{
					return level.name == this.filterParams.level;
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
	resetFilters(){
		this.filterParams.requirements = [];
		document.querySelectorAll('.tags label').forEach(el => {
			el.classList.remove('active');
		})
		this.runFilters(null, true);
	}

	/**
	 * Переключение отображения факультета
	 */
	toggleFaculty(e:JQuery.ClickEvent){
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
	groupData(data:IData):IPreparedData{

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
						name: card.faculty.name,
						sectionContent: []
					}
				}else{
					if(section.name != card.faculty.name){
						preparedData.sections.push(section);
						section = {
							name: card.faculty.name,
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

		// if(preparedData.sections.length == 0 && section.sectionContent.length > 0){
			preparedData.sections.push(section);
		// }

		return preparedData;

	}

	/**
	 * Открытие карточки с описанием факультета
	 */
	openCard(e:JQuery.ClickEvent, URLParams:IURLCardData = null){

		// let selectedCase:ICardData;
		let card:HTMLElement;
		
		if(!URLParams){
			
			card = e.currentTarget;
			e.preventDefault();
		
			// Прерываем выполнение если клик происходит по интерактивному элементу внутри карточки
			let path = Array.from(e.originalEvent?.composedPath());
			let links = path.filter((el:HTMLElement) => {
				return el.tagName == "A";
			});
		
			if(links.length) return;
		
			// Если клик по карточке не происходит по интерактивным элементам, продолжаем…
			let id = parseInt(card.dataset['id']);
		
			this.selectedCase = this.cards_data.elements.filter((card:ICardData) => {
				return card.id == id;
			})[0];

			// Если у карточки присутствует поле внешней ссылки, вместо открытия модалки открываем её
		
			let externalLink = this.selectedCase.externalLink;
			if(externalLink != null && externalLink != ""){
				// Открываем окно и прерываем выполнение
				window.open(externalLink, "_blank");
				return null;
			}

		}else{
			this.selectedCase = this.cards_data.elements.filter((card:ICardData) => {
				return card.id == URLParams.id;
			})[0];

			// Прокручиваем до секции карточек и открываем её
			history.scrollRestoration = 'manual';
			let faculty = this.selectedCase.faculty.name;

			let element = $(`[data-faculty='${faculty}']`);
			let top = element.offset().top;
			let content = element.next();
			content.show();
			document.documentElement.scrollTop = top;
		}

		// Выбранный уровень образования
		if(!URLParams){
			this.selectedCase.selectedLevel = this.selectedCase.education_levels.filter((l:IEducationLevel) => {
				if(this.filterParams.level == "Бакалавриат/специалитет"){
					return l.name == "Бакалавриат" || l.name == "Специалитет"
				}else{
					return l.name === this.filterParams.level;
				}
			})[0];
		}else{
			this.selectedCase.selectedLevel = this.selectedCase.education_levels?.filter((l:IEducationLevel) => {
				return l.name == URLParams.level;
			})[0];
		}

		// Если форма обучения - магистратура, прерываем выполнения (ждём описания)
		// TODO Убрать ограничения, когда получим данные
		if(this.selectedCase.selectedLevel.name == "Магистратура"){
			return null;
		}

		// Выбранная форма обучения
		if(!URLParams){
			let formEl = <HTMLElement>card.querySelector('.education-form.active');
			let formText = formEl.textContent;
			this.selectedCase.selectedForm = this.selectedCase.selectedLevel.forms.filter((f:IEducationForm) => {
				return f.name == formText;
			})[0];
		}else{
			this.selectedCase.selectedForm = this.selectedCase.selectedLevel?.forms.filter((f:IEducationForm) => {
				return f.name == URLParams.form
			})[0];
		}

		// Формирование данных для переключателя
		this.selectedCase.switcher = [];
		this.selectedCase.selectedLevel.forms.forEach((f:IEducationForm) => {
			let className = f.name == this.selectedCase.selectedForm.name ? "selected" : "";
			this.selectedCase.switcher?.push({
				name: f.name,
				classname: className
			});
		})

		let dom = mustache.render(fullcard_tpl, this.selectedCase);

		$('body').append(dom);

		setTimeout(() => {
			$('.faculty-modal-wrapper').addClass('open');
		}, 200);
	}

	/**
	 * Закрытие каоточки с описанием факультета
	 */
	closeCard(){
		$('.faculty-modal-wrapper').removeClass('open');
		setTimeout(() => {
			$('.faculty-modal-wrapper').remove();
		}, 600);
	}

	/**
	 * Формирование ссылки на модальное окно
	 */
	async shareModal(){
		let search_params = new URLSearchParams();
		search_params.set("id", this.selectedCase.id?.toString())
		search_params.set("level", this.selectedCase.selectedLevel?.name);
		search_params.set("form", this.selectedCase.selectedForm.name);
		
		let url = window.location.origin + "?" + search_params.toString();

		if(navigator.clipboard && window.isSecureContext){
			await navigator.clipboard.writeText(url).then(() => {
				navigator.clipboard.writeText(url);
				M.toast({html: "Ссылка скопирована в буфер обмена!"});
			})
		}else{
			let input = document.createElement('input');
			try{
				input.value = url;
				document.documentElement.append(input);
				input.select();
				document.execCommand('copy');
			}catch{
				M.toast({html: "Настройки браузера не позволяют скопировать текст в буфер обмена!"});
			}finally{
				input.remove();
				M.toast({html: "Ссылка скопирована в буфер обмена!"});
			}

		}
	}
}

export default Calculator;