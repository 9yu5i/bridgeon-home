$(function() {

	// ############## 검색 관련 스크립트 START ######################
	if(scObj.is_save == true) {
		var arrSort = {
			'b.start_date':'방송일 순',
			'sumvisitors' : '조회수 순',
			'b.likes' : '좋아요 순'
		}
	} else {
		var arrSort = {
			'b.bs_seq':'예약 신청일 순',
			'b.start_date':'방송일 순'
		}
	}
	var broadcastSearchFunc = null;
	if(scObj.select) {
		function broadcastSearchFunc() {
			var selector = "div#broadcast_search_container form";
			$(selector).find("input[name='page']").val(0);
			$(selector).find("input[name='searchflag']").remove();
			$(selector).append("<input type='hidden' name='searchflag' value='1'/>");
			var queryString = $(selector).serialize();
			$.ajax({
				type: 'get',
				url: '/api/broadcast',
				data: queryString,
				success: function(res) {
					if(res.success === true) {
						getCatalogAjax(res);
					}
				}
			});
		}
	}
	gSearchForm.init({'pageid':'broadcast_catalog','sc':scObj,'displaySort':arrSort, 'formEditorUse':false,'searchFormEditView':true},broadcastSearchFunc);

	/* 카테고리 불러오기 */
	category_admin_select_load('','category1','',function(){
		if(scObj.category1){
			$("select[name='category1']").val(scObj.category1).change();
		}
	});
	$("select[name='category1']").on("change",function(){
		category_admin_select_load('category1','category2',$(this).val(),function(){
			if(scObj.category2){
				$("select[name='category2']").val(scObj.category2).change();
			}
		});
		category_admin_select_load('category2','category3',"");
		category_admin_select_load('category3','category4',"");
	});
	$("select[name='category2']").on("change",function(){
		category_admin_select_load('category2','category3',$(this).val(),function(){
			if(scObj.category3){
				$("select[name='category3']").val(scObj.category3).change();
			}
		});
		category_admin_select_load('category3','category4',"");
	});
	$("select[name='category3']").on("change",function(){
		category_admin_select_load('category3','category4',$(this).val(),function(){
			if(scObj.category4){
				$("select[name='category4']").val(scObj.category4).change();
			}
		});
	});

	// 카테고리/브랜드/지역 : 미등록 클릭 시 이벤트
	$(".not_regist").on("click",function(e,mode){
		if($(this).is(":checked") === true || mode == 'checked'){
			$(this).closest("td").find("input:checkbox").not($(this)).prop("checked",false).prop("disabled",true);
			$(this).closest("td").find("select").prop("disabled",true);
		}else{
			$(this).closest("td").find("input:checkbox").prop("disabled",false);
			$(this).closest("td").find("select").prop("disabled",false);
		}
	});

	if(scObj.goods_category_no) $("input[name='goods_category_no']").prop("checked",false).trigger('click',['checked']);

	// ############## 검색 관련 스크립트 END ######################

	// ############## 방송 관련 스크립트 START ######################
	$.ajax({
		method	 : "GET",
		url		 : "/api/auth/broadcast",
		success	 : function(res) {
			var expire_date = new Date(res.expire_date);
			var now_date = new Date();

			if(res.use !== true || expire_date < now_date) {
				openDialog("라이브 쇼핑", "broadcast_info", {"width":"450","noClose":"true"});
			} else {
				if(scObj.searchflag != "1" && res.ssl !== true) {
					openDialog("알림", "broadcast_ssl", {"width":"450","height":"200"});
				}
			}

		}
	});

	// 방송생성
	$(".broad_create").on("click",function () {createBroadcast()});

	// 방송 리스트 불러오기
	$.ajax({
		method	 : "GET",
		url		 : "/api/broadcast",
		data	 : scObj,
		success: function(res){
			if(res.success === true) {
				getCatalogAjax(res);
			}
		},
		error: function(request, status, error){
			console.log("code:"+request.status+"\n"+"message:"+request.responseText);
		}
	});

	// 방송 사용량 조회
	$.ajax({
		method	 : "GET",
		url		 : "/api/broadcast/stat",
		data	 : scObj,
		success: function(res){
			if (res.success) {
				var used_live_traffics = res.data.used_live_traffics.capacity;
				var used_live_traffics_unit = res.data.used_live_traffics.unit;
				var used_vod_traffics = res.data.used_vod_traffics.capacity;
				var used_vod_traffics_unit = res.data.used_vod_traffics.unit;
				var used_vod_quota = res.data.used_vod_quota.capacity;
				var used_vod_quota_unit = res.data.used_vod_quota.unit;

				$('#used_live_traffics').text(used_live_traffics + used_live_traffics_unit);
				$('#used_vod_traffics').text(used_vod_traffics + used_vod_traffics_unit);
				$('#used_vod_quota').text(used_vod_quota + used_vod_quota_unit);
			}
		},
		error: function(request, status, error){
			console.log("code:"+request.status+"\n"+"message:"+request.responseText);
		}
	});

	$(".go_live_page").on("click", function() {
		window.open('/broadcast ', '_blank');
	});

	$(".goVodList").on("click", function() {
		location.href = './vod';
	});

	$(".goInfo").on("click", function() {
		window.open('https://www.firstmall.kr/addservice/live');
	});

	$(".goSsl").on("click", function() {
		location.href = '/admin/setting/protect';
	});

	$("#chkAll").on("click", function(){
		if($(this).attr("checked")){
			$(".chk").attr("checked",true).trigger( "change" );
		}else{
			$(".chk").attr("checked",false).trigger( "change" );
		}
	});

	// 지난 방송 관리 - 노출(미노출) 변경
	$(".display_set_btn").on("click", function() {setBatchDisplay()});

	// ############## 방송 관련 스크립트 END ######################
});

