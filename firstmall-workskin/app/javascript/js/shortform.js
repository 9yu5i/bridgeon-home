/**
숏폼 콘텐츠 공통 JS
 **/


$(function () {

    if ($('.real-trend').length) {
        initRealTrendSection();
        initReelTitleBalance();
    }

});

function trackPreviewView(seq) {

	if (!seq) return;

	var key = 'shortform_preview_view_' + seq;
	var last = localStorage.getItem(key);
	var now = Date.now();

	if (last && (now - last < 30 * 60 * 1000)) {
		return;
	}

	localStorage.setItem(key, now);

	$.ajax({
		url: '/shortform/track_view',
		type: 'POST',
		dataType: 'json',
		data: {
			shortform_seq: seq
		}
	});
}


function initRealTrendSection() {

	$('.reel-card').on('click', function (e) {
		if ($(e.target).closest('.reel-product').length) return;

		var seq = $(this).data('seq');
		if (!seq) return;

		window.top.location.href = '/shortform/feed?seq=' + seq + '#reel-' + seq;
	});


	$('.reel-card').on('mouseenter', function() {
		var $card = $(this);
		var seq = $card.data('seq');

		trackPreviewView(seq);

		var $rtVideo = $card.find('.rt-video');
		var el = $rtVideo.get(0);

		if (!el) return;

		if (el.tagName === 'VIDEO') {
			el.play();
		} 
		else if ($rtVideo.hasClass('rt-video--yt-preview') && !$rtVideo.find('iframe').length) {
			var ytId = $rtVideo.data('youtube-id');
			if (!ytId) return;

			$rtVideo.append($('<iframe>', {
				class: 'rt-yt-preview-frame',
				src: 'https://www.youtube.com/embed/' + ytId + '?autoplay=1&mute=1&controls=0&loop=1&playlist=' + ytId + '&playsinline=1&modestbranding=1',
				allow: 'autoplay; encrypted-media'
			}));
		} 
		else if ($rtVideo.hasClass('rt-video--tt-preview') && !$rtVideo.find('iframe').length) {
			var ttId = $rtVideo.attr('data-tiktok-id');
			if (!ttId) return;

			$rtVideo.append($('<iframe>', {
				class: 'rt-tt-preview-frame',
				src: 'https://www.tiktok.com/player/v1/' + ttId + '?autoplay=1&muted=1&loop=1&controls=0&progress_bar=0&play_button=0&volume_control=0&fullscreen_button=0&timestamp=0&rel=0',
				allow: 'autoplay; fullscreen'
			}));
		}
	}).on('mouseleave', function() {
		var $rtVideo = $(this).find('.rt-video');
		var el = $rtVideo.get(0);

		if (!el) return;

		if (el.tagName === 'VIDEO') {
			el.pause();
		} else {
			$rtVideo.find('iframe').remove();
		}
	});

}

function initReelTitleBalance() {
	function fillLastLine(el) {
		var original = el.dataset.originalText;
		if (original === undefined) {
			original = el.textContent.trim();
			el.dataset.originalText = original;
		}

		var words = original.split(/\s+/);
		if (words.length < 2) return;

		var style = getComputedStyle(el);
		var canvas = fillLastLine._canvas || (fillLastLine._canvas = document.createElement('canvas'));
		var ctx = canvas.getContext('2d');
		ctx.font = style.fontWeight + ' ' + style.fontSize + ' ' + style.fontFamily;

		var containerWidth = el.clientWidth;
		var spaceWidth = ctx.measureText(' ').width;
		var fullWidth = ctx.measureText(words.join(' ')).width;

		if (fullWidth <= containerWidth) {
			el.textContent = original; // narrower→wider resize: undo a previous break if no longer needed
			return;
		}

		var lastLine = [];
		var lastLineWidth = 0;
		for (var i = words.length - 1; i >= 0; i--) {
			var wWidth = ctx.measureText(words[i]).width;
			var extra = lastLine.length ? spaceWidth : 0;
			if (lastLineWidth + extra + wWidth > containerWidth) break;
			lastLine.unshift(words[i]);
			lastLineWidth += extra + wWidth;
		}

		if (lastLine.length === 0) lastLine = [words[words.length - 1]];
		if (lastLine.length >= words.length) lastLine = words.slice(1);

		var firstLine = words.slice(0, words.length - lastLine.length);
		el.innerHTML = firstLine.join(' ') + '<br>' + lastLine.join(' ');
	}

	function balanceAll() {
		document.querySelectorAll('.reel-title').forEach(fillLastLine);
	}

	if (document.fonts && document.fonts.ready) {
		document.fonts.ready.then(balanceAll);
	} else {
		balanceAll();
	}

	var resizeTimer;
	$(window).on('resize', function () {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(balanceAll, 150);
	});

}

