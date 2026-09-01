function displaySearchFilter() {
	displaySearchSellerFilter();
	displaySearchDetailFilter();
}
/* +++++++++++++++++++++++ 검색 입력창 ++++++++++++++++++++++++ */
//컬러 필터 - 255, 255, 255 --> border
function filterSort(sVal, ulClassName) {
	var ulObj = $('.' + ulClassName);
	var items = ulObj.find('li').get();
	items.sort(function (a, b) {
		if (sVal == 'cntindex') {
			var keyA = parseInt($(a).find("label").attr('data-cntindex'));
			var keyB = parseInt($(b).find("label").attr('data-cntindex'));
		} else {
			var keyA = $(a).find("label").text();
			var keyB = $(b).find("label").text();
		}
		if (keyB > keyA) return -1;
		if (keyA > keyB) return 1;
		return 0;
	});
	$.each(items, function (i, li) {
		ulObj.append(li);
	});
}
function searchObject() {
	var uObj = {};
	var iColor = 0;
	var iDelivery = 0;
	var iBrand = 0;
	var iTag = 0;
	var iSubcategory = 0;
	var iRating = 0;
	$("form#goodsSearchForm input[type='hidden'], #searchFilterSelected input[type='hidden']").each(function () {
		var uObjName = '';
		var regex = /color/gi;
		var bColor = regex.exec($(this).attr('name'));
		regex = /brand/gi;
		var bBrand = regex.exec($(this).attr('name'));
		regex = /delivery/gi;
		var bDelivery = regex.exec($(this).attr('name'));
		regex = /tag/gi;
		var bTag = regex.exec($(this).attr('name'));
		regex = /subcategory/gi;
		var bSubcategory = regex.exec($(this).attr('name'));
		regex = /rating/gi;
		var bRating = regex.exec($(this).attr('name'));
		var sVal = $(this).val();
		if (sVal && sVal != 'undefined') {
			if (bColor) {
				uObjName = $(this).attr('name').replace('\[\]', '\[' + iColor + '\]');
				iColor++;
			} else if (bDelivery) {
				uObjName = $(this).attr('name').replace('\[\]', '\[' + iDelivery + '\]');
				iDelivery++;
			} else if (bBrand) {
				uObjName = $(this).attr('name').replace('\[\]', '\[' + iBrand + '\]');
				iBrand++;
			} else if (bSubcategory) {
				uObjName = $(this).attr('name').replace('\[\]', '\[' + iSubcategory + '\]');
				iSubcategory++;
			} else if (bTag) {
				uObjName = $(this).attr('name').replace('\[\]', '\[' + iTag + '\]');
				iTag++;
			} else if (bRating) {
				uObjName = $(this).attr('name').replace('\[\]', '\[' + iRating + '\]');
				iRating++;
			} else {
				uObjName = $(this).attr('name');
			}
			uObj[uObjName] = $(this).val();
		}
	});
	$("form#goodsSearchForm select[name='per'] option").each(function () {
		if ($(this).prop("selected")) uObj['per'] = $(this).val();
	});
	sVal = $("form#goodsSearchForm input[name='sorting']:checked").val();
	if (sVal && sVal != 'undefined') {
		uObj['sorting'] = sVal;
	}
	sVal = $("form#goodsSearchForm input[name='filter_display']:checked").val();
	if (sVal && sVal != 'undefined') {
		uObj['filter_display'] = sVal;
	}

	// 검색에 필요한 parameter 이외 다른 parameter 유지되도록 개선
	var search = new URLSearchParams(window.location.search);
	search.forEach(function (value, key) {
		if (/^(ftag|brand|color|delivery|subcategory|min_price|max_price|rating)/i.test(key)) return;
		if (typeof uObj[key] === "undefined") {
			uObj[key] = value;
		}
	});

	return uObj;
}
/* +++++++++++++++++++++++ 검색 입력창 ++++++++++++++++++++++++ */

/* +++++++++++++++++++++++ 최근 본 상품 ++++++++++++++++++++++++ */
function todayViewRemove(bObj) {
	var obj = $(bObj);
	var uObj = { 'goods_seq': obj.parent().data('value') };
	var postParams = jQuery.param(uObj);
	$.ajax({
		'type': "post",
		'url': '/common/mybag_goods_today_del',
		'data': postParams,
		'async': false,
		'dataType': 'json',
		'success': function (result) {
			obj.parent().remove();
			todayViewList();
		}
	});
}

