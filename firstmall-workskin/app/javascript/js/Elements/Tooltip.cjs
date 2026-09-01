module.exports = function(options) {
    var _this = this;
    var container = $('<div class="tooltip_area">');
    var wrap = $('<div class="tooltip_content">').appendTo(container);
    $('<a class="tooltip_close">')
        .on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            container.remove();
        })
        .appendTo(wrap);
    var content = $('<div class="tooltip_real tip_wrap">')
        .appendTo(wrap)
        .append(
            $('<h1>')
                .text(options.title)
        );
    if(options.html) {
        content.append(
            $('<div class="con_wrap">')
                .html(options.html)
        );
    }
    if(options.text) {
        var content_wrap = $('<ul class="bullet_hyphen">')
            .appendTo(
                $('<div class="con_wrap">')
                    .appendTo(content)
            );
        var content_lines = options.text.split("\n");
        for(var line_index = 0;line_index<content_lines.length;line_index++) {
            content_wrap.append(
                $('<li>').text(content_lines[line_index])
            );
        }
    }

    _this.show = function(target) {
        if(!(target = target || options.target)) throw new TypeError;
        container.appendTo(target).show();
    };
};

module.exports.attach = function (helpContext, targetElement) {
    var tooltip = new module.exports(helpContext);
    $(targetElement).on('click', function(e) {
        e.preventDefault();
        if(e.target !== this) return;
        tooltip.show(targetElement);
    });
};
