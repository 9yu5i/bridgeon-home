$(function(){

    if(scObj.scm_use == 'Y' &&  scObj.provider_seq == 1){
        $("input[name='suboption_package_count']").on("click",function(){$(this).prop("checked",true);});
    }

    if(reload == 'y' ){
        var link = new Array();
        var idx = 0;
        $.each(scObj, function(key,val){
            if(val != null) {
                link[idx] = key+'='+val;
                idx++;
            }
        });
        location.replace('?'+link.join("&"));
    }

    /* 옵션 등록/수정 window 리사이징 */
    var _setWinReSize = function(){
        var _resize 	        = false;
        var _size 		        = window.innerWidth - 42;		    // 스크롤 box
        var _tsize 		        = 1760;                          	// 옵션 리스트 테이블 최소 사이즈
        var _scrolllbarWidth    = 16;
        if(scObj.socialcp_input_type){
            _tsize 		= 1580;
        }else if(scObj.package_yn_suboption == 'y'){
            _tsize      = 1425;
        }
        var _twidth		= _tsize;                           // 옵션 리스트 테이블 사이즈

        if(scObj.package_yn_suboption == 'y'){
            _twidth += ((scObj.suboption_package_count-1) * 220);		//패키지 상품 갯수에 따라 width 추가
        }
        if(_size > (_tsize + _scrolllbarWidth)) { _size = (_tsize + _scrolllbarWidth); _resize = true; }

        if(scObj.package_yn_suboption == 'y'){
            var scrollLayHeight = 300;
        }else{
            var scrollLayHeight = 300;
        }
        $("#table-grid table.optionList").attr("style", "min-width:"+_tsize+"px;width:"+_twidth+"px");
        if(_resize == true){
            window.resizeTo(_size+59,window.outerHeight);
        }
        $("#table-grid").height(scrollLayHeight);
    }
    _setWinReSize();

    chgSubReservePolicy();
    calulate_subOption_price();
    socialcpinputtype();
    $("input[name='subReserveRate[]']").on("blur",function(){calulate_subOption_price();});
    $("select[name='subReserveUnit[]'],.subReserveUnit_all").on("change",function(){
        if($(this).val() == "percent"){
            $(this).prev().prop("maxlength",5);
        }else{
            $(this).prev().prop("maxlength",12);
        }
        if($(this).attr("name") != 'subReserveUnit_all'){
            calulate_subOption_price();
        }
    });
    $("input[name='subReserve[]']").on("blur",function(){calulate_subOption_price();});
    $("input[name='subSupplyPrice[]']").on("blur",function(){calulate_subOption_price();});
    $("input[name='subConsumerPrice[]']").on("blur",function(){calulate_subOption_price();});
    $("input[name='subPrice[]']").on("blur",function(){calulate_subOption_price();});
    $("input[name='subCommissionRate[]']").on("blur",function(){calulate_subOption_price();});
    $("select[name='subCommissionType[]']").on("blur",function(){calulate_subOption_price();});

    // 옵션 세로로 삭제
    $(".removeOptionCell").live("click", function(){
        suboptionFrame.location.href='../goods_process/remove_option_tmp_column?tmp_seq='+$(this).attr('tmpSeq')+'&depth='+$(this).attr('oDepth');
    });

    $(".colorpicker").customColorPicker();

    // 마일리지
    $("input[name='subReserveRate[]']").each(function(){
        $(this).on("blur", function(){
            calculrate_reserve($("input[name='subReserveRate[]']").index(this));
        });
    });

    // 마일리지 단위
    $("select[name='subReserveUnit[]']").each(function(){
        $(this).on("change", function(){
            calculrate_reserve($("select[name='subReserveUnit[]']").index(this));
        });
    });

    // 판매가
    $("input[name='subPrice[]']").each(function(){
        $(this).on("blur", function(){
            calculrate_reserve($("input[name='subPrice[]").index(this));
        });
    });

    // 옵션 추가 ---------------------------->
    $("#addCellOption").on("click",function(){
        openDialog("추가구성옵션 생성", "subOptDialog", {"width":"1150","height":"500","show" : "fade","hide" : "fade"});
        $("input[name='optionMakeDepth']").val(scObj.options_cnt + 1);
        $("input[name='optionName']").val('');
        $("input[name='optionPrice']").val('');
    });

    // 옵션 관리
    $("#optionSetting").on("click",function(){
        openDialog("자주쓰는 상품의 추가구성옵션 관리", "optionSettingPopup", {"width":"500","height":"630","show" : "fade","hide" : "fade"});
    });

    // 서브옵션 만들기폼 추가
    $("#addSuboptionMake").on("click",function(){
        var objTr = $(this).closest("table").find("tbody>tr").eq(0);
        var objTb = $(this).closest("table").find("tbody");

        $( objTr.find("input[name='suboptionMakesdayinput[]']") ).datepicker( "destroy" );
        $( objTr.find("input[name='suboptionMakefdayinput[]']") ).datepicker( "destroy" );

        var clone = objTr.clone();
        clone.find("button.btnplusminus").attr("data-type","minus");
        clone.find("button.btnplusminus").removeClass("btn_plus");
        clone.find("button.btnplusminus").parent().removeClass("hide");
        clone.find("button.btnplusminus").addClass("btn_minus");
        clone.find("input[name='suboptionMakesdayinput[]']").attr("id","addoptionMakesdayinput"+(objTb.find("tr").index()+1));
        clone.find("input[name='suboptionMakefdayinput[]']").attr("id","addoptionMakefdayinput"+(objTb.find("tr").index()+1));
        setDatepicker(clone.find("input[name='suboptionMakesdayinput[]']"));
        setDatepicker(clone.find("input[name='suboptionMakefdayinput[]']"));
        objTb.append(clone);

        //폼초기화(직접입력)형식
        clone.find("select[name='suboptionMakeId[]'] option[value='direct']").attr("selected",true);
        goodssuboptiondirectdefault(clone);
        clone.find(".goodssuboptionlay").hide();
        clone.find(".etcContents").show();
        setDefaultText();
        helpicon_style();
    });

    /* 옵션삭제하기  */
    $(".delSuboptionButton").on("click",function(){
        if( $(this).closest("tr.suboptionTr").parent().children("tr.suboptionTr").length > 0 ){
            $idx	= $(".delSuboptionButton").index(this);
            $nidx	= parseInt($idx) + 1;
            if	($(this).attr('ltype') == 'm' && $(".delSuboptionButton").eq($nidx).attr('ltype') == 's'){
                $(".subSale_td").eq($nidx).html($(".subSale_td").eq($idx).html());
                $(".subRequired_td").eq($nidx).html($(".subRequired_td").eq($idx).html());
                $(".suboptTitle_td").eq($nidx).html($(".suboptTitle_td").eq($idx).html());
                $(".delSuboptionButton").eq($nidx).attr('ltype', 'm');
            }
            $(this).closest("tr.suboptionTr").remove();
        }
    });

// 옵션 선택 제거
    $(".removeOption").on("click",function(){

        var obj = $(this);
        if($(".optionList input[name='optDel[]']:checked").length == 0){
            alert("삭제할 추가 구성 옵션을 먼저 선택해 주세요.");
            return false;
        }
        
        $(".optionList input[name='optDel[]']:checked").each(function(){

            if( $(this).closest("tr.suboptionTr").parent().children("tr.suboptionTr").length > 0 ){
                $idx	= $(".delSuboptionButton").index(this);
                $nidx	= parseInt($idx) + 1;
                if	($(this).attr('ltype') == 'm' && $(".delSuboptionButton").eq($nidx).attr('ltype') == 's'){
                    $(".subSale_td").eq($nidx).html($(".subSale_td").eq($idx).html());
                    $(".subRequired_td").eq($nidx).html($(".subRequired_td").eq($idx).html());
                    $(".suboptTitle_td").eq($nidx).html($(".suboptTitle_td").eq($idx).html());
                    $(".delSuboptionButton").eq($nidx).attr('ltype', 'm');
                }
                $(this).closest("tr.suboptionTr").remove();
            }
        });

        if($(".optionList input[name='optDel[]']").length == 0){
            $(".optionList input[name='chkall']").prop("checked",false);
        }

    });

    /* 옵션만들기 폼 삭제하기 */
    /*$(".delSuboptionMake").on("click",function(){
        $(this).closest("tr").remove();
    });
    */

    /* 옵션직접입력 선택시 */
    $(document).on("change","select[name='suboptionMakeId[]']",function(){
        if( $(this).val() == 'direct'){//직접입력
            goodssuboptiondirectdefault($(this).parents("tr"));
        }else{//상품코드 옵션선택시
            goodssuboptionspecialselect($(this), $(this).parents("tr"));
        }
        goodssuboptioncode($(this));//추가정보 >> 추가구성옵션코드추가
    });

    //추가구성옵션 > 직접입력 >> 특수정보 선택시
    /*$("select[name='suboptionMakespecial[]']").live("change",function() {
    //	goodssuboptionspecialform($(this), $(this).parents("tr"));
    });
    */

    /* 옵션 >> 추가된 코드 선택시 레이어띄우기 */
    $(document).on("click",".goodssuboptionbtn", function(){
        var layerid 			= $(this).attr("layerid");
        var label_type 			= $(this).attr("label_type");
        var label_newtype 		= $(this).attr("label_newtype");
        var codeform_seq 		= $(this).attr("codeform_seq");
        var label_title 		= $(this).attr("label_title");
        var idx 				= $(this).parents("tr").index();
        $("#"+layerid).find(".gdsuboptidx").val(idx);

        //설정 변경시 및 최초값설정
        var goodssuboptioncodetitlejoin = $("div#subOptDialog input[name='suboptionMakeCode[]']").eq(idx).val();
        if( goodssuboptioncodetitlejoin ) {//수정시 설정값셋팅
            var goodssuboptioncodetitlear = goodssuboptioncodetitlejoin.split(',');
        }
        $("#"+layerid).find("input[name='goodssuboption[]']").each(function(){
            if( goodssuboptioncodetitlejoin ) {
                $(this).attr("checked",false);
                for (var i=0;i<goodssuboptioncodetitlear.length;i++){
                    if(!goodssuboptioncodetitlear[i]) continue;
                    if( goodssuboptioncodetitlear[i] == $(this).val() ) {
                        $(this).attr("checked",true);
                        break;
                    }
                }
            }else if( !goodssuboptioncodetitlejoin && $(this).attr("default") == 'checked' ) {
                $(this).attr("checked",true);
            }else{
                $(this).attr("checked",false);
            }
        });

        if(label_newtype == 'address'){
            openDialog(label_title, layerid, {"width":"800","height":"400","show" : "fade","hide" : "fade"});
        }else if(label_newtype == 'dayinput'  || label_newtype == 'dayauto' ){
            openDialog(label_title, layerid, {"width":"550","height":"400","show" : "fade","hide" : "fade"});
        }else{
            openDialog(label_title, layerid, {"width":"450","height":"400","show" : "fade","hide" : "fade"});
        }
    });

    /* 옵션 >> 추가코드선택 후 적용하기 */
    $(".GoodsSubOptionCodeApply").on("click",function(){
        var codeform_seq 			= $(this).attr("codeform_seq");
        var label_type 				= $(this).attr("label_type");
        var label_newtype 			= $(this).attr("label_newtype");
        var label_id 				= $(this).attr("label_id");
        var layer_id 				= $(this).attr("layer_id");

        var gdsuboptcodeval 		= new Array();
        var gdsuboptcodetitle 		= new Array();

        var gdsuboptcolor 			= new Array();
        var gdsuboptzipcode 		= new Array();
        var gdsuboptaddress 		= new Array();
        var gdsuboptaddressdetail 	= new Array();

        var biztel 					= new Array();
        var codedate 				= new Array();
        var sdayinput 				= new Array();
        var fdayinput 				= new Array();
        var dayautotype 			= new Array();
        var sdayauto 				= new Array();
        var fdayauto 				= new Array();
        var dayautoday 				= new Array();

        //goodssuboption
        $("#"+layer_id+" input[name='"+label_type+"[]']").each(function(){
            if ( $(this).is(':checked') == true  ) {
                gdsuboptcodeval.push($(this).val());//code
                gdsuboptcodetitle.push($(this).attr("label_value"));

                gdsuboptcolor.push($(this).attr("label_color"));
                gdsuboptzipcode.push($(this).attr("label_zipcode"));
                gdsuboptaddress.push($(this).attr("label_address"));
                gdsuboptaddressdetail.push($(this).attr("label_addressdetail"));

                biztel.push($(this).attr("label_biztel"));
                codedate.push($(this).attr("label_codedate"));
                sdayinput.push($(this).attr("label_sdayinput"));
                fdayinput.push($(this).attr("label_fdayinput"));
                dayautotype.push($(this).attr("label_dayauto_type"));
                sdayauto.push($(this).attr("label_sdayauto"));
                fdayauto.push($(this).attr("label_fdayauto"));
                dayautoday.push($(this).attr("label_dayauto_day"));
            }
        });

        var gdsuboptcodevaljoin 		= gdsuboptcodeval.join(',');
        var gdsuboptcodetitlejoin 		= gdsuboptcodetitle.join(',');

        var gdsuboptcolorjoin 			= gdsuboptcolor.join(',');
        var gdsuboptzipcodejoin 		= gdsuboptzipcode.join(',');
        var gdsuboptaddressjoin 		= gdsuboptaddress.join(',');
        var gdsuboptaddressdetailjoin 	= gdsuboptaddressdetail.join(',');

        var bizteljoin 					= biztel.join(',');
        var codedatejoin 				= codedate.join(',');
        var sdayinputjoin 				= sdayinput.join(',');
        var fdayinputjoin 				= fdayinput.join(',');
        var dayautotypejoin 			= dayautotype.join(',');
        var sdayautojoin 				= sdayauto.join(',');
        var fdayautojoin 				= fdayauto.join(',');
        var dayautodayjoin 				= dayautoday.join(',');

        var gdsuboptidx 				= $(this).closest("div#"+layer_id).find(".gdsuboptidx").val();

        $("div#subOptDialog input[name='suboptionMakeType[]']").eq(gdsuboptidx).val(label_type);
        $("div#subOptDialog input[name='suboptionMakeCode[]']").eq(gdsuboptidx).val(gdsuboptcodevaljoin);

        $("div#subOptDialog input[name='suboptionMakenewtype[]']").eq(gdsuboptidx).val(label_newtype);
        $("div#subOptDialog input[name='suboptionMakecolor[]']").eq(gdsuboptidx).val(gdsuboptcolorjoin);
        $("div#subOptDialog input[name='suboptionMakezipcode[]']").eq(gdsuboptidx).val(gdsuboptzipcodejoin);
        $("div#subOptDialog input[name='suboptionMakeaddress[]']").eq(gdsuboptidx).val(gdsuboptaddressjoin);
        $("div#subOptDialog input[name='suboptionMakeaddressdetail[]']").eq(gdsuboptidx).val(gdsuboptaddressdetailjoin);

        $("div#subOptDialog input[name='suboptionMakebiztel[]']").eq(gdsuboptidx).val(bizteljoin);
        $("div#subOptDialog input[name='suboptionMakecodedate[]']").eq(gdsuboptidx).val(codedatejoin);
        $("div#subOptDialog input[name='suboptionMakesdayinput[]']").eq(gdsuboptidx).val(sdayinputjoin);
        $("div#subOptDialog input[name='suboptionMakefdayinput[]']").eq(gdsuboptidx).val(fdayinputjoin);
        $("div#subOptDialog select[name='suboptionMakedayauto_type[]'] option[value='"+dayautotypejoin+"']").eq(gdsuboptidx).attr("selected",true);
        $("div#subOptDialog input[name='suboptionMakesdayauto[]']").eq(gdsuboptidx).val(sdayautojoin);
        $("div#subOptDialog input[name='suboptionMakefdayauto[]']").eq(gdsuboptidx).val(fdayautojoin);
        $("div#subOptDialog select[name='suboptionMakedayauto_day[]'] option[value='"+dayautodayjoin+"']").eq(gdsuboptidx).attr("selected",true);

        $("div#subOptDialog input[name='suboptionMakeValue[]']").eq(gdsuboptidx).val(gdsuboptcodetitlejoin);
        //$("div#subOptDialog input[name='suboptionMakeValue[]']").eq(gdsuboptidx).attr("readonly",true);
        $("div#subOptDialog input[name='suboptionMakeValue[]']").eq(gdsuboptidx).show();

        var obj = $("div#subOptDialog input[name='suboptionMakePrice[]']").eq(gdsuboptidx);
        var sArr = gdsuboptcodetitlejoin.split(',');
        var tArr = new Array();
        for(var i = 0;i<sArr.length;i++){
            tArr.push(0);
        }
        obj.val(tArr.join(','));

        if( label_newtype == 'dayauto' ) {
            socialcpdayautoreview( $("div#subOptDialog div.suboptionMakenewdayauto").eq(gdsuboptidx) );
        }


        closeDialog(layer_id);
    });

    /* 옵션만들기 초기가격 넣기*/
    $("div#subOptDialog input[name='suboptionMakeValue[]']").live("blur",function(){
        var tmp = optReplace($(this).val());
        if	(tmp){
            $(this).val(tmp);

            var obj = $(this).parents("tr").find("input[name='suboptionMakePrice[]']");
            var sArr = $(this).val().split(',');
            var tArr = obj.val().split(',');
            var tArrNew = new Array();
            for(var i = 0;i<sArr.length;i++){
                if(tArr[i]){
                    tArrNew[i] = tArr[i];
                }else{
                    tArrNew[i] = 0;
                }
            }
            obj.val(tArrNew.join(','));
        }
    });

    /* 옵션가격 일괄 적용 */
    $("button#suboptionBatch").bind("click",function(){
        batch_suboption_price();
        calulate_subOption_price();
    });

    $("#btn_goods_option_list").live("click",function(){
        openDialog("옵션정보 가져오기", "option_newlist", {"width":"800","height":"880","show" : "fade","hide" : "fade"});
    });

    $("#btn_goods_special_list").live("click",function(){
        openDialog("특수 정보 활용 안내", "special_newlist", {"width":"760","height":"816","show" : "fade","hide" : "fade"});
    });

    // 자주사용하는 옵션 가져오기
    $("#frequentlytypesuboptbtn").live("click",function(){
        var add_goods_seq = $("select[name='frequentlytypesubopt']").find("option:selected").val();
        if( add_goods_seq<=0 ){
            alert("옵션정보를 가져올 상품을 선택해 주세요!");
            return false;
        }

        var goods_name = $("select[name='frequentlytypesubopt']").find("option:selected").text();
        openDialogConfirm('정말로  ['+goods_name+'] 상품의 <br/>추가구성옵션 정보를 가져오시겠습니까?',400,200,function() {
            opener.openSettingSubOptionnew(add_goods_seq);
        });
    });

    $("input[name='optionValue']").on("blur", function(){
        var valStr		= $(this).val();
        if	(valStr){
            var priceStr	= valStr.replace(/[^,]*/ig, '0');
            priceStr		= priceStr.replace(/[0]{2,}/g, '0');
            $("input[name='optionPrice']").val(priceStr);
        }
    });
    //<----------------- 옵션 세로로 추가

    //수정불가
    $(".input-box-default-text-code").on('keydown change focusin selectstart',function(){
        $(this).blur();
        return false;
    });

    //옵션 생성하기 버튼
    $("#gdsuboptioncodemakebtn").on("click", function() {
        var optName     = new Array();
        var optionType  = new Array();
        var optValue    = new Array();
        var tmp;

        $("#subOptDialog table tbody tr").each(function(idx){
            optionType[idx] = $(this).find("select[name='suboptionMakeId[]'] option:selected").val();

            tmp = $(this).find("input[name='suboptionMakeName[]']").val();
            if( tmp == $(this).find("input[name='suboptionMakeName[]']").attr("title") ){
                optName = new Array();
                return false;
            }else{
                optName[idx] = tmp.split(',');
            }

            tmp = $(this).find("input[name='suboptionMakeValue[]']").val();
            if( tmp == $(this).find("input[name='suboptionMakeValue[]']").attr("title") ){
                optValue = new Array();
                return false;
            }else{
                optValue[idx] = tmp.split(',');
            }

        });

        if(optName.length<1){
            openDialogAlert("추가 옵션명을 정확히 입력해주세요.",400,140,function(){
                $("#subOptDialog input[name='suboptionMakeName[]']").filter(function(){
                    return $(this).val().length==0;
                }).eq(0).focus();
            });
            return false;
        }

        if(optValue.length<1){
            openDialogAlert("추가 옵션명을 정확히 입력해주세요.",400,140,function(){
                $("#subOptDialog input[name='suboptionMakeValue[]']").filter(function(){
                    return $(this).val().length==0;
                }).eq(0).focus();
            });
                    return false;
        }

        /* 옵션명 공백 체크 */
        for(var i=0;i<optName.length;i++){
            for(var j=0;j<optName[i].length;j++){
                if(optName[i][j].length==0) {
                    openDialogAlert("추가 옵션명을 입력해주세요.",400,140,function(){
                        $("#subOptDialog input[name='suboptionMakeName[]']").filter(function(){
                            return $(this).val().length==0;
                        }).eq(0).focus();
                    });
                    return false;
                }
            }
        }

        /* 옵션값 공백 체크 */
        for(var i=0;i<optValue.length;i++){
            for(var j=0;j<optValue[i].length;j++){
                if(optValue[i][j].length==0) {
                    openDialogAlert("추가 옵션값을 입력해주세요.",400,140,function(){
                        $("#subOptDialog input[name='suboptionMakeValue[]']").filter(function(){
                            return $(this).val().length==0;
                        }).eq(0).focus();
                    });
                    return false;
                }
            }
        }

        $("#suboptionMakeForm").submit();
    });

    //직접입력 > 색상
    $(".colorhelpicon").live("click",function(){
        if($(this).attr("opttype") ){
            $("#gdoptdirectmodifylay input").val();
            var opttblobj = $(this).parents("tr");
            var opttblidx = opttblobj.index();
            $("#goodsoptiondirectmodifybtn").attr("opttblidx",opttblidx);
            $("#goodsoptiondirectmodifybtn").attr("newtype","color");
            $("#gdoptdirectmodifylay div.goodsoptiondirectlay").hide();
            $("#gdoptdirectmodifylay div.colordateaddresslay").show();
            $("#gdoptdirectmodifylay div.colorlay").show();
            $("#gdoptdirectmodifylay div.datelay").hide();
            $("#gdoptdirectmodifylay div.addresslay").hide();
            $($("#gdoptdirectmodifylay input[name='direct_color']")).customColorPicker("destroy");
            $("#gdoptdirectmodifylay input[name='direct_color']").val(opttblobj.find("input[name='suboptcolor[]']").val());
            $($("#gdoptdirectmodifylay input[name='direct_color']")).customColorPicker();
            //helpicon_style();
            openDialog("색상 변경", "gdoptdirectmodifylay", {"width":"450","height":"300","show" : "fade","hide" : "fade"});
        }
    });

    //직접입력 > 지역
    $(".addrhelpicon").live("click",function(){
        if($(this).attr("opttype")){
            $("#gdoptdirectmodifylay input").val();
            var opttblobj = $(this).parents("tr");
            var opttblidx = opttblobj.index();
            $("#goodsoptiondirectmodifybtn").attr("opttblidx",opttblidx);
            $("#goodsoptiondirectmodifybtn").attr("newtype","address");
            $("#gdoptdirectmodifylay div.goodsoptiondirectlay").hide();
            $("#gdoptdirectmodifylay div.colordateaddresslay").show();
            $("#gdoptdirectmodifylay div.addresslay").show();
            $("#gdoptdirectmodifylay div.colorlay").hide();
            $("#gdoptdirectmodifylay div.datelay").hide();
            var zipcode = new Array()
            zipcode = opttblobj.find("input[name='suboptzipcode[]']").val().split("-");
            $("#gdoptdirectmodifylay input.direct_zipcode1").val(zipcode[0]);
            $("#gdoptdirectmodifylay input.direct_zipcode2").val(zipcode[1]);
            $("#gdoptdirectmodifylay input[name='direct_address']").val(opttblobj.find("input[name='suboptaddress[]']").val());
            $("#gdoptdirectmodifylay input[name='direct_addressdetail']").val(opttblobj.find("input[name='suboptaddressdetail[]']").val());
            $("#gdoptdirectmodifylay input[name='direct_biztel']").val(opttblobj.find("input[name='suboptbiztel[]']").val());
            //helpicon_style();
            openDialog("지역 변경", "gdoptdirectmodifylay", {"width":"450","height":"300","show" : "fade","hide" : "fade"});
        }
    });
    //직접입력 > 날짜
    $(".codedatehelpicon").on("click",function(){
        if($(this).attr("opttype")){
            $("#gdoptdirectmodifylay input").val();
            var opttblobj = $(this).parents("tr");
            var opttblidx = opttblobj.index();
            $("#goodsoptiondirectmodifybtn").attr("opttblidx",opttblidx);
            $("#goodsoptiondirectmodifybtn").attr("newtype","date");
            $("#gdoptdirectmodifylay div.goodsoptiondirectlay").hide();
            $("#gdoptdirectmodifylay div.colordateaddresslay").show();
            $("#gdoptdirectmodifylay div.datelay").show();
            $("#gdoptdirectmodifylay div.colorlay").hide();
            $("#gdoptdirectmodifylay div.addresslay").hide();
            $("#gdoptdirectmodifylay input[name='direct_codedate']").val(opttblobj.find("input[name='codedate[]']").val());
            //helpicon_style();
            openDialog("날짜 변경", "gdoptdirectmodifylay", {"width":"450","height":"300","show" : "fade","hide" : "fade"});
        }
    });
    //직접입력 > 수동기간
    $(".dayinputhelpicon").on("click",function(){
        if($(this).attr("opttype")){
            var opttblobj = $(this).parents("tr");
            var opttblidx = opttblobj.index();
            $("#goodsoptiondirectmodifybtn").attr("opttblidx",opttblidx);
            $("#goodsoptiondirectmodifybtn").attr("newtype","dayinput");
            $("#gdoptdirectmodifylay div.goodsoptiondirectlay").hide();
            $("#gdoptdirectmodifylay div.colordateaddresslay").hide();
            $("#gdoptdirectmodifylay div.dayinputlay").show();
            openDialog("수동기간 변경", "gdoptdirectmodifylay", {"width":"350","height":"150","show" : "fade","hide" : "fade"});
        }
    });
    //직접입력 > 자동기간
    $(".dayautohelpicon").on("click",function(){
        alert($(this).attr("opttype") );
        if($(this).attr("opttype") ){
            var opttblobj = $(this).parents("tr");
            var opttblidx = opttblobj.index();
            $("#goodsoptiondirectmodifybtn").attr("opttblidx",opttblidx);
            $("#goodsoptiondirectmodifybtn").attr("newtype","dayauto");
            $("#gdoptdirectmodifylay div.goodsoptiondirectlay").hide();
            $("#gdoptdirectmodifylay div.colordateaddresslay").hide();
            $("#gdoptdirectmodifylay div.dayautolay").show();
            openDialog("자동기간 변경", "gdoptdirectmodifylay", {"width":"350","height":"150","show" : "fade","hide" : "fade"});
        }
    });

    //직접입력 개별수정버튼클릭시
    $("#goodsoptiondirectmodifybtn").live("click",function(){
        var newtype = $(this).attr("newtype");
        var opttblidx = $(this).attr("opttblidx");
        goodsoptiondirectmodify(opttblidx, newtype);
    });

    // 우편번호 검색
    $(".direct_zipcode_btn").live("click",function(){
        openDialogZipcode('direct_');
    });

    $("div#subOptDialog select.suboptionMakedayauto_type").live("change",function(){
        if( $(this).find("option:selected").val() == 'day' ) {
            var suboptionMakenewdayautolaytitle = "이후";
        }else{
            var suboptionMakenewdayautolaytitle = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
        }
        $(this).parent().find(".suboptionMakenewdayautolaytitle").html(suboptionMakenewdayautolaytitle);
        socialcpdayautoreview($(this).parents("div.suboptionMakenewdayauto"));
    });

    $("div#subOptDialog select.suboptionMakedayauto_day").live("change",function(){
        socialcpdayautoreview($(this).parents("div.suboptionMakenewdayauto"));
    });

    //자동기간 예시 미리보기
    $("div#subOptDialog span.optionMakenewdayautolayrealdateBtn").live("click",function() {
        socialcpdayautoreview( $(this).parents("div.suboptionMakenewdayauto") );
    });

    if(!scObj.options_cnt){
        $("#frequentlay").hide();
    }

    $('.save_all').click(function(){
        var baseId	= $(this).attr('id');
        var target	= $(this).attr('target');
        $('.' + target).val($('.' + baseId).val()).trigger('blur');
    });

    /* 수수료 일괄 적용 */
    $('.applyAllCommission').click(function(){
        if	($('.subCommissionType_all').val() == 'SUCO'){
            if($('.subCommissionRate_all').val() > 100){
                alert("정산 수수료는 100% 이하여야 합니다.");
                return false;
            }
        }
        $('.subCommissionType').val($('.subCommissionType_all').val());
        $('.subCommissionRate').val($('.subCommissionRate_all').val()).trigger('blur');
    });

    $('.applyAllReserve').click(function() {
        if	($('.subReserveUnit_all').val() == 'percent'){
            if($('.subReserveRate_all').val() > 100){
                $('.subReserveRate_all').val('');
                alert("마일리지 지급률은 100%를 넘을 수 없습니다.");
                return false;
            }
        }
        $('.subReserveUnit').val($('.subReserveUnit_all').val());
        $('.subReserveRate').val($('.subReserveRate_all').val()).trigger('blur');
    });

    $("input[name='subCommissionRate[]']").on("change",function(){
        var float_cnt	= this.value.match(/\.[0-9]+/g);
        if(float_cnt > 0 && float_cnt.toString().length > 3){
            alert('소숫점 2자리까지 가능합니다.(2자리 초과 절삭)');
        }
        var charge		= Math.floor(this.value * 100) / 100;
        this.value		= charge;
    });

    $('select[name="subReservePolicy"]').change(function(){chgSubReservePolicy()});
    
    var optionStockSetText	= opener.setOptionStockSetText();
    $('.optionStockSetText').html(optionStockSetText);
    
    $(document).on("click", '.delFreqOption', function(){
        var goods_seq = $(this).val();
        var type = $(this).data('type');
        if(!goods_seq){
            alert("상품 번호를 찾을 수 없습니다.");
            return false;
        }
        
        if(!type){
            alert("타입을 찾을 수 없습니다.");
            return false;
        }
        
        var popupID		= $(this).parents('div').attr('id');
        var page		= $(this).closest('div').find('.paging_navigation .on').text();
        var packageyn	= $(this).data('packageyn');
        
        var name = $('.delFreqOptionName_'+goods_seq).text();
        
        if(confirm(name + '를 삭제 하시겠습니까?')){
            delFreqOption(goods_seq, type, page, packageyn, popupID);
        }
    });
});

