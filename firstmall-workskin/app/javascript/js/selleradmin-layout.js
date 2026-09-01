$(function(){

	/* 상단 대쉬보드 스크롤처리 */
	var dashBoardObj = $("#page-title-bar");
	var LNBObj = $(".LNB");
	var headerObj = $("#layout-header");

	if(dashBoardObj[0]){
		var defaultDashBoardTop = parseInt(dashBoardObj.offset().top);

		$(window).bind('scroll resize',function(){
			var scrollTop = parseInt($(document).scrollTop());

			if(scrollTop>defaultDashBoardTop){
				headerObj.addClass('flyingMode');
				dashBoardObj.addClass('flyingMode');
				LNBObj.addClass('flyingMode');	
				if(parseInt($(".LNB").css("left")) < 0) dashBoardObj.addClass('close');		
				dashBoardObj.find("span.btn.black").removeClass('black').addClass('cyanblue');
				dashBoardObj.find(".icon-arrow-right").removeClass('icon-arrow-right').addClass('icon-arrow-right_gray');
				$('.page-env-btn').addClass('page-env-btn-flying');			
				if(LNBObj.length==0)dashBoardObj.addClass('v2');	
				$("#page-title-bar.flyingMode .page-buttons-right, #page-title-bar.flyingMode .page-goods-helper-btn > table").css("padding-right",  $(window).width() - $("#layout-body").width() + 40);
				$(".ico_floating_top").removeClass("off");			
			}else{
				headerObj.removeClass('flyingMode');
				dashBoardObj.removeClass('flyingMode');
				dashBoardObj.removeClass('motion');
				dashBoardObj.removeClass('close');
				LNBObj.removeClass('flyingMode');
				dashBoardObj.find("span.btn.cyanblue").removeClass('cyanblue').addClass('black');
				dashBoardObj.find(".icon-arrow-right_gray").removeClass('icon-arrow-right_gray').addClass('icon-arrow-right');
				$('.page-env-btn').removeClass('page-env-btn-flying');
				$("#page-title-bar .page-buttons-right, #page-title-bar .page-goods-helper-btn > table").css("padding-right", 0);
				$(".ico_floating_top").addClass("off");
			}

			dashBoardObj.trigger('classChange');
		});
	}	

	/* 셀렉트박스 스타일 */
	$(".custom-select-box").customSelectBox();
	$(".custom-select-box-multi").customSelectBox({'multi':true});

	/* 서브 레이아웃 라운딩 처리  */
	$("div.slc-body-wrap").each(function(){

		/* 바디부분 라운드 처리 */
		$("div.slc-body",this)
		.wrap("<div class='slc-body-wtl body-height-resizing'></div>")
		.wrap("<div class='slc-body-wtr body-height-resizing'></div>")
		.wrap("<div class='slc-body-wbl body-height-resizing'></div>")
		.wrap("<div class='slc-body-wbr body-height-resizing'></div>");
	
		/* 바디부분 높이 리사이징 */
		$(window).bind('ajaxComplete resize',function(){
			if($("div.slc-body").offset().top+$("div.slc-body").outerHeight() < $(window).height()-50){
				$("div.slc-body").css('min-height',$(window).height()-$("div.slc-body").offset().top-50);
			}
		}).trigger('ajaxComplete');
		
		/* 백그라운드 변경 */
		$("body").css('background-color','#32323a');
		$("#layout-body").css('padding-bottom',0);

	});

	/* 이미지체크박스 스타일 */
	$(".imageCheckboxContainer").each(function(){
		var imageCheckboxContainer = this;
		$(".imageCheckboxItem img",this).bind('click',function(event){
			event.preventDefault();
			$(this).closest("label").children('input').click().change();
		});
		$(".imageCheckboxItem input[type='radio']",this).bind('change',function(){
			if($(this).is(":checked")){
				$(imageCheckboxContainer).find(".imageCheckboxItem").removeClass('selected').children().css('opacity',1);
				$(this).closest(".imageCheckboxItem").addClass('selected').children().css('opacity',0.8);
			}
		});

		if($(".imageCheckboxItem input[type='radio'][checked]",this).length){
			$(".imageCheckboxItem input[type='radio'][checked]",this).change();
		}else{
			$(".imageCheckboxItem:eq(0) input[type='radio']",this).attr('checked',true).change();
		}
	});

	/* body 리사이징 */
	$(".body-height-resizing").each(function(){
		var thisOffsetTop = ($(this).offset().top-$(this).parent().offset().top)+15;
		var thisHeight = $(this).outerHeight();
		var parentHeight = $(this).parent().innerHeight();

		if((thisOffsetTop+thisHeight)<parentHeight){
			$(this).css('min-height',parentHeight-thisOffsetTop);
		}
	});
	
	/* Ajax 로딩미이지 */
	$("#ajaxLoadingLayer").ajaxStart(function() {
		loadingStart(this);
	});
	$("#ajaxLoadingLayer").ajaxStop(function() {
		loadingStop(this);
	});	
	
	/* 가비아 출력 패널 (배너,팝업,공지,업그레이드) */
	$("div.gabia-pannel").each(function(){
		var pannel = this;
		
		if(!$(this).attr("noAnimation")){
			$(pannel).activity({segments: 8, width: 3.5, space: 1, length: 7, color: '#666', speed: 1.5});
		}
		
		$.ajax({
			'url' : '/selleradmin/common/getGabiaPannel',
			'data' : {'code':$(this).attr("code")},
			'global' : false,
			'success' : function(html){
				if(html){
					$(pannel).show().html(html);
					if(!$(this).attr("noAnimation")){
						$(pannel).activity(false);
					}
				}else{
					$(pannel).hide();
				}
			}
		});
	});

	/* 플러스>몰인몰 입점사공지 */
	$("div.sellernotice-pannel").each(function(){
		var pannel = this;
		
		if(!$(this).attr("noAnimation")){
			$(pannel).activity({segments: 8, width: 3.5, space: 1, length: 7, color: '#666', speed: 1.5});
		}
		
		$.ajax({
			'url' : '/selleradmin/common/getSellerNoticePannel',
			'data' : {'url':$(this).attr("url")},
			'global' : false,
			'success' : function(html){
				if(html){
					$(pannel).show().html(html);
					if(!$(this).attr("noAnimation")){
						$(pannel).activity(false);
					}
				}else{
					$(pannel).hide();
				}
			}
		});
	});
	
	/* 상단 메뉴 관련*/
	{
			
		$("#layout-header .header-gnb-container table.header-gnb td.mitem-td").each(function(){
			$(this)
			.bind('mouseenter',function(){
				$("div.submenu",this).stop(true,true).slideDown('fast');	
			})
			.bind('mouseleave',function(){
				$("div.submenu",this).stop(true,true).slideUp('fast');	
			});
		});
		
		$("#layout-header .header-gnb-container ul.header-qnb li.gnb-item").each(function(){
			$(this)
			.bind('mouseenter',function(){
				$("ul.gnb-subnb",this).stop(true,true).slideDown('fast');	
			})
			.bind('mouseleave',function(){
				$("ul.gnb-subnb",this).stop(true,true).slideUp('fast');	
			});
		});		
	
		$("#layout-header .header-snb-container ul.header-snb .hsnb-manager").click(function(){
			$(this).toggleClass('opened');
		});
	}
	
	/* 상단 검색폼 */
	$("#layout-header select.hsb-kind").each(function(){
		switch($("option:selected",this).text())
		{
			case '주문': var keywordTitle = "주문자,수령자,입금자,아이디 등"; break;
			case '출고': var keywordTitle = "아이디,주문자,수령자 등"; break;
			case '회원': var keywordTitle = "이름,아이디,이메일,연락처,주소"; break;
			case '상품': var keywordTitle = "상품명,상품코드"; break;
			default : var keywordTitle = "검색";
		}
		$("#layout-header input[name='header_search_keyword']").attr("title",keywordTitle);
	}).bind('keyup change',function(){
		var keywordObj = $("#layout-header input[name='header_search_keyword']");
		switch($("option:selected",this).text())
		{
			case '주문': 
				var keywordTitle	= "주문자,수령자,입금자,아이디 등"; 
				var action			= "/selleradmin/order/catalog";
				break;
			case '출고': 
				var keywordTitle	= "아이디,주문자,수령자 등"; 
				var action			= "/selleradmin/export/catalog";
				break;
			case '회원': 
				var keywordTitle	= "이름,아이디,이메일,연락처,주소"; 
				var action			= "/selleradmin/member/catalog";
				break;
			case '상품': 
				var keywordTitle	= "상품명,상품코드"; 
				var action			= "/selleradmin/goods/catalog";
				break;
			default : var keywordTitle = "검색";
		}

		$("#headForm").attr("action",action);		
		
		if(keywordObj.val()==keywordObj.attr('title')){
			keywordObj.attr("title",keywordTitle);
			keywordObj.val('').focusout();
		}
		
		keywordObj.attr("title",keywordTitle);

	}).change();

	// 상단 검색어 레이어 박스 : start
	$("#header_search_keyword").keyup(function () {
		if ($(this).val()) {
			$('.header_txt_keyword').text($(this).val());
			headerSearchLayerOpen();
		}else{
			$('.header_searchLayer').hide();
		}
	});

	$("#header_search_keyword").focus(function () {
		if ($(this).val() && $(this).val()!=$(this).attr('title')) {
			$('.header_txt_keyword').text($(this).val());
			headerSearchLayerOpen();
		}
	});

	$(".searchBtn").click(function () {
		var sType = $('#header_search_type').val();
		$('#header_search_type').val(sType);
		var action = "/selleradmin/order/catalog";
		if (sType=='export') action = "/selleradmin/export/catalog";
		if (sType=='goods') action = "/selleradmin/goods/catalog";
		if (sType=='coupon') action = "/selleradmin/goods/social_catalog";
		$("#headForm2").attr("action",action);
		$('.header_searchLayer').hide();
		setHeaderSearchTxt(sType);
		$("#headForm2").submit();
	});

	var offset = $("#header_search_keyword").offset();
	$('.header_search_type_text').css({
		'position' : 'absolute',
		'z-index' : 999,
		'left' : 0,
		'top' : 0,
		'width':$("#header_search_keyword").width()-1,
		'height':$("#header_search_keyword").height()-4
	});

	$(".header_search_type_text").click(function () {
		$(".header_search_type_text").hide();
		$("#header_search_keyword").focus();
	});

	$(".header_searchLayer ul li").hover(function() {
		$(".header_searchLayer ul li").removeClass('hoverli');
		$(this).addClass('hoverli');
	});

	$("#header_search_keyword").keydown(function (e) {
		var searchbox = $(this);

		switch (e.keyCode) {
			case 40:
				if($('.headerSearchUl').find('li.hoverli').length == 0){
					$('.headerSearchUl').find('li:first-child').addClass('hoverli');
				}else{
					if($('.headerSearchUl').find('li:last-child').hasClass("hoverli") ){
						$('.headerSearchUl').find('li::last-child.hoverli').removeClass('hoverli');
						$('.headerSearchUl').find('li:first-child').addClass('hoverli');
					}else{
						$('.headerSearchUl').find('li:not(:last-child).hoverli').removeClass('hoverli').next().addClass('hoverli');
					}
				}
				break;
			case 38:
				if($('.headerSearchUl').find('li.hoverli').length == 0){
					$('.headerSearchUl').find('li:last-child').addClass('hoverli');
				}else{
					if($('.headerSearchUl').find('li:first-child').hasClass("hoverli")){
						$('.headerSearchUl').find('li::first-child.hoverli').removeClass('hoverli');
						$('.headerSearchUl').find('li:last-child').addClass('hoverli');
					}else{
						 $('.headerSearchUl').find('li:not(:first-child).hoverli').removeClass('hoverli').prev().addClass('hoverli');
					}
				}
				break;
			case 13 :
				var index=0;
				 $('.headerSearchUl').find('li').each(function(){
					if($(this).hasClass("hoverli")){
						index=$(this).index();
					}
				});
				
				$('.headerSearchUl').find('li>a').eq(index).click();
				//$('.header_searchLayer').hide();
				$("#header_search_keyword").blur();
				e.keyCode = null;
				return false;
				break;
		}
	});
	// 상단 검색어 레이어 박스 : end

	
	/* QR코드 안내 */
	$(".qrcodeGuideBtn").live('click',function(){
		if($(this).attr('target')=='parent'){
			parent.openDialog("QR 코드","qrcodeGuideLayer",{"width":950,"height":665});
			var doc = parent.document;
		}else{
			openDialog("QR 코드","qrcodeGuideLayer",{"width":950,"height":665});
			var doc = document;
		}
		
		$("#qrcodeGuideLayer",doc).html('');
		$.ajax({
			'url' : '/selleradmin/common/qrcode_guide?key=' + $(this).attr('key') + '&value=' + $(this).attr('value'),
			'success' : function(result){
				$("#qrcodeGuideLayer",doc).html(result);
			}
		});
		return false;
	});

	$(".env_location").click(function(){
		env = $(this).attr('env');
		if	(env != 'all'){
			title = env+' 현재 페이지에서 → 다음 쇼핑몰의 페이지로 이동 가능합니다.'
			openDialog(title,"env_move",{"width":950,"height":350});
		}else{
			openDialogAlert('현재 페이지는<br />전체 쇼핑몰의 통합 설정 메뉴 입니다.',400,180);
		}
	});

	//login 페이지에서 header 관련 스크립트 미실행
	if(window.location.pathname.split("/")[2]=="login") return;			

	// 매뉴얼 버튼 링크
	$(".main_title_wrap .top_btn_wrap").each(function(){
		if(gl_admin_menual_hidden) return;
		$(".top_btn_wrap")
		$(".page-global-btn" + gl_goods_quick_topmenu).appendTo($(this)).show();
		$(".page-manual-btn" + gl_goods_quick_topmenu).appendTo($(this)).show().attr('href','https://gmanual.firstmall.kr/html/manual.php?url=' + gl_admin_menual_url);
	})

	$(".LNB").each(function(){
		
		//LNB 활성 이벤트 
		$(".submenu > ul > li > div ").click(function(){
			var obj = $(this).closest("li");
			$(this).parents(".submenu").siblings().children().children().removeClass("current") 
			obj.addClass("current");
			$(this).parents(".submenu").siblings().find(".sub").css("height", "0")
			$(this).next(".sub").css("height", $(this).next(".sub").find("li").length * 33);				
		});
		
		//LNB 오픈 시 세팅된 서브메뉴 height  
		$(".submenu > ul > li.current .sub").css("height", $(".submenu > ul > li.current .sub").find("li").length * 33 );

		//LNB 열고 닫기 이벤트 			
		$("#lnbCloseBtn").click(function(){						
			if(parseInt($(".LNB").css("left")) < 0){	
				//LNB 열림				
				$(".LNB, .total_menu").removeClass("close");						
				if($(window).width() > 1450) $(".contentsWarp, #page-title-bar.flyingMode").removeClass("close");					
			}else{	
				//LNB 닫힘				
				$(".LNB, .contentsWarp, .total_menu, #page-title-bar.flyingMode").addClass("close");
			}
			
			$("#page-title-bar.flyingMode").addClass("motion");	
		})							
	})

	$(window).resize(function(){			
		resize();
	})
	
	resize();

	// 상단 메뉴 활성 비활성
	var hsnbClass = ["hsnb-admin"];
	for(var hsnbnum=0; hsnbnum<hsnbClass.length; hsnbnum++){
		$("#layout-header .header-snb ."+hsnbClass[hsnbnum]+" .openBtn").eq(0).click(function(){				
			if( $(this).hasClass('opened') ){
				$("#layout-header .header-snb .item > .openBtn, #layout-header .header-snb .item > .hsnbm-menu").removeClass('opened');
			}else{
				$("#layout-header .header-snb .item > .openBtn, #layout-header .header-snb .item > .hsnbm-menu").removeClass('opened');
				$(this).addClass('opened');
				$(this).next().addClass('opened');
			}
		});
	}

	//전체보기 메뉴
	$(".totalMenu").click(function(){	
		$("#totalMenuDialog").load('../common/total_menu');
		$("#totalMenuDialog").show()
		$("html").css('overflow-y', 'hidden');			
	});

	// 구신 스위치버튼 이벤트
	$(document).on('click',".ver_change_btn", function(){
		skinSwipeToggleEvent(this);			
	});	

	$(".ver_change_btn").show();
	$(".ver_change_btn").css("right", $(".header-snb").width() + 10)
	
	// top버튼 이벤트
	$(".ico_floating_top").click(function() {
		$("html, body").animate({ scrollTop: 0 }, "fase");
		return false;
	});

});

