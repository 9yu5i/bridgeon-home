$(function(){
	addtabEvent();
	addLimitTextEvent();
	addLimitTextByteEvent();

	addAllChkEvent();
	//addRadioEvent();
	//addCheckboxEvent();
	addSelectDateEvent();
	radioInInputClickEvent();	
	checkInInputClickEvent();
	addtabPageSetEvent();
	addtabPageParamSetEvent();
});

//다이얼로그 닫기
function closeDialogEvent(obj){	
	var id = $(obj).closest(".ui-dialog-content").attr("id");	
	closeDialog(id);
}

//주소의 파라미터값 변수로 받기
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

//radio 안 Input 클릭 시 radio 선택
function radioInInputClickEvent()
{
	if($(".resp_radio").length==0) return;

	$(".resp_radio > label > input[type='text']").on("click", function()
	{
		var label = $(this).closest("label");
		label.find("input[type='radio']").attr("checked", true);
		label.find("input[type='radio']:checked").trigger('change');
	})
}

//checkbox 안 Input 클릭 시 checkbox 선택
function checkInInputClickEvent()
{
	if($(".resp_checkbox").length==0) return;

	$(".resp_checkbox > label > input[type='text']").on("click", function()
	{
		var label = $(this).closest("label");
		label.find("input[type='checkbox']").attr("checked", true);
		label.find("input[type='checkbox']:checked").trigger('change');
	})
}

//날짜기간 선택 버튼
function addSelectDateEvent()
{
	if($(".select_date").length==0) return;

	$(".select_date").on("click", function()
	{
		$(".btn.on").removeClass("on");	
		$(".select_date.on").removeClass("on");
		$(this).closest(".btn").addClass("on");	
		$(this).addClass("on");		
	})
}

//라디오 버튼 디자인 적용
function addRadioEvent()
{
	if($(".resp_radio").length==0) return;

	$(".resp_radio input[type='radio']").each(function()
	{
		var label = $(this).closest("label");
		$(this).is(":checked")?	label.addClass("on"):label.removeClass("on");
	})

	$(document).on("change", ".resp_radio input[type='radio']", function()
	{
		$(this).closest(".resp_radio").find("label").removeClass("on");
		if($(this).is(":checked")) $(this).closest("label").addClass("on");
	})
}

//체크박스 버튼 디자인 적용
function addCheckboxEvent()
{
	if($(".resp_checkbox").length==0) return;

	$(".resp_checkbox input[type='checkbox']").each(function()
	{
		var label = $(this).closest("label");
		$(this).is(":checked")?label.addClass("on"):label.removeClass("on");
	})

	$(document).on("change", ".resp_checkbox input[type='checkbox']", function()
	{
		var label = $(this).closest("label");
		$(this).is(":checked")?label.addClass("on"):label.removeClass("on");
	})
}

/*이미지 업로드*/
function imgUploadEvent(target, res, path, file_name, _options)
{
	var $img_wrap = $(target).closest('.webftpFormItem');
	var url, value;

	if(typeof _options == "undefined") _options = {'inpValue':true,'previewDel':false};

	$(target).closest('.webftpFormItem').find('.preview_image span.nothing').hide();
	if(typeof res.status == "undefined" && typeof res[0] != "undefined"){

		// 다중 이미지 업로드
		$.each(res, function (_key, _val){

			if(_val.status == true){
				url 	= _val.filePath + _val.fileInfo.orig_name;
				var code = '<div class="image-preview-wrap mr5"><div class="bg"><a href="#" class="preview-del"></a><input class="preview-data" type="hidden" name="image_path" value=""/>';
				code += '<div class="preview-img"><a href="';
				code += url;
				code += '" target="_blank"><img src="';
				code += url+"?"+Math.random();
				code += '"/></a></div>';
				code += '<input type="hidden" name="uploadImg[]" value="'+url+'">';
				code += '</div><div>';

				$(target).closest('.webftpFormItem').find('.preview_image').append(code);

			}else{
				res.status 	= false;
				res.msg		= _val.msg;
				res.error_cnt++;
			}

		});
	}else{

		var code = '<div class="image-preview-wrap"><div class="bg"><a href="javascript:void(0);" class="preview-del"></a><input class="preview-data" type="hidden" name="image_path" value=""/><div class="preview-img"><a href="" target="_blank"><img src=""/></a></div></div><div>';
		$(target).closest('.webftpFormItem').find('.preview_image').html(code);

		if(res.status == true){
			url 	= res.filePath + res.fileInfo.orig_name;
			value 	= url;

		}else{
			url 	= path + file_name;
			value 	= file_name;
		}

		// 저장된 이미지 파일명 제거
		if(_options.inpValue == false) value = '';

		$img_wrap.find('.preview-img img').attr('src', url+"?"+Math.random());
		$img_wrap.find('.preview-img a').attr('href', url);
		$(target).closest('.webftpFormItem').find('.webftpFormItemInput').val(value);

	}

	// 미리보기 이미지 옵션 처리
	if(_options.previewDel == true){
		$img_wrap.find('.preview-del').remove();
	}

	if($("input[name='del_main_visual']").length > 0) $("input[name='del_main_visual']").val("n");

	$img_wrap.find('.preview-del').click(function(){
		$(this).closest('.image-preview-wrap').remove();
		$(target).val('');
		$(target).closest('.webftpFormItem').find('.webftpFormItemInput').val('');
		if($(target).closest('.webftpFormItem').find('.preview_image .image-preview-wrap').length == 0){
			$(target).closest('.webftpFormItem').find('.preview_image span.nothing').show();
		}
		if($("input[name='del_main_visual']").length == 0)return;
		$("input[name='del_main_visual']").val("y");
	});

	return res;
}

