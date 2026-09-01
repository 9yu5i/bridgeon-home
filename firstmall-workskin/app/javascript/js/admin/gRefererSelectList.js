/**
 * [공용] 유입경로할인 선택 openDialog
 * gRefererSelect.open({CallbackFunction})
*/

var gRefererSelect = (function () {

	var callbackFun		= function(){};
	var _options		= {};

	var defaultOptions	= {
		width				: 500,
		height				: 600,
		divSelectLay		: "lay_referer_select",
		divSelectTitle		: "유입경로 할인 선택",
		perpage				: 10,
		orderby				: '',
		sort				: 'asc',
		url					: '/admin/referer/gl_referer_select',
		method				: 'get',
		autoClose			: false,
		closeMessageUse		: true,
		closeMessage		: "유입경로 할인이 {length}개 선택되었습니다.",
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

			_searchReferer(1);

			// 이벤트 설정
			$(document).on('click', '#'+ _options.divSelectLay+' input[name="chkAll"]', _setCheckAll);
			$(document).on('click', '#'+ _options.divSelectLay+' .btnLayClose', _layClose);
			$(document).on('click', '#'+ _options.divSelectLay+' .confirmSelectReferer', _submitReferer);
			$(document).on('click', '#'+ _options.divSelectLay+' .paging_navigation a', _onPageClick);
			$(document).on('click', '#'+ _options.divSelectLay+' input[name="select_referersale_seq[]"]', _checkedClass);

		}else{
			_reset();
		}

	}

	/**
	* 리스트 불러오기
	**/
	var _searchReferer = function (page) {

		var params				= '';

		params = params + "&perpage="+_options.perpage+"&orderby="+_options.orderby+"&sort="+_options.sort;

		if (typeof page == 'string') page *= 1;
		if (typeof page != 'number') page = 0;

		params		= params + "&page=" +  page ;

		// 선택된 유입경로 
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

		_searchReferer(1);

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
			callbackFun = _callbackRefererList;
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

	/*
	리스트 체크박스 선택/해제
	*/
	var _checkedClass = function(){

		if($(this).is(":checked") == true){
			$(this).closest("tr").addClass("bg-gray");
		}else{
			$(this).closest("tr").removeClass("bg-gray");
		}
	}

	// 선택한 입점사 콜백으로 리턴
	var _submitReferer = function (){

		var list = new Array();

		$("input[name='select_referersale_seq[]']").each(function(e){

			if($(this).is(":checked") == true){
				var data					= new Object();
				data.select_referersale_seq		= $(this).val();
				data.select_referersale_name	= $("input[name='select_referersale_name[]']").eq(e).val();
				list.push(data);
			}
		});

		if($("input[name='select_referersale_seq[]']:checked").length < 1){
			alert("선택된 유입 경로 할인이 없습니다.");
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

	// 콜백 ::  유입경로할인 선택
	var _callbackRefererList = function(json){

		try
		{
			if(typeof json == ""){
				throw "선택한 유입 경로 할인 데이터가 비어 있습니다";
			}

			if(typeof json != "string"){
				throw "선택한 유입 경로 할인 데이터가 type::String 이 아닙니다.";
			}

			var data = $.parseJSON(json);

			if(typeof data != "object"){
				throw "선택한 유입 경로 할인 데이터가 type::Object 가 아닙니다.";
			}
			var html = "";

			var save_referersale = new Array();
			$(".t_referer_limit .referersale_list input[name='referersale_seq[]']").each(function(e){
				save_referersale[e] = $(this).val();
			});

			$.each(data, function(key, list){

				if($.inArray(list.select_referersale_seq,save_referersale) != -1){
				}else{
					html += '<tr rownum="'+list.select_referersale_seq+'">';
					html += '	<td class="left">'+list.select_referersale_name+'</td>';
					html += '	<td class="center">';
					html += '	<input type="hidden" name="referersale_seq[]" value="'+list.select_referersale_seq+'">';
					html += '	<button type="button" class="btn_minus" selectType="referersale" seq="'+list.select_referersale_seq+'" onClick="gRefererSelect.select_delete(\'minus\',$(this))"></button></td>';
					html += '</tr>';
				}

			});

			var member_grade_tb = $(".t_referer_limit .referersale_list table");
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
		searchReferer: _searchReferer,

		// 전체선택
		setCheckAll: _setCheckAll,

		onPageClick: _onPageClick,

		//선택한 입점사 전달
		submitReferer: _submitReferer,

		_keyDown: _keyDown,

		select_delete: _select_delete,
		callbackRefererList:_callbackRefererList,
		//창 닫기
		layClose: _layClose
	}

})();