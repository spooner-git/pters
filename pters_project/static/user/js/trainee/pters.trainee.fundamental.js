$('select').change(function(){
    $(this).removeClass('obj_font_color_light_grey').addClass('.obj_font_color_black');
});

function ajax_load_image(option){
	switch(option){
		case 'show':
			$('img.ajax_load_image').show();
		break;

		case 'hide':
			$('img.ajax_load_image').hide();
		break;
	}
}

