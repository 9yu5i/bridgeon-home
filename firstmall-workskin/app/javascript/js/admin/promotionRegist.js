/*
입점사, 카테고리, 상품 선택 javascript
@2020.02.06
*/
var promotionObj = (function(){
	
	// 혜택 부담 설정 form
	var _form_salescost = function(discount_seller_type,callType){

		if(typeof callType == "undefined") callType = "";

		// 선택된 혜택 부담대상이 없을 때 본사를 기본으로
		if(typeof discount_seller_type == "undefined"){
			$("input:radio[name='sales_tag']").eq(0).prop("checked",true);
			var discount_seller_type = $("input:radio[name='sales_tag']").eq(0).val();
		}
	
		// 혜택부담 적용대상 : 본사.
		if(callType == "click"){
			var return_seller_type		= "admin";

			if(discount_seller_type == "admin"){
				
				//_provider_goods_delete(0,return_seller_type);

				if(parseInt($("input[name='salescost_admin']").val()) < 100){
					openDialogAlert('본사 상품 "본사 100% 부담"으로 변경됩니다.',350,160);
					_set_sale_cost_percent(0);
				}
				return_seller_type = "provider";
			}else{
				//_provider_goods_delete(1,return_seller_type);
			}
		}

	}

	// 혜택부담 대상이 변경될 시 선택한 상품(해당 입점사) 삭제 - 보류
	var _provider_goods_delete = function (provider_seq,return_seller_type){
		var goodsCnt	= 0;
		var gubun		= '본사';
		if(provider_seq == 0){			// 입점사 상품 전체 삭제
			goodsCnt		= $(".goods_list tr").not("tr[rownum=0]").not("tr[goods_provider_seq='1']").length;
		}else{
			goodsCnt		= $(".goods_list tr[goods_provider_seq='"+provider_seq+"']").length;

			if(provider_seq > 1){		// 특정 입점사 상품 삭제
				gubun		= '입점사';
			}
		}

		if(goodsCnt == 0) return false;

		var msg = '상품제한에 지정된 해당 '+gubun+' 상품 '+goodsCnt+'개가 모두 삭제됩니다.<br />계속 진행하시겠습니까?';

		openDialogConfirm(msg,450,150
				,function(){
						// 혜택부담대상이 입점사 였다가 본사로 바뀐 경우 선택된 입점사 전체 상품 삭제
						if(provider_seq == 0){
							$(".goods_list tr").not("tr[rownum=0]").remove();
							$(".goods_list tr[rownum=0]").show();
						}else{
							$(".goods_list tr[goods_provider_seq='"+provider_seq+"']").remove();
						}
						obj.closest("tr").remove();
				}
				,function(){
					//_set_sale_cost_percent(0);
					//_form_salescost(return_seller_type);
					/*
					if(typeof return_seller_type != "undefined"){
						$("input:radio[name='sales_tag'][value='"+return_seller_type+"']").prop("checked",true);
					}*/
					return false;
				}
		);
	}

	var _select_delete = function(mode,obj){

		var $selecter	= "";
		var default_len = 2;		//타이틀 row, 데이터없을 때 노출 row(hidden)

		if(mode == "minus"){
			$selecter 	= obj.closest('table');
			obj.closest("tr").remove();

			//if($type == "provider") _provider_goods_delete($val);

		}else{

			$selecter	= $("."+obj+"_list table");
			$("."+obj+"_list table .chk:checked").each(function(){
				$selecter.find("tr[rownum="+$(this).val()+"]").remove();
			});

			default_len = 1;
		}

		if($selecter.find("tr").length == default_len){
			$selecter.find("tr[rownum=0]").show();

			if(mode == "chk"){
				$("."+obj+"_list_header input[name='chkAll']").prop("checked",false);
			}
		}
	}

	var _set_sale_cost_percent = function(provider_rate){
		
		var obj = $("input[name='salescostper']");
		if(typeof obj.val() == "undefined") obj.val() = 0;
		if(typeof provider_rate == 'undefined'){
			var provider_rate = 0;
			if(obj.val() != "")	provider_rate	= parseInt(obj.val());
		}
		var admin_rate		= parseInt(100);

		if(provider_rate > 100){
			obj.parent().find("span.msg").html("(입점사 부담률은 100%를 넘을 수 없습니다.)");
			obj.val('');
			provider_rate = 0;
		}else if(provider_rate <= 100 && provider_rate > 0){
			obj.parent().find("span.msg").html("");
		}

		if(provider_rate >= 0){
			admin_rate = (100-provider_rate);
		}

		$(".sales_admin .percent").html(admin_rate + "%");
		$("input[name='salescost_provider']").val(provider_rate);
		$("input[name='salescost_admin']").val(admin_rate);
		$("input[name='salescostper']").val(provider_rate);
	}

	var _percent_input_check = function(obj){
		var str = String(obj.val());
		if(str.length > 3 ){
			obj.val(str.slice(0,-1));
		}
		if(parseInt(str) > 100 ){
			obj.val(0);
		}
		obj.focus();
	}
	
	return {

		form_salescost				: _form_salescost,
		select_delete				: _select_delete,
		set_sale_cost_percent		: _set_sale_cost_percent,
		percent_input_check			: _percent_input_check,
		provider_goods_delete		: _provider_goods_delete,
	}

}) ();

