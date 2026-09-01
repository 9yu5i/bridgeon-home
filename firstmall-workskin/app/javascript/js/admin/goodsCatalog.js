// SEARCH FOLDER
function showSearch(){
	if($("#goods_search_form").css('display')=='none'){
		$("#goods_search_form").show();
		$.cookie("goods_list_folder", "folded");
	}else{
		$("#goods_search_form").hide();
		$.cookie("goods_list_folder", "unfolded");
	}
}

//$(this).attr("goods_seq")
var adminpage 			= '/admin/';
var gl_package_yn 		= gl_goods_config.package_yn;
var socialcpuse_flag 	= gl_goods_config.socialcpuse_flag;
var gift 				= gl_goods_config.gift;

$(function() {

	if(gl_goods_config.isSellerAdmin) {
		adminpage = '/selleradmin/';
	}

	var chkAuth = function(){

		if(!gl_goods_config.auth){
			alert("권한이 없습니다.");
			return false;
		}else{
			return true;
		}
	}

	$(".goods_delete_btn").on("click",function(){

		var goods_type = "상품";
		if(typeof gift != "undefined" && gift === true) {
			goods_type = "사은품";
		}

		if(!chkAuth()) return false;

		var cnt = $("#goodsList input:checkbox[name='goods_seq[]']:checked").length;
		if(cnt<1){
			alert("삭제할 "+goods_type+"을 선택해 주세요.");
			return;
		}else{

			if(gl_goods_config.scm_cfg_use == 'Y'){
				//물류관리 상품은 삭제불가능 @2016-08-16 ysm
				var scm_cfg = 0;
				$("#goodsList input:checkbox[name='goods_seq[]']:checked").each(function(){
					if( $(this).attr("scm_rtotal_stock") > 0 ){
						$(this).attr("checked",false).trigger('change');
						scm_cfg++;
					}
				});
				if( scm_cfg > 0 ){
					openDialogAlert("재고관리 "+goods_type+"은 삭제할 수 없습니다.<br/>재고관리 "+goods_type+"은 체크 해제되었습니다.<br />다시한번 삭제해 주세요.",400,160,'','');
					return;
				}
			}

			var queryString = $("#goodsList").serialize(); 
			if(!confirm(""+goods_type+" 삭제 시 복구가 불가합니다.\n선택한 "+goods_type+"을 삭제하겠습니까? ")) return;
			$.ajax({
				type: "get",
				url: "../goods_process/goods_delete",
				data: queryString,
				success: function(result){
					//alert(result);
					location.reload();
				}
			});
		}
	});

	$("#chkAll").on("click",function(){
		if($(this).attr("checked")){
			$(".chk").attr("checked",true).trigger("change");
		}else{
			$(".chk").attr("checked",false).trigger("change");
		}
	});

	// 상품/사은품 복사
	$(".manager_copy_btn").on("click", function(){
		var goods_seq 	= $(this).attr("goods_seq");
		var gift 		= $(this).attr("data-gift");
		var func 		= "copy_goods('"+goods_seq+"', '');";

		var goods_type = "상품";
		if(typeof gift != "undefined" && gift === 'true') {
			goods_type = "사은품";
		}

		confirm_first_goods(gl_goods_config.first_goods_date,gl_basic_currency,gl_goods_config.basic_currency_hangul,gl_goods_config.basic_currency_nation,'이 '+goods_type+'을 복사해서 '+goods_type+'을 등록하시겠습니까?',func);
	});

	// 체크박스 색상
	$("input[type='checkbox'][name='goods_seq[]']").live('change',function(){
		if($(this).is(':checked')){
			$(this).closest('tr').addClass('checked-tr-background');
		}else{
			$(this).closest('tr').removeClass('checked-tr-background');
		}
	}).change();

	/*
	$("button[name='down_list']").on("click",function(){
		$("div.choose-down-lay").hide();
		if	($("div.choose-form-lay").css('display') != 'none')	$("div.choose-form-lay").slideUp();
		else													$("div.choose-form-lay").slideDown();
		clearCloseDownLay();
		closeDownLay(this);
	});

	$("button[name='excel_down_btn']").on("click",function(){
		$("div.choose-form-lay").hide();
		if	($("div.choose-down-lay").css('display') != 'none')	$("div.choose-down-lay").slideUp();
		else													$("div.choose-down-lay").slideDown();
		clearCloseDownLay();
		closeDownLay(this);
	});

	$("div.sub-choose-lay").find('div').bind('mouseout', function(){
		closeDownLay(this);
	});
	$("div.sub-choose-lay").find('div').bind('mouseover', function(){
		clearCloseDownLay();
	});
	*/

	// export_upload
	$("button[name='upload_excel']").live("click",function(){
		openDialog("상품일괄등록/수정 <span class='desc'></span>", "export_upload", {"width":"800","height":"500","show" : "fade","hide" : "fade"});
	});

	// 상품일괄등록/수정
	$("button[name='excel_upload']").live("click",function(){
		var goods_kind 	= $(this).attr("data-kind");
		if(goods_kind == "coupon"){
			location.href	= 'social_excel_upload';
		} else {
			location.href	= 'excel_upload';
		}
	});

	$('#order_star').toggle(function() {
		$(this).addClass("checked");
		$("span.icon-star-gray.checked").each(function(i){
		if(i>0){
			$(this).closest('tr').find("input[type='checkbox']").attr('checked',true);
		}
		});

	}, function() {
		$("span.icon-star-gray.checked").each(function(i){
			if(i>0){
			$(this).closest('tr').find("input[type='checkbox']").attr('checked',false);
			}
		});
		$(this).removeClass("checked");
	});

	// 상품관리 기본값 설정 불러오기 :: 2015-04-13 lwh
	$(".btn_goods_default_set").on("click", function(){
		var goods_kind 	= $(this).attr("data-kind");
		var title		= "상품 리스트 노출 항목";
		if(goods_kind == "package"){
			title		= "패키지 상품 리스트 노출 항목";
		}else if(goods_kind == "coupon"){
			title		= "티켓 상품 리스트 노출 항목";
		}
		$.ajax({
			type: "get",
			url: "./option_default_setting",
			data: "goods_kind="+goods_kind,
			success: function(html){
				if ($("#displayGoodsSelectPopup").length) $("#displayGoodsSelectPopup").remove();
				$("#set_option_view_lay").html(html);
				openDialog(title, "set_option_view_lay", {'width':650,'height':320,'show':'fade','hide' : 'fade'});
			}
		});
	});

	$(".btnSort").bind("click", function(){
		var sort = $("input[name='sort']").val();
		if($(this).attr("orderby") != "{=sorderby}") sort = "";

		if(sort == "asc"){
			sort = "desc";
		}else if(sort == "desc" || sort == ""){
			sort = "asc";
		}
		var orderby = sort+"_"+$(this).attr("orderby");

		$(this).attr("sort",sort);
		$("select[name='orderby'] option[value='"+orderby+"']").attr("selected",true);
		$("input[name='keyword']").focus();
		$("form[name='goodsForm']").submit();
	});

	/*
	if(window.Firstmall.Config.Environment.serviceLimit.H_FR == false){
		$(".waterMarkImageSetting").bind("click",function(){
			$.ajax({
				type: "get",
				url: "../setting/watermark_setting?layerid=watermark_setting_popup",
				success: function(result){
					$("div#watermark_setting_popup").html(result);
				}
			});
			openDialog("워터마크 설정", "watermark_setting_popup", {"width":"700","height":"630","show" : "fade","hide" : "fade"});
		});
	}
	*/

	/* 엑실 다운로드 */
	$("button[name='excel_down_btn']").on("click",function(){
        var selectCnt = $("input:checkbox[name='goods_seq[]']:checked").length;
        $(".select_count").html(comma(selectCnt));
		openDialog("엑셀 다운로드", "lay_excel_down", {"width":"830","height":"480","show" : "fade","hide" : "fade"});
	});
	// 설명용 샘플 엑셀 다운로드
	$(".btn_sample_down").on("click",function(){
		if(gl_goods_config.isAdmin == true){
			document.location.href=gl_goods_config.excel_sample_url;
		}else{
			document.location.href=gl_goods_config.excel_sample_url_seller;
		}
	});
	
	$(".btn_close").on("click",function(){
		var layId = $(this).attr("data-layId");
		if(typeof layId != 'undefined') closeDialog(layId);
	});
	

});

