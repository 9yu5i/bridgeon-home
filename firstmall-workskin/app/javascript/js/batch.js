var serialize;
var searchCount = 0;

$(document).ready(function() {

	$("#searchMemberBtn").click(function(){
		var callpage = $(this).attr("callpage");
		var wheres = $("input[name='wheres']").val();
		$("input[name='mode']").val("search");
		openDialog("회원 검색 <span class='desc'>&nbsp;</span>", "memberSearchDiv", {"width":"1200","height":"850"});
		// 회원 검색 폼
		getSearchMember(wheres, 'start', callpage);
	});

	$("body").append('<div id="memberSearchDiv" class="hide"></div>');
});

/* 회원 검색 이벤트 */
function searchSubmit(){
	$("#batchMemberForm").find("input[name='searchflag']").remove();
	$("#batchMemberForm").append("<input type='hidden' name='searchflag' value='1'/>");
	var serialize = $("#batchMemberForm").serialize();
	// 회원 검색 폼
	getSearchMember(serialize, '');
}

/* 회원 검색 폼 회원 리스트 페이징 */
function searchPaging(query_string){
	var serialize = $("#batchMemberForm").serialize() + query_string;
	// 회원 검색 폼
	getSearchMember(serialize, '');
}

/* 회원 검색 폼 */
function getSearchMember(query_string, callType, callPage){
	if(callPage == "" || typeof callPage == "undefined") callPage = $("#callPage").val();

	if(callType == "start" && (callPage == "batch_sms" || callPage == "sms" || callPage == "batch_sms" ||callPage == "emoney" || callPage == "batch_email" || callPage == "email")){
		query_string = "callPage="+callPage;
	} else {
		query_string = query_string + "&callPage="+callPage;
	}

	$.ajax({
		type: "get",
		url: "/admin/batch/member_catalog",
		data: query_string,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8", 
		success: function(result){
			$("#memberSearchDiv").html(result);
			apply_input_style();
			serialize = decodeURIComponent($("#batchMemberForm").serialize());
			searchCount = $("#batchMemberForm input[name='searchcount']").val();

			var selectMember = $("input[name='selectMember']").val();
			var selectMemberArray = new Array();
			selectMemberArray = selectMember.split(',');

			$('.member_chk').each(function(){
				for(i=0; i<selectMemberArray.length; i++){
					if($(this).val() == selectMemberArray[i]){
						$(this).attr("checked", true);
					}
				}
			});
			var scObj = $("#scObj").val();
			var fix_field = '';
			if(callPage == 'status') {
				fix_field = 'sc_status';
			} else if(callPage == 'sms' || callPage == 'batch_sms'){
				fix_field = 'sc_sms';
			} else if(callPage == 'email'){
				fix_field = 'sc_mailing';
			}
			gSearchForm.init({'pageid':'member_catalog','divSelectLayId':'batch_search_container','formEditorUseFix':true,'searchFormEditView':true,'sc': scObj,'fix_field':fix_field}, function() {
				searchSubmit();
			});
			//일괄 수정 선택
			//setContentsRadio("batch_mode", "member_status");
			addSelectDateEvent();

			if(callPage == 'status') {
				$("select[name='perpage']").on("change", function(){
					$("#batchMemberForm").find("input[name='searchflag']").remove();
					$("#batchMemberForm").append("<input type='hidden' name='searchflag' value='1'/>");				
					searchSubmit();
				});
				$("#batchMemberForm input[name='status']:[value='hold']").prop('checked',true);
			} else if(callPage == 'sms' || callPage == 'batch_sms'){
				$("#batchMemberForm input[name='sms']:[value='y']").prop('checked',true);
			} else if(callPage == 'email'){
				$("#batchMemberForm input[name='mailing']:[value='y']").prop('checked',true);
			} else if(callPage == 'grade') {
				$("select[name='perpage']").on("change", function(){
					$("#batchMemberForm").find("input[name='searchflag']").remove();
					$("#batchMemberForm").append("<input type='hidden' name='searchflag' value='1'/>");				
					searchSubmit();
				});				
			}
		}
	});

}

