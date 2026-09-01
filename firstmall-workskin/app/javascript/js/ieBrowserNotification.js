// IE 11 브라우저 사용불가 안내  ie 8 ~ 11
if (window.document.documentMode !== undefined) {
	if (confirm("Internet Explorer 11 브라우저는 지원 되지 않습니다. \n새 웹브라우저 설치 페이지로 이동 하시겠습니까?")) {
		window.open("https://www.google.com/intl/ko/chrome");
	} else {
		alert('사이트가 정상적으로 표시 되지 않습니다.');
	}
}