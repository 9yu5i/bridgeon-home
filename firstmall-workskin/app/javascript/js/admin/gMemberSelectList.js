/**
 * [공용]회원 선택 openDialog
 * gMemberSelect.open({CallbackFunction})
*/

var gMemberSelect = (function () {

	//
	var callbackFun		= function(){};
	var _options		= {};

	var MemberDefaults	= {
		width				: 1050,
		height				: 760,
		divSelectLay		: 'lay_member_select',
		divSelectTitle		: '회원 선택',
		parentsDivLay		: '',
		perpage				: 10,
		pageblock			: 10,
		orderby				: 'A.member_seq',
		sort				: 'desc',
		url					: '/admin/member/gl_select_member',
		method				: 'post',
		autoClose			: true,

	};

	var selectLayer			= "";

	/*
	 * 초기 세팅
	 */
	var _init = function (options) {

		_options		= $.extend(MemberDefaults, options);
		selectLayer		= $("div#"+_options.divSelectLay);

		if (selectLayer.html() == "") {

			_searchMember(0);

			// 버튼 이벤트 설정
			//$(document).on('submit', '#'+ _options.divSelectLay+' form[name="downloadsearch"]', _searchMember);
			$(document).on('click', '#'+ _options.divSelectLay+'  form[name="downloadsearch"] .search_submit', _searchMember);
			$(document).on('click', '#'+ _options.divSelectLay+'  input[name="chkAll"]', _setCheckAll);
			$(document).on('click', '#'+ _options.divSelectLay+' .btnLayClose', _close);
			$(document).on('click', '#'+ _options.divSelectLay+' .confirmSelectMember', _submitSelectMember);	//선택한 회원적용
			$(document).on('click', '#'+ _options.divSelectLay+' .confirmSearchMember', _subimtSearchMember);	//검색된 회원적용
			$(document).on('click', '#'+_options.divSelectLay+' form[name="downloadsearch"] .search_detail', _searchFormDetail);	//상세검색
			$(document).on('click', '#'+_options.divSelectLay+' form[name="downloadsearch"] .search_form_save', _searchFormSave);	//검색설정저장
			$(document).on('click', '#'+_options.divSelectLay+' form[name="downloadsearch"] .search_reset', _searchFormReset);		//검색필드초기화
			$(document).on('click', '#'+_options.divSelectLay+' input[name="search_text"]', _setSearchTextValue);
			//$(document).on('click', '#'+ _options.divSelectLay+' .paging_navigation a', _onPageClick);

		}else{
			_reset();
		}

	}

	/**
	* 리스트 불러오기
	**/
	var _searchMember = function (page) {

		if (typeof page == 'undefined' || typeof page == 'object' && page == null) {
			//page = '1';
		}else{
			$("#"+_options.divSelectLay+" input[name='page']").attr("disabled",true);
		}
		var params		= "";

		var queryString = $('#'+_options.divSelectLay+' #downloadsearch').formSerialize();
		

		if(typeof _options.issued_type != "undefined"){
			params		= params + "&issued_type=" +  _options.issued_type;
		}
		if(typeof _options.issued_seq != "undefined"){
			params = params + "&issued_seq="+_options.issued_seq;
		}
		params = params + "&divSelectLay="+_options.divSelectLay;
		

		params = params + "&perpage="+_options.perpage+"&pageblock="+_options.pageblock+"&orderby="+_options.orderby+"&sort="+_options.sort;
		params = params + "&"+queryString;


		if (typeof page == 'string') page *= 1;
		if (typeof page != 'number') page = 1;

		if(page > 1){
		//	page = (page - 1) * _options.perpage;
		}

		params		= params + "&page=" +  page ;

		$.ajaxSetup({async:false});
		$.ajax({
			type	: _options.method,
			url		: _options.url,
			data	: params,
			success	: function(result){
				selectLayer.html(result);
				_searchFormDetail('basic');
			}
		});
		$.ajaxSetup({async:true});

	}

	/**
	 * 회원 선택 팝업 열기
	 */
	var _open = function (options,callback) {

		_setCallback(callback);
		_init(options);

		$("#"+_options.divSelectLay+" .s_detail").hide();

		openDialog(_options.divSelectTitle, _options.divSelectLay, {"width":_options.width,"height":_options.height});

	}

	/**
	 * 콜백 함수 지정
	 */
	var _setCallback = function (callback) {
		if (typeof callback === 'function') {
			callbackFun = callback;
		} else {
			callbackFun = _callbackSetMember;
		}
	}

	/**
	 * 콜백함수 가져오기
	 */
	var _getCallback = function (callback) {
		return callbackFun;
	}

	/**
	 * 전체선택/해제
	 */
	var _setCheckAll = function () {
		var chk = $("#"+_options.divSelectLay+" input[name='chkAll']").is(":checked");
		$("#"+_options.divSelectLay+" .member_chk").attr("checked",chk).change();
		if(chk == "checked" || chk == true){
			$("#"+_options.divSelectLay+" .member_chk:checked").closest("tr").addClass("bg-gray");
		}else{
			$("#"+_options.divSelectLay+" .member_chk").closest("tr").removeClass("bg-gray");
		}
	}

	var _setSearchTextValue = function(mode){

		var obj = $("#"+_options.divSelectLay+" input[name='search_text']");

		var default_txt = "";

		if(obj.val() == default_txt ){
			obj.val('');
		}else{
			if(mode == "reset") obj.val(default_txt);
		}
	}

	var _keyDown = function(){

		selectLayer.keydown(function(key) {

			if (key.keyCode == 13) {
				alert("enter");
			}

		});

	}

	/**
	 * 페이지 이동 클릭
	 */
	var _onPageClick = function () {

		var page = $(this).attr("data-ci-pagination-page");
		_searchMember(page);
	}

	/*
	상세검색폼 노출/숨김
	*/
	var _searchFormDetail = function(mode){
		var obj = $('#' + _options.divSelectLay + ' form[name="downloadsearch"] .search_detail');
		//event.stopImmediatePropagation();

		if(typeof mode == "undefined"){
			mode = obj.attr("mode");
		}

		if(mode == "basic"){
			obj.html('<span class="txt">상세 검색</span><img src="/admin/skin/default/images/common/icon_search_detail_close.png">');
			obj.attr("mode","s_detail");
		}else{
			obj.html('<span class="txt">상세 검색</span><img src="/admin/skin/default/images/common/icon_search_detail_open.png">');
			obj.attr("mode","s_basic");
		}
		$("#"+_options.divSelectLay+" form[name='downloadsearch'] .s_detail").toggle();

	}

	/* 
	검색설정저장
	*/
	var _searchFormSave = function(){
		return false;
	}

	/* 
	검색값초기화
	*/
	var _searchFormReset = function(){

		$("#"+_options.divSelectLay+" form[name='downloadsearch'] input[type='text']").val('');
		$("#"+_options.divSelectLay+" form[name='downloadsearch'] .table_basic td").each(function(){
			$(this).find("input[type='radio']").eq(0).prop("checked",true);
		});
		$("#"+_options.divSelectLay+" form[name='downloadsearch'] select").each(function(){
			$(this).children("option:eq(0)").prop("selected",true);
		});
		
		_setSearchTextValue('reset');

	}

	//검색한 회원 콜백으로 리턴
	var _subimtSearchMember = function(){

		var _url = '/admin/coupon_process/download_member_search_all';
		if(_options.issued_type == "promotion"){
			_url = '/admin/promotion_process/download_member_search_all';
		}

		var queryString = $("#"+ _options.divSelectLay + " form[name='downloadsearch']").formSerialize();

		$.ajax({
			type: 'post',
			url: _url,
			data: queryString,
			dataType: 'json',
			success: function(res) {

				if(res.searchallmember == null){
					alert("검색한 회원중에는 쿠폰 발급 대상이 없습니다.");
					return false;
				}

				var jsonData = JSON.stringify(res.searchallmember);

				var callback = _getCallback();

				if (callback) {
					callback (jsonData);
				}

				if(_options.autoClose == true){
					closeDialog(_options.divSelectLay);
				}

			},
			fail: function(e){
				console.log("ERROR");
			}
		});

	}

	// 선택한 회원 콜백으로 리턴
	var _submitSelectMember = function (){

		var list = new Array();

		if($("#"+ _options.divSelectLay+" input[name='member_chk[]']:checked").length < 1){
			alert("선택된 회원이 없습니다.");
			return false;
		}
		$("#"+ _options.divSelectLay + " input[name='member_chk[]']:checked").each(function(e){

			var data = new Object();
			data.member_seq			= $(this).val();
			data.userid				= $(this).attr("userid");
			data.user_name			= $(this).attr("user_name");
			//data.email				= $(this).attr("email");
			//data.cellphone			= $(this).attr("cellphone");

			list.push(data);

		});

		var jsonData = JSON.stringify(list);

        var callback = _getCallback();

        if (callback) {
			if(typeof _options.selectFieldName != "undefined" && _options.selectFieldName != ""){
	            callback (jsonData,_options.selectFieldName);
			}else{
	            callback (jsonData);
			}
        }

		if(_options.autoClose == true){
			closeDialog(_options.divSelectLay);
		}

	}

	/**
	* 검색 초기화
	**/
	var _reset = function (){

		_searchMember(1);
		_setSearchTextValue('reset');

	}

	// 창닫기
	var _close = function(){
		closeDialog(_options.divSelectLay);
	}

	// 회원선택 콜백
	var _callbackSetMember = function(json){

		try
		{

			if(json == null){
				throw "선택(검색)한 회원이 없습니다";
			}

			if(typeof json != "string"){
				throw "선택(검색)한 회원 데이터가 type::String 이 아닙니다.";
			}

			var data = $.parseJSON(json);

			if(typeof data != "object"){
				throw "선택(검색)한 회원 데이터가 type::Object 가 아닙니다.";
			}

			var idx				= data.length;//현재회원수

			if(idx > 0) {

				var target_container 	= new Object;
				var target_member 		= new Object;
				var member_search_count = new Object;
				if(typeof _options.parentsDivLay != 'undefined'){
					target_container		= $("#"+ _options.parentsDivLay+" #target_container");
					target_member			= $("#"+ _options.parentsDivLay +" #target_member");
					member_search_count 	= $("#"+ _options.parentsDivLay+" #member_search_count");
				}else{
					target_container		= $("#target_container");
					target_member			= $("#target_member");
					member_search_count		= $("#member_search_count");			//총선택회원수
				}

				var downloadtotal			= _options.downloadtotal;					//현재 발급건수
				var download_limit_ea		= _options.download_limit_ea;				//누적건수
				var download_limit			= _options.download_limit;					//수량제한구분

				var str = "";
				var tag = "";
				var oldstr			= target_container.html();
				var addnum			= 0;

				if(download_limit == 'limit'){
					var downloadtotal1 = parseInt(parseInt(downloadtotal)+parseInt(idx));
					var downloadtotal2 = parseInt(parseInt(downloadtotal1)+parseInt(parseInt(member_search_count.html())));
					if(idx > download_limit_ea ){
						alert("이 쿠폰의 전체수량제한 누적건수("+download_limit_ea+")보다 현재 선택회원("+idx+")이 많습니다!");
						return false;
					}else if(downloadtotal1 > download_limit_ea ){
						alert("이 쿠폰의 전체수량제한 누적건수("+download_limit_ea+")보다 총 발급건수와 현재 선택회원의 합계("+downloadtotal1+")가 많습니다!");
						return false;
					}else if(downloadtotal2 > download_limit_ea ){
						alert("이 쿠폰의 전체수량제한 누적건수("+download_limit_ea+")보다 총 발급건수와 총 선택회원의 합계("+downloadtotal2+")가 많습니다!");
						return false;
					}
				}

				$.each(data, function(key, list){

					var chk = _memberSelectCheck(list.member_seq);
					if( chk == false ) {
						addnum++;
						str += list.user_name+'[' + list.userid + '] , ';
						tag += list.member_seq+'|';
					}

				});

				if(str){

					var msg = oldstr + " " + str;

					if(target_member.val() == ""){
						tag = "|"+tag;
					}else{
						tag = target_member.val() + tag;
					}

					target_container.html(msg);
					target_member.val(tag)

					var newcheckedId = target_member.val().split('|');
					member_search_count.html((newcheckedId.length-2));
				}
			}

		}
		catch (error)
		{
			alert(error);
			return false;
		}

		if(_options.autoClose == true){
			closeDialog(_options.divSelectLay);
		}


	}

	//중복체크
	var _memberSelectCheck = function(newmbseq){
		var target_member = new Object;
		if(typeof _options.parentsDivLay != 'undefined'){
			target_member	= $("#"+ _options.parentsDivLay +" #target_member").val();
		}else{
			target_member	= $(" #target_member").val();			
		}
		if(target_member.indexOf("|"+newmbseq+"|") != -1){
			return true;
		}else{
			return false;
		}
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

		// 회원 검색
		searchMember: _searchMember,

		// 전체선택
		setCheckAll: _setCheckAll,

		//선택한 회원 전달
		submitSelectMember: _submitSelectMember,
		subimtSearchMember: _subimtSearchMember,

		keyDown: _keyDown,

		searchFormDetail: _searchFormDetail,
		searchFormSave: _searchFormSave,
		searchFormReset: _searchFormReset,
		setSearchTextValue: _setSearchTextValue,
		callbackSetMember:_callbackSetMember,
		memberSelectCheck:_memberSelectCheck,

		//창 닫기
		close: _close
	}

})();