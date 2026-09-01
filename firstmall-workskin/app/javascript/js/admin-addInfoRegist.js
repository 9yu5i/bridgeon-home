function setAddInfoRegist() {
	if(!seller_id) {
		$('input, select').attr('disabled', true);
		message	= (mode == 'renew') ? '사용할 수 없는 마켓 필수 정보입니다.' : '선택된 아이디가 없습니다.';
		openDialogAlert(message);
		return;
	}

	//출고 반품지 리스트
	if(typeof setAddress == 'function')
		setAddress();

	switch(mode) {
		case	'marketRenew':
			setRenewAddInfo('all');
			var btnText	= modeText;
			break;
		case	'renew':
			setRenewAddInfo('all');
		default :
			var btnText	= modeText;
	}


	$('#addInfoActionBtn').text(btnText);
	getCategory('dep1_category');

	$('.variableCheck[value="Y"]').each(function(){
		$('.variableCheck[name="' + this.name + '"]').off('change').change(function(){ variableCheck(this, 'Y'); });
	});

	$('.variableCheckSub[value="Y"]').each(function(){
		$('.variableCheckSub[name="' + this.name + '"]').off('change').change(function(){ variableCheck(this, 'Y'); });
	});

	if(mode == 'renew' || mode == 'marketRenew') {
		for (i = 1; i < 6; i++) {
			setRenewAddInfo('dep' + i + '_category_code');
			setRenewAddInfo('dep' + i + '_category_name');
		}
		setRenewAddInfo('category_code');

		$('.variableCheck').each(function(){
			var nodeType	= $(this).prop("type");
			if (nodeType == 'radio') {
				if($(this).is(':checked') == true)
					$(this).trigger('change');
			} else {
				$(this).trigger('change');
			}
		});

		$('.variableCheckSub').each(function(){
			var nodeType	= $(this).prop("type");
			if (nodeType == 'radio') {
				if($(this).is(':checked') == true)
					$(this).trigger('change');
			} else {
				$(this).trigger('change');
			}
		});
	}
}


//기존 필수 정보 입력
function setRenewAddInfo(target) {
	var setObj			= addInfo;
	var inputArrName	= '';
	var arrayTarget		= [];
	var subArrayTarget	= [];

	if (typeof target == 'object' && target.hasOwnProperty('length')) {
		var targetCnt	= target.length;
		var objCnt		= targetCnt - 1;
		var lastTarget	= '';

		for (i = 0; i < targetCnt; i++) {

			if (i < objCnt) {
				setObj			= setObj[target[i]];
				arrayTarget.push(target[i]);
			}

			//배열 Input Name 정의
			if (i == 0)
				inputArrName	= target[i];
			else
				inputArrName	+= "[" + target[i] + "]";

			//최종 값이 실제 target
			lastTarget			= target[i];
		}

		// target 재정의
		target		= lastTarget;
	}

	for (key in setObj) {

		if (target != 'all' && target != key)
			continue;

		var nowValue	= setObj[key];
		
		// 하위에 값이 있을경우 재귀호출
		if (nowValue != null && typeof nowValue == 'object') {

			arrayTarget.push(key);

			for (subKey in nowValue) {
				subArrayTarget	= arrayTarget.slice();
				subArrayTarget.push(subKey);
				setRenewAddInfo(subArrayTarget);
			}

			arrayTarget		= [];
			continue;
		}


		var targetName	= (inputArrName != '') ? inputArrName : key;
		var nowNode		= document.getElementsByName(targetName)[0];
		var nodeType	= $(nowNode).prop("type");

		if(typeof nowNode == 'undefined' || $(nowNode).attr('disabled')  == "disabled")
			continue;

		switch (nodeType) {
			case	'radio' :
			case	'checkbox' :
				$('input[name="' + targetName + '"][value="' + nowValue + '"]').attr('checked',true);
				$(nowNode).cha
				break;

			default :
				$(nowNode).val(nowValue).trigger('change');
		}

	}
}


