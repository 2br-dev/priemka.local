let fullcard_tpl = `
<div class="faculty-modal-wrapper">
	<div class="faculty-modal">
		<div class="faculty-modal-header" style="background-image:url(/lpk-2024/img/faculty_media/wallpapers/{{selectedLevel.details.image}})">
			<div class="label">{{selectedLevel.name}}</div>
			<div class="header-info">
				<div class="info-top">
					<div class="speciality">
						{{selectedLevel.code}} {{profile}}
					</div>
					<div class="faculty">
						{{faculty.name}}
					</div>
				</div>
				<div class="info-bottom">
					{{speciality}}
				</div>
			</div>
			<button class="faculty-modal-close bx bx-x"></button>
		</div>
		<div class="faculty-modal-body">
			<div class="content-wrapper">
				<div class="speciality">
					<p class="modal-section-header">О направлении</p>
					<ul class="form-switcher">
						{{#switcher}}
						<li><a href="javascript:void(0);" class="{{classname}}">{{name}}</a></li>
						{{/switcher}}
					</ul>
					<div class="speciality-data-wrapper">
						<div class="speciality-data">
							<div class="title">Бюджетные места</div>
							<div class="value"><span id="selected-free-total">{{selectedForm.vacations.free.total}}</span></div>
							<div class="encoding-wrapper">
								{{#selectedForm.vacations.free.main}}
								<div class="encoding">
									<div class="encoding-name">Основные места</div>
									<div class="encoding-value"><span id="selected-free-main">{{selectedForm.vacations.free.main}}</span></div>
								</div>
								{{/selectedForm.vacations.free.main}}
								{{#selectedForm.vacations.free.target}}
								<div class="encoding">
									<div class="encoding-name">Целевая квота</div>
									<div class="encoding-value"><span id="selected-free-target">{{selectedForm.vacations.free.target}}</span></div>
								</div>
								{{/selectedForm.vacations.free.target}}
								{{#selectedForm.vacations.free.particular}}
								<div class="encoding">
									<div class="encoding-name">Отдельная квота</div>
									<div class="encoding-value"><span id="selected-free-particular">{{selectedForm.vacations.free.particular}}</span></div>
								</div>
								{{/selectedForm.vacations.free.particular}}
								{{#selectedForm.vacations.free.special}}
								<div class="encoding">
									<div class="encoding-name">Особая квота</div>
									<div class="encoding-value"><span id="selected-free-special">{{selectedForm.vacations.free.special}}</span></div>
								</div>
								{{/selectedForm.vacations.free.special}}
							</div>
						</div>
						<div class="speciality-data">
							<div class="title">Места по договорам</div>
							<div class="value"><span id="selected-paid-total">{{selectedForm.vacations.paid.total}}</span></div>
							<div class="encoding-wrapper">
								{{#selectedForm.vacations.paid.main}}
								<div class="encoding">
									<div class="encoding-name">Основные места</div>
									<div class="encoding-value"><span id="selected-paid-main">{{selectedForm.vacations.paid.main}}</span></div>
								</div>
								{{/selectedForm.vacations.paid.main}}
								{{#selectedForm.vacations.paid.foreign}}
								<div class="encoding">
									<div class="encoding-name">Для иностранных граждан</div>
									<div class="encoding-value"><span id="selected-paid-foreign">{{selectedForm.vacations.paid.foreign}}</span></div>
								</div>
								{{/selectedForm.vacations.paid.foreign}}
							</div>
						</div>
						<div class="speciality-data">
							<div class="title">Продолжительность</div>
							<div class="value"><span id="selected-duration">{{selectedForm.duration}}</span></div>
						</div>
						<div class="speciality-data">
							<div class="title">Стоимость договора</div>
							<div class="value"><span class="selected-price">
								{{#selectedForm.remark}}
								<a href="javascript:void(0);" data-remark="{{selectedForm.remark}}">
									<span>{{selectedForm.price}}</span> ₽/год</span>
									<i class="bx bxs-info-circle"></i>
								</a>
								{{/selectedForm.remark}}
								{{^selectedForm.remark}}
								{{selectedForm.price}}</span> ₽/год
								{{/selectedForm.remark}}
							</div>
						</div>
					</div>
					<div class="speciality-info">
						{{#note}}
						<small>{{note}}</small>
						{{/note}}
					</div>
					<div class="speciality-info">
						<div>
						{{{selectedLevel.details.about}}}
						{{#selectedLevel.video}}
						<a class="bttn video-trigger" href="#video" data-video="{{selectedLevel.video}}"><i class="bx bx-play" ></i>Смотреть видео</a>
						{{/selectedLevel.video}}
						</div>
					</div>
				</div>
				<div class="faculty">
					<p class="modal-section-header">О факультете</p>
					<div class="head-info-wrapper">
						<div class="head-image">
							<img src="/lpk-2024/img/faculty_media/decans/{{extra.head.photo}}">
						</div>
						<div class="head-data">
							<p>{{extra.head.rank}}</p>
							<p class="name">{{extra.head.last_name}} {{extra.head.first_name}} {{extra.head.middle_name}}</p>
							<p class="regalia">{{extra.head.regalia}}</p>
						</div>
					</div>
					<div class="faculty-info">
						{{{faculty.about}}}
					</div>
				</div>
			</div>
		</div>
		<div class="faculty-modal-footer">
			<div class="social">
				<p class="section-header">Больше о факультете</p>
				<p>
				{{#extra.networks}}
				<a target="_blank" rel="nofollow" class="social-icon {{icon}}" href="{{link}}"></a>
				{{/extra.networks}}
				</p>
			</div>
			<div class="contacts">
				<p class="section-header">Контакты приёмной комиссии</p>
				<div class="contacts-wrapper">
					<div class="contacts-block">
						<div class="contacts-title">«Горячая линия» по вопросам поступления</div>
						<div class="contacts-link">
							<a href="tel:+78612215881"><i class="bx bxs-phone"></i><span>+7 (861) 221-58-81</span></a>
						</div>
					</div>
					<div class="contacts-block">
						<div class="contacts-title">Отдел по работе с абитуриентами</div>
						<div class="contacts-link">
							<a href="tel:+78612215818"><i class="bx bxs-phone"></i><span>+7 (861) 221-58-18</span></a>
						</div>
					</div>
					<div class="contacts-block">
						<div class="contacts-title">Электронная почта приёмной комиссии</div>
						<div class="contacts-link">
							<a href="mailto:pk@kubsau.ru"><i class="bx bxs-envelope-open"></i><span>pk@kubsau.ru</span></a>
						</div>
					</div>
				</div>
			</div>
			<div class="share">
				<a class="share-link" href="javascript:void(0);" id="share"><i class="bx bx-share-alt"></i></a>
			</div>
		</div>
	</div>
</div>
`;

export default fullcard_tpl;