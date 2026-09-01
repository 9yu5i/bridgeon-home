$(document).ready(function() {
	/* 카테고리 불러오기 */
	category_admin_select_load('','add_category1','');
	$("select[name='add_category1']").live("change",function(){
		category_admin_select_load('add_category1','add_category2',$(this).val());
		category_admin_select_load('add_category2','add_category3',"");
		category_admin_select_load('add_category3','add_category4',"");
	});
	$("select[name='add_category2']").live("change",function(){
		category_admin_select_load('add_category2','add_category3',$(this).val());
		category_admin_select_load('add_category3','add_category4',"");
	});
	$("select[name='add_category3']").live("change",function(){
		category_admin_select_load('add_category3','add_category4',$(this).val());
	});

	$("select[name='move_category1']").live("change",function(){
		category_admin_select_load('move_category1','move_category2',$(this).val());
		category_admin_select_load('move_category2','move_category3',"");
		category_admin_select_load('move_category3','move_category4',"");
	});
	$("select[name='move_category2']").live("change",function(){
		category_admin_select_load('move_category2','move_category3',$(this).val());
		category_admin_select_load('move_category3','move_category4',"");
	});
	$("select[name='move_category3']").live("change",function(){
		category_admin_select_load('move_category3','move_category4',$(this).val());
	});

	$("select[name='copy_category1']").live("change",function(){
		category_admin_select_load('copy_category1','copy_category2',$(this).val());
		category_admin_select_load('copy_category2','copy_category3',"");
		category_admin_select_load('copy_category3','copy_category4',"");
	});
	$("select[name='copy_category2']").live("change",function(){
		category_admin_select_load('copy_category2','copy_category3',$(this).val());
		category_admin_select_load('copy_category3','copy_category4',"");
	});
	$("select[name='copy_category3']").live("change",function(){
		category_admin_select_load('copy_category3','copy_category4',$(this).val());
	});

	/* 브랜드 불러오기 */
	brand_admin_select_load('','add_brand1','');
	$("select[name='add_brand1']").live("change",function(){
		brand_admin_select_load('add_brand1','add_brand2',$(this).val());
		brand_admin_select_load('add_brand2','add_brand3',"");
		brand_admin_select_load('add_brand3','add_brand4',"");
	});
	$("select[name='add_brand2']").live("change",function(){
		brand_admin_select_load('add_brand2','add_brand3',$(this).val());
		brand_admin_select_load('add_brand3','add_brand4',"");
	});
	$("select[name='add_brand3']").live("change",function(){
		brand_admin_select_load('add_brand3','add_brand4',$(this).val());
	});

	$("select[name='move_brand1']").live("change",function(){
		brand_admin_select_load('move_brand1','move_brand2',$(this).val());
		brand_admin_select_load('move_brand2','move_brand3',"");
		brand_admin_select_load('move_brand3','move_brand4',"");
	});
	$("select[name='move_brand2']").live("change",function(){
		brand_admin_select_load('move_brand2','move_brand3',$(this).val());
		brand_admin_select_load('move_brand3','move_brand4',"");
	});
	$("select[name='move_brand3']").live("change",function(){
		brand_admin_select_load('move_brand3','move_brand4',$(this).val());
	});

	$("select[name='copy_brand1']").live("change",function(){
		brand_admin_select_load('copy_brand1','copy_brand2',$(this).val());
		brand_admin_select_load('copy_brand2','copy_brand3',"");
		brand_admin_select_load('copy_brand3','copy_brand4',"");
	});
	$("select[name='copy_brand2']").live("change",function(){
		brand_admin_select_load('copy_brand2','copy_brand3',$(this).val());
		brand_admin_select_load('copy_brand3','copy_brand4',"");
	});
	$("select[name='copy_brand3']").live("change",function(){
		brand_admin_select_load('copy_brand3','copy_brand4',$(this).val());
	});

	/* 지역 불러오기 */
	$("select[name='add_location1']").live("change",function(){
		location_admin_select_load('add_location1','add_location2',$(this).val());
		location_admin_select_load('add_location2','add_location3',"");
		location_admin_select_load('add_location3','add_location4',"");
	});
	$("select[name='add_location2']").live("change",function(){
		location_admin_select_load('add_location2','add_location3',$(this).val());
		location_admin_select_load('add_location3','add_location4',"");
	});
	$("select[name='add_location3']").live("change",function(){
		location_admin_select_load('add_location3','add_location4',$(this).val());
	});

	$("select[name='move_location1']").live("change",function(){
		location_admin_select_load('move_location1','move_location2',$(this).val());
		location_admin_select_load('move_location2','move_location3',"");
		location_admin_select_load('move_location3','move_location4',"");
	});
	$("select[name='move_location2']").live("change",function(){
		location_admin_select_load('move_location2','move_location3',$(this).val());
		location_admin_select_load('move_location3','move_location4',"");
	});
	$("select[name='move_location3']").live("change",function(){
		location_admin_select_load('move_location3','move_location4',$(this).val());
	});

	$("select[name='copy_location1']").live("change",function(){
		location_admin_select_load('copy_location1','copy_location2',$(this).val());
		location_admin_select_load('copy_location2','copy_location3',"");
		location_admin_select_load('copy_location3','copy_location4',"");
	});
	$("select[name='copy_location2']").live("change",function(){
		location_admin_select_load('copy_location2','copy_location3',$(this).val());
		location_admin_select_load('copy_location3','copy_location4',"");
	});
	$("select[name='copy_location3']").live("change",function(){
		location_admin_select_load('copy_location3','copy_location4',$(this).val());
	});
	$("select[name='target_modify']").on("change",function(){
		check_target_modify();
	});
	//check_target_modify();

	$("input[name='connect']").on('click', function() { display_connet(); });
	$("div.connect_setting").find("input[name^='search_']").on('click', function() { display_category();});
});

