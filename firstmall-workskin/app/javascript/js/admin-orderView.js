$(document).ready(function() {

	//주문 삭제된 경우 안내 2016-04-21 @nsg
	if((order_hidden == 'Y'|| order_hidden == 'T') && pagemode != 'del_order_list'){
		openDialogAlert("["+order_seq+"] 주문은</br>"+ order_hidden_date + "에 완전 삭제되었습니다!",400,170,function(){
			history.back();
		});
	}
	
	// 티켓상품 > 사용내역 레이어
	$("div.coupon_use_log_hand").bind("click",function(){
		var coupon_use_log_table_html = $(this).find("div.coupon_use_log_table").html();
		var tableheight = $(this).find("div.coupon_use_log_table").height()+100;

		$("#coupon_use_log_dialog").html(coupon_use_log_table_html);
		openDialog("사용내역", "coupon_use_log_dialog", {width:500,height:tableheight});
	});
	
	//티켓 상품의 상태 안내
	$("div.coupon_status_btn").bind("click",function(){
		var socialcp_status = $(this).attr("socialcp_status");
		$(".socialcp_status_tr").css("background-color","");
		$(".socialcp_status_"+socialcp_status).css("background-color","yellow");
		openDialog("티켓 상품의 상태 안내", "coupon_status_dialog", {width:300,height:730});
	});

	// 별표 설정
	$("span.list-important").bind("click",function(){
		var param = "?no="+$(this).attr('id');
		if( $(this).hasClass('checked') ){
			$(this).removeClass('checked');
			param += "&val=0";
			$.get('important'+param,function(data) {});

		}else{
			$(this).addClass('checked');
			param += "&val=1";
			$.get('important'+param,function(data) {});
		}
	});

	// 우편번호 찾기
	$("#recipient_zipcode_button").bind("click",function(){
		if(order_npay && order_pg == "npay") {
			openDialogAlert("네이버페이 주문건은 직접 배송지 변경이 불가합니다.<br />네이버페이 어드민에서 처리할 수 있습니다.",400,180,function(){});
		} else if(private_masking) {
			openDialogAlert("권한이 없습니다.",400,150,function(){});
		} else {
			openDialogZipcode('recipient_');
		}
	});

	// 우편번호 찾기
	$(".recipient_zipcode_button").bind("click",function(){
		if(order_npay && order_pg == "npay") {
			openDialogAlert("네이버페이 주문건은 직접 배송지 변경이 불가합니다.<br />네이버페이 어드민에서 처리할 수 있습니다.",400,180,function(){});
		} else if(private_masking) {
			openDialogAlert("권한이 없습니다.",400,150,function(){});
		} else {
			var idx = $(this).attr('idx');
			openDialogZipcode('order_multi',idx);
		}
	});

	// 주문무효
	$("#cancel_order").bind("click",function(){
		if(order_npay && order_pg == "npay"){
			openDialogAlert("네이버페이 주문 건은 직접 주문무효 처리 할 수 없습니다.",400,160,function(){});
		}else{
			loadingStart();
			actionFrame.location.href = '../order_process/cancel_order?seq='+order_seq;
		}
	});

	// 주문되돌리기 - 롤백
	$(".order_reverse").bind("click",function(){

		if(order_npay && order_pg == "npay"){
			openDialogAlert("네이버페이 주문 건은 주문상태 되돌리기가 불가합니다.",400,160,function(){});
			return;
		}else if(orign_order_seq != ""){
			openDialogAlert("교환 주문 건은 관리자가 결제 취소를 할 수 없습니다.<br />교환 주문 건 취소는 관리자가 교환 주문 건에 대해 출고 및 반품 처리 후 환불 처리해 주시기 바랍니다.",400,260);
			return;
		}else{
			var sale_stat	= true;
			var width		= 400;
			var height		= 160;
			var order_msg	= '';

			// 주문접수시에만 확인 :: 2015-09-07 lwh
			if(step == '25' && deposit_day != nowDate){
				order_msg	= '선택된 주문에는 매출이 확정된 주문이 존재합니다.<br/>매출이 확정된 주문(오늘 이전에 결제확인된 주문)건을 ‘주문접수’로 되돌릴 경우<br/>월별 매출 통계 화면에서 오늘 날짜의 ‘롤백 환불’건으로 반영됩니다.';
				width		= 550;
				height		= 290;
			}
			if	(step == '25' && $(this).attr('autodepositKey') > 0){
				if	(order_msg)	order_msg	= order_msg + '<br/><br/>';
				order_msg	= order_msg + '선택된 주문에는 은행입금내역 자동입금확인 메뉴에서의 입금내역과 매칭된 주문이 존재합니다.<br/>주문접수로 되돌릴 경우 입금 내역과의 매칭 또한 해제됩니다';
				width		= 580;
				height		= parseInt(height) + 80;
			}

			if	(order_msg)	order_msg	= order_msg + '<br/><br/>';
			order_msg		= order_msg + '주문상태를 되돌리시겠습니까?';


			openDialogConfirm(order_msg,width,height,function(){
				actionFrame.location.href = '../order_process/order_reverse?seq='+order_seq;
			});
		}
	});

	// 상품준비
	$("#goods_ready").bind("click",function(){
		if(num(nomatch_goods_cnt)>0){
			openDialogAlert("매칭되지 않은 주문상품이 있습니다.<br />주문상품 목록에서 상품을 매칭해주세요.",400,160,function(){
				$('html').animate({'scrollTop':$(".item-title-order-item").offset().top-60});
			});
			return;
		}
		$.get('view?pagemode=goods_ready&no='+order_seq, function(result){
			$("#goods_ready_dialog").html(result);
			openDialog("상품준비 처리", "goods_ready_dialog", {"width":"1000","height":"600"});
		});
	});


	// 결제확인
	$("#order_deposit").bind("click",function(){
		if(order_npay && order_pg == "npay"){
			openDialogAlert("네이버페이 주문 건은 직접 결제확인 처리 할 수 없습니다.",400,160,function(){});
		}else{
			loadingStart();
			actionFrame.location.href = '../order_process/deposit?seq='+order_seq;
		}
	});

	// 출고처리
	$("#goods_export").bind("click",function(){
		goods_export();

	});

	//문자발송
	$("#send_sms").bind("click",function(){
		$.get('../member/sms_pop?order_seq='+order_seq+'&type=order_cellphone', function(data) {
			$('#sms_form').html(data);
		});
		openDialog("SMS 발송", "sendPopup", {"width":"700","height":"480"});
	});

	$("#send_recipient_sms").bind("click",function(){
		var phone = new String("");
		$("select[name='recipient_cellphone[]'],input[name='recipient_cellphone[]']").each(function(){
			if($(this).is(":disabled") == false ) {
				phone += $(this).val();
			}
		});
		var url = '../member/sms_pop?order_seq='+order_seq+'&type=recipient_cellphone';
		if( phone != "" ) {
			url = '../member/sms_pop?cellphone='+phone;
		}

		$.get(url, function(data) {
			$('#sms_form').html(data);
		});
		openDialog("SMS 발송", "sendPopup", {"width":"700","height":"480"});
	});

	$(".send_recipient_sms").bind("click",function(){
		var phone = new String("");
		$("select[name='recipient_cellphone[]'],input[name='recipient_cellphone[]']").each(function(){
			if($(this).is(":disabled") == false ) {
				phone += $(this).val();
			}
		});
		var url = '../member/sms_pop?order_seq='+order_seq+'&type=recipient_cellphone';
		if( phone != "" ) {
			url = '../member/sms_pop?cellphone='+phone;
		}

		$.get(url, function(data) {
			$('#sms_form').html(data);
		});
		openDialog("SMS 발송", "sendPopup", {"width":"700","height":"480"});
	});

	$("#send_email").bind("click",function(){
		$.get('../member/email_pop?order_seq='+order_seq+'&type=order_email', function(data) {
			$('#sendPopup2').html(data);
			openDialog("EMAIL 발송", "sendPopup2", {"width":"1000","height":"600"});
		});
	});

	$("#send_recipient_email").bind("click",function(){
		$.get('../member/email_pop?order_seq='+order_seq+'&type=recipient_email', function(data) {
			$('#sendPopup2').html(data);
			openDialog("EMAIL 발송", "sendPopup2", {"width":"1000","height":"800"});
		});
	});

	// 가능수량으로 버튼 제어
	if(able_return_ea > 0){
		$("form[name=frm_return]").attr('disabled',false);
		$("input,select,textarea",$("form[name=frm_return]")).each(function(){$(this).attr('readonly',false);});
	}else{
		$("form[name=frm_return]").attr('disabled',true);
		$("input,select,textarea",$("form[name=frm_return]")).each(function(){$(this).attr('readonly',true);});
	}
	if(able_refund_ea > 0){
		$("form[name=frm_cancel_payment]").attr('disabled',false);
		$("input,select,textarea",$("form[name=frm_cancel_payment]")).each(function(){$(this).attr('readonly',false);});
	}else{
		$("form[name=frm_cancel_payment]").attr('disabled',true);
		$("input,select,textarea",$("form[name=frm_cancel_payment]")).each(function(){$(this).attr('readonly',true);});
	}
	if(able_export_ea > 0){
		$("form[name=frm_goods_export]").attr('disabled',false);
		$("input,select,textarea",$("form[name=frm_goods_export]")).each(function(){$(this).attr('readonly',false);});
	}else{
		$("form[name=frm_goods_export]").attr('disabled',true);
		$("input,select,textarea",$("form[name=frm_goods_export]")).each(function(){$(this).attr('readonly',true);});
	}

	if(linkage_mallnames && order_linkage_id){
		$("#enuri").parent().hide();
		$("form[name=frm_enuri]").attr('disabled',true);
		$("input,select,textarea",$("form[name=frm_enuri]")).each(function(){$(this).attr('readonly',true);});
	}

	// 지역 추가 배송비
	$(".area_add_delivery_cost").poshytip({
		className: 'tip-darkgray',
		allowTipHover: true,
		slide: true,
		showTimeout : 0
	});
	$(".add_goods_shipping").poshytip({
		className: 'tip-darkgray',
		allowTipHover: true,
		slide: true,
		showTimeout : 0
	});

	$("button.goods_export").bind("click",function(){
		//$("button#goods_export").click(); 티켓 상품에서 에러 나서 수정 kmj
		goods_export();
	});

	$("button.order_deposit").bind("click",function(){
		$("button#order_deposit").click();
	});

	// Order Statistics
	if(order_seq != ""){
		$.ajax({
			type: "get",
			url: "../statistic/order_statistics",
			data: "referer_name="+referer_name+"&referer_domain="+referer_domain+"&referer="+referer,
			success: function(result){
				$("#Order_Statistics").html(result);
			}
		});
	}

	$(".coupon_use_btn").bind('click', function(){
		var order_seq = $(this).attr("order_seq");
		$.ajax({
			type: "post",
			url: "../export/coupon_use",
			data: "order_seq="+order_seq,
			success: function(result){
				if	(result){
					$("#coupon_use_lay").html(result);
					openDialog("티켓사용 확인 / 티켓번호 재발송", "coupon_use_lay", {"width":"1000","height":"700"});
				}
			}
		});
	});

	$(".under_div_view").bind("mouseover",function(){
		$(this).find("div.under_div_view_contents").removeClass("hide");
	}).bind("mouseout",function(){
		$(this).find("div.under_div_view_contents").addClass("hide");
	});


	// 상품 매칭 버튼
	$(".goods_matching").bind('click',function(){
		var order_item_seq = $(this).attr('order_item_seq');
		select_one_goods("select_one_goods_callback|"+order_item_seq);
	});

	// 출고창 바로열기
	if(directExport == '1'){
		if($("#goods_export").is(":visible")) $("#goods_export").click();
	}

	$(".url-ctrl").bind("mouseover",function(){
		$(this).children('.url-helper').show();
	}).bind("mouseout",function(){
		$(this).children('.url-helper').hide();
	});

	// 상품 옵션매칭 처리
	$("select.changeOptionSelect").change(function(){
		var thisObj = this;
		if($(this).val()!=''){
			if(confirm('변경하시겠습니까?')){
				$.ajax({
					'url' : '/admin/order_process/modify_order_item_option',
					'type' : 'post',
					'data' : {'item_option_seq':$(this).attr('item_option_seq'),'goods_option_seq':$(this).val()},
					'dataType' : 'json',
					'success' : function(res){
						if(res.success){
							document.location.reload();
						}else{
							alert('변경 실패');
							$(thisObj).val('');
						}
					}
				});
			}else{
				$(thisObj).val('');
			}
		}
	});

	// sns 계정 정보 확인
	$(".btnsnsdetail").on("click",function(){
		var no		= $(this).attr("no");
		if(no == '' || no == 0 ) no = 1;
		var obj		= $("div#snsdetailPopup"+no);
		var disp	= obj.css("display");
		if(obj.html() == ''){
			$.get('../member/sns_detail?snscd='+$(this).attr("snscd")+'&member_seq='+member_seq+'&no='+no, function(data) {
				obj.html(data);
			});
		}
		if(disp == "none") obj.show(); else obj.hide();
	});

	// 사은품 지급 조건 상세
	$(".gift_log").bind('click', function(){
		$.ajax({
			type: "post",
			url: "../event/gift_use_log",
			data: "order_seq="+$(this).attr('order_seq')+"&item_seq="+$(this).attr('item_seq'),
			success: function(result){
				if	(result){
					$("#gift_use_lay").html(result);
					openDialog("사은품 이벤트 정보", "gift_use_lay", {"width":"500","height":"330"});
				}
			}
		});
	});
	
	$("select.delivery_company_code").bind("change",function(){
		if($(this).val() && $(this).val().substring(0,5)=='auto_'){
			$("option",this).not(":selected").attr("disabled",true);
			$(this).parent().find("input.delivery_number").attr("readonly",true).addClass("disabled");
		}else{
			$(this).parent().find("input.delivery_number").attr("readonly",false).removeClass("disabled");
		}
	}).change();

	//원주문 펼쳐보기 - 반품상세/환불상세
	if(!pagemode) pagemode = '';

	if(pagemode == "return_view" || pagemode == "refund_view"){
		$("#order_summary_open").bind("click",function(){
			$(this).hide();
			$("#order_summary_close").show();
			$("#order-summary-dvs").show();
			$(".order-summary").stop(true,true).slideDown();			
			//$(".order-summary2").stop(true,true).slideDown();
		});
		$("#order_summary_close").bind("click",function(){
			$(this).hide();
			$("#order_summary_open").show();
			$("#order-summary-dvs").hide();
			$(".order-summary").stop(true,true).slideUp();
			//$(".order-summary2").stop(true,true).slideUp();
		});

		$(".order-summary").hide();
		$("#order-summary-dvs").hide();
		//$(".order-summary2").hide();
	}

	//원주문 펼쳐보기 - 출고상세
	if(pagemode == "export_view"){ 
		$(".export_order_summary_open").bind("click",function(){
			$(this).hide();
			order_seq	= $(this).attr('order_seq');
			$("#order_summary_close_" + order_seq).show();
			$("#order-summary-dvs_" + order_seq).show()
			$("#order-summary-title_" + order_seq).stop(true,true).slideDown();
			$("#order-summary_" + order_seq).stop(true,true).slideDown();
		});
		$(".export_order_summary_close").bind("click",function(){
			$(this).hide();
			order_seq	= $(this).attr('order_seq');
			$("#order_summary_open_" + order_seq).show();
			$("#order-summary-dvs_" + order_seq).stop(true,true).slideUp();
			$("#order-summary-title_" + order_seq).stop(true,true).slideUp();
			$("#order-summary_" + order_seq).stop(true,true).slideUp();
		});

		$(".order-summary").hide();
	}

	// 개인정보 마스킹 처리 입력폼 비활성화
	if( private_masking ) {
		$("input,select",$(".order_shipping_box")).each(function(){
			if($(this).attr('class')!='send_recipient_sms' && $(this).attr('id')!='send_recipient_email'){
				$(this).attr('disabled',true);
			}
		});

		if( step == 15 ) {
			$("input[name='depositor']").each(function(){$(this).attr('disabled',true);});
		}
	}
});


