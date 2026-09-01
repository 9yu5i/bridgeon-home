var orderListGrid	= {};

$('document').ready(function(){
	orderListGrid	= $("#orderListGrid");
	orderListFields	= [
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
				if (
						item.fm_order_seq == '' && item.fm_goods_seq > 0 &&
						(item.market_order_status == 'ORD10' || item.market_order_status == 'ORD20' || item.market_order_status == 'CAN00')
					) {
					checkOpt					= {};
					checkOpt.type				= 'checkbox';
					checkOpt.class				= 'gridCheck';
					checkOpt.market_order_no	= item.market_order_no;
					checkOpt.id					= item.market_order_no + '_' + item.market_order_seq;
					checkOpt.checkType			= 'orderSelect';

					return $("<input>").attr(checkOpt).on("change", function () {
						if($(this).is(":checked"))
							orderListGrid.jsGrid("checkedRow", 'checked', item);
						else
							orderListGrid.jsGrid("checkedRow", 'unchecked', item);
						
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
		, { title:'마켓명', name: "market_name", type: "text", width: 110 }
		, { title:'판매자 아이디', name: "seller_id", type: "text", css: "gird-text-overflow", width: 100}
		, { title:'마켓 주문번호', name: "market_order_no", type: "text", width: 130 }
		, { title:'쇼핑몰 주문번호', name: "fm_order_seq_text", type: "text", width: 160 }
		, { title:'마켓 주문상태', name: "market_order_status_text", type: "text", width: 120 }
		, { title:'마켓 상품명', name: "order_product_text", type: "text", width: 150 }
		, { title:'쇼핑몰 매칭', name: "fm_goods_seq_text", type: "text", 
			itemTemplate: function(_, item) {
				
				if (item.fm_goods_seq > 0 && item.manual_matched != 'Y') {
					var fmGoodsText	= "<a href='/admin/goods/regist?no=" + item.fm_goods_seq + "' target='_product'>" + item.fm_goods_seq + "</a>";
				} else if (item.manual_matched == 'Y') {
					var fmGoodsText	= "<a href='/admin/goods/regist?no=" + item.fm_goods_seq + "' target='_product'>" + item.fm_goods_seq + "</a><br/>";
					if (item.fm_order_seq == '') fmGoodsText += "<button type='button' class='resp_btn v2' onclick='manualMatch(" + item._jsGridIdx + ");'>매칭 수정</button>";
				} else {
					var fmGoodsText	= "<button type='button' class='resp_btn v2' onclick='manualMatch(" + item._jsGridIdx + ");'>수동 매칭</button>";
				}

				return fmGoodsText;
			} , width: 90}
		, { title:'쇼핑몰 상품명', name: "fm_goods_name", type: "text", width: 150 }
		, { title:'마켓 주문 옵션명', name: "order_option_text", type: "text", width: 120 }
		, { title:'매칭 옵션명', name: "matching_option_text", type: "text",
			itemTemplate: function(_, item) {
				var matchedOptionText	= item.matched_option_text ;
				if (item.fm_order_seq == '')
					matchedOptionText		+= "<div><button type='button' class='resp_btn v2' onclick='optionNameMatch(" + item._jsGridIdx + ");'>수동 매칭</button></div>"
				return matchedOptionText;
			}, width: 100 }
		, { title:'마켓 상품번호', name: "market_product_code", type: "text", width: 100 }
		, { title:'주문 수량', name: "order_qty", type: "number", width: 70 }
		, { title:'취소 수량', name: "order_cancel_qty", type: "number|string", width: 70,
			itemTemplate: function(_, item) {
				
				if (item.order_cancel_qty > 0) {
					var cancelText	= '<span style="color:red">-' + item.order_cancel_qty + '</span>';
				} else {
					var cancelText	= '';
				}
			
				return cancelText;
			}
		  }
		, { title:'주문금액', name: "order_amount", type: "number|string", width: 70 }
		, { title:'결제금액', name: "paid_amount", type: "number|string", width: 70 }
		, { title:'송장번호', name: "invoice_num", type: "text", width: 100 }
		, { title:'배송비', name: "shipping_cost", type: "number|string", width: 70 }
		, { title:'주문자/연락처', name: "orderer", type: "text", width: 100 }
		, { title:'수령인/연락처', name: "recipient", type: "text", width: 100 }
		, { title:'배송주소', name: "recipient_address_all", type: "text", width: 250 }
		, { title:'배송 메세지', name: "delivery_message", type: "text", width: 100 }
		, { title:'주문일', name: "order_time_text", type: "text", width: 100 }
		, { title:'결제완료일', name: "pay_time_text", type: "text", width: 100 }
	];


	orderListAddOpt					= {};
	orderListAddOpt.clickSelect		= true;
	orderListAddOpt.noDataContent	= "주문 수집/등록 내역이 없습니다";
	orderListAddOpt.clickFunction	= function(args) {
		if (args.event.srcElement.type == 'checkbox')
			checkOrder(args);
		else
			checkRow(args);
	}

	makeJsGrid(orderListGrid, orderListFields, orderListAddOpt);
	layResize();
	defaultDateSet();
	getMarketOrderList();
	setOrderMoveBtn();
	setInterval(setOrderMoveBtn, 60000);
	
	$("#orderAutoSettingBtn").on("click", function(){
		openDialog("주문 자동 등록 여부", "orderAutoSetting",  {"width":"600","show" : "fade","hide" : "fade"});	
	});	

	gSearchForm.init({'pageid':'market_order_list','divSelectLayId':'distTop'},movePage);

});


function checkRow(args) {
	$('#message').html(args.item.last_message);
}

function checkOrder(args) {

	var checkbox	= $('input[type="checkbox"][market_order_no="' + args.item.market_order_no + '"]');

	if($(args.event.target).attr('checkType') == 'orderSelect')
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


function movePage(page) {
	if(typeof page == 'undefined') page = 1;
	$('#page').val(page);
	getMarketOrderList();
}


function getMarketOrderList() {
	var params	= $("#marketOrderForm").serialize();
	$.get('../market_connector_process/getMarketOrderList', params, function(response){

		if (response.marketOrderList.length > 0)
			orderListGrid.jsGrid('setData', response.marketOrderList);
		else
			orderListGrid.jsGrid('setData', []);

		$('#totalCount').val(response.totalCount);
		$('#pagingNavigation').html(response.paging);

		orderListGrid.find(".gridCheck").wrap("<label class='resp_checkbox'></label>");

		closeDialog('orderCollection');
		
	}, 'json');
}

function getOrderCollect() {

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

	var orderCollect	= function(params) {
		
		var targetName	= '[' + marketObj[params.market].name + '-' + params.sellerId + ']';
		$('#message').html(targetName +  ' 주문 수집중...');
		$.get('../market_connector_process/getOrderCollect', params, function(response){
			$('#message').html('');
			var message		= (response.hasOwnProperty('message')) ? targetName + ' ' + response.message : targetName + ' 주문 수집 실패';
			$('#message').html(message);
			
			marketQueue.setResponse(message);
			marketQueue.next();
		}, 'json');

	}

	var doneFunction	= function() {
		$('#message').html(marketQueue.getResponse().join("<br/>"));
		getMarketOrderList();

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


function orderMoveToFm() {
	var selectOrders	= $('input[checktype="orderSelect"]:checked');
	if (selectOrders.length < 1) {
		alert('저장할 주문을 선택하세요');
		return;
	}
	
	var marketOrderSeq	= [];
	var params			= {};
	params.seqList		= [];
	selectOrders.each(function(){
		params.seqList.push(this.value);
		nowMarketOrderNo	= $(this).attr('market_order_no');
		if(marketOrderSeq.indexOf(nowMarketOrderNo) == -1)
			marketOrderSeq.push(nowMarketOrderNo);
	});

	$.post('../market_connector_process/orderMoveToFmOrder', params, function(response){
		if( response.inUse !== "N" ) {
			alert("다른 사용자가 사용 중입니다.");
			setOrderMoveBtn();
			return false;
		}
		var selectedOrderCount	= marketOrderSeq.length;
		var regestedCount		= (response.successList) ? Object.keys(response.successList).length : 0;
		var failCount			= selectedOrderCount - regestedCount;
		var resultMessage		= selectedOrderCount + "건 중 - 성공 : " + regestedCount + '건 / 실패 : ' + failCount + '건';

		if (failCount > 0 ) {
			resultMessage		+= "<div style='color:red; padding:10px 0 0 15px;'>";
			for (key in response.failList) {
				nowFailInfo		= response.failList[key];
				resultMessage	+= nowFailInfo + "<br/>";
			}
			resultMessage		+= "</div>";
		}

		$('#message').html(resultMessage);
		getMarketOrderList();
	},'json');
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

	layHeight			= $('#orderListGrid').height();
	orderListGrid.jsGrid('option','height', layHeight - 170);
}

function defaultDateSet(mode){

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

	if(typeof mode != "undefined" && mode == "collectPop"){
		$("input[name='collectBeginDate']").val(beginDate);
		$("input[name='collectEndDate']").val(endDate);
	}else{

		if(searchObj.hasOwnProperty('searchBeginDate') != true || searchObj.searchBeginDate.length < 10)
			$("input[name='searchBeginDate']").val(beginDate);
			$("input[name='searchBeginDate']").attr('defaultValue',beginDate);

		if(searchObj.hasOwnProperty('searchEndDate') != true || searchObj.searchEndDate.length < 10)
			$("input[name='searchEndDate']").val(endDate);
			$("input[name='searchEndDate']").attr('defaultValue',endDate);
	}
}


function manualMatch(gridIdx) {
	$('#marketProductInfo').html("");
	$('#selectedGridIdx').val(gridIdx);

	openDialog("수동 상품 매칭", "manualMatch", {"width":"600", "height":"315"});
	var nowInfo	= orderListGrid.jsGrid('getDataByIdx', gridIdx);
	
	$('#fmGoodsSeq').val(nowInfo.fm_goods_seq);
	$('#marketProductInfo').html("<span style='color:blue'>[" + nowInfo.market_product_code + "]</span> " + nowInfo.order_product_name);	
}

function doManualMatch() {
	gridIdx		= $('#selectedGridIdx').val();

	fmGoodsSeq	= parseInt($('#fmGoodsSeq').val(), 10);
	if (fmGoodsSeq < 1) {
		alert(shopName + ' 상품코드를 입력하세요');
		return;
	}

	
	$.get('../market_connector_process/getFmGoodsInfo',{'fmGoodsSeq' : fmGoodsSeq}, function(response) {
		if (response.hasOwnProperty('goods_name') == false) {
			alert('상품코드 : ' + fmGoodsSeq + '는 정상적인 상품이 아닙니다.');
			return;
		}
		
		closeDialog('manualMatch');
		

		var nowInfo		= orderListGrid.jsGrid('getDataByIdx', gridIdx);
		var btnOpt		= {'yesMsg':'[예] 수동 매칭','noMsg':'[아니오] 취소'};
		var confirmMsg	= nowInfo.market_name + ' <span style="color:red;font-weight: bold;">"' + nowInfo.order_product_name + '"</span> 상품과 <br/>';
		confirmMsg		+= shopName + ' <span style="color:blue;font-weight: bold;">"' + response.goods_name + '"</span> 상품을<br/>';
		confirmMsg		+= '수동매칭 하시겠습니까?';
		
		openDialogConfirm(confirmMsg,550,200,function(){
			
			var params				= {};
			params.fmGoodsSeq		= fmGoodsSeq;
			params.marketOrderInfo	= nowInfo;
			
			$.post('../market_connector_process/doManualMatch', params, function(response) {
				alert(response.message);
				getMarketOrderList();
			}, 'json')

		},function(){},btnOpt);
		
		$('.ui-widget-overlay').remove();

	},'json');

	/*
	
	*/

}

function optionNameMatch(gridIdx) {
	$('#marketProductInfo').html("");
	$('#selectedGridIdx').val(gridIdx);
	
	var nowInfo	= orderListGrid.jsGrid('getDataByIdx', gridIdx);
	$('#fmOptionName').val(nowInfo.matched_option_name);
	$('#marketOrderOptionInfo').html(nowInfo.order_option_name);

	openDialog("수동 옵션명 매칭", "optionMatch", {"width":"600", "height":"315"});
}

function doOptionNameMatch() {
	var gridIdx		= $('#selectedGridIdx').val();
	var nowInfo		= orderListGrid.jsGrid('getDataByIdx', gridIdx);


	var matchedOptionName	= $.trim($('#fmOptionName').val());

	if (matchedOptionName == nowInfo.matched_option_name) {
		if (matchedOptionName == '')
			alert('매칭된 옵션명이 없습니다.');
		else
			alert('매칭된 옵션명이 이전과 동일합니다.');

		return;
	}

	closeDialog('optionMatch');
		

	var btnOpt		= {'yesMsg':'[예] 수동 매칭','noMsg':'[아니오] 취소'};

	var confirmMsg	= nowInfo.market_name + ' 주문번호 : <span style="font-weight: bold;">' + nowInfo.market_order_no + ' 주문</span><br/>'
	confirmMsg		+= '<span style="font-weight: bold;">' + nowInfo.order_product_name + '</span> 상품의<br/><br/>';
	
	if (matchedOptionName == '') {
		confirmMsg		+= '옵션 매칭을<span style="color:red;font-weight: bold;"> "초기화"</span>하시겠습니까';
	} else {
		confirmMsg		+= '<span style="color:red;font-weight: bold;">"' + nowInfo.order_option_name + '"</span> 옵션을 <br/>';
		confirmMsg		+= '<span style="color:blue;font-weight: bold;">"' + matchedOptionName + '"</span>로 <br/>';
		confirmMsg		+= '수동매칭 하시겠습니까?';
	}

		
	openDialogConfirm(confirmMsg,550,240,function(){
		var params					= {};
		params.fmMarketOrderSeq		= nowInfo.seq_list;
		params.matchedOptionName	= matchedOptionName;
		
		$.post('../market_connector_process/doOptionNameMatch', params, function(response) {
			alert(response.message);
			getMarketOrderList();
		}, 'json')		
	},function(){},btnOpt);
		
	$('.ui-widget-overlay').remove();


}

// 주문 등록 버튼을 사용여부에 따라 변화시킨다.
function setOrderMoveBtn()
{
	$.get("../market_connector_process/getInUse", function(res) {
		var $selector = $("#distStart");
		if(res.inUse !== 'Y') { // 사용 중이 아닌 경우
			$selector.attr("onclick", "orderMoveToFm();");
			$selector.html("<button type=\"button\"  class=\"resp_btn active\">주문 등록</button>");
		} else { // 사용 중인 경우
			var msg = "";
			// 어느 사용자가 등록 중인지 표시한다.
			if(res.user !== undefined && typeof res.user === 'object' && res.user.manager_id !== '' && res.user.manager_id !== undefined) {
				if(res.user.mname !== '' && res.user.mname !== undefined) {
					msg += res.user.mname + "(" + res.user.manager_id + ")"; 
				} else {
					msg += res.user.manager_id;
				}
				msg += "님이 ";
			} else {
				msg += "다른 사용자가 ";
			}
			msg += "등록 중입니다.";
			$selector.attr("onclick", "alert(\"" + msg + "\"); return false;");
			$selector.html("<button onclick=\"return false;\"  class=\"resp_btn active\">등록 중</span>");
		}
		$selector.css("display", "block");
	}).fail(function() { // 서버 오류 등으로 실패했을 경우에도 주문 등록은 하게 한다.
		$selector.attr("onclick", "orderMoveToFm();");
		$selector.html("<button type=\"button\" class=\"resp_btn active\">주문 등록</button>");
		$selector.css("display", "block");
	});
}