/* 전체 검색 넣기 */
function serchMemberInput(call){
	var searchCount = parseInt($("#batchMemberForm input[name='searchcount']").val());
	var dormancy_count = parseInt($("input[name='dormancy_count']").val());
	
	if ($("input[name='keyword']").val()==$("input[name='keyword']").attr('title')) {
		$("input[name='keyword']").val('');
	}
	serialize = decodeURIComponent($("#batchMemberForm").serialize());

	var form = "";
	if(call == "status" || call == "grade"){
		form = "#gradeForm ";
	}

	if(call == "grade"){

		var member_grade_seq	= $("#batchMemberForm select[name='grade'] option:selected").val();
		var member_grade_name	= $("#batchMemberForm select[name='grade'] option:selected").text();
		var member_old_grade	= $(form + "input[name='member_old_grade']").val();
		var same_grade			= true;

		$('#batchMemberForm .member_chk').each(function(){
			// 20210531(kjw) : grade 가 undefined 조건추가
			// grade == undefined 인 경우는 휴면회원인 경우이므로 등급 검색 후 다시 시도라는 alert 창과는 무관하고 휴먼회원은 배제된 상태로 등록 후 처리
			if(member_grade_seq != '' && (member_grade_seq != $(this).attr("grade") &&  $(this).attr("grade") != undefined)){
				same_grade = false;
			}
		});

		if(member_grade_seq == '' || same_grade == false){
			alert("등급 검색 후 다시 시도해 주시기 바랍니다.");
			$("#batchMemberForm select[name='grade']").focus();
			return;
		}else{
			$(form + "input[name='member_old_grade']").val(member_grade_seq);
			$(form + "input[name='member_old_grade_name']").val(member_grade_name);
		}
	}

	$("#searchSelectText").html("검색된");
	$("#serialize").val(serialize);

	$("#search_member").html(comma(searchCount-dormancy_count));
	$(form + "input[name='mcount']").val(searchCount-dormancy_count);
	$(form + "input[name='selectMember']").val('');
	$(form + "input[name='searchSelect']").val('search');
	
	var reciveTitle = "받는 사람";
	if(call == "emoney" || call == "status" || call == "grade") reciveTitle = "대상자";
	$('.member_chk').attr("checked", false);
	$('.all_member_chk').attr("checked", false);
	
	openDialogAlert('<span class=fx12>[받는사람-검색회원] 검색된 회원 '+comma(searchCount-dormancy_count)+'명이 '+reciveTitle+'에 들어 갔습니다. (휴면 회원 제외)</span>', 600, 150);
	closeDialog("memberSearchDiv");		
}

/* 검색 회원 정보 엑셀 다운로드  */
function serchMemberInputDown(){
	$(".email_download_hide").hide();
	var searchCount = parseInt($("#batchMemberForm input[name='searchcount']").val());
	if ($("input[name='keyword']").val()==$("input[name='keyword']").attr('title')) {
		$("input[name='keyword']").val('');
	}
	serialize = decodeURIComponent($("#batchMemberForm").serialize());
	$("#serialize").val(serialize);
	$("#search_member").html(comma(searchCount));
	$("input[name='mcount']").val(searchCount);
	$("input[name='selectMember']").val('');
	$("input[name='searchSelect']").val('search');
	closeDialog("memberSearchDiv");		
	openDialog('회원정보 다운로드','admin_member_download', {'width':550});
}

/* 선택 회원 정보 엑셀 다운로드  */
function selectMemberInputDown(){
	$(".email_download_hide").hide();
	var selectMember = $("input[name='selectMember']").val();
	var selectMemberArray = new Array();
	selectMemberArray = selectMember.split(',');
	
	if(selectMember == ""){
		alert("선택된 회원이 없습니다.");
		return;
	}

	$("#search_member").html(comma(selectMemberArray.length));
	$("#searchSelectText").html("선택된");
	
	$("input[name='mcount']").val(selectMemberArray.length);
	$("input[name='searchSelect']").val('select');

	closeDialog("memberSearchDiv");		
	openDialog('회원정보 다운로드','admin_member_download', {'width':550});
}

