/*
입점사, 카테고리, 상품 선택 javascript
@2020.02.06
*/

var eventObj = (function(){

	var gl_service_h_ad = window.Firstmall.Config.Environment.serviceLimit.H_AD;

	// 콜백 :: 카테고리
	var _callbackCategoryList = function(json){

		try
		{
			if(typeof json == ""){
				throw "선택한 카테고리 데이터가 비어 있습니다";
			}

			if(typeof json != "string"){
				throw "선택한 카테고리 데이터가 [type::String]이 아닙니다.";
			}

			var data = $.parseJSON(json);

			if(typeof data != "object"){
				throw "선택한 카테고리 데이터는 [type::Object]가 아닙니다.";
			}

			var html = "";			
			var listFieldName = selectType;


			// 이미 선택되어 있는 상품 배열화
			var save_category = new Array();
			var t_select_goods = $(".t_select_goods").eq(applyNum);
	
			t_select_goods.find("."+selectType+"_list .category_code").each(function(e){
				save_category[e] = $(this).val();
			});

			$.each(data, function(key, list){

				var category_code = list.select_category_val1;
				var category_text = list.select_category_txt1;
				
				if(list.select_category_val4 != ""){
					category_code = list.select_category_val4;
				}else if(list.select_category_val3 != ""){
					category_code = list.select_category_val3;
				}else if(list.select_category_val2 != ""){
					category_code = list.select_category_val2;
				}

				if(list.select_category_txt2){
					category_text = category_text + " > " + list.select_category_txt2;
				}
				if(list.select_category_txt3){
					category_text = category_text + " > " + list.select_category_txt3;
				}
				if(list.select_category_txt4){
					category_text = category_text + " > " + list.select_category_txt4;
				}

				if($.inArray(category_code,save_category) != -1){
				}else{
					html += '<tr rownum="'+category_code+'">';
					html += '	<td class="center">'+category_text+'</td>';
					html += '	<td class="center">';
					html += '	<input type="hidden" name="'+listFieldName+'_code['+applyNum+'][]" class="category_code" value="'+category_code+'">';
					html += '	<button type="button" class="btn_minus" selectType="'+listFieldName+'" seq="'+category_code+'" onClick="eventObj.select_delete(\'minus\',$(this))"></button></td>';
					html += '</tr>';
				}
			});

			t_select_goods.find("."+selectType+"_list table").append(html);

			if(t_select_goods.find("."+selectType+"_list table").find("tr").length == 2){
				t_select_goods.find("."+selectType+"_list table").find("tr[rownum=0]").show();
			}else{
				t_select_goods.find("."+selectType+"_list table").find("tr[rownum=0]").hide();
			}

		}
		catch (error)
		{
			alert(error);
			return false;
		}

		//delectEvent();
	}

	var _select_delete = function(mode,obj){

		var $selecter		= "";
		var default_len 	= 2;
		var t_select_goods 	= "";


		if(mode == "minus"){
			$selecter 	= obj.closest('table');
			obj.closest("tr").remove();

		}else{
			
			var selecttype 	= obj.attr('selecttype');
			var divCon		= 'goods_select_contents';
			if(selecttype != 'goods'){
				divCon = 'except_select_contents';
			}
			t_select_goods 	= obj.closest('.'+divCon);
			$selecter		= t_select_goods.find("."+selecttype+"_list table");

			t_select_goods.find("."+selecttype+"_list table .chk:checked").each(function(){
				$(this).closest("tr").remove();
			});

			default_len = 1;

			$("input[name='chkAll']").attr("checked", false);			

		}		

		if($selecter.find("tr").length <= default_len){
			$selecter.find("tr[rownum=0]").show();

			if(mode == "chk"){
				$("."+selecttype+"_list_header input[name='chkAll']").prop("checked",false);
			}
		}
	}
	
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

		$(".salescost_rate.admin .percent").html(admin_rate + "%");
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
		callbackCategoryList		: _callbackCategoryList,
		select_delete				: _select_delete,
		form_salescost				: _form_salescost,
		set_sale_cost_percent		: _set_sale_cost_percent,
		percent_input_check			: _percent_input_check,
	}

})();


//------------------------------------------------------------------------------------------------------------------
// form 호출


var deleteGoods = function(obj){
	gGoodsSelect.select_delete('chk',$(obj));
}

// 상품선택
var selectGoods = function(obj){

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
		
	var params = {
		'goodsNameStrCut':30,
		'select_goods':$(obj).attr("data-goodstype"),
		'selectProviders':select_provider,
		'selectBtnObj':obj,
		'selector':obj,
		'service_h_ad':window.Firstmall.Config.Environment.serviceLimit.H_AD
		};
	gGoodsSelect.open(params);

}

$(function(){

	//전체선택
	$("input[name='chkAll']").on("click",function(){
		$(this).closest("div.goods_view,tr.except_select_contents").find(".chk").prop("checked",$(this).is(":checked"));
	});

	// 입점사 부담률 입력
	$("input[name='salescostper']").on("keyup",function(){
		eventObj.set_sale_cost_percent();
	});

	//혜택 부담 설정 > 대상 선택(A본사, AOP 본사 or 입점사, NONE : 없음)
	$("input:radio[name='sales_tag']").on("click",function(){
		eventObj.form_salescost($(this).val(),"click");
	});

	// 입점사 선택
	$(".btn_provider_select").on("click",function(){
		 gProviderSelect.open(gProviderSelect.callbackSetProviderList,{'select_lists':'salescost_provider_list[]'});
	});
	
});