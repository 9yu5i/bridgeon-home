/**
 * 기능설명			: 카테고리 선택 openDialog
 * 생성일 			: 2020.04.22
 * 호출 방법 		: gCategorySelect.open({options}, CallbackFunction, CallSelector)
 * 						options				: [선택]옵션
 *	 					CallbackFunction 	: [선택]콜백 함수 - 카테고리 선택 결과 처리 함수()
 *						CallSelector		: [선택]카테고리 선택 호출한 버튼 선택자
 * 주요 옵션
 * 		categoryType 	category, brand, location
 * 		openType 		popup(팝업으로 오픈), self(부모창에서 오픈)
 * 		selectMode 		category(카테고리/브랜드/지역 불러오기), lastCategory(최근 연결 카테고리/브랜드/지역 불러오기)
 * 		callPoint		스크립트 Call 요청 페이지 : category(카테고리관리), goods(상품페이지)
 * 수정내역
 * 		2020.07.22 [기능확장]상품등록/수정에서 카테고리/브랜드/지역 옵션 구분 추가
 * 		2020.12.30 callSelector 추가
*/

var gCategorySelect = (function () {

	var callbackFun		= function(){};
	var _options		= {};
	var oldCategoryType	= '';
	var callSelector	= $("body");

	var CategoryDefaults	= {
		width				: 750,
		height				: 560,
		openType			: 'popup',
		divSelectLay		: "lay_category_select",
		divSelectTitle		: "카테고리 선택",
		categoryUrl			: '/admin/goods/gl_select_category',
		selectMode			: 'category',
		method				: 'get',
		autoClose			: false,
		closeMessageUse		: true,
		closeMessage		: "{title}가 {length}개 선택되었습니다.",
		callPoint			: 'category',
		categoryType		: 'category',
	};

	var selectLayer			= "";

	var _getCategoryTitle = function(typecode){
		if(typeof typecode == 'undefined') typecode = _options.categoryType;
		categoryTitle = _options.categoryTitle;
		if(typecode == 'brand'){
			categoryTitle = "브랜드";
		}else if(typecode == 'location'){
			categoryTitle = "지역";
		}else{
			categoryTitle = "카테고리";
		}
		return categoryTitle;
	}

	/*
	 * 초기 세팅
	 */
	var _init = function (options,selector) {

		var layReset = false;		// 레이어 팝업 리셋

		if(typeof options == 'undefined') options = {'selectMode':''};
		if(_options.selectMode != options.selectMode) layReset = true;

		if(typeof options == 'undefined') options = {};

		_options		= $.extend(CategoryDefaults, options);
		selectLayer		= $("div#"+_options.divSelectLay);

		if(typeof _options.fieldName != "undefined"){
			_options.fieldName = _options.fieldName.replace("[]","");
			_options.fieldName += "[]";
		}else{		
			_options.fieldName = "issueCategoryCode[]";
		}

		if(typeof _options.listLay != "undefined"){
			_options.listLay = _options.listLay;
		}

		_options.categoryTitle = _getCategoryTitle();

		if(typeof selector != 'undefined'){
			callSelector = selector;
		}

		// 최초 호출
		if(typeof selectLayer.html() == "undefined" || selectLayer.html() == "" || selectLayer.html() == null) layReset = true;
		// 기존에 호출된 카테고리 타입과 다른 때 새로 불러오기
		if(oldCategoryType != _options.categoryType) layReset = true;

		if(layReset){

			_searchCategory();

			$('#'+_options.divSelectLay+" button.btnLayClose").on("click",function(){
				_close($('#'+_options.divSelectLay+" button.confirmSelectCategory"));
			});
			$('#'+_options.divSelectLay+" button.confirmSelectCategory").on("click",function(){
				_submitSelectCategory($(this));
			});

		}else{
		}

	}

	/**
	* 리스트 불러오기
	**/
	var _searchCategory = function () {
		//var params = {'openType':_options.openType,'selectMode':_options.selectMode,'fieldName':_options.fieldName,'divSelectLay':_options.divSelectLay};
		$.ajaxSetup({async:false});
		$.ajax({
			type	: _options.method,
			url		: _options.categoryUrl,
			data	: _options,
			success	: function(result){
				selectLayer.html(result);
				oldCategoryType = _options.categoryType;
				/* 카테고리/브랜드/지역 데이터 불러오기 */
				switch(_options.categoryType){
					case "brand"		:	_getBrand();	break;
					case "location"		:	_getLocation();	break;
					default 			:	_getCategory();	break;
				}
			}
		});
		$.ajaxSetup({async:true});
	}
	var _getBrand = function(){
	
		brand_admin_select_load('','select_brand1','');
		brand_admin_select_load('select_brand1','select_brand2','');
		brand_admin_select_load('select_brand2','select_brand3','');
		brand_admin_select_load('select_brand3','select_brand4','');
	
		$('#'+_options.divSelectLay+" select[name='select_brand1']").on("change",function(){
			brand_admin_select_load('select_brand1','select_brand2',$(this).val());
			brand_admin_select_load('select_brand2','select_brand3',"");
			brand_admin_select_load('select_brand3','select_brand4',"");
		});
		$('#'+_options.divSelectLay+" select[name='select_brand2']").on("change",function(){
			brand_admin_select_load('select_brand2','select_brand3',$(this).val());
			brand_admin_select_load('select_brand3','select_brand4',"");
		});
		$('#'+_options.divSelectLay+" select[name='select_brand3']").on("change",function(){
			brand_admin_select_load('select_brand3','select_brand4',$(this).val());
		});
	}
	var _getCategory = function(){
		
		category_admin_select_load('','select_category1','');
		category_admin_select_load('select_category1','select_category2','');
		category_admin_select_load('select_category2','select_category3','');
		category_admin_select_load('select_category3','select_category4','');
	
		$('#'+_options.divSelectLay+" select[name='select_category1']").on("change",function(){
			category_admin_select_load('select_category1','select_category2',$(this).val());
			category_admin_select_load('select_category2','select_category3',"");
			category_admin_select_load('select_category3','select_category4',"");
		});
		$('#'+_options.divSelectLay+" select[name='select_category2']").on("change",function(){
			category_admin_select_load('select_category2','select_category3',$(this).val());
			category_admin_select_load('select_category3','select_category4',"");
		});
		$('#'+_options.divSelectLay+" select[name='select_category3']").on("change",function(){
			category_admin_select_load('select_category3','select_category4',$(this).val());
		});
	
	}
	
	var _getLocation = function(){
		
		location_admin_select_load('','select_location1','');
		location_admin_select_load('select_location1','select_location2','');
		location_admin_select_load('select_location2','select_location3','');
		location_admin_select_load('select_location3','select_location4','');
	
		$('#'+_options.divSelectLay+" select[name='select_location1']").on("change",function(){
			location_admin_select_load('select_location1','select_location2',$(this).val());
			location_admin_select_load('select_location2','select_location3',"");
			location_admin_select_load('select_location3','select_location4',"");
		});
		$('#'+_options.divSelectLay+" select[name='select_location2']").on("change",function(){
			location_admin_select_load('select_location2','select_location3',$(this).val());
			location_admin_select_load('select_location3','select_location4',"");
		});
		$('#'+_options.divSelectLay+" select[name='select_location3']").on("change",function(){
			location_admin_select_load('select_location3','select_location4',$(this).val());
		});
	}

	/**
	* 검색 초기화
	**/
	var _reset = function (){

		_searchCategory();

	}

	/**
	 * 카테고리 선택 팝업 열기
	 */
	var _open = function (options,callback,selector) {
		if(typeof selector == 'undefined') selector = '';
		_setCallback(callback);
		_init(options,selector);


		if(_options.openType == 'popup'){
			openDialog(_options.divSelectTitle, _options.divSelectLay, {"width":_options.width,"height":_options.height});
		}

	}

	/**
	 * 콜백 함수 지정
	 */
	var _setCallback = function (callback) {
		if (typeof callback === 'function') {
			callbackFun = callback;
		} else {
			callbackFun = _callbackCategoryList;
		}
	}

	/**
	 * 콜백함수 가져오기
	 */
	var _getCallback = function () {
		return callbackFun;
	}

	var _keyDown = function(){

		selectLayer.keydown(function(key) {

			if (key.keyCode == 13) {
				alert("enter");
			}

		});

	}


	// 선택한 카테고리 콜백으로 리턴
	var _submitSelectCategory = function (obj){

		var oldOptions = obj.attr("data-opt");
		if(typeof oldOptions != 'undefined'){
			if(typeof oldOptions == 'string') oldOptions = $.parseJSON(oldOptions);
			_options		= $.extend(_options, oldOptions);
		}

		var list 		= new Array();
		var data 		= new Object();
		var selectCnt 	= 0;
		if(_options.selectMode == "lastCategory"){
			selectCnt = $("#"+ _options.divSelectLay+" form input[name='"+_options.categoryType+"LastRegist[]']:checked").length;
			$("#"+ _options.divSelectLay+" form").submit();
		}else{

			var cate1 = $("#"+ _options.divSelectLay+" select[multiple][name='select_"+_options.categoryType+"1']");
			var cate2 = $("#"+ _options.divSelectLay+" select[multiple][name='select_"+_options.categoryType+"2']");
			var cate3 = $("#"+ _options.divSelectLay+" select[multiple][name='select_"+_options.categoryType+"3']");
			var cate4 = $("#"+ _options.divSelectLay+" select[multiple][name='select_"+_options.categoryType+"4']");

			if(cate1.val() == null || cate1.val() == ''){
				alert("선택된 "+_options.categoryTitle+"(이)가 없습니다.");
				return false;
			}

			$.each(cate1.val(), function(key1, val1){

				data = {};		// 초기화

				if(typeof val1 == "undefined") val1 = "";

				var txt1 = cate1.children("option[value='"+val1+"']").text();

				data.select_category_val1 = val1;
				data.select_category_txt1 = txt1;
				if(_options.callPoint == "goods"){
					list.push(data);
				}

				if(cate2.val() != null && cate2.val() != ""){
					$.each(cate2.val(), function(key2, val2){
						
						data = {};		// 초기화

						if(typeof val2 == "undefined") val2 = "";
						
						var txt2 = cate2.children("option[value='"+val2+"']").text();
						data.select_category_val1 = val1;
						data.select_category_txt1 = txt1;
						data.select_category_val2 = val2;
						data.select_category_txt2 = txt2;
						if(_options.callPoint == "goods"){
							list.push(data);
						}

						if(cate3.val() != null && cate3.val() != ""){
							$.each(cate3.val(), function(key3, val3){

								data = {};		// 초기화

								if(typeof val3 == "undefined") val3 = "";

								var txt3 = cate3.children("option[value='"+val3+"']").text();

								data.select_category_val1 = val1;
								data.select_category_txt1 = txt1;
								data.select_category_val2 = val2;
								data.select_category_txt2 = txt2;
								data.select_category_val3 = val3;
								data.select_category_txt3 = txt3;
								if(_options.callPoint == "goods"){
									list.push(data);
								}

								if(cate4.val() != null && cate4.val() != ""){

									$.each(cate4.val(), function(key4, val4){

										data = {};		// 초기화

										if(typeof val4 == "undefined") val4 = "";

										var txt4 = cate4.children("option[value='"+val4+"']").text();

										data.select_category_val1 = val1;
										data.select_category_txt1 = txt1;
										data.select_category_val2 = val2;
										data.select_category_txt2 = txt2;
										data.select_category_val3 = val3;
										data.select_category_txt3 = txt3;
										data.select_category_val4 = val4;
										data.select_category_txt4 = txt4;
										list.push(data);
									});

								}else{
									if(_options.callPoint != "goods"){
										data.select_category_val4 = "";
										data.select_category_txt4 = "";
										list.push(data);
									}
								}
							});
						}else{
							if(_options.callPoint != "goods"){
								data.select_category_val3 = "";
								data.select_category_val4 = "";
								data.select_category_txt3 = "";
								data.select_category_txt4 = "";
								list.push(data);
							}
						}
					});
				}else{
					if(_options.callPoint != "goods"){
						data.select_category_val2 = "";
						data.select_category_txt2 = "";
						data.select_category_val3 = "";
						data.select_category_txt3 = "";
						data.select_category_val4 = "";
						data.select_category_txt4 = "";
						list.push(data);
					}
				}

			});

			selectCnt 		= list.length;

			var jsonData 	= JSON.stringify(list);
			var callback 	= _getCallback();

			if (callback) {
				if(typeof _options.selectFieldName == "undefined") _options.selectFieldName = "";
				if(typeof _options.applyNumber != "undefined" && _options.applyNumber != ""){
					callback (jsonData,_options.applyNumber,_options.selectFieldName);
				}else{
					callback (jsonData);
				}
			}
		}

		_options.closeMessageUse = (_options.closeMessageUse === 'true');
		if(_options.closeMessageUse === true && _options.closeMessage != ""){
			if(_options.categoryType == "location") _options.closeMessage = "{title}이 {length}개 선택되었습니다."; 
			alert(_options.closeMessage.replace("{title}",_options.categoryTitle).replace("{length}",selectCnt));
		}
		if(_options.autoClose == true) closeDialog(_options.divSelectLay);


	}

	var _select_delete = function(mode,obj){

		var $selecter	= "";
		var default_len = 2;		//타이틀 row, 데이터없을 때 노출 row(hidden)

		if(mode == "minus"){
			$selecter 	= obj.closest('table');
			var selectType 	= obj.attr("data-selecttype");
			if(_options.callPoint == "goods"){
				if(_categoryDeleteConfirm(obj)) obj.closest("tr").remove();
			}else{
				obj.closest("tr").remove();
			}
			_resetRowClass("."+selectType+"_list");
		}else{

			$selecter	= $("."+obj+"_list table");
			$("."+obj+"_list table .chk:checked").each(function(){
				$selecter.find("tr[rownum="+$(this).val()+"]").remove();
			});

			default_len = 1;
			_resetRowClass("."+obj+"_list");
		}

		if($selecter.find("tr").length == default_len){
			$selecter.find("tr[rownum=0]").show();

			if(mode == "chk"){
				$("."+obj+"_list_header input[name='chkAll']").prop("checked",false);
			}
		}

	}

	/* 상품상세에서 카테고리 삭제 시 */
	var _categoryDeleteConfirm = function(obj){

		var selectType 		= obj.attr("data-selectType");
		var connectField	= obj.closest("tr").find("input[data-Type='connect']").attr("name");
		var categoryTitle 	= _getCategoryTitle(selectType);

		var selector	= obj.closest("table").find("input:[name='"+connectField+"']");
		if (selector.length > 1) {
			if(obj.closest("tr").find("input:radio").is(":checked")){
				alert("대표 "+categoryTitle+" 변경 후 삭제해 주세요.");
				return false;
			}
		}else if(selector.length == 0){
			alert("잘못된 접근 입니다.");
			return false;
		}

		var ret		= true;
		var present	= obj.closest("tr").find("input[name='"+connectField+"']");
		var flag	= present.val();

		selector.each(function(idx){
			if ($(this).val().substring(0,flag.length) == flag && present.val().length < $(this).val().length)
				ret = false;
		});
		
		if (!ret) {
			alert("하위 "+categoryTitle+"(을)를 먼저 삭제하셔야 합니다.");
			return false;
		}

		return true;
	
	}

	// 콜백 :: 카테고리
	var _callbackCategoryList = function(json){

		try
		{
			if(typeof json == ""){
				throw "선택한 "+_options.categoryTitle+" 데이터가 비어 있습니다";
			}
			var data = json;
			if(typeof json != "object"){
				if(typeof json != "string"){
					throw "선택한 "+_options.categoryTitle+" 데이터가 [type::String]이 아닙니다.";
				}else{
					data = $.parseJSON(json);
				}
			}

			if(typeof data != "object"){
				throw "선택한 "+_options.categoryTitle+" 데이터는 [type::Object]가 아닙니다.";
			}

			// 이미 선택되어 있는 상품 배열화
			var save_category 	= new Array();
			var dataListLay		= '.category_list';
			var firstChekcField = "firstCategory";
			var html 			= "";
			var targetLay		= callSelector;

			if(_options.categoryType == 'brand'){
				firstChekcField = "firstBrand";
				dataListLay		= '.brand_list';
			}else if(_options.categoryType == 'location'){
				firstChekcField = "firstLocation";
				dataListLay		= '.location_list';
			}

			if(_options.listLay) {
				dataListLay		= _options.listLay;
			}

			$(dataListLay+" input[name='"+_options.fieldName +"']",targetLay).each(function(e){
				save_category[e] = $(this).val();
			});

			$.each(data, function(key, list){

				var category_code = list.select_category_val1;
				var category_text = list.select_category_txt1;
				
				if(list.select_category_val4 != "" && typeof list.select_category_val4 != 'undefined'){
					category_code = list.select_category_val4;
				}else if(list.select_category_val3 != "" && typeof list.select_category_val3 != 'undefined'){
					category_code = list.select_category_val3;
				}else if(list.select_category_val2 != "" && typeof list.select_category_val2 != 'undefined'){
					category_code = list.select_category_val2;
				}
				if(list.select_category_txt2 != "" && typeof list.select_category_txt2 != 'undefined'){
					category_text += " > " + list.select_category_txt2;
				}
				if(list.select_category_txt3 != "" && typeof list.select_category_txt3 != 'undefined'){
					category_text += " > " + list.select_category_txt3;
				}
				if(list.select_category_txt4 != "" && typeof list.select_category_txt4 != 'undefined'){
					category_text += " > " + list.select_category_txt4;
				}

				if($.inArray(category_code,save_category) == -1){
					html += '<tr rownum="'+category_code+'">';
					// 상품등록/수정모드일 떄
					if(_options.callPoint == "goods"){
						html += '	<td class="center"><label class="resp_radio"><input type="radio" name="'+firstChekcField+'" value="'+category_code+'" data-Type="connect"></td>';
					}
					html += '	<td class="left">'+category_text+'</td>';
					html += '	<td class="center">';
					html += '	<input type="hidden" name="'+_options.fieldName+'" value="'+category_code+'">';
					html += '	<button type="button" class="btn_minus" data-selecttype="'+_options.categoryType+'" seq="'+category_code+'" onClick="gCategorySelect.select_delete(\'minus\',$(this))"></button></td>';
					html += '</tr>';

					save_category[save_category.length] = category_code;
				}
			});

			$(dataListLay,targetLay).removeClass("hide");
			$(dataListLay+" table",targetLay).append(html);

			if(_options.callPoint == "goods"){
				if($(dataListLay+" input[name='"+firstChekcField +"']:checked",targetLay).length == 0){
					$(dataListLay+" input[name='"+firstChekcField +"']",targetLay).last().prop("checked",true);
				}
			}

			if($(dataListLay+" table",targetLay).find("tr").length == 2){
				$(dataListLay+" table",targetLay).find("tr[rownum=0]").show();
			}else{
				$(dataListLay+" table",targetLay).find("tr[rownum=0]").hide();
			}

			_resetRowClass(dataListLay,targetLay);

		}
		catch (error)
		{
			alert(error);
			return false;
		}
	}
	
	// 선택된 카테고리 갯수(row)에 따라 선택 영역 height값 조절
	var _resetRowClass = function(dataListLay,targetLay){
		var cnt = $(dataListLay+" table",targetLay).find("tr").length-2;
		if(cnt < 1) cnt = 1;
		if(cnt< 6){
			$(dataListLay,targetLay).removeClass("h1").removeClass("h2").removeClass("h3").removeClass("h4").removeClass("h5");
			$(dataListLay,targetLay).addClass("h"+cnt);
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

	// 창닫기
	var _close = function(obj){
		var oldOptions = obj.attr("data-opt");
		if(typeof oldOptions != 'undefined'){
			if(typeof oldOptions == 'string') oldOptions = $.parseJSON(oldOptions);
			_options		= $.extend(_options, oldOptions);
		}
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

		// 카테고리 검색
		searchCategory	: _searchCategory,
		_getBrand		: _getBrand,
		_getCategory	: _getCategory,
		_getLocation	: _getLocation,

		//선택한 카테고리 전달
		submitSelectCategory: _submitSelectCategory,

		_resetRowClass:_resetRowClass,

		setCheckAll:_setCheckAll,
		keyDown: _keyDown,
		select_delete: _select_delete,
		categoryDeleteConfirm:_categoryDeleteConfirm,
		callbackCategoryList:_callbackCategoryList,
		//창 닫기
		close: _close
	}

})();