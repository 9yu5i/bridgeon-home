// list, view 공통
$(function() {

	$(".coupongoodsreviewbtn").on("click",function(){
		coupongoodsreview(this);
	});


	// 발급/사용내역
	$(".downloadlist_btn").on("click",function(){
		popup('./download?no='+$(this).attr('coupon_seq'),1200,800,'couponDownlist');
		//addFormDialog('./download?no='+coupon_seq, '93%', '600', '['+coupon_name+'] 발급/사용내역 ','false', 'resp_btn v3 size_XL');
	});

	// 발급/사용내역
	$(".downloadlistuse_btn").on("click",function(){
		if ( $(this).val() > 0 ) {
			var coupon_seq	= $(this).attr("coupon_seq");
			var coupon_name = $(this).attr("coupon_name");
			addFormDialog('./download?use_status=used&no='+coupon_seq,'93%', '600', '['+coupon_name+'] 발급/사용내역 ','false', 'resp_btn v3 size_XL');
		}
	});
});

var coupongoodsreview = function(obj){

	var coupon_seq	= $(obj).attr("coupon_seq");
	var coupon_type	= $(obj).attr("coupon_type");

	var url = '../coupon/coupongoodsreviewer?no='+coupon_seq+'&coupon_type='+coupon_type;
	if( coupon_type == 'offline' ) {
		var width = 450;
	}else{
		var width = 450;
	}
	addFormDialog(url, width, '500', '쿠폰 정보 조회','false', 'resp_btn v3 size_XL');
}