function subOptionDel(obj){
    if($(obj).attr("data-type") == "minus"){
        $(obj).closest("tr").remove();
    }
}

//특수옵션 > 자동기간 미리보기
function socialcpdayautoreview(opttblobj) {
    opttblobj.find(".optionMakenewdayautolayrealdate").html('');
    var dayauto_type = 'month';
    dayauto_type = opttblobj.find(".suboptionMakedayauto_type option:selected").val();

    var sdayauto = '0';
    sdayauto = opttblobj.find(".optionMakesdayauto").val();

    var fdayauto = '0';
    fdayauto = opttblobj.find(".optionMakefdayauto").val();

    var dayauto_day = 'day';
    dayauto_day = opttblobj.find(".suboptionMakedayauto_day option:selected").val();

    if( !sdayauto || !sdayauto ){
        alert("기간 자동일자를 정확히 입력해 주세요.");
        return false;
    }

    $.ajax({
        'url' : '../setting_process/goods_dayauto_setting',
        'data' : {'dayauto_type':dayauto_type,'dayauto_day':dayauto_day,'sdayauto':sdayauto,'fdayauto':fdayauto},
        'dataType' : 'json',
        'success' : function(res){
            opttblobj.find(".optionMakenewdayautolayrealdate").html(res.social_start_date+"~"+res.social_end_date);
        }
    });

}

