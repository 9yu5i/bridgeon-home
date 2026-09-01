// 항목 추가 함수

var label_item_seq	= 0;
var optcoloraddruse = 0;
var layer_seq		= 0;
function openDialogZipcodenew(zipcodeFlag,idx){ 
	
	if(! $(this).is("#"+zipcodeFlag+"Idnew") ){
		$("body").append("<div id='"+zipcodeFlag+"Idnew'></div>");

		var url = '../popup/zipcode';
		var params = {'zipcodeFlag':zipcodeFlag,'keyword':'','goodsoption':'new'};
		
		if(idx) params.idx = idx; 
		
		$.get(url,params, function(data) {
			$("#"+zipcodeFlag+"Idnew").html(data);
		}); 
		openDialog("우편번호 검색 <span class='desc'>지역명으로 우편번호를 검색합니다.</span>",zipcodeFlag+"Idnew", {"width":1000,"height":480});
		setDefaultText();
	}
}

$(document).ready(function() {

	layer_seq = $("#windowLabelmaxSeq").val();
	
	optcoloraddruse = $("#optcoloraddruse").val(); 

	//$(".labelList_goodscode").sortable({axis: 'y'});
	//$(".tablednd").tableDnD({onDragClass:"dragRow"});	
	
    // 우편번호 검색
    $(".windowLabelZipcodeButton").live("click",function(){
		var idx = $(this).attr("idx"); 
       // openDialogZipcodenew('windowLabel', idx);
		openDialogZipcode('windowLabel'+idx);
    });
	
	$(".goodscodeBtn").click(function(){ 
		var title = $(this).attr('title'); 
		var windowlabeltitle = $(this).attr('windowlabeltitle'); 
		var code = $(this).attr('code'); 
		resetLabel(); 
		
		//특수정보 노출여부
		$("#labelcodetypeuse").removeAttr("checked");
		labelcodedisplay('');

		goodscodeDivShow(title, code, windowlabeltitle); 
				
	});

	if(!$('body').data('listJoinBtnEventBinded')){
		
		$("body").on("click",".listJoinBtn",function(){
			var title = $(this).attr('title'); 
			var windowlabeltitle = $(this).attr('windowlabeltitle'); 
			var code = $(this).attr('typeid'); 
			$('body').data('listJoinBtnEventBinded',true);	
			resetLabel();
			goodscodeDivShow(title,code, windowlabeltitle);
	
			var seq			= 	$(this).attr('value'); 
			var typeid			= 	$(this).attr('typeid');  
			var labelName	=	$('input[name="labelItem['+typeid+']['+seq+'][name]"]').val();
			//var labelNameEng=$('input[name="labelItem['+typeid+']['+seq+'][id]"]').val();
			var labelId		=	$('input[name="labelItem['+typeid+']['+seq+'][type]"]').val();
			var labelDefault=	$('input[name="labelItem['+typeid+']['+seq+'][default]"]').val().split("|");
			var labelValue	=	$('input[name="labelItem['+typeid+']['+seq+'][value]"]').val().split("|");
			var labelCode	=	$('input[name="labelItem['+typeid+']['+seq+'][code]"]').val().split("|");
			var labeloptnew = new Array();

			var labelnewtypeuse	=	$('input[name="labelItem['+typeid+']['+seq+'][newtypeuse]"]').val();
			var labelnewtype	=	$('input[name="labelItem['+typeid+']['+seq+'][newtype]"]').val();

			labeloptnew['newtypeuse'] = labelnewtypeuse;
			labeloptnew['newtype']		= labelnewtype;

			labeloptnew['color'] = ($('input[name="labelItem['+typeid+']['+seq+'][color]"]').val())?$('input[name="labelItem['+typeid+']['+seq+'][color]"]').val().split("|"):new Array();
			labeloptnew['zipcode'] =	($('input[name="labelItem['+typeid+']['+seq+'][zipcode]"]').val())?$('input[name="labelItem['+typeid+']['+seq+'][zipcode]"]').val().split("|"):new Array(); 
			labeloptnew['address_type'] =	($('input[name="labelItem['+typeid+']['+seq+'][address_type]"]').val())?$('input[name="labelItem['+typeid+']['+seq+'][address_type]"]').val().split("|"):new Array();
			labeloptnew['address'] =	($('input[name="labelItem['+typeid+']['+seq+'][address]"]').val())?$('input[name="labelItem['+typeid+']['+seq+'][address]"]').val().split("|"):new Array();
			labeloptnew['address_street'] =	($('input[name="labelItem['+typeid+']['+seq+'][address_street]"]').val())?$('input[name="labelItem['+typeid+']['+seq+'][address_street]"]').val().split("|"):new Array();
			labeloptnew['addressdetail'] =	($('input[name="labelItem['+typeid+']['+seq+'][addressdetail]"]').val())?$('input[name="labelItem['+typeid+']['+seq+'][addressdetail]"]').val().split("|"):new Array();
			labeloptnew['biztel'] =	($('input[name="labelItem['+typeid+']['+seq+'][biztel]"]').val())?$('input[name="labelItem['+typeid+']['+seq+'][biztel]"]').val().split("|"):new Array();
			labeloptnew['address_commission'] =	($('input[name="labelItem['+typeid+']['+seq+'][address_commission]"]').val())?$('input[name="labelItem['+typeid+']['+seq+'][address_commission]"]').val().split("|"):new Array();

			labeloptnew['date'] = ($('input[name="labelItem['+typeid+']['+seq+'][date]"]').val())?$('input[name="labelItem['+typeid+']['+seq+'][date]"]').val().split("|"):new Array();
			labeloptnew['sdayinput'] = $('input[name="labelItem['+typeid+']['+seq+'][sdayinput]"]').val();
			labeloptnew['fdayinput'] = $('input[name="labelItem['+typeid+']['+seq+'][fdayinput]"]').val();
			labeloptnew['dayauto_type'] = $('input[name="labelItem['+typeid+']['+seq+'][dayauto_type]"]').val();
			labeloptnew['sdayauto'] = $('input[name="labelItem['+typeid+']['+seq+'][sdayauto]"]').val();
			labeloptnew['fdayauto'] = $('input[name="labelItem['+typeid+']['+seq+'][fdayauto]"]').val();
			labeloptnew['dayauto_day'] = $('input[name="labelItem['+typeid+']['+seq+'][dayauto_day]"]').val();

			$("input[name=windowLabelSeq]").val(seq);		
			$("input[name=windowLabelName]").val(labelName);

			$("input[name=windowLabelnewtype]").val(labelnewtype);
			$("input[name=windowLabelNewtypeuse]").val(labelnewtypeuse);  
			if( labelnewtypeuse == 1 ){  
				$("#labelcodetypeuse").attr("checked",'checked');
				labelcodedisplay(labelnewtype);
			}else{
				$("#labelcodetypeuse").removeAttr("checked");
				labelcodedisplay();
			}

			//$("input[name=windowLabelNameEng]").val(labelNameEng); 
			//html = labelAddItem('', labelValue, labelDefault,labelCode,labelcolorValue,labelzipcodeValue,labeladdressValue,labeladdressdetailValue, labelnewtype, labelnewuse, labeldateValue);
			html = labelAddItem('modify', labelValue, labelDefault,labelCode,labeloptnew);
			$("#labelTd").html(html);
			
		});
		
		//$(".labelList_goodscode").sortable({axis: 'y'});
		//$(".tablednd").tableDnD({onDragClass:"dragRow"});	
	}
 
	$(".labelBtn").click(function(){
		var labelType = $(this).attr("id");
		var html = "";
		var msg = ""; 
 
		$(".labelAdd").remove();
		html = labelAddItem();
		$("#labelTd").html(html); 
	});

	$(".labelWriteBtn").click(function() {	
		
		var html = "";
		var hiddenHtml = "";
		var labelValue = "";
		var labelDefault = "";
		var labelCode = "";

		var labelcolorValue = "";
		var labelzipcodeValue = "";
		var labeladdress_typeValue = "";
		var labeladdressValue = "";
		var labeladdress_streetValue = "";
		var labeladdressdetailValue = "";
		var labelbiztelValue = "";
		var labeladdress_commissionValue = "";

		var labeldateValue = "";
		var labelsdayinputValue = "";
		var labelfdayinputValue = "";
		var labeldayauto_typeValue = "";
		var labelsdayautoValue = "";
		var labelfdayautoValue = "";
		var labeldayauto_dayValue = "";

		var labelCheck = true;
		var labelCheckc = true;
		var labelRight = "";
		var windowLabelExp = '';
		var windowLabelSeq		= $("input[name=windowLabelSeq]").val();
		var windowLabelName		= $("input[name=windowLabelName]").val();
		//var windowLabelNameEng		= $("input[name=windowLabelNameEng]").val();
		var windowLabelId			= $("input[name=windowLabelId]").val();

		
		var windowLabelTypeuse = $("input[name='labelcodetypeuse']:checked").val();//= $("#labelcodetypeuse").attr("checked");
		var windowLabelType = $("input[name='labelcodetype']:checked").val();
		
		if( windowLabelType == "dayinput" ) {
			labelsdayinputValue		= $("input[name=windowLabelsdayinput]").val();
			labelfdayinputValue		= $("input[name=windowLabelfdayinput]").val();
		}else if( windowLabelType == "dayauto" ) {
			labeldayauto_typeValue		= $("input[name=windowLabeldayauto_type]").val();
			labelsdayautoValue				= $("input[name=windowLabelsdayauto]").val();
			labelfdayautoValue				= $("input[name=windowLabelfdayauto]").val();
			labeldayauto_dayValue		= $("input[name=windowLabeldayauto_day]").val();
		}

		if (!windowLabelName){
			alert("항목명(한글)을 입력하세요.");
			$("input[name=windowLabelName]").focus();
			return false;
		}   

		if ( windowLabelName == $("input[name=windowLabelName]").attr("title") ){
			alert("항목명(한글)을 정확히 입력하세요.");
			$("input[name=windowLabelName]").focus();
			return false;
		}

		$("#goodscodeDiv input.windowLabelValue").each(function(i){
			labelDefault += ( $("#goodscodeDiv input.windowLabelDefault").eq(i).attr("checked") == "checked" )?"Y|":"N|";

			//alert( $("#goodscodeDiv input.windowLabelValue").eq(i).val() + " == " + $("#goodscodeDiv input.windowLabelValue").eq(i).attr("title") );
			//alert( $("#goodscodeDiv input.windowLabelCode").eq(i).val() + " == " + $("#goodscodeDiv input.windowLabelCode").eq(i).attr("title") );
			
			if(!$("#goodscodeDiv input.windowLabelValue").eq(i).val()){
				labelCheck = false;
				return false;
			}
			else {
				labelValue+= $("#goodscodeDiv input.windowLabelValue").eq(i).val()+"|"; 
			}
			
			if ( $("#goodscodeDiv input.windowLabelValue").eq(i).val() == $("#goodscodeDiv input.windowLabelValue").eq(i).attr("title") ){
				labelCheck = false;
				return false;
			}
			
			if(!$("#goodscodeDiv input.windowLabelCode").eq(i).val()){
				labelCheckc = false;
				return false;
			}
			else {
				labelCode	+= $("#goodscodeDiv input.windowLabelCode").eq(i).val()+"|";
			}
			
			if ( $("#goodscodeDiv input.windowLabelCode").eq(i).val() == $("#goodscodeDiv input.windowLabelCode").eq(i).attr("title") ){
				labelCheckc = false;
				return false;
			}
			if( windowLabelType == "address" ){
				labelzipcodeValue	+= $("#goodscodeDiv input.windowLabelZipcode1").eq(i).val()+"-"+$("#goodscodeDiv input.windowLabelZipcode2").eq(i).val()+"|";
				if($("#goodscodeDiv input.windowLabelAddress_type").eq(i).val()){ 
					labeladdress_typeValue	+= $("#goodscodeDiv input.windowLabelAddress_type").eq(i).val()+"|";
				}
				if($("#goodscodeDiv input.windowLabelAddress").eq(i).val()){ 
					labeladdressValue	+= $("#goodscodeDiv input.windowLabelAddress").eq(i).val()+"|";
				}
				if($("#goodscodeDiv input.windowLabelAddress_street").eq(i).val()){ 
					labeladdress_streetValue	+= $("#goodscodeDiv input.windowLabelAddress_street").eq(i).val()+"|";
				}
				if($("#goodscodeDiv input.windowLabelAddressDetail").eq(i).val()){ 
					labeladdressdetailValue	+= $("#goodscodeDiv input.windowLabelAddressDetail").eq(i).val()+"|";
				}
				
				if($("#goodscodeDiv input.windowLabelBizTel").eq(i).val()){ 
					labelbiztelValue	+= $("#goodscodeDiv input.windowLabelBizTel").eq(i).val()+"|";
				}
				if($("#goodscodeDiv input.windowLabelAddress_commission").eq(i).val()){ 
					labeladdress_commissionValue	+= $("#goodscodeDiv input.windowLabelAddress_commission").eq(i).val()+"|";
				}
			}else if( windowLabelType == "color" ) {
				if($("#goodscodeDiv input.windowLabelColor").eq(i).val()){ 
					labelcolorValue	+= $("#goodscodeDiv input.windowLabelColor").eq(i).val()+"|";
				}
			}else if( windowLabelType == "date" ) {
				if($("#goodscodeDiv input.windowLabeldate").eq(i).val()){ 
					labeldateValue	+= $("#goodscodeDiv input.windowLabeldate").eq(i).val()+"|";
				}
			}else if( windowLabelType == "dayinput" ) {
				labelsdayinputValue		= $("#goodscodeDiv input.windowLabelsdayinput").eq(i).val();
				labelfdayinputValue		= $("#goodscodeDiv input.windowLabelfdayinput").eq(i).val();
			}else if( windowLabelType == "dayauto" ) {
				labeldayauto_typeValue		= $("#goodscodeDiv select.windowLabeldayauto_type").eq(i).find("option:selected").val();
				labelsdayautoValue				= $("#goodscodeDiv input.windowLabelsdayauto").eq(i).val();
				labelfdayautoValue				= $("#goodscodeDiv input.windowLabelfdayauto").eq(i).val();
				labeldayauto_dayValue		= $("#goodscodeDiv select.windowLabeldayauto_day").eq(i).find("option:selected").val();
			}
			windowLabelExp += $("#goodscodeDiv input.windowLabelValue").eq(i).val()+"("+$("#goodscodeDiv input.windowLabelCode").eq(i).val()+"),"; 

		});

		if (labelCheck == false) {
			alert("항목값을 정확히  입력하세요.");
			return false;
		}
 
		if (labelCheckc == false) {
			alert("코드값을 정확히 입력하세요.");
			return false;
		} 

		if (!windowLabelSeq){
			user_layer_seq = Number(layer_seq) + 1 ;	
			layer_seq = user_layer_seq; 
			
			hiddenHtml = '<input type="hidden" name="labelItem['+ windowLabelId +']['+ user_layer_seq +'][name]" value="'+ windowLabelName +'">'; 
			//hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ user_layer_seq +'][id]" value="'+ windowLabelNameEng +'">';
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ user_layer_seq +'][type]" value="'+ windowLabelId +'">';
			hiddenHtml += '<input type="hidden" class="codeform_seq" name="labelItem['+ windowLabelId +']['+ user_layer_seq +'][codeform_seq]" value="'+ user_layer_seq +'">';
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ user_layer_seq +'][default]" value="'+ labelDefault +'">';
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ user_layer_seq +'][value]" value="'+ labelValue +'">';
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ user_layer_seq +'][code]" value="'+ labelCode +'">';

			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ user_layer_seq +'][newtypeuse]" value="'+ windowLabelTypeuse +'">';
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ user_layer_seq +'][newtype]" value="'+ windowLabelType +'">';
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ user_layer_seq +'][color]" value="'+ labelcolorValue +'">';
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ user_layer_seq +'][zipcode]" value="'+ labelzipcodeValue +'">';
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ user_layer_seq +'][address_type]" value="'+ labeladdress_typeValue +'">';
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ user_layer_seq +'][address]" value="'+ labeladdressValue +'">';
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ user_layer_seq +'][address_street]" value="'+ labeladdress_streetValue +'">';
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ user_layer_seq +'][addressdetail]" value="'+ labeladdressdetailValue +'">';
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ user_layer_seq +'][biztel]" value="'+ labelbiztelValue +'">'; 
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ user_layer_seq +'][address_commission]" value="'+ labeladdress_commissionValue +'">';

			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ user_layer_seq +'][date]" value="'+ labeldateValue +'">';
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ user_layer_seq +'][sdayinput]" value="'+ labelsdayinputValue +'">';
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ user_layer_seq +'][fdayinput]" value="'+ labelfdayinputValue +'">';
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ user_layer_seq +'][dayauto_type]" value="'+ labeldayauto_typeValue +'">';
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ user_layer_seq +'][sdayauto]" value="'+ labelsdayautoValue +'">';
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ user_layer_seq +'][fdayauto]" value="'+ labelfdayautoValue +'">';
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ user_layer_seq +'][dayauto_day]" value="'+ labeldayauto_dayValue +'">';

			html = '<tr class="layer'+user_layer_seq+' hand ">';
			html += '<td><img src="../skin/default/images/common/icon_move.png" style="cursor:pointer"></td>'
			html += '<td class="left">'+ windowLabelName +'</td>';
			html += '<td class="left">'+ windowLabelExp+'</td>';
			html += '<td>'+hiddenHtml+'<button type="button" class="listJoinBtn resp_btn v2"   typeid="'+ windowLabelId +'"  value="'+ user_layer_seq  +'" >수정</button></td>';
			html += '<td><button type="button" class="btn_minus" onclick="deleteRow(this)"></button></td>'
			html += '</tr>'; 
			$(".labelList_"+windowLabelId).append(html); 
		}else{
			$(".layer"+ windowLabelSeq).remove();
			hiddenHtml = '<input type="hidden" name="labelItem['+ windowLabelId +']['+ windowLabelSeq +'][name]" value="'+ windowLabelName +'">';
			//hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ windowLabelSeq +'][id]" value="'+ windowLabelNameEng +'">';
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ windowLabelSeq +'][type]" value="'+ windowLabelId +'">';
			hiddenHtml += '<input type="hidden" class="codeform_seq" name="labelItem['+ windowLabelId +']['+ windowLabelSeq +'][codeform_seq]" value="'+ windowLabelSeq +'">';
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ windowLabelSeq +'][default]" value="'+ labelDefault +'">';
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ windowLabelSeq +'][value]" value="'+ labelValue +'">';
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ windowLabelSeq +'][code]" value="'+ labelCode +'">';

			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ windowLabelSeq +'][newtypeuse]" value="'+ windowLabelTypeuse +'">';			
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ windowLabelSeq +'][newtype]" value="'+ windowLabelType +'">';
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ windowLabelSeq +'][color]" value="'+ labelcolorValue +'">';
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ windowLabelSeq +'][zipcode]" value="'+ labelzipcodeValue +'">';
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ windowLabelSeq +'][address_type]" value="'+ labeladdress_typeValue +'">';
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ windowLabelSeq +'][address]" value="'+ labeladdressValue +'">';
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ windowLabelSeq +'][address_street]" value="'+ labeladdress_streetValue +'">';
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ windowLabelSeq +'][addressdetail]" value="'+ labeladdressdetailValue +'">';
			
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ windowLabelSeq +'][biztel]" value="'+ labelbiztelValue +'">';
			
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ windowLabelSeq +'][address_commission]" value="'+ labeladdress_commissionValue +'">';

			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ windowLabelSeq +'][date]" value="'+ labeldateValue +'">';
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ windowLabelSeq +'][sdayinput]" value="'+ labelsdayinputValue +'">';
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ windowLabelSeq +'][fdayinput]" value="'+ labelfdayinputValue +'">';
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ windowLabelSeq +'][dayauto_type]" value="'+ labeldayauto_typeValue +'">';
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ windowLabelSeq +'][sdayauto]" value="'+ labelsdayautoValue +'">';
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ windowLabelSeq +'][fdayauto]" value="'+ labelfdayautoValue +'">';
			hiddenHtml += '<input type="hidden" name="labelItem['+ windowLabelId +']['+ windowLabelSeq +'][dayauto_day]" value="'+ labeldayauto_dayValue +'">';

			html = '<tr class="layer'+windowLabelSeq+'  hand ">';	
			html += '<td><img src="../skin/default/images/common/icon_move.png" style="cursor:pointer"></td>'
			html += '<td class="left">'+ windowLabelName +'</td>';//('+ windowLabelNameEng +')
			html += '<td class="left">'+ windowLabelExp+'</td>';
			//html += '<td class="its-td"></td>';//5
			if(windowLabelSeq<3) {
				html += '<td>'+hiddenHtml+'<button type="button" class="listJoinBtn resp_btn v2" typeid="'+ windowLabelId +'" value="'+ windowLabelSeq  +'"  >수정</button></td>';
			}else{
				html += '<td>'+hiddenHtml+'<button type="button" class="listJoinBtn resp_btn v2" typeid="'+ windowLabelId +'" value="'+ windowLabelSeq  +'"  >수정</button></td>';
				html += '<td><button type="button" class="btn_minus" onclick="deleteRow(this)"></button></td>'
			}
			html += '</tr>'; 
	
			$(".labelList_"+windowLabelId).append(html);
		}

		
			$(".labelList_"+windowLabelId).find('.mess').remove();
		
		closeDialog("goodscodeDiv"); 
		resetLabel();
	});

	$("#goodscodeDiv select.windowLabeldayauto_type").live("change",function(){
		if( $(this).find("option:selected").val() == 'day' ) {
			var windowlabelnewdayautolaytitle = "이후";
		}else{
			var windowlabelnewdayautolaytitle = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
		}
		$(this).parent().find(".windowlabelnewdayautolaytitle").html(windowlabelnewdayautolaytitle);
		
		if( $("input[name=windowLabelSeq]").val() ) {
			socialcpdayautoreview($(this).parents("div.windowlabelnewdayauto"));
		}
	}).change();

	$("#goodscodeDiv select.windowLabeldayauto_day").live("change",function(){
			socialcpdayautoreview($(this).parents("div.windowlabelnewdayauto"));
	}).change();


	//자동기간 예시 미리보기
	$("span.windowlabelnewdayautolayrealdateBtn").live("click",function(){
		socialcpdayautoreview($(this).parents("div.windowlabelnewdayauto"));
	});

});

