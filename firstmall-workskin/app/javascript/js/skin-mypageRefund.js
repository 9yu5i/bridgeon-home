function refund_method_layer_view(){
	var chk_ea_sum = 0;

	$("#order_refund_container select[name='chk_ea[]']").each(function(){
		chk_ea_sum += parseInt($(this).val());
	});

	if(gl_order_total_ea == chk_ea_sum.toString()){
		document.refundForm.cancel_type.value='full';
	}else{
		document.refundForm.cancel_type.value='partial';
	}

	if((gl_orders_payment == "card" || gl_orders_payment == "kakaomoney" || gl_orders_pg == "payco" || gl_orders_payment == "cellphone") && gl_order_total_ea == chk_ea_sum.toString()){
		$("#refund_method_layer").hide();
		$("#manual_refund_layer").show();
	}
}

function refundSubmit(){
	/* 올앳 결제취소시 파라미터 암호화 스크립트 처리 */
	if(gl_pg_company == 'allat' && gl_orders_payment == "card"){
		if(document.refundForm.cancel_type.value=='full'){
			document.refundForm.action = "/common/allat_enc";
		}else{
			document.refundForm.action = "../mypage_process/order_refund";
		}
	}
	return true;
}
$(function(){
	$("#order_refund_container input[name='chk_seq[]']").change(function(){
		var row = $(this).closest("tr");
		var idx = $("#order_refund_container input[name='chk_seq[]']").index(this);
		var chk_item_seq = row.find("input[name='chk_item_seq[]']").val();
		var chk_option_seq = row.find("input[name='chk_option_seq[]']").val();
		var chk_individual_refund = row.find("input[name='chk_individual_refund[]']").val();
		var chk_individual_refund_inherit = row.find("input[name='chk_individual_refund_inherit[]']").val();
		var chk_individual_export = row.find("input[name='chk_individual_export[]']").val();
		var chk_individual_return = row.find("input[name='chk_individual_return[]']").val();

		if($(this).is(":checked")){
			row.find("input,select,textarea").not(this).removeAttr("disabled");
			row.find("select[name='chk_ea[]'] option:last-child").attr("selected",true).parent().change();
		} else{
			row.find("input,select,textarea").not(this).attr("disabled",true);
			row.find("select[name='chk_ea[]']").val('').change();
			if($(this).attr('cancel_type') ==  1 ){
				$(this).attr("disabled",true);
			}
		}

		// 추가옵션 선택할때
		if(row.find("input[name='chk_suboption_seq[]']").val()!='' && $(this).is(":checked")){
			if(chk_individual_refund!='1'){ // 개별취소 안되도록 설정했을때
				// 필수옵션이 선택되어있지 않으면 에러
				var result = true;
				$("#order_refund_container input[name='chk_item_seq[]'][value='"+chk_item_seq+"']").each(function(){
					if($(this).closest("tr").find("input[name='chk_suboption_seq[]']").val()==''){
						if(!$(this).closest("tr").find("input[name='chk_seq[]']").is(":checked")){
							//이 상품의 추가옵션은 개별취소할 수 없습니다.
							openDialogAlert(getAlert('mp132'), 400, 140);
							$("input[name='chk_seq[]']").eq(idx).attr("checked", false);
							row.find("input,select,textarea").not("input[name='chk_seq[]']").attr("disabled", true);
							result = false;
						}
					}
				});
				if(!result) return false;
			}
		}

		// 추가옵션 해제할때
		if(row.find("input[name='chk_suboption_seq[]']").val()!='' && !$(this).is(":checked")){
			if(chk_individual_refund!='1' || (chk_individual_refund=='1' && chk_individual_refund_inherit=='1')){
				var result = true;
				$("#order_refund_container input[name='chk_item_seq[]'][value='"+chk_item_seq+"']").each(function(){
					if($(this).closest("tr").find("input[name='chk_suboption_seq[]']").val()==''){
						if($(this).closest("tr").find("select[name='chk_ea[]'] option:last-child").is(":selected")){
							if(chk_individual_refund!='1'){
								openDialogAlert(getAlert('mp132'),400,140);
							}else if(chk_individual_refund=='1' && chk_individual_refund_inherit=='1'){
								//이 상품의 필수옵션이 취소되면 추가옵션도 함께 취소되어야합니다.
								openDialogAlert(getAlert('mp133'),450,140);
							}
							$("input[name='chk_seq[]']").eq(idx).attr("checked",true);
							result = false;
						}
					}
				});
				if(!result) return false;
			}
		}

		// 필수옵션 해제할때
		if(row.find("input[name='chk_suboption_seq[]']").val()=='' && !$(this).is(":checked")){
			if(chk_individual_refund!='1'){ // 개별취소 안되도록 설정했을때
				// 추가옵션 해제
				var result = true;
				$("#order_refund_container input[name='chk_item_seq[]'][value='"+chk_item_seq+"'][item_option_seq='"+chk_option_seq+"']").each(function(){
					if($(this).closest("tr").find("input[name='chk_suboption_seq[]']").val()!=''){
						$(this).closest("tr").find("input,select").attr("disabled",true);
						$(this).closest("tr").find("input[name='chk_seq[]']").attr("disabled",false);
						$(this).closest("tr").find("input[name='chk_seq[]']").removeAttr("checked");
						$(this).closest("tr").find("select[name='chk_ea[]']").val('').attr("disabled",true);
					}
				});
			}
		}

		refund_method_layer_view();
	});
	$("#order_refund_container input[name='chk_seq[]']").each(function () {
		$(this).closest(".tbody").find("input,select").not("input[name='chk_seq[]']").attr("disabled",true);
	});

	$("#order_refund_container select[name='chk_ea[]']").change(function(){
		var row = $(this).closest("tr");
		var idx = $("#order_refund_container select[name='chk_ea[]']").index(this);
		var chk_item_seq = row.find("input[name='chk_item_seq[]']").val();
		var chk_option_seq = row.find("input[name='chk_option_seq[]']").val();
		var chk_individual_refund = row.find("input[name='chk_individual_refund[]']").val();
		var chk_individual_refund_inherit = row.find("input[name='chk_individual_refund_inherit[]']").val();
		var chk_individual_export = row.find("input[name='chk_individual_export[]']").val();
		var chk_individual_return = row.find("input[name='chk_individual_return[]']").val();

		if($(this).val()=='0'){
			$(this).closest("tr").find("input[name='chk_seq[]']").removeAttr("checked").change();
		}

		// 필수옵션일때
		if(row.find("input[name='chk_suboption_seq[]']").val()==''){
			if(chk_individual_refund!='1' || (chk_individual_refund=='1' && chk_individual_refund_inherit=='1')){
				if(row.find("select[name='chk_ea[]'] option:last-child").is(":selected")){
					$("#order_refund_container input[name='chk_item_seq[]'][value='"+chk_item_seq+"'][item_option_seq='"+chk_option_seq+"']").each(function(){
						if($(this).parent().find("input[name='chk_suboption_seq[]']").val()!=''){
							$(this).parent().find("input[name='chk_seq[]']").not(":disabled").attr("checked",true).change();
							$(this).closest("tr").find("select[name='chk_ea[]'] option").not(":last-child").attr("disabled",true);
						}
					});
				}else{
					$("#order_refund_container input[name='chk_item_seq[]'][value='"+chk_item_seq+"'][item_option_seq='"+chk_option_seq+"']").each(function(){
						if($(this).parent().find("input[name='chk_suboption_seq[]']").val()!=''){
							$(this).closest("tr").find("select[name='chk_ea[]'] option").not(":last-child").removeAttr("disabled");
						}
					});
				}
			}
		}

		refund_method_layer_view();
	});

	$("#order_refund_container .chk_all").on('click', function () {
		if($("#order_refund_container input[name='chk_seq[]']").not(":checked").length==0){
			$("#order_refund_container input[name='chk_seq[]']").each(function () {
				var row = $(this).closest("tr");
				if (row.find("input[name='chk_suboption_seq[]']").val() == "") {
					$(this).trigger('click');
				}
			});			
		}else{
			$("#order_refund_container input[name='chk_seq[]']").not(":disabled").each(function () {
				var row = $(this).closest("tr");
				if (row.find("input[name='chk_suboption_seq[]']").val() == "") {
					$(this).trigger('click');
				}
			});
		}
	});

	$("tr[disabledScript=1]").find("input,select").attr("disabled",true);
	$("input[name='input_chk_ea[]']").attr("disabled",true);

	// 수량 인풋박스 컨트롤
	$(".only_number_for_chk_ea").bind("blur",function(){
		var max = parseInt($(this).attr("max"));
		if( $(this).val() == "0" || $(this).val() == "" ){
			openDialogAlert("0개 이상을 입력해주세요.",400,140,function(){$el.val(max);$el.focus();});
			$(this).val(max);
		}
		$(this).trigger("change");
	});
	// 수량 인풋박스 컨트롤
	/* 숫자만 입력, 맨앞 0 지움 */
	$(".only_number_for_chk_ea").bind("keyup change",function(){
		var regexp = /[^0-9]/gi;
		var $el = $(this);
		// 수량 체크
		var max = parseInt($(this).attr("max"));
		var min = parseInt($(this).attr("min"));
		var val = 0;
		if( $(this).val() != "0" && $(this).val() != ""){
			val = parseInt($(this).val());
		}		
		if(regexp.test($(this).val())) {
			$(this).val($(this).val().replace(regexp,""));
			openDialogAlert("숫자만 입력 가능합니다.",400,140,function(){$el.val(max);$el.focus();});
			$(this).val(max);
		}
		if($(this).val().length > 1 && $(this).val().substring(0,1) == "0"){
			$(this).val($(this).val().substring(1,$(this).val().length));
		}
		if((val < min || val > max) && val != 0){
			openDialogAlert("수량은 "+min+"부터 "+max+"까지만 입력 가능합니다.",400,140,function(){$el.val(max);$el.focus();});
			$(this).val(max);
		}
		// select 박스에 값 전달
		$selectBoxEl = $(this).next();
		$selectBoxEl.children().remove();
		$selectBoxEl.append($("<option>").val($(this).val()));
		$selectBoxEl.val($selectBoxEl.first().val());
	});

});