// 상품 매칭 처리
function select_one_goods_callback(order_item_seq,goods_seq){
	$.ajax({
		'type': "post",
		'url': "../order_process/order_goods_matching",
		'data': "order_item_seq="+order_item_seq+"&goods_seq="+goods_seq,
		'dataType': 'json',
		'success': function(res){
			if(res.success){
				document.location.reload();
			}else{
				alert('변경 실패');
				$(thisObj).val('');
			}
		}
	});
}

function closeAlertPopup(msg,dialogid){
	openDialogAlert(msg, 400, 150, function(){closeDialog(dialogid);});
}

//결제취소
function order_refund(order_seq){
	if(orign_order_seq != ""){
		openDialogAlert("교환 주문 건은 관리자가 결제 취소를 할 수 없습니다.<br />교환 주문 건 취소는 관리자가 교환 주문 건에 대해 출고 및 반품 처리 후 환불 처리해 주시기 바랍니다.",400,260);
		return;
	}
	$("#order_refund_layer").load("order_refund",{'order_seq':order_seq},function(){
		
		var title = "결제취소/환불 신청";
		if(order_npay && order_pg == "npay"){ title = title +"(네이버페이)"; }
		openDialog("<span class='red bold'>"+title+" - 결제취소 상품이 있을 때 사용하세요!</span>", "order_refund_layer", {"width":800,"height":650});
	});
}

