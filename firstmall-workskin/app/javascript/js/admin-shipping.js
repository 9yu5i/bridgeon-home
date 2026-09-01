$(document).ready(function() {

	// 삭제 버튼 이벤트 바인드
	$(".btnStoreDelete").bind("click", function (){
		deleteStoreConfig();
	});

	// 삭제 버튼 취소 이벤트 바인드
	$(".btnCancelDelSetting").bind("click", function (){
		closeDialog('deleteInfoLayer');
	});

	$(".btnDelSetting").bind("click", function (){
		$("form[name='settingForm']").attr("method", "post");
		$("form[name='settingForm']").attr("action", "../setting_process/shipping_address_delete");
		$("form[name='settingForm']").attr("target", "actionFrame");
		$("form[name='settingForm']").submit();
		$("form[name='settingForm']").attr("method", "get");
		$("form[name='settingForm']").attr("action", "");
		$("form[name='settingForm']").attr("target", "");
	});
});
// 상품 배송그룹 선택 또는 배송그룹 직접입력
function ship_grp_sel(type, provider_seq){
	if (!provider_seq){ // 입점사 번호 없을시 선택된 값을 가져온다.
		provider_seq = $("input[name='provider_seq']").val();
	}
	var shipping_group_seq = $("#shipping_group_seq").val();

	if(!provider_seq){
		alert('입점사를 먼저 선택해주세요.');
		return false;
	}

	// 예약상품 확인
	var displayTerms		= $('input[name="display_terms"]').val();
	var displayTermsType	= $('#display_terms_type').val();
	if((displayTerms == 'AUTO' && displayTermsType == 'LAYAWAY')){
		var params = new Array();
		params['yesMsg']	= "배송그룹 생성";
		params['noMsg']		= "배송그룹 연결";
		var msg				= "<div class='left pdb10 lh_normal'><span class='bold'>[예약상품 배송그룹 연결 권장사항]</span><br><br>본 상품은 예약기간 종료 후 배송하는 예약상품으로 본 상품만 배송하기 위한 배송그룹을 연결하세요.<br>즉, 해당 배송그룹에 연결된 상품은 본 상품 1개만 있어야 합니다.<br><br>예시1) ‘A’ 배송그룹에 1개의 예약상품을 연결하였을 경우<br>└ <font color='red'>문제가 없습니다. 권장합니다.</font><br><br>예시2) ‘A’ 배송그룹에 2개의 예약상품을 연결하였을 경우<br>2개의 예약상품이 함께 주문되었고<br>2개의 예약상품에 예약발송일이 다를 경우 가장 늦은 예약발송일이 소비자에게 안내됩니다.<br><br>예시3) 다른 일반상품이 연결된 ‘A’ 배송그룹에 예약상품을 연결하였을 경우<br>일반상품과 예약상품이 함께 주문되면 예약발송일이 소비자에게 안내되며, <br>관리자는 일반상품 부분출고, 예약상품 입고 후 예약상품 부분출고하거나<br>또는 예약상품 입고 후 일반상품과 예약상품을 함께 출고처리 할 수 있습니다.<br></div>";
		openDialogConfirm(msg, 650, 400,function(){
			window.open('/admin/setting/shipping_group');
		},function(){
			ship_grp_pop(provider_seq, shipping_group_seq);
		}, params);
	}else{
		// 선택 창
		if(type == 'select'){
			ship_grp_pop(provider_seq, shipping_group_seq);
		}else{
			// do done ..
		}
	}
}

function ship_grp_pop(provider_seq, shipping_group_seq){
	var url = '../goods/shipping_select_popup';
	var params = {'provider_seq':provider_seq,'shipping_group_seq':shipping_group_seq};
	$.get(url, params, function(data) {
		$("#shipping_grp_sel").html(data);
	});

	openDialog("배송비 선택", "shipping_grp_sel", {"width":670,"height":500,"show":"fade","hide":"fade"});
}

// 배송그룹명 추출 :: 2020-07-31 pjm
function get_shipping_group_info(shipping_group_seq){
	if(!shipping_group_seq) return false;
	$.ajax({
		'url' : '../goods/get_shipping_group_info',
		'data' : {'shipping_group_seq':shipping_group_seq, 'provider_seq':gl_provider_seq},
		'dataType' : 'json',
		'success' : function(data){
			if(typeof data != 'undefined' && data != null){
				var shipping_group_name = data.shipping_group_name;
				if(gl_provider_seq > 1 && shipping_group_seq == 1){
					shipping_group_name = "(본사배송)"+data.shipping_group_name;
				}
				$(".goods_shipping_group_name").html(shipping_group_name);
				$(".goods_shipping_group_name").attr("data-shipping_group_seq",data.shipping_group_seq);
				//$(".shipping_group_tb").find("tbody").html('');
				//$(".shipping_group_tb").find("tbody").html(html);
			}
		}
	});
}

// 배송그룹 추출 :: 2016-10-21 lwh
function get_shipping_group_html(shipping_group_seq){
	if(!shipping_group_seq) return false;
	$.ajax({
		'url' : '../goods/shipping_group_view',
		'data' : {'shipping_group_seq':shipping_group_seq, 'provider_seq':gl_provider_seq},
		'dataType' : 'html',
		'success' : function(html){
			$(".shipping_group_tb").find("tbody").html('');
			$(".shipping_group_tb").find("tbody").html(html);
		}
	});
}

// 배송방법 체크
function shipping_set_chk(){
	var shipping_set_code = $("select[name='shipping_set_code']").val();
	var shipping_set_name = $("select[name='shipping_set_code']").find('option:selected').text();
	
	$("input[name='shipping_set_code']").val(shipping_set_code);
	$("input[name='shipping_set_name']").val(shipping_set_name);
	
	// 매장수령시
	if(shipping_set_code == 'direct_store'){
		$(".std_btn_area").hide();
		$(".std_area_check").attr('disabled',true).attr('checked',false).trigger('change');
		$(".add_area_check").attr('disabled',true).attr('checked',false).trigger('change');
		$(".hop_area_check").attr('disabled',true).attr('checked',false).trigger('change');
		$(".reserve_area_check").attr('disabled',true).attr('checked',false).trigger('change');
		$(".store_area_check").attr('disabled',false).trigger('change');
		
		$("input[name='store_use']").attr('checked',true).trigger('change');
	}else{
		$(".std_btn_area").show();
		$(".std_area_check").attr('disabled',false).attr('checked',true).trigger('change');
		$(".add_area_check").attr('disabled',false).trigger('change');
		$(".hop_area_check").attr('disabled',false).trigger('change');
		$(".reserve_area_check").attr('disabled',false).trigger('change');
		$(".store_area_check").attr('disabled',true).attr('checked',false).trigger('change');
		issueAddressChk();
	}
}

