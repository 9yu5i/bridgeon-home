function cmtboardcheckform(modetype, seq, cmtseq, cmtreplyseq, pw, board_id, cmtreplyidx, returnurl) {
	var outArr		= new Array();
	var outNum		= 0;
	var FormObj		= $("form[name='BoardPwcheckFormNew']");
	var ParamObj	= {'mode':'board_hidden_reply_cmt_pwcheck', 'seq':seq, 'cmtseq':cmtseq, 'cmtreplyseq':cmtreplyseq, 'pw':pw, 'cmtreplyidx':cmtreplyidx, 'board_id':board_id,  'view':'comment_modify'};
	
	if( modetype == 'reply_modify' ) {//답글수정
		ParamObj	= {'mode':'board_hidden_reply_cmt_pwcheck', 'seq':seq, 'cmtseq':cmtseq, 'cmtreplyseq':cmtreplyseq, 'pw':pw, 'cmtreplyidx':cmtreplyidx, 'board_id':board_id,  'view':'comment_modify'};
	}else if( modetype == 'reply_view' ) {//보기
		ParamObj	= {'mode':'board_hidden_reply_cmt_pwcheck', 'seq':seq, 'cmtseq':cmtseq, 'cmtreplyseq':cmtreplyseq,  'pw':pw, 'board_id':board_id,  'view':'comment_view'};
	}else if( modetype == 'reply_delete' ){//답글삭제시		
		ParamObj	= {'mode':'board_comment_reply_delete_pwcheck', 'cmtreplyseq':cmtreplyseq, 'delcmtseq':cmtseq, 'seq':seq,  'pw':pw, 'board_id':board_id, 'returnurl':returnurl, 'view':'comment_delete'};
	}else if( modetype == 'delete' ){//댓글삭제시		
		ParamObj	= {'mode':'board_comment_delete_pwcheck', 'delcmtseq':cmtseq, 'seq':seq,  'pw':pw, 'board_id':board_id, 'returnurl':returnurl, 'view':'comment_delete'};
	}else if( modetype == 'modify' ){//댓글수정시		
		ParamObj	= {'mode':'board_hidden_cmt_pwcheck', 'seq':seq,  'cmtseq':cmtseq, 'pw':pw, 'board_id':board_id, 'view':'comment_modify'};
	}else if( modetype == 'view' ){//보기		
		ParamObj	= {'mode':'board_hidden_cmt_pwcheck', 'seq':seq,  'cmtseq':cmtseq, 'pw':pw, 'board_id':board_id, 'view':'comment_view'};
	}
	
	$.ajax({
		'url'		: '../common/ssl_action',
		'data'		: {'action':'../board_comment_process', 'boardid':board_id},
		'type'		: 'get',
		'dataType'	: 'html',
		'success'	: function(res) {
			for (var ParamKey in ParamObj) {
				if (ParamObj.hasOwnProperty(ParamKey)) {
					if( typeof(FormObj.find("input[name='"+ParamKey+"']").val()) == 'undefined' ){
						FormObj.append("<input type='hidden' name='"+ParamKey+"' value='"+ParamObj[ParamKey]+"'>");
						outNum			= outArr.length;
						outArr[outNum]	= ParamKey;
					}
				}
			}
			if($("[name=boardactionFrame]").length > 0) {
				FormObj.attr('target', 'boardactionFrame');
			} else {
				FormObj.attr('target', 'actionFrame');
			}
			FormObj.attr('action', res);
			console.log(FormObj);
			FormObj[0].submit();	
			for(var i=0;i < outArr.length;i++){
				ParamKey	= outArr[i];
				if( ParamKey )	FormObj.find("input[name='"+ParamKey+"']").remove();
			}
			FormObj.attr('target', '');
			FormObj.attr('action', '');
		}
	});
}

function dialogClose(id)
{
	$('#'+id).dialog('close');
}

function setReplyView(id, content)
{
	$(id).text(content);
	$(id).removeClass("gray");
}