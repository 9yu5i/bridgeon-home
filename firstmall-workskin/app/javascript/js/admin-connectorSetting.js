var reloaded	= false;

$('document').ready(function() {

	if (reloaded === true)
		return false;

	reloaded	= true;

	
	$('.goodsPriceSetAdjustmentUse').off('change').change(function(){
		if ($('.goodsPriceSetAdjustmentUse:checked').val() == 'Y'){
			//$('.priceAdjustmentUse').attr('disabled', false);
			$('.goodsPriceSet_Y').show();
		}else{
			//$('.priceAdjustmentUse').attr('disabled', true);
			$('.goodsPriceSet_Y').hide();
		}
	});
	
	$('#goodsPriceSetCuttingUse').off('change').change(function(){
		if ($(this).is(':checked'))
			$('.priceCuttingUse').attr('disabled', false);
		else
			$('.priceCuttingUse').attr('disabled', true);
	});
	/*
	$('.goodsStockSetAdjustmentUse').off('change').change(function(){
		if ($('.goodsStockSetAdjustmentUse:checked').val() == 'Y')
			$('.stockAdjustmentUse').attr('disabled', false);
		else
			$('.stockAdjustmentUse').attr('disabled', true);
	});*/

	if (typeof goodsPriceSet == 'object') {
		$("input[name='goodsPriceSet[adjustment][use]']").attr("checked", false);
		$("input[name='goodsPriceSet[adjustment][use]'][value='" + goodsPriceSet.adjustment.use + "']").attr("checked", true).trigger('change')

		if (typeof goodsPriceSet.adjustment == 'object' && goodsPriceSet.adjustment.use == 'Y') {
			$("input[name='goodsPriceSet[adjustment][value]']").val(goodsPriceSet.adjustment.value);
			$("select[name='goodsPriceSet[adjustment][unit]']").val(goodsPriceSet.adjustment.unit);
			$("select[name='goodsPriceSet[adjustment][type]']").val(goodsPriceSet.adjustment.type);
		}

		if (typeof goodsPriceSet.cutting == 'object' && goodsPriceSet.cutting.use == 'Y') {
			$("input[name='goodsPriceSet[cutting][use]']").attr('checked', true).trigger('change');
			$("select[name='goodsPriceSet[cutting][unit]']").val(goodsPriceSet.cutting.unit);
			$("select[name='goodsPriceSet[cutting][type]']").val(goodsPriceSet.cutting.type);

		} else {

		}
	}

	if (typeof goodsStockSet == 'object') {
		$("input[name='goodsStockSet[adjustment][use]']").attr("checked", false);
		$("input[name='goodsStockSet[adjustment][use]'][value='" + goodsStockSet.adjustment.use + "']").attr("checked", true).trigger('change')

		if (goodsStockSet.adjustment.use == 'Y') {
			$("input[name='goodsStockSet[adjustment][value]']").val(goodsStockSet.adjustment.value);
		}
	}

	$('#accountSetBtn').off('click').click(function() {
		var params	= $("#accountForm").serialize();
		$.post('../market_connector_process/marketAccountSet', params, function(response){
			openDialogAlert(response.message, 0, 0, function(){
				if (response.success == 'Y') {
					if ($('#mode').val() == 'regist') {

						//accountSeq
						var relocationUrl	= './market_setting?market=' + $('#market').val();
						relocationUrl		+= '&accountSeq=' + response.accountSeq;
						relocationUrl		+= '&sellerId=' + response.sellerId;
						relocationUrl		+= '&pageMode=AccountSet';
						opener.window.location.href	= relocationUrl;
						self.close();
					} else {
						window.location.reload();
					}
				}

			});
		}, 'json');
		return;
	});
	
	$('#accountSetShoplinkerBtn').off('click').click(function() {
		var params	= $("#accountForm").serialize();
		$.post('../market_connector_process/marketAccountSetShopLinker', params, function(response){
			openDialogAlert(response.message, 0, 0, function(){
				if (response.success == 'Y') {
					if ($('#mode').val() == 'regist') {

						//accountSeq
						var relocationUrl	= './market_setting?market=' + $('#market').val();
						relocationUrl		+= '&accountSeq=' + response.accountSeq;
						relocationUrl		+= '&sellerId=' + response.sellerId;
						relocationUrl		+= '&pageMode=AccountSet';
						opener.window.location.href	= relocationUrl;
						self.close();
					} else {
						window.location.reload();
					}
				}

			});
		}, 'json');
		return;
	});	

	$('#accountDeleteBtn').click(function() {
		var btnOpt		= {'yesMsg':'[예] 삭제', 'noMsg':'[아니요] 취소'}

		openDialogConfirm('<span class="bold">' + $('#sellerId').val() + '</span> 계정을 삭제 하시겠습니까?', 300, 160, function() {
			var params		= {};
			params.market	= $('#market').val();
			params.sellerId	= $('#sellerId').val();
			$.post('../market_connector_process/marketAccountDelete', params, function(response){

				openDialogAlert(response.message, 0, 0, function(){
					if (response.success == 'Y')
						window.location.replace('./market_setting?market=' + params.market);
				});
			}, 'json');
		}, function(){}, btnOpt);
	});
	
	/* 판매마켓 선택 >  판매자 아이디 세팅 */
	$('#searchMarket').change(function(){

		var market 			= $(this).find('option:selected').val();
		var sellerId 		= $("select[name='searchSellerId']");
		var searchSellerId 	= '';

		if(typeof searchObj == 'object'){
			searchSellerId = searchObj.searchSellerId;
		}

		sellerId.find('option').remove();
		sellerId.append('<option value="">전체</option>');
		if(market != "" &&  marketObj[market].sellerList.length > 0){
			$.each(marketObj[market].sellerList, function(key, _sellerid){
				if(searchSellerId == _sellerid){
					sellerId.append('<option value="' + _sellerid + '" selected>' + _sellerid + '</option>');
				}else{
					sellerId.append('<option value="' + _sellerid + '">' + _sellerid + '</option>');
				}
			});
		}		

	}).trigger("change");
	if(typeof searchObj == 'object' && typeof searchObj.searchGroupName != "undefined"){
		$("input[name='searchGroupName']").val(searchObj.searchGroupName);
	}
	/*
	$('#linkeageMarketGroup').change(function(){
		$form = $('form[name=processFrom]');
		
		var market = $(this).find('option:selected').val();
		
		$form.find('input[name=searchMarket]').val(market);
		$form.find('input[name=pageMode]').val('AddInfoListSet');
		$form.attr('action','/admin/market_connector/market_setting');
		$form.attr('target','');	
		$form.submit();
	});	
	*/

	/* 연동설정 메뉴 */
	$(".market_seller dt").bind('click', function(){
		$(".market_seller dd").hide();
		$(".market_seller dt").removeClass("active");
		$(this).addClass("active");
		$(this).next().show();
	});

	/* 설정버튼 */
	swipeToggleEvent();
	if ($('#accountUseYn').val() == 'Y') {
		$("#accountOnOff").removeClass("btn-off").addClass("btn-on").val("on");
		$("#accountOnOff").css('left', 30);
		$("#accountOnOff").parent().addClass("on");
	} else {
		$("#accountOnOff").removeClass("btn-on").addClass("btn-off").val("off");
		$("#accountOnOff").css('left', 1);
		$("#accountOnOff").parent().removeClass("on");
	}
	
	/*샵링커 마켓 셋팅*/
	$('#mallSort').change(function(){
		var selectSort = $(this).find('option:selected').val();
		var rtnHtml = '<option value="">마켓 선택</option>';
		
		$.get('/admin/market_connector/getLinkageMarketList',{'mallSort':selectSort},function( data ) {
			var marketList = jQuery.parseJSON(data);
			$.each(marketList,function(key, value){
				selectVal = value['mall_seq'] + '|' + value['mall_code'];
				rtnHtml += '<option value="' +selectVal+ '">' +value['mall_name']+ '</option>';
			});
			
			$('#linkageMall').empty();
			$('#linkageMall').html(rtnHtml);
		});
	});
	
	$('#linkageMall').change(function(){
		var selectVal = $(this).find('option:selected').val();
		var marketCode = selectVal.split('|')[1];
		
		if(marketCode == 'APISHOP_0003' || marketCode == 'APISHOP_0010'){
			$('#masterId').show();
		}else{
			$('#masterId').hide();
		}
		
	});
	
	$('input[name*=chkSeq]').live('click',function(){
		checkedChk();
	});
	
	$('#linkageDeleteBtn').live('click',function(){
		var setVal = '';
		$form = $('#processFrom');
		
		$('input[name*=chkSeq]').each(function(){
			if($(this).attr('checked')){
				setVal += '+' + $(this).val();
			}
		});
		
		if(setVal == ''){
			openDialogAlert('삭제할 계정을 선택해주세요.', 0, 0);
			return false;
		}
		
		$form.find('input[name=chkSeq]').val(setVal);
		var params	= $form.serialize();		
		var btnOpt		= {'yesMsg':'[예] 삭제', 'noMsg':'[아니요] 취소'}
		
		openDialogConfirm('선택하신 계정에 연결된 필수정보도 함께 삭제됩니다. 선택한 계정을 삭제 하시겠습니까?', 330, 160, function() {
			$.post('../market_connector_process/selectMarketAccountDelete', params, function(response){

				openDialogAlert(response.message, 0, 0, function(){
					if (response.success == 'Y')
						window.location.replace('./market_setting');
				});
			}, 'json');
		}, function(){}, btnOpt);		
	});
	
	$('button[id*=marketDeleteBtn]').each(function() {
		
		$(this).live('click',function(){
			var btnOpt		= {'yesMsg':'[예] 삭제', 'noMsg':'[아니요] 취소'}
			var market = $(this).attr('rel');
			var sellerId = $(this).attr('rel2');

			openDialogConfirm('<span class="bold">' + sellerId + '</span> 계정을 삭제 하시겠습니까?', 300, 160, function() {
				var params		= {};
				params.market	= market;
				params.sellerId	= sellerId;
				$.post('../market_connector_process/marketAccountDelete', params, function(response){

					openDialogAlert(response.message, 0, 0, function(){
						if (response.success == 'Y')
							window.location.replace('./market_setting');
					});
				}, 'json');
			}, function(){}, btnOpt);		
		});

	});	
	
	$('button[id*=marketDetailBtn]').each(function() {
		
		$(this).on('click',function(){
			var market 		= $(this).attr('rel');
			var accountSeq 	= $(this).attr('rel2');
			$form = $('#processFrom');
			
			$form.find('input[name=detailMarket]').val(market);
			$form.find('input[name=accountSeq]').val(accountSeq);
			$form.find('input[name=pageMode]').val('AccountSetDetail');
			$form.attr('action','/admin/market_connector/market_setting');
			$form.submit();
		});

	});
	
	$('button[id*=addInfoModify]').each(function(){
		$(this).live('click',function(){
			window.open('', 'addInfoPopup', 'width=1020px,height=1000px,menubar=no,resizable=no,scrollbars=yes');
			
			var getParam = $(this).attr('rel');
			var groupId = $(this).attr('rel2');
			$form = $('#processFrom');
			
			$form.find('input[name=detailMarket]').val(getParam);
			$form.find('input[name=pageMode]').val('AddInfoDetail');
			$form.find('input[name=linkMode]').val('modify');
			$form.find('input[name=groupId]').val(groupId);
			$form.attr('action','/admin/market_connector/shoplinker_add_info_detail');
			$form.attr('target','addInfoPopup');			
			$form.submit();
		});
	});	
	
	//금액 절사 노출
	setContentsRadio("goodsPriceSet_Y", "N");
	
});

