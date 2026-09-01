	function bg_checked_skin()
	{
		//$("table#skin-list-tbl tbody tr").css("background-color","#ffffff");
		//$(".btnRealSkinApply, .btnWorkingSkinApply").css("color","#999999 !important").attr("disabled", true);
		//$("input[name='skin_chk']:checked").closest("tr").css("background-color","#ffffe8").find(".btnRealSkinApply, .btnWorkingSkinApply").css("color","#333333 !important").attr("disabled", false);
	}

	/* 실제스킨 적용 */
	function btnRealSkinApply()
	{
		//var obj = $(bobj);
		//if( obj.closest("tr").find("input[name='skin_chk']").attr("checked") ){
			apply_skin('realSkin');
		//}
	}

	/* 작업용스킨 적용 */
	function btnWorkingSkinApply(bobj)
	{
		//var obj = $(bobj);
		//if( obj.closest("tr").find("input[name='skin_chk']").attr("checked") ){
			apply_skin('workingSkin');
		//}
	}

	/* 스킨 적용 */
	function btnSkinApply(bobj)
	{
		//var obj = $(bobj);
		//if( obj.closest("tr").find("input[name='skin_chk']").attr("checked") ){
			apply_skin('skin');
		//}
	}

	/* 스킨목록 불러오기 */
	function load_skin_list(){
		var checkedSkin = $("input[name='skin_chk']:checked").val();
		$(".sst-skin-list-container").load("../design/get_skin_list_html?skinPrefix="+skinPrefix+"&checkedSkin="+(checkedSkin?checkedSkin:''));
	}

	/* 선택 스킨 적용 */
	function apply_skin(type){
		if(!$("input[name='skin_chk']:checked").length){
			if(type=='realSkin')	alert('실제 적용할 스킨을 선택해주세요');
			if(type=='workingSkin')	alert('작업용으로 적용할 스킨을 선택해주세요');
			if(type=='skin')	alert('적용할 스킨을 선택해주세요');
			return;
		}
	
		var skinName = $(".sst-apply-skin-name").html()
		var fileName = $(".sst-apply-skin-dir").html()
			
		var skin				= $("input[name='skin_chk']:checked").val();
		var panelId			= type + "Panel";
		var panelid2		= '';
		var applySkinBox	= $(".sst-apply-skin-box:eq(0)").clone();
		
		if(type=='skin'){
			panelId 	= "realSkinPanel";
			panelid2	= 'workingSkinPanel';
			var applySkinBox2 = $(".sst-apply-skin-box:eq(1)").clone();
			applySkinBoxAnimation(skin, panelid2, applySkinBox2);
		}		
		
		applySkinBoxAnimation(
			skin,
			panelId,
			applySkinBox,
			function(){
				if(type=='realSkin'){
					openDialogConfirm(arrSkinInfo[skin].name + ' 스킨을 실제적용 스킨으로 설정하시겠습니까?',400,180,function(){
						apply_skin_process(type,skin);
						$("#"+panelId + " .sst-body").empty().append(applySkinBox.css({'position':'relative','left':0,'top':0}));
						applySkinBox.find(".sst-apply-skin-popup a").attr("href","/?previewSkin="+skin);
					},function(){
						/*
						var obj = $(".sst-apply-skin-box:eq(0)").parent().next();
						if(panelId == 'workingSkinPanel') obj = $(".sst-apply-skin-box:eq(1)").parent().next();
						obj.find(".sst-apply-skin-name").html(arrSkinInfo[skin].name);
						obj.find(".sst-apply-skin-dir").html(arrSkinInfo[skin].skin);*/
						$(".sst-apply-skin-name").html(skinName)
						$(".sst-apply-skin-dir").html(fileName)
						applySkinBox.remove();
						
					});

					$("#btnRealSkinApply").removeAttr('disabled');
				}
				else if(type=='workingSkin'){
					openDialogConfirm(arrSkinInfo[skin].name + ' 스킨을 작업용 스킨으로 설정하시겠습니까?',400,180,function(){
						apply_skin_process(type,skin);
						$("#"+panelId + " .sst-body").empty().append(applySkinBox.css({'position':'relative','left':0,'top':0}));
						applySkinBox.find(".sst-apply-skin-popup a").attr("href","/?previewSkin="+skin);
					},function(){
						$(".sst-apply-skin-name").html(skinName)
						$(".sst-apply-skin-dir").html(fileName)
						applySkinBox.remove();
					});

					$("#btnWorkingSkinApply").removeAttr('disabled');
				}
				else if(type=='skin'){
					openDialogConfirm(arrSkinInfo[skin].name + ' 스킨을 실제적용 스킨 & 작업용 스킨으로 설정하시겠습니까?',400,180,function(){
						apply_skin_process(type,skin);
						$("#"+panelId + " .sst-body").empty().append(applySkinBox.css({'position':'relative','left':0,'top':0}));
						$("#"+panelid2 + " .sst-body").empty().append(applySkinBox2.css({'position':'relative','left':0,'top':0}));
						applySkinBox.find(".sst-apply-skin-popup a").attr("href","/?previewSkin="+skin);
						applySkinBox2.find(".sst-apply-skin-popup a").attr("href","/?previewSkin="+skin);
					},function(){
						applySkinBox.remove();
						applySkinBox2.remove();
					});

					$("#btnSkinApply").removeAttr('disabled');
				}
			}
		);
	}

	function applySkinBoxAnimation(skin,panelId,applySkinBox,callFunction){
		
		applySkinBox.find(".sst-apply-skin-screenshot img").attr('src','/data/skin/'+skin+'/configuration/'+arrSkinInfo[skin].screenshot).end();
		applySkinBox.find(".sst-apply-skin-screenshot img").css({'width':'119px','height':'150px','border':'1px solid #ccc;'});

		var lang = '한국어';
		var thisRegex2 = new RegExp('\_en');
		var thisRegex3 = new RegExp('\_cn');
		if( thisRegex2.test(arrSkinInfo[skin].skin) ) lang = '영어';
		else if( thisRegex3.test(arrSkinInfo[skin].skin) ) lang = '중국어';

		var obj = $(".sst-apply-skin-box:eq(0)").parent().next();
		if(panelId == 'workingSkinPanel') obj = $(".sst-apply-skin-box:eq(1)").parent().next();
		obj.find(".sst-apply-skin-name").html(arrSkinInfo[skin].name);
		obj.find(".sst-apply-skin-dir").html(arrSkinInfo[skin].skin);
		obj.find(".sst-apply-skin-version").html(" : "+arrSkinInfo[skin].patch_version);
		obj.find(".sst-apply-skin-lang").html(" : "+lang);
		applySkinBox.appendTo('body')
		.css({
			'position':'absolute',
			'width'	:0,
			'height'	:0,
			'z-index'	:1,
			'left'		:$("input[name='skin_chk']:checked").offset().left,
			'top'		:$("input[name='skin_chk']:checked").offset().top,
		})
		.animate({
				'width'	:'119px',
				'height'	:'150px',
				'left'		:$("#"+panelId + " .sst-apply-skin-screenshot").offset().left+1,
				'top'		:$("#"+panelId + " .sst-apply-skin-screenshot").offset().top+1
			}
			,callFunction
		);
	}

	/* 선택 스킨 적용  처리 */
	function apply_skin_process(type, skin){
		$.ajax({
			'url' : '../design_process/apply_skin',
			'data' : {'type':type, 'skin':skin, 'skinPrefix':skinPrefix},
			'type' : 'post',
			'success' : function(res){
                if(res!=''){
                    servicedemoalert('use_f');
                }else{
                    load_skin_list();
                }
			}
		});
	}

	/* 스킨백업*/
	function backup_skin(skin){
		openDialogConfirm(skin + ' 스킨 ZIP파일을 다운로드 하시겠습니까?',400,150,function(){
			$("iframe[name='actionFrame']").attr('src','../design_process/backup_skin?skin=' + skin);
		});
	}

	/* 스킨복사*/
	function copy_skin(skin){
		openDialogConfirm(skin + ' 스킨을 복사 하시겠습니까?',400,150,function(){
			loadingStart();
			$("iframe[name='actionFrame']").attr('src','../design_process/copy_skin?skin=' + skin);
		});
	}

	/* 스킨 삭제 */
	function delete_skin(skin){
		openDialogConfirm(skin + ' 스킨을 삭제 하시겠습니까?',400,150,function(){
			loadingStart();
			$("iframe[name='actionFrame']").attr('src','../design_process/delete_skin?skin=' + skin + '&skinPrefix='+skinPrefix);
		});
	}


	/* 스킨 업로드 Dialog */
	function upload_skin(){
		openDialog("스킨 업로드", "skinUploadDialogLayer", {"width":410});
	}

	/* 스킨업로드 파일전송 */
	function upload_skin_submit(frm){
		loadingStart();
		frm.submit();
		return false;
	}

	/* 스킨 이름변경 */
	function rename_skin(skinFolder,skinName, language, skinType, skinPrefix, patch_version, regdate){

		openDialog("스킨 정보", "skinRenameDialogLayer", {"width":700});

		var _language;
		
		switch(language)
		{
			case "EN":
			_language = "영어";
			break;

			case "CN":
			_language = "중국어";
			break;

			case "JP":
			_language = "일본어";
			break;

			default:
			_language = "한국어";
		
		}

		var _skin_type = "";
		if(skinType == 'responsive')
		{
			_skin_type = "데스크탑, 모바일" 							
		}else{
			skinPrefix=='mobile'? _skin_type = "모바일" : _skin_type = " 데스크탑";			
		}
								
		_skin_type += " / 다국어 버전용";

	
		
		$("#skinRenameDialogLayer input[name='skin']").val(skinFolder);
		$("#skinRenameDialogLayer input[name='skinName']").val(skinName);
		$("#skinRenameDialogLayer input[name='skinFolder']").val(skinFolder);
		$("#skinRenameDialogLayer .language").html(_language);
		$("#skinRenameDialogLayer .skin_type").html(_skin_type);
		$("#skinRenameDialogLayer .patch_version").html(patch_version);
		$("#skinRenameDialogLayer .regdate").html(regdate);
	}

	/* 스킨 이름변경 전송 */
	function rename_skin_submit(frm){
		loadingStart();
		frm.submit();
		return false;
	}