//결제취소(기타) - 삭제
function order_refund_etc(order_seq){
	if(num(nomatch_goods_cnt) > 0){
		openDialogAlert("매칭되지 않은 주문상품이 있습니다.<br />주문상품 목록에서 상품을 매칭해주세요.",400,160,function(){
			$('html').animate({'scrollTop':$(".item-title-order-item").offset().top-60});
		});
		return;
	}
	$("#order_refund_layer").load("order_refund_etc",{'order_seq':order_seq},function(){
		openDialog("결제취소/환불 신청(기타)  <span class='red bold'>- 결제취소 상품이 없을 때 사용하세요!</span>", "order_refund_layer", {"width":800,"height":350});
	});
}

//반품신청
function order_return(order_seq){
	if(num(nomatch_goods_cnt) > 0){
		openDialogAlert("매칭되지 않은 주문상품이 있습니다.<br />주문상품 목록에서 상품을 매칭해주세요.",400,160,function(){
			$('html').animate({'scrollTop':$(".item-title-order-item").offset().top-60});
		});
		return;
	}
	$("#order_refund_layer").load("order_return",{'order_seq':order_seq,'type':'return'},function(){
		var title = "반품 신청";
		if(order_npay && order_pg == "npay"){ title = title +"(네이버페이)"; }
		openDialog(title, "order_refund_layer", {"width":1000,"height":760});

	});
}

