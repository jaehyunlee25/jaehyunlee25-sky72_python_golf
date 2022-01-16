
const clubId = 'd26b37e1-7437-11ec-b15c-0242ac110005';
const courses = { challenge: 'Challenge 코스', victory: 'Victory 코스'};
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
		// for challenge
		if (Object.keys(obTeams.challenge).length > 0) {
			const objChal = {
				golf_club_id: clubId,
				date,
				course: courses.challenge,
				data: []
			};
			Object.keys(obTeams.challenge).forEach((timeSlot, j) => {
				const arr = obTeams.challenge[timeSlot];
				objChal.data.push({
					timeSlot: timeSlot + ":00",
					greenFee: arr[0].greenfee,
					teams: arr.length,
				});
			});
			result.push(objChal);
		}

		// for victory
		if (Object.keys(obTeams.victory).length > 0) {
			const objVict = {
				golf_club_id: clubId,
				date,
				course: courses.victory,
				data: []
			};
			Object.keys(obTeams.victory).forEach((timeSlot, j) => {
				const arr = obTeams.victory[timeSlot];
				objVict.data.push({
					timeSlot: timeSlot + ":00:00",
					greenFee: arr[0].greenfee,
					teams: arr.length,
				});
			});
			result.push(objVict);
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
		// victory
		const victNum = getSum(ob.victory);
		if (victNum > 0) result.push({
			courseName: courses.victory,
			date: dt,
			status: '가능',
			teams: victNum
		});
		// challenge
		const chalNum = getSum(ob.challenge);
		if (chalNum > 0) result.push({
			courseName: courses.challenge,
			date: dt,
			status: '가능',
			teams: chalNum
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
	console.log(date);
	post('reservation_01_01.asp', {book_date_bd: date}, {}, data => {
        const ifr = document.createElement('div');
        ifr.innerHTML = data;
        
        const tds = ifr
					.getElementsByClassName('course_list_table')[1]
					.getElementsByTagName('tbody')[0]
					.children[0]
					.children;
		const [victory, challenge] = tds;
		const obTeams = {victory: {}, challenge: {}};
		// for victory course
		Array.from(victory.children).forEach((div) => {
			const str = div.innerText;
			const time = str.gh(2);
			if (obTeams.victory[time] === undefined) obTeams.victory[time] = [];
			const greenfee = div.children[1].innerText.ch(1).replace(/,/g,'') * 1;
			obTeams.victory[time].push({
				time: str.gh(5),
				greenfee
			});
		});
		// for challenge course
		Array.from(challenge.children).forEach((div) => {
			const str = div.innerText;
			const time = str.gh(2);
			if (obTeams.challenge[time] === undefined) obTeams.challenge[time] = [];
			const greenfee = div.children[1].innerText.ch(1).replace(/,/g,'') * 1;
			obTeams.challenge[time].push({
				time: str.gh(5),
				greenfee
			});
		});        
		callback(date, obTeams, opt);
    });
};
function mneCall(date, callback) {
    post('reservation_01_01.asp', {book_date_bd: date}, {}, data => {
        const ifr = document.createElement('div');
        ifr.innerHTML = data;
        
        const date = ifr.getElementsByClassName('plan-month2')[0].getElementsByTagName('span')[0];
        const year = date.children[0].innerHTML;
        const month = date.children[1].innerHTML;
    
        const tables = ifr.getElementsByTagName('table');
        const tblOverView = tables[0];
        const tblDetail = tables[2];
    
        const tdDays = tblOverView.getElementsByClassName('gray');
        Array.from(tdDays).forEach((td) => {
            const text = td.innerText.trim().gh(2);
            const team = td.innerText.trim().ch(2).ct(1);
            dates.push([year + month + text, team]);
        });
		callback();
    });
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