//화면 리사이징 시 컨테츠 영역 사이즈 조절 
function resize(){

	/* 상단 주메뉴 이슈 카운트 표시 */	
	$(".header-gnb-issueCount-layer").each(function(){
		var code = $(this).attr('code');
		var mitemtdObj = $(".mitem-td").filter("[code='"+code+"']");
		$(this).attr('code',code);
		if	($(this).tagName){
			$(this).css({'width' : mitemtdObj.outerWidth()});
		}
	});

	$("#totalMenuDialog").each(function(){
		$("#totalMenuDialog .pannel").css("width", $(window).width() - 190)
	})		

	if($(".LNB").length == 0) return

	// 화면크기 또는 LNB 노출 설정에 따라
	if($(window).width() < 1450 || gl_lnb_close_yn == 'y'){
		//LNB 닫힘				
		$(".contentsWarp, #page-title-bar.flyingMode").addClass("close");						
		if($(".LNB").offset().left == 0) $(".LNB, .total_menu").addClass("close");							
	}else{	
		//LNB 열림			
		$(".contentsWarp, #page-title-bar.flyingMode").removeClass("close");	
		if($(".LNB").offset().left < 0) $(".LNB, .total_menu").removeClass("close");										
	}

	$("#page-title-bar.flyingMode").addClass("motion");	
}	


