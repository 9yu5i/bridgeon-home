/*
에디터 관리 javascript
@2026.07.31
*/
function initEditorList(sc) {
	var arrSort = {
		'regist_date desc': '최근 등록순',
		'name asc': '이름순',
		'sort asc': '노출순서순'
	};

	gSearchForm.init({
		pageid: 'editor_catalog',
		search_mode: sc.search_mode,
		select_date: sc.select_date,
		displaySort: arrSort,
		sc: sc.scObj
	});

	$(document).on('click', '#chkAll', function () {
		$("input[name='editor_seq[]']").prop('checked', $(this).is(':checked'));
	});

	$(document).on('click', '.editor_modify_btn', function () {
		location.href = 'regist?seq=' + $(this).attr('editor_seq');
	});

	$(document).on('click', '.editor_delete_btn', function () {
		var seqList = [];
		var singleSeq = $(this).attr('editor_seq');

		if (singleSeq) {
			seqList = [singleSeq];
		} else {
			$("input[name='editor_seq[]']:checked").each(function () {
				seqList.push($(this).val());
			});
		}

		if (seqList.length < 1) {
			showEditorAlert('삭제할 에디터를 선택해주세요.');
			return;
		}

		openDialogConfirm('삭제하시겠습니까?', 400, 150, function () {
			$.ajax({
				url: '../editors/delete',
				type: 'post',
				dataType: 'json',
				traditional: true,
				data: {
					editor_seq: seqList
				}
			}).done(function (res) {
				if (res.result && res.result.status) {
					openDialogAlert(res.result.message, 400, 150, function () {
						location.reload();
					});
					return;
				}

				showEditorAlert(res.result ? res.result.message : '삭제 중 오류가 발생했습니다.');
			}).fail(function () {
				showEditorAlert('삭제 중 오류가 발생했습니다.');
			});
		});
	});
}

function initEditorRegist(cfg) {
	var profileUploadConfig = $.extend({}, uploadConfig, {
		file_path: '/data/editor/profile',
		file_param: 'filedata',
		allowTypes: 'jpg|jpeg|png|gif|webp'
	});

	$('#profileUploadButton').createAjaxFileUpload(profileUploadConfig, uploadCallback);

	if (cfg.profileImage) {
		imgUploadEvent('#profileUploadButton', '', '', cfg.profileImage);
	}

	setContentsRadio('display_yn', cfg.displayYn);

	$(".input_limit_name").on('keyup', function () {
		var max = 50;
		var len = $(this).val().length;
		if (len > max) {
			$(this).val($(this).val().substring(0, max));
		}
	});

	$(document).on('submit', '#editorRegist', function (e) {
		var submitUrl = $("input[name='editor_seq']").length > 0 ? '../editors/modify' : '../editors/save';
		var $form = $(this);

		e.preventDefault();
		if (chkEditorSubmit(this) === false) {
			return false;
		}

		$.ajax({
			url: submitUrl,
			type: 'post',
			dataType: 'json',
			data: $form.serialize()
		}).done(function (res) {
			loadingStop();

			if (res.result && res.result.status) {
				showEditorAlert(res.result.message, function () {
					location.href = 'catalog';
				});
				return;
			}

			showEditorAlert(res.result ? res.result.message : '저장 중 오류가 발생했습니다.');
		}).fail(function () {
			loadingStop();
			showEditorAlert('저장 중 오류가 발생했습니다.');
		});

		return false;
	});
}

