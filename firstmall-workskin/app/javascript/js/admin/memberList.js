var memberList = (function () {
	var _options		= {
		batch_mode : false
	};

	var _init = function (options) {
		_options.auth_arr = $.parseJSON(options.auth_arr);
		if (options.batch_mode) {
			_options.batch_mode = options.batch_mode;
		}
	}
	/**
	 * public
	 */
	return {

		// 초기 세팅
		init: _init,
		options:_options,
	} 
})();

$(document).ready( function() {
	$(".all-check").toggle(function(){
		$(this).parent().find('input[type=checkbox]').attr('checked',true);
	},function(){
		$(this).parent().find('input[type=checkbox]').attr('checked',false);
	});

	callPage = $("#callPage").val();
	if( callPage == "status") {
		$("#batchMemberForm input:radio[name='status'][value='']").attr("disabled",true);
		$("#batchMemberForm input:radio[name='status'][value='done']").attr("disabled",true);
		$("#batchMemberForm input:radio[name='status'][value='hold']").attr("disabled",false);
		$("#batchMemberForm input:radio[name='status'][value='dormancy']").attr("disabled",true);
	} else if (callPage == "sms" || callPage == "batch_sms") {
		//$("#batchMemberForm input:radio[name='sms'][value='']").attr("disabled",true);
		//$("#batchMemberForm input:radio[name='sms'][value='n']").attr("disabled",true);
	} else if (callPage == "email") {
		//$("#batchMemberForm input:radio[name='mailing'][value='']").attr("disabled",true);
		//$("#batchMemberForm input:radio[name='mailing'][value='n']").attr("disabled",true);
	}

	$(".batchForm").on("click", function() {
		var mode = $(this).attr("mode");
		if(!auth_check(mode)) return false;
		batchFormOpen(mode);
	});

	

	$(".pointNotForm").on("click", function(){
		alert("현재 포인트 '사용안함' 상태입니다. \n '사용함'으로 상태 변경 후 다시 시도하시기 바랍니다.");
		return;
	});

	$("#orderby_disp").on("change", function(){
		var value_arr = $(this).val().split(" ");
		$("#memberForm input[name='orderby']").val(value_arr[0]);
		$("#memberForm input[name='sort']").val(value_arr[1]);
		$("#memberForm input[name='orderby_disp']").val($(this).val());
		$("#memberForm").find("input[name='searchflag']").remove();
		$("#memberForm").append("<input type='hidden' name='searchflag' value='1'/>");		
		$("#memberForm").submit();
	});
	$("#display_quantity").on("change", function(){
		$("#memberForm").find("input[name='searchflag']").remove();
		$("#memberForm").append("<input type='hidden' name='searchflag' value='1'/>");				
		$("#memberForm").submit();
	});
	
	$(".withdrawalBtn").on("click", function(){
		if(!auth_check()) return false;
		batchWithdrawal();
	});

	$("#joingate").on("click", function(){
		window.open('/member/register?join_type=member&adminjoin=1','','');//'/member/agreement'
	});

	$("button[name='excel_down']").on('click',function(){
		if(!auth_check("excel")) return false;

		$(".email_download_hide").show();
		$("#gradeForm input[name='exceldown_mode']").val('');

		openDialog('엑셀 다운로드','admin_member_download', {'width':650});

		$("input[name='member_download_passwd']").val("");
		$("input[name='member_download_passwd']").focus();		
		
		$("#selectcount").html($(".checked-tr-background").length);
	});
 
	$("input[name='member_download_passwd']").on("keydown", function(e){
		if(e.keyCode == 13) {
			return false;
		}
	});

	$("button[name='excel_down_real']").on('click',function(){
		if (!$("input[name='member_download_passwd']").val()) {
			alert("비밀번호를 입력해 주세요.");
			$("input[name='member_download_passwd']").focus();
			return;
		}

		parent.closeDialog('admin_member_download');
		var queryString = $("#memberForm").serializeArray();
		queryString.push({name: 'member_download_passwd', value: $("input[name='member_download_passwd']").val()});
		ajaxexceldown('/admin/member_process/excel_down', queryString);
	});

	// 다운로드항목설정
	$("button[name='download_list']").on("click", function(){
		if(!auth_check("excel")) return false;

		openDialogPopup("다운로드 항목 설정", "download_list_setting", {
			'url' : 'download_write',
			'width' : 700			
		});
	});

	$("#gradeForm input[name='batch_mode']").on("click", function(){

		grade_reset('reset');
		$("#memberSearchDiv").html('');

		if($("#gradeForm input[name='batch_mode']:checked").val() == "member_grade"){
			$("#searchMemberBtn").attr("callpage","grade");
			$(".process_title").html("등급변경");
			$(".member_status_cont").hide();
			$(".member_grade_cont").show();
			
		}else{
			$("#searchMemberBtn").attr("callpage","status");
			$(".process_title").html("회원승인");
			$(".member_status_cont").show();
			$(".member_grade_cont").hide();
		}
	});

	// 회원(승인/등급) 일괄변경 : 엑셀다운로드
	$("#downloadMemberBtn").on("click", function(){
		if(!auth_check("excel")) return false;
		
		var batch_mode = memberList.options.batch_mode;

		if($("#gradeForm input[name='mcount']").val() == 0){
			openDialogAlert('다운로드 파일이 없습니다.<br />먼저 회원을 검색해 주세요.', 400, 150);
			return;
		}

		if(batch_mode == true) {
			$(".email_download_hide").hide();
		}

		$("#gradeForm input[name='exceldown_mode']").val('grade');

		openDialog('회원정보 다운로드','admin_member_download', {'width':600,'height':360});
	});

	// 회원(승인/등급) 일괄변경 : 일괄처리
	$("#grade_submit").on("click", function(){
		document.gradeForm.submit();
		//loadingStart();
	});

	// 이메일 보내기 버튼 추가 :: 2019-09-05 pjw
	$('.btnSendEmail').on("click",function(){		
		openDialog("이메일 발송 회원", "email_popup", {"width":"700","height":"610"});
	});

	$("#amail_send_submit").on("click",function(){
		amail_send_submit();
	});
	
	$("#send_to_add_btn").on("click", function() {
		send_to_add_btn();
	});

	// MEMBER COUNT
	$("input[name='add_num_chk']").click(function(){
		sendMemberSum();
	});

	// CHECKBOX
	$("input:[name='member_chk[]']").click(function(){
		chkMemberCount();
	});
});

