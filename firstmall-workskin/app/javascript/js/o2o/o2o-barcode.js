$(document).ready(function() { 
    $(".couponstyle ").css("position","relative");

    if($("#o2oBarcodeLayer").length == 0){
        var o2oBarcodeLayer = $("<div id='o2oBarcodeLayer'></div<");
        $("body").append(o2oBarcodeLayer);
    }
    
    $(".pop_o2o_barcode").bind("click touch", function(){
        var layerWidth	= 300;
        var layerHeight	= 300;
        loadingStart("body",{segments: 12, width: 15.5, space: 6, length: 13, color: '#000000', speed: 1.5});
        $.ajax({
            type: "get",
            data : $(this).data(),
            url: "/o2o/o2o_barcode",
            success: function(result){
                // 반응형 스킨 여부에 따라서 실행 스크립트 변경
                if(typeof(gl_operation_type)==='undefined' || gl_operation_type != 'light'){
                    $("#o2oBarcodeLayer").html(result);
                    $(".barcode_close").unbind("click touch");
                    $(".barcode_close").bind("click touch", function(){
                            closeDialog("o2oBarcodeLayer");
                    });
                    openDialog("바코드", "o2oBarcodeLayer", {"width":""+layerWidth,"height":""+layerHeight,"show" : "fade","hide" : "fade"});
                }else{
                    // 반응형 팝업으로 변경
                    if(!$("#o2oBarcodeLayer").hasClass("resp_layer_pop")){
                            $("#o2oBarcodeLayer").addClass("resp_layer_pop");
                            $("#o2oBarcodeLayer").addClass("hide");
                    }
                    // 크기 조정
                    // $("#o2oBarcodeLayer").width(layerWidth+'px');
                    // $("#o2oBarcodeLayer").height((layerHeight-80)+'px');
                    var resp_layer_wrap = ''+
                        '<h4 class="title">바코드</h4>'+
                        '<div class="y_scroll_auto2">'+
                        '	<div class="layer_pop_contents v5">'+
                        '	</div>'+
                        '</div>'+
                        '<div class="layer_bottom_btn_area2">'+
                        '   <button type="button" class="btn_resp size_c color5 Wmax" onclick="hideCenterLayer()">닫기</button>'+
                        '</div>'+
                        '<a href="javascript:void(0)" class="btn_pop_close" onclick="hideCenterLayer()"></a>';

                    $("#o2oBarcodeLayer").html(resp_layer_wrap);
                    $("#o2oBarcodeLayer .layer_pop_contents").html(result);
                    // 불필요 버튼 삭제
                    $("#o2oBarcodeLayer .layer_pop_contents .barcode_close").remove();
                    showCenterLayer('#o2oBarcodeLayer');
                }

                loadingStop("body",true);
            }
        });
    });
});