// 배송설정 타입별 사용여부 체크
function set_type_used(set_type){
	var use_yn = $("input[name='"+set_type+"_use']").is(':checked');
	if(use_yn){
		$("."+set_type+"_tr").find(".add_zone, .zone_cnt").removeClass('gray').addClass('blue hand');
		$("."+set_type+"_area").attr('disabled',false);
		$("."+set_type+"_btn_area").show();
		$("."+set_type+"_tr").find(".shipping_opt_type").trigger('change');
		issueAddressChk();
		if(set_type == 'hop')
			$(".shipping-cost-today").attr('disabled',false); // 당일 배송비 기본 체크
	}else{
		$("."+set_type+"_tr").find(".add_zone, .zone_cnt").removeClass('blue hand').addClass('gray');
		$("."+set_type+"_area").attr('disabled',true);
		$("."+set_type+"_btn_area").hide();
		if(set_type == 'hop') {
			$(".hop_today").attr('checked',true); // 당일 배송비 기본 체크
			hop_today_use($(".hop_today"));
		}
	}
}

function issueAddressChk(){
	$(".issueCount").each(function(){
		var type	= $(this).closest('table').attr('price_type');
		if($("input[name='" + type + "_use']").is(':checked')){
			var sel_add = $(this).closest('th').find('.sel_address_txt_'+type).val();
			if(sel_add)	$(this).hide();
			else		$(this).show();
		}
	});
}

// 구간 입력시 자동 체크
function section_auto_chk(obj){
	// 현재 입력된 값
	var ed_val = $(obj).val();
	if(!ed_val) return false;

	// 이전 제한 값 체크
	var prev_ed = $(obj).closest("tr").prev().find(".section_ed_input").val();
	if(typeof prev_ed == 'string'){
		if(prev_ed > 0 && parseFloat(prev_ed) >= parseFloat(ed_val)){
			$(obj).val(Number(prev_ed)+1).trigger('onblur');
			alert('최소 ' + prev_ed + '이상 입력되어야 합니다.');
			return false;
		}
	}else if(prev_ed == undefined){
		var opt_type	= $(obj).closest('table').find(".shipping_opt_type").val();
		var tfoot_val	= $(obj).closest('tfoot').find(".section_ed_input").val();
		var min_val		= false;
		if(opt_type.match("_rep") && tfoot_val){
			if(ed_val < 1)	min_val = 1;
		}else{
			// 네이버페이 수량(구간반복) 으로 인해 수정 2018-05-23
			if( opt_type.match("cnt") && opt_type.match("_rep") ) {
				if(ed_val< 1) min_val = 1;
			} else if(ed_val < 2 ) {
				min_val = 2;
			}
		}

		if(min_val && opt_type.match("cnt")){
			$(obj).val(min_val).trigger('onblur');
			alert('최소 ' + min_val + '이상 입력되어야 합니다.');
			return false;
		}else if(ed_val <= 0 && (opt_type.match("amount") || opt_type.match("weight"))){
			$(obj).val(1).trigger('onblur');
			alert('최소값은 0이 될수 없습니다.');
			return false;
		}
	}
	// 다음 제한 값 체크
	var next_ed = $(obj).closest("tr").next().find(".section_ed_input").val();
	if(typeof next_ed == 'string'){
		if(next_ed > 0 && parseFloat(next_ed) <= parseFloat(ed_val)){
			$(obj).val(Number(next_ed)-1).trigger('onblur');
			alert(next_ed + '미만으로 입력되어야 합니다.');
			return false;
		}
	}

	// 하위 st에 자동입력
	var next_st = $(obj).closest("tr").next().find(".section_st_input").val();
	if(typeof next_st == 'undefined' && $(obj).closest("tfoot").html() == null){
		$(obj).closest(".price_set_area").find("tfoot").find(".section_st_input").val(ed_val);
	}else{
		$(obj).closest("tr").next().find(".section_st_input").val(ed_val);
	}
}