//특수옵션 > 자동기간 미리보기
function socialcpdayautoreview(opttblobj) {
	opttblobj.find(".windowlabelnewdayautolayrealdate").html('');
	var dayauto_type = 'month';
	dayauto_type = opttblobj.find(".windowLabeldayauto_type option:selected").val();

	var sdayauto = '0';
	sdayauto = opttblobj.find(".windowLabelsdayauto").val();

	var fdayauto = '0';
	fdayauto = opttblobj.find(".windowLabelfdayauto").val();

	var dayauto_day = 'day';
	dayauto_day = opttblobj.find(".windowLabeldayauto_day option:selected").val();

	if( !sdayauto || !sdayauto ){
		alert("기간 자동일자를 정확히 입력해 주세요.");
		return false;
	}

	$.ajax({
		'url' : '../setting_process/goods_dayauto_setting',
		'data' : {'dayauto_type':dayauto_type,'dayauto_day':dayauto_day,'sdayauto':sdayauto,'fdayauto':fdayauto},
		'dataType' : 'json',
		'success' : function(res){ 
			opttblobj.find(".windowlabelnewdayautolayrealdate").html(res.social_start_date+"~"+res.social_end_date);
		}
	});

}

function resetLabel()
{
	$("input[name=windowLabelSeq]").val("");
	$("input[name=windowLabelName]").val("");  
	//$("input[name=windowLabelNameEng]").val("");  
	$("input[name=windowLabelId]").val("");  
	
	/* 컬러피커 */
	colorpickerlay();
 
}

