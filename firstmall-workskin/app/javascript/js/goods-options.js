/*
select.fm-select 를 realtrend-select-wrap(트리거 버튼 + 커스텀 메뉴) 룩으로 감싸주는 스크립트.
goods.option.0.2.js 는 그대로 실제 <select> 의 value/change 이벤트로 동작하고,
이 스크립트는 그 위에 얹히는 시각적 레이어일 뿐이다. (goods.option.0.2.js 미수정)
*/
(function ($) {

	function renderMenu($select, $menu, $trigger) {
		$menu.empty();
		var selectedText = '';

		$select.find('option').each(function () {
			var $opt = $(this);
			var value = $opt.val();
			if (value === '') return; // "- Select -" 플레이스홀더는 메뉴에 노출하지 않음

			var $li = $('<li role="option"></li>').attr('data-value', value);

			var swatchSrc = null;
			if (typeof hasAnyColorSwatch === 'function' && hasAnyColorSwatch()) {
				swatchSrc = $('.color_swatch_selection_area .swatch-item[data-value="' + value + '"] img.swatch-img').first().attr('src');
			}
			if (swatchSrc) {
				$('<img class="realtrend-select-swatch-img" alt="" />').attr('src', swatchSrc).appendTo($li);
			}

			$('<span class="realtrend-select-option-label"></span>').text($opt.text()).appendTo($li);

			if ($opt.is(':disabled')) $li.addClass('is-sold-out');
			if ($opt.is(':selected')) {
				$li.addClass('is-selected');
				selectedText = $opt.text();
			}
			$menu.append($li);
		});

		$trigger.find('.realtrend-select-value').text(selectedText || $select.find('option').eq(0).text());
	}

function closeMenu($wrap, $menu, $trigger) {
	$wrap.removeClass('is-open is-open-up');
	$menu.removeClass('is-open is-open-up');
	$menu.css('max-height', '');
	$trigger.attr('aria-expanded', 'false');
}

function openMenu($wrap, $menu, $trigger, $select) {
	renderMenu($select, $menu, $trigger);
	$wrap.addClass('is-open');
	$menu.addClass('is-open');
	$trigger.attr('aria-expanded', 'true');

	var triggerRect = $trigger[0].getBoundingClientRect();
	var viewportHeight = window.innerHeight;
	var margin = 8;
	var spaceBelow = viewportHeight - triggerRect.bottom - margin;
	var preferredMax = 220;

	$wrap.removeClass('is-open-up');
	$menu.removeClass('is-open-up');
	$menu.css('max-height', Math.max(Math.min(preferredMax, spaceBelow), 100) + 'px');
}

	function initFmSelectDropdown(selectEl) {
		var $select = $(selectEl);
		if ($select.data('fmSelectEnhanced')) return;
		$select.data('fmSelectEnhanced', true);

		var $wrap = $('<span class="realtrend-select-wrap"></span>');
		var $trigger = $('<button type="button" class="realtrend-select-trigger" aria-haspopup="listbox" aria-expanded="false"><span class="realtrend-select-value"></span></button>');
		var $menu = $('<ul class="realtrend-select-menu" role="listbox"></ul>');

		$select.addClass('realtrend-select-native').attr('tabindex', '-1').attr('aria-hidden', 'true');
		$select.before($wrap);
		$wrap.append($trigger, $menu, $select);

		$wrap.data('fmSelectMenu', $menu);
		$wrap.data('fmSelectTrigger', $trigger);

		$select.data('fmSelectRender', function () { renderMenu($select, $menu, $trigger); });

		$trigger.on('click', function (e) {
			e.stopPropagation();
			if ($select.is(':disabled')) return;
			if ($wrap.hasClass('is-open')) {
				closeMenu($wrap, $menu, $trigger);
			} else {
				$('.realtrend-select-wrap.is-open').each(function () {
					var $w = $(this);
					closeMenu($w, $w.data('fmSelectMenu'), $w.data('fmSelectTrigger'));
				});
				openMenu($wrap, $menu, $trigger, $select);
			}
		});

		$menu.on('click', 'li', function (e) {
			e.stopPropagation();
			if ($(this).hasClass('is-sold-out')) return;
			$select.val($(this).attr('data-value')).trigger('change');
			$select.trigger('blur');
			closeMenu($wrap, $menu, $trigger);
		});
		renderMenu($select, $menu, $trigger);
	}

	$(document).off('change.fmSelect', 'select.fm-select').on('change.fmSelect', 'select.fm-select', function () {
		var render = $(this).data('fmSelectRender');
		if (render) render();
	});

	function syncAllFmSelectDropdowns() {
		$('select.fm-select').each(function () {
			var $select = $(this);
			if (!$select.data('fmSelectEnhanced')) {
				initFmSelectDropdown(this);
			} else {
				var render = $select.data('fmSelectRender');
				if (render) render();
			}
		});
	}

	// 필수옵션 분리형 AJAX(write_option)나 추가구성 복제(add_suboption)로
	// select/option 이 나중에 추가되는 경우를 자동으로 따라가기 위한 감시.
	// 우리가 만든 li/ul/button 삽입은 select나 option 요소가 아니므로 걸러진다 —
	// 무한루프로 이어지지 않는다.
	function watchForNewSelects(root) {
		if (!root || typeof MutationObserver === 'undefined') return;
		var observer = new MutationObserver(function (mutations) {
			var relevant = false;
			mutations.forEach(function (m) {
				m.addedNodes.forEach(function (n) {
					if (n.nodeType !== 1) return;
					if ((n.matches && (n.matches('select.fm-select') || n.matches('option'))) ||
						(n.querySelector && n.querySelector('select.fm-select, option'))) {
						relevant = true;
					}
				});
			});
			if (relevant) syncAllFmSelectDropdowns();
		});
		observer.observe(root, { childList: true, subtree: true });
	}

	$(document).off('click.fmSelectOutside').on('click.fmSelectOutside', function (e) {
		$('.realtrend-select-wrap.is-open').each(function () {
			var $w = $(this);
			closeMenu($w, $w.data('fmSelectMenu'), $w.data('fmSelectTrigger'));
		});
	});

	window.initFmSelectDropdowns = function () {
		syncAllFmSelectDropdowns();
		watchForNewSelects(document.getElementById('select_option_lay'));
	};

})(jQuery);