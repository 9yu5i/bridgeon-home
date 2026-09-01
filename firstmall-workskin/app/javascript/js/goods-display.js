var designDisplaySelector="div.designDisplay, div.designCategoryGoodsDisplay, div.designCategoryRecommendDisplay, div.designSearchGoodsDisplay, div.designMshopGoodsDisplay";

$(function(){
	/* 어드민 */
	if(typeof isAdminpage != 'undefined' && isAdminpage == true){

		/* 샘플이미지 : 사이즈변경 */
		$('.display_set_wrap').each(function(){
			var goodsDisplayDecorationContainer = this;
			$("select.image_size", goodsDisplayDecorationContainer).change(function(){
				var image_size = $(this).val();
				$(".goodsDisplayImageWrap img, .goodsDisplayImageTable",goodsDisplayDecorationContainer).css({"width":$("option:selected",this).attr('width'),"height":$("option:selected",this).attr('height')});
				goods_image_decoration_data(goodsDisplayDecorationContainer);
			}).change();
		});

		$(".goodsDisplayDecorationContainer").each(function(){
			var goodsDisplayDecorationContainer = this;

			/* 이미지꾸미기 - 아이콘 선택창 열기 버튼  */
			$(".image_icon_select",goodsDisplayDecorationContainer).bind("click",function(){
				var uniqueKey = "image_icon_select_"+Math.floor(Math.random()*10000000);
				$(this).attr('uniqueKey',uniqueKey);
				$("#displayImageIconPopup input[name='uniqueKey']").val(uniqueKey);
				$("#displayImageIconPopup input[name='subPath']").val('');
				set_display_image_icon();
				$('.icon_set_live').removeClass('icon_set_live');
				$(this).closest('.display_set_wrap').addClass('icon_set_live');
				show_icon_setting();
				$('.icon_tab_title').show();
				if	($('.image_icon_type', $('.icon_set_live')).val() != 'condition')
					$('.icon_title_1').click().addClass('use');
				else
					$('.icon_title_2').click().addClass('use');
				$('#displayImageIconPopup').removeClass('limit_func_list');
				if	($(this).closest('.display_set_wrap').find('.displayImageIconPopupLimit').hasClass('limit_func_list')) {
					$('#displayImageIconPopup').addClass('limit_func_list');
				}
				openDialog("아이콘 <span class='desc'>조건 없이 노출 또는 조건 만족 시 노출로 설정하세요.</span>", "#displayImageIconPopup", {"width":"930","height":"820","show" : "fade","hide" : "fade"});
			});

			/* 이미지꾸미기 - 보내기아이콘 선택창 열기 버튼  */
			$(".image_send_select",goodsDisplayDecorationContainer).bind("click",function(){
				var uniqueKey = "image_send_select_"+Math.floor(Math.random()*10000000);
				$(this).attr('uniqueKey',uniqueKey);
				$("#displayImageIconPopup input[name='uniqueKey']").val(uniqueKey);
				$("#displayImageIconPopup input[name='subPath']").val('send');
				set_display_image_send();
				$('.icon_tab_title').hide();
				$('.icon_tab1').show();
				$('.icon_tab2').hide();
				openDialog("아이콘 선택  <span class='desc'>아이콘으로 사용할 이미지를 클릭하여 주세요.</span>", "#displayImageIconPopup", {"width":"570","height":"300","show" : "fade","hide" : "fade"});
			});

			/* 이미지꾸미기 - 찜 아이콘 선택창 열기 버튼  */
			$(".image_zzim_select",goodsDisplayDecorationContainer).bind("click",function(){
				var uniqueKey = "image_zzim_select_"+Math.floor(Math.random()*10000000);
				$(this).attr('uniqueKey',uniqueKey);
				$("#displayImageIconPopup input[name='uniqueKey']").val(uniqueKey);
				$("#displayImageIconPopup input[name='subPath']").val('zzim');
				set_display_image_zzim();
				$('.icon_tab_title').hide();
				$('.icon_tab1').show();
				$('.icon_tab2').hide();
				openDialog("아이콘 선택  <span class='desc'>아이콘으로 사용할 이미지를 클릭하여 주세요.</span>", "#displayImageIconPopup", {"width":"570","height":"300","show" : "fade","hide" : "fade"});
			});

			/* 이미지꾸미기 - 찜 아이콘 선택창 열기 버튼  */
			$(".image_zzim_on_select",goodsDisplayDecorationContainer).bind("click",function(){
				var uniqueKey = "image_zzim_on_select_"+Math.floor(Math.random()*10000000);
				$(this).attr('uniqueKey',uniqueKey);
				$("#displayImageIconPopup input[name='uniqueKey']").val(uniqueKey);
				$("#displayImageIconPopup input[name='subPath']").val('zzim_on');
				set_display_image_zzim_on();
				$('.icon_tab_title').hide();
				$('.icon_tab1').show();
				$('.icon_tab2').hide();
				openDialog("아이콘 선택  <span class='desc'>아이콘으로 사용할 이미지를 클릭하여 주세요.</span>", "#displayImageIconPopup", {"width":"570","height":"300","show" : "fade","hide" : "fade"});
			});

			/* 이미지꾸미기 - 이미지더보기 아이콘 선택창 열기 버튼  */
			$(".image_slide_select",goodsDisplayDecorationContainer).bind("click",function(){
				var uniqueKey = "image_slide_select_"+Math.floor(Math.random()*10000000);
				$(this).attr('uniqueKey',uniqueKey);
				$("#displayImageIconPopup input[name='uniqueKey']").val(uniqueKey);
				$("#displayImageIconPopup input[name='subPath']").val('slide');
				set_display_image_slide();
				$('.icon_tab_title').hide();
				$('.icon_tab1').show();
				$('.icon_tab2').hide();
				openDialog("아이콘 선택  <span class='desc'>아이콘으로 사용할 이미지를 클릭하여 주세요.</span>", "#displayImageIconPopup", {"width":"570","height":"300","show" : "fade","hide" : "fade"});
			});

			/* 이미지꾸미기 - 퀵바 아이콘 팝업 열기 버튼  */
			$("table.quick_shopping_container",goodsDisplayDecorationContainer).bind("click",function(){
				var uniqueKey = "quick_icon_select_"+Math.floor(Math.random()*10000000);
				$(this).attr('uniqueKey',uniqueKey);
				$("#displayQuickIconPopup input[name='uniqueKey']").val(uniqueKey);
				$("#displayQuickIconPopup .quick_shopping_icon_img").each(function(){
					var randKey = Math.floor(Math.random()*10000000);
					$(this).attr('src',$(this).attr('src').split('#')[0]+'#'+randKey);
				});

				var quick_shopping = eval("("+$(this).closest('.image_decoration_table').find("input[name='quick_shopping']").val()+")");
				for(var i=0;i<quick_shopping.length;i++){
					$("#displayQuickIconPopup input[name='quick_shopping_icon[]'][value='"+quick_shopping[i]+"']").attr('checked',true);
				}

				openDialog("빠른 쇼핑 이미지 변경  <span class='desc'>아이콘으로 사용할 이미지를 클릭하여 주세요.</span>", "#displayQuickIconPopup", {"width":"570","height":"300","show" : "fade","hide" : "fade"});
			});

			/* 이미지꾸미기 빠른쇼핑 이미지 */
			$("input[name='quick_shopping']",goodsDisplayDecorationContainer).change(function(){
				$("table.quick_shopping_container tr",$(this).closest('tr')).empty();
				var data = eval("("+$(this).val()+")");
				var randKey = Math.floor(Math.random()*10000000);

				for(var i=0;i<data.length;i++){
					if(i=='zzim_on') return;
					if(i=='zzim'){
						$("table.quick_shopping_container tr",$(this).closest('tr')).append("<td width='16'><img src='/data/icon/goodsdisplay/quick_shopping/thumb_"+data[i]+".gif#"+randKey+"' /></td>");
					}else{
						$("table.quick_shopping_container tr",$(this).closest('tr')).append("<td><img src='/data/icon/goodsdisplay/quick_shopping/thumb_"+data[i]+".gif#"+randKey+"' /></td>");
					}
				}

			}).change();

			/* 이미지꾸미기 - 체크박스값에 따른 disabled 처리 */
			$(".image_decorate_chk",goodsDisplayDecorationContainer).change(function(){
				var image_decoration_table = $(this).closest('.image_decoration_table');
				if($(this).is(":checked") || $(".image_decorate_chk:checked",image_decoration_table).length){
					$(this).closest(".image_decoration_table").find("*").not(".image_decorate_chk").filter(function(){return $(this).is("select") || $(this).children().length==0;}).css('opacity',1).removeAttr('disabled');
				}else{
					$(this).closest(".image_decoration_table").find("*").not(".image_decorate_chk").filter(function(){return $(this).is("select") || $(this).children().length==0;}).css('opacity',0.3).attr('disabled',true);
				}
			}).change();

			/* 이미지꾸미기 선택정보를 샘플이미지에 적용*/
			$(".image_decoration_table select, .image_decoration_table input",goodsDisplayDecorationContainer).change(function(){
				goods_image_decoration_data(goodsDisplayDecorationContainer);
			});

			/* 상품정보 텍스트정렬을 샘플이미지에 적용 */
			$("input.text_align",goodsDisplayDecorationContainer).change(function(){
				if($(this).is(':checked')){
					$(".goodsDisplayAlign",goodsDisplayDecorationContainer).css("text-align",$(this).val());
				}
			}).change();

			/* 상품정보 항목 값 변경 */
			$("div.info_item .info_item_selector",goodsDisplayDecorationContainer).live('change',function(){
				change_info_item(this);
			});

			/* 상품정보 항목 Sortable */
			$(".info_item_container",goodsDisplayDecorationContainer).sortable({
					placeholder: "info_item_holder"
			});

			$(".image_slide_type",goodsDisplayDecorationContainer).live("change",function(){
				$(".image_slide_sample_bottom, .image_slide_sample_right",goodsDisplayDecorationContainer).hide();
				$(".image_slide_sample_"+$(this).val(),goodsDisplayDecorationContainer).show();
			}).change();

			/* 이미지 하단, 전체 */
			$(".image_overay_type",goodsDisplayDecorationContainer).click(function(){
				if	($(this).val() == 'all') {
					if	($('.image_overay_plus2_main').val()) {
						$('.image_overay_plus2').val('');
						$('.image_overay_plus2_main').val('');
						$('.image_overay_plus2_title').next().find('li').remove();
					}
					$('.overay_bottom').css('visibility','hidden');
					$('.overay_all').css('visibility','');
					$('.img_effect_rollover[attr="all"]').show();
					$('.img_effect_rollover[attr="bottom"]').hide();
				}else{
					$('.overay_bottom').css('visibility','');
					$('.img_effect_rollover[attr="all"]').hide();
					$('.img_effect_rollover[attr="bottom"]').show();
				}
			});

			/* 이미지 꾸미기 아이콘 조건 선택시 */
			if	($('.image_decoration_icon_type', goodsDisplayDecorationContainer).val() == 'condition') {
				sample_icon = $('.goodsDisplayImageTable', goodsDisplayDecorationContainer).find('.goodsDisplayImageIcon').clone();
				sample_icon.css({'position':'relative','display':'inline'});
				$('.image_icon_select_condition', goodsDisplayDecorationContainer).html(sample_icon);
			}

			set_info_item_data(goodsDisplayDecorationContainer);
		});

		/* 어드민 - 이미지꾸미기 - 아이콘 선택 */
		$("#displayImageIconPopup img.icon").live("click",function(){
			var uniqueKey = $("#displayImageIconPopup input[name='uniqueKey']").val();
			var subPath = $("#displayImageIconPopup input[name='subPath']").val();

			switch(subPath){
				case "send":
					$(".image_send_select[uniqueKey='"+uniqueKey+"']").attr("src",$(this).attr('src'));
					var selectedIconName = $(this).attr("src").replace("/data/icon/goodsdisplay/send/","");
					$(".image_send_select[uniqueKey='"+uniqueKey+"']").closest('table').find('input.image_send').val(selectedIconName).change();
				break;
				case "zzim":
					$(".image_zzim_select[uniqueKey='"+uniqueKey+"']").attr("src",$(this).attr('src'));
					var selectedIconName = $(this).attr("src").replace("/data/icon/goodsdisplay/zzim/","");
					$(".image_zzim_select[uniqueKey='"+uniqueKey+"']").closest('table').find('input.image_zzim').val(selectedIconName).change();
				break;
				case "zzim_on":
					$(".image_zzim_on_select[uniqueKey='"+uniqueKey+"']").attr("src",$(this).attr('src'));
					var selectedIconName = $(this).attr("src").replace("/data/icon/goodsdisplay/zzim_on/","");
					$(".image_zzim_on_select[uniqueKey='"+uniqueKey+"']").closest('table').find('input.image_zzim_on').val(selectedIconName).change();
				break;
				case "slide":
					$(".image_slide_select[uniqueKey='"+uniqueKey+"']").attr("src",$(this).attr('src'));
					var selectedIconName = $(this).attr("src").replace("/data/icon/goodsdisplay/slide/","");
					$(".image_slide_select[uniqueKey='"+uniqueKey+"']").closest('table').find('input.image_slide').val(selectedIconName).change();
				break;
				default:
					if	($(".image_icon_select[uniqueKey='"+uniqueKey+"']").hasClass('image_icon_select_condition')) {
						$(".image_icon_select[uniqueKey='"+uniqueKey+"']").closest('div').find('.image_icon_select:eq(0)').attr("src",$(this).attr('src'));
					}else{
						$(".image_icon_select[uniqueKey='"+uniqueKey+"']").attr("src",$(this).attr('src'));
					}
					var selectedIconName = $(this).attr("src").replace("/data/icon/goodsdisplay/","");
					var target_obj = $('.icon_set_live');
					$(".image_icon_select[uniqueKey='"+uniqueKey+"']", target_obj).closest('table').find('input.image_icon').val(selectedIconName).change();
					$('.icon_type_txt[attr="no"]', target_obj).show();
					$('.icon_type_txt[attr="condition"]', target_obj).hide();
					$('.image_icon_select', target_obj).show();
					$('.image_icon_select_condition', target_obj).hide();
				break;
			}

			closeDialog("displayImageIconPopup");
		});

		$('.icon_title_1,.icon_title_2', '.icon_tab_title').click(function(){
			$('.use', '.icon_tab_title').removeClass('use');
			$(this).addClass('use');
			if	($(this).hasClass('icon_title_1')) {
				$('.icon_tab1').show();
				$('.icon_tab2').hide();
				$('.image_icon_type').val('');
			}else{
				$('.icon_tab2').show();
				$('.icon_tab1').hide();
				$('.image_icon_type').val('condition');
			}
		});

		/* 자주쓰는 상품정보 */
		set_decoration_favorite();
		/* 꾸미기, 상품정보 초기화 */
		init_decoration_favorite();

	}

	/* 이미지꾸미기 이미지 설정 */
	set_goods_display_decoration(".goodsDisplayImageWrap");

	/* 이미지꾸미기 이미지 마우스오버 이벤트 설정 */
	set_goods_display_decoration_event(".goodsDisplayImageWrap");
});

function init_decoration_favorite(){
	var type = ['image_', 'goods_', 'm_image_', 'm_goods_'];
	for(var i=0;i<type.length;i++){
		var decoration_type = $('input[name="'+type[i]+'decoration_type"]:checked').val();
		if(decoration_type == 'quality'){
			$('.'+type[i]+'decoration_favorite').hide();
		}
		(function(id)	{
			$('input[name="'+type[id]+'decoration_type"]').bind('click',function(){
				if($(this).val() == 'quality'){
					$('.'+type[id]+'decoration_favorite').hide();
					$('.'+type[id]+'decoration_quality').show();
				}else {
					$('.'+type[id]+'decoration_favorite').show();
					$('.'+type[id]+'decoration_quality').hide();
					$('.'+type[id]+'decoration_favorite').each(function(){
						eleId = $('.favorite_ul', this).data("objBxSlider");
						if(typeof(eleId)!="undefined")
						{
							eleId.redrawSlider();
							eleId.reloadSlider();
						}
					});
				}
			});
		})(i);
	}
}

/* 어드민 - 이미지꾸미기 - 아이콘 선택후 콜백 */
function set_display_image_icon(){
	$.getJSON('../design/display_image_icon', function(data) {
		var tag = '';
		$("div#displayImageIconPopup ul.icon_ul li").remove();

		for(var i=0;i<data.length;i++){
			tag += '<li style="float:left;width:100px;height:80px;text-align:center">';
			tag += '<img src="/data/icon/goodsdisplay/'+data[i]+'" border="0" class="icon hand hover-select">';
			tag += '</li>';
		}
		$("div#displayImageIconPopup ul.icon_ul").html(tag);
	});
}

/* 어드민 - 이미지꾸미기 - 고급설정 배경 이미지 */
function set_display_image_background(){
	$.getJSON('../design/display_image_icon_background', function(data) {
		var tag = '';
		$("div#displayImageIconBackground ul.icon_ul li").remove();

		for(var i=0;i<data.length;i++){
			tag += '<li style="float:left;width:100px;height:80px;text-align:center">';
			tag += '<img src="/data/icon/goodsdisplay/background/'+data[i]+'" border="0" class="icon hand background_img" onclick="$(\'.background_select\').removeClass(\'background_select\');$(this).addClass(\'background_select\')" img="'+data[i]+'">';
			tag += '</li>';
		}
		$("div#displayImageIconBackground ul.icon_ul").html(tag);
	});
}

function change_icon_background(e){
	var parent_obj	= $('#displayImageIconBackground');
	$('.icon_background_ing').removeClass('icon_background_ing');
	$(e).addClass('icon_background_ing');
	var icon_obj = $(e).closest('.items_li_5').find('.background_icon').val();
	var set_obj = decode_base64_json(icon_obj);

	$(".colorpicker", parent_obj).customColorPicker("destroy");

	$('.background_select').removeClass('background_select');

	$('input[name="icon_background_type"][value="'+set_obj['type']+'"]', parent_obj).prop('checked',true);
	if	(set_obj['type'] == 'image') {
		$('.background_img[img="'+set_obj['img']+'"]', parent_obj).addClass('background_select');
		$('input[name="width"]', parent_obj).val('');
		$('input[name="height"]', parent_obj).val('');
		$('input[name="color"]', parent_obj).val('');
		$('input[name="opacity"]', parent_obj).val('');
	}else{
		$('input[name="width"]', parent_obj).val(set_obj['width']);
		$('input[name="height"]', parent_obj).val(set_obj['height']);
		$('input[name="color"]', parent_obj).val(set_obj['color']);
		$('input[name="opacity"]', parent_obj).val(set_obj['opacity']);
	}

	$(".colorpicker", parent_obj).customColorPicker();

	openDialog('배경 변경','#displayImageIconBackground', {'width':'650','height':'420','show' : 'fade','hide' : 'fade'});
}

function apply_image_icon_background(e){
	var parent_obj	= $('#displayImageIconBackground');
	var type = $('input[name="icon_background_type"]:checked').val();
	var ret = {};
	ret.type = type;
	if	(type == 'image') {
		ret.img		= $('.background_select' ,parent_obj).attr('img');
	}else{
		ret.width	= $('input[name="width"]' ,parent_obj).val();
		ret.height	= $('input[name="height"]' ,parent_obj).val();
		ret.color	= $('input[name="color"]' ,parent_obj).val();
		ret.opacity	= $('input[name="opacity"]' ,parent_obj).val();
	}

	$('.icon_background_ing').closest('.items_li_5').find('.background_icon').val(Base64.encode(JSON.stringify(ret)));
	icon_condition_set_all();
	closeDialog('displayImageIconBackground');
}

/* 어드민 - 이미지꾸미기 - 빠른쇼핑 아이콘 선택후 콜백 */
function set_display_quick_icon(quick_shopping_value){
	var uniqueKey = $("#displayQuickIconPopup input[name='uniqueKey']").val();
	$("table.quick_shopping_container[uniqueKey='"+uniqueKey+"']").closest('.image_decoration_table').find("input[name='quick_shopping']").val(quick_shopping_value).change();
	closeDialog('displayQuickIconPopup');

	$("div#displayQuickIconPopup form input[type='text']").val('');
}

/* 어드민 - 이미지꾸미기 - 아이콘 선택후 콜백 */
function set_display_image_send(){
	$.getJSON('../design/display_image_send', function(data) {
		var tag = '';
		$("div#displayImageIconPopup ul.icon_ul li").remove();

		for(var i=0;i<data.length;i++){
			tag += '<li style="float:left;width:100px;height:80px;text-align:center">';
			tag += '<img src="/data/icon/goodsdisplay/send/'+data[i]+'" border="0" class="icon hand hover-select">';
			tag += '</li>';
		}
		$("div#displayImageIconPopup ul.icon_ul").html(tag);
	});
}

/* 어드민 - 이미지꾸미기 - 아이콘 선택후 콜백 */
function set_display_image_zzim(){
	$.getJSON('../design/display_image_zzim', function(data) {
		var tag = '';
		$("div#displayImageIconPopup ul.icon_ul li").remove();

		for(var i=0;i<data.length;i++){
			tag += '<li style="float:left;width:100px;height:80px;text-align:center">';
			tag += '<img src="/data/icon/goodsdisplay/zzim/'+data[i]+'" border="0" class="icon hand hover-select">';
			tag += '</li>';
		}
		$("div#displayImageIconPopup ul.icon_ul").html(tag);
	});
}

/* 어드민 - 이미지꾸미기 - 아이콘 선택후 콜백 */
function set_display_image_zzim_on(){
	$.getJSON('../design/display_image_zzim_on', function(data) {
		var tag = '';
		$("div#displayImageIconPopup ul.icon_ul li").remove();

		for(var i=0;i<data.length;i++){
			tag += '<li style="float:left;width:100px;height:80px;text-align:center">';
			tag += '<img src="/data/icon/goodsdisplay/zzim_on/'+data[i]+'" border="0" class="icon hand hover-select">';
			tag += '</li>';
		}
		$("div#displayImageIconPopup ul.icon_ul").html(tag);
	});
}

/* 어드민 - 이미지더보기 - 아이콘 선택후 콜백 */
function set_display_image_slide(){
	$.getJSON('../design/display_image_slide', function(data) {
		var tag = '';
		$("div#displayImageIconPopup ul.icon_ul li").remove();

		for(var i=0;i<data.length;i++){
			tag += '<li style="float:left;width:100px;height:80px;text-align:center">';
			tag += '<img src="/data/icon/goodsdisplay/slide/'+data[i]+'" border="0" class="icon hand hover-select">';
			tag += '</li>';
		}
		$("div#displayImageIconPopup ul.icon_ul").html(tag);
	});
}

/* 이미지 꾸미기 복사 */
function goods_display_decoration_reset(selector, platform){
	var parent_obj = $(selector);
	var decoration = $('.goodsDisplayImageWrap', parent_obj).data("decoration");
	if (!decoration) return;
	if	(platform == 'pc') {
		var arr = {
			'use_image_border' :		['image_border1','image_border1_width','image_border','image_border_width','image_border_type','image_border_mobile'],
			'use_image_opacity':		['image_opacity'],
			'use_image_icon':			['image_icon','image_icon_location','image_icon_over','image_icon_type','image_icon_condition','image_icon_condition_cnt'],
			'use_image_send':			['image_send','image_send_location','image_send_over'],
			'use_image_zzim':			['image_zzim','image_zzim_on','image_send_location','image_send_over'],
			'use_image_overay':			['image_overay1','image_overay1_text','image_overay2','image_overay2_text','image_overay_type','image_overay_plus1','image_overay_plus1_main','image_overay_plus1_title','image_overay_plus2','image_overay_plus2_main','image_overay_plus2_title'],
			'use_image_slide':			['image_slide','image_slide_type'],
			'use_quick_shopping':		['quick_shopping'],
			'use_image_zoom':			['use_image_zoom'],
			'use_image_3d':				['use_image_3d'],
			'use_seconde_image':		['use_seconde_image'],
			'use_review_option_like':	['use_review_option_like']
		}
	}else{
		var arr = {
			'use_image_border' :		['image_border1','image_border1_width'],
			'use_image_zzim':			['image_zzim','image_zzim_on','image_send_location','image_send_over'],
			'use_image_icon':			['image_icon','image_icon_location','image_icon_over','image_icon_type','image_icon_condition','image_icon_condition_cnt']
		}
	}

	$.each(arr, function(key,val){
		$('.'+key, parent_obj).prop('checked', false).change();
		$.each(val,function(){
			if	($('.'+this, parent_obj).val() != undefined) {
				switch($('.'+this, parent_obj)[0].tagName){
					case 'INPUT':
						if($('.'+this, parent_obj).attr('type')=='text' || $('.'+this, parent_obj).attr('type')=='hidden'){
							$('.'+this, parent_obj).val('').change();
						}else{
							$('.'+this, parent_obj).attr('checked',false).change();
						}
					break;
					case 'SELECT':
						$('.'+this+' > option:eq(0)', parent_obj).prop('selected',true).change();
					break;
				}
			}
		});
		if	(key == 'use_image_border') {
			$('.icon_type_txt[attr="no"]', parent_obj).show();
			$('.icon_type_txt[attr="condition"]', parent_obj).hide();
			$('.icon_type_txt[attr="condition"]', parent_obj).find('.icon_condition_cnt').html('');
			$('.overay_all ul', parent_obj).html('');
			$('.overay_bottom ul', parent_obj).html('');;
		}
	});

	$(".colorpicker", parent_obj).customColorPicker("destroy");

	$.each(decoration,function(set_key, set_val){
		$.each(arr,function(key,val){
			if	($.inArray(set_key,val) > -1 && $.inArray(key,['use_image_send','use_image_zzim']) == -1 ) {
				$('.'+key, parent_obj).prop('checked',true).change();
			}
		});
		if	($('.'+set_key, parent_obj).val() != undefined && set_val) {
			switch($('.'+set_key, parent_obj)[0].tagName){
				case 'INPUT':
					if($('.'+set_key, parent_obj).attr('type')=='text' || $('.'+set_key, parent_obj).attr('type')=='hidden'){
						$('.'+set_key, parent_obj).val(set_val).change();
					}else if($('.'+set_key, parent_obj).attr('type')=='radio') {
						$('.'+set_key+'[value="'+set_val+'"]', parent_obj).attr('checked',true).change();
					}
				break;
				case 'SELECT':
						$('.'+set_key, parent_obj).val(set_val).change();
				break;
			}
		}
		if	($.inArray(set_key, ['image_overay_plus1_title','image_overay_plus2_title']) > -1) {
			$('.'+set_key, parent_obj).closest('div').find('ul').html(Base64.decode(set_val));
		}
	});

	if	(platform == 'pc') {
		if	($('.image_send', parent_obj).val().length > 0)
			$('.use_image_send', parent_obj).prop('checked', true).change();

		if	($('.image_zzim', parent_obj).val().length > 0)
			$('.use_image_zzim', parent_obj).prop('checked', true).change();
	}else{
		if	($('.image_zzim', parent_obj).val().length > 0)
			$('.use_image_zzim', parent_obj).prop('checked', true).change();
	}

	if	($('.image_icon_type', parent_obj).val() == 'condition') {
		$('.icon_condition_cnt', parent_obj).text($('.image_icon_condition_cnt', parent_obj).val())
		$('.icon_type_txt[attr="no"]', parent_obj).hide();
		$('.icon_type_txt[attr="condition"]', parent_obj).show();
		$('.image_icon_select').hide();
		$('.image_icon_select_condition').show();

		sample_icon = $('.goodsDisplayImageTable', parent_obj).find('.goodsDisplayImageIcon').clone();
		sample_icon.css({'position':'relative','display':'inline'});
		$('.image_icon_select_condition', parent_obj).html(sample_icon).show();
	}else{
		if	($('.image_icon', parent_obj).val())
			$('.image_icon_select').prop('src','/data/icon/goodsdisplay/'+$('.image_icon', parent_obj).val()+"#" + Math.random());
		$('.image_icon_select').show();
		$('.image_icon_select_condition').hide();
	}

	$(".colorpicker", parent_obj).customColorPicker();
}

