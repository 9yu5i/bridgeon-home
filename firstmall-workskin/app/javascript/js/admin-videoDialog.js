/**
 * 동영상 URL 다이얼로그를 open한다.
 * @returns
 */
function videoDialog(){
    var htmltype    = $(this).attr("htmltype");
    var htmlurl     = $(this).attr("htmlurl");
    var htmlkey     = $(this).attr("htmlkey");
    var htmlwidth   = '400';
    var htmlheight  = '300';
    var htmltag     = '';

    switch (htmltype) {
        case 'iframe':
          htmltag = '<iframe src=\"' + htmlurl + '\" width=\"'+ htmlwidth + '\" height=\"' + htmlheight +'\" frameborder="0"></iframe>';
          break;
        case    'page' :
          htmltag = htmlurl+"&width="+htmlwidth+"&height="+htmlheight;
          break;
        default :
          htmltag = htmlurl;
    }
    $("#realvideourl").val(htmltag);
    openDialog("동영상 URL보기", "realvideourl_dialog", {"width":"450","height":"200"});
}