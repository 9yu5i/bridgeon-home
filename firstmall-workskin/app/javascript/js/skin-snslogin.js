/**
 * [전역변수 정보]
 * snstype : sns 앞자리 2개
 * 		- fb : 페이스북
 * 		- nv : 네이버
 * 		- kk : 카카오
 * 		- ap : 애플
 * 		- tw : 트위터
 * jointype : 회원가입 타입
 * 		- myinfo : 마이페이지
 * 		- {snstype}member : 개인 회원가입
 * 		- {snstype}business : 사업자 회원가입
 */

/**
 * ############### 공통 함수 start #################
 */
// SNS 로그인 처리 컨트롤러
function loginwindowopen(sns) {
	switch(sns) {
		case 'kakao':
			loginWithKakao();
			break;
		case 'apple':
			loginWithApple();
			break;
		case 'facebook':
			loginWithFacebook();
			break;
		case 'twitter':
			loginWithTwitter();
			break;
		case 'naver':
			loginWithNaver();
			break;
		default:
			break;
	}
}

// SNS 회원가입 컨트롤러
function joinwindowopen() {
	switch(snstype) {
		case 'kk':
			loginWithKakao();
			break;
		case 'ap':
			loginWithApple();
			break;
		case 'fb':
			loginWithFacebook();
			break;
		case 'tw':
			loginWithTwitter();
			break;
		case 'nv':
			loginWithNaver();
			break;
		default:
			break;
	}
}

// SNS 로그인 이후 성공 페이지 리턴
function joinloginsuccess() {
	// 성인인증 페이지에서는 adult_auth 로 페이지 이동
	if( typeof adult_auth != 'undefined'  && adult_auth == "1") {
		document.location.href = '/member/adult_auth';
		return;
	}

	// return_url 있으면 페이지 이동
	if( typeof return_url != 'undefined' ) {
		document.location.href = return_url;
		return;
	}

	if(isJoinFromMyInfo()) {
		document.location.href = '/mypage/myinfo';
		return;
	}

	document.location.href = '/';
}

// sns 로그인 시 실패됐을 때
function joinloginfail(res) {
	if(res.dormany_auth){
		location.href = res.dormany_auth;
		return;
	}

	openDialogAlert(res.msg,'400','160',function(){
		var url = res.callback;
		if(typeof res.return_url !== 'undefined' && res.return_url !== '') url = res.return_url;
		if(typeof res.retururl !== 'undefined' && res.retururl !== '') url = res.retururl;

		if(url){
			location.href = url;
			return;
		}
	});
}

// 회원정보 초기화
function logoutajax(sns){
	var url = '../sns_process/'+sns+'logout';
	var _callback = function(res) {
		if(res.result == true){
			joinloginsuccess()
		}else{
			loadingStop("body",true);
			openDialogAlert(res.msg,'400','140',function(){});
		}
	};

	ajaxSendPost(url, null, _callback);
}

// SNS 연결 해제
function snsdisconnect(snstype, snsrute){
	var url = '../sns_process/snsdisconnect';
	var data = {'snstype': snstype, 'snsrute': snsrute};
	var _callback = function(res) {
		if(res.result == true){
			openDialogAlert(res.msg,'400','140',function(){document.location.reload();});
		}else{
			document.location.reload();
		}
	};

	ajaxSendPost(url, data, _callback);
}


// 만 14세미만 회원가입 관련 skin patch 여부
function isSkinPatch14YearsOld(){
	var skin_patch_14years_old = false;
	if(typeof $('input[name="kid_agree"]').val() != "undefined" || typeof kid_agree != 'undefined'){
		skin_patch_14years_old = true;
	}
	return skin_patch_14years_old;
}

// 만 14세미만 회원가입 동의 값 가져오기
function getSkinPatch14YearsOld() {

	if (typeof $('input[name="kid_agree"]').val() != "undefined"){
		return $('input[name="kid_agree"]').val();
	}

	if (typeof kid_agree != 'undefined') {
		return kid_agree;
	}

	return '';
}

// sns 로그인/회원가입 이후 return_url 가져오기
function getReturnUrl() {
	if (typeof return_url != 'undefined') {
		return return_url;
	}

	return '/';
}

// 마케팅 및 광고 활용 동의
function getMailing() {

	var mailing = $('input[name="mailing"]').prop("checked");
	if (mailing) {
		return 'y';
	}
	return 'n';
}

// 마케팅 및 광고 활용 동의
function getSms() {

	var sms = $('input[name="sms"]').prop("checked");
	if (sms) {
		return 'y';
	}
	return 'n';
}

