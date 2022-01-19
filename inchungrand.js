
const clubId = '4c6747cf-774f-11ec-b15c-0242ac110005';
const courses = { IN: 'IN 코스', OUT: 'OUT 코스'};
const OUTER_ADDR_HEADER = 'https://dev.mnemosyne.co.kr';
const header = { "Content-Type": "application/json" };

const now = new Date();
const thisyear = now.getFullYear() + "";
const thismonth = ("0" + (1 + now.getMonth())).slice(-2);
const thisdate = thisyear + thismonth;

now.setMonth(now.getMonth() + 1);
const nextyear = now.getFullYear() + "";
const nextmonth = ("0" + (1 + now.getMonth())).slice(-2);
const nextdate = nextyear + nextmonth;

console.log(thisdate, nextdate);
const dates = [];
const result = [];

mneCall(thisdate, () => {
    mneCall(nextdate, procDate);
});

function procResultDataDetail(str) {
	const data = JSON.parse(str);
	if (data.resultCode !== 200) return;
	const result = [];
	dates.forEach(([date, teams, obTeams]) => {
		// for IN
		if (Object.keys(obTeams.IN).length > 0) {
			const objIN = {
				golf_club_id: clubId,
				date,
				course: courses.IN,
				data: []
			};
			Object.keys(obTeams.IN).forEach((timeSlot, j) => {
				const arr = obTeams.IN[timeSlot];
				objIN.data.push({
					timeSlot: timeSlot + ":00",
					greenFee: arr[0].greenfee,
					teams: arr.length,
				});
			});
			result.push(objIN);
		}

		// for OUT
		if (Object.keys(obTeams.OUT).length > 0) {
			const objOut = {
				golf_club_id: clubId,
				date,
				course: courses.OUT,
				data: []
			};
			Object.keys(obTeams.OUT).forEach((timeSlot, j) => {
				const arr = obTeams.OUT[timeSlot];
				objOut.data.push({
					timeSlot: timeSlot + ":00:00",
					greenFee: arr[0].greenfee,
					teams: arr.length,
				});
			});
			result.push(objOut);
		}
	});
	
	const lmt = result.length - 1;
	let cnt = 0;
	const timer = setInterval(() => {
		const addrOuter = OUTER_ADDR_HEADER + '/api/reservation/newGolfStatusDetail';
		const param = result[cnt];
		post(addrOuter, param, header, () => {});
		cnt++;
		if (cnt > lmt) {
			clearInterval(timer);
			setTimeout(() => {
				const addrOuter = OUTER_ADDR_HEADER + '/api/reservation/detailCircuitEnd';
				post(addrOuter, { golf_club_id: clubId }, header, () => {});
			}, 1000);
		}
	}, 300);
};
function procResultData(date, obTeams, opt) {
	const ar = dates.find((arr) => arr[0] == date);
	ar.push(obTeams);
	if (!opt) return; 
	
	dates.forEach(([dt, num, ob]) => {
		if (ob === undefined) return;
		// IN
		const inNum = getSum(ob.IN);
		if (inNum > 0) result.push({
			courseName: courses.IN,
			date: dt,
			status: '가능',
			teams: inNum
		});
		// OUT
		const outNum = getSum(ob.OUT);
		if (outNum > 0) result.push({
			courseName: courses.OUT,
			date: dt,
			status: '가능',
			teams: outNum
		});
	});

	var addrOuter = OUTER_ADDR_HEADER + '/api/reservation/newGolfStatuses';
	// var addrOuter = 'http://jaehyunlee.co.kr:3000/api/reservation/newGolfStatuses';
	var param = { golf_club_id: clubId, data: result };
	post(addrOuter, param, header, procResultDataDetail);
};
function getSum (ob) {
	let res = 0;
	Object.keys(ob).forEach((key) => {
		res += ob[key].length;
	});
	return res;
};
function procDate() {
	const lmt = dates.length - 1; 
	let cnt = 0;
	const timer = setInterval(() => {
		console.log(cnt);
		const [date, ] = dates[cnt];
		mneCallDetail(cnt === lmt, date, procResultData);
		cnt++;
		// if(cnt > 0) clearInterval(timer);
		if(cnt > lmt) clearInterval(timer);
	}, 300);	
};
function mneCallDetail(opt, date, callback) {
	const param = {
		golfrestype: 'real',
		courseid: 0, // maybe 0: 전체, 1: IN, 2: OUT
		usrmemcd: 10,
		pointdate: date,
		openyn: 1,
		dategbn: 6,
		choice_time: '00',
		cssncourseum: '',
		inputtype: 1
	};
	post('real_timelist_ajax_list.asp', param, {}, data => {		
        const ifr = document.createElement('div');
        ifr.innerHTML = data;
        
        const as = ifr.getElementsByTagName('a');
		const obTeams = {};
		Array.from(as).forEach((a) => {			
			const ob = procHrefDetail(a.href);
			if (!ob) return;
			const { course, time, greenfee } = ob;
			const slot = time.gh(2);
			if(!obTeams[course]) obTeams[course] = {};
			if(!obTeams[course][slot]) obTeams[course][slot] = [];
			obTeams[course][slot].push({
				time,
				greenfee
			});
		});
		callback(date, obTeams, opt);
    });
};
function mneCall(date, callback) {
	const param = {
		golfrestype: 'real',
		schDate: date,
		usrmemcd: 10,
		toDay: date + '01',
		calnum: 2
	};
    post('real_calendar_ajax_view.asp', param, {}, data => {   
		console.log(data);
		const ifr = document.createElement('div');
        ifr.innerHTML = data;

		const as = ifr.getElementsByTagName('a');
		Array.from(as).forEach((a) => {			
			const ob = procHref(a.href);
			if (!ob) return;
			if (ob.type !== 'T') return;
			dates.push([ob.date, 0]);
		});
		callback();
    });
};
function procHrefDetail(str) {
	const head = str.indexOf('subcmd');
	if(head === -1) return false;
	const regex = /\((.+)\)/;
	const values = regex.exec(str)[1].replace(/'/g,'').split(',');
	return {time: addColon(values[2]), course: values[3], greenfee: values[8]};
};
function addColon(str) {
	return str.gh(2) + ":" + str.gt(2);
};
function procHref(str) {
	const head = str.indexOf('timefrom_change');
	if(head === -1) return false;
	const regex = /\((.+)\)/;
	const values = regex.exec(str)[1].replace(/'/g,'').split(',');
	return {date: values[0], type: values[5]};
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
      Object.keys(header).trav(key=>{
        var val=header[key];
        j.xmlHttp.setRequestHeader(key,val);
      });
    }
		j.xmlHttp.send(null);		
	};
	this.post=function(addr,prm,header){

		// dateListId1.innerHTML = "";
		
		j.xmlHttp=new XMLHttpRequest();
		j.xmlHttp.onreadystatechange=on_ReadyStateChange;
		j.xmlHttp.onerror = onError;
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
				// dateListId1.innerHTML += "<div>" + j.xmlHttp.readyState + " :: " + j.xmlHttp.status + "</div>\r\n";
			}
		}
	};
};
Array.prototype.trav=function(fnc){
	for(var i=0,lng=this.length;i<lng;i++){
		var a=fnc(this[i],i);
		if(a) break;
	}
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