function goodscodeDivShow(title,code, windowlabeltitle)
{
	setDefaultText();
	$("input[name=windowLabelId]").val(code);
	$(".labelcodetypechlay").show();	
	
	if( optcoloraddruse == 0 ) {
		$(".goodscodeoptionnew").hide();
	}else{
		if(code == 'goodsaddinfo' ){
			$(".goodscodeoptionnew").hide();			
		}else{			
			$(".goodscodeoptionnew").show();
			if(code == 'goodssuboption' ){
				$(".labelcodetypechlay").hide();
			}
		}
	}

	if(windowlabeltitle) $('.windowlabeltitle').text(windowlabeltitle);
	openDialog(title,"goodscodeDiv",{"width":"1000","height":"600"});
	var labelType = 'select';
	var html = "";
	$(".labelAdd").remove();
	html = labelAddItem(labelType);  
	$("#labelTd").html(html);

	if(code == 'goodsaddinfo' ){
			
		$(".info_cell").hide();
	}else{
		$(".info_cell").show();
	}
	
}

function labelAdd(type)
{	
	setDefaultText();
	var labelcodetypeuse = $("#labelcodetypeuse").attr("checked");
	var labelcodetypedayinputhideno = '';
	var labelcodetypedayautohideno = '';
	var labelcodetypedatehideno = '';
	var labelcodetypecolorhideno = '';
	var labelcodetypeaddresshideno = '';
	if( labelcodetypeuse == "checked" ) {//사용함인경우
		var labelcodetypeval = $("input[name='labelcodetype']:checked").val();
		if(labelcodetypeval) eval("labelcodetype"+labelcodetypeval+"hideno = '1';");
	}

	var html = '<tr class="labelAdd layer">'; 
	html += '<td><img src="../skin/default/images/common/icon_move.png" ></td>'; 
	html += '<td><label class="resp_checkbox"><input type="checkbox" name="windowLabelDefault" class="windowLabelDefault" value="Y"  /></label></td>'; 
	html += '<td class="left">'; 
	html += '<input type="text" name="windowLabelValue['+label_item_seq+']" class="windowLabelValue line" label_item_seq="'+label_item_seq+'" size="29"  title="예시) 프랑스"> '; 
	html += '</td>';

	if( optcoloraddruse == 1 ) {
	html += '<td class="info_cell">';
	html += '<div class="windowlabelnew windowlabelnewcolor hide'+labelcodetypecolorhideno+'"> <input type="text"  name="windowLabelColor['+label_item_seq+']"  value="black" class="windowLabelColor colorpickerreview colorpicker" readonly="readonly" disabled="disabled" /></div>';

	html += '<div class="windowlabelnew windowlabelnewaddress  hide'+labelcodetypeaddresshideno+'"><input type="text" name="windowLabelZipcode['+label_item_seq+'][]"  idx="'+label_item_seq+'" value="" size="5" class="line windowLabelZipcode1 windowLabelZipcode1'+label_item_seq+'" /> <span class="btn small"><input type="button" class="windowLabelZipcodeButton" value="우편번호" idx="'+label_item_seq+'" /></span><input type="text" name="windowLabelAddress_type['+label_item_seq+']" idx="'+label_item_seq+'" value="" size="0" style="display:none;" class="line hide windowLabelAddress_type  windowLabelAddress_type'+label_item_seq+'" /><input type="text" name="windowLabelAddress['+label_item_seq+']" idx="'+label_item_seq+'" value="" size="40" class="line windowLabelAddress  windowLabelAddress'+label_item_seq+'" /><br><input type="text" name="windowLabelAddress_street['+label_item_seq+']" idx="'+label_item_seq+'" value="" size="40" class="line windowLabelAddress_street  windowLabelAddress_street'+label_item_seq+'" /> <input type="text" name="windowLabelAddressDetail['+label_item_seq+']"  idx="'+label_item_seq+'" value="" size="40" class="line windowLabelAddressDetail  windowLabelAddressDetail'+label_item_seq+'" /><br/> <input type="text" name="windowLabelBizTel['+label_item_seq+']"  idx="'+label_item_seq+'" value="" size="40" class="line windowLabelBizTel  windowLabelBizTel'+label_item_seq+'"  title="업체 연락처" /><br/><input type="text" name="windowLabelBizTel['+label_item_seq+']"  idx="'+label_item_seq+'" value="" size="10" class="line windowLabelAddress_commission  windowLabelAddress_commission'+label_item_seq+'"  title="수수료" />%</div>';

	html += '<div class="windowlabelnew windowlabelnewdate hide'+labelcodetypedatehideno+'"><input type="text" name="windowLabeldate['+label_item_seq+']"  idx="'+label_item_seq+'"  value="" class="line windowLabeldate datepicker"  maxlength="10" size="10" /></div>';

	html += '</td>';
	}

	html += '<td class="left">'; 
	html += ' <input type="text" name="windowLabelCode['+label_item_seq+']"  title="예시) french"  size="30" class="windowLabelCode line">'; 
	html += '</td><td><button type="button" class="pointer btn_minus" onclick="deleteRow(this)"></button></td>';
	html += '</tr>';

	label_item_seq++;  

	$("#labelTable").append(html);
	
	/* 컬러피커 */
	colorpickerlay();
	setDefaultText();	
	setDatepicker();

	$(".tablednd").tableDnD({onDragClass: "dragRow"});

	if($(".goodscodeoptionnew").css("display")=="none"){
			
			$(".info_cell").hide();
		}else{
			$(".info_cell").show();
		}
}

