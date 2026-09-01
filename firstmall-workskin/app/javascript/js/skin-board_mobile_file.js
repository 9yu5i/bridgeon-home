$(function(){
	$('.btnUploader').click(function(){
		var select_value = $(".select_img" ).val();
		$('input[name=insert_image]').val(select_value);

		var board_id = $("#board_id").val();

		window.open('/common/responsive_file_upload?board_id=' + board_id + "&insert_image=" + select_value,'','width=600,height=720,toolbar=no,titlebar=no,scrollbars=yes,resizeable');		
	});
	configSelectValue();
	$(".select_img").change(configSelectValue);
});

function configSelectValue() {
	var select_value = $(".select_img" ).val();
	$('input[name=insert_image]').val(select_value);	
}

//////////////////////////////////////////////////////////////////////
// 제거 시 호출 됨
// 실제 제거는 서버에서...
function removeDiv(obj, no) {
	obj = $(obj);
	var oTr	= obj.closest('tr');
	var sRemoveiImg = '';
	if( $("input[name='remove_img']").length == 0 ){
		$("input[name='remove_no']").parent().append("<input type='hidden' name='remove_img'>");
	}
	var oRemoveiImg = $("input[name='remove_img']");
	if( !oRemoveiImg.val() ){
		sRemoveiImg = oTr.find(".realfilelist").html();
	}else{
		sRemoveiImg = oRemoveiImg.val() + ',' + oTr.find(".realfilelist").html();
	}
	oRemoveiImg.val(sRemoveiImg);
	oTr.remove();
}
//////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////
// 파일 업로드 완료 후 호출 됨.
var is_attachimage	= false;
var file_cnt		= 0;
function addAttachImage(realfilename, incimage)
{
	$("#img_viewer").show();
	var viewer = "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\ id=\"l_table\" class=\"boardfileliststyle\" >"
	
	for( var i = 0; i < realfilename.length; i++) {
		var newImg	= realfilename[i].split("^^")[0];
 	
 		viewer += "<tr>";	
		viewer += "<td class=\"pdt10\" align=\"left\">";
		viewer += "<span class=\"realfilelist move highlight-link\"><img src='/data/board/" + board_id + "/" +  newImg + "' at='"+ newImg + "'/></span></td>";
		viewer += "<td class=\"pdt10\" align=\"right\"><button onclick=\"removeDiv(this, " + i + ")\" id=\"btnRemove\" type=\"button\" class=\"btn_graybox eaMinus  etcDel hand\">-</button></td>";
		
		viewer += "</tr>";
		
	}	
	viewer += "</table>";

	file_cnt = file_cnt + realfilename.length;
	$("#img_viewer").append(viewer);

	var newfilename = realfilename;
	if(modifyfile.length > 0 ) {
		for( var i = 0; i < modifyfile.length; i++ ) {
			newfilename += "," + modifyfile[i];
		}
	}

	changefile(newfilename, incimage);
	
	is_attachimage = true;
}

function changefile(newfilename, incimage) {
	$_realfile = $('input[name="realfilename"]');
	$_incimage = $('input[name="incimage"]');
	$_delimeter1 = $_realfile.val() != '' ? ',' : '';
	$_delimeter2 = $_realfile.val() != '' ? ',' : '';
	
	$_realfile.val($_realfile.val() + $_delimeter1 + newfilename);
	$_incimage.val($_incimage.val() + $_delimeter2 + incimage);

}
///////////////////////////////////////////////////////////////////////


// 래퍼 페이지에서 호출함..
function checkAttachImage() {
	if( is_attachimage ) {
		is_attachimage = false;
		return;	
	} 	
	// 이미지 삽입 위치 추가..
	configSelectValue();

}

///////////////////////////////////////////////////////////////////////////
// 수정 모드에서 첨부파일 재 구성..
var modifyfile = [];
function modifyAttachImage(realfilename) {	
	
	modifyfile.push(realfilename);	
}

//-->
