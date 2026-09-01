
if(typeof registAct==="undefined"){
	//회원가입버튼 클릭시 버튼 숨기기
	var registAct = function(){
		parent.document.getElementById('btn_register').style.display='none';
	}
}


$(document).ready(function() { 
	// 인풋 항목 포커스 UI
	$('#o2oJoinForm .o2o_join_form .input_text').focus(function() {
		$(this).addClass('active');
	});
	$('#o2oJoinForm .o2o_join_form .input_text').blur(function() {
		if ( $(this).val() ) {
			$(this).addClass('complete');
		} else {
			$(this).removeClass('active complete');
		}
	});
	// 수정인 경우
	$('#o2oJoinForm .o2o_join_form .input_text').each(function() {
		if ( $(this).val() ) {
			$(this).addClass('active complete');
		}
	});

	// 약관 동의 UI
	$('#o2oAllAgree input[type=checkbox]').change(function() {
		if ( $(this).prop('checked') ) {
			$('#o2oAllAgree').addClass('on');
			$('#o2oAgreeList input[type=checkbox]').attr('checked', 'checked');
			$('#o2oAgreeList label').addClass('on');
		} else {
			$('#o2oAllAgree').removeClass('on');
			$('#o2oAgreeList input[type=checkbox]').removeAttr('checked');
			$('#o2oAgreeList label').removeClass('on');
		}
	});
	$('#o2oAgreeList input[type=checkbox]').change(function() {
		if ( $(this).prop('checked') ) {
			$(this).parent('label').addClass('on');
		} else {
			$(this).parent('label').removeClass('on');
		}
	});
	
	// 본문 컨텐츠 상하 정렬
	var registFrm = $("#registFrm");
	vCenterAlign(registFrm);
});

// 본문 컨텐츠 상하 정렬
function vCenterAlign(target){
	var body = document.body;
	var html = document.documentElement;
	var docHeight = Math.max( body.scrollHeight, body.offsetHeight, 
                       html.clientHeight, html.scrollHeight, html.offsetHeight );
    var height = target.height(); 
   target.css({paddingTop: ((docHeight/2)-(height/2)) + 'px'}) 
}