// 업로드 공통 옵션
var uploadConfig = {
	'overwrite' : true
};

function uploadCallback(res){
	var that		= this;
	var _res		= eval(res);
	var _options	= {};
	var result		= false;

	if(typeof result.status == "undefined" && typeof result[0] != "undefined"){
		_options.multiUse = true;
	}
	if(_res){
		result = imgUploadEvent(that, _res, '','', _options);
	}

	if(result.status == false){
		alert(result.msg);
	}
};

function uploadFileCallback(res){
	var that		= this;
	var result		= eval(res);

	if(result.status){
		that.closest('.webftpFormItem').find("#fileName").html(result.fileInfo.orig_name);
	}else{
		alert(result.msg);
	}
};

function uploadSizelimitCallback(res){
	var that		= this;
	var result		= eval(res);

	if(result.status){	
		if(result.fileInfo.image_width=="300")
		{
			imgUploadEvent(that, result);
		}else{
			openDialogAlert("가로 300px 이미지만 업로드 할 수 있습니다.", 400, 150);
		}
	}else{
		alert(result.msg);
	}
};


function appPushUploadCallback(res){
	var that		= this;
	var result		= eval(res);

	if(result.status){
		if(result.fileInfo.image_width==640&&result.fileInfo.image_height==320)
		{
			imgUploadEvent(that, result);
		}else{
			openDialogAlert("가로 640px, 세로 320px 이미지만 업로드 할 수 있습니다.", 400, 150);
		}
	}else{
		alert(result.msg);
	}
};


function jc_view_btn(str,sz1,sz2)
{
	popup(str,sz1,sz2);
}

//탭
function addtabEvent()
{
	var objs = $('.tabEvent');

	if (objs.length == 0 ) return;

	objs.each(function(){

		var obj = $(this).find("li > a");

		obj.on("click", function(){
			if(typeof($(this).data("other")) !== "undefined"){
				if(typeof($(this).data("other")) === "function"){
					$(this).data("other")();
				}
			}else{

				var data_selector = $(this).data('showcontent');
				var data_selector2 = $(this).closest('ul').find(".current").data('showcontent');

				if(data_selector2)
				{
					$("#" + data_selector2).hide();
					$("." + data_selector2).hide();
				}

				if(data_selector)
				{
					$("#" + data_selector).show();
					$("." + data_selector).show();
				}

				$(this).closest('li').siblings().find('a').removeClass('current');
				$(this).addClass('current');
			}
		});

		if(location.hash)
		{
			var arr = location.hash.split('#');
			var name = arr[1];

			obj.each(function(){
				if($(this).attr('href').replace("#", "")==name) $(this).trigger('click');
			})
		}else{
			if($(this).find(".current").length != 0) return;
			if($(this).find("li:eq(0) > a").attr("onclick")) return;
			$(this).find("li:eq(0) > a").trigger('click');
		}
	})
}

//해당 페이지 활성 탭 이벤트
function addtabPageSetEvent()
{
	if ( $('.pageSetTab').length == 0 ) return;	

	var arr = $(location). attr("href").split("/");		
	var value= arr[arr.length-1].split("?")[0];
	$(".pageSetTab > li > a").each(function(){ 
		if(value==$(this).attr("value")) $(this).addClass("current");			
	})
}

