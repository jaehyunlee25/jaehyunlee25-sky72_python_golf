// $("#dateListId1").html(test(1, 2));
var now = new Date();
now.setHours(now.getHours() + 9); // set 'Asia/Seoul'

var addr = "/kr/reservation/real_step02_search_datelist.jsp?" +  now.valueOf();
// var param = $('#searchForm1').serialize();
var startDate = getToday(now);
var endDate = getToday(new Date(now.setMonth(now.getMonth() + 1)));
var param = "fromDate=" + startDate + "&toDate=" + endDate;
var clubId = '22b9c7f6-60f5-11ec-a49a-0242ac11000b';
var courseName = {
	A: '하늘코스',
	B: '레이크코스',
	C: '클래식코스',
	D: '오션코스',
};
var OUTER_ADDR_HEADER = 'http://dev.mnemosyne.co.kr:1006';

// 15초마다 golf_status 정보를 불러온다.
// var timer = setInterval(() => {}, 15 * 1000);
ajax(addr, param, procStatusData);

// test 용
// ajax(addr, param, procStatusData);
// clearInterval(timer);
// test 용

function callDeatailData(options) {
	var lmt = options.length;
	var cnt = 0;

	var timer_detail = setInterval(() => {
		// dateListId1.innerHTML = "11";
		var addr = 'http://www.sky72.com/kr/reservation/real_step01_cal_ttime_total.jsp?';
		var option = options[cnt];
		console.log(cnt, lmt);
		console.log(option);
		var param = 'date=' + option.date + '&course=' + option.course + '&flagcd2=7&holecd=2&resTabno=1&wtime1=&gfee1=&weekgb1=&daykind=&tcnt=11';
		ajax(addr, param, (data) => {
			procStatusDetailData(data, option);
		});
		cnt ++;

		// test
		// if (cnt > 0) clearInterval(timer_detail);
		// test

		if (cnt > lmt - 1) {
			clearInterval(timer_detail);
			var addrOuter = OUTER_ADDR_HEADER + '/api/reservation/detailCircuitEnd';
			var header = { "Content-Type": "application/json" };
			var param = { golf_club_id: clubId };
			post(addrOuter, param, header, () => {});	
		}
	}, 300);
};
function procStatusDetailData(data, option) {
	$("#dateListId1").html(data);
	var trs = Array.from(dateListId1.getElementsByTagName('tr'));
	var res = [];
	var date = option.date.gh(4) + '-' + option.date.ch(4).gh(2) + '-' + option.date.gt(2);
	var course = courseName[option.course];
	trs.forEach((tr, i) => {
		if (i < 2) return;
		res.push({
			timeSlot: tr.children[0].innerHTML.replace(/\s/g, '').ct(2) + ":00:00",
			teams: tr.children[1].children[0].innerHTML.ct(1) * 1,
			greenFee: tr.children[2].innerHTML.replace(/,/g, '') * 1,
		});
	});

	var addrOuter = OUTER_ADDR_HEADER + '/api/reservation/newGolfStatusDetail';
	var header = { "Content-Type": "application/json" };
	var param = { 
		golf_club_id: clubId,
		date,
		course,
		data: res,
	};
	post(addrOuter, param, header, () => {});	
};
function procStatusData(data) {
	$("#dateListId1").html(data);
	var trs = Array.from(dateListId1.getElementsByTagName('tr'));
	var res = [];
	var options = [];
	trs.forEach((tr, i) => {
		if (i == 0) return;
		var date = procDate(tr.children[0].innerHTML);
		var arr = ['A', 'B', 'C', 'D'];
		
		arr.forEach((chr, i) => {
			var status = procStatus(tr.children[i + 1]);
			res.push({
				courseName: courseName[chr], 
				date: date, 
				status: status, 
				teams: procTeams(tr.children[i + 1])
			});
			if (status === '가능') 
				options.push({
					date: date.replace(/\//g, ''),
					course: chr,
				});
		});		
	});

	var addrOuter = OUTER_ADDR_HEADER + '/api/reservation/newGolfStatuses';
	//var addrOuter = 'http://jaehyunlee.co.kr:3000/api/reservation/newGolfStatuses';
	var header = { "Content-Type": "application/json" };
	var param = { golf_club_id: clubId, data: res };
	try {
		post(addrOuter, param, header, (ppp) => {
			dateListId1.innerHTML = ppp;
		});
	} catch(e) {
		dateListId1.innerHTML = e.toString();
	}
	/* var result = JSON.stringify(res);
	dateListId1.innerHTML = result; */

	// detail data 호출
	// callDeatailData(options);
};
function procDate(str) {
	return str.ct(3).replace(/\./g, '/');
};
function procTeams(el) {
	if (el.children.length == 0) return 0;
	return el.children[0].innerHTML.ct(1) * 1;
};
function procStatus(el) {
	if (el.children.length == 0) return el.innerHTML;
	return '가능';
};
function traverse(el, fnc) {
	fnc(el);
	var a=el.children.length;
	for(var i=0;i<a;i++){
		traverse(el.children[i],fnc);
	}
};
function onError(e) {

};
function post(addr,param,header,callback){
	var a=new ajaxcallforgeneral(),
		str=[];
	if(header["Content-Type"] == "application/json"){
		str=JSON.stringify(param);
	}else{
		for(var el in param) str.push(el+"="+encodeURIComponent(param[el]));
		str=str.join("&");		
	}
	a.post(addr,str,header);
	a.ajaxcallback=callback;
};
function ajax(addr, param, callback) {
	$.ajax({
		url : addr,
		dataType : "html",
		data : param,
		success: callback,
		error: onError
	});
};
String.prototype.gt=function(num){
	//get tail
	return this.substring(this.length-num,this.length);
};
String.prototype.gh=function(num){
	//get head
	return this.substring(0,num);
};
String.prototype.ct=function(num){
	//get tail
	return this.substring(0,this.length-num);
};
String.prototype.ch=function(num){
	//cut head
	return this.substring(num,this.length);
};
String.prototype.trav=function(fnc){
	for(var i=0;i<this.length;i++){
		fnc(this[i],i);
	}
};
Array.prototype.trav=function(fnc){
	for(var i=0,lng=this.length;i<lng;i++){
		var a=fnc(this[i],i);
		if(a) break;
	}
};
function ajaxcallforgeneral(){
	this.xmlHttp;
	var j = this;
	var HTTP = {};
	this.jAjax=function(address, header){
		j.xmlHttp=new XMLHttpRequest();
		j.xmlHttp.onreadystatechange=on_ReadyStateChange;
		j.xmlHttp.open("GET", address, true);
    if(header){
      Object.keys(header).trav(key=>{
        var val=header[key];
        j.xmlHttp.setRequestHeader(key,val);
      });
    }
		j.xmlHttp.send(null);		
	};
	this.post=function(addr,prm,header){
		j.xmlHttp=new XMLHttpRequest();
		j.xmlHttp.onreadystatechange=on_ReadyStateChange;
		j.xmlHttp.open("POST", addr, true);
		
		//header :: cors에 결정적
		//j.xmlHttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		if(header){
			if(header["Content-Type"])
				Object.keys(header).trav(key=>{
					var val=header[key];
					j.xmlHttp.setRequestHeader(key,val);
				});
			else
				j.xmlHttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		}else{
			j.xmlHttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		}
		//console.log(prm);
		j.xmlHttp.send(prm);
		
	};
	this.file=function(addr,prm){
		j.xmlHttp=new XMLHttpRequest();
		j.xmlHttp.onreadystatechange=on_ReadyStateChange;
		j.xmlHttp.open("POST", addr, true);
		j.xmlHttp.send(prm);
	};
	function on_ReadyStateChange(){
		if(j.xmlHttp.readyState==4){
			if(j.xmlHttp.status==200){
				var data = j.xmlHttp.responseText;
				j.ajaxcallback(data);
			}else{
			}
		}
	};
};
function getToday(date){
    var year = date.getFullYear();
    var month = ("0" + (1 + date.getMonth())).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);

    return year + "%2F" + month + "%2F" + day;
}