//구신 어드민 스킨 토글
function skinSwipeToggleEvent(el) {		
	var _obj 		= $(el);
	var skinType 	= _obj.attr("data-admin-skin-type");

	if(skinType == 'new') {
		skinType = 'org';
	} else {
		skinType = 'new';
	}

	$.ajax({
		'url' : '../common/setSkinSwipeToggle',
		'data' : {'skinType': skinType},
		'type': 'POST',
		'datatype': 'json',
		'success' : function(res){
			_obj.attr("data-admin-skin-type", skinType);
			location.reload();
		}
	});

}

function setHeaderSearchTxt(sType) {
	var search_type_array = new Array();
	search_type_array['order'] = "주문검색";
	search_type_array['export'] = "출고검색";
	search_type_array['member'] = "회원검색";
	search_type_array['goods'] = "실물상품";
	search_type_array['coupon'] = "티켓상품";
	var search_keyword = $("#header_search_keyword").val();
	search_keyword = search_keyword.replace(/(<([^>]+)>)/gi, "");
	$('.header_search_type_text').html(search_type_array[sType]+ " : " + search_keyword).show();
}

function headerSearchLayerOpen() {
	var offset = $("#header_search_keyword").offset();
	if( offset) {
		$('.header_searchLayer').css({
			'position' : 'absolute',
			'z-index' : 999,
			'left' : -1,
			'top' : '100%',
			//'width':$("#header_search_keyword").width()+32
			'width':$("#headForm2").width()-5
		}).show();
	}
}

