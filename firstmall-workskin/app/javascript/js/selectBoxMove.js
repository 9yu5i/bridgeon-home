
var auth_arr    = [];
var item_arr    = [];
var order_arr   = [];

var options = {};

var _setting = function(options_){

    if(typeof options_ != 'undefined') options = options_;
}

/*
var auth_arr = [
<!--{@ requireds }-->
'{.value_}',
<!--{ / }-->
];

var item_arr = [
<!--{@ chk_items }-->
'{.value_}',
<!--{ / }-->
];

var order_arr = [
<!--{@ chk_orders }-->
'{.value_}',
<!--{ / }-->
];
*/

 // 메뉴 끝으로 이동
function fnMenuMoveEnd(oMenu) {
	var cnt = oMenu.length-1;
	var i=0;

	for (i=oMenu.length-1; i>=0; i--) {
		if (Menulist_isSelected(oMenu, i)) {
			if (i==oMenu.length-1) return;
			var idx = i;

			for (j=idx;j<cnt;j++) {
				Menulist_downMenu(oMenu, idx);
				idx = idx + 1;
			}
			cnt = cnt - 1;
		}
	}
}

// 메뉴 맨 위로 이동
function fnMenuMoveStart(oMenu) {
	var i=0;
	var len = oMenu.length;
	var cnt = 0;
	for (i=0; i<oMenu.length; i++) {
	if (Menulist_isSelected(oMenu, i)) {
		if (i==0) return;
		var idx = i;

		for (j=idx;j>cnt;j--) {
			Menulist_upMenu(oMenu, idx);
			idx = idx - 1;
		}
		cnt = cnt + 1;
		}
	}
}

// 메뉴 위로 이동
function fnMenuMoveUp(oMenu) {
	var i=0;
	for (i=0; i<oMenu.length; i++) {
		if (Menulist_isSelected(oMenu, i)) {
			if (i==0) return;
			Menulist_upMenu(oMenu, i);
		}
	}
}

// 메뉴 아래로 이동
function fnMenuMoveDown(oMenu) {
	var i=0;
	for (i=oMenu.length-1; i>=0; i--) {
		if (Menulist_isSelected(oMenu, i)) {
			if (i==oMenu.length-1) return;
			Menulist_downMenu(oMenu, i);
		}
	}
}

function Menulist_downMenu(oMenu, index) {
	if (index < 0) return;
	if (index == oMenu.length-1) {
		return; // 더 이상 아래로 이동할 수 없을때
	}
	Menulist_moveMenu(oMenu, index, 1);
}

function Menulist_upMenu(oMenu, index) {
	if (index < 0) return;
	if (index == 0) {
		return; // 더 이상 위로 이동할 수 없을때
	}
	Menulist_downMenu(oMenu, index-1);
}

function Menulist_isSelected(oMenu, idx) {
	return (oMenu.options[idx].selected==true);
}
function Menulist_moveMenu(oMenu, index, distance) {
	var vidx = $(oMenu.options[index]).attr('idx');
	var tmpOption = new Option(oMenu.options[index].text, oMenu.options[index].value, false,
	oMenu.options[index].selected);

	for (var i=index; i<index+distance; i++) {
		oMenu.options[i].text = oMenu.options[i+1].text;
		oMenu.options[i].value = oMenu.options[i+1].value;
		oMenu.options[i].selected = oMenu.options[i+1].selected;
		idx = $(oMenu.options[i+1]).attr('idx');
		$(oMenu.options[i]).attr('idx',idx);
	}
	oMenu.options[index+distance] = tmpOption;
	tmpOption.setAttribute('idx',vidx);
}

function write_submit(){
	var option = $("#chk_cell");
	for(var i=0;i<option.options.length;i++){
		option.options[i].selected = true;
	}
	document.edForm.submit();
}

function required_chk(value){
	var cnt = 0;
	if(typeof options.auth_arr == 'undefined') options.auth_arr = new Array;

	for(var i=0;i<options.auth_arr.length;i++){
		if(value==options.auth_arr[i]) cnt++;
	}
	if(cnt>0) return false;
	else return true;
}