// ajax 공통 함수
function ajaxSendPost(url, data, _callback) {
	$.ajax({
		url: url,
		type: 'post',
		dataType: 'json',
		data: data,
		success: function(res) {
			_callback(res);
		},
		error: function(x, h, r) {
			alert(x);
		}
	});
}

// ajax 공통 함수 (동기처리, 페이스북 전용)
function ajaxSendPostAwait(url, data, _callback) {
	$.ajax({
		url: url,
		type: 'post',
		dataType: 'json',
		data: data,
		async: false,
		success: function(res) {
			_callback(res);
		},
		error: function(x, h, r) {
			alert(x);
		}
	});
}

// 회원가입(jointype) 셋팅
function initJoinType(data) {
	if(typeof data != "undefined" && data != ""){
		jointype = data;
	}

	parseJoinType();
}

// 회원가입(jointype) 요청 여부
function isJoinType() {
	if(typeof jointype != "undefined" && jointype != ""){
		return true;
	}

	return false;
}

// 마이페이지에서 연결 요청 여부
function isJoinFromMyInfo() {
	return jointype == 'myinfo';
}

// 개인 회원가입 타입 여부
function isJoinForMember(checkType) {
	return checkType == 'member';
}

// 기업 회원가입 타입 여부
function isJoinForBusiness(checkType) {
	return checkType == 'business';
}

// 회원가입 시 타입값 파싱 전역변수 처리
var plainJoinType = '';
function parseJoinType() {
	if (!isJoinType()) return false;
	if (isJoinForMember(jointype) || isJoinForBusiness(jointype)) {
		plainJoinType = jointype;
		return false;
	}

	// SNS 회원가입 타입 파싱
	plainJoinType = jointype.substr(2);
	return true;
}

// 브라우저 지원 여부
function checkSupportedBrowser() {
	// IE 여부 확인
	var IEIndex = navigator.appVersion.indexOf("MSIE");
	// IE 버전 확인
	var IE8Over = navigator.userAgent.indexOf("Trident");

	if( IEIndex > 0 && IE8Over < 0 )  {
		// 카카오 로그인을 지원하지 않는 브라우저 버전입니다.\nInternet Explorer 8 버전 이상 사용해 주세요.
		alert(getAlert('mb005'));
		return false;
	}

	return true;
}

// 파라미터 설정 함수
function getSocialParameter() {
	var param = {
		'mtype':plainJoinType,
		'mform': isJoinType() ? 'join' : 'login',
		'facebooktype': isJoinFromMyInfo() ? 'mbconnect_direct' : '',
		'kid_agree':getSkinPatch14YearsOld(),
		'skin_patch_14years_old':isSkinPatch14YearsOld(),
		'return_url': getReturnUrl(),
		'mailing' : getMailing(),
		'sms' : getSms(),
	};

	return param;
}

// 로그인 처리 시 에러 핸들러
function loginErrorHandler(message) {
	msg = message != '' ? message : getAlert('os171');
	openDialogAlert(msg,'300','160',function(){});
	return false;
}

// 레거시 앱 자동 로그인 처리 콜백
function loginCompleteSendNativeApp(res){
	if( mobileapp == "Y" ){
		var param = {'member_seq' : res.send_params.member_seq, 'user_id' : res.send_params.userid, 'user_name' : res.send_params.user_name, 'session_id' : res.send_params.session_id, 'channel' : res.send_params.channel, 'reserve' : res.send_params.reserve, 'balance' : res.send_params.balance, 'coupon' : res.send_params.coupon, 'auto_login' : res.send_params.auto_login, 'key' : res.send_params.key };
		var strParam = JSON.stringify(param);
		var dataStr = "MemberInfo" + "?" + strParam;

		if ( m_device =='iphone' ) {
			window.webkit.messageHandlers.CSharp.postMessage(dataStr);
		} else {
			CSharp.postMessage(dataStr);
		}
	}
}


/**
 * ############### 공통 함수 end #################
 */

// 네이버 로그인 요청
function loginWithNaver() {
	var _url = '/sns/naver_gate';
	var _data = getSocialParameter();
	var _callback = function(response) {
		if (!response.result) {
			return loginErrorHandler(response.msg);
		}

		location.replace(response.authorizeUrl);
	}

	ajaxSendPost(_url, _data, _callback);
}

