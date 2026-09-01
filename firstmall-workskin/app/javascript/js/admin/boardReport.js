var boardReportList = (function () {
	var _open_detail = function(seq){
		var data = { 'seq': seq };
		$.get('/admin/board/report_detail', data, function (response) {
			if (response.result) {
				$("#reportPopup").html(response.html);
				openDialog("신고 내용 보기", "reportPopup", {"width":850,"height":650,"show":"fade","hide":"fade"});
			} else {
				alert('잘못된 접근입니다.');
			}
		}, 'json');
		
	}
	return {
		open_detail: _open_detail
	}
})();

var boardReportDetail = (function () {
	var _do_ignore = function (seq) {
		var check = confirm('신고 게시글 내역에서만 삭제하고\r\n원본 게시글/댓글은 유지 됩니다.');
		if (!check) return;
		$.ajax({
			'url' : '/admin/board_process/report_delete',
			'data' : {'seq':seq},
			'type': 'post',
			'dataType' : 'json',
			'success': function (res) {
				loadingStop("body",true);
				if (res.result) {
					openDialogAlert('신고 내용 삭제되었습니다.', '400', '140', function () { document.location.reload(); });
				} else {
					alert(res.msg);
				}
			}
		});
	}
	var _do_board_delete = function (board_id, delseq) {
		openDialogConfirm('삭제된 게시글을 복구할 수 없습니다.\r\n정말로 삭제하시겠습니까?',400,150,function(){
			loadingStart("body",{segments: 12, width: 15.5, space: 6, length: 13, color: '#000000', speed: 1.5}); 
			$.ajax({
				'url': '../board_process',
				'data': { 'mode': 'report_delete', 'delseq': delseq, 'board_id': board_id },
				'type': 'post',
				'dataType' : 'json',
				'success': function (res) {
					loadingStop("body", true);
					if (res.result == false) {
						openDialogAlert(res.msg, '400', '140');
						return;
					}
					msg = '정상적으로 삭제되었습니다.';
					openDialogAlert(msg, '400', '140', function () { document.location.reload(); });
				}
			});
		});
	}
	var _do_comment_delete = function (board_id, cmtseq, boardseq) {
		openDialogConfirm('삭제된 댓글을 복구할 수 없습니다.\r\n정말로 삭제하시겠습니까?', 400, 150, function () {
			$.ajax({
				'url' : '../board_comment_process',
				'data' : {'mode':'report_comment_delete', 'delcmtseq':cmtseq, 'seq':boardseq, 'board_id':board_id},
				'type' : 'post',
				'dataType': 'json',
				'success' : function(res){
					if(res) {
						if(res.result == true){
							openDialogAlert(res.msg,'400','140',function(){document.location.reload();});
						}else{
							openDialogAlert(res.msg,'400','140',function(){});
						}
					}else{
						openDialogAlert("잘못된 접근입니다.",'400','140',function(){});
					}
				}
			});
		});
	}
	return {
		do_ignore: _do_ignore,		// 신고글 무시하기
		do_board_delete : _do_board_delete,	// 게시글 삭제
		do_comment_delete : _do_comment_delete,		// 댓글 삭제
	}
})();