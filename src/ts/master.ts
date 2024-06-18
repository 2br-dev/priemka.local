import Lazy from 'vanilla-lazyload';
import * as M from 'materialize-css';



import Swiper from 'swiper';
import { Pagination } from 'swiper/modules';
import Calendar from './lib/calendar';
import Calculator from './lib/calculator';

declare var ymaps:any;
let loaded = 0;

Swiper.use([Pagination]);

document.addEventListener('DOMContentLoaded', () => {
	
	new Lazy({}, document.querySelectorAll('.lazy'));						// Динамическая загрузка изображений
	new Lazy({
		callback_loaded: hideSplash
	}, document.querySelectorAll('.lazy-video'))
	M.Sidenav.init(document.querySelector('.sidenav'), { edge: 'right' });	// Сайднав (боковая панель навигации)
	$('body').on('click', '.card .footer a', view3DMap);					// Просмотр 3D-карты 
	$('body').on('click', '.faq-header', toggleFAQ);						// Отображение блоков вопрос-ответ
	$('body').on('click', '.scroll-link', scrollTo);						// Прокрутка до заданной секции
	renderPage();															// Установка header'а
	
	new Swiper('#map-slider', {
		pagination: {
			type: 'bullets',
			el: '.swiper-pagination',
			clickable: true
		}
	});

	// Scroll-base анимации
	let iconBlocks = document.querySelectorAll('#features .icon-block');
	
	iconBlocks.forEach((el:HTMLElement) => {
		let observer = new IntersectionObserver(reactIntersect, {
			threshold: .2
		});
		observer.observe(el);
	})

	initMap();
	let calendar = new Calendar('#calendar-output').init();					// Календарь событий
	let calculator = new Calculator('#output').init();						// Калькулятор
});

function hideSplash(){
	$('.splash').fadeOut(500);
	$('body').removeClass('fixed');
}

function scrollTo(e:JQuery.ClickEvent){
	e.preventDefault();
	let el = <HTMLLinkElement>e.currentTarget;
	let hash = new URL(el.href).hash;
	let top = $(hash).offset()?.top;

	$('html, body').animate({
		scrollTop: top
	}, 600);

	let sidenav = <HTMLElement>document.querySelector('.sidenav');
	let sidenavInstance = M.Sidenav.getInstance(sidenav);
	sidenavInstance.close();

}

/**
 * Обработка объектов при попадании их в область видимости
 * @param {IntersectionObserverEntry[]} entries Пересечения
 * @param {IntersectionObserver} observer Обозреватель
 */
function reactIntersect(entries:IntersectionObserverEntry[], observer:IntersectionObserver){
	entries.forEach((entry:IntersectionObserverEntry) => {
		let el = entry.target;
		if(entry.isIntersecting){
			el.classList.add('visible');
		}else{
			// el.classList.remove('visible');
		}
	})
}

/**
 * Отрисовка динамических элементов
 */
function renderPage(){

	// #region Header
	let scrollTop = document.documentElement.scrollTop;
	let headerTop = 74 - scrollTop;
	let percent = Math.round((scrollTop * 74) / 100);
	let header = <HTMLElement>document.querySelector('header');

	if(percent > 70){
		percent = 70;
		// Переключаемся на тёмный текст
		header.classList.add('dark');
		$('#logo-text').attr('src', '/img/logo_text.svg');
		$('#logo-leaf').attr('src', '/img/logo_leaf.svg');
	}else{
		header.classList.remove('dark');
		$('#logo-text').attr('src', '/img/logo_text_white.svg');
		$('#logo-leaf').attr('src', '/img/logo_leaf_white.svg');
	}
	
	if(headerTop < 0 || window.innerWidth <= 900) headerTop = 0
	let top = `${headerTop}px`;	
	
	header.style.backgroundColor = `rgba(255, 255, 255, ${percent / 100})`;
	header.style.top = top;

	// #endregion

	// #region Timer
	let currentDate = new Date(); // Текущая дата
	let timerEl = <HTMLElement>document.querySelector('.timer');
	let endDateStr = timerEl.dataset['end'];
	let endDate = new Date(endDateStr); // Целевая дата

	// Расчитываем разницу между текущей и целевой датой
	var timeDiff = (endDate.getTime() - currentDate.getTime());

	if(timeDiff <= 0){
		// Скрываем счётчик, и отображаем уведомление о том, что приём начался
		$('#hero').hide();
		$('#new-hero').show();
	}

	// Вычисляем количество дней, часов, минут и секунд до достижения цели
	var days = Math.floor(timeDiff / (1000 * 3600 * 24));
	var hours = Math.floor((timeDiff % (1000 * 3600 * 24)) / (1000 * 3600));
	var minutes = Math.floor((timeDiff % (1000 * 3600)) / 60000);
	var seconds = Math.floor((timeDiff % 60000) / 1000);

	let daysEl = <HTMLElement>document.querySelector('#d');
	let hoursEl = <HTMLElement>document.querySelector('#h');
	let minutesEl = <HTMLElement>document.querySelector('#m');
	let secondsEl = <HTMLElement>document.querySelector('#s');

	daysEl.textContent = addZero(days);
	hoursEl.textContent = addZero(hours);
	minutesEl.textContent = addZero(minutes);
	secondsEl.textContent = addZero(seconds);
	// #endregion

	requestAnimationFrame(renderPage);
}

/**
 * Добавление «лидирующего» нуля
 * @param {number} n - Число, к которому нужмо применить лидирующий нуль
 * @returns {string} Строка с лидирующим нулем или без него
 */
function addZero(n: number): string {
	return n > 9 ? "" + n : "0" + n;
}

/**
 * Отображение FAQ
 */
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

			// Подпись к маркеру
			let LayoutClass = ymaps.templateLayoutFactory.createClass(
				'<p class="placemark-text">Приёмная комиссия КубГАУ</p>'
			);

			// Маркер института
			let facultyMarker = new ymaps.Placemark([45.046726, 38.928506]);
			facultyMarker.options.set('iconLayout', 'default#imageWithContent');
			facultyMarker.options.set('iconImageHref', '/img/faculty_marker.svg')
			facultyMarker.options.set('iconImageSize', [60, 72]);
			facultyMarker.options.set('iconImageOffset', [-30, -72])
			facultyMarker.options.set('iconContentLayout', LayoutClass);

			map.geoObjects.add(facultyMarker);

			let url = "https://yandex.ru/maps/35/krasnodar/?ll=38.933176%2C45.045049&mode=routes&rtext=~45.046639%2C38.928455&rtt=auto&ruri=~&z=16";
			facultyMarker.events.add(['click'], () => {
				window.open(url, "_blank");
			})

			

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