var claimListGrid	= {};


$('document').ready(function(){
	var claim_type_title;
	var claim_type_title2;
	var claim_type_id;

	if(claim_type == "RTN")
	{
		claim_type_title 	= claim_type_title2 = "반품";
		claim_type_id 		= "return";
	}else if(claim_type == "CAN"){
		claim_type_title 	= "환불";
		claim_type_title2 	= "취소";
		claim_type_id 		= "cancel";
	}else{
		claim_type_title 	= claim_type_title2 = "교환";
		claim_type_id 		= "exchange";
	}

	claimListGrid	= $("#claimListGrid");
	claimListFields	= [
		{	title : '선택',
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
				if (item.able_to_select === true) {
					checkOpt			= {};
					checkOpt.type		= 'checkbox';
					checkOpt.class		= 'gridCheck';
					checkOpt.listSeq			= item.seq_list;
					checkOpt.market_claim_code	= item.market_claim_code;
					checkOpt.checkType			= 'claimSelect';

					return $("<input>").attr(checkOpt).on("change", function () {
						if($(this).is(":checked"))
							claimListGrid.jsGrid("checkedRow", 'checked', item);
						else
							claimListGrid.jsGrid("checkedRow", 'unchecked', item);


						if ($('.gridCheck:checked').length > 0)
							$('.headerSelector').text('해제');
						else
							$('.headerSelector').text('선택');

					}).val(item.seq_list);
				}

			},
			width: 40,
			align: 'center'
		  }
		, { title:'마켓명', name: "market_name", type: "text", width: 70 }
		, { title:'판매자아이디', name: "seller_id", type: "text", width: 100 }
		, { title:'마켓 주문 번호', name: "market_order_no", type: "text", width: 110 }
		, { title:'쇼핑몰 주문 번호', name: "fm_order_seq_text", type: "text", width: 130 }
		, { title: '쇼핑몰 '+claim_type_title+'번호', name: "fm_claim_code_text", type: "text", width: 110 }
		, { title:'클레임 종류', name: "claim_type_text", type: "text", width: 90 }
		, { title:'클레임 상태', name: "claim_status_text", type: "text", width: 90 }
		, { title:'요청 수량', name: "request_qty", type: "number", width: 70 }
		, { title:'마켓 상품 번호', name: "market_product_code", type: "text", width: 100 }
		, { title:'주문 상품명', name: "order_product_name", type: "text", width: 200 }
		, { title:'쇼핑몰 상품 번호', name: "fm_goods_seq_text", type: "text", width: 110 }
		, { title:'클레임 요청일', name: "claim_time_text", type: "text", width: 100 }
		, { title:'처리 완료일', name: "claim_close_time", type: "text", width: 100 }
		, { title:'클레임사유', name: "claim_reason", type: "text", width: 250 }
	];


	claimListAddOpt					= {};
	claimListAddOpt.clickSelect		= true;
	claimListAddOpt.noDataContent	= claim_type_title2+" 관리 내역이 없습니다";
	claimListAddOpt.clickFunction	= function(args) {
		if (args.event.srcElement.type == 'checkbox')
			checkOrder(args);
		else
			checkRow(args);
	}

	makeJsGrid(claimListGrid, claimListFields, claimListAddOpt);
	layResize();
	defaultDateSet();
	getMarketClaimList();

	gSearchForm.init({'pageid':'market_'+claim_type_id+'_list','divSelectLayId':'distTop'},movePage);
	
});


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


