	/* 출고예약량 업데이트 */
	function reservation_update(){
		openDialogAlert("상품의 출고예약량 업데이트중입니다.<br/>브라우저 창을 닫지 마시고<br>잠시만 기다려 주십시오.",400,250,function(){},{"hideButton":true, "noClose" : true,"modal":true});
		$.ajax({
			url : '../goods_process/all_modify_reservation',
			global : false,
			success : function(data){if(data == 'OK'){
				closeDialog('openDialogLayer');
				openDialogAlert("상품의 출고예약량이 정상적으로 업데이트 되었습니다.",400,210,function(){},{"hideButton" : false});
			}}
		});
	}
	/* SMS 갯수 호출 */
	function get_sms_info(){
		var areaSmsObj = $(".servicetxt_sms");
		$.ajax({
			'url' : 'get_sms_info',
			'data' : {},
			'dataType' : 'json',
			'global' : false,
			'success' : function(result){
				areaSmsObj.html(result.txt_cnt);
				areaSmsObj.closest("dl").find(".link").append("<span class='charge'>충전</span>");
			}
		});
	}
	/* 카카오알림톡 갯수 호출 */
	function get_kakao_info(){
		var areaKkoObj = $(".servicetxt_kko");
		var quantity = 0;
		$.ajax({
			'url' : 'get_kt_info',
			'data' : {},
			'dataType' : 'json',
			'global' : false,
			'success' : function(result){
				if(result != null){					
					if(result.serviceInfo != null) quantity = result.serviceInfo.kt_quantity;
				}
			}
		}).done(function(){
			areaKkoObj.html(quantity);
			areaKkoObj.closest("dl").find(".link").append("<span class='charge'>충전</span>");
		});
	}
	/* 주요 이슈사항 공지 호출 */
	function get_notify_info(){
		$.ajax({
			'url' : 'get_notify_info',
			'dataType' : 'json',
			'global' : false,
			'success' : function(result){
				if(result.html){
					$("#notify_popup").html(result.html);
					openDialog('알려드립니다!','notify_popup',{"width":570});
				}
			}
		});
	}
	/* 대표자 개인정보 수집 및 실명인증 확인 */
	function mall_auth_alert(){
		openDialogAlert("<div class='left'>퍼스트몰은 전자상거래법 제 9조 3항 및 제 11조 2항에 의거<br /> ‘호스팅 사업자의 신원확인의무’에 의해 개인 정보를 수집할 의무가 있습니다.<br />공정한 거래와 안전한 온라인 서비스 제공을 위해 쇼핑몰 대표자의<br /> 개인정보를 실명인증을 통해 수집합니다.<br /><b><font color='#d00000'>[기본사양관리 > 쇼핑몰관리자정보]</font></b>에서 인증절차를 진행 해 주시기 바랍니다.</div><div class='pdt10'><span class='btn large black'><a href='http://www.firstmall.kr/myshop/spec/manager_information.php?num="+gl_shopSno+"'>관리자 실명인증 확인하기</a></span></div>",530,330,function(){},{"hideButton" : true});
	}
	/* 트래픽 용량 데이터 추출 */
	function reload_data(type,temp_domain){
		$.ajax({
			'url' : '/admin/main/re_traffic_data',
			'data' : {'domain':temp_domain},
			'global' : false,
			'success' : function(html){
				var info = html.split("|");
				if(type == 'main')	$('#traffic_area').show();
				else				$('#traffic_area').hide('blind').show('blind');

				if(info[0] == 'CLOUD' ) {
					$('#traffic_area').html("무제한");
					$('#traffic_area').closest("dd").find("a").hide();
				}else if(info[0] == 'OUTSIDE' ) {
					$('#traffic_area').html("없음");
					$('#traffic_area').closest("dd").find("a").hide();
				}else if(info[0] != 'FR' ){
					$('#traffic_area').html(info[1] + " / " + info[0] + "(" + info[2] + "% 사용중)");
				}
			}
		});
	}
	/* 관리자 비밀번호 변경 */
	function change_pass(required) {
		var gdata = {'required':required};
		$.ajax({
			type: "get",
			url: "popup_change_pass",
			data: gdata,
			async:false,
			success: function(result){
				$("#popup_change_pass").html(result);
			}
		});
		if(required){
			var params = {"width":700,"noClose":true};
		}else{
			var params = {"width":700};
		}
		openDialog("쇼핑몰 관리자 계정 비밀번호 변경 안내", "popup_change_pass", params);
	}
	/* 주문처리 */
	function print_main_order_summary()
	{
		$("#order_summary").html('');
		$.ajax({
			url				: '../main/ajax_main_order_summary',
			globa			: false,
			dataType	: 'json',
			success 		: function(result){
				var data = '';
				for(var index in result)
				{
					if (result.hasOwnProperty(index))
					{
						data = result[index];
						$("#order_summary").append("<dl class='hand' onclick='location.href=\""+data.link+"\"'><dt>"+data.name+"</dt><dd>"+data.count+"개</dd></dl>");
					}
				}
			}
		});
	}

	/**/
	function print_main_news_area(channel)
	{
		var obj	= $("ul#print_main_news_notice_area");
		if( channel == 'upgrade' )				obj	= $("ul#print_main_news_upgrade_area");
		if( channel == 'upgrade_news' )		obj	= $("ul#print_main_news_upgrade_news_area");
		if( channel == 'education' )			obj	= $("ul#print_main_news_education_area");

		$("ul#print_main_news_notice_area").html('');
		$.ajax({
			type			: 'POST',
			url				: '../main/json_main_news_area',
			data			: 'channel='+channel,
			globa			: false,
			dataType	: 'json',
			success 		: function(result){
				var data = '';
				
				for(var index in result)
				{
					if (result.hasOwnProperty(index))
					{
						data = result[index];						
						if( channel == 'education' )
						{
							obj.append("<li><a href=\""+data.link.value+"\" target='_blank' title='새창열림'>"+data.title.value+"</a><span class=\""+data.pubDateStatus+"\">"+data.pubDateStatusMsg+"</span></li>");
						}
						else
						{
							obj.append("<li><a href=\""+data.link.value+"\" target='_blank' title='새창열림'>"+data.title.value+"</a><span class=\"date\">"+data.pubDate.value+"</span></li>");
						}
					}
				}
				if(document.body.createTextRange) {
					/* Internet Explorer 렌더러 버그로 출력이 정상적으로 되지 않는 이슈 해결용 */
					obj.css('opacity', '1');
				}
			}
		});
	}

	function delete_main_stat()
	{
		$.ajax({
			url				: 'main_stats_cach_delete',
			dataType	: 'json',
			success 		: function(data)
			{
				if( data.result =='OK' ) return true;
			}
		});
	}

	function print_main_stat()
	{
		$.ajax({
			url				: 'json_main_stats',
			dataType	: 'json',
			success 		: function(result){
				var tags			= '';
				var url 			= '';
				var data			= [];
				var obj			= [];
				var tmp			= [];
				var num			= 0;
				var len			= 0;
				var exist_data		= 0;
				var display_id	= 'rank_order';
				if	(!result) return;
				$(".rank_priod").html('('+result.sDate+'~'+result.eDate+')');
				if (result.main_auth.goods_view == true)
				{
					if( result.rank )
					{
						$.each(result.rank, function(mode, tmp){
							display_id	= 'rank_'+mode;
							obj			= $('div#'+display_id);
							num			= 0;
							len			= 0;
							exist_data		= false;
							if( tmp )
							{
								$.each(tmp, function(index, data){
									if (data.goods_name && !exist_data) exist_data = true;
								});
								if(exist_data) obj.html('');
								$.each(tmp, function(index, data){
									if(mode =='provider'){
										url = '../statistic_sales/sales_seller?sdate='+gl_9ago+'&edate='+gl_today+'&sitetype%5B%5D=P&sitetype%5B%5D=M&sitetype%5B%5D=F';
									}else{
										url = '../../goods/view?no='+data.goods_seq;
									}
									if (data.goods_name){
										num	+= 1;
										tags	= '<ul class="hand" onclick="window.open(\''+url+'\');">';
										tags	+= '<li class="num">'+num+'</li>';
										if( typeof(data.tot_price) == "undefined" ){
											tags	+= '<li class="tit">'+data.goods_name+'</li>';
											/* tags	+= '<li class="cnt">'+data.tot_ea+'회</li>'; */
										}else{
											tags	+= '<li class="tit">'+data.goods_name+'</li>';
											/* if(typeof(data.tot_ea) != "undefined") tags	+= '<li class="cnt">'+data.tot_ea+'개</li>'; */
											if(typeof(data.tot_price) != "undefined") tags	+= '<li class="price">'+data.tot_price+'</li>';
										}
										tags	+= "</ul>";
										obj.append(tags);
									}
								});
							}
						});
					}
				} else {
					$('div#rank_order').addClass('no-permission');
					$('div#rank_order').find('.nodata2').show();
					$('div#rank_order').find('.nodata').hide();
				}

				var chart_data 	= [];
				var chart_type 	= 'line';
				var chart_id 		= 'chart1';
				var max_data 		= 0;
				var label			= [{'label':'매출'}];
				if (result.main_auth.statistic_sales == true)
				{
					if( result.day_stat )
					{
						$.each(result.day_stat, function(index, data){
							data.tot_price = parseFloat(data.tot_price);
							chart_data.push([index.substring(8,10)+'일', Number(data.tot_price)]);
							if( max_data < data.tot_price ) max_data = data.tot_price;
						});
						createChart(chart_type, chart_id, max_data, [chart_data], label, false);
					}
				} else {
					$('div#' + chart_id).addClass('no-permission');
					$('div#' + chart_id).find('.nodata2').html('보기 권한이 없습니다.');
				}

				/*그래프 데이터에서 숫자형은 꼭 Number() 처리를 해주어야 한다.*/
				chart_data 	= [];
				chart_type 	= 'round';
				chart_id 		= 'chart2';
				max_data 	= 0;
				label			= [{'label':'가입'}];
				if (result.main_auth.statistic_member == true)
				{
					if( result.day_stat_member )
					{
						$.each(result.day_stat_member, function(index, data){
							chart_data.push([data.referer_group_name+' '+data.referer_domain, Number(data.cnt)]);
							if( max_data < data.cnt ) max_data = data.cnt;

						});
						$("div#chart2").css("width","300");
						createChart(chart_type, chart_id, max_data, [chart_data], label, false);
					}
				} else {
					$('div#' + chart_id).addClass('no-permission');
					$('div#' + chart_id).find('.nodata2').html('보기 권한이 없습니다.');
				}

				chart_data 	= [];
				chart_type 	= 'line';
				chart_id 		= 'chart3';
				max_data 	= 0;
				label			= [{'label':'방문'}];
				if (result.main_auth.statistic_visitor == true)
				{
					if( result.day_stat_visit )
					{
						$.each(result.day_stat_visit, function(k, data){
							data.cnt = parseFloat(data.cnt);
							chart_data.push([data.stats_date.substring(8,10)+'일', Number(data.cnt)]);
							if( max_data < data.cnt ) max_data = data.cnt;
						});
						createChart(chart_type, chart_id, max_data, [chart_data], label, false);
					}
				} else {
					$('div#' + chart_id).addClass('no-permission');
					$('div#' + chart_id).find('.nodata2').html('보기 권한이 없습니다.');
				}


				chart_data 	= [];
				chart_type 	= 'round';
				chart_id 		= 'chart4';
				max_data 	= 0;
				label	= [{'label':'유입경로'}];
				if (result.main_auth.statistic_visitor == true)
				{
					if( result.day_stat_referer )
					{
						$.each(result.day_stat_referer, function(k, data){
							data.cnt = parseFloat(data.cnt);
							chart_data.push([data.referer_group_name+' '+data.referer_domain, Number(data.cnt)]);
							if( max_data < data.cnt ) max_data = data.cnt;
						});
						$("div#chart4").css("width","300");
						createChart(chart_type, chart_id, max_data, [chart_data], label, false);
					}
				} else {
					$('div#' + chart_id).addClass('no-permission');
					$('div#' + chart_id).find('.nodata2').html('보기 권한이 없습니다.');
				}

				if( result.count_summary )
				{
					if (result.main_auth.order_view == true) {
						$("#today_order_count").html(comma(result.count_summary.today.order_cnt));
						$("#today_deposit_count").html(comma(result.count_summary.today.total_cnt));
						$("#today_deposit_price").html(comma(result.count_summary.today.total_price));
					} else {
						$("#today_order_count").addClass('text-gray');
						$("#today_deposit_count").addClass('text-gray');
						$("#today_deposit_price").addClass('text-gray');
						$("#today_order_count").html('***');
						$("#today_deposit_count").html('***');
						$("#today_deposit_price").html('***');
					}
					if (result.main_auth.refund_view == true) {
						$("#today_return_count").html(comma(result.count_summary.today.return_cnt));
						$("#today_refund_count").html(comma(result.count_summary.today.refund_cnt));
					} else {
						$("#today_return_count").addClass('text-gray');
						$("#today_refund_count").addClass('text-gray');
						$("#today_return_count").html('***');
						$("#today_refund_count").html('***');
					}
				}

				// 주문처리 (최근 100일)
				if( result.order_summary )
				{
					$("#order_summary").html('');
					$.each(result.order_summary, function(k, data){
						let chk_auth = false;
						if (data.name == '반품신청' || data.name == '환불신청') {
							if (result.main_auth.refund_view == true) {
								chk_auth = true;
							}
						} else {
							if (result.main_auth.order_view == true) {
								chk_auth = true;
							}
						}

						if (chk_auth == true) {
							$("#order_summary").append("<li ><a href=\"" + data.link + "\"><div>"+data.name+"</div><strong>"+data.count+"</strong></a></li>");
						} else {
							$("#order_summary").append("<li ><a><div>"+data.name+"</div><strong class='text-gray'>***</strong></a></li>");
						}
					});
				}

				tags = '';
				if( result.goods_summary )
				{
					$("#goods_summary").find("dl").remove();
					$.each(result.goods_summary, function(k, data){
						tags = '';
						tags += "<dl>";
						tags += "<dt>";
						if( k == 'safe_stock') tags += "<a href=\""+data.goods.link+"\">안전재고 미만</a>";
						if( k == 'normal')		tags += "<a href=\""+data.goods.link+"\">판매중</a>";
						if( k == 'runout')		tags += "<a href=\""+data.goods.link+"\">품절/재고확보</a>";
						if( k == 'unsold')		tags += "<a href=\""+data.goods.link+"\">판매중지</a>";
						tags += "</dt>";
						if (result.main_auth.goods_view == true) {
							tags += "<dd class='goods' onclick=\"location.href='"+data.goods.link+"';\">"+data.goods.count+"</dd>";
							tags += "<dd class='package' onclick=\"location.href='"+data.package.link+"';\">"+data.package.count+"</dd>";
							tags += "<dd class='coupon' onclick=\"location.href='"+data.coupon.link+"';\">"+data.coupon.count+"</dd>";
						} else {
							tags += "<dd class='goods text-gray'>***</dd>";
							tags += "<dd class='package text-gray'>***</dd>";
							tags += "<dd class='coupon text-gray'>***</dd>";
						}
						tags += "</dl>";
						$("#goods_summary").append(tags);
					});
				}

				if( result.board_summary )
				{
					$("#board_summary").find("dl").remove();
					$.each(result.board_summary, function(k, data){
						tags = '';
						tags += "<dl class='hand' onclick=\"location.href='"+data.link+"';\">";
						tags += "<dt>"+data.name+"</dt>";
						if (result.main_auth[data.bdid] == true) {
							tags += "<dd>"+data.count+"</dd>";
						} else {
							tags += "<dd class='text-gray'>***</dd>";
						}
						tags += "</dl>";
						$("#board_summary").append(tags);
					});

					if( !gl_H_AD )
					{
						tags = '';
						tags += "<dl>";
						tags += "<dt>&nbsp;</dt>";
						tags += "<dd>&nbsp;</dd>";
						tags += "</dl>";
						$("#board_summary").append(tags);
					}
				}

				if( result.scm_summary && gl_H_SC )
				{
					$("#scm_summary").find("dl").remove();
					$.each(result.scm_summary, function(k, data){
						tags = '';
						tags += "<dl class='hand' onclick=\"location.href='"+data.link+"';\">";
						tags += "<dt>"+data.name+"</dt>";
						if (result.main_auth[data.tid] == true) {
							tags += "<dd>"+data.count+"</dd>";
						} else {
							tags += "<dd class='text-gray'>***</dd>";
						}
						tags += "</dl>";
						$("#scm_summary").append(tags);
					});
				}
			}
		});
	}

	//Chart
	function createChart(chart_type, chart_id, maxValue, data, labelData, show_status)
	{
		$("#"+chart_id).html('');

		if	(chart_type == 'round'){
			var animate		= {};
			var stackSeries	= false;
			var defaults		= {renderer: jQuery.jqplot.PieRenderer,rendererOptions: {showDataLabels: true,dataLabels: 'percent'}};
			var legend			= {show: true,placement: 'outside'};
			var grid				= {background: 'transparent',borderWidth: 0,shadow: false}
			var series			= labelData;
		}else{
			var maxValue	= maxValue;
			var gap 			= parseInt(maxValue.toString().substring(0,1)) < 2 ? Math.pow(10,maxValue.toString().length-2) : Math.pow(10,maxValue.toString().length-1);
			var yaxisMax	= parseInt(maxValue.toString().substring(0,1)) < 2 ? gap * (parseInt(maxValue.toString().substring(0,2))+2) : gap * (parseInt(maxValue.toString().substring(0,1))+2);
			yaxisMax 		= yaxisMax > 100 ? yaxisMax : 100;

			if	(chart_type == 'stick'){
				var animate		= !$.jqplot.use_excanvas;
				var stackSeries	= false;
				var defaults		= { renderer:$.jqplot.BarRenderer, rendererOptions: {barMargin: 15,highlightMouseDown: true}, pointLabels: {show: true},showMarker:true};
				var legend			= {show: show_status,placement: 'outside'};
				var axes				= {xaxis: {renderer: $.jqplot.CategoryAxisRenderer},yaxis: {adMin: 0}};
				var series			= labelData;
				var grid				= {drawGridLines: true,gridLineColor: '#dddddd',background: '#fffdf6',borderWidth: 0,shadow: false};
			}else{
				var animate		= {};
				var stackSeries	= false;
				var defaults		= { showMarker:true, pointLabels: { show:true }};
				var legend			= {show:show_status, xoffset: 15,yoffset: 15,placement: 'outside'};
				var axes				= {xaxis: {renderer: $.jqplot.CategoryAxisRenderer},yaxis: {min: 0,max: yaxisMax,numberTicks: 11}};
				var series			= labelData;
				var grid				= {drawGridLines: true,gridLineColor: '#dddddd',background: '#fffdf6',borderWidth: 0,shadow: false};
			}
		}

		if(chart_id != '' && data != ''){
			var plot = $.jqplot(chart_id, data, {
				height:230,
				animate: animate,
				stackSeries: stackSeries,
				seriesDefaults: defaults,
				seriesColors:["#B490F5","#31C0E1","#F45B93","#EEC472","#A198C1","#61BFE1","#EFA0B4","#97B559","#F1593C","#00A6BD","#EF9FB4","#97B559","#0085cc","#c3b8f3","#EA28A2","#8566cc"],
				series: series,
				legend: legend,
				axes: axes,
				grid:grid
			});
		}
	}