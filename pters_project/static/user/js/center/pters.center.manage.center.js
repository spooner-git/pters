$('.pters_selectbox_btn').click(function(){
	var id = $(this).attr('id');
	$(`#page_${id}`).show();
	$(`#page_${id}`).siblings('.manage_page').hide();
})