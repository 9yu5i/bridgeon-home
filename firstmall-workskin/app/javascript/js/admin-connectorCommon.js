$(function(){
	
	if (typeof marketObj == 'object') {

		if (marketObj.hasOwnProperty('ClauseAgree') == true && marketObj.ClauseAgree == false) {
			notClauseAgree();
			return;
		}


		for(market in marketObj) {
			$('.selMarketClass').append('<option value="' + market + '"> ' + marketObj[market].name + '</option>');
		}
		
		$('.selMarketClass').change(function() {
			var market		= $('.selMarketClass').val();
			var nowId		= $(this).attr('id');
	
			// 마켓 선택시 초기화
			$('.' + nowId + 'UserId > option').remove();
			$('.' + nowId + 'UserId').append('<option value="">판매자 아이디</option>');

			
			if (marketObj.hasOwnProperty(market) !== true){
				return;
			}

			var sellerList	= marketObj[market].sellerList;
			if(market == 'shoplinker'){
				var marketOtherList	= marketObj[market].marketOtherList;
			}
			var sellerCnt	= sellerList.length;
				
				
			for (i = 0; i < sellerCnt; i++){
				if(market == 'shoplinker'){
					$('.' + nowId + 'UserId').append('<option value="' + sellerList[i] + '">' + marketOtherList[i] + "(" + sellerList[i] + ")" + '</option>');
				}else{
					$('.' + nowId + 'UserId').append('<option value="' + sellerList[i] + '">' + sellerList[i] + '</option>');
				}
			}

		});

		if(typeof $('select').multipleSelect == 'function') {
			$('.selMarketClass').multipleSelect({ placeholder: "마켓 선택", selectAll: false,  allSelected:'전체 마켓'});
			if (typeof searchObj.market == 'object') {
				$('select.selMarketClass').multipleSelect('setSelects', searchObj.market);
			} else {
				$("select.selMarketClass").multipleSelect("checkAll");				
			}			
		}
	}

	$('#clauseAgreeBtn').click(function(){
		if ($('#clauseAgree').is(':checked') != true) {
			openDialogAlert('이용 약관을 동의하여 주시기 바랍니다.');
			$('#clauseAgree').focus();
			return;
		}
		var params	= {};
		$.post('../market_connector_process/doClauseAgree', params, function(response){
			if (response.success == 'Y') {
				openDialogAlert(response.agreeDate + ' 오픈마켓 연동 서비스<br/>이용약관에 동의하셨습니다.', 0, 0, function(){
					window.location.reload();
				});
				
			}
		}, 'json');
	});



	$('.allCheckBtn').click(function(){$('.chk').attr('checked',this.checked)});
	
	

	
	$('#linkageAddBtn').live('click',function(){
		
		var htmlUrl = '/admin/market_connector/shoplinker_linkage_market_register';			
		$.get(htmlUrl, function(data) {
			$('#shoplinker_setting_div').html(data);					
		});
		
		openDialog("마켓 등록", "shoplinker_setting_div", {"width":"700","height":"530","show" : "fade","hide" : "fade"});			
	});
	
	if (typeof searchObj == 'object') {
		setFormByObject.setObjectValue(searchObj);
		setFormByObject.setFormValue();
	}
	
	$('.linkageInfoBtn').click(function(){
		openDialog("연동안내", "linkageInfoDiv", {"width":"1000","height":"700","show" : "fade","hide" : "fade"});		
	});

	/* 주문 수집 */
	$("#orderCollectBtn").on("click", function(){
		setFormOrderCollection($(this).attr("data-mode"));
	});

});

var setFormByObject = (function() {
	
	var _params	= {};

	function setObjectValue(objectVal) {
		_params	= JSON.parse(JSON.stringify(objectVal));
	}


	function setFormValue(target) {
		target	= (typeof target == 'undefined') ? 'all' : target;
		for (key in _params) {

			if (target != 'all' && target.indexOf(key) < 0)
				continue;

			if (typeof _params[key] == 'object' && _params[key].hasOwnProperty('length')) {
				for (cnt = _params[key].length, i = 0; i < cnt; i++) {
					newParamsKey			= key + '[]'
					_params[newParamsKey]	= _params[key][i];
					_setValueToForm(newParamsKey);
					delete _params[newParamsKey];
				}				
			} else {
				_setValueToForm(key);
			}
		
			
		}
	}

	function _setValueToForm(key) {

		if (typeof document.getElementsByName(key)[0] == 'undefined')
			return;

		var nowValue	= _params[key];
		var $nowNode	= $(document.getElementsByName(key)[0]);
		//var nodeName	= $nowNode.prop("tagName");
		var nodeType	= $nowNode.prop("type");

		if($nowNode.attr('disabled')  == "disabled")
			return;

		if(nodeType != 'hidden' && $nowNode.css('display')  == "none")
			return;



		switch (nodeType) {
			case	'radio' :
			case	'checkbox' :
				$('input[name="' + key + '"][value="' + nowValue + '"]').attr('checked',true);
				break;

			default :
				$nowNode.val(nowValue);
		}

		// change 이벤트가 있을경우 한번 실행
		var eventList = $nowNode.data('events');			
		if (typeof eventList == 'object' && eventList.hasOwnProperty('change') && nowValue)
			$nowNode.trigger('change');

		if ($nowNode.hasClass('variableCheck') == true) {
			var nodeId		= $nowNode.attr('id');
			var setTarget	= [];
			$('.' + nodeId).each(function() {
				setTarget.push(this.name);
			});
			setFormValue(setTarget)
		}
	}

	return {
		setObjectValue	: setObjectValue,
		setFormValue	: setFormValue,
	}
})();



