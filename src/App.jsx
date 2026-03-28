import React, { useState, useEffect } from 'react';
import { Calendar, Users, Sparkles, ChevronLeft, ChevronRight, Check, X, Printer, Plus, PartyPopper, CalendarDays, Download } from 'lucide-react';
import ProgramDBBrowser from './ProgramDBBrowser.jsx';
import { PROGRAM_DB } from './data/programs.js';
import XLSX from 'xlsx-js-style';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

// 2026년 공휴일 (날짜: 공휴일명)
const HOLIDAYS_2026 = {
  '2026-01-01': '신정',
  '2026-02-16': '설날 연휴',
  '2026-02-17': '설날',
  '2026-02-18': '설날 연휴',
  '2026-03-01': '삼일절',
  '2026-03-02': '대체공휴일',
  '2026-05-05': '어린이날',
  '2026-05-24': '부처님오신날',
  '2026-05-25': '대체공휴일',
  '2026-06-06': '현충일',
  '2026-08-15': '광복절',
  '2026-08-17': '대체공휴일',
  '2026-10-03': '개천절',
  '2026-10-04': '추석 연휴',
  '2026-10-05': '추석',
  '2026-10-06': '추석 연휴',
  '2026-10-09': '한글날',
  '2026-12-25': '크리스마스'
};

const isHoliday = (dateStr) => HOLIDAYS_2026.hasOwnProperty(dateStr);
const getHolidayName = (dateStr) => HOLIDAYS_2026[dateStr] || '';

const isWeekday = (date) => {
  const day = date.getDay();
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return day !== 0 && day !== 6 && !isHoliday(dateStr);
};

const formatDate = (date) => `${date.getMonth() + 1}/${date.getDate()}(${WEEKDAYS[date.getDay()]})`;