/* 주문상세정보 열기,닫기 처리 */
function toggleOrderDetailBody(btn){
	$(btn).toggleClass("opened");
	$(btn).parents(".order-list-summary-row").find(".order-detail-table").toggleClass("summary-mode");
}

// 우편번호 다이얼로그 박스
function openDialogZipcode(zipcodeFlag,idx,ziptype){
	if(! $(this).is("#"+zipcodeFlag+"Id") ){
		$("body").append("<div id='"+zipcodeFlag+"Id'></div>");

		var url = '../popup/zipcode';
		var params = {'zipcodeFlag':zipcodeFlag,'keyword':'','zipcode_type':ziptype};
		
		if(idx) params.idx = idx; 
		
		$.get(url,params, function(data) {
			$("#"+zipcodeFlag+"Id").html(data);
		});
		openDialog("우편번호 검색 <span class='desc'>지역명으로 우편번호를 검색합니다.</span>",zipcodeFlag+"Id", {"width":950,"height":650});
		setDefaultText();
	}
}

function set_shipping_otp(datas){
	var shipping_set_seq = datas['shipping_set_seq'];
	var shipping_group_seq = datas['shipping_group_seq'];
	var shipping_set_type = datas['shipping_set_type'];
	
	$.ajax({
		'url' : '../setting/shipping_otp_insert',
		'data' : {'shipping_set_seq': shipping_set_seq, 'shipping_group_seq': shipping_group_seq, 'shipping_set_type': shipping_set_type},
		'dataType' : 'json', //'json'
		'success' : function(res){
			if(res == 'ERROR'){
				alert('옵션 등록 실패');
				return false;
			} else {
				console.log(res);
			}
		}
	});
}

