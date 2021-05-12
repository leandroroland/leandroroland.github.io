(function($){

	$(document).on('click','.more-link',function(e){
	 	e.preventDefault();
	 	link = $(this);
	 	id   = link.attr('id').replace("post-", "");

		$.ajax({
			url : dcms_vars.ajaxurl,
			type: 'post',
			data: {
				action : 'dcms_ajax_readmore',
				id_post: id
			},
			beforeSend: function(){
				$('.loader').show();
                $('.PortfolioPost').remove();
                $('.contentPost').remove();
			},
			success: function(resultado){
				$('.loader').hide();
				$('.modal-content').append( resultado );
			}

        });
        

	});

})(jQuery);