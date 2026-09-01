/**
 * [공용]방송 선택 openDialog
 * gBoradcastSelect.open({options},{CallbackFunction})
 * _options.select_broadcast 	: 선택된 방송 Field Name (default Name : issueBroadcast)
 * _options.selectCnt		: 방송 선택 갯수 제한 (multi, {number})
 **/

var gBroadcastSelect = (function () {

	var callbackFun		= function(){};
	var _options		= {};

	var defaultOptions	= {
		width				: 1050,
		height				: 720,
		divSelectLay		: "lay_broadcast_select",
		divSelectTitle		: "방송 선택",
		perpage				: 10,
		pageblock			: 10,
		url					: '/admin/broadcast/select',
		method				: 'get',
		autoClose			: false,
		closeMessageUse		: true,
		closeMessage		: "방송을 {length}개 선택하였습니다.",
		selectCnt			: 'multi',
		maxSelectBroadcasts : 10
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

		if(_options.selectCnt != 'multi') _options.selectCnt = parseInt(_options.selectCnt);
		if (selectLayer.html() == "") {

			_searchBroadcast(1);

			// 버튼 이벤트 설정
			$(document).on('submit', '#'+ _options.divSelectLay+' #selectGoodsFrm', _searchBroadcast);
			$(document).on('click', '#'+ _options.divSelectLay+' #selectSearchButton', _searchBroadcast);
			$(document).on('click', '#'+ _options.divSelectLay+'  input[name="chkAll"]', function(){ _setCheckAll($(this));} );
			$(document).on('click', '#'+ _options.divSelectLay+' .btnLayClose', _close);
			$(document).on('click', '#'+ _options.divSelectLay+' .confirmSelectBroadcasts', _submitSelectBroadcasts);
			$(document).on('click', '#'+ _options.divSelectLay+' input[name="select_broadcast_seq[]"]', function(){ _checkedClass($(this));});

		}else{
			_reset();
		}

	}

	/**
	* 리스트 불러오기
	**/
	var _searchBroadcast = function (page) {

		var params				= '';

		if (typeof page == 'string') page *= 1;
		if (typeof page != 'number') page = 1;

		if(page > 1) page = (page - 1) * _options.perpage;

		// 선택된 입점사
		
		var provider_list 	= _options.selectProviders || '';		// 선택된 입점사
		if(provider_list) params	= params + "&select_providers="+provider_list;

		// 선택된 상품 css 적용		
		if(typeof _options.select_broadcast != "undefined"){
			_options.select_broadcast = _options.select_broadcast.replace("[]","");
			_options.select_broadcast += "[]";
		}else{		
			_options.select_broadcast = "issueBroadcast[]";
		}
		var broadcasts_list			= new Array();
		if(typeof _options.selectFieldName != 'undefined'){
			var selectBroadcastsObj = $("."+_options.selectFieldName +"_list input[name='"+_options.select_broadcast+"']");
		}else if(typeof _options.selectBtnObj != 'undefined'){
			var selectBroadcastsObj = $(_options.selectBtnObj).parent().find("input[name='"+_options.select_broadcast+"']");
		}else{
			var selectBroadcastsObj = $("input[name='"+_options.select_broadcast+"']");
		}
		selectBroadcastsObj.each(function(e){broadcasts_list[e] = $(this).val();});
		var broadcasts_lists = unique(broadcasts_list);
		if(broadcasts_lists.length > 0) params	= params + "&select_broadcast="+broadcasts_lists.join('|');

		// 입점사 관리자 모드인지 체크
		if(typeof _options.sellerAdminMode == "undefined") _options.sellerAdminMode = '';

		if(_options.sellerAdminMode) params	= params + "&sellerAdminMode="+_options.sellerAdminMode;

		// 선택된 방송 종류 
		var select_status = $("form[name='displayManagerForm']").find("select[name='status']").val();
		params = params + "&select_status=" + select_status;

		if(typeof _options.parentCode == "undefined") _options.parentCode = '';
		params	= params + "&page=" +  page ;

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

		$("input[name='sc_keyword']").val("");
		_searchBroadcast(1);

	}

	/**
	 * 상품 선택 팝업 열기
	 */
	var _open = function (options,callback) {

		_setCallback(callback);
		_init(options);

		openDialog(_options.divSelectTitle, _options.divSelectLay, {"width":"95%","height":"500"});

		//라이브 방송 상태
		var select_status = $("form[name='displayManagerForm']").find("select[name='status']").val();
		var selector = "div#broadcast_search_container form";
		$(selector).find("input[name='select_search_status'][value="+select_status+"]").prop("checked",true);
		$(selector).find("input[name='select_status']").val(select_status);

		//기존에 선택한 방송
		var save_broadcasts = '';
		console.log($(".broadcast_list").find("input[name='issueBroadcast[]']"));
		$(".broadcast_list").find("input[name='issueBroadcast[]']").each(function(e){
			save_broadcasts += '|'+$(this).val();
		});
		$(selector).find("input[name='select_broadcast']").val(save_broadcasts);
	}

	/**
	 * 콜백 함수 지정
	 */
	var _setCallback = function (callback) {
		if (typeof callback === 'function') {
			callbackFun = callback;
		} else {
			callbackFun = _callbackBroadcastsList;
		}
	}

	/**
	 * 콜백함수 가져오기
	 */
	var _getCallback = function () {
		return callbackFun;
	}
	
	/**
	 * 전체선택/해제
	 */
	var _checkedClass = function(obj){
		if(_options.selectCnt != 'multi'){
			$('#'+ _options.divSelectLay+' input[name="select_broadcast_seq[]"]').not("input[value='"+obj.val()+"']").prop("checked",false);
		}else{
			if($(this).is(":checked") == true){
				$(this).closest("tr").addClass("bg-gray");
			}else{
				$(this).closest("tr").removeClass("bg-gray");
			}
		}
	}
	
	/**
	 * 전체선택/해제
	 */
	var _setCheckAll = function (obj) {
		if(_options.selectCnt != 'multi'){
			alert("전체 선택이 불가능합니다." + _options.selectCnt + "개만 선택해 주세요.");
			obj.prop("checked",false);
		}else{
			var chk = obj.is(":checked");
			$("#"+_options.divSelectLay+" .chk").attr("checked",chk).change();
			if(chk == "checked" || chk == true){
				$("#"+_options.divSelectLay+" .chk:checked").closest("tr").addClass("bg-gray");
			}else{
				$("#"+_options.divSelectLay+" .chk").closest("tr").removeClass("bg-gray");
			}
		}
	}

	var _keyDown = function(){

		selectLayer.keydown(function(key) {

			if (key.keyCode == 13) {
				alert("enter");
			}

		});

	}

	// 리스트에 뿌릴 때 이미 선택한 상품인지 체크
	var _selectCheck = function(){

	}

	//전체선택
	var _checkAll = function(_this){
		$type		= $(_this).val();
		var obj 	= $(_this).closest("div").parent().find("."+$type+"_list table .chk");
		obj.prop("checked", $(_this).is(":checked"));

	}

	// 선택한 상품 콜백으로 리턴
	var _submitSelectBroadcasts = function (){

		if($("#"+ _options.divSelectLay+" input[name='select_broadcast_seq[]']:checked").length < 1){
			alert("선택된 방송이 없습니다.");
			return false;
		}

		console.log("_submitSelectBroadcasts");

		var list = new Array();

		var _field_list = new Array("bsSeq","title","goodsNameFull","image","providerName");

		$("#"+ _options.divSelectLay + " input[name='select_broadcast_seq[]']").each(function(e){

			var obj			= $(this);
			if(obj.is(":checked") == true){

				var _broadcastData	= new Object();
				$.each(_field_list, function(e, key){ _broadcastData[key] = obj.attr("data-"+key); });

				list.push(_broadcastData);
		}
		});

		var jsonData 	= JSON.stringify(list);
		var callback 	= _getCallback();
		var res 		= true;

        if (callback) {
			if(typeof _options.selectFieldName != "undefined"){
	            res = callback (jsonData,_options.selectFieldName);
			}else{
	            res = callback (jsonData);
			}
        }

		if(res == true){
			if(_options.closeMessageUse == true && _options.closeMessage != ""){
				alert(_options.closeMessage.replace("{length}",list.length));
			}
			if(_options.autoClose == true) closeDialog(_options.divSelectLay);
		}
		//var listGoods = $("input[name='select_goods_list[]']");
	}

	// 상품 선택 삭제
	var _select_delete = function(mode,obj){

		console.log("_select_delete");

		var $selecter	= "";
		var default_len = 1;		//타이틀 row, 데이터없을 때 노출 row(hidden)

		if(mode == "minus"){
			$selecter 	= obj.closest('table');
			obj.closest("tr").remove();
			if($selecter.find("tr").length == default_len) $selecter.find("tr[rownum=0]").show();
		}else{

			$selecter 	= obj.closest("td").find('.goods_list table');

			if($selecter.find(".chk:checked").length < 1){
				alert("삭제할 방송을 먼저 선택하세요.");
				return false;
			}
			openDialogConfirm('선택한 방송을 삭제하겠습니까?',250,170,
				function(){
					$selecter.find(".chk:checked").each(function(){
						$(this).closest("tr").remove();
					});
					$selecter.parent().parent().find("input[name='chkAll'], input[name='chkall']").prop("checked",false);
					if($selecter.find("tr").length == default_len) $selecter.find("tr[rownum=0]").show();
				},
				function(){
					return false;
				}
			);
		}

	}

	var _callbackBroadcastsList = function(json){

		try
		{
			if(typeof json == ""){
				throw "선택한 방송 데이터가 비어 있습니다";
			}

			if(typeof json != "string"){
				throw "선택한 방송 데이터가 [type::String]이 아닙니다.";
			}

			var data = $.parseJSON(json);

			if(typeof data != "object"){
				throw "선택한 방송 데이터가 [type::Object]가 아닙니다.";
			}

			var html 		= "";
			var $_selector 	= "";
			
			if(typeof _options.selector != "undefined"){
				$_selector = $(_options.selector).parent().find(".broadcast_list");
			}else{
				$_selector = $(".broadcast_list");
			}
			
			$_selector.parent().removeClass("hide");
			$_selector.parent().parent().find(".span_select_goods_del").removeClass("hide");

			var broadcast_field_name = "issueBroadcast";
			if(typeof _options.select_broadcast != "undefined"){
				broadcast_field_name = _options.select_broadcast.replace("[]","");
			}

			// 이미 선택되어 있는 상품 배열화
			var save_broadcasts = new Array();
			$_selector.find("input[name='"+broadcast_field_name+"[]']").each(function(e){
				save_broadcasts[e] = $(this).val();
			});

			console.log("typeof : "+typeof _options.maxSelectBroadcasts);
			console.log("select_count : "+(save_broadcasts.length+data.length));

			if(typeof _options.maxSelectBroadcasts === "number" && (save_broadcasts.length+data.length) > _options.maxSelectBroadcasts) {
				throw "방송은 최대 "+_options.maxSelectBroadcasts+"개까지 선택 가능합니다.";
			}			

			if (typeof _options.makelistFun === 'string') {
				html = eval(_options.makelistFun+'(data, save_broadcasts, broadcast_field_name)');
			} else {
				html = defaultMakelist(data, save_broadcasts, broadcast_field_name);
			}

			$_selector.find("table").append(html);

			if($_selector.find("table").find("tr").length == 1){
				$_selector.find("table").find("tr[rownum=0]").show();
			}else{
				$_selector.find("table").find("tr[rownum=0]").hide();
			}
			return true;
		}
		catch (error)
		{
			alert(error);
			return false;
		}
	}

	// list 만드는 function 분리
	var defaultMakelist = function (data, save_broadcasts, broadcast_field_name) {
		var html = '';
		
		$.each(data, function(key, list){

			if(save_broadcasts.length > 0 && $.inArray(list.bsSeq,save_broadcasts) != -1){
			}else{			
				html += '<tr rownum="'+list.bsSeq+'">';
				html += '<td><div class="list_thumb fl"><img src="'+list.image+'"></div><div class="valign-middle left pdl55">'+list.title+'</div></td>';
				html += '<td>'+list.goodsNameFull+'</td>';
				html += '<td>'
				html += '<button type="button" class="btn_minus" onclick="gBroadcastSelect.select_delete(\'minus\',$(this))"></button>';
				html += '<input type="hidden" name="'+broadcast_field_name+'[]" value="'+list.bsSeq+'" />';
				html += '</td>';
				html += '</tr>';
			}
		});
		return html;
	}

		
	var _stripslashes = function (str) {
		str = str.replace(/\\'/g, '\'');
		str = str.replace(/\\"/g, '"');
		str = str.replace(/\\0/g, '\0');
		str = str.replace(/\\\\/g, '\\');
		return str;
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

		// 상품 검색
		searchBroadcast: _searchBroadcast,

		// 전체선택
		setCheckAll: _setCheckAll,

		//선택한 방송 전달
		submitSelectBroadcasts: _submitSelectBroadcasts,

		checkedClass: _checkedClass,

		keyDown: _keyDown,

		// 부모창 전체 선택
		checkAll:_checkAll,

		select_delete: _select_delete,
		callbackBroadcastsList: _callbackBroadcastsList,

		_stripslashes: _stripslashes,
		//창 닫기
		close: _close
	}

})();