// 배송방법별 Table 변경
function shipping_opt_type(obj, datas){
	// free - 무료 / fixed - 고정 / amount - 금액 / amount_rep - 금액반복 / cnt - 수량 / cnt_rep - 수량반복 / weight - 무게 / weight_rep - 무게반복
	var type	= $(obj).val(); // 타입
	var tbObj	= $(obj).closest(".price_set_area");	// 테이블 Obj
	var tbodyTr = $(tbObj).find("tbody > tr").index();	// TR 갯수
	var del_lmit= $("input[name='delivery_limit']:checked").val();
	var chg_unit= unit;
	var p_type	= $(obj).closest(".price_set_area").attr('price_type');

	$(tbObj).find(".add-col").show();
	$(tbObj).find(".shipping-cost-input").attr('disabled',false);
	$(tbObj).find(".hop_today").attr('disabled',false);
	$(tbObj).find(".zone_area_add_btn").show();
	if(del_lmit == 'unlimit'){
		$(".basic_shipping_area").find(".zone_area_add_btn").hide();
		// 기존 설정된 지역 초기화
		$(".basic_shipping_area").find(".zone_address_area").html('');
	}
	
	if(type == 'free'){ // 무료
		zone_area_reset(obj);
		$(tbObj).find(".add-col").hide();
		$(tbObj).find(".zone_area_add_btn").hide();
		$(tbObj).find(".last-tr-base").hide(); // 마지막 행
		$(tbObj).find(".section_area_add_btn").hide(); // 구간 추가 버튼
		$(tbObj).find(".section_area_input").hide(); // 구간 input박스
		$(tbObj).find(".shipping-cost-input").attr('disabled',true); // 금액 input박스
		$(tbObj).find(".shipping-cost-input").val('0');
		/*
		무료 - 당일 배송비는 입력 가능하도록 처리 2019-04-17 #32370 by hyem
		$(tbObj).find(".shipping-cost-today").attr('disabled',true); // 당일 input박스
		$(tbObj).find(".shipping-cost-today").val('0');
		$(tbObj).find(".hop_today").attr('disabled',true); // 당일 체크박스
		*/
	}else if(type == 'fixed'){ // 고정
		$(tbObj).find(".last-tr-base").hide();
		$(tbObj).find(".section_area_add_btn").hide();
		$(tbObj).find(".section_area_input").hide();
	}else if(type == 'amount' || type == 'amount_rep'){ // 금액
		$(tbObj).find(".last-tr-base").show();
		$(tbObj).find(".section_area_add_btn").show();
		$(tbObj).find(".section_area_input").show();
		chg_unit = unit;
	}else if(type == 'cnt' || type == 'cnt_rep'){ // 수량
		$(tbObj).find(".last-tr-base").show();
		$(tbObj).find(".section_area_add_btn").show();
		$(tbObj).find(".section_area_input").show();
		chg_unit = '개';
	}else if(type == 'weight' || type == 'weight_rep'){ // 무게
		$(tbObj).find(".last-tr-base").show();
		$(tbObj).find(".section_area_add_btn").show();
		$(tbObj).find(".section_area_input").show();
		chg_unit = 'Kg';
	}
	
	$(tbObj).find(".section_st_unit").html(chg_unit + ' 이상');
	$(tbObj).find(".section_ed_unit").html(chg_unit + ' 미만');

	if(type == 'free' || type == 'fixed'){ // 무료 또는 고정일때 추가된 Tr 삭제
		$(tbObj).find("tbody > tr").each(function(idx,obj){
			if(idx != 0 && tbodyTr != (idx-1)) {
				$(obj).remove();
			}
		});
	}

	if(type.search('rep') >= 0){
		// 추가 삭제 버튼 hide
		$(tbObj).find(".section_area_add_btn").hide();

		// 마지막 행 end show
		$(tbObj).find(".last-tr-base").find(".suffix").show();

		// uint 변경
		$(tbObj).find(".last-tr-base").find(".section_st_unit").html(chg_unit + ' 부터는');
		$(tbObj).find(".last-tr-base").find(".section_ed_unit").html(chg_unit + ' 당');

		// 구간 입력 TR 삭제
		var last_tbody_ed = $(tbObj).find(".section_ed_input").val();
		if(tbodyTr > 0){
			$(tbObj).find("tbody > tr").each(function(idx,obj){
				if(idx == 0) {
					last_tbody_ed = $(obj).find(".section_ed_input").val();
				}else{
					$(obj).remove();
				}
			});
		}
		$(tbObj).find("tfoot").find(".section_st_input").val(last_tbody_ed);
	}else{
		$(tbObj).find(".last-tr-base").find(".suffix").hide();
	}

	// 데이터 채워넣기..
	if	(datas){
		if	(datas.use == 'Y')	{
			addModifyForm(datas);
		}
	}
}

// 수정 데이터 삽입 함수
function addModifyForm(datas){

	var tb			= $('table#price_' + datas.opt_type);
	var zone_text	= '';
	var chk_today	= '';
	var nation		= $('input[name="delivery_nation"]').val();
	
	// 기본 폼 레이아웃 생성
	if	(datas.area_name.length >= 1){
		for	(i = 0; i < datas.area_name.length; i++){
			chk_today	= '';
			if	(i > 0){
				add_price_section(tb.find('span.zone_area_add_btn').eq(0),'zone');
			}
			
			if(datas.zone_count[i] > 0){
				zone_text	= '<span class="std_btn_area issueCount" style="left:45px;top:0px;display:none;"><input type="hidden" class="issue" name="issue[' + datas.opt_type + '][]" value="'+datas.zone_count[i]+'" /><span class="hgi-left"><span class="hgi-right"><span class="hgi-bg">!</span></span></span></span>'
				+ ' <span class="add_zone blue hand" data-total="' + datas.zone_count[i] + '" data-seq="' + datas.zone_cost_seq[i] + '" onclick="add_zone_pop(this);">' + datas.area_name[i] + '<input type="hidden" name="shipping_area_name[' + datas.opt_type + '][]" value="' + datas.area_name[i] + '"><input type="hidden" name="zone_count[' + datas.opt_type + '][]" value="' + datas.zone_count[i] + '"><input type="hidden" name="zone_cost_seq[' + datas.opt_type + '][]" value="' + datas.zone_cost_seq[i] + '"></span>'
				+ '<span class="zone_cnt blue hand">(' + datas.zone_count[i] + ')</span>';
			
				if	(datas.opt_type == 'hop'){
					if	(datas.today_yn != null && datas.today_yn[i] == 'Y')
						chk_today	= 'checked';
					zone_text	+= '<span class="zone_today"> (<label><input name="shipping_today_yn[]" class="hop_area hop_today" onclick="hop_today_use(this);" type="checkbox" value="Y" ' + chk_today + ' /> 당일</label>)</span>'
								+ '<span><input name="today_yn[]" class="today_yn" type="hidden" value=""></span>';
				}
				tb.find('span.zone_text').eq(i).html(zone_text);
				if	(datas.opt_type == 'hop'){
					hop_today_use(tb.find('span.zone_text').eq(i).find("input[name='shipping_today_yn[]']"));
				}
			} else {
				$("#price_"+datas.opt_type).find(".zone_idx_"+i).find(".add_zone").attr('data-total', datas.zone_count[i]);
				$("#price_"+datas.opt_type).find(".zone_idx_"+i).find(".add_zone").attr('data-seq', datas.zone_cost_seq[i]);
				$("#price_"+datas.opt_type).find(".zone_idx_"+i).find(".add_zone").append('<input type="hidden" name="shipping_area_name[' + datas.opt_type + '][]" value="' + datas.area_name[i] + '"><input type="hidden" name="zone_count[' + datas.opt_type + '][]" value="' + datas.zone_count[i] + '"><input type="hidden" name="zone_cost_seq[' + datas.opt_type + '][]" value="' + datas.zone_cost_seq[i] + '">');
			}

			if(nation != 'korea' && datas.street !== null){
				for	(j = 0; j < datas.street[i].length; j++){
					tb.find('div.zone_address_area').eq(i).append('<input name="sel_address_street[' + datas.opt_type + '][' + i + '][]" class="sel_address_street_' + datas.opt_type + '" type="hidden" value="' + datas.street[i][j] + '">');
					tb.find('div.zone_address_area').eq(i).append('<input name="sel_address_zibun[' + datas.opt_type + '][' + i + '][]" class="sel_address_zibun_' + datas.opt_type + '" type="hidden" value="' + datas.zibun[i][j] + '">');
					tb.find('div.zone_address_area').eq(i).append('<input name="sel_address_join[' + datas.opt_type + '][' + i + '][]" class="sel_address_join_' + datas.opt_type + '" type="hidden" value="' + datas.join[i][j] + '">');
					tb.find('div.zone_address_area').eq(i).append('<input name="sel_address_txt[' + datas.opt_type + '][' + i + '][]" class="sel_address_txt_' + datas.opt_type + '" type="hidden" value="' + datas.txt[i][j] + '">');
				}
			}
		}
	}
	
	var sectionLen	= datas.section_st.length;
	for	(i = 0; i < sectionLen; i++){
		tb.find('input.section_st_input').eq(i).val(datas.section_st[i]);
		tb.find('input.section_ed_input').eq(i).val(datas.section_ed[i]);
		
		tb.find('input[name="shipping_opt_seq[' + datas.opt_type + '][]"').eq(i).val(datas.shipping_opt_seq[i]);
		if	(sectionLen > 2 && i < (sectionLen - 2)){
			add_price_section(tb.find('div.section_area_add_btn').eq(0),'section');
		}
	}
	tb.find('tfoot').find('input.section_st_input').val(datas.section_st[sectionLen - 1]);
	tb.find('tfoot').find('input.section_ed_input').val(datas.section_ed[sectionLen - 1]);
	
	// 넘어온 값으로 채우기
	var costLen1		= datas.shipping_cost.length;
	var costLen2		= 0;
	var tmp_today_cost	= 0;
	
	for	(i = 0; i < costLen1; i++){
		costLen2	= datas.shipping_cost[i].length;
		for	(j = 0; j < costLen2; j++){
			if	(i == (costLen1 - 1) && costLen1 > 1){
				tb.find('tfoot').find('tr').find("input[name='shipping_cost[" + datas.opt_type + "][]']").eq(j).val(datas.shipping_cost[i][j]);
				tb.find('tfoot').find('tr').find("input[name='shipping_cost_seq[" + datas.opt_type + "][]']").eq(j).val(datas.shipping_cost_seq[i][j]);
			}else{
				tb.find('tbody').find('tr').eq(i).find("input[name='shipping_cost[" + datas.opt_type + "][]']").eq(j).val(datas.shipping_cost[i][j]);
				tb.find('tbody').find('tr').eq(i).find("input[name='shipping_cost_seq[" + datas.opt_type + "][]']").eq(j).val(datas.shipping_cost_seq[i][j]);
			}
			if	(datas.opt_type == 'hop'){
				if(datas.today_cost == null)	tmp_today_cost = 0;
				else							tmp_today_cost = datas.today_cost[i][j];

				if	(i == (costLen1 - 1) && costLen1 > 1){
					tb.find('tfoot').find('tr').find("input[name='shipping_cost_today[" + datas.opt_type + "][]']").eq(j).val(tmp_today_cost);
				}else{
					tb.find('tbody').find('tr').eq(i).find("input[name='shipping_cost_today[" + datas.opt_type + "][]']").eq(j).val(tmp_today_cost);
				}
			}
		}
	}
}