window.callbackGoodsList = function (goodsList) {
	if (typeof goodsList === 'string') {
		goodsList = goodsList
			.replace(/&quot;/g, '"')
			.replace(/&#034;/g, '"')
			.replace(/&#39;/g, "'");

		goodsList = $.parseJSON(goodsList);
	}

	var $tbody = $('#linkedPicks .goods_list tbody');
	var addedCount = 0;

	$.each(goodsList, function (key, list) {
		if (!list.goods_seq) {
			return true;
		}

		if ($tbody.find("tr[rownum='" + list.goods_seq + "']").length > 0) {
			return true;
		}

		addedCount++;
		$tbody.find("tr[rownum='0']").hide();

		var price = list.default_price;
		if (typeof get_currency_price === 'function') {
			price = get_currency_price(list.default_price, 2);
		}

		var goodsName = list.goods_name;
		if (gGoodsSelect && typeof gGoodsSelect._stripslashes === 'function') {
			goodsName = gGoodsSelect._stripslashes(list.goods_name);
		}

		var html = '';
		html += '<tr rownum="' + list.goods_seq + '">';
		html += '<td class="center">';
		html += '<label class="resp_checkbox">';
		html += '<input type="checkbox" name="linked_goodsTmp[]" class="chk" value="' + list.goods_seq + '" />';
		html += '<input type="hidden" name="linked_goods[]" value="' + list.goods_seq + '" />';
		html += '</label>';
		html += '</td>';
		html += '<td class="left">';
		html += '<div class="image"><img src="' + list.goods_img + '" class="goodsThumbView" width="50" height="50" /></div>';
		html += '<div class="goodsname">';

		if (!(list.goods_code === '' || list.goods_code === null)) {
			html += '<div>[상품코드:' + list.goods_code + ']</div>';
		}

		html += '<a href="../goods/regist?no=' + list.goods_seq + '" target="_blank">[' + list.goods_seq + '] ' + goodsName + '</a>';
		html += '</div>';
		html += '</td>';
		html += '<td class="right">' + price + '</td>';
		html += '<td class="center"><textarea name="pick_reason[]" class="line" style="width:95%;height:40px;" placeholder="추천 이유"></textarea></td>';
		html += '<td class="center"><input type="text" name="pick_keywords[]" class="line" size="12" placeholder="키워드" /></td>';
		html += '</tr>';

		$tbody.append(html);
	});

	if (addedCount > 0) {
		alert('상품이 ' + addedCount + '개 선택되었습니다.');
	}
};

function pickRowDel() {
	var $tbody = $('#linkedPicks .goods_list tbody');

	$tbody.find("input[name='linked_goodsTmp[]']:checked").each(function () {
		$(this).closest('tr').remove();
	});

	if ($tbody.find("tr[rownum!='0']").length === 0) {
		$tbody.find("tr[rownum='0']").show();
	}

	$("#linkedPicks .goods_list_header input[name='chkAll']").prop('checked', false);
}

function chkEditorSubmit() {
	if ($("input[name='name']").val() === '') {
		showEditorAlert('에디터 이름을 입력해주세요.');
		return false;
	}

	if ($("input[name='nickname']").val() === '') {
		showEditorAlert('에디터 닉네임을 입력해주세요.');
		return false;
	}

	loadingStart();
	return true;
}

function selectEditorPickGoods() {
	ensureGoodsSelectLayer();
	var displayResultId = 'linked_goods';

	var params = {
		goodsNameStrCut: 30,
		selector: '#' + displayResultId + 'SelectContainer',
		select_goods: displayResultId,
		makelistFun: 'selectGoodsListHtml',
		maxSelectGoods: 10,
		service_h_ad: window.Firstmall.Config.Environment.serviceLimit.H_AD,
		closeMessageUse: true,
		closeMessage: '상품이 {length}개 선택되었습니다.'
	};

	gGoodsSelect.open(params, callbackGoodsList);
}

function ensureGoodsSelectLayer() {
	if ($('#lay_goods_select').length === 0) {
		$('body').append('<div id="lay_goods_select"></div>');
	}
}

function showEditorAlert(message, callback) {
	if (document.getElementById('openDialogLayerMsg') && typeof openDialogAlert === 'function') {
		openDialogAlert(message, 400, 150, callback);
		return;
	}

	alert(message);
	if (typeof callback === 'function') {
		callback();
	}
}
