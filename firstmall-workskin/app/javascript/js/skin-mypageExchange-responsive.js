function refund_method_layer_view(){
	var chk_ea_sum = 0;

	$("#order_return_container select[name='chk_ea[]']").each(function(){
		chk_ea_sum += parseInt($(this).val());
	});

	if(gl_orders_payment == "card" && gl_items_tot_ea == chk_ea_sum.toString()){
		$("#refund_method_layer").hide();
	}else{
		$("#refund_method_layer").show();
	}
}
$(function(){
		$("#order_return_container select[name='reason[]']").change(function(){
		var row = $(this).closest(".tbody");
		var reason_desc = row.find("select[name='reason[]'] option:selected").text();
		row.find("input[name='reason_desc[]']").val(reason_desc);
	});

	$("#order_return_container input[name='chk_seq[]']").change(function(){

		var obj						= $(this);
		var row						= obj.closest(".tbody");
		var idx						= $("#order_return_container select[name='chk_ea[]']").index(this);
		var chk_item_seq			= row.find("input[name='chk_item_seq[]']").val();
		var chk_option_seq			= row.find("input[name='chk_option_seq[]']").val();
		var chk_individual_return	= row.find("input[name='chk_individual_return[]']").val();
		var chk_export_code			= row.find("input[name='chk_export_code[]']").val();

		row.find("select[name='reason[]']").change();

		// 추가옵션 선택할때
		if(row.find("input[name='chk_suboption_seq[]']").val()!='' && obj.is(":checked")){
			if(chk_individual_return!='1'){ // 개별취소 안되도록 설정했을때
				// 필수옵션이 선택되어있지 않으면 에러
				var result = true;
				$("#order_return_container input[name='chk_item_seq[]'][value='"+chk_item_seq+"'][item_option_seq='"+chk_option_seq+"'][export_code='"+chk_export_code+"']").each(function(){
					if($(this).closest(".tbody").find("input[name='chk_suboption_seq[]']").val()==''){
						if(!$(this).closest(".tbody").find("input[name='chk_seq[]']").is(":checked")){
							obj.prop("checked",false);
							//이 상품의 추가옵션은 개별반품할 수 없습니다
							openDialogAlert(getAlert('mp134'),400,140);
							result = false;
						}
					}
				});
				if(!result) return false;
			}
		}

		// 추가옵션 해제할때
		if(row.find("input[name='chk_suboption_seq[]']").val()!='' && !obj.is(":checked")){
			if(chk_individual_return!='1'){
				var result = true;
				$("#order_return_container input[name='chk_item_seq[]'][value='"+chk_item_seq+"'][item_option_seq='"+chk_option_seq+"'][export_code='"+chk_export_code+"']").each(function(){
					if($(this).closest(".tbody").find("input[name='chk_suboption_seq[]']").val()==''){
						if($(this).closest(".tbody").find("select[name='chk_ea[]'] option").length>1 && $(this).closest(".tbody").find("select[name='chk_ea[]'] option:last-child").is(":selected")){
							obj.prop("checked",true);
							//이 상품의 추가옵션은 개별반품할 수 없습니다.
							openDialogAlert(getAlert('mp134'),400,140);
							result = false;
						}
					}
				});
				if(!result) return false;
			}
		}

		// 필수옵션 해제할때
		if(row.find("input[name='chk_suboption_seq[]']").val()=='' && !$(this).is(":checked")){
			if(chk_individual_return!='1'){ // 개별취소 안되도록 설정했을때
				// 추가옵션 해제
				var result = true;
				$("#order_return_container input[name='chk_item_seq[]'][value='"+chk_item_seq+"'][item_option_seq='"+chk_option_seq+"'][export_code='"+chk_export_code+"']").each(function(){
					if($(this).closest(".tbody").find("input[name='chk_suboption_seq[]']").val()!=''){
						$(this).closest(".tbody").find("input[name='chk_seq[]']").removeAttr("checked");
						$(this).closest(".tbody").find("select[name='chk_ea[]']").val('').attr("disabled",true);
					}
				});
			}
		}

		if($(this).is(":checked")){
			row.find("input,select,textarea").not(this).removeAttr("disabled");
			row.find("select[name='chk_ea[]'] option:last-child").attr("selected",true).parent().change();
			row.find("select[name='chk_ea[]']").not(this).css({'background':'#ff7f7f'});
		}
		else{
			row.find("select[name='chk_ea[]']").not(this).css({'background':'#ccc'});
			row.find("input,select,textarea").not(this).attr("disabled",true);
			row.find("select[name='chk_ea[]']").val('').change();
			if($(this).attr('cancel_type') ==  1 ){
				$(this).attr("disabled",true);
			}
		}

		refund_method_layer_view();
	}).change();

	$("#order_return_container select[name='chk_ea[]']").change(function(){
		var row						= $(this).closest(".tbody");
		var idx						= $("#order_return_container select[name='chk_ea[]']").index(this);
		var chk_item_seq			= row.find("input[name='chk_item_seq[]']").val();
		var chk_option_seq			= row.find("input[name='chk_option_seq[]']").val();
		var chk_individual_return	= row.find("input[name='chk_individual_return[]']").val();
		var chk_export_code			= row.find("input[name='chk_export_code[]']").val();

		if($(this).val()=='0'){
			$(this).closest(".tbody").find("input[name='chk_seq[]']").removeAttr("checked").change();
		}

		// 필수옵션일때
		if(row.find("input[name='chk_suboption_seq[]']").val()==''){
			if(chk_individual_return!='1'){
				if(row.find("select[name='chk_ea[]'] option").length>1 && row.find("select[name='chk_ea[]'] option:last-child").is(":selected")){
					$("#order_return_container input[name='chk_item_seq[]'][value='"+chk_item_seq+"'][item_option_seq='"+chk_option_seq+"'][export_code='"+chk_export_code+"']").each(function(){
						if($(this).parent().find("input[name='chk_suboption_seq[]']").val()!=''){
							$(this).parent().find("input[name='chk_seq[]']").not(":disabled").attr("checked",true).change();
							$(this).closest(".tbody").find("select[name='chk_ea[]'] option").not(":last-child").attr("disabled",true);
						}
					});
				}else{
					$("#order_return_container input[name='chk_item_seq[]'][value='"+chk_item_seq+"'][item_option_seq='"+chk_option_seq+"'][export_code='"+chk_export_code+"']").each(function(){
						if($(this).parent().find("input[name='chk_suboption_seq[]']").val()!=''){
							$(this).closest(".tbody").find("select[name='chk_ea[]'] option").not(":last-child").removeAttr("disabled");
						}
					});
				}
			}
		}

		refund_method_layer_view();
	});

	$("#order_return_container .chk_all").click(function(){
		var tableObj = $(this).closest('.res_table');
		if($("input[name='chk_seq[]']",tableObj).not(":checked").length==0){
			$("input[name='chk_seq[]']",tableObj).removeAttr("checked").change();
		}else{
			$("input[name='chk_seq[]']",tableObj).not(":disabled").attr("checked",true).change();
		}
	});

	$("input[name='refund_method']").change(function(){
		$(".refund_method_cash").hide();
		$(".refund_method_bank").hide();
		if($(this).is(":checked")){
			$(".refund_method_"+$(this).val()).show();
		}
	}).change();

	$("input[name='chk_shipping_seq'][tot_rt_ea!='0']").eq(0).attr("checked",true);
	$("input[name='chk_shipping_seq']").change(function(){
		var shippingGroupObj = $(this).closest('div.shipping_group');
		if($(this).is(":checked")){
			$(shippingGroupObj).children(".res_table").css('opacity',1).find("*").removeAttr("disabled");
			$("div.shipping_group").not(shippingGroupObj).children(".res_table").css('opacity',0.5).find("*").attr("disabled",true);

			if($(this).val()!='1' && $("input[name='chk_shipping_group_address[]']",shippingGroupObj).val().length>20){
				$(".return_shipping_group_address").text($("input[name='chk_shipping_group_address[]']",shippingGroupObj).val());
			}else{
				$(".return_shipping_group_address").text("("+$(this).attr("return_zipcode")+") " + $(this).attr("return_address"));
			}
		}else{
			$(shippingGroupObj).children(".res_table").css('opacity',0.5).find("*").attr("disabled",true);
			$("div.shipping_group").not(shippingGroupObj).children(".res_table").css('opacity',1).find("*").removeAttr("disabled");
		}
		$("#order_return_container input[name='chk_seq[]']").change();
	}).change();

	$("[name='submitButton']").bind('click',function(){
		var frm = this;
		//반품신청을 하기 위해 상품수령을 확인해주세요. 상품을 수령하셨습니까?
		openDialogConfirm(getAlert('mp135'),450,140,function(){
			$("form[name='refundForm']").submit();
		});
		return false;
	});

	// 우편번호 찾기
	/*
	$("#return_recipient_zipcode_button").live("click",function(){
		window.open('../popup/zipcode?popup=1&zipcode=return_recipient_zipcode[]&new_zipcode=return_recipient_new_zipcode&address=return_recipient_address&address_street=return_recipient_address_street&address_detail=return_recipient_address_detail','popup_zipcode','width=600,height=480');
	});
	*/

	$("[disabledScript=1]").find("input,select").attr("disabled",true);

	// 반품 방법 선택시
	$('[name="return_method"]').unbind('click');
	$('[name="return_method"]').bind('click', function(){
		var index = $('[name="return_method"]').index(this);
		
		// bold
		$('.return_method_text').removeClass('bold');
		$(this).parent().find('.return_method_text').addClass('bold');

		if(index == 0) {
			$('.return_shipping_group_address').show();
			$('.return_custom_shipping_address').hide();
		} else {
			$('.return_shipping_group_address').hide();
			$('.return_custom_shipping_address').show();
		}
	});
	
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