// 지역 초기화
function zone_area_reset(obj){
	var delIdx = 0;
	var target = 0;

	$(obj).closest("table").find("thead th").each(function(idx){
		if(idx > 1){
			target = idx - delIdx;
			$(obj).closest("table").find("thead th").eq(target).remove();
			$(obj).closest("table").find("tbody > tr, tfoot > tr").each(function(){
				$(this).find("td").eq(target).remove();
			});
			delIdx++;
		}
	});
}

// 지역 및 구간 추가
function add_price_section(obj,type){
	// 지역 추가
	if(type == 'zone'){
		// 지역 컬럼
		var sectionHtml	= $(obj).closest("th").clone();
		var last_idx	= $(obj).closest("thead").find(".zone_text").eq(-1).attr('idx');
		var new_idx		= parseInt(last_idx)+1;
		var p_type		= $(obj).closest("table").attr('price_type');
		$(sectionHtml).find(".zone_text").attr('idx',new_idx);
		$(sectionHtml).find(".add_zone").text(zoneTxt+(new_idx+1));
		$(sectionHtml).find(".issueCount").show();
		$(sectionHtml).find(".zone_idx_0").removeClass("zone_idx_0").addClass("zone_idx_"+new_idx);
		$(sectionHtml).find(".zone_cnt").text('(0)');
		$(sectionHtml).find(".issue").val('0');
		$(sectionHtml).find(".zone_address_area").html('');
		$(sectionHtml).find(".ctrl-btn").removeClass('active').addClass('active3');
		$(sectionHtml).find(".ctrl-btn").text('삭제').attr("onClick", null).click(function(){
			del_price_section(this, type);
		});
		$(sectionHtml).find(".add_zone").removeAttr("data-seq");
		$(sectionHtml).find(".add_zone").removeAttr("data-total");
		$(sectionHtml).find(".add_zone").append('<input type="hidden" name="shipping_area_name['+p_type+'][]" value="'+zoneTxt+(new_idx+1)+'">');
		
		$(obj).closest("tr").append(sectionHtml);
		
		//데이터 셀
		$(obj).closest("table").find("tbody > tr, tfoot > tr").each(function(){
			var cellHtml = $(this).find("td").eq(1).clone();
			$(cellHtml).find("input").val('0');
			$(cellHtml).find(".today_idx_0").removeClass("today_idx_0").addClass("today_idx_"+new_idx);
			$(this).append(cellHtml);
		});

	// 구간 추가
	}else if(type == 'section'){
		var sectionHtml = $(obj).closest("tr").clone();
		var last_idx = $(obj).closest("tbody").find("tr").index();
		var last_ed_input = $(obj).closest("tbody").find("tr").eq(last_idx).find(".section_ed_input");
		var last_val = last_ed_input.val();
		if(last_val == 0 || !last_val){
			alert('먼저 마지막 구간의 미만값을 설정해주세요.');
			last_ed_input.focus();
			last_ed_input.val('');
			return false;
		}

		$(sectionHtml).find("input").val('0');
		$(sectionHtml).find(".ctrl-add-btn").removeClass('cyanblue').addClass('red');
		$(sectionHtml).find(".ctrl-btn").text('삭제').attr("onClick", null).click(function(){
			del_price_section(this, type);
		});
		$(sectionHtml).find(".section_st_input").val(last_val);
		$(sectionHtml).find(".section_ed_input").val(Number(last_val)+1);
		$(obj).closest("table").find("tfoot>tr").find(".section_st_input").val(Number(last_val)+1);
		$(obj).closest("tbody").append(sectionHtml);

		// 추가된 행에 포커스
		$(obj).closest("tr").eq(-1).prev().find(".section_ed_input").focus();
		
		if($(obj).prop("tagName") == 'BUTTON'){
			set_section_addr(obj, last_idx);
		}
	}
}