/* 이미지꾸미기 이미지 설정 */
function set_goods_display_decoration(selector){

	$(selector)
	.each(function(){

		var that				= this;
		var imageObj			= $(this).find("img:eq(0)");
		var designDisplayObj	= $(that).closest(designDisplaySelector);
		var version				= $(this).attr('version');
		var is_display_edit		= false;
		var image_optimize		= $(this).attr('img_opt');
		var is_image_optimize	= false;
		var displaystyle		= $(imageObj).closest('.designDisplay').attr('displaystyle');

		if	(version == 'display_edit')	is_display_edit		= true; //디스플레이 수정 여부 확인
		if	(image_optimize == 1)		is_image_optimize	= true; //이미지 최적화는 이미지의 길이가 불규칙해서 정의함

		if($(this).data('decorationLoaded') || !$(this).attr("decoration") || $(this).attr("decoration")=="e30="){
			if(!$(this).data('decorationLoaded')){
				$(this).css({"border":"0px"});
				$(".goodsDisplayImageIcon",that).remove();
				$(".goodsDisplayImageSend",that).remove();
			}
			return;
		}

		$(this).wrap("<div class='relative' />")
		$(this).css({'position':'relative','display':'inline-block'})

		// 속도를 위해 상품디스플레이객체에서 이미지꾸미기설정을 가져옴
		if(designDisplayObj.find(selector).index(that)>0){
			var decoration = designDisplayObj.data("decoration");
			$(that).data("decoration",decoration);
		}
		else{
			if($(that).attr("decoration")) $(that).data("decoration",eval("("+Base64.decode($(that).attr("decoration"))+")"));
			designDisplayObj.data("decoration",$(that).data("decoration"));
			var decoration = $(that).data("decoration");
		}

		if($(that).attr("goodsInfo")) $(that).data("goodsInfo",eval("("+Base64.decode($(that).attr("goodsInfo"))+")"));
		var goodsInfo = $(that).data("goodsInfo");

		/*
		if(goodsInfo.goods_status=='runout'){

			if($(".goodsDisplayImageOveraySoldout",this).length){
				$(".goodsDisplayImageOveraySoldout",this).remove();
			}

			var overaySoldoutObj = $("<div class='goodsDisplayImageOveraySoldout'><div class='goodsDisplayImageOveraySoldoutBg'></div><div class='goodsDisplayImageOveraySoldoutText'></div></div>");

			var overaySoldoutHeight = 75;

			overaySoldoutObj
			.css({
				'position'			: 'absolute',
				'left'				: 0,
				'top'				: '100%',
				'margin-top'		: -overaySoldoutHeight,
				'width'				: $(that).width(),
				'height'			: overaySoldoutHeight
			});

			$(".goodsDisplayImageOveraySoldoutBg",overaySoldoutObj)
			.css({
				//'background-color'	: '#ff0000',
				'color'				: '#fff',
				'opacity'			: 0.3,
				'position'			: 'absolute',
				'left'				: 0,
				'top'				: 0,
				'width'				: $(that).width(),
				'height'			: overaySoldoutHeight
			});

			$(".goodsDisplayImageOveraySoldoutText",overaySoldoutObj)
			.css({
				'background'		: "url('/data/icon/common/etc/soldout_mark.png') no-repeat top right",
				'width'				: '81px',
				'height'			: '71px',
				'position'			: 'absolute',
				'overflow'			: 'hidden',
				'white-space'		: 'nowrap',
				'right'				: 0,
				'top'				: 0,
				'width'				: $(that).width()
			});
			overaySoldoutObj.show();

			imageObj.after(overaySoldoutObj);

		}
		*/
		if(decoration){
			// 상품디스플레이 속도개선(20141110) 이후 소스
			if(num($(this).attr('version'))>=20141110){

				if(decoration['image_send'] || decoration['image_zzim']){
					var imageSendObj = $(".goodsDisplayImageSend",this);

					$(".goodsSendBtn",imageSendObj).show().click(function(){
						display_goods_send(this,'top');
						return false;
					});

					$(".goodsZzimBtn",imageSendObj).show().click(function(){
						display_goods_zzim(this,goodsInfo.goods_seq);
						return false;
					});
				}

				if(decoration['image_overay1'] || decoration['image_overay1_text']){

					var overay1Obj = $("<div class='goodsDisplayImageOveray1'><div class='goodsDisplayImageOveray1Bg'></div><div class='goodsDisplayImageOveray1Text'></div></div>");

					var overay1Height = 20;

					switch(decoration['image_overay1']){
						case "goods_name":
							var overay1Text = goodsInfo['goods_name'];
							break;
						case "price":
							var overay1Text = get_currency_price(goodsInfo['price'],2);
							if(goodsInfo['string_price_use']=='1') overay1Text = goodsInfo['string_price'];
							break;
						case "sale_price":
							var overay1Text = get_currency_price(goodsInfo['sale_price'],2);
							if(goodsInfo['string_price_use']=='1') overay1Text = goodsInfo['string_price'];
							break;
						case "consumer_price":
							var overay1Text = get_currency_price(goodsInfo['consumer_price'],2);
							if(goodsInfo['string_price_use']=='1') overay1Text = goodsInfo['string_price'];
							break;
						case "discount":
							var overay1Text = get_currency_price(goodsInfo['consumer_price']) + " → " + get_currency_price(goodsInfo['price']);
							if(goodsInfo['string_price_use']=='1') overay1Text = goodsInfo['string_price'];
							break;
						case "sale_discount":
							var overay1Text = get_currency_price(goodsInfo['consumer_price']) + " → " + get_currency_price(goodsInfo['sale_price']);
							if(goodsInfo['string_price_use']=='1') overay1Text = goodsInfo['string_price'];
							break;
						case "brand_title":
							var overay1Text = goodsInfo['brand_title'];
							break;
						case "related_goods":
							var overay1Text = "<span class='hand' onclick=\"return show_display_related_goods(this,'"+goodsInfo['goods_seq']+"')\" style='display:block;'>관련상품보기</span>";
							break;
						case "":
						default:
							var overay1Text = decoration['image_overay1_text'];

							break;
					}

					overay1Obj
					.css({
						'position'			: 'absolute',
						'left'				: 0,
						'top'				: '100%',
						'margin-top'		: -overay1Height,
						'width'				: $(that).width(),
						'height'			: overay1Height
					});

					$(".goodsDisplayImageOveray1Bg",overay1Obj)
					.css({
						'background-color'	: '#000000',
						'color'				: '#fff',
						'opacity'			: 0.3,
						'position'			: 'absolute',
						'left'				: 0,
						'top'				: 0,
						'width'				: $(that).width(),
						'height'			: overay1Height
					});

					$(".goodsDisplayImageOveray1Text",overay1Obj)
					.html(overay1Text)
					.css({
						'color'				: '#fff',
						'font-size'			: '11pt',
						'font-weight'		: 'bold',
						'text-align'		: 'center',
						'position'			: 'absolute',
						'overflow'			: 'hidden',
						'white-space'		: 'nowrap',
						'line-height'		: overay1Height+'px',
						'left'				: 0,
						'top'				: 0,
						'width'				: $(that).width()
					});
					overay1Obj.show();

					imageObj.after(overay1Obj);

				}else{
					$(".goodsDisplayImageOveray1",that).remove();
				}

				//향상된 오버레이 기능
				if(decoration['image_overay_plus1'] && decoration['image_overay_type'] != 'all'){
					//이미지 최적화를 사용 하고 이미지가 링크로 되어 있는 것 들은 이미지 로드가 늦어져 격차를 둔다
					var overay_set_sec = '0';
					if	(is_image_optimize) overay_set_sec = '500';
					setTimeout(function(){
						var overay1Obj = $("<div class='goodsDisplayImageOverayPlus1'><div class='goodsDisplayImageOverayPlus1Iwrap'><div class='goodsDisplayImageOveray1BgPlus'></div><div class='goodsDisplayImageOverayPlus1Text'></div></div></div>");
						var image_overay_plus1		= decode_base64_json(decoration['image_overay_plus1']);
						var image_overay_plus1_main = decode_base64_json(decoration['image_overay_plus1_main']);
						var dscount_percent_use		= false;
						var dscount_percent_left	= false;
						var dscount_percent_right	= false;

						var overay1TextObjWrap = $('<ul>');
						var overay1TextPer = $('<div class="goodsDisplayImageOveray1PerWrap"><div class="goodsDisplayImageOveray1PerBg"></div><div class="goodsDisplayImageOveray1PerTxt"></div></div>');

						var discount_per_css = {
							'position'			: 'absolute',
							'top'				: 0,
							'text-align'		: 'center',
							'width'				: '45px',
						};
						var discount_per_bg_css = {
							'position'			: 'absolute',
							'background-color'	: '',
							'opacity'			: 1,
							'width'				: '45px'
						}
						var overayBgCss = {
							'opacity'			: 1,
							'background-color'	: '#000000',
							'color'				: '#fff',
							'position'			: 'absolute',
							'top'				: 0,
							'left'				: 0,
							'width'				: 0
						};

						var default_height = 16;
						var default_right_per = 45;
						var event_key = '';

						$.each(image_overay_plus1, function(key,option){
							var overay_flag = false;
							var discount_use= false;

							switch(option['key']){
								case "goods_name":
									var overay1Text = goodsInfo['goods_name'];
									break;
								case "price":
									var overay1Text = get_currency_price(goodsInfo['price'],3);
									if(goodsInfo['string_price_use']=='1') overay1Text = goodsInfo['string_price'];
									break;
								case "sale_price":
									var overay1Text = get_currency_price(goodsInfo['sale_price'],3);
									if(goodsInfo['string_price_use']=='1') overay1Text = goodsInfo['string_price'];
									break;
								case "consumer_price":
									var overay1Text = get_currency_price(goodsInfo['consumer_price'],3);
									if(goodsInfo['string_price_use']=='1') overay1Text = goodsInfo['string_price'];
									break;
								case "discount":
									var overay1Text = '<span class="left_dc">'+get_currency_price(goodsInfo['consumer_price'], 3) + '</span>' + ' → ' + '<span class="right_dc">'+get_currency_price(goodsInfo['price'], 3)+'</span>';
									if(goodsInfo['string_price_use']=='1') overay1Text = goodsInfo['string_price'];
									discount_use = true;
									break;
								case "sale_discount":
									var overay1Text = '<span class="left_dc">'+get_currency_price(goodsInfo['consumer_price'], 3) + '</span>' + ' → ' + '<span class="right_dc">'+ get_currency_price(goodsInfo['sale_price'], 3)+'</span>';
									if(goodsInfo['string_price_use']=='1') overay1Text = goodsInfo['string_price'];
									discount_use = true;
									break;
								case "brand_title":
									var overay1Text = goodsInfo['brand_title'];
									break;
								case "summary":
									var overay1Text = goodsInfo['summary'];
									break;
								case "related_goods":
									var overay1Text = "<span class='hand' onclick=\"return show_display_related_goods(this,'"+goodsInfo['goods_seq']+"')\" style='display:block;'>관련상품보기</span>";
									break;
								case "provider_name":
									var overay1Text = goodsInfo['provider_name'];
									break;
								case "brand_title_eng":
									var overay1Text = goodsInfo['brand_title_eng'];
									break;
								case "line":
									var overay1Text = '';
									for(i=0;i<100;i++){
										overay1Text += '─' ;
									}
									break;
								case "shpping_free":
									if	(goodsInfo['shipping_group'] && goodsInfo['shipping_group']['default_type'] == 'free')
										var overay1Text = '무료배송';
									else
										overay_flag							= true;
									break;
								case "discount_per":
									if	(option.overay_discount_per <= goodsInfo['sale_per']) {
										if	(option.overay_discount_bg_color == 1) {
 											discount_per_bg_css['background-color'] = option.overay_discount_per_color;
											discount_per_bg_css['opacity']			= 1-option.overay_discount_opacity/100;

											if	(option.overay_discount_position == 'left') {
												discount_per_css['left']	= 0;
												dscount_percent_left		= true;
												overayBgCss['right']		= 0;
												overayBgCss['left']			= '';
											}else{
												discount_per_css['right']	= 0;
												dscount_percent_right		= true;
												overayBgCss['left']			= 0;
												overayBgCss['right']		= '';
											}
											$('.goodsDisplayImageOveray1PerTxt', overay1TextPer).text(goodsInfo['sale_per']+'%');
											dscount_percent_use				= true;
										}else{
											var overay1Text					= '할인 '+goodsInfo['sale_per']+'%';
										}
									}else{
										overay_flag							= true;
									}
									break;
								case "event_time":
									if	(goodsInfo['eventEnd']) {
										event_key	= $(that).closest('.designDisplay').prop('id');
										var overay1Text	= '<span class="time_count soloEventTd_overay_'+event_key+'_'+goodsInfo['goods_seq']+'"> 남은시간 <span id="soloday_overay_'+event_key+'_'+goodsInfo['goods_seq']+'"></span>일 <span id="solohour_overay_'+event_key+'_'+goodsInfo['goods_seq']+'"></span>:<span id="solomin_overay_'+event_key+'_'+goodsInfo['goods_seq']+'"></span>:<span id="solosecond_overay_'+event_key+'_'+goodsInfo['goods_seq']+'"></span></span>';
									}else{
										overay_flag							= true;
									}
									break;
								case "event_cnt":
									if	(goodsInfo['eventEnd']) {
										var overay1Text						= '현재 '+goodsInfo['event_order_ea']+'개 구매';
									}else{
										overay_flag							= true;
									}
									break;
								case "direct":
								default:
									var overay1Text = option.overay_text;
									break;
							}

							if	(!overay_flag) {
								var overay1TextObj	= $('<li>');
								var default_css		= {
									'color'				: '#fff',
									'font-size'			: '11pt',
									'font-weight'		: '',
									'text-decoration'	: '',
									'min-height'		: default_height+'px',
									'line-height'		: default_height+'px'
								}

								if (option.overay_font_color != undefined && option.overay_font_color)
									default_css['color']			= option.overay_font_color;

								if (option.overay_font_size != undefined && option.overay_font_size)
									default_css['font-size']		= option.overay_font_size+'pt';

								if (option.overay_font_weight != undefined && option.overay_font_weight > 0)
									default_css['font-weight']		= 'bold';

								if (!discount_use && option.overay_line_through != undefined && option.overay_line_through > 0)
									default_css['text-decoration']	= 'line-through';

								if (option.overay_bracket != undefined && option.overay_bracket) {
									overay1Text						= option.overay_bracket.substring(0,1)+overay1Text+option.overay_bracket.substring(1,2);
								}

								if	(dscount_percent_use) {
									$('.goodsDisplayImageOveray1PerTxt', overay1TextPer).css(default_css);
									dscount_percent_use				= false;
								}else{
									overay1TextObj.html(overay1Text).css(default_css);
									overay1TextObjWrap.append(overay1TextObj);
								}

								if	(discount_use) {

									if (option.overay_line_through != undefined && option.overay_line_through > 0)
										overay1TextObj.find('.left_dc').css({'text-decoration':'line-through'});

									var sub_css = {
										'color'				: '#fff',
										'font-size'			: '11pt',
										'font-weight'		: 'normal'
									};
									if	(option.overay_discount_color != undefined)
										sub_css['color']			= option.overay_discount_color;

									if	(option.overay_discount_font_size != undefined)
										sub_css['font-size']		= option.overay_discount_font_size+'pt';

									if	(option.overay_discount_font_weight != undefined && option.overay_discount_font_weight > 0)
										sub_css['font-weight']		= 'bold';

									overay1TextObj.find('.right_dc').css(sub_css);
								}
							}
						});

						var text_css = {
							'position'				: 'relative',
							'text-align'			: 'center',
							'overflow'				: 'hidden',
							'white-space'			: 'nowrap',
							'left'					: 0,
							'top'					: 0,
							'margin'				: 0,
							'padding'				: 0
						}

						if	(image_overay_plus1_main['overay_h_orderby'] != undefined && image_overay_plus1_main['overay_h_orderby'])
							text_css['text-align']	= image_overay_plus1_main['overay_h_orderby'];

						$(".goodsDisplayImageOverayPlus1Text",overay1Obj)
						.html(overay1TextObjWrap).css(text_css);

						imageObj.after(overay1Obj);
						var this_width				= $(that).closest('.goodsDisplayImageWrap').width();
						if	(is_display_edit || is_image_optimize)
							this_width				= $(that).closest('.goodsDisplayItemWrap').width();
						var textbox_width			= this_width;
						var box_height				= overay1Obj.outerHeight();

						var obj_css = {
							'position'				: 'absolute',
							'left'					: 0,
							'top'					: '100%',
							'width'					: this_width,
							'padding-top'			: 0,
							'padding-bottom'		: 0,
							'padding-left'			: 0,
							'padding-right'			: 0
						}

						var padding_left = 0;
						var padding_right = 0;

						if	(dscount_percent_left || dscount_percent_right)
							textbox_width -= default_right_per;

						if	(image_overay_plus1_main['overay_left'] != undefined && image_overay_plus1_main['overay_left']) {
							padding_left = parseInt(image_overay_plus1_main['overay_left']);
							textbox_width -= padding_left;
						}
						if (dscount_percent_left)
							padding_left += parseInt(default_right_per);

						if	(image_overay_plus1_main['overay_right'] != undefined && image_overay_plus1_main['overay_right']) {
							padding_right = parseInt(image_overay_plus1_main['overay_right']);
							textbox_width -= padding_right;
						}

						if	(dscount_percent_right)
							padding_right += parseInt(default_right_per);

						if	(image_overay_plus1_main['overay_top'] != undefined && image_overay_plus1_main['overay_top']) {
							obj_css['padding-top']		= image_overay_plus1_main['overay_top']+'px';
							box_height					+= parseInt(image_overay_plus1_main['overay_top']);
						}

						if	(image_overay_plus1_main['overay_bottom'] != undefined && image_overay_plus1_main['overay_bottom']) {
							obj_css['padding-bottom']	= image_overay_plus1_main['overay_bottom']+'px';
							box_height					+= parseInt(image_overay_plus1_main['overay_bottom']);
						}

						if	(padding_left > 0)	obj_css['padding-left']		= padding_left+'px';
						if	(padding_right > 0)	obj_css['padding-right']	= padding_right+'px';

						obj_css['width']				= textbox_width+'px';
						obj_css['margin-top']			= -box_height;

						overayBgCss['width']			= this_width+'px';

						if	($('.goodsDisplayImageOveray1PerTxt', overay1TextPer).html().length > 0) {
							$('.goodsDisplayImageOverayPlus1Iwrap', overay1Obj).append(overay1TextPer);

							$('.goodsDisplayImageOveray1PerTxt', overay1TextPer)
							.css({
								'height'				: box_height+'px',
								'line-height'			: box_height+'px',
								'position'				: 'absolute',
								'text-align'			: 'center',
								'width'					: default_right_per+'px'
							});

							discount_per_bg_css['height']	= box_height+'px';
							$('.goodsDisplayImageOveray1PerBg', overay1TextPer).css(discount_per_bg_css);
							discount_per_css['height']		= box_height+'px';
							discount_per_css['line-height'] = box_height+'px';
							$('.goodsDisplayImageOveray1PerWrap', overay1Obj).css(discount_per_css);
							overayBgCss['width']			= (this_width-default_right_per)+'px';
						}

						overayBgCss['height']				= box_height+'px';

						if	(image_overay_plus1_main['overay_opacity'] != undefined && image_overay_plus1_main['overay_opacity'])
							overayBgCss['opacity']			= 1-image_overay_plus1_main['overay_opacity']/100;

						if	(image_overay_plus1_main['overay_bg_color'] != undefined && image_overay_plus1_main['overay_bg_color'])
							overayBgCss['background-color'] = image_overay_plus1_main['overay_bg_color'];

						$(".goodsDisplayImageOveray1BgPlus",overay1Obj)
						.css(overayBgCss);

						//이벤트 상품일 경우 함수 실행
						if	(event_key) {
							timeInterval = [];
							timeInterval[event_key+'_'+goodsInfo['goods_seq']] = setInterval(function(){
								var time = [];
								time[event_key+'_'+goodsInfo['goods_seq']] = showClockTime('text' ,goodsInfo['eventEnd']['year'], goodsInfo['eventEnd']['month'], goodsInfo['eventEnd']['day'], goodsInfo['eventEnd']['hour'], goodsInfo['eventEnd']['min'], goodsInfo['eventEnd']['second'], 'soloday_overay_'+event_key+'_'+goodsInfo['goods_seq'], 'solohour_overay_'+event_key+'_'+goodsInfo['goods_seq'], 'solomin_overay_'+event_key+'_'+goodsInfo['goods_seq'], 'solosecond_overay_'+event_key+'_'+goodsInfo['goods_seq'], '_'+event_key+'_'+goodsInfo['goods_seq']);
								if(time[event_key+'_'+goodsInfo['goods_seq']] == 0){
								clearInterval(timeInterval[event_key+'_'+goodsInfo['goods_seq']]);
								$('.soloEventTd_overay_'+event_key+'_'+goodsInfo['goods_seq']).html("단독 이벤트 종료");
								}
							},1000);
						}

						overay1Obj
						.css(obj_css).show();
					},overay_set_sec);
				}else{
					$(".goodsDisplayImageOverayPlus1",that).remove();
				}

				if(decoration['image_slide'] && goodsInfo['image_cnt']>1){
					var imageSlideObj = $(".goodsDisplayImageSlide",this);
					$(imageSlideObj,imageObj).click(function(){
						show_display_goods_images(that,goodsInfo['goods_seq'],decoration['image_slide_type']);
						return false;
					});
				}

				if(decoration['quick_shopping']){
					var quickShoppingObj = $(that).closest('.goodsDisplayItemWrap').find(".goodsDisplayQuickShopping");
					if(quickShoppingObj.length){
						if(imageObj.width()){
							quickShoppingObj.css({'width': $(that).outerWidth()});
						}else{
							$(imageObj).bind('load',function(){
								quickShoppingObj.css({'width': $(this).outerWidth()});
							});
						}
						if	(displaystyle == 'lattice_b') quickShoppingObj.css({'margin':0});
					}
				}

				if(decoration['use_seconde_image'] && goodsInfo.image2 != null && goodsInfo.image2.length>1){
					imageObj.attr("imageCut2",goodsInfo.image2);
				}else{
					imageObj.removeAttr("imageCut2");
				}

				if	(decoration['use_image_zoom']) {
					$(this).addClass('goodsDisplayImageZoom').css('overflow','hidden');
				}

				if	(decoration['use_image_3d']) {
					$(this).closest('.goodsDisplayItemWrap').addClass('goodsDisplayimageBox3d');
				}

				if	(decoration['image_icon'] && decoration['image_icon_type'] == 'condition') {
					icon_condition = decode_base64_json(decoration['image_icon_condition']);
					icon_use_flag = false;

					var condition = {
						'{discount}'		: goodsInfo['sale_per'],
						'{brand}'			: goodsInfo['brand_title'],
						'{brandeng}'		: goodsInfo['brand_title_eng'],
						'{bestnum}'			: goodsInfo['goods_index']
					}

					if	(icon_condition) {
						for(i=0; i<3; i++){
							if	(icon_condition[i]['use'] == '1' && !icon_use_flag) {
								var contents = [];
								$.each(icon_condition[i]['contents'], function(txt_k, txt_v){
									if	(txt_v['txt'] && txt_v['use'] == '1') {
										if	(txt_v['txt_type'] == 'shipping_free') {
											if	(goodsInfo['shipping_group'] && goodsInfo['shipping_group']['default_type'] == 'free')
												contents.push(txt_v);
										}else{
											contents.push(txt_v);
										}
									}
								});
								switch(icon_condition[i]['key']){
									case 'discount_per':
										if	(goodsInfo['sale_per'] >= icon_condition[i]['discount']) {
											set_condition_icon($(".goodsDisplayImageIconWrap",this),contents,condition,icon_condition[i]['background']);
											icon_use_flag = true;
										}
									break;
									case 'solo':
										if	(goodsInfo['eventEnd']) {
											set_condition_icon($(".goodsDisplayImageIconWrap",this),contents,condition,icon_condition[i]['background']);
											icon_use_flag = true;
										}
									break;
									case 'discount':
										if	(goodsInfo['event_text']) {
											set_condition_icon($(".goodsDisplayImageIconWrap",this),contents,condition,icon_condition[i]['background']);
											icon_use_flag = true;
										}
									break;
									case 'gift':
									break;
									case 'package':
										if	(goodsInfo['package_yn'] == 'y') {
											set_condition_icon($(".goodsDisplayImageIconWrap",this),contents,condition,icon_condition[i]['background']);
											icon_use_flag = true;
										}
									break;
									case 'date':
										if	(icon_condition[i]['date_type'] == 'before') {
										   var nDate = new Date();
										   var vDate = new Date(goodsInfo['regist_date'].replace(/-/gi,"/"));
										   var timeSpan = (nDate - vDate) / 86400000;
										   
										   var daysApart = Math.abs(Math.round(timeSpan));
										   if	(icon_condition[i]['date'] >=  daysApart) {
											   set_condition_icon($(".goodsDisplayImageIconWrap",this),contents,condition,icon_condition[i]['background']);
											   icon_use_flag = true;
										   }
										}else{
											var vDate = icon_condition[i]['date'];
											var yy = parseInt(vDate.substr(0, 4), 10);
											var mm = parseInt(vDate.substr(5, 2), 10);
											var dd = parseInt(vDate.substr(8), 10);
											nDate = new Date(yy, mm - 1, dd + parseInt(icon_condition[i]['date_after'],10));
											yy = nDate.getFullYear();
											mm = nDate.getMonth() + 1; mm = (mm < 10) ? '0' + mm : mm;
											dd = nDate.getDate(); dd = (dd < 10) ? '0' + dd : dd;
											after_date = yy+'-'+mm+'-'+dd;

											if (after_date <= goodsInfo['regist_date']) {
												set_condition_icon($(".goodsDisplayImageIconWrap",this),contents,condition,icon_condition[i]['background']);
												icon_use_flag = true;
											}
										}
									break;
									case 'empty':
										set_condition_icon($(".goodsDisplayImageIconWrap",this),contents,condition,icon_condition[i]['background']);
										icon_use_flag = true;
									break;
								}
							}
						}
					}
					if	(!icon_use_flag)
						$(".goodsDisplayImageIconWrap",this).remove();
					else
						$(".goodsDisplayImageIconWrap",this).show();
				}

			// 상품디스플레이 속도개선(20141110) 이후 소스
			}else{
				if(decoration['image_border1']){
					if	(decoration['image_border_type'] == 'all') {
						$(this).css({"border":"0px","margin":"0px"});
						$(this).closest('.goodsDisplayItemWrap').css({"border":decoration['image_border1_width'] + "px solid " + decoration['image_border1'],"margin":"-"+decoration['image_border1_width']+"px"});
					}else{
						$(this).closest('.goodsDisplayItemWrap').css({"border":"0px","margin":"0px"});
						$(this).css({"border":decoration['image_border1_width'] + "px solid " + decoration['image_border1'],"margin":"-"+decoration['image_border1_width']+"px"});
					}
					$(this).parent().attr('align','center');
				}else{
					if	(decoration['image_border_type'] == 'all')
						$(this).closest('.goodsDisplayItemWrap').css({"border":"0px"});
					else
						$(this).css({"border":"0px"});
				}

				if	(decoration['image_icon_type'] == undefined || decoration['image_icon_type'] != 'condition') {
					if	(decoration['image_icon']) {
						if($(".goodsDisplayImageIcon",this).length){
							$(".goodsDisplayImageIcon",this).remove();
						}

						var imageIconObj = $("<div class='goodsDisplayImageIcon'><img src='/data/icon/goodsdisplay/"+decoration['image_icon']+"' /><span class='goodsDisplayImageIconText'></span></div>");

						if(decoration['image_icon_location']=='right'){
							imageIconObj
							.css({
								'position'			: 'absolute',
								'right'				: '0px',
								'top'				: imageObj.position().top,
								'text-align'		: 'right'
							});
						}else{
							imageIconObj
							.css({
								'position'			: 'absolute',
								'left'				: imageObj.position().left,
								'top'				: imageObj.position().top
							});
						}
						if( decoration['image_icon'].indexOf("icon_best_no")  > -1 ) {
								var designDisplayObj = $(that).closest(designDisplaySelector);

								if(designDisplayObj.length){
									designDisplayObj.data('iconIdx',num(designDisplayObj.data('iconIdx'))+1);
									var iconText = designDisplayObj.data('iconIdx');
								}else{
									var iconText = 1;
								}
								$(".goodsDisplayImageIconText",imageIconObj).html(iconText).css({
									'position'		: 'absolute',
									'font-size'		: '16px',
									//'font-family'	: 'tahoma',
									'font-weight'	: 'bold',
									'text-align'	: 'center',
									'color'			: '#ffffff',
									'letter-spacing': '-1px',
									'width'			: 48,
									'top'			: $(imageObj).position().top+22
								});

								if(decoration['image_icon_location']=='right'){
									$(".goodsDisplayImageIconText",imageIconObj).css({
										'left'			: $(imageObj).width()-48
									});
								}else{
									$(".goodsDisplayImageIconText",imageIconObj).css({
										'left'			: 0
									});
								}
						}else if( decoration['image_icon'].indexOf("icon_number")  > -1 ) {
								var designDisplayObj = $(that).closest(designDisplaySelector);
								if(designDisplayObj.length){
									designDisplayObj.data('iconIdx',num(designDisplayObj.data('iconIdx'))+1);
									var iconText = designDisplayObj.data('iconIdx');
								}else{
									var iconText = 1;
								}
								$(".goodsDisplayImageIconText",imageIconObj).html(iconText).css({
									'position'		: 'absolute',
									'font-size'		: '30px',
									//'font-family'	: 'tahoma',
									'font-weight'	: 'bold',
									'text-align'	: 'right',
									'color'			: '#ffffff',
									'letter-spacing': '-1px',
									'width'			: 28,
									'top'			: $(imageObj).position().top+14
								});

								if(decoration['image_icon_location']=='right'){
									$(".goodsDisplayImageIconText",imageIconObj).css({
										'left'			: $(imageObj).width()-46
									});
								}else{
									$(".goodsDisplayImageIconText",imageIconObj).css({
										'left'			: 0
									});
								}
						}else if( decoration['image_icon'].indexOf("icon_sale")  > -1 ) {
								var iconText = "";
								if(goodsInfo.sale_per){
									iconText = goodsInfo.sale_per;
									iconText = num(iconText) + "%";
								}else if(goodsInfo.consumer_price && num(goodsInfo.consumer_price) > num(goodsInfo.price)){
									iconText = Math.round((num(goodsInfo.consumer_price)-num(goodsInfo.price))/num(goodsInfo.consumer_price)*100);
									iconText = num(iconText) + "%";
								}else{
									imageIconObj.hide();
								}

								$(".goodsDisplayImageIconText",imageIconObj).html(iconText).css({
									'position'		: 'absolute',
									'font-size'		: '16px',
									//'font-family'	: 'tahoma',
									'font-weight'	: 'bold',
									'text-align'	: 'center',
									'color'			: '#ffffff',
									'letter-spacing': '-1px',
									'width'			: 48,
									'top'			: $(imageObj).position().top+5
								});

								if(decoration['image_icon_location']=='right'){
									$(".goodsDisplayImageIconText",imageIconObj).css({
										'left'			: $(imageObj).width()-48
									});
								}else{
									$(".goodsDisplayImageIconText",imageIconObj).css({
										'left'			: 0
									});
								}
						}

						if(decoration['image_icon_over']=='y'){
							imageIconObj.hide();
						}else if(typeof iconText != 'undefined' && iconText.length){
							imageIconObj.show();
						}

						imageObj.after(imageIconObj);
					}else{
						$(".goodsDisplayImageIcon",that).remove();
					}
				}

				if(decoration['image_send'] || decoration['image_zzim'] || decoration['image_zzim_on']){
					if($(".goodsDisplayImageSend",this).length){
						$(".goodsDisplayImageSend",this).remove();
					}

					var btnSend = decoration['image_send'] ? " <img class='goodsSendBtn' src='/data/icon/goodsdisplay/send/"+decoration['image_send']+"' />" : '';
					var btnZzim = decoration['image_zzim'] ? " <span class='goodsZzimBtn'><img src='/data/icon/goodsdisplay/zzim/"+decoration['image_zzim']+"' class='zzimOffImg' /><img src='/data/icon/goodsdisplay/zzim_on/"+decoration['image_zzim_on']+"' class='zzimOnImg' /></span>" : '';

					var imageSendObj = $("<div class='goodsDisplayImageSend'>"+btnSend+btnZzim+"</div>");

					if(decoration['image_send_location']=='right'){
						imageSendObj
						.css({
							'position'			: 'absolute',
							'left'				: imageObj.position().left-2,
							'top'				: imageObj.position().top+2,
							'width'				: '100%',
							'text-align'		: 'right'
						});
					}else{
						imageSendObj
						.css({
							'position'			: 'absolute',
							'left'				: imageObj.position().left-2,
							'top'				: imageObj.position().top+2
						});
					}

					if(decoration['image_send_over']=='y'){
						imageSendObj.hide();
					}else{
						imageSendObj.show();
					}

					imageObj.after(imageSendObj);

					if(goodsInfo.wish=='1'){
						$(".goodsZzimBtn .zzimOnImg",imageSendObj).show();
						$(".goodsZzimBtn .zzimOffImg",imageSendObj).hide();
					}else{
						$(".goodsZzimBtn .zzimOffImg",imageSendObj).show();
						$(".goodsZzimBtn .zzimOnImg",imageSendObj).hide();
					}

					$(".goodsSendBtn",imageSendObj).click(function(){
						display_goods_send(this,'top');
						return false;
					});

					$(".goodsZzimBtn",imageSendObj).click(function(){
						display_goods_zzim(this,goodsInfo.goods_seq);
						return false;
					});
				}else{
					$(".goodsDisplayImageSend",that).remove();
				}

				if(decoration['image_overay1'] || decoration['image_overay1_text']){

					if($(".goodsDisplayImageOveray1",this).length){
						$(".goodsDisplayImageOveray1",this).remove();
					}

					var overay1Obj = $("<div class='goodsDisplayImageOveray1'><div class='goodsDisplayImageOveray1Bg'></div><div class='goodsDisplayImageOveray1Text'></div></div>");

					var overay1Height = 20;

					switch(decoration['image_overay1']){
						case "goods_name":
							var overay1Text = goodsInfo['goods_name'];
							break;
						case "price":
							var overay1Text = get_currency_price(goodsInfo['price'],2);
							break;
						case "sale_price":
							var overay1Text = get_currency_price(goodsInfo['sale_price'],2);
							break;
						case "consumer_price":
							var overay1Text = get_currency_price(goodsInfo['consumer_price'],2);
							break;
						case "discount":
							var overay1Text = get_currency_price(goodsInfo['consumer_price']) + " → " + get_currency_price(goodsInfo['price']);
							break;
						case "sale_discount":
							var overay1Text = get_currency_price(goodsInfo['consumer_price']) + " → " + get_currency_price(goodsInfo['sale_price']);
							break;
						case "brand_title":
							var overay1Text = goodsInfo['brand_title'];
							break;
						case "related_goods":
							var overay1Text = "<span class='hand' onclick=\"return show_display_related_goods(this,'"+goodsInfo['goods_seq']+"')\" style='display:block;'>관련상품보기</span>";
							break;
						case "":
						default:
							var overay1Text = decoration['image_overay1_text'];

							break;
					}

					overay1Obj
					.css({
						'position'			: 'absolute',
						'left'				: 0,
						'top'				: '100%',
						'margin-top'		: -overay1Height,
						'width'				: $(that).width(),
						'height'			: overay1Height
					});

					$(".goodsDisplayImageOveray1Bg",overay1Obj)
					.css({
						'background-color'	: '#000000',
						'color'				: '#fff',
						'opacity'			: 0.3,
						'position'			: 'absolute',
						'left'				: 0,
						'top'				: 0,
						'width'				: $(that).width(),
						'height'			: overay1Height
					});

					$(".goodsDisplayImageOveray1Text",overay1Obj)
					.html(overay1Text)
					.css({
						'color'				: '#fff',
						'font-size'			: '11px',
						'font-weight'		: 'bold',
						'text-align'		: 'center',
						'position'			: 'absolute',
						'overflow'			: 'hidden',
						'white-space'		: 'nowrap',
						'line-height'		: overay1Height+'px',
						'left'				: 0,
						'top'				: 0,
						'width'				: $(that).width()
					});
					overay1Obj.show();

					imageObj.after(overay1Obj);

				}else{
					$(".goodsDisplayImageOveray1",that).remove();
				}

				if(decoration['image_slide'] && goodsInfo['image_cnt']>1){
					if($(".goodsDisplayImageSlide",this).length){
						$(".goodsDisplayImageSlide",this).remove();
					}

					var imageSlideObj = $("<div class='goodsDisplayImageSlide'><img src='/data/icon/goodsdisplay/slide/"+decoration['image_slide']+"' /></div>");

					imageObj.after(imageSlideObj);

					imageSlideObj
					.css({
						'position'			: 'absolute',
						'right'				: '0px',
						'top'				: '50%',
						'margin-top'		: -(imageSlideObj.height()/2)+'px'
					});

					$(imageSlideObj,imageObj).click(function(){
						show_display_goods_images(that,goodsInfo['goods_seq'],decoration['image_slide_type']);
						return false;
					});
				}else{
					$(".goodsDisplayImageSlide",that).remove();
				}

				if(decoration['quick_shopping']){
					if($(that).closest('.goodsDisplayItemWrap').find(".goodsDisplayQuickShopping").length){
						$(that).closest('.goodsDisplayItemWrap').find(".goodsDisplayQuickShopping").remove();
					}
					var quick_shopping = eval("("+decoration['quick_shopping']+")");
					if(quick_shopping.length){

						var quickShoppingObj = $("<div class='goodsDisplayQuickShopping'><table class='quick_shopping_container' width='100%' border='0' cellpadding='0' cellspacing='0'><tr></tr></table></div>");

						if(imageObj.width()){
							quickShoppingObj.css({'width': $(that).outerWidth()});
						}else{
							$(imageObj).bind('load',function(){
								quickShoppingObj.css({'width': $(this).outerWidth()});
							});
						}

						var quickShoppingTableObj = $("table.quick_shopping_container",quickShoppingObj);
						quickShoppingTableObj.css({
							'border-collapse':'collapse',
							'table-layout':'fixed'
						});

						$(that).after(quickShoppingObj);

						for(var i=0;i<quick_shopping.length;i++){
							switch(quick_shopping[i]){
								case 'newwin':
									$('tr',quickShoppingTableObj).append("<td class='goodsNewwinBtn hand'><img src='/data/icon/goodsdisplay/quick_shopping/thumb_"+quick_shopping[i]+".gif' /></td>");
									$(".goodsNewwinBtn",quickShoppingTableObj).click(function(){
										if(goodsInfo.goods_seq) window.open($(imageObj).closest('a').attr('href'));
									});
								break;
								case 'quickview':
									$('tr',quickShoppingTableObj).append("<td class='goodsQuickviewBtn hand'><img src='/data/icon/goodsdisplay/quick_shopping/thumb_"+quick_shopping[i]+".gif' /></td>");
									$(".goodsQuickviewBtn",quickShoppingTableObj).click(function(){
										display_goods_quickview(this,goodsInfo.goods_seq);
										return false;
									});
								break;
								case 'send':
									$('tr',quickShoppingTableObj).append("<td class='goodsSendBtn hand'><img src='/data/icon/goodsdisplay/quick_shopping/thumb_"+quick_shopping[i]+".gif' /></td>");
									$(".goodsSendBtn",quickShoppingTableObj).click(function(){
										display_goods_send(this,'bottom');
										return false;
									});
								break;
								case 'zzim':
									$('tr',quickShoppingTableObj).append("<td class='goodsZzimBtn hand' width='16'><img src='/data/icon/goodsdisplay/quick_shopping/thumb_"+quick_shopping[i]+".gif' class='zzimOffImg' /><img src='/data/icon/goodsdisplay/quick_shopping/thumb_"+quick_shopping[i]+"_on.gif' class='zzimOnImg' /></td>");
									if(goodsInfo.wish=='1'){
										$(".goodsZzimBtn .zzimOnImg",quickShoppingTableObj).show();
										$(".goodsZzimBtn .zzimOffImg",quickShoppingTableObj).hide();
									}else{
										$(".goodsZzimBtn .zzimOffImg",quickShoppingTableObj).show();
										$(".goodsZzimBtn .zzimOnImg",quickShoppingTableObj).hide();
									}
									$(".goodsZzimBtn",quickShoppingTableObj).click(function(){
										display_goods_zzim(this,goodsInfo.goods_seq);
										return false;
									});
								break;
							}
						}

						$('td',quickShoppingTableObj).css({
							'height':'14px',
							'text-align':'center',
							'border':'1px solid #e5e5e5',
							'background-color':'#fff',
							'font-size':'11px',
							'letter-spacing':'-1px'
						});
					}
				}else{
					$(that).closest('.goodsDisplayItemWrap').find(".goodsDisplayQuickShopping").remove();
				}

				if(decoration['use_seconde_image'] && goodsInfo.image2 != null && goodsInfo.image2.length>1){
					imageObj.attr("imageCut2",goodsInfo.image2);
				}else{
					imageObj.removeAttr("imageCut2");
				}

				//향상된 오버레이 기능
				if(decoration['image_overay_plus1'] && decoration['image_overay_type'] != 'all'){
					if($(".goodsDisplayImageOverayPlus1",this).length){
						$(".goodsDisplayImageOverayPlus1",this).remove();
					}

					var overay1Obj = $("<div class='goodsDisplayImageOverayPlus1'><div class='goodsDisplayImageOverayPlus1Iwrap'><div class='goodsDisplayImageOveray1BgPlus'></div><div class='goodsDisplayImageOverayPlus1Text'></div></div></div>");
					var image_overay_plus1		= decode_base64_json(decoration['image_overay_plus1']);
					var image_overay_plus1_main = decode_base64_json(decoration['image_overay_plus1_main']);
					var dscount_percent_use		= false;
					var dscount_percent_left	= false;
					var dscount_percent_right	= false;

					var overay1TextObjWrap = $('<ul>');
					var overay1TextPer = $('<div class="goodsDisplayImageOveray1PerWrap"><div class="goodsDisplayImageOveray1PerBg"></div><div class="goodsDisplayImageOveray1PerTxt"></div></div>');

					var discount_per_css = {
						'position'			: 'absolute',
						'top'				: 0,
						'text-align'		: 'center',
						'width'				: '45px',
					};
					var discount_per_bg_css = {
						'position'			: 'absolute',
						'background-color'	: '',
						'opacity'			: 1,
						'width'				: '45px'
					}
					var overayBgCss = {
						'opacity'			: 1,
						'background-color'	: '#000000',
						'color'				: '#fff',
						'position'			: 'absolute',
						'top'				: 0,
						'left'				: 0,
						'width'				: 0
					};

					var default_height = 16;
					var default_right_per = 45;
					var event_key = '';

					$.each(image_overay_plus1, function(key,option){
						var overay_flag = false;
						var discount_use= false;

						switch(option['key']){
							case "goods_name":
								var overay1Text = goodsInfo['goods_name'];
								break;
							case "price":
								var overay1Text = get_currency_price(goodsInfo['price'],3);
								if(goodsInfo['string_price_use']=='1') overay1Text = goodsInfo['string_price'];
								break;
							case "sale_price":
								var overay1Text = get_currency_price(goodsInfo['sale_price'],3);
								if(goodsInfo['string_price_use']=='1') overay1Text = goodsInfo['string_price'];
								break;
							case "consumer_price":
								var overay1Text = get_currency_price(goodsInfo['consumer_price'],3);
								if(goodsInfo['string_price_use']=='1') overay1Text = goodsInfo['string_price'];
								break;
							case "discount":
								var overay1Text = '<span class="left_dc">'+get_currency_price(goodsInfo['consumer_price'], 3) + '</span>' + ' → ' + '<span class="right_dc">'+get_currency_price(goodsInfo['price'], 3)+'</span>';
								if(goodsInfo['string_price_use']=='1') overay1Text = goodsInfo['string_price'];
								discount_use = true;
								break;
							case "sale_discount":
								var overay1Text = '<span class="left_dc">'+get_currency_price(goodsInfo['consumer_price'], 3) + '</span>' + ' → ' + '<span class="right_dc">'+ get_currency_price(goodsInfo['sale_price'], 3)+'</span>';
								if(goodsInfo['string_price_use']=='1') overay1Text = goodsInfo['string_price'];
								discount_use = true;
								break;
							case "brand_title":
								var overay1Text = goodsInfo['brand_title'];
								break;
							case "summary":
								var overay1Text = goodsInfo['summary'];
								break;
							case "related_goods":
								var overay1Text = "<span class='hand' onclick=\"return show_display_related_goods(this,'"+goodsInfo['goods_seq']+"')\" style='display:block;'>관련상품보기</span>";
								break;
							case "provider_name":
								var overay1Text = goodsInfo['provider_name'];
								break;
							case "brand_title_eng":
								var overay1Text = goodsInfo['brand_title_eng'];
								break;
							case "line":
								var overay1Text = '';
								for(i=0;i<100;i++){
									overay1Text += '─' ;
								}
								break;
							case "shpping_free":
								if	(goodsInfo['shipping_group'] && goodsInfo['shipping_group']['default_type'] == 'free')
									var overay1Text = '무료배송';
								else
									overay_flag							= true;
								break;
							case "discount_per":
								if	(option.overay_discount_per <= goodsInfo['sale_per']) {
									if	(option.overay_discount_bg_color == 1) {
										discount_per_bg_css['background-color'] = option.overay_discount_per_color;
										discount_per_bg_css['opacity']			= 1-option.overay_discount_opacity/100;

										if	(option.overay_discount_position == 'left') {
											discount_per_css['left']	= 0;
											dscount_percent_left		= true;
											overayBgCss['right']		= 0;
											overayBgCss['left']			= '';
										}else{
											discount_per_css['right']	= 0;
											dscount_percent_right		= true;
											overayBgCss['left']			= 0;
											overayBgCss['right']		= '';
										}
										$('.goodsDisplayImageOveray1PerTxt', overay1TextPer).text(goodsInfo['sale_per']+'%');
										dscount_percent_use				= true;
									}else{
										var overay1Text					= '할인 '+goodsInfo['sale_per']+'%';
									}
								}else{
									overay_flag							= true;
								}
								break;
							case "event_time":
								if	(goodsInfo['eventEnd']) {
									event_key	= $(that).closest('.designDisplay').prop('id');
									var overay1Text	= '<span class="time_count soloEventTd_overay_'+event_key+'_'+goodsInfo['goods_seq']+'"> 남은시간 <span id="soloday_overay_'+event_key+'_'+goodsInfo['goods_seq']+'"></span>일 <span id="solohour_overay_'+event_key+'_'+goodsInfo['goods_seq']+'"></span>:<span id="solomin_overay_'+event_key+'_'+goodsInfo['goods_seq']+'"></span>:<span id="solosecond_overay_'+event_key+'_'+goodsInfo['goods_seq']+'"></span></span>';
								}else{
									overay_flag							= true;
								}
								break;
							case "event_cnt":
								if	(goodsInfo['eventEnd']) {
									var overay1Text						= '현재 '+goodsInfo['event_order_ea']+'개 구매';
								}else{
									overay_flag							= true;
								}
								break;
							case "direct":
							default:
								var overay1Text = option.overay_text;
								break;
						}

						if	(!overay_flag) {
							var overay1TextObj	= $('<li>');
							var default_css		= {
								'color'				: '#fff',
								'font-size'			: '11pt',
								'font-weight'		: '',
								'text-decoration'	: '',
								'min-height'		: default_height+'px',
								'line-height'		: default_height+'px'
							}

							if (option.overay_font_color != undefined && option.overay_font_color)
								default_css['color']			= option.overay_font_color;

							if (option.overay_font_size != undefined && option.overay_font_size)
								default_css['font-size']		= option.overay_font_size+'pt';

							if (option.overay_font_weight != undefined && option.overay_font_weight > 0)
								default_css['font-weight']		= 'bold';

							if (!discount_use && option.overay_line_through != undefined && option.overay_line_through > 0)
								default_css['text-decoration']	= option.overay_line_through;

							if (option.overay_bracket != undefined && option.overay_bracket) {
								overay1Text						= option.overay_bracket.substring(0,1)+overay1Text+option.overay_bracket.substring(1,2);
							}

							if	(dscount_percent_use) {
								$('.goodsDisplayImageOveray1PerTxt', overay1TextPer).css(default_css);
								dscount_percent_use				= false;
							}else{
								overay1TextObj.html(overay1Text).css(default_css);
								overay1TextObjWrap.append(overay1TextObj);
							}

							if	(discount_use) {

								if (option.overay_line_through != undefined && option.overay_line_through > 0)
									overay1TextObj.find('.left_dc').css({'text-decoration':'line-through'});

								var sub_css = {
									'color'				: '#fff',
									'font-size'			: '11pt',
									'font-weight'		: 'normal'
								};
								if	(option.overay_discount_color != undefined)
									sub_css['color']			= option.overay_discount_color;

								if	(option.overay_discount_font_size != undefined)
									sub_css['font-size']		= option.overay_discount_font_size+'pt';

								if	(option.overay_discount_font_weight != undefined && option.overay_discount_font_weight > 0)
									sub_css['font-weight']		= 'bold';

								overay1TextObj.find('.right_dc').css(sub_css);
							}
						}
					});

					var text_css = {
						'position'				: 'relative',
						'text-align'			: 'center',
						'overflow'				: 'hidden',
						'white-space'			: 'nowrap',
						'left'					: 0,
						'top'					: 0,
						'margin'				: 0,
						'padding'				: 0
					}

					if	(image_overay_plus1_main['overay_h_orderby'] != undefined && image_overay_plus1_main['overay_h_orderby'])
						text_css['text-align']	= image_overay_plus1_main['overay_h_orderby'];

					$(".goodsDisplayImageOverayPlus1Text",overay1Obj)
					.html(overay1TextObjWrap).css(text_css);

					imageObj.after(overay1Obj);

					var this_width				= $(that).closest('.goodsDisplayImageWrap').width();
					if	(is_display_edit || is_image_optimize)
						this_width				= $(that).closest('.goodsDisplayItemWrap').width();

					var textbox_width			= this_width;
					var box_height				= overay1Obj.outerHeight();

					var obj_css = {
						'position'				: 'absolute',
						'left'					: 0,
						'top'					: '100%',
						'width'					: textbox_width,
						'padding-top'			: 0,
						'padding-bottom'		: 0,
						'padding-left'			: 0,
						'padding-right'			: 0
					}

					var padding_left = 0;
					var padding_right = 0;

					if	(dscount_percent_left || dscount_percent_right)
						textbox_width -= default_right_per;

					if	(image_overay_plus1_main['overay_left'] != undefined && image_overay_plus1_main['overay_left']) {
						padding_left = parseInt(image_overay_plus1_main['overay_left']);
						textbox_width -= padding_left;
					}
					if (dscount_percent_left)
						padding_left += parseInt(default_right_per);

					if	(image_overay_plus1_main['overay_right'] != undefined && image_overay_plus1_main['overay_right']) {
						padding_right = parseInt(image_overay_plus1_main['overay_right']);
						textbox_width -= padding_right;
					}

					if	(dscount_percent_right)
						padding_right += parseInt(default_right_per);

					if	(image_overay_plus1_main['overay_top'] != undefined && image_overay_plus1_main['overay_top']) {
						obj_css['padding-top']		= image_overay_plus1_main['overay_top']+'px';
						box_height					+= parseInt(image_overay_plus1_main['overay_top']);
					}

					if	(image_overay_plus1_main['overay_bottom'] != undefined && image_overay_plus1_main['overay_bottom']) {
						obj_css['padding-bottom']	= image_overay_plus1_main['overay_bottom']+'px';
						box_height					+= parseInt(image_overay_plus1_main['overay_bottom']);
					}

					if	(padding_left > 0)	obj_css['padding-left']		= padding_left+'px';
					if	(padding_right > 0)	obj_css['padding-right']	= padding_right+'px';

					obj_css['width']				= textbox_width+'px';
					obj_css['margin-top']			= -box_height;

					overayBgCss['width']			= this_width+'px';

					if	($('.goodsDisplayImageOveray1PerTxt', overay1TextPer).html().length > 0) {
						$('.goodsDisplayImageOverayPlus1Iwrap', overay1Obj).append(overay1TextPer);

						$('.goodsDisplayImageOveray1PerTxt', overay1TextPer)
						.css({
							'height'				: box_height+'px',
							'line-height'			: box_height+'px',
							'position'				: 'absolute',
							'text-align'			: 'center',
							'width'					: default_right_per+'px'
						});

						discount_per_bg_css['height']	= box_height+'px';
						$('.goodsDisplayImageOveray1PerBg', overay1TextPer).css(discount_per_bg_css);
						discount_per_css['height']		= box_height+'px';
						discount_per_css['line-height'] = box_height+'px';
						$('.goodsDisplayImageOveray1PerWrap', overay1Obj).css(discount_per_css);
						overayBgCss['width']			= (this_width-default_right_per)+'px';
					}

					overayBgCss['height']				= box_height+'px';

					if	(image_overay_plus1_main['overay_opacity'] != undefined && image_overay_plus1_main['overay_opacity'])
						overayBgCss['opacity']			= 1-image_overay_plus1_main['overay_opacity']/100;

					if	(image_overay_plus1_main['overay_bg_color'] != undefined && image_overay_plus1_main['overay_bg_color'])
						overayBgCss['background-color'] = image_overay_plus1_main['overay_bg_color'];

					$(".goodsDisplayImageOveray1BgPlus",overay1Obj)
					.css(overayBgCss);

					//이벤트 상품일 경우 함수 실행
					if	(event_key) {
						timeInterval = [];
						timeInterval[event_key+'_'+goodsInfo['goods_seq']] = setInterval(function(){
							var time = [];
							time[event_key+'_'+goodsInfo['goods_seq']] = showClockTime('text' ,goodsInfo['eventEnd']['year'], goodsInfo['eventEnd']['month'], goodsInfo['eventEnd']['day'], goodsInfo['eventEnd']['hour'], goodsInfo['eventEnd']['min'], goodsInfo['eventEnd']['second'], 'soloday_overay_'+event_key+'_'+goodsInfo['goods_seq'], 'solohour_overay_'+event_key+'_'+goodsInfo['goods_seq'], 'solomin_overay_'+event_key+'_'+goodsInfo['goods_seq'], 'solosecond_overay_'+event_key+'_'+goodsInfo['goods_seq'], '_'+event_key+'_'+goodsInfo['goods_seq']);
							if(time[event_key+'_'+goodsInfo['goods_seq']] == 0){
							clearInterval(timeInterval[event_key+'_'+goodsInfo['goods_seq']]);
							$('.soloEventTd_overay_'+event_key+'_'+goodsInfo['goods_seq']).html("단독 이벤트 종료");
							}
						},1000);
					}

					overay1Obj
					.css(obj_css).show();
				}else{
					$(".goodsDisplayImageOverayPlus1",that).remove();
				}

				if(decoration['image_slide'] && goodsInfo['image_cnt']>1){
					var imageSlideObj = $(".goodsDisplayImageSlide",this);
					$(imageSlideObj,imageObj).click(function(){
						show_display_goods_images(that,goodsInfo['goods_seq'],decoration['image_slide_type']);
						return false;
					});
				}

				if(decoration['quick_shopping']){
					var quickShoppingObj = $(that).closest('.goodsDisplayItemWrap').find(".goodsDisplayQuickShopping");
					if(quickShoppingObj.length){
						if(imageObj.width()){
							quickShoppingObj.css({'width': $(that).outerWidth()});
						}else{
							$(imageObj).bind('load',function(){
								quickShoppingObj.css({'width': $(this).outerWidth()});
							});
						}
					}
				}

				if(decoration['use_seconde_image'] && goodsInfo.image2 != null && goodsInfo.image2.length>1){
					imageObj.attr("imageCut2",goodsInfo.image2);
				}else{
					imageObj.removeAttr("imageCut2");
				}

				if	(decoration['use_image_zoom']) {
					$(this).addClass('goodsDisplayImageZoom').css('overflow','hidden');
				}else{
					$(this).removeClass('goodsDisplayImageZoom').css('overflow','');
				}

				if	(decoration['use_image_3d']) {
					$(this).closest('.goodsDisplayItemWrap').addClass('goodsDisplayimageBox3d');
				}else{
					$(this).closest('.goodsDisplayItemWrap').removeClass('goodsDisplayimageBox3d');
				}

				if	(decoration['image_icon'] && decoration['image_icon_type'] == 'condition') {
					icon_condition = decode_base64_json(decoration['image_icon_condition']);
					icon_use_flag = false;

					if($(".goodsDisplayImageIcon",this).length){
						$(".goodsDisplayImageIcon",this).remove();
					}

					var imageIconObj = $("<div class='goodsDisplayImageIcon'><div class='goodsDisplayImageIconWrap'></div></div>");

					if(decoration['image_icon_location']=='right'){
						imageIconObj
						.css({
							'position'			: 'absolute',
							'right'				: '0px',
							'top'				: imageObj.position().top,
						});
					}else{
						imageIconObj
						.css({
							'position'			: 'absolute',
							'left'				: imageObj.position().left,
							'top'				: imageObj.position().top
						});
					}

					if(decoration['image_icon_over']=='y'){
						imageIconObj.hide();
					}else if(typeof iconText != 'undefined' && iconText.length){
						imageIconObj.show();
					}

					imageObj.after(imageIconObj);

					var condition = {
						'{discount}'		: 99,
						'{brand}'			: '퍼스트몰',
						'{brandeng}'		: 'firstmall',
						'{bestnum}'			: goodsInfo['goods_index']
					}

					if	(icon_condition) {
						for(i=0; i<3; i++){
							if	(icon_condition[i]['use'] == '1' && !icon_use_flag) {
								var contents = [];
								$.each(icon_condition[i]['contents'], function(txt_k, txt_v){
									if	(txt_v['txt'] && txt_v['use'] == '1') {
										if	(txt_v['txt_type'] == 'shipping_free') {
											if	(goodsInfo['shipping_group'] && goodsInfo['shipping_group']['default_type'] == 'free')
												contents.push(txt_v);
										}else{
											contents.push(txt_v);
										}
									}
								});
								switch(icon_condition[i]['key']){
									case 'discount_per':
										set_condition_icon($(".goodsDisplayImageIconWrap",this),contents,condition,icon_condition[i]['background']);
										icon_use_flag = true;
									break;
									case 'solo':
										set_condition_icon($(".goodsDisplayImageIconWrap",this),contents,condition,icon_condition[i]['background']);
										icon_use_flag = true;
									break;
									case 'discount':
										set_condition_icon($(".goodsDisplayImageIconWrap",this),contents,condition,icon_condition[i]['background']);
										icon_use_flag = true;
									break;
									case 'gift':
									break;
									case 'package':
										set_condition_icon($(".goodsDisplayImageIconWrap",this),contents,condition,icon_condition[i]['background']);
										icon_use_flag = true;
									break;
									case 'date':
										set_condition_icon($(".goodsDisplayImageIconWrap",this),contents,condition,icon_condition[i]['background']);
										icon_use_flag = true;
									break;
									case 'empty':
										set_condition_icon($(".goodsDisplayImageIconWrap",this),contents,condition,icon_condition[i]['background']);
										icon_use_flag = true;
									break;
								}
							}
						}
					}
					if	(!icon_use_flag)
						$(".goodsDisplayImageIconWrap",this).remove();
					else
						$(".goodsDisplayImageIconWrap",this).show();
				}
			}
		}

		$(that).data('decorationLoaded',true);
		/*
		$(".quick_shopping_view",$(that).closest('.goodsDisplayItemWrap')).click(function(){
			alert(goodsInfo.goods_name + ' 퀵뷰 버튼 클릭');
			return false;
		});
		*/
		if(goodsInfo['image_cnt']>1){
			$(".quick_shopping_image",$(that).closest('.goodsDisplayItemWrap')).click(function(){
				show_display_goods_images(that,goodsInfo['goods_seq'],decoration['image_slide_type']?decoration['image_slide_type']:'bottom');
			});
		}else{
			$(".quick_shopping_image",$(that).closest('.goodsDisplayItemWrap')).remove();
		}

		//상품 정보 확인
		goodsTextWrap = $(that).closest('.goodsDisplayItemWrap').find('.goodsDisplayTextWrap');
		if	(goodsTextWrap.html() && goodsTextWrap.html().length < 10) {
			goodsTextWrap.remove();
		}
		/*
		$(".quick_shopping_send",$(that).closest('.goodsDisplayItemWrap')).click(function(){
			alert(goodsInfo.goods_name + ' 보내기 버튼 클릭');
			return false;
		});
		*/
	});

}

