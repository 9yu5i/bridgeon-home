$(function(){
	if	($('.display_style2').length > 0) {
		if	(gl_scroll_top > 0)
			$('body,html').animate({scrollTop:gl_scroll_top},'fast');

		$(".goods_display_more_btn").bind('click',function(){
			var nowpage = parseInt($(this).attr('nowpage'));
			var nextpage = nowpage+1;
			var last_item = $('.display_style2').find('.goodsDisplayItemWrap').last().offset();
			var last_item_top = last_item.top;
			location.href = '?page='+nextpage+'&sort='+gl_sort+gl_sortUrlQuerystring+'&sc_top='+last_item_top;
		});
	}

	if	($('.display_style3').length > 0) {
		$('body').append($('<div>').prop('id','itemstmplayer').addClass('hide'));
		//history back 처리
		if	(gl_hash_paging) {
			gl_hash_paging_arr		= gl_hash_paging.split('y');
			gl_hash_paging			= gl_hash_paging_arr[0].replace('#','');
			gl_hash_scroll			= gl_hash_paging_arr[1];
			document.location.hash	= '';
		}
		if	(gl_hash_paging > 0) {
			gl_display_now_page		= gl_hash_paging;
			get_ajax_display_item(false);
		}else{
			gl_display_window.bind('scroll',(scroll_ajax_get_item));
		}
	}
});

var get_ajax_display_item = function(standby){
	if	(gl_ajax_ing) return;
	if	($("#itemstmplayer").html() == '') {
		var perpage	= $("#"+gl_display_key).attr('perpage');	
		var params	= {	'display_seq':$("#"+gl_display_key).attr('displaySeq'),
						'display_ajax_call':1,
						'display_paging':'style3',
						'page':gl_display_now_page++,
						'perpage':perpage,
						'tab_index':0,
						'hash_paging':gl_hash_paging
					  };

		gl_ajax_ing	= true;

		$.ajax({
			'global' : false,
			'url' : '/goods/design_display_tab',
			'type' : 'post',
			'data' : params,
			'cache' : false,
			'success' : function(res){
				if (res == 'null' || res == '') {
					gl_display_window.unbind('scroll');
				}else{
					$("#itemstmplayer").html(res);
					gl_ajax_ing = false;

					if	(!standby) {
						set_style_display();
						get_ajax_display_item(true);
					}					
				}
			}
		});	
	}else{
		set_style_display();
		get_ajax_display_item(true);
	}
}

//뒤로가기 버튼 클릭시
var end_chk_hash_paing = function(){
	if	(gl_hash_paging > 0) {
		$('body,html').animate({scrollTop:gl_hash_scroll},'fast',function(){setTimeout(function(){gl_display_window.bind('scroll',(scroll_ajax_get_item));},500);});
		gl_hash_paging = 0;
		gl_hash_scroll = 0;
	}
}

var set_style_display = function(){
	var count_w		= $("#"+gl_display_key).attr('count_w');
	var items		= new Array();
	var li_ele		= new Array();
	var ul_ele		= $('<ul>');
	var need_cnt	= 0;

	if	(gl_hash_paging > 0) {
		$("#"+gl_display_key+" .displayTabContentsContainer").html($("#itemstmplayer .displayTabContentsContainer").html());
	}else{
		switch(gl_display_style){
			case 'lattice_a' :
				$("ul",$("#itemstmplayer")).each(function(){
					$("li.goodsDisplayWrap",this).each(function(){
						if	($.trim($(this).html()) != '') {
							items.push($(this).html());
						}
					});
				});

				last_item_cnt = $(".displayTabContentsContainer ul:last-child li .goodsDisplayItemWrap", "#"+gl_display_key).length;

				need_cnt = count_w-last_item_cnt;

				if	(need_cnt > 0) {
					for(i=0;i<need_cnt;i++){
						$("#"+gl_display_key+" .displayTabContentsContainer ul:last-child").find('.goodsDisplayWrap').eq(last_item_cnt+i).html(items[i]).addClass('item_'+gl_display_now_page);
					}
					items.splice(0,need_cnt);
				}

				$.each(items,function(i){
					li_ele.push("<li class='goodsDisplayWrap item_"+gl_display_now_page+"'>"+this+"</li>");
					if	(i%(count_w-1) == 0 && i > 0) {
						ul_ele.append(li_ele.join('<li></li>'));
						$("#"+gl_display_key+" .displayTabContentsContainer").append(ul_ele);
						ul_ele = $('<ul>');
						li_ele = new Array();
					}
				});

				if	(li_ele.length > 0) {
					for(i=0;i<(li_ele.length%count_w);i++){
						li_ele.push("<li class='goodsDisplayWrap'></li>");
					}
					ul_ele.append(li_ele.join('<li></li>'));
					$("#"+gl_display_key+" .displayTabContentsContainer").append(ul_ele);
				}
				break;
			case 'lattice_b':
				$("ul.goodsDisplayItemWrap",$("#itemstmplayer")).each(function(){
					if	($.trim($(this).html()) != '') {
						items.push($(this).html());
					}
				});

				last_item_cnt = $(".displayTabContentsContainer ul:last-child li .goodsDisplayItemWrap", "#"+gl_display_key).length;

				need_cnt = 2-last_item_cnt;

				if	(need_cnt > 0) {
					for(i=0;i<need_cnt;i++){
						$("#"+gl_display_key+" .displayTabContentsContainer>ul:last-child").append("<li><ul class='goodsDisplayItemWrap item_"+gl_display_now_page+"'>"+items[i]+"</ul></li>");
					}
					items.splice(0,need_cnt);
				}

				$.each(items,function(i){
					li_ele.push("<li><ul class='goodsDisplayItemWrap item_"+gl_display_now_page+"'>"+this+"</ul></li>");
					if	(i+1%2 == 2) {
						ul_ele.append(li_ele.join(''));
						$("#"+gl_display_key+" .displayTabContentsContainer").append(ul_ele);
						ul_ele = $('<ul>');
						li_ele = new Array();
					}
				});

				if	(li_ele.length > 0) {
					ul_ele = $('<ul>');
					ul_ele.append(li_ele.join(''));
					$("#"+gl_display_key+" .displayTabContentsContainer").append(ul_ele);
				}
				break;
			case 'list':
				$("ul.goodsDisplayItemWrap",$("#itemstmplayer")).each(function(){
					if	($.trim($(this).html()) != '') {
						items.push($(this).html());
					}
				});

				$.each(items,function(i){
					$("#"+gl_display_key+" .displayTabContentsContainer").append("<ul class='goodsDisplayItemWrap item_"+gl_display_now_page+"'>"+this+"</ul>");
				});
				break;
		}
	}
	$("#itemstmplayer").html('');
	set_goods_display_decoration(".goodsDisplayImageWrap");
	set_goods_display_decoration_event(".goodsDisplayImageWrap");
	try{$('.item_'+gl_display_now_page).each(function(){FB.XFBML.parse($(this).get(0));});	}catch(ex){}
	end_chk_hash_paing();
}

var scroll_ajax_get_item = function(){
	target_offset = $('.display_'+gl_paging_style).find('ul:last-child').find('.goodsDisplayImageWrap').offset();
	if	(target_offset.top-400 <= $(this).scrollTop()) {
		get_ajax_display_item(false);
	}
};