function set_section_addr(obj, idx){
	var shipping_group_seq = $("input[name='shipping_group_seq").val();
	var shipping_set_seq = $("input[name='shipping_set_seq").val();
	var set_type = $(obj).closest("table").attr("price_type");
	
	var section_st = new Array;
	$("input[name='section_st["+set_type+"][]']").each(function(index, val) {
		if(idx < index){
			section_st.push($(this).val());
		}
	});
	
	var section_ed = new Array;
	$("input[name='section_ed["+set_type+"][]']").each(function(index, val) {
		if(idx < index){
			section_ed.push($(this).val());
		}
	});
	
	$.ajax({
		'url' : '../setting/set_section_addr',
		'data' : { 'shipping_set_seq': shipping_set_seq, 'shipping_group_seq': shipping_group_seq, 'idx': idx, 'shipping_set_type': set_type, 'section_st': section_st, 'section_ed': section_ed },
		'dataType' : 'json', //'json'
		'success' : function(res){
			if(res == 'ERROR'){
				alert('섹션 등록 실패');
				return false;
			}
			
			$("input[name='shipping_opt_seq["+set_type+"][]']").each(function(index, val) {
				if(res.options[index] > 0){
					$(this).val(res['options'][index]);
					
					var areaLength = res['costs'][index].length;
					var costIdx = parseInt(index) * parseInt(areaLength);
					
					$(res['costs'][index]).each(function(cIdx, cVal){
						$("input[name='shipping_cost_seq["+set_type+"][]']").eq(costIdx).val(cVal);
						costIdx++;
					});
				}
			});
		}
	});
}

// 구간 및 지역 삭제
function del_price_section(obj, type){
	if(type == 'zone'){
		// 지역 컬럼 index 가져와서 index 맞는 th, td 다 지움
		var objIndex = $(obj).closest("th").index();
		$(obj).closest("table").find("tbody > tr, tfoot > tr").each(function(){
			$(this).find("td").eq(objIndex).remove();
		});
		del_zone_addr(obj);
		$(obj).closest("table").find("tr th").eq(objIndex).remove();
	}else if(type == 'section'){
		var target_st = $(obj).closest("tr").find(".section_st_input").val();

		// undefined 일경우 tfoot 예외처리
		var next_st = $(obj).closest("tr").next().find(".section_st_input").val();
		if(typeof next_st == 'undefined'){
			$(obj).closest(".price_set_area").find("tfoot").find(".section_st_input").val(target_st);
		}else{
			$(obj).closest("tr").next().find(".section_st_input").val(target_st);
		}
		del_sec_addr(obj);
		$(obj).closest("tr").remove();
	}
}

function del_sec_addr(obj){
	var shipping_group_seq = $("input[name='shipping_group_seq").val();
	var shipping_set_seq = $("input[name='shipping_set_seq").val();
	var set_type = $(obj).closest("table").attr("price_type");
	var idx = $(obj).closest("tr").index();
	
	var section_st = new Array;
	$("input[name='section_st["+set_type+"][]']").each(function(index, val) {
		if(index != idx){
			section_st.push($(this).val());
		}
	});
	var section_ed = new Array;
	$("input[name='section_ed["+set_type+"][]']").each(function(index, val) {
		if(index != idx){
			section_ed.push($(this).val());
		}
	});

	$.ajax({
		'url' : '../setting/shipping_sec_delete',
		'data' : { 'shipping_set_seq': shipping_set_seq, 'shipping_group_seq': shipping_group_seq, 'idx': idx, 'shipping_set_type': set_type, 'section_st': section_st, 'section_ed': section_ed },
		'dataType' : 'json', //'json'
		'success' : function(res){
			if(res == 'ERROR'){
				alert('지역 삭제 실패');
				return false;
			}
		}
	});
}

function del_zone_addr(obj, delivery_limit){
	//idx 재설정
	$(obj).closest('th').siblings().find('.zone_text').each(function(index, val){
		if(index > 0){;
			$(this).removeClass();
			$(this).addClass("zone_text zone_idx_"+index);
			$(this).attr('idx', index);
		}
	});
	
	var shipping_group_seq = $("input[name='shipping_group_seq']").val();
	var shipping_set_seq = $("input[name='shipping_set_seq']").val();
	
	if(!delivery_limit){
		var idx = $(obj).closest('th').find('.zone_text').attr('idx');
		var set_type = $(obj).closest("table").attr("price_type");
	} else {
		var idx = 0;
		var set_type = 'std';
	}
	
	var shipping_cost_seq = $(obj).closest('th').find('.add_zone').data('seq');

	if(shipping_cost_seq > 0){
		$.ajax({
			'url' : '../setting/shipping_otp_delete',
			'data' : { 'shipping_set_seq': shipping_set_seq, 'shipping_group_seq': shipping_group_seq, 'idx': idx, 'shipping_set_type': set_type, 'delivery_limit': delivery_limit, 'nation': nation },
			'dataType' : 'json', //'json'
			'success' : function(res){
				if(res == 'ERROR'){
					alert('지역 삭제 실패');
					return false;
				}
				
				if(delivery_limit == 'limit'){
					$("#price_std").find(".add_zone").attr("data-seq", res);
					$("#price_std").find(".add_zone").attr("data-total", 0);
					$("#price_std").find(".add_zone").append('<input type="hidden" name="shipping_area_name[std][]" value="지역1">');
					$("#price_std").find(".add_zone").append('<input type="hidden" class="issue" name="issue[std][]" value="0" />');
				}
			}
		});
	}
}

