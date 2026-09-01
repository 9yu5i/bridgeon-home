var chatBotObj = {};
$.ajax({
	'url' : '../chatbot/chat',
	'dataType' : 'json',
	'global' : true,
	'async': false,
	'success' : function(obj){
		chatBotObj = obj;		
		if (chatBotObj) {
			load_chatbot();
			
		}
	}
});
$( document ).ready(function() {
	open_chatbot(chatBotObj);

});
function load_chatbot(){
	!function(){function e(){function e(){var e=t.contentDocument,a=e.createElement("script");a.type="text/javascript",a.async=!0,a.src=window[n]&&window[n].url?window[n].url+"/inapp-web/gitple-loader.js":"https://app.gitple.io/inapp-web/gitple-loader.js",a.charset="UTF-8",e.head&&e.head.appendChild(a)}var t=document.getElementById(a);t||((t=document.createElement("iframe")).id=a,t.style.display="none",t.style.width="0",t.style.height="0",t.addEventListener?t.addEventListener("load",e,!1):t.attachEvent?t.attachEvent("onload",e):t.onload=e,document.body.appendChild(t))}var t=window,n="GitpleConfig",a="gitple-loader-frame";if(!window.Gitple){document;var i=function(){i.ex&&i.ex(arguments)};i.q=[],i.ex=function(e){i.processApi?i.processApi.apply(void 0,e):i.q&&i.q.push(e)},window.Gitple=i,t.attachEvent?t.attachEvent("onload",e):t.addEventListener("load",e,!1)}}();

	$(".ico_floating_top").css("bottom", 90);
}
function open_chatbot(obj){
	if (obj) {
		window.GitpleConfig = {'appCode': obj.appCode}; // 워크스페이스 `설정 > 연동` 메뉴에서 앱코드 복사
		if (window.Gitple) {
			var loginUser = {
				id: obj.id, // 상담고객 식별 ID
				name: obj.name,
				email: obj.email,
				phone: obj.phone,
				meta: obj.meta
			};
			window.Gitple('boot', loginUser);
		}
	}
}