//,labelzipcodeValue,labeladdressValue,labeladdressdetailValue, labelnewtype, labelnewuse
function labelAddItem(labelType, labelValue, labelDefault, labelCode, labeloptnew)
{

	var html1 = "";
	var html2 = "";
	var html3 = "";
	var html4 = "";
	var html5 = "";
	var html6 = "";
	var labelTableHtml = "";
	var labelRightHtml = "";

	var labelcodetypedayinputhideno = '';
	var labelcodetypedayautohideno = '';
	var labelcodetypedatehideno = '';
	var labelcodetypecolorhideno = '';
	var labelcodetypeaddresshideno = ''; 
	if( eval("labeloptnew")) {
		var labelcolorValue = (eval("labeloptnew['color']"))?labeloptnew['color']:"";// 
		var labelzipcodeValue = (eval("labeloptnew['zipcode']"))?labeloptnew['zipcode']:"";//labeloptnew['zipcode'];
		var labeladdress_typeValue = (eval("labeloptnew['address_type']"))?labeloptnew['address_type']:"";//labeloptnew['address'];
		var labeladdressValue = (eval("labeloptnew['address']"))?labeloptnew['address']:"";//labeloptnew['address'];
		var labeladdress_streetValue = (eval("labeloptnew['address_street']"))?labeloptnew['address_street']:"";//labeloptnew['address'];
		var labeladdressdetailValue = (eval("labeloptnew['addressdetail']"))?labeloptnew['addressdetail']:"";//labeloptnew['addressdetail'];
		var labelbiztelValue = (eval("labeloptnew['biztel']"))?labeloptnew['biztel']:"";//labeloptnew['biztel'];
		var labeladdress_commissionValue = (eval("labeloptnew['address_commission']"))?labeloptnew['address_commission']:"";//labeloptnew['biztel'];
		var labelnewtype = (eval("labeloptnew['newtype']"))?labeloptnew['newtype']:"";//labeloptnew['newtype'];
		var labelnewuse = (eval("labeloptnew['newtypeuse']"))?labeloptnew['newtypeuse']:"";//labeloptnew['newtypeuse'];

		var labeldateValue = (eval("labeloptnew['date']"))?labeloptnew['date']:"";//labeloptnew['date'];
		var labelsdayinputValue = (eval("labeloptnew['sdayinput']"))?labeloptnew['sdayinput']:"";//labeloptnew['sdayinput'];
		var labelfdayinputValue = (eval("labeloptnew['fdayinput']"))?labeloptnew['fdayinput']:"";//labeloptnew['fdayinput'];
		var labeldayauto_typeValue =(eval("labeloptnew['dayauto_type']"))?labeloptnew['dayauto_type']:"";// labeloptnew['dayauto_type'];
		var labelsdayautoValue = (eval("labeloptnew['sdayauto']"))?labeloptnew['sdayauto']:"";//labeloptnew['sdayauto'];
		var labelfdayautoValue = (eval("labeloptnew['fdayauto']"))?labeloptnew['fdayauto']:"";//labeloptnew['fdayauto'];
		var labeldayauto_dayValue = (eval("labeloptnew['dayauto_day']"))?labeloptnew['dayauto_day']:"";//labeloptnew['dayauto_day'];
	}else{
		var labelcolorValue		= "";
		var labelzipcodeValue				= "";
		var labeladdress_typeValue				="";
		var labeladdressValue				="";
		var labeladdress_streetValue				="";
		var labeladdressdetailValue		="";
		var labeladdress_commissionValue		="";
		var labelbiztelValue		="";
		var labelnewtype						="";
		var labelnewuse						= "";
		var labeldateValue					="";
		var labelsdayinputValue			= "";
		var labelfdayinputValue			="";
		var labeldayauto_typeValue	= "";
		var labelsdayautoValue			="";
		var labelfdayautoValue			="";
		var labeldayauto_dayValue		= "";
	}

	var sel_dayauto_type_month		= "";
	var sel_dayauto_type_day			= "";
	var sel_dayauto_type_next			= "";
	var sel_dayauto_day_day			= "";
	var sel_dayauto_day_end			= "";

	if( labelnewuse == 1 ) {//사용함인경우
		eval("labelcodetype"+labelnewtype+"hideno = '1';");
	}
	
	if (labelValue)
	{
		//$(".labelList_goodscode").remove();
		
		var count = labelValue.length-1; 
		var ckDefault  = '';
		if(labelDefault[0] == 'Y' ){
			ckDefault  = 'checked';
		}
		eval("sel_dayauto_type_"+labeldayauto_typeValue+" = 'selected';");
		eval("sel_dayauto_day_"+labeldayauto_dayValue+" = 'selected';");

		if( labeldayauto_typeValue == 'day' ) {
			var windowlabelnewdayautolaytitle = "이후";
		}else{
			var windowlabelnewdayautolaytitle = "";
		}
		

		labelTableHtml += '<tr class="labelAdd layer hand">';
		labelTableHtml += '<td><img src="../skin/default/images/common/icon_move.png" style="cursor:pointer"></td>'; 
		labelTableHtml += '<td><label class="resp_checkbox"><input type="checkbox" name="windowLabelDefault" class="windowLabelDefault" value="Y"   '+ ckDefault+'/></label></td>'; 
		labelTableHtml += '<td class="left"><input type="text" name="windowLabelvalue['+label_item_seq+']"  title="예시) 프랑스"  label_item_seq="'+label_item_seq+'" value="'+ labelValue[0] +'" size="29" class="windowLabelValue line"></td>';		
		
		
		var labelzipcodeValue1, labelzipcodeValue2,labelzipcodeValuear;  
		if (typeof labelzipcodeValue[0] === "undefined") { 
			var labelzipcodeValue = new Array();
			labelzipcodeValue1 = "";
			labelzipcodeValue2 = "";
		}else{
			var labelzipcodeValuear = labelzipcodeValue[0].split("-");
			labelzipcodeValue1 = labelzipcodeValuear[0];
			labelzipcodeValue2 = labelzipcodeValuear[1];
		}
		
		if (typeof(labeladdressValue[0]) == "undefined") { 
			var labeladdressValue = new Array();
			labeladdressValue[0] = '';
		}

		if (typeof(labeladdress_typeValue[0]) == "undefined") { 
			var labeladdress_typeValue = new Array();
			labeladdress_typeValue[0] = '';
		}

		if (typeof(labeladdress_streetValue[0]) == "undefined") { 
			var labeladdress_streetValue = new Array();
			labeladdress_streetValue[0] = '';
		}

		if (typeof(labeladdressdetailValue[0]) == "undefined") { 
			var labeladdressdetailValue = new Array();
			labeladdressdetailValue[0] = '';
		}
		
		if (typeof(labelbiztelValue[0]) == "undefined") { 
			var labelbiztelValue = new Array();
			labelbiztelValue[0] = '';
		}
		

		if (typeof(labeladdress_commissionValue[0]) == "undefined") { 
			var labeladdress_commissionValue = new Array();
			labeladdress_commissionValue[0] = '';
		}
		
		if (typeof(labeldateValue[0]) == "undefined") { 
			var labeldateValue = new Array();
			labeldateValue[0] = '';
		}
		
		if( optcoloraddruse  == 1 ) {
		labelTableHtml += '<td class="info_cell"><div class="windowlabelnew windowlabelnewcolor hide'+labelcodetypecolorhideno+'"> <input type="text"  name="windowLabelColor['+label_item_seq+']"  value="'+ labelcolorValue[0] +'" class="windowLabelColor colorpickerreview colorpicker" readonly="readonly" disabled="disabled" /></div>';//5
		
		labelTableHtml += '<div class="windowlabelnew windowlabelnewaddress  hide'+labelcodetypeaddresshideno+'"><input type="text" name="windowLabelZipcode['+label_item_seq+']"  idx="'+label_item_seq+'" value="'+labelzipcodeValue1 +'" size="5" class="line windowLabelZipcode1  windowLabelZipcode1'+label_item_seq+'" /> - <input type="text" name="windowLabelZipcode['+label_item_seq+']"  idx="'+label_item_seq+'" value="'+ labelzipcodeValue2 +'" size="5" class="line windowLabelZipcode2  windowLabelZipcode2'+label_item_seq+'" /> <span class="btn small"><input type="button" class="windowLabelZipcodeButton" idx="'+label_item_seq+'"  value="우편번호" /></span><br/><input type="text" name="windowLabelAddress_type['+label_item_seq+']" style="display:none;" idx="'+label_item_seq+'" value="'+ labeladdress_typeValue[0] +'" size="0" class="line hidden windowLabelAddress_type  windowLabelAddress_type'+label_item_seq+'" /><input type="text" name="windowLabelAddress['+label_item_seq+']"  idx="'+label_item_seq+'" value="'+ labeladdressValue[0] +'" size="40" class="line windowLabelAddress  windowLabelAddress'+label_item_seq+'" /><br><input type="text" name="windowLabelAddress_street['+label_item_seq+']"  idx="'+label_item_seq+'" value="'+ labeladdress_streetValue[0] +'" size="40" class="line windowLabelAddress_street  windowLabelAddress_street'+label_item_seq+'" /><br/> <input type="text" name="windowLabelAddressDetail['+label_item_seq+']"  idx="'+label_item_seq+'" value="'+ labeladdressdetailValue[0] +'" size="40" class="line windowLabelAddressDetail  windowLabelAddressDetail'+label_item_seq+'" /> <br/> <input type="text" name="windowLabelBizTel['+label_item_seq+']"  idx="'+label_item_seq+'" value="'+ labelbiztelValue[0] +'" size="40" class="line windowLabelBizTel  windowLabelBizTel'+label_item_seq+'"  title="업체 연락처"  /><br/> <input type="text" name="windowLabelAddress_commission['+label_item_seq+']"  idx="'+label_item_seq+'" value="'+ labeladdress_commissionValue[0] +'" size="10" class="line windowLabelAddress_commission  windowLabelAddress_commission'+label_item_seq+'"  title="수수료"  />%</div>';

		labelTableHtml += '<div class="windowlabelnew windowlabelnewdate hide'+labelcodetypedatehideno+'"><input type="text" name="windowLabeldate['+label_item_seq+']"  idx="'+label_item_seq+'"  value="'+ labeldateValue[0] +'" class="line windowLabeldate datepicker"  maxlength="10" size="10" /></div>';

		labelTableHtml += '<div class="windowlabelnew windowlabelnewdayinput hide'+labelcodetypedayinputhideno+'"><input type="text" name="windowLabelsdayinput['+label_item_seq+']"  idx="'+label_item_seq+'"  value="'+ labelsdayinputValue +'" class="line windowLabelsdayinput datepicker"  maxlength="10" size="10" />~<input type="text" name="windowLabelfdayinput['+label_item_seq+']"  idx="'+label_item_seq+'"  value="'+ labelfdayinputValue +'" class="line windowLabelfdayinput datepicker"  maxlength="10" size="10" /></div>';
		labelTableHtml += '<div class="windowlabelnew windowlabelnewdayauto hide'+labelcodetypedayautohideno+'"><span>\'결제확인\' 후 <select name="windowLabeldayauto_type['+label_item_seq+']" class="windowLabeldayauto_type"  idx="'+label_item_seq+'" ><option value="month" '+sel_dayauto_type_month+'>해당 월▼</option><option value="day"  '+sel_dayauto_type_day+'>해당 일▼</option><option value="next"  '+sel_dayauto_type_next+'>익월▼</option></select> <input type="text" name="windowLabelsdayauto['+label_item_seq+']"  idx="'+label_item_seq+'"  value="'+ labelsdayautoValue +'" class="line windowLabelsdayauto"  maxlength="10" size="2" />일 <span class="windowlabelnewdayautolaytitle">'+windowlabelnewdayautolaytitle+'</span>부터 + <input type="text" name="windowLabelfdayauto['+label_item_seq+']"  idx="'+label_item_seq+'"  value="'+ labelfdayautoValue +'" class="line windowLabelfdayauto"  maxlength="10" size="2" />일 <select name="windowLabeldayauto_day['+label_item_seq+']" class="windowLabeldayauto_day"  idx="'+label_item_seq+'" ><option value="day"  '+sel_dayauto_day_day+'>동안</option><option value="end" '+sel_dayauto_day_end+'>이 되는 월의 말일</option></select> </span><br/><span  class="hand windowlabelnewdayautolayrealdateBtn"  >미리보기▶ </span><span class="windowlabelnewdayautolayrealdate"></span></div>';
		labelTableHtml += '</td>'
		}

		
		if( labelcodetypedayinputhideno || labelcodetypedayautohideno ){
			labelTableHtml += '<td class="left"><input type="text" name="windowLabelCode['+label_item_seq+']"  title="예시) french"  value="'+ labelCode[0] +'" size="30" class="windowLabelCode line"></td>';
			
		}else{
			labelTableHtml += '<td class="left"><input type="text" name="windowLabelCode['+label_item_seq+']"  title="예시) french"  value="'+ labelCode[0] +'" size="30" class="windowLabelCode line"></td>';
		}

		labelTableHtml += '<td><button type="button" class="pointer btn_minus" onclick="deleteRow(this)"></button></td></tr>';
		
		if($(".labelList_goodscode").find(".newlabel"))$(".newlabel").remove();
		
		if (count > 1)
		{			
			for (i=1; i<count; i++)
			{		
				ckDefault  = '';
				if(labelDefault[i] == 'Y' ){
					ckDefault  = 'checked';
				}				

				var labelzipcodeValue1, labelzipcodeValue2,labelzipcodeValuear;  
				if (typeof labelzipcodeValue[i] === "undefined") { 
					labelzipcodeValue1 = "";
					labelzipcodeValue2 = "";
				}else{
					var labelzipcodeValuear = labelzipcodeValue[i].split("-");
					labelzipcodeValue1 =  labelzipcodeValuear[0];
					labelzipcodeValue2 = labelzipcodeValuear[1];
				}
				
				if (typeof labeladdress_typeValue[i] === "undefined") { 
					labeladdress_typeValue[i] = "";
				}

				if (typeof labeladdressValue[i] === "undefined") { 
					labeladdressValue[i] = "";
				}

				if (typeof labeladdress_streetValue[i] === "undefined") { 
					labeladdress_streetValue[i] = "";
				}

				if (typeof labeladdressdetailValue[i] === "undefined") { 
					labeladdressdetailValue[i] = "";
				} 
				
				if (typeof labelbiztelValue[i] === "undefined") { 
					labelbiztelValue[i] = "";
				} 

				if (typeof labeladdress_commissionValue[i] === "undefined") { 
					labeladdress_commissionValue[i] = "";
				} 
				
				if (typeof labeldateValue[i] === "undefined") { 
					labeldateValue[i] = "";
				} 

				label_item_seq++;
				
				labelTableHtml += '<tr class="labelAdd layer hand ">';
				labelTableHtml += '<td><img src="../skin/default/images/common/icon_move.png"></td>';
				labelTableHtml += '<td><label class="resp_checkbox"><input type="checkbox" name="windowLabelDefault" class="windowLabelDefault" value="Y"   '+ ckDefault+'/></label> </td>';

				labelTableHtml += '<td class="left">';
				labelTableHtml += '<input type="text" name="windowLabelvalue['+label_item_seq+']" label_item_seq="'+label_item_seq+'"  title="예시) 프랑스"  value="'+ labelValue[i] +'" size="29" class="windowLabelValue"> ';
				labelTableHtml += '</td>';

				if( optcoloraddruse  == 1 ) {
				labelTableHtml += '<td class="info_cell">';
				labelTableHtml += '<div class="windowlabelnew windowlabelnewcolor hide'+labelcodetypecolorhideno+'"> <input type="text"  name="windowLabelColor['+label_item_seq+']"  value="'+ labelcolorValue[i] +'" class="windowLabelColor colorpickerreview colorpicker" readonly="readonly" disabled="disabled" /></div>';//5
				
				labelTableHtml += '<div class="windowlabelnew windowlabelnewaddress  hide'+labelcodetypeaddresshideno+'"><input type="text" name="windowLabelZipcode['+label_item_seq+'][]"  idx="'+label_item_seq+'" value="'+ labelzipcodeValue1 +'" size="5" class="line windowLabelZipcode1  windowLabelZipcode1'+label_item_seq+'" />-<input type="text" name="windowLabelZipcode['+label_item_seq+'][]"  idx="'+label_item_seq+'" value="'+ labelzipcodeValue2 +'" size="5" class="line windowLabelZipcode2  windowLabelZipcode2'+label_item_seq+'" /> <span class="btn small"><input type="button" class="windowLabelZipcodeButton"  idx="'+label_item_seq+'" value="우편번호" /></span><br/><input type="text" name="windowLabelAddress_type['+label_item_seq+']" value="'+ labeladdress_typeValue[i] +'"  idx="'+label_item_seq+'" size="0" style="display:none;" class="line hide windowLabelAddress_type  windowLabelAddress_type'+label_item_seq+'" /><input type="text" name="windowLabelAddress['+label_item_seq+']" value="'+ labeladdressValue[i] +'"  idx="'+label_item_seq+'" size="40" class="line windowLabelAddress  windowLabelAddress'+label_item_seq+'" /><br><input type="text" name="windowLabelAddress_street['+label_item_seq+']" value="'+ labeladdress_streetValue[i] +'"  idx="'+label_item_seq+'" size="40" class="line windowLabelAddress_street  windowLabelAddress_street'+label_item_seq+'" /><br/><input type="text" name="windowLabelAddressDetail['+label_item_seq+']"  idx="'+label_item_seq+'" value="'+ labeladdressdetailValue[i] +'" size="40" class="line windowLabelAddressDetail  windowLabelAddressDetail'+label_item_seq+'" /> <br/><input type="text" name="windowLabelBizTel['+label_item_seq+']"  idx="'+label_item_seq+'" value="'+ labelbiztelValue[i] +'" size="40" class="line windowLabelBizTel  windowLabelBizTel'+label_item_seq+'"  title="업체 연락처"  /><br/><input type="text" name="windowLabelAddress_commission['+label_item_seq+']"  idx="'+label_item_seq+'" value="'+ labeladdress_commissionValue[i] +'" size="10" class="line windowLabelAddress_commission  windowLabelAddress_commission'+label_item_seq+'"  title="수수료"  />%</div>';

				labelTableHtml += '<div class="windowlabelnew windowlabelnewdate hide'+labelcodetypedatehideno+'"><input type="text" name="windowLabeldate['+label_item_seq+']"  idx="'+label_item_seq+'"  value="'+ labeldateValue[i] +'" class="line windowLabeldate datepicker"  maxlength="10" size="10" /></div>';

				labelTableHtml += '</td>';
				}
				
				labelTableHtml += '<td class="left">';
				labelTableHtml += ' <input type="text" name="windowLabelCode['+label_item_seq+']"  title="예시) french"  value="'+ labelCode[i] +'" size="30" class="windowLabelCode">';
				labelTableHtml += '</td><td><button type="button" class="pointer btn_minus" onclick="deleteRow(this)"></button></td>';
				labelTableHtml += '</tr>';
			}
		}		
	}else{	
	
		labelTableHtml += '<tr class="labelAdd layer hand newlabel">';
		labelTableHtml += '<td><img src="../skin/default/images/common/icon_move.png"></td>';
		labelTableHtml += '<td><label class="resp_checkbox"><input type="checkbox" name="windowLabelDefault" class="windowLabelDefault" value="Y"  checked="checked" /></label></td>';
		labelTableHtml += '<td class="left"><input type="text" name="windowLabelValue['+label_item_seq+']" class="windowLabelValue line" label_item_seq="'+label_item_seq+'"  title="예시) 프랑스"   size="29"></td>';
		
		if( optcoloraddruse  == 1 ) {
			labelTableHtml += '<td class="info_cell"><div class="windowlabelnew windowlabelnewcolor hide'+labelcodetypecolorhideno+'"> <input type="text"  name="windowLabelColor['+label_item_seq+']"  value="black" class="windowLabelColor colorpickerreview colorpicker" readonly="readonly" disabled="disabled" /></div>';

			labelTableHtml += '<div class="windowlabelnew windowlabelnewaddress  hide'+labelcodetypeaddresshideno+'"><input type="text" name="windowLabelZipcode['+label_item_seq+'][]"  idx="'+label_item_seq+'" value="" size="5" class="line windowLabelZipcode1  windowLabelZipcode1'+label_item_seq+'" /> - <input type="text" name="windowLabelZipcode['+label_item_seq+'][]"  idx="'+label_item_seq+'" value="" size="5" class="line windowLabelZipcode2  windowLabelZipcode2'+label_item_seq+'" /> <span class="btn small"><input type="button" class="windowLabelZipcodeButton" idx="'+label_item_seq+'"  value="우편번호" /></span><br/><input type="text" name="windowLabelAddress_type['+label_item_seq+']"  idx="'+label_item_seq+'" value="" size="0" style="display:none;" class="line windowLabelAddress_type  windowLabelAddress_type'+label_item_seq+'" /><input type="text" name="windowLabelAddress['+label_item_seq+']"  idx="'+label_item_seq+'" value="" size="40" class="line windowLabelAddress  windowLabelAddress'+label_item_seq+'" /><br><input type="text" name="windowLabelAddress_street['+label_item_seq+']"  idx="'+label_item_seq+'" value="" size="40" class="line windowLabelAddress_street  windowLabelAddress_street'+label_item_seq+'" /><br/> <input type="text" name="windowLabelAddressDetail['+label_item_seq+']"  idx="'+label_item_seq+'" value="" size="40" class="line windowLabelAddressDetail windowLabelAddressDetail'+label_item_seq+'" /><br/> <input type="text" name="windowLabelBizTel['+label_item_seq+']"  idx="'+label_item_seq+'" value="" size="40" class="line windowLabelBizTel  windowLabelBizTel'+label_item_seq+'"  title="업체 연락처" /><br/> <input type="text" name="windowLabelAddress_commission['+label_item_seq+']"  idx="'+label_item_seq+'" value="" size="10" class="line windowLabelAddress_commission  windowLabelAddress_commission'+label_item_seq+'"  title="수수료" />%</div>'; 

			
			labelTableHtml += '<div class="windowlabelnew windowlabelnewdate hide'+labelcodetypedatehideno+'"><input type="text" name="windowLabeldate['+label_item_seq+']"  idx="'+label_item_seq+'"  value="" class="line windowLabeldate datepicker"  maxlength="10" size="10" /></div>';

			labelTableHtml += '<div class="windowlabelnew windowlabelnewdayinput hide'+labelcodetypedayinputhideno+'"><input type="text" name="windowLabelsdayinput['+label_item_seq+']"  idx="'+label_item_seq+'"  value="" class="line windowLabelsdayinput datepicker"  maxlength="10" size="10" />~<input type="text" name="windowLabelfdayinput['+label_item_seq+']"  idx="'+label_item_seq+'"  value="" class="line windowLabelfdayinput datepicker"  maxlength="10" size="10" /></div>';

			labelTableHtml += '<div class="windowlabelnew windowlabelnewdayauto hide'+labelcodetypedayautohideno+'"><span>\'결제확인\' 후 <select name="windowLabeldayauto_type['+label_item_seq+']" class="windowLabeldayauto_type"  idx="'+label_item_seq+'" ><option value="month">해당 월▼</option><option value="day">해당 일▼</option><option value="next">익월▼</option></select> <input type="text" name="windowLabelsdayauto['+label_item_seq+']"  idx="'+label_item_seq+'"  value="" class="line windowLabelsdayauto"  maxlength="10" size="2" />일 <span class="windowlabelnewdayautolaytitle"></span>부터 + <input type="text" name="windowLabelfdayauto['+label_item_seq+']"  idx="'+label_item_seq+'"  value="" class="line windowLabelfdayauto"  maxlength="10" size="2" />일 <select name="windowLabeldayauto_day['+label_item_seq+']" class="windowLabeldayauto_day"  idx="'+label_item_seq+'" ><option value="day">동안</option><option value="end">이 되는 월의 말일</option></select> </span><br/><span  class="hand windowlabelnewdayautolayrealdateBtn"  >미리보기▶ </span><span class="windowlabelnewdayautolayrealdate"></span></div>';
			labelTableHtml += '</td>'
		}
		
		labelTableHtml += '<td class="left"><input type="text" name="windowLabelCode['+label_item_seq+']" size="30" title="예시) french" class="windowLabelCode"></td>';
		labelTableHtml += '<td><button type="button" class="pointer btn_minus" onclick="deleteRow(this)"></button></td></tr>';

		label_item_seq++;	
		
	}
	

	$("#labelTable").append(labelTableHtml); 
	$(".tablednd").tableDnD({onDragClass: "dragRow"});

	$("#labelTd1").html(html1); 
	$("#labelTd2").html(html2); 
	$("#labelTd3").html(html3);  
	if( optcoloraddruse  == 1 ) $("#labelTd5").html(html5); 
	$("#labelTd4").html(html4);
	$("#labelTd6").html(html6);

	
	/* 컬러피커 */
	colorpickerlay();
	setDefaultText();	
	setDatepicker();

	if($(".goodscodeoptionnew").css("display")=="none"){
			
		$(".info_cell").hide();
	}else{
		$(".info_cell").show();
	}
}

