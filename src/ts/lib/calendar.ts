import { IEventsData, IEventsSection, IEvent, IEventsFilter } from './events_interfaces';
import eventsTpl from './events_template';
const mustache = require('mustache');

class Calendar{

	eventsData:IEventsData;
	eventsFilter:IEventsFilter = {
		section: "Бакалавриат/специалитет",
		subsection: "free"
	};
	outputContainer:HTMLElement;

	constructor(container:HTMLElement | string){
		if(typeof(container == 'string')){
			this.outputContainer = <HTMLElement>document.querySelector(container.toString());
		}else{
			this.outputContainer = <HTMLElement>container;
		}
	}

	init(){
		// Загрузка начальных данных
		fetch("/lpk-2024/data/events.json")
		.then(res => res.json())
		.then((data:IEventsData) => {
			this.eventsData = data;
			let eventsSection = this.filterEvents();
			this.renderEventsSection(eventsSection);
		})

		$('body').on('click', '[data-form]', this.filterEventsSection.bind(this));
		$('body').on('change', '[name=calendar]', this.filterEventsSection.bind(this));
		$('body').on('click', '[data-bubble]', this.openBubble.bind(this));
		$('body').on('click', this.clickOutside.bind(this));
	}

	/**
	 * Рендер секции событий
	 * @param {IEventsSection} section Секция событий
	 */
	renderEventsSection(section:IEventsSection){
		if(section){
			let output = mustache.render(eventsTpl, section);
			this.outputContainer.innerHTML = output;
		}else{
			this.outputContainer.innerHTML = "К сожалению, ничего не найденно!";
		}
	}

	/**
	 * Фильтрация событий
	 */
	filterEvents():IEventsSection{

		let filteredData:IEventsSection = this.eventsData.events.filter((s:IEventsSection) => {
			if(this.eventsFilter.section == "Бакалавриат/специалитет"){
				return s.section == this.eventsFilter.section && s.subsection == this.eventsFilter.subsection;
			}else{
				return s.section == this.eventsFilter.section;
			}
		})[0];

		return filteredData;
	}

	/**
	 * Триггер фильтрации событий
	 */
	filterEventsSection(e:Event){
		e.preventDefault();

		e.stopImmediatePropagation();
		let el = <HTMLInputElement>e.currentTarget;
		let section = el.value || el.dataset['section'];
		let form = el.dataset['form'];
		let root = document.querySelector('.calendar-wrapper');
		let tabs = $(el).parents('ul').find('.tab');
		let currentTab = $(el).parents('.tab');

		if(section) this.eventsFilter.section = section;
		if(form) this.eventsFilter.subsection = form;
		
		tabs.removeClass('active');
		currentTab.addClass('active');

		root.setAttribute("data-section", section)

		let section2render = this.filterEvents();
		this.renderEventsSection(section2render);
	}

	/**
	 * Отображение всплывающих подсказок для эвентов и их заголовков
	 */
	openBubble(e:JQuery.ClickEvent){
		e.preventDefault();
		let already = $(e.currentTarget).hasClass('open');
		let classList = Array.from(e.currentTarget.classList);
		let initialClassArray = classList.filter((c:string) => {
			return c !== "open"
		});
		let initialClass = initialClassArray.join(" ");
		let newClass:string = already ? initialClass : initialClass + " open";
		$('.info-trigger').removeClass('open');
		$(e.currentTarget).attr('class', newClass);
	}

	/**
	 * Закрытие объектов по клику вне их
	 */
	clickOutside(e:JQuery.ClickEvent){
		let path = e.originalEvent.composedPath();
		let pathArray = Array.from(path);

		// Закрываем открытые баблы
		let bubbles = pathArray.filter((el:HTMLElement) => {
			if(el.classList){
				return el.classList.contains('info-trigger');
			}
		});

		if(!bubbles.length){
			$('.info-trigger').removeClass('open');
		}
	}
}

export default Calendar;