//값 검증및 저장
function addInfoSave() {
	var params		= {};
	var allForms	= $('input,select,textarea');

	for (cnt = allForms.length, i = 0; i < cnt; i++) {
		var nowForm	= allForms[i];
		if ($(nowForm).attr('toBeSaved') != "Y" || $(nowForm).attr('disabled') == "disabled")
			continue;

		var value		= '';
		var name		= nowForm.name;
		var nodeType	= nowForm.type;
		var required	= $(nowForm).attr('required');

		switch (nodeType) {
			case	'radio' :
				value	= $('input[name="' + name + '"]:checked').val();
				break;
			
			case	'checkbox' :
				value	= ($('input[name="' + name + '"]').is(':checked') === true) ? nowForm.value : '';
				break;

			default :
				value	= nowForm.value;
		}
		
		//필수값 확인
		if (required == 'required' && $.trim(value) == '') {
			var title	= $(nowForm).attr('itemName');
			openDialogAlert('"' + title + '" 항목은 필수 입니다.');
			$('input[name="' + name + '"]').focus();
			return false;
		}

		params[name]	= value;
	}

	if (mode == 'marketRenew')
		var confirmMsg	= '"마켓 상품 정보"를 수정배포 하시겠습니까?';
	else
		var confirmMsg	= '"마켓 필수 정보"를 ' + modeText + '하시겠습니까?';


	var btnOpt	= {'yesMsg':'[예] ' + modeText,'noMsg':'[아니오] 취소'}
	openDialogConfirm(confirmMsg,350,160,function(){
		$.post('../market_connector_process/saveAddInfo', params, function(response){
			if (response.success != 'Y') {
				message	= (response.hasOwnProperty('message')) ? response.message : '추가정보 저장 실패';
				openDialogAlert(message);
			} else {
				openDialogAlert('저장완료', 0, 0, function(){
					if ($("#displayMmode").val() != 'popup')
						window.location.href	= './market_setting?market=' + market + '&sellerId=' + $('#seller_id').val() + '&add_info_seq=' + response.add_info_seq + '&pageMode=AddInfoRegistSet';
					else if (mode != 'marketRenew')
						document.location="../market_connector/" + market + "_add_info?add_info_seq=" + response.add_info_seq;
					else
						document.location="../market_connector/" + market + "_add_info?fmMarketProduceSeq=" + response.fmMarketProduceSeq;
				});
			}
		},'json');
	},function(){},btnOpt);
}