// SEND MEMBER COUNT - IFRAME CONTROLLER
function sendMemberSum(){
	var add_cnt = $("#sendToList .mailItem").length;
	
	var chk = $("input:radio[name='member']:checked").val();
	var chk_cnt = 0;
	if(chk=='all'){
		chk_cnt = $("input:radio[name='member']:checked").attr("count");
	}else if(chk=='search'){
		chk_cnt = $("input[name='searchcount']").val();
	}else if(chk=='select'){
		chk_cnt = $("input:checkbox[name='member_chk[]']:checked").length;
	}else if(chk=='excel'){
		chk_cnt = 0;
	}

	var add_chk = $("input[name='add_num_chk']").attr('checked');
	if(add_chk=='checked'){
		chk_cnt = 0;
	}
	var total = parseInt(add_cnt) + parseInt(chk_cnt);
	$("#send_member").attr("count",total);
	$("#send_member").html(total);
}

// SMS "+" CLICK
function send_to_add_btn(){
	var cellphoneNo = $("input[name='send_to_add']").val();
	var bool = true;
	if(cellphoneNo){
		$("#sendToList .mailItem").each(function(e, data) {
			if($(this).attr("value") == cellphoneNo) bool = false;
		});

		if(bool){
			$("#sendToList").append("<div><span class='mailItem' value='"+cellphoneNo+"'>"+cellphoneNo+"</span> <span class='btn_minus fr sendToDelBtn'/></div>");
			$("input[name='send_to_add']").val('');
		} else {
			alert("이미 추가 된 이메일 주소입니다.");
			return true;
		}

		$("#sendToList").show();
	}
	sendMemberSum();
	sendToDel();
}

function grade_reset(mode){
	//초기화
	if(mode == "open"){
		$("#gradeForm input[name='batch_mode']").attr("checked",false);
		$("#gradeForm input[name='batch_mode'][value='member_status']").attr("checked",true).trigger('click');
	}
	$("#gradeForm input[name='member_old_grade']").val('');
	$("#gradeForm input[name='member_old_grade_name']").val('');
	$("#gradeForm input[name='serialize']").val('');
	$("#gradeForm input[name='selectMember']").val('');
	$("#gradeForm input[name='mcount']").val(0);
	$("#search_member").html(0);
}

