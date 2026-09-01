if(typeof broadcastRegistScriptLoaded == 'undefined'){		// ready 는 1회만 실행되도록
	var broadcastRegistScriptLoaded = true;
	$(function() {

		// 상품 선택
		$(document).on("click",".btn_select_goods", function () {selectGoods()});
		// 상품 삭제
		$(document).on("click",".goods_del_icon", function () {deleteGoods($(this))});

		// form submit
		$(document).on("submit","#bs-write-form", function(e) {
			e.preventDefault();
			var data  = $(this).serialize();

			var submitUrl = "/api/broadcast/create";
			var submitType = "POST";
			var submitMsg = "라이브 방송이 등록되었습니다.";

			if(bsSeq) {
				submitUrl = "/api/broadcast/modify/"+bsSeq;
				submitMsg = "라이브 방송이 수정되었습니다.";
			}

			$.ajax({
				url: submitUrl,
				type: submitType,
				data: data,
				dataType: 'json',
			}).done(function(res) {
				if(res.success === true && typeof res.data === 'object' && typeof res.data.bsSeq === "number") {
					self.openDialogAlert(submitMsg, 400, 140, function() {
						document.location.reload();
					});
				} else {
					self.openDialogAlert("오류가 발생했습니다. 새로고침 후 다시시도해주세요.", 400, 140);
				}
			}).fail(function(res) {
				var res = JSON.parse(res.responseText);
				self.openDialogAlert(res.message.message, 400, 140, function(){
					element = res.message.elementName;
					$("[name='"+element+"']").focus();
				});

			});
		});

		$(document).on('click',".btn-drop-form", function(){
			openDialogConfirm("방송 편성표를 삭제하시겠습니까?", 400, 150, function() {
				dropBroadcast(bsSeq);
			});
		});
	});
}
// 로드와 상관없음
$(function() {
	if(bsSeq) {
		getBroadcast(pagemode);
	} else {
		getDefaultBroadcast();
	}
});

// 상품 선택 폼 오픈
function selectGoods() {
	var displayResultId = "broadcastGoods";

	var params = {
			'goodsNameStrCut'	: 30,
			'selector'			: "#"+displayResultId+'SelectContainer',
			'select_goods'		: displayResultId,
			'makelistFun'		: 'selectGoodsListHtml',
			'maxSelectGoods'	: 10,
			'service_h_ad'		: window.Firstmall.Config.Environment.serviceLimit.H_AD
		};
	gGoodsSelect.open(params);
}

// 선택한 상품 삭제
function deleteGoods(obj) {
	var mainchk = $(obj).closest("tr").find("input:radio[name='broadcastGoodsMain']");
	if(isMainChecked(mainchk)) {
		// 첫번째 radio checked
		$("input:radio[name='broadcastGoodsMain']").eq(0).attr('checked',true);
	}
	gGoodsSelect.select_delete('minus', $(obj));
}

