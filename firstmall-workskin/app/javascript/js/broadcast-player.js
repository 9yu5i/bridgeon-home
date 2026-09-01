var socket = new WebSocket(gl_broadcast.socketUrl+schjs.stream_key, 'chat');
var chatdata = '';
var stoptime = '';
$(function() {
	// 소켓 연결
	if(schjs.status != 'create') {
		startWebsocket();
	} else {
		checkStart();
	}

	// 화면 비율 조절
	viewResize();
	$(window).on('resize', function(){
		viewResize();
	});

	// 채팅 권한 체크 및 submit
	$("#chattingfrm").on('submit', function (e) {
		e.preventDefault();
		if( $("#msg").val()=="") return;
		if (socket.readyState !== socket.OPEN) {
			console.log("현재 채팅이 원활하지 않습니다.");
			return;
		}
		// 회원이나 관리자 판단 후에 전송
		$.ajax({
			type	 : "GET",
			url		 : "/broadcast/chat_auth",
			data	 : {"channel":schjs.stream_key}
		}).done(function(res) {
			res = JSON.parse(res);
			if(res.auth == true) {
				sendChat();
				$("#msg").val('');
			} else {
				alert("정상적인 접근방법이 아닙니다.");
			}
		});
	});

	$(".actions").on("click", function() {
		var actionFunc = $(this).data('action');
		actionFunc = 'action'+actionFunc;
		if(typeof actionFunc == 'string') {
			eval(actionFunc+'()');
		}
	})

	//채팅입력창 show hidden
	var isChattingOpen = false;
	$(".chattingOpenBtn").on("click", function(){
		if(is_user || is_admin) {
			isChattingOpen ? $(".area_input").hide() : $(".area_input").show();
			isChattingOpen=!isChattingOpen;
			$("#msg").focus();
		} else {
			if(confirm(getAlert('et065'))){
				var url = "/member/login";
				top.document.location.href = url;
				return;
			}else{
				return;
			}
		}

	});

	$(".click_area").on("click", function(){
		if(schjs.status == 'create') return;
		if(schjs.status === 'end' && !is_vod) return;

		if(is_vod) {
			$(".area_community, .head_wrap, .click_area, .bg_gradation").toggle();
			var obj = document.getElementById("player");
			var objDoc = obj .contentWindow || obj .contentDocument;
			objDoc.postMessage({ action : 'toggleControls' }, gl_broadcast.vodUrl);
		} else {
			$(".area_community, .head_wrap").toggle();
		}

	});

	//사운드 on off
	var isSoundOff = true;
	$(".soundBtn").on("click", function(){
		toggleSound();
	});

	function toggleSound() {
		var obj = document.getElementById("player");
		var objDoc = obj.contentWindow || obj.contentDocument;
		objDoc.postMessage({ action : 'toggleMute' }, gl_broadcast.vodUrl);
		if(isSoundOff)
		{
			$(".soundOn").show();
			$(".soundOff").hide();

		}else{
			$(".soundOn").hide();
			$(".soundOff").show();
		}
		isSoundOff = !isSoundOff;
	}

	//어드민 메시지 on off
	var isAdminMess = false;
	$(".adminMessBtn").on("click", function(){
		if(isAdminMess)
		{
			$(".adminMessOn").hide();
			$(".adminMessOff").show();
			$("#type").val('admin');
		}else{
			$(".adminMessOn").show();
			$(".adminMessOff").hide();
			$("#type").val('noti');
		}
		isAdminMess = !isAdminMess;
	});

	$(".product_list > li").on("click", function(){
		// 앱은 본창 그 외는 새창
		var goods_seq = $(this).data('seq');
		window.open("/personal_referer/broadcast?no="+schjs.bs_seq+"&goods_seq="+goods_seq+"&is_vod="+is_vod, schjs.link_target);

	});

	$(".btn_cast_end").on("click", function(){
		location.href="/broadcast/vod?no="+schjs.bs_seq;
	});

	$(".closeBtn").on("click", function(){
		window.history.back();
		self.close();
	});

	if(schjs.status=='end' && is_vod =='1') {
		loadChatting();
	}else if(schjs.status=='live' ) {
		showChatting();
		checkDisconnected();
		// 현재 방송 visitors 조회해서 view만 업데이트
		$.ajax({
			url: "/api/broadcast/info/"+schjs.bs_seq,
			success: function(data) {
				if(data.success == true) {
					if(data.data.visitors) {
						$(".view_cnt").html(data.data.visitors);
					}
				}
			}
		});
	}

	notiDelBtnCheck();
	connectPlayerToVod();
});

function checkStart() {
	// 10초에 한번 시작됐는지 체크
	setInterval(function() {
		$.ajax({
			url: "/api/broadcast/status/"+schjs.bs_seq,
			success: function(data) {
				if(data.status == 'live') {
					location.reload();
				}
			}
		});
	}, 10000);
}