//티켓 반품신청
function order_return_coupon(order_seq){
	if(num(nomatch_goods_cnt) > 0){
		openDialogAlert("매칭되지 않은 주문상품이 있습니다.<br />주문상품 목록에서 상품을 매칭해주세요.",400,160,function(){
			$('html').animate({'scrollTop':$(".item-title-order-item").offset().top-60});
		});
		return;
	}
	$("#order_refund_layer").load("order_return?mode=return_coupon",{'order_seq':order_seq,'type':'return'},function(){
		openDialog("티켓상품 환불 신청", "order_refund_layer", {"width":1000,"height":760});
	});
}

//맞교환신청
function order_exchange(order_seq){
	if(num(nomatch_goods_cnt) > 0){
		openDialogAlert("매칭되지 않은 주문상품이 있습니다.<br />주문상품 목록에서 상품을 매칭해주세요.",400,160,function(){
			$('html').animate({'scrollTop':$(".item-title-order-item").offset().top-60});
		});
		return;
	}
	$("#order_refund_layer").load("order_return?mode=exchange",{'order_seq':order_seq,'type':'exchange'},function(){
		openDialog("맞교환신청", "order_refund_layer", {"width":1000,"height":760});
	});
}

function viewLogManual(type)
{
	if	(type == 'proc'){
		var code	= 'order_process_log_manual';
		var title	= '처리내역로그 설명';
		var height	= 900;
	}else if	(type == 'pay'){
		var code	= 'order_pay_log_manual';
		var title	= '결제로그 설명';
		var height	= 500;
	}
	$.get('/admin/common/getGabiaManualPannel?code='+code, function(data) {
		$('#logManual').html(data);
		openDialog(title, "logManual", {"width":"1000","height":height});
	});
}