// 검색 폼 에서 선택 후에 html append
function selectGoodsListHtml(data, save_goods, goods_field_name, is_load) {
	var html = mdisabled = '';
	if( pagemode == 'info') {
		mdisabled = 'disabled';
	}
	$.each(data, function(key, list){
		mchecked = '';
		if(save_goods != null && save_goods.length > 0 && $.inArray(list.goods_seq,save_goods) != -1){
		}else{
			list.goods_kind_img = "";
			if(list.goods_kind != ""){
				if(list.goods_kind == "package"){
					list.goods_kind_img = "<img src='../skin/default/images/design/icon_order_package.gif' align='absmiddle'>&nbsp;";
				}else if(list.goods_kind == "coupon"){
					list.goods_kind_img = "<img src='../skin/default/images/design/icon_order_ticket.gif' align='absmiddle'>&nbsp;";
				}
			}

			// 대표 상품 체크
			if(bsSeq) {
				// 수정 시에는 db 데이터 확인
				if(list.broadcast_goods_main=="1") {
					mchecked = 'checked';
				}
			} else {
				// 등록 시에는 첫번째꺼에 체크
				if(key==0 && !isMainChecked()) {
					mchecked = 'checked';
				}
			}

			html += '<tr rownum="'+list.goods_seq+'">';
			html += '	<td class="center"><label class="resp_radio"><input type="radio" name="'+goods_field_name+'Main" class="chk" value="'+list.goods_seq+'"  '+mdisabled+ ' ' +mchecked+'/></labal>';
			html += '		<input type="hidden" name="'+goods_field_name+'[]" value="'+list.goods_seq+'" /><input type="hidden" name="'+goods_field_name+'Seq[]" value="" /></td>';
			html += '	<td class="left">';
			html += '		<div class="image"><img src="'+list.goods_img+'" class="goodsThumbView" width="50" height="50" /></div>';
			html += '		<div class="goodsname">';

			if(!(list.goods_code == "" || list.goods_code == null)){
				html += '		<div>[상품코드:'+list.goods_code+']</div>';
			}
			if(is_load == "load") {
				price = list.default_price;
			} else {
				price = get_currency_price(list.default_price,2);
			}
			html += '		'+ list.goods_kind_img+'<a href="../goods/regist?no='+list.goods_seq+'" target="_blank">['+list.goods_seq+'] '+gGoodsSelect._stripslashes(list.goods_name)+'</a></div></td>';
			html += '	<td class="right">'+price+'</td>';
			if(pagemode == "regist") {
				html += '	<td class="center"><button type="button" class="goods_del_icon btn_minus"></button></td>';
			}
			html += '</tr>';
		}
	});

	return html;
}

/*
* 대표(main) 상품 선택 되어있는지 체크
* obj 있으면 해당 radio 가 대표인지, 없으면 전체 checkbox 중 체크 되어있는지
*/
function isMainChecked(obj) {
	if(obj) {
		if($(obj).attr('checked') == 'checked') {
			return true;
		} else {
			return false;
		}
	} else {
		if( $("input:radio[name='broadcastGoodsMain']:checked").length > 0 ) {
			return true;
		} else {
			return false;
		}
	}
}

/*
*  방송 수정
*/
function getBroadcast() {
	$.ajax({
		url: "/api/broadcast/"+bsSeq,
		type: "GET"
	}).done(function(res) {
		var data = res.data;
		if(pagemode == 'regist') {
			makeCreateForm(data);
		} else {
			makeInfoForm(data);
		}
	});
}

function makeCreateForm(data) {
	var bsform = $("#bs-write-form");

	// 방송 예정인 건만 삭제/수정 가능
	if(data.status === 'create') {
		bsform.find(".btn-drop-form").attr("disabled", false).css('display','block');
	} else {
		bsform.find("button[type='submit']").css('display','none');
	}
	bsform.find(".regist_date").html("(예약 신청일 : "+data.registDate+")");
	bsform.find("input[name='bs_seq']").val(data.bsSeq);
	bsform.find("input[name='provider_seq']").val(data.providerSeq);
	bsform.find("input[name='manager_seq']").val(data.managerSeq);
	bsform.find("input[name='approval']").val(data.approval);
	bsform.find("input[name='title']").val(data.title).trigger('keyup').trigger('focus');;
	bsform.find("input[name='summary']").val(data.summary).trigger('keyup').trigger('focus');;

	// 시작시간
	if(typeof data.startDate === 'string') {
		var startTimeObj = parseTimeToObj(data.startDate);
		if(typeof startTimeObj.date === 'string') {
			bsform.find("input[name=start_date_day]").val(startTimeObj.date);
		}
		if(typeof startTimeObj.hour === 'number') {
			if(startTimeObj.hour < 10) startTimeObj.hour = '0'+startTimeObj.hour;
			bsform.find("select[name=start_date_hour]").val(startTimeObj.hour).attr("selected", "selected");
		}
		if(typeof startTimeObj.min === 'string') {
			bsform.find("select[name=start_date_min]").val(startTimeObj.min).attr("selected", "selected");
		}
	}
	if(typeof data.image === 'string') {
		imgUploadEvent("#image", "", "", (data.image).split('?')[0]);
	}

	// 상품 정보 리스트
	if(typeof data.goodsData === 'object' && data.goodsData.length > 0 ) {
		// 방송 상품이 없습니다. layer 숨김 처리
		$(".no_data_area").css("display", "none");
		goodsData = camelToUnder(data.goodsData);
		var tag = selectGoodsListHtml(goodsData, null, "broadcastGoods", "load");

		$("#broadcastGoods > table > tbody ").find("[rownum=0]").css('display','none');
		$("#broadcastGoods > table > tbody > tr:last").after(tag);
	}

	// 추가 데이터 필요
	bsform.find(".manager_name").html(data.mname + "(" +data.managerId+ ")");

	// 2차 개발 범위
	bsform.find(".provider_name").html("본사");
}

