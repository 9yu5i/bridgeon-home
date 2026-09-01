	$(function(){
		load_skin_list();
		chk_skin_type();
		/* 상단 대쉬보드 스크롤처리 */
		var scrollSkinObj = $("#skin-setting");
		if(scrollSkinObj[0]){
			var defaultScrollSkinTop = parseInt(scrollSkinObj.offset().top - 50);
			$(window).bind('scroll resize',function(){
				var scrollTop = parseInt($(document).scrollTop());
				if(scrollTop > defaultScrollSkinTop)
				{
					//scrollSkinObj.addClass('skin-flying-mode');
				}
				else if(scrollTop > 240 || scrollTop < 150)
				{
					//scrollSkinObj.removeClass('skin-flying-mode');
				}
				scrollSkinObj.trigger('classChange');
			});
		}
		$(".skinListTab li").removeClass("active");
		$(".skinListTab li").each(function(){
			if( $(this).attr('skinPrefix') == skinPrefix ){
				$(this).addClass("active");
			}
		});

		// 스킨타입 변경 시 변경 버튼 상태 
		$('input[name=skin_type]').change(function(){			
			chk_skin_type();
		});

		// 스킨 타입 라디오박스로 변경 :: 2019-01-14 sjg
		$('input[name=skin_type]').change(function() {
			$(this).closest('.box-skin-type').find('label').removeClass('on');
			$(this).parent('label').addClass('on');
		});

		//스킨 압축파일 선택
		$("#skinZipfileBtn").change(function(e){	
			$("#fileName").html($(this)[0].files[0].name); 
		})
	});
	function set_default_data(skin){
		$.post('/admin/design_process/set_default_value',{'skin':skin},function(data){
			if	(data == 'pass') {
				openDialogAlert('기본 세팅값이 저장되었습니다.',400,140,function(){document.location.reload();});
			}else{
				openDialogAlert('기본 세팅값 저장을 실패하였습니다.',400,140,function(){document.location.reload();document.location.href='about:blank'});
			}
		});
	}

	// 스킨 타입 변경 체크
	function chk_skin_type(){
		var skin_type_current	= glSkinType;
		var skin_type			= $('input[name=skin_type]:checked').val();

		if(skin_type_current == skin_type){
			$('.btnSkinTypeChk').closest('.btn').removeClass('default').addClass('gray');
		}else{
			$('.btnSkinTypeChk').closest('.btn').removeClass('gray').addClass('default');
			set_skin_type(); // 스킨 변경 함수 호출
		}
	}

	// 스킨 타입 변경 시 처리 :: 2019-01-15 lwh
	function set_skin_type(){
		var skin_type_current	= glSkinType;
		var skin_type			= $('input[name=skin_type]:checked').val();
		var desc_arr			= {
			'responsive'	: '<td class="its-td" rowspan="2">1개의 반응형 스킨</td>',
			'responsive2'	: '<td class="its-td">1개의 반응형 스킨</td>',
			'fixed'			: '<td class="its-td">1개의 전용 스킨</td>'
		};

		// 현재와 같은 경우 동작 안함
		if(skin_type_current == skin_type) return false;

		// 해당 스킨타입의 보유스킨개수 가져옴
		$.get('/admin/design/get_skintype_info',{'mode':'cnt', 'skin_type':skin_type},function(data){
			var result		= false;			// 스킨 보유 여부
			var msg			= '';				// 미보유시 안내문구
			var skin_data	= JSON.parse(data);	// 보유스킨정보		
			
			/*
			$('.topSkinDesc').empty();
			$('.botSkinDesc').empty();
			$('.topSkinDesc').html('<th class="its-th-align center">데스크탑</th>');
			$('.botSkinDesc').html('<th class="its-th-align center">모바일</th>');

			// 변경 조건
			var currDesc = eval('desc_arr.'+skin_type_current);
			var nextDesc = eval('desc_arr.'+skin_type);

			if(skin_type_current == 'fixed' && skin_type == 'responsive'){
				$('.topSkinDesc').append(currDesc + nextDesc);
				$('.botSkinDesc').append(currDesc);
			}else if(skin_type_current == 'responsive' || skin_type == 'responsive'){
				$('.topSkinDesc').append(currDesc + nextDesc);
				$('.botSkinDesc').append(nextDesc);
			}else{
				$('.topSkinDesc').append(currDesc + nextDesc);
				$('.botSkinDesc').append(currDesc + nextDesc);
			}*/

			// 재설정 안내
			var height = 560;	

			// 변경할 스킨타입 input 값 변경
			$('#next_skin_type').val(skin_type);

			$(".skinTypeEvent .title").each(function(){
				if($(this).closest("li").attr("skinType")==skin_type) 
				{	
					var type = skin_type=="responsive" ? "반응형 스킨" : "전용 스킨";
					$(this).closest("li").addClass("on");
					$(".skinType").html(type);
				}
			});

			if((skin_type == 'responsive' || skin_type == 'responsive2') && parseInt(skin_data.responsive.cnt) == 0){
				
			}else if(skin_type == 'fixed' && (parseInt(skin_data.pc.cnt) == 0 || parseInt(skin_data.mobile.cnt) == 0)){
				
			}else{
				result = true;
			}

			if(result)
			{
				openDialog('스킨 운영 방식 변경','skinTypeChangeDialogLayer', {"width":800,"height":660});
			}else{
				openDialog('스킨 운영 방식 변경','noskinDialogLayer', {"width":500,"height":260});
			}			
			
			
			/*
			$('#skinTypeChangeDialogLayer').dialog({"close" : function(){
				$('input[value={=skinType}]').attr('checked', 'checked').prop('checked', true); 
				$('input[name=skin_type]').parent('label').removeClass('on');
				$('input[value={=skinType}]').parent('label').addClass('on');				
			}});
			
			
			$(".skinTypeEvent .title").on("click", function()
			{	
				var skin_type = $(this).closest("li").attr("skinType");
				var type = skin_type=="responsive" ? "반응형 스킨" : "전용 스킨";
				$(".skinTypeEvent > li").removeClass("on");
				$(this).closest("li").addClass("on");				
				$("input[name='skin_type'][value='"+skin_type+"']").attr("checked", true);
				$('#next_skin_type').val(skin_type);
				$(".skinType").html(type);
			});
			*/

			$(".cancelBtn").on("click", function()
			{				
				$("input[name='skin_type'][value='"+skin_type_current+"']").attr("checked", true);
				$("input[name='skin_type'][value='"+skin_type_current+"']").trigger('change');
			});	
		});
	}