//
function socialcpinputtype() {
    if(scObj.socialcp_input_type){
        var socialcp_input_type = '{sc.socialcp_input_type}';
    }else{
        var socialcp_input_type = $("input[name='socialcp_input_type']:checked", window.opener.document).val();
    }

    if(socialcp_input_type) {
        var couponinputsubtitle = '';
        $(".couponinputtitle").show();
        if( socialcp_input_type == 'price' ) {
            couponinputsubtitle = '금액';
        }else{
            couponinputsubtitle = '횟수';
        }
        $("#socialcpuseopen").val(socialcp_input_type);
        $(".couponinputsubtitle").text(couponinputsubtitle);
    }

    //과세/부가세 체크
    if(scObj.goodsTax){
        var goodsTax = scObj.goodsTax;
    }else{
        var goodsTax = $("input[name='tax']:checked", window.opener.document).val();
    }
    $(".goodsTax").val(goodsTax);

}

function helpicon_style(){
    /* 툴팁 */
    $(".helpicon, .help").each(function(){

        var options = {
            className: 'tip-darkgray',
            bgImageFrameSize: 8,
            alignTo: 'target',
            alignX: 'right',
            alignY: 'center',
            offsetX: 10,
            allowTipHover: false,
            slide: false,
            showTimeout : 0
        }

        if($(this).attr('options')){
            var customOptions = eval('('+$(this).attr('options')+')');
            for(var i in customOptions){
                options[i] = customOptions[i];
            }
        }

        $(this).poshytip(options);
    });
}