// 카카오 로그인 요청
function loginWithKakao() {
	if (!checkSupportedBrowser()) return false;

	var _url = '/sns/kakao_gate';
	var _data = getSocialParameter();
	var _callback = function(response) {

		if (!response.result) {
			return loginErrorHandler(response.msg);
		}

		// REST API 방식 분기 처리
		if (response.type == 'rest') {
			location.href = response.authorizeUrl;
		} else {
			// 로그인 창을 띄웁니다.
			Kakao.Auth.login({
				success: function(authObj) {
					if (!authObj.access_token) {
						//잘못된 접근입니다.
						return loginErrorHandler(getAlert('mb006'));
					}

					// 카카오 JS 로그인 처리
					Kakao.API.request({
						url: '/v2/user/me',
						success: function(userObj) {
							var kakaoObj		= $.extend(authObj,userObj);
							if(jointype) {
								var pram = _data;
								kakaoObj = $.extend(authObj,userObj,pram);
							}
							kakaoObj['mtype'] = jointype;
							kakaojoinlogin(kakaoObj);
						}
					});
				},fail: function(res){
					alert(getAlert('mb006') + " [" + res.error_description + "]");
				}
			});
		}
	}

	ajaxSendPost(_url, _data, _callback);
}

// 카카오톡 인앱브라우저에서 자동로그인 요청
function loginWithKakaoBrowser() {
	var _url = '/sns/kakao_browser_gate';
	var _data = getSocialParameter();

	var _callback = function(response) {

		if (!response.result) {
			return loginErrorHandler(response.msg);
		}

		// 카카오싱크는 REST API 방식만 사용
		if (response.type == 'rest') {
			location.href = response.authorizeUrl;
		}
	}

	ajaxSendPost(_url, _data, _callback);
}

// 페이스북 로그인 요청
function loginWithFacebook() {
	var _url = '/sns/facebook_gate';
	var _data = getSocialParameter();
	var _callback = function(response) {

		if (!response.result) {
			return loginErrorHandler(response.msg);
		}

		// REST API 방식 분기 처리
		if (response.type == 'rest') {
			location.href = response.authorizeUrl;
		} else {
			FB.getLoginStatus(function(response){
				if (response.authResponse) {
					callbackFacebookLogin(response);
				} else {
					FB.login(function(response){
						callbackFacebookLogin(response);
					});
				}
			});
		}
	}

	ajaxSendPostAwait(_url, _data, _callback);
}

// 트위터 로그인 요청
function loginWithTwitter() {
	var _url = '/sns/twitter_gate';
	var _data = getSocialParameter();
	var _callback = function(response) {

		if (!response.result) {
			return loginErrorHandler(response.msg);
		}

		if (response.authorizeUrl == '') {
			return loginErrorHandler(getAlert('mb099'));
		}

		location.replace(response.authorizeUrl);
	}

	ajaxSendPost(_url, _data, _callback);
}

// 애플 로그인 요청
function loginWithApple(){
	var _url = '/sns/apple_gate';
	var _data = getSocialParameter();
	var _callback = function(response) {
		if (!response.result) {
			return loginErrorHandler(response.msg);
		}

		location.replace(response.authorizeUrl);
	}

	ajaxSendPost(_url, _data, _callback);
}

// 카카오 로그인 초기화
function initKakaoApi() {
	$.ajax({
		'url' : '../sns_process/kakaokeys',
		'dataType': 'json',
		'success': function(res) {
			if(res.result == true){
				// SDK 중복 초기화 문제를 막기 위해 SDK에서 사용한 리소스 해제 후 초기화 진행
				// 버전문제로 SDK 초기화 여부 함수(isInitialized) 사용이 불가함.
				Kakao.cleanup();
				Kakao.init(res.keys);
			}
		}
	});
}

// 카카오 로그인, 회원가입 통합 처리
function kakaojoinlogin(kakaoObj) {
	var url = '../sns_process/kakaologin';
	var _callback = function(res) {
		if(res.result == true){
			loadingStop("body",true);
			loginCompleteSendNativeApp(res);
			joinloginsuccess();
		}else{
			loadingStop("body",true);
			joinloginfail(res);
			if(res.retururl){
				document.location.href=res.retururl;
			}
		}
	};

	if(jointype) {
		url = '../sns_process/kakaojoin';
		if(isJoinFromMyInfo()) {
			kakaoObj['facebooktype'] = 'mbconnect_direct';
		}
	}

	ajaxSendPost(url, kakaoObj, _callback);
}

// 페이스북 로그인 성공 시 인증 정보 가져오기
function initConnectedFacebook(response) {
	isLogin = true;
	initializeFbTokenValues();
	initializeFbUserValues();
	if(response.authResponse){
		fbId = response.authResponse.userID;
		fbAccessToken = response.authResponse.accessToken;
	}
}