//API 호출
function callConnector(mode, callback, basicParams) {
	var url				= '../market_connector_process/getMarketInfo';
	var params			= (typeof basicParams == 'object') ? basicParams : {};
	params.mode			= mode;
	params.sellerId		= seller_id;
	params.market		= market;
	
	$.get(url, params, callback, 'json');
}

  
//카테고리 수집
function getCategory(depthCode, categoryCode) {
	if (depthCode != 'dep1_category' && categoryCode == '')
		return;

	var depth			= 0;
	var selectBox		= $('#' + depthCode + '_sel');
	selectBox.children().remove();

	var market = $("input[name='market']").val();	
	
	var market = $("input[name='market']").val();	

	$('#category_code').val('');

	switch(depthCode) {
		case	'dep1_category' :
			depth		= 1;
			prevDepth	= 'none';
			depthName	= '1차 카테고리';
			break;
		
		case	'dep2_category' :
			depth		= 2;
			prevDepth	= 'dep1_category';
			depthName	= '2차 카테고리';
			break;

		case	'dep3_category' :
			prevDepth	= 'dep2_category';
			depth		= 3;
			depthName	= '3차 카테고리';
			break;
		
		case	'dep4_category' :
			depth		= 4;
			prevDepth	= 'dep3_category';
			depthName	= '4차 카테고리';
			break;
		
		case	'dep5_category' :
			depth		= 5;
			prevDepth	= 'dep4_category';
			depthName	= '5차 카테고리';
			break;
		
		case	'dep6_category' :
			depth		= 6;
			prevDepth	= 'dep5_category';
			depthName	= '6차 카테고리';
			break;
	}



	switch (prevDepth) {
		case	'none' :
			$('#dep1_category_sel > option').remove();
			$('#dep1_category_sel').append('<option value=""> 선택 </option>');
			$('#dep1_category_name').val('');
			$('#dep1_category_code').val('');

		case	'dep1_category' :
			$('#dep2_category_sel > option').remove();
			$('#dep2_category_sel').append('<option value=""> 선택 </option>');
			$('#dep2_category_name').val('');
			$('#dep2_category_code').val('');

		case	'dep2_category' :
			$('#dep3_category_sel > option').remove();
			$('#dep3_category_sel').append('<option value=""> 선택 </option>');
			$('#dep3_category_name').val('');
			$('#dep3_category_code').val('');

		case	'dep3_category' :
			$('#dep4_category_sel > option').remove();
			$('#dep4_category_sel').append('<option value=""> 선택 </option>');
			$('#dep4_category_name').val('');
			$('#dep4_category_code').val('');
		
		case	'dep4_category' :
			$('#dep5_category_sel > option').remove();
			$('#dep5_category_sel').append('<option value=""> 선택 </option>');
			$('#dep5_category_name').val('');
			$('#dep5_category_code').val('');
		
		case	'dep5_category' :
			$('#dep6_category_sel > option').remove();
			$('#dep6_category_sel').append('<option value=""> 선택 </option>');
			$('#dep6_category_name').val('');
			$('#dep6_category_code').val('');
	}

	if (prevDepth != 'none') {
		var preSelectBox	= $('#' + prevDepth + '_sel');

		var now_category_code	= preSelectBox.val();
		var nowCategoryText	= preSelectBox.children('option:selected').text();
		
		$('#' + prevDepth + '_name').val(nowCategoryText);
		$('#' + prevDepth + '_code').val(now_category_code);

	}
	
	var categoryCallback = function(response) {
		if (response.success != 'Y') {
			if(response.code > 0)
				openDialogAlert('[' + response.code + '] ' + response.message);

			return false;
		}
			
		var categoryList	= response.resultData;
		if(!categoryList){
			var categoryCnt = 0;
		} else {
			var categoryCnt = categoryList.length;
		}

		if(categoryCnt == 0)
			sel_category(prevDepth, categoryCode);

		for (i = 0; i < categoryCnt; i++) {

			selectBox.append('<option value="' + categoryList[i].categoryCode + '">' + categoryList[i].categoryName + '</option>');
		}
	}

	var market_category_sel = (categoryCode > 0 || categoryCode != '') ? categoryCode : '';

	if(market == "shoplinker"){
		/* 20190107 선택한 카테고리코드 전체 넘기기*/
		if(prevDepth != "none"){

			var dep_category_sel = Array();
			dep_category_sel[0] = $('#dep1_category_sel option:selected').val();
			if($('#dep2_category_sel option:selected').val()) dep_category_sel[1] = $('#dep2_category_sel option:selected').val();
			if($('#dep3_category_sel option:selected').val()) dep_category_sel[2] = $('#dep3_category_sel option:selected').val();
			if($('#dep4_category_sel option:selected').val()) dep_category_sel[3] = $('#dep4_category_sel option:selected').val();
			market_category_sel = dep_category_sel.join(",");
		}
	}

	var market_category_sel = (categoryCode > 0 || categoryCode != '') ? categoryCode : '';

	if(market == "shoplinker"){
		/* 20190107 선택한 카테고리코드 전체 넘기기*/
		if(prevDepth != "none"){

			var dep_category_sel = Array();
			dep_category_sel[0] = $('#dep1_category_sel option:selected').val();
			if($('#dep2_category_sel option:selected').val()) dep_category_sel[1] = $('#dep2_category_sel option:selected').val();
			if($('#dep3_category_sel option:selected').val()) dep_category_sel[2] = $('#dep3_category_sel option:selected').val();
			if($('#dep4_category_sel option:selected').val()) dep_category_sel[3] = $('#dep4_category_sel option:selected').val();
			market_category_sel = dep_category_sel.join(",");
		}
	}

	var params			= {};
	params.depth		= depth;
	params.cagrgoryCode	= market_category_sel;

	callConnector('category', categoryCallback, params);
}


