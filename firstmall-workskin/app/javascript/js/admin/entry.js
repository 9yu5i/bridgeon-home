Firstmall.init = function(Config) {
    if(Firstmall.__initCalled) return;
    Firstmall.__initCalled = true;

    if(typeof RadioNodeList === 'undefined') {
        Object.defineProperty(HTMLCollection.prototype, 'value', {
            get: function() {
                for(var i=0;i<this.length;i++) {
                    if(this[i].type !== 'radio') console.warn(this[i].type);
                    if(this[i].checked) return this[i].checked;
                }
                return null;
            },
            set: function(value) {
                for(var i=0;i<this.length;i++) {
                    if(this[i].type !== 'radio') console.warn(this[i].type);
                    if(this[i].value === value) {
                        this[i].checked = true;
                        return;
                    }
                }
                console.warn('no matched value', this[0]||null, value);
            },
            configurable: true
        });
    }

    var spinner = $('<div class="overlay-spinner">');
    var Board = {
        delete: function(ids) {
            if(ids.length===0) return alert('삭제할 게시판이 없습니다.');
            if(!confirm([
                '삭제된 게시글과 댓글은 복구할 수 없습니다.',
                '',
                '아래 게시판 '+ids.length+'개를 모두 삭제하시겠습니까?'
            ].concat(ids).join("\n"))) return;

            $.ajax({
                url: '../boardmanager_process',
                data: {'mode':'boardmanager_multi_delete', 'delidar':ids},
                type: 'post',
                dataType: 'json',
            }).done(function() {
                openDialogAlert("게시판이 삭제되었습니다.", 400, 140, function() { location.reload(true); });
            }).fail(function(response) {
                var error = JSON.parse(response.responseText);
                openDialogAlert(error.message || '게시판 삭제 중 오류가 발생했습니다.', 400, 140);
            });
        }
    };

    var MenuList = function(oMenu) {
		var _this = this;
		_this.selectOption = new Array();

		_this.InitSelectOption = function() {
			_this.selectOption = new Array();
			$("#boardmain_item_use option").each(function() {
				if($(this).is(':selected'))
				_this.selectOption.push($(this).index());
			});
		};

        _this.Move = function(index, distance) {
            if(index+distance <= 0 || index+distance > oMenu.length-1) throw new RangeError('MenuList: no space left to move');
            var tmpOption = new Option(oMenu.options[index].text, oMenu.options[index].value, false, oMenu.options[index].selected);
            for (var i=index; i<index+distance; i++) {
                oMenu.options[i].text = oMenu.options[i+1].text;
                oMenu.options[i].value = oMenu.options[i+1].value;
                oMenu.options[i].selected = oMenu.options[i+1].selected;
            }
            oMenu.options[index+distance] = tmpOption;
        };
        _this.MoveToUp = function() {
            try {
				_this.InitSelectOption();
				$.each(_this.selectOption, function(idx, val) {
					_this.Move(parseInt(val)-1, 1);
				});
                _this.InitSelectOption();
            } catch(ex) {
                if(!(ex instanceof RangeError)) console.error(ex);
            }
        };
        _this.MoveToDown = function() {
            try {
				_this.InitSelectOption();
				$.each(_this.selectOption, function(idx, val) {
					_this.Move(parseInt(val), 1);
				});
                _this.InitSelectOption();
            } catch(ex) {
                if(!(ex instanceof RangeError)) console.error(ex);
            }
        };
        _this.MoveToTop = function() {
            var i=0;
            var len = oMenu.length;
            var cnt = 0;
            for (i=0; i<oMenu.length; i++) {
                if (oMenu.options[i].selected) {
                    if (i === 0) return;
                    var idx = i;

                    for (j=idx;j>cnt;j--) {
                        _this.MoveToUp(idx);
                        idx = idx - 1;
                    }
                    cnt = cnt + 1;
                }
            }
        }
        _this.MoveToBottom = function() {
            var cnt = oMenu.length-1;
            var i=0;

            for (i=oMenu.length-1; i>=0; i--) {
                if (oMenu.options[i].selected) {
                    if (i==oMenu.length-1) return;
                    var idx = i;

                    for (j=idx;j<cnt;j++) {
                        _this.MoveToDown(idx);
                        idx = idx + 1;
                    }
                    cnt = cnt - 1;
                }
            }
        };
    };

    var AdminControllers = {
        '__common': function() {
            function get_memo_list(page,search_keyword){

                memo_page = page ? page : memo_page;

                if(search_keyword && document.searchMemoForm.search_keyword.value==document.searchMemoForm.search_keyword.title){
                    document.searchMemoForm.search_keyword.value='';
                    search_keyword='';
                }

                $.ajax({
                    'url' : '../adminmemo_process/get_list',
                    'data' : {'page':page,'search_keyword':search_keyword},
                    'type' : 'post',
                    'dataType' : 'json',
                    'global' : false,
                    'success' : function(result){

                        $("#admin-memo-page").show().pager({pagenumber: result.page.nowpage, pagecount: result.page.totalpage, buttonClickCallback:function(clicked_page){
                            get_memo_list(clicked_page,search_keyword);
                        }});

                        var html = '';
                        if( result.record ) {
                            for(var i=0;i<result.record.length;i++){
                                html += '<div class="memo-item '+(result.record[i].check=='1'?'checked':'')+'" memo_seq="'+result.record[i].memo_seq+'">';
                                html += '	<form action="../adminmemo_process/edit" method="post" target="actionFrame">';
                                html += '	<input type="hidden" name="memo_seq" value="'+result.record[i].memo_seq+'">';
                                html += '	<div class="memo-item-important"><span class="icon-star-gray '+(result.record[i].important=='1'?'checked':'')+'" onclick="important_memo('+result.record[i].memo_seq+')"></span></div>';
                                html += '	<div class="memo-item-writer"><span>'+result.record[i].manager_id+'</span></div>';
                                html += '	<div class="memo-item-contents">';
                                html += '		<div class="memo-item-contents-summary">'+result.record[i].contents_htmlspecialchars+'</div>';
                                html += '		<textarea name="contents">'+result.record[i].contents_htmlspecialchars+'</textarea>';
                                html += '	</div>';
                                html += '	<div class="memo-item-openbtn"></div>';
                                html += '	<div class="memo-item-footer clearbox">';
                                html += '		<div class="fl">';
                                html += '			<span class="memo-item-check" onclick="check_memo('+result.record[i].memo_seq+')"></span>';
                                html += '			<input type="image" src="../../images/main/btn_memo_edit.gif" onmouseover="this.src=\'../../images/main/btn_memo_edit_on.gif\'" onmouseout="this.src=\'../../images/main/btn_memo_edit.gif\'" align="absmiddle" title="저장하기">';
                                html += '			<img src="../../images/main/btn_memo_del.gif" onmouseover="this.src=\'../../images/main/btn_memo_del_on.gif\'" onmouseout="this.src=\'../../images/main/btn_memo_del.gif\'" align="absmiddle" hspace="5" title="삭제하기" class="hand" onclick="delete_memo('+result.record[i].memo_seq+')">';
                                html += '		</div>';
                                html += '		<div class="fr fx11 gray">'+result.record[i].date+'</div>';
                                html += '	</div>';
                                html += '	</form>';
                                html += '</div>';
                            }
                        }else{
                            html = '<div class="pd5 desc center">검색된 메모가 없습니다.</div>';
                            $("#admin-memo-page").hide();
                        }

                        $("#admin-memo .memo-list").html(html);

                        addHeight	= $("#layout-body").outerHeight() + $(".memo-list").outerHeight() - 256;
                        if($("#layout-body").outerHeight() <= addHeight )
                            $("#admin-memo-container").height(addHeight);
                        $("#admin-memo").height("100%");
                    }
                });
            }

            function delete_memo(memo_seq){
                openDialogConfirm('메모를 삭제하시겠습니까?',400,200,function(){
                    $.ajax({
                        'url'	: '../adminmemo_process/delete',
                        'type'	: 'post',
                        'data'	: {'memo_seq':memo_seq},
                        'success' : function(){
                            $(".memo-item[memo_seq='"+memo_seq+"']").slideUp();
                            openDialogAlert("메모가 삭제 되었습니다.",400,240,function(){
                                get_memo_list(memo_page);
                            });
                        }
                    });
                });
            }

            function important_memo(memo_seq){
                $.ajax({
                    'url'	: '../adminmemo_process/important',
                    'type'	: 'post',
                    'data'	: {'memo_seq':memo_seq},
                    'global' : false,
                    'success' : function(important){
                        if(important=='1') $(".memo-item[memo_seq='"+memo_seq+"'] .memo-item-important .icon-star-gray").addClass('checked');
                        else $(".memo-item[memo_seq='"+memo_seq+"'] .memo-item-important .icon-star-gray").removeClass('checked');
                    }
                });
            }

            function check_memo(memo_seq){
                $.ajax({
                    'url'	: '../adminmemo_process/check',
                    'type'	: 'post',
                    'data'	: {'memo_seq':memo_seq},
                    'global' : false,
                    'success' : function(check){
                        if(check=='1'){
                            $(".memo-item[memo_seq='"+memo_seq+"']").addClass('checked');
                        }
                        else{
                            $(".memo-item[memo_seq='"+memo_seq+"']").removeClass('checked');
                        }
                    }
                });
            }

            function manualPostion()
        	{		
        		var len = $(".page-title > h2").length	
        		var obj

        		if(len>1)
        		{
        			obj = $(".page-title > h2:last-child");
        		}else{
        			obj = $(".page-title > h2");
        		}

        		if( obj.length > 0){
        			$(".page-manual-btn").css("left", obj.position().left+obj.width()+30);			
        			$(".page-manual-btn").css("display", "inline-block");
        		}
        	}

            $(".platformhelp").poshytip({
                className: 'tip-darkgray',
                bgImageFrameSize: 8,
                alignTo: 'target',
                alignX: 'up',
                alignY: 'bottom',
                offsetX: -55,
                offsetY: 6,
                allowTipHover: false,
                slide: false,
                showTimeout : 0
            });

            // 매뉴얼 버튼 링크
            $(".page-global-btn").appendTo($("#page-title-bar")).show().children("a");
            $(".page-manual-btn").appendTo($("#page-title-bar .page-title")).show().children("a").attr('href','https://gmanual.firstmall.kr/html/manual.php?url=board');

            $(".global-setting-bg, .global-setting-layer .close").bind("click", function(){
                $("#global-setting .global-setting-layer").fadeOut("slow");
                $("#global-setting .global-setting-bg").fadeOut();
            });

            $("#layout-header .header-gnb-container ul.header-gnb li.mitem-td").each(function(){
                $(this)
                .bind('mouseenter',function(){
                    $("div.submenu",this).stop(true,true).show();
                })
                .bind('mouseleave',function(){
                    $("div.submenu",this).stop(true,true).hide();
                });
            });

            $("#layout-header .header-gnb-container ul.header-qnb li.gnb-item").each(function(){
                $(this)
                .bind('mouseenter',function(){
                    $("ul.gnb-subnb",this).stop(true,true).slideDown('fast');
                })
                .bind('mouseleave',function(){
                    $("ul.gnb-subnb",this).stop(true,true).slideUp('fast');
                });
            });

            // 상단 메모, 중요알림,myfirstmall link,관리자정보 메뉴 활성 비활성
            var hsnbClass = ["hsnb-memo","hsnb-notice","hsnb-link","hsnb-admin"];
            for(var hsnbnum=0; hsnbnum<hsnbClass.length; hsnbnum++){
                $("#layout-header ul.header-snb li."+hsnbClass[hsnbnum]+" a").eq(0).click(function(){
                    if( $(this).hasClass('opened') ){
                        $("#layout-header ul.header-snb .item > a, #layout-header ul.header-snb .item > .hsnbm-menu").removeClass('opened');
                    }else{
                        $("#layout-header ul.header-snb .item > a, #layout-header ul.header-snb .item > .hsnbm-menu").removeClass('opened');
                        $(this).addClass('opened');
                        $(this).next().addClass('opened');
                    }
                });
            }
            $(".manager_alert_view_btn").bind('click',function(){
                $("#manager_alert_dialog").load('/admin/common/manager_alert_history');
                openDialog("중요행위발생을 알려 드립니다!", "manager_alert_dialog", {"width":800});
            });

            $( window ).resize(function() {
                manualPostion()
            });

            manualPostion();

            var memo_page = 1;
            var memo_animation = false;
            var addHeight = 0;
            var memo_opened	= false;
            var memoWidth;
            $("#admin-memo-container").height($("#layout-body").outerHeight());
            $("#admin-memo-openbtn").toggle(function(){
                memoWidth = 216;
                $("#admin-memo-container").outerWidth(memoWidth).height($("#layout-body").outerHeight());
                if(memo_animation)	$("#admin-memo").animate({'width':memoWidth,'margin-left':-memoWidth});
                else				$("#admin-memo").css({'width':memoWidth,'margin-left':-memoWidth});
                $(".memo-closebtn").show();
                $(".memo-openbtn").hide();
            },function(){
                $("#admin-memo").animate({'width':0,'margin-left':0});
                $(".memo-openbtn").show();
                $(".memo-closebtn").hide();
            });

            $("#admin-memo-openbtn").click();
            memo_animation = true;

            $(".memo-item-openbtn").click(function(){
                $(".memo-item").not($(this).closest('.memo-item')).removeClass('memo-item-opened');
                $(this).closest('.memo-item').toggleClass('memo-item-opened');
                if(memo_opened) {
                    $("#admin-memo-container").height(addHeight);		memo_opened = false;
                } else			{
                    $("#admin-memo-container").height(addHeight + 300); memo_opened = true;
                }
                $("#admin-memo").height("100%");
            });

            $(".memo-item-contents").click(function(){
                if(!$(this).closest('.memo-item').is(".memo-item-opened")){
                    $(this).closest('.memo-item').find(".memo-item-openbtn").click();
                }
            });

            $(".memo-item-contents textarea").on('keydown','Ctrl+S',function(event){
                event.preventDefault();
                $(this.form).submit();
                return false;
            });

            $("#admin-memo-container .memo-input").focus(function(){
                $(".memo-input-container").addClass('memo-input-container-focused');
            });
            get_memo_list();

            $("#search_help").bind("click",function(){
                openDialog("빠른 검색", "search_information", {"width":800});
            });
            $("#header_search_keyword").blur(function(){
                if("{_GET.header_search_keyword}" == $("#header_search_keyword").val()){
                    $(".header_search_type_text").show();
                }
                setTimeout(function(){
                    $('.header_searchLayer').hide()}, 500
                );
            });

            loadIssueCounts();
        },
        'board': {
            'dashboard': function() {
                var args = Firstmall.Modules.Router.QueryString(document.location.toString());

                /** 주요 게시판 보기 설정 */
                (function(){
                    $('#popup-board-dashboard-configure form').on('submit', function(e) {
                        var items = [];
                        e.preventDefault();
                        $('#boardmain_item_use option').each(function(_, elem) {
                            if(!elem.value) return;
                            items.push(elem.value);
                        });
                        $.ajax({
                            url: '/admin/internal/board/dashboard',
                            data: JSON.stringify(items),
                            contentType: 'text/json; charset=utf-8',
                            type: 'put',
                        }).done(function() {
                            openDialogAlert("설정이 저장되었습니다.", 400, 140, function() { location.reload(true); });
                        }).fail(function(response) {
                            var error = JSON.parse(response.responseText);
                            openDialogAlert(error.message || '설정 저장 중 오류가 발생했습니다.', 400, 140);
                        });
                    });

                    $("#board-dashboard-configure").click(function() {
                        openDialog('주요 게시판 보기 설정', 'popup-board-dashboard-configure', {
                            width: 600,
                            height: 420,
                        });
                    });

                    var list = new MenuList(document.getElementById('boardmain_item_use'));
                    $('#firstMove').click(list.MoveToTop);
                    $('#upMove').click(list.MoveToUp);
                    $('#downMove').click(list.MoveToDown);
                    $('#lastMove').click(list.MoveToBottom);

                    // 항목 추가
                    $('#add_element').click(function() {
                        $("#boardmain_item_nouse option:selected").each(function() {
                            $(this).appendTo("#boardmain_item_use");
                        });
                    });

                    $("#boardmain_item_nouse").dblclick(function(){
                        $("#boardmain_item_nouse option:selected").each(function() {
                            $(this).appendTo("#boardmain_item_use");
                        });
                    });

                    // 항목 삭제
                    $('#del_element').click(function() {
                        var cnt = 0;
                        $("#boardmain_item_use option:selected").each(function() {
                            $(this).appendTo("#boardmain_item_nouse");
                        });
                        if(cnt>0) alert("필수 항목은 삭제하실 수 없습니다.");
					});

                    $("#boardmain_item_use").dblclick(function(){
                        var cnt = 0;
                        $("#boardmain_item_use option:selected").each(function() {
                            $(this).appendTo("#boardmain_item_nouse");
                        });
                        if(cnt>0) alert("필수 항목은 삭제하실 수 없습니다.");
                    });
                })();

                /** 게시물 보기 */
                (function(){
                    var boardPopupHandler = function(e) {
                        var $this = $(e.target);
                        if(e.target.tagName !== 'A') {
                        	$this = $this.closest('a');
                    	}
                    	window.open($this.attr('href'), $this.attr('target'), 'width=1100,height=900,chrome=yes,centerscreen');
                        e.preventDefault();
                    };
                    $('[viewlink]').each(function(_, elem) {
                        $elem = $(elem);
                        $newElem = $('<a>')
                            .attr('target', '_blank')
                            .attr('href', $elem.attr('viewlink'))
                            .attr('class', $elem.attr('class'))
                            .html($elem.html())
                            .on('click', boardPopupHandler);
                        $elem.replaceWith($newElem);
                    });
                })();

                /** 출력 갯수 설정 */
                $('#display_quantity').find('option[value="'+args.perpage+'"]').prop('selected', 'selected');
                $('#display_quantity').on('change', function(e) {
                    location.href = location.pathname + '?perpage=' + e.target.value;
                });
            },
            'list': function() {
                $('[data-action="sms-restriction"]').click(function(){
                    $.get('../member/sms_restriction?first=1&mode=board', function(data) {
                        $('#restrictionPopup').html(data);
                        openDialog("발송시간 제한 설정","restrictionPopup",{"width":"700","height":"400"});
                    });
                });

                $('[data-action="table-check-all"]').change(function(e) {
                    $(e.target).closest('table').find('input[type="checkbox"]:not(:disabled):not([data-action])').prop('checked', e.target.checked);
                });

                $('[data-action="board-remove-checked"]').click(function(e) { Board.delete($('input[name="id[]"]:checked').map(function(){return $(this).val();}).get()); });
                $('[data-action="board-remove"]').click(function(e) { Board.delete([$(e.target).closest('tr').find('input[name="id[]"]').attr('value')]); });
                $('[data-action="board-copy"]').click(function(){
                    $('#BoardManagerCopy')[0].reset();
                    var board_id		= $(this).attr('board_id');
                    $("#copyid").val(board_id);
                    $("#new_id").attr('title','영문, 숫자, 언더스코어(_), 하이픈(-) 가능');
                    $("#new_name").attr('title','쌍따옴표(&quot;)를 제외한 모든문자 사용가능합니다.');
                    openDialog("게시판 복사 <span class='desc'>빠르게 게시판을 생성합니다.</span>", "boardmanagercopyPopup", {"width":600,"height":250});
                });

                $("#boardiframeusesave").click(function(){
                    var editor_secu_domain = $("#editor_secu_domain").val();
                    var editor_secu_file = $("#editor_secu_file").val();
                    var editor_secu_image = $("#editor_secu_image").val();

                    $.ajax({
                        'url' : '../boardmanager_process/boardiframeusesave',
                        'data' : {'editor_secu_domain':editor_secu_domain,'editor_secu_file':editor_secu_file,'editor_secu_image':editor_secu_image},
                        'type' : 'post',
                        'dataType': 'json',
                        'success' : function(res){
                            if(res.result == true ){
                                alert(res.msg);
                                location.reload();
                            }else{
                                alert(res.msg);
                            }
                        }
                    });
                });

                $(":input[name=boarddelete]").click(function(){
                    var board_name = $(this).attr('board_name');
                    if(confirm("삭제된 게시글과 댓글은 복구할 수 없습니다.\n정말로 [" + board_name +"]을(를) 삭제하시겠습니까? ")) {
                        var id = $(this).attr('board_id');
                        $.ajax({
                            'url' : '../boardmanager_process',
                            'data' : {'mode':'boardmanager_delete', 'delid':id},
                            'type' : 'post',
                            'dataType': 'json',
                            'success': function(data) {
                                if(data.result == true){
                                    alert(" [" + board_name +"]을(를) 삭제하였습니다!");
                                    document.location.reload();
                                }
                            }
                        });
                    }
                });

                $("input[name=boardmanagercopysave]").click(function(){
                    var boardid = $('#new_id');
                    var boardname = $('#new_name');
                    $('#BoardManagerCopy').validate({
                        onkeyup: false,
                        rules: {
                            id: { required:true, remote:{type:'post',url:'../boardmanager_process?mode=boardmanager_idck'}},
                            name: { required:true}
                        },
                        messages: {
                            id: { required:'아이디를 입력해 주세요.', remote: '아이디가 중복되었습니다.'},
                            name: { required:'게시판명을 입력해 주세요.'}
                        },
                        errorPlacement: function(error, element) {
                            error.appendTo(element.parent());
                        },
                        submitHandler: function(f) {
							var board_id_ck = /^[a-zA-Z0-9_-]{3,20}$/; // 아이디 검사식
							if (board_id_ck.test(boardid.val()) != true) { // 아이디 검사
								alert('특수문자 사용은 불가합니다.\n아이디는 영문,숫자,언더스코어,하이픈만 사용가능합니다.');
								boardid.focus();
								return false;
							}

                            if (boardname.val().length < 3) { // 게시판명 검사
                                alert('3자리이상 게시판명을 입력해 주세요.');
                                boardname.focus();
                                return false;
                            }

                            if(boardname.indexOf('"')) {
                                alert('게시판 이름에 사용할 수 없는 문자가 포함되어 있습니다.');
                                boardname.focus();
                                return false;
                            }
                            f.submit();
                        }
                    });

                    $('#id').after('<strong></strong>');
                    // #boardid 인풋에서 onkeyup 이벤트가 발생하면
                    boardid.keyup( function() {
                        var s = $(this).next('strong'); // strong 요소를 변수에 할당
                        if (boardid.val().length == 0) { // 입력 값이 없을 때
                            s.text(''); // strong 요소에 포함된 문자 지움
                        } else if (boardid.val().length < 3) { // 입력 값이 3보다 작을 때
                            s.text('너무 짧아요.'); // strong 요소에 문자 출력
                        } else if (boardid.val().length > 20) { // 입력 값이 16보다 클 때
                            s.text('너무 길어요.'); // strong 요소에 문자 출력
                        }
                    });

                    $('#BoardManagerCopy').submit();
                });

                $("input[name=boardmanagercopybtn]").click(function(){
                    $('#BoardManagerCopy')[0].reset();//초기화
                    var board_id		= $(this).attr('board_id');
                    var board_name	= $(this).attr('board_name');
                    $("#copyid").val(board_id);
                    $("#new_id").attr('title','영문, 숫자, 언더스코어(_), 하이픈(-) 가능');
                    $("#new_name").attr('title','쌍따옴표(&quot;)를 제외한 모든문자 사용가능합니다.');
                    openDialog("게시판 복사 <span class='desc'>빠르게 게시판을 생성합니다.</span>", "boardmanagercopyPopup", {"width":600,"height":250});
                });

                $('#typecheckedall').on('click', function() {
                    $("input[name='skin_type[]']").attr('checked',true);
                });

                // 게시판 등록
                $('#manager_write_btn').on('click', function() {
                    $("#search_text").focus();//검색
                    var queryString = $('#boardsearch').formSerialize();
                    document.location.href='./manager_write?'+queryString;
                });

                // // 게시판 등록(무료몰인경우 생성불가
                // $('#manager_write_btnY').on('click', function() {
                //     {?config_system.service.max_board_cnt && use_board_cnt >=config_system.service.max_board_cnt}
                //     openDialog("게시판 이용 안내<span class='desc'></span>", "BoadService", {"width":650,"height":230});
                //     {/}
                // });

                // 게시판 수정
                $("input[name=manager_modify_btn]").on("click", function() {
                    $("#search_text").focus();//검색
                    var board_id = $(this).attr("board_id");
                    var board_name = $(this).attr("board_name");
                    var queryString = $('#boardsearch').formSerialize();
                    document.location.href='./manager_write?'+queryString+'&id='+board_id;
                    //boardaddFormDialog('./manager_write?id='+board_id, '90%', '700', board_name + ' 게시판 수정');
                });

                // 체크박스 색상
                $("input[type='checkbox'][name='del[]']").on('change',function(){
                    if($(this).is(':checked')){
                        $(this).closest('tr').addClass('checked-tr-background');
                    }else{
                        $(this).closest('tr').removeClass('checked-tr-background');
                    }
                }).change();

                $('#board_charge').on('click', function (){
                    $.get('board_payment', function(data) {
                        $('#boardPaymentPopup').html(data);
                        openDialog("게시판 추가 신청", "boardPaymentPopup", {"width":"800","height":"650"});
                    });
                });
            },
            'create': function() {
                var form = document.forms['board-create'];
                var args = Firstmall.Modules.Router.QueryString(document.location.toString());

                /** category 처리 */
                $(document.forms['board-create']).find('[data-associate="category"], [data-associate="reviewcategory"]').each(function(_, elem){
                    var $elem = $(elem);
                    var $empty_marker = null;
                    var checkRows = function() {
                        if($elem.closest('table').prop('rows').length<=1) {
                            $empty_marker = $empty_marker || $('<tr>')
                                .append($('<td>')
                                    .attr('colspan', 3)
                                    .text('분류가 없습니다.')
                                )
                                .appendTo($elem)
                            ;
                            return;
                        }
                        else if($empty_marker !== null) {
                            $empty_marker.remove();
                            $empty_marker = null;
                        }
                    };
                    var addRow = function(_, value){
                        $elem.append($('<tr>')
                            .append($('<td>')
                                .append($('<img>')
                                    .attr('src', '/admin/skin/default/images/common/icon_move.png')
                                )
                            )
                            .append($('<td>')
                                .append($('<input>')
                                    .attr('type', 'text')
                                    .attr('name', $elem.attr('data-associate') + '[]')
                                    .attr('value', value || '')
                                )
                            )
                            .append($('<td>')
                                .append($('<input>')
                                    .attr('type', 'button')
                                    .attr('class', 'btn_minus')
                                    .on('click', function(e) { $(e.target).closest('tr').remove(); checkRows(); })
                                )
                            )
                        );
                        checkRows();
                    };
                    $.each(JSON.parse($elem.attr('data-values')), addRow);
                    $elem.closest('table')
                        .tableDnD()
                        .find('.btn_plus')
                        .on('click', addRow)
                    ;
                    checkRows();
				});
				$(document.forms['board-create']).find('[data-associate="goodsreview_sub"]').each(function(_, elem){
                    var $elem = $(elem);
                    var $empty_marker = null;
                    var checkRows = function() {
                        if($elem.closest('table').prop('rows').length<=1) {
                            $empty_marker = $empty_marker || $('<tr class="nodata">')
                                .append($('<td>')
                                    .attr('colspan', 7)
                                    .text('평가 항목이 없습니다.')
                                )
                                .appendTo($elem)
                            ;
                            return;
                        }
                        else if($empty_marker !== null) {
                            $empty_marker.remove();
                            $empty_marker = null;
                        }
					};
                    var addRow = function(_, row) {
                        $elem.append($('<tr>')
                            .append($('<td>')
                                .attr('class', 'center')
                                .append($('<img>')
                                    .attr('src', '/admin/skin/default/images/common/icon_move.png')
                                )
                                .append($('<input>')
                                    .attr('type', 'hidden')
                                    .attr('name', 'labelItem[user]['+row.bulkorderform_seq+'][bulkorderform_seq]')
                                    .attr('value', row.bulkorderform_seq)
                                )
                                .append($('<input>')
                                    .attr('type', 'hidden')
                                    .attr('name', 'labelItem[user]['+row.bulkorderform_seq+'][id]')
                                    .attr('value', row.label_id)
                                )
                                .append($('<input>')
                                    .attr('type', 'hidden')
                                    .attr('name', 'labelItem[user]['+row.bulkorderform_seq+'][name]')
                                    .attr('value', row.label_title)
                                )
                                .append($('<input>')
                                    .attr('type', 'hidden')
                                    .attr('name', 'labelItem[user]['+row.bulkorderform_seq+'][type]')
                                    .attr('value', row.label_type)
                                )
                                .append($('<input>')
                                    .attr('type', 'hidden')
                                    .attr('name', 'labelItem[user]['+row.bulkorderform_seq+'][exp]')
                                    .attr('value', row.label_desc)
                                )
                                .append($('<input>')
                                    .attr('type', 'hidden')
                                    .attr('name', 'labelItem[user]['+row.bulkorderform_seq+'][value]')
                                    .attr('value', row.label_value)
								)
								.append($('<input>')
                                    .attr('type', 'hidden')
                                    .attr('name', 'labelItem[user]['+row.bulkorderform_seq+'][icon]')
                                    .attr('value', row.label_icon)
                                )
                            )
                            .append($('<td>')
                                .text(row.label_title)
                            )
                            .append($('<td>')
                                .text(row.label_desc)
                            )
                            .append($('<td>')
                                .attr('class', 'center')
                                .append($('<input>')
                                    .attr('type', 'checkbox')
                                    .attr('name', 'labelItem[user]['+row.bulkorderform_seq+'][use]')
									.attr('value', row.used)
									.attr('class','bulkorder_chUse')
									.attr('bulkorder_ch', row.bulkorderform_seq)
                                    .prop('checked', row.used === 'Y')
                                )
                            )
                            .append($('<td>')
                                .attr('class', 'center')
                                .append($('<input>')
                                    .attr('type', 'checkbox')
                                    .attr('name', 'labelItem[user]['+row.bulkorderform_seq+'][required]')
									.attr('disabled', row.used === 'N')
									.attr('value', row.used)
									.attr('class','bulkorder_chRequired')
                                    .prop('checked', row.required === 'Y')
                                )
                            )
                            .append($('<td>')
                                .append($('<button>')
                                    .attr('type', 'button')
									.attr('class', 'resp_btn v2')
									.attr('data-action','goodsreview.editColumn')
									.attr('value', row.bulkorderform_seq)
                                    .text('수정')
                                )
                            )
                            .append($('<td>')
                                .append($('<input>')
									.attr('type', 'button')
									.attr('class','btn_minus')
                                    .on('click', function(e) { deleteRow(this)})
                                )
                            )
                        );
                    };
                    var rows = JSON.parse($elem.attr('data-values'));
                    $.each(rows, addRow);
                    $elem.closest('table')
                        .tableDnD()
                    ;

                    $(form).find('[data-action="bulkorder.addColumn"]').on('click', function(e) {
                        e.preventDefault();
                        openDialog('대량구매 입력항목 추가','joinDiv',{width:'800',height:'300'});
                    });
                });

                $(form).find('.joinform-user-table')
                    .tableDnD()
                ;

                $(form).find('[data-associate="bulkorder_sub"]').first().each(function(_, elem){
                    var $elem = $(elem);
                    var notDeletableFields = [
                        'person_name',
                        'person_email',
                        'person_tel1',
                        'person_tel2',
                        'company',
                        'shipping_date',
                    ];
                    var addRow = function(_, row) {
                        $elem.append($('<tr>')
                            .append($('<td>')
                                .attr('class', 'center')
                                .append($('<img>')
                                    .attr('src', '/admin/skin/default/images/common/icon_move.png')
                                )
                                .append($('<input>')
                                    .attr('type', 'hidden')
                                    .attr('name', 'labelItem[user]['+row.bulkorderform_seq+'][bulkorderform_seq]')
                                    .attr('value', row.bulkorderform_seq)
                                )
                                .append($('<input>')
                                    .attr('type', 'hidden')
                                    .attr('name', 'labelItem[user]['+row.bulkorderform_seq+'][id]')
                                    .attr('value', row.label_id)
                                )
                                .append($('<input>')
                                    .attr('type', 'hidden')
                                    .attr('name', 'labelItem[user]['+row.bulkorderform_seq+'][name]')
                                    .attr('value', row.label_title)
                                )
                                .append($('<input>')
                                    .attr('type', 'hidden')
                                    .attr('name', 'labelItem[user]['+row.bulkorderform_seq+'][type]')
                                    .attr('value', row.label_type)
                                )
                                .append($('<input>')
                                    .attr('type', 'hidden')
                                    .attr('name', 'labelItem[user]['+row.bulkorderform_seq+'][exp]')
                                    .attr('value', row.label_desc)
                                )
                                .append($('<input>')
                                    .attr('type', 'hidden')
                                    .attr('name', 'labelItem[user]['+row.bulkorderform_seq+'][value]')
                                    .attr('value', row.label_value)
                                )
                            )
                            .append($('<td>')
                                .text(row.label_title)
                            )
                            .append($('<td>')
                                .text(row.label_desc)
                            )
                            .append($('<td>')
                                .attr('class', 'center')
                                .append($('<input>')
                                    .attr('type', 'checkbox')
                                    .attr('name', 'labelItem[user]['+row.bulkorderform_seq+'][use]')
                                    .attr('value', row.used)
                                    .prop('checked', row.used === 'Y')
                                )
                            )
                            .append($('<td>')
                                .attr('class', 'center')
                                .append($('<input>')
                                    .attr('type', 'checkbox')
                                    .attr('name', 'labelItem[user]['+row.bulkorderform_seq+'][required]')
                                    .attr('value', row.required)
                                    .prop('checked', row.required === 'Y')
                                )
                            )
                            .append($('<td>')
                                .append($('<button>')
                                    .attr('type', 'button')
                                    .attr('class', 'resp_btn v2')
                                    .text('수정')
                                )
                            )
                            .append($('<td>')
                                .append($('<input>')
                                    .attr('type', 'button')
                                    .attr('class', 'btn_minus'+(notDeletableFields.indexOf(row.label_id)!==-1?' hide':''))
                                    .on('click', function(e) { $(e.target).closest('tr').remove(); checkRows(); })
                                )
                            )
                        );
                    };
                    var rows = JSON.parse($elem.attr('data-values'));
                    $.each(rows, addRow);
                    $elem.closest('table')
                        .tableDnD()
                    ;

                    $(form).find('[data-action="bulkorder.addColumn"]').on('click', function(e) {
                        e.preventDefault();
                        openDialog('대량구매 입력항목 추가','joinDiv',{width:'800',height:'300'});
                    });
                });

                /** Tooltip handler 설치 */
                $(form).find('[data-tooltip-title]').each(function(_, elem){
                    Firstmall.Modules.Tooltip.attach({
                        title: $(elem).attr('data-tooltip-title')||null,
                        text: $(elem).attr('data-tooltip-text')||null,
                        html: $(elem).attr('data-tooltip-html')||null,
                    }, elem);
                });

                /** table span 자동계산 */
                $(form).find('table').each(Firstmall.Modules.DOMHelper.Table.autoAlignment);

                /** data-depends 처리 */
                Firstmall.Modules.DOMHelper.Form.DependencyResolver(form);

                /** data-preview 처리 */
                var resolve_preview = function() {
                    var target_tags = ['IMG', 'IFRAME'];
                    $(form).find('[data-preview]').each(function(_, elem){
                        if(target_tags.indexOf(elem.tagName) === -1) { console.warn('Misuse of `data-preview`'); return; }
                        var target = $(elem).attr('data-preview');
                        if(typeof form.elements[$(elem).attr('data-preview')] !== 'object') { throw new Exception('Target form element `'+ target +'` is not exists.'); }
                        elem.src = form.elements[$(elem).attr('data-preview')].value;
                    });
                };
                $(form).on('change', resolve_preview);

                /** data-text-counts-at 처리 */
                (function() {
                    var targets = {};
                    $(form).find('[data-text-counts-at]').each(function(_, elem){
                        var $elem = $(elem);
                        var target = $elem.attr('data-text-counts-at');
                        if(typeof form.elements[target] !== 'object') { console.warn('Target form element `'+ target +'` is not exists.'); }
                        targets[target] = true;
                    });
                    $.each(targets, function(query) {
                        var target = form.elements[query];
                        $(target).on('keydown', function(e) {
                            /** keydown 이벤트는 키가 value에 반영되기 전에 발생하므로 이벤트 루프를 최소한으로 더 돌려서 value가 반영되도록 한다 */
                            setTimeout(function() {
                                var currentValue = e.target.value.replace(/\{(?:shopName|boardName|userid|userName)\}/, '');
                                var macroLength = e.target.value.length - currentValue.length;
                                $(form).find('[data-text-counts-at="'+e.target.name+'"]').each(function(_, elem) {
                                    var countStr = Firstmall.Modules.DOMHelper.getTTASMSBytes(currentValue);
                                    if(typeof elem.value !== 'undefined') $(elem).val(countStr);
                                    else $(elem).text(countStr);
                                    $(elem).parent().find('[data-macro-counts-at]').each(function(_, elem) {
                                        if(typeof elem.value !== 'undefined') $(elem).val(macroLength?'+'+macroLength:'');
                                        else $(elem).text(macroLength?'+'+macroLength:'');
                                    });
                                });
                            }, 1);
                        }).trigger('keydown');
                    });
                })();

                /** data-associate 처리 */
                $(form).find('[data-associate]').on('change', function(e) {
                    var $target = $(e.target);
					if(typeof $target.attr('data-associate') == "undefined") {
						return false;
					}
                    var name = $target.attr('data-associate').replace(/^icon_(.*)_img$/g, '$1');
                    var data = new FormData;
                    data.append('mode', 'boardmanager_icon');
                    data.append('icontype', name);
                    data.append('seq', $(form).attr('data-seq'));
                    data.append('boardid', args.id);
                    data.append('board_icon', e.target.files[0]);
                    $.ajax({
                        url: '/admin/boardmanager_process',
                        data: data,
                        processData: false,
                        contentType: false,
                        dataType: 'json',
                        type: 'POST',
                    }).then(function(e){
                        console.log(e.file);
                        $target.closest('td').find('[data-preview="'+ $target.attr('data-associate') +'"]').attr('src', e.file);
                    }, function(e){
                        var result = JSON.parse(e.responseText);
                        openDialogAlert(result.error || '파일 업로드가 실패했습니다.');
                    });
                });

                /** data-submit */
                $('[data-submit]').on('click', function(e) { 
					f = $($(e.target).attr('data-submit'));
					if(readyEditorForm(f)) {
						$("#board-create").validate({
							onkeyup: false,
							rules: {
								board_id: { required:true, remote:{type:'post',url:'../boardmanager_process?mode=boardmanager_idck'}},
								board_name: { required:true}
							},
							messages: {
								board_id: { required:'아이디를 입력해 주세요.', remote: '아이디가 중복되었습니다.'},
								board_name: { required:'게시판명을 입력해 주세요.'}
							},
							errorPlacement: function(error, element) {
								error.appendTo(element.parent().parent());
							},
							submitHandler: function(f) {
								var boardid = $('#board_id');
								var boardname = $('#board_name');
								var board_id_ck = /^[a-zA-Z0-9_-]{3,20}$/; // 아이디 검사식
								if (board_id_ck.test(boardid.val()) != true) { // 아이디 검사
									alert('특수문자 사용은 불가합니다.\n아이디는 영문,숫자,언더스코어,하이픈만 사용가능합니다.');
									boardid.focus();
									return false;
								}
	
								if (boardname.val().length < 3) { // 게시판명 검사
									alert('3자리이상 게시판명을 입력해 주세요.');
									boardname.focus();
									return false;
								}
								if(boardname.val().indexOf('"') > -1) {
									alert('게시판 이름에 사용할 수 없는 문자가 포함되어 있습니다.');
									boardname.focus();
									return false;
								}
								$($(e.target).attr('data-submit'))[0].submit();
							}
						});
						$("#board-submit").click();
					}
					
				});

				$(form).trigger('change');
            },
            'counsel_catalog': function() {
                var args = Firstmall.Modules.Router.QueryString(document.location.toString());
                var form = document.forms['board-counsel-search'];
                if(!form) throw new TypeError;
                var modify = function(seq){
                    $.ajax({
                        'url' : '/admincrm/counsel_process/counsel_view',
                        'data' : {'seq':seq},
                        'type' : 'post',
                        'dataType': 'json',
                    }).then(function(res) {
                        $("form#counselModifyForm input[name='counsel_seq']").val(seq);
                        $("#counselSeq").html(res.counsel_seq);
                        if(res.order_seq != 0){
                            $("form#counselModifyForm input[name='order_seq']").val(res.order_seq);
                        }else{
                            $("form#counselModifyForm input[name='order_seq']").val("");
                        }
                        if(args.order_seq && !args.member_seq)
                            $("form#counselModifyForm input[name='order_seq']").attr("readonly",true);
                        $("form#counselModifyForm input[name='export_code']").val(res.export_code);
                        $("form#counselModifyForm input[name='return_code']").val(res.return_code);
                        $("form#counselModifyForm input[name='refund_code']").val(res.refund_code);
                        if(res.goods_qna_seq != 0){
                            $("form#counselModifyForm input[name='goods_qna_seq']").val(res.goods_qna_seq);
                        }else{
                            $("form#counselModifyForm input[name='goods_qna_seq']").val("");
                        }
                        if(res.goods_review_seq != 0){
                            $("form#counselModifyForm input[name='goods_review_seq']").val(res.goods_review_seq);
                        }else{
                            $("form#counselModifyForm input[name='goods_review_seq']").val("");
                        }
                        if(res.parent_counsel_seq != 0){
                            $("form#counselModifyForm input[name='parent_counsel_seq']").val(res.parent_counsel_seq);
                        }else{
                            $("form#counselModifyForm input[name='parent_counsel_seq']").val("");
                        }

                        if(res.counsel_status) $("form#counselModifyForm input[name='counsel_status']").val(res.counsel_status);
                        if(res.counsel_contents) $("form#counselModifyForm #counsel_contents").val(res.counsel_contents);

                        openDialog("상담 내역 수정", "counselModify", {width:600,height:700});
                    }, function(){
                        alert("권한이 없습니다.");
                    });
				};
				var remove = function(seq){
					var msg = "상담글을 삭제하겠습니까?  ";
					openDialogConfirmtitle('상담글 삭제',msg,'450','200',function(){
						$.ajax({
							'url' : '/admincrm/counsel_process/counsel_remove',
							'data' : {'seq':seq},
							'type' : 'post',
							'dataType': 'json',
							'success' : function(res){
								loadingStop("body",true);
								msg = '정상적으로 삭제되었습니다.';
								if(res == 'auth') msg = '권한이 없습니다.';
							openDialogAlert(msg,'400','140',function(){document.location.reload(); });
						}
					});},function(){});
				};
                var view = function(seq){
                    $.ajax({
                        'url' : '/admincrm/counsel_process/counsel_view',
                        'data' : {'seq':seq},
                        'type' : 'post',
                        'dataType': 'json',
                    }).then(function(res) {
						res.order_seq = res.order_seq.replace(/(^0+)/, "");
						res.goods_qna_seq = res.goods_qna_seq.replace(/(^0+)/, "");
						res.goods_review_seq = res.goods_review_seq.replace(/(^0+)/, "");
						res.parent_counsel_seq = res.parent_counsel_seq.replace(/(^0+)/, "");
                        $('[data-associate="counsel.order_seq"]').html('<a href="/admin/order/view?no='+res.order_seq+'" target="_blank">'+res.order_seq+'</a>');
                        $('[data-associate="counsel.export_code"]').html('<a href="/admin/export/view?no='+res.export_code+'" target="_blank">'+res.export_code+'</a>');
                        $('[data-associate="counsel.return_code"]').html('<a href="/admin/returns/view?no='+res.return_code+'" target="_blank">'+res.return_code+'</a>');
                        $('[data-associate="counsel.refund_code"]').html('<a href="/admin/refund/view?no='+res.refund_code+'" target="_blank">'+res.refund_code+'</a>');
                        $('[data-associate="counsel.goods_qna_seq"]').html('<a href="/board/view?id=goods_qna&seq='+res.goods_qna_seq+'" target="_blank">'+res.goods_qna_seq+'</a>');
                        $('[data-associate="counsel.goods_review_seq"]').html('<a href="/board/view?id=goods_review&seq='+res.goods_review_seq+'" target="_blank">'+res.goods_review_seq+'</a>');
                        $('[data-associate="counsel.parent_counsel_seq"]').html('<a href="javascript:counselView("'+res.parent_counsel_seq+'");>'+res.parent_counsel_seq+'</a>');

                        openDialog("관련 번호 조회", "counselView", {width:600,height:400});
                    }, function(){
                        alert("권한이 없습니다.");
                    });
                };

                $(form.elements['date.since']).closest('tr').find('[data-date-preset]').on('click', function(e){
                    var now = Date.now();
                    var dateOffset = $(e.target).attr('data-date-preset');
                    $(e.target).addClass('select_date').addClass('on');
                    if(dateOffset === 'all') {
                        form.elements['date.since'].value = form.elements['date.until'].value = '';
                        return;
                    }
                    form.elements['date.until'].value = Firstmall.Modules.DOMHelper.toDateString(new Date(now));
                    form.elements['date.since'].value = Firstmall.Modules.DOMHelper.toDateString(new Date(now + 1000*Firstmall.Modules.DOMHelper.RelativeDate(dateOffset)));
                });

                $(".orderview").click(function(){
                    var order_seq = $(this).attr("order_seq");
                    var href = "/admin/order/view?no="+order_seq;
                    var a = window.open(href, 'orderdetail'+order_seq, '');
                    if ( a ) {
                        a.focus();
                    }
                });

                $.each(args, function(name, value){
                    if(typeof form.elements[name] === 'object') {
                        form.elements[name].value = value;
                    }
                });

                $('[data-action="counsel.modify"]').on('click', function(e) {
                    modify($(e.target).closest('tr').find('[data-property="no"]').text());
                    e.preventDefault();
                });

				$('[data-action="counsel.remove"]').on('click', function(e) {
                    remove($(e.target).closest('tr').find('[data-property="no"]').text());
                    e.preventDefault();
				});
				
                $('[data-action="counsel.view"]').on('click', function(e) {
                    view($(e.target).closest('tr').find('[data-property="no"]').text());
				});

				$('[data-action="counsel.submit"]').on('click', function(e) {
					$("form#counselModifyForm").submit();
				});
				
                $('[data-action="counsel.modify.cancel"]').on('click', function(e) {
                    var regex = /(^.*?\?)(?:.*&|)counsel_seq=.*?(\&|$)/g;
                    if(location.toString().match(regex)) {
                        location.href = location.toString().replace(regex, '$1$2').replace(/\?$/,'');
                    }
                    else {
                        $(this).closest('.ui-dialog').find('.ui-dialog-content').dialog('close');
                    }
                });

                if(args.counsel_seq) {
                    modify(args.counsel_seq);
                }
            },
            'board': function() {
                var args = Firstmall.Modules.Router.QueryString(document.location.toString());
                var search_form = document.forms['board-search'];
                var list_form = document.forms['board-list'];

                /** table span 자동계산 */
                $('.contents_container table').each(Firstmall.Modules.DOMHelper.Table.autoAlignment);

                /** date-preset 처리 */
                $(search_form.elements['rdate_s']).closest('tr').find('[data-date-preset]').on('click', function(e){
                    var now = Date.now();
                    var dateOffset = $(e.target).attr('data-date-preset');
                    if(dateOffset === 'all') {
                        search_form.elements['rdate_s'].value = search_form.elements['rdate_f'].value = '';
                        return;
                    }
                    search_form.elements['rdate_f'].value = Firstmall.Modules.DOMHelper.toDateString(new Date(now));
                    search_form.elements['rdate_s'].value = Firstmall.Modules.DOMHelper.toDateString(new Date(now + 1000*Firstmall.Modules.DOMHelper.RelativeDate(dateOffset)));
                });

                $('a[href^="/admin/board/write"]').on('click', function(e) {
                    popup(e.target.href, 1200, 800,e.target.target);
                    e.preventDefault();
                });

                $('a[href^="/admin/board/view"]').on('click',function(e){
                    popup(e.target.href, 1200, 800,e.target.target);
                    e.preventDefault();
                });

                $('[data-action="board.goto"]').on('change', function(e) { location.href = '/admin/board/board?id=' + e.target.value; });
                $('#display_quantity').on('change', function(e) {
                    search_form.elements['perpage'].value = e.target.value;
                    search_form.submit();
                });

                /** data-action 처리 */
                $(list_form).find('[data-action]').each(function(_, elem){
                    var match = $(elem).attr('data-action').match(/^(.*?)(?:\[(.*)\])?$/), action, target;
					if(!match) return;
					action = match[1];
					target = match[2];
                    switch(action) {
                        case 'selectall':
                            $(elem).on('change', function(e) {
                                $(list_form).find('input[type="checkbox"][name^="'+target+'["]').prop('checked', $(e.target).prop('checked'));
                            });
                            break;
                        case 'board.article.copy':
                            $(elem).on('click', function(e) {
                                e.preventDefault();
                                e.stopPropagation();
                                var $elem = $(e.target);
                                var $seq = $elem.closest('tr').find('[name^="seq["]');
                                var $checked_elems = $(list_form.elements['seq[]']).filter(':checked');
                                $checked_elems.prop('checked', false);
                                $seq.prop('checked', true);
                                $(list_form).find('[type="submit"][name="mode"][value="board_multi_copy"]').first().trigger('click');
                                // $seq.prop('checked', false);
                                // $checked_elems.prop('checked', true);
                            });
                            break;
						default: //console.warn(`${action} is not defined`); 
							return;
                    }
                });

                $(list_form).find('[type="submit"][name="mode"][value]').each(function(_, elem) {
                    var modeProp = {
                        'board_multi_copy': '복사',
                        'board_multi_move': '이동',
                    };
                    var $elem = $(elem);
                    if(typeof modeProp[$elem.val()] === 'undefined') return;
                    var currentProp = modeProp[$elem.val()];
                    $elem.on('click', function(e) {
                        e.preventDefault();
                        var modalContent = $('<form>')
                            .append($('<table class="table_basic content">')
                                .append($('<tr>')
                                    .append($('<th>').text(currentProp+' 게시판'))
                                    .append($('<td>')
                                        .append($('#board-list').clone().attr('name', 'copyid').attr('required',true).removeAttr('id').show())
                                    )
                                )
                            )
                            .append($('<div class="footer">')
                                .append($('<button type="submit" class="resp_btn size_XL active spacer-2">')
                                    .text('확인')
                                )
                                .append($('<button type="button" class="resp_btn size_XL v3 spacer-2">')
                                    .text('취소')
                                    .on('click', function(e) {
                                        $(modalContent).dialog('close');
                                    })
                                )
                            )
                            .on('submit', function(e) {
                                e.preventDefault();
                                if(!e.target.elements['copyid'].value) {
                                    alert('복사할 게시판을 선택하세요.');
                                    return;
                                }
                                var inputs = $('<input type="hidden">')
                                    .attr('name', 'mode')
                                    .attr('value', $elem.val())
                                ;
                                $.each(e.target.elements, function(_, input){
                                    if(!$(input).attr('name')) return;
                                    $.merge(inputs, 
                                        $('<input type="hidden">')
                                            .attr('name', $(input).attr('name'))
                                            .attr('value', $(input).val())
                                    );
                                });
                                $(list_form)
                                    .append(inputs)
                                    .submit();
                                $(inputs).remove();
                            })
                        ;
                        openDialog('게시글 '+currentProp, modalContent, {
                            width: 400,
                            height: 200,
                        }, function() {
                            $(modalContent).dialog('destroy').remove();
                        });
                    });
				});
				
				$("button#board_multi_delete").on("click", function() {
					var $checked_elems = $(list_form.elements['seq[]']).filter(':checked');
					if($checked_elems.length < 1){
						openDialogAlert('선택된 게시글이 없습니다.','400','140');
						return false;
					}
					var msg = "삭제된 게시글은 복구할 수 없습니다.\n정말로 삭제하시겠습니까?  ";
					openDialogConfirmtitle('게시글 삭제',msg,'450','140', function(){
						var inputs = $('<input type="hidden">')
                                    .attr('name', 'mode')
                                    .attr('value', 'board_multi_delete')
                                ;
						$(list_form)
                                    .append(inputs)
                                    .submit();
                                $(inputs).remove();
					}, function(){});
					return false;
				});

                $(":input[name=boad_delete_btn]").on("click", function() {
                    var board_id = $(this).attr('board_id');
                    var delseq = $(this).attr('board_seq'); 
                    if( board_id == 'goods_review' ) {
                        $.ajax({
                            'url' : '../board_goods_process',
                            'data' : {'mode':'goods_review_less_view', 'delseq':delseq, 'board_id':board_id},
                            'type' : 'post',
                            'dataType': 'json',
                            'success' : function(res){
                                if(res.result == 'delete') { 
                                    var msg = "삭제된 게시글은 복구할 수 없습니다.\n정말로 삭제하시겠습니까?  ";
                                    openDialogConfirmtitle(res.name+' 삭제',msg,'450','140',function(){
                                    loadingStart("body",{segments: 12, width: 15.5, space: 6, length: 13, color: '#000000', speed: 1.5}); 
                                        $.ajax({
                                            'url' : '../board_process',
                                            'data' : {'mode':'board_delete', 'delseq':delseq, 'board_id':board_id},
                                            'type' : 'post',
                                            'success' : function(res){
                                            loadingStop("body",true);
                                            msg = '정상적으로 삭제되었습니다.';
                                            if(res == 'auth') msg = '권한이 없습니다.';
                                            openDialogAlert(msg,'400','140',function(){document.location.reload(); });
                                        }
                                    });},function(){});
                                }else if(res.result == "lees") { 
                                    openDialogConfirmtitle(res.name+' 삭제',res.msg,'480','340',function() {
                                    loadingStart("body",{segments: 12, width: 15.5, space: 6, length: 13, color: '#000000', speed: 1.5}); 
                                    var board_less_emoney = $("#board_less_emoney").val();
                                    var board_less_point = $("#board_less_point").val(); 
                                        $.ajax({
                                            'url' : '../board_process',
                                            'data' : {'mode':'board_delete', 'delseq':delseq, 'board_id':board_id, 'board_less_emoney':board_less_emoney, 'board_less_point':board_less_point},
                                            'type' : 'post',
                                            'success' : function(res){
                                                loadingStop("body",true);
                                                openDialogAlert('정상적으로 삭제되었습니다.','400','140',function(){document.location.reload(); }); 
                                            }
                                        });
                                    },function(){}); 
                                }else{
                                    openDialogAlert(res.msg,'400','140'); 
                                }
                            }
                        });
                    }else{
                        $.ajax({
                            'url' : '../board_goods_process',
                            'data' : {'mode':'board_less_view', 'delseq':delseq, 'board_id':board_id},
                            'type' : 'post',
                            'dataType': 'json',
                            'success' : function(res){
                                if(res.result == 'delete') { 
                                    var msg = "삭제된 게시글은 복구할 수 없습니다.\n정말로 삭제하시겠습니까?  ";
                                    openDialogConfirmtitle(res.name+' 삭제',msg,'450','140',function(){
                                    loadingStart("body",{segments: 12, width: 15.5, space: 6, length: 13, color: '#000000', speed: 1.5}); 
                                        $.ajax({
                                        'url' : '../board_process',
                                        'data' : {'mode':'board_delete', 'delseq':delseq, 'board_id':board_id},
                                        'type' : 'post',
                                        'success' : function(res){
                                            loadingStop("body",true);
                                            msg = '정상적으로 삭제되었습니다.';
                                            if(res == 'auth') msg = '권한이 없습니다.';
                                            openDialogAlert(msg,'400','140',function(){document.location.reload(); });
                                        }
                                    });},function(){});
                                }else if(res.result == "lees") { 
                                    openDialogConfirmtitle(res.name+' 삭제',res.msg,'480','285',function() {
                                    loadingStart("body",{segments: 12, width: 15.5, space: 6, length: 13, color: '#000000', speed: 1.5}); 
                                        var board_less_emoney = $("#board_less_emoney").val();
                                        $.ajax({
                                            'url' : '../board_process',
                                            'data' : {'mode':'board_delete', 'delseq':delseq, 'board_id':board_id, 'board_less_emoney':board_less_emoney},
                                            'type' : 'post',
                                            'success' : function(res){
                                                loadingStop("body",true);
                                                openDialogAlert('정상적으로 삭제되었습니다.','400','140',function(){document.location.reload(); }); 
                                            }
                                        });
                                    },function(){}); 
                                }else{
                                    openDialogAlert(res.msg,'400','140'); 
                                }
                            }
                        });
                    }
                });

                $(":input[name=boad_reply_btn],:input[name=board_reply_btn]").on("click", function(e) {
                    var seq = $(this).attr("board_seq"); 
                    if(boardreplyurl.match(/^\/admin/))
                        popup(boardreplyurl+seq, 1200, 800, '_blank');
                    else
                        boardaddFormDialog(boardreplyurl+seq, '90%', '840', '게시글 답변','false');
                });
            },
        },
    };

    loadingStart(spinner.appendTo(document.body));
    (Firstmall.Modules.Router([
        ['/admin/*', AdminControllers.__common,],
    ]))(location.toString());

    (Firstmall.Modules.Router([
        ['/admin/board', AdminControllers.board.dashboard,],
        ['/admin/board/index', AdminControllers.board.dashboard,],
        ['/admin/board/main', AdminControllers.board.list,],
        ['/admin/board/manager_write', AdminControllers.board.create,],
        ['/admin/board/counsel_catalog', AdminControllers.board.counsel_catalog,],
        ['/admin/board/board', AdminControllers.board.board,],
    ]))(location.toString().replace(/\/+$/, ''));
    loadingStop(spinner.remove());
}
