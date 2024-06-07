let template = `
{{#sections}}
<div class="faculty-header waves-effect">
	<div class="folder-arrow"></div>
	<h3>{{name}}</h3>
</div>
<div class="section-wrapper">
	<div class="section-content">
	{{#sectionContent}}
	<div class="spec-card-wrapper">
	<div class="spec-card hoverable z-depth-1" data-id="{{id}}" data-faculty="{{faculty}}">
		<div class="card-content">
			<div class="education-levels">
			{{#education_levels}}
				<div data-level="{{name}}" class="education-level">
					{{#forms}}
					<div class="education-form">{{name}}</div>
					{{/forms}}
				</div>
			{{/education_levels}}
			</div>
			<div class="title"><h4 class="no-margin">{{speciality}}</h4></div>
			<div class="subtitle"><span class="code">{{education_levels.0.code}}</span> {{profile}}</div>
			<div class="numbers">
				<div class="number number-free">
					<div class="section-title">Бюджетных мест</div>
					<div class="number-value">{{education_levels.0.forms.0.vacations.free.total}}</div>
				</div>
				<div class="number number-paid">
					<div class="section-title">Контрактных мест</div>
					<div class="number-value">{{education_levels.0.forms.0.vacations.paid.total}}</div>
				</div>
				<div class="number number-duration">
					<div class="section-title">Продолжительность</div>
					<div class="number-value">{{education_levels.0.forms.0.duration}}</div>
				</div>
				<div class="number number-cost">
					<div class="section-title">Стоимость контракта</div>
					<div class="number-value">{{education_levels.0.forms.0.price}} ₽/год</div>
				</div>
			</div>
			<div class="separator"></div>
			<div class="edform-wrapper"><div class="edform-name"><span>{{education_levels.0.name}}</span></div></div>
			<div class="requirements-wrapper">
				<div class="requirements">
					<div class="requirement-header">Обязательные предметы</div>
					{{#necessary}}
					<div class="requirement {{classname}}">{{name}} <span class="min">min<span class="hide-m-down"> баллов</span>: {{min}}</span></div>
					{{/necessary}}
					<div class="requirement-header">Дополнительные предметы</div>
					{{#optional}}
					<div class="requirement {{classname}}">{{name}} <span class="min">min<span class="hide-m-down"> баллов</span>: {{min}}</span></div>
					{{/optional}}
				</div>
			</div>
			{{#note}}
			<div class="note">
			* {{.}}
			</div>
			{{/note}}
		</div>
	</div>
	</div>
	{{/sectionContent}}
	</div>
</div>
{{/sections}}
{{^sections}}
<div class="nulltext">
	К сожалению, нет направлений, соответствующих выбранным вами параметрам
</div>
{{/sections}}
`

export default template;