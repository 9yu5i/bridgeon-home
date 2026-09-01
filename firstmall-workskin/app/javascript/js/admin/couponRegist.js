/*
쿠폰 종류 및 발급 방식에 따라 등록 폼 변경을 위한 javascript
@2020.02.06
*/
var couponObj = (function(){

	var that			= this;
	//debugger 

	var coupon_data	= {};			// 쿠폰 기본 정보 데이터
	var coupon_form	= {};			// 쿠폰 등록 폼 데이터
	var mode		= "new";		// 신규등록
		
	var g_coupon_category 	= couponData.coupon_category;
	var g_coupon_type 		= couponData.coupon_type;
	var g_issued_method 	= couponData.issued_method;

	var _default_setting = function(){
		// required default view
		_set_required_view($(".t_coupon_name th").eq(0));
		_set_required_view($(".t_benefit th").eq(0));
	}

	//---------------------------------------------------------------------------
	// 1. 쿠폰 종류 세팅
		// 1-1. 선택한 쿠폰 종류 리스트 가져오기
		var _get_data = function(coupon_category){

			var coupon_type = $("select[name='coupon_type']");
			if(coupon_category != "" && typeof coupon_type.attr("coupon_category") == 'undefined'){
				errorLog("warning::'coupon_type > coupon_category' not found!");
			}

			if(coupon_category == "" && g_coupon_category){
				that.mode		= "save";								// 선택된 값이 없고, 저장된 값이 있으면(수정모드)
				coupon_category = g_coupon_category;				
			}else if(coupon_category == "" && g_coupon_category == "" ){ 
				coupon_category = "goods";								// 선택, 저장 둘다 없을 때 기본값
			}

			// 쿠폰카테고리
			g_coupon_category = coupon_category;

			//반복호출 방지
			if(g_coupon_category == coupon_type.attr("coupon_category")) return false;

			$.ajax({
				'url' : '/admin/coupon/get_category_sub',
				'data' : {'coupon_category':g_coupon_category},
				'type' : 'post',
				'dataType': 'json',
				'dataSrc' : '',
				'success' : function(res){
					that.coupon_data = res;					// 쿠폰 종류별 발급 방법 세팅 값
					_set_coupon_type(g_coupon_category);	// 쿠폰 종류 세팅
				}
			});

			if(g_coupon_category == "shipping"){
				$(".title_salescost_set span").html("혜택 적용 배송비");
			}else{
				$(".title_salescost_set span").html("혜택 부담 설정");
			}

		}

		// 1-2.  쿠폰 유형 세팅
		var _set_coupon_type = function(g_coupon_category){
		
			var selectbox = $("select[name='coupon_type']");
			var coupon_type_msg = '';
			var coupon_type_key = '';

			//$("select[name='coupon_type'] option:not(option:eq(0))").remove();
			$("select[name='coupon_type'] option").remove();	//쿠폰 종류 초기화

			var options_	= "";			
			var len			= Object.keys(that.coupon_data).length

			var k = 0;
			$.each(that.coupon_data,function(key,data){
				//3depth data가 있는 경우에만
				if(Object.keys(that.coupon_data[key].list).length > 0){
					options_ += "<option value='"+key+"'>"+data.name+"</option>";
					if(len == 1 || k == 0) { coupon_type_key = key; }
					k = k + 1;
				}
			});
			selectbox.attr("g_coupon_category",g_coupon_category);
			selectbox.append(options_);		// 선택에 쿠폰에 따라 종류 재세팅

			//수정모드일때 저장된값(없으면 기본값) 선택
			if(that.mode == "save" && g_coupon_type != ""){
				coupon_type_key = g_coupon_type;
			}
			selectbox.val(coupon_type_key);						
			coupon_type_msg = $("select[name='coupon_type'] option:selected").text();

			// 선택박스가 1개 이거나 저장된 데이터를 불러올때는 selectbox 숨기기
			if(k == 1 || that.mode == "save"){
				selectbox.hide();
				$("span.coupon_type_msg").html(coupon_type_msg);
			}else{
				selectbox.show();
				$("span.coupon_type_msg").html("");
			}
			_set_coupon_issued_method(coupon_type_key);

		}

		// 1-3. 쿠폰 발급 방법 세팅
		var _set_coupon_issued_method = function(coupon_type_key){

			var loop			= that.coupon_data[coupon_type_key];
			var len				= Object.keys(loop.list).length;
			var options_		= "";
			var issued_method	= "";
			var k 				= 0;

			var optionList 			=  new Array();
			var optionLabelClass 	=  new Array();
			$.each(loop['list'],function(key,value){
				var label_class = "show";
				var inp_class 	= "show";
				if(that.mode == "save"){
					inp_class = "hide ml0";
					if(g_issued_method == 'ordersheet_off' && key == 'ordersheet') key = 'ordersheet_off';
					if(key != g_issued_method) label_class = "hide ml0";
				}
				optionLabelClass[k] = label_class;
				optionList[k] 		= "<input type='radio' name='issued_method' value='"+key+"'  class='"+inp_class+"'> "+value;
				if(k == 0) { issued_method = key; }
				k = k + 1;
			});

			if(optionList.length == 1){
				options_ = optionList.join("");
			}else{
				$.each(optionList,function(key,val){
					options_ += "<label class='"+optionLabelClass[key]+"'>" + '' + val+"</label>";
				});
			}
			
			var btn_init = false;
			if($(".issued_method div").html() == ""){
				btn_init = true;
			}

			$(".issued_method div").html(options_);		//선택된 쿠폰 종류에 따라 발급방법 생성

			// 발급방법 라디오버튼 click event 생성
			if(btn_init == true){			// 이벤트 다중 생성 방지
				$(document).on('click', "input[name='issued_method']", function(){
					_load_regist_form($(this).val());
				});
			}

			if(that.mode == "save"){ issued_method = g_issued_method; }

			$("input:radio[name='issued_method']:input[value='"+issued_method+"']").prop("checked",true);
			 
			if(k == 1 || that.mode == "save"){
				$("input:radio[name='issued_method']").closest("label").attr("style","cursor:normal !important");
				$("input:radio[name='issued_method']:input[value='"+issued_method+"']").parent().addClass("ml0");
				$("input:radio[name='issued_method']:input[value='"+issued_method+"']").hide();
			}else{
				$("input:radio[name='issued_method']").closest("label").attr("style","cursor:pointer");
				$("input:radio[name='issued_method']:input[value='"+issued_method+"']").parent().removeClass("ml0");
			}

			_load_regist_form(issued_method);

		}

		// 1-4. 쿠폰 종류 및 발급 방법에 따라 입력 폼 세팅
		var _load_regist_form = function(issued_method){

			try {
				_set_coupon_usetype(issued_method);

				if($(".issued_method").attr("issued_method") == "" || $(".issued_method").attr("issued_method") != issued_method){

					$.ajax({
						'url' : '/admin/coupon/get_coupon_regist_form',
						'data' : {'issued_method':issued_method},
						'type' : 'post',
						'dataType': 'json',
						'success' : function(res){

							if(typeof res != "object" || res == "" || res == null){
								throw "["+typeof res+"]데이터를 불러오지 못했거나 잘못된 형태의 데이터 입니다.";
							}

							that.coupon_form = res;

							// 주문서 쿠폰
							if(g_coupon_category == "order"){
								couponObj.set_required_view($(".t_onoffline th").eq(0));
								$("input:radio[name='sale_store'][value='on']").prop("checked",true);
								$(".t_coupon_type").hide();	// 쿠폰유형 숨김
								$(".t_onoffline").show();	// 온라인오프라인 항목 노출
								$(".ui_benefit_setting .goods").closest(".goods").find(".msg").hide();
							}else{
								$(".t_coupon_type").show();
								$(".t_onoffline").hide();
								$(".ui_benefit_setting .goods").closest(".goods").find(".msg").show();
							}
							
							// 오프라인 매장 선택 사용 여부
							if(that.coupon_form.offlineStore == "y"){
								_set_required_view($(".t_ordersheet th").eq(0));
								$(".t_ordersheet").show();
								$(".t_ordersheet input[name='sale_store_item[]']").show();
							}else{
								$(".t_ordersheet").hide();
								$(".t_ordersheet input[name='sale_store'][value='on']").prop("checked",true);
							}

							g_issued_method = issued_method;	//global 변수에 현재 선택 값 넣기

							$(".issued_method").attr("issued_method",g_issued_method);
							var discount_seller_type = $("input:radio[name='discount_seller_type']:checked").val();
							_form_salescost(discount_seller_type);		//혜택부담설정 폼 세팅하기
							
						}
					});

				}

			}catch(error) {

				errorLog("error >>>> ");
				errorLog(error);

			}finally {

			}
		}

		/*
		 쿠폰 사용처(online / offline)
		 현재는 offline에서 사용 가능한 쿠폰은 없는 것으로 확인.
		*/
		var _set_coupon_usetype = function(issued_method){
			$("input[name='coupon_usetype']").val('online');
			/*
			if(issued_method.indexOf('offline') != -1){
				$("input[name='coupon_usetype']").val('offline');
			}else{
				$("input[name='coupon_usetype']").val('online');
			}*/
		}
	//---------------------------------------------------------------------------
	// 2. 혜택 부담 설정
		// 2-1. 혜택 부담 설정 form
		var _form_salescost = function(discount_seller_type,callType){

			var _set_info = that.coupon_form;

			var _f_salescost = $(".salescost");

			if(typeof callType == "undefined") callType = "";

			// 선택된 혜택 부담대상이 없을 때 본사를 기본으로
			if(typeof discount_seller_type == "undefined"){
				$("input:radio[name='discount_seller_type']").eq(0).prop("checked",true);
				var discount_seller_type = $("input:radio[name='discount_seller_type']").eq(0).val();
			}

			// 혜택 대상 상품 or 배송비
			var target_name = "상품";
			if(_set_info.discount_target == "shipping"){ target_name = "배송비"; }

			$(".t_discount_seller_type .discount_seller_type_txt span").html(target_name);
			$(".t_discount_seller_type label span").html(target_name);

			// 혜택부담 적용대상 : 본사.
			if(discount_seller_type == "admin" && callType == "click"){
				if(parseInt($("input[name='salescost_admin']").val()) < 100){
					openDialogAlert('본사 상품 "본사 100% 부담"으로 변경됩니다.',350,160);
					_set_sale_cost_percent(0);
				}
			}else if(discount_seller_type == "seller"){
				if(callType == "click" && g_issued_method == "shipping"){
					_set_sale_cost_percent(100);
				}
				_set_required_view($(".t_discount_seller_type_list th").eq(0));
			}

			// 2-2. 혜택 부담 대상 설정
			_form_salecost_discount_seller();
			// 3. 혜택 설정
			_form_salecost_discount_set();
			// 4. 쿠폰발급
			_form_coupon_issued();
			// 5. 쿠폰인증
			_form_coupon_certification();
			// 6. 전환포인트
			_form_conversion_point();
			// 7. 인증가능횟수
			_form_certification_number();
			// 8. 쿠폰사용제한
			_form_usage_restriction();
			// 9. 쿠폰 이미지
			_form_coupon_image_set();
			// 10. 쿠폰 다운로드 URL
			_form_coupon_download_url_set();

		}

		// 2-2. 혜택 부담 대상 설정
		var _form_salecost_discount_seller = function(){

			var _set_info 				= that.coupon_form;
			var _discount_seller_type 	= $("input:radio[name='discount_seller_type']:checked");

			$(".title_salescost_set").show();
			$(".div_salescost_set").show();

			// 본사/모든입점사 상품 대상. 본사 100% 일때 부담
			if(_set_info.discount_seller_type == "A" || _set_info.discount_seller_type == "ONLYA"){
				if( _set_info.discount_seller_type == "A" ) {
					$("input:radio[name='discount_seller_type'][value='all']").prop("checked",true);
				}
				_set_sale_cost_percent(0);		// 기본값은 본사 100%
				$(".t_discount_seller_type label.admin").hide();		// 혜택 대상:본사
				$(".t_discount_seller_type label.provider").hide();
				
				if(_set_info.discount_seller_type == "ONLYA"){
					$(".discount_seller_type_txt.admin").show();		//대상 text만 노출
					$(".discount_seller_type_txt.provider").hide();		//대상 text만 노출
					$(".discount_seller_type_txt.all").hide();			//대상 text만 노출
				}else{
					$(".discount_seller_type_txt.admin").hide();		//대상 text만 노출
					$(".discount_seller_type_txt.provider").hide();		//대상 text만 노출
					$(".discount_seller_type_txt.all").show();			//대상 text만 노출
				}

				$(".salescost_rate.admin").show();					// 혜택부담:본사
				$(".salescost_rate.provider").hide();				
				$(".t_discount_seller_type_list").hide();

			//  본사/입점사 선택 대상. 선택 부담
			}else if(_set_info.discount_seller_type == "AOP"){

				if(_discount_seller_type.val() == "" || _discount_seller_type.val() == "all"){
					$("input:radio[name='discount_seller_type'][value='admin']").prop("checked",true);
					var _discount_seller_type 	= $("input:radio[name='discount_seller_type']:checked");
				}
				$(".discount_seller_type_txt.admin").hide();		//대상 text만 노출
				$(".discount_seller_type_txt.provider").hide();		//대상 text만 노출
				$(".discount_seller_type_txt.all").hide();			//대상 text만 노출

				$(".t_discount_seller_type label.admin").show();
				$(".t_discount_seller_type label.provider").show();
				
				$(".salescost_rate.admin").show();
				if(typeof _discount_seller_type.val() == "undefinded" || _discount_seller_type.val() == "admin"){	// 본사상품 선택
					_set_sale_cost_percent(0);		// 기본값은 본사 100%
					$(".salescost_rate.provider").hide();
					$(".t_discount_seller_type_list").hide();
					$(".salescost_rate input[name='salescostper']").show();
					$(".salescost_rate.provider .percent").html('');
				}else{									// 입점사 상품 선택
					_set_required_view($(".salescost_rate.provider th").eq(0));
					$(".salescost_rate.provider").show();
					$(".t_discount_seller_type_list").show();
					
					if(g_issued_method == "shipping"){
						$(".salescost_rate.admin").hide();
						$(".salescost_rate.provider .percent").html($(".salescost_rate input[name='salescostper']").val());
						$(".salescost_rate input[name='salescostper']").hide();
					}
				}

			//  혜택부담설정 안함.
			}else if(_set_info.discount_seller_type == "NONE"){

				$(".title_salescost_set").hide();
				$(".div_salescost_set").hide();

			//  본사/모든입점사 상품 대상. 본사/입점사 같이 부담
			}else if(_set_info.discount_seller_type == "ALL"){
				_set_required_view($(".salescost_rate.provider th").eq(0));
				if(that.mode != "save") _set_sale_cost_percent(0);		// 기본값은 본사 100%

				$(".salescost_rate.provider .percent").html('');
				$(".salescost_rate input[name='salescostper']").show();

				$("input:radio[name='discount_seller_type'][value='all']").prop("checked",true);

				$(".t_discount_seller_type label.admin").hide();		// 혜택 대상:본사, 입점사 상품
				$(".t_discount_seller_type label.provider").hide();

				$(".discount_seller_type_txt.admin").hide();		//대상 text만 노출
				$(".discount_seller_type_txt.provider").hide();		//대상 text만 노출
				$(".discount_seller_type_txt.all").show();			//대상 text만 노출
				
				$(".salescost_rate.admin").show();
				$(".salescost_rate.provider").show();
				$(".t_discount_seller_type_list").hide();

			}

		}

	//---------------------------------------------------------------------------
	// 3. 혜택 설정
		// 3-1. 혜택, 최소주문금액, 유효기간, 중복할인
		var _form_salecost_discount_set = function(){

			var _set_info = that.coupon_form;

			if( _set_info == {}) {
				errorLog("_form_salecost_discount_set :: Null Data");
				return false;
			}

			var t_limit_goods_price		= true;			//최소주문금액 tr
			var t_mileage_period_limit	= false;		//마일리지 유효기간 tr
			var t_period_limit			= true;			//유효기간 tr
			var t_duplication_set		= true;			//중복할인 tr

			if(g_coupon_category == "mileage"){
				t_limit_goods_price		= false;
				t_mileage_period_limit	= true;
				$(".resp_message.hideMileage").hide();
			}else{
				$(".resp_message.hideMileage").show();
			}

			if(_set_info.periodofuse_type == ""){			// 유효기간설정 사용안함
				t_period_limit	= false;
			}
			if(_set_info.duplicationUseSet == "unused"){	// 중복할인설정 사용안함
				t_duplication_set	= false;
			}

			if(t_limit_goods_price == true){ 
				$(".ui_benefit_setting tr.t_limit_goods_price").show();
			}else{
				$(".ui_benefit_setting tr.t_limit_goods_price").hide();
			}

			if(t_mileage_period_limit == true){
				var issuePriodType = $("input[name='issuePriodType']:checked");
				if(issuePriodType.val() != "year" && issuePriodType.val() != "direct"){
					$("input[name='issuePriodType'][value='year']").prop("checked",true);
				}
				if($("input[name='period_limit']:checked").val() == "unlimit"){
					t_period_limit = false;
				}
				$(".ui_benefit_setting tr.t_mileage_period_limit").show();
			}else{
				$(".ui_benefit_setting tr.t_mileage_period_limit").hide();
				$(".ui_benefit_setting tr.t_period_limit").show();
			}

			if(t_period_limit == true){
				var except_period_required = ['memberlogin','membermonths','membermonths_shipping','memberlogin_shipping'];
				if($.inArray(g_issued_method,except_period_required ) == -1 ){
					_set_required_view($(".ui_benefit_setting tr.t_period_limit th").eq(0));
				}else{
					_set_required_view($(".ui_benefit_setting tr.t_period_limit th").eq(0),"remove");
				}
				$(".ui_benefit_setting tr.t_period_limit").show();
			}else{
				$(".ui_benefit_setting tr.t_period_limit").hide();
			}
			if(t_duplication_set == true){
				$(".ui_benefit_setting tr.t_duplication_set").show();
			}else{
				$(".ui_benefit_setting tr.t_duplication_set").hide();
			}

			// 
			/*
			benefit_type	 :: 혜택 상세 설정
							 :: rate_amount 정률/정액, shipping 배송비, mileage 마일리지
							 :: 최소주문금액 - 혜택이 마일리지 인경우에만 사용 안함
			*/
			if(_set_info.benefit_type == "rate_amount"){
				$(".ui_benefit_setting .goods").show();
				$(".ui_benefit_setting .shipping").hide();
				$(".ui_benefit_setting .mileage").hide();
			}else if(_set_info.benefit_type == "shipping"){
				$(".ui_benefit_setting .goods").hide();
				$(".ui_benefit_setting .shipping").show();
				$(".ui_benefit_setting .mileage").hide();
				_set_shipping_sales_select();
			}else if(_set_info.benefit_type == "mileage"){
				$(".ui_benefit_setting .goods").hide();
				$(".ui_benefit_setting .shipping").hide();
				$(".ui_benefit_setting .mileage").show();
			}else {
				errorLog("_form_salecost_discount_set :: "+_set_info.benefit_type+" 잘못된 호출");
			}

			/*
			periodofuse_type :: 유효기간(사용기간) 상세 설정 date|day|months  
							 :: '' 설정안함, 'date' 특정기간지정/기한지정, 'day' 기한지정, 'months' 당월말
			*/
			$(".t_period_limit .normal label").hide();
			if(t_period_limit == true){
				var periodofuse_type_tmp = _set_info.periodofuse_type.split("|");
				$(".t_period_limit .normal label").removeClass("ml20");
				$(".t_period_limit .normal").show();
				if(periodofuse_type_tmp.length == 1){
					$(".t_period_limit .normal label input:radio").addClass("hide");
				}else{
					$(".t_period_limit .normal label input:radio").removeClass("hide");
				}
				$.each(periodofuse_type_tmp,function(key,value){
					if(key > 0) $(".t_period_limit .normal label."+value).addClass("ml20"); 
					if(that.mode != "save" && key == 0){
						$("input[name='issuePriodType'][value='"+value+"']").prop("checked",true);
					}
					$(".t_period_limit .normal label."+value).show();
				});
			}

			/*
			 duplicationUseSet	:: 중복할인 상세 설정
			*/
			var duplicationUseSetTitle = {'duplicate_discount':'중복 할인', 'duplicate_down':'중복 다운', 'duplicate_all': '중복 할인/중복 다운', 'unused': ''};
			$(".ui_benefit_setting tr.t_duplication_set .tooltip_btn").hide();
			if(typeof _set_info.duplicationUseSet != "undefined" && _set_info.duplicationUseSet != ""){
				$(".ui_benefit_setting tr.t_duplication_set span.title").html(duplicationUseSetTitle[_set_info.duplicationUseSet]);
				$(".ui_benefit_setting tr.t_duplication_set .tooltip_btn."+_set_info.duplicationUseSet).show();
			}

		}

		// 3-2. 혜택설정 > 상품 판매금액 할인 % or 원 선택 설정
		var _set_goods_sales_select = function(select_type){

			if(typeof select_type == "undefined") select_type = $("select[name='saleType'] option:selected").val();

			// 기본배송비 무료일 때, 할인금액 입력 칸 숨기기
			if(select_type == "percent"){
				$(".ui_benefit_setting .goods .max_goods_sale_price").show();
				_percent_input_check($("input[name='goodsSalePrice']"));
			}else{
				$(".ui_benefit_setting .goods input[name='maxPercentGoodsSale']").val(''); //금액 지정('원') 할인일 때 입력값은 초기화
				$(".ui_benefit_setting .goods .max_goods_sale_price").hide();
			}
			

		}

		// 3-3. 혜택설정 > 기본배송비 무료/할인 선택 설정
		var _set_shipping_sales_select = function(select_type){

			if(typeof select_type == "undefined") select_type = $("select[name='shippingType'] option:selected").val();
			//$(".ui_benefit_setting .shipping input[name='wonShippingSale']").val(''); //기본배송비 무료일때 입력값은 초기화

			// 기본배송비 무료일 때, 할인금액 입력 칸 숨기기
			if(select_type == "free"){
				$(".ui_benefit_setting .shipping .max_shipping_sale_price").show();
			}else{
				$(".ui_benefit_setting .shipping .max_shipping_sale_price").hide();
			}
		}
		
	//---------------------------------------------------------------------------
	// 4. 쿠폰 발급
		// 수량, 발급기간, 회원등급지정
		var _form_coupon_issued = function(){

			var _set_info = that.coupon_form;

			// 수량제한, 발급기한, 회원등급 모두 사용안함 일때 해당 영역 전체 숨기기
			if(_set_info.downloadLimitSet == "" && _set_info.downloadPeriodSet == "" && _set_info.memberGradeSet == ""){
				$(".ui_coupon_inssuance").hide();
			}else{

				// 수량 제한
				$(".ui_coupon_inssuance").show();
				$(".t_download_limit").show();
				$(".t_download_limit label").hide();
				$(".t_download_limit input:radio[name='downloadLimit']").hide();

				switch(_set_info.downloadLimitSet){
					case "auto":
						$(".t_download_limit label.auto").show();
					break;
					case "unlimit":
						$(".t_download_limit label.unlimit").show();
						$(".t_download_limit label.limit").removeClass("ml0");
					break;
					case "limit":
						$(".t_download_limit input:radio[name='downloadLimit']:input[value='unlimit']").show();
						$(".t_download_limit input:radio[name='downloadLimit']:input[value='limit']").show();
						$(".t_download_limit label.limit").addClass("ml0");
						$(".t_download_limit label.unlimit,.t_download_limit label.limit").show();
					break;
					default :
						$(".t_download_limit").hide();
					break;
				}

				if(g_issued_method == "birthday"){
					$("tr.t_coupon_issued div.beforeafter span").html("생일");
					_set_required_view($("tr.t_coupon_issued th").eq(0));
				}else if(g_issued_method == "anniversary"){
					$("tr.t_coupon_issued div.beforeafter span").html("기념일");
					_set_required_view($("tr.t_coupon_issued th").eq(0));
				}

				// 쿠폰발급기간 제한여부 체크
				var download_period_use		= $("input[name='download_period_use']:checked").val();
				var downloadPeriodSet	= _set_info.downloadPeriodSet;

				/*
				 downloadPeriodSet		:: 발급기한(다운로드기한) 설정
											'auto' 자동신규 구매
											'period' 기간/시간/요일 설정
											'beforeafter' 00일전 ~ 00일 후
											'daysfrom' 00일로부터
											'neworder' 신규가입 미구매
											'notpurchased' 00동안 미구매
											'onceamonthdownload' 월1회 다운로드
				*/

				//발급기한(다운로드기한) 설정
				if(downloadPeriodSet != ""){

					$("tr.t_coupon_download_period_use").hide();
					$("tr.t_coupon_issued").show();
					
					$("tr.t_time_limit, tr.t_dayoftheweek_limit").hide();
					//if(downloadPeriodSet != "auto") downloadPeriodSet = "period";
					$("tr.t_coupon_issued div,tr.t_coupon_download_period_use div").hide();
					$("tr.t_coupon_issued div."+downloadPeriodSet +",tr.t_coupon_download_period_use div."+downloadPeriodSet).show();
					$("tr.t_coupon_issued div."+downloadPeriodSet+" div,tr.t_coupon_download_period_use div."+downloadPeriodSet+ " div").show();

					switch(downloadPeriodSet){
						case "period":
							$("tr.t_coupon_download_period_use").show();
							if(download_period_use == "unlimit"){
								$("tr.t_coupon_issued,tr.t_time_limit,tr.t_dayoftheweek_limit").hide();
							}else{
								if($("input:checkbox[name='time_limit']").is(":checked") == true){
									$("tr.t_time_limit").show();
								}else{
									$("tr.t_time_limit").hide();
								}
								if($("input:checkbox[name='dayoftheweek_limit']").is(":checked") == true){
									$("tr.t_dayoftheweek_limit").show();
								}else{
									$("tr.t_dayoftheweek_limit").hide();
								}
							}
							_set_required_view($("tr.t_coupon_issued th").eq(0));
						break;
						case "neworder":
							_set_required_view($("tr.t_coupon_issued th").eq(0));
						break;
						case "auto":
							_set_required_view($("tr.t_coupon_issued th").eq(0),'remove');
						break;
						case "beforeafter":
						case "daysfrom":
						case "notpurchased":
						case "onceamonthdownload":
							_set_required_view($("tr.t_coupon_issued th").eq(0));
						break;
						default:
							$("tr.t_coupon_issued").hide();
						break;
					}

				}else{
					$("tr.t_coupon_download_period_use").hide();
					$("tr.t_coupon_issued").hide();
				}

				// 회원등급설정
				if(_set_info.memberGradeSet == "auto"){
					_set_required_view($("tr.t_member_grade th").eq(0),'remove');
					$("tr.t_member_grade,tr.t_member_grade .auto").show();
					$("tr.t_member_grade .gradelimit").hide();
				}else if(_set_info.memberGradeSet == "gradelimit"){
					_set_required_view($("tr.t_member_grade th").eq(0),'remove');
					$("tr.t_member_grade,tr.t_member_grade .gradelimit").show();
					$("tr.t_member_grade .auto").hide();
					// 등급관련 쿠폰일 때 회원등급지정 필수
					var pattern1 = /memberGroup/;
					var pattern2 = /membermonths/;
					if(pattern1.test(g_issued_method) == true || pattern2.test(g_issued_method) == true){
						_set_required_view($("tr.t_member_grade th").eq(0));
					}
				}else{
					$("tr.t_member_grade").hide();
				}

			}

		}
	
	//---------------------------------------------------------------------------
	// 5. 쿠폰 인증
		var _form_coupon_certification = function(){
			if(that.coupon_form.couponCertificationSet == "y"){
				$(".ui_coupon_certification").show();
				_set_required_view($(".ui_coupon_certification th").eq(0));
				_set_required_view($(".ui_coupon_certification th").eq(1));
			}else{
				$(".ui_coupon_certification").hide();
			}
		}

	//---------------------------------------------------------------------------
	// 6. 전환포인트
		var _form_conversion_point = function(){
			if(that.coupon_form.conversionPointSet == "y"){
				$(".ui_conversion_point").show();
				_set_required_view($(".ui_conversion_point th").eq(0));
			}else{
				$(".ui_conversion_point").hide();
			}
		}

	//---------------------------------------------------------------------------
	// 7. 인증번호발급
		var _form_certification_number = function(){
			if(that.coupon_form.certificationNumberSet == "y"){
				$(".ui_certification_number").show();
				
			}else{
				$(".ui_certification_number").hide();
			}

			_form_issued_number_basic_set('auto');	//신규 등록시 '자동'이 기본 값

		}



		//7-1. 발급설정 선택 시 노출변화
		var _form_issued_number_basic_set = function(val){

			var issued_type_basic	= val;
			var offline_type_basic	= "one";

			if(issued_type_basic == "" || typeof issued_type_basic == "undefined"){
				issued_type_basic = $("input:radio[name='certificate_issued_type']:checked").val();
			}else{
				$("input:radio[name='certificate_issued_type']:input[value='"+issued_type_basic+"']").prop("checked",true);
			}
			if(issued_type_basic == "manual") offline_type_basic = "input";
			$("input:radio[name='offline_type']:input[value='"+offline_type_basic+"']").prop("checked",true);
			$(".offlineLimitEa_input").hide();

			$(".t_offline_type div").hide();
			$(".t_offline_type div."+val).show();

			_form_issued_number_event(offline_type_basic);

		}

		//7-2. 인증번호 발급 방식 선택 시 노출 변화
		var _form_issued_number_event = function(val){

			$(".t_offline_random_num").hide();		//자동-랜덤인증번호-인증번호 발급 수
			$(".t_offlineLimit_one").hide();		//자동-1개의 인증번호 생성-인증제한
			$(".t_excel_upload").hide();			//수동-수동엑셀등록-엑셀
			$(".t_offline_input_num").hide();		//수동-1개의 인증번호 지정-인증번호입력
			$(".t_offlineLimit_input").hide();		

			switch(val){
				case "random":
				_set_required_view($(".t_offline_random_num th").eq(0));
					$(".t_offline_random_num").show();
					break;
				case "one":
					_set_required_view($(".t_offlineLimit_one th").eq(0));
					$(".t_offline_input_num").hide();
					$(".t_offlineLimit_one").show();
					break;
				case "input":
					_set_required_view($(".t_offline_input_num th").eq(0));
					$(".t_offline_input_num,.t_offlineLimit_input").show();
					_offlinecoupon_check();

					break;
				case "file":
					_set_required_view($(".t_excel_upload th").eq(0));
					$(".t_excel_upload").show();
					break;
				default :
					break;
			}

		}

	//---------------------------------------------------------------------------
	// 8. 쿠폰사용제한
		var _form_usage_restriction = function(){
		
			if(that.coupon_form.usedTogether != "y" 
					&& that.coupon_form.goodsCategoryLimit != "y"
					&& (that.coupon_form.deviceUsed != "y" && that.coupon_form.deviceUsed != "app")
					&& that.coupon_form.methodOfPayment != "y"
					&& that.coupon_form.refererLimit != "y"){
					$(".ui_usage_restriction").hide();
			}else{

				$(".ui_usage_restriction").show();
				if(that.coupon_form.usedTogether == "y"){
					$(".t_used_together").show();
				}else{
					$(".t_used_together").hide();
				}
				if(that.coupon_form.goodsCategoryLimit == "y"){
					$(".t_goods_category_limit").show();
					var issue_type = $("input:radio[name='issue_type']:checked").val();
					if(typeof issue_type == "undefined") issue_type = "unlimit";
					_form_issue_type_event(issue_type);
				}else{
					$(".t_goods_category_limit").hide();
				}
				if(that.coupon_form.deviceUsed == "y" || that.coupon_form.deviceUsed == "app"){
					$(".t_device_used").show();
					if(that.coupon_form.deviceUsed == "app"){
						$(".t_device_used label").addClass("ml0");
						$(".t_device_used label input[name='sale_agent']").not("input[value='app']").parent().hide();
						$(".t_device_used input[name='sale_agent'][value='app']").hide();
						$(".t_device_used input[name='sale_agent'][value='app']").prop("checked",true);
					}else{
						if($(".t_device_used input[name='sale_agent']:checked").val() == ''){
							$(".t_device_used input[name='sale_agent']").eq(0).prop("checked",true);
						}
						$(".t_device_used label").removeClass("ml0");
						$(".t_device_used label").show();
						$(".t_device_used label input:radio").show();
					}
				}else{
					$(".t_device_used").hide();
				}
				if(that.coupon_form.methodOfPayment == "y"){
					$(".t_method_of_payment").show();
				}else{
					$(".t_method_of_payment").hide();
				}
				if(that.coupon_form.refererLimit == "y"){
					$(".t_referer_limit").show();
					var sale_referer = $("input:radio[name='sale_referer']:checked").val();
					var sale_referer_type = $("input:radio[name='sale_referer_type']:checked").val();
					if(typeof sale_referer == "undefined") sale_referer_type = "a";
					if(typeof sale_referer_type == "undefined") sale_referer_type = "s";

					_form_sale_referer_event(sale_referer);
					_form_sale_referer_type_event(sale_referer_type);
				}else{
					$(".t_referer_limit").hide();
				}
			}

		}

		// 상품카테고리 제한 선택 시
		var _form_issue_type_event = function(val){

			if(val == 'unlimit' || val == 'all'){
				$(".t_select_goods").hide();
				$(".t_goods_category_limit").eq(0).children("th").attr("rowspan",1);
			}else{
				$(".t_select_goods").show();
				$(".t_goods_category_limit").eq(0).children("th").attr("rowspan",2);
			}

		}
		//할인 유입경로 선택 시
		var _form_sale_referer_event = function(val){
			if(val == 'y'){
				$(".t_referer_limit").eq(1).show();
			}else{
				$(".t_referer_limit").eq(1).hide();
			}
		}
		
		// 유입경로 할인 중복 선택 시
		var _form_sale_referer_type_event = function(val){
			if(val == 'a'){
				$(".t_select_referer").hide();
			}else{
				$(".t_select_referer").show();
			}
		}
		
	//---------------------------------------------------------------------------
	// 9. 쿠폰 이미지
		var _form_coupon_image_set = function(val){

			if(typeof val == "undefined"){
				if($(".ui_coupon_image .image_set input[name='couponImg']:checked").val() == 4 
							|| $(".ui_coupon_image .image_set input[name='couponmobileImg']:checked").val() == 4){
					val = 'upload';
				}else{
					val = 'basic';
				}
			}

			if(that.coupon_form.couponImageSet == "y"){
				$(".ui_coupon_image").show();
			}else{
				$(".ui_coupon_image").hide();
			}

			$(".ui_coupon_image .image_set").hide();
			$(".ui_coupon_image .image_set."+val).show();

			if(val == 'upload'){
				$(".ui_coupon_image .image_set input[name='couponImg'][value='4']").prop("checked",true);
				$(".ui_coupon_image .image_set input[name='couponmobileImg'][value='4']").prop("checked",true);
			}
		}

	//---------------------------------------------------------------------------
	// 10. 쿠폰 다운로드 ULR 노출
		var _form_coupon_download_url_set = function(val){
			if(that.coupon_form.couponDownUrl == "y"){
				$(".ui_coupon_download_url").show();
			}else{
				$(".ui_coupon_download_url").hide();
			}
		}
	//---------------------------------------------------------------------------
	// callback


	// etc
		// 필스입력(체크)표시
		var _set_required_view = function(obj,mode){

			var str = obj.html();
			var pattern = /required_chk/;

			if(pattern.test(str) == false){
				obj.html(obj.html() + '<span class="required_chk"></span>');	//필수입력표시
			}

			if(mode == "remove"){
				obj.find("span").removeClass("required_chk");
			}

		}

		var _set_sale_cost_percent = function(provider_rate){
			
			var obj = $("input[name='salescostper']");
			if(typeof obj.val() == "undefined") obj.val() = 0;
			if(typeof provider_rate == 'undefined'){
				var provider_rate = 0;
				if(obj.val() != "")	provider_rate	= parseInt(obj.val());
			}
			var admin_rate		= parseInt(100);

			if(provider_rate > 100){
				obj.parent().find("span.msg").html("(입점사 부담률은 100%를 넘을 수 없습니다.)");
				obj.val('');
				provider_rate = 0;
			}else if(provider_rate <= 100 && provider_rate > 0){
				obj.parent().find("span.msg").html("");
			}

			if(provider_rate >= 0){
				admin_rate = (100-provider_rate);
			}

			$(".salescost_rate.admin .percent").html(admin_rate + "%");
			$("input[name='salescost_provider']").val(provider_rate);
			$("input[name='salescost_admin']").val(admin_rate);
			$("input[name='salescostper']").val(provider_rate);
		}

		var _percent_input_check = function(obj){
			var str = String(obj.val());
			if(str.length > 3 ){
				obj.val(str.slice(0,-1));
			}
			if(parseInt(str) > 100 ){
				obj.val(0);
			}
			obj.focus();
		}
		
		// 마일리지 > 인증번호발급 > 수동 > 1개의 인증번호 지정 선택 시 입력한 인증번호 유효성 체크
		var _offlinecoupon_check = function(){

			if(couponData.coupon_seq == ""){
				$('#couponRegist').validate({
					onkeyup: false,
					focusInvalid: false,
					onfocusout: false,
					rules: {
						offline_input_num: {
							required: function () {
							 if($("input[name='offline_type']:checked").val() == "input"){
									return true;
								}else{
									return false;
								}
							},
							remote:{type:'post',url:'../coupon_process/offlinecoupon_ck'},
						}
					},
					messages: {
						offline_input_num: { required:'<span class="red">인증번호를 입력해 주세요.</span>', remote: '이미 등록된 인증번호입니다.'},
					},
					errorPlacement: function(error, element) {
						//error.appendTo(element.parent());
						openDialogAlert(error.text(),'400','140',function(){ $(".offline_input_num").focus();});
					},
					submitHandler: function(f) {
						f.submit();
					}
				});
			}
		}

		var _return_coupon_form = function(fieldtype){
			
			if(typeof fieldtype != 'undefined')	return that.coupon_form[fieldtype];
			else return that.coupon_form;

		}

	return {

		default_setting				: _default_setting,
		get_data					: _get_data,
		set_coupon_type				: _set_coupon_type,
		set_coupon_issued_method	: _set_coupon_issued_method,
		set_coupon_usetype			: _set_coupon_usetype,
		load_regist_form			: _load_regist_form,
		form_salescost				: _form_salescost,
		form_salecost_discount_seller: _form_salecost_discount_seller ,
		form_salecost_discount_set	: _form_salecost_discount_set,
		set_goods_sales_select		: _set_goods_sales_select,
		set_shipping_sales_select	: _set_shipping_sales_select,
		form_coupon_issued			: _form_coupon_issued,
		form_coupon_certification	: _form_coupon_certification,
		form_conversion_point		: _form_conversion_point,
		form_certification_number	: _form_certification_number,
		form_issued_number_basic_set: _form_issued_number_basic_set ,
		form_issued_number_event	: _form_issued_number_event,
		form_usage_restriction		: _form_usage_restriction,
		form_issue_type_event		: _form_issue_type_event,
		form_sale_referer_event		: _form_sale_referer_event,
		form_sale_referer_type_event: _form_sale_referer_type_event,
		form_coupon_image_set		: _form_coupon_image_set,
		form_coupon_download_url_set: _form_coupon_download_url_set,
		set_sale_cost_percent		: _set_sale_cost_percent,
		percent_input_check			: _percent_input_check,
		offlinecoupon_check			: _offlinecoupon_check,
		set_required_view			: _set_required_view,
		return_coupon_form			: _return_coupon_form,
	}

}) ();