// 지역 추가 팝업창 호출
function add_zone_pop(obj){
	var p_type	= $(obj).closest(".price_set_area").attr('price_type');
	var idx		= $(obj).closest(".zone_text").attr('idx');

	//기존 등록 지역 리스트 불러오기
	var datas = new Array();
	datas['shipping_cost_seq']	= $(obj).attr("data-seq");
	datas['total']				= $(obj).attr("data-total");
	datas['shipping_set_seq']	= $("input[name='shipping_set_seq']").val();
	datas['shipping_group_seq']	= $("input[name='shipping_group_seq']").val();
	datas['shipping_set_type']	= $(obj).closest("table").attr('price_type');
	datas['option_seqs']		= $("input[name='option_seqs_"+datas['shipping_set_type']+"']").val();
	
	// 사용 가능상태에서만 지역 팝업창 호출
	if($("input[name='" + p_type + "_use']").is(':checked')){
		openDialogzone(nation,p_type,idx,datas);
	}
}

// 선택 불가일 설정
function set_hopeday(obj){
	var sel_day = $(obj).val();
	var target_input = $(obj).closest("td").find(".limit_day_input");
	var limit_day = target_input.val();

	// 년도 제거
	sel_day = sel_day.substring(5);

	if(limit_day){
		target_input.val(limit_day + ', ' + sel_day);
	}else{
		target_input.val(sel_day);
	}
}

// 선택 불가일 추가
function hope_add(obj){
	var hope_year = $(".hope_year").eq(-1).val();
	hope_year = parseInt(hope_year) + 1;

	var hopeHtml = '';
	hopeHtml += '<tr>';
	hopeHtml += '	<td>';
	hopeHtml += '		<input type="text" name="hope_year[]" class="hop_area hope_year" value="' + hope_year + '" size="4" maxlength="4">년';
	hopeHtml += '		<span class="hop_btn_area"><input type="button" onclick="hope_add(this);" class="btn_plus"/></span>';
	hopeHtml += '	</td>';
	hopeHtml += '	<td>';
	hopeHtml += '		<input type="text" class="hop_area limit_day_input" name="hopeday_limit_day[]" value="" style="width:90%;" />';
	hopeHtml += '		<input type="text" name="day_tmp[]" value="" onchange="set_hopeday(this);" class="datepicker hide" />';
	hopeHtml += '	</td>';
	hopeHtml += '</tr>';

	$(obj).closest(".hop_btn_area > input").attr('onclick','hope_del(this);');
	$(obj).closest(".hop_btn_area > input").removeClass("btn_plus");
	$(obj).closest(".hop_btn_area > input").addClass("btn_minus");

	$(".hope_day_tb").find("tbody").append(hopeHtml);
	setDatepicker($(".datepicker"));
}

// 선택 불가일 삭제
function hope_del(obj){
	$(obj).closest("tr").remove();
}

// 희망배송일 당일 체크시
function hop_today_use(obj){
	var target_idx	= $(obj).closest(".zone_text").attr('idx');
	var today_yn	= $(obj).closest(".zone_text").find(".today_yn");
	var today_input = $(".shipping-cost-today").eq(target_idx);
	
	if($(obj).is(':checked')){
		today_yn.val('Y');
		$(obj).closest("table").find("tbody > tr, tfoot > tr").each(function(){
			$(this).find(".today_idx_"+target_idx).attr('disabled',false);
		});
	}else{
		today_yn.val('N');
		$(obj).closest("table").find("tbody > tr, tfoot > tr").each(function(){
			$(this).find(".today_idx_"+target_idx).attr('disabled',true);
		});
	}
}

// 수령매장 설정 팝업창
function shipping_address_pop(use_type){
	if(typeof(default_yn) == 'undefined'){ // 다른창 예외처리
		default_yn = 'N';
	}

	// 기본 그룹만 설정 가능
	if(default_yn != 'Y' && use_type == 'refund'){
		alert('기본배송그룹의 반송지를 공통으로 사용합니다.\n기본배송그룹에서 반송지를 설정하세요.');
		return false;
	}

	var shipping_address_seqs = "";
    $('input[name="shipping_address_seq[]"]').each(function (idx, ele) {
        shipping_address_seqs += $(this).val()+"|";
    }).get();

	var url = '../popup/shipping_address_pop';
	var params = {'use_type':use_type, 'shipping_address_seqs': shipping_address_seqs}; // 팝업창 사용처

	$.get(url, params, function(data) {
		$("#shipping_address_pop_area").html(data);
	});

	openDialog("장소리스트", "shipping_address_pop_area", {"width":1100,"height":750});
}

// 수령매장 리스트 삭제
function del_address(obj){
	$(obj).closest("tr").remove();
}

// 안내문구
function ship_desc_pop(set_info){
	var url = '../popup/shipping_desc_pop';
	var params = {'set_seq':set_info};

	$.get(url, params, function(data) {
		$("#shipDescPopup").html(data);
	});

	openDialog("상품상세페이지 배송안내", "shipDescPopup", {"width":550});
}

// 배송안내 안내 컨텐츠
function btn_delivery_desc(obj){
	$("#ship_set_pop_area").html($(obj).closest("tr").find(".delivery-info-lay").html());
	openDialog("설정된 배송안내", "ship_set_pop_area", {"width":500,"height":250});
}

// 배송지역 내용 상세 팝업
function ship_zone_pop(obj, shipping_cost_seq){
	$("#ship_zone_pop_area").html($(obj).closest("th").find(".zone_address_pop").html());
	openDialog("설정된 지역/국가", "ship_zone_pop_area", {"width":500,"height":400});
}

function ship_zone_pop_ajax(obj, shipping_cost_seq, total, perpage, offset){
	var html = '';
	var divName = 'zone_address_pop_'+shipping_cost_seq;
	
	$.ajax({
		'url' : '../setting/shipping_zone_list',
		'data' : {'shipping_cost_seq': shipping_cost_seq, 'total': total, 'perpage': perpage, 'offset': offset},
		'dataType' : 'json', //'json'
		'success' : function(res){
			$.each(res.list, function( index, value ) {
				var num = ((((perpage-1) * offset) + index) + 1);
				html += '<tr>';
				html += '<td class="its-td center">'+ num + '</td>';
				html += '<td class="its-td center">'+ value.area_detail_address_txt + '</td>';
				html += '</tr>';
			});

			$('#'+divName).find('tbody').html(html);
			$('#'+divName+' .paging_navigation').html(res.paging);
			
			openDialog("설정된 지역/국가", divName, {"width":500,"height":500});
		}
	});
}

