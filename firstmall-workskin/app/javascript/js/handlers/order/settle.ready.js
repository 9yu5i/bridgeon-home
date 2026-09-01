$(document).ready(function() {
	
	// 버그: #44366 모바일스킨 카카오페이 결제 오류
	if($("#kakaopay_layer").length < 1){
		var kakaopay_layer = '<div id="kakaopay_layer"  style="display: none"></div>';
		$("body").append(kakaopay_layer);
	}
});