function openAdvancedStatistic(goods_seq){
	$.ajax({
		type: "get",
		url: "../statistic/advanced_statistics",
		data: "ispop=pop&goods_seq="+goods_seq,
		success: function(result){
			$(document).find('body').append('<div id="Advanced_Statistics"></div>');
			$("#Advanced_Statistics").html(result);
			openDialog("<span style='margin-left:410px;'>이 상품의 고급 통계</span>", "Advanced_Statistics", {"width":"1000","height":"770","show" : "fade","hide" : "fade"});
		}
	});
}

function confirmShippingChange(frm){
	$.ajax({
		'async' : false,
		'global' : false,
		'url' : '../order_process/shipping_multi_confirm',
		'data' : $(frm).serialize(),
		'dataType' : 'json',
		'type' : 'post',
		'success' : function(res){
			if(res.msg){
				openDialogConfirm(res.msg,450,140,function(){
					$(frm).submit();
				});
			}else{
				$(frm).submit();
			}
		}
	});

}

// 할인내역 열기 닫기
function open_sale_contents(obj)
{
	var btnobj	= $(obj);
	var trobj	= $(obj).closest('tr').next();
	var tdobj	= $(obj).closest('td');
	var divobj	= trobj.find("td").eq(tdobj.index()).find("div.detail-sale-box");
	if(divobj.hasClass('hide')){
		divobj.removeClass('hide');
		btnobj.attr('src','../skin/default/images/common/btn_close.gif');
	}else{
		divobj.addClass('hide');
		btnobj.attr('src','../skin/default/images/common/btn_open.gif');
	}
}

