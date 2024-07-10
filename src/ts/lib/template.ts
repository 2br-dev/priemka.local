let template = `
{{#sections}}
<div class="faculty-header" data-faculty="{{name}}">
	<div class="folder-arrow"></div>
	<h4>{{name}}</h4>
</div>
<div class="section-wrapper">
	<div class="section-content">
	{{#sectionContent}}
	<div class="spec-card-wrapper">
	{{#label}}
	<div class="spec-card-label"><span>{{label}}</span></div>
	{{/label}}
	<div class="spec-card hoverable z-depth-1" data-id="{{id}}" data-faculty="{{faculty.name}}" data-no-data="{{noDetails}}" >
		<div class="card-content">
			<div class="education-levels">
			{{#education_levels}}
				<div data-level="{{name}}" class="education-level">
					{{#forms}}
					<a class="education-form">{{name}}</a>
					{{/forms}}
				</div>
			{{/education_levels}}
			</div>
			<div class="title"><h4 class="no-margin">{{speciality}}</h4></div>
			<div class="subtitle"><span class="code">{{education_levels.0.code}}</span> {{profile}}</div>
			<div class="numbers">
				<div class="number number-free">
					<div class="section-title">Бюджетные места</div>
					<div class="number-value">{{selectedLevel.forms.0.vacations.free.total}}</div>
				</div>
				<div class="number number-paid">
					<div class="section-title">Места по договорам</div>
					<div class="number-value">{{selectedLevel.forms.0.vacations.paid.total}}</div>
				</div>
				<div class="number number-duration">
					<div class="section-title">Продолжительность</div>
					<div class="number-value">{{selectedLevel.forms.0.duration}}</div>
				</div>
				<div class="number number-cost">
					<div class="section-title">Стоимость договора</div>
					<div class="number-value">
						{{#selectedLevel.forms.0.remark}}
							<a href="javascript:void(0)" data-remark="{{selectedLevel.forms.0.remark}}">
								{{selectedLevel.forms.0.price}} ₽/год
								<i class="bx bxs-info-circle"></i>
							</a>
						{{/selectedLevel.forms.0.remark}}
						{{^selectedLevel.forms.0.remark}}
							{{selectedLevel.forms.0.price}} ₽/год
						{{/selectedLevel.forms.0.remark}}
					</div>
				</div>
			</div>
			<div class="separator"></div>
			<div class="edform-wrapper"><div class="edform-name"><span>{{selectedFormName}}</span></div></div>
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
			{{.}}
			</div>
			{{/note}}
			<div class="card-call2action" data-form-c2a="{{selectedFormName}}">
				<span class="bttn">Подробнее</span>
				{{#selectedLevel.video}}
				<a class="bttn video-trigger" href="#video" data-video="{{selectedLevel.video}}"><i class="bx bx-play" ></i><span>Видео</span></a>
				{{/selectedLevel.video}}
			</div>
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