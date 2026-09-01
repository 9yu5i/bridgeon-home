
	$(document).ready(function() {
		
		$(".all-check").toggle(function(){
			$(this).parent().find('input[type=checkbox]').not('[name="chk_bundle_yn"]').attr('checked',true);
			$(".shipping_nation").trigger("change");
		},function(){
			$(this).parent().find('input[type=checkbox]').not('[name="chk_bundle_yn"]').attr('checked',false);
			$(".shipping_nation").trigger("change");
		});	

		// 중요 선택 시 품절 상태 삭제 :: 2017-08-22 hed
		$("span.list-important").live("click",function(){
			var param = "?no="+$(this).attr('id');
			if( $(this).hasClass('checked') ){
				$(this).removeClass('checked');
				param += "&val=0";
			}else{
				$(this).addClass('checked');
				param += "&val=1";
			}
			$.get('important'+param,function(data) {});
		});

		// 출고방법 국가선택시 세부 검색 풀기 :: 2016-10-11 lwh
		$(".shipping_nation").live("change", function(){
			var nation = $(this).val();
			if($(this).is(":checked")){
				$(".ship_" + nation).attr("disabled", false);
			}else{
				$(".ship_" + nation).attr("disabled", true).attr("checked",false);
			}
		});

		$("select.list-select").live("change",function(){
			var nm = $(this).attr("name");
			var value_str = $(this).val();
			var that = this;

			$("select[name='"+nm+"']").not(this).each(function(idx){
				$(this).find("option[value='"+value_str+"']").attr("selected",true);
				this.selectedIndex = that.selectedIndex;
				$(this).customSelectBox("selectIndex",that.selectedIndex);
			});

			var step = nm.replace('select_', "");
			var obj = $(".important-"+step);
			obj.each(function(){
				if( value_str ){
					$(this).parent().parent().find("td").eq(0).find("input").attr("checked",false);
					if(  value_str == 'important' && $(this).hasClass('checked') ){
						$(this).parent().parent().find("td").eq(0).find("input").attr("checked",true);
					}else if( value_str == 'not-important' && !$(this).hasClass('checked') ){
						$(this).parent().parent().find("td").eq(0).find("input").attr("checked",true);
					}else if(  value_str == 'select' ){
						$(this).parent().parent().find("td").eq(0).find("input").attr("checked",true);
					}else if( value_str == 'soldout' && $(this).hasClass('soldout') ){
						$(this).parent().parent().find("td").eq(0).find("input").attr("checked",true);
					}
				}
			});
		});

		// 바로열기 ajax로 동작 되도록 수정 :: 2017-08-22 hed
		$(".btn-direct-open").live("click",function(){
			var nextTr = $(this).parent().parent().next();
			if(nextTr.hasClass("hide")){
				var order_seq = $(this).parent().parent().find("input[type='checkbox']").val();
				$.get('view?no='+order_seq+'&mode=export_list', function(data) {
					nextTr.find('div.detail').html(data);
				});
				nextTr.removeClass('hide');
				$(this).addClass("opened");
			}else{
				var nextTr = $(this).parent().parent().next();
				nextTr.find('div.detail').html('');
				nextTr.addClass('hide');
				$(this).removeClass("opened");
			}
		});

		//
		$("button[name='goods_print']").live("click",function(){
			var st = '.export_code_' + $(this).attr('id');
			var temp1 = "";
			var temp2 = "";
			$(st+":checked").each(function(idx){
				temp1	+= $(this).val() + "|";
				temp2	+= $(this).attr("order_seq") + "|";
			});

			if(temp1){
				printExportView(temp2,temp1,'catalog');
			}else{
				alert("선택값이 없습니다.");
				return;
			}
		});

		// 출고 정보수정
		$("button#waybill_number_modify").live("click",function(){
			var f = $("form[name='batch_form']");
			f.html($(".waybill_number"));
			f[0].submit();
		});



		$("span.reverse_export").live("click",function(){
			var st = '.export_code_' + $(this).attr('id');
			var export_code = new Array();
			$(st+":checked").each(function(idx){
				export_code[idx] = 'code[]='+$(this).val();
			});

			if(export_code.length > 0){
				var str = export_code.join('&');
				$.ajax({
					type: "POST",
					url: "../export_process/batch_reverse_export",
					data: str,
					success: function(result){
						openDialogAlert(result,400,140,function(){
							document.location.reload();
						});
					}
				});

			}else{
				alert("선택값이 없습니다.");
				return;
			}
		});

		// 체크박스 색상
		$("input[type='checkbox'][name='export_code[]']").live('change',function(){
			if($(this).is(':checked')){
				$(this).closest('tr').addClass('checked-tr-background');
			}else{
				$(this).closest('tr').removeClass('checked-tr-background');
			}
		}).change();

		// 기본검색 조건 불러오기
		$("button#get_default_button").live("click",function(){
			$.getJSON('get_search_default', function(result) {
				$("form[name='search-form'] input[type='checkbox']").removeAttr("checked");
				$("form[name='search-form'] input[type='text']").val('');
				$("form[name='search-form'] select").val('').change();
				$("select[name='provider_seq_selector']" ).next(".ui-combobox").children("input").val('');

				var patt;
				for(var i=0;i<result.length;i++){
					patt=/_date/g;
					if( patt.test(result[i][0]) ){
						if(result[i][1] == 'today'){
							set_date(search_default_date_today,search_default_date_today);
						}else if(result[i][1] == '3day'){
							set_date(search_default_date_3day,search_default_date_today);
						}else if(result[i][1] == '7day'){
							set_date(search_default_date_7day,search_default_date_today);
						}else if(result[i][1] == '1mon'){
							set_date(search_default_date_1month,search_default_date_today);
						}else if(result[i][1] == '3mon'){
							set_date(search_default_date_3month,search_default_date_today);
						}else if(result[i][1] == 'all'){
							set_date('','');
						}
					}
					//patt=/chk_/;
					if(result[i][0]){
						$("form[name='search-form'] input[name='"+result[i][0]+"']").attr("checked",true);
					}
				}
			});
		});

		// 기본검색 조건 저장하기
		$("span#set_default_button").live("click",function(){
			openDialog("기본검색 설정<span style=\"font-size:11px; margin-left:26px;\"> - 아래서 원하는 검색조건을 설정하여 편하게 쇼핑몰을 운영하세요</span>", "search_detail_dialog", {"width":"800","height":"220"});
		});

		// 다운로드항목설정
		$("button[name='download_list']").live("click",function(){
			openDialogPopup("항목설정", "download_list_setting", {
				'url' : 'download_write',
				'width' : 800,
				'height' : 560
			});
		});

		$(".select_date").on("click",function(){
			var select_date = $(this).val();
			var d = new Date();

			$('input[name="regist_date[1]"]').val(formatDate(d));
			
			if(select_date == "오늘"){
				$('input[name="regist_date[0]"]').val(formatDate(d));
			}else if(select_date == "3일간"){
				var s_date = d.setDate(d.getDate() - 3);
				$('input[name="regist_date[0]"]').val(formatDate(s_date));
			}else if(select_date == "일주일"){
				var s_date = d.setDate(d.getDate() - 7);
				$('input[name="regist_date[0]"]').val(formatDate(s_date));
			}else if(select_date == "1개월"){
				var s_date = d.setMonth(d.getMonth() - 1);
				$('input[name="regist_date[0]"]').val(formatDate(s_date));
			}else if(select_date == "3개월"){
				var s_date = d.setMonth(d.getMonth() - 3);
				$('input[name="regist_date[0]"]').val(formatDate(s_date));
			}else if(select_date == "전체"){
				$('input[name="regist_date[0]"]').val('');
				$('input[name="regist_date[1]"]').val('');
			}
		});

		$("button[name='excel_down']").live("click",function(){
			var status		= $(this).attr("status");
            var export_code = "";
            var provider = $(this).data('provider');
			if(provider != 'selleradmin'){
				provider = 'admin';
			}
			var excel_type	= $("#excel_type_"+status).val();
			if(!excel_type){
				excel_type = "select";
			}
			var excel_form	= $("#select_down_"+status).val();

			if(!excel_form){
				alert("양식을 선택해 주세요.");
				return;
			}

			if( excel_type == 'search' ){
				export_code = 'search';
			} else {
				if(status > 0){
					$("tr.step"+status).find("input[type='checkbox'][name='export_code[]']:checked").each(function(idx){
						export_code += $(this).val() + "|";
					});
				} else {
					$("tr[class^='list-row step']").find("input[type='checkbox'][name='export_code[]']:checked").each(function(idx){
						export_code += $(this).val() + "|";
					});
				}
				
				if(!export_code){
					alert("선택값이 없습니다.");
					return;
				}
			}

			$('form[name="search-form"] input[name="excel_type"]').val(excel_type); 
			$('form[name="search-form"] input[name="status"]').val(status); 
			$('form[name="search-form"] input[name="export_code"]').val(export_code); 
			$('form[name="search-form"] input[name="criteria"]').val(excel_form); 
			$('form[name="search-form"] input[name="callPage"]').val('export_seller'); 

			var queryString = $('form[name="search-form"]').serializeArray();
			ajaxexceldown_spout('/cli/excel_down/create_export', queryString, provider);
		});

		function ajaxexceldown_spout(url, queryString, provider){
			var params = {};
			jQuery.each(queryString, function(i, field){
				params[field.name] = field.value;
			});

			if(provider != 'selleradmin'){
				provider = 'admin';
			}

			$.ajax({      
				type: "POST",  
				url: url,      
				data: params, 
				success:function(args){ 
					var exe = args.split('.').pop();
					if(exe == "csv" || exe == "zip" || exe == "xlsx") {
						window.location.href = '/'+provider+'/excel_spout/file_download?url=' + args;
					} else if(args.indexOf('openDialogAlert') >= 0) {
						$('body').append(args);
					} else {
						alert(args);
					}
				}, error:function(e){  
					alert(e.responseText);  
				}  
			});
		}

		function formatDate(date) { 
			var d = new Date(date), month = '' + (d.getMonth() + 1), day = '' + d.getDate(), year = d.getFullYear(); 
			if (month.length < 2) month = '0' + month; if (day.length < 2) day = '0' + day; 
			return [year, month, day].join('-'); 
		}

		// export_upload
		$("button[name='excel_upload']").live("click",function(){
			var status = $(this).attr("status");
			openDialog("출고완료일/택배사코드/송장번호 - 엑셀 일괄 업로드", "export_upload", {"width":"750","height":"550","show" : "fade","hide" : "fade"});
		});

		$("button[name='invoice_print']").live("click",function(){
			var st = '.export_code_' + $(this).attr('id');
			var temp1 = "";
			var temp2 = "";
			$(st+":checked").each(function(idx){
				temp1	+= $(this).val() + "|";
				temp2	+= $(this).attr("order_seq") + "|";
			});

			if(temp1){
				printInvoiceView(temp2,temp1);
			}else{
				alert("선택값이 없습니다.");
				return;
			}
		});

		$("select.waybill_number").live('change',function(){
			waybill_auto = false;
			if	($(this).attr('chkVal') != undefined && $(this).val() != null)
				if	($(this).attr('chkVal').substring(0,5)=='auto_') waybill_auto = true;
			if(waybill_auto || $(this).closest(".list-row").hasClass("step75") ){
				$("option",this).not(":selected").attr("disabled",true);
				$(this).closest('tr').find("input.delivery_number").attr("readonly",true).addClass("disabled");
			}else{
				$(this).closest('tr').find("input.delivery_number").attr("readonly",false).removeClass("disabled");
			}
		}).change();

		$("button[name='print_setting']").live("click",function(){
			var url = "../setting/popup_print_setting";
			var win = window.open(url,'print_setting','toolbar=no, scrollbars=yes, resizable=no, width=920, height=800');
		});


		//티켓상품 > 사용내역
		$("button[name='coupon_use_excel']").live("click",function(){
			if( $("input[name='use_regist_date[]']").eq(0).val() || $("input[name='use_regist_date[]']").eq(1).val()) {
				var searchdate = $("input[name='use_regist_date[]']").eq(0).val() + " ~ " + $("input[name='use_regist_date[]']").eq(1).val();
			}else{
				var searchdate = '';
			}
			ajaxexceldowncouponuse('/admin/export_process/coupon_use_excel', searchdate);
		});

		$("input[name='not_linkage_order']").live("change", function(){
			if($(this).is(":checked")){
				$("select[name='referer']").removeAttr('disabled');
			}else{
				$("select[name='referer']").attr('disabled',true);
			}
		}).change();

		$("button[name='openmarket_order_receive_guide']").live("click", function(){
			openDialog("외부 판매마켓 주문 자동수집 안내<span class='desc'></span>", "openmarket_order_receive_guide", {"width":"400","height":"200","show" : "fade","hide" : "fade"});
		});
		$("button[name='openmarket_service_guide']").live("click", function(){
			openDialog("다중 판매마켓 서비스 안내<span class='desc'></span>", "openmarket_service_guide", {"width":"400","height":"200","show" : "fade","hide" : "fade"});
		});

		$(".under_div_view").live("mouseover",function(){
			$(this).find("div.under_div_view_contents").removeClass("hide");
		}).live("mouseout",function(){
			$(this).find("div.under_div_view_contents").addClass("hide");
		});

		$(window).css('overflow', 'scroll');
		$(window).scroll(function(){
			//if	($(window).scrollTop() == ($(document).height() - $(window).height())){//일부브라우져에서 페이징오류로 개선 @2016-10-07 ysm
			if	((($(document).height() - $(window).height()) - $(window).scrollTop()) < 100 ){
				get_catalog_ajax();
			}
		});

		get_catalog_ajax();

		// 자동화 택배 송장번호 수정 방지 출고상세와 동일하게 처리 2021-07-09
		$("select.delivery_company_code").live("change",function(){
			disabled_dilivery_number(this);
		});
	});


	function get_catalog_ajax(){

		if	(loading_status == 'n'){
			loading_status	= 'y';
			var stepArrCnt			= stepArr.length;
			var addParam			= '';
			for (var s = 0; s < stepArrCnt; s++ ){
				if	(stepArr[s]){
					addParam	+= '&stepBox%5B'+s+'%5D='+stepArr[s];
				}
			}

			$("#ajaxLoadingLayer").ajaxStart(function() { loadingStop(this); });
			$.ajax({
				type: 'post',
				url: 'catalog_ajax',
				data: queryString +'&page='+npage+'&shipping_provider_seq='+shipping_provider_seq+'&bfStep='+nstep+'&nnum='+nnum+'&searchTime='+searchTime+addParam,
				dataType: 'html',
				success: function(result) {
					$(".export-ajax-list").append(result);
					$(".custom-select-box").customSelectBox();
					$(".custom-select-box-multi").customSelectBox({'multi':true});
					setDatepicker();
					help_tooltip();

					nstep	= $("#"+npage+"_step").val();
					nnum	= $("#"+npage+"_no").val();
					npage++;

					$("tr.pageoverflow").hide();
					if(nnum>0) loading_status	= 'n';

					$("select.delivery_company_code").each( function(){
						disabled_dilivery_number(this);
					});
				}
			});
			if(nnum>0)$("tr.pageoverflow:last").show();
		}
	}

	// 자동화 택배 송장번호 및 택배회사 변경 금지
	function disabled_dilivery_number(obj) {
		if($(obj).val() && $(obj).val().substring(0,5)=='auto_'){
			$("option",obj).not(":selected").attr("disabled",true);
			$(obj).parent().find("input.delivery_number").attr("readonly",true).addClass("disabled");
		}else{
			$(obj).parent().find("input.delivery_number").attr("readonly",false).removeClass("disabled");
		}
	}


	// 배송조회
	function goDeliverySearch(obj){
		var code	= $(obj).closest('tr').find('.delivery_company_code').val();
		var number	= $(obj).closest('td').find('.delivery_number').val();
		var provider= $(obj).closest('tr').find('.shipping_provider_seq').val();
		open_search_delivery(code, number, '', provider);
	}

	function ajaxexceldowncouponuse(url, searchdate){
			var inputs ='<input type="hidden" name="searchdate" value="'+ searchdate +'" />';
			jQuery('<form action="'+ url +'" method="post" target="actionFrame" >'+inputs+'</form>')
			.appendTo('body').submit().remove();
	}


	function ajaxexceldown(url, export_code, criteria, status){
			var inputs ='<input type="hidden" name="export_code" value="'+ export_code +'" />';
			inputs +='<input type="hidden" name="criteria" value="'+ criteria +'" />';
			inputs +='<input type="hidden" name="status" value="'+ status +'" />';
			jQuery('<form action="'+ url +'" method="post" target="actionFrame" >'+inputs+'</form>')
			.appendTo('body').submit().remove();
	}

	function set_date(start,end){
		$("input[name='regist_date[]']").eq(0).val(start);
		$("input[name='regist_date[]']").eq(1).val(end);
	}

	function use_set_date(start,end){
		$("input[name='use_regist_date[]']").eq(0).val(start);
		$("input[name='use_regist_date[]']").eq(1).val(end);
	}

	function closeExportPopup(){
		openDialogAlert("처리할 주문이 없습니다.", 400, 150, function(){closeDialog("goods_export_dialog");});
	}

	function invoice_export_resend(btnObj,export_code){
		$.ajax({
			'url' : '../export_process/invoice_export_resend',
			'data' : {'export_code':export_code},
			'success' : function(res){
				if(typeof res == 'string'){
					res = eval("("+res+")");
				}
				if(res.code=='success'){
					$(btnObj).parent().remove();
					$("input[name='delivery_number["+export_code+"]']").val(res.resultDeliveryNumber[0]);
				}
			}
		});
		return false;
	}

	//주문한 sns 계정 정보 확인
	function snsdetailview(m,snscd,mem_seq,no){

		var disp = $("div#snsdetailPopup"+no).css("display");
		$(".snsdetailPopup").hide();

		var obj	= $("div#snsdetailPopup"+no);
		if(obj.html() == ''){
			$.get('../member/sns_detail?snscd='+snscd+'&member_seq='+mem_seq+'&no='+no, function(data) {
				obj.html(data);
			});
		}

		if(disp == "none"){ obj.show(); }
	}

	function excoupon_use_btn(obj){
		var btnobj = $(obj);
		$.ajax({
			type: "post",
			url: "../export/coupon_use",
			data: "order_seq="+btnobj.attr('order_seq'),
			success: function(result){
				if	(result){
					$("#coupon_use_lay").html(result);
					openDialog("티켓사용 확인 / 티켓번호 재발송", "coupon_use_lay", {"width":"1100","height":"700"});
				}
			}
		});
	}

	// 사은품 지급 조건 상세
	function gift_use_log(order_seq,item_seq){

		$.ajax({
			type: "post",
			url: "../event/gift_use_log",
			data: "order_seq="+order_seq+"&item_seq="+item_seq,
			success: function(result){
				if	(result){
					$("#gift_use_lay").html(result);
					openDialog("사은품 이벤트 정보", "gift_use_lay", {"width":"500","height":"330"});
				}
			}
		});
	}

	//출고상태변경팝업
	function open_popup_export_status(url){
		var win = window.open(url,'export_popup','toolbar=no, scrollbars=yes, resizable=yes, width=1265, height=954');
		win.focus();
	}

	function batch_change_status(){
		var url = '../export/batch_status';
		open_popup_export_status(url);
	}

	function export_proc(status,rstatus) // status, rstatus:변경할리스트의상태
	{
		var ticket_exist = false;
		var export_code = new Array();
		var to_status = parseInt(status)+10;
		var url = '../export/batch_status';
		var checkObj = $("tr.step"+rstatus).find("input[type='checkbox'][name='export_code[]']:checked");
		checkObj.each(function(idx){
			if( $(this).attr('goods_kind') == 'coupon' ){
				ticket_exist = true;
			}
			export_code[idx] = $(this).val();
		});
		if(export_code.length == 0){
			alert('상태를 변경할 출고를 선택해주세요.');
			return false;
		}
		url += '?status='+rstatus;
		url += '&to_status='+to_status;
		var str_export_code = export_code.join('|');
		url += '&seq='+str_export_code;

		if( ticket_exist ){
			if( confirm('티켓상품이 포함된 출고는 제외하고 출고를 변경하실 수 있습니다.') ){
				open_popup_export_status(url);
			}
		}else{
			open_popup_export_status(url);
		}
	}

	/*######################## 16.12.15 gcs yjy : 검색조건 유지되도록 s */
	function exportView(seq){
		$("input[name='no']").val(seq);
		var search = location.search;
		search = search.substring(1,search.length);
		$("input[name='query_string']").val(search);
		$("form[name='search-form']").attr('action','view');
		$("form[name='search-form']").submit();
	}
	/*######################## 16.12.15 gcs yjy : 검색조건 유지되도록 e */