/* 회원 선택 이벤트 */
function selectMemberClick(obj){
	var selectMember = $("input[name='selectMember']").val();
	var selectMemberArray = new Array();
	if(selectMember != ""){
		selectMemberArray = selectMember.split(',');
	}	

	if($(obj).is(":checked")){
		
		var inBoolen = true;
		for(i=0; i<selectMemberArray.length; i++){
			if(selectMemberArray[i] == $(obj).val()){
				inBoolen = false;
			}
		}

		if(inBoolen){
			if(selectMemberArray.length){
				selectMember += ","+$(obj).val();
			}else{
				selectMember = $(obj).val();
			}
		}
		
		
	}else{
		var newSelectMember="";
		for(i=0; i<selectMemberArray.length; i++){
			if(selectMemberArray[i] != $(obj).val()){
				if(newSelectMember == "") newSelectMember = selectMemberArray[i];
				else newSelectMember += ","+selectMemberArray[i];
			}
		}
		selectMember = newSelectMember;
	}

	$("input[name='selectMember']").val(selectMember);
}

/* 회원 선택 추가 */
function selectMemberInput(call){

	var form = "";
	if(call == "status" || call == "grade"){ form = "#gradeForm "; }

	var selectError			= false;
	var selectMember		= $(form + "input[name='selectMember']").val();
	var selectMemberArray = new Array();
	var same_grade			= true;

	selectMemberArray = selectMember.split(',');
	
	if(selectMember == ""){
		alert("선택된 회원이 없습니다.");
		return;
	}

	/*등급변경시 같은 등급회원만 선택 가능*/
	if(call == "grade"){
		var list_grade_seq	= '';
		$('#batchMemberForm .member_chk').each(function(){

			if($(this).is(":checked") == true){

				if(list_grade_seq != '' && list_grade_seq != $(this).attr("grade")){ same_grade = false; }

				list_grade_seq	= $(this).attr("grade");
				list_grade_name = $(this).attr("grade_name");

			}
		});

		var member_grade_seq	= $(form + "input[name='member_old_grade']");
		var member_grade_name	= $(form + "input[name='member_old_grade_name']");

		if(same_grade == true){
			if(member_grade_seq.val() == ""){
				member_grade_seq.val(list_grade_seq);
				member_grade_name.val(list_grade_name);
			}else if(member_grade_seq.val() != "" && member_grade_seq.val() != list_grade_seq){
				same_grade = false;
			}
		}

		if(same_grade == false){
			$('#batchMemberForm .member_chk').each(function(){
				if(member_grade_seq.val() != $(this).attr("grade")){
					$(this).closest("tr").removeClass("checked-tr-background");
					$(this).attr("checked", false);
				}
				selectMemberClick($(this)); 
			});
			alert("같은 회원등급만 선택 가능합니다.");
		}

	}

	if(same_grade == true){
		$("#search_member").html(comma(selectMemberArray.length));
		$("#searchSelectText").html("선택된");
		
		$("input[name='mcount']").val(selectMemberArray.length);
		$("input[name='searchSelect']").val('select');

		var reciveTitle = "받는 사람";
		var params = new Array();
		params['yesMsg'] = "발송화면으로 가기";

		if(call == "emoney"){
			reciveTitle = "대상자";
			params['yesMsg'] = "지급화면으로 가기";		
		}else if(call == "status" || call == "grade"){
			reciveTitle			= "대상자";
			params['yesMsg']	= "일괄변경화면으로 가기";		
		}
		
		params['noMsg'] = "계속 선택하기";

		openDialogConfirm('<span class=fx12>[받는사람-선택회원] 선택된 회원 '+comma(selectMemberArray.length)+'명이 '+reciveTitle+'에 들어 갔습니다. (중복된 회원 제외)</span>',600, 150,function(){
			closeDialog("memberSearchDiv");
		},function(){
			
		}, params);
	}
}

/* 전체 회원 일괄 체크 */
function allMemberClick(){
	$('#batchMemberForm .member_chk').each(function(){
		selectMemberClick($(this));
	});
}