function shipping_zone_list(id, shipping_cost_seq, total, perpage, keyword){
	var html = '';
	var offset = 20;
	
	$.ajax({
		'url' : '../setting/shipping_zone_list',
		'data' : {'shipping_cost_seq': shipping_cost_seq, 'total': total, 'perpage': perpage, 'offset': offset, 'type': 'shipping_zone_list', 'keyword': keyword},
		'dataType' : 'json', //'json'
		'success' : function(res){
			if(res.list.length > 0){
				$.each(res.list, function( index, value ) {
					var num = ((((perpage-1) * offset) + index) + 1);
					html += '<tr id="zone_'+value.area_detail_seq+'">';
					html += '<td><label class="resp_checkbox"><input type="checkbox" class="chk" value="'+value.area_detail_seq+'"></label></td>';
					html += '<td>'+ num + '</td>';
					html += '<td>'+ value.area_detail_address_txt + '</td>';
					html += '</tr>';
				});
			} else {
				html = '<tr><td class="its-td center" colspan="4">지역이 없습니다.</td></tr>';
				res.paging = '';
			}
			
			if(id == ''){
				$("#select_address_tb tbody").html(html);
				$(".paging_navigation").html(res.paging);
			} else {
				$("#"+id+" #select_address_tb tbody").html(html);
				$("#"+id+" .paging_navigation").html(res.paging);
			}
			
			
			if(total <= 0){
				$("#price_"+get_p_type).find(".zone_idx_"+get_idx+" .add_zone").attr("data-total", res.total);
				$("#price_"+get_p_type).find(".zone_idx_"+get_idx+" .zone_cnt").text("("+res.total+")");
				$("#price_"+get_p_type).find(".zone_idx_"+get_idx+" .issue").val(res.total);
				
				if(res.total <= 0){
					$("#price_"+get_p_type).find(".zone_idx_"+get_idx+" .std_btn_area").show();
				} else {
					$("#price_"+get_p_type).find(".zone_idx_"+get_idx+" .std_btn_area").hide();
				}
			}
		}
	});
}

// 배송비 지역 다이얼로그 박스 :: 2016-05-30 lwh
function openDialogzone(nation,p_type,idx,datas){
	var id = nation+"_"+idx;
	var title = '대한민국'
	if(! $(this).is("#"+id) ){
		$("body").append("<div id='"+id+"'></div>");

		var url = '../popup/zipcode_zone';
		var params = {'keyword':'','nation':nation,'p_type':p_type,'idx':idx};

		if(nation != 'korea'){
			$.get(url, params, function(data) {
				$("#"+id+"").html(data);
			});

			title = '해외 국가';
		} else {
			$.get(url, params, function(data) {
				$("#"+id+"").html(data);
				
				//등록 리스트 가져오기
				if(datas['shipping_cost_seq'] > 0){
					var shipping_cost_seq = datas['shipping_cost_seq'];
					var total = datas['total'];
					
					shipping_zone_list(id, shipping_cost_seq, total, 1);
					$("#"+id+" input[name='shipping_cost_seq']").val(shipping_cost_seq);
					$("#"+id+" input[name='option_seqs']").val(datas.option_seqs);
					$("#"+id+" input[name='total_count']").val(datas.total);
				}
			});
		}
		openDialog(title, id, {"width":900,"height":850,"close":function(){$("#"+id).remove();}});
		setDefaultText();
	}
}

/* 파일첨부 Input박스 버튼 변경 */
function changeFileStyle(){
	$("input[type='file']").each(function(){

		var oriFilebox = $(this);
		if(oriFilebox.attr('mode') == 'new') {
			var newFilebox = $('<input type="text" value="" size="'+this.size+'" class="'+oriFilebox.attr('iclass')+'" readonly style="cursor:default" />');
			var newBtn = $('<label class="resp_btn v2 mr5">파일 선택</label>');
	
			oriFilebox.css({
				'width'	: '82px',
				'height' : '20px',
				'cursor' : 'pointer',
				'opacity' : '0'
			});
	
			oriFilebox.before(newBtn).after(newFilebox);
			newBtn.append(oriFilebox);
	
			oriFilebox.bind("change",function(){
				newFilebox.val(oriFilebox.val().replace(/C:\\fakepath\\/i, ''));
			});
		} else {
			var newFilebox = $('<input type="text" value="" size="'+this.size+'" class="'+this.className+' line uploadifyViewBox" readonly style="cursor:default" />');
			var newBtn = $('<label class="resp_btn v2 mr5">파일 선택</label>');
	
			oriFilebox.css({
				'width'	: '82px',
				'height' : '20px',
				'cursor' : 'pointer',
				'opacity' : '0'
			});
	
			oriFilebox.after(newBtn).after(newFilebox);
			newBtn.append(oriFilebox);
	
			oriFilebox.bind("change",function(){
				newFilebox.val(oriFilebox.val());
			});
		}
	});
}

/* copyContent 클립보드 복사 */
function copyContent(str) 
{ 
	browser = navigator.userAgent.toLowerCase();
	if(window.clipboardData && (document.selection || window.getSelection)) { // IE
		bResult = window.clipboardData.setData("Text",str);
	}else if(browser.indexOf('chrome') > -1){
		bResult = copyTextToClipboard(str);
	}else{
		alert("해당 브라우저는 클립보드를 사용할 수 없습니다.");
		return;
	}

	if(bResult){
		alert('클립보드에 저장되었습니다.');
	}
};

function copyTextToClipboard(text) {
	var copyFrom = $('<textarea/>');
	copyFrom.text(text);
	$('body').append(copyFrom);
	copyFrom.select();
	document.execCommand('copy');
	copyFrom.remove();

	return 'OK';
}

