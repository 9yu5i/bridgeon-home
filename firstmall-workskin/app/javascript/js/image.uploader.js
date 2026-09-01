// html5uploader
var html5uploader = {
	isSwf 				: false,
	shopname			: 'multi',
	url					: '/admin/goods_process/upload_file_multi',
	uploadTotalByte : 0,
	uploadSucessByte: 0,
    dataType			: 'json',
    formData			: '',
    acceptFileTypes		: /^image\/(gif|jpe?g|png)$/i,
    acceptMessage		: '이미지 파일(gif, png, jpeg, jpg)만 선택해 주세요.',
    add					: function(e, data) {
        var uploadErrors = [];
        //var acceptFileTypes = /^image\/(gif|jpe?g|png)$/i;
        if(
			data.originalFiles[0]['type'].length
			&& !html5uploader.acceptFileTypes.test(data.originalFiles[0]['type'])
        	&& html5uploader.shopname != "editor"
		) {
            uploadErrors.push(html5uploader.acceptMessage);
        }
        else if(
			(data.originalFiles[0]['size'] 
			&& data.originalFiles[0]['size'] > 20000000) 
			? true : false 
		) {
            uploadErrors.push('20MB 이하의 파일만 선택 하여 주세요.');
        }

        if(uploadErrors.length > 0) {
            alert(uploadErrors.join("\n"));
        } else {
            data.submit();
        }
    },
	// 각 파일 업로드가 완료될때 마다 호출되는 callback
    done : function (e, datas) {
        $.each(datas.result, function (index, data) {
        	if( data.status != 1 ){
        		$('#progress').hide();
        	}

        	if( html5uploader.shopname == 'multi' ) {
				uploadResult.multiComplete(data);
			} else if( html5uploader.shopname == 'single' ) {
				uploadResult.singleComplete(data);
			} else if( html5uploader.shopname == 'mshop' ) {
				uploadResult.mshopComplete(data);
			} else if( html5uploader.shopname == 'editor' ) {
				uploadResult.editorComplete(data);
			} else if( html5uploader.shopname == 'mobileEditor' ) {
				uploadResult.mobileEditorComplete(data);
			}
        });
		// 퍼센트 계산을 위해, 업로드 완료시 업로드된 데이터를 더해줌
		html5uploader.uploadSucessByte += datas.loaded;	
		html5uploader.drawProgress();
		html5uploader.closeProgress();
    },
	progressPercent : function () {
		return parseInt(html5uploader.uploadSucessByte / html5uploader.uploadTotalByte * 100, 10);
	},
	closeProgress: function () {
		if (html5uploader.progressPercent() >= 100) {
			window.setTimeout(function () {
				$('#progress').hide();
				
				// 에디터 편집기에서 띄운 파일업로드 팝업창인 경우
				if (html5uploader.shopname === 'editor' && !korea_domain) {
					closeWindow();
				}
			}, 1000);
		}
	},
	drawProgress: function () {
		var style = {
			'width': html5uploader.progressPercent() + '%',
			'background-color': 'lightblue',
			'height': '5px' 
		};
		$('#progress .progress-bar').css(style);
	},
    fail : function (e, data) {
    	alert("이미지 가로 혹은 세로 사이즈를 5000 이하로 줄여 주신 후에 업로드 하여 주세요.");
    	$('#progress').hide();
    },
	// 각 파일 업로드가 서버에 전송 될때마다 호출되는 callback
    progressall : function (e, data) {
		$('#progress').show();

		// 업로드 전체 데이터 크기 등록
		if (html5uploader.uploadTotalByte === 0) {
			html5uploader.uploadTotalByte = data.total;
		}
    }
};


// uploader selector
var fileuploader = new function() {
	this.uploader = html5uploader;

	this.select = function() {
		var version = Browser.detectIE();
		
		if( version && version < 11 ) {
			this.uploader = swfuploader;
		}
		if( kordomainck ) {
			this.uploader = html5uploader;
		} 
		//this.uploader = swfuploader;
		//this.uploader = html5uploader;
		return this.uploader;
	};

};

