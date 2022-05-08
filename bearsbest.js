
const clubId = '4f44a7e1-7c51-11ec-b15c-0242ac110005';
const courses = { 
	Australasia: '90675d16-7c51-11ec-b15c-0242ac110005', // 'Australasia 코스', 
	Europe: '90675f42-7c51-11ec-b15c-0242ac110005', // 'Europe 코스', 
	USA: '90675fb1-7c51-11ec-b15c-0242ac110005', // 'USA 코스'
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

function procDate() {
	const lmt = dates.length - 1; 
	let cnt = 0;
	const timer = setInterval(() => {
		// 마지막 수신 데이터까지 처리하기 위해 종료조건이 상단에 위치한다.
		if(cnt > lmt) {
			clearInterval(timer);
			procGolfSchedule();
			return;
		}
		// 데이터 수집
		const [date, ] = dates[cnt];
		console.log('수집하기', cnt + '/' + lmt, date);
		mneCallDetail(date);
		cnt++;
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
function mneCallDetail(date) {
	const param = { 
		day: date,
		course: '',
	};
	post('AjaxGetTime', param, {}, data => {
        const ifr = document.createElement('div');
        ifr.innerHTML = data;
        
        const els = ifr.getElementsByTagName('tr');
		const dictCourse = { 11: 'Australasia', 22: 'Europe', 33: 'USA'};
		const obTeams = {};
		Array.from(els).forEach((el, i) => {
			const course = dictCourse[el.getAttribute('data-course')];
			const time = el.children[2].innerText;
			const fee_discount = el.children[4].innerText.split(',').join('') * 1;
			const fee_normal = el.children[3].innerText.split(',').join('') * 1;
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
		});
    });
};
function mneCall(date, callback) {
	const param = {
		day: date,
		type: 'today',
	};
    post('AjaxCalendar', param, {}, data => {
		const ifr = document.createElement('div');
        ifr.innerHTML = data;

		const els = ifr.getElementsByTagName('td');
		console.dir(els);
		Array.from(els).forEach((el) => {
			if (el.children[0].tagName !== 'A') return;
			if (el.children[0].className !== 'reserved') return;
			console.dir(el);
			const date = el.getAttribute('data-day');
			dates.push([date, 0]);
		});
		callback();
    });
};
