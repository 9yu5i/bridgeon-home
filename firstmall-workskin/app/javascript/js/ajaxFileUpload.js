/**
* Ajax 파일 업로드
* form 없이 input file 객체에서 바로 바인딩 해서 사용 할 수 있는 ajax 파일업로드
* @ 2018-11-20 pjw
*/

(function($){

	$.fn.extend({
		createAjaxFileUpload: function(options, _callback){
			
			var $that		= $(this);
			var $pform		= $that.closest('form');

			// 기본값 설정 file_path는 필수
			var defaults	= {
				file_path	: '/data/tmp',
				file_param  : 'filedata',
				action      : '/common/ajax_file_upload',
                method		: 'post',
                dataType    : 'json',				
				enctype		: 'multipart/form-data',
				eventType	: 'change',
				target		: 'saveFileFrame',
				allowTypes  : '',
				addData		: '',
				addObj		: null,
				btnSubmit	: null,
				overwrite	: 'rename',
            };

            var opt = $.extend({}, defaults, options);

			// submit 버튼이 설정 된 경우 이벤트 추가
			if( opt.btnSubmit != null ){
				$(opt.btnSubmit).unbind('click.ajaxFileUpload').bind('click.ajaxFileUpload', function(e){
					bindEvent($that, $.extend({}, opt, $(e.target).data('opt')), _callback);
				});
			}
			
			// 해당 file 객체 변경 시 업로드 실행
			// none 일 경우 이벤트 생성 안함
			if(opt.eventType != 'none'){
				$that.unbind(opt.eventType).bind(opt.eventType, function(e){
					bindEvent($that, $.extend({}, opt, $(e.target).data('opt')), _callback);
				});
			}

			var bindEvent = function(that, options, _callback){
				var $that	= that;
				var opt		= options;

				if($that.val() == '') return false;
						
				inputObj	= '<input type="hidden" name="filepath" value="' + opt.file_path + '"/>';
				
				// 파일이름 지정 시 객체 생성
				if(opt.filename != null && opt.filename != ''){
					inputObj += '<input type="hidden" name="filename" value="' + opt.filename + '"/>';
				}

				if(opt.overwrite)
					inputObj += '<input type="hidden" name="overwrite" value="' + opt.overwrite + '"/>';

				// 임시 파일 객체
				orgin_file_name = $that.attr('name');
				$that.attr('name', opt.file_param);
				$that.wrap('<form></form>');
				
				// 임시 form 객체 생성
				$form = $that.closest('form');
				$form.attr('name', 'saveFileFrm');
				$form.attr('method', opt.method);
				$form.attr('action', opt.action);
				$form.attr('enctype', opt.enctype);
				$form.append(inputObj);

				// 추가 input 데이터가 있는 경우
				add_inputs = opt.addData.split('&');
				for(var i=0; i<add_inputs.length; i++){
					input_data = add_inputs[i].split('=');
					
					addInputObj = $('<input type="hidden" name="' + input_data[0] + '" value="' + input_data[1] + '"/>');
					$form.append(addInputObj);
				}

				// 추가 객체가 있으면 추가
				if(opt.addObj != null){
					$form.append(opt.addObj);
				}

				// allowTypes 추가
				if(opt.allowTypes != ''){
					tmpAllowType = '<input type="hidden" name="allow_types" value="' + opt.allowTypes + '"/>';
					$form.append(tmpAllowType);
				}

				// 업로드 실행
				var ajaxOpt = {
					url			: opt.action,
					enctype		: opt.enctype,
					dataType	: opt.dataType,
					success		: function(res){
						$form.remove();
						_callback.call($that, res);
					},
					error		: function(x, h, r){
						$form.remove();
					}
				};

				$("#ajaxLoadingLayer").ajaxStart(function() {loadingStart(this);});
				$("#ajaxLoadingLayer").ajaxStop(function() {loadingStop(this);});
				$form.ajaxSubmit(ajaxOpt, $form.serialize());
				$form.find('input[name="filepath"]').remove();
				$that.unwrap();
				$that.attr('name', orgin_file_name);
			};
		}		
	});
	
	
})(jQuery);