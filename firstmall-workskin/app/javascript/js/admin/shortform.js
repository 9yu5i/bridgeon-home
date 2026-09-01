/*
숏폼 콘텐츠 설정 javascript
@2026.07.08
*/
function initShortformList(sc) {
	var arrSort = {
		'regist_date desc': '최근 등록순',
		'title asc': '제목순',
		'sort asc': '노출순서순'
	};

	gSearchForm.init({
		pageid: 'shortform_catalog',
		search_mode: sc.search_mode,
		select_date: sc.select_date,
		displaySort: arrSort,
		sc: sc.scObj
	});

	$(document).on('click', '#chkAll', function () {
		$("input[name='shortform_seq[]']").prop('checked', $(this).is(':checked'));
	});

	$(document).on('click', '.shortform_modify_btn', function () {
		location.href = 'regist?seq=' + $(this).attr('shortform_seq');
	});

	$(document).on('click', '.shortform_delete_btn', function () {
		var seqList = [];
		var singleSeq = $(this).attr('shortform_seq');

		if (singleSeq) {
			seqList = [singleSeq];
		} else {
			$("input[name='shortform_seq[]']:checked").each(function () {
				seqList.push($(this).val());
			});
		}

		if (seqList.length < 1) {
			showShortformAlert('삭제할 숏폼 콘텐츠를 선택해주세요.');
			return;
		}

		openDialogConfirm('삭제하시겠습니까?', 400, 150, function () {
			$.ajax({
				url: '../shortform_content/delete',
				type: 'post',
				dataType: 'json',
				traditional: true,
				data: {
					shortform_seq: seqList
				}
			}).done(function (res) {
				if (res.result && res.result.status) {
					openDialogAlert(res.result.message, 400, 150, function () {
						location.reload();
					});
					return;
				}

				showShortformAlert(res.result ? res.result.message : '삭제 중 오류가 발생했습니다.');
			}).fail(function () {
				showShortformAlert('삭제 중 오류가 발생했습니다.');
			});
		});
	});

	$('.table_row_basic.list').tableDnD({
	dragHandle: '.shortform_drag_handle',
		onDrop: function (table, row) {
			var seqOrder = [];
			$(table).find('tbody tr').each(function () {
				var seq = $(this).data('shortform-seq');
				if (seq) seqOrder.push(seq);
			});


			$.ajax({
				url: 'reorder',
				type: 'post',
				data: { shortform_seq: seqOrder },
				dataType: 'json',
				success: function (res) {
					if (!res.result) {
						alert('순서 변경에 실패했습니다.');
						location.reload();
					}
				},
				error: function () {
					alert('순서 변경 중 오류가 발생했습니다.');
					location.reload();
				}
			});
		}
	});
}

function initShortformRegist(cfg) {
	var posterUploadConfig = $.extend({}, uploadConfig, {
		file_path: '/data/shortform/poster',
		file_param: 'filedata',
		allowTypes: 'jpg|jpeg|png|gif|webp'
	});

	var videoUploadConfig = $.extend({}, uploadConfig, {
		file_path: '/data/shortform/video',
		file_param: 'filedata',
		allowTypes: 'mp4|mov|webm|m4v'
	});

	$('#posterUploadButton').createAjaxFileUpload(posterUploadConfig, uploadCallback);
	$('#videoUploadButton').createAjaxFileUpload(videoUploadConfig, shortformVideoUploadCallback);

	if (cfg.posterImage) {
		imgUploadEvent('#posterUploadButton', '', '', cfg.posterImage);
	}

	if (cfg.videoType === 'file' && cfg.videoFile) {
		setVideoFileDisplay(cfg.videoFile);
	}

	$("input[name='video_type']").on('change', function () {
		var val = $(this).val();
		if (val === 'link') {
			$('.video_link_area').show();
			$('.video_file_area').hide();
		} else {
			$('.video_link_area').hide();
			$('.video_file_area').show();
		}
	}).filter(':checked').trigger('change');

	setContentsRadio('display_yn', cfg.displayYn);

	$(".input_limit_title").on('keyup', function () {
		var max = 50;
		var len = $(this).val().length;
		if (len > max) {
			$(this).val($(this).val().substring(0, max));
		}
	});

	$(document).on('submit', '#shortformRegist', function (e) {
		var submitUrl = $("input[name='shortform_seq']").length > 0 ? '../shortform_content/modify' : '../shortform_content/save';
		var $form = $(this);

		e.preventDefault();
		if (chkShortformSubmit(this) === false) {
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
				showShortformAlert(res.result.message, function () {
					location.href = 'catalog';
				});
				return;
			}

			showShortformAlert(res.result ? res.result.message : '저장 중 오류가 발생했습니다.');
		}).fail(function () {
			loadingStop();
			showShortformAlert('저장 중 오류가 발생했습니다.');
		});

		return false;
	});
}

