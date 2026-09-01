
$(document).ready(function() {

	// 검색어 레이어 박스 : start
	$("#search_keyword").keyup(function () {
		if ($(this).val()) {
			$('.txt_keyword').text($(this).val());
			searchLayerOpen();
		}else{
			$('.searchLayer').hide();
		}
	});

	$("#search_keyword").focus(function () {
		if ($(this).val() && $(this).val()!=$(this).attr('title')) {
			$('.txt_keyword').text($(this).val());
			searchLayerOpen();
		}
	});

	$("a.link_keyword").click(function () {
		var sType = $(this).attr('s_type');
		$('#search_type').val(sType);
		$('.searchLayer').hide();
		$("form[name='grpForm']").submit();	
	});
	
	$("#search_keyword").blur(function(){
		if(keyword == $("#search_keyword").val()){
			$(".search_type_text").show();
		}
		setTimeout(function(){
			$('.searchLayer').hide()}, 500
		);
	});

	var offset = $("#search_keyword").offset();
	$('.search_type_text').css({
		'position' : 'absolute',
		'z-index' : 999,
		'left' : "1px",
		'top' : "1px",
		'width':$("#search_keyword").width()+8,
		'height':$("#search_keyword").height()+8
	});

	$(".search_type_text").click(function () {
		$(".search_type_text").hide();
		$("#search_keyword").focus();
	});

	$(".searchLayer ul li").hover(function() {
		$(".searchLayer ul li").removeClass('hoverli');
		$(this).addClass('hoverli');
	});

	$("#search_keyword").keydown(function (e) {
		var searchbox = $(this);

		switch (e.keyCode) {
			case 40:
				if($('.searchUl').find('li.hoverli').length == 0){
					$('.searchUl').find('li:first-child').addClass('hoverli');
				}else{
					if($('.searchUl').find('li:last-child').hasClass("hoverli") ){
						$('.searchUl').find('li::last-child.hoverli').removeClass('hoverli');
						$('.searchUl').find('li:first-child').addClass('hoverli');
					}else{
						$('.searchUl').find('li:not(:last-child).hoverli').removeClass('hoverli').next().addClass('hoverli');
					}
				}
				break;
			case 38:
				if($('.searchUl').find('li.hoverli').length == 0){
					$('.searchUl').find('li:last-child').addClass('hoverli');
				}else{
					if($('.searchUl').find('li:first-child').hasClass("hoverli")){
						$('.searchUl').find('li::first-child.hoverli').removeClass('hoverli');
						$('.searchUl').find('li:last-child').addClass('hoverli');
					}else{
						 $('.searchUl').find('li:not(:first-child).hoverli').removeClass('hoverli').prev().addClass('hoverli');
					}
				}
				break;
			case 13 :
				var index=0;
				 $('.searchUl').find('li').each(function(){
					if($(this).hasClass("hoverli")){
						index=$(this).index();
					}
				});
				
				$('.searchUl').find('li>a').eq(index).click();
				e.keyCode = null;
				//return false;
				break;
		}
	});
	
	if(search_type){
		$('.search_type_text').show();
	}

	// 검색어 레이어 박스 : end

	// 상세검색 열기/닫기
	$("#search_detail_button").click(function(){
		if($(this).val() == "open"){
			$(this).attr("title", "상세검색열기");
			$(this).text("상세검색열기");
			$(this).val("close");
			$(this).addClass("open");
			$(this).removeClass("close");
			$(".search-detail-lay").hide();
		}else{
			$(this).attr("title","상세검색닫기");
			$(this).html("상세검색닫기");
			$(this).val("open");
			$(this).addClass("close");
			$(this).removeClass("open");
			$(".search-detail-lay").show();
		}
	});

	// 모든 결제사/결제수단/유입경로 등등 체크
	$(".allSelectDrop").click(function(){
		var name	= $(this).attr("name").replace("all","");
		var title	= "";

		if(name == "pg"){
			title = "모든 결제사";
		}else if(name == "payment"){
			title = "모든 결제수단";
		}else if(name == "referer"){
			title = "모든 유입경로";
		}else if(name == "shipmethod"){
			title = "배송방법 전체";
		}

		//$(".selectbox_multi .all"+name+"").html(title);
		$("input[name='"+name+"[]']").prop("checked",$(this).is(":checked"));
	});


	$('.allCheckMark').click(function(){
		var chkName			= $(this).attr('name');
		var allCheckerName	= 'all' + chkName.replace(/\[\]/, '');

		if ($('input[name="' + chkName + '"]').length == $('input[name="' + chkName + '"]:checked').length)
			$('input[name="' + allCheckerName + '"]').attr('checked', true);
		else
			$('input[name="' + allCheckerName + '"]').attr('checked', false);
	});


	//결제사/결제수단/유입경로 체크
	$("input[name='pg[]'], input[name='payment[]'], input[name='referer[]']").click(function(){

		var ck_total	= 0;
		var title_first	= "모든";
		var title_body	= "";
		var name		= $(this).attr("name").replace("[]","");
		
		if(name == "pg"){
			title_body = "결제사";
		}else if(name == "payment"){
			title_body = "결제수단";
		}else if(name == "referer"){
			title_body = "유입경로";
		}
		var title		= title_first + " " + title_body;

		$("input[name='"+name+"[]']").each(function(){
			if($(this).is(":checked") == true){
				title = $(this).attr("title");
				ck_total++;
			}
		});

		if(ck_total > 1){ title = "선택 " + title_body; }
		//$(".selectbox_multi .all"+name+"").html(title);

	});
	//결제수단 체크
	/*
	$("input[name='payment[]']").click(function(){

		var ck_total	= 0;
		var title		= "모든 결제수단";

		$("input[name='payment[]']").each(function(){
			if($(this).is(":checked") == true){
				title = $(this).attr("title");
				ck_total++;
			}
		});

		if(ck_total > 1){ title = "선택 결제수단"; }
		$(".selectbox_multi .allpayment").html(title);

	});
	*/

	//검색 초기화
	$("#search_reset_button").click(function(){

		$("#search_detail_table, .table_search").find("input, select").each(function(e){

			var tagtype = "";

			if($(this).prop("tagName") == "select" || $(this).prop("tagName") == "SELECT"){
				tagtype = "select";
			}else{
				tagtype = "input";
			}

			if(tagtype == "input"){
				if($(this).attr("type") == "checkbox" || $(this).attr("type") == "CHECKBOX" || $(this).attr("type") == "radio" || $(this).attr("type") == "RADIO"){
					$(this).prop("checked",false);
				}else if($(this).attr("type") == "text"){
					$(this).val("");
				}
			}else{

				var name = $(this).attr("name");
				$("select[name='"+name+"'] option").each(function(){
					$(this).attr("selected","");
				});
				$("select[name='"+name+"'] option:eq(0)").attr("selected","selected");
			}
		});
	});

});


function searchLayerOpen(){
	var offset = $("#search_keyword").offset();
	if( offset) {
		$('.searchLayer').css({
			'position' : 'absolute',
			'z-index' : 999,
			'left' : -1,
			'top' : '100%',
			'width':$("#search_keyword").width()
		}).show();
	}
}