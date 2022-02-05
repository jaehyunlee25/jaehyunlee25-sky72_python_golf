// $("#dateListId1").html(test(1, 2));
var now = new Date();
now.setHours(now.getHours() + 9); // set 'Asia/Seoul'

var addr = "/kr/reservation/real_step02_search_datelist.jsp?" +  now.valueOf();
// var param = $('#searchForm1').serialize();
var startDate = getToday(now);
var endDate = getToday(new Date(now.setMonth(now.getMonth() + 2)));
// var param = "fromDate=" + startDate + "&toDate=" + endDate;
var param = {fromDate: startDate, toDate: endDate};
var clubId = '22b9c7f6-60f5-11ec-a49a-0242ac11000b';
var courseName = {
	A: '913cc460-60f5-11ec-a49a-0242ac11000b', // '하늘코스',
	B: '913cc7f1-60f5-11ec-a49a-0242ac11000b', // '레이크코스',
	C: '913cc8a5-60f5-11ec-a49a-0242ac11000b', // '클래식코스',
	D: '913cc8e3-60f5-11ec-a49a-0242ac11000b', // '오션코스',
};
var OUTER_ADDR_HEADER = 'https://dev.mnemosyne.co.kr';
const addrOuter = OUTER_ADDR_HEADER + '/api/reservation/golfSchedule';
const header = { "Content-Type": "application/json" };
const golf_schedule = [];

// 15초마다 golf_status 정보를 불러온다.
// var timer = setInterval(() => {}, 15 * 1000);
ajax(addr, param, procStatusData);

function callDeatailData(options) {
	var lmt = options.length - 1;
	var cnt = 0;
	var callbackNumber = -1;

	var timer_detail = setInterval(() => {
		const addr = 'http://www.sky72.com/kr/reservation/real_step02.jsp';
		const option = options[cnt];		
		console.log("get data:", cnt + '/' + lmt, option.date);
		const param = {
			mode: '',
			resTabno: 1,
			weekgb: 'D',
			weekNo: '',
			wcrs: option.course,
			wdate: option.date,
			wtime: '',
			course2: option.course,
			flagcd2: 7,
			holecd: 2,
			daygb: 'D',
			isTCardDay: '',
			dateGap: 0,
			modalPass: 'N',
			eventGB2: '',
		};
		ajax(addr, param, (data) => {
			callbackNumber++;
			procStatusDetailData(callbackNumber===lmt, data, option, procGolfSchedule);
		});
		cnt ++;

		if (cnt > lmt)  clearInterval(timer_detail);
	}, 300);
};
function procGolfSchedule() {
	golf_schedule.forEach((obj) => {
		obj.golf_course_id = courseName[obj.golf_course_id];
		obj.date = obj.date.gh(4) + '-' + obj.date.ch(4).gh(2) + '-' + obj.date.gt(2);
	});
	console.log(golf_schedule);
	const param = { golf_schedule, golf_club_id: clubId };
	post(addrOuter, param, header, () => {});
};
function procStatusDetailData(opt, data, option, callback) {	

	const ifr = document.createElement('div');
	ifr.innerHTML = data;
	
	const tables = ifr.getElementsByClassName('timelistTable');
	Array.from(tables).forEach((table) => {
		procTable(table);
	});

	if(opt) callback();
	
	function procTable(table) {
		const trs = table.getElementsByTagName('tr');		
		Array.from(trs).forEach((tr) => {
			if (tr.getAttribute('eventdata') === null) return;
			procTr(tr);
		});
	};
	function procTr(tr) {
		const tds = tr.getElementsByTagName('td');
		golf_schedule.push({
			golf_club_id: clubId,
			golf_course_id: option.course,
			date: option.date,
			time: tds[1].innerText.replace(/\s/g,''),
			in_out: tds[2].innerText.replace(/\s/g,'').replace(/\(\)/,''),
			persons: tds[3].innerText.replace(/\s/g,'').replace(/\(\)/,''),
			fee_normal: tds[4].innerText.replace(/\s/g,'').replace(/,/,'') * 1,
			fee_discount: tds[5].innerText.replace(/\s/g,'').replace(/,/,'') * 1 || 0,
			others: '',
		});
	};
};
function procStatusData(data) {
	const ifr = document.createElement("div");
	ifr.innerHTML = data;
	var trs = Array.from(ifr.getElementsByTagName('tr'));
	
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

	// detail data 호출
	callDeatailData(options);
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
	/* $.ajax({
		url : addr,
		dataType : "html",
		data : param,
		success: callback,
		error: onError
	}); */
	get(addr, param, {}, callback);
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
function get(addr,param,header,callback){
	var a=new ajaxcallforgeneral(),
		str=[];
	for(var el in param){
		str.push(el+"="+param[el]);
	}
	str=str.join("&");
	a.jAjax(addr+"?"+str, header);
	a.ajaxcallback=callback;
};
function ajaxcallforgeneral(){
	this.xmlHttp;
	var j = this;
	var HTTP = {};
	var ADDR;
	var PARAM;
	var HEADER;
	this.jAjax=function(address, header){
		j.xmlHttp=new XMLHttpRequest();
		j.xmlHttp.onreadystatechange=on_ReadyStateChange;
		j.xmlHttp.onerror = onError;
		j.xmlHttp.open("GET", address, true);
    if(header){
      Object.keys(header).forEach(key=>{
        var val=header[key];
        j.xmlHttp.setRequestHeader(key,val);
      });
    }
		j.xmlHttp.send(null);		
	};
	this.post=function(addr,prm,header){

		dateListId1.innerHTML = "";
		
		j.xmlHttp=new XMLHttpRequest();
		j.xmlHttp.onreadystatechange=on_ReadyStateChange;
		j.xmlHttp.onerror = onError;
		j.xmlHttp.open("POST", addr, true);
		
		//header :: cors에 결정적
		//j.xmlHttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		if(header){
			if(header["Content-Type"])
			Object.keys(header).forEach(key=>{
				var val=header[key];
				j.xmlHttp.setRequestHeader(key,val);
			});
			else
			j.xmlHttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		}else{
			j.xmlHttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		}

		ADDR = addr;
		PARAM = prm;
		HEADER = JSON.stringify(header);

		//console.log(prm);
		j.xmlHttp.send(prm);
		
	};
	this.file=function(addr,prm){
		j.xmlHttp=new XMLHttpRequest();
		j.xmlHttp.onreadystatechange=on_ReadyStateChange;
		j.xmlHttp.open("POST", addr, true);
		j.xmlHttp.send(prm);
	};
	function onError() {
		/* dateListId1.innerHTML += "address :: " + ADDR + "\r\n";
		dateListId1.innerHTML += "header :: " + HEADER + "\r\n";
		dateListId1.innerHTML += "param :: " + PARAM + "\r\n"; */
	};
	function on_ReadyStateChange(){

		/* dateListId1.innerHTML += "<div>" + j.xmlHttp.readyState + " :: " + j.xmlHttp.status + "</div>\r\n"; */

		if(j.xmlHttp.readyState == 4){
			if(j.xmlHttp.status == 200){
				var data = j.xmlHttp.responseText;
				j.ajaxcallback(data);
			}else{
				dateListId1.innerHTML += "<div>" + j.xmlHttp.readyState + " :: " + j.xmlHttp.status + "</div>\r\n";
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
