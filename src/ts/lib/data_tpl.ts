let dataTpl = `
<div class="speciality-data">
	{{#vacations.free}}
	<div class="title">Бюджетных мест</div>
	<div class="value"><span id="selected-free-total">{{total}}</span></div>
	<div class="encoding-wrapper">
		{{#main}}
		<div class="encoding">
			<div class="encoding-name">Основные места</div>
			<div class="encoding-value"><span id="selected-free-main">{{main}}</span></div>
		</div>
		{{/main}}
		{{#target}}
		<div class="encoding">
			<div class="encoding-name">Целевая квота</div>
			<div class="encoding-value"><span id="selected-free-target">{{target}}</span></div>
		</div>
		{{/target}}
		{{#particular}}
		<div class="encoding">
			<div class="encoding-name">Отдельная квота</div>
			<div class="encoding-value"><span id="selected-free-particular">{{particular}}</span></div>
		</div>
		{{/particular}}
		{{#special}}
		<div class="encoding">
			<div class="encoding-name">Специальная квота</div>
			<div class="encoding-value"><span id="selected-free-special">{{special}}</span></div>
		</div>
		{{/special}}
	</div>
	{{/vacations.free}}
</div>
<div class="speciality-data">
	<div class="title">Контрактных мест</div>
	<div class="value"><span id="selected-paid-total">{{vacations.paid.total}}</span></div>
	<div class="encoding-wrapper">
		{{#vacations.paid}}
		{{#main}}
		<div class="encoding">
			<div class="encoding-name">Основные места</div>
			<div class="encoding-value"><span id="selected-paid-main">{{main}}</span></div>
		</div>
		{{/main}}
		{{#foreign}}
		<div class="encoding">
			<div class="encoding-name">Для иностранцев</div>
			<div class="encoding-value"><span id="selected-paid-foreign">{{foreign}}</span></div>
		</div>
		{{/foreign}}
		{{/vacations.paid}}
	</div>
</div>
<div class="speciality-data">
	<div class="title">Продолжительность</div>
	<div class="value"><span id="selected-duration">{{duration}}</span></div>
</div>
<div class="speciality-data">
	<div class="title">Стоимость контракта</div>
	<div class="value"><span class="selected-price">{{price}}</span> ₽/год</div>
</div>
`

export default dataTpl;