function item_value_out(){
	
	if(typeof options.item_arr == 'undefined') options.item_arr = new Array;

	$("#chk_cell option").each(function(){
		var cnt = 0;
		for(var i=0;i<options.item_arr.length;i++){
			if($(this).val()==options.item_arr[i]) cnt++;
		}
		if(cnt>0) $(this).appendTo("#temp_item");
	});

	$("#downloads_item_nouse option").each(function(){
		var cnt = 0;
		for(var i=0;i<options.item_arr.length;i++){
			if($(this).val()==options.item_arr[i]) cnt++;
		}
		if(cnt>0) $(this).appendTo("#temp_item");
	});
}

function item_value_in(){

	if(typeof options.item_arr == 'undefined') options.item_arr = new Array;
	$("#temp_item option").each(function(){
		var cnt = 0;
		for(var i=0;i<options.item_arr.length;i++){
			if($(this).val()==options.item_arr[i]) cnt++;
		}
		if(cnt>0) $(this).appendTo("#downloads_item_nouse");
	});
}


function order_value_out(){

	if(typeof options.order_arr == 'undefined') options.order_arr = new Array;

	$("#chk_cell option").each(function(){
		var cnt = 0;
		for(var i=0;i<options.order_arr.length;i++){
			if($(this).val()==options.order_arr[i]) cnt++;
		}
		if(cnt>0) $(this).appendTo("#temp_item");
	});

	$("#downloads_item_nouse option").each(function(){
		var cnt = 0;
		for(var i=0;i<options.order_arr.length;i++){
			if($(this).val()==options.order_arr[i]) cnt++;
		}
		if(cnt>0) $(this).appendTo("#temp_item");
	});
}

function order_value_in(){

	if(typeof options.order_arr == 'undefined') options.order_arr = new Array;

	$("#temp_item option").each(function(){
		var cnt = 0;
		for(var i=0;i<options.order_arr.length;i++){
			if($(this).val()==options.order_arr[i]) cnt++;
		}
		if(cnt>0) $(this).appendTo("#downloads_item_nouse");
	});
}

// 양식 저장
function edForm_chkSubmit(obj){
	var chkStatus	= false;
	if($("select[name='chk_cell[]'] option").length == 0){
		openDialogAlert('선택된 cell 없습니다.', '400', '150');
		return false;
	}

	$("select[name='chk_cell[]'] option").each(function(){
		$(this).prop("selected",true);
	});
	loadingStart();
	return true;
}

$(document).ready(function() {

    if(options.criteria=='ITEM'){
        order_value_out();
        item_value_in();
    }else{
        item_value_out();
        order_value_in();
    }

    // 항목 추가
    $('#add_element').click(function() {
        $("#downloads_item_nouse option:selected").each(function() {
            $(this).appendTo("#chk_cell");
        });
    });
    $("#downloads_item_nouse").dblclick(function(){
        $("#downloads_item_nouse option:selected").each(function() {
            $(this).appendTo("#chk_cell");
        });
    });
    // 항목 삭제
    $('#del_element').click(function() {
        var cnt = 0;
        $("#chk_cell option:selected").each(function() {
            if(!required_chk($(this).val())){
                cnt++;
                return;
            }
            $(this).appendTo("#downloads_item_nouse");
        });
        if(cnt>0) alert("필수 항목은 삭제하실 수 없습니다.");
    });
    $("#chk_cell").dblclick(function(){
        var cnt = 0;
        $("#chk_cell option:selected").each(function() {
            if(!required_chk($(this).val())){
                cnt++;
                return;
            }
            $(this).appendTo("#downloads_item_nouse");
        });
        if(cnt>0) alert("필수 항목은 삭제하실 수 없습니다.");
    });

    // 항목 처음으로 이동
    $('#firstMove').click(function() {
        fnMenuMoveStart(document.edForm.chk_cell);
    });

    // 항목 위로 이동
    $('#upMove').click(function() {
        fnMenuMoveUp(document.edForm.chk_cell);
    });

    // 항목 아래로 이동
    $('#downMove').click(function() {
        fnMenuMoveDown(document.edForm.chk_cell);
    });

    // 항목 마지막 이동
    $('#lastMove').click(function() {
        fnMenuMoveEnd(document.edForm.chk_cell);
    });

    $("input:radio[name='criteria']").click(function() {
        if($(this).val()=='ORDER'){
            item_value_out();
            order_value_in();
        }else{
            order_value_out();
            item_value_in();
        }
    });
});