$(document).ready(function() { 	
	$("input[type='radio'][name='sale_store']").bind("click", function(){
		init_sale_store_item();
	});
	init_sale_store_item();
});
function init_sale_store_item(){
	$(".not_sale_store").hide();
	$(".sale_store_item").hide();
	var sale_store = $("input[type='radio'][name='sale_store']:checked").val();
	if(sale_store == "off"){
		$(".sale_store_item").show();
		// 데이터가 없을 경우 레이어팝업 
		if($("input[type='checkbox'][name='sale_store_item\[\]']").length == 0){
			openDialog("사용제한-오프라인 매장", "sale_store_item_Popup", {"width":"320","height":"180"});
		}
	}else if(sale_store == "on"){
		$(".not_sale_store").show();
	}
}