function addtabPageParamSetEvent()
{
	if ( $('.pageParamSetTab').length == 0 ) return;	

	var arr = $(location). attr("href").split("/");		
	var param = String(arr[arr.length-1].split("?")[1]);
	var value = param.split("=")[1];

	if(!value)
	{
		$(".pageParamSetTab > li").eq(0).find("a").addClass("current");
		return;
	}

	$(".pageParamSetTab > li > a").each(function(){ 
		if(value==$(this).attr("value")) $(this).addClass("current");			
	})
}

//문자를 length byte로 변경 해주는 스크립트
function chkByte(str){
	var cnt = 0;
	for(i = 0; i < str.length; i++) {
		cnt += str.charCodeAt(i) > 128 ? 2 : 1;
		if(str.charCodeAt(i) == 10) cnt++;
	}
	return cnt;
}

function getTextLength(str) {
	var len = 0;
	for (var i = 0; i < str.length; i++) {
		if (escape(str.charAt(i)).length == 6) {
			len++;
		}

		len++;
	}
	return len;
}

//문자 length 카운팅
function addLimitTextEvent()
{
	var objs = $('.limitTextEvent');

	if (objs.length == 0 ) return;

	var pattern = new RegExp('fncut_info');
	objs.each(function(){
		var obj = $(this).find("input[type=text]");
		if( obj.css("display") == "none") {
			$(this).css('border','0px');
			return true;
		}

		obj.on("keyup",function(){
			$(this).parent().find(".current_cnt").html(Math.min(obj.attr("maxlength"), $(this).val().length));
		})

		if(pattern.test($(this).html()) == false) {
			$(this).append('<span class="fncut_info"><span class="current_cnt">'+obj.val().length+'</span> /' + obj.attr("maxlength") + '</span>')
		}
	})
}

//문자 byte 카운팅
function addLimitTextByteEvent()
{
	var objs = $('.limitTextByteEvent');

	if (objs.length == 0 ) return;

	objs.each(function(){
		var obj = $(this).find("input[type=text]");

		obj.keyup(function(){
			var text = $(this).val();
			var leng = text.length;

			while(getTextLength(text) > Number(obj.attr("maxByte"))){
				leng--;
				text = text.substring(0, leng);
			}

			$(this).val(text)
			$(this).parent().find(".current_cnt").html(getTextLength(text));
		})

		$(this).append('<span class="fncut_info"><span class="current_cnt">'+getTextLength(obj.val())+'</span> /' + obj.attr("maxByte") + ' Byte</span>')
	})
}

function addTextByteEvent()
{
	var objs = $('.textByteEvent');

	if (objs.length == 0 ) return;

	objs.each(function(){
		var obj = $(this).find("input[type=text]");

		obj.keyup(function(){
			var text = $(this).val();
			var leng = text.length;

			//while(getTextLength(text) > Number(obj.attr("maxByte"))){
				//leng--;
				text = text.substring(0, leng);
			//}

			$(this).val(text)
			$(this).parent().find(".current_cnt").html(getTextLength(text));
		})

		$(this).append('<span class="fncut_info"><span class="current_cnt">'+getTextLength(obj.val())+'</span> Byte</span>')
	})
}


//아코디언형 리스트
function addAccordionEvent()
{
	$('.accordionEvent > li > h3').on("click", function(){
		if($(this).closest('li').find('.content').css("display")=="none")
		{
			$(this).closest('li').siblings().find('.content').hide()
			$(this).closest('li').find('.content').show();
		}else{
			$(this).closest('li').find('.content').hide();
		}
	});
}

function addAllChkEvent()
{
	var obj = $('.allChkEvent');

	if (obj.length == 0 ) return;

	obj.on('click', function()
	{
		var target = $(this).closest("table").find("input[type='checkbox']");
		target.attr("checked", $(this).is(":checked"))

	});
}

//radio 버튼 클릭 시 해당 컨텐츠 오픈
function setContentsRadio(name, value)
{
	var inputs = $('input:radio[name='+ name +']');

	if (inputs.length == 0 ) return;

	inputs.on('change', function()
	{
		var target = $("."+ name +"_"+$(this).val());

		inputs.each(function()
		{
			var tg = $("."+ name + "_"+$(this).val());
			tg.hide();
			$(this).attr("checked", false)
			tg.find("input, select").attr("disabled", true);
		 });

		target.show();
		$(this).attr("checked", true)
		target.find("input, select").attr("disabled", false);

	});

	$('input[name='+ name +']'+'[value=' + value + ']').trigger('change');
}