//카테고리 선택
function sel_category(depthCode, categoryCode) {

	if (categoryCode == '')	return;

	
	$('#category_code').val(categoryCode);
	// 카테고리별 특이사항이 있을경우
	if(typeof resetCategoryDesc == 'function')
		resetCategoryDesc();

	if(typeof setCategoryDesc == 'function')
		callConnector('categoryMoreInfo', setCategoryDesc, {cagrgoryCode:categoryCode});

	switch (depthCode) {
		case	'dep1_category' :
			$('#dep2_category_sel > option').remove();
			$('#dep2_category_sel').append('<option value=""> 하위 분류 없음 </option>');

		case	'dep2_category' :
			$('#dep3_category_sel > option').remove();
			$('#dep3_category_sel').append('<option value=""> 하위 분류 없음 </option>');

		case	'dep3_category' :
			$('#dep4_category_sel > option').remove();
			$('#dep4_category_sel').append('<option value=""> 하위 분류 없음 </option>');
		
		case	'dep4_category' :
			$('#dep5_category_sel > option').remove();
			$('#dep5_category_sel').append('<option value=""> 하위 분류 없음 </option>');
			
			if (depthCode == 'dep4_category') {
				$('#dep4_category_name').val($('#dep4_category_sel > option:selected').text());
				$('#dep4_category_code').val($('#dep4_category_sel').val());
				break;
			}

		case	'dep5_category' :
			$('#dep6_category_sel > option').remove();
			$('#dep6_category_sel').append('<option value=""> 하위 분류 없음 </option>');	

			if (depthCode == 'dep5_category') {
				$('#dep5_category_name').val($('#dep5_category_sel > option:selected').text());
				$('#dep5_category_code').val($('#dep5_category_sel').val());
				break;
			}
		
		case	'dep6_category' :
			if (depthCode == 'dep6_category') {
				$('#dep6_category_name').val($('#dep6_category_sel > option:selected').text());
				$('#dep6_category_code').val($('#dep6_category_sel').val());
				break;
			}
	}
}


//가변 항목값 자동 설정.
function variableCheck(selectedObj, checkVal) {

	var selectedName	= selectedObj.name.replace(/\[|\]/gi,'');
	var selectedValue	= selectedObj.value;
	var targetObj		= $('.' + selectedName);

	targetObj.attr('disabled', true);

	targetObj.each(function() {
		var checkType	= this.type;
		var nodeType	= $(this).prop("type");

		switch(checkType) {
			case	'text' :
				this.value	= '';
				break;
					
			case	'radio' :
				if (this.value == 'N') {
					$(this).attr('checked', true);
					$(this).trigger('change');
				}
				break;
				
			case	'select' :
				$(this).find('option').eq(0).attr('selected',true);
				$(this).trigger('change');
				break;
			
			case	'span' :
				$(this).hide();
				break;
		}


	});

	
	var checkValArr		= checkVal.split('|');

	if (checkValArr.indexOf(selectedValue) !== -1) {
		targetObj.show();
		targetObj.attr('disabled', false);
		
		targetObj.each(function() {
			if(typeof this.name == 'string') {
				var nameSplit	= this.name.replace(/]/, '').split('[');
				if (nameSplit.length > 1)
					setRenewAddInfo(nameSplit);
				else
					setRenewAddInfo(nameSplit[0]);
			}

		});

	}
}