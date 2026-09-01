/*
IFDO 마케팅 설정 javascript
@2020.09.28
*/
$(function(){
	
	// 페이지 초기화
	initDisplayIFDOMarketing();
	
	// 사용 여부
	$("input[name='ifdo_marketing_use']").on("click", function(){
		initDisplayIFDOMarketing();
	});
});

// 영역 활성화
function initDisplayIFDOMarketing(){
	var ifdo_marketing_use = $("input[name='ifdo_marketing_use']:checked").val();
	$(".display_ifdo_marketing_use").hide();
	if(ifdo_marketing_use == 'Y'){
		$(".display_ifdo_marketing_use").show();
	}
}