function setRadio(name, value)
{
	var inputs = $('input[name='+ name +']');

	if (inputs.length == 0 ) return;

	inputs.on('click', function()
	{
		inputs.each(function()
		{
			$(this).attr("checked", false)
			$(this).parent().find("input[type='text'], select").attr("disabled", false);
		 });

		 $(this).attr("checked", true)
		 //$(this).parent().find("input[type='text'], select").attr("disabled", false);
	});

	$('input[name='+ name +']'+'[value=' + value + ']').trigger('click');
}

function setContentsDoubleRadio(name, value, name2, value2)
{
	var inputs = $('input[name='+ name +']');

	if (inputs.length == 0 ) return;


	inputs.on('click', function()
	{
		inputs.each(function()
		{
			$("."+ name + "_"+$(this).val()).find("input[type='text'], select").attr("disabled", false);
			$("."+ name + "_"+$(this).val()).hide();
		 });

		$("."+ name +"_"+$(this).val()).show();
		//$("."+ name +"_"+$(this).val()).find("input[type='text'], select").attr("disabled", false);
		$('input[name='+ name2 +']'+'[value=' + value2 + ']').trigger('click');
	});

	$('input[name='+ name +']'+'[value=' + value + ']').trigger('click');

	setRadio(name2, value2)

}

//checkbox 클릭 시 해당 컨텐츠 오픈
function setContentsCheckbox(name)
{
	var inputs = $('input:[name='+ name +']');

	if (inputs.length == 0 ) return;

	inputs.on('click', function()
	{
		var target = $("."+ name +"_contents");

		if($(this).is(":checked"))
		{
			target.show();
			$(this).attr("checked", true);
			target.find("select").attr("disabled", false);
			target.find("input").attr("disabled", false);
		}else{
			target.hide();
			target.attr("checked", false);
			target.find("select").attr("disabled", true);
			target.find("input").attr("disabled", true);
		}
	});

	if(inputs.is(":checked"))
	{
		$("."+ name +"_contents").show();
		//inputs.find("select").attr("disabled", true);
		//inputs.find("input").attr("disabled", true);
	}
}

function setRangeContentsCheckbox(name)
{
	var inputs = $('input:[name='+ name +']');
	if (inputs.length == 0 ) return;

	inputs.on('click', function()
	{
		var target = $(this).closest("table").find("."+ name +"_contents");

		if($(this).is(":checked"))
		{
			target.show();
			target.find("select, input").attr("disabled", false);
		}else{
			target.hide();
			target.find("select, input").attr("disabled", true);
		}
	});
}

//Select 클릭 시 해당 컨텐츠 오픈
function setRangeContentsSelect(obj)
{
	var inputs = $(obj);
	if (inputs.length == 0) return;

	var obj_name = obj.attr('name').replace(/\[.*\]/gi, "");

	
	var target = inputs.closest("td").find("." + obj_name + "_" + inputs.val());

	var len= inputs.find("option").length;
	for(var i=0; i<len; i++)
	{
		inputs.closest("td").find("." + obj_name + "_" + inputs.find("option").eq(i).val()).hide();
	}

	target.show();
}

//checkbox 클릭 시 해당 컨텐츠 오픈
function setContentsSelect(name, value)
{
	var inputs = $('select:[name='+ name +']');

	if (inputs.length == 0 ) return;

	inputs.on('change', function(){

		var len= $(this).find("option").length;
		var target = $("."+ name +"_" + $(this).val())

		for(var i=0; i<len; i++)
		{
			var tg = $("."+ name +"_" + $(this).find("option").eq(i).val())
			tg.hide();
			tg.find("select").attr("disabled", true);
			tg.find("input").attr("disabled", true);
		}

		target.show();
		target.find("select").attr("disabled", false);
		target.find("input").attr("disabled", false);
	});

	inputs.val(value).trigger('change');
}

//토글버튼
function addToggle(name, value)
{
	var inputs = $('input:radio[name='+name+']');

	inputs.parent().hide();
	$('input:radio[name='+name+'][value='+value+']').attr("checked",true);
	$('input:radio[name='+name+'][value='+value+']').parent().show();

	inputs.on('click', function(){
		$(this).parent().hide();
		$(this).attr("checked", false);
		$(this).parent().siblings("label").show();
		$(this).parent().siblings("label").children().attr("checked", true);
	});
}