// 반송지 안내 팝업창
function ship_adress_pop(){
	openDialog("반송지 사용안내", "refund_address_pop_area", {"width":550,"height":230});
}

// 배송비계산기준 안내 건텐츠
function ship_calcul_pop(){
	openDialog("안내) 묶음계산, 개별계산, 무료계산", "ship_calcul_type_area", {"width":960,"height":660});
}

// 배송 금액 안내 팝업
function ship_opt_pop(){
	openDialog("안내) 금액/수량/무게 기준", "ship_calcul_pop_area", {"width":750,"height":300});
}

// 상품리스트영역에서의 상품별 배송비 안내 건텐츠
function ship_price_pop(){
	openDialog("상품리스트화면에서 상품별 배송비", "ship_goodsprice_pop_area", {"width":980,"height":520});
}

//###################### 출고 관련 #########################//

// 배송방법 변경 레이어창
// p_type	-> order : shipping_seq / export : export_code
// process	-> realtime : 실시간 변경 처리 / after : 변경정보만 리턴
function ship_chg_popup(identity_seq, p_type, process){
	
	var url		= '../popup/shipping_chg_pop';
	var params	= {'identity_seq':identity_seq,'p_type':p_type,'process':process};

	if($("#shipping_chg_pop_area").length == 0){
		var divHtml = '<div id="shipping_chg_pop_area" class="hide"></div>';
		$("body").append(divHtml);
	}

	$.get(url, params, function(data) {
		$("#shipping_chg_pop_area").html(data);
	});

	openDialog("배송그룹/방법 변경", "shipping_chg_pop_area", {"width":370,"height":350});
}

// 출고지 정보 팝업
function address_pop(address_category, address_name, view_address, shipping_phone){

	//console.log(address_category + ' - ' + address_name + ' - ' + view_address + ' - ' + shipping_phone);

	$("#address_category").html(address_category);
	$("#address_name").html(address_name);
	$("#view_address").html(view_address);
	$("#shipping_phone").html(shipping_phone);

	openDialog("출고지 안내", "address_dialog", {"width":600,"height":380});
}

// 수령매장 정보 셋팅
function store_set(store_obj, identity_seq){
	var scm_type = $(store_obj).children('option:selected').attr('scm_type');
	$(".store_scm_type_"+identity_seq).val(scm_type);
}

// 배송비 자동안내 설명 팝업
function auto_info_pop(){
	openDialog("자동안내 설명", "autoinfoPopup", {"width":1220,"height":800});
}

// EP 노출배송비 타입 설정 - 상품상세에서 체크 :: 2017-02-22 lwh
function feed_ship_chk(){

	$(".epcls").hide();

	var feed_type		= null;
	var feed_ship_type	= $(".feed_shipp_type:checked").val();
	if (feed_ship_type == 'E'){ // E:개별설정
		$(".epSel").show();
	}else if (feed_ship_type == 'S'){ // S:통합설정
		$(".epLink").show();
		$(".epTxt").show();
		$(".epSel").hide();

		// 통합설정을 가져온다.
		feed_type = feed_ship_type;
	}else{ // G:그룹설정
		$(".epTxt").show();
		$(".epSel").hide();

		// 현재 설정된 배송그룹을 가져온다.
		feed_type = feed_ship_type;
	}

	// 노출 배송비 가져오기
	if(feed_type){
		var ship_grp_seq = $("#shipping_group_seq").val();
		if(ship_grp_seq){
			$.ajax({
				'url' : '../goods/get_shipping_grp_ajax',
				'data' : {'shipping_group_seq':ship_grp_seq, 'feed_type':feed_type},
				'dataType' : 'json', //'json'
				'success' : function(res){
					if(!res)	return false;

					if(res.std == '0')		$(".ep_std_txt").html('무료');
					else if(res.std == '-1')$(".ep_std_txt").html('착불');
					else					$(".ep_std_txt").html(res.std);

					if(res.add){
											$(".ep_add_txt").html(res.add);
											$(".ep_add_area").show();
					}else{
											$(".ep_add_txt").html('');
											$(".ep_add_area").hide();
					}
				}
			});
		}
	}
}

// EP 마켓팅 배송데이터 설정 :: 2017-02-22 lwh
function ep_market_set(){
	var feed_pay_type = $("input[name='feed_pay_type']:checked").val();
	if (feed_pay_type == 'fixed'){
		$("input[name='feed_std_fixed']").attr("disabled", false);
		$("input[name='feed_std_postpay']").attr("disabled", true);
		$("#feed_add_txt").attr("disabled", false);
	} else if(feed_pay_type == 'postpay'){
		$("input[name='feed_std_fixed']").attr("disabled", true);
		$("input[name='feed_std_postpay']").attr("disabled", false);
		$("#feed_add_txt").attr("disabled", true);
	} else {
		$("input[name='feed_std_fixed']").attr("disabled", true);
		$("input[name='feed_std_postpay']").attr("disabled", true);
		$("#feed_add_txt").attr("disabled", false);
	}	
}

// EP 마켓팅 추가배송비 텍스트 체크 :: 2017-02-22 lwh
function ep_addtxt_chk(){
	var feed_add_txt = $("#feed_add_txt").val();	
	if(feed_add_txt.length > 50){
		feed_add_txt = feed_add_txt.substring(0,50);
		$("#feed_add_txt").val(feed_add_txt);
		$("#addcnt").addClass('red');
	}else{
		$("#addcnt").removeClass('red');
	}
	$("#addcnt").html(feed_add_txt.length);
}

// 배송조회
function goDeliverySearch(obj){
	var code	= $(obj).closest('tr').find('.delivery_company_code').val();
	var number	= $(obj).closest('td').find('.delivery_number').val();
	var provider= $(obj).closest('tr').find('.shipping_provider_seq').val();
	open_search_delivery(code, number, '', provider);
}