/* +++++++++++++++++++++++ 최근 본 상품 ++++++++++++++++++++++++ */
/* +++++++++++++++++++++++ 최근 검색어 ++++++++++++++++++++++++ */
function searchRecentRemove(bObj) {
	var obj = $(bObj);
	var oData = obj.data('value');
	var uObj = { 'recent_seq': oData };
	var postParams = jQuery.param(uObj);
	$.ajax({
		'type': "post",
		'url': '/stats_process/search_recent_del',
		'data': postParams,
		'async': false,
		'dataType': 'json',
		'success': function (result) {
			displaySearchRecentRemove(obj, oData);
			searchRecentList();
		}
	});
}
function setRecentAuto(sMode) {
	var sAuto = 'on';
	var sToggle = 'off';
	$.ajax({
		'type': "get",
		'url': '/stats/search_recent_auto',
		'dataType': 'json',
	})
		.always(function (result) {
			if (result.auto == 'off') sAuto = 'off';
			if (sAuto == 'off') sToggle = 'on';
			if (sMode == 'toggle') {
				var uObj = { 'auto': sAuto };
				var postParams = jQuery.param(uObj);
				$.ajax({
					'type': "post",
					'url': '/stats_process/set_search_recent_auto',
					'async': false,
					'data': postParams,
					'dataType': 'json',
					'success': function (result) {
						sAuto = sToggle;
						displaySetRecentAuto(sAuto);
					}
				});
			}
		});
}
function showAutoComplete(sKeyword) {
	var uObj = { 'keyword': sKeyword };
	var postParams = jQuery.param(uObj);
	$.ajax({
		'type': "get",
		'url': '/stats/search_auto_complete',
		'async': true,
		'data': postParams,
		'dataType': 'json',
		'success': function (result) {
			displayShowAutoComplete(result);
		}
	});
}
//자동 검색 단어 선택
function setAutoComplete(sKeyword) {
	$('#searchVer2InputBox').val(sKeyword);
	$("form#topSearchForm").submit();
}
function setUseAuto(sMode) {
	var sAuto = 'on';
	var sToggle = 'off';
	$.ajax({
		'type': "get",
		'url': '/stats/use_auto_complete',
		'dataType': 'json',
	})
		.always(function (result) {
			if (result.auto == 'off') sAuto = 'off';
			if (sAuto == 'off') sToggle = 'on';
			if (sMode == 'toggle') {
				var uObj = { 'auto': sAuto };
				var postParams = jQuery.param(uObj);
				$.ajax({
					'type': "post",
					'url': '/stats_process/set_use_auto_complete',
					'async': false,
					'data': postParams,
					'dataType': 'json',
					'success': function (result) {
						sAuto = sToggle;
					}
				});
			}
			$('#autoCompleteArea .btnAutoComplete').hide();
			if (sAuto == 'off') {
				$('#autoCompleteArea .btnAutoComplete.on').show();
				$('#autoCompleteList').hide();
				$('#autoCompleteGuide').show();
			} else {
				$('#autoCompleteArea .btnAutoComplete.off').show();
				$('#autoCompleteList').show();
				$('#autoCompleteGuide').hide();
			}
		});
}
/* +++++++++++++++++++++++ 최근 검색어 ++++++++++++++++++++++++ */
/* +++++++++++++++++++++++ 찜 ++++++++++++++++++++++++ */
function setWish(bobj) {
	var obj = $(bobj);
	var sMember = obj.data('member');
	var sGoods = obj.data('goods');
	var sWish = obj.data('wish');
	if (!sMember) {
		//회원만 사용가능합니다.\n로그인하시겠습니까?
		if (confirm(getAlert('gv009'))) {
			top.document.location.href = "/member/login?return_url=" + document.location.href;
			return;
		} else {
			return;
		}
	}

	var url = '/mypage/wish_add?seqs[]=' + sGoods;
	if (sWish == '1') {
		url = '/mypage/wish_del?seqs=' + sGoods;
	}

	$.ajax({
		'url': url,
		'type': 'get',
		'success': function (res) {
			if (sWish == '1') {
				obj.closest("div").find("img").hide();
				obj.closest("div").find("img.zzimOffImg").show();
				obj.closest("div").find("img").each(function () {
					$(this).data('wish', '0');
				});
				$("#wish_alert .wa_msg").html(getAlert('gv057'));
			} else {
				obj.closest("div").find("img").hide();
				obj.closest("div").find("img.zzimOnImg").show();
				obj.closest("div").find("img").each(function () {
					$(this).data('wish', '1');
				});
				$("#wish_alert .wa_msg").html(getAlert('gv056'));

				// 채널톡 위시리스트 이벤트
				if (typeof ChannelIO != 'undefined') {
					channeltalk_wish_in(sGoods, 'setWish', obj);
				}

			}
			$("#wish_alert").stop(true, true).show();
			clearInterval(alert_timer);
			alert_timer = setInterval(function () {
				clearInterval(alert_timer);
				$("#wish_alert").stop(true, true).show().fadeOut('slow');
			}, 1000);
		}
	});
}
/* +++++++++++++++++++++++ 찜 ++++++++++++++++++++++++ */
function searchParams() {
	var uObj = searchObject();
	return jQuery.param(uObj);
}
function resetParams() {
	var uObj = searchObject();
	var sUrl = '';
	if (uObj.searchMode == 'catalog') {
		sUrl = '../goods/catalog?category=' + uObj.category;
	}
	if (uObj.searchMode == 'brand') {
		sUrl = '../goods/brand?brand[0]=' + uObj.brand[0];
	}
	if (uObj.searchMode == 'location') {
		sUrl = '../goods/location?location=' + uObj.location;
	}
	if (uObj.searchMode == 'search') {
		sUrl = '../goods/search?osearchtext=' + uObj.osearchtext;
	}
	if (uObj.searchMode == 'best') {
		sUrl = '../goods/best';
	}
	if (uObj.searchMode == 'new_arrivals') {
		sUrl = '../goods/new_arrivals';
	}
	if (uObj.searchMode == 'event_view') {
		sUrl = '../promotion/event_view?event=' + uObj.event;
	}
	if (uObj.searchMode == 'gift_view') {
		sUrl = '../promotion/gift_view?gfit=' + uObj.gfit;
	}
	if (uObj.searchMode == 'mshop') {
		sUrl = '../mshop?provider=' + uObj.provider;
	}
	location.href = sUrl;
}
function link_navi(obj, sUrl) {
	var sCode = '';
	var naviObj = $(obj);
	if (naviObj.find("option:selected").val()) {
		sCode = naviObj.find("option:selected").val();
	}
	if (sCode) {
		sUrl = sUrl + '?code=' + sCode;
	} else {
		sUrl = '/';
	}

	location.href = sUrl;
}
function set_classification(category_code, location_code) {
	var getParams = searchParams();
	var sSearchMode = $("input[name='searchMode']").val();
	// 미니샵 페이지인 경우 처리 내역이 없어 스크립트 오류 발생
	if(sSearchMode == 'mshop'){
		return;
	}
	$.ajax({
		'type': "get",
		'url': '/goods/search_classification',
		'data': getParams + '&classification=1&category_code=' + category_code + '&location_code=' + location_code,
		'dataType': 'json',
		'success': function (result) {
			if (result === null) return;
			if (result.navigation.navi) {
				var oNavi = result.navigation.navi;
				var sNaviLink = result.navigation.link;
				if (typeof (oNavi.__proto__) !== "undefined") {
					oNavi.__proto__ = null;
				}
				display_navi(oNavi, sNaviLink);
			}
			if (sSearchMode == 'brand' || (result.category && result.category.length > 0)) {
				displaySetFilterCategoryPath(sSearchMode, sSearchMode, result.category);
			}
			displaySetFilterCategoryChild(result.category_child);

			if (result.location && result.location.length > 0) {
				displaySetFilterLocationPath(sSearchMode, sSearchMode, result.location);
			}
			displaySetFilterLocationChild(result.location_child);
		}
	});
}

