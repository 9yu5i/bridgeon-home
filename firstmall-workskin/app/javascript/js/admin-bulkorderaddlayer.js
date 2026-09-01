// 항목 추가 함수

var label_item_seq = 0;

$(function() {
	var layer_seq = 0;
	var label_maxid = $("input[name=Label_maxid]").val();
	if(label_maxid){
		layer_seq = label_maxid;
	}

	$(".labelList").sortable({axis: 'y'});

	$(".sample").hide();

	$("#joinBtn").on('click', function(){
		resetLabel();
		joinDivShow();
	});

	if(!$('body').data('listJoinBtnEventBinded')){
		$("body").on("click",".listJoinBtn",function(){
			$('body').data('listJoinBtnEventBinded',true);
			resetLabel();
			joinDivShow();

			var seq			= 	$(this).attr('value');
			var labelName	=	$('input[name="labelItem[user]['+seq+'][name]"]').val();
			var labelId	=	$('input[name="labelItem[user]['+seq+'][id]"]').val();
			var labelType	=	$('input[name="labelItem[user]['+seq+'][type]"]').val();
			var labelExp		=	$('input[name="labelItem[user]['+seq+'][exp]"]').val();
			var labelValue	=	$('input[name="labelItem[user]['+seq+'][value]"]').val().split("|");

			var labelUse	=	$('input[name="labelItem[user]['+seq+'][use]"]').is(":checked");
			var labelRequire	=	$('input[name="labelItem[user]['+seq+'][required]"]').is(":checked");

			var vallength = labelValue.length - 1;
			var i = 0;
			var labelsubValue = new Array();

			for(i=0; i< vallength; i++){
				labelsubValue[i] = labelValue[i].split(";");
			}

			$("input[name=windowLabelSeq]").val(seq);
			$("input[name=windowLabelName]").val(labelName);
			$("input[name=windowLabelId]").val(labelId);
			$("input[name=windowLabelExp]").val(labelExp);
			$("[name=windowLabelType]").val(labelType);
			$("input[name=windowLabelvalue]").val(labelValue);
			$("input[name=windowLabelsubvalue]").val(labelsubValue);

			$("input[name=windowLabelUseCheck]").val(labelUse);
			$("input[name=windowLabelRequireCheck]").val(labelRequire);

			html = labelAddItem(labelType, labelValue, labelsubValue);

			$("#labelTd").html(html);

		});
	}

	$("[name=windowLabelType]").on('change', function(){
		var labelType = $(this).val();
		var html = "";

		$(".labelAdd").remove();
		html = labelAddItem(labelType);
		$("#labelTd").html(html);
	});

	$('#joinDiv').on("click", ".textAreaHeight",function(){

		var val = $(".textAreaHeight:checked").val();

		switch(val)
		{
			case "large" :
				$("#labelTextArea").css("height", "100px");
			break;

			case "medium" :
				$("#labelTextArea").css("height", "50px");
			break;

			case "small" :
				$("#labelTextArea").css("height", "35px");
			break;
		}
	});

	$("#labelWriteBtn").click(function() {

		var html = "";
		var checkTxt = "";
		var hiddenHtml = "";
		var labelValue = "";
		var labelCheck = true;
		var labelRight = "";
		var labelComment			= $("input[name=windowLabelComment]").val();
		var windowLabelSeq		= $("input[name=windowLabelSeq]").val();
		var windowLabelName		= $("input[name=windowLabelName]").val();
		var windowLabelId			= $("input[name=windowLabelId]").val();

		var windowLabelExp = $("input[name=windowLabelExp]").val();
		var windowLabelType = $("[name=windowLabelType]").val();

		if (!windowLabelName){
			alert("항목명을 입력하세요.");
			$("input[name=windowLabelName]").focus();
			return false;
		}
		if (!windowLabelType){
			alert("항목을 선택하세요.");
			return false;
		}

		checkTxt = ($("input[name=windowLabelCheck]").attr("checked") == "checked") ? "필수" : "";
		var checkVal = ($("input[name=windowLabelCheck]").attr("checked") == "checked") ? "Y" : "N";


		var windowLabelUseChecked = ($("input[name=windowLabelUseCheck]").val() ==  'true')?" checked='checked' ":"";
		var windowLabelRequireChecked = ($("input[name=windowLabelRequireCheck]").val() ==  'true')?" checked='checked' ":"";

		switch(windowLabelType)
		{
			case "text" :
				labelValue = $("input[name='windowLabelValue[]']").size();
			break;

			case "radio" :
				$("input[name='windowLabelValue[]']").each(function(i){
					if(!$("input[name='windowLabelValue[]']").eq(i).val()){
						labelCheck = false;
						return false;
					}
					else {
						labelValue += $("input[name='windowLabelValue[]']").eq(i).val()+"|";
					}
				});
			break;

			case "textarea" :
				labelValue = $("input[name=windowLabelValue]:checked").val();
			break;

			case "checkbox" :
				$("input[name='windowLabelValue[]']").each(function(i){

					if(!$("input[name='windowLabelValue[]']").eq(i).val()){
						labelCheck = false;
						return false;
					}
					else {
						labelValue += $("input[name='windowLabelValue[]']").eq(i).val()+"|";
					}
				});
			break;

			case "select" :

				$("#joinDiv input.windowLabelValue").each(function(i){

					if(!$("#joinDiv input.windowLabelValue").eq(i).val()){
						labelCheck = false;
						return false;
					}
					else {
						var parent_label_item_seq = $("#joinDiv input.windowLabelValue").eq(i).attr('label_item_seq');

						var subLabelValues = new Array();
						$("#joinDiv input[name='windowSubLabelValue["+parent_label_item_seq+"][]']").each(function(){

							if($(this).val().length){
								subLabelValues.push($(this).val());
							}
						});

						labelValue += $("#joinDiv input.windowLabelValue").eq(i).val()+';'+subLabelValues.join(';')+"|";

					}
				});
			break;

		}

		if (labelCheck == false) {
			alert("항목값을 입력하세요.");
			return false;
		}

		var labelTypeText = getLabelTypeText(windowLabelType);
		var createItem = function(layer) {
			/** seq may served as falsy values */
			if(typeof layer.seq === 'undefined') {
				layer.seq = layer_seq = ~~layer_seq + 1;
			}
			layer.id = layer.id || layer.name;

			return $('<tr>')
				.addClass('layer'+layer.seq)
				.append($('<td>')
					.append($('<img src="/admin/skin/default/images/common/icon_move.png">'))
					.append($($.map({
						'seq':'bulkorderform_seq',
						'name':'name',
						'id':'id',
						'type':'type',
						'exp':'exp',
						'value':'value',
					}, function(name, arg_key) {
						return $('<input>')
							.attr('type', 'hidden')
							.attr('name', 'labelItem[user][' + layer.seq + '][' + name + ']')
							.attr('value', layer[arg_key])[0]
						;
					})))
				)
				.append($('<td>')
					.addClass('left')
					.text(layer.name)
				)
				.append($('<td>')
					.addClass('left')
					.text('[' + labelTypeText + '] ' + windowLabelExp)
				)
				.append($('<td>')
					.append($('<label>')
						.addClass('resp_checkbox')
						.append($('<input>')
							.attr('type', 'checkbox')
							.attr('name', 'labelItem[user][' + layer.seq + '][use]')
							.addClass('bulkorder_chUse')
							.attr('bulkorder_ch', layer.seq)
							.attr('value', 'Y')
							.prop('checked', !!windowLabelUseChecked)
						)
					)
				)
				.append($('<td>')
					.append($('<label>')
						.addClass('resp_checkbox')
						.append($('<input>')
							.attr('type', 'checkbox')
							.attr('name', 'labelItem[user][' + layer.seq + '][required]')
							.addClass('bulkorder_chRequired')
							.attr('value', 'Y')
							.prop('checked', !!windowLabelRequireChecked)
						)
					)
				)
				.append($('<td>')
					.attr('nowrap', 'nowrap')
					.append($('<button>')
						.attr('type', 'button')
						.addClass('resp_btn v2 listJoinBtn')
						.prop('id', 'listJoinBtn')
						.attr('value', layer.seq)
						.text('수정')
					)
				)
				.append($('<td>')
					.attr('nowrap', 'nowrap')
					.append($('<button>')
						.attr('type', 'button')
						.addClass('btn_minus')
						.attr('onclick', 'deleteRow(this);')
					)
				)
			;
		};
		if (!windowLabelSeq){
			$(".labelList_bulkorder").append(
				createItem({
					'name': windowLabelName,
					'type': windowLabelType,
					'exp': windowLabelExp,
					'value': labelValue
				})
			);
		}else{
			$(".layer"+ windowLabelSeq).replaceWith(
				createItem({
					'seq': windowLabelSeq,
					'name': windowLabelName,
					'id': windowLabelId,
					'type': windowLabelType,
					'exp': windowLabelExp,
					'value': labelValue
				})
			);
		}

		closeDialog("joinDiv");
		resetLabel();
		typeCheck();

	});

	$(".sampleBtn").click(function(){
		var position = $(window).scrollTop();
		var id = $(this).attr("id").replace(/Btn/, "");

		$(".sample").hide();
		$("#"+id).show();
	});

	$('#sampleViewBtn').on('click', function() {
		var type = $(this).closest('form').find('[name="windowLabelType"]').val();
		if(!type) return;
		$(".sample").each(function(_, elem) {$(elem).closest('.ui-dialog-content').dialog('close')});

		$('#'+type+'Sample').dialog({
			bgiframe: true,
			autoOpen: false,
			width: 500,
			resizable: false,
			draggable: true,
			modal: true,
			overlay: {
				backgroundColor: '#000000',
				opacity: 0.8
			},
			buttons: [
				{
					'text': '닫기',
					'class': 'resp_btn v3 size_XL',
					'click': function() {
						$(this).dialog('close');
					}
				}
			],
			position: {my:'center',at:'center',of:window}
		}).dialog('open');
	});

	$(".sampleCloseBtn").click(function(){
		$(".sample").hide();
	});
});

