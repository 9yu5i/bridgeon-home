module.exports = {
    'toFragment': function(html) {
        return document.createRange().createContextualFragment(html);
    },
    'Form': {
        'DependencyResolver': function(form) {
            var resolve_dependencies = function() {
                var disableable_tags = ['BUTTON','FIELDSET','INPUT','OPTGROUP','OPTION','SELECT','TEXTAREA'];
                $(form).find('[data-depends]').each(function(_, elem){
                    try {
                        var depends = JSON.parse($(elem).attr('data-depends'));
                    } catch(ex) {
                        console.error('data-depends has invalid JSON string', elem);
                        return;
                    }
    
                    var is_matched = (function(){
                        var objectResolver = function(obj){
                            if(obj instanceof Array) {
                                for(var index=0;index<obj.length;index++) {
                                    if(!objectResolver(obj[index])) return false;
                                }
                                return true;
                            }
                            for(var name in obj) {
                                var value = obj[name];
                                var data_value = typeof form.elements[name] === 'object' ? Firstmall.Modules.DOMHelper.getFormElementValue(form.elements[name]) : '';
                                var regexpMatch = null;
                                if(regexpMatch=value.match(/^\/(.*)\/(.*)$/)) {
                                    if(!data_value.toString().match(new RegExp(regexpMatch[1], regexpMatch[2]))) return false;
                                    else continue;
                                }
                                if(data_value !== value) return false;
                            }
                            return true;
                        };
                        return objectResolver(depends);
                    })();
    
                    if(typeof elem.checked !== 'undefined') {
                        elem.checked = is_matched?elem.checked:false;
                    }
    
                    if(disableable_tags.indexOf(elem.tagName) !== -1) {
                        $(elem).prop('disabled', !is_matched);
                    }
                    else {
                        $(elem)[is_matched?'show':'hide']();
                    }
                });
            };
            $(form).on('change', resolve_dependencies);
            $(form).trigger('change');
        },
    },
    'Table': {
        'autoAlignment' : function() {
            if(arguments.length < 1) throw new TypeError;
            var elem_table = arguments[arguments.length-1];
            var max_columns = -1;
            jQuery(elem_table.rows)
                .each(function(_, elem_tr){
                    var children = elem_tr.cells;
                    max_columns = children.length > max_columns ? children.length : max_columns;
                })
                .each(function(_, elem_tr){
                    var children = elem_tr.cells;
                    if(children.length < max_columns) {
                        $(children).last().attr('colspan', max_columns - children.length + 1);
                    }
                })
            ;
        },
    },
    'RelativeDate': function(relativeDateString) {
        var seconds = {
            today: 0,
            second: 1,
            minute: 60,
            hour: 60*60,
            day: 60*60*24,
            week: 60*60*24*7,
            month: 60*60*24*30,
            year: 60*60*24*365,
        };
        var elements = relativeDateString.match(/(\+|\-|)\s*(\d*)\s*([a-z]+?)s?\s*$/);
        if(typeof seconds[elements[3]] === 'undefined') throw new TypeError(elements);
        return (+elements[2])*seconds[elements[3]]*(elements[1]==='-'?-1:1);
    },
    'toDateString': function(date) {
        if(!date instanceof Date)throw new TypeError;
        return (new Date(date.getTime()-(new Date).getTimezoneOffset()*60*1000)).toISOString().substr(0, 10);
    },
    'getSMSBytes': function(string){
        /** 멀티바이트 문자를 2, 싱글바이트 문자를 1로 해서 센다 */
        var count = 0;
        var char = 0;
        var index = 0;
        while(char=string.charCodeAt(index++)) {
            count += char >> 7 ? 2 : 1;
        }
        return count;
    },
    'getTTASMSBytes': function(string){
        /** TTA 표준에 따라 멀티바이트 문자가 단 하나라도 포함되어 있으면 모든 문자를 2로 센다 */
        var count = 0;
        var char = 0;
        var index = 0;
        var countperbytes = 1;
        while(char=string.charCodeAt(index++)) {
            if(countperbytes === 1 && char >> 7) {
                countperbytes = 2;
                count *= countperbytes;
            }
            count += countperbytes;
        }
        return count;
    },
    'getFormElementValue': function(element) {
        if(element instanceof Element && element.tagName === 'INPUT' && element.type.toLowerCase() === 'checkbox') {
            return element.checked?'on':'off';
        }
        return element.value;
    },
    'setFormElementValue': function(element, value) {
        if(element instanceof Element && element.tagName === 'INPUT' && element.type.toLowerCase() === 'checkbox') {
            element.checked = value === 'on';
            return;
        }
        element.value = value;
        return;
    },
    'getClassName': function(instance) {
        if(instance.constructor.name) return instance.constructor.name;
        var match = instance.constructor.toString().match(/^\s*function\s*(\S+)\s*\(|\[object\s(\S+)\]/);
        return match[1] || match[2] || null;
    },
};
