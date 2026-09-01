/**
 * 관리자-설정-택배사-굿스플로 입점사 설정에서 사용하는 스크립트
 * @author Sunha Ryu
 */
(function() {
  /**
   * forEach for IE
   */
  if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = 
      function (fn, scope) {
        for (var i = 0, len = this.length; i < len; ++i) {
          fn.call(scope || this, this[i], i, this);
        }
      };
  }
  
  /**
   * 굿스플로 사용/미사용 입점사 데이터
   */
  var goodsflowProviderData = {use:null, notUse:null};
  
  var _initialize = false;
  
  /**
   * 입점사 선택 버튼을 클릭하면 입점사 굿스플로 사용 설정 레이어가 노출된다.
   */
  $("#goodsflowProviderBtn").click(function() {
    if( typeof openDialog === 'function' ) {
      openDialog("입점사 굿스플로 사용 설정", "goodsflowProviderLayer", {"width":"800","height":"600"});
      if(_initialize === false) {
        getProviderList();
        _initialize = true;
      }
    } else {
      console.log("openDialog is not a funciton.");
    }
  });
  
  /**
   * 전체 선택을 체크하면 모든 입점사가 선택된다.
   */
  $(document).on('click', '#goodsflowProviderForm .allCheckBtn', function(e) {
    var obj = $(this);
    var flag = obj.is(":checked");
    obj.closest('table').find("input[name='chk[]']").each(function() {
      $(this).attr("checked", flag);
    });
  });
  
  /**
   * 입점사 검색 버튼을 클릭하면 입점사 목록을 반환하는 함수를 호출한다.
   */
  $(document).on('click', "#goodsflowProviderForm .providerSelect button[name=providerCountSelect]", function(e) {
    getProviderList();
  });
  
  /**
   * 입점사 검색 란에 엔터키를 누르면 입점사 목록을 반환하는 함수를 호출한다.
   */
  $(document).on('keypress', "#goodsflowProviderForm .providerSelect input[name=provider_name]", function(e) {
    var keycode = (e.keyCode ? e.keyCode : e.which);
    if(keycode === 13) {
      getProviderList();
    }
  });
  
  /**
   * ▶ 오른쪽 이동 버튼을 클릭했을 때 왼쪽 체크한 행을 오른쪽으로 이동한다.
   */
  $(document).on('click', '#goodsflowProviderForm .providerList button[name=providerSetPeriod]', function(e) {
    var $elements = $("#goodsflowProviderForm .providerOriginalList input[name='chk[]']:checked");
    if( $elements.length > 0 ) {
      $elements.each(function() {
        var seq = $(this).val();
        goodsflowProviderData.use[seq] = goodsflowProviderData.notUse[seq];
        delete goodsflowProviderData.notUse[seq];
      });
      setTables();
    } else {
      alertMessage('처리된 내역이 없습니다.');
    }
    
    // 체크박스 체크 해제
    $("#goodsflowProviderForm input[type='checkbox']").each(function() {
      $(this).prop("checked", false);
    });
  });
  
  /**
   * 삭제 버튼을 클릭했을 때 오른쪽 체크한 행을 삭제한다.
   */
  $(document).on('click', '#goodsflowProviderForm .providerList button[name=delProvider]', function(e) {
    var $elements = $("#goodsflowProviderForm .providerSetListTable input[name='chk[]']:checked");
    if( $elements.length > 0 ) {
      $elements.each(function() {
        var seq = $(this).val();
        goodsflowProviderData.notUse[seq] = goodsflowProviderData.use[seq];
        delete goodsflowProviderData.use[seq];
      });
      setTables();
    } else {
      alertMessage('처리된 내역이 없습니다.');
    }
    
    // 체크박스 체크 해제
    $("#goodsflowProviderForm input[type='checkbox']").each(function() {
      $(this).prop("checked", false);
    });
  });
  
  /**
   * 저장 버튼을 눌렀을 때 데이터를 임시 저장한다.
   */
  $(document).on('click', '#goodsflowProviderForm button[name=periodSetSave]', function(e) {
    var jsonText = JSON.stringify(goodsflowProviderData);
    // unicode escape
    jsonText = jsonText.replace(/[\u007f-\uffff]/g, function(c) {
      return '\\u'+('0000'+c.charCodeAt(0).toString(16)).slice(-4);
    });
    var input = document.getElementById('goodsflowProviderJson');
    if(input === null) {
      var input = document.createElement('input');
      input.setAttribute("type", "hidden");
      input.setAttribute("id", "goodsflowProviderJson");
      input.setAttribute("name", "goodsflowProviderJson");
    }
    input.value = jsonText;
    $("#goodsflow_use_area").append(input);
  
    var cnt = typeof Object.keys(goodsflowProviderData.use).length === 'number' ? Object.keys(goodsflowProviderData.use).length : 0;
    alertMessage("입점사 " + cnt + "개를 선택하셨습니다."+ "<BR>" + "입점사 이용 여부 알림창에서 저장 완료하셔야 사용여부가 변경됩니다.", 450, 180, function() {
      closeDialog('goodsflowProviderLayer');
    });
  });
  
  /**
   * 알림 팝업을 노출한다.
   */
  function alertMessage(msg, width, height, func) {
    if(typeof openDialogAlert === 'function' && false) {
      if(typeof func === 'function') {
        openDialogAlert(msg,typeof width === 'number' ? width: 400,typeof height === 'number' ? height: 155, func);
      } else {
        openDialogAlert(msg,typeof width === 'number' ? width: 400,typeof height === 'number' ? height: 155);
      }
    } else {
      msg = msg.replace("<BR>", '\n');
      msg = msg.replace("<br>", '\n');
      alert(msg);
      if(typeof func === 'function') {
        func();
      }
    }
  }
  
  /**
   * 입점사 목록을 반환한다.
   */
  function getProviderList() {
    $("#goodsflowProviderLayer .providerOriginalListTable tbody").html('');
    $("#goodsflowProviderLayer .providerSetListTable tbody").html('');
    
    var settings = {
      "url": "/admin/setting_process/goodsflow_provider",
      "method": "GET"
    };

    var providerName = $("#goodsflowProviderForm input[name=provider_name]").val();
    if(typeof providerName === 'string' && typeof providerName.length === 'number' && providerName.length > 0) {
      settings.url += "/" + encodeURI(providerName);
    }
    
    
    $.ajax(settings).done(function (response) {
      if(response.success === true) {
        if( typeof response.data === 'object' ) {
          goodsflowProviderData.notUse = convertObj(response.data.notUse);
          goodsflowProviderData.use = convertObj(response.data.use);
          setTables();
        }
      }else {
        alert('입점사 목록을 가져오지 못했습니다.');
      }
    }).fail(function () {
      alert('입점사 목록을 가져오지 못했습니다.');
    });
  }
  
  /**
   * provider_seq를 키값으로 하는 객체로 반환한다.
   * @param data
   * @returns
   */
  function convertObj(data) {
    var obj = {};
    data.forEach(function(elem) {
      obj[elem.seq] = elem;
    });
    return obj;
  }
  
  /**
   * 굿스플로 사용 입점사 테이블/미사용 입점사 테이블의 데이터를 세팅한다.
   */
  function setTables() {
    $("#goodsflowProviderLayer .providerOriginalListTable tbody").html('');
    appendRows("#goodsflowProviderLayer .providerOriginalListTable tbody", goodsflowProviderData.notUse);
    $("#goodsflowProviderLayer .providerSetListTable tbody").html('');
    appendRows("#goodsflowProviderLayer .providerSetListTable tbody", goodsflowProviderData.use);
  }
  
  /**
   * 입점사 목록 table 엘리먼트에 요소를 추가한다.
   * @param selector
   * @param data
   */
  function appendRows(selector, data) {
    var html = "";
    var cnt = typeof Object.keys(data).length === 'number' ? Object.keys(data).length : 0;
    if(cnt > 0) {
      for(var i in data) {
        html += "<tr>"
          +"<td class=\"center\"><label class=\"resp_checkbox\"><input type=\"checkbox\" name=\"chk[]\" value='"+data[i].seq+"' /></label></td>"
          +"<td class=\"left\"><span name=\"orgprovidername\">"+data[i].name+" ("+data[i].id+")"+"</td>"
          +"</tr>";
      }
    }
    $(selector).append(html);
    $(selector).closest('li').find(".providerCount").html(cnt);
  }
})();