// upload complete
var uploadResult = {
		multiComplete : function(data) {
			if( data.status ) {

				var newImg	= data.newFile + 'view' + data.ext;
				var imgTag	= newImg + '<img src="'+newImg+'" height="50" class="pd5" style="vertical-align: middle;" /> ';
				var viewer	= '<div><input type="hidden" name="uploadImg[]" value="'+newImg+'" />'+ imgTag+'</div>';
				$("#imgtb").show();
				$("#img_viewer .nothing").hide();
				$("#img_viewer").append(viewer);
			}else {
				alert(data.msg);
			}
		},
		singleComplete : function(data) {
			if( data.status ) {
				var division = 'view';
				if(data.division != undefined ){
					division = data.division;
					if(data.division == 'all') division = 'view';
				}

				var newImg	= data.newFile + division + data.ext;
				var imgTag	= '<img src="'+newImg+'" height="50" class="pd5" /> ';

				$("input[name='uploadImg']").val(newImg);
				$("#imgView").html(imgTag);
			}
			else {
				alert(data.msg);
			}

		},
		mshopComplete : function(data) {
			if(data.status){//업로드성공
				result_value	= data.newFile + data.ext;
				$("#result_filename").val(result_value);
				$("#result_fileext").val(data.ext);

				var viewer	= '<div>'+ result_value+'</div>';
				$("#imgtb").show();
				$("#img_viewer").append(viewer);

			}else{
				$("#uploader").uploadifyCancel();
				$("#uploadernQueue").empty();
				$("#uploader").uploadifyClearQueue();
				alert(data.msg);
			}
		},
		editorComplete : function(result) {

			if(result.status!=1){
				alert(result.msg,400,150);
				$("#uploader").find(".percentage").html("<font color='red'> - "+result.desc+"</font>");
				
				return false;
			}else{

				result.fileInfo.file_size = parseInt(result.fileInfo.file_size*1000);
				PopupUtil.getOpener().Editor.getSidebar().getAttacher().image.boxonly = false;
				PopupUtil.getOpener().Editor.getSidebar().getAttacher().file.boxonly = true;

				if(result.fileInfo.is_image == true ){
					_mockdata = {
						'imageurl': result.filePath,
						'filename': result.fileInfo.client_name,
						'filesize': result.fileInfo.file_size,
						'imagealign': 'C',
						'originalurl': result.filePath,
						'thumburl': result.filePath
					};
					PopupUtil.getOpener().Editor.focus();//focusOnBottom();
					PopupUtil.getOpener().Editor.getSidebar().getAttacher("image").execAttach(_mockdata);

					//<!--{ ? !service_limit && config_watermark.watermark_setting_status }-->
					if($("input[name='watermark_apply']").is(":checked")){
						$.ajax({
							'url' : '/common/editor_image_watermark',
							'type' : 'post',
							'async' : false,
							'data' : {'target_image':_mockdata.imageurl},
							'success' : function(res){
								if(res!='OK'){
									alert('워터마크 적용 실패');
								}
							}
						});
					}
				}
				else {
					_mockdata = {
							'filename': result.fileInfo.client_name,
							'filesize': result.fileInfo.file_size,
							'filemime':result.filetype,
							'attachurl': result.filePath
						};
						PopupUtil.getOpener().Editor.focus();//focusOnBottom();
						PopupUtil.getOpener().Editor.getSidebar().getAttacher("file").execAttach(_mockdata);
				}
				
			}
		},
		mobileEditorComplete : function(result) {
			if(result.status!=1){
				alert(result.msg,400,150);
				$("#uploader").find(".percentage").html("<font color='red'> - "+result.desc+"</font>");

				return false;
			}else{

				var _opener = PopupUtil.getOpener();
				if(!_opener) {
					alert('잘못된 경로로 접근하셨습니다.');
					return;
				}

				if(result.is_image == true ){
					var newImg		= result.uploadFile[0].split("^^")[0];
					var incFile		= result.incFile;
					var filepath	= '';
					if(result.board){
						filepath = '/data/board/' + result.board + '/';
					}
					
					var imgTag	= '<img src="'+filepath+newImg+'" height="50" class="pd5" style="vertical-align: middle;" /> ';
					var viewer	= '<div>' + imgTag + ' <font size="+1">' + newImg+'</font></div>';
					$("#imgtb").show();
					$("#img_viewer").append(viewer);
					
					realfilename.push(result.uploadFile[0]);
					incimage.push(incFile);
			}
		}
	}

};

