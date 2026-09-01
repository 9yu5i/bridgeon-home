/**
 * [공용]입점사 선택 openDialog
 * gProviderSelect.open({CallbackFunction})
*/

var gProviderSelect = (function () {

	var callbackFun		= function(){};
	var _options		= {};

	var defaultOptions	= {
		width				: 600,
		height				: 720,
		divSelectLay		: "lay_seller_select",
		divSelectTitle		: "입점사 선택",
		perpage				: 10,
		orderby				: 'regdate',
		sort				: 'desc',
		url					: '/admin/provider/gl_select_provider',
		method				: 'get',
		autoClose			: false,
		closeMessageUse		: true,
		closeMessage		: "입점사가 {length}개 선택되었습니다.",
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

			_searchProvider(0);

			// 이벤트 설정
			//$(document).on('submit', '#'+ _options.divSelectLay+' #selectProviderFrm', _searchProvider);
			$(document).on('click', '#'+ _options.divSelectLay+' #btn_src_provider', _searchProvider);
			$(document).on('click', '#'+ _options.divSelectLay+' input[name="chkAll"]', _setCheckAll);
			$(document).on('click', '#'+ _options.divSelectLay+' .btnLayClose', _close);
			$(document).on('click', '#'+ _options.divSelectLay+' .confirmSelectProvider', _submitSelectProvider);
			$(document).on('click', '#'+ _options.divSelectLay+' .paging_navigation a', _onPageClick);
			$(document).on('click', '#'+ _options.divSelectLay+' input[name="providerSeq[]"]', _checkedClass);

		}else{
			_reset();
		}

	}

	/**
	* 리스트 불러오기
	**/
	var _searchProvider = function (page) {

		var shippingtype		= '';
		var params				= '';

		if(typeof $("input[name='sc_provider_name']").val() == "string"){
			params = params + "&sc_provider_name=" + encodeURIComponent($("input[name='sc_provider_name']").val());
		}

		params = params + "&perpage="+_options.perpage+"&orderby="+_options.orderby+"&sort="+_options.sort;

		if (typeof page == 'string') page *= 1;
		if (typeof page != 'number') page = 1;

		params		= params + "&page=" +  page ;

		// 선택된 입점사
		if(typeof _options.select_lists != "undefined"){
			var provider_list			= new Array();
			if(_options.select_lists == 'admin'){
				provider_list[0] = 1;
			}else if(_options.select_lists != 'all'){
				$("input[name='"+_options.select_lists+"']").each(function(e){provider_list[e] = $(this).val();});
			}
			if(provider_list.length > 0) params	= params + "&select_lists="+provider_list.join('|');
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
		//$.ajaxSetup({async:true});
	}


	/**
	* 검색 초기화
	**/
	var _reset = function (){

		$("input[name='sc_provider_name']").val("");
		_searchProvider(0);

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
			callbackFun = _callbackSetProviderList;
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
		_searchProvider(page);
	}

	var _checkedClass = function(){
		if($(this).is(":checked") == true){
			$(this).closest("tr").addClass("bg-gray");
		}else{
			$(this).closest("tr").removeClass("bg-gray");
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
	var _submitSelectProvider = function (){

		var list = new Array();

		$("input[name='providerSeq[]']").each(function(e){

			if($(this).is(":checked") == true){
				var data = new Object();
				data.provider_seq		= $(this).val();
				data.provider_name		= $("input[name='providerName[]']").eq(e).val();
				data.commission_text	= $("input[name='providerCommission[]']").eq(e).val();

				list.push(data);
			}
		});

		if($("input[name='providerSeq[]']:checked").length < 1){
			alert("선택된 입점사가 없습니다.");
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
		var default_len = 1;		//타이틀 row, 데이터없을 때 노출 row(hidden)

		if(mode == "minus"){
			$selecter 	= obj.closest('table');
			obj.closest("tr[rownum='"+obj.attr('seq')+"']").remove();
		}else{

			$selecter	= $("."+obj+"_list table");
			$("."+obj+"_list table .chk:checked").each(function(){
				$selecter.find("tr[rownum="+$(this).val()+"]").remove();
			});

		}

		if($selecter.find("tr").length == default_len){
			$selecter.find("tr[rownum=0]").show();

			if(mode == "chk"){
				$("."+obj+"_list_header input[name='chkAll']").prop("checked",false);
			}
		}

	}

	// 콜백 :: 입점사 선택
	var _callbackSetProviderList = function(json){
	
		try
		{
			if(typeof json == ""){
				throw "선택한 입점사 데이터가 비어 있습니다";
			}

			if(typeof json != "string"){
				throw "선택한 입점사 데이터가 type::String 이 아닙니다.";
			}

			var data = $.parseJSON(json);

			if(typeof data != "object"){
				throw "선택한 입점사 데이터가 type::Object 가 아닙니다.";
			}

			var html = "";

			// 이미 선택되어 있는 입점사 배열화
			var save_provider = new Array();
			$("input[name='salescost_provider_list[]']").each(function(e){
				save_provider[e] = $(this).val();
			});

			$.each(data, function(key, list){

				if($.inArray(list.provider_seq,save_provider) != -1){
				}else{
					html += '<tr rownum="'+list.provider_seq+'">';
					html += '	<td class="center">'+list.provider_name+'</td>';
					html += '	<td class="center">'+list.commission_text+'</td>';
					html += '	<td class="center">';
					html += '	<input type="hidden" name="salescost_provider_list[]" value="'+list.provider_seq+'">';
					html += '	<button type="button" class="btn_minus" selectType="provider" seq="'+list.provider_seq+'" onClick="gProviderSelect.select_delete(\'minus\',$(this))"></button></td>';
					html += '</tr>';
				}
			});

			$(".provider_list table").append(html);

			if($(".provider_list").find("tr").length == 2){
				$(".provider_list").find("tr[rownum=0]").show();
			}else{
				$(".provider_list").find("tr[rownum=0]").hide();
			}
		}
		catch (error)
		{
			alert(error);
			return false;
		}
	}

	// 창닫기
	var _close = function(){
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
		searchProvider: _searchProvider,

		// 전체선택
		setCheckAll: _setCheckAll,

		onPageClick: _onPageClick,

		//선택한 입점사 전달
		submitSelectProvider: _submitSelectProvider,

		checkedClass: _checkedClass,

		keyDown: _keyDown,

		select_delete: _select_delete,
		callbackSetProviderList:_callbackSetProviderList,
		//창 닫기
		close: _close
	}

})();