/* 메일 수동 발송 */
function sendEmail(mail_count) {
	var total_count = 0;
	var x="";
	var str = $("input[name='send_to']").val().replace("메일 주소는 ,(콤마)로 구분하여 입력하세요","");
	if(str != ""){
		x = str.split(',');
	}
	total_count = x.length;


	
	if($("select[name='search_member_yn']").val() == 'y'){
		total_count += parseInt($("input[name='mcount']").val());
		if($("input[name='mcount']").val() == 0){
			$("input[name='search_member_yn']").attr("checked",false);
		}
	}
	

	if(total_count == 0){
		openDialogAlert('받는 사람이 없습니다.', 400, 150);

		return;		
	}

	if(total_count > mail_count){
		openDialogAlert('잔여 건수가 부족합니다. 받는 사람을 엑셀로 다운로드 받아 대량이메일 발송 기능을 이용하여 발송해 주십시오.', 400, 150);
		return;

	}

	if(total_count > 1000){
		openDialogAlert('1,000명 이상은 받는 사람을 엑셀로 다운로드 받아<br> 대량이메일 발송 기능을 이용하여 발송해 주십시오.', 400, 150);
		return;
	}


	if($("input[name='agree_yn']").attr("checked")){

	}else{
		openDialogAlert('‘정보통신망이용 촉진 및 정보보호등에 관한 법률 및 시행령’ 위반에 따른 책임은 귀사에게 있음에 동의하셔야만 발송이 가능합니다.', 600, 150);
		return;

	}

	submitEditorForm(document.emailForm);
}

/* 이메일 불러오기 */
function emailLogList(){
	$.get('../member/email_log_list_pop', function(data) {
		$('#emailLogListPopup').html(data);		
		openDialog("최근 발송한 이메일", "emailLogListPopup", {"width":"800","height":"600"});
	});
}

/* 이메일 구독 취소 검토 */
function check_unsubscribe(){
	var domain = $("input[name='site_url']").val();
	var verify = $("input[name='verify']").val();

	$.ajax({
		type: 'get',
		url: '../../member/unsubscribe',
		data: {"verify":verify, "ussKey":"checkUnsubscribe", "testMode": true},
		dataType: 'json',
		success: function(data, status, request) {
			alert(data);
			$(".copyBtn").show();
			$(".verifyBtn").hide();
			return false;
		},
		error : function(request, status, error) {
			alert("잘못된 URL입니다.");
			$(".copyBtn").hide();
		}
	});
}

/* 언어 별(kor, eng) 구독 취소 링크 복사 */
function copy_unsubscribe(language){

	var domain = $("input[name='site_url']").val();

	$.ajax({
		type: 'post',
		url: '../member_process/getUnsubscribeUrl',
		data: 'language='+language+'&domain='+domain+'&protocol='+dataObj.protocol,
		dataType: 'json',
		success: function(data) {
			loadingStop();
			var IE=(document.all)?true:false;
			if (IE) {
				window.clipboardData.setData('Text',data.url); 
				alert("복사되었습니다.");
			} else {
				const t = document.createElement("textarea");
				document.body.appendChild(t);
				t.value = data.url;
				t.select();
				document.execCommand('copy');
				document.body.removeChild(t);
				temp = prompt("복사되었습니다.", data.url);
			}
			
		}
	});
}

/* 이메일 수동 발송 동의 체크  */
function agree_yn_check(){
	var agree_text 		= "";
	if($("input[name='agree_yn']").is(":checked") == true){
		var date			= new Date();
		var agreeDateTime 	= date.getFullYear() + "/" + ("0" + (1 + date.getMonth())).slice(-2) + "/" + ("0" + date.getDate()).slice(-2) + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();;
		agree_text= "위 내용에 대하여 "+agreeDateTime+"에 "+dataObj.agreeManager+"께서 동의하셨습니다.";
		$("#agree_text").show();
	}else{
		$("#agree_text").hide();
	}
	$("#agree_text").html(agree_text);
}

/* 이메일 대량 발송 페이지 이동 */
function go_amail(){
	opener.location.href = "/admin/member/amail";
	self.close();
}

/* 수신 거부 도메인 링크 변경 이벤트 */
function change_domain(){
	$("input[name='site_url_eng']").val($("input[name='site_url']").val());
	$(".copyBtn").hide();
	$(".verifyBtn").show();
}