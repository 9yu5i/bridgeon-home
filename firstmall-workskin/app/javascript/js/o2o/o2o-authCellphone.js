
$(document).ready(function() {
	// 통합 요청 여부 
	$(".o2omerge").unbind("click");
	$(".o2omerge").bind("click", function (){
		init_o2o_merge_request(this);
	});
	
	// 인증번호 발송
	$(".btnAuthphone").unbind("click");
	$(".btnAuthphone").bind("click", function (){
		authphone_send();
	});
	
	// 인증번호 인증
	$(".btnAuthphoneConfirm").unbind("click");
	$(".btnAuthphoneConfirm").bind("click", function (){
		authphone_confirm();
	});
	
	// 회원 가입 폼일 경우 휴대폰번호 항목 사이로 이동
	// 휴대폰 번호 입력 셀과 안내셀이 있는지 확인
	var tr_cellphone = $("input[name='o2o_cellphone\[\]']");
	var target_desc = tr_cellphone.parent().find(".desc");
	if(tr_cellphone.length==3){
		// 핸드폰번호 입력 동기화
		for(var i=0;i<tr_cellphone.length;i++){
			obj = $("input[name='o2o_cellphone\[\]']:eq("+i+")");
			sync_o2o_cellphone(obj, i);
		}
	
		if(target_desc.length && $("#call_form").val()=="join_form" ){
			move_o2oauthnum(target_desc);
		}
	}
});
function sync_o2o_cellphone(obj, index){
	obj.unbind("keyup");
	obj.bind("keyup", function (){
		var copy_val = $(this).val();
		// 기업회원, 일반 회원 폰 번호 필드명
		var arr_cellphone_name = ['cellphone','bcellphone'];
		for(var i in arr_cellphone_name){
			var target = $("input[name='"+arr_cellphone_name[i]+"\[\]']:eq("+index+")");
			if(target.length){
				target.val(copy_val);
			}
		}
	});
	
}
function init_o2o_merge_request(obj){
	$el = $(obj);
	change_o2o_merge_request($el.val());
}
function change_o2o_merge_request(type){
	var var_realonly = false;
	var var_display = false;
	if(type == 'y'){
		var_realonly = true;
		var_display = true;
	}
	
	if(var_display){
		$("#o2o_auth_cellphone_form").show();
	}else{
		$("#o2o_auth_cellphone_form").hide();
	}
	// 기업회원, 일반 회원 폰 번호 필드명
	var arr_cellphone_name = ['cellphone','bcellphone'];
	for(var i in arr_cellphone_name){
		$("input[name='"+arr_cellphone_name[i]+"\[\]']").each(function(){
			$(this).attr("readonly", var_realonly);
		});
	}
	
}
// 인증 영역 이동 
function move_o2oauthnum(target){
	$("#tr_o2oauthnum").hide();
	var div_wrap_o2oauthnum = $("#div_wrap_o2oauthnum");
	div_wrap_o2oauthnum.css( { marginTop : "5px"} );
	div_wrap_o2oauthnum.insertBefore(target);
}

// 인증번호 인증
function authphone_confirm(){
	loadingStart();
	
	var authnum = $("#authnum").val();
	
	var cellphone = $("input[name='o2o_cellphone\\[\\]']").map(function() {
		return btoa(this.value);
	}).get();
	if(!cellphone){
		openDialogAlert('휴대폰 번호를 입력해주세요','300','150',function(){});
		return false;
	}
	
	var action = '/o2o/o2o_auth_process/authphone_confirm';
	
	$.ajax({
		'type' : 'POST',
		'url' : action,
		'data' : {'cellphone[]':cellphone,'authnum':authnum },
		'dataType': 'html',
		'success': function(res) {
			loadingStop("body",true);
			$('#actionFrame').contents().find('html').html(res);
		}
	});
}

var min = 2;
var sec = 59;
var timer = null;
// 인증번호 발신 :: 2016-04-19 lwh
function authphone_send(){
	loadingStart();
	
	var call_form = $("#call_form").val();
	
	var cellphone = $("input[name='o2o_cellphone\\[\\]']").map(function() {
		return btoa(this.value);
	}).get();
	if(!cellphone){
		openDialogAlert('휴대폰 번호를 입력해주세요','300','150',function(){});
		return false;
	}
	var action = '/o2o/o2o_auth_process/authphone';

	$.ajax({
		'type' : 'POST',
		'url' : action,
		'data' : {'cellphone[]':cellphone, 'call_form':call_form },
		'dataType': 'json',
		'success': function(res) {
			clearInterval(timer);
			min = 2;
			sec = 59;
			$(".authnum_send").show();
			$(".confirm_authnum").hide();
			$(".auth_timer").hide();
			
			loadingStop("body",true);
			if(res.result=="online_join"){
				if(confirm("동일한 휴대폰번호의 오프라인 계정이 확인되지 않았습니다. \n\n온라인 회원으로 가입하시겠습니까?")){
					// 통합 요청 해제
					$("input[name='o2omerge']:eq(0)").attr("checked",false);
					if($("input[name='o2omerge']:eq(0)").parent().hasClass("ez-radio")){
						$("input[name='o2omerge']:eq(0)").parent().removeClass("ez-radio-on");
					}
					$("input[name='o2omerge']:eq(1)").attr("checked",true);
					if($("input[name='o2omerge']:eq(1)").parent().hasClass("ez-radio")){
						$("input[name='o2omerge']:eq(1)").parent().addClass("ez-radio-on");
					}
					change_o2o_merge_request("n");
				}
			}
			
			if(res.result && res.result!="online_join"){	
				$(".chg_phone").attr('disabled',true); 
				$(".authnum_send").hide();
				$(".confirm_authnum").show();
				$("ul.confirm_authnum").css('display', 'table-row');
				$(".auth_timer").show();
				timer = setInterval(function(){
					if(sec==0){
						sec = 59;
						if(min != 0) {
							min = min - 1;
						}
					}else{
						sec = sec - 1;
					}
					$('#timer_min').html(min);
					$('#timer_sec').html(sec);

					if(min == 0 && sec == 0){ 
						clearInterval(timer);
						$(".authnum_send").show();
						$(".confirm_authnum").hide();
						$(".auth_timer").hide();
						$.ajax({
							'type':'POST',
							'url':'/o2o/o2o_auth_process/authphone_del',
							'dataType': 'text',
							'success': function(res) {
							}
						});
					}
				}, 1000);

			}
			if(res.result!="online_join" && res.msg){
				alert(res.msg);
			}
		}
	});
}