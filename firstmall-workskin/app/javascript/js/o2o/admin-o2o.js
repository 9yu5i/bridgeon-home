var showDebugModeClick = 0;
var showDebugModeCnt = 5;
var showDebugMode = false;
$(document).ready(function() {  	
	// 디버그모드 이벤트 바인드
	$("#showBtnAddO2O").bind("click", function (){
		if(showDebugModeClick>showDebugModeCnt){
			showDebugMode = true;
		}else{
			showDebugModeClick++;
		}
	});	
	
	$(".showBtnContractO2O").click(function(){
		if	($("div.choose-contract-lay").css('display') != 'none')	$("div.choose-contract-lay").slideUp();
		else													$("div.choose-contract-lay").slideDown();
	});
	// 계약 버튼 이벤트 바인드
	$(".btnContractO2O").bind("click", function (){
		var url = $(this).data('url');
		var pos_code = $(this).attr('data-pos_code');
		var shop_seq = $("#contract_shop_seq").val();
		var domain = btoa($("#contract_domain").val());
		
                // 00 : KICC의 경우 계약은 모두 오프라인에서 진행되므로 단순 안내 페이지로 처리.
                if(pos_code == '00'){
                    url = url;
                }else{
                    url = url + "/contracts" + "?pos_code="+pos_code+"&shop_seq="+shop_seq+"&domain="+domain;
                }
		
		window.open(url);
	});
	
	// 활성화 저장하기
	$(".btnO2OActiveSave").bind("click", function (){
		o2oActiveSave();
	});
	
	// 목록 버튼 이벤트 바인드
	$("#btnO2OList").bind("click", function (){
		location.href = "/admin/o2o/o2osetting";
	});
	
	// 추가 버튼 이벤트 바인드
	$(".btnAddO2O").bind("click", function (){
		if(check_regist_able()){
			location.href = "/admin/o2o/o2osetting?mode=o2o_regist";
		}
		// showO2OConfig('write');
	});
	
	// 저장 버튼 이벤트 바인드
	$(".btnSaveO2OSetting").bind("click", function (){
		if(check_regist_able()){
			save();
		}
	});
	
	// 수정 버튼 이벤트 바인드
	$(".btnO2OConfigModify").bind("click", function (){
		showO2OConfig('modify',$(this).data("o2o_store_seq"));
	});
	
	//전체 체크 버튼
	$('#chkAll').click(function(){
		if($('#chkAll:checked').length == 0){
			$('.chk').attr('checked', false);
		}else{
			$('.chk').attr('checked', true);
		}
	});
	
	//전체 체크 버튼
	$('#chkAllPos').click(function(){
		if($('#chkAllPos:checked').length == 0){
			$('.chkPos').attr('checked', false);
		}else{
			$('.chkPos').attr('checked', true);
		}
	});
	
	// 삭제 버튼 이벤트 바인드
	$(".btnO2OConfigDelete").bind("click", function (){
		deleteO2OConfig();
	});
	
	// 삭제 버튼 이벤트 바인드
	$(".btnProcDelO2OSetting").bind("click", function (){
		$("form[name='settingForm']").attr("method", "post");
		$("form[name='settingForm']").attr("action", "../o2o/o2osetting_process/delete");
		$("form[name='settingForm']").attr("target", "actionFrame");
		$("form[name='settingForm']").submit();
		$("form[name='settingForm']").attr("method", "get");
		$("form[name='settingForm']").attr("action", "");
		$("form[name='settingForm']").attr("target", "");
	});
	
	// 삭제 버튼 이벤트 바인드
	$(".btnCancelDelO2OSetting").bind("click", function (){
		closeDialog('o2oDeleteInfoLayer');
	});
	
	// POS 추가 이벤트 바인드
	$(".btnO2OPosAdd").bind("click", function (){
		addO2OPos();
	});
	// POS 삭제 이벤트 바인드
	deleteInitO2OConfigPos();
	
	// 매장 리스트 기능 변경 by hed
	// 멀티 셀렉트 박스 기능
	if(typeof $('select').multipleSelect == 'function') {
		$('.selMultiClassCategory').multipleSelect({
			placeholder: "분류 선택"
			, selectAll: false
			, allSelected:'전체 분류'
			, noMatchesFound : '분류가 없습니다.'
		});
		$('.selMultiClassIcon').multipleSelect({
			placeholder: "매장 선택"
			, selectAll: false
			, allSelected:'전체 매장'
			, noMatchesFound : '매장이 없습니다.'
		});
	}
	
	//  입력 문자 자릿수 계산
	$('input.cal-len, textarea.cal-len').each(function(){calculate_input_len(this);});
	
	// 영업시간 이벤트 바인드
	$(".btnAddStoreTerm").bind("click", function (){
		add_store_term();
	});
	// 영업시간 휴무 컨트롤
	$("#sel_store_term_time").bind("change", function(){
		display_store_term_detail();
	});
	display_store_term_detail();
	// 영업시간 삭제 이벤트 바인드
	event_init_del_store_term();
	
	//매장 안내 컨트롤
	$("input[name='store_info_display_yn']").bind("change", function (){
		display_store_info();
	});
	display_store_info();
	
	//포스 연동 컨트롤
	$("input[name='store_o2o_use_yn']").bind("change", function (){
		display_store_o2o();
	});
	display_store_o2o();
	
	// 분류 변경
	category_chg();
	international_chg();
	
	// 재발급 안내 팝업 호출
	$(".btnPublishInfoPosKey").bind("click", function (){
		openDialog("연동키 재발급", "o2oPublishInfoLayer", {"width":"650","height":"400","show" : "fade","hide" : "fade"});
		// 재발행 버튼 기능 추가
		bindPublishPosKey();
	});
	
	// 매장 리스트 기능 변경 by hed
	// chkSMSDialog();
	// chkSSLDialog();
});