// 엑셀 다운로드 선택 팝업 닫기
var chkCloseType	= '';
function closeDownLay(){
	chkCloseType	= setTimeout(function(){$("div.sub-choose-lay").find('div').slideUp();}, 3000);
}

// 엑셀 다운로드 선택팝업 닫기 유지 처리
function clearCloseDownLay(){
	clearTimeout(chkCloseType);
}

// 엑셀 양식 설정
function excel_form(type){
	if	(type == 'old')	location.href = adminpage+"goods/download_write";
	else				location.href = adminpage+"goods/excel_form";
}

// 엑셀 다운로드
function excel_down(downloadType){

	if( $("input[name='keyword']").val() == $("input[name='keyword']").attr("title") ){
		$("input[name='keyword']").focus();
	}

	var excel_type = $("input[name='excel_type']:checked").val();
	if(typeof downloadType == 'undefined') downloadType = 'new';

	if(!excel_type){
		alert("양식을 선택 해 주세요.");
		return;
	}

	if(excel_type == 'select'){
		var cnt = $("input:checkbox[name='goods_seq[]']:checked").length;
		if(cnt<1){
			alert("다운로드 할 상품을 선택해 주세요.");
			return;
		}
	}
	
	// 실물 바코드 다운로드지만 입점사 상품만 선택했을 경우 
	if(downloadType=='barcode'){
		var flag = true;
		if(excel_type == 'select') {
			var cnt = 0;
			$("input:checkbox[name='goods_seq[]']:checked").each(function (){
				if($(this).data("provider_seq") == "1"){
					cnt++;
				}
			});

			if(cnt < 1) {
				flag = false;
			}
		}

		var provider_seq = $("input[name='provider_seq']").val();
		if(typeof provider_seq == 'undefined' || provider_seq == '') provider_seq = "1";

		if(provider_seq != "1") {
			flag = false;
		}

		if(!flag) {
			alert("바코드 실물 다운로드는 본사 상품만 가능합니다.");
			return;
		}
	}

	var queryString = $("#goodsForm").serializeArray();
	console.log(queryString);
	queryString.push({'name':'excel_type','value':excel_type});
	if(downloadType == 'zoomoney'){
		queryString.push({'name': 'excel_use', 'value': 'zoomoney'});
	}
	//$("#goodsForm").append('<input type="hidden" name="goods_kind" value="COUPON" />');

	if(excel_type == 'select') {
		$("input:checkbox[name='goods_seq[]']:checked").each(function() {
			queryString.push({'name':'goods_seq[]','value':$(this).val()});
		});
	}

	if	(downloadType == 'old'){
		ajaxexceldown(adminpage+'goods_process/excel_down', queryString);
	}else if	(downloadType == 'barcode'){
		// excel_type 재정의
		var i=0;
		$.each( queryString, function() {
			if(this.name=='excel_type'){
				this.value = this.value + "_" + downloadType;
			}else if(this.name=='goodsStatus[]'){
				this.name = "goodsStatus[" + i + "]";
				i++;
			}
		});
		ajaxexceldown_spout('/cli/excel_down/create_goods', queryString);
	}else{
		var i=0;
		$.each( queryString, function() {
			if(this.name=='goodsStatus[]'){
				this.name = "goodsStatus[" + i + "]";
				i++;
			}
		});
		console.log(queryString);
		//ajaxexceldown('/admin/goods_process/goods_excel_download', queryString);
		ajaxexceldown_spout('/cli/excel_down/create_goods', queryString);
	}
}