/* 파일업로드버튼(Uploadify) 적용 */
function setUploadifyButton(uplodifyButtonId, setting){	
	//한글도메인체크@2013-03-12
	var fdomain = document.domain;
	var kordomainck = false;
	for(i=0; i<fdomain.length; i++){
	 if (((fdomain.charCodeAt(i) > 0x3130 && fdomain.charCodeAt(i) < 0x318F) || (fdomain.charCodeAt(i) >= 0xAC00 && fdomain.charCodeAt(i) <= 0xD7A3)))
	{
		kordomainck = true;
		break;
	}
	}
	if( !kordomainck ){
	krdomain = '';
	}


	var defaultSetting = {
		'script'			: krdomain+'/selleradmin/webftp/upload_file',
	    'uploader'			: '/app/javascript/plugin/jquploadify/uploadify.swf',
	    'buttonImg'			: '/app/javascript/plugin/jquploadify/uploadify-search.gif',
	    'cancelImg'			: '/app/javascript/plugin/jquploadify/uploadify-cancel.png',
	    'fileTypeExts'		: '*.jpg;*.gif;*.png;*.jpeg',
	    'fileTypeDesc'		: 'Image Files (.JPG, .GIF, .PNG)',
	    'removeCompleted'	: true,
		'width'				: 64,
		'height'			: 20,
	    'folder'			: '/data/tmp',
	    'auto'				: true,
	    'multi'				: false,
	    'scriptData'		: {'randomFilename':1},
	    'completeMsg'		: '적용 가능',
		'onCheck'     : function(event,data,key) {
			$("#"+uplodifyButtonId+key).find(".percentage").html("<font color='red'> - 파일명 중복</font>");
	    },
	    'onComplete'		: function (event, ID, fileObj, response, data) {
	    	var result = eval(response)[0];
	    	
			if(result.status!=1){
				openDialogAlert(result.msg,400,150);
				$("#"+uplodifyButtonId+ID).find(".percentage").html("<font color='red'> - "+result.desc+"</font>");
				return false;
			}else{
				/* mini_webftp 연동을 위한 세팅 */
				//if(typeof(useWebftpFormItem)!='undefined')
				{
					//if(useWebftpFormItem)
					{
						var webftpFormItemObj = $("#"+uplodifyButtonId+ID).closest(".webftpFormItem");
						webftpFormItemObj.find(".webftpFormItemInput").val(result.filePath);
						webftpFormItemObj.find(".webftpFormItemInputOriName").val(result.fileInfo.client_name);
						webftpFormItemObj.find(".webftpFormItemPreview").attr('src','/'+result.filePath).show();
						
						if(webftpFormItemObj.find(".webftpFormItemPreviewSize").length){
							webftpFormItemObj.find(".webftpFormItemPreviewSize").html(result.fileInfo.image_width + " x " + result.fileInfo.image_height);
						}
					}
				}
			}
		},
		'onError'			: function (event,ID,fileObj,errorObj) {
			alert(errorObj.type + ' Error: ' + errorObj.info);
		}
	};
	
	if(setting){
		for(var i in setting){
			if(i=='scriptData'){
				for(var j in setting[i]){
					defaultSetting[i][j] = setting[i][j];
				}
			}else{
				defaultSetting[i] = setting[i];
			}
		}		
	}
	
	$("#"+uplodifyButtonId).uploadify(defaultSetting);

}

/*	Select박스 자동완성 
 * 	$(this).combobox();
 * */
(function( $ ) {
	$.widget( "ui.combobox", {
		_create: function() {
			var input,
				that = this,
				select = this.element.hide(),
				selected = select.children( ":selected" ),
				value = selected.val() ? selected.text() : "",
				wrapper = this.wrapper = $( "<span>" )
					.addClass( "ui-combobox" )
					.insertAfter( select );

			function removeIfInvalid(element) {
				var value = $( element ).val(),
					matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( value ) + "$", "i" ),
					valid = false;
				select.children( "option" ).each(function() {
					if ( $( this ).text().match( matcher ) ) {
						this.selected = valid = true;
						return false;
					}
				});
				if ( !valid ) {
					// remove invalid value, as it didn't match anything
					$( element )
						.val( "" );
					select.val( "" );
					input.data( "autocomplete" ).term = "";
					return false;
				}
			}

			input = $( "<input>" )
				.appendTo( wrapper )
				.val( value )
				.attr( "title", "" )
				.addClass( "ui-state-default ui-combobox-input" )
				.autocomplete({
					delay: 0,
					minLength: 0,
					source: function( request, response ) {
						var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
						response( select.children( "option" ).map(function() {
							var text = $( this ).text();
							if ( this.value && ( !request.term || matcher.test(text) ) )
								return {
									label: text.replace(
										new RegExp(
											"(?![^&;]+;)(?!<[^<>]*)(" +
											$.ui.autocomplete.escapeRegex(request.term) +
											")(?![^<>]*>)(?![^&;]+;)", "gi"
										), "<strong>$1</strong>" ),
									value: text,
									option: this
								};
						}) );
					},
					select: function( event, ui ) {
						ui.item.option.selected = true;
						that._trigger( "selected", event, {
							item: ui.item.option
						});
						select.change();
					},
					change: function( event, ui ) {
						if ( !ui.item )
							return removeIfInvalid( this );
					}
				})
				.addClass( "ui-widget ui-widget-content ui-corner-left" );

			input.data( "autocomplete" )._renderItem = function( ul, item ) {
				return $( "<li>" )
					.data( "item.autocomplete", item )
					.append( "<a>" + item.label + "</a>" )
					.appendTo( ul );
			};

			$( "<a>" )
				.attr( "tabIndex", -1 )
				.attr( "title", "Show All Items" )
				.appendTo( wrapper )
				.button({
					icons: {
						primary: "ui-icon-triangle-1-s"
					},
					text: false
				})
				.removeClass( "ui-corner-all" )
				.addClass( "ui-corner-right ui-combobox-toggle" )
				.click(function() {
					// close if already visible
					if ( input.autocomplete( "widget" ).is( ":visible" ) ) {
						input.autocomplete( "close" );
						removeIfInvalid( input );
						return;
					}

					// work around a bug (likely same cause as #5265)
					$( this ).blur();

					// pass empty string as value to search for, displaying all results
					input.autocomplete( "search", "" );
					input.focus();
				});

		},

		destroy: function() {
			this.wrapper.remove();
			this.element.show();
			$.Widget.prototype.destroy.call( this );
		}
	});
})( jQuery );