//직접입력 > 개별수정레이어창에서 수정하기
function goodsoptiondirectmodify(opttblidx, newtype) {
    var opttblobj = $("div#suboptionLayer tr.suboptionTr").eq(opttblidx);
    switch(newtype){
        case "color":
            var optcolor = $("#gdoptdirectmodifylay input[name='direct_color']").val();
            opttblobj.find("input[name='suboptcolor[]']").val(optcolor);
            opttblobj.find("div.colorhelpicon").css("background-color",optcolor);
            opttblobj.find("div.colorhelpicon").attr("title", "[색상]을 클릭하여 변경할 수 있습니다.");
            $(opttblobj.find("div.colorhelpicon")).customColorPicker(optcolor);
        break;
        case "address":
            var direct_zipcode1 = $("#gdoptdirectmodifylay input.direct_zipcode1").val();
            var direct_zipcode2 = $("#gdoptdirectmodifylay input.direct_zipcode2").val();
            var optaddress = $("#gdoptdirectmodifylay input[name='direct_address']").val();
            var optaddressdetail = $("#gdoptdirectmodifylay input[name='direct_addressdetail']").val();
            var optbiztel = $("#gdoptdirectmodifylay input[name='direct_biztel']").val();
            opttblobj.find("input[name='suboptaddressdetail[]']").val(optaddressdetail);
            opttblobj.find("input[name='suboptbiztel[]']").val(optbiztel);
            opttblobj.find("input[name='suboptaddress[]']").val(optaddress);
            opttblobj.find("input[name='suboptzipcode[]']").val(direct_zipcode1+"-"+direct_zipcode2);
            opttblobj.find("span.addrhelpicon").attr("title","["+direct_zipcode1+"-"+direct_zipcode2+"] "+optaddress +" "+ optaddressdetail + " 업체 연락처:"+ optbiztel +"<br/>[지역]을 클릭하여 변경할 수 있습니다.");
        break;
        case "date":
            var codedate = $("#gdoptdirectmodifylay input[name='direct_codedate']").val();
            opttblobj.find("input[name='codedate[]']").val(codedate);
            opttblobj.find("span.codedatehelpicon").attr("title",codedate + "<br/>[날짜]를 클릭하여 변경할 수 있습니다.");
        break;
    }
    helpicon_style();
    closeDialog("gdoptdirectmodifylay");
}