function ajaxexceldown(url, queryString){
	var inputs = "";
	 jQuery.each(queryString, function(i, field){
		 inputs +='<input type="hidden" name="'+field.name+'" value="'+ field.value +'" />';
	 });
	jQuery('<form action="'+ url +'" method="post" target="actionFrame" >'+inputs+'</form>')
	.appendTo('body').submit().remove();
}

// SMS/Email 엑셀다운로드 시 form action 컨트롤
function excelDownloadOk()
{

	closeDialog('admin_member_download');

	var batch_mode 		= memberList.options.batch_mode;
	var callPage 		= $("#callPage").val();
	var frm 			= null;
	var mDownloadURL 	= "/admin/batch_process/sms_member_download";		// 회원리스트 엑셀 다운로드

	if(callPage == "status") {												// 회원승인 대상자 엑셀 다운로드 시 exceldown_mode 값으로 체크
		callPage = $("#gradeForm input[name='exceldown_mode']").val();
	}

	switch(callPage) {
		case "dormancy":
			// 휴면처리리스트 > SMS휴면고지 admin/member/sms_form_dormancy
			frm = $("form[name='smsForm']");
		break;
		case "email_dormancy":
			// 휴면처리리스트 > email 휴면고지 admin/member/email_form_dormancy
			// daumEditor 호출되는 곳에서는 $.submit() 사용 안됨
			frm = document.emailForm;
		break;
		case "email":
			// 회원리스트 > email 발송 admin/batch/email_form
			// daumEditor 호출되는 곳에서는 $.submit() 사용 안됨
			frm = document.emailForm;
		break;
		case "grade":
			// 회원리스트 > 승인/등록 일괄 변경 엑셀 다운로드 : admin/member/catalog
			// callPage ; grade
			// batch_mode ; true
			// exceldown_mode : grade
			frm 			= $("form[name='gradeForm']");
			mDownloadURL 	= "/admin/batch_process/grade_member_download";
		break;
		case "batch_sms":
			// 대량 SMS 발송 > 발송대상 회원리스트 엑셀 다운로드 : admin/batch/sms
			// exceldown_mode : undefined
			// callPage ; batch_sms
			// batch_mode ; true
			// 회원리스트 수동 SMS발송 동일 : admin/batch/sms_form
			var frm 		= $("form[name='smsForm']");
			// 다운로드 링크 끝에 걸린 callPage 변수의 역할을 확인할 수 없어 form attribute로 지정후 사용
			if(typeof frm.attr("callPage") != "undefined"){
				mDownloadURL = mDownloadURL + "?callPage=" + frm.attr("callPage");
			}
		break;
		case "emoney":
			// 회원리스트 > 마일리지 지급 admin/batch/emoney_form
			// callPage : emoney
			// batch_mode : true
			// exceldown_mode : undefined
			if(batch_mode == true){
				var frm 		= $("form[name='emoneyForm']");
				mDownloadURL = mDownloadURL + "?callPage=emoney";
			}
		break;
		case "point":
			// 회원리스트 > 포인트 지급 admin/batch/point_form
			// callPage : emoney
			// batch_mode : true
			// exceldown_mode : undefined
			if(batch_mode == true){
				var frm 		= $("form[name='emoneyForm']");
				mDownloadURL = mDownloadURL + "?callPage=point";
			}
		break;
		default:
			// 회원리스트 엑셀 다운로드 : admin/member/catalog
			// exceldown_mode : 
			// callPage ; undefined
			// batch_mode ; false
			frm = null;
			var excel_type = $("#admin_member_download input[name='excel_type']:checked").val();
			$("#memberForm input[name='excel_type']").val(excel_type);
			var queryString = $("#memberForm").serializeArray();
			queryString.push({name: 'member_download_passwd', value: $("input[name='member_download_passwd']").val()});
			//ajaxexceldown('/admin/member_process/excel_down', queryString);
			ajaxexceldown_spout('/cli/excel_down/create_member', queryString);
		break;
	}

	try {
		if(frm != null) {

			if(callPage == "email_dormancy" || callPage == "email"){
				var actionUrl 	= frm.action ;
				frm.action  = mDownloadURL;
				frm.submit();
				frm.action  = actionUrl;
			}else{
				if(frm.length > 1){
					throw new Error( '지정된 Form이 올바르지 않습니다.');
				}
				if(frm.length == 1) {
					var actionUrl 	= frm.attr("action");
					frm.attr("action", mDownloadURL);
					frm.submit();
					frm.attr("action", actionUrl);
				}
			}
		}

	} catch (e) {
		openDialogAlert(e, 400, 150);
	}
}