function check_target_modify() {
	$(".if_category, .if_brand, .if_location").addClass("hide");

	var target_str = $("select[name='target_modify'] option:selected").val();
	if( target_str == 'category' ){
		$("tr.if_category").removeClass("hide");
	} else if( target_str == 'brand' ){
		$("tr.if_brand").removeClass("hide");
	} else if( target_str == 'location' ){
		$("tr.if_location").removeClass("hide");
	}

	$("input[name='connect']").eq(0).prop('checked',true);
	$("input[name='search_"+target_str+"_mode']").eq(0).prop('checked',true);
	display_category();
}

function display_connet() {
	var category = $("select[name='target_modify']").val();
	var connect = $("input[name='connect']:checked").val();
	if(connect == 'connect') {
		$("input[name='search_"+category+"_mode']:[value='add']").prop('checked',true);
	} else {
		$("input[name='search_"+category+"_mode']:[value='del']").prop('checked',true);
	}
	display_category();
}

function display_category() {
	var category = $("select[name='target_modify']").val();
	var connect = $("input[name='connect']:checked").val();
	var category_mode= $("input[name='search_"+category+"_mode']:checked").val();
	var select_category = category_mode + "_" +category;

	$(".connect_setting").hide();
	$("."+category+"_"+connect).show();
	$("."+category+"_select").show();

	if(connect == 'connect') {
		
		$("."+category+"_table").show();

		$("select[name*='_"+category+"']").hide();
		$("select[name^='"+select_category+"']").show();

		if( category == 'category') {
			category_admin_select_load('',select_category+'1','');
		} else if( category == 'brand') {
			brand_admin_select_load('',select_category+'1','');
		} else if( category == 'location') {
			location_admin_select_load('',select_category+'1','');
		}
	} else {
		$("."+category+"_table").hide();
	}

	if(category_mode == 'move' || category_mode == 'del') {
		$("#"+category+"_search").show();
	} else {
		$("#"+category+"_search").hide();
	}
	
	var tip = '';
	var category_name = {'category':'카테고리','brand':'브랜드','location':'지역'};
	category_name = category_name[category];
	
	if(category == "location"){
		category_name_s = category_name + "이";
	}else{
		category_name_s = category_name + "가";
	}
	if(connect == 'connect') {
		if(category_mode == 'add') {
			tip = '상품에 연결된 '+category_name_s+' 없으면 새로 연결되는 '+category_name_s+' 대표'+category_name_s+' 됩니다.';
		} else if(category_mode == 'move') {
			tip = '해제되는 '+category_name_s+' 대표'+category_name+'인 경우, 연결되는 '+category_name_s+' 대표'+category_name_s+' 됩니다.';
		} else if(category_mode == 'copy') {
			tip = '복사된 신규상품에 연결되는 '+category_name_s+' 대표 '+category_name_s+' 됩니다.';
		}
	} else if (connect == 'disconnect') {
		if(category_mode == 'del') {
			tip = ''+category_name_s+' 대표'+category_name+'이면 연결을 해제하지 않습니다.';
		} else if(category_mode == 'all_del') {
			$("."+category+"_select").hide();
		}
	}

	$("#"+category+"_tip").html(tip);
}