function ajaxexceldown_spout(url, queryString){
	var params = {};
	params['goods_seq'] = [];
	jQuery.each(queryString, function(i, field){
		if(field.name == 'goods_seq[]'){
			params['goods_seq'].push(field.value);
		} else {
			params[field.name] = field.value;
		}
	});

	$.ajax({      
		type: "POST",  
		url: url,      
		data: params, 
		success:function(args){ 
			loadingStop();
			var exe = args.split('.').pop();
			if(exe == "csv" || exe == "zip" || exe == "xlsx"){
				window.location.href = adminpage+'excel_spout/file_download?url=' + args; 
			} else {
				alert(args);
			}
		}, error:function(e){  
			alert(e.responseText);  
		}  
	});
}

//
function ajaxexceldown(url, queryString){
	var inputs = "";
		jQuery.each(queryString, function(i, field){
			inputs +='<input type="hidden" name="'+field.name+'" value="'+ field.value +'" />';
		});
	jQuery('<form action="'+ url +'" method="post" target="actionFrame" >'+inputs+'</form>')
	.appendTo('body').submit().remove();
}

// 상품리스트 > 수정 버튼 클릭 시. 검색결과 query string 전송
function goodsView(seq, ispackage){

	var search 	= document.location.search;
	var url 	= 'regist?no='+seq;

	if($("form[name='goodsForm'] input[name='goods_type']").val() == "gift") {
		url 	= 'gift_regist?no='+seq;
	}

	console.log(ispackage);

	if(ispackage) {
		url 	+= '&package_yn=y';
	}

	if(search.length > 0) {
		search 					= search.substring(1,search.length);

		// querystring 에 'update' 구문포함 시 sqlInjection 체크 걸림. up@date로 치환
		var tmp 		= search.split('update');

		if(tmp.length > 1) {
			search = tmp.join("up@date");
		}

		if(search != ''){
			url += '&query_string='+encodeURIComponent(search);
		}
	}

	document.location.href	= url;
}

function openAdvancedStatistic(goods_seq){
	$.ajax({
		type: "get",
		url: "../statistic/advanced_statistics",
		data: "ispop=pop&goods_seq="+goods_seq,
		success: function(result){
			$(document).find('body').append('<div id="Advanced_Statistics"></div>');
			$("#Advanced_Statistics").html(result);
			openDialog("이 상품의 고급 통계", "Advanced_Statistics", {"width":"1000","height":"770","show" : "fade","hide" : "fade"});
		}
	});
}

function searchformchange(){
	$("input[name='keyword']").focus();
	$("form[name='goodsForm']").submit();
}

// 옵션보기 설정 저장 완료처리
function optionViewSave(){
	loadingStop();
	closeDialog("set_option_view_lay");
	location.reload();
}

// 빅데이터 미리보기 페이지 오픈
function openBigdataPreview(goods_seq){
	window.open('../bigdata/preview?no='+goods_seq);
}

// 가격대체문구 레이어 노출
function viewStringPrice(type, obj){
	if	(type == 'open')	$(obj).closest('div').find('div.view-string-price-lay').show();
	else					$(obj).closest('div').find('div.view-string-price-lay').hide();
}
