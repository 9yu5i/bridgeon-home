$(function(){
	displayTabGoodsContainerClone = $(".displayTabGoodsContainer",$('.pc_tab_div')).last().clone();
	displayTabGoodsContainerClone.find(".daumeditor").removeClass('daumeditor').addClass('daumeditorClone');
	m_displayTabGoodsContainerClone = $(".displayTabGoodsContainer",$('.mobile_tab_div')).last().clone();
	m_displayTabGoodsContainerClone.find(".daumeditor").removeClass('daumeditor').addClass('daumeditorClone');

	if	(!gl_popup) {
		if	(gl_template_path && gl_display_seq) {
			parent.DM_window_title_set("left","<a href=\"javascript:;\" onmouseup=\"DM_window_sourceeditor('"+gl_template_path+"','\{=showDesignDisplay("+gl_display_seq+")\}')\">◀ 상품디스플레이 영역의 HTML소스보기</a>");
			parent.DM_window_title_set("title","상품디스플레이 변경");
		}else{
			parent.DM_window_title_set("title","상품디스플레이 만들기");
		}
		parent.DM_window_title_set("center",gl_tpl_desc+"("+gl_tpl_path+")에 선택한 ");
	}

	if	(gl_platform=='mobile'){
		/* 노출개수 합계 표시 */
		$("input[name='count_w'],input[name='count_h'],input[name='count_w_lattice_b']").bind('change',function(){
			var count_w = num($("input[name='count_w']").val());
			var count_h = num($("input[name='count_h']").val());
			if(!count_w) {
				count_w = gl_count_w_lattice_a;
				$("input[name='count_w']").val(count_w);
			}
			if(!count_h) {count_h = 1; $("input[name='count_h']").val(count_h);}

			$(".count_total").html(count_w*count_h);
		}).eq(0).change();
	}else{
		$('.display_count_wrap input[type="text"]').bind('change',function(){
			var style_type = $(this).attr('attr');
			var total_name = '';
			switch(style_type){
				case 'lattice_a':
					total_name		= 'count_total';
					count_w			= num($('input[name="count_w"]').val());
					count_h			= num($('input[name="count_h"]').val());
					if	(!count_w) {
						count_w		= gl_count_w_lattice_a;
						$('input[name="count_w"]').val(count_w);
					}
					if	(!count_h) {
						count_h		= 1;
						$('input[name="count_w"]').val(count_h);
					}
				break;
				case 'lattice_b':
					total_name		= 'lattice_b_count_total';
					count_w			= num($('input[name="count_w_lattice_b"]').val());
					count_h			= num($('input[name="count_h_lattice_b"]').val());
				break;
				case 'list':
					total_name		= 'h_list_count_total';
					count_w			= 1;
					count_h			= num($('input[name="count_h_list"]').val());
				break;
				case 'rolling_h':
					total_name		= 'w_rolling_count_total';
					count_w			= num($('input[name="count_w_rolling_h"]').val());
					count_h			= num($('input[name="count_h_rolling_h"]').val());
				break;
				case 'rolling_v':
					total_name		= 'h_rolling_count_total';
					count_w			= num($('input[name="count_w_rolling_v"]').val());
					count_h			= num($('input[name="count_h_rolling_v"]').val());
				break;
			}

			$('.'+total_name).html(count_w*count_h);
		}).change();
	}

	$("input[name='count_w_swipe'],input[name='count_h_swipe']").bind('change',function(){
		var count_w = num($("input[name='count_w_swipe']").val());
		var count_h = num($("input[name='count_h_swipe']").val());
		$(".count_total_swipe").html(count_w*count_h);
	}).eq(0).change();

	/* 컬러피커 */
	$(".colorpicker").customColorPicker();

	changeFileStyle();

	/* 저장버튼 */
	$("form[name='displayManagerForm']").submit(function(){
		$("input[name='auto_goods_seqs[]']").each(function(i){
			var arr = new Array();
			$("input[name='displayGoods"+i+"[]']",$(this).closest(".displayTabGoodsContainer")).each(function(){
				arr.push($(this).val());
			});
			$(this).val(arr.join(','));
		});

		$("input[name='m_auto_goods_seqs[]']").each(function(i){
			var arr = new Array();
			$("input[name='m_displayGoods"+i+"[]']",$(this).closest(".displayTabGoodsContainer")).each(function(){
				arr.push($(this).val());
			});
			$(this).val(arr.join(','));
		});

		if($("input[name='style']:checked").val()=='rolling_h' && $("input[name='tab_title[]']").length>1){
			openDialogAlert("수평롤링형에는 탭을 사용할 수 없습니다.",400,140,function(){});
			return false;
		}

		if($("input[name='style']:checked").val()=='rolling_h' && $("select[name='contents_type[]']").eq(0).val()=='text'){
			openDialogAlert("수평롤링형에는 직접입력노출을 사용할 수 없습니다.",400,140,function(){});
			return false;
		}

		// 카테고리페이지에서 모바일 디스플레이가 격자형(반응형) 인 경우 페이징 사용할 수 없음 2018-07-24
		if($("input[name='m_style']:checked").val()=="lattice_responsible" && $("select[name='m_list_paging_use']").eq(0).val()=='y') {
			openDialogAlert("격자형(반응형)에는 페이징을 사용할 수 없습니다.<br/> 페이징을 사용하시려면 격자형(개수고정)을 이용해주세요.",400,140,function(){});
			return false;
		}

		$(".displayTabMakePopupInner").hide().appendTo($("form[name='displayManagerForm']"));
		$(".m_displayTabMakePopupInner").hide().appendTo($("form[name='displayManagerForm']"));

		submitEditorForm(this);

		return false;
	});

	/* 탭 만들기 버튼 */
	$("#btnDisplayTabPopup").click(function(){
		$(".displayTabMakePopupInner").show().appendTo($("#displayTabMakePopup"));
		if(typeof gl_operation_type != 'undefined' && gl_operation_type == 'light'){ // light 형태 구분 :: 2018-11-26 lwh
			openDialog("탭 만들기/수정", "#displayTabMakePopup", {"width":"500","height":"350","show" : "fade","hide" : "fade"});
		}else{
			openDialog("탭 만들기/수정", "#displayTabMakePopup", {"width":"700","height":"500","show" : "fade","hide" : "fade"});
		}
	});

	$("#m_btnDisplayTabPopup").click(function(){
		$(".m_displayTabMakePopupInner").show().appendTo($("#m_displayTabMakePopup"));
		openDialog("탭 만들기/수정", "#m_displayTabMakePopup", {"width":"700","height":"500","show" : "fade","hide" : "fade"});
	});

	var makeTabSampleHtml = function(this_platform){
		if(this_platform != undefined){
			this_div		= $('.'+this_platform+'_tab_div'); //부모 창
			this_popup		= $('.'+this_platform+'_tab_popup'); //탭 만들기 팝업창
			if(this_platform == 'pc'){
				if($(".displayTabMakeInputs input[name='popup_tab_title[]']",this_popup).length>1){
					var displayTabKind = $("input[name='popup_tab_design_kind']:checked",this_popup).val();
					var displayTabType = displayTabKind=='image' ? 'displayTabTypeImage' : $("input[name='popup_tab_design_type']:checked",this_popup).val();

					var html = '<input type="hidden" name="tab_design_type" value="'+displayTabType+'" />';
					html += '<ul class="'+displayTabType+'" style="display:inline-block;vertical-align:middle">';
					$(".displayTabMakeInputs input[name='popup_tab_title[]']",this_popup).each(function(i){
						if(i==0)	html += '<li class="current">';
						else		html += '<li>';
						html += '<input type="hidden" name="tab_title[]" value="'+$(this).val()+'" />';
						html += $(this).val()+'</li>';
					});
					html += '</ul>';
					$(".strTab",this_div).show();
					if(displayTabKind=='image'){
						html += '<span class="fx11 red">이미지 타입은 미리보기를 지원하지 않습니다.</span>';
						$(".displayTabContainer",this_div).html(html);
						$(".displayTabContainer ."+displayTabType,this_div).hide();
					}else{
						$(".displayTabContainer",this_div).html(html);
					}
				}else{
					$(".strTab",this_div).hide();
					$(".displayTabContainer",this_div).html("<span class='desc'>탭 없음</span>");
				}

				if($(".displayTabMakeInputs",this_popup).length>$(".displayTabGoodsContainer",this_div).length){
					var makeCnt = $(".displayTabMakeInputs",this_popup).length-$(".displayTabGoodsContainer",this_div).length;
					for(var i=0;i<makeCnt;i++){
						var tabIdx = $(".displayTabGoodsContainer",this_div).length;
						var clone = displayTabGoodsContainerClone.clone();
						clone.find(".daumeditorClone").addClass('daumeditor').removeClass('daumeditorClone');
						clone.attr("tabIdx",tabIdx);
						clone.find(".strTabIdx").html(comma(tabIdx+1));
						clone.find(".displayGoods").attr("id","displayGoods"+tabIdx);
						clone.find(".displayCriteria").attr("id","displayCriteria"+tabIdx);
						clone.find(".auto_condition_use").attr("id","auto_condition_use"+tabIdx);
						$(".displayTabGoodsContainer",this_div).last().after(clone);
						$(".ui-widget-overlay",this_div).height($(document).height());
						$(".displayGoods",clone).sortable();
						$(".displayGoods",clone).disableSelection();

						$("select.contents_type",clone).trigger('change');

						DaumEditorLoader.init(".daumeditor");
					}
				}else{
					$(".displayTabGoodsContainer:gt("+($(".displayTabMakeInputs",this_popup).length-1)+")",this_div).remove();
				}

				$(".displayTabMakeImages",this_div).each(function(i){
					$(".strMakeTabIdx",this).html(i+1);
				});

				$(".displayTabList",this_popup).each(function(){
					$(".tabPlusBtn:gt(0)",this).hide();
					$(".tabMinusBtn",this).hide();
					$(".tabMinusBtn:gt(0)",this).show();
				});
			}else{
				if($(".displayTabMakeInputs input[name='m_popup_tab_title[]']",this_popup).length>1){
					var displayTabKind = $("input[name='m_popup_tab_design_kind']:checked",this_popup).val();
					var displayTabType = displayTabKind=='image' ? 'displayTabTypeImage' : $("input[name='m_popup_tab_design_type']:checked",this_popup).val();

					var html = '<input type="hidden" name="m_tab_design_type" value="'+displayTabType+'" />';
					html += '<ul class="'+displayTabType+'" style="display:inline-block;vertical-align:middle">';
					$(".displayTabMakeInputs input[name='m_popup_tab_title[]']",this_popup).each(function(i){
						if(i==0)	html += '<li class="current">';
						else		html += '<li>';
						html += '<input type="hidden" name="m_tab_title[]" value="'+$(this).val()+'" />';
						html += $(this).val()+'</li>';
					});
					html += '</ul>';
					$(".strTab",this_div).show();

					if(displayTabKind=='image'){
						html += '<span class="fx11 red">이미지 타입은 미리보기를 지원하지 않습니다.</span>';
						$(".displayTabContainer",this_div).html(html);
						$(".displayTabContainer ."+displayTabType,this_div).hide();
					}else{
						$(".displayTabContainer",this_div).html(html);
					}
				}else{
					$(".strTab",this_div).hide();
					$(".displayTabContainer",this_div).html("<span class='desc'>탭 없음</span>");
				}

				if($(".displayTabMakeInputs",this_popup).length>$(".displayTabGoodsContainer",this_div).length){
					var makeCnt = $(".displayTabMakeInputs",this_popup).length-$(".displayTabGoodsContainer",this_div).length;
					for(var i=0;i<makeCnt;i++){
						var tabIdx = $(".displayTabGoodsContainer",this_div).length;
						var clone = m_displayTabGoodsContainerClone.clone();
						clone.find(".daumeditorClone").addClass('daumeditor').removeClass('daumeditorClone');
						clone.attr("tabIdx",tabIdx);
						clone.find(".strTabIdx").html(comma(tabIdx+1));
						clone.find(".displayGoods").attr("id","m_displayGoods"+tabIdx);
						clone.find(".displayCriteria").attr("id","m_displayCriteria"+tabIdx);
						$(".displayTabGoodsContainer",this_div).last().after(clone);
						$(".ui-widget-overlay",this_div).height($(document).height());
						$(".displayGoods",clone).sortable();
						$(".displayGoods",clone).disableSelection();

						$("select.contents_type",clone).trigger('change');

						DaumEditorLoader.init(".daumeditor");
					}
				}else{
					$(".displayTabGoodsContainer:gt("+($(".displayTabMakeInputs",this_popup).length-1)+")",this_div).remove();
				}

				$(".displayTabMakeImages",this_div).each(function(i){
					$(".strMakeTabIdx",this).html(i+1);
				});

				$(".displayTabList",this_popup).each(function(){
					$(".tabPlusBtn:gt(0)",this).hide();
					$(".tabMinusBtn",this).hide();
					$(".tabMinusBtn:gt(0)",this).show();
				});
			}

			setCriteriaDescription();

			setCriteriaDescription_upgrade();
		}
	};
	$("input[name='popup_tab_title[]'],input[name='m_popup_tab_title[]']").live('change keyup',function(){
		this_platform = $(this).closest('.displayTabMakePopup').hasClass('pc_tab_popup') ? 'pc' : 'mobile';
		makeTabSampleHtml(this_platform);
	});
	$("input[name='popup_tab_design_type'],input[name='m_popup_tab_design_type']").live('change',function(){
		this_platform = $(this).closest('.displayTabMakePopup').hasClass('pc_tab_popup') ? 'pc' : 'mobile';
		makeTabSampleHtml(this_platform);
	});
	$(".tabPlusBtn").live('click',function(){
		this_platform = $(this).attr('attr');
		that = $('.'+this_platform+'_tab_popup');
		$(".displayTabMakeInputs:last-child",that).after($(".displayTabMakeInputs:last-child",that).clone());
		$(".displayTabMakeImages:last-child",that).after($(".displayTabMakeImages:last-child",that).clone());

		changeFileStyleUnset($(".displayTabMakeImages:last-child",that));
		changeFileStyle();

		makeTabSampleHtml(this_platform);
	});
	$(".tabMinusBtn").live('click',function(){
		this_platform = $(this).attr('attr');
		that = $('.'+this_platform+'_tab_popup');
		that_div = $('.'+this_platform+'_tab_div');
		if($(this).closest(".displayTabMakeInputs").length){
			var tabIdx = $(".displayTabMakeInputs",that).index($(this).closest(".displayTabMakeInputs"));
		}else{
			var tabIdx = $(".displayTabMakeImages",that).index($(this).closest(".displayTabMakeImages"));
		}

		$(".displayTabMakeInputs",that).eq(tabIdx).remove();
		$(".displayTabMakeImages",that).eq(tabIdx).remove();

		makeTabSampleHtml(this_platform);
	});
	$("input[name='popup_tab_design_kind']").change(function(){
		if($(this).is(":checked")){
			if($(this).val()=='image'){
				$(".displayTabKindWrapImage").show();
				$(".displayTabKindWrapText").hide();
			}else{
				$(".displayTabKindWrapImage").hide();
				$(".displayTabKindWrapText").show();
				if($("input[name='popup_tab_design_type']:checked").val()=='displayTabTypeImage'){
					$("input[name='popup_tab_design_type']").eq(0).attr("checked",true);
				}
			}
		}
		makeTabSampleHtml('pc');
	}).change();

	$("input[name='m_popup_tab_design_kind']").change(function(){
		if($(this).is(":checked")){
			if($(this).val()=='image'){
				$(".m_displayTabKindWrapImage").show();
				$(".m_displayTabKindWrapText").hide();
			}else{
				$(".m_displayTabKindWrapImage").hide();
				$(".m_displayTabKindWrapText").show();
				if($("input[name='m_popup_tab_design_type']:checked").val()=='displayTabTypeImage'){
					$("input[name='m_popup_tab_design_type']").eq(0).attr("checked",true);
				}
			}
		}
		makeTabSampleHtml('mobile');
	}).change();

	makeTabSampleHtml('pc');
	makeTabSampleHtml('mobile');

	/* 모바일 탭 관련 */

	/* 조건 선택 버튼 */
	$("button.displayCriteriaButton").live("click",function(){
		var auto_condition_use_id	= $(this).attr('attr') == "pc" ? "" : "m_";
		auto_condition_use_id		+= "auto_condition_use" + $(this).closest(".displayTabGoodsContainer").attr("tabIdx");
		this_platform				= $(this).attr('attr') == 'pc' ? 'displayCriteria' : 'm_displayCriteria';
		var displayResultId			= this_platform + $(this).closest(".displayTabGoodsContainer").attr("tabIdx");
		var criteria				= $(this).closest(".displayTabGoodsContainer").find(".displayCriteria").val();
		var auto_type				= $(this).attr('auto_type');

		// 순위 설정 없이 조건 설정
		// 운영방식이 light 이고, 자동(1) 일 경우
		// 아이디자인일때만 기존대로 노출
		if(typeof gl_operation_type != 'undefined' && gl_operation_type == 'light' && auto_type == 'auto' && gl_kind != 'design'){
			// light 일 경우 
			$.ajax({
				type: "get",
				url: "../goods/select_auto_condition",
				data: "displayKind="+gl_kind+"&kind=none&auto_condition_use_id="+auto_condition_use_id+"&inputGoods="+displayResultId,
				success: function(result){
					$("div#condition_change_option").html(result);
					openDialog('조건 변경', 'condition_change_option', {"width":"800","height":"500","show" : "fade","hide" : "fade"});
				}
			});
		}else{
			// 기존 로직 유지
			openDialog("조건 선택", "#displayGoodsSelectPopup", {"width":"99%","show" : "fade","hide" : "fade"});

			if(criteria.indexOf('∀') > -1 || criteria == '' || !criteria){
				if	(auto_type == 'auto_sub') 
					set_goods_list_auto("displayGoodsSelect",displayResultId,criteria,auto_condition_use_id,'bigdata');
				else
					set_goods_list_auto("displayGoodsSelect",displayResultId,criteria,auto_condition_use_id,'normal');
			}else{
				set_goods_list("displayGoodsSelect",displayResultId,'criteria',criteria);
			}
		}

		
	});
	/* 상품 검색 버튼 */
	$("button.displayGoodsButton").live("click",function(){
		this_platform = $(this).attr('attr') == 'pc' ? 'displayGoods' : 'm_displayGoods';
		var displayResultId = this_platform + $(this).closest(".displayTabGoodsContainer").attr("tabIdx");
		openDialog("상품 검색", "#displayGoodsSelectPopup", {"width":"99%","show" : "fade","hide" : "fade"});
		set_goods_list("displayGoodsSelect",displayResultId,'goods','');
	});

	$(".displayGoods").sortable();
	$(".displayGoods").disableSelection();

	$("select.contents_type").live('change',function(){
		that = $(this).closest('th');
		type = $(this).val();
		$(this).closest('tr').find('.displayCriteriaButton').attr('auto_type',type);
		type = type.replace('auto_sub','auto');
		$(this).closest(".displayTabGoodsContainer").find(".displayTabAutoTypeContainer").hide();
		$(this).closest(".displayTabGoodsContainer").find(".displayTabAutoTypeContainer[type='"+type+"']").show();
		if($('.m_list_use').is(':checked')){
			$('.tab_contents_mobile').hide();
		}
		setCriteriaDescription_upgrade();
		setCriteriaDescription_bigdata();
		$('.displayTypeInfo',that).hide();
		$('.displayTypeInfo',that).eq($(this).find('option:selected').index()).show();
	}).change();

	if	(gl_recommend_flag && !gl_sub_kind) {
		opener.$("input[name='recommend_display_seq']").val(gl_display_seq);
		opener.$("input[name='m_recommend_display_seq']").val(gl_m_display_seq);
	}

	// 네비게이션 선택창 세팅
	$('#navigation_paging_dialog').dialog({'title':'네비게이션 선택','width':450,'autoOpen':false});
	$("#navigation_paging_dialog").closest(".ui-dialog").appendTo($("form[name='displayManagerForm']"));

	$("input[name='navigation_paging_style']").live('change',function(){
		if($(this).is(":checked") && $(this).val()==''){
			$("span.navigation_paging_prn").hide();
		}else{
			$("span.navigation_paging_prn").show();
		}

		if($(this).is(":checked")){
			var clone = $(".mobile_pagination_"+$(this).val()).clone();
			$("span.navigation_paging_prn").empty().append(clone);
		}
	});
	
	
	if	(gl_platform == 'mobile') {
		$("input[name='style']").bind('change',function(){
			if($(this).is(":checked")){
				if($(this).val()!='newswipe'){
					$(".tab_area").hide();
					$(".navigation_paging_area").hide();
					$(".displayTabKindWrapText .tabMinusBtn:gt(0)").trigger('click');
					$(".displayTabKindWrapImage .tabMinusBtn:gt(0)").trigger('click');
					$("select[name='contents_type[]'] option[value='text']").attr('disabled',true);
					$('.height_auto').show();
				}else{
					$(".tab_area").show();
					$(".navigation_paging_area").show();
					$("select[name='contents_type[]'] option[value='text']").removeAttr('disabled');
				}

				$(this).val() == 'sizeswipe' ? $('.height_auto').hide() : $('.height_auto').show();
				chk_display_limit_func(this,$(this).attr('limit'));
			}
		}).trigger('change');
	}else{
		$("input[name='style'],input[name='m_style']").bind('change',function(){
			if($(this).is(":checked")){
				if($(this).prop('name') == 'm_style'){
					this_platform = $('.mobile_tab_div');
					this_popup = $('.mobile_tab_popup');
					if($(this).val()!='newswipe'){
						$(".tab_area",this_platform).hide();
						$(".navigation_paging_area",this_platform).hide();
						$(".m_displayTabKindWrapText .tabMinusBtn:gt(0)",this_popup).trigger('click');
						$(".m_displayTabKindWrapImage .tabMinusBtn:gt(0)",this_popup).trigger('click');
						$("select[name='m_contents_type[]'] option[value='text']",this_platform).attr('disabled',true);
					}else{
						$(".tab_area",this_platform).show();
						$(".navigation_paging_area",this_platform).show();
						$("select[name='m_contents_type[]'] option[value='text']",this_platform).removeAttr('disabled');
					}
					$(this).val() == 'sizeswipe' ? $('.height_auto').hide() : $('.height_auto').show();
				}
				chk_display_limit_func(this,$(this).attr('limit'));

				// light 격자형 반응형일때 탭 활성화 :: 2018-11-26 
				// 스타일 변경 시 탭 설정 반응형 타입 추가 :: 2019-02-28
				if(typeof gl_operation_type != 'undefined' && gl_operation_type == 'light'){
					if(gl_kind == 'bigdata' || gl_kind == 'relation' || gl_kind == 'relation_seller'){
						$(".tab_area").hide();
						$(".navigation_paging_area").hide();
						$(".displayTabKindWrapText .tabMinusBtn:gt(0)").trigger('click');
						$(".displayTabKindWrapImage .tabMinusBtn:gt(0)").trigger('click');
						$("select[name='contents_type[]'] option[value='text']").attr('disabled',true);
						$('.height_auto').show();
					}else{
						if($(this).val() == 'responsible'){
							$(".tab_area").show();
							$(".navigation_paging_area").show();
							$("select[name='contents_type[]'] option[value='text']").removeAttr('disabled');
						}else{
							$(".tab_area").hide();
							$(".navigation_paging_area").hide();
							$(".displayTabKindWrapText .tabMinusBtn:gt(0)").trigger('click');
							$(".displayTabKindWrapImage .tabMinusBtn:gt(0)").trigger('click');
							$("select[name='contents_type[]'] option[value='text']").attr('disabled',true);
							$('.height_auto').show();
						}
					}
				}

			}
		}).trigger('change');
	}

	if	(gl_navigation_paging_style) {
		$("#navigation_paging_dialog input[name='navigation_paging_style'][value='"+gl_navigation_paging_style+"']").attr('checked',true).trigger('change');
	}else{
		$("#navigation_paging_dialog input[name='navigation_paging_style']").first().attr('checked',true).trigger('change');
	}

	$('.m_list_use').click(function(){
		if($(this).is(':checked')){
			design_mobile_skin_chk($(this).attr('skinVersion'));
			$('.mobile_list_division').show();
			$('.tab_contents_mobile').hide();
			set_decoration_favorite();
			if	(gl_sub_kind) parent.set_resize_iframe(true);
		}else{
			$('.mobile_list_division').hide();
			$('.tab_contents_mobile').show();
			if	(gl_sub_kind) parent.set_resize_iframe(false);
		}
	});

	//노출개수, 이미지 사이즈 수정시 해당 스타일로 선택되게 한다
	$('.select_style').change(function(){
		this_style = $(this).attr('attr');
		$("input[name='style'][value="+this_style+"]").trigger('change');
		$("input[name='style'][value="+this_style+"]").closest('div').find('img').trigger('click');
	});

	// 라이트형 상품정보 선택 색상 :: 2018-11-26 lwh
	$(".goods_info_style").bind('click',function(){
		$('.goods_file_list').removeClass('select');
		$(this).next('.goods_file_list').addClass('select');
	});
});