/**
 * jquery.fileupload.js + progress bar
 */
var singleFileUpload = (function ($) {
	'use strict';

	// 공용 변수
	var _storeVariable = {
		uploadTotalByte: 0,
		uploadSucessByte: 0,
		reset : function () {
			_storeVariable.uploadTotalByte = 0;
			_storeVariable.uploadSucessByte = 0;
		},
	};

	
	// app/javascript/plugin/jquery_fileupload/jquery.fileupload.js 에 전달하는 옵션값 
	var _fileUploadOption = {
		url: '',
		dataType: 'json',
		async: true,
		/**
	 	 * 파일업로드 순서유지를 위해 단건씩 업로드한다.
	 	 * - ex) 상품상세 페이지에 이미지 업로드시 순서 유지되어야함
		 * - 파일선택(click or drag) 순서와 무관!
		 */
		sequentialUploads: true,
		add: function (e, data) {			

			// 유효성검사 (라이브러리에서 제공하는 기능도 있지만 커스텀된 에러 메세지를 출력하기 위해서 사용함)
			var valiateResult = _wrapping.validate(data);
			if (valiateResult.result === false) {
				alert(valiateResult.message);
				return false;
			}
			
			_progress.show();

			// single mode 파일 업로드 하는경우 progress 를 위해서 업로드 파일전체 크기를 구해야한다.
			_wrapping.setTotalSize(data);
			
			var isContinue = _callback.add(data);
			if (
				isContinue === true
				// 콜백 함수에 리턴 타입이 없는경우 (bool 아님) 업로드 진행한다
				|| typeof isContinue !== 'boolean'
				) {
				// 파일 전송
				data.submit();
			} else {
				_wrapping.reset();
			}
		},
		// 각 파일 업로드가 완료될때 마다 호출되는 callback
		done: function (e, data) {
			_storeVariable.uploadSucessByte += data.loaded;
			_callback.done(data);		
			_progress.draw(_wrapping.progressPercent());
			_wrapping.closeProcess();
		},
		fail: function (e, data) {
			console.log('File upload fail : ', data);
			_progress.hide();
			
			var failMessage = "파일 업로드에 실패 했습니다. \n";
			failMessage += "1. 이미지 가로 혹은 세로 사이즈를 5000 이하로 줄여 주신 후\n 업로드 하여 주세요. \n";
			failMessage += "2. 업로드 실패가 반복 된다면 퍼스트몰 고객센터로 문의해 주세요. \n";
			
			alert(failMessage);
		}
	};

	// 프로그래스 바
	var _progress = {
		layerId: 'fileupload-progress-layer',
		show: function () {
			_progress.createElement();
			$('#' + _progress.layerId).show();
		},
		hide: function () {
			$('#' + _progress.layerId).hide();
		},
		draw: function (percent) {
			$('#' + _progress.layerId).text(percent + '%');
		},
		createElement: function () {
			// 프로그래스바 생성 여부 체크
			if ($('#' + _progress.layerId).length > 0) {
				return false;
			}

			// 레이어 생성 (중앙 고정)
			var progressLayerElement = document.createElement('div');
			progressLayerElement.id = _progress.layerId;
			progressLayerElement.style.position = 'fixed';
			progressLayerElement.style.display = 'block';
			progressLayerElement.style.zIndex = '999999';
			progressLayerElement.style.top = '50%';
			progressLayerElement.style.left = '50%';
			progressLayerElement.style.transform = 'translate(-50%, -50%)';
			progressLayerElement.style.msTransform = 'translate(-50%, -50%)';
			progressLayerElement.style.display = 'none';
			
			// 프로그래스 진행률 text
			progressLayerElement.style.color = 'white';
			progressLayerElement.style.fontSize = '20px';
			progressLayerElement.style.fontWeight = 'bold';
			// 폰트 bold 처리
			progressLayerElement.style.textShadow = '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black';
			progressLayerElement.innerText = '0%';

			document.body.appendChild(progressLayerElement);
		},
	};
	
	var _wrapping = {
		// 업로드 완료후 값 초기화
		reset: function () {
			_progress.draw(0);
			_progress.hide();
			_storeVariable.reset();
		},
		validate: function (data) {
			var check = {
				result: true,
				message: '',
			};

			// 각 파일 용량제한 6 MB
			var filesizeLimit = 6 * 1024 * 1024;
			if (data.originalFiles[0]['size'] > filesizeLimit) {
				check.message = _wrapping.formatBytes(filesizeLimit) + ' 이하의 파일만 선택 하여 주세요.';
			}
			// 전체 파일 용량제한 20 MB
			var filesizeTotalLimit = 20 * 1024 * 1024;
			if (_wrapping.getTotalSize(data) > filesizeTotalLimit) {
				check.message = ' 총 업로드 파일크기가 ' + _wrapping.formatBytes(filesizeTotalLimit) + ' 이하만 가능 합니다.';
			}

			if (check.message.length > 0) {
				check.result = false;
			}

			return check;
		},
		getTotalSize: function (data) {
			var totalSize = 0;
			$.each(data.originalFiles, function (index, file) {
				totalSize += file.size;
			});

			return totalSize;
		},
		setTotalSize: function (data) {
			if (_storeVariable.uploadTotalByte === 0) {
				_storeVariable.uploadTotalByte = _wrapping.getTotalSize(data);
			}
		},
		progressPercent: function () {
			return parseInt(_storeVariable.uploadSucessByte / _storeVariable.uploadTotalByte * 100, 10);
		},
		closeProcess: function (data) {
			if (_wrapping.progressPercent() >= 100) {
				window.setTimeout(function () {
					_callback.uploadClose(data);
					_wrapping.reset();
				}, 500);
			}
		},
		formatBytes: function (bytes) {
			if (bytes === 0) {
				return '0 Bytes';
			}

			var k = 1024;
			var dm = 2;
			var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
			var i = Math.floor(Math.log(bytes) / Math.log(k));

			return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
		},
		isUpload: function (data) {
			var isFail = true;

			$.each(data.result, function (index, file) {
				if (file.status === 0) {
					isFail = false;
					return false;
				}
			});

			return isFail;
		},
	};

	// 콜백 이벤트
	var _callback = {
		add: function () {return true;},
		done: function () {},
		uploadClose: function () {},

		// 각 파일 업로드 "시작시" 실행 되는 콜백함수
		singleAdd: function (callbackFunction) {
			if (typeof callbackFunction === 'function') {
				_callback.add = callbackFunction;
			}
		},
		// 각 파일 업로드 "종료후" 실행 되는 콜백함수
		singleDone: function (callbackFunction) {
			if (typeof callbackFunction === 'function') {
				_callback.done = callbackFunction;
			}
		},
		// 파일 업로드 "모두 종료후" 실행 되는 콜백함수
		multiDone: function (callbackFunction) {
			if (typeof callbackFunction === 'function') {
				_callback.uploadClose = callbackFunction;
			}
		},
	};

	return {
		// 이벤트 등록 실행
		eventRegist: function (option) {
			if (typeof option === 'undefined') {
				alert('파일업로드 옵션 정보가 필요 합니다.');
				return false;
			}

			if (typeof option.url === 'undefined') {
				alert('파일 업로드할 url 이 필요합니다.');
				return false;
			}

			if (typeof option.fileIdSelector === 'undefined') {
				alert('파일 업로드 이벤트에 등록할 file selector id 가 필요합니다.');
				return false;
			}

			_fileUploadOption.url = option.url;
			$(option.fileIdSelector).fileupload(_fileUploadOption);
		},
		event: _callback,
	};

})(jQuery);