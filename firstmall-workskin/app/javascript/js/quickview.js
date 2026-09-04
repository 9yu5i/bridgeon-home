var quickviewScrollY = 0;
var $detachedElements = []; // [{ $el, $placeholder }]

var QV_COLLIDING_SELECTORS = [
    '#select_option_lay',
    '#addCart',
    '#priceDetail',
    '#wish_alert',
    'form[name="goodsForm"]'
];

function qvDetachHostElements() {
    if ($detachedElements.length) return; // already done for this quickview session
    QV_COLLIDING_SELECTORS.forEach(function (selector) {
        var $el = $(selector);
        if (!$el.length) return;
        var $placeholder = $('<span style="display:none" class="qv-detached-placeholder"></span>');
        $el.before($placeholder);
        $detachedElements.push({ $el: $el.detach(), $placeholder: $placeholder });
    });
}

function qvRestoreHostElements() {
    $detachedElements.forEach(function (entry) {
        entry.$placeholder.replaceWith(entry.$el);
    });
    $detachedElements = [];
}

function displayAddToCartQuickview(btn, goodsSeq, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    if (!goodsSeq) return false;

    qvDetachHostElements(); // <-- must run BEFORE the $.get below

    var $modal = $('#quickviewModal');
    if ($modal.length === 0) {
        $modal = $(
            '<div id="quickviewModal" class="qv-modal">' +
                '<div class="qv-modal-dim"></div>' +
                '<div class="qv-modal-panel">' +
                    '<button type="button" class="qv-modal-close" aria-label="Close">' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
                            '<line x1="18" y1="6" x2="6" y2="18"></line>' +
                            '<line x1="6" y1="6" x2="18" y2="18"></line>' +
                        '</svg>' +
                    '</button>' +
                    '<div class="qv-modal-scroll">' +
                        '<div id="quickviewBody"></div>' +
                    '</div>' +
                '</div>' +
            '</div>'
        ).appendTo('body');
        $modal.on('click', '.qv-modal-dim, .qv-modal-close', closeQuickviewModal);
        $(document).on('keydown.qvModal', function (e) {
            if (e.key === 'Escape') closeQuickviewModal();
        });
    }

    var $body = $('#quickviewBody').empty();
    quickviewScrollY = window.scrollY;
    $modal.addClass('is-open').css('display', '');

    // Lock the background page so only the modal scrolls (like Olive Young's
    // basket option sheet). iOS-safe: fix the body at its current offset and
    // restore it on close.
    document.body.style.top = (-quickviewScrollY) + 'px';
    document.body.classList.add('qv-scroll-locked');

    $.get('/goods/quickview', { no: goodsSeq })
        .done(function (html) {
            $body.html(html); // goods-view.js re-runs here, and now #addCart is unique
        })
        .fail(function () {
            $body.html('<p class="qv-error">Failed to load product.</p>');
        });
    return false;
}

function closeQuickviewModal() {
    $('#quickviewModal').removeClass('is-open').css('display', '');
    $('#quickviewBody').empty();
    // Release the background scroll lock, then restore the exact scroll offset.
    document.body.classList.remove('qv-scroll-locked');
    document.body.style.top = '';
    window.scrollTo(0, quickviewScrollY);
    qvRestoreHostElements(); // puts the main product's own #addCart (and its original handler) back
}