function ajaxexceldown_spout(url, queryString){
	var params = {};
	params['snsrute'] = [];
	jQuery.each(queryString, function(i, field){
		if(field.name != "member_chk[]" && field.name != "snsrute[]"){ //회원 중복 선택 방지 kmj
			params[field.name] = field.value;
		}

		if(field.name == "snsrute[]"){ //회원 중복 선택 방지 kmj
			params['snsrute'].push(field.value);
		}
	});

	//회원 선택 다운로드 추가 kmj
	if(params['excel_type'] == "select"){
		params['member_chk'] = [];
		$('input[name="member_chk[]"]:checked').each(function() {
			params['member_chk'].push(this.value);
		});

		params['searchcount'] = params['member_chk'].length;
	}

	$.ajax({	  
		type: "POST",  
		url: url,	  
		data: params, 
		success:function(args){ 
			loadingStop();
			var exe = args.split('.').pop();
			if(exe == "csv" || exe == "zip" || exe == "xlsx"){
				window.location.href = '/admin/excel_spout/file_download?url=' + args;
				parent.closeDialog('admin_member_download');
			} else {
				alert(args);
			}
		}, error:function(e){  
			alert(e.responseText);  
		}  
	});
}

function batchWithdrawal() {
	var cnt = $("#memberForm input:checkbox[name='member_chk[]']:checked").length;
	if(cnt<1){
		alert("탈퇴시킬 회원을 선택해 주세요.");
		return;
	}else{
		if(!confirm("선택한 회원을 탈퇴시키겠습니까? ")) return;
		$("#memberForm").attr("action","../member_process/withdrawal_set");
		$("#memberForm").attr("target","actionFrame");
		$("#memberForm").submit();
	}
}

function batchFormOpen(mode) {
	var screenWidth = 1200;
	var screenHeight = 900;
	var url = '../batch/sms_form';

	if(mode == 'emoney') {
		url = '../batch/emoney_form';
	} else if ( mode == 'point') {
		url = '../batch/point_form';
	} else if ( mode == 'email') {
		url = '../batch/email_form';
		screenHeight = $( window ).height();	
	}else{
		//screenHeight = 750;
	}

	window.open(url,"batchForm","menubar=no, toolbar=no, location=yes, status=no, resizable=yes, scrollbars=yes,width=" + screenWidth + ", height=" + screenHeight);

}

// CHECKBOX COUNT - IFRAME CONTROLLER
function chkMemberCount(){
	var cnt = $("input:checkbox[name='member_chk[]']:checked").length;
	$("#container").contents().find("#selected_member").html(cnt);
	$("#selected_member").html(cnt);
	$("input[name='member']:[value='select']").attr('count',cnt);
	sendMemberSum();
}

function searchMemberCount(){
	var cnt = $("input[name='searchcount']").val();
	$("#container").contents().find("#search_member").html(cnt);
	$("#search_member").html(cnt);
	$("input[name='member']:[value='search']").attr('count',cnt);
	sendMemberSum();
}

function chkAll(chk, name){
	var frmId = $(chk).parents("form").attr("id");
	if(chk.checked){
		$("#"+frmId+" ."+name).attr("checked",true).change();
	}else{
		$("#"+frmId+" ."+name).attr("checked",false).change();
	}
	if(amail == 'Y') {
		// CHECKBOX COUNT
		parent.chkMemberCount();
	}

}


function select_email(seq, email){
	if(!seq) return;

	$.get('email_pop?member_seq='+seq, function(data) {
		$('#sendPopup').html(data);
		$("#email_addr").html(email)
		openDialog("이메일 발송", "sendPopup", {"width":"1000","height":"800"});
	});
}

function select_sms(seq){
	if(!seq) return;

	$.get('sms_pop?member_seq='+seq, function(data) {
		$('#sendPopup').html(data);
		openDialog("SMS 발송", "sendPopup", {"width":"700"});
	});
}