$(function()
{
    // 테그 전체에 클릭 이벤트 발생할 경우 현재 scrolltop 획득하여 cookie에 저장
    $(document).on('click', 'a', function ()
    {
        var scrollHeightPosition = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
        setCookie("scroll_position", scrollHeightPosition);
        return true;
    });
});

function setCookie(cookieName, cookieValue, cookieExpire, cookiePath, cookieDomain, cookieSecure){
    var cookieText= encodeURI(cookieName)+'='+ encodeURI(cookieValue);
    cookieText+=(cookieExpire ? '; EXPIRES='+cookieExpire.toGMTString() : '');
    cookieText+=(cookiePath ? '; PATH='+cookiePath : '');
    cookieText+=(cookieDomain ? '; DOMAIN='+cookieDomain : '');
    cookieText+=(cookieSecure ? '; SECURE' : '');
    document.cookie=cookieText;
}
 
function getCookie(cookieName){
    var cookieValue=null;
    if(document.cookie){
        var array=document.cookie.split((encodeURI(cookieName)+'='));
        if(array.length >= 2){
            var arraySub=array[1].split(';');
            cookieValue=encodeURIComponent(arraySub[0]);
        }
    }
    return cookieValue;
}

function goodsSearch(mode,options) {
	$("#searchedItemDisplay").html('<div style="height:100px;display:block"></div>');
	loadingStart("#searchedItemDisplay", { segments: 16, width: 10, space: 10, length: 5, color: '#7F56D9', speed: 1.5, valign: 'bottom' });

	// 필터 선택 시 필터 선택된 영역 노출
	if (typeof gl_searchFilterUse != 'undefined') {
		if (gl_searchFilterUse == '0') {
			$("#searchFilterSelected").hide();
		} else if (gl_searchFilterUse == '1') {
			$("#searchFilterSelected").show();
		}
	}

	// 첫번째 페이지로 초기화
	if (mode != 'auto') {
		$('form#goodsSearchForm input[name="page"]').val('1');
	}

	// 상품 리스팅 영역 노출
	var getParams = searchParams();
	var trident = navigator.userAgent.match(/Trident\/(\d.\d)/i);
	if (trident && trident[1] == "7.0") { // ie 9
		window.location.pathname + '?' + getParams;
	} else {
		history.replaceState(null, null, '?' + getParams);
	}

	var uObj = searchObject();

	if (mode == 'auto') {
		getParams += "&auto=1";
	}

	$.ajax({
		'type': "get",
		'url': '/goods/search_list',
		'data': getParams,
		'async': true,
		'cache': false,
		'dataType': 'html',
		'success': function (result) {
			$("#searchedItemDisplay").html(result);
		},
		'complete': function (result) {
			// 상품 색상 코드값 디자인( new 상품정보 )
			if ($('.displaY_color_option').length > 0) {
				$('.displaY_color_option .areA').filter(function () {
					return ($(this).css('background-color') == 'rgb(255, 255, 255)');
				}).addClass('border');
			}
			// BEST 페이지 순위 아이콘 넣기
			if ($('#searchedItemDisplay.best_page_ranking').length > 0) {
				$('#searchedItemDisplay.best_page_ranking .item_img_area').each(function (e) {
					var num = (uObj.per) * (uObj.page - 1) + e + 1;
					let fontSize = 35;
					if (num >= 100) {
						fontSize = 25;
					} else if (num >= 10) {
						fontSize = 30;
					}
					var rank_icon = '<div class="item_rank"><span class="num" style="font-size:' + fontSize + 'px;">' + num + '</span></div>';
					$(this).append(rank_icon);
				});
			}
			loadingStop("#searchedItemDisplay", true);
			if (typeof (options) !== "undefined") {
				if (typeof (options.position_top) !== "undefined") {
					$("html").scrollTop($("#"+options.position_top).offset().top);
				}
			}
			else
			{
				var scrollPosition = getCookie("scroll_position"); // 쿠키의 내용을 불러오는 사용자 정의 함수
				if (scrollPosition != "" && scrollPosition != 'undefined') {
					window.scrollTo(0, scrollPosition); // 또는 body.scrollTop(scrollPosition);
					// 쿠키 내용 초기화
					setCookie("scroll_position", "");
				}
			}
			updateFilterCount();
		}
	});
}