function deleteRow(obj){

	var table		= $(obj).closest('table');
	var tbody		= $(obj).closest('tbody');
	var tbodyName	= tbody.attr('class');
	var len			= tbody.find('tr').length  

	if(tbodyName=="labelList_goodsaddinfo") len = len - $('.labelList_goodsaddinfo').find('.hide').length;

	if(table.attr('id')=='labelAddInfoTable'){

		rowNum = $(obj).closest('tr').find('.codeform_seq').val();
		$('.labelList_goodsaddinfo .settinglayer' + rowNum).remove();
		$('.labelList_goodsaddinfo .layer' + rowNum).remove();
		$(obj).closest('tr').remove();

	}else if(table.attr('id')=='labelTable')
	{
		if(len > 1){	
			$(obj).closest('tr').remove();
		}

	}else{
		 $(obj).closest('tr').remove();
	
		if(len == 1) 
		{	
			if(tbodyName)
			{
				$('<tr class="mess"><td colspan="5">자주 쓰는 정보를 추가해주세요.</td></tr>').appendTo(tbody);	
			}else{			
				$('<tr class="mess"><td colspan="5">상품 검색용 색상을 생성해주세요.</td></tr>').appendTo(tbody);	
			}
		}
	}	
} 

// 검색용 색상 수정 팝업
function openModifyGoodsColor(obj){
	var tbody	= $('div#goodscolorDiv').find('tbody');
	var trObj	= '';
	var tdObj	= '';
	tbody.html('');
	var obj = $('.color-list-lay').find('div.color-item-lay');
	var len = obj.length;

	if(len==0)
	{
		trObj	= $('<tr class="mess"><td colspan="5">상품 검색용 색상을 생성해주세요.</td></tr>').appendTo(tbody);
	}else{	
		obj.each(function(){
			trObj	= $('<tr></tr>').appendTo(tbody);

			// 순서 변경 이미지
			tdObj	= $('<td></td>').appendTo(trObj);		
			tdObj.append('<img src="/admin/skin/default/images/common/icon_move.png" />');

			// 색상명 inputbox
			tdObj	= $('<td></td>').appendTo(trObj);
			tdObj.addClass('left');
			tdObj.append('<input type="text" class="modify_color_name" size="30" value="' + $(this).find('input.color_name').val() + '" />');
			tdObj.append('<input type="hidden" class="modify_color_seq" value="' + $(this).find('input.color_seq').val() + '" />');

			// 색상 box
			tdObj	= $('<td></td>').appendTo(trObj);
			tdObj.append('<input type="text" class="colorpickerreview colorpicker" value="#' + $(this).find('input.color_value').val() + '" onchange="changeColorSet(this);" />');

			// 색상 코드값
			// 색상명 inputbox
			tdObj	= $('<td class="code-preview"></td>').appendTo(trObj);	
			tdObj.append('#' + $(this).find('input.color_value').val());

			// 삭제 버튼
			tdObj	= $('<td></td>').appendTo(trObj);		
			tdObj.append('<button type="button" class="btn_minus" onclick="deleteRow(this);"></button>');
		});
	}

	/* 컬러피커 */
	colorpickerlay();
	$(".tablednd").tableDnD({onDragClass: "dragRow"});

	openDialog('검색용 색상', 'goodscolorDiv', {'width':650,'height':650});
}

