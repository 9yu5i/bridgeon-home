var default_key = '';

// 페이지별 검색날짜 필드 구분
obj_regist_date_s				= '';
obj_regist_date_e				= '';

var search_date_form1			= new Array("order","order_company","personal","dormancy","export","temporary");
var search_date_form2			= new Array("autodeposit","sales","returns","refund","gift_catalog","restock_notify_catalog","withdrawal");

if($.inArray(default_search_pageid,search_date_form1) >= 0){
	obj_regist_date_s	= $("input[name='regist_date[]']").eq(0);
	obj_regist_date_e	= $("input[name='regist_date[]']").eq(1);
}else if($.inArray(default_search_pageid,search_date_form2) >= 0){
	obj_regist_date_s	= $("input[name='sdate']");
	obj_regist_date_e	= $("input[name='edate']")
}


field_name_pattern	= /[a-zA-Z0-9_]+/gi;

$(document).ready(function() {
	$('<div class="hide" id="search_detail_dialog">\
	<form name="search_default_frm" method="post" action="../order/set_default_search_form" target="actionFrame">\
		<input type="hidden" name="pageid" value="'+default_search_pageid+'">\
		<div id="contents">\
			<table width="100%" id="search_default_setting" class="info-table-style table_search">\
				<col width="130" /><col width="" />\
			</table>\
		</div>\
		<div class="desc pdt5">※ 기본검색 설정은 관리자 ID별로 저장됩니다.</div>\
		<div align="center" style="padding-top:10px;" class="btn_destory">\
			<span class="btn large black">\
				<button type="submit" class="resp_btn active size_XL">저장하기<span class="arrowright"></span></button>\
			</span>\
		</div>\
	</form>\
	</div>').appendTo('body');

	$(".select_date").click(function() {
		if(typeof($(this).attr("settarget")) == "undefined") { 
			default_key = ''; 
		}else{
			default_key = $(this).attr("settarget"); 
		}
		set_period($(this).attr("id"),default_key);
		$(this).parent().next('.btn').children('.select_date').css("border-left", "1px solid #3a96fc");	
	});


	$("span#set_default_button,#set_default_setting_button").bind("click",function(){
		//search_default_setting
		var objTable		= $("#search_default_setting");
		var default_html	= '';
		var new_tr			= '';
		var new_td			= '';
		var default_data	= '';

		var default_field ;
		var tr_title		= '';
		var title_k			= 0;
		var old_class		= '';
		var	period_td_end	= false;
		var period_select	= '';
		var old_tr_title	= '';
		var tr_title_k		= 0;
		var old_field_type	= '';
		var title_k_all = 1; // 추가 20170425
		var sc_date_type_flag = false;
		var select_date_has_select = false;

		//var title_k			= 0;
		//var old_class		= '';
		//var period_td_end	= false;
		var old_field_name	= '';
		var row_field_cnt	= 0;
		var default_k		= 0;
		var row_k			= 0;
		var icon_all_check	= '';
		var row_br			= false;
		
		var bar_group	= new Array("price","stock","page_view");
		var wave_group	= new Array("order_cnt","order_sum","emoney","cash","point","review_cnt","login_cnt");

		// 기본검색 테이블 초기화
		objTable.find("tr").remove();

		var search_view = false;
		var parent_elem = $("#search_detail_table");
		var target_elem = parent_elem.find("input, select");
		target_elem.each(function(idx){
			var field_name		= '';

			// 합포장 라디오버튼 
			var bundle_html = '';

			if($(this).prop("tagName").toLowerCase() == "select" || typeof($(this).attr("type")) != "undefined"){
				search_view = true;
			}else{
				search_view = false;
			}

			if(typeof($(this).attr("default_none")) == "undefined" && $(this).attr("type") != "hidden" && search_view == true) {

				if(typeof($(this).attr("name")) != "undefined"){
					ori_field_name_tmp	= $(this).attr("name").match(field_name_pattern);
					ori_field_name		= ori_field_name_tmp[0];
					ori_field_val		= ori_field_name_tmp[1];
				}else{
					ori_field_name		= '';
				}

				var row_group		= $(this).attr("row_group");
				//var row_check_all	= $(this).attr("row_check_all");

				if(typeof(row_group) != "undefined"){
					row_field_group = row_group
				}else{
					row_field_group = ori_field_name
				}

				var current_row = $(this).closest('tr');
				var tr_title_elem = current_row.find('th');
				// row title 가져오기
				var tr_title = tr_title_elem.eq(0).html();				
				if(tr_title_elem.length > 1 && row_field_group != old_field_name){
					if(typeof($(this).parent().attr('no')) == 'undefined'){
						if(typeof($(this).parent().parent().attr("no")) == "undefined"){
							tr_title_k = 0;
						}else{
							tr_title_k	= $(this).parent().parent().attr("no");
						}
					}else{
						tr_title_k	= $(this).parent().attr("no");
					}
					tr_title	= tr_title_elem.eq(tr_title_k).html();
				}

				// row title에 기간 검색 구분 select bar 소스 있을 경우
				var is_select_date = this.className === 'select_date' || this.className === 'select_date resp_btn' || this.className === 'select_date resp_btn v3';
				
				if(!is_select_date){
					//주문리스트, 주문상태 step에 따라 강제 줄바꿈.
					if(ori_field_name == "chk_step" && eval(ori_field_val) == 50){
						row_br = true;
					}else{
						row_br = false;
					}
				}

				// first of row
				if(default_k == 0 || row_k == 0) {
					$(this).closest("td").find("input,select").each(function(){
						if(typeof($(this).attr("default_none")) == "undefined" && $(this).attr("type") != 'hidden'){
							row_field_cnt++;
						}
					});
					icon_all_check	= $(this).closest("td").find("span.icon-check.hand.all-check");	//전체체크 icon

					// tr_title이 없는 경우 빈값으로 세팅 :: 2020-06-08 pjw
					var tr_title_not_titles = tr_title != null ? tr_title.match(/^([\s\S]*)?<input type="hidden" name="date_selected" value="/) : '';
					
					// 날짜 셀 이름을 강제로 바꿀 필요가 없어보여 삭제 :: 2020-03-23 pjw
					//if(is_select_date && tr_title){
					//	tr_title = '날짜';
					//}

					new_tr += '<tr><td class="its-th" style="padding-left:15px;"><strong>' +  tr_title + '</strong></td>';
					new_tr += '<td class="its-td"><div class="pdl5">';

					if(tr_title_not_titles && tr_title_not_titles.length>1)
						new_tr += tr_title_not_titles[1];
				}

				row_k++;

				// 날짜 검색 처리				
				if(is_select_date){
					if(title_k == 0){
						padding = "pd5";
					}else{
						padding = "pd10";
					}

					if(!select_date_has_select) {
						switch(default_search_pageid) {
							case 'order':
								field_name = 'default_period';
								break;
							default:
								if(typeof($(this).attr('settarget')) != 'undefined'){
									field_name = 'default_period_'+$(this).attr('settarget');
								}else if(current_row.find('input[name="date_selected"]').length>0) {
									field_name = 'date_selected';
								}else{
									field_name = 'default_period';
								}
						}
						new_tr += '<select name="'+field_name+'">';
						select_date_has_select = true;
					}

					new_tr += '<option value="'+this.id+'">'+this.value+'</option>';

					old_class = $(this).attr("class");

					// select_date가 연결 될 경우에 row_bunch가 있으면 select로 묶음
					if($(this).attr('row_bunch') != null){
						new_tr += '</select>';
						select_date_has_select = false;
					}

				// 날짜 검색 외 처리
				}else{
					if(title_k == 0 || ori_field_name == "chk_step"){
						padding = "pdr5";
					}else{
						padding = "pdr10";
					}

					field_name		= "default_" + $(this).attr("name");	//input, select field name
					field_class		= padding;

					if(select_date_has_select){
						new_tr += '</select>';
					}

					// input, select field title
					span_title = $(this).parent().find("span").html();
					if( span_title != null ){
						field_text = "<span class='"+$(this).parent().find("span").attr("class")+"'>"+span_title+"</span>";
					}else{
						field_text = $(this).parent().text();
					}

					if(typeof($(this).attr("name")) == "undefined"){
						field_name	= '';
						field_text = "nothing";
						field_class = field_class + " red";
					}

					//input checkbox, radio type 
					if($(this).attr("type") == "checkbox" || $(this).attr("type") == "radio"){

						// 체크 상태 가져옴
						var chkOpt		= $(this).attr('checked') != null ? 'checked' : ''; 

						// 합포장 라디오버튼은 별도 처리 - 이정록 - 2016-07-08
						if (field_name == "default_chk_bundle_yn") {
							field_class = "ml20";
							if($(this).attr('wrapped') != 'undefined'){
								var cloneObj = $(this).closest('label').clone();
								$(cloneObj).find('input').remove();							
								var suffixHtml = $(cloneObj).html();

								$(this).attr("type") == "checkbox" ? bundle_html += "<label class= \"resp_checkbox "+field_class+"\">" : bundle_html += "<label class= \"resp_radio "+field_class+"\">";
								bundle_html += "<input type=\""+$(this).attr("type")+"\" name=\""+field_name+"\" value=\""+$(this).val()+"\" class=\"not_all\" "+chkOpt+">";
								bundle_html += " " + suffixHtml + "</label>";
							}else{
								$(this).attr("type") == "checkbox" ? bundle_html += "<label class=\"resp_checkbox "+field_class+"\">" : bundle_html += "<label class=\"resp_radio "+field_class+"\">";
								bundle_html += "<input type=\""+$(this).attr("type")+"\" name=\""+field_name+"\" value=\""+$(this).val()+"\" "+chkOpt+">";
								bundle_html += " "+field_text+"</label>";
							}

							
						} else {
							if($(this).attr('wrapped') != 'undefined'){
								var cloneObj	= $(this).closest('label').clone();
								$(cloneObj).find('input').remove();							
								var suffixHtml	= $(cloneObj).html();
								$(this).attr("type") == "checkbox" ? new_tr = new_tr + "<label class=\"resp_checkbox "+field_class+"\">" : ew_tr = new_tr + "<label class=\"resp_radio "+field_class+"\">";
								new_tr = new_tr + "<input type=\""+$(this).attr("type")+"\" name=\""+field_name+"\" value=\""+$(this).val()+"\" "+chkOpt+" >";
								new_tr = new_tr + " " + suffixHtml + "</label>";
							}else{

								$(this).attr("type") == "checkbox" ? new_tr = new_tr + "<label class=\"resp_checkbox "+field_class+"\">" : new_tr = new_tr + "<label class=\"resp_radio "+field_class+"\">";
								new_tr = new_tr + "<input type=\""+$(this).attr("type")+"\" name=\""+field_name+"\" value=\""+$(this).val()+"\" "+chkOpt+">";
								new_tr = new_tr + " "+field_text+"</label>";
							}
						}

					//input text type 
					}else if($(this).attr("type") == "text" ){

						if($(this).attr("size") != "undefiend"){
							inp_size = $(this).attr("size");
						}else{
							inp_size = 15;
						}
						if($.inArray(row_field_group,bar_group) >= 0 && title_k == 0 && old_field_type == "text"){
							new_tr = new_tr + " - ";
						}
						if($.inArray(row_field_group,wave_group) >= 0 && title_k == 0 && old_field_type == "text"){
							new_tr = new_tr + " ~ ";
						}
						new_tr = new_tr + "\n<input type=\"text\" name=\""+field_name+"\" value=\""+$(this).val()+"\" class=\"line\" size=\""+inp_size+"\"> ";

					//기타 
					}else{
						
						var tag_selector	= "select[name='"+$(this).attr("name")+"'] option";
						var select_attr		= '';
						if(typeof($(this).attr("depth")) != "undefined"){
							select_attr  = select_attr + "depth='"+$(this).attr("depth")+"'";
							tag_selector = "select[name='"+$(this).attr("name")+"'][depth='"+$(this).attr("depth")+"'] option"
						}
						if(typeof($(this).attr("afterfunc")) != "undefined"){
							select_attr = select_attr + "afterfunc='"+$(this).attr("afterfunc")+"'";
						}
						if(typeof($(this).attr("class")) != "undefined"){
							select_attr = select_attr + "class='"+$(this).attr("class")+"'";
						}
						if(typeof($(this).attr("style")) != "undefined"){
							select_attr = select_attr + "style='"+$(this).attr("style")+"'";
						}
						new_tr = new_tr + "\n<select name=\""+field_name+"\" "+select_attr+">";
						if($(tag_selector+'[value=""]').length===0)
							new_tr = new_tr + "\n\t<option value=''>선택하세요</option>";
						$(tag_selector).each(function(){
							new_tr = new_tr + "\n\t<option value='"+$(this).val()+"'>"+$(this).text()+"</option>";
						});
						
						new_tr = new_tr + "\n</select> ";

					}

					if(title_k > 0 && (row_field_group != old_field_name || row_br) ) {
						title_k			= 0;
						if(eval($(this).closest("tr").find("th").length)-1 == tr_title_k ){
							tr_title_k		= 0;
						}
					}else{
						title_k++;
					}

				}

				default_k++;
				old_field_name	= row_field_group;
				old_tr_title	= tr_title;
				old_field_type	= $(this).attr("type");
				
				// last of row 
				if(row_field_cnt == row_k || idx == target_elem.length-1){

					if(typeof(icon_all_check) == "object" && icon_all_check.html() != null){
						new_tr = new_tr + " <span onclick=\"all_check(this)\" class=\"icon-check hand\"><b>전체</b></span>";
					}

					// 합포장 내용이 있으면 전체선택 버튼 이후 추가 - 이정록 - 2016-07-08
					if (bundle_html.length > 0) {
						new_tr = new_tr + bundle_html;
					}

					if(select_date_has_select){
						new_tr += '</select>';
					}

					new_tr = new_tr + "\n\t</div></td>\n</tr>";

					row_k			= 0;
					row_field_cnt	= 0;
				}
			}
		});


		new_td = objTable.append(new_tr);
		default_obj_width = 1100;
		default_obj_height = 670;

		/* 페이지별 특수처리 */
		switch(default_search_pageid) {
			case 'restock_notify_catalog':
				category_admin_select_load('','default_category1','',function(){
					$("select[name='default_category1']").val(default_select_category1).change();
				});
	
				$("select[name='default_category1']").on("change",function(){
					category_admin_select_load('default_category1','default_category2',$(this).val(),function(){
						$("select[name='default_category2']").val(default_select_category2).change();
					});
					category_admin_select_load('default_category2','default_category3','');
					category_admin_select_load('default_category3','default_category4','');
				});
				$("select[name='default_category2']").on("change",function(){
					category_admin_select_load('default_category2','s_category3',$(this).val(),function(){
						$("select[name='default_category3']").val(default_select_category3).change();
					});
					category_admin_select_load('default_category3','default_category4','');
				});
				$("select[name='default_category3']").on("change",function(){
					category_admin_select_load('default_category3','default_category4',$(this).val(),function(){
						$("select[name='default_category4']").val(default_select_category4).change();
					});
				});
				
				brand_admin_select_load('','default_brands1','',function(){
					$("select[name='default_brands1']").val(default_select_brands1).change();
				});
	
				$("select[name='default_brands1']").on("change",function(){
					brand_admin_select_load('default_brands1','default_brands2',$(this).val(),function(){
						$("select[name='default_brands2']").val(default_select_brands2).change();
					});
					brand_admin_select_load('default_brands2','default_brands3','');
					brand_admin_select_load('default_brands3','default_brands4','');
				});
				$("select[name='default_brands2']").on("change",function(){
					brand_admin_select_load('default_brands2','s_category3',$(this).val(),function(){
						$("select[name='default_brands3']").val(default_select_brands3).change();
					});
					brand_admin_select_load('default_brands3','default_brands4','');
				});
				$("select[name='default_brands3']").on("change",function(){
					brand_admin_select_load('default_brands3','default_brands4',$(this).val(),function(){
						$("select[name='default_brands4']").val(default_select_brands4).change();
					});
				});
				break;
			case 'returns':
				$( "select[name='default_provider_seq_selector']" ).show().change(function(){
					if( $(this).val() > 0 ){
						$("input[name='default_provider_seq']").val($(this).val());
						$("input[name='default_provider_name']").val($("option:selected",this).text());
					}else{
						$("input[name='default_provider_seq']").val('');
						$("input[name='default_provider_name']").val('');
					}
				});
	
				default_obj_width  = 750;
				default_obj_height = 450;
				break;
			case 'export':
				default_obj_width  = 900;
				default_obj_height = 510;
				break;
			case 'refund':
				default_obj_height = 320;
				break;
			case 'sales':
				default_obj_height = 430;
				break;
			case 'personal':
			case 'no_receipt_address':
				default_obj_height = 320;
				break;
			case 'temporary':
				default_obj_height = 370;
				break;		
			case 'ledger':
			case 'inven':
				var cur_year	= $("select[name='sc_year']").val();
				var cur_type	= $("select[name='sc_month_type']").val();
				var cur_mon		= $("input[name='sc_month']").val();
				var cur_qua		= $("input[name='sc_quater']").val();
				var date_fld_elem = $('#search_default_setting input[name="default_sc_date_type"]').closest('tr');
				var cb_sc_month_type = function() {
					var $this = $(this);
					$this.find('option').each(function() {
						if(!this.value) return;
						if(this.value === $this.val()) {
							$this.parent().find('[name="default_sc_' + this.value + '"]').show();
						}
						else {
							$this.parent().find('[name="default_sc_' + this.value + '"]').hide();
						}
					});
				};

				/* 기간 관련 통합처리 */
				date_fld_elem.each(function(idx) {
					var $this = $(this);
					var th = $this.find('.its-th:first-of-type');
					$this.find('[name="default_sc_date_type"]').after(th.text());
					if(idx === 0) {
						th.attr('rowspan', date_fld_elem.length);
					}
					else {
						th.remove();
						$this.insertAfter(date_fld_elem.eq(0));
					}
				});

				var sc_month_type = $('[name="default_sc_month_type"]');
				if(sc_month_type.length>0) {
					sc_month_type.on('change', cb_sc_month_type);
					cb_sc_month_type.call(sc_month_type[0]);
				}

				var scmonth	= $('<select name="default_sc_month" class="simple"></select>').appendTo($("select[name='default_sc_month_type']").closest('div'));
				for	( var m = 1; m <= 12; m++){
					scmonth.append('<option value="' + m + '">' + m + '월</option>');
				}
				var scqua	= $('<select name="default_sc_quater" class="simple"></select>').appendTo($("select[name='default_sc_month_type']").closest('div'));
				for	( var q = 1; q <= 4; q++){
					scqua.append('<option value="' + q + '">' + q + '분기</option>');
				}
				scqua.append('<option value="first_half">상반기</option>');
				scqua.append('<option value="second_half">하반기</option>');
				scqua.append('<option value="year">년도전체</option>');

				$("select[name='default_sc_year']").find("option[value='" + cur_year + "']").attr('selected', true);
				$("select[name='default_sc_month_type']").find("option[value='" + cur_type + "']").attr('selected', true);
				$("select[name='default_sc_month']").find("option[value='" + cur_mon + "']").attr('selected', true);
				$("select[name='default_sc_quater']").find("option[value='" + cur_qua + "']").attr('selected', true);

				$("select[name='default_sc_scm_category[]']").each(function(){
					$(this).removeClass('sc_scm_category').addClass('default_sc_scm_category');
					$(this).unbind('change');
					$(this).bind('change', function(){getChildScmCategory(this, 'default_sc_scm_category');});
				});
				break;
			case 'carryingout':
			case 'warehousing':
			case 'sorder':
			case 'revision':
			case 'stockmove':
			case 'scmgoods':
			case 'autoorder':
			case 'traderaccount':
				$('select[name="default_sc_trader_group"]').change(function(){
					get_trader_to_group(this);
				});

				$('select[name="default_sc_scm_category[]"]').change(function(){
					getChildScmCategoryName(this, 'default_sc_scm_category[]');
				});
				break;
			
		}

		var title = '기본검색 설정<span class=\"desc\"> - 아래서 원하는 검색조건을 설정하여 편하게 쇼핑몰을 운영하세요</span>';
		openDialog(title, "search_detail_dialog", {"width":default_obj_width,"height":default_obj_height});

		/* 저장된 기본검색설정 값 가져오기 */
		set_search_form(default_search_pageid,"default");
		
		//helpicon 설정
		help_tooltip();	
	});

});

// 기본검색설정 창에서 전체 체크
function all_check(obj){

	var _chk = $(obj).parent().find('input[type=checkbox]').eq(0).attr("checked");
	if(typeof(_chk) == "undefined"){
		_chk = true;
	}else{
		if(_chk == true) _chk = false ; else _chk = false;
	}
	// 전체선택 제외 클래스 추가 - 이정록 - 2016-07-08
	$(obj).parent().find('input[type=checkbox]:not(.not_all)').attr('checked',_chk);
	
}

//선택한 기간에 따라서 검색날짜 구해오기
function set_period(default_period,default_key){

	var search_date_s = '';
	var search_date_e = '';

	switch(default_period){
		
		case 'today' :
			search_date_s = getDate(0);
			search_date_e = getDate(0);
			break;
		case '3day' :
			search_date_s = getDate(3);
			search_date_e = getDate(0);
			break;
		case '1week' :
			search_date_s = getDate(7);
			search_date_e = getDate(0);
			break;
		case '1month' :
			search_date_s = getDate(30);
			search_date_e = getDate(0);
			break;
		case '3month' :
			search_date_s = getDate(90);
			search_date_e = getDate(0);
			break;
		case '6month' :
			search_date_s = getDate(180);
			search_date_e = getDate(0);
			break;
		case '1year' :
			search_date_s = getDate(365);
			search_date_e = getDate(0);
            break; 
        case '6month' :
			search_date_s = getDate(180);
			search_date_e = getDate(0);
			break; 
		case 'all':
			search_date_s = '';
			search_date_e = '';
			break;
		default :
			search_date_s = '';
			search_date_e = '';
			break;
	}

	if(default_key == "anniversary"){

		var date_tmp_s = search_date_s.split("-");
		var date_tmp_e = search_date_e.split("-");

		$("select[name='anniversary_sdate[]']").eq(0).val(date_tmp_s[1]).attr("selected","selected");
		$("select[name='anniversary_sdate[]']").eq(1).val(date_tmp_s[2]).attr("selected","selected");
		$("select[name='anniversary_edate[]']").eq(0).val(date_tmp_e[1]).attr("selected","selected");
		$("select[name='anniversary_edate[]']").eq(1).val(date_tmp_e[2]).attr("selected","selected");


	}else{
		if(default_key != ''){
			if( $("input[name='"+default_key+"_sdate']").length > 0 ) {
				obj_regist_date_s = $("input[name='"+default_key+"_sdate']");
				obj_regist_date_e = $("input[name='"+default_key+"_edate']");
			} else if( $("input[name='"+default_key+"[]']"). length > 1) {
				obj_regist_date_s = $("input[name='"+default_key+"[]']").eq(0);
				obj_regist_date_e = $("input[name='"+default_key+"[]']").eq(1);
			}
		}
		obj_regist_date_s.val(search_date_s);
		obj_regist_date_e.val(search_date_e);
	}

}

function chk_search_date(v){

	var chk_list	= new Array('today','3day','1week','1month','3month','6month','1year','all');
	var search_date = false;
	for(var i=0; i< chk_list.length; i++){
		if(chk_list[i] == v){
			search_date =  true;
		}
	}

	return search_date;

}

///----------------------------------------------------------------------------------------------------------
/* 기본검색설정 값 적용 */
function set_search_form(page,mode)
{
	
	$.getJSON('../order/get_default_search_form?pageid='+page, function(result) {

		var reset_obj			= '';

		if(mode == "default"){
			reset_obj = $("#search_detail_dialog");
		}else{
			reset_obj = $("#search_detail_table");
		}

		/* checkbox, radio button 초기화 */
		reset_obj.find("input, select").each(function(e){
			if($(this).attr("type") == "checkbox" || $(this).attr("type") == "radio"){
				$(this).prop("checked",false);
			}

		});

		var date_set_pattern = /default_period/;

		result_total = Object.keys(result).length;

		//var keys = Object.keys(result);
		for(_key in result){

			var _value = result[_key];
			
			if(mode == "default"){
				field_key = _key;
			}else{
				field_key = _key.replace("default_",'');
			}

			//Object.keys(result).length;

			if(typeof(_value) != "undefined"){

				if(typeof(_value) == "string"){
					
					str_obj = $("input[name='"+field_key+"']");

					// 검색기간 관련 세팅
					if(/default_period|date_selected/.test(_key)){
						if(mode == "default"){
							$('[name="'+field_key+'"]').val(_value).prop('selected', true);
						}else if(mode == 'scm'){
							var changeObj	= $('#'+_value);
							set_date(changeObj, _value);
						}else{
	
							var default_key = '';

							if(_key != "default_period"){
								default_key = _key.replace("default_period_",'').replace("default_period",'');
							}

							// 선택된 검색 날짜 지정.
							if(chk_search_date(_value)) set_period(_value,default_key);

						}
					} else if (_key === 'default_sc_month' && mode == 'scm') {
						var changeObj	= $('button.select_date[m="'+_value+'"]');
						selected_sc_month(changeObj);
					}else if(str_obj.attr("type") == "radio" || str_obj.attr("type") == "checkbox"){

						$("input[name='"+field_key+"'][value='"+_value+"']").prop("checked",true);  

					}else if(str_obj.attr("type") == "text"){

						str_obj.val(_value);

					}else{
						// 2016.05.18 SCM select 박스 예외 분기 (거래처) pjw						
						if((field_key == 'sc_trader' || field_key == 'default_sc_trader') && typeof get_trader_to_group_select == 'function'){
							get_trader_to_group_select($('select[name="'+field_key+'_group"]'), _value);
						}else{
							$("select[name='"+field_key+"']").val(_value).attr("selected","selected");
						}						
					}


				}else if(typeof(_value) == "object"){
					
					// foreach 문으로 돌릴 시 다른 프로토타입 값들도 같이 돌리기 때문에 for문으로 변경 :: 2020-03-23 pjw
					for(var i=0; i<_value.length; i++){
						var _sub_val = _value[i];

						if($("input[name='"+field_key+"[]']").length > 0){
							$("input[name='"+field_key+"[]'][value='"+_sub_val+"']").eq(0).prop("checked",true);
						}else{
							$("input[name='"+field_key+"["+i+"]'][value='"+_sub_val+"']").eq(0).prop("checked",true);
						}
					}
					
					// 2016.05.18 SCM select 박스 예외 분기 (카테고리) pjw	
					if(field_key == 'sc_scm_category' || field_key == 'default_sc_scm_category'){
						$('select[name="'+field_key+'[]"][depth="1"] option[value="'+_value[0]+'"]').attr('selected', 'selected');
						getChildScmCategoryName($('select[name="'+field_key+'[]"][depth="1"]'), field_key+'[]', _value);
					}
				}
			}
		}

		if	(default_search_pageid == 'ledger'){
			chgMonthQuaterArea($("select[name='sc_month_type']"));
			selected_sc_month($('span.sc-month-select-area').find('button').eq($("input[name='sc_month']").val() - 1));
			$('span.sc-quater-select-area').find('button').each(function(){
				if	($("input[name='sc_quater']").val() == $(this).attr('q'))	selected_sc_quater($(this));
			});
		}

		$('[name="default_sc_month_type"]').trigger('change');
	});
}


function formatDate(date,m){

	var tom = date.getMonth() + m;
	var tod = date.getDate();
	if(tom < 10){ tom = "0" + tom; } 
	if(tod < 10){ tod = "0" + tod; }

	return (date.getFullYear() + "-" + tom + "-" + tod);
}

function formatDate2(yy,mm,dd,m){

	if(mm < 10){ mm = "0" + mm; }
	if(dd < 10){ dd = "0" + dd; }

	return (yy + "-" + mm + "-" + dd);
}
