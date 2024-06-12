export interface IEvent{
	date: string,
	event: string,
	classname?: string,
	bubble?: string
}

export interface IEventsSection{
	section: string,
	subsection?: string,
	title:string,
	bubble?: string,
	content: Array<IEvent>
}

export interface IEventsData{
	events: Array<IEventsSection>
}

export interface IEventsFilter{
	section: string,
	subsection: string
}