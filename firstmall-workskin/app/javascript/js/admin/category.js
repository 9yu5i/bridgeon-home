$(function () {

    /*
    $("#clipboard").live("click",function(){
        var categoryCode = $("input[name='categoryCode']").val();
        if(categoryCode){
            var str = categoryUrl+categoryCode;
            copyContent(str);
        }
    });
    $("#setGroup").live("click",function(){
        openDialog("접속제한 <span class='desc'>"+categoryDefault.pageTitle+"를 접속할 회원그룹을 설정합니다.</span>", "setGroupsPopup", {"width":"500","height":150});
    });

    
    $("input[name=memberGroup]").live("click",function(){
        groupsMsg();
    });
    */
   
    $("#viewCategory").on("click",function(){
        var categoryCode = $("input[name='categoryCode']").val();
        var win = window.open( categoryUrl + categoryCode , "","" );
    });

    $("#tree li a").live("click",function(){		
        var data_code = 'category';
        if(categoryDefault.pageId == 'location'){
            data_code = 'location';
        }
		var categoryCode = $(this).find('ins').attr(data_code);
		//if(typeof categoryCode == "undefined") categoryCode = categoryDefault.categoryCode;
        if(typeof categoryCode != "undefined"){
            viewCategoryInfo({'mode':'info','categoryCode':categoryCode});
        }
    });
    
    $("input[name='node_type']").live("change",function(){
        disableNodeTypeDecoration();
    });

    $("#remove_button").bind("click",function(){
		
        var data_code = 'category';
        if(categoryDefault.pageId == 'location'){
            data_code = 'location';
        }
        var categoryCode = $("input[name='categoryCode']").val();
        var obj = $("#tree li ins["+data_code+"='"+categoryCode+"']").parent().clone();
        obj.find("ins").remove();
        var category_name = obj.find("a").html();
        // debug($.jstree._focused());
        if (category_name) {
            if( confirm(category_name+'을 삭제하시겠습니까?') ){
                $("input#remove").click();
            }
        } else {
            alert("삭제할 "+categoryDefault.pageTitle+"를 선택해 주세요.");
            return false;
        }
    });

    // 정렬 추가
    $(".btn_sort").click(function(){
        if(confirm("정렬하시겠습니까?")) {
            $type = $(this).attr("data-type");
            $.get("/admin/brand_process/batch_sort/"+$type , function(response){
                if(response.result) {
                    $("#tree").jstree("refresh")
                }
            }, "json");
        }
    });

});

/*
function view(result){
    var len = result.length - 1;
    var arr = new Array();
    var isGroups = false;
    for(var i=0;i<=len;i++){
        arr[i] = result[i].title;
        if(i == len){			
            
            $("input[name='hide'][value='"+result[i].hide+"']").attr("checked",true);
            $("input[name='node_type'][value='"+result[i].node_type+"']").attr("checked",true);
            $("input[name='node_text_normal']").val(result[i].node_text_normal).change();
            $("input[name='node_text_over']").val(result[i].node_text_over).change();
            
            if(result[i].node_image_normal){
                $("#node_image_normal_preview").attr('src',result[i].node_image_normal).show();
                $("input[name='node_image_normal']").val(result[i].node_image_normal);
            }else{
                $("#node_image_normal_preview").hide();
                $("input[name='node_image_normal']").val('');
            }
            
            if(result[i].node_image_over){
                $("#node_image_over_preview").attr('src',result[i].node_image_over).show();
                $("input[name='node_image_over']").val(result[i].node_image_over);
            }else{
                $("#node_image_over_preview").hide();
                $("input[name='node_image_over']").val('');
            }
            
            $(".groupsMsg").hide();
                        
            if(result[i].groups){
                for(var j=0;j<result[i].groups.length;j++){				
                    $("input[type='checkbox'][name='memberGroup'][value='"+ result[i].groups[j].group_seq +"']").attr('checked',true);
                }
                isGroups = true;
            }
                        
            $("#goodsCnt").html(comma(result[i].goodsCnt));			
            $("input[name='categoryCode']").val(result[i].category_code);
            var categoryCode = $("input[name='categoryCode']").val();
            $("#urlCategory").html(categoryUrl+categoryCode);	
        }
    }
    if(!isGroups)$("input[type='checkbox'][name='memberGroup']").attr("checked",false);	
    $("#categoryNavi").html(arr.join(" > "));	
    viewCategoryInfo({'mode':'info'});
    groupsMsg();

    $(".customFontDecoration").customFontDecoration();
    
    disableNodeTypeDecoration();
}
*/

function groupsMsg(){
    var str='';
    var tag='';
    $("#groupsMsg").html("이 "+categoryDefault.pageTitle+" 접속권한은 제한 없습니다.");
    $("input[type='checkbox'][name='memberGroup']:checked").each(function(){
        var clone = $(this).parent().clone();
        clone.find("input").remove();		
        str += clone.html() + ',';
        tag += "<input type='hidden' name='memberGroups[]' value='"+$(this).val()+"'>";
    });
    if(str){
        var msg = "이 "+categoryDefault.pageTitle+" 접속권한은 " + str.substr(0,str.length-1) + " 회원에게 있습니다." + tag;		
        $("#groupsMsg").html(msg);
        
    }
    
}

function viewCategoryInfo(opts){

    if(typeof opts != 'undefined'){
        $.each(opts, function(key,val){
            if(typeof $("input[name='"+key+"']") != 'undefined') $("input[name='"+key+"']").val(val);
        });
    }
    
    opts = categoryDefault;
    var categoryCode    = $("input[name='categoryCode']").val();
	var mode            = $("input[name='mode']").val();
	
	var data_code = 'category';
	if(categoryDefault.pageId == 'location'){
		data_code = 'location';
	}	
    
    if($.jstree._focused() && categoryCode){
        $.jstree._focused().deselect_all();
        $.jstree._focused().select_node($("#tree li ins["+data_code+"='"+categoryCode+"']").closest("li"));
    }else if(categoryCode){      
        $("#tree li ins["+data_code+"='"+categoryCode+"']").closest("li").trigger("click")  ;
    }
    
    $("#categorySettingContainer").empty();

    if(categoryCode){
        if(mode=='info'){
            $("#categorySettingContainer").append('<iframe id="ifrmCategorySetting" name="ifrmCategorySetting" style="width:100%; height:730px;" frameborder="0"></iframe>');
            $("#ifrmCategorySetting").attr('src',opts.getSettingInfo+'?categoryCode='+categoryCode);
        }
        if(mode=='design'){
            $("#categorySettingContainer").append('<iframe id="ifrmCategorySetting" name="ifrmCategorySetting" style="width:100%; height:605px;" frameborder="0"></iframe>');
            $("#ifrmCategorySetting").attr('src',opts.getSettingDesign+'?categoryCode='+categoryCode);
        }
        
        $('.page-buttons-right').show();
        $("#categoryInfoFirst").hide();
        
    }else{
        $('.page-buttons-right').hide();
        $("#categoryInfoFirst").show();
    }	
}

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

function categorySettingFormSubmit(){
    
    if($("#ifrmCategorySetting").length){
        var frm = document.getElementById('ifrmCategorySetting').contentWindow.document.categorySettingForm;
        document.getElementById('ifrmCategorySetting').contentWindow.submitEditorForm(frm);		
    }else{
        openDialogAlert(""+categoryDefault.pageTitle+"를 선택해주세요..",400,140);
    }
    
}