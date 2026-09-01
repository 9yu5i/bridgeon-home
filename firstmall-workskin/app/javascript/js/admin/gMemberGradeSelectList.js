/**
 * [공용] 회원 등급 선택 openDialog
 * gMemberGradeSelect.open({CallbackFunction})
*/
var gMemberGradeSelect = (function () {

	//
	var callbackFun		= function(){};
	var _options		= {};

	var defaultOptions	= {
		width				: 500,
		height				: 500,
		divSelectLay		: "lay_member_grade_select",
		divSelectTitle		: "회원 등급 선택",
		perpage				: 10,
		orderby				: '',
		sort				: 'asc',
		url					: '/admin/member/gl_select_member_grade',
		method				: 'get',
		autoClose			: false,
		closeMessageUse		: true,
		closeMessage		: "회원 등급이 {length}개 선택되었습니다.",
	};

	var selectLayer			= "";
	var selectLayerTitle	= "";

	/*
	 * 초기 세팅
	 */
	var _init = function (options) {

		if(typeof options == 'undefined') options = {};
		_options		= $.extend(defaultOptions, options);
		selectLayer		= $("div#"+_options.divSelectLay);

		if (selectLayer.html() == "") {

			_searchMemberGrade(0);

			// 이벤트 설정
			$(document).on('click', '#'+ _options.divSelectLay+' input[name="chkAll"]', _setCheckAll);
			$(document).on('click', '#'+ _options.divSelectLay+' .btnLayClose', _layClose);
			$(document).on('click', '#'+ _options.divSelectLay+' .confirmSelectMemberGrade', _submitMemberGrade);
			$(document).on('click', '#'+ _options.divSelectLay+' .paging_navigation a', _onPageClick);
			$(document).on('click', '#'+ _options.divSelectLay+' input[name="select_member_grade_seq[]"]', _checkedClass);

		}else{
			_reset();
		}

	}

	/**
	* 리스트 불러오기
	**/
	var _searchMemberGrade = function (page) {

		var params				= '';
		
		if (typeof page == 'string') page *= 1;
		if (typeof page != 'number') page = 1;

		params		+=  "&perpage="+_options.perpage+"&orderby="+_options.orderby+"&sort="+_options.sort;
		params		+= "&page=" +  page ;

		if(typeof _options.issued_seq != "undefined"){
			params		+= "&issued_seq=" +  _options.issued_seq ;
		}

		// 선택된 회원등급 
		if(typeof _options.select_lists != "undefined"){
			var list			= new Array();
			$("input[name='"+_options.select_lists+"']").each(function(e){list[e] = $(this).val();});
			if(list.length > 0) params	= params + "&select_lists="+list.join('|');
		}

		$.ajaxSetup({async:false});
		$.ajax({
			type	: _options.method,
			url		: _options.url,
			data	: params,
			success	: function(result){
				selectLayer.html(result);
			}
		});
		$.ajaxSetup({async:true});
	}


	/**
	* 검색 초기화
	**/
	var _reset = function (){

		_searchMemberGrade(0);

	}

	/**
	 * 입점사 선택 팝업 열기
	 */
	var _open = function (options,callback) {

		_setCallback(callback);
		_init(options);

		openDialog(_options.divSelectTitle, _options.divSelectLay, {"width":_options.width,"height":_options.height});

	}

	/**
	 * 콜백 함수 지정
	 */
	var _setCallback = function (callback) {
		if (typeof callback === 'function') {
			callbackFun = callback;
		} else {
			callbackFun = _callbackSetMemberGrade;
		}
	}

	/**
	 * 콜백함수 가져오기
	 */
	var _getCallback = function () {
		return callbackFun;
	}

	/**
	 * 페이지 이동 클릭
	 */
	var _onPageClick = function () {

		var page = $(this).attr("data-ci-pagination-page");
		page = (page - 1) * _options.perpage;
		_searchMemberGrade(page);
	}

	/*
	리스트 체크박스 선택/해제
	*/
	var _checkedClass = function(){

		if($(this).is(":checked") == true){
			$(this).closest("tr").addClass("bg-gray");
		}else{
			$(this).closest("tr").removeClass("bg-gray");

			/*
			var grade_list = new Array();
			$("input[name='"+_options.select_member_grade+"']").each(function(e){grade_list[e] = $(this).val();});
			if($.inArray($(this).val(),grade_list) > 0){
				$("input[name='"+_options.select_member_grade+"'][value='"+$(this).val()+"']").closest("span[no='"+$(this).val()+"']").
			}
			*/
			// 이미 선택되어 있는 리스트를 체크 해지했을 경우
			var list	= [{'member_grade_seq':$(this).val()}];
			var jsonData = JSON.stringify(list);
			var callback = _getCallback();
			if (callback) {
				callback (jsonData,'del');
			}
		}
	}
	
	/**
	 * 전체선택/해제
	 */
	var _setCheckAll = function () {
		var chk = $("#"+_options.divSelectLay+" input[name='chkAll']").is(":checked");
		$("#"+_options.divSelectLay+" .chk").attr("checked",chk).change();
		if(chk == "checked" || chk == true){
			$("#"+_options.divSelectLay+" .chk:checked").closest("tr").addClass("bg-gray");
		}else{
			$("#"+_options.divSelectLay+" .chk").closest("tr").removeClass("bg-gray");
		}
	}

	var _keyDown = function(){
		selectLayer.keydown(function(key) {
			if (key.keyCode == 13) {
				alert("enter");
			}
		});
	}


	// 선택한 입점사 콜백으로 리턴
	var _submitMemberGrade = function (){

		var list = new Array();

		$("#"+ _options.divSelectLay+" input[name='select_member_grade_seq[]']:checked").each(function(e){
			var data				= new Object();
			data.member_grade_seq	= $(this).val();
			data.member_grade_title	= $("#"+ _options.divSelectLay+" input[name='select_member_grade_title[]'][grade_seq='"+$(this).val()+"']").val();
			list.push(data);
		});

		if($("#"+ _options.divSelectLay+" input[name='select_member_grade_seq[]']:checked").length < 1){
			alert("선택된 회원 등급이 없습니다.");
			return false;
		}

		var jsonData = JSON.stringify(list);

        var callback = _getCallback();

        if (callback) {
            callback (jsonData);
        }

		if(_options.closeMessageUse == true && _options.closeMessage != ""){
			alert(_options.closeMessage.replace("{length}",list.length));
		}
		if(_options.autoClose == true) closeDialog(_options.divSelectLay);
	}

	var _select_delete = function(mode,obj){

		var $selecter	= "";
		var default_len = 2;		//타이틀 row, 데이터없을 때 노출 row(hidden)

		if(mode == "minus"){
			$selecter 	= obj.closest('table');
			obj.closest("tr").remove();
		}else{

			$selecter	= $("."+obj+"_list table");
			$("."+obj+"_list table .chk:checked").each(function(){
				$selecter.find("tr[rownum="+$(this).val()+"]").remove();
			});

			default_len = 1;
		}

		if($selecter.find("tr").length == default_len){
			$selecter.find("tr[rownum=0]").show();

			if(mode == "chk"){
				$("."+obj+"_list_header input[name='chkAll']").prop("checked",false);
			}
		}

	}

	// 콜백 :: 회원등급 선택
	var _callbackSetMemberGrade = function(json){

		try
		{
			if(typeof json == ""){
				throw "선택한 회원등급 데이터가 비어 있습니다";
			}

			if(typeof json != "string"){
				throw "선택한 회원등급 데이터가 type::String 이 아닙니다.";
			}

			var data = $.parseJSON(json);

			if(typeof data != "object"){
				throw "선택한 회원등급 데이터가 type::Object 가 아닙니다.";
			}
			var html = "";

			var save_member_grade = new Array();
			$("input[name='member_grade_list[]']").each(function(e){
				save_member_grade[e] = $(this).val();
			});

			$.each(data, function(key, list){

				if($.inArray(list.member_grade_seq,save_member_grade) != -1){
				}else{
					html += '<tr rownum="'+list.member_grade_seq+'">';
					html += '	<td class="center">'+list.member_grade_title+'</td>';
					html += '	<td class="center">';
					html += '	<input type="hidden" name="member_grade_list[]" value="'+list.member_grade_seq+'">';
					html += '	<input type="hidden" name="member_grade_coupon_group['+list.member_grade_seq+']" value="">';
					html += '	<button type="button" class="btn_minus" selectType="member_grade" seq="'+list.member_grade_seq+'" onClick="gMemberGradeSelect.select_delete(\'minus\',$(this))"></button></td>';
					html += '</tr>';
				}

			});

			var member_grade_tb = $(".t_member_grade .member_grade_list table");
			member_grade_tb.append(html);

			if(member_grade_tb.find("tr").length == 2){
				member_grade_tb.find("tr[rownum=0]").show();
			}else{
				member_grade_tb.find("tr[rownum=0]").hide();
			}
		}
		catch (error)
		{
			alert(error);
			return false;
		}
	}
	
	// 창닫기
	var _layClose = function(){
		closeDialog(_options.divSelectLay);
	}

	/**
	 * public
	 */
	return {

		// 초기 세팅
		init: _init,

		// 오픈 dialog
		open: _open,

		reset: _reset,

		// 콜백 지정
		setCallback: _setCallback,

		// 콜백 지정
		getCallback: _getCallback,

		// 입점사 검색
		searchMemberGrade: _searchMemberGrade,

		// 전체선택
		setCheckAll: _setCheckAll,

		onPageClick: _onPageClick,

		//선택한 입점사 전달
		submitMemberGrade: _submitMemberGrade,

		checkedClass: _checkedClass,

		_keyDown: _keyDown,
		select_delete: _select_delete,
		callbackSetMemberGrade:_callbackSetMemberGrade,
		//창 닫기
		layClose: _layClose
	}

})();