$(function() {

	//var couponObj = coupon_setting();
	couponObj.get_data("");
	couponObj.default_setting();

	
	//------------------------------------------------------------------------------------------------------------------
	// form 호출

	// 검색폼 관련 스크립트 활성화
	//gSearchForm.init();

	// 쿠폰 종류 세팅
	$("input:radio[name='coupon_category']").on("click",function(){
		couponObj.get_data($(this).val());
	});
			
	// 오프라인 매장 선택 사용 여부
	$("input:radio[name='sale_store']").on("click",function(){
		if($(this).val() == "off"){
			couponObj.set_required_view($(".t_ordersheet th").eq(0));
			$(".t_ordersheet").show();
			$(".t_ordersheet input[name='sale_store_item[]']").show();
		}else{
			$(".t_ordersheet").hide();
			$(".t_ordersheet input[name='sale_store'][value='on']").prop("checked",true);
		}
	});

	//발급방법 세팅
	$("select[name='coupon_type']").on("change",function(){
		var coupon_type		= $(this).children("option:selected").val();
		var issued_method	= couponObj.set_coupon_issued_method(coupon_type);
	});

	//혜택 부담 설정 > 대상 선택(A본사, AOP 본사 or 입점사, NONE : 없음)
	$("input:radio[name='discount_seller_type']").on("click",function(){
		couponObj.form_salescost($(this).val(),"click");
	});

	// 혜택 :: 정률 일때 최대 100 이상 입력 금지, 3자릿수 이상 입력 금지
	$("input[name='goodsSalePrice']").on("keyup",function(){
		if($("select[name='saleType'] option:selected").val() == "percent"){
			couponObj.percent_input_check($(this));
		}
	});

	
	// 발급상태 변경.
	$("input[name='issue_stop']").on("click",function(){

			var issue_stop = $(this).val();

			if(issue_stop == 0) issue_stop = 1; else issue_stop = 0;

			addToggle('issue_stop', issue_stop );	

			$(".issue_stop_tmp").html(issue_stop);
			$.ajax({
				'url' : '/admin/coupon_process/issued_status_update',
				'data' : {'couponSeq':couponData.coupon_seq,'issue_stop':issue_stop},
				'type' : 'post',
				'dataType': 'html',
				'dataSrc' : '',
				'success' : function(res){
					if(res == 'true'){
						alert("발급 상태 변경 완료되었습니다.");
						return false;
					}
				}
			});
	});


	// 입점사 부담률 입력
	$("input[name='salescostper']").on("keyup",function(){
		couponObj.set_sale_cost_percent();
	});

	// 입점사 선택
	$(".btn_provider_select").on("click",function(){
		 gProviderSelect.open({'select_lists':'salescost_provider_list[]'});
	});
	// 회원등급 선택
	$(".btn_member_grade_select").on("click",function(){
		 gMemberGradeSelect.open({'select_lists':'member_grade_list[]'});
	});

	// 상품선택
	$(".btn_select_goods").on("click",function(){
		var discount_seller_type	= $("input[name='discount_seller_type']:checked").val();
		var select_provider			= 1;
		if(couponObj.return_coupon_form('discount_seller_type') == 'A' || couponObj.return_coupon_form('discount_seller_type') == 'ALL'){
			select_provider = '';
		}else{
			if(discount_seller_type == 'all'){
				select_provider = '';
			}else if(discount_seller_type == 'seller'){
				select_provider = '';
				if($("input[name='salescost_provider_list[]']").length == 0){
					alert("적용대상이 '입점사 상품' 입니다. 입점사를 먼저 지정해 주세요.");
					return false;
				}
				$("input[name='salescost_provider_list[]']").each(function(e){
					if(e > 0) select_provider += '|';
					select_provider += $(this).val();
				});
			}
		}
		
		gGoodsSelect.open({'goodsNameStrCut':30,'selectProviders':select_provider,'service_h_ad':window.Firstmall.Config.Environment.serviceLimit.H_AD});
	});

	// 카테고리 선택
	$(".btn_category_select").on("click",function(){
		gCategorySelect.open();
	});

	// 유입경로 선택
	$(".btn_referersale_select").on("click",function(){
		gRefererSelect.open({'select_lists':'referersale_seq[]'});
	});
	
	//선택삭제
	$(".t_goods_category_limit .select_goods_del").on("click",function(){
		gGoodsSelect.select_delete('chk',$(this));
	});

	//전체선택
	$("input[name='chkAll']").on("click",function(){
		$type		= $(this).val();
		$("."+$type+"_list table .chk").prop("checked",$(this).is(":checked"));
	});

	// 상품 최대 00원 할인 노출/비노출
	$("select[name='saleType']").on("change",function(){
		couponObj.set_goods_sales_select($(this).val());
	});

	// 배송비 00원 할인 노출/비노출
	$("select[name='shippingType']").on("change",function(){
		couponObj.set_shipping_sales_select($(this).val());
	});

	// 마일리지 제한 - 마일리지 유효기간 설정
	$("input[name='period_limit']").on("click",function(){

		$(".ui_benefit_setting tr.t_period_limit").toggle();
		if($(this).val() == "limit"){
			$(".ui_benefit_setting tr.t_period_limit .mileage").show();
			$(".ui_benefit_setting tr.t_period_limit .normal").hide();
		}else{
			$(".ui_benefit_setting tr.t_period_limit .mileage,").hide();
			$(".ui_benefit_setting tr.t_period_limit .normal").show();
		}

	});

	// 쿠폰발급 ::  시간제한 체크박스 선택 시
	$("tr.t_coupon_download_period_use input[name='download_period_use']").on("click",function(){ 
		if($(this).val() == "limit"){
			$("tr.t_coupon_issued").show();
			
			if($("input:checkbox[name='time_limit']").is(":checked") == true){
				$("tr.t_time_limit").show();
			}else{
				$("tr.t_time_limit").hide();
			}
			if($("input:checkbox[name='dayoftheweek_limit']").is(":checked") == true){
				$("tr.t_dayoftheweek_limit").show();
			}else{
				$("tr.t_dayoftheweek_limit").hide();
			}

		}else{
			$("tr.t_coupon_issued").hide();
		}
	});

	// 쿠폰발급 ::  시간제한 체크박스 선택 시
	$("input:checkbox[name='time_limit']").on("click",function(){ $("tr.t_time_limit").toggle(); });

	// 쿠폰발급 :: 요일 제한 체크박스 선택 시
	$("input:checkbox[name='dayoftheweek_limit']").on("click",function(){ 
		$("tr.t_dayoftheweek_limit").toggle(); 
	});

	// 인증번호발급 > 발급설정 :: 자동, 수동 선택 시 발급 방식 노출
	$("input:radio[name='certificate_issued_type']").on("click",function(){
		couponObj.form_issued_number_basic_set($(this).val());
	});

	// 인증번호발급 > 발급방식
	$("input:radio[name='offline_type']").on("click",function(){
		couponObj.form_issued_number_event($(this).val());
	});

	// 인증번호발급 > 발급방식
	$("select[name='offlineLimit_one']").on("change",function(){
		if($(this).val() == "limit"){
			$(".t_offlineLimit_one .offlineLimitEa_one").show();
		}else{
			$(".t_offlineLimit_one .offlineLimitEa_one").hide();
		}
	});

	// 인증번호발급 > 발급방식
	$("select[name='offlineLimit_input']").on("change",function(){
		if($(this).val() == "limit"){
			$(".t_offlineLimit_input .offlineLimitEa_input").show();
		}else{
			$(".t_offlineLimit_input .offlineLimitEa_input").hide();
		}
	});
	
	$('#offline_coupon_copy').click(function(){
		var offline_input_serialnumber =  $(this).attr('offline_input_serialnumber');
		clipboard_copy(offline_input_serialnumber);
		alert("인증번호가 복사되었습니다.\nCtrl+V로 붙여넣기 하세요.");
	});

	// 쿠폰 사용 제한 :: 상품/카테고리 제한 선택
	$("input:radio[name='issue_type']").on("click",function(){
		couponObj.form_issue_type_event($(this).val());
	});

	// 쿠폰 사용 제한 :: 유입경로할인제한
	$("input:radio[name='sale_referer']").on("click",function(){
		couponObj.form_sale_referer_event($(this).val());
	});

	// 쿠폰 사용 제한 :: 유입경로선택
	$("input:radio[name='sale_referer_type']").on("click",function(){
		couponObj.form_sale_referer_type_event($(this).val());
	});

	// 인증번호 발급 수 체크
	$("input[name='offline_random_num']").on("keyup",function(){
		var count			= parseInt($(this).val());
		var admin_rate		= parseInt(100);

		if(count > 10000){
			$(this).parent().find("span.msg").html("* 인증번호 발급 수는 최대 '10000'개 까지 가능합니다.");
			$(this).val('');
		}else if(count <= 10000 && count > 0){
			$(this).parent().find("span.msg").html("");
		}
	});

	$(".batchExcelRegist").on("click",function(){
		$("#ExcelUploadDialog").dialog("open");
	});

	// 21.05.10 lsh 쿠폰 엑셀 양식 다운로드
	$(".offline_coupon_form").click(function(){
		document.location.href = $(this).attr('offline_coupon_form');
	});

	openDialog("엑셀 등록", "ExcelUploadDialog", {"width":630,"height":325,"autoOpen":false,"close":function(){
		$("#ExcelUploadButton").val('');
	}});

	// 쿠폰이미지
	$("input:radio[name='coupon_image_set']").on("click",function(){
		couponObj.form_coupon_image_set($(this).val());
	});

	/**
	** image mouseover/mouseout
	**/

		$(".couponImg").on("mouseover",function(){
			$("img[class='coupon_img'][no="+$(this).attr("no")+"]").attr("src",$(this).attr("src_orign"));
		});
		$(".couponImg").on("mouseout",function(){
			$("img[class='coupon_img'][no="+$(this).attr("no")+"]").attr("src",$(this).attr("src_sample"));
		});
		$(".couponMobileImg").on("mouseover",function(){
			$("img[class='coupon_mobile_img'][no="+$(this).attr("no")+"]").attr("src",$(this).attr("src_orign"));
		});
		$(".couponMobileImg").on("mouseout",function(){
			$("img[class='coupon_mobile_img'][no="+$(this).attr("no")+"]").attr("src",$(this).attr("src_sample"));
		});

		// 라이트형 쿠폰 이미지 :: 2019-01-07 lwh
		$(".couponImg_light_1").on("mouseover",function(){
			$("#couponImg_light_1_src").attr("src",$(this).attr("src_orign"));
		});
		$(".couponImg_light_1").on("mouseout",function(){
			$("#couponImg_light_1_src").attr("src",$(this).attr("src_sample"));
		});
		
		// PC 쿠폰 이미지 등록 버튼 클릭 시
		$(".batchImageRegist").on("click",function(){
			$("#imagetype").val('pc');
			showImageUploadDialog2();			
		});
		
		// PC 쿠폰 이미지 등록 팝업
		openDialog("이미지 업로드 <span class='desc'>이미지 파일을 업로드합니다.</span>", "imageUploadDialog", {"width":500,"height":250,"autoOpen":false,"close":function(){
			$("#imageUploadButton").val('');
		}});
		
		// MOBILE 쿠폰 이미지 등록 버튼 클릭 시
		$(".batchmobileImageRegist").on("click",function(){
			$("#imagetype").val('mobile');
			showmobileImageUploadDialog();
		});

		// MOBILE 쿠폰 이미지 등록 팝업
		openDialog("이미지 업로드 <span class='desc'>이미지 파일을 업로드합니다.</span>", "mobileimageUploadDialog", {"width":500,"height":250,"autoOpen":false,"close":function(){
			$("#mobileimageUploadButton").val('');
		}});

	//------------------------------------------------------------------------------------------------------------------



	//$("input:radio[name='discount_seller_type']").trigger('click');


	// 쿠폰URL복사
	$("#couponurlbtn").on("click", function(){
		clipboard_copy($("#couponurlbtn").attr("code"));
		alert('주소가 복사되었습니다.\nCtrl+V로 붙여넣기 하세요.');
	});


	//수동생성 > 인증번호보기
	$(".offline_coupon_view").on("click", function(){
		addFormDialog('./offline_coupon?no='+couponData.coupon_seq, '480', '750', '['+couponData.coupon_name+'] 인증번호 보기 ','false');
	});

	//수동생성 > 인증번호 엑셀 다운받기
	$(".offline_coupon_excel_down").on("click", function(){
		document.location.href='../coupon_process/offline_coupon_exceldown?no='+couponData.coupon_seq;
	});

	$("input[name='issueDate[]']").on("click", function(){
		$("input[name='issuePriodType'][value='date']").prop("checked","checked");
	});
	$("input[name='offline_reserve_year']").on("click", function(){
		$("input[name='issuePriodType'][value='year']").prop("checked","checked");
	});
	$("input[name='offline_reserve_direct']").on("click", function(){
		$("input[name='issuePriodType'][value='direct']").prop("checked","checked");
	});
	$("input[name='afterIssueDay']").on("click", function(){
		$("input[name='issuePriodType'][value='day']").prop("checked","checked");
	});
	$("input[name='downloadLimitEa']").on("click", function(){
		$("input[name='downloadLimit'][value='limit']").prop("checked","checked");
	});

	var left_scroll_x;
	var left_scroll_y;
	var right_scroll_y;
	var xxx = 0;
	$('.t_select_goods .goods_list').mouseover(function() {
		$('.t_select_goods .goods_list').on('scroll', function() {
			left_scroll_x = $('.goods_list').scrollLeft();
			$('.t_select_goods .goods_list_header').scrollLeft( left_scroll_x );
		});
	});

	/*
	엑셀등록 시작
	*/
	/* 파일업로드버튼 ajax upload 적용 */
	var opt			= {
		"addData" : "allow_types=xls"
	};
	var callback	= function(res){
		var that		= this;
		var result		= eval(res);

		if(result.status){
			$("#ExcelUploadButton").val('');
			$(".offline_file").val(result.fileInfo.file_name);
			$(".offline_file_name").html(result.fileInfo.file_name);
			closeDialog("ExcelUploadDialog");
		}else{
			alert(result.msg);
			$("#ExcelUploadButton").val('');
		}
	};

	// 엑셀업로드 이벤트 바인딩
	$('#ExcelUploadButton').createAjaxFileUpload(opt, callback);
	/*
	엑셀 등록 종료
	*/
	/* 파일업로드버튼 ajax upload 적용 */
	var opt			= {};
	var callback	= function(res){
		var that		= this;
		var result		= eval(res);

		if(result.status){
			
			var image_indicator = null;
			var imagetype		= $("#imagetype").val();

			if( imagetype == 'mobile' ) {
				$("#couponmobileimage4lay").html('');
				$("#coupon_mobile_image4").val('');
				$("#couponmobileimage4lay").html("<img src='" + result.filePath + result.fileInfo.file_name + "' /> ");
				$("#couponmobileimage4").val( result.fileInfo.file_name);
				$("#mobileimageUploadButton").val('');
				$("#mobileimageUploadDialog").dialog("close");

			}else{

				$("#couponimage4lay").html('');
				$("#coupon_image4").val('');
				$("#couponimage4lay").html("<img src='" + result.filePath + result.fileInfo.file_name + "' /> ");
				$("#couponimage4").val( result.fileInfo.file_name);
				$("#imageUploadButton").val('');
				$("#imageUploadDialog").dialog("close");

			}

		}else{ // 업로드 실패
			alert('[' + result.desc + '] ' + result.msg);
			return false;
		}
	};

	// ajax 이미지 업로드 이벤트 바인딩
	$('#imageUploadButton').createAjaxFileUpload(opt, callback);
	$('#mobileimageUploadButton').createAjaxFileUpload(opt, callback);

});


