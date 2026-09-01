var loginProgObj = '';
var	loginReturnUrl = '';

function setAnotherLoginAuto(title, link){
	$('html').append('<div id="progressbar"></div>');
	var useTitle	= false;
	if	(title)	useTitle	= true;
	var checkCnt = 100;
	loginReturnUrl = link;

	loginProgObj		= $("#progressbar").fmprogressbar({
		'debugMode'			: false, 
		'useDetail'			: false, 
		'loadMode'			: false, 
		'useTitle'			: useTitle, 
		'zIndex'			: '1000', 
		'barHeight'			: '20', 
		'barOutPadding'		: '15', 
		'titleBarText'		: '<strong style="font-size:11px">'+title+'</strong>', 
		'procgressEnd'		: 'end_login_another' 
	});

	$.get('/selleradmin/login_process/getServerList', '', function(response){
		if	(response.result == 'ok'){
			$.each(response.domain_list,function(){
				iframe = $('<iframe>');
				url = 'http://'+this+'/selleradmin/login_process/check_token?t='+response.token+'&i='+response.id;
				iframe.attr({'class':'autoLoginFrame','src':url}).css('display','none');
				$('body').append(iframe);
			});

			$('.autoLoginFrame').load(function(){
				addProgPercent(checkCnt-(100/response.cnt));
			});
		}else{
			loginProgObj.closeProgress();
			alert(response.msg);
		}
	}, 'json');
}

function addProgPercent(per){
	loginProgObj.addPercent(per);
}

function end_login_another(){
	url = loginReturnUrl;
	if	(!loginReturnUrl)
		url = '/selleradmin/main/index';
	location.href = url;
}