/*
* 방송 리스트
*/
function getCatalogAjax(res) {
	var is_save = false;
	if(scObj.is_save == true) {
		is_save = true;
	}
	$.ajax({
		type	 : "POST",
		url		 : "/admin/broadcast/catalog_ajax",
		data	 : {"data":res.data.result,"vod":is_save,"select":scObj.select,"select_broadcast":scObj.select_broadcast},
		dataType : 'html',
		success: function(response){
			$("#broad_catalog").html(response);
			/* 디스플레이 on/off 이벤트 */
			displayToggleOnOff();
			bindToggleEvent();

			// 수정/삭제 버튼 바인드
			bindManagementEvent();
		},
		error: function(response){
			console.log(response);
		}
	});

	// 페이징 html 삽입
	$("#searchcount").html(res.data.page.searchcount);
	$("#totalcount").html(res.data.page.totalcount);
	$(".paging_navigation").html(res.data.page.html);
}

/*
* 디스플레이 on/off 이벤트 START
*/
function bindToggleEvent(){
	$(document).on('click',".btn-onoff", function(){
		swipeToggleEvent(this);
	});
}

function swipeToggleEvent(el) {
	var obj = $(el);
	var reversal_display = 'on';
	if(obj.prev("input").val() == 'on') {
		reversal_display = 'off';
	}
	$.ajax({
		type	 : "PUT",
		url		 : "/api/broadcast/"+obj.attr("bsseq")+"/display",
		data	 : "display="+reversal_display,
		success: function(res){
			console.log(res);
		},
		error: function(request, status, error){
			console.log("code:"+request.status+"\n"+"message:"+request.responseText);
		}
	});

	var _width = obj.closest(".btn-onoff").width();
	var _widthb = obj.closest(".btn-onoff").find('button').width();
	var _input = obj.closest('td').find('input');

	if(_input.val() == 'off'){
		obj.find('button').removeClass("btn-off").addClass("btn-on").val("on");
		obj.find('button').animate({"left": _width - _widthb +"px"}, "swing" );
		obj.find('button').parent().addClass("on");
		_input.val('on');
	}else{
		obj.find('button').removeClass("btn-on").addClass("btn-off").val("off");
		obj.find('button').animate({"left": 1+"px"}, "swing");
		obj.find('button').parent().removeClass("on");
		_input.val('off');
	}
}

function displayToggleOnOff() {
	$.each($(".btn-onoff"), function() {
		var _input = $(this).closest('td').find('input');
		var _width = $(this).closest(".btn-onoff").width();
		var _widthb = $(this).closest(".btn-onoff").find('button').width();
		var _input = $(this).closest('td').find('input');

		if(_input.val() == 'on'){
			$(this).find('button').removeClass("btn-off").addClass("btn-on").val("on");
			$(this).find('button').animate({"left": _width - _widthb +"px"}, "swing" );
			$(this).find('button').parent().addClass("on");
		}else{
			$(this).find('button').removeClass("btn-on").addClass("btn-off").val("off");
			$(this).find('button').animate({"left": 1+"px"}, "swing");
			$(this).find('button').parent().removeClass("on");
		}
	});
}

