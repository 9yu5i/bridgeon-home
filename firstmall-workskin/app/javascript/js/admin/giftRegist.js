/*
카테고리, 상품 선택 javascript
@2020.02.06
*/

var giftObj = (function(){

	var _service_h_ad 		= '';
	var _sellerAdminMode 	= '';
	
	var _init = function(options){
		_service_h_ad 		= options.service_h_ad;
		_sellerAdminMode 	= options.sellerAdminMode;
	}

	//callback :: 사은품
	var _callbackGiftList = function(opt,json){
		try
		{

			if(typeof json == ""){
				throw "선택한 사은품 데이터가 비어 있습니다";
			}

			if(typeof json != "string"){
				throw "선택한 사은품 데이터가 [type::String]이 아닙니다.";
			}

			var data = $.parseJSON(json);

			if(typeof data != "object"){
				throw "선택한 사은품 데이터가 [type::Object]가 아닙니다.";
			}

			var html = "";

			// 이미 선택되어 있는 사은품 배열화
			var save_goods = new Array();
			$(".gift_list."+opt+" input[name='"+opt+"Gift[]']").each(function(e){
				save_goods[e] = $(this).val();
			});

			$.each(data, function(key, list){

				if(save_goods.length > 0 && $.inArray(list.goods_seq,save_goods) != -1){
				}else{
					html += '<tr rownum="'+list.goods_seq+'">';
					html += '	<td class="left">';
					html += '		<div class="image"><img src="'+list.goods_img+'" class="goodsThumbView" width="50" height="50" /></div>';
					html += '		<div class="goodsname">';
					if(list.goods_code){
						html += '<div class="desc">[상품코드:'+list.goods_code+']</div>';
					}
					html += '			<a href="../goods/gift_regist?no='+list.goods_seq+'" target="_blank">'+list.goods_name+'</a></div></td>';
					html += '	<td class="center">';
					html += '	<input type="hidden" name="'+opt+'Gift[]" value="'+list.goods_seq+'" />';
					//html += '		<input type="hidden" name="'+opt+'GiftSeq['+list.goods_seq+']" value="" />';
					html += '		 <button type="button" class="btn_minus" onClick="selectItemDelete(this)" selectType="gift_list.'+opt+'" seq="'+list.goods_seq+'"></button></td>';
					html += '</tr>';
				}
			});

			$(".gift_list."+opt+" table").append(html);

			if($(".gift_list."+opt+" table").find("tr").length == 1){
				$(".gift_list."+opt+" table").find("tr[rownum=0]").show();
			}else{
				$(".gift_list."+opt+" table").find("tr[rownum=0]").hide();
			}
		}
		catch (error)
		{
			alert(error);
			return false;
		}
	}

	var _select_delete = function(mode,obj){

		var $selecter	= "";
		var $val		= "";
		var default_len = 2;		//타이틀 row, 데이터없을 때 노출 row(hidden)
	
		if(mode == "minus"){
			$selecter 	= obj.closest('table');
			obj.closest("tr").remove();
		}else{

			$selecter	= $("."+obj+" table");
			$("."+obj+" table .chk:checked").each(function(){
				$selecter.find("tr[rownum="+$(this).val()+"]").remove();
			});

			default_len = 1;

			$("input[name='chkAll']").attr("checked", false);			
		}

		if($selecter.find("tr").length == default_len){
			$selecter.find("tr[rownum=0]").show();

			if(mode == "chk"){
				$("."+obj+"_list_header input[name='chkAll']").prop("checked",false);
			}
		}

	}

	return {
		init: _init,
		callbackGiftList: _callbackGiftList,
		select_delete: _select_delete
	}

}) ();

//------------------------------------------------------------------------------------------------------------------
// form 호출
function trDel(tg)
{
	var len = $(tg).closest("tbody").find(".pricetr").length;
	if(len==2) return;
	$(tg).parent().parent().next().remove();
	$(tg).parent().parent().remove();		
}

function goods_rule_type(){
	var value = $("input[name='goods_rule']:checked").val();
	if(value=='all'){
		$("#select_category").hide();
		$("#select_goods").hide();
	}else if(value=='category'){
		$("#select_category").show();
		$("#select_goods").hide();
	}else if(value=='goods'){
		$("#select_category").hide();
		$("#select_goods").show();
	}
}

function set_goods_list(displayId,inputGoods){
	$.ajax({
		type: "get",
		url: "../goods/select_for_provider",
		data: "page=1&inputGoods="+inputGoods+"&displayId="+displayId+"&provider_list=|"+$(".provider_seq").val()+"|&salescost="+$("input[name='salescost_provider']").val()+"&ship_grp_seq="+ $("#ship_grp_seq").val(),
		success: function(result){
			$("div#"+displayId).html(result);
		}
	});
	openDialog("상품 검색", displayId, {"width":"1000","height":"700","show" : "fade","hide" : "fade"});
}

function set_gift_list(displayId, inputGoods){
	var provider_seq = $("#provider_seq").val();
	var ship_grp_seq = $("#ship_grp_seq").val();
	var params = '';

	/*<!--{ ? gift_gb == 'order' }-->*/
	if(provider_seq && ship_grp_seq){
		params = "&provider_seq="+provider_seq;

	}else{
		alert('보내는 판매자 및 배송그룹을 선택하여 주세요.');
		return false;
	}
	/*<!--{ / }-->*/

	$.ajax({
		type: "get",
		url: "../goods/gift",
		data: "page=1&inputGoods="+inputGoods+"&displayId="+displayId+params,
		success: function(result){		
			$("div#"+displayId).html(result);
		}
	});
	openDialog("사은품 검색", displayId, {"width":"1000","height":"700","show" : "fade","hide" : "fade"});
}