// colorpicker로 수정된 색상 코드 code-preview에 적용
function changeColorSet(obj){
	var chgColor	= $(obj).val();
	$(obj).closest('tr').find('td.code-preview').html(chgColor);
}

// 색상 추가
function addGoodsColor(){
	var tbody	= $('div#goodscolorDiv').find('tbody');
	var trObj	= '';
	var tdObj	= '';
	var tCnt	= tbody.find('tr').length;
	
	if	(tCnt >= 24){
		openDialogAlert('검색용 색상은 최대 24개까지 정의할 수 있습니다.', 400, 170, function(){});
		return false;
	}

	if(tCnt> 0) $("#goodscolorDiv .mess").remove()
	
	trObj	= $('<tr></tr>').appendTo(tbody);	

	// 순서 변경 이미지
	tdObj	= $('<td></td>').appendTo(trObj);
	tdObj.append('<img src="/admin/skin/default/images/common/icon_move.png" />');
	

	// 색상명 inputbox
	tdObj	= $('<td></td>').appendTo(trObj);
	tdObj.addClass('left');
	tdObj.append('<input type="text" class="modify_color_name" size="30" value="" />');
	tdObj.append('<input type="hidden" class="modify_color_seq" value="" />');

	// 색상 box
	tdObj	= $('<td></td>').appendTo(trObj);
	tdObj.append('<input type="text" class="colorpickerreview colorpicker" value="#000000" onchange="changeColorSet(this);" />');

	// 색상 코드값
	// 색상명 inputbox
	tdObj	= $('<td class="code-preview"></td>').appendTo(trObj);	
	tdObj.append('#000000');

	// 삭제 버튼
	tdObj	= $('<td></td>').appendTo(trObj);	
	tdObj.append('<button type="button" class="btn_minus" onclick="deleteRow(this);"></button>');

	/* 컬러피커 */
	colorpickerlay();

	$(".tablednd").tableDnD({onDragClass: "dragRow"});
}