function updateFilterCount(){
	var num = $("a.total span.num").text().trim();
	$(".filter_count").html(num + " Items");
}

function setFilterCategoryPath(filterName) {
	var getParams = searchParams();
	var sSearchMode = $("input[name='searchMode']").val();
	set_classification(filterName, '');
}

function setFilterLocationPath(filterName) {
	var getParams = searchParams();
	var sSearchMode = $("input[name='searchMode']").val();
	set_classification('', filterName);
}

function setFilterBrandPath() {
	var getParams = searchParams();
	var sSearchMode = $("input[name='searchMode']").val();
	if (sSearchMode == 'brand') {
		$.ajax({
			'type': "get",
			'url': '/goods/navi',
			'data': getParams,
			'dataType': 'html',
			'success': function (tag) {
				$(".search_nav").html(tag);
				displaySearchBrandFilter();
			}
		});
	}
}

function setFilterTagPath() {
	var getParams = searchParams();
	var sSearchMode = $("input[name='searchMode']").val();
	if (sSearchMode == 'tag') {
		$.ajax({
			'type': "get",
			'url': '/goods/navi',
			'data': getParams,
			'dataType': 'html',
			'success': function (tag_name_tag) {
				$(".search_nav").html(tag_name_tag);
				displaySearchTagFilter();
			}
		});
	}
}


