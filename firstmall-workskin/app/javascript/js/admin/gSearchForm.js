/**
 * [공용]검색
 * gSearchForm.open({CallbackFunction})
 * 검색우선순위 : 
 *			1. 검색모드(검색버튼 click)
 *			2. 저장된 검색 설정 값
 *				- 검색모드 상태에서는 검색편집을 통해 검색설정값을 저장하여도 실시간으로 검색결과에 반영되지 않음)
 *				- 저장된 검색 설정값은 최초 페이지 접속 시(검색버튼을 한번도 누르지 않은 상태)에만 반영 됨.
 * cannotBeReset 	= 1: 초기화 제외 필드
 * defaultValue		= 초기화 시 기본 지정 값(값이 존재할 경우)
*/
var gSearchForm = (function () {

	//
	var that				= this;
	var _callback			= null;
	var editor_mode			= 'close';	// 검색편집 클릭 시 상세검색과 액션 겹치지 않기 위한 값
	var _options			= {};
	var CategoryDefaults	= {
		pageid				: "",
		search_mode			: "",		//검색모드(검색버튼 클릭모드)
		search_field		: "",		//검색된 필드
		defaultPage			: 0,
		defaultPerpage		: 10,
		displayQuantityId	: 'display_quantity',
		divSelectLayId		: "search_container",
		getDefaultUrl		: "/admin/searchform/get_default_form",
		setDefaultUrl		: "/admin/searchform/save_search_form",
		getProviderUrl		: "/admin/searchform/get_provider",
		getShippingGroupUrl	: "/admin/event/ship_grp_ajax",
		sellerAdminMode		: false,
		formEditorUse		: false,	// 검색편집(검색설정저장 포함) 기능 사용여부
		searchFormEditView	: false,	// 검색편집 view 만 사용됨
		selectProviders		: '',		// 특정 입점사 검색(입점사 번호:selectbox에 해당 입점사만 노출)
	};

	/*
		* 초기 세팅
	*/
	var _init = function (options,callback) {

		_set_editor_mode('close');

		if(typeof callback != "undefined") _submitAction(callback);

		_options				= $.extend(CategoryDefaults, options);
		_options.divSelectLay	= "div#"+_options.divSelectLayId;
		_options.divSelector	= $(_options.divSelectLay);

		/* 검색편집을 사용하지 않는 곳에서는 무조건 검색모드 */
		if(_options.formEditorUse == false) _options.search_mode = 'search';
		if(typeof _options.sc != "undefined"){
			if(typeof _options.sc == "string") _options.sc = $.parseJSON(_options.sc);
			if(typeof _options.sc.search_mode != "undefined" && _options.sc.search_mode != '') _options.search_mode	= _options.sc.search_mode;
			if(typeof _options.sc.select_date != "undefined" && _options.sc.select_date != '') _options.select_date	= _options.sc.select_date;
		}else{
			_options.sc = {};
		}	
		// 호출된 부모창 코드 (입점사 commbobox 생성 유무 결정을 위해 사용함)
		// 상품 상세창에서 상품 사진 팝업 Open 후 상품 검색창 Open 시 commbobox 오류 발생.
		if(typeof _options.parentCode == "undefined") _options.parentCode = '';

		/* 입점사 검색 SelectBox 생성 */
		if($(_options.divSelectLay+" select[name='provider_seq_selector']").length > 0) _provider_setting('all');

		/* 한 페이지 보기 갯수 SelectBox 생성 */
		if(_options.displayQuantityId != "") _display_quantity(_options.displayQuantityId);
		
		/* 정렬기준 SelectBox 생성 */
		if(typeof _options.displaySort != "undefined" && _options.displaySort != null) _display_sort(_options.displaySort);

		if(_options.sellerAdminMode == true){
			_setSellerAdminLink();
		}
		_get_field_default();	// 검색 기본 필드 세팅
		_btn_event();			// 버튼 이벤트 세팅
		_checkbox_event();		// checkbox 
		_search_date_reset();	// 검색된 날짜 검색 옵션 선택
		_keyDown();
		_data_type_reset();	    // 통계 날짜타입 세팅 
	}

	var _set_editor_mode = function(mode){ editor_mode = mode; }
	var _get_editor_mode = function(){ return editor_mode; }

	var _setSellerAdminLink = function(){

		_options.getDefaultUrl			= "/selleradmin/searchform/get_default_form";
		_options.setDefaultUrl			= "/selleradmin/searchform/save_search_form";

	}

	/**
	 * 콜백 함수 지정
	 */
	var _submitAction = function (callback) {
		if (typeof callback === 'function') {
			_callback = callback;
		} else {
			_callback = null;
		}
	}

	/**
	 * 콜백함수 가져오기
	 */
	var _getSearchCallback = function (callback) { return _callback; }

	/**
	 * 콜백 함수 유무에 따라 submit 처리
	 */
	var doSubmit = function (selector){
		if (_callback) {
			_callback();
	   }else{
		   $(selector).submit();
	   }
	}

	/*
	button event 
	*/
	var _btn_event = function(){
		
		var btn = '<div>';

		if(_options.formEditorUse == true && _options.searchFormEditView == false){
			btn += '	<span class="sc_edit">';
			btn += '		<button type="button" class="search_form_edit resp_btn v3" mode="editor"><img src="/admin/skin/default/images/common/icon_search_setting.png"><span class="txt">검색 편집</span></button>';
			btn += '	</span>';
		}
		btn += '	<span class="search">';
		btn += '		<button type="button" class="search_submit resp_btn active size_XL">검색</button>';
		btn += '		<button type="button" class="search_reset resp_btn v3 size_XL">초기화</button>';
		btn += '	</span>';

		if(_options.formEditorUse == true){
			btn += '	<span class="edit hide">';
			btn += '		<button type="button" class="search_form_edit_save resp_btn active size_L">저장</button>';
			btn += '		<button type="button" class="search_form_edit_cancel resp_btn v3 size_L" mode="cancel">취소</button>';
			btn += '	</span>';
	
			btn += '<span class="detail">';
			btn += '	<button type="button" class="search_detail resp_btn v3"  mode="basic"><span class="txt">상세 검색</span><img src="/admin/skin/default/images/common/icon_search_detail_open.png"></button>';
			btn += '</span>';
			btn += '<span class="default hide">';
			btn += '	<button type="button" class="search_default resp_btn v3"><img src="/admin/skin/default/images/common/icon_search_reset.png"><span class="txt">기본설정</span></button>';
			btn += '</span>';
		}else{
			btn += '<span class="hide">';
			btn += '	<button type="button" class="search_detail resp_btn v3 hide"  mode="basic"><span class="txt">상세 검색</span><img src="/admin/skin/default/images/common/icon_search_detail_open.png"></button>';
			btn += '</span>';
		}
		btn += '</div>';

		$(_options.divSelectLay+" .search_btn_lay").html(btn);

		// 지정된 callback이 있을 땐 form submit 금지
		$(_options.divSelectLay + " form").on("submit",function(){
			if (_getSearchCallback()) { return false; }
		});

		$(_options.divSelectLay + " .search_submit").on("click",function(){

			if (_callback) {
				_callback();
			}else{
				_form_search($(this));
			}
		});

		$(_options.divSelectLay+" .search_detail").on("click",function(){
			_form_detail_view($(this));
		});

		$(_options.divSelectLay+" .select_date").on("click",function(){
			_search_date($(this),'click');
		});

		//검색편집 활성화, 검색편집취소
		$(_options.divSelectLay+" .search_form_edit").on("click",function(){
			_form_edit_mode($(this).attr("mode"));
		});

		$(_options.divSelectLay+" .search_form_edit_cancel").on("click",function(){
			_form_edit_mode($(this).attr("mode"));
		});

		//검색초기화
		$(_options.divSelectLay+" .search_reset").on("click",function(){
			_reset();
		});
		//검색편집저장
		$(_options.divSelectLay+" .search_form_edit_save").on("click",function(){
			_search_form_save();
		});
		//기본설정 불러오기(사용자 저장값 아님)
		$(_options.divSelectLay+" .search_default").on("click",function(){
			_get_field_default("default");
		});
		
		//검색편집 > 체크박스 선택/해제 시 필수항목 체크
		$(_options.divSelectLay+"  input[name='search_form_editor[]']").on("click",function(){
			_required_chk($(this));
		});
	
		// 날짜 변경 시 
		$(_options.divSelectLay+" .sdate,.edate").on("change",function(){
			_select_date_default($(this));
		});

		//월별, 일별, 시간별 날짜 선택 
		$(_options.divSelectLay+" .dateType input[type='radio']").on("change",function(){
			_date_type($(this).val());			
		});

		$(_options.divSelectLay+" .thisMonthBtn").on("click",function(){
			_data_type_default();
		});	
		
		$(_options.divSelectLay+" .todayBtn").on("click",function(){
			_data_type_default();
		});	

		_btn_default_viewer();	// 검색편집, 상세검색 노출 제어
	}

	// 검색편집, 상세검색 노출 제어
	var _btn_default_viewer = function(editor_mode){

		// 검색 전체 Row 수와 저장(관리자설정)된 검색 항목 Row수가 동일한지 체크 == 전체 검색항목을 보여주고 있는지 체크
		_options.allView = false;
		if(typeof _options.default_field == 'undefined' || _options.default_field == null) _options.default_field = {};

		if(_options.default_field.length == $(_options.divSelectLay +" .table_search tr input[name='search_form_editor[]']").length){
			_options.allView = true;
		}

		// 상세 검색 버튼 노출 제어 (전체 항목을 보여주고 있거나, 검색편집 모드일 때 숨김)
		if(_options.allView == true || editor_mode == "open"){
			$(_options.divSelectLay +" .search_btn_lay .detail").addClass('hide');				// 상세검색
		}else{
			$(_options.divSelectLay +" .search_btn_lay .detail").removeClass('hide');				// 상세검색
		}

		// 기본설정 버튼 노출 제어(검색편집 모드일 때 노출)
		if(editor_mode == "open" ){
			$(_options.divSelectLay +" .search_btn_lay .default").removeClass('hide');				// 기본설정
				$(_options.divSelectLay +" .sdate, .edate").val('');
				$(_options.divSelectLay +" .sdate, .edate").attr('disabled',true);
		}else{
			$(_options.divSelectLay +" .search_btn_lay .default").addClass('hide');				// 기본설정
				$(_options.divSelectLay +" .sdate, .edate").attr('disabled',false);	
		}

	}

	// form submit
	var _form_search = function(obj){
		if(typeof _options.searchFormId != 'undefined' && _options.searchFormId != null && _options.searchFormId != 'null'){
			var selector = _options.divSelectLay + " #" + _options.searchFormId;
		}else{
			var selector = _options.divSelectLay + " form";
		}
		$(selector).find("input[name='page']").val(_options.defaultPage);
		$(selector).find("input[name='searchflag']").remove();
		$(selector).find("input[name='search_form_editor[]']").prop("disabled",true);
		$(selector).find("input[name='searchcount']").prop("disabled",true);
		$(selector).find("input[name='search_field']").prop("disabled",true);
		$(selector).append("<input type='hidden' name='searchflag' value='1'/>");
		doSubmit($(selector));
	}
	
	var _set_search_field = function () {
		_options.default_value = _options.search_field;
		_set_field_view();
		_set_default_value();
	}
	/**
	* 검색설정 불러오기
	**/
	var _get_field_default = function (mode) {

		$(_options.divSelectLay+" input[name='pageid']").val(_options.pageid);

		if(typeof mode == "undefined") mode = "";

		$.ajaxSetup({async:false});
		$.ajax({
			type	: 'get',
			url		: _options.getDefaultUrl,
			data	: {'pageid':_options.pageid,'mode':mode},
			success	: function(res){
				if(res != null){

					res 			= $.parseJSON(res);
					_default_value 	= res.default_value;

					if(typeof res.searchEditUse == 'undefined' || $.inArray(res.searchEditUse,['false', null,'null']) != -1){
						res.searchEditUse			= false;
						_options.formEditorUse		= false;
					}

					if(res.searchEditUse != false) _options.formEditorUse = true;

					// 검색편집 사용할 경우
					if(_options.formEditorUse == true){

						// 검색편집 checkbox 세팅 - 위치변경 하지 말 것. 검색변경 사용 시 최우선 세팅되어야 함.
						_set_search_form_editor();

						_options.required_field = res.required;		// 검색 필수 필드 세팅
						_set_field_required();

						if(res.default_field != null && res.default_field != 'null'){ // (저장된) 검색 기본 필드 세팅
							if(Array.isArray(res.default_field) == false && res.default_field != 'all'){
								res.default_field = $.parseJSON(res.default_field);

							}
							_options.default_field = res.default_field;
						}
					}else{
						/* 검색편집을 사용하지 않는 곳에서는 무조건 검색모드 */
						_options.search_mode = 'search';
					}

					// 기본 검색값 세팅 :: 기본설정버튼, 초기화버튼은 config 에서 가져옴 이 외는 db에 저장된 사용자값으로 설정
					if(typeof _default_value == "undefined") _default_value = "";
					if(_default_value != null && _default_value != 'null'){
						if(Array.isArray(_default_value) == false && typeof _default_value != 'object'){
							_default_value = $.parseJSON(_default_value);
						}						
					}

					// 기본설정 클릭 시
					if(mode == "default"){
						
						// config 기본값을 사용하게 설정
						_options.default_value = _default_value;
						
						_reset();
						_set_field_default();
						_set_default_value();
					}else if(mode == "reset"){ // 초기화 버튼 클릭 시
						
						// config 기본값을 사용하게 설정
						_options.default_value = _default_value;

						_reset();
						_set_default_value();

					}else if(mode == "editor"){ // 검색 편집 모드일때

						// config 기본값을 사용하게 설정
						_options.default_value = _default_value;

						_reset();
						_set_field_default();
						_set_field_view(mode,res.searchEditUse);
						_set_default_value();

					}else{

						// 검색필드 노출
						_set_field_view(mode,res.searchEditUse);

						// 직접 검색모드는 검색버튼 클릭 시 동작하며, search_flag:1 조건으로 들어온다
						if(_options.sc.searchflag == '1'){
							_set_default_value(_options.sc);
						}else{
							_options.default_value = _default_value ;
							_set_default_value();
						}
					}
				}
			}
		});
		$.ajaxSetup({async:true});
	}

	/* 검색편집 체크박스 세팅 */
	var _set_search_form_editor = function(){
		$(_options.divSelectLay +" .table_search tr").each(function(){
			var obj = $(this);
			var fid = obj.attr('data-fid');

			if(typeof fid == 'undefined') return;

			var pattern = new RegExp('search_form_editor');
			if(pattern.test(obj.find('th').html()) == false) {
				obj.find('th span').before('<label class="resp_checkbox hide"><input type="checkbox" name="search_form_editor[]" value="'+fid+'" class="hide"></label>');
			}
		});
	}

	/*
	필수항목 세팅
	*/
	var _set_field_required = function(){
		if(typeof _options.required_field != 'undefined' && _options.required_field != null){
			$.each(_options.required_field,function(key,data){
				$(_options.divSelectLay +" .table_search tr input[name='search_form_editor[]'][value='"+data+"']").prop("checked",true).prop("required","required").addClass('hide');
			});
		}
	}

	// 검색 저장 값 세팅 -1
	var _set_default_value = function(defaultValue_){
		if(typeof defaultValue_ == 'undefined'){
			if(typeof _options.default_value != 'undefined') defaultValue_ = _options.default_value; else defaultValue_ = null;
		}

		if(defaultValue_ != '' && defaultValue_ != null){
			$.each(defaultValue_,function(key,value){
				if(value != null){
					if(Array.isArray(value)){
						$.each(value,function(key2,value2){
							_value_setting(key+"[]",value2,key2);
							if(value2 == 'all'){ return false; }
						});
					}else{
						_value_setting(key,value);
					}
				}
			});
		}

		// 값 세팅 후 날짜 영역 설정
		_search_date_reset();
	}

	// 검색 저장 값 세팅 - 2
	var _value_setting = function(key_,value_,key2_){

		var type_	= $(_options.divSelectLay +" input[name='"+key_+"']").attr("type");

		if(typeof type_ == 'undefined') type_ = "select"; 
		if(typeof key2_ == 'undefined') key2_ = '';

		// 검색 설정 저장 예외 필드 noSaveData
		if($(_options.divSelectLay +" input[name='"+key_+"']").attr('noSaveData') == '1') return false;

		type_ = type_.toUpperCase();

		switch(type_){
			case 'HIDDEN':
				if(key2_ == ''){		// hidden
					$(_options.divSelectLay +" input[name='"+key_+"']").val(value_);
				}else{
					$(_options.divSelectLay +" input[name='"+key_+"']").eq(key2_).val(value_);
				}
			case 'TEXT':
				if(key2_ == ''){		// textbox
					$(_options.divSelectLay +" input[name='"+key_+"']").val(value_);
				}else{
					$(_options.divSelectLay +" input[name='"+key_+"']").eq(key2_).val(value_);
				}
			break;
			case "RADIO":	// radiobox,checkbox			
				if(value_ == "unchecked"){
					$(_options.divSelectLay +" input[name='"+key_+"'][value='"+value_+"']").prop("checked",false);
				}else{
					$(_options.divSelectLay +" input[name='"+key_+"'][value='"+value_+"']").prop("checked",true);
				}
			break;
			case "CHECKBOX":	// radiobox,checkbox
			
				if(value_ == 'all'){	//전체선택일 때 
					$.each($(_options.divSelectLay +" input[name='"+key_+"']"),function(key3){
						$(_options.divSelectLay +" input[name='"+key_+"']").eq(key3).prop("checked",true);
					});
				}else if(value_ == "unchecked"){
					$(_options.divSelectLay +" input[name='"+key_+"'][value='"+value_+"']").prop("checked",false);
				}else{
					$(_options.divSelectLay +" input[name='"+key_+"'][value='"+value_+"']").prop("checked",true);
				}
				break;
			case "SELECT":
				// selectbox
				if(key2_ == ''){					
					if($(_options.divSelectLay +" select[name='"+key_+"'] option").eq(0).text() != "전체") 
						$(_options.divSelectLay +" select[name='"+key_+"']").find("option[value='"+value_+"']").attr("selected",true);
					if(key_ == "provider_seq_selector"){
						var _val = $(_options.divSelectLay +" select[name='"+key_+"'] option:selected").text();
						$(_options.divSelectLay +" select[name='"+key_+"']").next(".ui-combobox").children("input").val(_val);
					}
				}else{
					$(_options.divSelectLay +" select[name='"+key_+"']").eq(key2_).find("option[value='"+value_+"']").attr("selected",true);
				}
			break;
		}
		
	}

	/**
	* 검색편집 저장
	**/
	var _search_form_save = function(){
		// 검색 설정 저장 예외 필드 noSaveData 추가
		var fdata	= $(_options.divSelectLay+" form").find('input, select').not("[noSaveData]").serialize()
		fdata += "&pageid="+_options.pageid;
		$.ajaxSetup({async:false});
		$.ajax({
			type	: 'POST',
			url		: _options.setDefaultUrl,
			data	: fdata,
			success	: function(res){
				if(Array.isArray(res) == false){
					res = $.parseJSON(res);
				}

				if(res.result == 'fail'){
					alert(res.message);
					return false;
				}else if(res != null && res.result == 'success'){

					if(res.default_field == '' || res.default_field == null){
						_options.default_field = res.default_field;
						if(_options.default_field == null){
							alert('설정이 저장되었으나 정상적으로 불러오지 못했습니다');
							return false;
						}
					}else{
						if(Array.isArray(res.default_field) == false){
							res.default_field = $.parseJSON(res.default_field);
						}
						_options.default_field = res.default_field;
					}
					_options.default_value = res.default_value;
					_form_edit_mode('save');		//editor 모드 해제
					_set_field_view();			//설정필드 재세팅
					_set_default_value();		//설정필드값 재세팅
				}
			}
		});
		$.ajaxSetup({async:true});
	}

	/*
	필수항목 체크
	*/
	var _required_chk = function(obj){
		if(obj.attr("required") && obj.is(":checked") == false){
			//alert("검색 필수항목은 선택 해제할 수 없습니다.");
			obj.prop("checked",true);
			return false;
		}
	}

	var _jsonParse = function(data){

		//res
		return data;
	}

	/*
		기본 검색필드 세팅
	*/
	var _set_field_default = function(){

		$(_options.divSelectLay +" .table_search tr input[name='search_form_editor[]']").prop("checked",false);

		if( typeof _options.default_field != 'object' && $.inArray(_options.default_field,['all', null,'null']) != -1) {
			return false;
		}

		if(typeof _options.default_field != 'undefined' ){
			$.each(_options.default_field,function(key,data){
				$(_options.divSelectLay +" .table_search tr input[name='search_form_editor[]'][value='"+data+"']").prop("checked",true);
			});
			return false;
		}

	}

	/*
		기본 검색(ROW) 노출 설정 세팅 
	*/
	var _set_field_view = function(mode,searchEditUse){

		var _row_editor = $(_options.divSelectLay +" .table_search tr input[name='search_form_editor[]']");

		if(mode == "editor"){
		}else{
			_row_editor.addClass('hide');
		}

		//if(typeof searchEditUse == "undefined" || searchEditUse == true) $(_options.divSelectLay +" .table_search tr").addClass('hide');

		if(_options.formEditorUse == false){
			$(_options.divSelectLay +" .table_search tr").not("tr.disable").removeClass('hide');
		}else{
			if(typeof _options.default_field != 'undefined' && _options.default_field != null){
				_row_editor.each(function(){
						
					var field_label = $(this).not("input[required='required']").parent().parent().find("label");
					var field_title = $(this).not("input[required='required']").parent().parent().find("span");
					if(mode == "editor"){
						field_title.hide();
						field_label.show();

						field_title_html = field_title.html();
						if (field_title_html) {
							// 타이틀에 () 포함된 경우 정규식 예외처리
							field_title_html = field_title_html.replace(/\(/,"\\(").replace(/\)/,"\\)");
							var pattern = new RegExp(field_title_html);
							if(pattern.test(field_label.html()) == false) field_label.append(field_title.html());
						}
					}else{
						field_title.show();
						field_label.hide();						
					}

					if($.inArray($(this).val(),_options.default_field) != -1 || _options.fix_field == $(this).val()){
						$(this).closest("tr").not("tr.disable").removeClass('hide');
					}else{
						$(this).closest("tr").addClass('hide');
					}
				});
			}
		}
	}

	/*
		입점사 리스트 세팅
	*/
	var _provider_setting = function(period){

		var data 				= {};
		var $selector 			= $(_options.divSelectLay+" select[name='provider_seq_selector']");
		var mode				= $selector.attr("data-mode");
		var select_provider_seq	= 0;		// 검색된 입점사 번호
		var select_provider_cnt = 100;		// 부모창으로부터 선택된 입점사 갯수 (일반 검색창에서는 전체 입점사를 불러오기 위한 기본값 100개 임의 지정.)

		if(_options.sellerAdminMode == true){
			data.selleradmin = true;
		}
		// gSearchForm 호출 시 옵션(selectProviders) 에 정의된 입점사만 selectbox에 노출
		// 쿠폰/프로모션/이벤트/패키지 상품연결 등 으로부터 open 될 경우 사용 됨.
		var select_providers 	= _options.selectProviders || '';		// 선택된 여러개의 입점사

		if(typeof period == 'undefined') period = 'all';
		if(select_providers != ''){
			data.select_providers 	= select_providers.split('|');
			select_provider_cnt		= data.select_providers.length;
			period 					= '';
		}else{
			data.select_providers = null;
		}

		// 입점사 항목 검색 결과 selected 처리
		if(select_provider_seq == '') select_provider_seq = _options.sc.provider_seq || 0;

		/* 입점사리스트에서는 본사 노출 안함 */
		var adminListView = true;
		if($.inArray(_options.pageid,['provider_catalog']) != -1  || (select_provider_cnt > 0 && data.select_providers != null && $.inArray('1',data.select_providers) == -1)){
			adminListView 	= false;
			period 			= '';
		}

		$selector.find("option").remove();

		if(_options.sellerAdminMode != true){
			var selected = '';
			if(select_provider_cnt > 1){
				if(select_provider_seq == 0) selected = ' selected';
				$selector.append('<option value="all"'+ selected +'>입점사 검색</option>');
			}
			if(period == 'all' || adminListView == true ){
				selected = '';
				if(select_provider_seq == 1) selected = ' selected';
				$selector.append('<option value="1"'+ selected +'>본사</option>');
			}
		}

		/* 정산 : 정산주기 포함 데이터 불러오기 */
		if(mode == "account"){
			_options.getProviderUrl = '../accountall/get_provider_for_period';
			data.period 			= period;
			data.mode 				= 'json';
		}
		var provider_list = "";

		if(select_provider_cnt > 0){
			$.ajaxSetup({async:false});
			$.ajax({
				type	: 'GET',
				url		: _options.getProviderUrl,
				data	: data,
				success	: function(res){

					if(Array.isArray(res) == false) res = $.parseJSON(res);
					if(res == '' || res == null || res == 'null') return;

					var selectOption = '';
					$.each(res, function(key,list){

						var selected 	= '';
						var pay_period 	= '';

						if(list.provider_seq == select_provider_seq){ selected = " selected"; }
						if(mode == "account" && typeof list.calcu_count != "undefined") pay_period = ' pay_period='+list.calcu_count;

						selectOption = '<option value="'+list.provider_seq+'"'+pay_period + ''+ selected+'>'+list.provider_name+'('+list.provider_id+')</option>';
						$selector.append(selectOption);

					});
				}
			});
			$.ajaxSetup({async:true});
		}

		if(_options.parentCode != "goods"){
			_set_provider_selector($selector);
		}
		$selector.trigger("change");
	}


	/*
		입점사 선택
	*/
	var _set_provider_selector = function(obj){

		/* 입점사 select commbobox 생성 */
		obj.combobox().change(function(){

			var provider_seq	= obj.find("option:selected").val();  // provider selectbox value
			var provider_name	= $("option:selected",obj).text();
			var providerSeqObj 	= $(_options.divSelectLay +" input[name='provider_seq']");
			var providerNameObj = $(_options.divSelectLay +" input[name='provider_name']");

			if(typeof provider_seq == "undefined" || provider_seq == ''){ provider_seq = 'all' ; }
			if(provider_seq == 'all') provider_name	= '';

			if( provider_seq > 0 ){
				providerSeqObj.val(provider_seq);
				if(typeof providerNameObj != "undefined") providerNameObj.val(provider_name);

				var relation_ = providerSeqObj.attr("relation");
				if(typeof relation_ != 'undefined'){
					if(relation_ == 'ship_grp') _provider_shipping_group(provider_seq);
				}

			}else{
				providerSeqObj.val('');
				if(typeof providerNameObj != "undefined") providerNameObj.val('');
				//입점사 배송그룹 초기화 후 숨김
				if(typeof $(_options.divSelectLay +" select[name='ship_grp']") != "undefined"){
					$(_options.divSelectLay +" select[name='ship_grp'] option").not("option[value='']").remove();
					$(_options.divSelectLay +" .ship_grp").addClass('hide');
				}
			}
		})
		.next(".ui-combobox").children("input")
		.bind('focus',function(){
			if($(this).val() == obj.find("option:first-child").text()){
				$(this).val('');
			}
		});

	}

	/*
	선택한 입점사의 배송그룹 
	*/
	var _provider_shipping_group = function(provider_seq){

		var src_ship_grp	= $(_options.divSelectLay +" select[name='ship_grp']").attr("val");
	

		// 배송그룹 검색
		$.ajax({
			type	: 'GET',
			url		: _options.getShippingGroupUrl,
			data	: {'provider_seq':provider_seq},
			dataType: 'json',
			success: function(res){
				$(_options.divSelectLay +" select[name='ship_grp']").html('<option value="">배송그룹 선택</option>');
				$.each(res, function(){
					var selected		= '';
					if(this.shipping_group_seq == src_ship_grp)	selected = 'selected';
					var opt = '<option value="' + this.shipping_group_seq + '" '+selected+'>' + this.shipping_group_name + '</option>'
					$(_options.divSelectLay +" select[name='ship_grp']").append(opt);
				});
			}
		});
		$(_options.divSelectLay +" .ship_grp").removeClass('hide');
	}

	/*
		상세검색
	*/
	var _form_detail_view = function(obj){

		if(typeof obj == "undefined"){
			var obj = $(_options.divSelectLay +" .search_detail");
		}

		if(obj.attr("mode") == "basic"){
			obj.html('<span class="txt">상세 검색</span><img src="/admin/skin/default/images/common/icon_search_detail_close.png">');
			obj.attr("mode","detail");
			$(_options.divSelectLay +" .table_search tr").removeClass('hide');
		}else{
			obj.html('<span class="txt">상세 검색</span><img src="/admin/skin/default/images/common/icon_search_detail_open.png">');
			_set_field_view();
			obj.attr("mode","basic");
		}
	}

	/*
	검색편집
	: 활성화 시 저장된 검색설정 값으로 세팅
	*/
	var _form_edit_mode = function(mode){

		$(_options.divSelectLay +" .table_search tr input[name='search_form_editor[]']").removeClass('hide');

		if(typeof mode == "undefined") mode = "editor"; 

		// 검색편집 모드
		if(_get_editor_mode()  == 'close'){
			//기본검색필드 선택
			if(typeof _options.default_field != 'undefined' && $.inArray(_options.default_field,['all', null,'null']) != -1 ){
				$.each(_options.default_field,function(key,data){
					$(_options.divSelectLay +" input[name='search_form_editor[]'][value='"+data+"']").prop("checked","checked");
				});
				_set_editor_mode('close');
				$(_options.divSelectLay+" .select_date.on").trigger('click');
			}
			_options.search_field = _serializeObject($(_options.divSelectLay+" form.search_form"));	//현재 form 입력값 저장.(검색편집 취소시 사용)
			$(_options.divSelectLay +" .search_btn_lay .search_detail").attr("mode","basic");
			_get_field_default(mode);

			_set_editor_mode('open');

		// 검색편집 모드해제(취소)
		}else{
			if(mode != "save") _set_search_field();

			_set_editor_mode('close');
		}

		$(_options.divSelectLay +" .search_btn_lay .search").toggle();					// 검색/초기화 버튼
		$(_options.divSelectLay +" .search_btn_lay .edit").toggle();					// 저장/취소 버튼
		$(_options.divSelectLay +" .search_btn_lay .search_form_edit").toggle();		// 검색편집 버튼 
		$(_options.divSelectLay +" .search_btn_lay .search_detail").trigger("click");

		_btn_default_viewer(_get_editor_mode());
	}

	/**
	* 검색 초기화
	**/
	var _reset = function (){

		var input_radio 	= [];
		var except_field 	= ['search_form_editor[]','page','orderby','perpage'];		// 초기화 제외

		$(_options.divSelectLay +" input").each(function(){

			var type_ 			= $(this).attr("type");
			var name_ 			= $(this).attr("name");
			var cannotBeReset 	= $(this).attr("cannotBeReset");
			var defaultValue 	= $(this).attr("defaultValue");

			if(typeof type_ == "undefined") 		type_ 			= "NONE";
			if(typeof name_ == "undefined") 		name_ 			= "";
			if(typeof cannotBeReset == 'undefined') cannotBeReset 	= '';
			if(typeof defaultValue == 'undefined') 	defaultValue 	= '';

			if(cannotBeReset == '' &&  $.inArray(name_,except_field) == -1){

				type_ = type_.toUpperCase();

				switch(type_){
					case "TEXT":
					case "HIDDEN":
						// 조회기간 날짜 선택 : 기본값으로 초기화
						if(typeof $(this).attr("selectDate") != 'undefined' && $(this).attr("selectDate") == '1'){
							$(this).closest("div").find("input.select_date[range='"+defaultValue+"']").trigger("click");
						}else{
							$(this).val(defaultValue);
						}
					break;
					case "CHECKBOX":
						if(defaultValue === 'true'){
							$(this).prop("checked", true);
						}else{
							$(this).prop("checked", false);
						}
						$(".colorMultiCheck").trigger("click",['unchecked']);
					break;
					case "RADIO":
						if($.inArray(name_,input_radio) == -1){ input_radio.push(name_); }	

					break;
					case "NONE":
						// nothing
					break;
				}
			}


		});

		$(_options.divSelectLay +" input[name='perpage']").val(_options.defaultPerpage);

		$(_options.divSelectLay +" input[type='button'][range='all']").trigger('click');

		$.each(input_radio,function(key,data){
			$(_options.divSelectLay +" input[name='"+data+"']:not(:disabled)").eq(0).prop("checked",true);
			if(data=="date_type")_data_type_reset();
			if(data=="sc_type") $(_options.divSelectLay +" input[name='"+data+"']:not(:disabled)").eq(0).trigger("click");

		});
		$(_options.divSelectLay +" select").each(function(){
			
			var name_ 			= $(this).attr("name");
			var cannotBeReset 	= $(this).attr("cannotBeReset");
			var defaultValue 	= $(this).attr("defaultValue");
			
			if(typeof cannotBeReset == 'undefined') cannotBeReset = '';
			if(typeof defaultValue == 'undefined') defaultValue = '';

			if(cannotBeReset == '' &&  $.inArray(name_,except_field) == -1){
				if($(_options.divSelectLay +" select[name='"+name_+"']").length > 1){
					$(_options.divSelectLay +" select[name='"+name_+"']").each(function(){
						if(defaultValue == ''){
							$(this).find("option:eq(0)").prop("selected","selected");
						}else{
							$(this).find("option[value='"+defaultValue+"']").prop("selected","selected");
						}
					});
				}else{
					if(defaultValue == ''){
						$(_options.divSelectLay +" select[name='"+name_+"'] option:eq(0)").prop("selected","selected");
					}else{
						$(this).find("option[value='"+defaultValue+"']").prop("selected","selected");
					}

					switch(name_){
						case "provider_seq_selector":
							var _val = $(_options.divSelectLay +" select[name='"+name_+"'] option:selected").text();
							$(_options.divSelectLay +" select[name='provider_seq_selector']").next(".ui-combobox").children("input").val(_val);
						break;
						case "ship_grp":
							$(_options.divSelectLay +" .ship_grp").addClass('hide');
							$(_options.divSelectLay +" select[name='ship_grp']").find("option").remove();
						break;
					}
				}
			}

			if(name_=="sc_date_type"||name_=="sc_month_type")$(this).trigger('change');				
		
		});
	}

	

	var _keyDown = function(){

		_options.divSelector.keydown(function(key) {
			if (key.keyCode == 13) {
				$(_options.divSelectLay + " .search_submit").trigger('click');
			}
		});

	}


	/* checkbox checked event */
	var _checkbox_event = function(){

		var allChkEvent = $(_options.divSelectLay +" input:checkbox.chkall");
		if(typeof allChkEvent == 'undefined' || allChkEvent.length == 0) return ;
		
		var chkObj			= new Array();
		var chkEventList	= new Array();
		var chkClassList	= new Array();
		var chkOperatorList = new Array();
		allChkEvent.each(function(e){
			chkObj[e]			= $(this);
			chkEventList[e]		= $(this).attr("name");
			chkClassList[e]		= $(this).attr('data-group');
			chkOperatorList[e]	= $(this).attr("data-selector");

			if(chkClassList[e] !== ''){
				$(this).addClass(chkClassList[e]);
			}

		});

		$.each(chkEventList,function(key_,name_){
			
			// selector 비교 인자값을 받음
			var operator_ = chkOperatorList[key_];
			if(typeof operator_ == 'undefined' || operator_.length == 0) operator_ = '';

				// 지정된 그룹이 있으면 해당 그룹값을 class로 지정
				var classSelector_ = chkClassList[key_];
				if(typeof classSelector_ == 'undefined' || classSelector_.length == 0) classSelector_ = '';

				var chkBlockList		= null;
				var chkBlockListChecked = 0;

				if(classSelector_ !== ''){
					chkBlockList = $(_options.divSelectLay +" input."+classSelector_+":checkbox");
					chkBlockListChecked = $(_options.divSelectLay +" input."+classSelector_+":checkbox:checked").length;
				}else{
					chkBlockList = $(_options.divSelectLay +" input:checkbox[name" + operator_ + "='"+name_+"']");
					chkBlockListChecked = $(_options.divSelectLay +" input:checkbox[name" + operator_ + "='"+name_+"']:checked").length;
				}

				// 전체 체크박스가 체크되어 있는 경우 전체버튼 체크처리
				if(chkBlockList.length <= (chkBlockListChecked + 1)){
					chkObj[key_].attr('checked', true);
				}

				chkBlockList.on("click",function(){
					var obj 	= $(this);

				if(obj.val() == 'all'){
					chkBlockList.each(function(){ $(this).prop("checked",obj.is(":checked")); });
				}else{
					if(obj.is(":checked") == false){
						chkBlockList.parent().find(".chkall").prop("checked",false);
					}else{
						if(chkBlockList.parent().find(":checked").length == (chkBlockList.length - 1)){
							chkBlockList.parent().find(".chkall").prop("checked",true);
						}
					}
				}
			});
		});

	}
	

	/*
	날짜 선택
	*/
	var _search_date = function(obj,mode){
		var sdateVal = ''; edateVal = getDate(0);	
        var w		 = new Date().getDay();
		var sdate = obj.parents('.date_range_form').find(".sdate");
		var edate = obj.parents('.date_range_form').find(".edate");
		var range = obj.attr("range");
		if(typeof range == "undefined" || range == "select_date_all") range='all';

		if( obj.closest('div').find('input.select_date_input').length == 0 ) {
			obj.closest('div').append("<input name='select_date[]' value='"+range+"' class='select_date_input' type='hidden'>");
		} else {
			obj.closest('div').find('.select_date_input').val(range);
		}

		if(_get_editor_mode() == 'open') return false;

		if(typeof mode == "undefined") mode = "click";
		
		if(mode == "click"){
			
			switch(range) {
				case 'today' :
					sdateVal = getDate(0);
					break;
				case 'yesterday' :
					sdateVal = getDate(1);
					edateVal = getDate(1);
					break;				
				case '3day' :
					sdateVal = getDate(3);
					break;
				case '1week' :
					sdateVal = getDate(7);
					break;				
				case '1month' :
					sdateVal = getDate(30);
					break;				
				case '3month' :
					sdateVal = getDate(90);
					break;
				case 'work_thisweek' :	
					if(w == 0) w = 7;
					sdateVal = getDate(w - 1);
					edateVal = getDate(-(7 - w));
					break;
				case 'work_lastweek' :	
					if(w == 0) w = 7;
					sdateVal = getDate(6 + w);
					edateVal = getDate(w);
					break;
				case 'thismonth' :					
					var last_day = new Date(getYear(0), getMonth(0), 0).getDate();				
					var today = new Date().getDate();		
					sdateVal = getDate(today-1);				
					edateVal = getDate(today-last_day);
					break;
				case 'lastmonth' :									
					var today = new Date().getDate();		
					sdateVal = getDate(today+30);				
					edateVal = getDate(today);
					break;
				case 'thatmonth' :													
					var today =  new Date().getDate();		
					sdateVal =  getDate(today-1);			
					edateVal = getDate(0);				
					break;
				case '7days_untill_end_date' :
					edateVal = edate.val();
					sdateVal = getTheDate(edate.val().split('-'),+6);							
					break;
				case '15days_untill_end_date' :													
					edateVal = edate.val();
					sdateVal = getTheDate(edate.val().split('-'),+14);
					break;
				case '30days_untill_end_date' :													
					edateVal = edate.val();
					sdateVal = getTheDate(edate.val().split('-'),+29);
					break;
				default :
					edateVal = '';
					break;
			}
		}
		if(obj.closest('div').attr('format') == 'onlyDate') {
			var date_tmp_s = sdateVal.split("-");
			var date_tmp_e = edateVal.split("-");

			sdate.eq(0).val(date_tmp_s[1]).attr('selected','selected');
			sdate.eq(1).val(date_tmp_s[2]).attr('selected','selected');
			edate.eq(0).val(date_tmp_e[1]).attr('selected','selected');
			edate.eq(1).val(date_tmp_e[2]).attr('selected','selected');
		} else {
			sdate.val(sdateVal);
			edate.val(edateVal);
		}	
		obj.parent('div').find('.select_date').removeClass("on");			
		obj.addClass("on");
		if ($('input[name="select_date_regist"]').val() == 'all') { // 전체인 경우 선택풀리지 않게
			obj = $("input.select_date[range='select_date_all']").addClass('on');	
		}
		
	}

	var _search_date_reset = function() {
		$(_options.divSelectLay +" .date_range_form").each(function() {
			var range = $(this).find("input.select_date_input");
			if(range.val() == "" && _options.sc.searchflag != "1") {
				range = 'all';
			} else {
				range = range.val();
			}
			var select_date = $(this).find("input.select_date[range='"+range+"']");
			//if(select_date.length == 0) select_date = $(this).find("input.select_date[range='select_date_all']");
			_search_date(select_date, 'click');				
		});
	}

	var _select_date_default = function(el) {
		if( el ) {
			var reset_form = el.parents('.date_range_form').find('div.resp_btn_wrap');
		} else {
			var reset_form = $(_options.divSelectLay);
		}
		reset_form.find('.select_date').removeClass("on");
		reset_form.find('.select_date').css("border", "1px solid #dcdcde");

		if(_get_editor_mode() == 'open') return false;
		reset_form.find('.select_date_input').val('');
	}

	/* 정렬 기준 SelectBox */
	var _display_sort = function(arrSort){
		
		var html = '<select name="search_sort">';

		var select_sort = $(".display_sort").attr("sort");
		if(typeof select_sort == "undefined" || select_sort == '') select_sort = '';
		
		$.each(arrSort,function(key,data){
			var selected = "";
			if(select_sort == key){
				selected = "selected";
			}
			html += '<option value="'+key+'" '+selected+'>'+data+'</option>';
		});
		html += '</select>';
		$(".display_sort").html(html);
		$("select[name='search_sort']").on('change', function() {
			
			if(typeof _options.searchFormId != 'undefined' && _options.searchFormId != null && _options.searchFormId != 'null'){
				var selector = _options.divSelectLay + " #" + _options.searchFormId;
			}else{
				var selector = _options.divSelectLay + " form";
			}

			$(selector +" input[name='sort']").val($(this).val());
			$(selector +" input[name='orderby']").val($(this).val());
			$(selector).find("input[name='searchflag']").remove();
			$(selector).append("<input type='hidden' name='searchflag' value='1'/>");		
			doSubmit($(selector));
		});
	}

	/* 검색결과 리스트 노출 갯수 SelectBox */
	var _display_quantity = function(lay_search_perpage){
		
		var default_qty_list = [10,50,100,200];
		var html = '<select name="search_perpage">';

		var select_perpage = $("."+lay_search_perpage).attr("perpage");
		if(typeof select_perpage == "undefined" || select_perpage == ''){
			select_perpage = _options.defaultPerpage;
		}
		$.each(default_qty_list,function(key,data){
			var selected = "";
			if(select_perpage == data){
				selected = "selected";
			}
			html += '<option id="dp_qty'+data+'" value="'+data+'" '+selected+'>'+data+'개씩</option>';
		});
		html += '</select>';
		
		if(typeof _options.searchFormId != 'undefined' && _options.searchFormId != null && _options.searchFormId != 'null'){
			var $selector = $(_options.divSelectLay + " #" + _options.searchFormId);
		}else{
			var $selector = $(_options.divSelectLay + " form");
		}
		if( $selector.find("input[name='page']").length == 0){
			$selector.append('<input type="hidden" name="page" value='+_options.defaultPage+'>');
		}
		if( $selector.find("input[name='perpage']").length == 0){
			$selector.append('<input type="hidden" name="perpage" value=10>');
		}

		$("."+lay_search_perpage).html(html);
		$("select[name='search_perpage']").on('change', function() {
			_options.defaultPerpage = $(this).val();

			$selector.find("input[name='page']").val(_options.defaultPage);
			$selector.find("input[name='perpage']").val(_options.defaultPerpage);
			$selector.find("input[name='searchflag']").remove();
			$selector.append("<input type='hidden' name='searchflag' value='1'/>");
			doSubmit($selector);
		});

	}

	/*년월일 셀렉트 박스*/
	var _date_type = function(type)	{		
		var _month = $(".date_type_form select[name='month']");
		var _day = $(".date_type_form select[name='day']");
	
		_month.hide();
		_day.hide();
		$(".thisMonthBtn").hide();
		$(".todayBtn").hide()

		switch(type) {
		case 'daily' :
			_month.show();
			$(".thisMonthBtn").show();
			break;
		case 'hour' :
			_month.show();
			_day.show();
			$(".todayBtn").show();
			break;	
		default :		
			break;
		}
	}

	var _data_type_reset = function(){
		$(_options.divSelectLay +" .dateType input[type='radio']:checked").trigger("change");
	}

	var _data_type_default = function(){
		$(_options.divSelectLay +" select").each(function(){
			var defaultValue 	= $(this).attr("defaultValue");		
			$(this).find("option[value='"+defaultValue+"']").prop("selected","selected");			
		})
	}

	// 창닫기
	var _close = function(){
		closeDialog(_options.divSelectLay);
	}

	// form 객체 serialize json 
	var _serializeObject = function(obj){
		var result = {};
		var extend = function (i, element) {

			var node = result[element.name];
			
			if ('undefined' !== typeof node && node !== null) {
				
				if (!Array.isArray(node)) {
					node = [node];
				}
				node.push(element.value);
				result[element.name] = node;

			} else {
				result[element.name] = element.value;
			}
		};

		$.each(obj.serializeArray(), extend);
		return result;
	}

	/**
	 * public
	 */
	return {

		// 초기 세팅
		init: _init,

		form_search: _form_search,
		set_editor_mode: _set_editor_mode,
		get_editor_mode: _get_editor_mode,

		// 버튼관련 세팅
		btn_default_viewer: _btn_default_viewer,
		btn_event: _btn_event,

		// 검색필드초기화
		reset: _reset,

		// 입점사선택
		set_provider_selector: _set_provider_selector,

		// 입점사검색
		provider_setting: _provider_setting,
		provider_shipping_group:_provider_shipping_group,

		// 상세검색
		form_detail_view: _form_detail_view,

		// 검색편집
		form_edit_mode: _form_edit_mode,

		//날짜선택
		set_search_date: _search_date,

		//검편편집저장
		search_form_save: _search_form_save,
		checkbox_event:_checkbox_event,

		// 검색 필드 세팅
		get_field_default: _get_field_default,
		set_field_default: _set_field_default,
		set_field_view: _set_field_view,
		set_field_required: _set_field_required,
		set_default_value: _set_default_value,
		set_search_field: _set_search_field,
		
		// 필수검색 체크
		required_chk:_required_chk,
		value_setting:_value_setting,

		display_sort: _display_sort,
		display_quantity:_display_quantity,

		keyDown: _keyDown,

		//창 닫기
		close: _close
	}

})();
