let eventsTpl=`
<h3{{#bubble}} class="info-trigger" data-bubble="{{bubble}}"{{/bubble}}>{{title}}{{#bubble}}<sup class="bx bxs-info-circle"></sup>{{/bubble}}</h3>
{{#content}}
<div class="event">
	<div class="event-date{{#classname}} {{classname}}{{/classname}}">
		<div class="event-date-wrapper">
			<span class="date">{{date}}</span>
			{{#time}}<span class="time">{{time}}</span>{{/time}}
		</div>
	</div>
	<div class="event-divider"></div>
	<div class="event-content">
		<span{{#event-bubble}} class="info-trigger" data-bubble="{{event-bubble}}"{{/event-bubble}}>{{event}}{{#event-bubble}} <i class="bx bx-info-circle""></i>{{/event-bubble}}
	</div>
</div>
{{/content}}
`
export default eventsTpl;