const clubId = 'ca84d3a7-cdb8-11ec-a93e-0242ac11000a';
const courses = { 
	가람: 'ed703e63-cdb8-11ec-a93e-0242ac11000a', // '가람 코스', 
	마루: 'ed704046-cdb8-11ec-a93e-0242ac11000a', // '마루 코스', 
	누리: 'ed704081-cdb8-11ec-a93e-0242ac11000a', // '누리 코스', 
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
    companyCd: 'J36',
    clickTdId: '',
    clickTdClass: '',
    workMonth: date.ct(2),
    workDate: date,
    bookgDate: '',
    bookgTime: '',
    bookgCourse: 'ALL',
    searchTime: '',
    temp001: '',
    bookgComment: '',
    agencyReservationYn: 'N',
    selfRYn: 'N',
    agreeYn: 'Y',
  };
  post('/reservation/ajax/golfTimeList', param, {}, (data) => {
    const ifr = document.createElement('div');
    ifr.innerHTML = data;

    const trs = ifr.getElementsByTagName('tr');
    const obTeams = {};
    Array.from(trs).forEach((tr, i) => {
      if(i === 0) return;

      const course = tr.children[1].innerHTML;
      const time = tr.children[3].innerHTML;
      const fee_normal = tr.children[5].innerHTML.replace(/\,/g,'') * 1;
      const fee_discount = tr.children[7].innerHTML.replace(/\,/g,'') * 1;
      const slot = time.gh(2);

      /* if (!obTeams[course]) obTeams[course] = {};
      if (!obTeams[course][slot]) obTeams[course][slot] = []; */

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
      /* obTeams[course][slot].push({
        time,
        greenfee,
      }); */
    });
    // callback(date, obTeams, opt);
  });
};
function mneCall(date, callback) {
  const param = {
    companyCd: 'J36',
    clickTdId: '',
    clickTdClass: '',
    workMonth: date,
    workDate: date + '05',
    bookgDate: '',
    bookgTime: '',
    bookgCourse: '',
    searchTime: '',
    temp001: '',
    bookgComment: '',
    agencyReservationYn: 'N',
    selfRYn: 'N',
    agreeYn: 'Y',
  };
  post('/reservation/ajax/golfCalendar', param, {}, (data) => {
    const ifr = document.createElement('div');
    ifr.innerHTML = data;

    const tbls = ifr.getElementsByClassName('on');
    let as = [];
    Array.from(tbls).forEach((tbl) => {
      const arr = Array.from(tbl.getElementsByTagName('a'));
      as = as.concat(arr);
    });

    as.forEach((a) => {
      if (a.className === 'cal_end') return;
      const str = a.getAttribute('onclick');
      if(str.indexOf('CLOSE') !== -1) return;
      if(str.indexOf('NOOPEN') !== -1) return;
      const ob = procStr(str);
      dates.push([ob.date, 0]);
    });
    callback();
  });
};
