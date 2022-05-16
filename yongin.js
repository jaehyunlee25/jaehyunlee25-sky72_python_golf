const clubId = '62c8233b-cdb7-11ec-a93e-0242ac11000a';
const courses = { 
	용인: '8dbeebd9-cdb7-11ec-a93e-0242ac11000a', // 'Out 코스', 
	석천: '8dbeee18-cdb7-11ec-a93e-0242ac11000a', // 'In 코스', 
};
const OUTER_ADDR_HEADER = 'https://dev.mnemosyne.co.kr';
const addrOuter = OUTER_ADDR_HEADER + '/api/reservation/golfSchedule';
const header = { 'Content-Type': 'application/json' };

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
    const arrDate = dates[cnt];
		console.log('수집하기', cnt + '/' + lmt, arrDate[0]);
		mneCallDetail(arrDate);
    cnt++;
  }, 300);
}
function procGolfSchedule() {
	golf_schedule.forEach((obj) => {
		obj.golf_course_id = courses[obj.golf_course_id];
		obj.date = obj.date.gh(4) + '-' + obj.date.ch(4).gh(2) + '-' + obj.date.gt(2);
	});
	console.log(golf_schedule);
	const param = { golf_schedule, golf_club_id: clubId };
	post(addrOuter, param, header, () => {});
};
function mneCallDetail(arrDate) {
  const [date, strParam] = arrDate;
  const param = {};
  Array.from(aspnetForm.elements).forEach((el) => param[el.name] = el.value);
  param['__ASYNCPOST'] = 'true';
	param['ctl00$contents$htbArgs'] = strParam;
	param['ctl00$ContentPlaceHolder1$ScrptManager1'] = 'ctl00$ContentPlaceHolder1$ScrptManager1|ctl00$ContentPlaceHolder1$btnUp';	// 매우 중요. 생략금지!!!
	param['__EVENTTARGET'] = 'ctl00$ContentPlaceHolder1$btnUp';	// 매우 중요. 생략금지!!!

  post('Reservation.aspx', param, {}, data => {
    const ifr = document.createElement('div');
    ifr.innerHTML = data;

    const tbl =ifr.getElementsByClassName('cosTimeList')[0];
    const els = tbl.getElementsByTagName('li');

    Array.from(els).forEach((el, i) => {
			const course = el.children[0].innerText.gh(2);
			const time = el.children[1].innerText;
      if(time.length !== 5) return;
			const fee_discount = el.children[3].innerText.ct(1).split(',').join('') * 1;
			const fee_normal = el.children[2].innerText.ct(1).split(',').join('') * 1;

			golf_schedule.push({
				golf_club_id: clubId,
				golf_course_id: course,
				date,
				time,
				in_out: '',
				persons: '',
				fee_normal,
				fee_discount,
				others: '18홀',
			});
		});
  });
}
function mneCall(date, callback) {
  const as = Array.from(document.getElementsByClassName('bigCld')[0].getElementsByTagName('a'));
  as.concat(Array.from(document.getElementsByClassName('bigCld')[1].getElementsByTagName('a')));
  as.forEach((a) => {
    const obj = procHref(a.getAttribute('href'));
    dates.push([obj.date, obj.param]);
  });
  callback();
};
function procHref(str) {
	const regex = /\((.+)\)/;
	const values = regex.exec(str)[1].replace(/'/g,'').split(',');
	return { date: str.split('|')[2].split('-').join(''), param: values[0] };
};