// 검색
function src_store_list(){
	var settingForm = $("form[name='settingForm']");
	settingForm.attr("target", "");
	settingForm.submit();
}
// 페이징 스크립트
function searchPaging(str_param){
	if(typeof(str_param) != "undefined"){
		var params = str_param.split("&");
		for(var i=0; i<params.length; i++ ){
			if(params[i] != ""){
				var split_param = params[i].split("=");
				if(split_param.length == 2){
					var param_name = split_param[0];
					var param_value = split_param[1];
					var obj = $("input[name='" + param_name + "']");
					if(obj.length == 1){
						obj.val(param_value);
					}
				}
			}					
		}
	}
	src_store_list();
}

function showO2OConfig(mode, o2o_store_seq){
	var modeText = "추가";
	if(typeof mode === "undefind"){
		mode = "write";
	}
	
	if(mode=="modify"){
		modeText = "수정";
	}
	initConfig(mode, o2o_store_seq);
	openDialog("매장 리스트 - " + modeText, "o2oConfigLayer", {"width":"650","height":"600","show" : "fade","hide" : "fade"});
}

function save(){
	$("#o2oConfigLayer form[name='settingConfigForm']").submit();
	
	/*
	// 비활성화 처리 했던 연결창고의 활성화
	$("select[name='scm_store']").attr("disabled",false);
	
	$("input[name='tmpZoneZipcode']").val($("input[name='zoneZipcode\\[\\]']").val());
	// 활성화 처리 했던 연결창고의 재비활성화
	$("select[name='scm_store']").attr("disabled",true);
	*/
}

