let videocard_tpl = `
<div class="faculty-modal-wrapper" id="video-modal">
	<div class="faculty-modal">
		<div class="faculty-modal-body">
			<button class="faculty-modal-close bx bx-x"></button>
			<video src="/lpk-2024/video{{selectedLevel.video}}" controls class="responsive-video" />
		</div>
	</div>
</div>
`;

export default videocard_tpl;