function shortformVideoUploadCallback(res) {
	var result = eval(res);
	if (!result.status) {
		alert(result.msg);
		return;
	}

	var filePath = result.filePath + result.fileInfo.orig_name;
	$("input[name='video_file']").val(filePath);
	setVideoFileDisplay(filePath);
}

function setVideoFileDisplay(filePath) {
	var fileName = filePath.split('/').pop();
	$('#videoFileName').text(fileName);
	$('#videoFileLink').attr('href', filePath).show();
}

window.callbackGoodsList = function (goodsList) {
	if (typeof goodsList === 'string') {
		goodsList = goodsList
			.replace(/&quot;/g, '"')
			.replace(/&#034;/g, '"')
			.replace(/&#39;/g, "'");

		goodsList = $.parseJSON(goodsList);
	}

	var $tbody = $('#linkedGoods .goods_list tbody');
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

		var goodsKindImg = '';
		if (list.goods_kind !== '') {
			if (list.goods_kind === 'package') {
				goodsKindImg = "<img src='../skin/default/images/design/icon_order_package.gif' align='absmiddle'>&nbsp;";
			} else if (list.goods_kind === 'coupon') {
				goodsKindImg = "<img src='../skin/default/images/design/icon_order_ticket.gif' align='absmiddle'>&nbsp;";
			}
		}

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

		html += goodsKindImg + '<a href="../goods/regist?no=' + list.goods_seq + '" target="_blank">[' + list.goods_seq + '] ' + goodsName + '</a>';
		html += '</div>';
		html += '</td>';
		html += '<td class="right">' + price + '</td>';
		html += '</tr>';

		$tbody.append(html);
	});

	if (addedCount > 0) {
		alert('상품이 ' + addedCount + '개 선택되었습니다.');
	}
};

function goodsRowDel() {
	var $tbody = $('#linkedGoods .goods_list tbody');

	$tbody.find("input[name='linked_goodsTmp[]']:checked").each(function () {
		$(this).closest('tr').remove();
	});

	if ($tbody.find("tr[rownum!='0']").length === 0) {
		$tbody.find("tr[rownum='0']").show();
	}

	$("#linkedGoods .goods_list_header input[name='chkAll']").prop('checked', false);
}

function chkShortformSubmit() {
	if ($("input[name='title']").val() === '') {
		showShortformAlert('제목을 입력해주세요.');
		return false;
	}

	if ($("input[name='poster_image']").val() === '') {
		showShortformAlert('포스터 이미지를 업로드해주세요.');
		return false;
	}

	if ($("input[name='video_type']:checked").val() === 'link' && $("input[name='video_url']").val() === '') {
		showShortformAlert('영상 링크를 입력해주세요.');
		return false;
	}

	if ($("input[name='video_type']:checked").val() === 'file' && $("input[name='video_file']").val() === '') {
		showShortformAlert('영상 파일을 업로드해주세요.');
		return false;
	}

	loadingStart();
	return true;
}

function selectGoods() {
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

function showShortformAlert(message, callback) {
	if (document.getElementById('openDialogLayerMsg') && typeof openDialogAlert === 'function') {
		openDialogAlert(message, 400, 150, callback);
		return;
	}

	alert(message);
	if (typeof callback === 'function') {
		callback();
	}
}
