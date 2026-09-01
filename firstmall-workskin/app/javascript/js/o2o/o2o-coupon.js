
/* input form style 적용*/
function apply_input_style(){
$('img.small_goods_image').each(function() {
	if (!this.complete ) {// image was broken, replace with your new image
		this.src = '/data/icon/error/noimage_list.gif';
	}
});
}

$(document).ready(function() {
	/* 스타일적용 */
	apply_input_style();
	
	// 쿠폰사용가능한 상품 조회하기 (적용대상조회)
	$('.coupongoodsreviewbtn').click(function() {
		var coupon_type = $(this).attr("coupon_type");
		var use_type = $(this).attr("use_type");
		var issue_type = $(this).attr("issue_type");
		if(gl_getTab=='1' || gl_getTab == ''){
			var download_seq = $(this).attr("download_seq");
			var coupon_seq = $(this).attr("coupon_seq");
			var coupongoodsreviewerurl = '../coupon/coupongoodsreviewer?no='+download_seq+'&coupon_type='+coupon_type+'&coupon_seq='+coupon_seq+'&download_seq='+download_seq;
		}else{
			var coupon_seq = $(this).attr("coupon_seq"); 
			var coupongoodsreviewerurl = '../coupon/coupongoodsreviewer?no='+coupon_seq+'&coupon_type='+coupon_type;
		}
		var coupon_name = $(this).attr("coupon_name");   
		
		// 반응형 스킨 여부에 따라서 실행 스크립트 변경
		if(typeof gl_operation_type != 'undefined' && gl_operation_type == 'light') {
			//쿠폰정보
			$.get(coupongoodsreviewerurl, {}, function(data) {
				$('#couponTargetLayer .layer_pop_contents').html(data);
				showCenterLayer('#couponTargetLayer');
			});
		} else {
			addFormDialog(coupongoodsreviewerurl, '500px', '', getAlert('mp093'),'false');
		} 
	});
	//상품 조회후 상품검색창
	$("input:button[name=goodssearchbtn]").live("click",function(){
		var goods_seq		= $("#coupongoods_goods_seq").val();
		var coupon_seq	= $(this).attr("coupon_seq");

		if(!goods_seq) {
			//상품번호를 정확히 입력해 주세요.
			openDialogAlert(getAlert('mp090'),'260','140',function(){$("#coupongoods_goods_seq").focus();return;});
		}else{ 
			$.ajax({
				'url' : '../coupon/coupongoodssearch',
				'data' : {'coupon':coupon_seq,'goods':goods_seq},
				'type' : 'post',
				'dataType': 'json',
				'success' : function(res){ 
					$(".coupongoodsreviewerno").hide();//상품사용불가
					$(".coupongoodsrevieweryes").hide();//쿠폰사용가능
					if( res.result == 'goodsyes' ) {  
						var imgsrc = (eval("res.goods.src"))?res.goods.src:"../images/common/noimage_list.gif";
						$(".coupongoodsrevieweryes").show(); 
						$(".coupongoodsrevieweryes .issueGoods").find(".image").html("<img class=\"goodsThumbView\"  alt=\"\" src=\""+imgsrc+"\" width=\"50\" height=\"50\">"); 
						$(".coupongoodsrevieweryes .issueGoods").find(".name").html(res.goods.name);
						$(".coupongoodsrevieweryes .issueGoods").find(".price").html(res.goods.price);
						$(".coupongoodsrevieweryes .issueGoods").attr("goods_seq",goods_seq); 
						//상품번호 찾기
						openDialog(getAlert('mp091'),"coupongoodsreviewerpopup",{"width":"480","height":"280"});
					}else if( res.result == 'goodsno' ) {  						
						var imgsrc = (eval("res.goods.src"))?res.goods.src:"../images/common/noimage_list.gif";
						$(".coupongoodsreviewerno").show();
						$(".coupongoodsrevieweryes .issueGoods").find(".image").html("<img class=\"goodsThumbView\"  alt=\"\" src=\""+imgsrc+"\" width=\"50\" height=\"50\">"); 
						$(".coupongoodsrevieweryes .issueGoods").find(".name").html(res.goods.name);
						$(".coupongoodsrevieweryes .issueGoods").find(".price").html(res.goods.price);
						$(".coupongoodsrevieweryes .issueGoods").attr("goods_seq",goods_seq); 
						//상품번호 찾기
						openDialog(getAlert('mp091'),"coupongoodsreviewerpopup",{"width":"400","height":"250"});
					}else{
						//상품을 찾을 수 없습니다.<br/>확인 후 다시 입력하시기 바랍니다.
						openDialogAlert(getAlert('mp092'),'250','160'); 
					}
				}
			});
		}
	});
	
	//상품상세보기
	$('.coupongoodsdetail').live("click",function(){ 
		var openurl = gl_serverHost;
		if(gl_serverHttps=='on' || gl_serverHttps == ''){
			openurl = 'https://'+openurl;
		}else{
			openurl = 'http://'+openurl;
		}
		window.open(openurl+"/goods/view?no="+$(".coupongoodsrevieweryes .issueGoods").attr("goods_seq"),'','');
	});

});