// 출고처리 상품별
function goods_export(){

	var url = "../order/order_export_popup?mode=goods&status=45&search_type=order_seq&keyword="+order_seq;
	if(typeof step === 'string') {
		url += "&" + "step["+step+"]="+step;
	}
	var win = window.open(url,'export_popup','toolbar=no, scrollbars=yes, resizable=yes, width=1265, height=954');

}

function batch_export()
{
	$("form#goods_export input[name='check_mode']").val('');
	$("form#goods_export").submit();
	$("form#goods_export input[name='check_mode']").val('check');
}

function check_excel_stock_policy_step(){
	var obj = $("select#excel_export_step");
	var sobj = $("select#excel_export_stockable");

	if( obj.val() == 45) {
		obj.parent().find("span").addClass("hide");
		sobj.find("option[value='unlimit']").attr("selected",true);
	}
	if( obj.val() == 55) {
		obj.parent().find("span").removeClass("hide");
	}
}

function view_log(str)
{
	$('#order_log').addClass("hide");
	$('#export_log').addClass("hide");
	$('#partner_log').addClass("hide");
	$('#'+str).removeClass("hide");
}

function batch_chage_status(mode_status,export_code){
	var status = mode_status;
	var url = '../export/batch_status?mode=goods&step=25&search_type=export_code&keyword='+export_code+'&status='+status;
	var win = window.open(url,'export_popup','toolbar=no, scrollbars=yes, resizable=yes, width=1265, height=954');
}

function open_saleinfo_layer(mode, code, item_option_seq){
	var url		= '';
	var title	= '';

	switch(mode){
		case	'coupon_down' :
			url		= '/admin/order/download_coupon?mode='+mode+'&item_option_seq='+item_option_seq+'&no=';
			title	= '쿠폰 사용내역';
			break;

		case	'coupon_ordno' :
			url		= '/admin/order/download_coupon?mode='+mode+'&no=';
			title	= '쿠폰 사용내역';
			break;

		case	'coupon_ordno_goods_ordersheet' :
			url		= '/admin/order/download_coupon?mode='+mode+'&no=';
			title	= '쿠폰 사용내역';
			break;

		case	'coupon_shipping' :
			url		= '/admin/order/download_coupon?mode='+mode+'&no=';
			title	= '배송비 쿠폰 사용내역';
			break;

		case	'promotion_code' :
			url		= '/admin/order/download_promotion?mode='+mode+'&item_option_seq='+item_option_seq+'&no=';
			title	= '프로모션 코드 사용내역';
			break;

		case	'promotion_ordno' :
			url		= '/admin/order/download_promotion?mode='+mode+'&no=';
			title	= '프로모션 코드 사용내역';
			break;

		case	'promotion_shipping' :
			url		= '/admin/order/download_promotion?mode='+mode+'&no=';
			title	= '배송비 프로모션 코드 사용내역';
			break;

		default :
			return false;
	}

	addFormDialog(url+code, '93%', '600', title,'false');
}

// 상품 매칭, 변경
function set_goods_list(member_seq,item_seq,option_seq,cart_table){

	var param		= "";
	var displayId	= "choice_goods_selected_";

	param			= "&order_seq="+order_seq+"&member_seq="+member_seq+"&displayId="+displayId+"&cart_table="+cart_table;
	param			= param +"&item_seq="+item_seq+"&option_seq="+option_seq;

	$.ajax({
		type: "get",
		url: "../goods/select_new",
		data: "page=1"+param,
		success: function(result){
			$("div#"+displayId).html(result);
		}
	});
	openDialog("상품 검색", displayId, {"width":"1000","height":"700","show" : "fade","hide" : "fade"});
}


// 배송조회
function goDeliverySearch(obj){
	var code	= $(obj).closest('tr').find('.delivery_company_code').val();
	var number	= $(obj).closest('td').find('.delivery_number').val();
	var provider= $(obj).closest('tr').find('.shipping_provider_seq').val();
	open_search_delivery(code, number, '', provider);
}