function emoney_pop(seq){
	if(!seq) return;
	$.get('emoney_detail?member_seq='+seq, function(data) {
		$('#emoneyPopup').html(data);
		openDialog("마일리지 내역/지급 <span class='desc'>해당 회원의 마일리지 내역 및 수동 지급/차감을 하실 수 있습니다.</span>", "emoneyPopup", {"width":"800","height":"700"});
	});
}

function point_pop(seq){
	if(!seq) return;
	$.get('point_detail?member_seq='+seq, function(data) {
		$('#emoneyPopup').html(data);
		openDialog("포인트 내역/지급 <span class='desc'>해당 회원의 포인트 내역 및 수동 지급/차감을 하실 수 있습니다.</span>", "emoneyPopup", {"width":"800","height":"700"});
	});
}

function cash_pop(seq){
	if(!seq) return;
	$.get('cash_detail?member_seq='+seq, function(data) {
		$('#emoneyPopup').html(data);
		openDialog("예치금 내역/지급 <span class='desc'>해당 회원의 예치금 내역.</span>", "emoneyPopup", {"width":"800","height":"700"});
	});
}

function point_not_use(){
	alert("현재 포인트 \'사용안함\' 상태입니다. \n \'사용함\'으로 상태 변경 후 다시 시도하시기 바랍니다.");
}

function chgAnniversaryOption(type, standard, target){
	if	(type == 's'){
		if	($("select[name='anniversary_sdate[]']").eq(standard).val()){
			if	(!$("select[name='anniversary_sdate[]']").eq(target).val())
				$("select[name='anniversary_sdate[]']").eq(target).val('01');
		}else{
			if	($("select[name='anniversary_sdate[]']").eq(target).val())
				$("select[name='anniversary_sdate[]']").eq(target).val('');
		}
	}else{
		if	($("select[name='anniversary_edate[]']").eq(standard).val()){
			if	(!$("select[name='anniversary_edate[]']").eq(target).val())
				$("select[name='anniversary_edate[]']").eq(target).val('01');
		}else{
			if	($("select[name='anniversary_edate[]']").eq(target).val())
				$("select[name='anniversary_edate[]']").eq(target).val('');
		}
	}
}

function auth_check(mode) {
	var auth = true;
	var auth_arr = memberList.options.auth_arr;
	var auth_mode = 'auth_act';

	

	if ( mode == 'point' || mode == 'emoney') {
		auth_mode = 'auth_promotion';
	} else if ( mode == 'email' || mode == 'sms') {
		auth_mode = 'auth_send';
	} else if ( mode == 'excel') {
		auth_mode = 'auth_member_down';
	}

	if(!auth_arr[auth_mode]) {
		alert("권한이 없습니다.");
		auth = false;
	}
	return auth;
}

function safeKeyCheck(){
	var safe_key = $("input[name='member_download_passwd']").val();
	$.ajax({
		type: "post",
		url: "/admin/member_process/safe_key_check",
		data: "safe_key="+safe_key,
		dataType: "json",
		success: function(result){
			if(result.code == "200"){
				excelDownloadOk();
				//excelMemberDownloadOk();
				$("input[name='member_download_passwd']").val('');
				if(parseInt($("input[name='mcount']").val()) > 2000){
					setTimeout(function(){
						loadingStart();
					},50);
				}
			}else{
				openDialogAlert('보안키가 맞지 않습니다', 400, 150);
			}
		}
	});		
}

// SMS "-" CLICK
function sendToDel()
{		
	$(".sendToDelBtn").click(function(){		
		$(this).closest('div').remove();			
		if($('#sendToList .mailItem').length==0) $("#sendToList").hide();
	});
}

function addNum_init(){
	$("input[name='send_num']").val($("#send_member").attr("count"));
	var cellNoList = "";
	$("#sendToList .mailItem").each(function(e, data) {
		cellNoList += ","+String($(this).attr("value"));
	});
	$("input[name='send_to']").val(cellNoList);
}

function ajaxexceldown(url, queryString){
	var inputs = "";
	 jQuery.each(queryString, function(i, field){
		 inputs +='<input type="hidden" name="'+field.name+'" value="'+ field.value +'" />';
	 });
	jQuery('<form action="'+ url +'" method="post" target="actionFrame" >'+inputs+'</form>')
	.appendTo('body').submit().remove();
}