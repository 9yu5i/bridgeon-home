/**
 * [공용]상품 선택 openDialog
 * gGoodsSelect.open({options},{CallbackFunction})
 * _options.select_goods 	: 선택된 상품 Field Name (default Name : issueGoods)
 * _options.selectCnt		: 상품 선택 갯수 제한 (multi, {number})
 **/

var gGoodsSelect = (function () {

	var callbackFun		= function(){};
	var _options		= {};

	var defaultOptions	= {
		width				: 1050,
		height				: 720,
		divSelectLay		: "lay_goods_select",
		divSelectTitle		: "상품 선택",
		perpage				: 10,
		pageblock			: 10,
		orderby				: 'goods_seq',
		sort				: 'desc',
		url					: '/admin/goods/gl_select_goods',
		method				: 'get',
		goodsNameStrCut		: '20',
		autoClose			: false,
		closeMessageUse		: true,
		closeMessage		: "상품이 {length}개 선택되었습니다.",
		selectCnt			: 'multi',
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

			_searchGoods(1);

			// 버튼 이벤트 설정
			$(document).on('submit', '#'+ _options.divSelectLay+' #selectGoodsFrm', _searchGoods);
			$(document).on('click', '#'+ _options.divSelectLay+' #selectSearchButton', _searchGoods);
			$(document).on('click', '#'+ _options.divSelectLay+'  input[name="chkAll"]', function(){ _setCheckAll($(this));} );
			$(document).on('click', '#'+ _options.divSelectLay+' .btnLayClose', _close);
			$(document).off('click', '#'+ _options.divSelectLay+' .confirmSelectGoods').on('click', '#'+ _options.divSelectLay+' .confirmSelectGoods', _submitSelectGoods);
			$(document).on('click', '#'+ _options.divSelectLay+' .paging_navigation a', _onPageClick);
			$(document).on('click', '#'+ _options.divSelectLay+' input[name="select_goods_seq[]"]', function(){ _checkedClass($(this));});

		}else{
			_reset();
		}

	}

	/**
	* 리스트 불러오기
	**/
	var _searchGoods = function (page) {

		var params				= '';

		if (typeof page == 'string') page *= 1;
		if (typeof page != 'number') page = 1;

		if(page > 1) page = (page - 1) * _options.perpage;

		// 선택된 입점사

		var provider_list 	= _options.selectProviders || '';		// 선택된 입점사
		if(provider_list) params	= params + "&select_providers="+provider_list;

		// 선택된 상품 css 적용
		if(typeof _options.select_goods != "undefined"){
			_options.select_goods = _options.select_goods.replace("[]","");
			_options.select_goods += "[]";
		}else{
			_options.select_goods = "issueGoods[]";
		}
		var goods_list			= new Array();
		if(typeof _options.selectFieldName != 'undefined'){
			var selectGoodsObj = $("."+_options.selectFieldName +"_list input[name='"+_options.select_goods+"']");
		}else if(typeof _options.selectBtnObj != 'undefined'){
			var selectGoodsObj = $(_options.selectBtnObj).parent().find("input[name='"+_options.select_goods+"']");
		}else{
			var selectGoodsObj = $("input[name='"+_options.select_goods+"']");
		}
		selectGoodsObj.each(function(e){goods_list[e] = $(this).val();});
		var goods_lists = unique(goods_list);
		if(goods_lists.length > 0) params	= params + "&select_goods="+goods_lists.join('|');

		// 입점사 관리자 모드인지 체크
		if(typeof _options.sellerAdminMode == "undefined") _options.sellerAdminMode = '';

		if(_options.sellerAdminMode) params	= params + "&sellerAdminMode="+_options.sellerAdminMode;

		if(typeof _options.parentCode == "undefined") _options.parentCode = '';
		params	= params + "&goods_name_strcut="+_options.goodsNameStrCut;
		params	= params + "&parentCode="+_options.parentCode;
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

		$("input[name='sc_goods_name']").val("");
		_searchGoods(1);

	}

	/**
	 * 상품 선택 팝업 열기
	 */
	var _open = function (options,callback) {
		_removeDummyDialog('ui-dialog-title-lay_goods_select');	
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
			callbackFun = _callbackGoodsList;
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
		_searchGoods(page);
	}


	/**
	 * 전체선택/해제
	 */
	var _checkedClass = function(obj){
		if(_options.selectCnt != 'multi'){
			$('#'+ _options.divSelectLay+' input[name="select_goods_seq[]"]').not("input[value='"+obj.val()+"']").prop("checked",false);
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

    // 테이블 상단 고정형 전체선택
    var _exceptCheckAll = function(_this){
		var $type = $(_this).val(),
		    obj = $(_this).closest("div").parent().siblings("."+$type+"_list").find("table .chk");

		obj.prop("checked", $(_this).is(":checked"));
	}

    // 테이블 상단 고정형 전체선택 해제
    var _exceptCheckToggle = function(el){
        $(el).on('click', '.chk', function(){
            if ( $(el).find('.chk').length > $(el).find('.chk:checked').length ){
                $(el).find('[name="chkAll"]').prop('checked', false);
            } else {
                $(el).find('[name="chkAll"]').prop('checked', true);
            }
        });
    }

	// 선택한 상품 콜백으로 리턴
	var _submitSelectGoods = function (){

		if($("#"+ _options.divSelectLay+" input[name='select_goods_seq[]']:checked").length < 1){
			alert("선택된 상품이 없습니다.");
			return false;
		}

		var list = new Array();

		var _field_list = new Array("goods_seq","provider_seq","provider_name","goods_name","goods_code","default_price","goods_kind","goods_img");

		$("#"+ _options.divSelectLay + " input[name='select_goods_seq[]']").each(function(e){

			var obj			= $(this);
			if(obj.is(":checked") == true){

				var _goodaData	= new Object();
				$.each(_field_list, function(e, key){ _goodaData[key] = obj.attr("data-"+key); });

				list.push(_goodaData);
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

		var $selecter	= "";
		var default_len = 1;		//타이틀 row, 데이터없을 때 노출 row(hidden)

		if(mode == "minus"){
			$selecter 	= obj.closest('table');
			obj.closest("tr").remove();
			if($selecter.find("tr").length == default_len) $selecter.find("tr[rownum=0]").show();
		}else{

			$selecter 	= obj.closest("td").find('.goods_list table');

			if($selecter.find(".chk:checked").length < 1){
				alert("삭제할 상품을 먼저 선택하세요.");
				return false;
			}
			openDialogConfirm('선택한 상품을 삭제하겠습니까?',250,170,
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

	var _callbackGoodsList = function(json){

		try
		{
			if(typeof json == ""){
				throw "선택한 상품 데이터가 비어 있습니다";
			}

			if(typeof json != "string"){
				throw "선택한 상품 데이터가 [type::String]이 아닙니다.";
			}

			var data = $.parseJSON(json);

			if(typeof data != "object"){
				throw "선택한 상품 데이터가 [type::Object]가 아닙니다.";
			}

			var html 		= "";
			var $_selector 	= "";
			var $_selector_summary 	= "";

			if(typeof _options.selector != "undefined"){
				$_selector = $(_options.selector).parent().find(".goods_list");
				$_selector_summary = $(_options.selector).parent().find(".goods_list_summary");
			}else{
				$_selector = $(".goods_list");
				$_selector_summary = $(".goods_list_summary");
			}

			$_selector.parent().removeClass("hide");
			$_selector.parent().parent().find(".span_select_goods_del").removeClass("hide");

			var goods_field_name = "issueGoods";
			if(typeof _options.select_goods != "undefined"){
				goods_field_name = _options.select_goods.replace("[]","");
			}

			var goods_list_display  = $_selector.attr("goods_list_display");		//일괄업데이트 > 상품리스트에서 '상품검색'

			// 이미 선택되어 있는 상품 배열화
			var save_goods = new Array();
			$_selector.find("input[name='"+goods_field_name+"[]']").each(function(e){
				save_goods[e] = $(this).val();
			});

			if(typeof _options.maxSelectGoods === "number" && (save_goods.length+data.length) > _options.maxSelectGoods) {
				throw "상품은 최대 "+_options.maxSelectGoods+"개까지 선택 가능합니다.";
			}

			if (typeof _options.makelistFun === 'string') {
				html = eval(_options.makelistFun+'(data, save_goods, goods_field_name)');
			} else {
				html = defaultMakelist(data, save_goods, goods_field_name,goods_list_display);
			}

			$_selector.find("table").append(html);

			if($_selector.find("table").find("tr").length == 1){
				$_selector.find("table").find("tr[rownum=0]").show();
				$_selector_summary.html('미설정');
			}else{
				$_selector.find("table").find("tr[rownum=0]").hide();
				$_selector_summary.html('설정됨');
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
	var defaultMakelist = function (data, save_goods, goods_field_name,goods_list_display) {
		var html = '';

		$.each(data, function(key, list){

			if(save_goods.length > 0 && $.inArray(list.goods_seq,save_goods) != -1){
			}else{
				list.goods_kind_img = "";
				if(list.goods_kind != ""){
					if(list.goods_kind == "package"){
						list.goods_kind_img = "<img src='../skin/default/images/design/icon_order_package.gif' align='absmiddle'>&nbsp;";
					}else if(list.goods_kind == "coupon"){
						list.goods_kind_img = "<img src='../skin/default/images/design/icon_order_ticket.gif' align='absmiddle'>&nbsp;";
					}
				}

				html += '<tr rownum="'+list.goods_seq+'">';
				if( goods_list_display == "hide_checkbox") {
					html += '	<td class="hide">';
				} else {
					html += '	<td class="center"><label class="resp_checkbox"><input type="checkbox" name="'+goods_field_name+'Tmp[]" class="chk" value="'+list.goods_seq+'" /></labal>';
				}
				html += '		<input type="hidden" name="'+goods_field_name+'[]" value="'+list.goods_seq+'" /><input type="hidden" name="'+goods_field_name+'Seq[]" value="" /></td>';
				if( goods_list_display != "hide_checkbox") {
					if(_options.service_h_ad == true && !_options.sellerAdminMode){
						html += '	<td class="center">'+_stripslashes(list.provider_name)+'</td>';
					}
				}

				html += '	<td class="left">';
				html += '		<div class="image"><img src="'+list.goods_img+'" class="goodsThumbView" width="50" height="50" /></div>';
				html += '		<div class="goodsname">';
				if(list.goods_code != ""){
					html += '		<div>[상품코드:'+list.goods_code+']</div>';
				}
				html += '		'+ list.goods_kind_img+'<a href="../goods/regist?no='+list.goods_seq+'" target="_blank">['+list.goods_seq+'] '+_stripslashes(list.goods_name)+'</a></div></td>';

				if( goods_list_display != "hide_checkbox") {
					html += '	<td class="right">'+get_currency_price(list.default_price,2)+'</td>';
				}
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

	// dummy ui-dialog 제거
	var _removeDummyDialog = function (chk_label) {
		$('body').find('div.ui-dialog').each(function(){
			if	($(this).attr('aria-labelledby') == chk_label && $('#lay_goods_select').html() == ""){
				$(this).children().remove();
			}
		});
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
		searchGoods: _searchGoods,

		// 전체선택
		setCheckAll: _setCheckAll,

        exceptCheckToggle: _exceptCheckToggle,

		onPageClick: _onPageClick,

		//선택한 상품 전달
		submitSelectGoods: _submitSelectGoods,

		checkedClass: _checkedClass,

		keyDown: _keyDown,

		// 부모창 전체 선택
		checkAll:_checkAll,

        // 테이블 상단 고정형 전체선택
        exceptCheckAll:_exceptCheckAll,

        // 테이블 상단 고정형 전체선택 해제
        exceptCheckToggle:_exceptCheckToggle,

		select_delete: _select_delete,
		callbackGoodsList: _callbackGoodsList,

		_stripslashes: _stripslashes,
		//창 닫기
		close: _close,

		// dummy ui-dialog 제거
		removeDummyDialog: _removeDummyDialog
	}
})();

$(function(){
    // 전체 선택 토글 (관련상품, 판매자 인기상품)
    var chkToggleRelative = gGoodsSelect.exceptCheckToggle('#relationGoodsSelectContainer');
    var chkToggleTrend = gGoodsSelect.exceptCheckToggle('#relationSellerGoodsSelectContainer');
});
