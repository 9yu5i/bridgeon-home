$(document).ready(function() {
	$("#delete_btn").click(function(){
		var cnt = $("input:checkbox[name='manager_seq[]']:checked").length;
		if(cnt<1){
			alert("삭제할 관리자를 선택해 주세요."); 
			return;
		}else{
			var queryString = $("#settingForm").serialize();
			if(!confirm("선택한 관리자를 삭제 시키겠습니까? ")) return;
			$.ajax({
				type: "get",
				url: "../setting_process/manager_delete",
				data: queryString,
				success: function(result){			
					//alert(result);
					location.reload();
				}
			});
		}
	});

	$('#manager_charge').live('click', function (){
		$.get('manager_payment', function(data) {		
			$('#managerPaymentPopup').html(data);		
			openDialog("관리자 계정 추가 신청", "managerPaymentPopup", {"width":"800","height":"650"});
		});
	});

	$("input[name='auto_logout']").click(function(){
		init_auto_logout();
	});

	init_auto_logout();

});

function init_auto_logout(){
	if($("input[name='auto_logout']").attr("checked")){
		$(".auto_logout_select").attr("disabled",false);
	}else{
		$(".auto_logout_select").attr("disabled",true);
	}
}

function chkAll(chk, name){
	if(chk.checked){
		$(".manager_seq").attr("checked",true);
		$("input[name='manager_seq[]'][manager_yn='Y']").attr('checked',false);
	}else{
		$(".manager_seq").attr("checked",false);
	}
}

function manager_reg(bReg){
	if( bReg ){
		location.href='manager_reg';
	}else{
		openDialog("관리자 계정 이용 안내", "info", {"width":"600"});
		return;
	}
}


function auto_logout(){
	openDialog("자동로그아웃 설정", "autoLogoutPopup", {"width":"600"});
}

function chatbotSetting(){
	openDialog("챗봇상담 설정", "chatbotSetting", {"width":"600"});
}

function manager_log(){
	location.href='manager_log';
}