//옵션 >> 직접입력시 초기화
function goodssuboptiondirectdefault(objparent) {
    objparent.find("input[name='suboptionMakeName[]']").removeClass("input-box-default-text-code");
    objparent.find("input[name='suboptionMakeValue[]']").removeClass("input-box-default-text-code");
    //objparent.find("input[name='suboptionMakeName[]']").val('');
    //objparent.find("input[name='suboptionMakeCode[]']").val('');
    //objparent.find("input[name='suboptionMakeValue[]']").val('');
    //objparent.find("input[name='suboptionMakePrice[]']").val('');

    objparent.find("input[name='suboptionMakeName[]']").val('').attr("title","예) 사이즈");
    objparent.find("input[name='suboptionMakeValue[]']").val('').attr("title","예) 90, 95, 100");
    objparent.find("input[name='suboptionMakeCode[]']").val('');
    objparent.find("input[name='suboptionMakePrice[]']").val('').attr("title","0,0,0");

    objparent.find("input[name='suboptionMakenewtype[]']").val('');
    objparent.find("input[name='suboptionMakecolor[]']").val('');
    objparent.find("input[name='suboptionMakezipcode[]']").val('');
    objparent.find("input[name='suboptionMakeaddress[]']").val('');
    objparent.find("input[name='suboptionMakeaddressdetail[]']").val('');

    objparent.find("input[name='suboptionMakebiztel[]']").val('');
    objparent.find("input[name='suboptionMakesdayinput[]']").val('');
    objparent.find("input[name='suboptionMakefdayinput[]']").val('');
    objparent.find("input[name='suboptionMakedayauto_type[]'] option[value='']").attr("selected",true);
    objparent.find("input[name='suboptionMakesdayauto[]']").val('');
    objparent.find("input[name='suboptionMakefdayauto[]']").val('');
    objparent.find("input[name='suboptionMakedayauto_day[]'] option[value='']").attr("selected",true);

    objparent.find("input[name='suboptionMakeValue[]']").removeAttr("readonly");
    objparent.find("input[name='suboptionMakeName[]']").removeAttr("readonly");
    objparent.find("select[name='suboptionMakespecial[]']").removeAttr("disabled");
    objparent.find("select[name='suboptionMakespecial[]']").removeAttr("readonly");
    objparent.find("select[name='suboptionMakespecial[]'] option[value='']").attr("selected",true);
    objparent.find("input[name='suboptionMakeName[]']").show();
    objparent.find("input[name='suboptionMakeValue[]']").show();

    objparent.find(".suboptionMakeSpecial").hide();
    objparent.find(".suboptionMakeSpecialsub").hide();
    //objparent.find(".suboptionMakelayout").show();
}