function giftGoodsSelect(obj){
	var num				= $(obj).attr("num");
	var provider_seq	= $("input[name='provider_seq']").val();
	gGiftGoodsSelect.open(giftObj.callbackGiftList,{'opt':'price'+num,'select_provider':provider_seq,'select_gift_goods':'price'+num+'Gift[]'});
}

function selectItemDelete(obj){
	giftObj.select_delete('minus',$(obj));
}

$(function(){

	var sellerAdminMode = '';
	var gl_service_h_ad = window.Firstmall.Config.Environment.serviceLimit.H_AD;
	
	if(typeof $(".btn_select_goods").attr("sellerAdminMode") != "undefined") sellerAdminMode = $(".btn_select_goods").attr("sellerAdminMode");
	giftObj.init({'service_h_ad':gl_service_h_ad,'sellerAdminMode':sellerAdminMode});

	//전체선택
	$(document).on("click", "input[name='chkAll']",function(){
		$type		= $(this).val();
		var obj = $(this).closest("div").parent().find("."+$type+"_list table .chk");
		obj.attr("checked", $(this).is(":checked"));		
	});
	
	// 판매가 사은품 > 선택
	$(".default_select_gift").on("click",function(){
		var provider_seq = $("input[name='provider_seq']").val();
		gGiftGoodsSelect.open(giftObj.callbackGiftList,{'opt':'default','select_provider':provider_seq,'select_gift_goods':'defaultGift[]','service_h_ad':gl_service_h_ad});
	});

	// 판매가별 사은품 지정 > 사은품 선택
	/*
	$(".gift_order_info .price_select_gift").on("click",function(){
		var num = $(this).attr("num");
		gGiftGoodsSelect.open(giftObj.callbackGiftList,{'opt':'price'+num});
		//set_gift_list("priceGiftSelect"+num,"priceGift"+num);
	});	
	*/
	
	$(".qty_select_gift").bind("click",function(){
		var provider_seq = $("input[name='provider_seq']").val();
		gGiftGoodsSelect.open(giftObj.callbackGiftList,{'opt':'qty','select_provider':provider_seq,'select_gift_goods':'qtyGift[]'});
		//set_gift_list("qtyGiftSelect","qtyGift");
	});
	
	//선택한 입점사/회원등급/상품 삭제
	/*
	$(".category_list .btn_minus").on("click",function(){		
		giftObj.select_delete('minus',$(this));
	});
	*/

	$(".gift_gb_buy .price_select_gift").on("click",function(){
		var num = $(this).attr("num");		
		set_gift_list("buyPriceGiftSelect"+num,"priceGift"+num);
	});	

	
	$("#priceAdd").on("click",function(){
		var priceClone	= $("#priceTable").find(".pricetr:nth-child(-n+2)").clone();
		var newClone	= priceClone.clone();

		newClone.find(".gift_list table tr").eq(1).show();
		newClone.find(".gift_list table tr").eq(1).nextAll().remove();
		//newClone.find(".gift_list table tr:not(:nth-child(-n+1))").remove();
		newClone.find("input[name='sprice2[]']").val('');
		newClone.find("input[name='eprice2[]']").val('');
		var trObj		= $("#priceTable tbody tr.pricetr");

		trObj.parent().append(newClone);

		$("#priceTable .price_select_gift").each(function(e){
			var num =  e + 1;
			$(this).attr("num", num);
			var classReplace = $("#priceTable tbody div.gift_list");
			classReplace.eq(e).attr("class",classReplace.eq(e).attr("class").replace(/[0-9]/g,num));
		});
	});

	$("#priceAdd2").click(function(){
		var priceClone	= $("#priceTable2").find(".pricetr").clone();
		var newClone	= priceClone.clone();		
		var trObj		= $("#priceTable2 tbody tr");
		trObj.parent().append(newClone);	
	});

	var qtyClone = $("#qtyTable").find(".pricetr").clone();
	
	$("#qtyAdd").click(function(){		
		var newClone = qtyClone.clone();	
		var trObj = $("#qtyTable tbody tr");
		trObj.parent().append(newClone);	
	});	

	$("input[name='goods_rule']").click(function(){
		goods_rule_type();
	});

	$("form#eventRegist button#issueGoodsButton").bind("click",function(){
		set_goods_list("issueGoodsSelect","issueGoods");
	});
	$("#issueGoods").sortable();
	$("#issueGoods").disableSelection();

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
		//if($("input:radio[name='sale_use']:checked").val()=='N') return;
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
		var obj = $("select[name='category4']");
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

	$("form#eventRegist button.delCategory").live("click",function(){
		$(this).parent().parent().remove();
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
		var select_provider = $("input[name='provider_seq']").val();
		gGoodsSelect.open({'goodsNameStrCut':30,'selectProviders':select_provider,'service_h_ad':gl_service_h_ad,'sellerAdminMode':sellerAdminMode});

	});

	// 카테고리 선택
	$(".btn_category_select").on("click",function(){
		gCategorySelect.open();
	});

	$("#giftContents").hide();

});
