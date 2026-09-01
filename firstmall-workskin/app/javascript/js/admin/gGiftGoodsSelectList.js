/**
 * Firstmall
 * 
 * Copyright (c) Gabia C&S Inc. All Rights Reserved.
 * 
 * @package	Firstmall
 * @author	Gabia C&S Inc.
 * @copyright	Copyright (c) Gabia C&S Inc. All Rights Reserved. (https://www.firstmall.kr)
 * @link	https://www.firstmall.kr
 * @filesource
*/

var gGiftGoodsSelect = (function () {

	var _callback		= null;
	var _options		= {};

	var GoodsDefaults	= {
		width				: 700,
		height				: 720,
		divSelectLay		: "lay_gift_select",
		divSelectTitle		: "사은품 선택",
		perpage				: 10,
		orderby				: 'g.goods_seq',
		sort				: 'desc',
		url					: '/admin/goods/gl_select_gift',
		giftListUrl			: '/admin/goods/gift_list',
		method				: 'get',
		goodsNameStrCut		: '20',
		autoClose			: false,
		closeMessageUse		: true,
		closeMessage		: "사은품이 {length}개 선택되었습니다.",
	};

	var selectLayer			= "";
	var selectLayerTitle	= "";

	/*
	 * 초기 세팅
	 */
	var _init = function (options) {

		_options		= $.extend(GoodsDefaults, options);

		selectLayer		= $("div#"+_options.divSelectLay);

		if (selectLayer.html() == "") {

			_searchGift(1);

			// 이벤트 설정
			$(document).on('click', '#'+ _options.divSelectLay+' .selectSearchButton', _searchGift);
			$(document).on('click', '#'+ _options.divSelectLay+'  input[name="chkAll"]', _setCheckAll);
			$(document).on('click', '#'+ _options.divSelectLay+' .btnLayClose', _close);
			$(document).on('click', '#'+ _options.divSelectLay+' .confirmSelectGift', _submitSelectGift);
			$(document).on('click', '#'+ _options.divSelectLay+' .paging_navigation a', _onPageClick);
			$(document).on('click', '#'+ _options.divSelectLay+' input[name="select_goods_seq[]"]', _checkedClass);

		}else{
			_reset();
		}

	}

	/**
	* 리스트 불러오기
	**/
	var _searchGift = function (page) {

		var params				= $("#"+ _options.divSelectLay+" form[name='searchGiftFrm']").serialize();

		params = params + "&perpage="+_options.perpage+"&&orderby="+_options.orderby+"&sort="+_options.sort;
		params = params + "&goods_name_strcut="+_options.goodsNameStrCut;
		
		if (typeof page == 'string') page *= 1;
		if (typeof page != 'number') page = 1;

		params		= params + "&page=" +  page ;

		// 선택된 입점사
		if(typeof _options.select_provider != "undefined"){
			params = params + "&select_provider="+_options.select_provider;
		}

		// 선택된 상품
		if(typeof _options.select_gift_goods != "undefined"){
			var goods_list			= new Array();
			$("input[name='"+_options.select_gift_goods+"']").each(function(e){goods_list[e] = $(this).val();});
			var goods_lists = unique(goods_list);
			if(goods_lists.length > 0) params	= params + "&select_gift_goods="+goods_lists.join('|');
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

		$("input[name='sc_goods_name']").val("");
		_searchGift(0);

	}

	/**
	 * 상품 선택 팝업 열기
	 */
	var _open = function (callback,options) {

		_setCallback(callback);
		_init(options);

		openDialog(_options.divSelectTitle, _options.divSelectLay, {"width":_options.width,"height":_options.height});

	}

	/**
	 * 콜백 함수 지정
	 */
	var _setCallback = function (callback) {
		if (typeof callback === 'function') {
			_callback = callback;
		} else {
			_callback = null;
		}
	}

	/**
	 * 콜백함수 가져오기
	 */
	var _getCallback = function (callback) {
		return _callback;
	}

	/**
	 * 페이지 이동 클릭
	 */
	var _onPageClick = function () {
		var page = $(this).attr("data-ci-pagination-page");
		page = (page - 1) * _options.perpage;
		_searchGift(page);
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


	// 선택한 상품 콜백으로 리턴
	var _submitSelectGift = function (){

		var list = new Array();

		$("#"+ _options.divSelectLay + " input[name='select_goods_seq[]']").each(function(e){

			if($(this).is(":checked") == true){
				var data = new Object();
				data.goods_seq		= $(this).val();
				if(_options.service_h_ad){
					data.provider_name		= $("#"+ _options.divSelectLay+" input[name='select_provider_name[]']").eq(e).val();
				}
				data.goods_name		= $("#"+ _options.divSelectLay+" input[name='select_goods_name[]']").eq(e).val();
				data.goods_name_cut	= $("#"+ _options.divSelectLay+" input[name='select_goods_name[]']").eq(e).attr("goodsstrcut");
				data.goods_code		= $("#"+ _options.divSelectLay+" input[name='select_goods_code[]']").eq(e).val();
				data.goods_price	= $("#"+ _options.divSelectLay+" input[name='select_goods_price[]']").eq(e).val();
				data.goods_img		= $("#"+ _options.divSelectLay+" input[name='select_goods_img[]']").eq(e).val();
				

				list.push(data);
			}
		});

		if($("#"+ _options.divSelectLay+" input[name='select_goods_seq[]']:checked").length < 1){
			alert("선택된 상품이 없습니다.");
			return false;
		}

		var jsonData = JSON.stringify(list);

        var callback = _getCallback();

        if (callback) {
            callback (_options.opt,jsonData);
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
		searchGift: _searchGift,

		// 전체선택
		setCheckAll: _setCheckAll,

		onPageClick: _onPageClick,

		//선택한 상품 전달
		submitSelectGift: _submitSelectGift,

		keyDown: _keyDown,

		select_delete: _select_delete,
		//창 닫기
		close: _close
	}

})();