function initConfig(mode, o2o_store_seq){
	// 폼 초기화 
	$("#o2oConfigLayer form[name='settingConfigForm']").find("input,select, span").each(function (){
		var $el = $(this);
		var elType = $el[0].type;
		if(elType=="text"){
			$el.val("");
		}else if(elType=="select-one"){
			$el.attr("disabled",false);
			$el.val($el.find("option").first().val());
		}else if(elType=="radio"){
			$("input[name='"+$el.attr('name')+"']").each(function (){
				$(this).attr("checked",false);
			});
			$("input[name='"+$el.attr('name')+"']:first").attr("checked",true);
		}else if(elType=="checkbox"){
			$el.attr("checked",false);
		}else if(($el[0].nodeName=="SPAN" && $el.hasClass("text_show"))){
			var initText = "";
			if($el.data("initText")){
				initText = $el.data("initText");
			}
			$el.html(initText);
		}
	});

	if(mode=="write"){
		$("#o2oConfigLayer form[name='settingConfigForm']").find(".text_hide").removeClass("hide");
	}else{
		$("#o2oConfigLayer form[name='settingConfigForm']").find(".text_hide").addClass("hide");
	}
	if(mode=="write"){
		$("#span_contracts_status").parent().parent().hide();
	}
	if(showDebugMode){
		$("#o2oConfigLayer form[name='settingConfigForm']").find(".text_hide").removeClass("hide");
		$("#o2oConfigLayer form[name='settingConfigForm']").find(".dev_hide").removeClass("hide");
	}else{
		$("#o2oConfigLayer form[name='settingConfigForm']").find(".dev_hide").addClass("hide");
	}
	
	initPosListHtml();
	
	if(typeof o2o_store_seq !== "undefined"){
		$.ajax({
			type: "POST",
			url: "../o2o/o2osetting_process/get",
			data: {"o2o_store_seq":o2o_store_seq},
			success: function(res){
				if(res){
					var $josnResult = $.parseJSON(res);
					if($josnResult.result=="1"){
						for(var col in $josnResult.data){
							var col_text = $josnResult.data[col];
							if(typeof $josnResult.data[col+"_text"] !== "undefined"){
								col_text = $josnResult.data[col+"_text"];
							}
							$("#span_"+col).html(col_text);
							if($("select[name='"+col+"']").length>0){
								$("select[name='"+col+"']").val($josnResult.data[col]);
								if($josnResult.data[col]){
									// $("select[name='"+col+"']").attr("disabled",true);
								}
							}else if($("input:checkbox[name='"+col+"']").length>0){
								$("input[name='"+col+"'][value='"+$josnResult.data[col]+"']").prop("checked", true);
							}else if($("input:radio[name='"+col+"']").length>0){
								$("input[name='"+col+"'][value='"+$josnResult.data[col]+"']").prop("checked", true);
							}else if($("input:text[name='"+col+"']").length>0){
								$("input[name='"+col+"']").val($josnResult.data[col]);
							}else if($("input:hidden[name='"+col+"']").length>0){
								$("input[name='"+col+"']").val($josnResult.data[col]);
							}
							if(col=='zoneZipcode'){
								$("input[name='zoneZipcode\\[\\]']").val($josnResult.data[col]);
							}
							if(col=='o2o_config_pos'){
								for(var o2o_config_pos_key in $josnResult.data[col]){
									addO2OPos($josnResult.data[col][o2o_config_pos_key]);
								}
							}
							if(col=='scm_store'){
								if($josnResult.data[col]){
									$("select[name='"+col+"']").attr("disabled",true);
								}
							}
						}
						
						international_chg();
						
						if(showDebugMode){
							$("#pos_key").parent().show();
							$("#div_publish_pos_key").show();
						}
					}else{
						openDialogAlert($josnResult.msg, 400, 150, function (){
							closeDialog('o2oConfigLayer');location.reload();
						});
					}
				}
			}
		});
	}
}
function deleteO2OConfig(){
	var msg = [];
	var refund_address_include = false;
	var shipping_store_include = false;
	$("input:checkbox[name='add_chk\\[\\]']:checked").each(function(){
		var refund_address = $(this).data("refund_address");
		var shipping_store = $(this).data("direct_store");
		if(typeof(refund_address) != "undefined" && refund_address == '1' && !refund_address_include){
			msg.push('반송지');
			var refund_address_include = true;
		}
		if(typeof(shipping_store) != "undefined" && shipping_store== '1' && !shipping_store_include){
			msg.push('매장수령');
			shipping_store_include = true;
		}
	});

	if(refund_address_include || shipping_store_include){
		openDialogAlert('선택한 매장은 ' + msg + '(으)로 사용 중 입니다. ' + msg + ' 설정 변경 후 다시 삭제해주세요.', 400, 180);
		return;
	}
	// 선택 값
	var arrSeq = $("input:checkbox[name='add_chk\\[\\]']:checked").map(function(){
		return $(this).val();
	}).get();
	
	if(arrSeq.length<1){
		openDialogAlert('삭제할 데이터를 선택해주세요.', 400, 150);
	}else{
		openDialog("매장 삭제 시 유의사항", "o2oDeleteInfoLayer", {"width":"600","height":"450","show" : "fade","hide" : "fade"});
	}
}
function deleteO2OConfigPos(obj){	
	var o2o_pos_seq = obj;
	if(typeof(o2o_pos_seq) !== "undefined"){
		if(o2o_pos_seq.val()>0){
			var del_o2o_pos_seq = o2o_pos_seq.next();
			del_o2o_pos_seq.val(o2o_pos_seq.val());
			o2o_pos_seq.parent().hide();
		}else{
			o2o_pos_seq.parent().remove();
		}
	}
}

