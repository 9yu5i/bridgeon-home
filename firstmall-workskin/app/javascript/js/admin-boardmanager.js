$(function () {
	
	$("input[name='auth_write[]'],input[name='auth_reply[]'],input[name='auth_cmt[]'],input[name='auth_write_cmt[]']").on('click', function () {
		check_write_auth();
	});
	check_write_auth();
});

/**
 * 신고 차단 : 쓰기 권한이 모두 관리자일때만 hide
 */
function check_write_auth() {
	$(".write_auth_admin").hide();
	$("input[name='auth_write[]']:checked,input[name='auth_reply[]']:checked,input[name='auth_cmt[]']:checked,input[name='auth_write_cmt[]']:checked").each(function () {
		if ($(this).val() != 'admin') {
			$(".write_auth_admin").show();
			return;
		}
	});
}