function getClaimCollect() {

	var targets		= $('#marketSeller').multipleSelect("getSelects");
	var targetCnt	= targets.length;
	if (targetCnt < 1) {
		alert('판매 마켓(아이디)를 선택해주세요');
		return;
	}

	var startDate = new Date($('#collectBeginDate').val());
	var endDate = new Date($('#collectEndDate').val());
	var dateDiff = (endDate.getTime() - startDate.getTime()) / (1000*60*60*24);	// 일수 계산
	if (dateDiff > 2) {
		alert('수집 가능한 기간은 최대 3일입니다.');
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

	var claimCollect	= function(params) {
		
		var targetName	= '[' + marketObj[params.market].name + '-' + params.sellerId + ']';
		$('#message').html(targetName +  ' 클레임 수집중...');
		$.get('../market_connector_process/getClaimCollect', params, function(response){
			$('#message').html('');
			var message		= (response.hasOwnProperty('message')) ? targetName + ' ' + response.message : targetName + ' 클레임 수집 실패';
			$('#message').html(message);
			
			marketQueue.setResponse(message);
			marketQueue.next();
		}, 'json');

	}

	var doneFunction	= function() {
		$('#message').html(marketQueue.getResponse().join("<br/>"));
		getMarketClaimList();

	}
	
	var initResponse	= marketQueue.initQueue({
		'paramsList'	: paramsList,
		'doFunction'	: claimCollect,
		'doneFunction'	: doneFunction
	});

	marketQueue.start();

	if (initResponse.success == 'N') {
		alert(initResponse.message);
		return;
	}
}


function movePage(page) {
	if(typeof page == "undefined") page = 1;
	$('#page').val(page);
	//$('#marketClaimForm').submit();
	getMarketClaimList();
}

function getMarketClaimList() {
	var params	= $("#marketClaimForm").serialize();
	$.get('../market_connector_process/getMarketClaimList', params, function(response){
		
		if (response.marketClaimList.length > 0)
			claimListGrid.jsGrid('setData', response.marketClaimList);
		else
			claimListGrid.jsGrid('setData', []);

		$('#totalCount').val(response.totalCount);
		$('#pagingNavigation').html(response.paging);

		claimListGrid.find(".gridCheck").wrap("<label class='resp_checkbox'></label>");

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

	layHeight			= $('#claimListGrid').height();
	claimListGrid.jsGrid('option','height', layHeight - 170);
}

function claimRegister(mode) {

	var claimText		= (mode == 'exchange') ? '교환' : '반품';
	
	var selectOrders	= $('input[checktype="claimSelect"]:checked');
	if (selectOrders.length < 1) {
		alert(claimText + '등록할 클레임을 선택하세요');
		return;
	}
	var btnOpt	= {'yesMsg':'[예] ' + claimText + '등록 처리','noMsg':'[아니오] 취소'}
	var confirmMsg	= '선택하신 ' + selectOrders.length + '건의 클레임을 <br/>"' + claimText + '등록"처리 하시겠습니까?';
	openDialogConfirm(confirmMsg,320,180,function(){
		var params			= {};
		params.listSeq		= [];

		selectOrders.each(function(){
			params.listSeq.push(parseInt(this.value,10));	
		});
		
		params.claimType	= (mode == 'exchange') ? 'exchange' : 'return';
		$.post('../market_connector_process/doClaimRegister', params, claimProcessResult,'json');
	},function(){},btnOpt);

}


function cancelProcess(type) {
	
	var doText	= (type == 'reject') ? '취소거부' : '취소완료';

	var selectOrders	= $('input[checktype="claimSelect"]:checked');
	if (selectOrders.length < 1) {
		alert(doText + '할 클레임을 선택하세요');
		return;
	}
	var btnOpt	= {'yesMsg':'[예] ' + doText + '처리','noMsg':'[아니오] 취소'}
	var confirmMsg	= '선택하신 ' + selectOrders.length + '건의 클레임을 <br/>"' + doText + '"처리 하시겠습니까?';
	openDialogConfirm(confirmMsg,320,180,function(){
		var params			= {};
		params.listSeq		= [];

		selectOrders.each(function(){
			params.listSeq.push(parseInt(this.value,10));	
		});

		var doMode	= (type == 'reject') ? 'doCancelReject' : 'doCancelComplete';
		
		$.post('../market_connector_process/' + doMode,	params, claimProcessResult,'json');
	},function(){},btnOpt);


}

function claimProcessResult(response) {
	getMarketClaimList();
	$('#message').html(response.message);
	
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
	var dateOffset	= (24*60*60*1000) * 2;
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
}