function set_goods_display_decoration_event(selector){
	$(selector)
	.bind("mouseenter",function(){
		var decoration = $(this).data("decoration");
		var goodsInfo = $(this).data("goodsInfo");
		var imageObj = $(this).find("img:eq(0)");
		var imageCut2 = imageObj.attr("imageCut2");
		var imgBorderOrg = $(this);
		var version = $(this).attr('version');
		var is_display_edit = false;

		if	(version == 'display_edit') is_display_edit = true;

		if(imageCut2){
			imageObj.attr('oriSrc',imageObj.attr('src'));
			imageObj.attr('src',imageCut2);
		}

		if(decoration){
			if	(decoration['image_border_type'] && decoration['image_border_type']=='all') {
				imgBorderOrg = imgBorderOrg.closest('.goodsDisplayItemWrap');
			}

			if(decoration['image_border'] && decoration['image_border_mobile'] != 'mobile' && decoration['image_border_type'] != 'all'){
				imgBorderOrg.css({"border":decoration['image_border_width'] + "px solid " + decoration['image_border'],"margin":"-"+decoration['image_border_width']+"px"});
			}

			if(decoration['image_opacity']){
				imageObj.css({"opacity":1-decoration['image_opacity']/100});
			}

			if(decoration['image_icon'] && decoration['image_icon_over']=='y'){
				var imageIconObj = $(".goodsDisplayImageIcon",this);
				imageIconObj.show();
			}

			if((decoration['image_send'] || decoration['image_zzim'] || decoration['image_zzim_on']) && decoration['image_send_over']=='y'){
				var imageSendObj = $(".goodsDisplayImageSend",this);
				imageSendObj.show();
			}

			if	(decoration['use_review_option_like']) {
				var reviewObj = $(".goodsDisplayBottomFunc div",this).not('[act="stay"]');
				reviewObj.attr('act','hover');
				chk_display_goods_show_opt(this,true);
			}

			if(decoration['image_overay2'] || decoration['image_overay2_text']){

				if($(".goodsDisplayImageOveray2",this).length){
					var overay2Obj = $(".goodsDisplayImageOveray2",this);
				}else{
					var overay2Obj = $("<div class='goodsDisplayImageOveray2'><div class='goodsDisplayImageOveray2Bg'></div><div class='goodsDisplayImageOveray2Text'></div></div>");
				}

				var overay2Height = 20;
				var overay2Top = $(".goodsDisplayImageOveray1",this).length ? $(this).height() - $(".goodsDisplayImageOveray1",this).height(): $(this).height();

				switch(decoration['image_overay2']){
					case "goods_name":
						var overay2Text = goodsInfo['goods_name'];

						break;
					case "price":
						var overay2Text = get_currency_price(goodsInfo['price'],2);

						if(goodsInfo['string_price_use']=='1') overay2Text = goodsInfo['string_price'];

						break;
					case "consumer_price":
						var overay2Text = get_currency_price(goodsInfo['consumer_price'],2);

						if(goodsInfo['string_price_use']=='1') overay2Text = goodsInfo['string_price'];

						break;
					case "sale_price":
						var overay2Text = get_currency_price(goodsInfo['sale_price'],2);

						if(goodsInfo['string_price_use']=='1') overay2Text = goodsInfo['string_price'];

						break;
					case "discount":
						var overay2Text = get_currency_price(goodsInfo['consumer_price']) + " → " + get_currency_price(goodsInfo['price']);

						if(goodsInfo['string_price_use']=='1') overay2Text = goodsInfo['string_price'];

						break;
					case "sale_discount":
						var overay2Text = get_currency_price(goodsInfo['consumer_price']) + " → " + get_currency_price(goodsInfo['sale_price']);

						if(goodsInfo['string_price_use']=='1') overay2Text = goodsInfo['string_price'];

						break;
					case "brand_title":
						var overay2Text = goodsInfo['brand_title'];
						break;
					case "related_goods":
						var overay2Text = "<span class='hand' onclick=\"return show_display_related_goods(this,'"+goodsInfo['goods_seq']+"')\" style='display:block'>관련상품보기</span>";
						break;
					case "":
					default:
						var overay2Text = decoration['image_overay2_text'];

						break;
				}

				overay2Obj
				.css({
					'position'			: 'absolute',
					'left'				: 0,
					'top'				: overay2Top-overay2Height,
					'width'				: $(this).width(),
					'height'			: overay2Height
				});

				$(".goodsDisplayImageOveray2Bg",overay2Obj)
				.css({
					'background-color'	: '#000000',
					'color'				: '#fff',
					'opacity'			: 0.3,
					'position'			: 'absolute',
					'left'				: 0,
					'top'				: 0,
					'width'				: $(this).width(),
					'height'			: overay2Height
				});

				$(".goodsDisplayImageOveray2Text",overay2Obj)
				.html(overay2Text)
				.css({
					'color'				: '#fff',
					'font-size'			: '11px',
					'font-weight'		: 'bold',
					'text-align'		: 'center',
					'position'			: 'absolute',
					'overflow'			: 'hidden',
					'white-space'		: 'nowrap',
					'line-height'		: overay2Height+'px',
					'left'				: 0,
					'top'				: 0,
					'width'				: $(this).width()
				});
				imageObj.after(overay2Obj.show());

			}else{
				$(".goodsDisplayImageOveray2",this).remove();
			}

			//향상된 오버레이 기능
			if(decoration['image_overay_plus2'] && decoration['image_overay_type'] != 'all'){
				if	(is_display_edit) $(".goodsDisplayImageOverayPlus2",this).remove();

				if($(".goodsDisplayImageOverayPlus2",this).length){
					$(".goodsDisplayImageOverayPlus2",this).show();
					$(".goodsDisplayImageOveray2PerWrap",this).show();
				}else{
					var overay2Obj = $("<div class='goodsDisplayImageOverayPlus2'><div class='goodsDisplayImageOverayPlus2Iwrap'><div class='goodsDisplayImageOveray2BgPlus'></div><div class='goodsDisplayImageOverayPlus2Text'></div></div></div>");
					var overay2TextPer = $('<div class="goodsDisplayImageOveray2PerWrap"><div class="goodsDisplayImageOveray2PerBg"></div><div class="goodsDisplayImageOveray2PerTxt"></div></div>');
					var image_overay_plus2		= decode_base64_json(decoration['image_overay_plus2']);
					var image_overay_plus2_main = decode_base64_json(decoration['image_overay_plus2_main']);
					var dscount_percent_use		= false;
					var dscount_percent_left	= false;
					var dscount_percent_right	= false;

					var overay2TextObjWrap = $('<ul>');

					var discount_per_css = {
						'position'			: 'absolute',
						'top'				: 0,
						'text-align'		: 'center',
						'width'				: '45px',
					};
					var discount_per_bg_css = {
						'position'			: 'absolute',
						'background-color'	: '',
						'opacity'			: 1,
						'width'				: '45px'
					}
					var overayBgCss = {
						'opacity'			: 1,
						'background-color'	: '#000000',
						'color'				: '#fff',
						'position'			: 'absolute',
						'top'				: 0,
						'left'				: 0,
						'width'				: 0
					};

					var default_height = 16;
					var default_right_per = 45;
					var event_key = '';
					var overay2Top = $(".goodsDisplayImageOverayPlus1",this).length ? $(".goodsDisplayImageOverayPlus1",this).outerHeight(): 0;
					//image_overay_plus1은 이미지 최적화 여부에 따라 늦게 설정 되기때문에 비동기 페이징의 경우를 위해 한번 더 확인 한다
					if	(decoration['image_overay_plus1'] && decoration['image_overay_type'] != 'all' && overay2Top == 0) return;

					$.each(image_overay_plus2, function(key,option){
						var overay_flag = false;
						var discount_use = false;

						switch(option['key']){
							case "goods_name":
								var overay2Text = goodsInfo['goods_name'];
								break;
							case "price":
								var overay2Text = get_currency_price(goodsInfo['price'],3);
								if(goodsInfo['string_price_use']=='1') overay2Text = goodsInfo['string_price'];
								break;
							case "sale_price":
								var overay2Text = get_currency_price(goodsInfo['sale_price'],3);
								if(goodsInfo['string_price_use']=='1') overay2Text = goodsInfo['string_price'];
								break;
							case "consumer_price":
								var overay2Text = get_currency_price(goodsInfo['consumer_price'],3);
								if(goodsInfo['string_price_use']=='1') overay2Text = goodsInfo['string_price'];
								break;
							case "discount":
								var overay2Text = '<span class="left_dc">'+get_currency_price(goodsInfo['consumer_price'], 3) + '</span>' + ' → ' + '<span class="right_dc">'+get_currency_price(goodsInfo['price'], 3)+'</span>';
								if(goodsInfo['string_price_use']=='1') overay2Text = goodsInfo['string_price'];
								discount_use = true;
								break;
							case "sale_discount":
								var overay2Text = '<span class="left_dc">'+get_currency_price(goodsInfo['consumer_price'], 3) + '</span>' + ' → ' + '<span class="right_dc">'+ get_currency_price(goodsInfo['sale_price'], 3)+'</span>';
								if(goodsInfo['string_price_use']=='1') overay2Text = goodsInfo['string_price'];
								discount_use = true;
								break;
							case "brand_title":
								var overay2Text = goodsInfo['brand_title'];
								break;
							case "summary":
								var overay2Text = goodsInfo['summary'];
								break;
							case "related_goods":
								var overay2Text = "<span class='hand' onclick=\"return show_display_related_goods(this,'"+goodsInfo['goods_seq']+"')\" style='display:block;'>관련상품보기</span>";
								break;
							case "provider_name":
								var overay2Text = goodsInfo['provider_name'];
								break;
							case "brand_title_eng":
								var overay2Text = goodsInfo['brand_title_eng'];
								break;
							case "line":
								var overay2Text = '';
								for(i=0;i<100;i++){
									overay2Text += '─' ;
								}
								break;
							case "shpping_free":
								if	(goodsInfo['shipping_group'] && goodsInfo['shipping_group']['default_type'] == 'free')
									var overay2Text = '무료배송';
								else
									overay_flag							= true;
								break;
							case "discount_per":
								if	(option.overay_discount_per <= goodsInfo['sale_per']) {
									if	(option.overay_discount_bg_color == 1) {
										discount_per_bg_css['background-color'] = option.overay_discount_per_color;
										discount_per_bg_css['opacity']			= 1-option.overay_discount_opacity/100;

										if	(option.overay_discount_position == 'left') {
											discount_per_css['left']	= 0;
											dscount_percent_left		= true;
											overayBgCss['right']		= 0;
											overayBgCss['left']			= '';
										}else{
											discount_per_css['right']	= 0;
											dscount_percent_right		= true;
											overayBgCss['left']			= 0;
											overayBgCss['right']		= '';
										}
										$('.goodsDisplayImageOveray2PerTxt', overay2TextPer).text(goodsInfo['sale_per']+'%');
										dscount_percent_use				= true;
									}else{
										var overay2Text					= '할인 '+goodsInfo['sale_per']+'%';
									}
								}else{
									overay_flag							= true;
								}
								break;
							case "event_time":
								if	(goodsInfo['eventEnd']) {
									event_key	= $(this).closest('.designDisplay').prop('id')+'_overay_2';
									var overay2Text	= '<span class="time_count soloEventTd_overay_'+event_key+'_'+goodsInfo['goods_seq']+'"> 남은시간 <span id="soloday_overay_'+event_key+'_'+goodsInfo['goods_seq']+'"></span>일 <span id="solohour_overay_'+event_key+'_'+goodsInfo['goods_seq']+'"></span>:<span id="solomin_overay_'+event_key+'_'+goodsInfo['goods_seq']+'"></span>:<span id="solosecond_overay_'+event_key+'_'+goodsInfo['goods_seq']+'"></span></span>';
								}else{
									overay_flag							= true;
								}
								break;
							case "event_cnt":
								if	(goodsInfo['eventEnd']) {
									var overay2Text						= '현재 '+goodsInfo['event_order_ea']+'개 구매';
								}else{
									overay_flag							= true;
								}
								break;
							case "direct":
							default:
								var overay2Text = option.overay_text;
								break;
						}

						if	(!overay_flag) {
							var overay2TextObj	= $('<li>');
							var default_css		= {
								'color'				: '#fff',
								'font-size'			: '11pt',
								'font-weight'		: '',
								'text-decoration'	: '',
								'min-height'		: default_height+'px',
								'line-height'		: default_height+'px'
							}

							if (option.overay_font_color != undefined && option.overay_font_color)
								default_css['color']			= option.overay_font_color;

							if (option.overay_font_size != undefined && option.overay_font_size)
								default_css['font-size']		= option.overay_font_size+'pt';

							if (option.overay_font_weight != undefined && option.overay_font_weight > 0)
								default_css['font-weight']		= 'bold';

							if (!discount_use && option.overay_line_through != undefined && option.overay_line_through > 0)
								default_css['text-decoration']	= 'line-through';

							if (option.overay_bracket != undefined && option.overay_bracket) {
								overay2Text						= option.overay_bracket.substring(0,1)+overay2Text+option.overay_bracket.substring(1,2);
							}

							if	(dscount_percent_use) {
								$('.goodsDisplayImageOveray2PerTxt', overay2TextPer).css(default_css);
								dscount_percent_use				= false;
							}else{
								overay2TextObj.html(overay2Text).css(default_css);
								overay2TextObjWrap.append(overay2TextObj);
							}

							if	(discount_use) {

								if (option.overay_line_through != undefined && option.overay_line_through > 0)
									overay2TextObj.find('.left_dc').css({'text-decoration':'line-through'});

								var sub_css = {
									'color'				: '#fff',
									'font-size'			: '11pt',
									'font-weight'		: 'normal'
								};
								if	(option.overay_discount_color != undefined)
									sub_css['color']			= option.overay_discount_color;

								if	(option.overay_discount_font_size != undefined)
									sub_css['font-size']		= option.overay_discount_font_size+'pt';

								if	(option.overay_discount_font_weight != undefined && option.overay_discount_font_weight > 0)
									sub_css['font-weight']		= 'bold';

								overay2TextObj.find('.right_dc').css(sub_css);
							}
						}
					});


					var this_width	= $(this).closest('.goodsDisplayImageWrap').width();
					if	(is_display_edit) this_width = $(this).closest('.goodsDisplayItemWrap').width();
					var text_css = {
						'position'				: 'relative',
						'text-align'			: 'center',
						'overflow'				: 'hidden',
						'white-space'			: 'nowrap',
						'left'					: 0,
						'top'					: 0,
						'margin'				: 0,
						'padding'				: 0
					}

					if	(image_overay_plus2_main['overay_h_orderby'] != undefined && image_overay_plus2_main['overay_h_orderby'])
						text_css['text-align']	= image_overay_plus2_main['overay_h_orderby'];

					$(".goodsDisplayImageOverayPlus2Text",overay2Obj)
					.html(overay2TextObjWrap).css(text_css);

					imageObj.after(overay2Obj);

					var textbox_width			= this_width;
					var box_height				= overay2Obj.outerHeight();
					var obj_css = {
						'position'				: 'absolute',
						'left'					: 0,
						'top'					: '100%',
						'width'					: this_width,
						'padding-top'			: 0,
						'padding-bottom'		: 0,
						'padding-left'			: 0,
						'padding-right'			: 0
					}

					var padding_left = 0;
					var padding_right = 0;

					if	(dscount_percent_left || dscount_percent_right)
						textbox_width -= default_right_per;

					if	(image_overay_plus2_main['overay_left'] != undefined && image_overay_plus2_main['overay_left']) {
						padding_left = parseInt(image_overay_plus2_main['overay_left']);
						textbox_width -= padding_left;
					}
					if (dscount_percent_left)
						padding_left += parseInt(default_right_per);

					if	(image_overay_plus2_main['overay_right'] != undefined && image_overay_plus2_main['overay_right']) {
						padding_right = parseInt(image_overay_plus2_main['overay_right']);
						textbox_width -= padding_right;
					}

					if	(dscount_percent_right)
						padding_right += parseInt(default_right_per);

					if	(image_overay_plus2_main['overay_top'] != undefined && image_overay_plus2_main['overay_top']) {
						obj_css['padding-top']		= image_overay_plus2_main['overay_top']+'px';
						box_height					+= parseInt(image_overay_plus2_main['overay_top']);
					}

					if	(image_overay_plus2_main['overay_bottom'] != undefined && image_overay_plus2_main['overay_bottom']) {
						obj_css['padding-bottom']	= image_overay_plus2_main['overay_bottom']+'px';
						box_height					+= parseInt(image_overay_plus2_main['overay_bottom']);
					}

					if	(padding_left > 0)	obj_css['padding-left']		= padding_left+'px';
					if	(padding_right > 0)	obj_css['padding-right']	= padding_right+'px';

					obj_css['width']				= textbox_width+'px';
					obj_css['margin-top']			= -(overay2Top+box_height);

					overayBgCss['width']			= this_width+'px';

					if	($('.goodsDisplayImageOveray2PerTxt', overay2TextPer).html().length > 0) {
						$('.goodsDisplayImageOverayPlus2Iwrap', overay2Obj).append(overay2TextPer);

						$('.goodsDisplayImageOveray2PerTxt', overay2TextPer)
						.css({
							'height'				: box_height+'px',
							'line-height'			: box_height+'px',
							'position'				: 'absolute',
							'text-align'			: 'center',
							'width'					: default_right_per+'px'
						});

						discount_per_bg_css['height']	= box_height+'px';
						$('.goodsDisplayImageOveray2PerBg', overay2TextPer).css(discount_per_bg_css);
						discount_per_css['height']		= box_height+'px';
						discount_per_css['line-height'] = box_height+'px';
						$('.goodsDisplayImageOveray2PerWrap', overay2Obj).css(discount_per_css);
						overayBgCss['width']			= (this_width-default_right_per)+'px';
					}

					overayBgCss['height']				= box_height+'px';

					if	(image_overay_plus2_main['overay_opacity'] != undefined && image_overay_plus2_main['overay_opacity'])
						overayBgCss['opacity']			= 1-image_overay_plus2_main['overay_opacity']/100;

					if	(image_overay_plus2_main['overay_bg_color'] != undefined && image_overay_plus2_main['overay_bg_color'])
						overayBgCss['background-color'] = image_overay_plus2_main['overay_bg_color'];

					$(".goodsDisplayImageOveray2BgPlus",overay2Obj)
					.css(overayBgCss);

					//이벤트 상품일 경우 함수 실행
					if	(event_key) {
						timeInterval = [];
						timeInterval[event_key+'_'+goodsInfo['goods_seq']] = setInterval(function(){
							var time = [];
							time[event_key+'_'+goodsInfo['goods_seq']] = showClockTime('text' ,goodsInfo['eventEnd']['year'], goodsInfo['eventEnd']['month'], goodsInfo['eventEnd']['day'], goodsInfo['eventEnd']['hour'], goodsInfo['eventEnd']['min'], goodsInfo['eventEnd']['second'], 'soloday_overay_'+event_key+'_'+goodsInfo['goods_seq'], 'solohour_overay_'+event_key+'_'+goodsInfo['goods_seq'], 'solomin_overay_'+event_key+'_'+goodsInfo['goods_seq'], 'solosecond_overay_'+event_key+'_'+goodsInfo['goods_seq'], '_'+event_key+'_'+goodsInfo['goods_seq']);
							if(time[event_key+'_'+goodsInfo['goods_seq']] == 0){
							clearInterval(timeInterval[event_key+'_'+goodsInfo['goods_seq']]);
							$('.soloEventTd_overay_'+event_key+'_'+goodsInfo['goods_seq']).html("단독 이벤트 종료");
							}
						},1000);
					}

					overay2Obj
					.css(obj_css).show();
				}
			}

			if	(decoration['image_overay_plus2'] && decoration['image_overay_type'] == 'all') {
				if	(is_display_edit) $(".goodsDisplayImageOverayPlus2",this).remove();

				if($(".goodsDisplayImageOverayPlus2",this).length){
					$(".goodsDisplayImageOverayPlus2",this).show();
					$(".goodsDisplayImageOveray2PerWrap",this).show();
				}else{
					var overay2Obj = $("<div class='goodsDisplayImageOverayPlus2'><div class='goodsDisplayImageOverayPlus2Iwrap'><div class='goodsDisplayImageOveray2BgPlus'></div><div class='goodsDisplayImageOverayPlus2Text'></div></div></div>");

					var image_overay_plus2		= decode_base64_json(decoration['image_overay_plus2']);
					var image_overay_plus2_main = decode_base64_json(decoration['image_overay_plus2_main']);
					var img_height = $(this).find('.goodsDisplayImage').height();
					var overay2TextObjWrap = $('<ul>');
					var default_height = 16;
					var seq = 0;

					$.each(image_overay_plus2, function(key,option){
						var overay_flag = false;
						var discount_use = false;

						switch(option['key']){
							case "goods_name":
								var overay2Text = goodsInfo['goods_name'];
								break;
							case "price":
								var overay2Text = get_currency_price(goodsInfo['price'],3);
								if(goodsInfo['string_price_use']=='1') overay2Text = goodsInfo['string_price'];
								break;
							case "sale_price":
								var overay2Text = get_currency_price(goodsInfo['sale_price'],3);
								if(goodsInfo['string_price_use']=='1') overay2Text = goodsInfo['string_price'];
								break;
							case "consumer_price":
								var overay2Text = get_currency_price(goodsInfo['consumer_price'],3);
								if(goodsInfo['string_price_use']=='1') overay2Text = goodsInfo['string_price'];
								break;
							case "discount":
								var overay2Text = '<span class="left_dc">'+get_currency_price(goodsInfo['consumer_price'], 3) + '</span>' + ' → ' + '<span class="right_dc">'+get_currency_price(goodsInfo['price'], 3)+'</span>';
								if(goodsInfo['string_price_use']=='1') overay2Text = goodsInfo['string_price'];
								discount_use = true;
								break;
							case "sale_discount":
								var overay2Text = '<span class="left_dc">'+get_currency_price(goodsInfo['consumer_price'], 3) + '</span>' + ' → ' + '<span class="right_dc">'+ get_currency_price(goodsInfo['sale_price'], 3)+'</span>';
								if(goodsInfo['string_price_use']=='1') overay2Text = goodsInfo['string_price'];
								discount_use = true;
								break;
							case "brand_title":
								var overay2Text = goodsInfo['brand_title'];
								break;
							case "summary":
								var overay2Text = goodsInfo['summary'];
								break;
							case "related_goods":
								var overay2Text = "<span class='hand' onclick=\"return show_display_related_goods(this,'"+goodsInfo['goods_seq']+"')\" style='display:block;'>관련상품보기</span>";
								break;
							case "provider_name":
								var overay2Text = goodsInfo['provider_name'];
								break;
							case "brand_title_eng":
								var overay2Text = goodsInfo['brand_title_eng'];
								break;
							case "line":
								var overay2Text = '';
								for(i=0;i<100;i++){
									overay2Text += '─' ;
								}
								break;
							case "shpping_free":
								if	(goodsInfo['shipping_group'] && goodsInfo['shipping_group']['default_type'] == 'free')
									var overay2Text = '무료배송';
								else
									overay_flag							= true;
								break;
							case "discount_per":
								if	(option.overay_discount_per <= goodsInfo['sale_per'])
										var overay2Text					= '할인 '+goodsInfo['sale_per']+'%';
								else
									overay_flag							= true;
								break;
							case "event_time":
								if	(goodsInfo['eventEnd']) {
									event_key	= $(this).closest('.designDisplay').prop('id')+'_overay_2';
									var overay2Text	= '<span class="time_count soloEventTd_overay_'+event_key+'_'+goodsInfo['goods_seq']+'"> 남은시간 <span id="soloday_overay_'+event_key+'_'+goodsInfo['goods_seq']+'"></span>일 <span id="solohour_overay_'+event_key+'_'+goodsInfo['goods_seq']+'"></span>:<span id="solomin_overay_'+event_key+'_'+goodsInfo['goods_seq']+'"></span>:<span id="solosecond_overay_'+event_key+'_'+goodsInfo['goods_seq']+'"></span></span>';
								}else{
									overay_flag							= true;
								}
								break;
							case "event_cnt":
								if	(goodsInfo['eventEnd']) {
									var overay2Text						= '현재 '+goodsInfo['event_order_ea']+'개 구매';
								}else{
									overay_flag							= true;
								}
								break;
							case "direct":
							default:
								var overay2Text = option.overay_text;
								break;
						}

						if	(!overay_flag) {
							var overay2TextObj	= $('<li>');
							overay2TextObj.addClass('overay_txt_line_'+seq);
							var default_css		= {
								'color'				: '#fff',
								'font-size'			: '11pt',
								'font-weight'		: '',
								'text-decoration'	: '',
								'min-height'		: default_height+'px',
								'line-height'		: default_height+'px'
							}

							if (option.overay_font_color != undefined && option.overay_font_color)
								default_css['color']			= option.overay_font_color;

							if (option.overay_font_size != undefined && option.overay_font_size)
								default_css['font-size']		= option.overay_font_size+'pt';

							if (option.overay_font_weight != undefined && option.overay_font_weight > 0)
								default_css['font-weight']		= 'bold';

							if (!discount_use && option.overay_line_through != undefined && option.overay_line_through > 0)
								default_css['text-decoration']	= 'line-through';

							if (option.overay_bracket != undefined && option.overay_bracket) {
								overay2Text						= option.overay_bracket.substring(0,1)+overay2Text+option.overay_bracket.substring(1,2);
							}

							overay2TextObj.html(overay2Text).css(default_css);
							overay2TextObjWrap.append(overay2TextObj);

							if	(discount_use) {

								if (option.overay_line_through != undefined && option.overay_line_through > 0)
									overay2TextObj.find('.left_dc').css({'text-decoration':'line-through'});

								var sub_css = {
									'color'				: '#fff',
									'font-size'			: '11pt',
									'font-weight'		: 'normal'
								};
								if	(option.overay_discount_color != undefined)
									sub_css['color']			= option.overay_discount_color;

								if	(option.overay_discount_font_size != undefined)
									sub_css['font-size']		= option.overay_discount_font_size+'pt';

								if	(option.overay_discount_font_weight != undefined && option.overay_discount_font_weight > 0)
									sub_css['font-weight']		= 'bold';

								overay2TextObj.find('.right_dc').css(sub_css);
							}
						}

						seq++;
					});

					var overayBgCss = {
						'opacity'			: 1,
						'background-color'	: '#000000',
						'color'				: '#fff',
						'position'			: 'absolute',
						'top'				: 0,
						'left'				: 0,
						'width'				: $(this).width(),
						'height'			: img_height
					};

					if	(image_overay_plus2_main['overay_opacity'] != undefined && image_overay_plus2_main['overay_opacity'])
						overayBgCss['opacity']			= 1-image_overay_plus2_main['overay_opacity']/100;

					if	(image_overay_plus2_main['overay_bg_color'] != undefined && image_overay_plus2_main['overay_bg_color'])
						overayBgCss['background-color'] = image_overay_plus2_main['overay_bg_color'];

					$(".goodsDisplayImageOveray2BgPlus",overay2Obj)
					.css(overayBgCss);

					var text_css = {
						'position'				: 'relative',
						'text-align'			: 'center',
						'overflow'				: 'hidden',
						'left'					: 0,
						'top'					: 0,
						'margin'				: 0,
						'padding'				: 0
					}

					if	(image_overay_plus2_main['overay_h_orderby'] != undefined && image_overay_plus2_main['overay_h_orderby'])
						text_css['text-align']	= image_overay_plus2_main['overay_h_orderby'];

					$(".goodsDisplayImageOverayPlus2Text",overay2Obj)
					.html(overay2TextObjWrap).css(text_css);

					imageObj.after(overay2Obj);

					//이벤트 상품일 경우 함수 실행
					if	(event_key) {
						timeInterval = [];
						timeInterval[event_key+'_'+goodsInfo['goods_seq']] = setInterval(function(){
							var time = [];
							time[event_key+'_'+goodsInfo['goods_seq']] = showClockTime('text' ,goodsInfo['eventEnd']['year'], goodsInfo['eventEnd']['month'], goodsInfo['eventEnd']['day'], goodsInfo['eventEnd']['hour'], goodsInfo['eventEnd']['min'], goodsInfo['eventEnd']['second'], 'soloday_overay_'+event_key+'_'+goodsInfo['goods_seq'], 'solohour_overay_'+event_key+'_'+goodsInfo['goods_seq'], 'solomin_overay_'+event_key+'_'+goodsInfo['goods_seq'], 'solosecond_overay_'+event_key+'_'+goodsInfo['goods_seq'], '_'+event_key+'_'+goodsInfo['goods_seq']);
							if(time[event_key+'_'+goodsInfo['goods_seq']] == 0){
							clearInterval(timeInterval[event_key+'_'+goodsInfo['goods_seq']]);
							$('.soloEventTd_overay_'+event_key+'_'+goodsInfo['goods_seq']).html("단독 이벤트 종료");
							}
						},1000);
					}

					var this_width				= $(this).closest('.goodsDisplayImageWrap').width();
					if	(is_display_edit) this_width = $(this).closest('.goodsDisplayItemWrap').width();
					var textbox_width			= this_width;
					var box_height				= img_height;
					var box_padding_top			= 0;
					var box_padding_bottom		= 0;
					var obj_css = {
						'position'				: 'absolute',
						'left'					: 0,
						'top'					: '100%',
						'width'					: this_width,
						'height'				: img_height,
						'padding-top'			: 0,
						'padding-bottom'		: 0,
						'padding-left'			: 0,
						'padding-right'			: 0
					}

					if	(image_overay_plus2_main['overay_left'] != undefined && image_overay_plus2_main['overay_left']) {
						obj_css['padding-left'] = image_overay_plus2_main['overay_left']+'px';
						textbox_width -= parseInt(image_overay_plus2_main['overay_left']);
					}

					if	(image_overay_plus2_main['overay_right'] != undefined && image_overay_plus2_main['overay_right']) {
						obj_css['padding-right']	= image_overay_plus2_main['overay_right']+'px';
						textbox_width				-= parseInt(image_overay_plus2_main['overay_right']);
					}

					if	(image_overay_plus2_main['overay_top'] != undefined && image_overay_plus2_main['overay_top']) {
						obj_css['padding-top']		= image_overay_plus2_main['overay_top']+'px';
						box_padding_top				= parseInt(image_overay_plus2_main['overay_top']);
					}

					if	(image_overay_plus2_main['overay_bottom'] != undefined && image_overay_plus2_main['overay_bottom']) {
						obj_css['padding-bottom']	= image_overay_plus2_main['overay_bottom']+'px';
						box_padding_bottom			= parseInt(image_overay_plus2_main['overay_bottom']);
					}

					if	(image_overay_plus2_main['overay_v_orderby'] != undefined && image_overay_plus2_main['overay_v_orderby']) {
						if	(image_overay_plus2_main['overay_v_orderby'] == 'middle') {
							padding = (box_height-$(".goodsDisplayImageOverayPlus2Text",overay2Obj).height()) / 2;
							obj_css['padding-top'] = padding+box_padding_top+'px';
							//padding-top 만 있어도 가운데 노출됨, 하단에 padding 있는 경우 이미지사이즈보다 크게 잡힘 2018-05-02
							//obj_css['padding-bottom'] = padding+box_padding_bottom+'px';
						}else if(image_overay_plus2_main['overay_v_orderby'] == 'bottom'){
							padding = box_height-$(".goodsDisplayImageOverayPlus2Text",overay2Obj).height()-box_padding_top-box_padding_bottom;
							obj_css['padding-top'] = padding+box_padding_top+'px';
						}
					}

					obj_css['width']				= textbox_width+'px';
					obj_css['margin-top']			= -img_height;

					overay2Obj
					.css(obj_css).show();
				}
			}
		}
	})
	.bind("mouseleave",function(){
		var decoration = $(this).data("decoration");
		var goodsInfo = $(this).data("goodsInfo");
		var imageObj = $(this).find("img:eq(0)");
		var imageCut2 = imageObj.attr("imageCut2");

		if(imageCut2){
			imageObj.attr('src',imageObj.attr('oriSrc'));
		}

		if(decoration){
			if	(decoration['image_border_type'] != 'all') {
				if(decoration['image_border'] && decoration['image_border1']){
					decoration['image_border1_width'] = decoration['image_border1_width'] ? decoration['image_border1_width'] : 0;
					$(this).css({"border":decoration['image_border1_width'] + "px solid " + decoration['image_border1'],"margin":"-"+decoration['image_border1_width']+"px"});
				}else if(decoration['image_border']){
					$(this).css({"border":0,"margin":"0px"});
				}
			}

			if(decoration['image_opacity']){
				imageObj.css({"opacity":1});
			}

			if(decoration['image_overay2'] || decoration['image_overay2_text']){
				$(".goodsDisplayImageOveray2",this).hide();
			}

			if(decoration['image_overay_plus2']){
				$(".goodsDisplayImageOverayPlus2",this).hide();
				$(".goodsDisplayImageOveray2PerWrap",this).hide();
			}

			if(decoration['image_icon'] && decoration['image_icon_over']=='y'){
				$(".goodsDisplayImageIcon",this).hide();
			}

			if((decoration['image_send'] || decoration['image_zzim'] || decoration['image_zzim_on']) && decoration['image_send_over']=='y'){
				$(".goodsDisplayImageSend",this).hide();
			}

			if	(decoration['use_review_option_like']) {
				var reviewObj = $(".goodsDisplayBottomFunc div",this).not('[act="stay"]');
				reviewObj.attr('act','');
				chk_display_goods_show_opt(this,false);
			}
		}
	});

	border_except = false;
	display_style = $(selector).closest('.designDisplay').attr('displaystyle');
	if	($.inArray(display_style, ['list','rolling_h','rolling_v']) < 0)
		border_except = true;

	$(selector).closest('.goodsDisplayItemWrap').bind("mouseenter",function(){
		var decoration = $(this).find('.goodsDisplayImageWrap').data("decoration");
		if(decoration && decoration['image_border'] && decoration['image_border_type'] == 'all' && decoration['image_border_mobile'] == undefined){
			border_opt = {"border":decoration['image_border_width'] + "px solid " + decoration['image_border']};
			$(this).css(border_opt);
		}
	}).bind("mouseleave",function(){
		var decoration = $(this).find('.goodsDisplayImageWrap').data("decoration");

		if	(decoration && decoration['image_border_type'] == 'all') {
			if(decoration['image_border'] && decoration['image_border1']){
				decoration['image_border1_width'] = decoration['image_border1_width'] ? decoration['image_border1_width'] : 0;
				border_opt = {"border":decoration['image_border1_width'] + "px solid " + decoration['image_border1']};
			}else if(decoration['image_border']){
				if	(border_except) {
					border_opt = {"border":0,"margin":"0px"};
				}else{
					border_opt = {"border":0};
				}
			}
			$(this).css(border_opt);
		}
	});
}

