const clubId = '5a2e3107-cd84-11ec-a93e-0242ac11000a';
const courses = { 
	OUT: '32b3a11d-cd86-11ec-a93e-0242ac11000a', // 'OUT 코스', 
	IN: '32b3a461-cd86-11ec-a93e-0242ac11000a', // 'IN 코스', 
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
    const [date] = dates[cnt];
	console.log('수집하기', cnt + '/' + lmt, date);
	mneCallDetail(date);
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
function mneCallDetail(date) {
	const param = { 
		fRsvD: date,
		fJiyukCd: '60',
	};

  	post('/rsv.selectTimeScd.dp/dmparse.dm', param, {}, data => {
    
		const arObj = JSON.parse(data).times;

		arObj.forEach((el, i) => {
			const course = el.fRsvDvNm;
			const time = el.rsLabel;
			const fee_discount = el.dcAmt * 1;
			const fee_normal = el.dcAmt * 1;

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
};
function mneCall(date, callback) {
  const tas = Array.from(document.getElementsByClassName('calTableLine')[0].getElementsByTagName('a'));
  const as = tas.filter(a => {
	  return a.getAttribute('href').indexOf('doReserv') !== -1;
  });
  as.forEach((a) => {
    const obj = procHref(a.getAttribute('href'));
    dates.push([obj.date, obj.param]);
  });
  callback();
};
function procHref(str) {
	const regex = /\((.+)\)/;
	const values = regex.exec(str)[1].replace(/'/g,'').split(',');	
	return { date: values[0], param: '' };
};