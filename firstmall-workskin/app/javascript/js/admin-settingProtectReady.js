$(document).ready(function() {

    /* IP 입력칸 포커싱 처리*/
    $(".ip_input").each(function(){
        var that = this;
        $("input",this).each(function(idx){
            $(this).bind('change keyup',function(event){
                // 쉬프트, 탭키는 무시
                if(event.keyCode==9 || event.keyCode==16) return;

                $(this).val($(this).val().replace(/[^0-9.]/g,""));

                thisInput = this;

                var check_band_ok = function(thisClassValue){
                    thisClassValue = parseInt(thisClassValue);

                    if(thisClassValue<0 || thisClassValue>255){
                        openDialogAlert("0~255 사이의 숫자만 입력해주세요.",400,140,function(){
                            $(thisInput).val('').focus();
                        });
                        return false;
                    }

                    if($(thisInput).val()!='0'){
                        $(thisInput).val($(thisInput).val().replace(/^0*/g,""));
                    }

                    return true;
                };

                if($(this).val().length>=3 || (/[.]/).test($(this).val())){
                    var val = $(this).val();

                    for(var i=0;i<val.length;i++){
                        if(val.substring(i,i+1)=='.'){
                            $(this).val(val.substring(0,i));
                            if(!check_band_ok($(this).val())) return;
                            $("input",that).eq(idx+1).focus().val(val.substring(i+1,val.length)).change();
                            break;
                        }

                        if(val.substring(0,i+1).length>=3){
                            $(this).val(val.substring(0,i+1));
                            if(!check_band_ok($(this).val())) return;
                            if(val.substring(i+1,i+2)=='.'){
                                $("input",that).eq(idx+1).focus().val(val.substring(i+2,val.length)).change();
                            }else{
                                $("input",that).eq(idx+1).focus().val(val.substring(i+1,val.length)).change();
                            }
                            break;

                        }


                    }
                }

                check_band_ok($(this).val());
            });

            $(this).bind('keydown',function(event){

                // 백스페이스 처리
                if(event.keyCode==8 && $(this).val().length==0){
                    if(idx>0){
                        $("input",that).eq(idx-1).focus();
                        $("input",that).eq(idx-1).val($("input",that).eq(idx-1).val().substring(0,2));

                        return false;
                    }
                }

                // 점 처리
                if(event.keyCode==190 || event.keyCode==110){
                    if(idx<4 && $(this).val().length>=1){
                        $("input",that).eq(idx+1).focus();
                    }
                    return false;
                }

            });

        });
    });

    /* 차단IP 추가 버튼 */
    $("#btn_add_banip").click(function(){
        var ip = '';
        var ip_end = false;

        var ipInputSelector = ".new_ip_input input";
        for(var i=0;i<$(ipInputSelector).length;i++){
            $(ipInputSelector).eq(i).val($(ipInputSelector).eq(i).val().replace(/ /,''));
            if($(ipInputSelector).eq(i).val().length){
                if(ip_end){
                    openDialogAlert("아이피 중간을 비워둘 수 없습니다.",400,140,function(){
                        $(ipInputSelector).eq(i-1).focus();
                    });
                    return;
                }
                ip += $(ipInputSelector).eq(i).val();
                if(i<3) ip += '.';
            }else{
                ip_end = true;
            }
        }

        add_banip(ip,'prepend');

    });

    /* 차단IP 검색 버튼*/
    $("#btn_search_banip").click(function(){

        var ip = '';
        $(".search_ip_input input").each(function(idx){
            if($(this).val()){
                if(idx) ip += '.';
                ip += $(this).val();
            }
        });	

        $("#ip_list .ip_item").each(function(){
            if($("input[name='protectIp[]']",this).val().substring(0,ip.length)==ip){
                $(this).show();
            }else{
                $(this).hide();
            }
        });

        $(".search_ip_input input").attr("disabled",true);
        $(this).attr("disabled",true);

    });

    /* 차단IP 검색 초기화 버튼*/
    $("#btn_reset_banip").click(function(){
        $("#btn_search_banip").removeAttr("disabled");
        $(".search_ip_input input").removeAttr("disabled");
        $(".search_ip_input input").val('').eq(0).focus();
        $("#ip_list .ip_item").show();
    });

    /* 추가 IP 입력폼 엔터키 */
    $(".new_ip_input input").bind('keydown',function(event){
        if(event.keyCode=='13'){
            $("#btn_add_banip").click();
            return false;
        }
    });

    /* 검색 IP 입력폼 엔터키 */
    $(".search_ip_input input").bind('keydown',function(event){
        if(event.keyCode=='13'){
            $("#btn_search_banip").click();
            return false;
        }

        if(event.keyCode=='27'){
            $("#btn_reset_banip").click();
            return false;
        }
    });

    /* 보안서버 신청 버튼 */
    $("#btn_ssl_regist").click(function(){
		var href = $(this).data('href');
        window.open(href);
    });
	// 인증서 목록 호출 초기화
	initSslList();
	$(".showSslList").eq(0).trigger("click");
});

// 인증서 목록 초기화
function initSslList(){
	// 인증서 목록 호출
	$(".showSslList").unbind("click");
	$(".showSslList").bind("click", function(){
		var page = $(this).data('page');
		var status = $(this).data('status');
		callSslList(page, status);
		
		// 활성화 처리 - 상단탭일경우에만 처리
		if($(this).hasClass("ctab")){
			$(this).parent().find('.ctab').removeClass('ctab-on');
			$(this).addClass('ctab-on');
		}
	});
	
	// 설정버튼 이벤트 초기화
	$(".btn_set_ssl_redirect").unbind("click");
	$(".btn_set_ssl_redirect").bind("click", function(){
		var sslSeq = $(this).data('sslSeq');
		var redirect = $(this).data('redirect');
		setSslRedirect(sslSeq, redirect, $(this));
	});
}
// ssl 목록 부르기
function callSslList(page, status){
	if(typeof(status) === 'undefined'){
		$(".showSslList").each(function(){
			if($(this).hasClass('ctab-on')){
				status = $(this).data('status');
			}
		});
	}
	$.ajax({
		type: "get",
		url: "/admin/setting/ssl_list_ajax",
		'data' : {'page':page,'status':status},
		success: function(result){
			$("#showSslLayer").html(result);
			initSslList();
		}
	});
}

// 리다이렉션 설정 저장
function setSslRedirect(sslSeq, redirect, $el){
	var alertText = "설정";
	if(redirect=='N'){
		alertText = "설정을";
	}else{
		alertText = "해지";
	}
	if(confirm("리다이렉트를 "+ alertText +" 하시겠습니까?")){
		$.ajax({
			type: "get",
			url: "/admin/setting/set_ssl_redirect",
			'data' : {'sslSeq':sslSeq, 'redirect':redirect},
			success: function(result){
				if(result=='ok'){
					location.href = location.href;
				}else{
					alert("["+result+"] 리다이렉트 설정 중 문제가 발생했습니다.");
				}
			}
		});
	}
}