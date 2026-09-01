/**
 * [공용] 쿠폰 수동발급 openDialog
 * gCouponIssued.open({CallbackFunction})
*/

var gCouponIssued = (function () {

	//
	var callbackFun		= function(){};
	var _options		= {};

	var CouponIssuedDefaults	= {
		width				: 620,
		height				: 650,
		divSelectLay		: "lay_coupon_issued",
		divSelectTitle		: "쿠폰 발급",
		url					: '/admin/coupon/gl_coupon_issued',
		method				: 'post',
		issued_seq			: '',
		download_limit		: '',
		autoClose			: false,
	};

	var selectLayer			= "";
	var selectLayerTitle	= "";

	/*
	 * 초기 세팅
	 */
	var _init = function (options) {

		_options		= $.extend(CouponIssuedDefaults, options);
		selectLayer		= $("div#"+_options.divSelectLay);

		if (selectLayer.html() == "") {

			_searchIssued(1);
			_openSetting();

			// 이벤트 설정
			$(document).on('submit', '#'+ _options.divSelectLay+' #selectIssuedFrm', _searchIssued);
			//$(document).on('click', '#'+ _options.divSelectLay+' #selectSearchButton', _searchIssued);
			$(document).on('click', '#'+ _options.divSelectLay+' .btnLayClose', _close);
			$(document).on('click', '#'+ _options.divSelectLay+' .confirmSelectIssued', _submitSelectIssued);
			$(document).on('click', '#'+ _options.divSelectLay+' input[name="target_type"]', _targetTypeSelect);

		}else{
			_reset();
		}

	}

	/**
	* 검색 초기화
	**/
	var _reset = function (){
		$("input[name='sc_coupon_issued_name']").val("");
		_searchIssued(1);
		_openSetting();
	}

	/*
	레이어창 오픈시 필드값 재정의
	*/
	var _openSetting = function(){

		_targetTypeSelect();

		$('#'+ _options.divSelectLay+' input[name="no"]').val();
		$('#'+ _options.divSelectLay+' input[type="checkbox"][name="memberGroup"]:checked').each(function(){
			$(this).attr("checked",false);
		});
		$('#'+ _options.divSelectLay+' #target_container').html('');
		$('#'+ _options.divSelectLay+' #member_search_count').html(0);
	}

	/**
	 * 쿠폰 선택 팝업 열기
	 */
	var _open = function (options,callback) {

		_setCallback(callback);
		_init(options);

		_setDownloadInfo();

		openDialog(_options.divSelectTitle, _options.divSelectLay, {"width":_options.width,"height":_options.height});

	}

	/**
	* 리스트 불러오기
	**/
	var _searchIssued = function (page) {

		var issued_type			= _options.issued_type;
		var issued_seq			= _options.issued_seq;
		var download_limit		= _options.download_limit;	//전체회원수
		var divSelectLay		= _options.divSelectLay;

		var params			= "issued_type="+issued_type+"&issued_seq="+issued_seq+"&download_limit="+download_limit+"&divSelectLay="+divSelectLay;

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

	//쿠폰의 다운로드 등급설정시 추가
	var _downloadmembergroup = function(newgroup) {

		var returns = false;
		var newcheckedId = "input[name$='download_memberGroups[]']";
		var newidx = ($(newcheckedId).length);
		if(newidx > 0) {
			$(newcheckedId).each(function(e, newdata) {
				if( parseInt(newgroup) == parseInt($(newdata).val()) ) {
					returns = true;
					return false;
				}
			});
		}else{
			returns = true;
		}
		return returns;
	}


	// 발급대상선택
	var _targetTypeSelect = function(){

		$('#'+ _options.divSelectLay+' .t_target').hide();

		var target_type = $('#'+ _options.divSelectLay+' input[name="target_type"]:checked').val();
		if(target_type  != "all"){
			$('#'+ _options.divSelectLay+' .t_'+target_type).show();
			$('#'+ _options.divSelectLay+' .tb_target tr:first-child th,#'+ _options.divSelectLay+' .tb_target tr:first-child td').attr("style","border-bottom:0px");
			if(target_type  == "member_grade"){
				if($("#groupsMsg").html() == ''){
					$("#groupsMsg").html('발급할 회원등급을 선택해 주세요.');
				}
				//$('#'+ _options.divSelectLay).height(480);
			}else{
				//$("#groupsMsg").html('');
				//$('#'+ _options.divSelectLay).height(640);
			}
		}else{
			//$('#'+ _options.divSelectLay).height(380);
			$('#'+ _options.divSelectLay+' .tb_target tr:first-child th,#'+ _options.divSelectLay+' .tb_target tr:first-child td').attr("style","border-bottom:1px solid #ccc");
		}

	}

	/**
	 * 콜백 함수 지정
	 */
	var _setCallback = function (callback) {
		if (typeof callback === 'function') {
			callbackFun = callback;
		} else {
			callbackFun= null;
		}
	}

	/**
	 * 콜백함수 가져오기
	 */
	var _getCallback = function () {
		return callbackFun;
	}

	//쿠폰 정보 세팅
	var _setDownloadInfo = function(){

		var url		= "../coupon_process/download_coupon_info";
		var data	= {'couponSeq':_options.issued_seq};

		if(_options.issued_type == "promotion"){
			_options.divSelectTitle = "프로모션 발급";

			url		= "../promotion_process/download_promotion_info";
			data	= {'promotionSeq':_options.issued_seq};
		}

		$("#target_member").val('');//초기화
		$("#groupsMsg").html('');
		$("#target_container").html('');
		$("#member_search_count").html(0);

		$.ajax({
			'url'		: url,
			'data'		: data,
			'type'		: 'post',
			'dataType'	: 'json',
			'success'	: function(data){

				if(data == null) return false;

				var dlwrite_1 = "";

				$('#'+_options.divSelectLay+' #downloadmbtotalcountlay').html(data.downloadmbtotalcountlay);

				if(_options.issued_type == "promotion"){

					_options.downloadtotal		= data.promotion.downloadtotal;
					_options.download_limit_ea	= data.promotion.download_limit_ea;

					if( data.promotion.type != 'promotion_point' ) {
						dlwrite_1 = get_currency_price(data.promotion.limit_goods_price,2,'basic')+" 이상 구매 시 &nbsp";
					}

					$('#'+_options.divSelectLay+' #dlwrite_1').html(dlwrite_1);
					$('#'+_options.divSelectLay+' #dlwrite_2').html(data.promotion.issuedate);
					$('#'+_options.divSelectLay+' #dlwrite_3').html(data.promotion.salepricetitle);
					$('#'+_options.divSelectLay+' #dlwrite_4').html(data.downusecountlay);
					$('#'+_options.divSelectLay+' #dlwrite_5').html(data.promotion.promotion_name);

					$('#'+_options.divSelectLay+' .issued_title_name').html(data.promotion.promotion_name);
					$('#'+_options.divSelectLay+' input[name="issued_title_name"]').val(data.promotion.promotion_name);
				}else{

					_options.downloadtotal		= data.coupon.downloadtotal;
					_options.download_limit_ea	= data.coupon.download_limit_ea;

					if( data.coupon.type != 'offline_emoney' ) {
						dlwrite_1 = get_currency_price(data.coupon.limit_goods_price,2,'basic')+" 이상 구매 시&nbsp";
					}
					$('#'+_options.divSelectLay+' #dlwrite_1').html(dlwrite_1);
					$('#'+_options.divSelectLay+' #dlwrite_2').html(data.coupon.issuedate);
					$('#'+_options.divSelectLay+' #dlwrite_3').html(data.coupon.salepricetitle);

					$('#'+_options.divSelectLay+' .issued_title_name').html(data.coupon.coupon_name);
					$('#'+_options.divSelectLay+' input[name="issued_title_name"]').val(data.coupon.coupon_name);
				}
			}
		});

		$("#"+_options.divSelectLay+" input[name='target_type']").prop("checked",false);

		//누적제한인경우 회원선택만 사용 가능.
		if(_options.download_limit == 'limit'){
			$("#"+_options.divSelectLay+" input[name='target_type'][value='member_select']").prop("checked",true);
			$("#"+_options.divSelectLay+" input[name='target_type'][value='all']").attr("disabled","disabled");
			$("#"+_options.divSelectLay+" input[name='target_type'][value='member_grade']").attr("disabled","disabled");
		}else{
			$("#"+_options.divSelectLay+" input[name='target_type'][value='all']").prop("checked",true);
			$("#"+_options.divSelectLay+" input[name='target_type'][value='member_select']").removeAttr("disabled");
			$("#"+_options.divSelectLay+" input[name='target_type'][value='member_grade']").removeAttr("disabled");
		}

		_targetTypeSelect();
		//$("#"+_options.divSelectLay+" input[name='target_type']").trigger("click");
	}

	// 선택한 쿠폰 콜백으로 리턴
	var _submitSelectIssued = function (){

		try
		{
			var frm 		= $('#'+ _options.divSelectLay+' form[name="downloadwriteform"]');
			var actionUrl 	= '';

			switch(_options.issued_type){
				case "promotion":
					actionUrl = "../promotion_process/download_write";
				break;
				case "coupon":
					actionUrl = "../coupon_process/download_write_new";
				break;
			}

			if(actionUrl == ''){
				throw "잘못된 접근입니다. [발행 타입이 불명확합니다.]";
			}

			frm.attr("action",actionUrl);
			frm.attr("target","actionFrame");
			frm.submit();

		}
		catch (error)
		{
			alert(error);
			return false;
		}

	}

	// 회원등급 선택
	var _callbackSetMemberGrade = function(json,mode){

		//
		try
		{
			if(typeof json == ""){
				throw "선택한 회원등급이 없습니다";
			}

			if(typeof json != "string"){
				throw "선택한 회원등급 데이터가 type::String 이 아닙니다.";
			}

			var data = $.parseJSON(json);

			if(typeof data != "object"){
				throw "선택한 회원등급 데이터가 type::Object 가 아닙니다.";
			}

			if(typeof mode == "undefined") mode = "";

			if(mode == "del"){
				var del_lists = new Array();
				$.each(data, function(key, list){ del_lists[key] = list.member_grade_seq; });
			}

			var save_member_grade = new Array();
			var idx = 0;
			$("#"+ _options.divSelectLay+" input[name='memberGroups[]']").each(function(e){
				var member_grade_seq = $(this).val();
				if(mode == "del"){
					if($.inArray(member_grade_seq,del_lists) == -1){
						save_member_grade[idx] = '<span class="mgroups">'+$("#"+ _options.divSelectLay+" input[name='memberGroups[]'][value='"+member_grade_seq+"']").closest("span").html()+'</span>';
						idx++;
					}
				}else{
					save_member_grade[e] = member_grade_seq;
				}
			});

			if(mode == "del" && save_member_grade.length > 0){
				$("#"+ _options.divSelectLay+" #groupsMsg").html(save_member_grade.join(", "));
				return false;
			}

			var existing_data	= $("#"+ _options.divSelectLay+" #groupsMsg").html();
			var group_list		= new Array();

					if(mode == "del"){
						$("#"+ _options.divSelectLay+" input[name='memberGroups[]'][value='"+list.member_grade_seq+"']").closest("span[no='"+list.member_grade_seq+"']").remove();
					}

			if(typeof existing_data == "undefined"){
				throw "선택한 등급을 등록할 수 없습니다.";
			}
			if(existing_data == "발급할 회원등급을 선택해 주세요.") existing_data = "";

			$.each(data, function(key, list){
				if($.inArray(list.member_grade_seq,save_member_grade) == -1){
					group_list[key] = '<span class="mgroups"><input type="hidden" name="memberGroups[]" value="'+list.member_grade_seq+'"><span>'+list.member_grade_title+'</span></span>';
				}
			});

			if(group_list.length > 0){

				if(existing_data != ""){ existing_data += ", "; }

				existing_data += group_list.join(", ");
				$("#"+ _options.divSelectLay+" #groupsMsg").html(existing_data);
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

		openSetting: _openSetting,

		// 쿠폰 검색
		searchCouponIssued: _searchIssued,

		//선택한 쿠폰 전달
		submitSelectCouponIssued: _submitSelectIssued,

		setDownloadInfo: _setDownloadInfo,

		targetTypeSelect: _targetTypeSelect,

		downloadmembergroup: _downloadmembergroup,
		callbackSetMemberGrade:_callbackSetMemberGrade,

		//창 닫기
		close: _close
	}

})();