// 화면 비율 조절
function viewResize(){
	var vh,
		wh = $(window).height(),
		ww = $(window).width();

	if( ww < 479){
		$('.area_video .inner').css({
			height: wh,
			width: ww
		});
		$('#player').css('height', vh);
	} else {
		if( wh <= 640 ) {
			vh = 640;
			$('.area_video .inner').css({
				height: vh,
				width: '360px'
			});
		} else {
			vh = $('.area_video').outerHeight();
			$('.area_video .inner').css({
				height: vh,
				width: vh/16*9
			});
		}
		$('#player').css('height', vh);
	}
}

// 노티 버튼 체크
function notiDelBtnCheck() {
	var notice = $(".notice").html();
	if(schjs.status=='live') {
		if($.trim(notice) == "") {
			$(".delnoti").hide();
			$(".more").hide()
		} else {
			if($(".notice").width() >= parseInt($(".area_community").width()*0.82)) $(".more").show();
			$(".delnoti").show();
		}
	}
}
// 방송 중일 때 최근 채팅 10개 가져오기
function showChatting() {
	chats.forEach(function (json, icx) {
		func = "set"+json.type;
		data = JSON.stringify(json.data);
		if (typeof func === 'string') {
			eval(func+"('"+data+"')");
		}
	});
}
// 방송 상태 체크하기
function checkDisconnected() {
	if(schjs.disconnected == 1) {
		$("#end_wrap").show();
		$("#player").hide();
	}
}

// VOD 시청 시 채팅 불러오기
function loadChatting() {
	$.ajax({
		url: "/api/broadcast/chat/"+schjs.bs_seq,
		success: function(data) {
			chatdata = data['data'];
		},
		error: function (parsedjson, textStatus, errorThrown) {
			console.log("parsedJson: " + JSON.stringify(parsedjson));
			console.log(
				"parsedJson status: " + parsedjson.status + '</br>' +
				"errorStatus: " + textStatus + '</br>' +
				"errorThrown: " + errorThrown);
		}
	  });
}

window.addEventListener('message', function(e) {
	if(e.data.action == 'timeUpdate') {
		timeUpdate(e.data.data);
		// 종료된거
	}

	if(e.data.action == 'ended') {
		console.log('ended');
	}

	if(e.data.action == 'toggleDisplay') {
		$(".area_community, .head_wrap, .click_area, .bg_gradation").show();
		// 종료된거
	}
});

function timeUpdate(tc) {
	tc = parseInt(tc);
	if((stoptime+1) > (tc)) {
		for(i = stoptime; i > tc;i--) {
			$(".tc_"+i).remove();
		}
	} else if((stoptime+1) < (tc)) {
		for(i = (stoptime+1); i <tc;i++) {
			if (typeof chatdata[i] !== 'undefined') {
				chatdata[i].forEach(function (json, icx) {
					func = "set"+json.type;
					data = JSON.stringify(json.data);
					if (typeof func === 'string') {
						eval(func+"('"+data+"','"+tc+"')");
					}
				});
			}
		}
	}
	stoptime = tc;
	if (typeof chatdata[tc] !== 'undefined') {
		chatdata[tc].forEach(function (json, icx) {
			func = "set"+json.type;
			data = JSON.stringify(json.data);
			if (typeof func === 'string') {
				eval(func+"('"+data+"','"+tc+"')");
			}
		});
	}
}

function sendChat() {
	query_string = "&bs_seq="+schjs.bs_seq+"&stream_key="+schjs.stream_key;
	$.ajax({
		type	 : "POST",
		url		 : "/api/broadcast/chat",
		data: $("#chattingfrm").serialize()+ query_string,
	});
}

function startWebsocket() {
	/**
	 * OPEN(1) 상태가 아니면 새로 connect
	 * https://developer.mozilla.org/ko/docs/Web/API/WebSocket/readyState
	 */
	if (socket.readyState !== socket.OPEN) {
		socket = new WebSocket(gl_broadcast.socketUrl+schjs.stream_key, 'chat');
	}
	socket.onopen = function (e) {
		// 소켓연결이 되었을 때
		console.log('Socket is onopen.');
	}
	socket.onmessage = function (e) {
		// 소켓에 메세지가 왔을 때
		var data = JSON.parse(e.data);
		res = data.data;
		if(typeof res == 'object') {
			Object.keys(res).map(function(key, index) {
				res[key] = res[key].toString();
			});
		}
		res = JSON.stringify(res);
		func = "set"+data.type;
		if (typeof func === 'string') {
			eval(func+"('"+res+"')");
		}
	}
	socket.onerror = function (e) {
		// 소켓에 에러가 생겼을 때
		console.log('onerror');
		socket.close();
	}
	socket.onclose = function (e) {
		// 소켓이 닫혔을 떄
		console.log('onclose');
		setTimeout(function() {
			startWebsocket();
			console.log('startWebsocket');
		}, 1000);
	}
}