// 재발행 버튼 기능 추가
function bindPublishPosKey(){
	$("input[name='agree_yn']").attr("checked", false);
	
	// 연동키 이벤트 바인드
	$(".btnPublishPosKey").unbind("click");
	$(".btnPublishPosKey").bind("click", function (){
		var o2o_store_seq = $("input[name='o2o_store_seq']").val();
		var agree_yn = $("input[name='agree_yn']:checked").val();
		if(typeof(agree_yn) === "undefined"){
			agree_yn = '';
		}
		
		if(agree_yn == ''){
			openDialogAlert('동의 항목은 필수입니다.', 400, 150);
			return;
		}

		$.ajax({
			type: "POST",
			url: "../o2o/o2osetting_process/generatePosKey",
			data: {"o2o_store_seq":o2o_store_seq, "agree_yn":agree_yn},
			success: function(res){
				if(res){
					var $josnResult = $.parseJSON(res);
					if($josnResult.result=="1"){
						$("input[name='pos_key']").val($josnResult.data);
						$("#span_pos_key").html($josnResult.data);
						closeDialog('o2oPublishInfoLayer');
						openDialogAlert("연동키가 재발행되었습니다.<br/>저장하여 연동키를 갱신해주세요.", 400, 150);
					}else{
						openDialogAlert($josnResult.msg, 400, 150, function (){
							closeDialog('o2oPublishInfoLayer');
						});
					}
				}
			}
		});
	});
	// 연동키 이벤트 바인드
	$(".btnCancelPublishPosKey").unbind("click");
	$(".btnCancelPublishPosKey").bind("click", function (){
		closeDialog('o2oPublishInfoLayer');
	});
}



// SMS 발송 가능 체크
function chkSMSDialog(){
	var chk			= $("#chkSMS_chk").val();
	var sms_auth	= $("#chkSMS_sms_auth").val();
	var send_phone	= $("#chkSMS_send_phone").val();
	if(typeof chk === "undefined")			chk = "";
	if(typeof sms_auth === "undefined")		sms_auth = "";
	if(typeof send_phone === "undefined")	send_phone = "";

	if($("#authPopup").length==0) {
		$("body").append($('<div id="authPopup" class="hide"></div>'));
	}
	
	if ( (chk == '' || sms_auth == '') && send_phone == "" ){
		$.get('../member_process/getAuthSendPopup', function(data) {
			$('#authPopup').html(data);
			openDialog("SMS 발송 안내 <span class='desc'>&nbsp;</span>", "authPopup", {"width":"800","height":"550"});
		});
		return;
	}else if(chk == '' || sms_auth == ''){
		$.get('../member_process/getAuthPopup', function(data) {
			$('#authPopup').html(data);
			openDialog("SMS 발송 보안키 및 발신 번호 등록 안내 <span class='desc'>&nbsp;</span>", "authPopup", {"width":"800","height":"300"});
		});
		return;
	}else if(send_phone == ""){
		$.get('../member_process/getSendPopup', function(data) {
			$('#authPopup').html(data);
			openDialog("SMS 발송 안내2 <span class='desc'>&nbsp;</span>", "authPopup", {"width":"800","height":"300"});
		});
	}
}