function goodsSearchPage(page) {
	$('form#goodsSearchForm input[name="page"]').val(page);
	var options = {
		'position_top' : 'goodsSearchForm',
	};
	goodsSearch('auto',options);
}

function addCountryDropdownListeners(isMyPage) {
	const countrySearchInput = document.getElementById("countrySearchInput");
	const selectedCountryKey = document.getElementById("countrySearchInputHidden");
	const countryOptionsList = document.getElementById("countryOptionsList");
	const allCountryOptions = Array.from(countryOptionsList.querySelectorAll("li"));
	const wrapper = document.querySelector(".country-select-wrapper");

	// 포커스 시 국가 드롭다운 표시
	countrySearchInput.addEventListener("focus", function () {
		countryOptionsList.classList.remove("country-options-hidden");
	});

	// 사용자가 입력할 때 국가 옵션 필터링
	countrySearchInput.addEventListener("input", function () {
		const filter = countrySearchInput.value.toLowerCase();
		const countryOptionsList = document.getElementById("countryOptionsList");
		const allCountryOptions = Array.from(countryOptionsList.querySelectorAll("li"));
		allCountryOptions.forEach(function (option) {
			const text = option.textContent.toLowerCase();
			if (text.includes(filter)) {
				option.style.display = "";
			} else {
				option.style.display = "none";
			}
		});
	});

		
	// 국가 옵션 클릭 처리
	allCountryOptions.forEach(function (option) {
		option.addEventListener("click", function () {
			countryOptionsList.classList.add("country-options-hidden");
			countrySearchInput.value = option.textContent.trim();

			if (isMyPage) {
				let nation = option.textContent.trim();
				selectedCountryKey.value = nation;
				checkFieldsForSelectedCountry(nation);
			} else {
				selectedCountryKey.value = option.dataset.key;
				$("input[name='state_tax_input']").val('0');
				chg_shipping_nation(option.dataset.nation, option.dataset.key);
			}

		});
	});

	// 외부 클릭 시 국가 드롭다운 숨기기
	document.addEventListener("mousedown", function (event) {
		if (!event.target.closest(".country-select-wrapper")) {
			countryOptionsList.classList.add("country-options-hidden");
		}
	});

	// 포커스가 빠졌을 때 국가 유효성 확인
	countrySearchInput.addEventListener("blur", function () {
		setTimeout(function () {
			const inputValue = countrySearchInput.value.trim().toLowerCase();
			const currentOptions = Array.from(countryOptionsList.querySelectorAll("li"));
			const matchedOption = currentOptions.find(option => option.textContent.trim().toLowerCase() === inputValue);

			if (!matchedOption) {
				countrySearchInput.value = "";
				selectedCountryKey.value = "";
				countrySearchInput.dispatchEvent(new Event('input'));

			}
		}, 150);
	});
}