function getLabelTypeText(labelType)
{
	var msg = "";
	switch (labelType)
	{
		case "text" :			msg = "텍스트박스";			break;
		case "radio" :			msg = "여러개 중 택1";		break;
		case "textarea" :		msg = "에디트박스";			break;
		case "checkbox" :		msg = "체크박스";			break;
		case "select" :			msg = "셀렉트박스";			break;

	}

	return msg;
}

function resetLabel()
{
	$(".sample").dialog('destroy');
	$('form#joinDiv').each(function(){this.reset()});
	$("[name=windowLabelType]").closest('tr').show();
	$("[name=windowLabelType]").trigger('change');
}

function joinDivShow()
{
	openDialog("대량구매 입력항목 추가","joinDiv",{"width":450,"height":300});
}

function rightChange(obj)
{
	if ($(obj).text() == "T") {
		$(obj).text("F");
	}
	else {
		$(obj).text("T");
	}
}

function labelAdd(type, right)
{
	var html = '<tr class="labelAdd"><td></td>';

	switch(type)
	{
		case "text" :
			html += '<td>';
			if (right) {
				html += '<tr class="labelAdd"><th align="left" style="width:65px;"></th>';
				html += '<td>';
				html += '<input type="text" name="windowLabelRight[]" value="" size="30"> <button type="button"  class="btn_minus" onclick="deleteRow(this)"></button>';
				html += '</td>';
				html += '</tr>';
			}
			else {
				html += '<input type="text" name="windowLabelValue[]" size="30"> <button type="button" value="-" class="btn_minus" onclick="deleteRow(this)"></button>';
			}
			html += '</td>';
			html += '</tr>';
		break;

		case "radio" :
			html += '<td>';
			if (right) {
				html += '<tr class="labelAdd"><th align="left" style="width:65px;"></th>';
				html += '<td>';
				html += '<input type="text" name="windowLabelRight[]" value=""  size="30"> <button type="button" value="-" class="btn_minus" onclick="deleteRow(this)"></button>';
				html += '</td>';
				html += '</tr>';
			}
			else {
				html += '<label class="resp_radio"><input type="radio" name="labelKey[]" class="null" disabled></label> <input type="text" name="windowLabelValue[]" size="30"> <button type="button" value="-" class="btn_minus" onclick="deleteRow(this)"></button>';
			}
			html += '</td>';
			html += '</tr>';
		break;

		case "checkbox" :
			html += '<td>';
			if (right) {
				html += '<tr class="labelAdd"><th align="left" style="width:65px;"></th>';
				html += '<td>';
				html += '<input type="text" name="windowLabelRight[]" value=""  size="30"> <input type="button" value="-" class="pointer" onclick="deleteRow(this)"><img src="/admin/skin/default/images/design/icon_design_minus.gif" height="18px" align="middle"></button>';
				html += '</td>';
				html += '</tr>';
			}
			else {
				html += '<label class="resp_checkbox"><input type="checkbox" name="labelKey[]" class="null" disabled></label> <input type="text" name="windowLabelValue[]" size="30"> <button type="button" value="-" class="btn_minus" onclick="deleteRow(this)"></button>';
			}
			html += '</td>';
			html += '</tr>';
		break;

		case "select" :
			html += '<td>';
			if (right) {
				if ($("#selectRight").size() > 0)
				{
					alert("정답은 하나 이상 등록할 수 없습니다.");
					return false;
				}
				html += '<tr class="labelAdd"><th align="left" style="width:65px;"></th>';
				html += '<td>';
				html += '<input type="text" name="windowLabelRight['+label_item_seq+']" id="selectRight" size="30"> <button type="button" value="-" class="btn_minus" onclick="deleteRow(this)"></button>';
				html += '</td>';
				html += '</tr>';
			}
			else {
				html += '<input type="text" name="windowLabelValue['+label_item_seq+']" class="windowLabelValue" label_item_seq="'+label_item_seq+'" size="30" > <button type="button" value="-" class="btn_minus" onclick="deleteRow(this)"></button> ';
			}
			html += '</td>';
			html += '</tr>';
			
			label_item_seq++;
		break;

	
	}

	if (right)
	{
		$("#labelRightTable").append(html);
	}
	else {
		$("#labelTable").append(html);
	}
}

