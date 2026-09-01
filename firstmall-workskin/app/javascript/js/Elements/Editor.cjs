var $ = window.jQuery;
var requirejs = function() {
    if(typeof arguments[0] !== 'object') throw new TypeError;
    if(typeof arguments[1] !== 'object' || !(arguments[1] instanceof Array)) throw new TypeError;
    var target = arguments[0];
    console.log($.when(
        $.map(arguments[1], function(_, path) {
            var dfd = $.Deferred();
            console.log($(Object.assign($(target).prop('ownerDocument').createElement('script'), {src:path}))
                .on('load', dfd.resolve)
                .on('error', dfd.reject)
                .appendTo(target), target)
            ;
            return dfd;
        })
    ));
};
module.exports = {
    initialize: function(something) {
        $(something).each(function(_, elem) {
            var dfd = $.Deferred();
            var sandbox = null
            $('<iframe>')
                .attr('src', 'about:blank')
                .attr('sandbox', 'allow-modals allow-popups allow-same-origin allow-scripts')
                .on('load', dfd.resolve)
                .on('error', dfd.reject)
                .insertBefore(elem);
            dfd
                .then(function(e) {
                    sandbox = e.target.contentWindow;
                    if(typeof sandbox !== 'object') throw new TypeError;
                    return requirejs(sandbox.document.head, [
                        '/app/javascript/plugin/editor/css/editor.css',
                        '/app/javascript/plugin/editor/js/editor_loader.js',
                        '/app/javascript/plugin/editor/js/daum_editor_loader.js',
                    ]);
                })
                .then(function() {
                    console.log(sandbox);
                })
        });
    },
};
