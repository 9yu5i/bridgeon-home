$(function(){

    // 주소 복사 크로스브라우징을 위해 추가 leewh 2014-10-17
    initClipBoard();

    $(document).resize(function(){
        $('#ifrmCategorySetting',parent.document).height($('form').height()+50);
    }).resize();

    Editor.onPanelLoadComplete(function(){
        $(document).resize();
    });

    /* 업로드버튼 세팅 */
    /* 파일업로드버튼 ajax upload 적용 */
    var opt			= {};
    var callback	= function(res){
        var that		= this;
        var result		= eval(res);

        if(result.status){
            $(that).closest('.webftpFormItem').find('.webftpFormItemPreview').attr('src', result.filePath + result.fileInfo.file_name);
            $(that).closest('.webftpFormItem').find('.webftpFormItemPreview').css('display', 'block');
            $(that).closest('.webftpFormItem').find('.webftpFormItemInput').val( result.filePath +result.fileInfo.file_name);
        }else{
            alert(result.msg);
        }
    };

    // ajax 이미지 업로드 이벤트 바인딩
    if(categoryType == 'brand'){
        $('#brandIconUploadButton').createAjaxFileUpload(opt, callback);
        $('#brandLeftUploadButton').createAjaxFileUpload(opt, callback);
    }
    $('#nodeImageNormalUploadButton').createAjaxFileUpload(opt, callback);
    $('#nodeImageOverUploadButton').createAjaxFileUpload(opt, callback);
    $('#nodeCatalogImageNormalUploadButton').createAjaxFileUpload(opt, callback);
    $('#nodeCatalogImageOverUploadButton').createAjaxFileUpload(opt, callback);
    $('#nodeGnbImageNormalUploadButton').createAjaxFileUpload(opt, callback);
    $('#nodeGnbImageOverUploadButton').createAjaxFileUpload(opt, callback);

    $("input[name='node_type']").live("change",function(){
        disableNodeTypeDecoration();
    });
    $("input[name='node_catalog_type']").live("change",function(){
        disableNodeCatalogTypeDecoration();
    });
    $("input[name='node_gnb_type']").live("change",function(){
        disableNodeGnbTypeDecoration();
    });

    var params = "category="+categoryCode;
    if(categoryType == 'location') params = "location="+categoryCode;

    $.ajax({
        global:false,
        type: "POST",
        url: "view",
        data: params,
        dataType: 'json',
        success: function(result){
            $("input[name='categoryCode']").val(categoryCode);
            if(result != null) view(result); 
        }
    });
    
    $("#viewCategory").on("click",function(){
        var categoryCode = $("input[name='categoryCode']").val();
        if(typeof categoryCode == 'undefined'){
            alert('코드가 없습니다.');
            return false;
        }
        var win = window.open( categoryUrl + categoryCode , "","" );
    });	

    $('.btn_page_move').on('click',function(){
		var data_type = $(this).attr('data-type');
		var href = '../page_manager/page_layout?cmd='+data_type;

		if(data_type == 'brand' ) {
			href += '&tab=image';
		}
        window.open().document.location.href=href;
    });
    
    /*
    
		$("#setGroup").live("click",function(){
			openDialog("접속제한 <span class='desc'>브랜드를 접속할 회원그룹을 설정합니다.</span>", "setGroupsPopup", {"width":"500","height":300,"position":[100,100]});
		});
		
		$("#saveGroupBtn").click(function(){
			closeDialog("setGroupsPopup");
		});

		$("input[name=memberGroup]").live("click",function(){
			groupsMsg();
		});
		
		$("input[name=userType]").live("click",function(){
			groupsMsg();
		});
    
    */
});


function disableNodeTypeDecoration(){
    switch($("input[name='node_type']:checked").val()){
        case "text":
            $(".node_type_image .font_decoration *").attr("disabled",true);
            $(".node_type_text .font_decoration *").removeAttr("disabled");
            $(".node_type_image object, .node_type_image .btn").hide();
        break;
        case "image":
            $(".node_type_text .font_decoration *").attr("disabled",true);
            $(".node_type_image .font_decoration *").removeAttr("disabled");
            $(".node_type_image object, .node_type_image .btn").show();
        break;
        default:
            $(".node_type_image .font_decoration *").attr("disabled",true);
            $(".node_type_text .font_decoration *").attr("disabled",true);
            $(".node_type_image object, .node_type_image .btn").hide();
        break;
    }
}