function addhiddenText(layerId, layerId2)
{
	$("#"+layerId2).children().remove('input');

	var _input = "";

	$("#"+layerId).find("input").each(function(){
		if($(this).is(":checked"))
		{
			_input += "<input type='hidden' name='"+$(this).attr("name")+"' value='"+$(this).val()+"'>";
		}
	});

	$("#"+layerId).find("select").each(function(){
		_input += "<input type='hidden' name='"+$(this).attr("name")+"' value='"+$(this).val()+"'>";
	});

	$("#"+layerId2).append(_input);
}

//------- tooltip-----------------------------------------------------------------
var savePath = "";

function showTooltip(obj, path, layerID, size )
{
	$("#ajaxLoadingLayer").remove();

	// 로딩할 부분 레이어 껍데기 정의
	var code = '<div class="tooltip_area"><div class="tooltip_content"><a class="tooltip_close tooltipCloseBtn" href="javascript:void(0)"></a><div class="tooltip_real"></div></div></div>';
	var curLayerID = $("body").find('.tooltip_area').attr("layerID");

	$("body").find('.tooltip_area').remove();

	if (curLayerID != layerID)
	{
		$("body").append( code );
		$(".tooltip_area").attr("layerID", layerID, size);
		$.get(path, function(data) {

			if(layerID)
			{
				$("#dumy").empty()
				$("#dumy").append(data);
				$('.tooltip_area').find('.tooltip_real').append($("#dumy").find(layerID));
			}else{
				$('.tooltip_area').find('.tooltip_real').append(data);
			}

			tooltipAddEvent($('.tooltip_area'), obj, layerID, size)
		});

		event.stopPropagation();
		return false;
	}

	$('body').append('<div id="ajaxLoadingLayer" class="hide" style="display: none;"></div>');
}

function tooltipAddEvent(obj, btn, layerID, size)
{
	if($(obj).find("img").length > 0)
	{
		$(obj).find("img").each(function() {
			 $(this).load(function(){
				 tooltipSetPos(obj, btn, size)
				 $(obj).show()
			 });
		});
	}else{
		 tooltipSetPos(obj, btn, size)
		 obj.show();
	}

	$('.tooltipCloseBtn').on('click', function(){
		obj.remove();
	});

	$(document).on('click', function(){
		obj.remove();
	});

	obj.on('click', function(){
		event.stopPropagation();
	});

	if(obj.height() < 600)
	{

		obj.find('.con_wrap').css("overflow-x", "hidden");

	}
}

function tooltipSetPos(obj, btn, size)
{
	var tgW;
	var tgH;
	var btnW		= $(btn).width();
	var btnH		= $(btn).height();
	var scrollTop   = $(document).scrollTop()-2;
	var posX		= $(btn).offset().left + btnW;
	var posY		= $(btn).offset().top;
	var winW		= $(window).width();
	var winH		= $(window).height();	

	switch(size)
	{
		case "sizeR":
			tgW = 800;
		break;

		case "sizeL":
			tgW = 800;
		break;

		case "sizeM":
			tgW = 600;
		break;

		default:
			if(size)
			{
				tgW = size;
			}else{
				tgW = 400;
			}
		break;
	}

	obj.css("width", tgW+"px")

	if(obj.height() > 600)
	{
		tgH	= 600;
		obj.css("height", tgH+"px");
		obj.find('.con_wrap').css("height", "550px");

	}else{
		tgH	= obj.height();

	}

	if( winW - posX - tgW < 0)
	{
		obj.css("left", winW-tgW);
	}else{
		obj.css("left", posX);
	}

	if(winH - (posY - scrollTop) - tgH < 0)
	{
		if( winW - posX - tgW < 0)
		{
			obj.css("top", posY - tgH);
		}else{
			obj.css("top", posY - (tgH - (winH - (posY - scrollTop)) + 2));
		}

	}else{

		if( winW - posX - tgW < 0)
		{
			obj.css("top", posY + btnH);
		}else{
			obj.css("top", posY);
		}
	}
}

//------- tooltip end-----------------------------------------------------------------
function unique(array){
  return array.filter(function(el, index, arr) {
      return index == arr.indexOf(el);
  });
}



//------- 반응형 레이어 팝업( 191227, sjg, 비디오 커머스 작업중 추가 ) :: START -------------------------------------------------