/* 어드민 : 이미지꾸미기 선택정보를 샘플이미지에 적용*/
function goods_image_decoration_data(goodsDisplayDecorationContainer){
	var data = {};

	if($("input.use_image_border",goodsDisplayDecorationContainer).is(":checked")){
		isMobile = $("input.image_border1",goodsDisplayDecorationContainer).hasClass('isMobile') ? 'mobile' : 'pc';
		if(isMobile != 'mobile'){
			if($("input.image_border",goodsDisplayDecorationContainer).val().length){
				data.image_border1 = $("input.image_border1",goodsDisplayDecorationContainer).val();
				data.image_border1_width = $("input.image_border1_width",goodsDisplayDecorationContainer).val();
				data.image_border = $("input.image_border",goodsDisplayDecorationContainer).val();
				data.image_border_width = $("input.image_border_width",goodsDisplayDecorationContainer).val();
				data.image_border_type = $("select.image_border_type",goodsDisplayDecorationContainer).val();
			}
		}else{
			if($("input.image_border1",goodsDisplayDecorationContainer).val().length){
				data.image_border1 = $("input.image_border1",goodsDisplayDecorationContainer).val();
				data.image_border1_width = $("input.image_border1_width",goodsDisplayDecorationContainer).val();
				data.image_border_mobile = isMobile;
				data.image_border_type = $("select.image_border_type",goodsDisplayDecorationContainer).val();
			}
		}
	}

	if($("input.use_image_opacity",goodsDisplayDecorationContainer).is(":checked")){
		if($("input.image_opacity",goodsDisplayDecorationContainer).val().length){
			data.image_opacity = $("input.image_opacity",goodsDisplayDecorationContainer).val();
		}
	}

	if($("input.use_image_icon",goodsDisplayDecorationContainer).is(":checked")){
		data.use_image_icon = '1';
		if($("input.image_icon",goodsDisplayDecorationContainer).val().length){
			data.image_icon = $("input.image_icon",goodsDisplayDecorationContainer).val();
		}
		if($("select.image_icon_location",goodsDisplayDecorationContainer).val().length){
			data.image_icon_location = $("select.image_icon_location",goodsDisplayDecorationContainer).val();
		}
		if($("select.image_icon_over",goodsDisplayDecorationContainer).val().length){
			data.image_icon_over = $("select.image_icon_over",goodsDisplayDecorationContainer).val();
		}
		if($("input.image_icon_type",goodsDisplayDecorationContainer).val().length){
			data.image_icon_type = $("input.image_icon_type",goodsDisplayDecorationContainer).val();
		}
		if($("input.image_icon_condition",goodsDisplayDecorationContainer).val().length){
			data.image_icon_condition = $("input.image_icon_condition",goodsDisplayDecorationContainer).val();
		}
		if($("input.image_icon_condition_cnt",goodsDisplayDecorationContainer).val().length){
			data.image_icon_condition_cnt = $("input.image_icon_condition_cnt",goodsDisplayDecorationContainer).val();
		}
	}

	if($("input.use_image_send",goodsDisplayDecorationContainer).is(":checked")){
		if($("input.image_send",goodsDisplayDecorationContainer).val().length){
			data.image_send = $("input.image_send",goodsDisplayDecorationContainer).val();
		}
		if($("select.image_send_location",goodsDisplayDecorationContainer).val().length){
			data.image_send_location = $("select.image_send_location",goodsDisplayDecorationContainer).val();
		}
		if($("select.image_send_over",goodsDisplayDecorationContainer).val().length){
			data.image_send_over = $("select.image_send_over",goodsDisplayDecorationContainer).val();
		}
	}

	if($("input.use_image_zzim",goodsDisplayDecorationContainer).is(":checked")){
		data.use_image_zzim = '1';
		if($("input.image_zzim",goodsDisplayDecorationContainer).val().length){
			data.image_zzim = $("input.image_zzim",goodsDisplayDecorationContainer).val();
		}
		if($("input.image_zzim_on",goodsDisplayDecorationContainer).val().length){
			data.image_zzim_on = $("input.image_zzim_on",goodsDisplayDecorationContainer).val();
		}
		if($("input.use_image_send",goodsDisplayDecorationContainer).is(":checked")){
			if($("select.image_send_location",goodsDisplayDecorationContainer).val().length){
				data.image_send_location = $("select.image_send_location",goodsDisplayDecorationContainer).val();
			}
			if($("select.image_send_over",goodsDisplayDecorationContainer).val().length){
				data.image_send_over = $("select.image_send_over",goodsDisplayDecorationContainer).val();
			}
		}else{
			data.image_send_location = 'right';
		}
	}


	if($("input.use_image_overay",goodsDisplayDecorationContainer).is(":checked")){

		if($("input.image_overay1",goodsDisplayDecorationContainer).val().length){
			new_value = overay_before_change('type', $("input.image_overay1",goodsDisplayDecorationContainer).val());
			$("input.image_overay_plus1",goodsDisplayDecorationContainer).val(new_value['items']);
			$("input.image_overay_plus1_title",goodsDisplayDecorationContainer).val(new_value['title']);
			$("input.image_overay1",goodsDisplayDecorationContainer).val('');
		}else if($("input.image_overay1_text",goodsDisplayDecorationContainer).val().length){
			new_value = overay_before_change('text', $("input.image_overay1_text",goodsDisplayDecorationContainer).val());
			$("input.image_overay_plus1",goodsDisplayDecorationContainer).val(new_value['items']);
			$("input.image_overay_plus1_title",goodsDisplayDecorationContainer).val(new_value['title']);
			$("input.image_overay1",goodsDisplayDecorationContainer).val('');
			$("input.image_overay1_text",goodsDisplayDecorationContainer).val('');
		}

		if($("input.image_overay2",goodsDisplayDecorationContainer).val().length){
			new_value = overay_before_change('type', $("input.image_overay2",goodsDisplayDecorationContainer).val());
			$("input.image_overay_plus2",goodsDisplayDecorationContainer).val(new_value['items']);
			$("input.image_overay_plus2_title",goodsDisplayDecorationContainer).val(new_value['title']);
			$("input.image_overay2",goodsDisplayDecorationContainer).val('');
		}else if($("input.image_overay2_text",goodsDisplayDecorationContainer).val().length){
			new_value = overay_before_change('text', $("input.image_overay2_text",goodsDisplayDecorationContainer).val());
			$("input.image_overay_plus2",goodsDisplayDecorationContainer).val(new_value['items']);
			$("input.image_overay_plus2_title",goodsDisplayDecorationContainer).val(new_value['title']);
			$("input.image_overay2",goodsDisplayDecorationContainer).val('');
			$("input.image_overay2_text",goodsDisplayDecorationContainer).val('');
		}

		if(!$("input.image_overay_type",goodsDisplayDecorationContainer).is(":checked")){
			$("input.image_overay_type:eq(0)",goodsDisplayDecorationContainer).prop('checked',true);
		}

		data.image_overay_type = $("input.image_overay_type:checked",goodsDisplayDecorationContainer).val();

		if	(data.image_overay_type == 'all')
			$('.overay_bottom').css('visibility','hidden');
		else
			$('.overay_bottom').css('visibility','');

		if($("input.image_overay_plus1",goodsDisplayDecorationContainer).val().length){
			data.image_overay_plus1 = $("input.image_overay_plus1",goodsDisplayDecorationContainer).val();
			data.image_overay_plus1_main = $("input.image_overay_plus1_main",goodsDisplayDecorationContainer).val();
			data.image_overay_plus1_title = $("input.image_overay_plus1_title",goodsDisplayDecorationContainer).val();
		}

		if($("input.image_overay_plus2",goodsDisplayDecorationContainer).val().length){
			data.image_overay_plus2 = $("input.image_overay_plus2",goodsDisplayDecorationContainer).val();
			data.image_overay_plus2_main = $("input.image_overay_plus2_main",goodsDisplayDecorationContainer).val();
			data.image_overay_plus2_title = $("input.image_overay_plus2_title",goodsDisplayDecorationContainer).val();
		}
	}

	if($("input.use_image_slide",goodsDisplayDecorationContainer).is(":checked")){
		if($("input.image_slide",goodsDisplayDecorationContainer).val().length){
			data.image_slide = $("input.image_slide",goodsDisplayDecorationContainer).val();
		}
		if($("select.image_slide_type",goodsDisplayDecorationContainer).val().length){
			data.image_slide_type = $("select.image_slide_type",goodsDisplayDecorationContainer).val();
		}
	}

	if($("input.use_quick_shopping",goodsDisplayDecorationContainer).is(":checked")){
		if($("input[name='quick_shopping']",goodsDisplayDecorationContainer).val().length){
			data.quick_shopping = $("input[name='quick_shopping']",goodsDisplayDecorationContainer).val();
		}
	}

	if($("input.use_image_zoom",goodsDisplayDecorationContainer).is(":checked")){
		data.use_image_zoom = "1";
	}

	if($("input.use_image_3d",goodsDisplayDecorationContainer).is(":checked")){
		data.use_image_3d = "1";
	}

	if($("input.use_seconde_image",goodsDisplayDecorationContainer).is(":checked")){
		data.use_seconde_image = "1";
	}

	if($("input.use_review_option_like",goodsDisplayDecorationContainer).is(":checked")){
		data.use_review_option_like = "1";
	}

	var i,dataCnt = 0;
	for(i in data) {
		dataCnt++;
		data[i] = data[i].replace(/"/g,'\\"');
	}

	var decoration = Base64.encode(JSONtoString(data));

	$(".goodsDisplayImageWrap",goodsDisplayDecorationContainer).data("decorationLoaded",false);
	$(".goodsDisplayImageWrap",goodsDisplayDecorationContainer).attr("decoration",decoration);
	$(".goodsDisplayImageWrap",goodsDisplayDecorationContainer).data("decoration",data);
	$("input.image_decoration",goodsDisplayDecorationContainer).val(decoration);

	/* 이미지꾸미기 이미지 설정 */
	set_goods_display_decoration(".goodsDisplayImageWrap");
}

function set_info_item_data(goodsDisplayDecorationContainer){

	try{
		var info_item_settings = eval($(".info_settings",goodsDisplayDecorationContainer).val());
		//var info_item_settings = $(".info_settings",goodsDisplayDecorationContainer).val();
	}catch(e){
		var info_item_settings = [];
	};

	if(typeof info_item_settings == 'object'){
		/* 상품정보 항목 저장값 출력 */
		for(var i=0;i<info_item_settings.length;i++){

			var new_info_item		= add_new_info_item(goodsDisplayDecorationContainer);
			var info_item_setting	= info_item_settings[i];

			for(var key in info_item_setting){
				var cellSelector	= ".info_item_cell_" + key;
				var selector		= ".info_item_" + key;

				if(typeof info_item_setting[key] == 'object'){

					for(var key2 in info_item_setting[key]){
						if(typeof info_item_setting[key][key2] == 'object'){
							for(var key3 in info_item_setting[key][key2]){
								if(typeof info_item_setting[key][key2][key3] == 'object'){

									for(var key4 in info_item_setting[key][key2][key3]){
										if(typeof info_item_setting[key][key2][key3][key4] == 'object'){
											info_item_setting[key][key2][key3][key4] = JSONtoString(info_item_setting[key][key2][key3][key4]);
										}
									}

									info_item_setting[key][key2][key3] = JSONtoString(info_item_setting[key][key2][key3]);
								}
							}
							info_item_setting[key][key2]	= JSONtoString(info_item_setting[key][key2]);
						}
					}
				}

				var selectValue		= '';
				if(typeof info_item_setting[key] == 'object'){
					selectValue		= JSONtoString(info_item_setting[key]);
				}else{
					selectValue		= info_item_setting[key];
				}

				if($(selector,new_info_item).length){
					switch($(selector,new_info_item)[0].tagName){
						case 'INPUT':
							if($(selector,new_info_item).attr('type')=='text'){

								//$(selector,new_info_item).attr("style","display:block;width:100%;background-color:yellow;");
								$(selector,new_info_item).val(selectValue).change();

							}else if($(selector,new_info_item).attr('type')=='radio' ){
								$(selector,new_info_item).each(function(idx){
									if( $(this).val() == selectValue ) {
										$(this).attr('checked',true).change();
									}
								});
							}else{
								$(selector,new_info_item).attr('checked',true);
							}
						break;
						case 'SELECT':
							$(selector,new_info_item).val(selectValue);
						break;
					}
				}
			}

			$(".info_item_kind",new_info_item).change();
		}
	}else{
		var idx=0;

		for(key in info_item_config){
			add_new_info_item(goodsDisplayDecorationContainer);
			$(".info_item_kind",goodsDisplayDecorationContainer).eq(idx).val(key).change();
			idx++;
		}
	}

	apply_input_style();

}

function display_goods_view(seq,target,obj,kind){
	var ban_style = new Array('rolling_h','rolling_v');
	if	(obj != undefined && $(obj).closest('.designDisplay').hasClass('display_style3') && $.inArray($(obj).closest('.designDisplay').attr('displaystyle'),ban_style) < 0) {
		if	(gl_display_now_page > 2)
			document.location.hash = (gl_display_now_page-2)+'y'+$(document).scrollTop();
	}

    // GA4 연동을 위해 호출	
    try {
        if (kind == 'goods_view') {
            ga4_select_item(seq);
        }    
    } catch(e) {
        console.log('GA4 select_item 이벤트 에러',e);
    }

	switch(kind){
		case 'provider':
			url = '/mshop/?m='+seq;
			break;
		case 'bigdata':
			url = '/bigdata/catalog?no='+seq;
			break;
		case 'goods_view':
		default:
			url = '/goods/view?no='+seq;
	}

	if	(target != '')
		window.open(url);
	else
		location.href = url;
}

/* 어드민 : 상품정보 항목 추가 */
function add_new_info_item(obj){
	var goodsDisplayDecorationContainer = $(obj).closest(".goodsDisplayDecorationContainer");

	$(".info_item_default .colorpicker",goodsDisplayDecorationContainer).customColorPicker("destroy");
	var new_info_item = $("div.info_item_default",goodsDisplayDecorationContainer).clone();
	new_info_item.removeClass("hide").removeClass("info_item_default").show();
	new_info_item.find("input.info_setting").removeAttr('disabled');

	$("div.info_item_container",goodsDisplayDecorationContainer).append(new_info_item);
	$("div.info_item_container",goodsDisplayDecorationContainer).find("div.info_item_container_sub").sortable({
		placeholder: "info_item_sub_holder"
	});

	$(".colorpicker",goodsDisplayDecorationContainer).customColorPicker();

	change_info_item(new_info_item);

	//폰트꾸미기 호출
	$(".customFontDecoration",new_info_item).customFontDecoration({
		"returnFunc":function(obj){testFunc(obj);},
		"change":function(){ change_info_item(new_info_item);}
	});

	//비교통화 설정 호출
	$(".customCompare",new_info_item).customCompare({
		"change":function(){ change_info_item(new_info_item);}
	});

	$(document).resize();

	return new_info_item;
}

function testFunc(obj){
	//obj.find('span.info_item_cell_exchange_font').hide();
}

/* 어드민 : 상품정보 항목 삭제 */
function remove_info_item(obj){
	var data = '[]';
	$("input.info_settings").val(data);
	$(obj).closest("div.info_item").remove();
}

/* 어드민 : 상품정보 항목 값 변경 */
function change_info_item(obj){

	var info_item		= $(obj).closest("div.info_item");
	var kind			= $(".info_item_kind",info_item).val();
	var data			= {};
	var result_string	= '';

	if(!info_item_config[kind]) return;

	$(".info_item_cell",info_item).hide();

	for(var i=0;i<info_item_config[kind].length;i++){

		var key = info_item_config[kind][i];

		var cellSelector	= ".info_item_cell_" + key;
		var selector		= ".info_item_" + key;
		var exchange_font	= "span.info_item_cell_exchange_font";
		var selectValue		= "";

		$(cellSelector,info_item).show();

		if($(selector,info_item).length){
			switch($(selector,info_item)[0].tagName){
				case 'INPUT':
					if($(selector,info_item).attr('type')=='text'){
						selectValue = $(selector,info_item).val();
					}else if($(selector,info_item).is(':checked')){
						selectValue = $(obj).val();
					}
				break;
				case 'SELECT':
					selectValue = $(selector,info_item).val();
				break;
			}
			// 비교통화 폰트설정시에는 제외.(각 통화별로 설정함)
			if(key == "compare"){
				/* 정가,판매가, (혜택적용)판매가의 해당 비교통화만 노출*/
				var compare_kind_obj = $(".info_item_cell_compare .compare_kind option",info_item);
				for(var compare_i=0; compare_i < compare_kind_obj.length; compare_i++){
					if(compare_kind_obj.eq(compare_i).val() != "compare_"+kind){
						compare_kind_obj.eq(compare_i).remove();
					}
				}
				for(var view_i=0; view_i < $(".info_item_cell_compare .compare_symbol_view",info_item).length; view_i++){
					if($(".info_item_cell_compare .compare_symbol_view:eq("+view_i+")",info_item).val() == ""){
						if(kind == "sale_price"){
							$(".info_item_cell_compare .compare_symbol_view:eq("+view_i+") option[value='view']",info_item).attr("selected",true);
						}else{
							$(".info_item_cell_compare .compare_symbol_view:eq("+view_i+") option[value='none']",info_item).attr("selected",true);
						}
					}
				}
				//$(".info_item_cell_compare .compare_kind",info_item).attr("selected",false);
				//$(".info_item_cell_compare .compare_kind option[value='compare_"+kind+"']",info_item).attr("selected",true);
			}
		}

		//if(key=='font_decoration'){
		//	data[key] = selectValue.replace(/"/g,'\\"');
		//}else{
			data[key] = selectValue;
		//}
	}

	result_string = (JSONtoString(data));

	$("input.info_setting",info_item).val(result_string);


}

/* 해당 상품의 관련상품 보기 */
function show_display_related_goods(obj,goods_seq){
	event.cancelBubble	= true;
	event.returnValue	= false;
	//설정페이지에선 미리보기를 지원하지 않는다
	if	(typeof isAdminpage != 'undefined' && isAdminpage == true) return;
	var goodsDisplayImageWrapObj = $(obj).closest('.goodsDisplayImageWrap');

	if($("#displayRelatedGoodsLayer").length){
		$("<div id='displayRelatedGoodsLayer'></div>").remove();
	}

	var html = "<div class='goodsPopupLayer' id='displayRelatedGoodsLayer'>";
	html += "<div class='goodsPopupLayerTitle'>해당 상품의 관련상품 보기</div>";
	html += "<div class='goodsPopupLayerClose'></div>";
	html += "<div class='goodsPopupLayerBody'>";
	html += "</div>";
	html += "</div>";

	$(html).hide().appendTo('body');

	$(goodsDisplayImageWrapObj).activity({segments: 12, width: 5.5, space: 6, length: 13, color: '#fff', speed: 1.5});

	$.ajax({
		'url' : '/goods/display_related_goods',
		'data' : {'goods_seq':goods_seq},
		'success' : function(res){

			$(goodsDisplayImageWrapObj).activity(false);

			$("#displayRelatedGoodsLayer").css({
				'top' : $(document).scrollTop()+goodsDisplayImageWrapObj.offset().top-$(document).scrollTop()+goodsDisplayImageWrapObj.outerHeight(),
				'left' : goodsDisplayImageWrapObj.offset().left
			}).show();

			$("#displayRelatedGoodsLayer .goodsPopupLayerClose").click(function(){
				$("#displayRelatedGoodsLayer").remove();
			});

			if(!$("#displayRelatedGoodsLayer").length){
				$("<div id='displayRelatedGoodsLayer'></div>").appendTo('body');
			}

			$("#displayRelatedGoodsLayer .goodsPopupLayerBody").html(res);

			if(goodsDisplayImageWrapObj.offset().left+$("#displayRelatedGoodsLayer").outerWidth() > $(window).width()){
				$("#displayRelatedGoodsLayer").css('left',goodsDisplayImageWrapObj.offset().left - (goodsDisplayImageWrapObj.offset().left+$("#displayRelatedGoodsLayer").outerWidth()-$(window).width()));
			}
		}
	})

	return false;
}


/* 해당 상품의 이미지 더 보기 */
function show_display_goods_images(goodsDisplayImageWrapObj,goods_seq,image_slide_type){
	var imageObj = $(goodsDisplayImageWrapObj).find("img:eq(0)");

	if($(goodsDisplayImageWrapObj).find("#displayGoodsImagesLayer").length){
		$(document).click();
		//$("#displayGoodsImagesLayer").stop(true,true).remove();
	}else{
		if(!$("#displayGoodsImagesLayer").length){
			$('body').append($("<div id='displayGoodsImagesLayer'></div>"));
		}
		//$(goodsDisplayImageWrapObj).after($("#displayGoodsImagesLayer"));

		$(goodsDisplayImageWrapObj).activity({segments: 12, width: 5.5, space: 6, length: 13, color: '#fff', speed: 1.5});

		$("#displayGoodsImagesLayer").stop(true,true).empty().hide().click(function(){return false;});

		$.ajax({
			'url' : '/goods/display_goods_images',
			'data' : {'goods_seq':goods_seq,'image_slide_type':image_slide_type},
			'global' : false,
			'success' : function(html){

				$(goodsDisplayImageWrapObj).activity(false);

				$("#displayGoodsImagesLayer").html(html);

				if(imageObj.offset().left+imageObj.width()+$("#displayGoodsImagesLayer").width() > $(window).width()){
					var left = $(window).width()-$("#displayGoodsImagesLayer").width();
				}else{
					var left = imageObj.offset().left+imageObj.width();
				}

				$("#displayGoodsImagesLayer").css({
					'position' : 'absolute',
					'z-index' : 1000,
					'top' : imageObj.offset().top,
					'left' : left
				}).fadeIn();

				$("#displayGoodsSendLayer").stop(true,true).remove();
				$(document).one('click',function(e){
					$("#displayGoodsImagesLayer").stop(true,true).remove();
				});

			}
		});

	}
	return false;
}

/* 상품 찜하기 버튼 클릭 */
function display_goods_zzim(btnObj,goods_seq,dozen){
	if(typeof gl_operation_type != 'undefined' && gl_operation_type == 'light'){
		display_goods_zzim_light(btnObj,goods_seq);
	}else{
		display_goods_zzim_heavy(btnObj,goods_seq,dozen);
	}
}

/* 상품 찜하기 버튼 클릭 heavy용 */
function display_goods_zzim_heavy(btnObj,goods_seq,dozen){
	window.event.cancelBubble = true;
	window.event.returnValue = false;

	var goodsDisplayItemWrap = $(btnObj).closest(".goodsDisplayItemWrap");

	$.ajax({
		'url' : '/mypage/wish_add_ajax_toggle',
		'data' : {'goods_seq':goods_seq},
		'dataType' : 'json',
		'global' : false,
		'success' : function(res){
			if(res.result == 'not_login'){
				parent.openDialogConfirm(getAlert("gv009"),400,140,function(){
					parent.location.replace(res.url);
				},function(){});
			} else if(res.result == 'add'){
				parent.openDialogConfirm(getAlert('mp089'),400,140,function(){
					parent.location.replace('/mypage/wish');
				},function(){
					if(dozen && $(btnObj).prop('class')){
						goodsDisplayItemWrap = $('.'+$(btnObj).prop('class'));
						$(goodsDisplayItemWrap).find(".zzimOnImg").show();
						$(goodsDisplayItemWrap).find(".zzimOffImg").hide();
					}else{
						$(goodsDisplayItemWrap).closest('.goodsDisplayItemWrap').find(".zzimOnImg").show();
						$(goodsDisplayItemWrap).closest('.goodsDisplayItemWrap').find(".zzimOffImg").hide();
					}
					$(goodsDisplayItemWrap).closest('.goodsDisplayItemWrap').find('.display_zzim').attr('act','stay');
					cnt = res.cnt > 9999 ? '9,999+' : comma(res.cnt);
					if	($(goodsDisplayItemWrap).find('.goods_list_goods_zzim_count').length > 0) {
						$(goodsDisplayItemWrap).find('.goods_list_goods_zzim_count').html(cnt);
						bak_src = $(goodsDisplayItemWrap).find('.goods_list_goods_zzim_img').attr("src");
						bak_src = bak_src.replace(/icon_zzim_off/g,'icon_zzim_on');
						$(goodsDisplayItemWrap).find('.goods_list_goods_zzim_img').attr("src",bak_src+"#" + Math.random());
					}
				});
                // 채널톡 위시리스트 이벤트
				if (typeof ChannelIO != 'undefined') {
					channeltalk_wish_in(goods_seq,'display_goods_zzim_heavy',goodsDisplayItemWrap);
				}
			} else if(res.result == 'del'){
				if(dozen && $(btnObj).prop('class')){
					goodsDisplayItemWrap = $('.'+$(btnObj).prop('class'));
					$(goodsDisplayItemWrap).find(".zzimOffImg").show();
					$(goodsDisplayItemWrap).find(".zzimOnImg").hide();
				}else{
					$(goodsDisplayItemWrap).closest('.goodsDisplayItemWrap').find(".zzimOffImg").show();
					$(goodsDisplayItemWrap).closest('.goodsDisplayItemWrap').find(".zzimOnImg").hide();
				}
				act = $(goodsDisplayItemWrap).closest('.goodsDisplayItemWrap').find('.goodsDisplayBottomFunc div:eq(0)').attr('act') == 'hover' ? 'hover' : '';
				$(goodsDisplayItemWrap).closest('.goodsDisplayItemWrap').find('.display_zzim').attr('act',act);
				cnt = res.cnt > 9999 ? '9,999+' : comma(res.cnt);
				if	($(goodsDisplayItemWrap).find('.goods_list_goods_zzim_count').length > 0) {
					$(goodsDisplayItemWrap).find('.goods_list_goods_zzim_count').html(cnt);
					bak_src = $(goodsDisplayItemWrap).find('.goods_list_goods_zzim_img').attr("src");
					bak_src = bak_src.replace(/icon_zzim_on/g,'icon_zzim_off');
					$(goodsDisplayItemWrap).find('.goods_list_goods_zzim_img').attr("src",bak_src+"#" + Math.random());
				}
				openDialogAlert(getAlert("gv057"),300,150,function(){});
			}
		}
	});
}

/* 상품 찜하기 버튼 클릭 Light 형 */
function display_goods_zzim_light(btnObj,goods_seq){
	window.event.cancelBubble = true;
	window.event.returnValue = false;

	$.ajax({
		'url' : '/mypage/wish_add_ajax_toggle',
		'data' : {'goods_seq':goods_seq},
		'dataType' : 'json',
		'global' : false,
		'success' : function(res){
			if(res.result == 'not_login'){
				parent.openDialogConfirm(getAlert("gv009"),400,140,function(){
					parent.location.replace(res.url);
				},function(){});
			} else if(res.result == 'add'){
				$(btnObj).find('.zzimImage.normal').addClass('hide');
				$(btnObj).find('.zzimImage.active').removeClass('hide');
				parent.openDialogConfirm(getAlert('mp089'),400,140,function(){
					parent.location.replace('/mypage/wish');
				},function(){});

                // 채널톡 위시리스트 이벤트
				if (typeof ChannelIO != 'undefined') {
                    channeltalk_wish_in(goods_seq);
				}
			} else if(res.result == 'del'){
				$(btnObj).find('.zzimImage.normal').removeClass('hide');
				$(btnObj).find('.zzimImage.active').addClass('hide');
				openDialogAlert(getAlert("gv057"),300,150,function(){});
			}
		}
	});
}

var quickviewScrollY = 0;
var $detachedOptionBlock = null;
var $detachedOptionBlockPlaceholder = null;

function displayAddToCartQuickview(btn, goodsSeq, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    if (!goodsSeq) return false;

    var $existingOptionBlock = $('#select_option_lay');
    if ($existingOptionBlock.length && !$detachedOptionBlock) {
        $detachedOptionBlockPlaceholder = $('<span style="display:none" class="qv-option-block-placeholder"></span>');
        $existingOptionBlock.before($detachedOptionBlockPlaceholder);
        $detachedOptionBlock = $existingOptionBlock.detach();
    }

    var $modal = $('#quickviewModal');
    if ($modal.length === 0) {
        $modal = $(
            '<div id="quickviewModal" class="qv-modal">' +
                '<div class="qv-modal-dim"></div>' +
                '<div class="qv-modal-panel">' +
                    '<button type="button" class="qv-modal-close" aria-label="Close">' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
                            '<line x1="18" y1="6" x2="6" y2="18"></line>' +
                            '<line x1="6" y1="6" x2="18" y2="18"></line>' +
                        '</svg>' +
                    '</button>' +
                    '<div class="qv-modal-scroll">' +
                        '<div id="quickviewBody"></div>' +
                    '</div>' +
                '</div>' +
            '</div>'
        ).appendTo('body');
        $modal.on('click', '.qv-modal-dim, .qv-modal-close', closeQuickviewModal);
        $(document).on('keydown.qvModal', function (e) {
            if (e.key === 'Escape') closeQuickviewModal();
        });
    }
    var $body = $('#quickviewBody').empty();
    quickviewScrollY = window.scrollY;
    $modal.addClass('is-open').css('display', '');
    $.get('/goods/quickview', { no: goodsSeq })
        .done(function (html) {
           $body.html(html);
        })
        .fail(function () {
            $body.html('<p class="qv-error">Failed to load product.</p>');
        });
    return false;
}

/* 상품 퀵뷰 버튼 클릭 */
function display_goods_quickview(btnObj,goods_seq){

	if(!goods_seq) return;

	event.cancelBubble = true;
	event.returnValue = false;

	var basicWidth = 900;
	$.ajax({
		'url' : '/common/arrLayoutBasic',
		'dataType' : 'json',
		'async' : false,
		'success' : function(res){
			basicWidth = num(res.basic.width);
			if( res.basic.width_sign != 'px' ) basicWidth = 900;
		}
	});

	if($("#goodsQuickViewLayer").length){
		$("<div id='goodsQuickViewLayer'></div>").remove();
	}

	var html = "<div class='goodsPopupLayer' id='goodsQuickViewLayer'>";
	html += "<div class='goodsPopupLayerTitle'>"+getAlert("et405")+"</div>";
	html += "<div class='goodsPopupLayerClose'></div>";
	html += "<div class='goodsPopupLayerBody'>";
	html += "<div class='goodsPopupLayerBtnWrap'><a href='/goods/view?no="+goods_seq+"'><span class='goodsPopupLayerMoreBtn'></span></a></div>";
	html += "</div>";
	html += "</div>";

	$(html).hide().appendTo('body');

	$("#goodsQuickViewLayer").css({
		'top' : $(document).scrollTop()+20,
		'left' : '50%',
		'margin-left' : (basicWidth+48)/2*-1,
		'width' : basicWidth,
		'height' : $(window).height()-40
	}).show();

	$("#goodsQuickViewLayer .goodsPopupLayerClose").click(function(){
		$("#goodsQuickViewLayer").remove();
	});
	$("<iframe frameborder='0'></iframe>").prependTo($("#goodsQuickViewLayer .goodsPopupLayerBody")).css({
		'margin-top' : '10px',
		'width' : '100%',
		'height' : $(window).height()-200
	}).attr("src","/goods/view?no="+goods_seq+"&quickview=1");

}

/* 상품 보내기 버튼 클릭 */
function display_goods_send(btnObj,location,goods_seq, goods_name){
	if(typeof gl_operation_type != 'undefined' && gl_operation_type == 'light'){
		return display_goods_send_light(btnObj,location,goods_seq, goods_name);
	}else{
		return display_goods_send_heavy(btnObj,location);
	}
}

/* 상품 공유하기 버튼 클릭 heavy 용 */
function display_goods_send_heavy(btnObj,location){
	event.cancelBubble = true;
	event.returnValue = false;

	var goodsDisplayImageWrapObj = $(btnObj).closest(".goodsDisplayItemWrap").find(".goodsDisplayImageWrap");
	var displaystyle = $(btnObj).closest('.designDisplay').attr('displaystyle');
	var goodsInfo = $(goodsDisplayImageWrapObj).data("goodsInfo");
	var imageObj = $(goodsDisplayImageWrapObj).find("img:eq(0)");

	if($("#displayGoodsSendLayer").length){
		$(document).click();
	}else{
		if(!$("#displayGoodsSendLayer").length){
			if(displaystyle != 'rolling_h')
				goodsDisplayImageWrapObj.after($("<div id='displayGoodsSendLayer'></div>"));
			else
				goodsDisplayImageWrapObj.append($("<div id='displayGoodsSendLayer'></div>"));
		}
		goodsDisplayImageWrapObj.after($("#displayGoodsSendLayer"));

		$(goodsDisplayImageWrapObj).activity({segments: 12, width: 5.5, space: 6, length: 13, color: '#fff', speed: 1.5});

		$("#displayGoodsSendLayer").css({
			'border':'1px solid #e1e1e1',
			'padding':'2px 0px 2px 3px',
			'background-color':'#fff',
			'white-space':'nowrap',
			'min-width':'70px'
		}).stop(true,true).empty().hide().click(function(){return false;});

		$.ajax({
			'url' : '/common/snslinkurl_tag',
			'data' : {'no':goodsInfo.goods_seq,'goods_name':goodsInfo.goods_name},
			'global' : false,
			'success' : function(html){

				$(goodsDisplayImageWrapObj).activity(false);

				$("#displayGoodsSendLayer").html(html);

				if(imageObj.offset().left+imageObj.width()+$("#displayGoodsSendLayer").outerWidth() > $(window).width()){
					var left = $("#displayGoodsSendLayer").outerWidth() * -1;
				}else{
					var left = goodsDisplayImageWrapObj.position().left+imageObj.width();
				}

				if(location=='top'){
					var top = imageObj.position().top;
				}else{
					var goodsDisplayItemWrapObj = goodsDisplayImageWrapObj.closest('.goodsDisplayItemWrap');
					var top = imageObj.position().top+imageObj.height()+$(".goodsDisplayQuickShopping",goodsDisplayItemWrapObj).height()-$("#displayGoodsSendLayer").outerHeight();
				}

				$("#displayGoodsSendLayer").css({
					'position' : 'absolute',
					'z-index' : 1000,
					'top' : top,
					'right' : 0
				}).fadeIn();

				$("#displayGoodsImagesLayer").stop(true,true).remove();
				$(document).one('click',function(e){
					$("#displayGoodsSendLayer").stop(true,true).remove();
				});

			}
		});

	}
	return false;
}

/* 상품 공유하기 버튼 클릭 light 용 */
function display_goods_send_light(btnObj, location, goods_seq, goods_name){

	event.cancelBubble = true;
	event.returnValue = false;

	var goodsDisplayImageWrapObj = $(btnObj).closest(".goodsDisplayImageWrap");
	var displaystyle = $(btnObj).closest('.designDisplay').attr('displaystyle');
	var imageObj = $(goodsDisplayImageWrapObj).find("img:eq(0)");

	if($("#displayGoodsSendLayer").length){
		$(document).click();
	}else{
		if(!$("#displayGoodsSendLayer").length){
			if(displaystyle != 'rolling_h')
				goodsDisplayImageWrapObj.after($("<div id='displayGoodsSendLayer'></div>"));
			else
				goodsDisplayImageWrapObj.append($("<div id='displayGoodsSendLayer'></div>"));
		}
		goodsDisplayImageWrapObj.after($("#displayGoodsSendLayer"));

		$(goodsDisplayImageWrapObj).activity({segments: 12, width: 5.5, space: 6, length: 13, color: '#fff', speed: 1.5});

		$("#displayGoodsSendLayer").css({
			'border':'1px solid #e1e1e1',
			'padding':'2px 0px 2px 3px',
			'background-color':'#fff',
			'white-space':'nowrap',
			'min-width':'70px'
		}).stop(true,true).empty().hide().click(function(){return false;});

		$.ajax({
			'url' : '/common/snslinkurl_tag',
			'data' : {'no': goods_seq,'goods_name': goods_name},
			'global' : false,
			'success' : function(html){

				$(goodsDisplayImageWrapObj).activity(false);

				$("#displayGoodsSendLayer").html(html);

				if(imageObj.offset().left+imageObj.width()+$("#displayGoodsSendLayer").outerWidth() > $(window).width()){
					var left = $("#displayGoodsSendLayer").outerWidth() * -1;
				}else{
					var left = goodsDisplayImageWrapObj.position().left+imageObj.width();
				}

				if(location=='top'){
					var top = imageObj.position().top;
				}else{
					var goodsDisplayItemWrapObj = goodsDisplayImageWrapObj.closest('.goodsDisplayItemWrap');
					var top = imageObj.height();
				}

				$("#displayGoodsSendLayer").css({
					'position' : 'absolute',
					'z-index' : 1000,
					'top' : top,
					'right' : 0
				}).fadeIn();

				$("#displayGoodsImagesLayer").stop(true,true).remove();
				$(document).one('click',function(e){
					$("#displayGoodsSendLayer").stop(true,true).remove();
				});

			}
		});

	}
	return false;
}

// 자동노출조건 설명(해비스킨일 떄 관련상품, 판매자 인기상품)
function setCriteriaDescription(){

	$(".displayTabGoodsContainer, .relationGoodsContainer, .relationSellerGoodsContainer").each(function(){
		var descriptions = new Array();

		criteria = $(".displayCriteria",this).val().split(",");
		if(criteria=="") return;
		for(var i=0;i<criteria.length;i++){
			var div = criteria[i].split("=");

			if(div[1]){
				var name = "";
				var value = decodeURIComponent(div[1]);
				switch(div[0]){
					case "selectGoodsName": name = "검색어"; break;
					case "selectGoodsView": name = "상품노출"; break;
					case "selectGoodsStatus": name = "상품상태"; break;
					case "selectCategory1": name = "카테고리1"; break;
					case "selectCategory2": name = "카테고리2"; break;
					case "selectCategory3": name = "카테고리3"; break;
					case "selectCategory4": name = "카테고리4"; break;
					case "selectBrand1": name = "브랜드1"; break;
					case "selectBrand2": name = "브랜드2"; break;
					case "selectBrand3": name = "브랜드3"; break;
					case "selectBrand4": name = "브랜드4"; break;
					case "selectLocation1": name = "지역1"; break;
					case "selectLocation2": name = "지역2"; break;
					case "selectLocation3": name = "지역3"; break;
					case "selectLocation4": name = "지역4"; break;
					case "selectStartPrice": name = "최소가격"; value = get_currency_price(value,2,'basic'); break;
					case "selectEndPrice": name = "최대가격"; value = get_currency_price(value,2,'basic'); break;
					case "auto_order": name = "자동노출기준"; break;
					case "auto_term_type": name = "자동노출 정렬 기준일"; break;
					case "auto_term": name = "자동노출 최근n일"; break;
					case "auto_start_date": name = "자동노출 시작일"; break;
					case "auto_end_date": name = "자동노출 종료일"; break;
					case "selectEvent": name = "이벤트고유번호"; break;
					case "selectEventBenefits": name = "이벤트혜택고유번호"; break;
					case "selectGoodsRelationCategory": name = "해당 카테고리"; value=""; break;
					case "selectGoodsRelationBrand": name = "해당 브랜드"; value=""; break;
					case "selectGoodsRelationLocation": name = "해당 지역"; value=""; break;
					/*
					default:
						name = div[0];
					break;
					*/
				}

				switch(div[1]){
					case "look": value = "노출"; break;
					case "notLook": value = "미노출"; break;
					case "normal": value = "정상"; break;
					case "runout": value = "미노출"; break;
					case "purchasing": value = "재고확보중"; break;
					case "unsold": value = "판매중지"; break;
					case "relative": value = "최근"; break;
					case "absolute": value = "고정"; break;
					case "newly": value = "최근등록순"; break;
					case "deposit": value = "판매인기순(구매갯수)"; break;
					case "deposit_price": value = "판매인기순(구매금액)"; break;
					case "review": value = "상품후기많은순"; break;
					case "view": value = "상품조회많은순"; break;
					case "cart": value = "장바구니"; break;
					case "wish": value = "위시리스트"; break;
				}

				if(div[2]) value = div[2];

				if(name) descriptions.push(name+(value ? "→"+value : ''));
			}
		}

		if(descriptions && descriptions.length){
			$(".displayCriteriaDesc",this).html("<b>[조건]</b> "+descriptions.join(", "));
		}else{
			$(".displayCriteriaDesc",this).html("");
		}
	});

}

// 개선된 자동노출조건 개별 상세 설명
function setCriteriaDescription_upgrade(pmode, load, goodsSeq){
	var target = 'body';
	if(typeof batchModify == 'undefined') {
		batchModify = false;
	}

	if(batchModify === true && load !== true) target='.batch_table';

	if(pmode == "batchlist"){
		target = ".goods"+goodsSeq;
	}
	$(".displayTabGoodsContainer, .relationGoodsContainer, .relationSellerGoodsContainer, .bigdataTextContainer, .relationGoodsContainerBatch, .relationSellerGoodsAutoContainer", target).each(function(){
		type			= $(this).find('.displayCriteriaType').attr('auto_type');
		subDisplayKind	= $(this).find('.displayCriteriaType').attr('kind');

		if	(pmode != "setting" && (type == 'auto' || type == 'AUTO')){
			var descriptions = new Array();
			criteria		= $(".displayCriteria",this).val();
			isBigdataTest	= $(".isBigdataTest",this).val();
			no				= $(".displayCriteria",this).attr('goods_seq');
			batchFlag		= $(this).hasClass('relationGoodsContainerBatch');
			bigdataFlag		= isBigdataTest == 1 ? true : false;
			displayKind		= $('.display_kind').val() != undefined ? $('.display_kind').val() : subDisplayKind;
			
			if(gl_operation_type != 'light'){
				if(typeof gl_adminSessionType  == "undefined") var gl_adminSessionType  = "";
				var title_arr		= setCriteriaDescription_bigdataTitle(type,gl_adminSessionType);
			}
			
			var displayLayout = 'full';
			if($(".displayLayout", this).length>0) {
				displayLayout = $(".displayLayout", this).val();
			}

			if(criteria.indexOf('∀') > -1){
				div = criteria.split('Φ');
				total_len = div.length;
				i = 0;
				
				$.each(div,function(k,v){
					detail 			= v.split('∀');
					condition_arr 	= setAutoCondition(detail[1].split(','),detail[0],displayKind);
					condition_str 	= condition_arr[0];
					rate 			= img = '';

					condition = detail[0];
					criteria_str = v;
					
					if(!bigdataFlag){
						rate = '<div><strong>['+(++i)+'순위]</strong></div>';
//						img = '<td width="50px" height="60px"><img src="/admin/skin/default/images/design/display/icon_relation_customer.png" /></td>';
						if(batchFlag || (typeof pinfo_seq != 'undefined') ){
							descriptions.push('<table width="100%"><col /><tr><td>'+rate+condition_str+'</td></tr></table>');
						}else{
//							descriptions.push('<table width="100%"><col width="100px"/><col /><col width="100px"/><tr>'+img+'<td>'+rate+condition_str+'</td><td><span class="btn small"><button  type="button" onclick="bigdata_test_show(\''+condition+'\',\''+criteria_str+'\',\''+no+'\');">결과테스트</button></span></td></tr></table>');
							descriptions.push('<table width="100%"><tr><td>'+rate+condition_str+'</td><td><span class="btn small"><button  type="button" onclick="bigdata_test_show(\''+condition+'\',\''+criteria_str+'\',\''+no+'\');">결과테스트</button></span></td></tr></table>');
						}
					}else{
						if(pmode == "goodsview" || pmode == 'batchlist'){
							$(".displayCriteria",this).find(".nothing").closest("tr").remove();
							
							if(gl_operation_type == 'light'){
								descriptions.push('<tr><td class="left">'+condition_str+'</td></tr>');
							}else{

								if(typeof title_arr != "undefined" && typeof title_arr[condition] != "undefined"){
								var title = title_arr[condition];
								}else{
									var title = "";
								}
								descriptions.push('<tr>');
								descriptions.push('<td class="center">'+(k+1)+'</td>');
								descriptions.push('<td class="left">'+title+'</td>');
								descriptions.push('</tr>');
							}
							if(displayLayout == "summary") {
								descriptions = new Array();
								descriptions.push("설정됨");
							}
							
						}else{
							descriptions.push('<table><tr><td>'+condition_str+'</td></tr></table>');
						}
					}

					if(i > 0 && i < total_len) descriptions.push('<div style="width:98%;border-top:1px solid #dadada;margin-top:5px;margin-bottom:5px;"></div>');

				});

				if(descriptions && descriptions.length){
					$(".displayCriteriaDesc",this).html(descriptions.join(''));
				}else if(pmode == "goodsview" || pmode == "batchlist"){
					$(".displayCriteriaDesc .nothing", this).html("설정된 조건이 없습니다.");
				}else{
					$(".displayCriteriaDesc",this).html("설정된 조건이 없습니다. 설정하세요.");

				}
			}else{
				if(!criteria){
					if(pmode == "goodsview" || pmode == "batchlist"){
						$(".displayCriteriaDesc .nothing", this).html("설정된 조건이 없습니다.");
					}else{
						$(".displayCriteriaDesc",this).html("설정된 조건이 없습니다. 설정하세요.");
					}
				}
			}
		}
	});
}
var bigdataTitle = new Array();
function setCriteriaDescription_bigdataTitle(displayKind,gl_adminSessionType){

	if(typeof gl_adminSessionType  == "undefined") var gl_adminSessionType  = "";
	var url = '/admin/goods/select_auto_condition_title';
	if(gl_adminSessionType == "provider"){
		url = '/selleradmin/goods/select_auto_condition_title';
	}

	if(typeof bigdataTitle[displayKind] == "undefined") {
		var params 			= {'displayKind':displayKind,'mode':'json'};
		$.ajax({
			'url' : url,
			'data' : params,
			'dataType' 	: 'json',
			'global' 	: false,
			'async'		:false,
			'success' : function(res){
				bigdataTitle[displayKind] = res;
			},
			'fail'	: function(e){
			}
		});
	}

	return bigdataTitle[displayKind];
}

function setCriteriaDescription_bigdata(pkind, load){

	var target = 'body';
	if(typeof batchModify == 'undefined') {
		batchModify = false;
	}
	if(batchModify === true && load !== true) target='.batch_table';

	$(".displayTabGoodsContainer, .bigdataGoodsContainer, .bigdataGoodsContainerBatch, .relationGoodsContainer, .relationGoodsContainerBatch, .bigdataGoodsAutoContainer, .relationSellerGoodsAutoContainer", target).each(function(){
		type = $(this).find('.displayCriteriaType').attr('auto_type');

		if(typeof type == "undefined") type = "";
		if	(type == 'bigdata' || type == 'auto_sub'){
			var descriptions 	= new Array();
			var isAutoSub 		= false;
			var batchFlag 		= false;
			batchFlag 			= $(this).hasClass('relationGoodsContainerBatch');
			
			if(typeof gl_adminSessionType  == "undefined") var gl_adminSessionType  = "";
			var title_arr		= setCriteriaDescription_bigdataTitle(type,gl_adminSessionType);

			if	(!batchFlag)
				batchFlag = $(this).hasClass('bigdataGoodsContainerBatch');

			if	(type == 'auto_sub'){
				criteria = $(".displayCriteria",this).val();
				no = $(".displayCriteria",this).attr('goods_seq');
				isAutoSub = true;
			}else{
				criteria = $(".displayCriteriaBigdata", this).val();
				no = $(".displayCriteriaBigdata", this).attr('goods_seq');
			}

			var displayLayout = 'full';
			if($(".displayLayout", this).length>0) {
				displayLayout = $(".displayLayout", this).val();
			}

			if(criteria.indexOf('∀') > -1){
				div = criteria.split('Φ');
				i = 1;
				if(pkind == 'catalog'){

					descriptions.push('<table class="table_basic v7">');
					descriptions.push('<col width="100"/><col/><col width="100"/>');
					$.each(div,function(k,v){
						detail 				= v.split('∀');
						condition_arr 		= setAutoCondition(detail[1].split(','),detail[0],'bigdata');
						condition_str 		= condition_arr[0];
						//condition_title 	= condition_arr[1] ? condition_arr[1] : '';

						condition 			= detail[0];
						criteria_str 		= v;
						title 				= title_arr[condition];

						descriptions.push('<tr>');
						descriptions.push('<td class="center">'+i+'</td>');
						descriptions.push('<td class="left">'+title+'</td>');
						descriptions.push('</tr>');
						i++;
					});
					descriptions.push('</table>');
				}else if(pkind == 'goodsview'){
					$.each(div,function(k,v){

						var title 		= "";
						detail 			= v.split('∀');
						condition_arr 	= setAutoCondition(detail[1].split(','),detail[0],'bigdata');
						condition_str 	= condition_arr[0];
						condition_title = condition_arr[1] ? condition_arr[1] : '';

						condition 		= detail[0];
						criteria_str 	= v;
						title 			= title_arr[condition];
						
						descriptions.push('<tr>');
						descriptions.push('<td class="center">'+i);
						descriptions.push('<span class="condition'+i+' hide">'+condition+'</span>');
						descriptions.push('<span class="criteria_str'+i+' hide">'+criteria_str+'</span>');
						descriptions.push('</td>');
						descriptions.push('<td class="left">'+title+'</td>');
						if(displayLayout == "full") {
							descriptions.push('<td class="center">');
							descriptions.push('<button type="button" class="resp_btn" onClick="open_bigdata_quide()">자세히</button>');
							descriptions.push('<div class="condition_str hide">'+condition_str+'</div>');
							descriptions.push('</td>');
							descriptions.push('<td class="center"><button  type="button" class="resp_btn" onclick="bigdata_test_show(\'bigdata_'+condition+'\',\''+criteria_str+'\',\''+no+'\');">테스트</button></td>');
						} else if(displayLayout=="list") {
							descriptions.push('<td class="center">');
							descriptions.push('<button type="button" class="resp_btn" onClick="open_bigdata_quide()">자세히</button>');
							descriptions.push('<div class="condition_str hide">'+condition_str+'</div>');
							descriptions.push('</td>');
						}
						descriptions.push('</tr>');

						if( displayLayout == "summary") {
							descriptions 	= new Array();
							descriptions.push('설정됨');
						}
						i++;
					});
				}else{
					total_len = div.length;
					that = this;
					$.each(div,function(k,v){
						rate	= '<div><strong>['+(i)+'순위]</strong></div>';
						rate	= rate+'<div>추천상품 노출 페이지별 ‘○○○고객이 보고 있는 상품’ 기준 <span class="hand" style="color:#f63 !important;" onclick="open_bigdata_quide()">자세히 ></span></div>';
						detail	= v.split('∀');

						if	(detail[0] == 'admin'){
							if	(total_len != 1) return;
							
							nodata = "<div class='left'>설정된 조건이 없습니다. 설정하세요.</div>";
							$(".displayCriteriaDesc",that).html(nodata);
							return;
						}
						condition_arr = setAutoCondition(detail[1].split(','),detail[0],'bigdata');
						condition_str = condition_arr[0];
						condition_title = condition_arr[1];

						condition = detail[0];
						criteria_str = v;

//						img = '<td width="50px" height="60px"><img src="/admin/skin/default/images/design/display/icon_relation_customer.png" /></td>';
						
						if(batchFlag){
							descriptions.push('<table width="100%"><col /><tr><td style="border-bottom:none;">'+rate+condition_str+'</td></tr></table>');
						}else{
//							descriptions.push('<table width="100%"><col width="100px"/><col /><col width="100px"/><tr>'+img+'<td>'+rate+condition_str+'</td><td><span class="btn small"><button  type="button" onclick="bigdata_test_show(\'bigdata_'+condition+'\',\''+criteria_str+'\',\''+no+'\');">결과테스트</button></span></td></tr></table>');
							descriptions.push('<table width="100%"><tr><td>'+rate+condition_str+'</td><td><button  type="button" onclick="bigdata_test_show(\'bigdata_'+condition+'\',\''+criteria_str+'\',\''+no+'\');">결과테스트</button></td></tr></table>');
						}
						
						if(i > 0 && i < total_len) descriptions.push('<div style="width:98%;border-top:1px solid #dadada;margin-top:5px;margin-bottom:5px;"></div>');

						i++;
					});
				}

				if(descriptions && descriptions.length){
					if	(isAutoSub){
						$(".displayCriteriaDesc",this).html(descriptions.join(''));
					}else{
						$(".displayCriteriaBigdataDesc", this).html(descriptions.join(''));
					}
				}
			}else{
				if	(pkind == 'catalog')
					nodata = "<div class='center'>추천상품 전용페이지가 설정되지 않았습니다. 설정하세요.</div>";
				else if(pkind == 'goodsview')
					nodata = "설정된 조건이 없습니다.";
				else
					nodata = "<div class='left'>설정된 조건이 없습니다. 설정하세요.</div>";

				if	(isAutoSub){
					$(".displayCriteriaDesc",this).html(nodata);
				}else{
					if(typeof $(".displayCriteriaBigdataDesc .nothing", this) != "undefined"){
						$(".displayCriteriaBigdataDesc .nothing", this).html(nodata);
					}else{
						$(".displayCriteriaBigdataDesc", this).html(nodata);
					}
				}
			}
		}
	});
}

function bigdata_test_show(condition,criteria,goods_seq,design){
	var html = '';
	$.ajax({
		type: "post",
		url: "../bigdata/get_goods",
		data: {'goods_seq':goods_seq,'condition':condition,'displayCriteria':criteria},
		dataType: 'json',
		success: function(result){
			height = 580;
			if(design == 'tab') height = 620;
			openDialog('결과테스트','bigdata_test',  {"width":"700", "height":height,"show" : "fade","hide" : "fade"});
			if	(result.record.length > 0){
				$.each(result.record,function(){
					html += '<tr>';
					if(window.Firstmall.Config.Environment.serviceLimit.H_AD) {
						html += '<td class="center">'+this.provider_name+'</td>';
					}
					html += '<td class="left">';
					html += '<div class="image fl"><img src="'+this.jsimage+'" style="width:50px;height:50px"></div>';
					html += '<div class="fl">';
					if(this.goods_code) {
						html += '<div>[상품코드:'+this.goods_code+']</div>';
					}
					html += '	<div class="goodsname">';
					html += '	['+this.goods_seq+'] '+this.jsgoods_name;
					html += '	</div>';
					html += '</div>';
					html += '</td>';
					html += '<td class="right">'+this.jsprice+'</td>';
					html += '</tr>';
				});				
			}else{
				html += '<tr>';
				if(window.Firstmall.Config.Environment.serviceLimit.H_AD) {
					html += '<td colspan="3" class="center" style="border-bottom:0px;border-left:0px;" height="300">';
				} else {
					html += '<td colspan="2" class="center" style="border-bottom:0px;border-left:0px;" height="300">';
				}
				html += '조건에 따른 빅데이터 결과 상품이 없습니다.</td>';
				html += '</tr>';
			}
			$("#bigdata_test > .content > .goods_list > .table_basic > tbody").html(html);
		}
	});
}

function setAutoCondition(criteria,kind,displayKind){
	// isFirst 인 경우 블락
	if	(criteria == 'isFirst=1') return;

	// 변수 선언
	var arr				= new Array();
	var descriptions	= new Array();
	var admin_arr		= new Array();
	var same_arr		= new Array();
	var etc_arr			= new Array();
	var isRecently		= false;

	// 순위 항목 텍스트 정의
	var condition = {
		'admin':'지정한',
		'view':'본',
		'cart':'장바구니에 담은',
		'wish':'위시리스트에 찜한',
		'fblike':'좋아요한',
		'order':'구매한',
		'review':'리뷰를 쓴',
		'search':'검색한 결과 최상위',
		'restock':'재입고알림 요청한',
		'none':''
	};
	
	// 행동 항목 텍스트 정의
	var act = {
		'order_cnt'	:	'구매(횟수)량이 높은',
		'order_ea'	:	'구매(수량)량이 높은',
		'cart'		:	'많이 장바구니에 담음',
		'wish'		:	'많이 위시리스트에 찜한',
		'view'		:	'많이 본',
		'review'	:	'상품후기가 많이 작성된',
		'review_sum':	'베스트 상품 후기가 많은 상품',
		'fblike'	:	'‘좋아요’가 많은 상품',
		'recently'	:	'최근에 등록한 상품'
	};

	// 자동 조건 displayKind 텍스트 정의
	var kind_standard = {
		'relation'					: '상품과',
		'relation_seller'			: '상품과',
		'category'					: '카테고리',
		'brand'						: '브랜드',
		'location'					: '지역',
		'mshop'						: '판매자' 
	};

	// 초기 데이터 세팅
	for	(var i=0;i<criteria.length;i++){
		var div = criteria[i].split("=");
		if	(!arr[div[0]]) arr[div[0]] = new Array();

		if	(div[0].indexOf('each_age_') > -1){
			if	(!arr['each_age']) arr['each_age'] = new Array();
			arr['each_age'].push(div[1]+'대');
		}else if(div[0].indexOf('each_sex_') > -1){
			if	(!arr['each_sex']) arr['each_sex'] = new Array();
			sex = '성별 모름';
			if	(div[1] == 'male'){
				sex = '남성'
			}else if(div[1] == 'female'){
				sex = '여성';
			}
			arr['each_sex'].push(sex);
		}else if(div[0].indexOf('each_agent_') > -1){
			if	(!arr['each_agent']) arr['each_agent'] = new Array();
			arr['each_agent'].push(div[1]);
		}else{
			if	(div[0] == 'act'){
				if	(!arr['act']) arr['act'] = new Array();

				if	((displayKind == 'bigdata' || displayKind == 'bigdata_catalog') && div[1] == 'recently'){
					div[1] = 'order_cnt';
				}
				if	(div[1] == 'recently'){
					isRecently = true;
				}

				arr['act']  = div[1];
			}else{
				arr[div[0]] = div[2] ? div[2] : decodeURIComponent(div[1]);
			}
		}
	}

	// ######################## 노출 기준 #############################
	// 기준 노출 설정
	var txt_standard = '';
	if(kind == 'none'){
		txt_standard += '해당 ' + kind_standard[displayKind];

	}else if(kind == 'admin'){
		txt_standard += '관리자가 지정한 기준';

	}else{
		txt_standard += '○○○고객이 최근 본 상품과';

	}

	descriptions.push(txt_standard);
	
	// 동일 항목 체크
	var txt_same	= '';
	if	(kind != 'admin' && (kind != 'none' || displayKind == 'relation' || displayKind == 'relation_seller')){
		if	(arr['same_category'])		txt_same += '동일한 카테고리 ';
		if	(arr['same_brand'])			txt_same += '동일한 브랜드 ';
		if	(arr['same_location'])		txt_same += '동일한 지역 ';
		if	(arr['same_seller'])		txt_same += '동일한 판매자 ';
	}
	descriptions.push(txt_same);
	
	if	(arr['selectCategory1'] || arr['selectCategory2'] || arr['selectCategory3'] || arr['selectCategory4']){
		cartegory_str = '';
		if	(arr['selectCategory1'])
			cartegory_str = arr['selectCategory1'];
		if	(arr['selectCategory2'])
			cartegory_str = arr['selectCategory2'];
		if	(arr['selectCategory3'])
			cartegory_str = arr['selectCategory3'];
		if	(arr['selectCategory4'])
			cartegory_str = arr['selectCategory4'];
		admin_arr.push(cartegory_str+' 카테고리');
	}

	if	(arr['selectBrand1'] || arr['selectBrand2'] || arr['selectBrand3'] || arr['selectBrand4']){
		brand_str = '';
		if	(arr['selectBrand1'])
			brand_str = arr['selectBrand1'];
		if	(arr['selectBrand2'])
			brand_str = arr['selectBrand2'];
		if	(arr['selectBrand3'])
			brand_str = arr['selectBrand3'];
		if	(arr['selectBrand4'])
			brand_str = arr['selectBrand4'];
		admin_arr.push(brand_str+' 브랜드');
	}

	if	(arr['selectLocation1'] || arr['selectLocation2'] || arr['selectLocation3'] || arr['selectLocation4']){
		location_str = '';
		if	(arr['selectLocation1'])
			location_str = arr['selectLocation1'];
		if	(arr['selectLocation2'])
			location_str = arr['selectLocation1'];
		if	(arr['selectLocation3'])
			location_str = arr['selectLocation1'];
		if	(arr['selectLocation4'])
			location_str = arr['selectLocation1'];
		admin_arr.push(location_str+' 지역');
	}

	if	(arr['provider'] == 'all'){
		admin_arr.push('전체 판매자');
	}else if(arr['provider'] == '1'){
		admin_arr.push('본사');
	}else if(arr['provider'] == 'seller'){
		admin_arr.push(arr['provider_name']+' 판매자');
	}

	if	(admin_arr.length > 0) descriptions.push(admin_arr.join(', '));

	descriptions.push('상품 중에서<br/>');
	
	// 빅데이터 설정인 경우
	if	(displayKind == 'bigdata' || displayKind == 'bigdata_catalog'){
		if (arr['bigdata_month'] == undefined) arr['bigdata_month'] = '1';
		descriptions.push('해당 상품을 최근 '+arr['bigdata_month']+'개월 안에 <font class="act_title" color="#ff0000">'+condition[kind]+'</font> 다른 고객이</font>');
	}else{
		if	(isRecently) descriptions.push('관리자가<br/>');
		else descriptions.push('다른 고객이<br/>');
	}
	// ######################## 노출 기준 #############################
	

	// ######################## 통계대상기간 #############################
	var txt_date_sub = arr['act'] != null && arr['act'] == 'review_sum' ? '누적 기간동안' : '최근 '+arr['month']+'개월 동안';
	descriptions.push(txt_date_sub);
	// ######################## 통계대상기간 #############################
	
	
	// ######################## 통계대상연령,성별,환경 #############################
	if	( gl_operation_type != 'light' && !isRecently){
		if	(arr['age'] == 'all'){
			etc_arr.push('전체 연령');
		}else if(arr['age'] == 'each'){
			if	(arr['each_age'] != undefined) etc_arr.push(arr['each_age']);
		}else{
			etc_arr.push('같은 연령');
		}

		if	(arr['sex'] == 'all'){
			etc_arr.push('전체 성별');
		}else if(arr['sex'] == 'each'){
			if	(arr['each_sex'] != undefined) etc_arr.push(arr['each_sex']+'이');
		}else{
			etc_arr.push('같은 성별');
		}

		if	(arr['agent'] == 'all'){
			etc_arr.push('전체 환경에서');
		}else if(arr['agent'] == 'each'){
			if	(arr['each_agent'] != undefined) etc_arr.push(arr['each_agent']+'환경에서');
		}else{
			etc_arr.push('같은 환경에서');
		}
		if	(etc_arr.length > 0) descriptions.push(etc_arr.join(', '));
	}
	descriptions.push('<br />');
	// ######################## 통계대상연령,성별,환경 #############################



	// ######################## 통계대상행동 #############################
	descriptions.push(act[arr['act']] + '<br />');
	// ######################## 통계대상행동 #############################
	


	descriptions.push('승인, 노출, 정상 상태의 상품이 최소 '+arr['min_ea']+'종 이상일 때 추천상품 노출');
	descriptions = descriptions.join(' ');

	return Array(descriptions,arr['display_title']);
}

// 개선된 자동노출조건 개별 상세 설명
function setAutoConditionDescription(displayKind){

	$("#goodsSelectorAuto tr").each(function(){
		var condition 	= $("input[name='condition[]']",this).val();
		var criteria 	= $("input[name='auto_condition[]']",this).val();

		if (criteria=='' || criteria == undefined) return;
		criteria = criteria.split(',');

		condition_arr = setAutoCondition(criteria,condition,displayKind);

		if (condition_arr){
			$(".condition_desc",this).html(condition_arr[0]);
			$(".condition_detail",this).show();
		}else{
			$(".condition_desc",this).html('');
			$(".condition_detail",this).hide();
		}
	});
}

// 우측하단 옵션보기
function display_goods_show_opt(obj,goods_seq){
	if(typeof gl_operation_type != 'undefined' && gl_operation_type == 'light'){
		display_goods_show_opt_light(obj,goods_seq);
	}else{
		display_goods_show_opt_heavy(obj,goods_seq);
	}
}

function display_goods_show_opt_light(obj,goods_seq){
	if ( $('.quick_opt_view').lenght > 0 ) {
		$('.quick_opt_view').remove();
	}

	event.cancelBubble	= true;
	event.returnValue	= false;

	opt_obj				= $(obj);
	parent_id			= opt_obj.closest('.designDisplay').prop('id');
	parent_img			= opt_obj.closest('.goodsDisplayImageWrap');
	quick_opt_id		= 'quick_opt_'+parent_id;
	opt_data			= $('.display_opt_bak',opt_obj).html();
	x_loc				= parent_img.offset().left;
	y_loc				= parent_img.offset().top+parent_img.height();

	if($(window).width()-x_loc < 400) x_loc = x_loc-(400-parent_img.width());

	opt_html = $('#'+quick_opt_id);

	if	($('body').find('#'+quick_opt_id).length == 0) {
		opt_html = $("<div>");
		opt_html.addClass('quick_opt_view').prop('id',quick_opt_id);
		html = [];
		x = -1;

		html[++x] = '<div class="quick_opt_view_wrap">';
		html[++x] = '<div class="quick_opt_view_close" onclick="quick_opt_view_close()">X</div>';
		html[++x] = '<div class="quick_option_title">'+getAlert('et403')+'</div>';		// 옵션 미리보기
		html[++x] = '<div class="quick_option_area"></div>';
		html[++x] = '</div>';
	}

	$('.quick_option_area', opt_html).html('');

	if	(!opt_data) {
		$.getJSON('/goods/get_goods_default_option?goods_seq='+goods_seq, function(data) {
			html = [];
			x = -1;
			html[++x] = '<ul>';
			$.each(data.result,function(){
				option_arr = new Array();
				if	(this.option_view == 'Y') {
					if	(this.option1) option_arr.push(this.option1);
					if	(this.option2) option_arr.push(this.option2);
					if	(this.option3) option_arr.push(this.option3);
					if	(this.option4) option_arr.push(this.option4);
					if	(this.option_title != null)
						html[++x] = '<li>'+this.option_title+'-'+option_arr.join('/')+'</li>';
					else
						//옵션이 없는 상품입니다.
						html[++x] = '<li>'+getAlert('et404')+'</li>';
				}
			});
			html[++x] = '</ul>';
			$('.quick_option_area', opt_html).html(html.join(''));
			$('.display_opt_bak', opt_obj).html(html.join(''));
		}).complete(function() {
			parent_img.append(opt_html);
			$('.quick_opt_view').show();
		});
	}else{
		$('.quick_option_area', opt_html).html(opt_data);
	}

	opt_html.append(html.join(''));

	/*
	opt_html.bind('mouseenter',function(){
		parent_img.trigger('mouseenter');
	}).bind('mouseleave',function(){
		parent_img.trigger('mouseleave');
	});
	*/

	//$('.quick_opt_view').css({'left':x_loc,'top':y_loc,'display':'inline-block','z-index':9000});
	opt_obj.attr({'open':true});

}

/* 우측하단 옵션 미리보기 heavy 용 */
function display_goods_show_opt_heavy(obj,goods_seq){
	event.cancelBubble	= true;
	event.returnValue	= false;

	opt_obj				= $(obj);
	parent_id			= opt_obj.closest('.designDisplay').prop('id');
	parent_wrap			= opt_obj.closest('.goodsDisplayItemWrap');
	parent_img			= opt_obj.closest('.goodsDisplayImageWrap');
	quick_opt_id		= 'quick_opt_'+parent_id;
	opt_data			= $('.display_opt_bak',opt_obj).html();
	x_loc				= parent_wrap.offset().left;
	y_loc				= parent_img.offset().top+parent_img.height();

	if($(window).width()-x_loc < 400) x_loc = x_loc-(400-parent_wrap.width());

	opt_html = $('#'+quick_opt_id);

	if	($('body').find('#'+quick_opt_id).length == 0) {
		opt_html = $("<div>");
		opt_html.addClass('quick_opt_view').prop('id',quick_opt_id);
		html = [];
		x = -1;

		html[++x] = '<div class="quick_opt_view_wrap">';
		html[++x] = '<div class="quick_opt_view_close" onclick="quick_opt_view_close()">X</div>';
		html[++x] = '<div class="quick_option_title">'+getAlert('et403')+'</div>';
		html[++x] = '<div class="quick_option_area"></div>';
		html[++x] = '</div>';

		opt_html.append(html.join(''));
		$('body').append(opt_html);
		opt_html.bind('mouseenter',function(){
			parent_img.trigger('mouseenter');
		}).bind('mouseleave',function(){
			parent_img.trigger('mouseleave');
		});
	}

	$('.quick_option_area', opt_html).html('');

	if	(!opt_data) {
		$.getJSON('/goods/get_goods_default_option?goods_seq='+goods_seq, function(data) {
			html = [];
			x = -1;
			html[++x] = '<ul>';
			$.each(data.result,function(){
				option_arr = new Array();
				if	(this.option_view == 'Y') {
					if	(this.option1) option_arr.push(this.option1);
					if	(this.option2) option_arr.push(this.option2);
					if	(this.option3) option_arr.push(this.option3);
					if	(this.option4) option_arr.push(this.option4);
					if	(this.option_title != null)
						html[++x] = '<li>'+this.option_title+'-'+option_arr.join('/')+'</li>';
					else
						html[++x] = '<li>'+getAlert('et404')+'</li>';
				}
			});
			html[++x] = '</ul>';
			$('.quick_option_area', opt_html).html(html.join(''));
			$('.display_opt_bak', opt_obj).html(html.join(''));
		});
	}else{
		$('.quick_option_area', opt_html).html(opt_data);
	}

	$('.quick_opt_view').css({'left':x_loc,'top':y_loc,'display':'inline-block','z-index':9000});
	opt_obj.attr({'open':true});
}

function quick_opt_view_close(){
	opt_obj.attr({'open':false});
	$('.quick_opt_view').remove();
}

// 우측하단 옵션 오픈 여부
function chk_display_goods_show_opt(obj, flag){
	parent_id	= $(obj).closest('.designDisplay').prop('id');
	opt_obj		= $(obj).find('.display_option');
	isOpen		= opt_obj.attr('open');
	goods_seq	= opt_obj.attr('goods_seq');
	if	(opt_obj.length > 0) {
		if	(flag && isOpen)
			display_goods_show_opt(opt_obj,goods_seq);
		else
			$('.quick_opt_view').hide();
	}
}

//default_gl 기준 상단 flying 으로 인해 좌표값이 변경 되는 것에 대비
function display_goods_show_opt_fix(){
	$('.designDisplay .display_option[open="open"][act="hover"]').each(function(){
		goods_seq = $(this).attr('goods_seq');
		display_goods_show_opt($(this),goods_seq);
	});
}

function overay_set_open(name){
	if	(!$('.use_image_overay').is(':checked')) return;
	var parent					= $('#overay_setting_dialog');
	var that					= $('.'+name);
	var data					= [];
	var image_overay1			= $('.image_overay1').attr('before_value');
	var image_overay1_text		= $('.image_overay1_text').attr('before_value');
	var image_overay2			= $('.image_overay2').attr('before_value');
	var image_overay2_text		= $('.image_overay2_text').attr('before_value');

	$('.overay_set_on').removeClass('overay_set_on');
	that.addClass('overay_set_on');
	$(".colorpicker", parent).customColorPicker("destroy");
	$('#overay_main_setting input, #overay_main_setting select', parent).val('');
	$('.overay_container').html('');

	if	(name == 'image_overay_plus1') {
		if	((image_overay1 || image_overay1_text)) {
			if	(image_overay1_text)
				data[0] = {'key':'direct','overay_text':image_overay1_text};
			else
				data[0] = {'key':image_overay1};
		}
		main = $('.image_overay_plus1_main').val();
	}

	if	(name == 'image_overay_plus2') {
		if	(image_overay2 || image_overay2_text) {
			if	(image_overay2_text)
				data[0] = {'key':'direct','overay_text':image_overay2_text};
			else
				data[0] = {'key':image_overay2};
		}
		main = $('.image_overay_plus2_main').val();
	}


	if	(main.length > 0) {
		main = decode_base64_json(main);
		$.each(main,function(k, v){
			if	(v)	$("[name='"+k+"']",parent).val(v);
		});
	}

	if	(!$('input[name="overay_bg_color"]').val()) $('input[name="overay_bg_color"]').val('#000000');

	if	(that.val()) data = decode_base64_json(that.val());

	overay_add_func(data);

	$(".colorpicker", parent).customColorPicker();

	openDialog('이미지 위 정보 설정','#overay_setting_dialog', {'width':'1000','height':'520','show' : 'fade','hide' : 'fade'});
}

function overay_apply(){
	var overay_obj = $('#overay_setting_dialog');
	overay_percent_able();
	obj = $('.overay_container', overay_obj);
	items = obj.find('.overay_items');
	if(items.length > 3){
		alert('최대 3개까지 설정 가능합니다.');
	}else{
		var data = [];
		var main_data = {};
		var item_key_html = [];
		var idx = -1;

		$('.overay_main').each(function(){
			main_data[$(this).attr('name')] = $(this).val();
		});

		items.each(function(){
			var sub_data = {};
			sub_data.key = $(this).find('.overay_info_cell_type').val();
			item_key_html.push('<li>'+$(this).find('.overay_info_cell_type > option:selected').text()+'</li>');

			$(this).find('.opt_use').each(function(){
				if	($(this).hasClass('opt9')) {
					sub_data.overay_discount_per		= $('.overay_discount_per', $(this)).val();
					sub_data.overay_discount_bg_color	= $('.overay_discount_bg_color', $(this)).val();
					sub_data.overay_discount_position	= $('.overay_discount_position', $(this)).val();
					sub_data.overay_discount_per_color	= $('.overay_discount_per_color', $(this)).val();
					sub_data.overay_discount_opacity	= $('.overay_discount_opacity', $(this)).val();
				}else{
					if	($(this).prop('tagName') == 'INPUT' || $(this).prop('tagName') == 'SELECT')
						sub_data[$(this).attr('name')] = $(this).val();
					else
						sub_data[$(this).attr('name')] = $(this).hasClass('use');
				}
			});

			data[++idx] = sub_data;
		});

		decoration = Base64.encode(JSON.stringify(data));
		main_data = Base64.encode(JSON.stringify(main_data));
		overay_title = Base64.encode(item_key_html.join(''));

		$('.overay_set_on').val(decoration);
		$('.overay_set_on').closest('div').find('ul').html(item_key_html.join(''));

		//기존 기능 유지를 위한 값 초기화 시킴
		if	($('.overay_set_on').hasClass('image_overay_plus1')) {
			$('.image_overay1').val('');
			$('.image_overay1_text').val('');
			$('.image_overay_plus1_main').val(main_data);
			$('.image_overay_plus1_title').val(overay_title);
		}else{
			$('.image_overay2').val('');
			$('.image_overay2_text').val('');
			$('.image_overay_plus2_main').val(main_data);
			$('.image_overay_plus2_title').val(overay_title);
		}

		$('.use_image_overay').change();
		closeDialog('overay_setting_dialog');
	}
}

function decode_base64_json(json){
	var ret = '';
	if	(json) ret = JSON.parse(Base64.decode(json));
	return ret;
}

function overay_add_func(obj){
	var overay_obj = $('#overay_setting_dialog');
	var items = $('.overay_container', overay_obj).find('.overay_items');
	if	(items.length >= 3) {
		alert('최대 3개까지 설정 가능합니다.');
	}else{
		if	(obj) {
			$.each(obj, function(k, v){
				var overayContainer = overay_obj.find(".overay_info_bak");
				var new_info_item = $("div.overay_items",overayContainer).clone();

				$.each(v, function(item_key, item_val){
					if	(item_key != 'key') {
						item_obj = new_info_item.find('[name="'+item_key+'"]');
						if	(item_obj.prop('tagName') == 'INPUT' || item_obj.prop('tagName') == 'SELECT')
							item_obj.val(item_val);
						else
							if	(item_val == true) item_obj.addClass('use');
					}
				});

				new_info_item.find('.overay_info_cell_type').val(v.key).change();
				$('.overay_container').append(new_info_item);
			});
		}else{
			var overayContainer = overay_obj.find(".overay_info_bak");
			var new_info_item = $("div.overay_items",overayContainer).clone();

			if	($('input[name="image_overay_type"]:checked').val() == 'all') {
				new_info_item.find('.overay_info_cell_type>option[value="direct"]').remove();
				new_info_item.find('.overay_info_cell_type>option[value="related_goods"]').remove();
			}

			new_info_item.find('.overay_info_cell_type').change();
			$('.overay_container').append(new_info_item);
		}

		$('.overay_container',overay_obj).sortable({
			opacity: 0.5
		});
	}
	overay_percent_able();
}

function overay_remove_func(e){
	$(e).closest('.overay_items').remove();
	overay_percent_able();
}

//opt는 해당 select box의 상세옵션(000000000) 순차적으로 해당 숫자순서대로 옵션들을 show,hide 함
function overay_set_event(e){
	var obj = $(e);
	var obj_wrap = obj.closest('ul');
	var opt = obj.find('option:selected').attr('opt');
	var len = opt.length;
	$('.colorpicker', obj_wrap).customColorPicker('destroy').removeClass('colorpicker');

	if	(obj.val() == 'discount_per') {
		limit = 0;
		obj.closest('.overay_container').find('.overay_info_cell_type').each(function(){
			if	($(this).val() == 'discount_per') limit++;
		});
		if	(limit > 1) {
			alert('할인율은 한개만 선택 가능합니다');
			obj.val('goods_name').change();
			return;
		}
	}else if(obj.val() == 'event_time') {
		limit = 0;
		obj.closest('.overay_container').find('.overay_info_cell_type').each(function(){
			if	($(this).val() == 'event_time') limit++;
		});
		if	(limit > 1) {
			alert('단독이벤트 남은시간은 한개만 선택 가능합니다');
			obj.val('goods_name').change();
			return;
		}
	}

	for(i=0; i<len; i++){
		if	(opt.charAt(i) == 1) {
			open_obj = $('.opt'+i, obj_wrap);
			if	(open_obj.hasClass('colorpicker_ready')) {
				open_obj.addClass('colorpicker');
			}else if(open_obj.find('.colorpicker_ready').length > 0){
				open_obj.find('.colorpicker_ready').addClass('colorpicker');
			}
			open_obj.show().addClass('opt_use');
			$('.colorpicker', obj_wrap).customColorPicker();
		}else{
			$('.opt'+i, obj_wrap).hide().removeClass('opt_use');
		}
	}

	$('.overay_desc', obj_wrap).hide();

	switch(obj.val()){
		case 'discount_per':
			$('.desc_discount_per', obj_wrap).show();
			break;
		case 'shpping_free':
			$('.desc_shipping', obj_wrap).show();
			break;
		case 'event_time':
		case 'event_cnt':
			$('.desc_event', obj_wrap).show();
	}

	obj = $('.overay_discount_bg_color', obj_wrap);
	obj.next().show();
	obj.prop('disabled',false);

	if	($('.image_overay_type:checked').val() == 'all') {
		obj.next().hide();
		obj.prop('disabled',true);
	}

	overay_percent_able();
}

//할인율은 옵션이 다른 옵션이 한개 이상일 경우 사용 가능
function overay_percent_able(){
	var obj = $('.overay_container');
	var items = obj.find('.overay_items');
	var cnt = items.length;
	items.each(function(){
		if	($(this).find('.overay_info_cell_type').val() == 'discount_per') {
			if	(cnt == 1 || $('.image_overay_type:checked').val() == 'all') {
				$(this).find('.overay_discount_bg_color').prop('disabled',true);
				$(this).find('.overay_discount_bg_color').next().hide();
			}else{
				$(this).find('.overay_discount_bg_color').prop('disabled',false);
				$(this).find('.overay_discount_bg_color').next().show();
			}
		}
	});
}

function font_weight_use_chk(e){
	var obj = $(e);
	if	(obj.hasClass('use'))
		obj.removeClass('use');
	else
		obj.addClass('use');
}

function overay_before_change(type,val){
	var obj		= {};
	var ret		= {};
	var title	= [];
	if	(type == 'type') {
		obj[val] = [];
		title.push('<li>'+$('.overay_info_bak .overay_info_cell_type > option[value="'+val+'"]').text()+'</li>');
	}else{
		obj['direct'] = {'overay_text':val};
		title.push('<li>직접입력</li>');
	}
	ret.title = Base64.encode(title.join(''));
	ret.items = Base64.encode(JSON.stringify(obj));
	return ret;
}

function show_icon_setting(){
	var parent_obj		= $('#image_icon_wrap');
	var default_icon	= Base64.encode(JSON.stringify({"type":"image","img":"icon_bg6.png"}));
	var default_style	= Base64.encode(JSON.stringify({"type":"style","width":"60","height":"60","color":"#ffa500","opacity":"10"}));

	// light 일 경우 default 이미지 설정은 없음
	if(typeof gl_operation_type != 'undefined' && gl_operation_type == 'light'){
		default_style	= Base64.encode(JSON.stringify({"type":"style","width":"60","height":"60","color":"#333","opacity":"10"}));
		default_icon	= default_style;
	}

	var image_icon_default_arr = {
		'discount_per'	: {
			'condition'	:
				'<div class="mt15"><p>(혜택적용)판매가 기준으로</p><p>할인율<span class="helpicon" title="이벤트,회원등급,모바일/태블릿,유입경로의 할인이 있을 경우 이를 적용한 판매가를 기준으로 합니다." options="{alignX: \'right\'}"></span> <input type="text" class="discount" size="3"> % 이상인 상품</p></div>',
			'txt_use'	: ['1','1','0'],
			'text_arr'	:
				['{discount}','%','무료배송'],
			'use'		: false,
			'discount'	: '',
			'decoration': [],
			'background': default_icon
		},
		'solo' : {
			'condition'	:
				'단독이벤트 진행중인 상품<span class="helpicon" title="단독이벤트란 할인이벤트 메뉴에서 진행중인 단독 이벤트를 말합니다." options="{alignX: \'right\'}">',
			'txt_use'	: ['1','0','0'],
			'text_arr'	:
				['파워딜','반값할인','무료배송'],
			'use'		: false,
			'decoration': [],
			'background': default_style
		},
		'discount' : {
			'condition'	:
				'할인이벤트 진행중인 상품<span class="helpicon" title="할인이벤트란 할인이벤트 메뉴에서 진행중인 할인 이벤트를 말합니다." options="{alignX: \'right\'}">',
			'txt_use'	: ['1','0','0'],
			'text_arr'	:
				['주말','특가','무료배송'],
			'use'		: false,
			'decoration': [],
			'background': default_icon
		},
//			'gift' : {
//				'condition'	:
//					'사은품 이벤트 진행 중인 상품',
//				'txt_use'	: ['1','0','0'],
//				'text_arr'	:
//					['사은품','선착순','무료배송'],
//				'use'		: false,
//				'decoration':[]
//			},
		'package' : {
			'condition' :
				'패키지 상품<span class="helpicon" title="패키지 상품이란 패키지/복합 상품에 등록된 상품을 말합니다." options="{alignX: \'right\'}">',
			'txt_use'	: ['1','0','0'],
			'text_arr'	:
				['1+1+1','패키지','무료배송'],
			'use'		: false,
			'decoration': [],
			'background': default_style
		},
		'date' : {
			'condition' :
				'<div class="items_inner_wrap"><p><input type="radio" name="date_type" class="date_type" value="before"> <select class="regist_date"><option value="3">최근 3일 이내</option><option value="7">최근 7일 이내</option><option value="15">최근 15일 이내</option></select> 등록된 상품</p><p><input type="radio" name="date_type" class="date_type" value="after"> <input  type="text" class="regist_date_custom datepicker" size="10" readonly> <input type="text" class="regist_date_after" size="2"> 이후에 등록된 상품</p></div>',
			'txt_use'	: ['1','0','0'],
			'date_type'	: 'before',
			'regist_date' : '15',
			'regist_date_custom': '',
			'regist_date_after': '',
			'text_arr'	:
				['신상','','무료배송'],
			'use'		: false,
			'decoration': [],
			'background': default_icon
		},
		'empty' : {
			'condition' :
				'조건없음',
			'txt_use'	: ['1','0','0'],
			'text_arr'	:
				['BEST','{bestnum}위','무료배송'],
			'use'		: false,
			'decoration': [],
			'background': default_style
		}
	};
	var seq = 0;
	var target_obj = $('.icon_set_live');
	var condition = $('.image_icon_condition', target_obj).val();

	if	(condition) {
		//저장된 조건이 있을 경우 순서를 재조정 한다
		condition = decode_base64_json(condition);
		var temp							= {};
		var use_cnt							= 0;
		$.each(condition, function(key, val){
			temp[val['key']]				= image_icon_default_arr[val['key']];
			temp[val['key']]['use']			= '';
			if	(val['use'] == 1) temp[val['key']]['use'] = 1;
			var txt_temp					= [];
			var txt_use						= [];
			var deco_temp					= [];
			$.each(val['contents'], function(k,v){
				var deco					= {};
				deco.txt_color				= v['txt_color'];
				deco.txt_font				= v['txt_font'];
				deco.txt_size				= v['txt_size'];
				deco.txt_weight				= v['txt_weight'];

				deco_temp.push(deco);
				txt_use.push(v['use']);
				txt_temp.push(v['txt']);
			});
			temp[val['key']]['decoration']	= deco_temp;
			temp[val['key']]['txt_use']		= txt_use;
			temp[val['key']]['text_arr']	= txt_temp;
			temp[val['key']]['background']	= val['background'];
			if	(val['key'] == 'discount_per') {
				temp[val['key']]['discount']	= val['discount'];
			}else if(val['key'] == 'date'){
				temp[val['key']]['date_type']	= val['date_type'];
				temp[val['key']]['regist_date'] = val['date'];
				temp[val['key']]['regist_date_custom'] = val['date'];
				temp[val['key']]['date_after']	= val['date_after'];
			}
			use_cnt += parseInt(val['use']);
		});
		image_icon_default_arr				= temp;
		$('.icon_condition_cnt', target_obj).text(use_cnt);
		$('.image_icon_condition_cnt', target_obj).val(use_cnt);
	}
	$('.icon_container', parent_obj).html('');
	$.each(image_icon_default_arr,function(key, val){
		$(".colorpicker",parent_obj).customColorPicker("destroy");
		var clone_bak	= $('.icon_detail_bak').clone();
		var obj			= $('<ul class="icon_items"><li class="items_li"></li><li class="items_li_2"></li><li class="items_li_3"></li><li class="items_li_4"></li><li class="items_li_5"><input type="hidden" class="background_icon" value="'+val['background']+'" /><div class="sample_icon_wrap hand" onclick="change_icon_background(this);"></div></li></ul>');
		var use_chk		= '<label>미노출</label><input type="checkbox" class="use_chk hide" value="'+key+'" onclick="icon_condition_use_chk(this)">';
		var css_class	= 'condition_top';

		$('.items_li', obj).html('<img src="/admin/skin/default/images/common/icon_move.gif" class="move">');

		if (seq == 0) {
			use_chk		= '<label>노출</label><input type="checkbox" class="use_chk hide" value="'+key+'" checked onclick="icon_condition_use_chk(this)">';
		}else if(seq == 1 || seq == 2){
			var checked = '';
			if (val['use'] == 1) checked = 'checked';
			use_chk		= '<label></label><input type="checkbox" class="use_chk" value="'+key+'" '+checked+' onclick="icon_condition_use_chk(this)">';
		}

		$('.items_li_2', obj).html(use_chk);

		if	(key == 'date' || key == 'discount_per') {
			css_class	= 'condition_top2';
		}
		$('.items_li_3', obj).html('<span class="'+css_class+'">'+val.condition+'</span><span class="condition_bottom">무료배송 상품<span class="helpicon" title="기본배송방법(예:택배)의 기본배송비가 무료일 때입니다." options="{alignX: \'right\'}"></span>');

		if	($.inArray(key, ['solo','discount','gift']) > -1) {
			$('.items_li_3', obj).find('.event_type').val(key);
		}

		var span		= $('<span class="condition_top2"></span>');
		var span2		= $('<span class="condition_bottom"></span>');

		for(i=0; i<3; i++){
			var temp_clone = clone_bak;
			if	(i == 0) {
				temp_clone.find('.txt_use').prop({'disabled':true, 'name':'txt_use_1_'+seq});
			}else{
				temp_clone.find('.txt_use').prop({'disabled':false, 'name':'txt_use'+seq});
			}

			if	(i < 2) {
				span.append(temp_clone.html());
				span.find('.txt_val').eq(i).val(val['text_arr'][i]);
				if	(key == 'discount_per' && i == 1) {
					span.find('.txt_use').eq(1).prop({'disabled':true}).hide();
					span.find('p label').eq(1).append('ㄴ');
				}
			}else{
				span2.append(temp_clone.html());
				span2.find('.txt_val').val(val['text_arr'][i]).attr('txt_type','shipping_free');
			}
		}

		$('.items_li_4', obj).append(span).append(span2);

		if	(condition) {
			if	(key == 'discount_per') {
				$('.discount', obj).val(val['discount']);
			}else if(key == 'date'){
				$('.date_type[value="'+val['date_type']+'"]', obj).prop('checked',true);
				if	(val['date_type'] == 'before') {
					$('.regist_date', obj).val(val['regist_date']);
				}else{
					$('.regist_date_custom', obj).val(val['regist_date_custom']);
					$('.regist_date_after', obj).val(val['date_after']);
				}
			}

			$('.items_li_4 p', obj).each(function(i){
				if	(i > 0)
					$('.txt_use' ,this).attr('checked',val['txt_use'][i] == 1 ? true : false);
				else
					$('.txt_use' ,this).attr('checked',true);

				if	(val['decoration'][i]['txt_color'].length > 0)
					$('.txt_color' ,this).val(val['decoration'][i]['txt_color']);

				if	(val['decoration'][i]['txt_font'].length > 0)
					$('.txt_font' ,this).val(val['decoration'][i]['txt_font']);

				if	(val['decoration'][i]['txt_size'].length > 0)
					$('.txt_size' ,this).val(val['decoration'][i]['txt_size']);

				if	(val['decoration'][i]['txt_weight'] == 1)
					$('.txt_weight' ,this).addClass('use');
			});
		}else{
			$('.items_li_4 p', obj).each(function(i){
				if	(i == 0) $('.txt_use' ,this).attr('checked',true);
			});
		}

		$('.icon_container', parent_obj).append(obj);
		$(".colorpicker",parent_obj).customColorPicker();
		set_display_image_background();
		setDatepicker();
		help_tooltip();
		seq++;
	});

	$(".icon_container", parent_obj).sortable({
		opacity : 0.5,
		beforeStop : function( event, ui ) {
			var item_seq = 0;
			$('.items_li_2', parent_obj).each(function(){
				if	(item_seq == 0) {
					$('label', this).text('노출');
					$('.use_chk', this).hide().prop('checked',true);
					$(this).closest('.icon_items').addClass('use');
				}else if(item_seq == 1 || item_seq == 2){
					before_chk = $('.use_chk', this).prop('checked');
					$('label', this).text('');
					$('.use_chk', this).show().prop('checked',before_chk);
				}else{
					$('label', this).text('미노출');
					$('.use_chk', this).hide().prop('checked',false);
					$(this).closest('.icon_items').removeClass('use');
				}
				item_seq++;
			});
		}
	});

	$('.use_chk', parent_obj).each(function(){
		if	($(this).is(':checked')) $(this).closest('.icon_items').addClass('use');
	});

	icon_condition_set_all();
}

function icon_condition_set_all(){
	var parent_obj = $('#image_icon_wrap');
	$('.icon_items', parent_obj).each(function(){
		txt_arr = [];
		that = this;
		$('.txt_use', that).each(function(i){
			txt_obj = {};
			if	($(this).prop('disabled') || $(this).is(':checked')) {
				txt_parent = $(this).closest('p');
				if	($('.txt_val', txt_parent).val()) {
					txt_obj.key = $('.use_chk', that).val();
					txt_obj.txt = $('.txt_val', txt_parent).val();
					txt_obj.txt_color = $('.txt_color', txt_parent).val();
					txt_obj.txt_font = $('.txt_font', txt_parent).val();
					txt_obj.txt_size = $('.txt_size', txt_parent).val();
					txt_obj.txt_weight = $('.txt_weight', txt_parent).hasClass('use');
					txt_arr.push(txt_obj);
				}
			}
		});
		var background_icon = $('.background_icon', that).val();
		if	(txt_arr.length > 0) {
			set_condition_icon($('.sample_icon_wrap', that),txt_arr,false,background_icon);
		}
	});
}

function icon_condition_use_chk(e){
	if	($(e).closest('.icon_items').hasClass('use'))
		$(e).closest('.icon_items').removeClass('use');
	else
		$(e).closest('.icon_items').addClass('use');
}

function icon_condition_apply(){
	var parent_obj = $('#image_icon_wrap');
	var data = [];
	var seq = 0;
	var use_cnt = 0;
	$('.icon_items', parent_obj).each(function(){
		var sub_data	= {};
		var txt_array	= [];
		sub_data.key	= $('.use_chk', this).val();
		sub_data.use	= '0';
		if	($('.use_chk', this).prop('checked')) {
			sub_data.use = '1';
			use_cnt++;
		}

		switch(sub_data.key){
			case 'discount_per':
				sub_data.discount = $('.discount', this).val();
			break;
			case 'solo':
				sub_data.event_type = 'solo';
			break;
			case 'discount':
				sub_data.event_type = 'discount';
			break;
			case 'gift':
				sub_data.event_type = 'gift';
			break;
			case 'package':
				sub_data.package = 1;
			break;
			case 'date':
				sub_data.date_type = $('.date_type:checked', this).val();
				if	(sub_data.date_type == undefined) {
					$('.date_type:eq(0)', this).prop('checked',true);
					sub_data.date_type = 'before';
				}
				if	(sub_data.date_type == 'before') {
					sub_data.date = $('.regist_date', this).val();
				}else{
					sub_data.date = $('.regist_date_custom', this).val();
					sub_data.date_after = $('.regist_date_after', this).val();
					if	(sub_data.date == '' || sub_data.date_after == '') {
						alert('날짜를 선택해주세요');
						return false;
					}
				}
			break;
			case 'empty':
			break;
		}

		$('.items_li_4 p', this).each(function(){
			var use				= 0;
			var that			= this;
			var txt_data		= {};
			txt_data.key		= $(that).closest('.icon_items').find('.use_chk').val();
			txt_data.txt_type	= $('.txt_val', that).attr('txt_type');
			if	( $('.txt_use', that).prop('disabled')|| $('.txt_use', that).is(':checked') ) use = 1;
			txt_data.use		= use;
			txt_data.txt		= '';
			if	($('.txt_val', that).val())
				txt_data.txt	= $('.txt_val',that).val();
			txt_data.txt_color	= $('.txt_color', that).val();
			txt_data.txt_font	= $('.txt_font', that).val();
			txt_data.txt_size	= $('.txt_size', that).val();
			txt_data.txt_weight = $('.txt_weight', that).hasClass('use');
			txt_array.push(txt_data);
		});

		sub_data.contents = txt_array;
		sub_data.background = $('.background_icon', this).val();

		data[seq] = sub_data;
		seq++;
	});
	var icon_condition = Base64.encode(JSON.stringify(data));
	var target_obj = $('.icon_set_live');
	$('.image_icon_condition', target_obj).val(icon_condition);
	$('.image_icon_type', target_obj).val('condition');
	$('.image_icon_condition_cnt', target_obj).val(use_cnt);
	$('.use_image_icon', target_obj).change();
	$('.icon_type_txt[attr="no"]', target_obj).hide();
	$('.icon_type_txt[attr="condition"]', target_obj).show();
	$('.icon_condition_cnt', target_obj).text(use_cnt);
	/* 이미지 꾸미기 아이콘 조건 선택시 */
	sample_icon = $('.goodsDisplayImageTable', target_obj).find('.goodsDisplayImageIcon').clone();
	sample_icon.css({'position':'relative','display':'inline'});
	$('.image_icon_select', target_obj).hide();
	$('.image_icon_select_condition', target_obj).html(sample_icon).show();
	closeDialog("displayImageIconPopup");
}

function get_icon_replace(txt, set_obj){
	var ret = txt;
	if	(txt) {
		var rep = {
			'{discount}'	: '10',
			'{brand}'		: '퍼스트몰',
			'{brandeng}'	: 'firstamll',
			'{bestnum}'		: '1'
		}
		if	(set_obj) rep = set_obj;
		$.each(rep,function(k, v){
			txt = txt.split(k).join(v);
		});
		ret = txt;
	}
	return ret;
}

function set_condition_icon(target,obj,condition,background_icon){
	var cnt				= obj.length;
	var background_icon = decode_base64_json(background_icon);
	var icon_class		= 'icon_solo';
	var icon_class_arr	= ['icon_top','icon_bottom'];
	var icon_discount	= ['icon_top_discount','icon_top_discount_per','icon_bottom'];
	if	(cnt == 1) icon_class_arr[0] = icon_class;
	if	(cnt == 2 && obj[0].key == 'discount_per')
		icon_discount	= ['icon_solo_discount','icon_solo_discount_per'];
	$(target).html('');
	for(i=0; i<cnt; i++){
		var txt_obj = $('<span>');
		var num_obj = $('<num>');
		var txt_css = {
			'font-size'		:	'9pt',
			'color'			:	'#000000',
			'font-weight'	:	''
		};

		txt_obj.text(get_icon_replace(obj[i].txt, condition));

		if	(obj[i].txt_color)
			txt_css['color'] = obj[i].txt_color;
		if	(obj[i].txt_size)
			txt_css['font-size'] = parseInt(obj[i].txt_size)+'pt';
		if	(obj[i].txt_font)
			txt_css['font-family'] = obj[i].txt_font;
		if	(obj[i].txt_weight)
			txt_css['font-weight'] = 'bold';

		if	(obj[i].key == 'discount_per') {
			txt_obj.addClass(icon_discount[i]);
		}else{
			txt_obj.addClass(icon_class_arr[i]);
		}

		$(target).append(txt_obj.css(txt_css));
	}

	if	(background_icon['type'] == 'image') {
		$(target).css({'background':'url("/data/icon/goodsdisplay/background/'+background_icon['img']+'") no-repeat center','width':'60px','height':'60px','opacity':'1'});
	}else{
		var custom_css = {};
		custom_css['background'] = '';
		custom_css['text-align'] = 'center';
		if	(background_icon['width']) {
			var width = background_icon['width']+'px';
			var left_width = (background_icon['width']*0.6)+'px';
			var right_width = background_icon['width']-(background_icon['width']*0.6)+'px';
			custom_css['width'] = width;
			if	($(target).find('.icon_solo').length > 0 || $(target).find('.icon_top').length > 0) {
				$(target).find('.icon_solo').css('width',width);
				$(target).find('.icon_top').css('width',width);
				$(target).find('.icon_bottom').css('width',width);
			}
			if	($(target).find('.icon_top_discount').length > 0 || $(target).find('.icon_solo_discount').length > 0) {
				$(target).find('.icon_top_discount').css('width',left_width);
				$(target).find('.icon_solo_discount').css('width',left_width);
				$(target).find('.icon_top_discount_per').css('width',right_width);
				$(target).find('.icon_solo_discount_per').css('width',right_width);
			}
		}

		if	(background_icon['height']) {
			var height = background_icon['height']+'px';
			var half_height = background_icon['height']/2+'px';
			custom_css['height'] = height;
			if	($(target).find('.icon_solo').length > 0 || $(target).find('.icon_top').length > 0) {
				$(target).find('.icon_solo').css({'height':height,'line-height':height});
				$(target).find('.icon_top').css({'height':half_height,'line-height':half_height});
				$(target).find('.icon_bottom').css({'height':half_height,'line-height':half_height});
			}
			if	($(target).find('.icon_top_discount').length > 0 || $(target).find('.icon_solo_discount').length > 0) {
				$(target).find('.icon_top_discount').css({'height':half_height,'line-height':half_height});
				$(target).find('.icon_solo_discount').css({'height':height,'line-height':height});
				$(target).find('.icon_top_discount_per').css({'height':half_height,'line-height':half_height});
				$(target).find('.icon_solo_discount_per').css({'height':height,'line-height':height});
			}
		}

		if	(background_icon['color'])
			custom_css['background-color'] = background_icon['color'];

		if	(background_icon['width'])
			custom_css['opacity'] = 1-background_icon['opacity']/100;
		$(target).css(custom_css);
	}
}

function display_set_border(e){
	if	($(e).val() == 'all') {
		$('.image_border1_width').prop('readonly',true);
		$('.image_border1_width').val($('.image_border_width').val());
		$('.img_effect_border_img[attr="all"]').show();
		$('.img_effect_border_img[attr="goods"]').hide();
	}else{
		$('.image_border1_width').prop('readonly',false);
		$('.img_effect_border_img[attr="all"]').hide();
		$('.img_effect_border_img[attr="goods"]').show();
	}
}

function display_set_border_mobile(e){
	if	($(e).val() == 'all') {
		$('.img_effect_border_img_m[attr="all"]').show();
		$('.img_effect_border_img_m[attr="goods"]').hide();
	}else{
		$('.img_effect_border_img_m[attr="all"]').hide();
		$('.img_effect_border_img_m[attr="goods"]').show();
	}
}

function display_chk_border(e){
	if	($('.image_border_type').val() == 'all') $('.image_border1_width').val($(e).val());
}

function open_decoration_save(e, platform, type){
	var parent_obj	= $('#image_deco_favorite');
	var title		= '자주쓰는 꾸미기로 등록';

	$('.decoraion_favorite').removeClass('decoraion_favorite');
	$(e).closest('.goodsDisplayDecorationContainer').addClass('decoraion_favorite');

	if	($('.decoration_type[name="'+type+'_type"]:checked',$('.decoraion_favorite')).val() == 'quality') {
		type = type.replace(/m_/i,'');
		if	(type == 'goods_decoration') title = '자주쓰는 상품정보로 등록';
		$('#favorite_type', parent_obj).val(type);
		$('#favorite_platform', parent_obj).val(platform);
		$('.favorite_date', parent_obj).text('자동');
		$('input[name="favorite_title"]', parent_obj).val('');
		$('textarea[name="favorite_desc"]', parent_obj).val('');
		$('#favorite_act', parent_obj).val('insert');
		openDialog(title,'#image_deco_favorite', {'width':'500','show' : 'fade','hide' : 'fade'});
	}
	var parent_obj2 = $(e).closest('.goodsDisplayDecorationContainer');
	if	(type == 'goods_decoration') {
		$('#goods_favorite', parent_obj2).trigger("click");
		$('#m_goods_favorite', parent_obj2).trigger("click");
	}else	{
		$('#m_image_favorite', parent_obj2).trigger("click");
	}
}

function open_image_deco_update(e, key, platform, type){
	var parent_obj = $('#image_deco_favorite');
	$('.decoraion_favorite').removeClass('decoraion_favorite');
	$(e).closest('.goodsDisplayDecorationContainer').addClass('decoraion_favorite');

	var param = {
		'key'		: key,
		'type'		: type,
		'platform'	: platform
	}

	$.ajax({
		'url'		: '/admin/design/favorite_decorations_info',
		'data'		: param,
		'type'		: 'post',
		'dataType'	: 'json',
		'success'	: function(res){
			date_txt = res[0].favorite_regist
			if	(res[0].favorite_update) {
				date_txt += ' ('+res[0].favorite_update+')';
			}
			$('.favorite_date', parent_obj).text(date_txt);
			$('input[name="favorite_title"]', parent_obj).val(res[0].favorite_title);
			$('textarea[name="favorite_desc"]', parent_obj).val(res[0].favorite_desc);
			$('#favorite_act', parent_obj).val('update');
			$('#favorite_key', parent_obj).val(res[0].favorite_key);
			if	(res[0].default == '1') {
				$('input[name="favorite_title"]', parent_obj).prop('readonly',true);
				$('textarea[name="favorite_desc"]', parent_obj).prop('readonly',true);
			}else{
				$('input[name="favorite_title"]', parent_obj).prop('readonly',false);
				$('textarea[name="favorite_desc"]', parent_obj).prop('readonly',false);
			}
			openDialog('자주쓰는 꾸미기 정보','#image_deco_favorite', {'width':'500','show' : 'fade','hide' : 'fade'});
		}
	});
}

function image_deco_favorite_save(){
	var parent_obj		= $('#image_deco_favorite');
	var display_seq		= $('input[name="display_seq"]').val();
	var decoration		= $('input.image_decoration', '.decoraion_favorite').val();
	var text_align		= $('input.text_align:checked', '.decoraion_favorite').val();
	var favorite_desc	= $('textarea[name="favorite_desc"]', parent_obj).val();
	var favorite_title	= $('input[name="favorite_title"]', parent_obj).val();
	var favorite_type	= $('#favorite_type', parent_obj).val();
	var favorite_act	= $('#favorite_act', parent_obj).val();
	var favorite_key	= $('#favorite_key', parent_obj).val();
	var result_txt		= '추가되었습니다.';
	var platform		= $('#favorite_platform').val();

	if	(!favorite_title || favorite_title == '') {
		alert('타이틀은 필수 입니다');
		return;
	}

	if	(favorite_type == 'image_decoration') {
		if	(!decoration || decoration == '') {
			alert('저장할 설정값이 없습니다');
			return;
		}
		text_align = '';
	}else{
		var decoration_temp = [];

		$('.info_setting', '.decoraion_favorite').each(function(){
			decoration_arr = $(this).val().replace(/\"{/g,'{');
			decoration_arr = decoration_arr.replace(/}\"/g,'}');
			if	($(this).val()) decoration_temp.push(decoration_arr);
		});

		decoration = '['+decoration_temp.join(',')+']';
	}

	if	($('.decoraion_favorite').hasClass('mobile_tab')) {
		display_seq = $('input[name="m_display_seq"]').val();
	}

	var param = {
		'favorite_type' : favorite_type,
		'platform'		: platform,
		'display_seq'	: display_seq,
		'decoration'	: decoration,
		'favorite_desc'	: favorite_desc,
		'favorite_title': favorite_title,
		'favorite_act'	: favorite_act,
		'favorite_key'	: '',
		'text_align'	: text_align
	}

	if	(favorite_act != 'insert') {
		param['favorite_key']	= favorite_key;
		result_txt				= '수정되었습니다.';
	}

	$.ajax({
		'url'		: '/admin/design_process/favorite_decorations_save',
		'data'		: param,
		'type'		: 'post',
		'success'	: function(res){
			$('.decoraion_favorite').find('.decoration_favorite[platform="'+platform+'"][favorite_type="'+favorite_type+'"]').attr('json',res);
			set_decoration_favorite();
			$('textarea[name="favorite_desc"]').val('');
			$('input[name="favorite_title"]').val('');
			alert(result_txt);
			closeDialog('image_deco_favorite');
		}
	});
}

function open_image_deco_delete(e, key, platform, type){
	$.ajax({
		'url'		: '/admin/design_process/favorite_decorations_save',
		'data'		: {'favorite_key':key, 'favorite_act': 'delete', 'platform':platform, 'favorite_type':type},
		'type'		: 'post',
		'success'	: function(res){
			$(e).closest('.decoration_favorite').attr('json',res);
			set_decoration_favorite();
			$('textarea[name="favorite_desc"]').val('');
			$('input[name="favorite_title"]').val('');
			alert('삭제되었습니다.');
			closeDialog('image_deco_favorite');
		}
	});
}

function img_deco_favorite_copy(e, platform, type){
	var parent_obj = $(e).closest('.goodsDisplayDecorationContainer');

	if	(type == 'image_decoration') {
		if	($('.decoration_type[name="image_decoration_type"]:checked', parent_obj).val() == 'favorite' || $('.decoration_type[name="m_image_decoration_type"]:checked', parent_obj).val() == 'favorite') {
			var decoration = $(e).attr('decoration');

			$(".goodsDisplayImageWrap",parent_obj).data("decorationLoaded",false);
			$(".goodsDisplayImageWrap",parent_obj).attr("decoration",decoration);
			$(".goodsDisplayImageWrap",parent_obj).data("decoration",decode_base64_json(decoration));
			$("input.image_decoration",parent_obj).val(decoration);
			$("#image_quality",parent_obj).trigger("click");
			$("#m_image_quality",parent_obj).trigger("click");

			goods_display_decoration_reset(parent_obj, platform);
			set_goods_display_decoration($(".goodsDisplayImageWrap", parent_obj));
			alert('해당 자주쓰는 꾸미기 정보가 고급설정으로 복사되었습니다.');
		}
	}else{
		if	($('.decoration_type[name="goods_decoration_type"]:checked', parent_obj).val() == 'favorite' || $('.decoration_type[name="m_goods_decoration_type"]:checked', parent_obj).val() == 'favorite') {
			var decoration = $(e).attr('decoration');
			var text_align = $(e).attr('text_align');
			$('.info_settings', parent_obj).val(decoration);
			$('.text_align[value="'+text_align+'"]', parent_obj).prop('checked', true);
			$('.info_item_container', parent_obj).html('');
			set_info_item_data(parent_obj);
			$("#goods_quality",parent_obj).trigger('click');
			$("#m_goods_quality",parent_obj).trigger('click');

			alert('해당 자주쓰는 상품정보가 고급설정으로 복사되었습니다.');
		}
	}
}

function set_decoration_favorite(){
	$('.decoration_favorite').each(function(){
		var favorite_type		= $(this).attr('favorite_type');
		var custorm_json		= $(this).attr('json');
		var use_key				= $(this).attr('use_key');
		var ul					= $('<ul class="favorite_ul"></ul>');
		var goodsinfo			= $('.goodsDisplayImageWrap').attr('goodsinfo');
		var this_platform		= $(this).attr('platform');

		if	(custorm_json && custorm_json != 'e30=' ) {
			if	(favorite_type == 'image_decoration') {
				var favorite_key_name	= 'image_decoration_favorite_key';
				custorm_json = JSON.parse(Base64.decode(custorm_json));

				$.each(custorm_json,function(k, v){
					if	(v.platform == 'mobile') favorite_key_name = 'm_image_decoration_favorite_key';
					var li = $('<li class="favorite_li">');
					var default_top = $('<div class="favorite_top"><span class="btn small gray"><input type="button" value="정보" onclick="open_image_deco_update(this, \''+v.favorite_key+'\', \''+v.platform+'\', \'image_decoration\')"></span> <span class="btn small delete_btn"><input type="button" value="삭제" onclick="open_image_deco_delete(this, \''+v.favorite_key+'\', \''+v.platform+'\', \'image_decoration\')"></span></div>');
					var default_img = $('<div class="favorite_wrap" onclick="img_deco_favorite_use(this)"><div class="goodsDisplayItemWrap"><span class="goodsDisplayImageWrapFavorite" version="display_edit" decoration="'+v.decoration+'" goodsinfo="'+goodsinfo+'"><input type="radio" name="'+favorite_key_name+'" value="'+v.favorite_key+'" class="hide decoration_favorite_chk"><img src="/admin/skin/default/images/design/img_effect_sample.gif" class="sample_img goodsDisplayImage"><div class="goodsDisplayBottomFuncWrap"><div class="goodsDisplayBottomFunc"><div class="display_quickview" onclick=""><img src="/data/icon/goodsdisplay/preview/thumb_quickview.png" alt="미리보기" /></div><div class="display_option" onclick="" goods_seq="1"><img src="/data/icon/goodsdisplay/preview/thumb_option.png" alt="옵션보기" /><div class="hide display_opt_bak"></div></div><div class="display_send" onclick="display_goods_send(this,\'bottom\')"><img src="/data/icon/goodsdisplay/preview/thumb_send.png" alt="SNS보내기" /></div><div class="display_zzim" onclick=""><img src="/data/icon/goodsdisplay/preview/thumb_zzim_off.png" class="zzimOffImg" alt="찜하기" /></div></div></div></div></span></div>');
					var default_bottom = $('<div class="favorite_bottom" onclick="img_deco_favorite_copy(this, \''+v.platform+'\', \'image_decoration\')">↓고급설정으로 복사</div>');
					if	(v.default == "1") default_top.find('.delete_btn').remove();
					default_bottom.attr('decoration',v.decoration);
					default_img.attr('decoration',v.decoration);
					li.html(default_top).append(default_img).append(default_bottom);
					ul.append(li);
				});

				$(this).html(ul);

				if	(use_key) {
					var use_obj = $('.decoration_favorite_chk[value="'+use_key+'"]', this);
					use_obj.click();
					use_obj.closest('.favorite_wrap').addClass('use');
				}

				$('.decoration_type:checked').click();

				var objBxSlider = $('.favorite_ul', this).bxSlider({
					minSlides: 2,
					maxSlides: 4,
					slideWidth: '150',
					slideMargin: 5,
					infiniteLoop: false,
					hideControlOnEnd: true,
					pager: 0
				});
				$('.favorite_ul', this).data("objBxSlider", objBxSlider);

				set_goods_display_decoration($(".goodsDisplayImageWrapFavorite", this));
				if	(this_platform != 'mobile') {
					set_goods_display_decoration_event($(".goodsDisplayImageWrapFavorite", this));
				}
			}else{
				var favorite_key_name	= 'goods_decoration_favorite_key';
				custorm_json = JSON.parse(Base64.decode(custorm_json));
				kind_obj = {};
				$('.info_item_kind:eq(0) > option').each(function(){
					kind_obj[$(this).val()] = $(this).text();
				});

				$.each(custorm_json, function(k, v){
					if	(v.platform == 'mobile') favorite_key_name = 'm_goods_decoration_favorite_key';
					var li = $('<li class="favorite_li">');
					var default_top = $('<div class="favorite_top"><span class="btn small gray"><input type="button" value="정보" onclick="open_image_deco_update(this, \''+v.favorite_key+'\', \''+v.platform+'\', \'goods_decoration\')"></span> <span class="btn small delete_btn"><input type="button" value="삭제" onclick="open_image_deco_delete(this, \''+v.favorite_key+'\', \''+v.platform+'\', \'goods_decoration\')"></span></div>');
					var default_img = $('<div class="favorite_wrap" onclick="img_deco_favorite_use(this)"><input type="radio" name="'+favorite_key_name+'" value="'+v.favorite_key+'" class="hide decoration_favorite_chk" /><div class="goods_info_area"></div></div>');
					var default_bottom = $('<div class="favorite_bottom" onclick="img_deco_favorite_copy(this, \''+v.platform+'\', \'goods_decoration\')">↓고급설정으로 복사</div>');
					if	(v.default == "1") default_top.find('.delete_btn').remove();
					default_bottom.attr({'decoration':v.decoration,'text_align':v.text_align});
					default_img.attr('decoration',v.decoration);
					var decoraion	= JSON.parse(v.decoration);
					var text		= '';
					var txt_obj		= '';
					var txt_css		= {};
					$.each(decoraion, function(info_key, info_val){
						txt_obj = $('<p>');
						txt_css = {};
						text	= kind_obj[info_val.kind];

						if	(info_val.font_decoration) {
							if	(info_val.font_decoration.color)
								txt_css['color'] = info_val.font_decoration.color;
							if	(info_val.font_decoration.size)
								txt_css['font-size'] = info_val.font_decoration.size+'pt';
							if	(info_val.font_decoration.bold)
								txt_css['font-weight'] = info_val.font_decoration.bold;
							if	(info_val.font_decoration.font)
								txt_css['font-family'] = info_val.font_decoration.font;
							if	(info_val.font_decoration.underline)
								txt_css['text-decoration'] = info_val.font_decoration.underline;
						}
						if	(info_val.wrapper && typeof info_val.wrapper === "string")
							text = info_val.wrapper.substring(0,1)+text+info_val.wrapper.substring(1,2);

						txt_obj.html(text);

						txt_css['text-align'] = v.text_align;
						$('.goods_info_area', default_img).append(txt_obj.css(txt_css));
					});
					li.html(default_top).append(default_img).append(default_bottom);
					ul.append(li);
				});

				$(this).html(ul);

				if	(use_key) {
					var use_obj = $('.decoration_favorite_chk[value="'+use_key+'"]', this);
					use_obj.click();
					use_obj.closest('.favorite_wrap').addClass('use');
				}

				var objBxSlider = $('.favorite_ul', this).bxSlider({
					minSlides: 2,
					maxSlides: 4,
					slideWidth: '150',
					slideMargin: 5,
					infiniteLoop: false,
					hideControlOnEnd: true,
					pager: 0
				});
				$('.favorite_ul', this).data("objBxSlider", objBxSlider);
			}
		}else if (custorm_json != 'W10=') {
			$(this).html('');
		}
	});
}

function img_deco_favorite_use(e){
	$(e).closest('ul').find('.favorite_wrap').removeClass('use');
	$(e).addClass('use');
	$('.decoration_favorite_chk', e).attr('checked',true);
}

// ga4 select_item 호출
function ga4_select_item(seq){
    if (seq != '' && seq != null && typeof seq != 'undefined' && typeof gtag != 'undefined') {
        $.ajax({
            url: "/goods/now_goods",
            data: {'seq' : seq},
            dataType: 'json',
            type: 'POST',
            success: function (res) {
                if (res == 0) {
                    return false;
                } else {
                    gtag("event", "select_item", {
                        items: res
                      });    
                }
            },error: function (xhr) {
                console.log('GA4 select_item 이벤트 호출 ajax 에러',xhr.responseText);
            } 
        });
    }

}