function labelSubAdd(parent_label_item_seq){

	var html = '<tr class="labelAdd"><td></td><td>';
	html += '→ <input type="text" name="windowSubLabelValue['+parent_label_item_seq+'][]" size="30"> <button type="button" value="-" class="pointer" onclick="deleteRow(this)"><img src="/admin/skin/default/images/common/icon_minus.gif" height="18px" align="middle"></button>';
	html += '</td></tr>';

	if($('input[name="windowSubLabelValue['+parent_label_item_seq+'][]"]').length){
		$('input[name="windowSubLabelValue['+parent_label_item_seq+'][]"]').last().closest('tr').after(html);
	}else{
		$("input[name='windowLabelValue["+parent_label_item_seq+"]']").closest('tr').after(html);
	}
}

function labelAddItem(labelType, labelValue, labelsubValue)
{
	var html = "";
	var labelTableHtml = "";

	switch(labelType)
	{
		case "text" :

			html = '<input type="text" name="windowLabelValue[]" size="30"> <button type="button" class="btn_plus" onclick="labelAdd(\'text\')" ></button>';
			if (labelValue && labelValue > 1)
			{
				for (i=1; i<labelValue; i++)
				{
					labelTableHtml += '<tr class="labelAdd"><td></td>';
					labelTableHtml += '<td>';
					labelTableHtml += '<input type="text" name="windowLabelValue[]" size="30"> <button type="button" value="-" class="btn_minus" onclick="deleteRow(this)"></button>';
					labelTableHtml += '</td>';
					labelTableHtml += '</tr>';
				}
			}

			$("#labelTable").append(labelTableHtml);

					break;

		case "radio" :
			if (labelValue)
			{
				html = '<label class="resp_radio"><input type="radio" name="labelKey[]" class="null" disabled></label> <input type="text" name="windowLabelValue[]" value="'+ labelValue[0] +'" size="30"><br/><label class="resp_radio"><input type="radio" name="labelKey[]" class="null" disabled></label> <input type="text" name="windowLabelValue[]" value="'+ labelValue[1] +'" size="30"> <button type="button" class="btn_plus" onclick="labelAdd(\'radio\')"></button>';


				var count = labelValue.length-1;
				if (count > 2)
				{
					for (i=2; i<count; i++)
					{
						labelTableHtml += '<tr class="labelAdd"><td></td>';
						labelTableHtml += '<td>';
						labelTableHtml += '<label class="resp_radio"><input type="radio" name="labelKey[]" class="null" disabled></label> <input type="text" name="windowLabelValue[]" value="'+ labelValue[i] +'" size="30"> <button type="button" class="btn_minus" onclick="deleteRow(this)"></button>';
						labelTableHtml += '</td>';
						labelTableHtml += '</tr>';
					}
				}
			}
			else {
				html = '<label class="resp_radio"><input type="radio" name="labelKey[]" class="null" disabled></label> <input type="text" name="windowLabelValue[]" value="" size="30"><br/><label class="resp_radio"><input type="radio" name="labelKey[]" class="null" disabled></label> <input type="text" name="windowLabelValue[]" value="" size="30"> <button type="button" class="btn_plus" onclick="labelAdd(\'radio\')"></button>';
			}

			$("#labelTable").append(labelTableHtml);


		break;

		case "textarea" :

			var ckValueL = "";
			var ckValueM = "";
			var ckValueS = "";

			if(labelValue == "large"){
				 ckValueL = "checked";
			}
			if(labelValue == "medium"){
				 ckValueM = "checked";
			}
			if(labelValue == "small"){
				 ckValueS = "checked";
			}
			if(!labelValue){
				 ckValueM = "checked";
			}

			html = '<table width="100%" border="0" cellspacing="0" cellpadding="0">';
			html += '<tr>';
			html += '<td>';
			html += '<textarea id="labelTextArea" name="labelTextArea" style="width:98%; height:50px; padding:0;"></textarea></td></tr>';
			html += '<tr>';
			html += '<td>박스크기 : <input type="radio" name="windowLabelValue" value="large" class="textAreaHeight null" '+ ckValueL +'> large';
			html += '<input type="radio" name="windowLabelValue" value="medium" class="textAreaHeight null" '+ ckValueM +'> medium';
			html += '<input type="radio" name="windowLabelValue" value="small" class="textAreaHeight null" '+ ckValueS +'> small</td>';
			html += '</tr>';
			html += '</table>';
		break;

		case "checkbox" :
			if (labelValue)
			{
				html = '<label class="resp_checkbox"><input type="checkbox" name="labelContent[]" class="null" disabled></label> <input type="text" name="windowLabelValue[]" value="'+ labelValue[0] +'" size="30"> <br/> <label class="resp_checkbox"><input type="checkbox" name="labelContent[]" class="null" disabled></label> <input type="text" name="windowLabelValue[]" value="'+ labelValue[1] +'" size="30"> <button type="button" class="btn_plus" onclick="labelAdd(\'checkbox\')"></button>';

				var count = labelValue.length-1;
				if (count > 2)
				{
					for (i=2; i<count; i++)
					{
						labelTableHtml += '<tr class="labelAdd"><td></td>';
						labelTableHtml += '<td>';
						labelTableHtml += '<label class="resp_checkbox"><input type="checkbox" name="labelKey[]" class="null" disabled></label> <input type="text" name="windowLabelValue[]" value="'+ labelValue[i] +'" size="30"> <button type="button" class="btn_minus" onclick="deleteRow(this)"></button>';
						labelTableHtml += '</td>';
						labelTableHtml += '</tr>';
					}
				}
			}
			else {
				html = '<label class="resp_checkbox"><input type="checkbox" name="labelContent[]" class="null" disabled></label> <input type="text" name="windowLabelValue[]" value="" size="30"> <br/> <label class="resp_checkbox"><input type="checkbox" name="labelContent[]" class="null" disabled></label> <input type="text" name="windowLabelValue[]" value="" size="30"> <button type="button" class="btn_plus" onclick="labelAdd(\'checkbox\')"></button>';

			}
			$("#labelTable").append(labelTableHtml);
		break;

		case "select" :

			if (labelValue)
			{
				var count = labelValue.length-1;
				var subcount = 0;
				var j=0;

				html = '<input type="text" name="windowLabelvalue['+label_item_seq+']" label_item_seq="'+label_item_seq+'" value="'+ labelsubValue[0][0] +'" size="30" class="windowLabelValue line"> <button type="button" value="+" class="btn_plus" onclick="labelAdd(\'select\')"></button> ';

				if (count > 1)
				{
					for (i=1; i<count; i++)
					{
						label_item_seq++;

						labelTableHtml += '<tr class="labelAdd"><td></td>';
						labelTableHtml += '<td>';
						labelTableHtml += '<input type="text" name="windowLabelvalue['+label_item_seq+']" label_item_seq="'+label_item_seq+'" value="'+ labelsubValue[i][0] +'" size="30" class="windowLabelValue line"> <button type="button" class="btn_minus" onclick="deleteRow(this)"></button> ';
						labelTableHtml += '</td>';
						labelTableHtml += '</tr>';

					}
				}

			}
			else {
				html = '<input type="text" name="windowLabelValue['+label_item_seq+']" class="windowLabelValue line" label_item_seq="'+label_item_seq+'"  size="30"> <button type="button"  class="btn_plus" onclick="labelAdd(\'select\')"></button> ';
				label_item_seq++;
			}
			$("#labelTable").append(labelTableHtml);
		break;


	}

	return html;
}

function deleteRow(obj){

	if ($("input[name=campaignMemberCount]").val() > 0)
	{
		alert("참여자가 있을 경우 참여형식을 수정할 수 없습니다.");
		return false;
	}

	$(obj).parent().parent().remove();
}



function deleteAddRow(seq){

	if ($("input[name=campaignMemberCount]").val() > 0)
	{
		alert("참여자가 있을 경우 참여형식을 수정할 수 없습니다.");
		return false;
	}

	$(".layer"+seq ).remove();
}


function alertFocus(msg, target)
{
	if (msg) alert(msg);
	if (target) target.focus();
}