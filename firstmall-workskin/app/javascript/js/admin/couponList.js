// list jquery
$(function(){

	$("button.onlineRegist").on("click",function(){
		location.href = "regist";
	});
	$("input[name=memberGroup]").on("click",function(){
		groupsMsg();
	});

	$("#display_orderby").on("click",function(){
		$("#orderby").val($(this).val());
		$("#couponsearch").submit();
	});

	$(".orderview").on("click",function(){
		var order_seq = $(this).attr("order_seq");
		var href = "/admin/order/view?no="+order_seq;
		var a = window.open(href, 'orderdetail'+order_seq, '');
		if ( a ) {
			a.focus();
		}
	});

	$(".goodsview").on("click",function(){
		var goods_seq = $(this).attr("goods_seq");
		var href = "../goods/regist?no="+goods_seq;
		var a = window.open(href, 'goodsdetail'+goods_seq, '');
		if ( a ) {
			a.focus();
		}
	});

	$(".userinfo").on("click",function(){
		var mseq = $(this).attr("mseq");
		var href = "/admin/member/detail?member_seq="+mseq;
		var a = window.open(href, 'mbdetail'+mseq, '');
		if ( a ) {
			a.focus();
		}
	});

	$(".couponpageselect").on("click",function(){
		$(this).toggleClass('opened');
	});
	//------------------------------------------------------------------------------------------------------------

	$("#couponType_all").on("click",function(){
		$("input[name='couponType[]']").attr("checked","checked");
		$("input[name='use_type[]']").attr("checked","checked");
	});

	$("#couponType_down").on("click",function(){
		$("input[name='couponType[]'].download").attr("checked","checked"); 
	});

	$(".coupon_popup").on("click",function(){
		document.location.href='/admin/coupon/coupon_popup_setting';
	});

	//상품상세보기
	$(".coupongoodsdetail").on("click",function(){
		window.open("/goods/view?no="+$(".coupongoodsrevieweryes .issueGoods").attr("goods_seq"),'','');
	});

	//쿠폰복사 실행
	$("input:button[name=couponcopybtn]").on("click",function(){

		$('#CouponCopy').validate({
			onkeyup: false,
			rules: {
				coupon_name: { required:true}
			},
			messages: {
				coupon_name: { required:'쿠폰명을 입력해 주세요.'},
			},
			errorPlacement: function(error, element) {
				error.appendTo(element.parent());
			},
			submitHandler: function(f) {
				f.submit();
			}
		});
		$('#CouponCopy').submit();
	});

	//쿠폰삭제
	$(".cpdeletebtn").on("click",function(){
		var coupon_seq		= $(this).attr('coupon_seq');
		if(confirm("정말로 삭제하시겠습니까?") ) {
			$.ajax({
				'url' : '../coupon_process/online_delete?ajaxcall=Y',
				'data' : {'couponSeq':coupon_seq},
				'type' : 'post',
				'dataType': 'json',
				'success' : function(res){
					if(res.result == 'auth'){
						alert(res.msg);
						document.location.reload();
					}else{
						if(res.result == 'true' ){
							alert(res.msg);
							document.location.reload();
						}else{
							alert(res.msg);
						}
					}
				}
			});
		}
	});

	$(".off_cpdeletebtn").on("click",function(){
		var coupon_seq		= $(this).attr('coupon_seq');
		if(confirm("정말로 삭제하시겠습니까?") ) {
			$.ajax({
				'url' : '../coupon_process/offline_delete?ajaxcall=Y',
				'data' : {'couponSeq':coupon_seq},
				'type' : 'post',
				'dataType': 'json',
				'success' : function(res){
					if(res.result == 'auth'){
						alert(res.msg);
						document.location.reload();
					}else{
						if(res.result == 'true' ){
							alert(res.msg);
							document.location.reload();
						}else{
							alert(res.msg);
						}
					}
				}
			});
		}
	});

	// 수정
	$(".cpmodifybtn").on("click",function(){
		var no			= $(this).attr("coupon_seq");
		var modifytype	= $(this).attr("modifytype");
		var search		= location.search;

		search			= search.substring(1,search.length);
		
		$("input[name='keyword']").focus();
		$("input[name='no']").val(no);
		$("input[name='query_string']").val(search);
		$("form[name='couponsearch']").attr('action',modifytype);
		$("form[name='couponsearch']").submit();
	});

	//쿠폰복사 창띄우기
	$(".cpcopybtn").on("click",function(){
		$('#CouponCopy')[0].reset();//초기화
		var coupon_seq		= $(this).attr('coupon_seq');
		$("#copy_coupon_seq").val(coupon_seq);
		openDialog("쿠폰복사", "couponcopyPopup", {"width":600,"height":405});
	});	
		
	$(".cpClosebtn").on("click",function(){
		closeDialog("couponcopyPopup");
	});
});


//상품 조회후 상품검색창
var goodsSearch = function(obj){

	var goods_seq	= obj.parent().find("input[name='goods_seq']").val();
	var coupon_seq	= obj.attr("coupon_seq");

	if(!goods_seq) {
		openDialogAlert("상품번호를 정확히 입력해 주세요.",'260','155',function(){$("#coupongoods_goods_seq").focus();return;});
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
					var imgsrc = (eval("res.goods.src"))?res.goods.src:"/admin/skin/default/images/common/noimage_list.gif";
					$(".coupongoodsrevieweryes").show(); 
					$(".coupongoodsrevieweryes .issueGoods").find(".image").html('<img class="goodsThumbView" alt="" src="'+imgsrc+'" width="50" height="50">'); 
					$(".coupongoodsrevieweryes .issueGoods").find(".name").html(res.goods.name);
					$(".coupongoodsrevieweryes .issueGoods").find(".price").html(res.goods.price);
					$(".coupongoodsrevieweryes .issueGoods").attr("goods_seq",goods_seq); 
					
					openDialog('상품번호 찾기',"coupongoodsreviewerpopup",{"width":"480","height":"250"});
				}else if( res.result == 'goodsno' ) {  
					var imgsrc = (eval("res.goods.src"))?res.goods.src:"/admin/skin/default/images/common/noimage_list.gif";
					$(".coupongoodsreviewerno").show();
					$(".coupongoodsrevieweryes .issueGoods").find(".image").html('<img class="goodsThumbView" alt="" src="'+imgsrc+'" width="50" height="50">'); 
					$(".coupongoodsrevieweryes .issueGoods").find(".name").html(res.goods.name);
					$(".coupongoodsrevieweryes .issueGoods").find(".price").html(res.goods.price);
					$(".coupongoodsrevieweryes .issueGoods").attr("goods_seq",goods_seq); 
					
					openDialog('상품번호 찾기',"coupongoodsreviewerpopup",{"width":"400","height":"250"});
				}else{
					openDialogAlert("상품을 찾을 수 없습니다.<br/>확인 후 다시 입력하시기 바랍니다.",'250','160'); 
				}
			}
		});
	}
}