function disableNodeCatalogTypeDecoration(){
    switch($("input[name='node_catalog_type']:checked").val()){
        case "text":
            $(".node_catalog_type_image .font_decoration *").attr("disabled",true);
            $(".node_catalog_type_text .font_decoration *").removeAttr("disabled");
            $(".node_catalog_type_image object, .node_catalog_type_image .btn").hide();
        break;
        case "image":
            $(".node_catalog_type_text .font_decoration *").attr("disabled",true);
            $(".node_catalog_type_image .font_decoration *").removeAttr("disabled");
            $(".node_catalog_type_image object, .node_catalog_type_image .btn").show();
        break;
        default:
            $(".node_catalog_type_image .font_decoration *").attr("disabled",true);
            $(".node_catalog_type_text .font_decoration *").attr("disabled",true);
            $(".node_catalog_type_image object, .node_catalog_type_image .btn").hide();
        break;
    }
}

function disableNodeGnbTypeDecoration(){
    switch($("input[name='node_gnb_type']:checked").val()){
        case "text":
            $(".node_gnb_type_image .font_decoration *").attr("disabled",true);
            $(".node_gnb_type_text .font_decoration *").removeAttr("disabled");
            $(".node_gnb_type_image object, .node_gnb_type_image .btn").hide();
        break;
        case "image":
            $(".node_gnb_type_text .font_decoration *").attr("disabled",true);
            $(".node_gnb_type_image .font_decoration *").removeAttr("disabled");
            $(".node_gnb_type_image object, .node_gnb_type_image .btn").show();
        break;
        default:
            $(".node_gnb_type_image .font_decoration *").attr("disabled",true);
            $(".node_gnb_type_text .font_decoration *").attr("disabled",true);
            $(".node_gnb_type_image object, .node_gnb_type_image .btn").hide();
        break;
    }
}

function changeNodeImage(){
    var node_image_normal = $("input[name='node_image_normal']").val();
    var node_image_over = $("input[name='node_image_over']").val();

    $("input[name='node_image_normal']").val(node_image_over);
    $("input[name='node_image_over']").val(node_image_normal);

    if(node_image_normal.substring(0,1)!='/') node_image_normal = '/' + node_image_normal;
    if(node_image_over.substring(0,1)!='/') node_image_over = '/' + node_image_over;

    $("#node_image_normal_preview").show().attr('src',node_image_over);
    $("#node_image_over_preview").show().attr('src',node_image_normal);
}

function changeNodeCatalogImage(){
    var node_image_normal = $("input[name='node_catalog_image_normal']").val();
    var node_image_over = $("input[name='node_catalog_image_over']").val();

    $("input[name='node_catalog_image_normal']").val(node_image_over);
    $("input[name='node_catalog_image_over']").val(node_image_normal);

    if(node_image_normal.substring(0,1)!='/') node_image_normal = '/' + node_image_normal;
    if(node_image_over.substring(0,1)!='/') node_image_over = '/' + node_image_over;

    $("#node_catalog_image_normal_preview").show().attr('src',node_image_over);
    $("#node_catalog_image_over_preview").show().attr('src',node_image_normal);
}

function changeNodeGnbImage(){
    var node_image_normal = $("input[name='node_gnb_image_normal']").val();
    var node_image_over = $("input[name='node_gnb_image_over']").val();

    $("input[name='node_gnb_image_normal']").val(node_image_over);
    $("input[name='node_gnb_image_over']").val(node_image_normal);

    if(node_image_normal.substring(0,1)!='/') node_image_normal = '/' + node_image_normal;
    if(node_image_over.substring(0,1)!='/') node_image_over = '/' + node_image_over;

    $("#node_gnb_image_normal_preview").show().attr('src',node_image_over);
    $("#node_gnb_image_over_preview").show().attr('src',node_image_normal);
}

function initClipBoard() {
    $("#clipboard").live("click",function(){
        var categoryCode = $("input[name='categoryCode']").val();
        if(categoryCode){
            var str = categoryUrl+categoryCode;
            clipboard_copy(str);
            alert('클립보드에 복사되었습니다.');
        }
    });
}

function popupSingleNavigation(){
    openDialog('소스', 'layerSingleNavigation', {"width":"500","height":"200"});
}

function copy_navigation(){
    var categoryCode = $("input[name='categoryCode']").val();
    if(categoryType == 'category'){
        clipboard_copy('{\=showCategoryLightNavigation("category_gnb_single", "'+categoryCode+'")}');
    }else if(categoryType == 'brand'){
		clipboard_copy('{\=showBrandLightNavigation("brand_gnb_single", "'+categoryCode+'")}');
    }else if(categoryType == 'location'){
        clipboard_copy('{\=showLocationLightNavigation("location_gnb_single", "{= categoryCode}")}');
    }else{
        alert('올바른 접근이 아닙니다.');
        return;
    }

    alert("클립보드에 복사되었습니다.");
}
