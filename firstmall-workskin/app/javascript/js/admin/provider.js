
//providerRegist.js -> provider.js로 통합


const providerRegist = (function () {
	/*
	입점사, 카테고리, 상품 선택 javascript
	@2020.02.06
	*/
	const _default = function () {

		$(".categoryList .btn_minus").on("click", function () {
			gCategorySelect.select_delete('minus', $(this));
		});

		//선택삭제
		$(".select_goods_del").on("click", function () {
			gGoodsSelect.select_delete('chk', $(this));
		});

		// 상품선택
		$(".btn_select_goods").on("click", function () {

			const params = {
				'goodsNameStrCut': 30,
				'select_goods': $(this).attr("data-goodstype"),
				'selector': this,
				'service_h_ad': window.Firstmall.Config.Environment.serviceLimit.H_AD
			};
			gGoodsSelect.open(params);
		});
	}

	return {
		default: _default
	}
})();

const remindExportList = (function () {
	/**
	 * remind export 입점사 미출고 현황
	 */
	const init = function () {
		const arrSort = {
			'provider_name DESC': '입점사 명 순',
			'step_25_count DESC': '결제 확인 수 역순',
			'step_35_count DESC': '상품 준비 수 역순',
			'step_45_count DESC': '출고 준비 수 역순'
		};

		gSearchForm.init({ 'pageid': 'provider_order', 'sc': scObj, 'displaySort': arrSort }, checkDateFunc);
		setDatepicker(".datepicker_limit");
	}
	/**
	 * remind export 입점사 sms 발송
	 */
	const send_sms_provider = function (provider_seq, provider_name, providerMobile1, providerMobile2) {
		const cellphone_array = [];

		if (providerMobile1) {
			cellphone_array.push(providerMobile1);
		}
		if (providerMobile2) {
			cellphone_array.push(providerMobile2);
		}

		$.get('../member/sms_pop?provider_seq=' + provider_seq + '&provider_name=' + encodeURIComponent(provider_name) + '&hcellphone=' + encodeURIComponent(cellphone_array.join(',')) + '&type=provider_person', function (data) {
			$('#sms_form').html(data);
		});
		openDialog("SMS 발송", "sendPopup", {"width": "700", "height": "480"});
	}

	return {
		init,
		send_sms_provider,
	}
})();


/** */

function checkDateFunc() {
	var check_edate = date_calculation('', $('.edate').val().split('-'));
	if (check_edate < 3) {
		alert("결제일 3일이 지난 주문부터 검색할 수 있습니다.");
		var maxDate = getTheDate('today', 3);
		$('.edate').val(maxDate);
		return false;
	}
	var check_maxdate = date_calculation($('.sdate').val().split('-'), $('.edate').val().split('-'));
	if (check_maxdate < -29) {
		alert("검색가능한 날짜는 최대 30일입니다.");
		return false;
	}
	if (check_maxdate > 0) {
		alert("검색 시작일보다 마감일이 더 빠릅니다. 검색 날짜를 다시 확인해주세요.");
		return false;
	}

	// 검색하는 경우, 페이지 초기화 필요
	$("input[name='page']").val(0);
	document.remindExportForm.submit();
}

function date_calculation(sdate, edate) {
	var end_date = new Date(edate);
	if (sdate == '') {
		var start_date = new Date();
	} else {
		var start_date = new Date(sdate);
	}
	var diff = start_date - end_date;
	return parseInt(diff / (24 * 60 * 60 * 1000));
}
