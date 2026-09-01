var qnaListGrid	= {};

$('document').ready(function(){
	qnaListGrid	= $("#marketQnaListGrid");	
	claimListFields		= [
		{ title : '선택',
		  name  : 'checkbox',
		  checkbox : true,
		  headerTemplate: function() {
			return $("<label class='resp_checkbox'><input type='checkbox' class='headerSelector'></label>").on("click", function () {
				if($('.gridCheck:checked').length > 0) {
					$('.gridCheck').attr('checked', false);
				} else {
					$('.gridCheck').attr('checked', true);
				}

				$('.gridCheck').trigger('change');
			});
		  },
		  itemTemplate: function(_, item) {
				//대기열 상태는 변경안됨.
				if (item.last_result == 'P')
					return;

				var checkOpt		= {};
				checkOpt.type		= "checkbox";
				checkOpt.class		= "gridCheck";
				checkOpt.target		= 'check_'+item.seq;
				checkOpt.checkType	= 'distSelect';
				return $("<input>").attr(checkOpt).on("change", function () {
					if($(this).is(":checked")) {
						item.selected		= true;
						qnaListGrid.jsGrid("editItem", item);
						qnaListGrid.jsGrid("checkedRow", 'checked', item);
					}else{
						item.selected		= false;
						qnaListGrid.jsGrid("editItem", item);
						qnaListGrid.jsGrid("checkedRow", 'unchecked', item);
					}	

				}).val(item.seq);
			},
			align: "center",
			width: 30
		},
		{ title:'순번', name: "no", type: "number", width: 30 },
		{ title:'문의일', name: "qna_time", type: "text", width: 60 },
		{ title:'마켓명', name: "market_name", type: "text", width: 70 },
		{ title:'판매자 아이디', name: "seller_id", type: "text", width: 100 },
		{ title:'제목', name: "title", type: "text", width: 100 },
		{ title:'내용', name: "contents", type: "text", width: 160 },
		{ title:'처리상태', name: "qna_status_text", type: "text", width: 60, align:'center'},
		{ title:'처리일시', name: "answer_time", type: "text", width: 60, align:'center' },
		{ title:'최종전송', name: "last_status_text", type: "text", width: 70, align:'center' },
		{ title:'관리', name: "manage", type: "text", width: 80, align:'center',
			itemTemplate : function(_, item){
				var tags = '';
				if( item.market_cs_yn == 'Y' ) tags = '<span class="btn small"><button onclick="marketQnaAnswer(\''+item.seq+'\')">답변등록</button></span>';
				tags += ' <span class="btn small"><button onclick="marketQnaLogShow(\''+item.seq+'\')">전송로그</button></span>';
				return tags;
			}
		},
	];


	qnaListAddOpt					= {};
	qnaListAddOpt.clickSelect		= true;
	qnaListAddOpt.checkboxForm		= true;
	qnaListAddOpt.noDataContent	= "문의 관리 내역이 없습니다";
	qnaListAddOpt.clickFunction	= function(args) {
		if (args.event.srcElement.type == 'checkbox')
			checkOrder(args);
		else
			checkRow(args);
	}

	makeJsGrid(qnaListGrid, claimListFields, qnaListAddOpt);

	layResize();
	defaultDateSet();
	getMarketQnaList();

});

function movePage(page) {
	if(typeof page == "undefined") page = 1;
	$('#page').val(page);
	getMarketQnaList();
	//$('#marketQnaForm').submit();
}

function marketQnaAnswer(seq) {
	$("#answerDialog").html('');
	$.ajax({
		type: "get",
		url: "../market_connector_process/getMarketQnaList",
		data: "mode=detail&seqList="+seq,
		success: function(html){
			$("#answerDialog").append(html);
			openDialog("답변 등록", "answerDialog", {"width":"800","show" : "fade","hide" : "fade"});
		}
	});
}

function marketQnaLogShow(seq) {
	$("#qnaLogDialog").html('');
	$.ajax({
		type: "get",
		url: "../market_connector/getMarketQnaLog",
		data: "seqList="+seq,
		success: function(html){
			$("#qnaLogDialog").append(html);
			openDialog("전송 로그", "qnaLogDialog", {"width":"800","show" : "fade","hide" : "fade"});
		}
	});
}

function checkOrder(args) {

	var checkbox	= $('input[type="checkbox"][market_claim_code="' + args.item.market_claim_code + '"]');


	if($(args.event.target).attr('checkType') == 'claimSelect')
		var checkType	= $(args.event.target).is(":checked");
	else
		var checkType	= (checkbox.is(':checked') === true) ? false : true;
			
	checkbox.attr('checked', checkType);
	checkbox.trigger('change');
		
	if (checkType == true) {
		args.item.selected	= true;
		changeMode			= 'checked';
	} else {
		args.item.selected	= false;
		changeMode			= 'unchecked';
	}

	checkbox.attr('checked', checkType);

}