function setBatchDisplay() {
	var display = $("select[name='displaySet']").val();
	var bsSeqList = $("input[name='bs_seq[]']:checked");

	$.each(bsSeqList, function(index, item) {
		bsSeq = $(item).val();
		$.ajax({
			type	 : "PUT",
			url		 : "/api/broadcast/"+bsSeq+"/display",
			data	 : "display="+display,
			success: function(res){
				if((bsSeqList.length-1) == index) {
					self.openDialogAlert("노출 여부가 변경되었습니다.", 400, 140, function() {
						location.reload();
					});
				}
			},
			error: function(request, status, error){
				console.log("code:"+request.status+"\n"+"message:"+request.responseText);
			}
		});
	});
}
/*
* 디스플레이 on/off 이벤트 END
*/

/*
* 관리 수정/삭제  이벤트 START
*/
function bindManagementEvent(){
	$(document).on('click',".btn-drop", function(){
		var obj = $(this);
		openDialogConfirm("방송 편성표를 삭제하시겠습니까?", 400, 150, function() {
			var bsSeq = obj.closest('tr').attr("bsseq");
			dropBroadcast(bsSeq);
		});
	});

	$(document).on('click',".btn-delete", function(){
		var btn = $(this);
		openDialogConfirm("방송 편성표를 삭제하시겠습니까?", 400, 150, function() {
			deleteBroadcast(btn);
		});
	});

	// 수정버튼 클릭
	$(document).on('click',".btn-modify", function(){
		createBroadcast($(this).closest('tr').attr("bsseq"));
	});
	// 방송 제목 클릭
	$(document).on('click',".btn-info", function(){
		infoBroadcast($(this).closest('tr').attr("bsseq"));
	});
}

/**
 * 방송 편성표를 삭제한다. (data remove)
 * @param bsSeq
 */
function dropBroadcast(bsSeq)
{

	$.ajax({
		url: "/api/broadcast/"+bsSeq,
		type: 'DELETE'
	}).done(function(res) {
		if(res.result) {
			self.openDialogAlert("방송 편성표가 삭제되었습니다.", 400, 140, function() {
				location.reload();
			});
		} else {
			self.openDialogAlert(res.err.message, 400, 140);
		}

	}).error(function(response){
		console.log(response);
	});
}

/**
 * 방송 편성표를 삭제한다. (status='delete')
 * @param bsSeq
 */
function deleteBroadcast(el)
{
	var obj = $(el);
	var bsSeq = obj.closest('tr').attr("bsseq");

	$.ajax({
		url: "/api/broadcast/delete/"+bsSeq,
		type: 'PUT'
	}).done(function() {
		self.openDialogAlert("방송 편성표가 삭제되었습니다.", 400, 140, function() {
			location.reload();
		});
	}).error(function(response){
		console.log(response);
	});
}

/*
* 관리 수정/삭제  이벤트 END
*/

/*
* 방송 생성 폼 노출
*/
function createBroadcast(bsSeq) {
	var param;
	if(bsSeq) {
		param = "bs_seq="+bsSeq;
	}
	$.ajax({
		type: "get",
		url: "./regist",
		data:param,
		success: function(html){
			var dialogId = 'broadcast_regist_layout';
			var title = '라이브 예약';
			$("#broadcast_regist_layout").remove();
			$("#broadcast_info_layout").remove();
			$(".contentsWarp").append($("<div></div").attr('id',dialogId).html(html));
			openDialog(title, dialogId, {'width':650,'height':850,'show':'fade','hide' : 'fade'});
			createBroadcastInit();
		}
	});
}

/*
* 방송 폼 노출 시 load 스크립트
*/
function createBroadcastInit() {
	addLimitTextEvent();
	setDatepicker();
	$('#image').createAjaxFileUpload(uploadConfig, uploadCallback);
}

/*
* 방송 정보 폼 노출
*/
function infoBroadcast(bsSeq) {
	var param;
	if(bsSeq) {
		param = "bs_seq="+bsSeq;
	}
	$.ajax({
		type: "get",
		url: "./info",
		data:param,
		success: function(html){
			var dialogId = 'broadcast_info_layout';
			var title = '방송 정보';
			$("#broadcast_regist_layout").remove();
			$("#broadcast_info_layout").remove();
			$(".contentsWarp").append($("<div></div").attr('id',dialogId).html(html));
			openDialog(title, dialogId, {'width':650,'height':850,'show':'fade','hide' : 'fade'});
			createBroadcastInit();
		}
	});
}

/*
* datepicker 날짜 선택 제한
* 나중에 사용하게 되면 common JS 로 옮겨주세요!
*/
function fnDatepicker(mode) {
	var options = new Array();
	if(mode == 'aftertoday') {
		options['minDate'] = 0;
	}
	return options;
}