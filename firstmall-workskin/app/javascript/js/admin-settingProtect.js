function add_banip(ip,loc){
    if(ip.length){
        var html = '';
        html += '<div class="ip_item clearbox">';
        html += '<input type="hidden" name="protectIp[]" value="'+ip+'"  >';
        html += '<span class="ip_item_ip">'+ip+'</span>';
        html += '<button type="button" class="ip_item_del hand btn_minus" onclick="del_banip(this)"></button>';
        html += '</div>';

        if($("input[name='protectIp[]'][value='"+ip+"']").length){
            openDialogAlert("이미 추가한 IP입니다.",400,140);
        }else{
            if(loc=='append')$("#ip_list").append(html);
            if(loc=='prepend')$("#ip_list").prepend(html);
        }
    }
}

/* 아이피 삭제 */
function del_banip(btn){
    $(btn).closest(".ip_item").remove();
}