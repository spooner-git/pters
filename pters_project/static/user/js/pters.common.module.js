$('.pters_selectbox_btn').click(function(e){
	e.stopPropagation();
	$(this).addClass('pters_selectbox_btn_selected');
	$(this).siblings('.pters_selectbox_btn').removeClass('pters_selectbox_btn_selected');
})