//옵션정보 가져오기시 중복체크
function goodssuboptionspecialselect(obj, objparent) {
    var parentidx = objparent.index();//현재위치
    var goodsoptionspecialdate = 0;
    var goodsoptionspecial = 0;
    var label_newtype = obj.find("option:selected").attr("label_newtype");
    var optionMakeIdval = obj.find("option:selected").val();
    var label_newtype_length = objparent.parent().find("select[name='suboptionMakespecial[]']").length;

    if( label_newtype_length > 1 ) {
        objparent.parent().find("select[name='suboptionMakespecial[]']").each( function() {
            var selidx = $(this).parents("tr").index();//alert(parentidx + "-->" + selidx);//
            if( parentidx != selidx && $(this).val() ) {
                if( $(this).find("option:selected") ) {
                    if( label_newtype == $(this).val() )  goodsoptionspecial++;//중복불가

                    if( $(this).val() == 'date' ||  $(this).val() == 'dayauto'  ||  $(this).val() == 'dayinput' )goodsoptionspecialdate++;
                }
            }
        });
    }

    objparent.find("input[name='suboptionMakeValue[]']").val('').attr("title","");
    objparent.find("input[name='suboptionMakePrice[]']").val('').attr("title","");

    objparent.find(".suboptionMakeSpecial").hide();
    objparent.find(".suboptionMakeSpecialsub").hide();
    //objparent.find(".suboptionMakelayout").show();

    var label_newtype = obj.find("option:selected").attr("label_newtype");
    //objparent.find("input[name='suboptionMakeName[]']").addClass("input-box-default-text-code");
    //objparent.find("input[name='suboptionMakeValue[]']").addClass("input-box-default-text-code");
    objparent.find("input[name='suboptionMakeName[]']").val(obj.children("option:selected").attr("label_title"));
    //objparent.find("input[name='suboptionMakeName[]']").attr("readonly",true);
    objparent.find("select[name='suboptionMakespecial[]']").attr("disabled",true);
    objparent.find("input[name='suboptionMakeValue[]']").hide();

    if( label_newtype != 'none') {
        objparent.find("select[name='suboptionMakespecial[]'] option[value='"+label_newtype+"']").attr("selected",true);
    }else{
        objparent.find("select[name='suboptionMakespecial[]'] option[value='']").attr("selected",true);
    }

    if(label_newtype) {
        objparent.find(".suboptionMakeSpecial").show();
        objparent.find(".suboptionMakeSpecialsub").hide();
        switch(label_newtype){
            case 'color':			objparent.find(".suboptionMakeColor").show();break;
            case 'address':		objparent.find(".suboptionMakeaddress").show();break;
            case 'date':			objparent.find(".suboptionMakedate").show();break;
            case 'dayinput':	objparent.find(".suboptionMakedayinput").show();break;
            case 'dayauto':	objparent.find(".suboptionMakenewdayauto").show();break;
        }
    }else{
        objparent.find(".suboptionMakeSpecial").hide();
        objparent.find(".suboptionMakeSpecialsub").hide();
    }
    setDefaultText();
    setDatepicker();


    return true;
}
//옵션 > 직접입력 >> 특수정보 선택시
function goodssuboptionspecialform(obj, objparent) {
    var parentidx = objparent.index();//현재위치
    var specialform = obj.val();
    var goodsoptionspecial = 0;
    var goodsoptionspecialdate = 0;
    var label_newtype = specialform;
    var label_newtype_length = objparent.parent().find("select[name='suboptionMakespecial[]']").length;
    if( label_newtype_length > 1 ) {
        objparent.parent().find("select[name='suboptionMakespecial[]']").each( function() {
            var selidx = $(this).parents("tr").index();//alert(parentidx + "-->" + selidx);//
            if(parentidx == selidx && label_newtype == $(this).val()) {//본인추가
                goodsoptionspecial++;//중복불가
                return true;
            }

            if( parentidx != selidx && $(this).val()){
                if( $(this).find("option:selected"))  {
                    if( label_newtype == $(this).val() )  goodsoptionspecial++;//중복불가
                    if( $(this).val() == 'date' ||  $(this).val() == 'dayauto'  ||  $(this).val() == 'dayinput' ) goodsoptionspecialdate++;
                }
            }
        });
    }
    var valuetitle = "예) 90, 95, 100";
    objparent.find("input[name='suboptionMakeValue[]']").val("").attr("title","");
    objparent.find("input[name='suboptionMakeCode[]']").val('');
    if( specialform == 'date' ) {
        valuetitle = "예) 12월 31일 20시 공연";
        objparent.find("input[name='suboptionMakeName[]']").val('예) 공연일시').attr("title","예) 공연일시");
        objparent.find("input[name='suboptionMakePrice[]']").val('0').attr("title","0");
    }
    else if( specialform == 'dayauto' ){
        valuetitle = "사용 기간을 안내 하세요.";
        objparent.find("input[name='suboptionMakeName[]']").val('예) 사용기간').attr("title","예) 사용기간");
        objparent.find("input[name='suboptionMakePrice[]']").val('0').attr("title","0");
    }
    else if( specialform == 'dayinput' ){
        valuetitle = "사용 기간을 안내 하세요.";
        objparent.find("input[name='suboptionMakeName[]']").val('예) 사용기간').attr("title","예) 사용기간");
        objparent.find("input[name='suboptionMakePrice[]']").val('0').attr("title","0");
    }
    else if( specialform == 'color' ){
        valuetitle = "예) 블랙, 화이트, 그레이";
        objparent.find("input[name='suboptionMakeName[]']").val('예) 색상').attr("title","예) 색상");
        objparent.find("input[name='suboptionMakePrice[]']").val('0,0,0').attr("title","0,0,0");
    }
    else if( specialform == 'address' ){
        valuetitle = "예) 분당점, 삼평점, 판교점";
        objparent.find("input[name='suboptionMakeName[]']").val('예) 사용지점').attr("title","예) 사용지점");
        objparent.find("input[name='suboptionMakePrice[]']").val('0,0,0').attr("title","0,0,0");
    }else{
        objparent.find("input[name='suboptionMakeName[]']").val('예) 사이즈').attr("title","예) 사이즈");
        objparent.find("input[name='suboptionMakePrice[]']").val('0,0,0').attr("title","0,0,0");
    }

    objparent.find("input[name='suboptionMakeValue[]']").val(valuetitle);
    objparent.find("input[name='suboptionMakeValue[]']").attr("title",valuetitle);

    if(specialform){
        objparent.find(".suboptionMakeSpecial").show();
        objparent.find(".suboptionMakeSpecialsub").hide();
        //objparent.find(".suboptionMakelayout").hide();
        switch(specialform){
            case 'color':			objparent.find(".suboptionMakeColor").show();break;
            case 'address':		objparent.find(".suboptionMakeaddress").show();break;
            case 'date':			objparent.find(".suboptionMakedate").show();break;
            case 'dayinput':	objparent.find(".suboptionMakedayinput").show();break;
            case 'dayauto':	objparent.find(".suboptionMakenewdayauto").show();break;
        }
        objparent.find("input[name='suboptionMakenewtype[]']").val(specialform);
        setDefaultText();
        setDatepicker();
    }else{
        objparent.find("input[name='suboptionMakenewtype[]']").val('');
        objparent.find(".suboptionMakeSpecial").hide();
        objparent.find(".suboptionMakeSpecialsub").hide();
        objparent.find("select[name='suboptionMakeId[]'] option[value='direct']").attr("selected",true);
        //objparent.find(".suboptionMakelayout").show();
        return;
    }
}