function checkRow(args) {
	$('#message').html(args.item.last_message);
}


function getMarketQnaList() {
	var params	= $("#marketQnaForm").serialize();
	$.get('../market_connector_process/getMarketQnaList', params, function(response){
		
		if (response.marketQnaList.length > 0)
			qnaListGrid.jsGrid('setData', response.marketQnaList);
		else
			qnaListGrid.jsGrid('setData', []);

		$('#totalCount').val(response.totalCount);
		$('#pagingNavigation').html(response.paging);

		qnaListGrid.find(".gridCheck").wrap("<label class='resp_checkbox'></label>");
		
		closeDialog('orderCollection');
		
	}, 'json');
}

function layResize() {
	var minHeight		= 500;
	var windowHeight	= $(window).height();
	var basHeight		= 210;
	var topHeight		= $('#distTop').height();
	var bottomHeigth	= $('#distBottom').height();
	var caclHeight		= windowHeight - basHeight - topHeight - bottomHeigth;
	var newHeight		= (caclHeight > minHeight) ? caclHeight : minHeight;
	var messigeHeight	= 100;


	$('#container').height(newHeight + 30);
	$('#distBottom').height(bottomHeigth);

	layHeight			= $('#marketQnaListGrid').height();
	
	qnaListGrid.jsGrid('option','height', layHeight - 150);
}

function searchFormSubmit(page) {
	$("#nowPage").val(page);
	$("form[name='market_search_form']").submit();
}

function defaultDateSet(){
	var endDate		= new Date();
	endYear			= endDate.getFullYear();
	endMonth		= endDate.getMonth()+1;
	endDay			= endDate.getDate();
	
	if (parseInt(endMonth) < 10)
		endMonth	= "0" + endMonth;
	if	(parseInt(endDay) < 10)
		endDay		= "0" + endDay;

	endDate			= endYear+'-'+endMonth+'-'+endDay;

	var beginDate	= new Date();
	var dateOffset	= (24*60*60*1000) * 3;
	beginDate.setTime(beginDate.getTime() - dateOffset);

	beginYear		= beginDate.getFullYear();
	beginMonth		= beginDate.getMonth()+1;
	beginDay		= beginDate.getDate();

	if	(parseInt(beginMonth) < 10)
		beginMonth	= "0" + beginMonth;
	if	(parseInt(beginDay) < 10)
		beginDay	= "0" + beginDay;

	beginDate	= beginYear+'-'+beginMonth+'-'+beginDay;


	$("input[name='collectBeginDate']").val(beginDate);
	$("input[name='collectEndDate']").val(endDate);

	if(searchObj.hasOwnProperty('searchBeginDate') != true || searchObj.searchBeginDate.length < 10)
		$("input[name='searchBeginDate']").val(beginDate);
		$("input[name='searchBeginDate']").attr('defaultValue',beginDate);

	if(searchObj.hasOwnProperty('searchEndDate') != true || searchObj.searchEndDate.length < 10)
		$("input[name='searchEndDate']").val(endDate);
		$("input[name='searchEndDate']").attr('defaultValue',endDate);
		
	gSearchForm.init({'pageid':'market_qna_list','divSelectLayId':'distTop'},movePage);
}

function getQnaCollect() {

	var targets		= $('#marketSeller').multipleSelect("getSelects");
	var targetCnt	= targets.length;
	if (targetCnt < 1) {
		alert('판매 마켓(아이디)를 선택해주세요');
		return;
	}

	var paramsList	= [];
	
	for (i = 0; i < targetCnt; i++) {
		split	= targets[i].split('^');

		params				= {};
		params.market		= split[0];
		params.sellerId		= split[1];
		params.startDate	= $('#collectBeginDate').val();
		params.endDate		= $('#collectEndDate').val();
		paramsList.push(params);
	}

	var orderCollect	= function(params) {
		
		var targetName	= '[' + marketObj[params.market].name + '-' + params.sellerId + ']';
		$('#message').html(targetName +  ' 문의 수집중...');
		$.get('../market_connector_process/getQnaCollect', params, function(response){
			$('#message').html('');
			var message		= (response.hasOwnProperty('message')) ? targetName + ' ' + response.message : targetName + ' 문의 수집 실패';
			$('#message').html(message);
			
			marketQueue.setResponse(message);
			marketQueue.next();
		}, 'json');

	}

	var doneFunction	= function() {
		$('#message').html(marketQueue.getResponse().join("<br/>"));
		getMarketQnaList();

	}
	
	var initResponse	= marketQueue.initQueue({
		'paramsList'	: paramsList,
		'doFunction'	: orderCollect,
		'doneFunction'	: doneFunction
	});

	marketQueue.start();

	if (initResponse.success == 'N') {
		alert(initResponse.message);
		return;
	}
}


