
$(document).ready( function() {
	
});

function openStatsSettingLayer(){
	$.ajax({
		type: "get",
		url: "../statistic_visitor/visitor_setting",
		success: function(result){	
			$("div#statsSettingLayer").html(result);
		}
	});
	openDialog("방문자 통계 수집 설정", "statsSettingLayer", {"width":"700","height":"510","show" : "fade","hide" : "fade"});
}