function setchat(data,tc) { // 사용자 채팅
	data = JSON.parse(data);
	var chat;

	if(typeof tc != 'undefined' && parseInt(tc) > 0) {
		chat = '<dl class="tc_'+tc+'">';
	} else {
		chat = '<dl>';
	}
	chat += '<dt>';
	chat += data.name;
	chat += '</dt>';
	chat += '<dd>';
	chat += data.msg;
	chat += '</dd>';
	chat += '</dl>';
	$(".chatting > li").eq(0).append(chat);
	document.getElementsByClassName('chatting')[0].scrollTop = document.getElementsByClassName('chatting')[0].scrollHeight;
}

function setadmin(data, tc) { // 관리자 채팅
	data = JSON.parse(data);
	var chat;

	if(typeof tc != 'undefined' && parseInt(tc) > 0) {
		chat = '<dl class="manager_mess tc_'+tc+'">';
	} else {
		chat = '<dl class="manager_mess">';
	}
	chat += '<dt>';
	chat += data.name;
	chat += '</dt>';
	chat += '<dd>';
	chat += data.msg;
	chat += '</dd>';
	chat += '</dl>';
	$(".chatting > li").eq(0).append(chat);
	document.getElementsByClassName('chatting')[0].scrollTop = document.getElementsByClassName('chatting')[0].scrollHeight;
}

function setstats(data) { // view/visitor
	data = JSON.parse(data);
	$(".view_cnt").html(data.visitors);
}

function setlikes(data) { //좋아요
	data = JSON.parse(data);
	$(".heart_cnt").html(data.likes);
	heartdisplay();
}

function setnoti(data) { // 관리자 노티
	data = JSON.parse(data);
	if(is_admin == true) {
		data += '';
	}
	$(".notice").html(data);
	$(".mess").html(data);
	notiDelBtnCheck();
}

function setstatus(data) { // 시작 or stop
	data = JSON.parse(data);
	if(data == 'onair') {
		// 방송 중에 다시 재시작 된 경우
		if(schjs.status == 'live') {
			$("#end_wrap").hide();
			$("#player").attr("src", $("#player").attr("src")).show();
		} else {
			// 방송 시작 시
			location.reload();
		}
	} else if( data=='disconnected'){
		// 새로고침 , 메시지 노출
		// iframe 숨기고, background 노출하고
		$(".video_wrap > #end_wrap").show();
		$(".video_wrap > #end_wrap > .info > .end_mess").hide();
		$(".video_wrap > #end_wrap > .info > .retry_mess").show();
		$("#player").hide();
	} else {
		// 방송 종료
		$(".i_live").remove();
		$(".video_wrap > iframe").remove();
		$(".video_wrap > #end_wrap").show();
		$(".video_wrap > #end_wrap > .info > .end_mess").show();
		$(".video_wrap > #end_wrap > .info > .retry_mess").hide();
		$(".area_input,.chattingOpenBtn").hide(); // 채팅 영역 숨기기
	}
}

function heartdisplay() {
	$('.love_mot > img').each(function (index, item) {
		$(item).addClass("love_"+index);
		$(item).one('webkitAnimationEnd onaimationend msAnimationEnd animationend', function(e) { $(this).removeClass("love_"+index); });
	})
}

function openPopup(obj){
	var id = $(obj).attr("target");
	$("#"+id).show();
}

function closePopup(obj){
	var target = $(obj).closest(".popup");
	target.hide();
}

function actionlikes() {
	$.ajax({
		type	 : "POST",
		url		 : "/broadcast/touch_likes",
		data	 : {"channel":schjs.stream_key},
		dataType : 'json'
	});
}

function actioncopy() {
	var dummy = document.createElement('input'),
    text = window.location.href;

	document.body.appendChild(dummy);
	dummy.value = text;
	dummy.select();
	document.execCommand('copy');
	document.body.removeChild(dummy);
	alert('주소가 복사되었습니다.\n원하는 곳에 붙여넣기 해주세요.');
}

function actiondelnoti() {
	var query_string = "name="+$("#name").val();
	query_string += "&seq="+$("#seq").val();
	query_string += "&type=noti";
	query_string += "&msg=";
	query_string += "&bs_seq="+schjs.bs_seq+"&stream_key="+schjs.stream_key;

	$.ajax({
		type	 : "POST",
		url		 : "/api/broadcast/chat",
		data	 : query_string,
	});
}

// vod 다운로드
function actiondownload() {
	location.href=schjs.download;
}

// 새로고침
function actionrefresh() {
	location.reload();
}

// vod player url 연결
function connectPlayerToVod() {
	let playerUrl = $('#player').data('status') === 'live' ? gl_broadcast.livePlayerUrl : gl_broadcast.vodPlayerUrl;
	$('#player').attr('src', playerUrl + schjs.stream_key);
}