function notClauseAgree() {
	var content	= "오픈마켓 연동 서비스 이용 약관 동의 후 이용 가능합니다.<br/><br/>";
	content	+= '오픈마켓 > 연동설정에서 약관 동의 후 이용하시기 바랍니다.<br/><br/>';
	content	+= '<div class="center"><span class="btn large cyanblue"><a href="./market_setting">바로가기</a></span></div>';

	$('body').append('<div id="notClauseAgree">' + content + '</div>');
	openDialog("오픈마켓 연동 서비스 안내", "notClauseAgree", {"width":"500","noClose":true});
}


var marketQueue = (function() {
	
	var _paramsList		= [];
	var _doFunction		= function(){_do();};
	var _doneFunction	= function(){return;};
	var _status			= 'standby';
	var _totalCnt		= 0;
	var _responseList	= [];

	function InitQueue(setParams) {
		


		var initResult	= {};

		if (_status == 'ing') {
			initResult.success	= 'N';
			initResult.message	= '진행중 입니다.';
			
			return initResult;
		}

		_resetQueue();

		if (typeof setParams.paramsList != 'object' || setParams.paramsList.hasOwnProperty('length') != true || setParams.paramsList.length < 1) {
			initResult.success	= 'N';
			initResult.message	= '파리미터 값이 없거나 배열값이 아닙니다.';
			
			return initResult;
		}

		if (typeof setParams.doFunction != 'function') {
			initResult.success	= 'N';
			initResult.message	= '수행할 내용이 없습니다.';
			
			return initResult;
		}

		_paramsList			= setParams.paramsList;
		_doFunction			= setParams.doFunction;
		
		if (typeof setParams.doneFunction == 'function')
			_doneFunction	= setParams.doneFunction;


		initResult.success	= 'Y';
		initResult.message	= '성공';

		return initResult;

	}

	function _resetQueue() {
		_paramsList		= [];
		_doFunction		= function(){_do();};
		_doneFunction	= function(){return;};
		_status			= 'standby';
		_totalCnt		= 0;
		_responseList	= [];
	}

	function Start() {
		if (_status != 'ing') {
			_status	= 'ing';
			_do();
		}
	}

	function _do() {

		if (_status != 'ing')
			return;

		if (_paramsList.length == 0) {
			_doneFunction();
			_resetQueue();
			return;
		}

		nowParams	= _paramsList.pop();
		_doFunction(nowParams);
	}

	function Paush() {
		if(_paramsList.length > 0 && _status == 'ing')
			_status = 'pause';
	}

	function Stop() { _resetQueue(); }

	return {
		initQueue	: InitQueue,
		getStatus	: function() {return _status;},
		start		: Start,
		next		: function() {_do();},
		paush		: Paush,
		restart		: Start,
		stop		: Stop,
		setResponse	: function(response) {_responseList.push(response)},
		getResponse	: function() {return _responseList;}
	}

}());

/*
오픈마켓 주문/취소/반품/교환/문의 수집 버튼 클릭 이벤트
*/
function setFormOrderCollection(mode){

	if(typeof mode == 'undefined') mode ='ORD';
	
	$.ajaxSetup({async:false});
	$.ajax({
		type	: 'get',
		url		: '../market_connector/getOrderCollection',
		data	: {'mode':mode},
		success	: function(result){
			$("#orderCollection").html(result);
		}
	});

	$.ajaxSetup({async:true});

	var title = "";
	switch(mode){
		case "CAN": title = "취소 요청 수집"; break;
		case "RTN": title = "반품 요청 수집"; break;
		case "EXC": title = "교환 요청 수집"; break;
		case "QNA": title = "문의 수집"; break;
		default : title = "주문 수집"; break;
	}

	var _opt = {
					"width"	: "600",					
					"show" 	: "fade",
					"hide" 	: "fade",
					'isOptn': "true",
					'open'	: function( event, ui ) { 
						$('.marketSeller').find('div.ms-drop').css('z-index', '11000');						
					}
				}
	openDialog(title, "orderCollection", _opt  );	
	

}