/* 특정영역의 테이블을 엑셀로 다운로드하기 */
function divExcelDownload(title, selector){
	var clone = $(selector).clone();
	// input 박스 제거
	clone.find("input[type='text'],textarea,select").each(function(){
		$(this).after($(this).val());
		$(this).remove();
	});
	/*	
	// a 태그 제거
	clone.find("a").each(function(){
		$(this).after($(this).html());
		$(this).remove();
	});
	*/
	// class,style,width 제거
	//clone.find("*[class]").removeClass();
	//clone.find("*[style]").removeAttr('style');
	//clone.find("*[width]").removeAttr('width');
	clone.find("table").attr('border',1);
	clone.find("th").css('background-color','#e5e5e5');
	
	var randKey = Math.floor(Math.random()*1000000);
	
	var html = "";
	html += "<form id='divExcelDownloadForm"+randKey+"' action='../common/divExcelDownload' method='post' class='hide'>";
	html += "<textarea name='title' id='divExcelDownloadTitle"+randKey+"'></textarea>";
	html += "<textarea name='contents' id='divExcelDownloadContents"+randKey+"'></textarea>";
	html += "</form>";
	
	$(html).appendTo("body");
	
	$("#divExcelDownloadTitle"+randKey).val(title);
	$("#divExcelDownloadContents"+randKey).val(clone.html());
	$("#divExcelDownloadForm"+randKey).submit();
	
}

/* 메뉴별 이슈 카운트 출력 */
function loadIssueCounts(){

	$.ajax({
		"url" : "../common/getIssueCount",
		"dataType" : "json",
		"global" : false,
		"success" : function(data){
			for(var i in data){
				$(".header-gnb .mitem-td[code='"+i+"']").each(function(){

					$(this).find(".header-gnb-issueCount-layer[code='"+i+"']").append(getIssueCountIcon(data[i]['total'])).effect('bounce');
					$(this).find(".header-gnb-issueCount-layer").attr("style", "left:"+$(this).find("a > span").width()+"px; display:inline-block;");	
					
					if(data[i]['title']){
						$(this).find(".header-gnb-issueCount-layer[code='"+i+"']").attr('title',data[i]['title']);
					}
					$("li a[href*='order/catalog']",this).append(getIssueCountIcon(data[i]['order']));
					$("li a[href*='order/company_catalog']",this).append(getIssueCountIcon(data[i]['company_catalog']));
					$("li a[href*='export/catalog']",this).append(getIssueCountIcon(data[i]['export']));
					$("li a[href*='refund/catalog']",this).append(getIssueCountIcon(data[i]['refund']));
					$("li a[href*='returns/catalog']",this).append(getIssueCountIcon(data[i]['returns']));
					$("li a[href*='board/index']",this).append(getIssueCountIcon(data[i]['mbqna']));					
				});
				
				
				
			}
			 
			$(".header-gnb-issueCount-layer[title]").poshytip({
				className: 'tip-darkgray',
				bgImageFrameSize: 8,
				alignTo: 'target',
				alignX: 'right',
				alignY: 'inner-top',
				offsetY: 0,
				offsetX: 5,		
				allowTipHover: false,
				slide: false,
				showTimeout : 0
			});
		}
	});
	

}

/* 이슈카운트 아이콘 반환 */
function getIssueCountIcon(count){
	if(parseInt(count)>0){
		return " <span class='issueCount'><span class='hgi-left'><span class='hgi-right'><span class='hgi-bg'>"+count+"</span></span></span></span>";
	}else{
		return " <span class='issueCountZero'>0</span>";
	}
}

function layerPopupOpen(ID){
	var popupKey = "layerPopup"+ID;

	if(!$.cookie(popupKey)){
		$("#"+ID).show();
	}
}


function layerPopupClose(ID){
	var popupKey = "layerPopup"+ID;
	if($("#"+ID+" input[name='hiddenToday']").is(':checked')){
		$.cookie(popupKey,1,{expires:86500,path:'/'});
	}
	$("#"+ID).fadeOut();
}

/* 관리자 카테고리 가져오기*/
function category_admin_select_load(preSelectName,selectName,code,callbackFunction){
	$("select[name='" + selectName + "'] option").each(function(){ if( $(this).val() ) $(this).remove(); });
	if(preSelectName && !code) return;		
	$.ajax({
		type: "GET",
		url: "/selleradmin/common/category2json",
		data: "categoryCode=" + code,
		dataType: 'json',
		success: function(result){			
			var options = "";			
			for(var i=0;i<result.length;i++) options += "<option value='"+result[i].category_code+"'>"+result[i].title+"</option>";
			$("select[name='" + selectName + "']").append(options);
			if(options){
				$("select[name='" + selectName + "']").show();
			}
			if(preSelectName){
				$("select[name='" + preSelectName + "'] option[value='"+code+"']").attr("selected",true);
			}

			if(callbackFunction){
				callbackFunction(result);
			}
		}
	});
}