// 색상 적용
function applyGoodsColor(){
	var tbody	= $('div#goodscolorDiv').find('tbody');
	var html	= '';
	var seq		= '';

	$('td.color-list-lay').html('');

	if(tbody.find('.mess').length==1)
	{		
		html = "<div class='center mess'>상품 검색용 색상을 생성해주세요.</div>		"
		$('td.color-list-lay').append(html);			
	}else{

		tbody.find('tr').each(function(){
				
			if	($(this).find('input.modify_color_seq').val() > 0){
				seq			= $(this).find('input.modify_color_seq').val();
			}else{
				seq			= Number(layer_seq) + 1;
				layer_seq	= seq;
			}

			html	= '<div class="color-item-lay">' + "\n";
			html	+= '<ul>' + "\n";
			html	+= '<li class="color-name">' + $(this).find('input.modify_color_name').val() + '</li>' + "\n";
			html	+= '<li style="background-color:' + $(this).find('input.colorpicker').val() + '" class="color-box"></li>' + "\n";
			html	+= '<li class="color-code">' + $(this).find('input.colorpicker').val() + '</li>' + "\n";
			html	+= '<input type="hidden" name="labelItem[goodscolor][' + seq + '][codeform_seq]" value="' + seq + '" class="color_seq" />' + "\n";
			html	+= '<input type="hidden" name="labelItem[goodscolor][' + seq + '][value]" value="' + $(this).find('input.modify_color_name').val() + '" class="color_name" />' + "\n";
			html	+= '<input type="hidden" name="labelItem[goodscolor][' + seq + '][color]" value="' + $(this).find('input.colorpicker').val().replace('#', '') + '" class="color_value" />' + "\n";
			html	+= '<input type="hidden" name="labelItem[goodscolor][' + seq + '][type]" value="goodscolor">' + "\n";
			html	+= '<input type="hidden" name="labelItem[goodscolor][' + seq + '][name]" value="검색용 색상">' + "\n";
			html	+= '<input type="hidden" name="labelItem[goodscolor][' + seq + '][default]" value="">' + "\n";
			html	+= '<input type="hidden" name="labelItem[goodscolor][' + seq + '][code]" value="">' + "\n";
			html	+= '</ul>' + "\n";
			html	+= '</div>' + "\n";

			$('td.color-list-lay').append(html);
		});
	}

	closeDialog('goodscolorDiv');
}