const countryPhoneCodes = {
	"": "--",
	"ARAB EMIRATES": "+971",
	"AUSTRALIA": "+61",
	"BELGIUM": "+32",
	"BRAZIL": "+55",
	"CANADA": "+1",
	"DENMARK": "+45",
	"FINLAND": "+358",
	"FRANCE": "+33",
	"GERMANY": "+49",
	"GREECE": "+30",
	"HONG KONG": "+852",
	"IRELAND": "+353",
	"ITALY": "+39",
	"JAPAN": "+81",
	"MACAO": "+853",
	"MALAYSIA": "+60",
	"MEXICO": "+52",
	"MONACO": "+377",
	"NETHERLANDS": "+31",
	"NEW ZEALAND": "+64",
	"NORWAY": "+47",
	"PHILIPPINES": "+63",
	"QATAR": "+974",
	"RUSSIAN": "+7",
	"SAUDI ARABIA": "+966",
	"SINGAPORE": "+65",
	"SWEDEN": "+46",
	"SWITZERLAND": "+41",
	"TAIWAN": "+886",
	"THAILAND": "+66",
	"U.S.A": "+1",
	"USA": "+1",
	"UNITED KINGDOM": "+44",
	"VIET NAM": "+84"
};

function populateCountryCodeSelector() {
	const phoneCodeSelect = $(".phone_prefix_select");
	phoneCodeSelect.empty();

	$.each(countryPhoneCodes, function (nation, code) {
		phoneCodeSelect.append(
			`<option value="${code}" nation="${nation}">${code}</option>`
		);
	});
}


function setPhoneCodeByCountry(nation) {
	$(".phone_prefix_select option").prop("selected", false);
	$(`.phone_prefix_select option[nation="${nation}"]`).prop("selected", true);
}

const STATE_REQUIRED_COUNTRIES = {
	"USA": "미국",
	"U.S.A": "미국",
	"CANADA": "캐나다",
	"IRELAND": "아일랜드",
	"AUSTRALIA": "호주",
	"HONG KONG": "홍콩"
};

function addStateDropdownListeners() {
	const searchInput = document.getElementById("stateSearchInput");
	const selectedStateCode = document.getElementById("searchInputHidden");
	const optionsList = document.getElementById("stateOptionsList");

	// 포커스 시 드롭다운 표시
	searchInput.addEventListener("focus", () => {
		optionsList.classList.remove("options-hidden");
	});

	// 사용자가 입력할 때 옵션 필터링
	searchInput.addEventListener("input", () => {
		const filter = searchInput.value.toLowerCase();

		optionsList.querySelectorAll("li").forEach(option => {
			option.style.display = option.textContent.toLowerCase().includes(filter)
				? ""
				: "none";
		});
	});

	// 옵션 클릭 처리
	optionsList.addEventListener("click", (e) => {
		const li = e.target.closest("li");
		if (!li || li.classList.contains("disabled")) return;

		selectState(li);
	});

	// 외부 클릭 시 드롭다운 숨기기
	document.addEventListener("mousedown", (event) => {
		if (!event.target.closest(".state-select-wrapper")) {
			optionsList.classList.add("options-hidden");
		}
	});

	// 포커스가 빠졌을 때 유효성 확인
	searchInput.addEventListener("blur", () => {
		setTimeout(() => {
			const inputValue = searchInput.value.trim().toLowerCase();

			const match = [...optionsList.querySelectorAll("li")]
				.find(li => li.textContent.trim().toLowerCase() === inputValue);

			if (!match) {
				searchInput.value = "";
				selectedStateCode.value = "";
				searchInput.dispatchEvent(new Event('input'));
			}
		}, 150);
	});
}

let lastSelectedCountry = null;

function updateStatesList(country) {
	if (lastSelectedCountry !== null && country === lastSelectedCountry) {
		return;
	}
	lastSelectedCountry = country;

	fetch('/order/get_states_by_country_ajax?country=' + encodeURIComponent(country))
	.then(response => response.json())
	.then(states => {
		const stateSelect = document.querySelector('select[name="state"]');
		while (stateOptionsList.firstChild) {
  			stateOptionsList.removeChild(stateOptionsList.firstChild);
		}
		//document.getElementById("stateSearchInput").value = '';
				
		if (!Array.isArray(states) || states.length === 0) {
			const li = document.createElement('li');
			li.textContent = 'No states found';
			li.classList.add('disabled');
			stateOptionsList.appendChild(li);
			return;
		}

		states.sort((a, b) => {
       			return a.name.localeCompare(b.name);
		});
			
		states.forEach(state => {
			const li = document.createElement('li');
			li.textContent = state.name;
			li.dataset.code = state.code;

			if (state.tax) {
				li.dataset.tax = state.tax;
			}

			stateOptionsList.appendChild(li);
		});

	})
	.catch(error => {
		console.error('Error fetching states:', error);
	});
}