function groupAdd(param){
	window.open('', 'addInfoPopup', 'width=1020px,height=1000px,menubar=no,resizable=no,scrollbars=yes');
	
	$form = $('#processFrom');
	
	$form.find('input[name=detailMarket]').val(param);
	$form.find('input[name=pageMode]').val('AddInfoDetail');
	$form.find('input[name=linkMode]').val('regist');
	$form.find('input[name=groupId]').val('');			
	$form.attr('action','/admin/market_connector/shoplinker_add_info_detail');
	$form.attr('target','addInfoPopup');
	$form.submit();	
}

function checkedChk(){
	var rtn = true;
	
	$('input[name*=chkSeq]').each(function(){
		if(!$(this).attr('checked')){
			rtn = false;
		}
	});
		
	if(!rtn){
		$('input[name=chkAll]').prop('checked',false);
	}else{
		$('input[name=chkAll]').prop('checked',true);
	}
	
	return rtn;
}

function chkAll(){
	var checked = true;
	var $chkAll = $('input[name=chkAll]').attr('checked');
	
	if(!$chkAll){
		checked = false;
	}
	
	$('input[name*=chkSeq]').each(function(){
		$(this).prop('checked',checked);
	});
}

function marketAuthHelpLay(market) {

	$.get('../market_connector_process/getAuthInfo', {'market':market}, function(response) {
		if (response.title != '') {
			$('#helperLayContent').html(response.content);
			openDialog(response.title, "marketAuthHelper", {"width":response.width});
		}
	}, 'json');

	return;
}

function swipeToggleEvent(){
	var _width = $(".btn-onoff").width();
	var _widthb = $(".btn-onoff button").width();

	$(".btn-onoff").off('click').click(function(){
		if($('#accountUseYn').val() == 'N'){
			$("button", this).removeClass("btn-off").addClass("btn-on").val("on");
			$("button", this).animate({"left": _width - _widthb +"px"}, "swing" );
			$("button", this).parent().addClass("on");
			$('#accountUseYn').val('Y');
		}else{
			$("button", this).removeClass("btn-on").addClass("btn-off").val("off");
			$("button", this).animate({"left": 1+"px"}, "swing");
			$("button", this).parent().removeClass("on");
			$('#accountUseYn').val('N');
		}
	})
}


function getAddinfo(){
	$form = $('#shoplinkerAddinfoForm');
	var params = $form.serialize();
	
	$.post('../market_connector/getMarketAddinfo', params, function(response){
		if(response.success == "Y"){
			location.href = response.resultData;
		}else{
			//openDialogAlert(response.message, 0, 0);			
			alert(response.message);
			self.close();
			return false;
		}
			
	}, 'json');

}

function movePage(page){
	$("#marketSerachFrom input[name='page']").val(page);
	$("#marketSerachFrom").submit();
}