//배송그룹별 계산기준 변경
function calcul_chg(){
	$(".chk_calcul").attr('disabled',true);
	$(".chk_calcul").attr('checked',false);
	$(".chk_free").attr('disabled',true);
	$(".chk_free").attr('checked',false);
	var calcul_type = $("input[name='shipping_calcul_type']:checked").val();
	$("input[name='" + calcul_type + "_calcul_free_yn']").attr('disabled',false);
	var shipping_calcul_txt = '묶음계산-묶음배송';

	if(calcul_type == 'bundle')	{
		shipping_calcul_txt = '묶음계산-묶음배송';
		$(".bundleCalculDetail").show()
		$(".eachCalculDetail").hide()

	}else if(calcul_type == 'each')		{
		shipping_calcul_txt = '개별계산-개별배송';
		$(".bundleCalculDetail").hide()
		$(".eachCalculDetail").show()
	}else if(calcul_type == 'free')		{
		shipping_calcul_txt = '무료계산-묶음배송';
		$(".bundleCalculDetail").hide()
		$(".eachCalculDetail").hide()
	}
	$(".shipping_calcul_txt").html(shipping_calcul_txt);
}

// 배송그룹별 무료화 변경
function calcul_chg_free(obj){
	var chk_flag	= $(obj).is(":checked");
	var calcul_type	= $(obj).attr('cal_type');
	if(chk_flag){
		$("input[name='" + calcul_type + "_std_free_yn']").attr('disabled',false);
		$("input[name='" + calcul_type + "_add_free_yn']").attr('disabled',false);
		$("input[name='" + calcul_type + "_hop_free_yn']").attr('disabled',false);
	}else{
		$(".chk_calcul").attr('disabled',true);
	}
}

// 배송가능 국가별 팝업
function add_national_pop(nation, shipping_group_seq){
	var shipping_provider_seq = $('input[name="shipping_provider_seq"]').val(); // 배송그룹을 만든 입점사
	var provider_seq = $("input[name='provider_seq']").val(); // 현재 입점사
	var admin_shipping_group = $("input[name='admin_shipping_group']").val();
	if (shipping_provider_seq > 1 && admin_shipping_group == 1) {
		alert('입점사정보는 추가할 수 없습니다.');
		return false;
	}
	if($(".cl_shipping_set_code").length >= 6){
		alert('더이상 추가 하실수 없습니다.\n한 배송그룹 내에 배송방법은 최대 6개입니다.');
		return false;
	}
	var calcul_type = $("input[name='shipping_calcul_type']:checked").val();
	var shipping_group_dummy_seq = $("input[name='shipping_group_dummy_seq']").val();
	var url = './add_national_pop?nation=' + nation + '&calcul_type=' + calcul_type + '&shipping_group_seq=' + shipping_group_dummy_seq + '&shipping_group_dummy_seq=' + shipping_group_dummy_seq;
	var win = window.open(url,'add_national_pop','toolbar=no, scrollbars=yes, resizable=yes, width=1265, height=900');
	win.focus();
}

// 안내문구 설정 팝업
function set_lang_pop(type){
	if	(type == 'view'){
		openDialog("리스트페이지의 배송안내 문구 설정", "ship_txt_view_lay", {"width":"900","show" : "fade","hide" : "fade"});
	}else{
		openDialog("리스트페이지의 배송안내 문구 설정", "ship_txt_set_lay", {"width":"900","show" : "fade","hide" : "fade"});
	}
}

// 배송안내 안내문구 설정 저장
function save_ship_msg(){
	$("form[name='msg_frm']").submit();
}
// 배송안내 안내문구 설정 닫기
function closemsg(){
	closeDialog('ship_txt_set_lay');
	closeDialog('ship_txt_view_lay');
}

// ### 배송그룹 최종 저장 ### //
function save_group(){
	var shipping_group_name = $("input[name='shipping_group_name']").val();
	var sendding_address_seq = $("input[name='sendding_address_seq']").val();
	var refund_address_seq = $("input[name='refund_address_seq']").val();
	if($(".item_tr").length > 0){
		$("#groupFrm").submit();
	}else{
		alert('배송방법이 설정되지 않았습니다.\n[+추가] 버튼을 눌러 배송방법을 추가해주세요.');
		return;
	}
}

// 배송그룹 복사
function shipping_copy(seq){
	if(seq){
		openDialogConfirm('이 그룹을 복사해서 새로 등록하시겠습니까?',500,170,
		function(){
			$.ajax({
				type: "POST",
				url: "../setting_process/copyShippingGroup",
				dataType : 'json',
				data: {'group_seq':seq},
				success: function(data){
					openDialogAlert(data.msg,400,140,function(){document.location.href = "../setting/shipping_group";});
				}
			});
		},function(){});
	}else{
		openDialogAlert('복사할 배송그룹을 선택해주세요.',400,140,'','');
	}
}

// 가비아ads 배송정보 갱신 요청
function put_ads_shipping()
{
	$.ajax({
		type: "GET",
		url: "../../google/putShippingSetup"
	});
}

// 기본 배송방법 변경
function chg_base_set(obj){
	$(".controll_td").css('background-color','');
	$(obj).closest(".controll_td").css('background-color','#FFE3BB');
}

// 배송방법 추가 자식창 호출용
function shipping_set_add(nation){
	area_help_tooltip($("."+nation+"_tb"));
}

// 입점사 오프라인매장 삭제 설정
function deleteStoreConfig(){
	// 반송지, 매장수령 포함 여부 검증
	var msg = [];
	var refund_address_include = false;
	var shipping_store_include = false;
	$("input:checkbox[name='add_chk\\[\\]']:checked").each(function(){
		var refund_address = $(this).data("refund_address");
		var shipping_store = $(this).data("shipping_store");
		if(typeof(refund_address) != "undefined" && refund_address == '1' && !refund_address_include){
			msg.push('반송지');
			refund_address_include = true;
		}
		if(typeof(shipping_store) != "undefined" && shipping_store== '1' && !shipping_store_include){
			msg.push('매장수령');
			shipping_store_include = true;
		}
	});

	if(refund_address_include || shipping_store_include){
		openDialogAlert('선택한 매장은 ' + msg + '(으)로 사용 중 입니다. ' + msg + ' 설정 변경 후 다시 삭제해주세요.', 400, 180);
		return;
	}
	// 선택 값
	var arrSeq = $("input:checkbox[name='add_chk\\[\\]']:checked").map(function(){
		return $(this).val();
	}).get();

	if(arrSeq.length<1){
		openDialogAlert('삭제할 데이터를 선택해주세요.', 400, 150);
	}else{
		openDialog("매장 삭제 시 유의사항", "deleteInfoLayer", {"width":"600","height":"360","show" : "fade","hide" : "fade"});
	}
}