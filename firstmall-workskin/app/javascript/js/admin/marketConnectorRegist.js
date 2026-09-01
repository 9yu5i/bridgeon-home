/*
입점사, 카테고리, 상품 선택 javascript
@2020.02.06
*/

function errorLog(message){
	console.log(message);
}

$(function(){

	$(".categoryList .btn_minus").on("click",function(){
		gCategorySelect.select_delete('minus',$(this));
	});
	
	//선택삭제
	$(".select_goods_del").on("click",function(){
		gGoodsSelect.select_delete('chk',$(this));
	});

	// 상품선택
	$(".btn_select_goods").on("click",function(){
		
		var params = {
					'goodsNameStrCut':30,
					'select_goods':$(this).attr("data-goodstype"),
					'selector':this,
					'service_h_ad':window.Firstmall.Config.Environment.serviceLimit.H_AD
					};
		gGoodsSelect.open(params);

	});
});