// 페이스북 로그인 실패 처리
function failedConnectFacebook() {
	isLogin = false;

	openDialogAlert(getAlert('mb003'),'400','160',function(){});
	if(is_user) {
		logoutajax('facebook');
	}

	initializeFbTokenValues();
	initializeFbUserValues();

	loadingStop("body",true);
}

// 페이스북 로그인 취소 처리
function cancelConnectFacebook() {
	// 연결을 취소하셨습니다. 얼럿 노출
	loadingStop("body",true);
	openDialogAlert(getAlert('mb003'),'400','160',function(){});
}

// 페이스북 API 호출
function callFacebookApi(data, _callback) {
	FB.api('/me', function(response) {
		fbUid = response.email;
		fbName = response.name;
		if (fbName != "") {
			ajaxSendPost('../sns_process/facebookloginck', data, _callback);
		}
	});
}

// 페이스북 로그인 요청 콜백
function callbackFacebookLogin(response) {
	if (response && response.status == 'connected') {
		// 로그인
		initConnectedFacebook(response);

		// 회원가입 타입별로 data 분기처리
		var data = {};
		if (isJoinFromMyInfo()) {
			data['facebooktype'] = 'mbconnect_direct';
		} else if (isJoinForMember(plainJoinType)) {
			data['mtype'] = 'member';
			data['kid_agree'] = getSkinPatch14YearsOld();
			data['skin_patch_14years_old'] = isSkinPatch14YearsOld();
		} else if (isJoinForBusiness(plainJoinType)) {
			data['mtype'] = 'biz';
			data['skin_patch_14years_old'] = isSkinPatch14YearsOld();
		}

		var _callback = function(res) {
			if (res.result) {
				loadingStop("body",true);

				if (typeof res.msg !== 'undefined' && res.msg != null && res.msg !== '') {
					openDialogAlert(res.msg,'400','180',function(){
						loginCompleteSendNativeApp(res);
						joinloginsuccess();
					});
					return false;
				}

				loginCompleteSendNativeApp(res);
				joinloginsuccess();
				return;
			} else {
				joinloginfail(res);
			}
		};

		callFacebookApi(data, _callback);

   	} else if (response.status == 'not_authorized' || response.status == 'unknown') {
		failedConnectFacebook();
	} else {
		cancelConnectFacebook();
	}
}

function getSnsType(snstype) {
	if(snstype == "kksync") {
		snstype = "kk";
	}
	if(snstype == "kakaosync") {
		snstype = "kakao";
	}
	return snstype;
}

// sns 회원가입 snstype 에 따라 분기처리함
function snsIconJoin(snsType, joinType){
	var type = snsType;
	snstype = getSnsType(snsType);

	if(typeof joinType != 'undefined') {
		jointype = snstype + joinType;
	} else {
		jointype = snstype + $("input:radio[name='join_type']:checked").val();
	}

	if(type == 'kksync') {
		parseJoinType();
		joinwindowopen();
	} else {
		document.location.href='agreement?join_type='+jointype;
	}
}

$(document).ready(function() {

	// sns login 창 호출
	// sns-login-button					: 인트로/회원전용, 인트로/성인전용, 회원가입, 로그인
	// sns-login-button-mbconnect-direct	: 마이페이지/회원정보수정 (sns 통합)
	// fb-login-button-mbconnect-direct	: 마이페이지/회원정보수정 (페이스북 신규 통합)
	$(".sns-login-button, .sns-login-button-mbconnect-direct, .fb-login-button-mbconnect-direct").on('click', function(){
		var snstype = getSnsType($(this).attr('snstype'));
		loginwindowopen(snstype);
	});

	// SNS계정 연결해제
	$(".snsbuttondisconnectlay").on('click', function(){

		// 반응형인지에 따라 팝업 함수 분기처리
		if(gl_operation_type == "light"){
			showCenterLayer('#snsdisconnectlay');
		}else{
			openDialog('SNS 연동 해제', "snsdisconnectlay", {"width":500,"height":650});
		}
	});

	// 기존회원 sns 계정통합 해제하기 (마이페이지 전용)
	$(".sns-login-button-disconnect").on('click', function(){
		var snstype = $(this).attr('snstype');
		var snsrute = $(this).attr('snsrute');
		var title	= $(this).attr('alt');

		if(snsrute == 'kakaosync') snsrute = 'kakao';

		// 정말로 "+ title + "의 연결을 해제하시겠습니까?
		if(confirm(getAlert('mb139',title))){
			snsdisconnect(snstype, snsrute);
		}
	});

	// jointype 파싱처리
	parseJoinType();

	// 카카오 API 초기화
	initKakaoApi();
});