//옵션 >> 옵션코드추가
function goodssuboptioncode(obj){
    obj.parent().parent().find(".goodssuboptionlay").hide();
    obj.parent().parent().find(".etcContents").show();
    obj.parent().parent().find(".suboptionMakeType").val('');
    var selectecttitle = obj.find("option:selected").val();
    if(  selectecttitle.substr(0,14) == 'goodssuboption'){
        obj.parent().parent().find(".suboptionMakeType").val(selectecttitle);
        obj.parent().parent().find(".goodssuboptionlay").show();
        obj.parent().parent().find(".goodssuboptionsublay").hide();
        obj.parent().parent().find(".etcContents").hide();
        obj.parent().parent().find("."+selectecttitle).show();
    }
}

/* 컬러피커 */
function colorpickerlay(){
    $(".colorpicker").customColorPicker();
}

function optReplace(str){
    var tmp = "";
    tmp = str.replace(/\"/gi, "");
    return tmp;
}

function calculrate_reserve(idx){
    var price			= $("input[name='subPrice[]']").eq(idx).val();
    var reserve_rate	= $("input[name='subReserveRate[]']").eq(idx).val();
    var reserve_unit	= $("select[name='subReserveUnit[]'] option:selected").eq(idx).val();
    if(!reserve_rate || typeof reserve_rate == "undefined") reserve_rate = 0;
    var reserve			= get_currency_price(reserve_rate,2);
    if	(reserve_unit == 'percent'){
        if(reserve_rate > 100){
            alert("지급할 마일리지는 100% 이하여야 합니다.");
            $('.subReserveRate_all').val();
            return false;
        }
        reserve			= get_currency_price(Math.floor(price * (reserve_rate * 0.01)),2);
    }
    $('.subReserve').eq(idx).html(reserve);
    $('.reserve-shop').eq(idx).html(reserve);

}

function setTmpSeq(){
    var tmp_frequently		= ($("input[name='frequently']:checked").length > 0) ? $("input[name='frequently']:checked").val() : 0;
    var subReservePolicy	= ($('select[name="subReservePolicy"]').val() == 'goods') ? 'goods' : 'shop';
    opener.setSubOptionTmp(scObj.tmp_seq, tmp_frequently, subReservePolicy);
    self.close();
}

function apply_suboption(){
    var suboptionTitle = $.trim($("input[name='suboptTitle[]']'").val());
    if(!suboptionTitle){
        alert('옵션명을 입력 해 주세요.');
        return false;
    }
    
    $("form[name='listFrm']").submit();
}


function chgSubReservePolicy() {
    if ($('select[name="subReservePolicy"]').val() == 'goods') {
        var disabledType	= false;
        $('.subReserve_all').show();
        $('.reserve-shop-lay').hide();
        $('.reserve-goods-lay').show();
    } else {
        var disabledType	= true;
        $('.subReserve_all').hide();
        $('.reserve-shop-lay').show();
        $('.reserve-goods-lay').hide();
    }
    
    $('.subReserveRate, .subReserveUnit, .subReserve').attr('disabled', disabledType)
}

//옵션관리
function delFreqOption(goods_seq, type, page, packageyn, popupID){
    if( !goods_seq || goods_seq <= 0 ){
        alert("상품 번호를 찾을 수 없습니다.");
        return false;
    }
    
    if( !type ){
        alert("타입을 찾을 수 없습니다.");
        return false;
    }

    $.ajax({
        'url' : '../goods_process/del_freq_option',
        'data' : {'goods_seq': goods_seq, 'type': type},
        'type' : 'post',
        'success' : function(res){
            if(res === false){
                alert("삭제 실패");
            } else {
                $(".delFreqOptionName_"+goods_seq).parent().parent().remove();
                if (type == "opt") {
                    $('select[name="frequentlytypeopt"] option[value="'+goods_seq+'"]').remove();
                } else if (type == "sub") {
                    $('select[name="frequentlytypesubopt"] option[value="'+goods_seq+'"]').remove();
                } else if (type == "inp") {
                    $('select[name="frequentlytypeinputopt"] option[value="'+goods_seq+'"]').remove();
                }
                
                frequentlypaging(page, type, packageyn, popupID);
                alert("삭제 성공");
            }
        }
    });
}

function frequentlypaging(page, type, packageyn, popupID){
    $.ajax({
        'url' : '../goods_process/get_freq_paging',
        'data' : {'page': page, 'type': type, 'packageyn': packageyn, 'popupID': popupID},
        'type' : 'post',
        'success' : function(res){
            var data = jQuery.parseJSON(res);
            var result = data.result;
            
            if(result.length > 0){
                $("#"+popupID+" table tbody").html('');
                
                $.each(result, function(key, item) {
                    var contents = '<tr>';
                    contents += '<td><span class="delFreqOptionName_'+item.goods_seq+'">'+item.goods_name+'</span></td>';
                    contents += '<td>';
                    contents += '<span class="btn small"><button type="button" class="delFreqOption" value="'+item.goods_seq+'" data-type="opt">삭제</button></span>';
                    contents += '</td>';
                    contents += '</tr>';
                    
                    $("#"+popupID+" table tbody").append(contents);
                });
            } else {
                $("#"+popupID+" table tbody").html('');
                $("#"+popupID+" table tbody").html('<tr> <td colspan="2">데이터 없음</td></tr>');
            }
            
            $("#"+popupID+" .paging_navigation").html(data.paging);
        }
    });
}