function makeInfoForm(data) {
	var bsform = $("#bs-info-form");

	bsform.find(".regist_date").html("(예약 신청일 : "+data.registDate+")");
	bsform.find('.broadcast.title').html(data.title);
	bsform.find('.broadcast.summary').html(data.summary);

	// 시작시간
	if(typeof data.startDate === 'string') {
		var startTimeObj = parseTimeToObj(data.startDate);
		if(typeof startTimeObj.date === 'string') {
			bsform.find("input[name=start_date_day]").val(startTimeObj.date);
		}
		if(typeof startTimeObj.hour === 'number') {
			if(startTimeObj.hour < 10) startTimeObj.hour = '0'+startTimeObj.hour;
			bsform.find("select[name=start_date_hour]").val(startTimeObj.hour).attr("selected", "selected");
		}
		if(typeof startTimeObj.min === 'string') {
			bsform.find("select[name=start_date_min]").val(startTimeObj.min).attr("selected", "selected");
		}
	}
	if(typeof data.image === 'string') {
		imgUploadEvent("#image", "", "", (data.image).split('?')[0]);
		bsform.find(".webftpFormItem > .btn_wrap").css('display','none');
		bsform.find(".preview_image").find('a:eq(0)').css('display','none');
	}

	// 상품 정보 리스트
	if(typeof data.goodsData === 'object' && data.goodsData.length > 0 ) {
		// 방송 상품이 없습니다. layer 숨김 처리
		$(".no_data_area").css("display", "none");
		goodsData = camelToUnder(data.goodsData);
		var tag = selectGoodsListHtml(goodsData, null, "broadcastGoods", "load");

		$("#broadcastGoods > table > tbody ").find("[rownum=0]").css('display','none');
		$("#broadcastGoods > table > tbody > tr:last").after(tag);
	}

	// 추가 데이터 필요
	bsform.find(".manager_name").html(data.mname + "(" +data.managerId+ ")");

	// 2차 개발 범위
	bsform.find(".provider_name").html("본사");
}

/**
 * 방송 기본 데이터 load
 */
function getDefaultBroadcast() {
	$.ajax({
		url: "./defaultRegist/",
		type: "GET",
		dataType: "json"
	}).done(function(res) {
		var data = res.default;
		var bsform = $("#bs-write-form");

	//	bsform.find("input[name='provider_seq']").val(data.providerSeq);
		bsform.find("input[name=start_date_day]").val(data.date);
		bsform.find("select[name=start_date_hour]").val(data.hour);
		bsform.find("select[name=start_date_min]").val(data.minute);

	});
}

/**
 * yyyy-mm-dd hh:ii:ss 문자열을 파싱하여 반환한다.
 * @param time
 * @returns
 */
function parseTimeToObj(time)
{
	var list = time.split(" ");
	var object = new Object();
	if(typeof list[0] === 'string') {
		object.date = list[0];
	}

	if(list.length > 1 && typeof list[1] === 'string') {
		var timeList = list[1].split(":");

		if(typeof timeList[0] === 'string') {
			timeList[0] = parseInt(timeList[0]);
			object.hour = timeList[0];
		}

		if(typeof timeList[1] === 'string') {
			object.min = timeList[1];
		}
	}

	return object;
}