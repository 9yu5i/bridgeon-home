var bookmarkObj = {};

$(function () {
	// 즐겨찾기 아이콘 이벤트 설정
	setTimeout(() => {
	const icons = document.querySelectorAll(".ico-star");

	icons.forEach(icon => {
		icon.addEventListener("click", (event) => {
			event.target.classList.toggle("active")
			bookmarkMenu(icon)
		})
	})
	}, 100)

	// 즐겨찾기 메뉴 리스트 불러오기
	_loadBookmarkList();

	// LNB 열기/닫기 버튼 클릭이벤트
	$("#lnbCloseBtn").on("click", function(){
		const i_lnb_close = $(this).find('.i_lnb_close');
		const seq = i_lnb_close.attr('seq');

		// LNB 열기/닫기 설정 저장
		$.ajax({
			'url' : '../common/saveLnbConf',
			'data' : {'seq': seq},
			'type' : 'post',
			'global' : false,
			'success' : function(lnb_close_seq){
				if (!isNaN(lnb_close_seq)) {
					i_lnb_close.attr('seq', lnb_close_seq);
				} else {
					i_lnb_close.removeAttr('seq');
				}
			}
		});
	});
});

// 즐겨찾기 메뉴 리스트 불러오기
function _loadBookmarkList() {
	$.ajax({
		'url' : '../common/getBookmarkList',
		'global' : false,
		'dataType' : 'json',
		'success' : function(obj){
			bookmarkObj = obj;
			// 즐겨찾기 설정 화면에 적용
			_setBookmarkActive();
			_setBookmarkMenu();
		}
	});
}

// 즐겨찾기 추가/삭제 이벤트
function bookmarkMenu(icon) {
	const seq = $(icon).attr('seq');
	const code = $(icon).closest('.mitem-td').attr('code');
	const link = $(icon).next('a').attr('href');

	// 즐겨찾기 메뉴 설정 저장
	$.ajax({
		'url' : '../common/bookmark',
		'data' : {'seq': seq, 'code': code, 'link': link},
		'type' : 'post',
		'global' : false,
		'success' : function(){
			_loadBookmarkList();
		}
	});
}

// 즐겨찾기 아이콘 활성화
function _setBookmarkActive() {
	_removeBookmarkActive();

	$.each(bookmarkObj, function(idx, bookmark) {
		var menu = $('a[href="'+ bookmark.link +'"');
		var icon = menu.prev('.ico-star');
		
		if(typeof bookmark.link === 'undefined') {
			menu = $('.LNB').find('div[code='+ bookmark.main_menu +']');
			icon = menu.find('.ico-star');
		}

		icon.addClass('active').attr('seq', bookmark.seq);
	});
}

// 즐겨찾기 메뉴 출력
function _setBookmarkMenu() {
	_removeBookmarkMenu();

	$.each(bookmarkObj, function(idx, bookmark) {
		var subMenu;
		var aTag;
		var title;

		switch (bookmark.main_menu)
		{
			case 'designEdit':
				subMenu = $('.header-gnb-container').find('li[code="design"]');

				if (gl_operation_type === 'light') {
					var menu_link = '../design/main?setMode=mobile';
				} else {
					var menu_link = '../design/main?setMode=pc';
				}
	
				aTag = '<a href="' + menu_link +'" target="_blank">';
				title = '디자인 편집';
				break;

			case 'designEditor':
				subMenu = $('.header-gnb-container').find('li[code="design"]');
				var menu_click = "DM_window_eyeeditor('data/skin/" + design_working_skin + "/main/index.html')";
				aTag = '<a href="#" onclick="' + menu_click + '">';
				title = 'HTML 에디터';
				break;
			
			default:
				subMenu = $('.header-gnb-container').find('li[code='+ bookmark.main_menu +']');
				aTag = '<a href="'+ bookmark.link +'">';
				title = bookmark.title;
		}

		subMenu.find('.dropdown').append(
			aTag + title + '</a>'
		);
	});
}

// 즐겨찾기 아이콘 비활성화
function _removeBookmarkActive() {
	$('.LNB .submenu .ico-star').removeClass('active').removeAttr('seq');
}

// 즐겨찾기 메뉴 제거 
function _removeBookmarkMenu() {
	$('.header-gnb > li.mitem-td > div.dropdown').empty();
}