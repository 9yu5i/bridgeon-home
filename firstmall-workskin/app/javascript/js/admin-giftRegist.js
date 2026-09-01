function calulate_option_price(tmpidx){
	var container = $("#optionLayer");
	var idx;

	if(typeof tmpidx == 'undefined'){
		var selector = $("input[name='price[]']",container);
		var tmpidxch = false;
	}else{
		var selector = $("input[name='price[]']",container).eq(tmpidx);
		var tmpidxch = true;
	}

	// default-price
	selector.val(0);

	selector.each(function(eachidx){
		if(tmpidxch) {
			idx = tmpidx;
		}else{
			idx = eachidx;
		}
		var rate 					= 0;
		var priceObj 				= $(this);
		//var supplyPriceObj 			= $("input[name='supplyPrice[]']",container).eq(idx);
		var consumerPriceObj 		= $("input[name='consumerPrice[]']",container).eq(idx);
		var taxObj 					= $(".tax",container).eq(idx);
		//var discountRateObj 		= $(".discountRate",container).eq(idx);	
		
		var obj 	= { 0:consumerPriceObj.val(), 1:priceObj.val() };
		var result 	= calulate_price(obj);

		if(result[0]>0 && result[0]!='Infinity') result[0] = result[0]+"%"; 
		else result[0] = "0%";;

		// TAX @2014-03-17
		if( (eval("$(\"input[name='tax']\").val()") && $("input[name='tax']").val()!='tax') ){
			result[1] = 0;
		}
		// 판매가 0 이기 때문에 부가세도 0
		taxObj.html('0');
				
	});
}

function calulate_price(obj){
	// supply,consumer,price,reserveRate,reserveUnit

	// 금액에 콤마제거
	if(typeof obj != "undefined") {
		$.each(obj,function(e,val){
			if(typeof val == "undefined")  obj[e] = 0;
			else obj[e] = uncomma(val);
		});
	}
	var rate;
	var result 		= new Array('','','');
	var consumer 	= obj[0];
	var price 		= obj[1];

	// 할인율
	if( consumer && price ){
		result[0] =  100 - Math.floor( price / consumer * 100);
	}

	// 부가세
	if( price ){
		result[1] =  get_currency_price(Math.floor( price - (price / 1.1)));
	}

	return result;
}

/* 저장하기 */
function goods_save(saveType){
	// 저장 후 동작 설정
	$("input[name='save_type']").val(saveType);

	if($("input[name='goods_gubun']:checked").val() == "admin"){
		$(".provider_seq").val(1);
	}
	if($(".provider_seq").val()==''){
		openDialogAlert("입점사를 선택해주세요.",400,150,function(){
			$("select[name='provider_seq_selector']").next(".ui-combobox").children("input").eq(0).focus();
		});
		return false;
	}

	if(chk_stockDesc()){
		loadingStart();
		$("#goodsRegist").submit();
	}
}