// SSL 체크
function chkSSLDialog(){
	var ssl_pay_is_alive			= $("#ssl_pay_is_alive").val();
	if(typeof ssl_pay_is_alive === "undefined")			ssl_pay_is_alive = "";
	if ( ssl_pay_is_alive == '' ){
		openDialogAlert("O2O 서비스를 사용하기 위해서는 SSL을 이용하셔야 합니다.");
	}
}
function addO2OPos(){
	// 값 설정
	var tmp_pos_seq = $("#tmp_pos_seq").val();
	if(tmp_pos_seq == ''){
		alert("포스키를 입력해주세요.");
		$("select[name='sel_store_term_week']").focus();
		return;
	}
	$("#tmp_pos_seq").val("");
	var canvers = $(".draw_pos_key");
	
	var wapper = $("<span class='row_pos_key'><br/></span>");
	var del_btn = $("<span class=''><button type='button' class='btnO2OPosDelete btn_minus'></button></span>");
	
	// 값 구성
	var arr_hidden_input = [
		"o2o_pos_seq"
		, "del_o2o_pos_seq"
		, "pos_seq"
	];
	var obj_store_o2o = [];
	
	for(var i=0; i<arr_hidden_input.length; i++){
		obj_store_o2o[arr_hidden_input[i]] = $("<input type='hidden' name='" + arr_hidden_input[i] + "[]'>");
	}
	
	obj_store_o2o['pos_seq'].val(tmp_pos_seq);

	var o2o_text = tmp_pos_seq + " ";
	
	wapper.append(o2o_text);
	
	for(var i in obj_store_o2o){
		wapper.append(obj_store_o2o[i]);
	}
	
	wapper.append(del_btn);
	canvers.append(wapper);
	
	deleteInitO2OConfigPos();
}
// 포스키 삭제 이벤트 바인드
function event_init_del_store_o2o_pos(){
	$(".btnDelStoreTerm").unbind("click");
	$(".btnDelStoreTerm").bind("click", function(){
		$(this).parent().parent().remove();
	});
}


// 국내 / 해외 주소 변경
function international_chg(){
	var nation = $("select[name='address_nation'] option:selected").val();
	switch(nation) {
		case 'korea':
			$(".inter_area").hide();
			$(".international_korea").show();
			$('input[name="zoneZipcode[]"]').attr('readonly', 'readonly');
			break;
		case 'global':
			$(".inter_area").hide();
			$(".international_global").show();
			$('input[name="zoneZipcode[]"]').attr('readonly', false);
			break;
	}
}

function initPosListHtml(mode){
	var mode = (typeof mode !== 'undefined') ? mode : 'init';
	var posLIstHtml = "";
	posLIstHtml = ''
		+'	<tr class="initPosListText">'
		+'		<td class="its-td center" colspan="5">'
		+'			POS 정보를 등록하여 주세요. ( POS신청완료 후 받으신 메일내용 필수 확인)'
		+'		</td>'
		+'	</tr>'
		+'';
	
	var initHtml = false;
	if(mode=='init' || (mode=="check" && $("#o2oPosList").children('tr').find(":visible").length==0)){
		initHtml = true;
	}
	
	if(initHtml){
		$("#o2oPosList").html(posLIstHtml);
	}
}


function o2oActiveSave(){
	// 선택 값
	var arrSeq = $("input:radio[name='o2o_use']:checked").map(function(){
		return $(this).val();
	}).get();
	if(arrSeq.length<1){
		openDialogAlert('사용 여부를 선택해주세요.', 400, 150);
	}else{
		$("form[name='settingForm']").attr("action","../o2o/o2osetting_process/saveActive");
		$("form[name='settingForm']").attr("target", "actionFrame");
		$("form[name='settingForm']").submit();
	}
}


// 해당 input박스의 입력된 글자수를 계산
function calculate_input_len(obj){
	var mobj	= $(obj).closest('len').find('span.view-len');
	var len	= $(obj).val().length;
	var max	= $(obj).attr('maxlength');
	mobj.removeClass('red');
	if(len < max){
		msg	= '<b>'+comma( len ) + '</b>/' + comma( max );
	}else{
		$(obj).val( $(obj).val().substring(0,max) );
		msg	= '<b>'+comma( max ) + '</b>/' + comma( max );
	}
	mobj.html( msg );
	if( len >= max ) mobj.find("b").addClass('red');
}

// 분류 변경시
function category_chg(){
	var category = $("#address_category option:selected").val();
	if(category == 'direct_input'){
		$("input[name='address_category_direct']").attr('disabled',false);
	}else{
		$("input[name='address_category_direct']").attr('disabled',true);
	}
}