/* 관리자 브랜드 가져오기*/
function brand_admin_select_load(preSelectName,selectName,code,callbackFunction){
	$("select[name='" + selectName + "'] option").each(function(){ if( $(this).val() ) $(this).remove(); });
	if(preSelectName && !code) return;		
	$.ajax({
		type: "GET",
		url: "/selleradmin/common/brand2json",
		data: "categoryCode=" + code,
		dataType: 'json',
		success: function(result){			
			var options = "";			
			for(var i=0;i<result.length;i++) options += "<option value='"+result[i].category_code+"'>"+result[i].title+"</option>";
			$("select[name='" + selectName + "']").append(options);
			if(options){
				$("select[name='" + selectName + "']").show();
			}
			if(preSelectName){
				$("select[name='" + preSelectName + "'] option[value='"+code+"']").attr("selected",true);
			}

			if(callbackFunction){
				callbackFunction(result);
			}
		}
	});
}

/* 관리자 지역 가져오기*/
function location_admin_select_load(preSelectName,selectName,code,callbackFunction){
	$("select[name='" + selectName + "'] option").each(function(){ if( $(this).val() ) $(this).remove(); });
	if(preSelectName && !code) return;		
	$.ajax({
		type: "GET",
		url: "/selleradmin/common/location2json",
		data: "locationCode=" + code,
		dataType: 'json',
		success: function(result){			
			var options = "";			
			for(var i=0;i<result.length;i++) options += "<option value='"+result[i].location_code+"'>"+result[i].title+"</option>";
			$("select[name='" + selectName + "']").append(options);
			if(options){
				$("select[name='" + selectName + "']").show();
			}
			if(preSelectName){
				$("select[name='" + preSelectName + "'] option[value='"+code+"']").attr("selected",true);
			}

			if(callbackFunction){
				callbackFunction(result);
			}
		}
	});
}

/* 관리자 이벤트 가져오기*/
function event_admin_select_load(preSelectName,selectName,event_seq,callbackFunction){
	$("select[name='" + selectName + "'] option").each(function(){ if( $(this).val() ) $(this).remove(); });
	if(preSelectName && !event_seq) return;		
	$.ajax({
		type: "GET",
		url: "/selleradmin/common/event2json",
		data: "event_seq=" + event_seq,
		dataType: 'json',
		success: function(result){			
			var options = "";			
			for(var i=0;i<result.length;i++) options += "<option value='"+result[i].event_benefits_seq+"'>"+result[i].title+"</option>";
			$("select[name='" + selectName + "']").append(options);
			if(options){
				$("select[name='" + selectName + "']").show();
			}
			if(preSelectName){
				$("select[name='" + preSelectName + "'] option[value='"+event_seq+"']").attr("selected",true);
			}

			if(callbackFunction){
				callbackFunction(result);
			}
		}
	});
}

/* 에디터사용(이벤트시 에디터로딩) */
function view_editor(textid,buttonid)
{
	$("#"+textid).addClass("daumeditor");
	$("#"+buttonid).css("display","none");
	if(typeof $("#"+textid).attr('fullMode') == 'undefined') {
		$("#"+textid).attr('fullMode','1');
	}	
	DaumEditorLoader.init(".daumeditor");
}


function printOrderView(ordno, pagemode){
	if(typeof pagemode == 'undefined') var pagemode = '';
	if(!pagemode) pagemode = '';
	window.open('/selleradmin/order/order_print?ordno='+ordno+'&pagemode='+pagemode, '', 'width=850px,height=800px,toolbar=no,location=no,resizable=yes,scrollbars=yes');
}

function printExportView(ordno, code, pagemode){
	if(typeof pagemode == 'undefined') var pagemode = '';
	if(!pagemode) pagemode = '';
	if(!code){
		code = '';
	}
	window.open('/selleradmin/export/export_print?export='+code+'&ordno='+ordno+'&pagemode='+pagemode, '', 'width=850px,height=800px,toolbar=no,location=no,resizable=yes,scrollbars=yes');
}

function printInvoiceView(ordno, code){
	if(!code){
		code = '';
	}
	window.open('/selleradmin/export/invoice_prints?export='+code+'&ordno='+ordno, '', 'width=800px,height=800px,toolbar=no,location=no,resizable=yes,scrollbars=yes,menubar=yes');
}

function reset_iframe(frame_name,src_url)
{
	if(!frame_name) frame_name = "actionFrame";
	if(!src_url) src_url = "/main/blank";
	$("iframe[name='"+frame_name+"']").attr("src",src_url);
}

function admin_goods_image(iobj,goods_seq,idx,image_type){
	var img_obj = $(iobj);
	img_obj.attr('src','/selleradmin/skin/default/images/common/noimage_list.gif');
}

// 상품 선택 배송그룹 연결 :: 2016-07-01 lwh
function popup_goods_list(displayId,inputGoods,provider_seq){

	$("div#"+displayId).remove();
	$("body").append("<div id='"+displayId+"'></div>");
	$.ajax({
		type: "get",
		url: "/admin/goods/select_goods",
		data: "page=1&inputGoods="+inputGoods+"&displayId="+displayId+"&provider_seq="+provider_seq,
		success: function(result){
			$("div#"+displayId).html(result);
		}
	});
	openDialog("상품 검색", displayId, {"width":"970","height":"820","show" : "fade","hide" : "fade"});
}

var env_move = function(url){
	if	(!url)
		return;
	var now_href	= $(location).attr('href');
	var now_host	= $(location).attr('host')
	env_loc			= now_href.replace(now_host,url);
	window.open(env_loc);
}