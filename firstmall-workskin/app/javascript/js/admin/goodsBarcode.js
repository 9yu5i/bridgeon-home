$(function(){

	if(typeof pageid != 'undefined') {
		var arrSort = {
			'asc_goods_seq': '상품번호↑',
			'desc_goods_seq': '상품번호↓',
			'asc_goods_name': '상품명↑',
			'desc_goods_name': '상품명↓',
			'asc_barcode': '바코드↑',
			'desc_barcode': '바코드↓'
		};
		gSearchForm.init({'pageid':pageid,'displaySort':arrSort, 'sc':scObj});
	}
	changeFileStyle();
	
	// 바코드 검색 폼
	$('input[name="btype"]').on('click',function(){
		$(this).closest('div').find('select').find('option:eq(0)').prop('selected',true);
		$(this).closest('div').find('select').attr('disabled',true);
		$(this).parents('label').next('select').attr('disabled',false);
	});

	/* 바코드 인쇄 */
	$(".barcode_print_btn").on("click",function(){
		var selectCnt = $("input:checkbox[name^='goods_seq[']:checked").length;
		var print_desc = '인쇄';
		var print_title = '바코드 인쇄';

		if($(this).attr('desc') == 'download') {
			print_desc = '다운로드';
			print_title = '엑셀 다운로드';
		}
		$(".print_desc").html(print_desc);
		$("button[name='btn_barcode_print']").attr('desc', $(this).attr('desc'));
		$(".select_count").html(comma(selectCnt));
		openDialog(print_title, "barcode_print_popup", {"width":"650","height":"300","show" : "fade","hide" : "fade"});
	});

	$(".btn_close").on("click",function(){
		var layId = $(this).attr("data-layId");
		if(typeof layId != 'undefined') closeDialog(layId);
	});		

	$("button[name='btn_barcode_print']").on("click", function() {
		var mode = $("input[name='barcode_print']:checked").val();

		if(mode == 'select' && $('.chk:checked').length == 0){
			openDialogAlert('상품을 선택하세요.');
			return false;
		}		
		
		if($(this).attr('desc') == 'download') {
			download_barcode(mode);
		} else {
			print_barcode(mode);
		}
	});

	//바코드 일괄 등록
	$("button[name='barcode_write_btn']").on("click",function(){
		var originAction = $("#barcodeFrm").attr('action');
		$("#barcodeFrm").attr('action', '/admin/barcode/barcode_write');
		$("#barcodeFrm").attr('method', 'post');
		$("#barcodeFrm").attr('target', 'barcode_write');			
		$("#barcodeFrm").submit();

		$("#barcodeFrm").attr('action', originAction);
	});
	$("button[name='barcode_excel_btn']").on("click",function(){
		document.location.href ='/admin/barcode/barcode_write_excel';
	});

	//바코드 타입 변경 팝업
	$('button[name="codetype_btn"]').on("click",function(){
		openDialog("바코드 형식 변경", "barcode_type_popup", {"width":"850","height":"370","show" : "fade","hide" : "fade"});
	});
	// 위에 까지 확인된 스크립트야


	//전체 체크 버튼
	$('#chkAll').on("click",function(){
		if($('#chkAll:checked').length == 0){
			$('.chk').attr('checked', false);
		}else{
			$('.chk').attr('checked', true);
		}
	});

	//재고 수량 셀렉트 박스 변경
	$('.sel-stock').on("change",function(){
		$('#target_stock').val('');
		if($(this).val() == 0){
			$('#target_stock').attr('disabled', true);
			$('.tmp_stock').each(function(){
				$(this).next('.chk_stock').val($(this).val());
			});
		}else{
			$('#target_stock').attr('disabled', false);
		}
	});

	//재고 수량 숫자만 입력 받기
	$('.chk_stock, #target_stock').on("keydown",function(event){
		if(!( (event.keyCode >= 48 && event.keyCode<=57) || (event.keyCode >= 96 && event.keyCode<= 105) || event.keyCode == 8) ){
			alert('숫자만 입력해 주세요.');
			if(event.returnValue) event.returnValue = false;
			else $(this).val(this.value.replace(/[^0-9]+/g, ''));
			return false;
		}
	});

	//재고 수량 일괄 적용
	$('#btn_all_stock').on("click",function(){
		if($('.sel-stock').val() != 0 ){
			var tar_val = $('#target_stock').val() != '' ? $('#target_stock').val() : 0;
			$('.chk_stock').val(tar_val);
		}			
	});
	
	//바코드 업데이트 버튼 클릭
	$("button[name='barcode_update_btn']").on("click",function(){
		$('form#barcodeFrm').attr('target', 'actionFrame');
		$('form#barcodeFrm').attr('method', 'POST');
		$('form#barcodeFrm').attr('action', '../barcode_process/set_barcode_data');
		$('form#barcodeFrm').submit();
		$('form#barcodeFrm').attr('target', '');
		$('form#barcodeFrm').attr('method', 'GET');
		$('form#barcodeFrm').attr('action', '');
	});

	$("button[name='barcode_upload_btn'").on('click', function() {excel_upload()});

	$("select.bsubtype").on("change", function() {
		$(this).prev('label').find('input').prop('checked',true);
	})
});


// 업로드 폼 submit
function excel_upload(){
	if	(!$("input[name='barcode_excel_file']").val()){
		openDialogAlert('업로드할 파일이 없습니다.', 400, 150);
		return false;
	}

	$("form#excelUpload").submit();
}

// log 파일 다운로드
function download_log_file(obj){
	var f	= $(obj).text();
	if	(!f){
		openDialogAlert('로그파일명이 없습니다.', 400, 150);
		return false;
	}

	actionFrame.location.replace('../barcode_process/excel_log_download?f=' + f);
}

//엑셀 다운로드 액션폼 생성 함수
function ajaxexceldown(url, queryString){
	var inputs = "";
	$.each(queryString, function(i, field){
		inputs +='<input type="hidden" name="'+field.name+'" value="'+ field.value +'" />';
	});
	$('<form action="'+ url +'" method="post" target="actionFrame" >'+inputs+'</form>')
	.appendTo('body').submit().remove();
}

function print_barcode(mode) {
	window.open("", "barcode", "width=960, height=640");
	var tempListFrm = $('#barcodeFrm').clone();
	var tempSearchFrm = $('#barcodeSearchForm').find('input,select').clone();

	$(tempListFrm).attr('target', 'barcode');
	$(tempListFrm).attr('method', 'post');
	$(tempListFrm).attr('action', 'barcode_print');
	$(tempListFrm).append(tempSearchFrm);

	$(tempListFrm).find('input[name="total_ea"]').remove();
	$(tempListFrm).find('input[name="orderby"]').remove();
	$(tempListFrm).find('input[name="stock"]').remove();
	$(tempListFrm).find('input[name="sort"]').remove();
	$(tempListFrm).find('input[name="mode"]').val(mode);
	
	$('body').append(tempListFrm);
	$(tempListFrm).submit();
	$(tempListFrm).remove();
}

function download_barcode(mode) {
	var f = $("#barcodeSearchForm");
	if(mode == "select"){
		f = $("#barcodeFrm");
	}
	f.find("input[name='mode']").val(mode);
	var queryString = f.serializeArray();
	ajaxexceldown('/admin/barcode_process/exceldownload', queryString);
	f.find("input[name='mode']").val('');
}