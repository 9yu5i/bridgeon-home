/*
SNS 연동 설정 javascript
@2022.05.03
*/
$(function(){

	// 인스타그램 연동 설정
	$(".instagramconflay, #instagramFeedUpdate").on("click", function() {
		var mode = $(this).attr('mode');
		$.ajax({
			'url' : '/admin/setting_process/instagram',
			'type' : 'get',
			'dataType': 'json',
			'success': function(res) {
				if (res.success){
					var data = res.data;
					var uri = data.uri + encodeURIComponent(data.code) + '?domain=' + encodeURIComponent(data.site);

					window.open(uri, "_INSTAGRAM", "width=650,height=900");
					window.addEventListener('message', function(e) {
						if(e.data.msg.types == 'instargram') {
							instagramConnect(e.data.msg, mode);
						} else if(typeof e.data.error !== 'undefined') {
							alert('연동 신청이 실패되었습니다.');
						}
					});
				}
			}
		})
	})

	// 인스타그램 연동 해제
	$(".instagramdisconnectlay").on("click", function() {
		openDialog('연동 해제 확인', "instagramdisconnectlay", {"width":"380"});
	})

	// 인스타그램 노출 설정
	$(".instagramfeedconflay").on("click", function() {
		openDialog("인스타그램 노출설정", "instagramFeedConf_popup", {"width":"550","show" : "fade","hide" : "fade"});
	})

	// 인스타그램 노출 개수 변경 동작
	$("#instagramFeedConf_popup input[name='feed_cell'],input[name='feed_row']").on('change',function(){
		var count_c = num($("input[name='feed_cell']").val());
		var count_r = num($("input[name='feed_row']").val());

		$(".count_total").html(count_c*count_r);
	});
});

// 인스타그램 연동 계정 정보 전달
function instagramConnect(data, mode) {
	$.ajax({
		'url' : '/admin/setting_process/instagramConnect',
		'type' : 'post',
		'data': data,
		'async' : false,
		'success': function(res) {
			if(mode == 'new') {
				var msg = '인스타그램 연동이 완료되었습니다.';
			} else {
				var msg = '수동 업데이트가 완료되었습니다.';
			}

			openDialogAlert("<span class='fx12'>"+ msg +"</span>",400,150,function(){
				parent.document.location.reload();
			})
		}
	})
}

// 인스타그램 피드 노출 설정 전달
function instagramFeedConfSave() {
	$("form[name='instagramFeedConfForm']").submit();
}

// 인스타그램 연동 해제 요청
function instagramDisconnect() {
	$.ajax({
		'url' : '/admin/setting_process/instagramDisconnect',
		'type' : 'get',
		'async' : false,
		'success': function(res) {
			openDialogAlert("<span class='fx12'>계정 연동이 해제되었습니다.</span>",400,150,function(){
				parent.document.location.reload();
			})
		}
	})
}