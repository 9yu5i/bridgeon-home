
	$(document).ready(function() {
		var arrSort = {
			'asc_goods_name': '상품명 순',
		//	'desc_goods_name': '상품명순↓',
			'desc_consumer_price': '정가 높은 순',
			'asc_consumer_price': '정가 낮은 순',
			'desc_price': '판매가 높은 순',
			'asc_price': '판매가 낮은 순',
			'desc_tot_stock': '재고 많은 순',
			'asc_tot_stock': '재고 적은 순',
			'desc_page_view': '조회수 많은 순',
			'asc_page_view': '조회수 적은 순',
			'desc_goods_seq': '최근 등록 순',
		//	'desc_goods_seq': '등록일순↓',
			'desc_update_date': '최근 수정 순',
		//	'desc_update_date': '수정일순↓',
		};

		if(typeof gl_goods_config.isSellerAdmin == "undefined") gl_goods_config.isSellerAdmin = '';

		var adminpage 		= 'admin/';
		var sellerAdminMode = false;

		if(gl_goods_config.isSellerAdmin) {
			adminpage = 'selleradmin/';
			sellerAdminMode = true;
		}

		if(typeof batchModify != "undefined" && batchModify === true) {
			gSearchForm.init({'pageid':adminpage+'goods/catalog','sc':scObj,'displaySort':arrSort, 'formEditorUse':true,'searchFormEditView':true,'sellerAdminMode':sellerAdminMode});
		} else if(typeof gift != "undefined" && gift === true) {

			var arrSort = {
				'asc_goods_name': '상품명 순',
				'desc_consumer_price': '정가 높은 순',
				'asc_consumer_price': '정가 낮은 순',
				'desc_tot_stock': '재고 많은 순',
				'asc_tot_stock': '재고 적은 순',
				'desc_goods_seq': '최근 등록 순',
				'desc_update_date': '최근 수정 순',
			};

			gSearchForm.init({'pageid':'gift_catalog','sc':scObj,'displaySort':arrSort, 'formEditorUse':false,'searchFormEditView':true,'sellerAdminMode':sellerAdminMode});
		} else {
			gSearchForm.init({'pageid':location.pathname.substring(1),'sc':scObj,'displaySort':arrSort,'sellerAdminMode':sellerAdminMode});
		}
		

        // 카테고리/브랜드/지역 : 미등록 클릭 시 이벤트
		$(".not_regist").on("click",function(e,mode){
			if($(this).is(":checked") === true || mode == 'checked'){
                $(this).closest("td").find("input:checkbox").not($(this)).prop("checked",false).prop("disabled",true);
				$(this).closest("td").find("select").prop("disabled",true);
			}else{
                $(this).closest("td").find("input:checkbox").prop("disabled",false);
				$(this).closest("td").find("select").prop("disabled",false);
			}
		});

		if(scObj.goods_category_no) $("input[name='goods_category_no']").prop("checked",false).trigger('click',['checked']);
		if(scObj.goods_brand_no) $("input[name='goods_brand_no']").prop("checked",false).trigger('click',['checked']);
		if(scObj.goods_location_no) $("input[name='goods_location_no']").prop("checked",false).trigger('click',['checked']);

		$("select[name='stock_compare']").on("change",function(){
			var viewObj = $(this).closest("td").find("span");
            if($.inArray($(this).val(),['stock','safe']) != -1 ){
				viewObj.show();
			}else if($(this).val() == 'greater'){
				viewObj.eq(0).show();
				viewObj.eq(1).hide();
            }else{
				viewObj.hide();
            }
		}).trigger("change");

		// 이벤트 타입 선택에 따라 select 노출
		$("select[name='event_type']").on("change",function(){
			$(this).closest("td").find("select").not("select[name='event_type']").hide();
			$(this).closest("td").find("select."+$(this).val()).show();
		});

        // 키워드 검색 항목별 노출
        $("select[name='search_field']").on('change',function(){
            $(".search_keyword").hide();
            if($.inArray($(this).val(),['weight','page_view']) != -1 ){
                $(".search_keyword."+$(this).val()).show();
            }else{
                $(".search_keyword.keyword").show();
            }
        }).trigger("change");

		$(".color-check label input").on("change", function(){
			if ($(this).is(':checked'))
				$(this).parents().addClass("active");
			else
				$(this).parents().removeClass("active");
		});

		if(socialcpuse_flag == true){
			/* 티켓상품그룹 찾기버튼 */
			$("button.coupon_group_search").click(function() {
				var group_seq = ($("#social_goods_group").val())?$("#social_goods_group").val():'0';
				addFormDialog('./social_goods_group?type=list&sel_group_seq='+group_seq, '700', '450', '티켓상품그룹 찾기 ','false');
			});

			$("input[name='social_goods_group_search']").click(function() {
				if($("input[name='social_goods_group_search']:checked").val()==""){
					$("#social_goods_group").val("");
					$("#social_goods_group_name").val("");
					$("#social_goods_group_name").prop("disabled",true);
				} else {
					$("#social_goods_group_name").prop("disabled",false);
				}
			});

			if($("input[name='social_goods_group_search']:checked").val()=="") {
				$("#social_goods_group_name").prop("disabled",true);
			}

			//티켓상품그룹 선택시
			$(".social_goods_group_sel").live("click",function(){
				var social_goods_group_seq = $(this).attr("social_goods_group_seq");
				var social_goods_group_name = $(this).attr("social_goods_group_name");
				$("#social_goods_group").val(social_goods_group_seq);
				$(".social_goods_group_name").val(social_goods_group_name);
				$('#dlg').dialog('close');
			});
		}

		/* 카테고리 불러오기 */
		category_admin_select_load('','category1','',function(){
			if(scObj.category1){
				$("select[name='category1']").val(scObj.category1).change();
			}
		});
		$("select[name='category1']").bind("change",function(){
			category_admin_select_load('category1','category2',$(this).val(),function(){
				if(scObj.category2){
					$("select[name='category2']").val(scObj.category2).change();
				}
			});
			category_admin_select_load('category2','category3',"");
			category_admin_select_load('category3','category4',"");
		});
		$("select[name='category2']").bind("change",function(){
			category_admin_select_load('category2','category3',$(this).val(),function(){
				if(scObj.category3){
					$("select[name='category3']").val(scObj.category3).change();
				}
			});
			category_admin_select_load('category3','category4',"");
		});
		$("select[name='category3']").bind("change",function(){
			category_admin_select_load('category3','category4',$(this).val(),function(){
				if(scObj.category4){
					$("select[name='category4']").val(scObj.category4).change();
				}
			});
		});

		$("select[name='s_category1']").bind("change",function(){
			category_admin_select_load('s_category1','s_category2',$(this).val(),function(){
				if(scObj.category2){
					$("select[name='s_category2']").val(scObj.category2).change();
				}
			});
			category_admin_select_load('category2','category3',"");
			category_admin_select_load('category3','category4',"");
		});
		$("select[name='s_category2']").bind("change",function(){
			category_admin_select_load('s_category2','s_category3',$(this).val(),function(){
				if(scObj.category3){
				$("select[name='s_category3']").val(scObj.category3).change();
				}
			});
			category_admin_select_load('s_category3','s_category4',"");
		});
		$("select[name='s_category3']").bind("change",function(){
			category_admin_select_load('s_category3','s_category4',$(this).val(),function(){
				if(scObj.category4){
				$("select[name='s_category4']").val(scObj.category4).change();
				}
			});
		});
		////////////////////////////

		/* 브랜드 불러오기 */
		brand_admin_select_load('','brands1','',function(){
			if(scObj.brands1){
				$("select[name='brands1']").val(scObj.brands1).change();
			}
		});
		$("select[name='brands1']").bind("change",function(){
			brand_admin_select_load('brands1','brands2',$(this).val(),function(){
				if(scObj.brands2){
					$("select[name='brands2']").val(scObj.brands2).change();
				}
			});
			brand_admin_select_load('brands2','brands3',"");
			brand_admin_select_load('brands3','brands4',"");
		});
		$("select[name='brands2']").bind("change",function(){
			brand_admin_select_load('brands2','brands3',$(this).val(),function(){
				if(scObj.brands3){
					$("select[name='brands3']").val(scObj.brands3).change();
				}
			});
			brand_admin_select_load('brands3','brands4',"");
		});
		$("select[name='brands3']").bind("change",function(){
			brand_admin_select_load('brands3','brands4',$(this).val(),function(){
				if(scObj.brands4){
					$("select[name='brands4']").val(scObj.brands4).change();
				}
			});
		});
		$("select[name='s_brands1']").bind("change",function(){
			brand_admin_select_load('s_brands1','s_brands2',$(this).val(),function(){
				if(scObj.brands2){
				$("select[name='s_brands2']").val(scObj.brands2).change();
				}
			});
			brand_admin_select_load('s_brands2','s_brands3',"");
			brand_admin_select_load('s_brands3','s_brands4',"");
		});
		$("select[name='s_brands2']").bind("change",function(){
			brand_admin_select_load('s_brands2','s_brands3',$(this).val(),function(){
				if(scObj.brands3){
				$("select[name='s_brands3']").val(scObj.brands3).change();
				}
			});
			brand_admin_select_load('s_brands3','s_brands4',"");
		});
		$("select[name='s_brands3']").bind("change",function(){
			brand_admin_select_load('s_brands3','s_brands4',$(this).val(),function(){
				if(scObj.brands4){
				$("select[name='s_brands4']").val(scObj.brands4).change();
				}
			});
		});

		/* 지역 불러오기 */
		location_admin_select_load('','location1','',function(){
			if(scObj.location1){
				$("select[name='location1']").val(scObj.location1).change();
			}
		});
		$("select[name='location1']").bind("change",function(){
			location_admin_select_load('location1','location2',$(this).val(),function(){
				if(scObj.location2){
					$("select[name='location2']").val(scObj.location2).change();
				}
			});
			location_admin_select_load('location2','location3',"");
			location_admin_select_load('location3','location4',"");
		});
		$("select[name='location2']").bind("change",function(){
			location_admin_select_load('location2','location3',$(this).val(),function(){
				if(scObj.location3){
					$("select[name='location3']").val(scObj.location3).change();
				}
			});
			location_admin_select_load('location3','location4',"");
		});
		$("select[name='location3']").bind("change",function(){
			location_admin_select_load('location3','location4',$(this).val(),function(){
				if(scObj.location4){
					$("select[name='location4']").val(scObj.location4).change();
				}
			});
		});
		$("select[name='s_location1']").bind("change",function(){
			location_admin_select_load('s_location1','s_location2',$(this).val(),function(){
				if(scObj.location2){
					$("select[name='s_location2']").val(scObj.location2).change();
				}
			});
			location_admin_select_load('s_location2','s_location3',"");
			location_admin_select_load('s_location3','s_location4',"");
		});
		$("select[name='s_location2']").bind("change",function(){
			location_admin_select_load('s_location2','s_location3',$(this).val(),function(){
				if(scObj.location3){
					$("select[name='s_location3']").val(scObj.location3).change();
				}
			});
			location_admin_select_load('s_location3','s_location4',"");
		});
		$("select[name='s_location3']").bind("change",function(){
			location_admin_select_load('s_location3','s_location4',$(this).val(),function(){
				if(scObj.location4){
					$("select[name='s_location4']").val(scObj.location4).change();
				}
			});
		});

		$(".star_select").click(function(){
			var status = "";
			if($(this).hasClass("checked")){
				$(this).removeClass("checked");
				status = "none";
			}else{
				$(this).addClass("checked");
				status = "checked";
			}

			$.ajax({
				type: "get",
				url: "../goods/set_favorite",
				data: "status="+status+"&goods_seq="+$(this).attr("goods_seq"),
				success: function(result){
					//alert(result);
				}
			});
		});

		//가격대체문구 사용 체크
		$("input[name='string_price_use[1]']").click(function(){
			if($(this).is(":checked")){
				$(".string_price_checkbox").each(function(idx) {
					$(".string_price_checkbox").eq(idx).attr("disabled", false);
				});
			}else{
				$(".string_price_checkbox").each(function(idx) {
					$(".string_price_checkbox").eq(idx).attr("checked", false);
					$(".string_price_checkbox").eq(idx).attr("disabled", true);
				});
			}
		});


		// 매입처/입점사 검색선택
		$("input[name='provider_base']").bind('change',function(){
			if($(this).is(":checked")){
				$("select[name='provider_seq']").attr('disabled',true);
			}else{
				$("select[name='provider_seq']").removeAttr('disabled');
			}
		}).change();

		// 아이콘 검색
		$(".s_btn_search_icon").click(function(){
			$("#chk_icon").val('detail');
		});

		$(".btn_search_icon_new").click(function(){
			$("#chk_icon").val('list');
		});

		$(".btn_search_icon_new, .s_btn_search_icon").bind("click", function(){
			var height = $("div#goodsSearchIconPopup").height()+130;
			var icon_obj;

			if ($("input[name='select_search_icon']")) {
				icon_obj = $("input[name='select_search_icon']");
			} else {
				icon_obj = $("#set_search_detail");
				
			}		

			if($(this).hasClass('btn_search_icon_new')) height="400"

			$('[name="goodsIconCode[]"]:checked').removeAttr('checked');
			var splitCode = icon_obj.val().split(",");
			for (var idx_=0, idxCnt = splitCode.length; idx_ < idxCnt; idx_++)
			{
				$("input[name='goodsIconCode[]'][value='" + splitCode[idx_] + "']").attr("checked", true);
			}

			openDialog("아이콘 검색", "goodsSearchIconPopup", {'width':500,'height':height,'show':'fade','hide' : 'fade'});
		});

		$("#btn_select_icon").bind("click", function(){
			var str = [], str_val = "", str_msg = "";
			var count=0;
			$(".goodsIconCode").each(function (idx) {
				if($(this).is(":checked")){
					str[count] = $(this).val() ;
					count++;
				}
			});
			str_val = str.join();

			if(count > 0){
				str_msg += count+"개 선택";
			}

			if ($("#chk_icon").val()=='detail') {
				$("#set_search_detail input[name=select_search_icon]").val(str_val);
				$("#set_search_detail .msg_select_icon").text(str_msg);
			} else {
				$("#goodsForm input[name=select_search_icon]").val(str_val);
				$("#goodsForm .msg_select_icon").text(str_msg);

				// 일괄업데이트 페이지
				$("#search_goods_form input[name=select_search_icon]").val(str_val);
				$("#search_goods_form .msg_select_icon").text(str_msg);
			}
			closeDialog('goodsIconPopup');
		});

		$("#btn-reset").on("click", function(event){
			event.preventDefault();
			var obj = $(this).closest('form .search-form-container');

			obj.find('select, textarea, input[type=text]').val('');
			obj.find('input:radio, input:checkbox').removeAttr('checked').removeAttr('selected');

			// 아이콘 검색
			obj.find(".msg_select_icon").text('');

			var chk_except = false;
			obj.find('input:text, input:hidden').each(function() {
				chk_except = false;
				if (this.name == 'malllist[]') chk_except = true;
				if (this.name == 'show_search_form') chk_except = true;

				if (this.name != '') {
					if (!chk_except) $(this).val('');
				} else {
					// - 입점사 검색 - 셀렉트박스 제외
					$(this).val('');
					$(this).val($("select[name='provider_seq_selector'] option:first-child").text());
				}
			});
			$('.search_type_text').hide();

			$('select[name="shipping_group_seq"]').trigger('change');
			$('input[name="color_pick[]"]').attr('checked', false);
			$('#goodsForm input[name="color_pick[]"]').parent().removeClass('active');
		});

		if(scObj.goods_addinfo){
			$("#goodsForm select[name='goods_addinfo']").val(scObj.goods_addinfo);
			if(scObj.goods_addinfo != 'direct'){
				$('#'+scObj.goods_addinfo+'_sel > select > option[value="'+scObj.goods_addinfo_title+'"]').attr('selected', true);
			}
		}

		if(scObj.goodsaddinfo){
			$('#'+scObj.goods_addinfo+'_sel > select > option').attr('selected', false);
			$('#'+scObj.goods_addinfo+'_sel > select > option[value="'+scObj.goods_addinfo_title+'"]').attr('selected', true);
		}

		$(".msg_select_icon").text("");

		if(scObj.select_search_icon){
			var splitCode = $("input[name=select_search_icon]").val().split(",");
			$(".msg_select_icon").text(splitCode.length+"개 선택");

			for (i = 0, cnt = splitCode.length; i < cnt; i++) {
				$("input[name='goodsIconCode[]'][value='" + splitCode[i] + "']").attr("checked", true);
			}
		}

		// 검색어 레이어 박스 : start
		$("#search_keyword").keyup(function () {
			if ($(this).val()) {
				$('.txt_keyword').text($(this).val());
				searchLayerOpen();
			}else{
				$('.searchLayer').hide();
			}
		});

		$("#search_keyword").focus(function () {
			if ($(this).val() && $(this).val()!=$(this).attr('title')) {
				$('.txt_keyword').text($(this).val());
				searchLayerOpen();
			}
		});


		/* 검색 keyword 
			$("a.link_keyword").click(function () {
				var sType = $(this).attr('s_type');
				$('#search_type').val(sType);
				$('.searchLayer').hide();
				{? preg_match('/goods\/batch_modify/',_SERVER.REQUEST_URI)}
					$("form[name='search_goods_form']").submit();
				{:}
					$("form[name='goodsForm']").submit();
				{/}
			});

			$("#search_keyword").blur(function(){
				if("{_GET.keyword}" == $("#search_keyword").val()){
					$(".search_type_text").show();
				}
				setTimeout(function(){
					$('.searchLayer').hide()}, 500
				);
			});

			var offset = $("#search_keyword").offset();
			$('.search_type_text').css({
				'position' : 'absolute',
				'z-index' : 1,
				'left' : 0,
				'top' : 0,
				'width':$("#search_keyword").width()-1,
				'height':$("#search_keyword").height()-5
			});

			{? _GET.search_type}
				$('.search_type_text').show();
			{/}

			$(".search_type_text").click(function () {
				$(".search_type_text").hide();
				$("#search_keyword").focus();
			});

			$(".searchLayer ul li").hover(function() {
				$(".searchLayer ul li").removeClass('hoverli');
				$(this).addClass('hoverli');
			});

			$("#search_keyword").keydown(function (e) {
				var searchbox = $(this);

				switch (e.keyCode) {
					case 40:
						if($('.searchUl').find('li.hoverli').length == 0){
							$('.searchUl').find('li:first-child').addClass('hoverli');
						}else{
							if($('.searchUl').find('li:last-child').hasClass("hoverli") ){
								$('.searchUl').find('li::last-child.hoverli').removeClass('hoverli');
								$('.searchUl').find('li:first-child').addClass('hoverli');
							}else{
								$('.searchUl').find('li:not(:last-child).hoverli').removeClass('hoverli').next().addClass('hoverli');
							}
						}
						break;
					case 38:
						if($('.searchUl').find('li.hoverli').length == 0){
							$('.searchUl').find('li:last-child').addClass('hoverli');
						}else{
							if($('.searchUl').find('li:first-child').hasClass("hoverli")){
								$('.searchUl').find('li::first-child.hoverli').removeClass('hoverli');
								$('.searchUl').find('li:last-child').addClass('hoverli');
							}else{
								$('.searchUl').find('li:not(:first-child).hoverli').removeClass('hoverli').prev().addClass('hoverli');
							}
						}
						break;
					case 13 :
						var index=0;
						$('.searchUl').find('li').each(function(){
							if($(this).hasClass("hoverli")){
								index=$(this).index();
							}
						});

						$('.searchUl').find('li>a').eq(index).click();
						e.keyCode = null;
						//return false;
						break;
				}
			});
			// 검색어 레이어 박스 : end
		*/

		/*
		$("#btn_search_detail").click(function () {
			if ($(this).attr('class')=='close') {
				setSearchDetail('close');
			} else if ($(this).attr('class')=='open') {
				setSearchDetail('open');
			}
		});

		{? _GET.show_search_form}
			setSearchDetail('{_GET.show_search_form}');
		{: gdsearchdefault.search_form_view}
			setSearchDetail('{gdsearchdefault.search_form_view}');
		{:}
			setSearchDetail('open');
		{/}
		*/

		$("#goodsForm select[name='goods_addinfo']").change(function(){goods_addinfo_ctrl();});

		$("#goodsForm select[name='commission_type_sel']").on("change", function(){
            if($(this).val() != ''){
                $('.commission_defail').show();
    			$('.commission_unit').text($(this).find("option:selected").attr('data-currency_symbol'));
            }else{
                $('.commission_defail').hide();
                $("input[name='s_commission_rate']").val('');
                $("input[name='e_commission_rate']").val('');
            }
		}).trigger("change");

		$("#goodsForm select[name='provider_seq_selector']").css({'width': 125}).combobox()
			.change(function(){

				var selectedProviderSeq	= $(this).val();

				if( selectedProviderSeq > 0 ){
					$("#goodsForm input[name='provider_seq']").val(selectedProviderSeq);
					$("#goodsForm input[name='provider_name']").val($("option:selected",this).text());
				}else{
					$("#goodsForm input[name='provider_seq']").val('');
					$("#goodsForm input[name='provider_name']").val('');
				}

				$('#goodsForm select[name="shipping_group_seq"]').val('');
				if (selectedProviderSeq > 0) {
					$('#goodsForm select[name="shipping_group_seq"] > option:gt(0)').addClass('hide');
					$('#goodsForm select[name="shipping_group_seq"] > option[shipping_provider_seq= ' + selectedProviderSeq + ']').removeClass('hide');
				} else {
					$('#goodsForm select[name="shipping_group_seq"] > option').removeClass('hide');
				}

				// 입점사 검색일 경우
				if(selectedProviderSeq > 1){
					$('#goodsForm select[name="shipping_group_seq"] option:last').removeClass('hide');
				}else{
					$('#goodsForm select[name="shipping_group_seq"] option:last').addClass('hide');
				}

				$('#goodsForm select[name="commission_type_sel"]').prop("disabled",false);
				// 본사 검색일 경우
				if(selectedProviderSeq == 1) {
					$('#goodsForm select[name="commission_type_sel"]').prop("disabled",true);
				}
			}).next(".ui-combobox").children("input").css({'width': 125})
			.bind('focus',function(){
				if($(this).val()==$( "#goodsForm select[name='provider_seq_selector'] option:first-child" ).text()){
					$(this).val('');
				}
			})
			.bind('mouseup',function(){
				if($(this).val()==''){
					$( "#goodsForm select[name='provider_seq_selector']").next(".ui-combobox").children("a.ui-combobox-toggle").click();
				}
		});

		$("#stock-wh-info .btn_close").on("click",function(){
			alert("click");
			$("#stock-wh-info").dialog("close");
		});

		$('#goodsForm select[name="shipping_group_seq"]').change(function(){

			if($(this).val() != '' && $(this).val() != 'all'){
				$("select[name='shipping_set_code[domestic]']").prop("disabled",true).parent().addClass('hide');
				$("select[name='shipping_set_code[international]']").prop("disabled",true).parent().addClass('hide');
			}else{
				$("select[name='shipping_set_code[domestic]']").prop("disabled",false).parent().removeClass('hide');
				$("select[name='shipping_set_code[international]']").prop("disabled",false).parent().removeClass('hide');
			}

			/*
			$('#domesticShippingList').hide();
			$('#internationalShippingList').hide();
			$('#domesticShippingInfo').hide();
			$('#internationalShippingInfo').hide();

			if (this.value == ''){
				$('#domesticShippingList').show();
				$('#internationalShippingList').show();
			} else {
				var $selectedGroupSeq	= $('#goodsForm select[name="shipping_group_seq"] > option:selected');
				$('#domesticShippingInfo').html($selectedGroupSeq.attr('koreaMethodDesc'));
				$('#internationalShippingInfo').html($selectedGroupSeq.attr('globalMethodDesc'));
				$('#domesticShippingInfo').show();
				$('#internationalShippingInfo').show();
			}
			*/


		});

		$('#goodsForm .colorMultiCheck').on('click', function(e,mode){
			var data_field = $(this).attr("data_field");
			if(typeof(data_field) == "undefined") data_field = "";

			if(typeof mode == 'undefined') mode = '';

			if ($('#goodsForm input[name="'+data_field+'color_pick[]"]:not(:checked)').length < 1 || mode == 'unchecked') {
				$('#goodsForm input[name="'+data_field+'color_pick[]"]').attr('checked', false);
				$('#goodsForm input[name="'+data_field+'color_pick[]"]').parent().removeClass('active');
			} else {
				$('#goodsForm input[name="'+data_field+'color_pick[]"]').attr('checked', true);
				$('#goodsForm input[name="'+data_field+'color_pick[]"]').parent().addClass('active');
			}
		});

		$('#goodsForm select[name="shipping_group_seq"]').trigger('change');
		$('#goodsForm select[name="stock_compare"]').trigger('change');

		/*
		$('input.search_provider_status').on('click', function(){
			if(Number($(this).val()) > 0) {
				$('select[name="provider_status_reason_type[]"]').attr('checked', false);
			}
		});
		*/

		// 미승인 추가검색 select 변경 시 '미승인' 자동 선택
		$('select[name="provider_status_reason_type"]').on('change', function(){
			$('input.search_provider_status').attr('checked', false);
			$('input.search_provider_status:eq(2)').attr('checked', true);
		});
		
		// 오픈마켓 연동 검색
		initMarket("goodsForm",scObj.market,scObj.sellerId);

		$("#chkAll").click(function(){
			if($(this).is(":checked")){
				$("input[name='goods_seq[]']").attr('checked',true);
			}else{
				$("input[name='goods_seq[]']").removeAttr('checked');
			}
		});		
	});
	// 오픈마켓 연동 설정
	function initMarket(form,market,sellerId){
		$("#"+form+" "+"#selMarket").unbind("change");
		$("#"+form+" "+"#selMarket").bind("change", function(){
			setMarketId(form);
		});
		if(market!=""){
			$("#"+form+" "+"#selMarket").val(market);
			setMarketId(form,sellerId);
		}
	}
	// 오픈마켓 상점 아이디 설정
	function setMarketId(form,marketId){
		if(typeof marketId === "undefined"){marketId = "";}
		// 초기화
		var initOption = $("<option/>").val("").html("관리자아이디");
		$("#"+form+" "+"#selMarketUserId").children().remove();			
		$("#"+form+" "+"#selMarketUserId").append(initOption);

		// 아이디 설정
		var sellerList = $("#"+form+" "+"#selMarket > option:selected").data("sellerList");
		for(var i in sellerList){
			if(typeof sellerList[i] !== "function"){
				var selected = "";
				if(marketId == sellerList[i]){
					selected = " selected ";
				}
				var subOption = $("<option value='"+sellerList[i]+"'"+selected+">"+sellerList[i]+"</option>");	
				$("#"+form+" "+"#selMarketUserId").append(subOption);
			}
		}
	}
	function goods_addinfo_ctrl(){
		var nowSelected	= $("select[name='goods_addinfo'] > option:selected");
		var addtype		= $(nowSelected).attr('addtype');

		$('.goodsaddinfo_select').hide();
		$('.goodsaddinfo_direct').hide();
		$('.goodsaddinfo_select > select').attr('disabled', true);
		$('.goodsaddinfo_direct > input').attr('disabled', true);

		if(addtype == 'select'){
			$('#' + nowSelected.val() + '_sel').show();
			$('#' + nowSelected.val() + '_sel > select').attr('disabled', false);
			$('#' + nowSelected.val() + '_sel > select').width(97);
		}else if(addtype == 'direct'){
			$('.goodsaddinfo_direct > input').attr('disabled', false);
			$('.goodsaddinfo_direct').show();
		}
	}

	function setSearchDetail(type) {
		if (type=='close') {
			$("#show_search_form").val('close');
			$("#btn_search_detail").removeClass("close").addClass("open");
			$(".search_detail_form").hide();
		} else if (type=='open') {
			$("#show_search_form").val('open');
			$("#btn_search_detail").removeClass("open").addClass("close");
			$(".search_detail_form").show();
		}
	}

	function searchLayerOpen(){
		var offset = $("#search_keyword").offset();
		if( offset) {
			$('.searchLayer').css({
				'position' : 'absolute',
				'z-index' : 999,
				'left' : -1,
				'top' : '100%',
				'width':$("#search_keyword").width()
			}).show();
		}
	}

	function set_date(start,end){
		$("input[name='sdate']").val(start);
		$("input[name='edate']").val(end);
	}

	// 미승인 사유 상세 설명
	function openProviderStatusReasonDetail(reasonNum){
		if	(!reasonNum)	reasonNum	= 3;
		$("#provider_status_reason_detail_lay").find(".reason-list").hide();
		$("#provider_status_reason_detail_lay").find(".reason-"+reasonNum).show();
		openDialog("상품 수정 시 자동 미승인 처리 기준", 'provider_status_reason_detail_lay', {'width':600,'height':260});
	}

	// 재고
	function select_stock_compare(mode)
	{
		var sobj = $("select#stock_compare");
		if( mode == 'default' ){
			sobj = $("select#stock_default_compare");
		}
		sobj.parent().find("span").eq(0).addClass("hide");
		sobj.parent().find("span").eq(1).addClass("hide");

		if(sobj.val() == 'greater'){
			sobj.parent().find("span").eq(0).removeClass("hide");
			sobj.parent().find("span").eq(1).addClass("hide");
		}
		if(sobj.val() == 'stock'){
			sobj.parent().find("span").eq(0).removeClass("hide");
			sobj.parent().find("span").eq(1).removeClass("hide");
		}
		if(sobj.val() == 'safe'){
			sobj.parent().find("span").eq(0).removeClass("hide");
			sobj.parent().find("span").eq(1).removeClass("hide");
		}
	}
	
	// 사은품 상세페이지
	/*
	function goodsView(seq){
		$("input[name='no']").val(seq);
		var search = location.search;
		search = search.substring(1,search.length);
		$("input[name='query_string']").val(search);
		$("form[name='goodsForm']").attr('action','gift_regist');
		$("form[name='goodsForm']").submit();
	}
	*/
	