
const clubId = '88475b10-7c43-11ec-b15c-0242ac110005';
const courses = { 
	EAST: 'c76bca9f-7c43-11ec-b15c-0242ac110005', // 'EAST 코스', 
	WEST: 'c76bccf9-7c43-11ec-b15c-0242ac110005', // 'WEST 코스' 
  };
const OUTER_ADDR_HEADER = 'https://dev.mnemosyne.co.kr';
const addrOuter = OUTER_ADDR_HEADER + '/api/reservation/golfSchedule';
const header = { "Content-Type": "application/json" };

const now = new Date();
const thisyear = now.getFullYear() + "";
const thismonth = ("0" + (1 + now.getMonth())).slice(-2);
const thisdate = thisyear + '/' + thismonth + '/01';

const dates = [];
const result = [];
const golf_schedule = [];

mneCall(thisdate, procDate);

function procResultDataDetail(str) {
	const data = JSON.parse(str);
	if (data.resultCode !== 200) return;
	const result = [];
	dates.forEach(([date, teams, obTeams]) => {
		Object.keys(obTeams).forEach((course) => {
			if (Object.keys(obTeams[course]).length > 0) {
				const objCourse = {
					golf_club_id: clubId,
					date,
					course: courses[course],
					data: []
				};
				Object.keys(obTeams[course]).forEach((timeSlot, j) => {
					const arr = obTeams[course][timeSlot];
					objCourse.data.push({
						timeSlot: timeSlot + ":00",
						greenFee: arr[0].greenfee,
						teams: arr.length,
					});
				});
				result.push(objCourse);
			}
		});
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
		// course별 묶음
		Object.keys(ob).forEach((course) => {
			const courseNum = getSum(ob[course]);
			if (courseNum > 0) result.push({
				courseName: courses[course],
				date: dt,
				status: '가능',
				teams: courseNum
			});
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
		const [date, ] = dates[cnt];
		console.log('수집하기', cnt + '/' + lmt, date);
		mneCallDetail(cnt === lmt, date, procResultData);
		cnt++;
		// if(cnt > 0) clearInterval(timer);
		if(cnt > lmt) {
			clearInterval(timer);
			procGolfSchedule();
		}
	}, 300);	
};
function procGolfSchedule() {
	golf_schedule.forEach((obj) => {
		obj.golf_course_id = courses[obj.golf_course_id];
		obj.date = obj.date.gh(4) + '-' + obj.date.ch(4).gh(2) + '-' + obj.date.gt(2);
	});
	console.log(golf_schedule);
	const param = { golf_schedule, golf_club_id: clubId };
	post(addrOuter, param, header, () => {});
};
function mneCallDetail(opt, date, callback) {
	const param = { 
		day: date,
		change_day: '',
	};
	post('AjaxGetTime', param, {}, data => {
        const ifr = document.createElement('div');
        ifr.innerHTML = data;
        
        const els = ifr.getElementsByTagName('li');
		const dictCourse = { 11: 'EAST', 22: 'WEST'};
		const obTeams = {};
		Array.from(els).forEach((el, i) => {
			const course = dictCourse[el.getAttribute('data-course')];
			const time = addColon(el.getAttribute('data-time'));
			const fee_discount = el.getAttribute('data-fee') * 1;
			const fee_normal = el.getAttribute('data-ori') * 1;
			const slot = time.gh(2);

			golf_schedule.push({
				golf_club_id: clubId,
				golf_course_id: course,
				date,
				time,
				in_out: '',
				persons: '',
				fee_normal,
				fee_discount,
				others: '',
			});
			/* if(!obTeams[course]) obTeams[course] = {};
			if(!obTeams[course][slot]) obTeams[course][slot] = [];
			obTeams[course][slot].push({
				time,
				greenfee
			}); */
		});
		// callback(date, obTeams, opt);
    });
};
function mneCall(date, callback) {
	const param = {
		day: date,
		type: 'today',
		change_day: '',
	};
    post('AjaxCalendar', param, {}, data => {
		const ifr = document.createElement('div');
        ifr.innerHTML = data;

		const els = ifr.getElementsByTagName('td');
		Array.from(els).forEach((el) => {
			if (el.children[0].tagName !== 'A') return;
			if (el.children[0].className !== 'reserve ') return;
			
			const date = el.getAttribute('data-day');
			dates.push([date, 0]);
		});
		callback();
    });
};
function addColon(str) {
	return str.gh(2) + ":" + str.gt(2);
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