function distStart(mode) {

	var nowStatus	= distributor.getStatus();
	if (nowStatus == 'ing') {
		alert('이미 진행중입니다.');
		return;
	}
	

	if (nowStatus != 'pause')
		distributor.setGrid(qnaListGrid, mode);

	distributor.start();
}

function distStop() {
	var nowStatus	= distributor.getStatus();
	distributor.stop();
}

function distPause() {
	var nowStatus	= distributor.getStatus();
	if (nowStatus == 'ing')
		distributor.pause();
}

var distributor = (function() {
	var _recursionList	= [];
	var _doneList		= [];
	var _failList		= [];
	var _allCount		= 0;
	var _sleepSec		= 0;
	var _girdObj		= {};
	var _status			= 'standby';
	var _doMode			= '';
	var _doModeText		= '';
	

	function setGrid(girdObj, mode) {
		_recursionList	= [];
		_girdObj		= girdObj;
		_doMode			= mode;
		allKeys			= _girdObj.jsGrid('getDataKeys');

		switch(_doMode) {
			case	'qnaDelete' :
				_doModeText	= '삭제';
				break;
			default :
				alert(_doMode);
				alert('잘못된 호출입니다.');
				return;
		}

		if(_girdObj.jsGrid('option','checkboxForm') == true) {
			for(cnt = allKeys.length, i = 0; i < cnt; i++) {
				nowItem		= _girdObj.jsGrid('getDataByIdx',allKeys[i]);
				if(nowItem.selected){
					_recursionList.push(allKeys[i]);
				}
			}
		} else {
			_recursionList	= allKeys;
		}
		
		if (_recursionList.length < 1) {
			alert('선택된 문의글이 없습니다.');
			return;
		}
		

		_allCount		= _recursionList.length;
	}

	function start() {
		if (_status != 'ing') {
			// 로딩바 노츨 중지
			$("#ajaxLoadingLayer").attr('id', 'ajaxLoadingLayer_bak');
			_status	= 'ing';
			_do();
		}
	}

	function setPaush() {

		if(_recursionList.length > 0 && _status == 'ing')
			_status = 'pause';
		
	}


	function _do() {
		if(_recursionList.length < 1) {
			_reset();
			return;
		}

		if (_status != 'ing')
			return;

		
		idx			= _recursionList.shift();
		nowItem		= _girdObj.jsGrid('getDataByIdx',idx);
		nowRow		= _girdObj.jsGrid('rowByItem', nowItem);
		_girdObj.jsGrid('selectDoRow', nowRow);
		
		actionUrl	= '';
		params		= {};
		switch(_doMode) {

			case	'qnaDelete' :
				actionUrl	= '../market_connector_process/marketQnaDelete';
				params		= nowItem;		
				if(!confirm("삭제 처리 후에는 문의 관리 리스트에서 보여지지 않습니다. \n처리 하시겠습니까?")){
					_reset();
					return;
				}
				break;

		}
		
		$.post(actionUrl, params, function(response){
			if(typeof _girdObj.jsGrid != 'undefined')
				_girdObj.jsGrid('doneSelectRow', nowRow);
			
			if(response || response.result_type == 'productDelete' || response.result_message){
				alert(response.result_message);
			}


			setTimeout(_do, _sleepSec);
			/*
			if (response.result_type == 'Y') {
				_doneList.push(nowItem);
			} else {
				nowItem.fail_yn			= 'Y';
				nowItem.fail_text		= '<span class="bold" style="color:red">실패</span>';
				nowItem.result_message	= response.result_message;
				_failList.push(nowItem);
			}
			resultGrid.jsGrid("insertItem", response).done(function() {
				resultGrid.jsGrid("moveToBottom");
				
				if (_status == 'ing')
					setTimeout(_do, _sleepSec);
			});
			*/
		}, 'json');
	}

	function _reset() {

		if (_girdObj.hasOwnProperty('selector') == true) {
			for(cnt = _doneList.length, i = 0; i < cnt; i++) {
				nowItem			= _doneList.shift();
				_girdObj.jsGrid("deleteItem", nowItem);
			}

			for(cnt = _failList.length, i = 0; i < cnt; i++) {
				nowItem			= _failList.shift();
				_girdObj.jsGrid("updateItem", nowItem);
			}

			_girdObj.jsGrid('allReset');
			getMarketQnaList();
		}
		
		// 로딩바 노츨 중지 해제
		$("#ajaxLoadingLayer_bak").attr('id', 'ajaxLoadingLayer');

		_allCount		= 0;
		_status			= 'standby';

		_recursionList	= [];
		_deleteList		= [];
		_doneList		= [];
		_failList		= [];
		
		_girdObj		= {};
		_lastData		= {};
	}
	

	return {
		setSleep	: function (sec) {_sleepSec = sec * 1000;},
		getStatus	: function () {return _status;},
		setGrid		: setGrid,
		start		: start,
		reStart		: start,
		pause		: setPaush,
		stop		: _reset,
	}
}());