/* responsive layer popup - center align */
function showCenterLayer( selector, option1 ) {
	if ( option1 == 'brother' ) {
		var gon = $(selector).parent().find('.resp_layer_pop');
	} else {
		var gon = $(selector);
	}

	if ( gon.length < 1 )  return false;

	var popContentScrollHeight = document.body.clientHeight - 80;
	var gon_bg = $('<div class="resp_layer_bg"></div>');

	gon.find('.y_scroll_auto').css( 'max-height', popContentScrollHeight + 'px' );
	gon.find('.y_scroll_auto2').css( 'max-height', (popContentScrollHeight - 63) + 'px' );

	if ( gon.hasClass('maxHeight') && window.innerWidth > 767 ) {
		gon.find('.y_scroll_auto').css( 'max-height', (popContentScrollHeight - 40) + 'px' );
		gon.find('.y_scroll_auto').css( 'min-height', (popContentScrollHeight - 40) + 'px' );
	} else if ( window.innerWidth > 767 ) {
		gon.find('.y_scroll_auto2').css( 'max-height', (popContentScrollHeight - 83) + 'px' );
	}

	if ( window.innerWidth > 767 ) {
		gon.css({
			'top': '50%',
			'left': '50%',
			'marginLeft': (gon.outerWidth() / 2) * -1,
			'marginTop': (gon.outerHeight() / 2) * -1
		});
	} else {
		gon.addClass('small_screen');
	}
	$( window ).on('resize', function() {
		if ( window.innerWidth > 767 ) {
			gon.removeClass('small_screen');
			gon.css({
				'top': '50%',
				'left': '50%',
				'marginLeft': (gon.outerWidth() / 2) * -1,
				'marginTop': (gon.outerHeight() / 2) * -1
			});
		} else {
			gon.addClass('small_screen');
		}
	});
	if ( $('.resp_layer_bg').length < 1 ) {
		$('body').append( gon_bg );
	} else if ( option1 != 'inner_layer' ) {
		$('.resp_layer_pop:not(' + selector + ')').addClass('wait_hide');
	}
	gon.show();
	$('body').css('overflow', 'hidden');
	return false;
}

function hideCenterLayer( selector, option1 ) {
	if ( selector ) {
		var gon = $(selector);
		gon.hide();
	} else {
		$('.resp_layer_pop').hide();
	}
	if ( option1 != 'inner_layer' ) {
		$('.resp_layer_bg').remove();
		$('body').css('overflow', 'auto');
	}
}

function removeCenterLayer( selector ) {
	var res_layer_num = $('.resp_layer_pop:visible').length;
	if ( res_layer_num > 1 ) {
		$('.resp_layer_pop').removeClass('wait_hide');
	} else {
		$('.resp_layer_bg').remove();
		$('body').css('overflow', 'auto');
	}
	if ( selector ) {
		$(selector).remove();
	} else {
		$('.resp_layer_pop').remove();
	}
}


function showModal( id ) {
	var gon_bg = $('<div class="resp_layer_bg"></div>');
	if ( id ) gon_bg.attr( 'id', id );
	if ( $('.resp_layer_bg').length < 1 ) {
		$('body').append( gon_bg );
	}
	$('body').css('overflow', 'hidden');
	return false;
}
function hideModal() {
	$('.resp_layer_bg').remove();
	$('body').css('overflow', 'auto');
}
/* //responsive layer popup - center align */

function camelToUnder(arr) {

	if(Array.isArray(arr) == true) {
		for (var i = 0; i < arr.length; i++) {
			camelToUnder(arr[i]);
		}
	} else {
		$.each(arr, function(key, value) {
			camelKey = key.replace(/([A-Z])/g, function(arg){
				return "_"+arg.toLowerCase();
			});
			arr[camelKey] = value;
			delete arr[key];
		});
	}
	return arr;
}

//------- 반응형 레이어 팝업( 191227, sjg, 비디오 커머스 작업중 추가 ) :: END -------------------------------------------------

function setCookiePath(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays*24*60*60*1000));
	var expires = "expires="+d.toUTCString() + ';path=/';
	document.cookie = cname + "=" + cvalue + "; " + expires;
}

function deleteCookie( cookieName ){
	var expireDate = new Date();
	//어제 날짜를 쿠키 소멸 날짜로 설정한다.
	expireDate.setDate( expireDate.getDate() - 1 );
	document.cookie = cookieName + "= ; expires=" + expireDate.toGMTString() + "; path=/";
}