//------------------------------------------------------------------------------------------------------------------
// form 호출

$(function(){

	$(".batchExcelRegist").live("click",function(){
		$("#ExcelUploadDialog").dialog("open");
	});

	openDialog("엑셀 등록", "ExcelUploadDialog", {"width":630,"height":325,"autoOpen":false,"close":function(){
		$("#ExcelUploadButton").val('');
	}});

	/* 파일업로드버튼 ajax upload 적용 */
	var opt			= {
		"addData" : "allow_types=xls"
	};
	var callback	= function(res){
		var that		= this;
		var result		= eval(res);

		if(result.status){
			$("#ExcelUploadButtonQueue").empty();
			$("#promotion_file").val(result.fileInfo.file_name);
			$(".promotion_file").html(result.fileInfo.file_name);
			$("#ExcelUploadButton").val('');
			closeDialog("ExcelUploadDialog");
		}else{
			$("#ExcelUploadButtonQueue").empty();

			var msg = result.msg;
			if(typeof result.desc != "undefined"){
				msg = '['+result.desc+'] ' + msg;
			}
			alert(msg);
		}
	};

	// ajax 이미지 업로드 이벤트 바인딩
	$('#ExcelUploadButton').createAjaxFileUpload(opt, callback);


	$(".promotionImg1").mouseover(function(){
		var src_orign = $(this).attr("src_orign");
		$("#promotionImg1src").attr("src",src_orign);
	});
	$(".promotionImg1").mouseout(function(){
		var src_sample = $(this).attr("src_sample");
		$("#promotionImg1src").attr("src",src_sample);
	});

	$(".batchImageRegist").live("click",function(){
		showImageUploadDialog();
	});

	openDialog("이미지 업로드", "imageUploadDialog", {"width":600,"height":335,"autoOpen":false,"close":function(){
		$("#imageUploadButton").val('');
	}});

	/* 파일업로드버튼 ajax upload 적용 */
	var imgopt			= {};
	var imgcallback	= function(res){
		var that		= this;
		var result		= eval(res);

		if(result.status){
			$("#promotionimage4lay").html('');
			$("#promotion_image4").val('');
			$("#promotionimage4lay").html("<img src='"+ result.filePath + result.fileInfo.file_name + "' /> ");
			$("#promotionimage4").val( result.fileInfo.file_name);
			$("#imageUploadButton").val('');
			closeDialog("imageUploadDialog");
		}else{
			alert(result.msg);
		}
	};

	// ajax 이미지 업로드 이벤트 바인딩
	$('#imageUploadButton').createAjaxFileUpload(imgopt, imgcallback);

	$(".promotion_code_form").click(function(){
		document.location.href = $(this).attr('promotion_code_form');
	});

	$("form#promotionRegist input[name='promotionType']").bind("click",function(){
		set_promotion_form();
	});


	$("#promotion_type2").click(function(){
		if(promotionData.promotionSeq){
			if($("#promotion_type2").attr('checked') == 'checked' ) {
				$('#promotionRegist').validate({
					onkeyup: false,
					rules: {
						promotion_input_num: { required:true , remote:{type:'post',url:'../promotion_process/offlinepromotion_ck'}},
					},
					messages: {
						promotion_input_num: { required:'<font color="red">입력해 주세요.</font>', remote: '이미 등록된 할인 코드입니다.'},
					},
					errorPlacement: function(error, element) {
						openDialogAlert('할인 코드가 중복되었습니다.','400','140',function(){});
					},
					submitHandler: function(f) {
						f.submit();
					}
				});
			}
		}
	});

	$("form#promotionRegist input[name='issue_type']").bind("click",function(){
		if($(this).val() == 'issue') {
			$('.issuetypelay').show();
			$('#issuesgoodslay').show();
			$('#issuesbrandlay').show();
			$('#exceptgoodslay').hide();
			$('#issuescategorylay').show();
			$('#exceptcategorylay').hide();
			$('#exceptbrandlay').hide();
		}else if($(this).val() == 'except'){
			$('.issuetypelay').show();
			$('#issuesgoodslay').hide();
			$('#issuesbrandlay').hide();
			$('#exceptgoodslay').show();

			$('#issuescategorylay').hide();
			$('#exceptcategorylay').show();
			$('#exceptbrandlay').show();
		}else{
			$('.issuetypelay').hide();
			$('#issuesgoodslay').hide();
			$('#issuesbrandlay').hide();
			$('#exceptgoodslay').hide();
			$('#issuescategorylay').hide();
			$('#exceptcategorylay').hide();
			$('#exceptbrandlay').hide();
		}
	});

	/*
	$("form#promotionRegist button#issueGoodsButton").bind("click",function(){
		set_goods_list("issueGoodsSelect","issueGoods");
	});
	$("#issueGoods").sortable();
	$("#issueGoods").disableSelection();

	$("form#promotionRegist button#exceptIssueGoodsButton").bind("click",function(){
		set_goods_list("exceptIssueGoodsSelect","exceptIssueGoods");
	});
	$("#exceptIssueGoods").sortable();
	$("#exceptIssueGoods").disableSelection();
	*/

	/* 카테고리 불러오기 */
	/*
	category_admin_select_load('','category1','');
	$("select[name='category1']").bind("change",function(){
		category_admin_select_load('category1','category2',$(this).val());
		category_admin_select_load('category2','category3',"");
		category_admin_select_load('category3','category4',"");
	});
	$("select[name='category2']").bind("change",function(){
		category_admin_select_load('category2','category3',$(this).val());
		category_admin_select_load('category3','category4',"");
	});
	$("select[name='category3']").bind("change",function(){
		category_admin_select_load('category3','category4',$(this).val());
	});

	$("button#issueCategoryButton").bind("click",function(){
		var obj;
		var category;
		var categoryCode;

		obj = $("select[name='category1']");
		if(obj.val()){
			category = $("select[name='category1'] option[value='"+obj.val()+"']").html();
			categoryCode = obj.val();
		}
		obj = $("select[name='category2']");
		if(obj.val()){
			category += " > " + $("select[name='category2'] option[value='"+obj.val()+"']").html();
			categoryCode = obj.val();
		}
		obj = $("select[name='category3']");
		if(obj.val()){
			category += " > " + $("select[name='category3'] option[value='"+obj.val()+"']").html();
			categoryCode = obj.val();
		}
		obj = $("select[name='category4']");
		if(obj.val()){
			category += " > " + $("select[name='category4'] option[value='"+obj.val()+"']").html();
			categoryCode = obj.val();
		}

		if(category){
			if($("input[name='issueCategoryCode[]'][value='"+categoryCode+"']").length == 0){
				var tag = "<div style='padding:5px;'><span style='display:inline-block;width:300px'>"+category+"</span>";
				tag += "<span class='btn-minus'><button type='button' class='delCategory'></button></span>";
				tag += "<input type='hidden' name='issueCategoryCode[]' value='"+categoryCode+"' /></div>";
				$("div#issueCategory").append(tag);
			}
		}
	});

	category_admin_select_load('','exceptCategory1','');
	$("select[name='exceptCategory1']").bind("change",function(){
		category_admin_select_load('exceptCategory1','exceptCategory2',$(this).val());
		category_admin_select_load('exceptCategory2','exceptCategory3',"");
		category_admin_select_load('exceptCategory3','exceptCategory4',"");
	});
	$("select[name='exceptCategory2']").bind("change",function(){
		category_admin_select_load('exceptCategory2','exceptCategory3',$(this).val());
		category_admin_select_load('exceptCategory3','exceptCategory4',"");
	});
	$("select[name='exceptCategory3']").bind("change",function(){
		category_admin_select_load('exceptCategory3','exceptCategory4',$(this).val());
	});

	$("button#exceptIssueCategoryButton").bind("click",function(){
		var obj;
		var category;
		var categoryCode;

		obj = $("select[name='exceptCategory1']");
		if( obj.val()) {
			category = $("select[name='exceptCategory1'] option[value='"+obj.val()+"']").html();
			categoryCode = obj.val();
		}
		obj = $("select[name='exceptCategory2']");
		if(obj.val()){
			category += " > " + $("select[name='exceptCategory2'] option[value='"+obj.val()+"']").html();
			categoryCode = obj.val();
		}
		obj = $("select[name='exceptCategory3']");
		if(obj.val()){
			category += " > " + $("select[name='exceptCategory3'] option[value='"+obj.val()+"']").html();
			categoryCode = obj.val();
		}
		obj = $("select[name='exceptCategory4']");
		if(obj.val()){
			category += " > " + $("select[name='exceptCategory4'] option[value='"+obj.val()+"']").html();
			categoryCode = obj.val();
		}

		if(category){
			if($("input[name='exceptIssueCategoryCode[]'][value='"+categoryCode+"']").length == 0){
				var tag = "<div style='padding:5px;'><span style='display:inline-block;width:300px'>"+category+"</span>";
				tag += "<span class='btn-minus'><button type='button' class='delCategory'></button></span>";
				tag += "<input type='hidden' name='exceptIssueCategoryCode[]' value='"+categoryCode+"' /></div>";
				$("div#exceptIssueCategory").append(tag);
			}
		}
	});

	$("form#promotionRegist button.delCategory").live("click",function(){
		$(this).parent().parent().remove();
	});
	*/
	/* 카테고리 불러오기 end */


	/* 브랜드 불러오기 */
	/*
	brand_admin_select_load('','brand1','');
	$("select[name='brand1']").live("change",function(){
		brand_admin_select_load('brand1','brand2',$(this).val());
		brand_admin_select_load('brand2','brand3',"");
		brand_admin_select_load('brand3','brand4',"");
	});
	$("select[name='brand2']").live("change",function(){
		brand_admin_select_load('brand2','brand3',$(this).val());
		brand_admin_select_load('brand3','brand4',"");
	});
	$("select[name='brand3']").live("change",function(){
		brand_admin_select_load('brand3','brand4',$(this).val());
	});
	*/
	$("button#issueBrandButton").bind("click",function(){
		var obj;
		var brand;
		var brandCode;

		obj = $("select[name='brand1']");
		if(obj.val()){
			brand = $("select[name='brand1'] option[value='"+obj.val()+"']").html();
			brandCode = obj.val();
		}
		obj = $("select[name='brand2']");
		if(obj.val()){
			brand += " > " + $("select[name='brand2'] option[value='"+obj.val()+"']").html();
			brandCode = obj.val();
		}
		obj = $("select[name='brand3']");
		if(obj.val()){
			brand += " > " + $("select[name='brand3'] option[value='"+obj.val()+"']").html();
			brandCode = obj.val();
		}
		obj = $("select[name='brand4']");
		if(obj.val()){
			brand += " > " + $("select[name='brand4'] option[value='"+obj.val()+"']").html();
			brandCode = obj.val();
		}

		if(brand){
			if($("input[name='issueBrandCode[]'][value='"+brandCode+"']").length == 0){
				var tag = "<div style='padding:5px;'><span style='display:inline-block;width:300px'>"+brand+"</span>";
				tag += "<span class='btn-minus'><button type='button' class='delbrand'></button></span>";
				tag += "<input type='hidden' name='issueBrandCode[]' value='"+brandCode+"' /></div>";
				$("div#issueBrand").append(tag);
			}
		}
	});

	brand_admin_select_load('','exceptbrand1','');
	$("select[name='exceptbrand1']").live("change",function(){
		brand_admin_select_load('exceptbrand1','exceptbrand2',$(this).val());
		brand_admin_select_load('exceptbrand2','exceptbrand3',"");
		brand_admin_select_load('exceptbrand3','exceptbrand4',"");
	});
	$("select[name='exceptbrand2']").live("change",function(){
		brand_admin_select_load('exceptbrand2','exceptbrand3',$(this).val());
		brand_admin_select_load('exceptbrand3','exceptbrand4',"");
	});
	$("select[name='exceptbrand3']").live("change",function(){
		brand_admin_select_load('exceptbrand3','exceptbrand4',$(this).val());
	});

	$("button#exceptIssueBrandButton").bind("click",function(){
		var obj;
		var brand;
		var brandCode;

		obj = $("select[name='exceptbrand1']");
		if( obj.val()) {
			brand = $("select[name='exceptbrand1'] option[value='"+obj.val()+"']").html();
			brandCode = obj.val();
		}
		obj = $("select[name='exceptbrand2']");
		if(obj.val()){
			brand += " > " + $("select[name='exceptbrand2'] option[value='"+obj.val()+"']").html();
			brandCode = obj.val();
		}
		obj = $("select[name='exceptbrand3']");
		if(obj.val()){
			brand += " > " + $("select[name='exceptbrand3'] option[value='"+obj.val()+"']").html();
			brandCode = obj.val();
		}
		obj = $("select[name='exceptbrand4']");
		if(obj.val()){
			brand += " > " + $("select[name='exceptbrand4'] option[value='"+obj.val()+"']").html();
			brandCode = obj.val();
		}

		if(brand){
			if($("input[name='exceptIssueBrandCode[]'][value='"+brandCode+"']").length == 0){
				var tag = "<div style='padding:5px;'><span style='display:inline-block;width:300px'>"+brand+"</span>";
				tag += "<span class='btn-minus'><button type='button' class='delbrand'></button></span>";
				tag += "<input type='hidden' name='exceptIssueBrandCode[]' value='"+brandCode+"' /></div>";
				$("div#exceptIssuebrand").append(tag);
			}
		}
	});

	$("form#promotionRegist button.delBrand").live("click",function(){
		$(this).parent().parent().remove();
	});
	
	$(".customFontDecoration").customFontDecoration();

	/* 브랜드 불러오기 end  */

	if(promotionData.type == 'promotion'  || promotionData.type == 'promotion_shipping'){
		$("input[name='promotionType'][value='promotion']").attr('checked',true);
	}else if( promotionData.promotionType == 'admin'  || promotionData.type == 'admin_shipping'){
		$("input[name='promotionType'][value='admin']").attr('checked',true);
	}else if( promotionData.promotionType == 'point'  || promotionData.type == 'point_shipping'){
		$("input[name='promotionType'][value='point']").attr('checked',true);
	}

	if(promotionData.download_limit){
		$("form#promotionRegist select[name='downloadLimit_"+promotionData.type+"']").val([promotionData.download_limit]);
	}

	if(promotionData.download_limit_ea){
		$("form#promotionRegist input[name='downloadLimitEa_"+promotionData.type+"']").val(promotionData.download_limit_ea);
		//누적제한
		if(promotionData.download_limit == 'limit'){ 
			$("form#promotionRegist input[name='downloadLimitEa_"+promotionData.type+"']").show();
		}
	}

	if(promotionData.download_limit){
		$("input[name='downloadLimit_promotion'][value='"+promotionData.download_limit+"']").attr('checked',true);
		$("#downloadLimitEa_promotion").val(promotionData.download_limit_ea);
	}

	if(promotionData.downloadLimit_member){
		$("input[name='downloadLimit_member'][value='"+promotionData.downloadLimit_member+"']").attr('checked',true);
	}

	if(promotionData.mainshow){
		$("input[name='mainshow'][value='"+promotionData.mainshow+"']").attr('checked',true);
	}

	if(promotionData.issue_type){
		$("input[name='issue_type'][value='"+promotionData.issue_type+"']").attr('checked',true);
		if(promotionData.issue_type == 'issue'){

			$('.issuetypelay').show();
			$('#issuesgoodslay').show();
			$('#exceptgoodslay').hide();
			$('#issuescategorylay').show();
			$('#issuesbrandlay').show();
			$('#exceptcategorylay').hide();
			$('#exceptbrandlay').hide();
		}else if(promotionData.issue_type === 'except'){

			$('.issuetypelay').show();
			$('#issuesgoodslay').hide();
			$('#exceptgoodslay').show();
			$('#issuescategorylay').hide();
			$('#issuesbrandlay').hide();
			$('#exceptcategorylay').show();
			$('#exceptbrandlay').show();
		}else{
			$('.issuetypelay').hide();
			$('#issuesgoodslay').hide();
			$('#exceptgoodslay').hide();
			$('#issuescategorylay').hide();
			$('#issuesbrandlay').hide();
			$('#exceptcategorylay').hide();
			$('#exceptbrandlay').hide();
		}
	}

	if(promotionData.duplication_use ==1){
		$("form#promotionRegist input[name='duplicationUse']").val([promotionData.duplication_use]);
	}	

	//$("input[name='issuePriodType'][value='{promotion.issue_priod_type}']").attr("checked",true);

	set_promotion_form();

	// 발급/사용내역
	$('.downloadlist_btn').on('click', function() {
		//if ( $(this).val() > 0 ) {
			var promotion_seq	= $(this).attr("promotion_seq");
			var promotion_name	= $(this).attr("promotion_name");
			window.open('./download?no='+promotion_seq, "할인 코드 발급/사용 내역",'width=1250,height=800,location=no,status=no,scrollbars=yes');
		//}
	});

	// 발급/사용내역
	$('.downloadlistuse_btn').on('click', function() {
		addFormDialog('./download?use_status=used&no='+promotionData.promotion_seq,'93%', '600', '['+promotionData.promotion_name+'] 발급/사용내역 ','false');
	});

	//수동생성 > 할인 코드 코드보기
	$('#promotion_code_view').on('click', function() {
		addFormDialog('./promotion_code?no='+promotionData.promotion_seq, '480', '750', '할인 코드 보기','false', 'resp_btn v3 size_XL');
	});

	//수동생성 > 할인 코드 코드 엑셀 다운받기
	$('#promotion_code_excel_down').on('click', function() {
		document.location.href='../promotion_process/promotion_code_exceldown?no='+promotionData.promotion_seq;
	});

	$("#downloadLimit_promotion").click(function(){
		if($(this).attr('checked') == 'checked' ) {
			$(".downloadLimitlay").removeClass('gray');
			$("#downloadLimitEa_promotion").removeAttr("disabled");
		}else{
			$(".downloadLimitlay").addClass('gray');
			$("#downloadLimitEa_promotion").attr("disabled","disabled");
		}
	});


	$("#saleType_percent").click(function(){
		$(".duplicationUsetitle").removeClass('gray');
		$("#duplicationUse").removeAttr("disabled");
		$("#saleType_percent").attr('checked',true);
		$("#issueexceptlay").show();
	});

	$("#saleType_won").click(function(){
		$(".duplicationUsetitle").removeClass('gray');
		$("#duplicationUse").removeAttr("disabled");
		$("#saleType_won").attr('checked',true);
		$("#issueexceptlay").show();
	});

	$("#saleType_shipping_free").click(function(){
		chk_delivery_choice_box(1);
		$("input[name='maxPercentShippingSale']").focus();
	});

	$("#saleType_shipping_won").click(function(){
		chk_delivery_choice_box(2);
		$("input[name='wonShippingSale']").focus();
	});

	$(".promotiontbllay").click(function(){
		$("#promotionType_promotion").attr('checked',true);
		set_promotion_form();
	});

	$(".admintbllay").click(function(){
		$("#promotionType_admin").attr('checked',true);
		set_promotion_form();
	});

	$(".pointtbllay").click(function(){
		$("#promotionType_point").attr('checked',true);
		set_promotion_form();
	});

	$('body,input,textarea,select').bind('keydown','Ctrl+s',function(event){
		event.preventDefault();
		$("#promotionRegist").submit();
	});


	//전체선택
	$("input[name='chkAll']").on("click",function(){
		$type		= $(this).val();
		var obj = $(this).closest("div").parent().find("."+$type+"_list table .chk");		
		$(this).is(":checked")? obj.attr("checked", true) : obj.attr("checked", false);				
	});

	// 입점사 부담률 입력
	$("input[name='salescostper']").on("keyup",function(){
		promotionObj.set_sale_cost_percent();
	});

	//혜택 부담 설정 > 대상 선택(A본사, AOP 본사 or 입점사, NONE : 없음)
	$("input:radio[name='sales_tag']").on("click",function(){
		promotionObj.form_salescost($(this).val(),"click");
	});

	// 할인 코드 발급 발급대상 클릭시
	$("input:radio[name='target_type']").click(function() {
		var promotion_name = $("#write_promotion_name").val();
		if($(this).val()== 'all') {
			$("#target_type1").attr("checked","checked");
			$("#target_container").html('');
			$("#target_member").val('');
			$("#member_search_count").html(0);
			$("#groupsMsg").html('');
		} else if($(this).val() == 'group') {
			$("#target_type2").attr("checked","checked");
			$("#target_container").html('');
			$("#target_member").val('');
			$("#member_search_count").html(0);

		} else if($(this).val() == 'member') {
			$("#target_type3").attr("checked","checked");
			$("#groupsMsg").html('');
		}
	});

	$("#download_group_search").live("click",function(){
		if($("#target_type2").attr("disabled") != 'disabled'){
			$("#target_type2").attr("checked","checked");
			var checkedId = "input:checkbox[name='memberGroup']";
			var idx = ($(checkedId).length);;
			if(idx > 0) {
				$(checkedId).each(function(e, data) {
					if( !downloadmembergroup($(data).val()) ) {//다운권한이 없는 등급인 경우
						$("#memberGroup_"+$(data).val()).attr("disabled","disabled");
					}else{
						$("#memberGroup_"+$(data).val()).removeAttr("disabled");
					}
				});
			}
			openDialog("등급 선택", "setGroupsPopup", {"width":"500","height":"500"});
		}
	});


	$('#display_quantity').bind('change', function() {
		$("#perpage").val($(this).val());
		$("#promotionsearch").submit();
	});

	$('#display_orderby').bind('change', function() {
		$("#orderby").val($(this).val());
		$("#promotionsearch").submit();
	});


	$(".orderview").click(function(){
		var order_seq = $(this).attr("order_seq");
		var href = "/admin/order/view?no="+order_seq;
		var a = window.open(href, 'orderdetail'+order_seq, '');
		if ( a ) {
			a.focus();
		}
	});

	$(".goodsview").click(function(){
		var goods_seq = $(this).attr("goods_seq");
		var href = "/admin/goods/regist?no="+goods_seq;
		var a = window.open(href, 'goodsdetail'+goods_seq, '');
		if ( a ) {
			a.focus();
		}
	});

	$(".userinfo").click(function(){
		var mseq = $(this).attr("mseq");
		var href = "/admin/member/detail?member_seq="+mseq;
		var a = window.open(href, 'mbdetail'+mseq, '');
		if ( a ) {
			a.focus();
		}
	});

	// 입점사 선택
	$(".btn_provider_select").on("click",function(){
		 gProviderSelect.open({'select_lists':'salescost_provider_list[]'});
	});

	//선택삭제
	$(".select_goods_del").on("click",function(){
		gGoodsSelect.select_delete('chk',$(this));
	});

	// 상품선택
	$(".btn_select_goods").on("click",function(){
		var sales_tag			= $("input[name='sales_tag']:checked").val();
		var select_provider		= 1;
		if(sales_tag == 'provider'){
			select_provider = '';
			if($("input[name='salescost_provider_list[]']").length == 0){
				alert("적용대상이 '입점사 상품' 입니다. 입점사를 먼저 지정해 주세요.");
				return false;
			}
			$("input[name='salescost_provider_list[]']").each(function(e){
				if(e > 0) select_provider += '|';
				select_provider += $(this).val();
			});
		}
		gGoodsSelect.open({'goodsNameStrCut':30,'selectProviders':select_provider,'service_h_ad':window.Firstmall.Config.Environment.serviceLimit.H_AD});

	});

	// 카테고리 선택
	$(".btn_category_select").on("click",function(){
		gCategorySelect.open();
	});


});