/*
입점사, 카테고리, 상품 선택 javascript
@2020.02.06
*/

var refererObj  = (function(){

	// 2-1. 혜택 부담 설정 form
	var _form_salescost = function(discount_seller_type,callType){

		if(typeof callType == "undefined") callType = "";

		// 선택된 혜택 부담대상이 없을 때 본사를 기본으로
		if(typeof discount_seller_type == "undefined"){
			$("input:radio[name='sales_tag']").eq(0).prop("checked",true);
			var discount_seller_type = $("input:radio[name='sales_tag']").eq(0).val();
		}
	
		// 혜택부담 적용대상 : 본사.		
		if(discount_seller_type == "admin" && callType == "click"){
			if(parseInt($("input[name='salescost_admin']").val()) < 100){
				openDialogAlert('본사 상품 "본사 100% 부담"으로 변경됩니다.',350,160);
				_set_sale_cost_percent(0);
			}
		}		
	}

	var _set_sale_cost_percent = function(provider_rate){
		
		var obj = $("input[name='salescostper']");
		if(typeof obj.val() == "undefined") obj.val() = 0;
		if(typeof provider_rate == 'undefined'){
			var provider_rate	= parseInt(obj.val());
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
		form_salescost: _form_salescost,
		set_sale_cost_percent: _set_sale_cost_percent,
		percent_input_check: _percent_input_check,
	}
})();

//------------------------------------------------------------------------------------------------------------------
// form 호출

$(function(){

	//전체선택
	$("input[name='chkAll']").on("click",function(){
		$type		= $(this).val();
		var obj 	= $(this).closest("div").parent().find("."+$type+"_list table .chk");		
		$(this).is(":checked")? obj.attr("checked", true) : obj.attr("checked", false);		
	});

	// 입점사 부담률 입력
	$("input[name='salescostper']").on("keyup",function(){
		refererObj.set_sale_cost_percent();
	});

	//혜택 부담 설정 > 대상 선택(A본사, AOP 본사 or 입점사, NONE : 없음)
	$("input:radio[name='sales_tag']").on("click",function(){
		refererObj.form_salescost($(this).val(),"click");
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
			if($("input[name='salescost_provider_list[]']").length == 0){
				alert("적용대상이 '입점사 상품' 입니다. 입점사를 먼저 지정해 주세요.");
				return false;
			}
			select_provider = '';
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

	$("form#detailForm input[name='issue_type']").bind("click",function(){
		if($(this).val() == 'issue') {
			$('.issuetypelay').show();
			$('#issuesgoodslay').show();
			$('#exceptgoodslay').hide();
			$('#issuescategorylay').show();
			$('#exceptcategorylay').hide();
		}else if($(this).val() == 'except'){
			$('.issuetypelay').show();
			$('#issuesgoodslay').hide();
			$('#exceptgoodslay').show();

			$('#issuescategorylay').hide();
			$('#exceptcategorylay').show();
		}else{
			$('.issuetypelay').hide();
			$('#issuesgoodslay').hide();
			$('#exceptgoodslay').hide();
			$('#issuescategorylay').hide();
			$('#exceptcategorylay').hide();
		}
	});

	/* 카테고리 불러오기 */
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

	$("form#detailForm button.delCategory").live("click",function(){
		$(this).parent().parent().remove();
	});

	$(".referer-url-chk-btn").bind('click', function(){
		var refererurl		= $("input[name='refererUrl']").val();
		var url_type		= $("select[name='refererUrlType'] option:selected").val();
		var sdate			= $("input[name='issueDate[]']").eq(0).val();
		var edate			= $("input[name='issueDate[]']").eq(1).val();
		var provider_list	= $("input[name='provider_seq_list']").val();
		// 유입경로 URL이 있는지 확인
		if	(!refererurl){
			openDialogAlert("유입경로 URL을 입력해 주세요.", 300, 150, function(){});
			return;
		}
		// 유효기간이 있는지 확인
		if	(!sdate || !edate){
			openDialogAlert("유효기간을 입력해 주세요.", 300, 150, function(){});
			return;
		}
		var param			= "referer_url="+refererurl+"&url_type="+url_type+"&sdate="+sdate+"&edate="+edate+"&provider_list="+provider_list;

		$.ajax({
			type: "get",
			url: "./chkRefererUrl",
			data: param,
			success: function(result){
				if	(result == 'no'){
					openDialogAlert("중복된 유입경로 URL입니다.", 300, 150, function(){
						$("input[name='refererUrl']").val('');
						$("input[name='refererUrl']").focus();
					});
				}else if	(result == 'error_date'){
					openDialogAlert("유효기간 시작일이 종료일보다 크게 입력되었습니다.", 400, 150, function(){});
				}else if	(result == 'ok'){
					openDialogAlert("사용가능한 유입경로 URL입니다.", 300, 150, function(){});
				}else{
					openDialogAlert("유입경로나 유효기간 정보가 올바르지 않습니다.", 300, 150, function(){
						$("input[name='refererUrl']").val('');
						$("input[name='refererUrl']").focus();
					});
				}
			}
		});
	});

	// 관리자 테스트
	$("input[name='testPC_btn']").each(function(){
		$(this).click(function(){
			  var referersale_url = encodeURIComponent($(this).attr('referersale_url'));
			actionFrame.location.href	= '../referer_process/test_referer?add='+referersale_url;
			window.open('/../index?setMode=pc', 'window_name', 'width=1200,height=800,location=no,status=no,scrollbars=yes');
		});
	});

	$("input[name='testM_btn']").each(function(){
		$(this).click(function(){
			  var referersale_url = encodeURIComponent($(this).attr('referersale_url'));
			actionFrame.location.href	= '../referer_process/test_referer?add='+referersale_url;
			window.open('/../index?setMode=mobile', 'window_name','width=1200,height=800,location=no,status=no,scrollbars=yes');
		});
	});

	if(referersaleData.referersaleSeq != ''){
		setContentsRadio("issue_type", referersaleData.issueType);
		setContentsRadio("sales_tag", referersaleData.salesTag);
		setContentsSelect("saleType",referersaleData.saleType);
	}else{
		setContentsRadio("issue_type", "all");
		setContentsRadio("sales_tag", "admin");
		setContentsSelect("saleType", "percent");
	}

	if(referersaleData.pageMode == 'new'){
		//쿠폰신규생성 후 뒤로가기 시 리스트로 이동
		history.pushState(null, null, location.href);
			window.onpopstate = function () {
				document.location.href="../referer/referersale";
		};
	}
});