// 영업시간 추가
function add_store_term(){
	var validation = true;
	// 요일 체크
	if($("select[name='sel_store_term_week']").val() == ""){
		alert("요일 선택을 완료해주세요.");
		$("select[name='sel_store_term_week']").focus();
		validation = false;
	};
	// 갯수 체크
	var max_length = 10;
	if($("input[name='store_term_week\[\]']").length > (max_length-1)){
		alert("최대 "+max_length+"개까지 생성 가능합니다.");
		$("select[name='sel_store_term_week']").focus();
		validation = false;
	}
	
	if(validation){
		make_store_term();
	}
}
// 영업시간 컨트롤
function display_store_term_detail(){
	$(".sel_store_term_detail").hide();
	if($("#sel_store_term_time").val() != 'closed'){
		$(".sel_store_term_detail").show();
	}
}
// 영업시간 만들기
function make_store_term(){
	// 값 구성
	var arr_hidden_input = [
		"store_term_week"
		, "store_term_time"
		, "store_term_hour1"
		, "store_term_min1"
		, "store_term_hour2"
		, "store_term_min2"
	];
	var obj_store_term = [];
	
	for(var i=0; i<arr_hidden_input.length; i++){
		obj_store_term[arr_hidden_input[i]] = $("<input type='hidden' name='" + arr_hidden_input[i] + "[]'>");
		var val = $("#sel_" + arr_hidden_input[i] + "").val();
		obj_store_term[arr_hidden_input[i]].val(val);
	}
	
	draw_store_term(obj_store_term);
}
// 영업시간 그리기
function draw_store_term(obj_store_term){
	var canvers = $(".draw_store_term");
	
	var wapper = $("<span class='row_store_term'><br/></span>");
	var term_text = $("<span class='row_store_term_text'></span>");
	var del_btn = $("<span class=''><button type='button' class='btnDelStoreTerm btn_minus'></button></span>");
	
	
	var store_term_week_text = $('#sel_store_term_week option:selected').html();
	var sel_store_term_hour = $('#sel_store_term_hour1').val() + ":" + $('#sel_store_term_min1').val() + " ~ " + $('#sel_store_term_hour2').val() + ":" + $('#sel_store_term_min2').val();
	var sel_store_term_time = (($('#sel_store_term_time').val()=='closed')?$('#sel_store_term_time option:selected').html():sel_store_term_hour);
	var full_text = store_term_week_text + " " + sel_store_term_time + " ";
	
	term_text.append(full_text);
	
	for(var i in obj_store_term){
		wapper.append(obj_store_term[i]);
	}
	wapper.append(term_text);
	wapper.append(del_btn);
	canvers.append(wapper);
	
	event_init_del_store_term();
}
// 영업시간 삭제 이벤트 바인드
function event_init_del_store_term(){
	$(".btnDelStoreTerm").unbind("click");
	$(".btnDelStoreTerm").bind("click", function(){
		$(this).parent().parent().remove();
	});
}
// 매장 안내 노출
function display_store_info(){
	$(".area_store_info").hide();
	if($("input[name='store_info_display_yn']:checked").val() == 'Y'){
		$(".area_store_info").show();
	}
}
// 포스 연동 노출
function display_store_o2o(){
	$(".area_store_o2o").hide();
	if($("input[name='store_o2o_use_yn']:checked").val() == 'Y'){
		$(".area_store_o2o").show();
	}
}
// 장소 입력 등록
function insert_address_pop(type){
	location.href = "/admin/o2o/o2osetting?mode=o2o_regist&seq="+type;
}
// 포스 삭제 이벤트 바인드
function deleteInitO2OConfigPos(){
	$(".btnO2OPosDelete").unbind("click");
	$(".btnO2OPosDelete").bind("click", function (){
		var o2o_pos_seq = $(this).parent().parent().find("input[name='o2o_pos_seq\[\]']");
		deleteO2OConfigPos(o2o_pos_seq);
	});
}
// 등록 가능 여부 체크
function check_regist_able(){
	var regist_able = false;
	var shipping_address_seq = $("input[name='shipping_address_seq']").val();
	if((typeof(shipping_address_regist_able_yn) === 'undefined' || shipping_address_regist_able_yn == 'N') && (typeof(shipping_address_seq) === 'undefined' || shipping_address_seq == '')){
		alert("최대 " + shipping_address_max + "개까지만 등록 가능합니다");
		regist_able = false;
	}else{
		regist_able = true;
	}
	return regist_able;

}