const clubId = 'ec274d45-cdb9-11ec-a93e-0242ac11000a';
const courses = { 
	밸리: '1a6b7cd7-cdba-11ec-a93e-0242ac11000a', // 'VALLEY 코스', 
	마운틴: '1a6b7ec5-cdba-11ec-a93e-0242ac11000a', // 'MOUNTAIN 코스', 
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

mneCall(thisdate, procDate); // island cc는 날짜지정없이 무조건 오늘기준으로 한 달치를 보여줌

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
    book_date: date,
    book_yymm: date.ct(2),
  };
  post('/html/reservation/reservation_01.asp', param, {}, (data) => {
    const ifr = document.createElement('div');
    ifr.innerHTML = data;

    const trs = ifr.getElementsByClassName('reserve_info')[0].getElementsByTagName('tr');
    const obTeams = {};
    Array.from(trs).forEach((tr, i) => {
      if(i < 2) return;

      const course = tr.children[1].innerHTML.replace(/\s/g,'');
      const time = tr.children[2].innerHTML;
      const fee_normal = tr.children[4].innerHTML.replace(/\,/g,'') * 1;
      const fee_discount = tr.children[5].innerText.replace(/\,/g,'') * 1;

      golf_schedule.push({
        golf_club_id: clubId,
        golf_course_id: course,
        date,
        time,
        in_out: '',
        persons: '',
        fee_normal,
        fee_discount,
        others: '9홀',
      });
    });
  });
};
function mneCall(date, callback) {
  const aas = document.getElementsByTagName('a');
  const as = [];
  Array.from(aas).forEach(a => {
    const tee = a.getAttribute('href');
    if(!tee || tee.indexOf('JavaScript:Date_Click') === -1) return;
    as.push(tee);
  });
  as.forEach((tee) => {
    const strDate = tee.split('\'')[1];
    dates.push([strDate, 0]);
  });
  callback();  
};