function selectItemDelete(obj){
	gGoodsSelect.select_delete('minus',$(obj));
}

/* PC 이미지 업로드 레이어 보기 */
function showImageUploadDialog2(){
	nowPath = "data/tmp";
	$("#imageUploadDialog .uploadPath").html(nowPath);
	$("#imageUploadDialog").dialog("open");

}

/* MOBILE 이미지 업로드 레이어 보기 */
function showmobileImageUploadDialog(){
	nowPath = "data/tmp";
	$("#mobileimageUploadDialog .uploadPath").html(nowPath);
	$("#mobileimageUploadDialog").dialog("open");

}

//인쇄용 엑셀등록
function offlineexcelsave(coupon_seq)
{
	var coupon_name = $("input[name='couponName']").val();
	var filename	= $(".offline_file").val();
	addExcelFormDialog('./offline_excel?filename='+ filename +'&no='+coupon_seq, '45%', '800', '['+coupon_name+'] 인증번호 일괄등록 ','close',coupon_seq, 'resp_btn v3 size_XL');
}

/**
 * 신규생성 다이얼로그 창을 띄운다.
 * <pre>
 * 1. createElementContainer 함수를 이용하여 매번 div 태그를 입력하지 않고 다이얼로그 생성시 자동으로 생성한다.
 * 2. refreshTable 함수를 이용하여 다이얼로그 내용 부분을 불러온다.
 * </pre>
 * @param string url 폼화면 주소
 * @param int width 가로 사이즈
 * @param int height 세로 사이즈
 * @param string title 제목
 * @param string btn_yn 'false'이면 닫기버튼만 나타낸다.
 */