const getFirstWeekday = (year, month) => {
  for (let day = 1; day <= 7; day++) {
    const date = new Date(year, month - 1, day);
    if (isWeekday(date)) return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  return null;
};

const getFirstFriday = (year, month) => {
  for (let day = 1; day <= 14; day++) {
    const date = new Date(year, month - 1, day);
    if (date.getDay() === 5 && isWeekday(date)) return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  return null;
};

const getThirdFriday = (year, month) => {
  let count = 0;
  for (let day = 1; day <= 31; day++) {
    const date = new Date(year, month - 1, day);
    if (date.getMonth() !== month - 1) break;
    if (date.getDay() === 5) {
      count++;
      if (count === 3 && isWeekday(date)) return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }
  return null;
};

const getWeekdaysOfMonth = (year, month) => {
  const weekdays = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    if (isWeekday(date)) weekdays.push(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  }
  return weekdays;
};

const FIXED_INFO = {
  monthIntro: { name: '월을 소개합니다', icon: '📅' },
  safetyEducation: { name: '소방안전 & 감염병예방교육', icon: '🚒' },
  birthday: { name: '생일축하해요', icon: '🎂' },
  survey: { name: '이용자 선호도조사', icon: '📋' },
  healthEducation: { name: '보건교육', icon: '🏥' },
  communityExplore: { name: '지역사회탐방', icon: '🗺️' },
  cinema: { name: '소룡시네마', icon: '🎬' },
  cooking: { name: '요리수업', icon: '👨‍🍳' },
  outdoor: { name: '외부활동', icon: '🌳' }
};

const EXTERNAL_PROGRAMS = [
  { name: '볼링', type: '협', icon: '🎳' }, { name: '재활요가', type: '외', icon: '🧘' },
  { name: '파워댄스', type: '강', icon: '💃' }, { name: 'VR체험', type: '외', icon: '🥽' },
  { name: '농구', type: '외', icon: '🏀' }, { name: '토탈공예', type: '강', icon: '✂️' },
  { name: '재활체육', type: '강', icon: '🏋️' }, { name: '방송댄스', type: '외', icon: '🕺' },
  { name: '와우댄스', type: '강', icon: '💫' }, { name: '와우댄스', type: '외', icon: '✨' },
  { name: '국악한마당', type: '외', icon: '🥁' }, { name: '보치아', type: '외', icon: '🎯' },
  { name: '태권도', type: '협', icon: '🥋' }, { name: '떡공예', type: '외', icon: '🍡' },
  { name: '샌드아트', type: '강', icon: '🏖️' }, { name: '난타A', type: '강', icon: '🪘' },
  { name: '난타B', type: '강', icon: '🪘' }, { name: '도예', type: '협', icon: '🏺' },
  { name: '플라워아트', type: '강', icon: '💐' }, { name: '아이드림', type: '협', icon: '⭐' },
  { name: '게이트볼', type: '외', icon: '🏑' }
];

const MiniCalendar = ({ year, month, selectedDates = [], onDateToggle, onClose }) => {
  const [cMonth, setCMonth] = useState(month - 1);
  const [cYear, setCYear] = useState(year);

  useEffect(() => {
    setCYear(year);
    setCMonth(month - 1);
  }, [year, month]);

  const daysInMonth = new Date(cYear, cMonth + 1, 0).getDate();
  const firstDay = new Date(cYear, cMonth, 1).getDay();
  const days = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const isSelected = (day) => day && selectedDates.includes(`${cYear}-${String(cMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  const isWkday = (day) => day && isWeekday(new Date(cYear, cMonth, day));

  return (
    <div className="absolute z-50 bg-white rounded-xl shadow-xl p-3 border-2 border-indigo-200" style={{ minWidth: '260px' }}>
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => cMonth === 0 ? (setCMonth(11), setCYear(cYear - 1)) : setCMonth(cMonth - 1)} className="p-1 hover:bg-gray-100 rounded">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-bold text-sm">{cYear}년 {MONTHS[cMonth]}</span>
        <button onClick={() => cMonth === 11 ? (setCMonth(0), setCYear(cYear + 1)) : setCMonth(cMonth + 1)} className="p-1 hover:bg-gray-100 rounded">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs mb-1">
        {WEEKDAYS.map((d, i) => <div key={d} className={`text-center py-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-500'}`}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => (
          <button key={i} onClick={() => day && isWkday(day) && onDateToggle(`${cYear}-${String(cMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)}
            disabled={!day || !isWkday(day)}
            className={`aspect-square rounded text-xs ${!day ? 'invisible' : ''} ${day && !isWkday(day) ? 'text-gray-300' : ''} ${day && isWkday(day) && !isSelected(day) ? 'hover:bg-indigo-100' : ''} ${isSelected(day) ? 'bg-indigo-500 text-white' : ''}`}>
            {day}
          </button>
        ))}
      </div>
      <button onClick={onClose} className="mt-2 w-full py-1 bg-indigo-500 text-white rounded text-sm font-medium">확인</button>
    </div>
  );
};

const TimeSelect = ({ value, onChange, label }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} className="px-3 py-2 border-2 rounded-lg text-base">
    <option value="">{label}</option>
    {[9,10,11,12,13,14,15,16,17,18].map(h => <option key={h} value={`${String(h).padStart(2,'0')}:00`}>{h}:00</option>)}
  </select>
);

const SchedulePreviewModal = ({ year, month, events = [], fixedPrograms = {}, externalPrograms = [], externalSchedules = {}, dismissalTime, title, onClose, isFinal }) => {
  const weekdays = getWeekdaysOfMonth(year, month);
  const weeks = [];
  let week = [], lastDay = -1;
  weekdays.forEach(d => {
    const dow = new Date(d).getDay();
    if (dow <= lastDay && week.length) { weeks.push(week); week = []; }
    week.push(d);
    lastDay = dow;
  });
  if (week.length) weeks.push(week);

  const getSchedules = (dateStr) => {
    const result = [];
    events.forEach(e => e.date === dateStr && e.name && result.push({ type: 'event', name: e.name, startTime: e.startTime, endTime: e.endTime }));
    Object.entries(fixedPrograms).forEach(([k, p]) => p.enabled && p.dates?.includes(dateStr) && result.push({ type: 'fixed', name: FIXED_INFO[k]?.name || k, startTime: p.startTime, endTime: p.endTime || dismissalTime }));
    externalPrograms.forEach(idx => {
      const s = externalSchedules[idx], prog = EXTERNAL_PROGRAMS[idx];
      s?.dates?.includes(dateStr) && prog && result.push({ type: 'external', name: `${prog.name}(${prog.type})`, startTime: s.startTime, endTime: s.endTime });
    });
    return result;
  };

  const getAtTime = (dateStr, slot) => {
    const slotNum = parseInt(slot.split('~')[0].replace(':', ''));
    return getSchedules(dateStr).filter(s => {
      if (!s.startTime || !s.endTime) return false;
      const start = parseInt(s.startTime.replace(':', '')), end = parseInt(s.endTime.replace(':', ''));
      return slotNum >= start && slotNum < end;
    });
  };

  const timeSlots = dismissalTime === '16:00'
    ? ['09:00~10:00','10:00~11:00','11:00~12:00','12:00~13:00','13:00~14:00','14:00~15:00','15:00~16:00']
    : ['09:00~10:00','10:00~11:00','11:00~12:00','12:00~13:00','13:00~14:00','14:00~15:00','15:00~16:00','16:00~17:00'];

  const getWeekDates = (wk) => {
    if (!wk.length) return [];
    const first = new Date(wk[0]), mon = new Date(first);
    mon.setDate(first.getDate() - (first.getDay() === 0 ? 6 : first.getDay() - 1));
    return [0,1,2,3,4].map(i => {
      const d = new Date(mon); d.setDate(mon.getDate() + i);
      if (d.getMonth() !== month - 1) return null;
      const ds = `${year}-${String(month).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const holidayName = getHolidayName(ds);
      return { dateStr: ds, day: d.getDate(), isHoliday: holidayName !== '' || d.getDay() === 0 || d.getDay() === 6, holidayName: holidayName };
    });
  };

  const downloadExcelFile = () => {
    try {
      const wb = XLSX.utils.book_new();
      const ws = {};
      const merges = [];
      const rowHeights = [];
      let R = 0;
      const cov = {}; // 수직 병합 커버리지 추적

      // 테두리 헬퍼 (weight: 1=thin, 2=medium)
      const bd = (w) => ({ style: w >= 2 ? 'medium' : 'thin', color: { rgb: '000000' } });
      const mkBorder = (l=1,t=1,r=1,b=1) => ({ left:bd(l), top:bd(t), right:bd(r), bottom:bd(b) });
      const OB = 2;

      // 스타일 생성 헬퍼
      const mkS = (bg, fg, bold, sz, ha='center', border=mkBorder()) => ({
        fill: { patternType: 'solid', fgColor: { rgb: bg } },
        font: { name: '맑은 고딕', sz, bold: !!bold, color: { rgb: fg } },
        alignment: { horizontal: ha, vertical: 'center', wrapText: true },
        border,
      });

      // 엣지 변형 스타일 (_R, _B, _RB suffix)
      const edge = (base, suf) => {
        const s = { ...base, border: { ...base.border } };
        if (suf.includes('R')) s.border.right = bd(OB);
        if (suf.includes('B')) s.border.bottom = bd(OB);
        return s;
      };

      // 스타일 맵
      const S = {
        hdr:    mkS('6366F1','FFFFFF',true, 15,'center', mkBorder(OB,OB,OB,1)),
        sub:    mkS('FFFFFF','666666',false,11,'center', mkBorder(OB,1,OB,OB)),
        spc:    mkS('FFFFFF','FFFFFF',false, 4,'center'),
        // 범례
        l_ev:   mkS('FF6B6B','FFFFFF',true, 11,'center', mkBorder(OB,OB,1,OB)),
        l_fi:   mkS('74B9FF','FFFFFF',true, 11,'center', mkBorder(1,OB,1,OB)),
        l_ex:   mkS('A29BFE','FFFFFF',true, 11,'center', mkBorder(1,OB,OB,OB)),
        // 주차 헤더
        w_hd:   mkS('E5E7EB','000000',true, 12,'left',  mkBorder(OB,OB,OB,1)),
        // 요일/날짜 헤더
        c_hd:   mkS('F3F4F6','000000',true, 11,'center'),
        c_ho:   mkS('F3F4F6','DC2626',true, 11,'center'),
        c_hd_L: mkS('F3F4F6','000000',true, 11,'center', mkBorder(OB,1,1,1)),
        c_hd_R: mkS('F3F4F6','000000',true, 11,'center', mkBorder(1,1,OB,1)),
        c_ho_R: mkS('F3F4F6','DC2626',true, 11,'center', mkBorder(1,1,OB,1)),
        // 시간 셀
        t_ce_L: mkS('F9FAFB','000000',false,10,'center', mkBorder(OB,1,1,1)),
        t_ce_LB:mkS('F9FAFB','000000',false,10,'center', mkBorder(OB,1,1,OB)),
        // 내용 셀 기본 (엣지 변형은 동적 생성)
        g_ce:   mkS('F3F4F6','000000',false,10),
        ev_c:   mkS('FF6B6B','FFFFFF',true, 10),
        fi_c:   mkS('74B9FF','FFFFFF',true, 10),
        ex_c:   mkS('A29BFE','FFFFFF',true, 10),
        lu_c:   mkS('FFCCCC','000000',false,10),
        ho_c:   mkS('FEE2E2','DC2626',true, 12),
        em_c:   mkS('FFFFFF','000000',false,10),
      };

      // suffix → 스타일 동적 반환
      const getS = (key) => {
        const suffixes = ['_RB','_R','_B'];
        for (const suf of suffixes) {
          if (key.endsWith(suf)) {
            const base = S[key.slice(0, -suf.length)];
            return base ? edge(base, suf.replace(/_/g,'')) : S[key];
          }
        }
        return S[key];
      };

      // 셀 기록
      const setCell = (r, c, v, s) => {
        ws[XLSX.utils.encode_cell({ r, c })] = { v: v ?? '', t: 's', s };
      };

      // 행 구성 (원본 buildRow와 동일 로직)
      const buildRow = (specs, hPx) => {
        if (hPx) rowHeights[R] = { hpx: hPx };
        let col = 0;
        const newCov = {};
        specs.forEach(sp => {
          while (cov[col]) col++;
          const ma = sp.ma || 0, md = sp.md || 0;
          const s = sp.s;
          setCell(R, col, sp.v, s);
          for (let c = col + 1; c <= col + ma; c++) setCell(R, c, '', s);
          if (ma > 0 || md > 0) merges.push({ s: { r:R, c:col }, e: { r:R+md, c:col+ma } });
          if (md > 0) for (let c = col; c <= col + ma; c++) newCov[c] = md;
          col += ma + 1;
        });
        Object.keys(cov).forEach(k => { cov[k]--; if (cov[k] <= 0) delete cov[k]; });
        Object.entries(newCov).forEach(([k, v]) => { cov[k] = v; });
        R++;
      };

      // ── 타이틀 ──
      buildRow([{ v:`📋 ${year}년 ${month}월 ${title}`, ma:5, s:S.hdr }], 36);
      buildRow([{ v:'성인 발달장애인 주간활동센터', ma:5, s:S.sub }], 26);
      buildRow([{ v:'', ma:5, s:S.spc }], 8);

      // ── 범례 ──
      buildRow([
        { v:'전체행사',      ma:1, s:S.l_ev },
        { v:'고정프로그램',  ma:1, s:S.l_fi },
        { v:'내외부프로그램',ma:1, s:S.l_ex },
      ], 28);
      buildRow([{ v:'', ma:5, s:S.spc }], 8);

      // ── 주차별 ──
      weeks.forEach((wk, wi) => {
        const wd = getWeekDates(wk);

        buildRow([{ v:`📌 ${wi+1}주차`, ma:5, s:S.w_hd }], 30);

        // 요일 행
        buildRow([
          { v:'시간', md:1, s:S.c_hd_L },
          ...['월','화','수','목','금'].map((d, i) => {
            const isLast = i === 4, isHol = wd[i]?.isHoliday;
            return { v:`${d}요일`, s: isLast ? (isHol?S.c_ho_R:S.c_hd_R) : (isHol?S.c_ho:S.c_hd) };
          }),
        ], 26);

        // 날짜 행
        buildRow(wd.map((info, i) => {
          const isLast = i === 4, isHol = info?.isHoliday;
          if (!info) return { v:'', s: isLast?S.c_hd_R:S.c_hd };
          return { v:`${info.day}일${info.holidayName ? ' ('+info.holidayName+')' : ''}`,
                   s: isLast ? (isHol?S.c_ho_R:S.c_hd_R) : (isHol?S.c_ho:S.c_hd) };
        }), 26);

        // 시간대 행
        timeSlots.forEach((slot, slotIdx) => {
          const isLastRow = slotIdx === timeSlots.length - 1;
          const specs = [{ v:slot, s: isLastRow?S.t_ce_LB:S.t_ce_L }];
          wd.forEach((info, i) => {
            const isLastCol = i === 4;
            const suf = (isLastRow&&isLastCol)?'_RB':isLastRow?'_B':isLastCol?'_R':'';
            if (!info) { specs.push({ v:'', s:getS('g_ce'+suf) }); return; }
            if (info.isHoliday) {
              if (slotIdx === 0)
                specs.push({ v:info.holidayName||'휴일', md:timeSlots.length-1, s:getS('ho_c'+(isLastCol?'_RB':'_B')) });
              return;
            }
            if (slot === '12:00~13:00') { specs.push({ v:'점심식사 및 위생지원', s:getS('lu_c'+suf) }); return; }
            const scheds = getAtTime(info.dateStr, slot);
            if (scheds.length) {
              const sc = scheds[0];
              const base = sc.type==='event'?'ev_c':sc.type==='external'?'ex_c':'fi_c';
              specs.push({ v: sc.name==='월을 소개합니다'?`${month}월을 소개합니다`:sc.name, s:getS(base+suf) });
            } else {
              specs.push({ v:'', s:getS('em_c'+suf) });
            }
          });
          buildRow(specs, 30);
        });

        buildRow([{ v:'', ma:5, s:S.spc }], 10);
      });

      // ── 워크시트 설정 ──
      ws['!cols'] = [{ wpx:90 },{ wpx:120 },{ wpx:120 },{ wpx:120 },{ wpx:120 },{ wpx:120 }];
      ws['!rows'] = rowHeights;
      ws['!merges'] = merges;
      ws['!ref'] = XLSX.utils.encode_range({ s:{r:0,c:0}, e:{r:R-1,c:5} });

      XLSX.utils.book_append_sheet(wb, ws, `${month}월 계획서`);
      XLSX.writeFile(wb, `${month}월 주간활동계획서-달력.xlsx`);
    } catch (e) {
      alert('엑셀 파일 생성에 실패했습니다: ' + e.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b-2 border-black p-3 print:hidden">
        <div className="flex justify-center gap-3">
          <button onClick={downloadExcelFile} className="px-4 py-2 bg-purple-600 text-white font-bold rounded flex items-center gap-2">
            <Download className="w-4 h-4" /> 엑셀 다운로드
          </button>
          <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white font-bold rounded flex items-center gap-2">
            <Printer className="w-4 h-4" /> 인쇄
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 text-white font-bold rounded">✕ 닫기</button>
        </div>
      </div>

      <div id="schedule-table-area" className="p-4 max-w-5xl mx-auto">
        <table className="w-full border-collapse mb-4" style={{tableLayout: 'fixed'}}>
          <tbody>
            <tr>
              <td colSpan={6} className="text-center p-4 text-2xl font-bold text-white border-2 border-black" style={{backgroundColor: '#6366F1'}}>
                📋 {year}년 {month}월 {title}
              </td>
            </tr>
            <tr>
              <td colSpan={6} className="text-center p-2 text-base text-gray-600 border-2 border-black border-t-0">
                성인 발달장애인 주간활동센터
              </td>
            </tr>
          </tbody>
        </table>

        <table className="w-full border-collapse border-2 border-black mb-4" style={{tableLayout: 'fixed'}}>
          <tbody>
            <tr>
              <td className="text-center p-3 border border-black font-bold" colSpan={2} style={{backgroundColor: '#ff6b6b', color: 'white'}}>전체행사</td>
              <td className="text-center p-3 border border-black font-bold" colSpan={2} style={{backgroundColor: '#74b9ff', color: 'white'}}>고정프로그램</td>
              <td className="text-center p-3 border border-black font-bold" colSpan={2} style={{backgroundColor: '#a29bfe', color: 'white'}}>내외부프로그램</td>
            </tr>
          </tbody>
        </table>

        {weeks.map((wk, wi) => {
          const wd = getWeekDates(wk);
          return (
            <div key={wi} className="mb-4 border-2 border-black">
              <div className="px-3 py-2 font-bold border-b-2 border-black bg-gray-100 text-lg">{wi + 1}주차</div>
              <table className="w-full border-collapse text-sm" style={{tableLayout: 'fixed'}}>
                <thead>
                  <tr>
                    <th rowSpan={2} className="border border-black p-2 bg-gray-100 align-middle text-base" style={{width: '80px'}}>시간</th>
                    {['월','화','수','목','금'].map((d,i) => (
                      <th key={d} className={`border border-black p-2 bg-gray-100 text-base ${wd[i]?.isHoliday ? 'text-red-500' : ''}`} style={{width: '18%'}}>
                        {d}요일
                      </th>
                    ))}
                  </tr>
                  <tr>
                    {['월','화','수','목','금'].map((d,i) => (
                      <th key={d} className={`border border-black p-2 bg-gray-100 text-base ${wd[i]?.isHoliday ? 'text-red-500' : ''}`} style={{width: '18%'}}>
                        {wd[i] ? `${wd[i].day}일` : ''}
                        {wd[i]?.holidayName && <span className="block text-red-500">({wd[i].holidayName})</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot, slotIdx) => (
                    <tr key={slot}>
                      <td className="border border-black p-1 bg-gray-50 text-center text-sm">{slot}</td>
                      {wd.map((info, i) => {
                        if (!info) return <td key={i} className="border border-black bg-gray-100"></td>;
                        if (info.isHoliday) {
                          if (slotIdx === 0) {
                            return (
                              <td key={i} rowSpan={timeSlots.length} className="border border-black bg-red-50 text-center text-red-500 font-bold text-lg align-middle">
                                {info.holidayName || '휴일'}
                              </td>
                            );
                          }
                          return null;
                        }
                        if (slot === '12:00~13:00') return <td key={i} className="border border-black text-center text-sm font-medium" style={{backgroundColor:'#ffcccc'}}>점심식사 및 위생지원</td>;
                        const scheds = getAtTime(info.dateStr, slot);
                        if (!scheds.length) return <td key={i} className="border border-black"></td>;
                        const s = scheds[0];
                        const bg = s.type === 'event' ? '#ff6b6b' : s.type === 'external' ? '#a29bfe' : '#74b9ff';
                        const textColor = '#fff';
                        const displayName = s.name === '월을 소개합니다' ? `${month}월을 소개합니다` : s.name;
                        return <td key={i} className="border border-black p-1 text-center text-sm font-medium" style={{backgroundColor:bg, color: textColor}}>{displayName}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          /* 모든 요소 숨김 (레이아웃 공간도 제거) */
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            visibility: hidden;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          html { overflow: visible !important; margin: 0 !important; padding: 0 !important; }
          * { overflow: visible !important; }
          /* fixed 모달을 문서 상단에 절대 배치 (blank 페이지 방지) */
          .fixed {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            overflow: visible !important;
          }
          /* 계획서 표 영역만 표시 */
          #schedule-table-area,
          #schedule-table-area * {
            visibility: visible !important;
          }
        }
      `}</style>
    </div>
  );
};

export default function WeeklyPlannerApp() {
  const curMonth = new Date().getMonth() + 1;
  const [step, setStep] = useState(1);
  const [userInfo, setUserInfo] = useState({ wheelchair: false, cognitive: '중', cognitiveLevel: '초등 저학년', month: curMonth, dismissalTime: '17:00' });
  const [events, setEvents] = useState([]);
  const [showEventCal, setShowEventCal] = useState(false);

  const initFixed = (m, dt) => {
    const y = 2026, fw = getFirstWeekday(y, m), ff = getFirstFriday(y, m), tf = getThirdFriday(y, m), et = dt === '16:00' ? '16:00' : '17:00';
    return {
      monthIntro: { enabled: true, dates: fw ? [fw] : [], startTime: '09:00', endTime: '10:00', rule: '매월 첫 평일 09:00~10:00' },
      safetyEducation: { enabled: true, dates: ff ? [ff] : [], startTime: '09:00', endTime: '10:00', rule: '첫째주 금요일 09:00~10:00' },
      birthday: { enabled: true, dates: tf ? [tf] : [], startTime: '13:00', endTime: et, rule: `셋째주 금요일 13:00~${et}` },
      survey: { enabled: true, dates: [], startTime: '', endTime: '', rule: '평일 1시간' },
      healthEducation: { enabled: true, dates: [], startTime: '', endTime: '', rule: '평일 1시간' },
      communityExplore: { enabled: true, dates: [], startTime: '', endTime: '', rule: '평일 3시간' },
      cinema: { enabled: true, dates: [], startTime: '', endTime: '', rule: '평일 2시간' },
      cooking: { enabled: true, dates: [], startTime: '', endTime: '', rule: '평일 2~3시간' },
      outdoor: { enabled: true, dates: [], startTime: '', endTime: '', rule: '평일 2시간' }
    };
  };

  const [fixedPrograms, setFixedPrograms] = useState(() => initFixed(curMonth, '17:00'));
  const [selectedExt, setSelectedExt] = useState([]);
  const [extSchedules, setExtSchedules] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [showFinalPlan, setShowFinalPlan] = useState(false);

  useEffect(() => {
    const y = 2026, fw = getFirstWeekday(y, userInfo.month), ff = getFirstFriday(y, userInfo.month), tf = getThirdFriday(y, userInfo.month), et = userInfo.dismissalTime === '16:00' ? '16:00' : '17:00';
    setFixedPrograms(p => ({
      ...p,
      monthIntro: { ...p.monthIntro, dates: fw ? [fw] : [] },
      safetyEducation: { ...p.safetyEducation, dates: ff ? [ff] : [] },
      birthday: { ...p.birthday, dates: tf ? [tf] : [], endTime: et, rule: `셋째주 금요일 13:00~${et}` }
    }));
  }, [userInfo.month, userInfo.dismissalTime]);

  const toggleFixedDate = (key, date) => setFixedPrograms(p => {
    const cur = p[key].dates || [];
    return { ...p, [key]: { ...p[key], dates: cur.includes(date) ? cur.filter(d => d !== date) : [...cur, date].sort() } };
  });

  const toggleExt = (idx) => {
    if (selectedExt.includes(idx)) {
      setSelectedExt(p => p.filter(i => i !== idx));
      setExtSchedules(p => { const n = {...p}; delete n[idx]; return n; });
    } else if (selectedExt.length < 5) setSelectedExt(p => [...p, idx]);
  };

  const toggleExtDate = (idx, date) => setExtSchedules(p => {
    const cur = p[idx]?.dates || [];
    return { ...p, [idx]: { ...p[idx], dates: cur.includes(date) ? cur.filter(d => d !== date) : [...cur, date].sort() } };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold flex items-center gap-2"><Sparkles className="w-9 h-9" />계획서 해방</h1>
          <p className="text-base mt-2 opacity-90">다음 달 수업 계획서를 AI가 함께 작성해드립니다</p>
          <p className="text-sm mt-1 opacity-70">AI 기획 · 빠른 완성</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-5">
        <div className="flex items-center justify-center gap-4 mb-4">
          {[1,2,3].map(s => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${step >= s ? 'bg-indigo-500 text-white' : 'bg-gray-200'}`}>{s}</div>
              {s < 3 && <div className={`w-10 h-1 ${step > s ? 'bg-indigo-500' : 'bg-gray-200'}`}></div>}
            </div>
          ))}
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 pb-8">
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Users className="w-7 h-7 text-indigo-500" />기본 정보</h2>
            <div>
              <label className="block text-base font-medium mb-2">월 선택</label>
              <select value={userInfo.month} onChange={e => setUserInfo({...userInfo, month: +e.target.value})} className="w-full p-3 border-2 rounded-lg text-lg">
                {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-base font-medium mb-2">하원 시간</label>
              <div className="flex gap-3">
                {['16:00','17:00'].map(t => (
                  <button key={t} onClick={() => setUserInfo({...userInfo, dismissalTime: t})}
                    className={`flex-1 py-3 rounded-lg border-2 font-medium text-lg ${userInfo.dismissalTime === t ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-base font-medium mb-2">휠체어 사용</label>
              <div className="flex gap-3">
                {[false, true].map(v => (
                  <button key={String(v)} onClick={() => setUserInfo({...userInfo, wheelchair: v})}
                    className={`flex-1 py-3 rounded-lg border-2 font-medium text-lg ${userInfo.wheelchair === v ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}>{v ? '예' : '아니오'}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-base font-medium mb-2">인지능력</label>
              <div className="flex gap-3">
                {['상', '중', '하'].map(level => (
                  <button key={level} onClick={() => setUserInfo({...userInfo, cognitive: level})}
                    className={`flex-1 py-3 rounded-lg border-2 font-medium text-lg ${userInfo.cognitive === level ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}>{level}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-base font-medium mb-2">인지수준</label>
              <div className="grid grid-cols-2 gap-3">
                {['유치원', '초등 저학년', '초등 고학년', '중학생'].map(level => (
                  <button key={level} onClick={() => setUserInfo({...userInfo, cognitiveLevel: level})}
                    className={`py-3 rounded-lg border-2 font-medium text-base ${userInfo.cognitiveLevel === level ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}>{level}</button>
                ))}
              </div>
            </div>
            <button onClick={() => setStep(2)} className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold text-xl">다음 →</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="bg-pink-50 rounded-2xl shadow-lg p-6 border-2 border-pink-200">
              <h2 className="text-2xl font-bold text-pink-800 flex items-center gap-2 mb-4"><PartyPopper className="w-7 h-7" />전체 행사</h2>
              <div className="relative">
                <button onClick={() => setShowEventCal(!showEventCal)} className="px-4 py-3 bg-pink-500 text-white rounded-lg text-base font-medium flex items-center gap-2">
                  <Plus className="w-5 h-5" /> 행사 추가
                </button>
                {showEventCal && (
                  <MiniCalendar year={2026} month={userInfo.month} selectedDates={events.map(e => e.date)}
                    onDateToggle={d => events.find(e => e.date === d) ? setEvents(events.filter(e => e.date !== d)) : setEvents([...events, { date: d, name: '', startTime: '09:00', endTime: '17:00' }])}
                    onClose={() => setShowEventCal(false)} />
                )}
              </div>
              {events.length > 0 && (
                <div className="mt-4 space-y-3">
                  {events.map((ev, i) => (
                    <div key={i} className="bg-white rounded-lg p-3 flex items-center gap-3 text-base">
                      <span className="font-medium text-pink-600 whitespace-nowrap">{formatDate(new Date(ev.date))}</span>
                      <input value={ev.name} onChange={e => { const n = [...events]; n[i].name = e.target.value; setEvents(n); }} placeholder="행사명" className="flex-1 px-3 py-2 border rounded text-base" />
                      <TimeSelect value={ev.startTime} onChange={v => { const n = [...events]; n[i].startTime = v; setEvents(n); }} label="시작" />
                      <TimeSelect value={ev.endTime} onChange={v => { const n = [...events]; n[i].endTime = v; setEvents(n); }} label="종료" />
                      <button onClick={() => setEvents(events.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500"><X className="w-5 h-5" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-purple-50 rounded-2xl shadow-lg p-6 border-2 border-purple-200">
              <h2 className="text-2xl font-bold text-purple-800 flex items-center gap-2 mb-4"><CalendarDays className="w-7 h-7" />고정 프로그램</h2>
              <div className="space-y-3">
                {Object.entries(fixedPrograms).map(([key, prog]) => (
                  <FixedItem key={key} pKey={key} prog={prog} info={FIXED_INFO[key]} month={userInfo.month} dismissalTime={userInfo.dismissalTime}
                    onToggle={() => setFixedPrograms(p => ({...p, [key]: {...p[key], enabled: !p[key].enabled}}))}
                    onDateToggle={d => toggleFixedDate(key, d)}
                    onTimeChange={(f, v) => setFixedPrograms(p => ({...p, [key]: {...p[key], [f]: v}}))} />
                ))}
              </div>
            </div>

            <div className="bg-cyan-50 rounded-2xl shadow-lg p-6 border-2 border-cyan-200">
              <h2 className="text-2xl font-bold text-cyan-800 flex items-center gap-2 mb-2"><Users className="w-7 h-7" />내외부 프로그램</h2>
              <p className="text-base text-cyan-600 mb-4">최대 5개 선택 ({selectedExt.length}/5)</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {EXTERNAL_PROGRAMS.map((prog, idx) => {
                  const sel = selectedExt.includes(idx), dis = !sel && selectedExt.length >= 5;
                  return (
                    <button key={idx} onClick={() => !dis && toggleExt(idx)} disabled={dis}
                      className={`p-3 rounded-lg border-2 text-left text-base ${sel ? 'border-cyan-500 bg-cyan-100' : dis ? 'border-gray-200 bg-gray-100 opacity-50' : 'border-gray-200 bg-white hover:border-cyan-300'}`}>
                      <span>{prog.icon} {prog.name}</span>
                      <span className={`ml-1 font-bold ${prog.type === '협' ? 'text-red-500' : 'text-gray-500'}`}>({prog.type})</span>
                    </button>
                  );
                })}
              </div>
              {selectedExt.length > 0 && (
                <div className="space-y-3 border-t-2 border-cyan-200 pt-4">
                  {selectedExt.map(idx => (
                    <ExtItem key={idx} idx={idx} prog={EXTERNAL_PROGRAMS[idx]} schedule={extSchedules[idx] || {}} month={userInfo.month}
                      onDateToggle={d => toggleExtDate(idx, d)}
                      onTimeChange={(f, v) => setExtSchedules(p => ({...p, [idx]: {...p[idx], [f]: v}}))} />
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 py-4 bg-gray-200 rounded-xl font-bold text-lg">← 이전</button>
              <button onClick={() => setStep(3)} className="flex-1 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold text-lg">다음 →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
                {events.filter(e => e.name).length > 0 && (
                  <div className="bg-pink-50 rounded-2xl shadow-lg p-6 border-2 border-pink-200">
                    <h2 className="text-2xl font-bold text-pink-800 flex items-center gap-2 mb-4">
                      <PartyPopper className="w-7 h-7" /> 전체 행사
                    </h2>
                    <div className="space-y-3">
                      {events.filter(e => e.name).map((ev, i) => (
                        <div key={i} className="bg-white rounded-lg p-4 flex items-center gap-3">
                          <span className="text-2xl">🎉</span>
                          <div>
                            <p className="font-bold text-lg text-gray-800">{ev.name}</p>
                            <p className="text-base text-gray-500">{formatDate(new Date(ev.date))} | {ev.startTime}~{ev.endTime}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-purple-50 rounded-2xl shadow-lg p-6 border-2 border-purple-200">
                  <h2 className="text-2xl font-bold text-purple-800 flex items-center gap-2 mb-4">
                    <CalendarDays className="w-7 h-7" /> 고정 프로그램
                  </h2>
                  <div className="space-y-3">
                    {Object.entries(fixedPrograms).filter(([_, p]) => p.enabled && p.dates?.length > 0).map(([key, prog]) => (
                      <div key={key} className="bg-white rounded-lg p-4 flex items-center gap-3">
                        <span className="text-2xl">{FIXED_INFO[key]?.icon}</span>
                        <div>
                          <p className="font-bold text-lg text-gray-800">{key === 'monthIntro' ? `${userInfo.month}${FIXED_INFO[key]?.name}` : FIXED_INFO[key]?.name}</p>
                          <p className="text-base text-gray-500">{prog.dates.map(d => formatDate(new Date(d))).join(', ')} | {prog.startTime}~{prog.endTime}</p>
                        </div>
                      </div>
                    ))}
                    {Object.entries(fixedPrograms).filter(([_, p]) => p.enabled && p.dates?.length > 0).length === 0 && (
                      <p className="text-base text-gray-500">선택된 고정 프로그램이 없습니다.</p>
                    )}
                  </div>
                </div>

                {selectedExt.length > 0 && (
                  <div className="bg-cyan-50 rounded-2xl shadow-lg p-6 border-2 border-cyan-200">
                    <h2 className="text-2xl font-bold text-cyan-800 flex items-center gap-2 mb-4">
                      <Users className="w-7 h-7" /> 내외부 프로그램
                    </h2>
                    <div className="space-y-3">
                      {selectedExt.map(idx => {
                        const prog = EXTERNAL_PROGRAMS[idx];
                        const schedule = extSchedules[idx] || {};
                        return (
                          <div key={idx} className="bg-white rounded-lg p-4 flex items-center gap-3">
                            <span className="text-2xl">{prog.icon}</span>
                            <div>
                              <p className="font-bold text-lg text-gray-800">
                                {prog.name}
                                <span className={`ml-2 text-base ${prog.type === '협' ? 'text-red-500' : 'text-gray-500'}`}>({prog.type})</span>
                              </p>
                              <p className="text-base text-gray-500">
                                {schedule.dates?.length > 0 ? schedule.dates.map(d => formatDate(new Date(d))).join(', ') : '날짜 미선택'}
                                {schedule.startTime && schedule.endTime && ` | ${schedule.startTime}~${schedule.endTime}`}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button onClick={() => setShowPreview(true)} className="w-full py-5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-bold text-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all">
                  <CalendarDays className="w-6 h-6" /> {userInfo.month}월 계획서 미리보기
                </button>

                <ProgramDBBrowser
                  currentMonth={userInfo.month}
                  wheelchair={userInfo.wheelchair}
                  cognitiveInfo={{ cognitive: userInfo.cognitive, cognitiveLevel: userInfo.cognitiveLevel }}
                />

                <div className="flex gap-4">
                  <button onClick={() => setStep(2)} className="flex-1 py-4 bg-gray-200 rounded-xl font-bold text-lg">← 이전 단계로</button>
                  <button onClick={() => setShowFinalPlan(true)} className="flex-1 py-5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold text-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all">
                    <Printer className="w-6 h-6" /> {userInfo.month}월 주간활동 계획서 만들기
                  </button>
                </div>
          </div>
        )}
      </main>

      {showPreview && <SchedulePreviewModal year={2026} month={userInfo.month} events={events} fixedPrograms={fixedPrograms} externalPrograms={selectedExt} externalSchedules={extSchedules} dismissalTime={userInfo.dismissalTime} title="계획서 미리보기" onClose={() => setShowPreview(false)} />}
      {showFinalPlan && <SchedulePreviewModal year={2026} month={userInfo.month} events={events} fixedPrograms={fixedPrograms} externalPrograms={selectedExt} externalSchedules={extSchedules} dismissalTime={userInfo.dismissalTime} title="주간활동 계획서" onClose={() => setShowFinalPlan(false)} isFinal={true} />}
    </div>
  );
}

function FixedItem({ pKey, prog, info, month, dismissalTime, onToggle, onDateToggle, onTimeChange }) {
  const [showCal, setShowCal] = useState(false);
  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex items-start gap-3">
        <button onClick={onToggle} className={`w-7 h-7 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${prog.enabled ? 'bg-purple-500 border-purple-500' : 'border-gray-300'}`}>
          {prog.enabled && <Check className="w-5 h-5 text-white" />}
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-lg">
            <span className="text-xl">{info.icon}</span>
            <span className="font-medium">{pKey === 'monthIntro' ? `${month}${info.name}` : info.name}</span>
          </div>
          {prog.rule && <p className="text-base text-gray-500 mt-1">📌 {prog.rule}</p>}
          {prog.enabled && (
            <div className="mt-3 space-y-3">
              <div className="relative">
                <button onClick={() => setShowCal(!showCal)} className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-base font-medium flex items-center gap-2">
                  <Calendar className="w-5 h-5" /> 날짜 선택 {prog.dates?.length > 0 && `(${prog.dates.length})`}
                </button>
                {showCal && <MiniCalendar year={2026} month={month} selectedDates={prog.dates || []} onDateToggle={onDateToggle} onClose={() => setShowCal(false)} />}
              </div>
              {prog.dates?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {prog.dates.map(d => <span key={d} className="px-3 py-1 bg-purple-100 rounded-lg text-base text-purple-700">{formatDate(new Date(d))}</span>)}
                </div>
              )}
              <div className="flex items-center gap-2">
                <TimeSelect value={prog.startTime} onChange={v => onTimeChange('startTime', v)} label="시작" />
                <span className="text-gray-400 text-lg">~</span>
                <TimeSelect value={prog.endTime || dismissalTime} onChange={v => onTimeChange('endTime', v)} label="종료" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ExtItem({ idx, prog, schedule, month, onDateToggle, onTimeChange }) {
  const [showCal, setShowCal] = useState(false);
  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex items-center gap-2 text-lg mb-3">
        <span className="text-xl">{prog.icon}</span>
        <span className="font-medium">{prog.name}</span>
        <span className={`font-bold ${prog.type === '협' ? 'text-red-500' : 'text-gray-500'}`}>({prog.type})</span>
      </div>
      <div className="space-y-3">
        <div className="relative">
          <button onClick={() => setShowCal(!showCal)} className="px-4 py-2 bg-cyan-100 text-cyan-700 rounded-lg text-base font-medium flex items-center gap-2">
            <Calendar className="w-5 h-5" /> 날짜 선택 {schedule.dates?.length > 0 && `(${schedule.dates.length})`}
          </button>
          {showCal && <MiniCalendar year={2026} month={month} selectedDates={schedule.dates || []} onDateToggle={onDateToggle} onClose={() => setShowCal(false)} />}
        </div>
        {schedule.dates?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {schedule.dates.map(d => <span key={d} className="px-3 py-1 bg-cyan-100 rounded-lg text-base text-cyan-700">{formatDate(new Date(d))}</span>)}
          </div>
        )}
        <div className="flex items-center gap-2">
          <TimeSelect value={schedule.startTime || ''} onChange={v => onTimeChange('startTime', v)} label="시작" />
          <span className="text-gray-400 text-lg">~</span>
          <TimeSelect value={schedule.endTime || ''} onChange={v => onTimeChange('endTime', v)} label="종료" />
        </div>
      </div>
    </div>
  );
}