function set_goods_list(displayId,inputGoods,type,criteria){
	$.ajax({
		type: "get",
		url: "../goods/select",
		data: "innerMode=2&type="+type+"&containerHeight=640&page=1&inputGoods="+inputGoods+"&displayId="+displayId+"&displayKind="+gl_kind+"&criteria="+encodeURIComponent(criteria)+"&display_seq="+gl_display_seq,
		success: function(result){
			$("div#"+displayId).html(result);
			$("#"+displayId+"Container").show();
		}
	});
}

function set_goods_list_auto(displayId,inputGoods,criteria,auto_condition_use_id,type){
	isBigData = '';
	if	(type == 'bigdata') isBigData = "&design_bigdata=1";
	$.ajax({
		type: "get",
		url: "../goods/select_auto",
		data: "inputGoods="+inputGoods+"&displayKind="+gl_kind+"&displayId="+displayId+"&criteria="+encodeURIComponent(criteria)+"&auto_condition_use_id="+auto_condition_use_id+isBigData,
		success: function(result){
			$("div#"+displayId).html(result);
			$("#"+displayId+"Container").show();
		}
	});
}

// 디스플레이 별로 신규 기능 제한
function chk_display_limit_func(obj, chk_list){
	var parent_obj = $(obj).closest('.display_set_wrap');
	$('.limit_func_list', parent_obj).attr('disabled', false).removeClass('limit_func_list');
	if	(chk_list) {
		json = JSON.parse(Base64.decode(chk_list));
		$.each(json,function(key, val){
			$.each(val, function(class_name, class_value){
				if	($('.'+class_name, parent_obj).length > 0) {
					if	(class_name == class_value) {
						$('.'+class_name, parent_obj).prop('disabled',true).addClass('limit_func_list');
					}else{
						switch($('.'+class_name, parent_obj)[0].tagName){
							case 'INPUT':
								$('.'+class_name, parent_obj).prop('disabled',true).addClass('limit_func_list');
								break;
							case 'SELECT':
								if	(typeof class_value == 'string') {
									$("."+class_name+" > option[value='"+class_value+"']", parent_obj).attr('disabled',true).addClass('limit_func_list');
								}else{
									$.each(class_value,function(){
										$("."+class_name+" > option[value='"+this+"']", parent_obj).attr('disabled',true).addClass('limit_func_list');
									});
								}
						}
					}
				}
			});
		});
	}
}