function addExcelFormDialog(url, width, height, title, btn_yn, coupon_seq, class_name) {
	newcreateElementContainer(title);
	newrefreshTable(url);

	if (btn_yn != 'false') {
		var buttons = {
			'닫기': function() {
				$(this).dialog('close');
			},
			'저장하기': function() {
				$('#form1').submit();
			}
		}
	}
	
	if (btn_yn == 'close') {
		var buttons =  [{
			text:"닫기",
			class : class_name,
			click: function() {
				document.location.href='./regist?no='+coupon_seq+'&mode=new';
			}
		}]		
	}

	$('#dlg').dialog({
		bgiframe: true,
		autoOpen: false,
		width: width,
		height: height,
		resizable: false,
		draggable: false,
		modal: true,
		overlay: {
			backgroundColor: '#000000',
			opacity: 0.8
		},
		buttons: buttons,
		open: function() {
				$("#ui-datepicker-div").css("z-index",
				$(this).parents(".ui-dialog").css("z-index")+1);
		},
		close: function() {
			document.location.href='./regist?no='+coupon_seq;
		}
	}).dialog('open');
	return false;
}

// 쿠폰 신규등록 후 뒤로가기 눌렀을 때 무조건 쿠폰 리스트로 이동하게 고정.
if($("form[name='couponRegist']").attr("data-mode") == "new"){
	history.pushState(null, null, location.href);
		window.onpopstate = function () {
			document.location.href="/admin/coupon/catalog";
	};
}