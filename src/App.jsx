import React, { useState, useEffect } from 'react';
import { Calendar, Users, Sparkles, ChevronLeft, ChevronRight, Check, X, Printer, Plus, Loader2, PartyPopper, CalendarDays, Download } from 'lucide-react';

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
  { name: '태권도', type: '외', icon: '🥋' }, { name: '떡공예', type: '외', icon: '🍡' },
  { name: '샌드아트', type: '강', icon: '🏖️' }, { name: '난타A', type: '강', icon: '🪘' },
  { name: '난타B', type: '강', icon: '🪘' }, { name: '도예', type: '협', icon: '🏺' },
  { name: '플라워아트', type: '강', icon: '💐' }, { name: '아이드림', type: '협', icon: '⭐' }
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

const SchedulePreviewModal = ({ year, month, events = [], fixedPrograms = {}, externalPrograms = [], externalSchedules = {}, participatory = [], selectedParticipatory = [], participatorySchedules = {}, creative = [], selectedCreative = [], creativeSchedules = {}, dismissalTime, title, onClose, isFinal }) => {
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
    selectedParticipatory.forEach(idx => {
      const s = participatorySchedules[idx], prog = participatory[idx];
      s?.dates?.includes(dateStr) && prog && result.push({ type: 'participatory', name: prog.title, startTime: s.startTime, endTime: s.endTime });
    });
    selectedCreative.forEach(idx => {
      const s = creativeSchedules[idx], prog = creative[idx];
      s?.dates?.includes(dateStr) && prog && result.push({ type: 'creative', name: prog.title, startTime: s.startTime, endTime: s.endTime });
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
      // XML 특수문자 이스케이프
      const esc = (s) => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

      // 스타일 정의 헬퍼
      const border = `<Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/></Borders>`;
      const mkStyle = (id, bg, fg, b, sz, ha='Center') =>
        `<Style ss:ID="${id}"><Interior ss:Color="${bg}" ss:Pattern="Solid"/><Font ss:Color="${fg}" ss:Bold="${b?1:0}" ss:Size="${sz}" ss:FontName="맑은 고딕"/><Alignment ss:Horizontal="${ha}" ss:Vertical="Center" ss:WrapText="1"/>${border}</Style>`;

      const stylesXml = `<Styles>
        ${mkStyle('hdr','#6366F1','#FFFFFF',1,15)}
        ${mkStyle('sub','#FFFFFF','#666666',0,11)}
        ${mkStyle('spc','#FFFFFF','#FFFFFF',0,4)}
        ${mkStyle('l_ev','#FF6B6B','#FFFFFF',1,11)} ${mkStyle('l_fi','#74B9FF','#FFFFFF',1,11)}
        ${mkStyle('l_ex','#A29BFE','#FFFFFF',1,11)} ${mkStyle('l_pa','#55EFC4','#000000',1,11)}
        ${mkStyle('l_cr','#FDCB6E','#000000',1,11)} ${mkStyle('l_lu','#FFCCCC','#000000',1,11)}
        ${mkStyle('w_hd','#E5E7EB','#000000',1,12,'Left')}
        ${mkStyle('c_hd','#F3F4F6','#000000',1,11)} ${mkStyle('c_ho','#F3F4F6','#DC2626',1,11)}
        ${mkStyle('t_ce','#F9FAFB','#000000',0,10)} ${mkStyle('g_ce','#F3F4F6','#000000',0,10)}
        ${mkStyle('ev_c','#FF6B6B','#FFFFFF',1,10)} ${mkStyle('fi_c','#74B9FF','#FFFFFF',1,10)}
        ${mkStyle('ex_c','#A29BFE','#FFFFFF',1,10)} ${mkStyle('pa_c','#55EFC4','#000000',1,10)}
        ${mkStyle('cr_c','#FDCB6E','#000000',1,10)} ${mkStyle('lu_c','#FFCCCC','#000000',0,10)}
        ${mkStyle('ho_c','#FEE2E2','#DC2626',1,12)} ${mkStyle('em_c','#FFFFFF','#000000',0,10)}
      </Styles>`;

      // 열 커버리지 추적 (병합 셀 rowspan 처리)
      const cov = {};
      const buildRow = (specs, h) => {
        let xml = h ? `<Row ss:Height="${h}">` : '<Row>';
        let col = 1;
        const newCov = {};
        specs.forEach(sp => {
          while (cov[col]) col++;
          const ma = sp.ma || 0, md = sp.md || 0;
          let a = `ss:StyleID="${sp.st}" ss:Index="${col}"`;
          if (ma) a += ` ss:MergeAcross="${ma}"`;
          if (md) {
            a += ` ss:MergeDown="${md}"`;
            for (let c = col; c <= col + ma; c++) newCov[c] = md;
          }
          xml += sp.v != null
            ? `<Cell ${a}><Data ss:Type="String">${esc(sp.v)}</Data></Cell>`
            : `<Cell ${a}/>`;
          col += ma + 1;
        });
        xml += '</Row>';
        // 커버리지 갱신: 기존 감소 → 신규 추가
        Object.keys(cov).forEach(k => { cov[k]--; if (cov[k] <= 0) delete cov[k]; });
        Object.entries(newCov).forEach(([k, v]) => { cov[k] = v; });
        return xml;
      };

      let rows = '';
      // 타이틀
      rows += buildRow([{ st:'hdr', v:`📋 ${year}년 ${month}월 ${title}`, ma:5 }], 36);
      rows += buildRow([{ st:'sub', v:'성인 발달장애인 주간활동센터', ma:5 }], 26);
      rows += buildRow([{ st:'spc', ma:5 }], 8);
      // 범례
      rows += buildRow([
        {st:'l_ev',v:'전체행사'},{st:'l_fi',v:'고정프로그램'},{st:'l_ex',v:'내외부프로그램'},
        {st:'l_pa',v:'참여형프로그램'},{st:'l_cr',v:'창의형프로그램'},{st:'l_lu',v:'점심시간'},
      ], 28);
      rows += buildRow([{ st:'spc', ma:5 }], 8);

      weeks.forEach((wk, wi) => {
        const wd = getWeekDates(wk);
        // 주차 제목
        rows += buildRow([{ st:'w_hd', v:`📌 ${wi+1}주차`, ma:5 }], 30);
        // 요일 행 (시간 MergeDown:1 → 2행 병합)
        rows += buildRow([
          { st:'c_hd', v:'시간', md:1 },
          ...['월','화','수','목','금'].map((d, i) => ({ st: wd[i]?.isHoliday ? 'c_ho' : 'c_hd', v:`${d}요일` })),
        ], 26);
        // 날짜 행 (1열은 위 병합으로 커버됨)
        rows += buildRow(wd.map(info => {
          if (!info) return { st:'c_hd', v:'' };
          return { st: info.isHoliday ? 'c_ho' : 'c_hd', v:`${info.day}일${info.holidayName ? ' ('+info.holidayName+')' : ''}` };
        }), 26);
        // 시간대별 행
        timeSlots.forEach((slot, slotIdx) => {
          const specs = [{ st:'t_ce', v:slot }];
          wd.forEach(info => {
            if (!info) { specs.push({ st:'g_ce', v:'' }); return; }
            if (info.isHoliday) {
              if (slotIdx === 0) specs.push({ st:'ho_c', v: info.holidayName || '휴일', md: timeSlots.length - 1 });
              return; // 병합된 셀은 생략
            }
            if (slot === '12:00~13:00') { specs.push({ st:'lu_c', v:'점심식사 및 위생지원' }); return; }
            const scheds = getAtTime(info.dateStr, slot);
            if (scheds.length) {
              const s = scheds[0];
              const st = s.type==='event' ? 'ev_c' : s.type==='external' ? 'ex_c' :
                         s.type==='participatory' ? 'pa_c' : s.type==='creative' ? 'cr_c' : 'fi_c';
              specs.push({ st, v: s.name === '월을 소개합니다' ? `${month}월을 소개합니다` : s.name });
            } else {
              specs.push({ st:'em_c', v:'' });
            }
          });
          rows += buildRow(specs, 30);
        });
        rows += buildRow([{ st:'spc', ma:5 }], 10);
      });

      // Excel XML Spreadsheet 정식 포맷 (경고 없음)
      const xml = [
        `<?xml version="1.0" encoding="UTF-8"?>`,
        `<?mso-application progid="Excel.Sheet"?>`,
        `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"`,
        ` xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"`,
        ` xmlns:x="urn:schemas-microsoft-com:office:excel"`,
        ` xmlns:o="urn:schemas-microsoft-com:office:office">`,
        stylesXml,
        `<Worksheet ss:Name="${esc(month+'월 계획서')}">`,
        `<Table>`,
        `<Column ss:Width="90"/><Column ss:Width="120"/><Column ss:Width="120"/>`,
        `<Column ss:Width="120"/><Column ss:Width="120"/><Column ss:Width="120"/>`,
        rows,
        `</Table></Worksheet></Workbook>`,
      ].join('');

      const blob = new Blob(['\uFEFF' + xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${year}년_${month}월_주간활동계획서.xls`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
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

        <table className="w-full border-collapse mb-4" style={{tableLayout: 'fixed'}}>
          <tbody>
            <tr>
              <td className="text-center p-3 border-2 border-black font-bold" style={{backgroundColor: '#ff6b6b', color: 'white'}}>전체행사</td>
              <td className="text-center p-3 border-2 border-black font-bold" style={{backgroundColor: '#74b9ff', color: 'white'}}>고정프로그램</td>
              <td className="text-center p-3 border-2 border-black font-bold" style={{backgroundColor: '#a29bfe', color: 'white'}}>내외부프로그램</td>
              <td className="text-center p-3 border-2 border-black font-bold" style={{backgroundColor: '#55efc4', color: 'black'}}>참여형프로그램</td>
              <td className="text-center p-3 border-2 border-black font-bold" style={{backgroundColor: '#fdcb6e', color: 'black'}}>창의형프로그램</td>
              <td className="text-center p-3 border-2 border-black font-bold" style={{backgroundColor: '#ffcccc', color: 'black'}}>점심시간</td>
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
                        const bg = s.type === 'event' ? '#ff6b6b' : s.type === 'external' ? '#a29bfe' : s.type === 'participatory' ? '#55efc4' : s.type === 'creative' ? '#fdcb6e' : '#74b9ff';
                        const textColor = (s.type === 'participatory' || s.type === 'creative') ? '#000' : '#fff';
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
          /* 모든 요소 숨김 */
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            visibility: hidden;
            overflow: visible !important;
          }
          html { overflow: visible !important; }
          /* fixed 모달을 일반 흐름으로 */
          .fixed {
            position: static !important;
            overflow: visible !important;
          }
          * { overflow: visible !important; }
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
  const [participatory, setParticipatory] = useState([]);
  const [creative, setCreative] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedParticipatory, setSelectedParticipatory] = useState([]);
  const [selectedCreative, setSelectedCreative] = useState([]);
  const [participatorySchedules, setParticipatorySchedules] = useState({});
  const [creativeSchedules, setCreativeSchedules] = useState({});

  const toggleParticipatory = (idx) => {
    if (selectedParticipatory.includes(idx)) {
      setSelectedParticipatory(prev => prev.filter(i => i !== idx));
      setParticipatorySchedules(prev => { const n = {...prev}; delete n[idx]; return n; });
    } else {
      setSelectedParticipatory(prev => [...prev, idx]);
    }
  };

  const toggleCreative = (idx) => {
    if (selectedCreative.includes(idx)) {
      setSelectedCreative(prev => prev.filter(i => i !== idx));
      setCreativeSchedules(prev => { const n = {...prev}; delete n[idx]; return n; });
    } else {
      setSelectedCreative(prev => [...prev, idx]);
    }
  };

  const toggleParticipatoryDate = (idx, date) => {
    setParticipatorySchedules(prev => {
      const cur = prev[idx]?.dates || [];
      return { ...prev, [idx]: { ...prev[idx], dates: cur.includes(date) ? cur.filter(d => d !== date) : [...cur, date].sort() } };
    });
  };

  const toggleCreativeDate = (idx, date) => {
    setCreativeSchedules(prev => {
      const cur = prev[idx]?.dates || [];
      return { ...prev, [idx]: { ...prev[idx], dates: cur.includes(date) ? cur.filter(d => d !== date) : [...cur, date].sort() } };
    });
  };

  useEffect(() => {
    const y = 2026, fw = getFirstWeekday(y, userInfo.month), ff = getFirstFriday(y, userInfo.month), tf = getThirdFriday(y, userInfo.month), et = userInfo.dismissalTime === '16:00' ? '16:00' : '17:00';
    setFixedPrograms(p => ({
      ...p,
      monthIntro: { ...p.monthIntro, dates: fw ? [fw] : [] },
      safetyEducation: { ...p.safetyEducation, dates: ff ? [ff] : [] },
      birthday: { ...p.birthday, dates: tf ? [tf] : [], endTime: et, rule: `셋째주 금요일 13:00~${et}` }
    }));
  }, [userInfo.month, userInfo.dismissalTime]);

  useEffect(() => {
    if (step === 3 && !participatory.length) {
      setLoading(true);
      const { cognitive, cognitiveLevel, wheelchair } = userInfo;

      setTimeout(() => {
        let participatoryList = [];
        let creativeList = [];

        if (cognitive === '상' || cognitiveLevel === '중학생') {
          participatoryList = [
            { title: '모닝 피트니스', category: '운동', icon: '🏃', desc: '체계적인 아침 운동 프로그램' },
            { title: '생활 속 경제교실', category: '일반교육', icon: '💰', desc: '용돈 관리와 경제 개념 학습' },
            { title: '문화예술 탐방', category: '문화활동', icon: '🎭', desc: '미술관, 공연장 방문 체험' },
            { title: '직업체험 프로젝트', category: '새로운경험', icon: '💼', desc: '다양한 직업 현장 체험' },
            { title: '토론과 발표', category: '사회성', icon: '🎤', desc: '주제별 토론 및 발표 연습' }
          ];
          creativeList = [
            { title: '밴드 합주', category: '음악활동', icon: '🎸', desc: '악기 연주 및 합주 활동' },
            { title: '미디어 아트', category: '미술/공예', icon: '🖼️', desc: '디지털 도구 활용 창작' },
            { title: '도시농부 프로젝트', category: '식물가꾸기', icon: '🌿', desc: '텃밭 가꾸기와 수확' },
            { title: '영상 크리에이터', category: '미디어', icon: '🎬', desc: '영상 촬영 및 편집' }
          ];
        } else if (cognitive === '중' || cognitiveLevel === '초등 고학년') {
          participatoryList = [
            { title: '굿모닝 스트레칭', category: '운동', icon: '🤸', desc: '간단한 스트레칭과 체조' },
            { title: '슬기로운 생활백서', category: '일반교육', icon: '📚', desc: '일상생활 기술 배우기' },
            { title: '마을 탐험대', category: '문화활동', icon: '🗺️', desc: '지역사회 시설 방문' },
            { title: '요리조리 쿠킹', category: '새로운경험', icon: '👨‍🍳', desc: '간단한 요리 만들기' },
            { title: '친구와 함께', category: '사회성', icon: '🤝', desc: '협동 게임 및 활동' }
          ];
          creativeList = [
            { title: '신나는 음악교실', category: '음악활동', icon: '🎵', desc: '노래 부르기와 리듬악기' },
            { title: '알록달록 미술놀이', category: '미술/공예', icon: '🎨', desc: '다양한 재료로 작품 만들기' },
            { title: '초록초록 식물교실', category: '식물가꾸기', icon: '🌱', desc: '화분 가꾸기와 관찰' },
            { title: '사진 찍기', category: '미디어', icon: '📸', desc: '사진 촬영과 앨범 만들기' }
          ];
        } else {
          participatoryList = [
            { title: '몸 튼튼 체조', category: '운동', icon: '🎈', desc: wheelchair ? '앉아서 하는 가벼운 체조' : '음악에 맞춰 즐거운 체조' },
            { title: '오감 놀이', category: '감각활동', icon: '✋', desc: '다양한 감각 자극 활동' },
            { title: '동화 나라', category: '문화활동', icon: '📖', desc: '동화 듣기와 역할놀이' },
            { title: '자연 놀이터', category: '새로운경험', icon: '🍃', desc: '자연물 탐색 및 놀이' },
            { title: '인사해요', category: '사회성', icon: '👋', desc: '인사하기와 감정 표현' }
          ];
          creativeList = [
            { title: '둥둥 북치기', category: '음악활동', icon: '🥁', desc: '타악기 연주와 리듬놀이' },
            { title: '손도장 미술', category: '미술/공예', icon: '🖐️', desc: '손과 발을 이용한 미술' },
            { title: '꽃잎 관찰', category: '식물가꾸기', icon: '🌸', desc: '꽃과 나뭇잎 관찰하기' },
            { title: '스티커 놀이', category: '미술/공예', icon: '⭐', desc: '스티커 붙이기 활동' }
          ];
        }

        setParticipatory(participatoryList);
        setCreative(creativeList);
        setLoading(false);
      }, 1000);
    }
  }, [step, participatory.length, userInfo]);

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
          <h1 className="text-3xl font-bold flex items-center gap-2"><Sparkles className="w-9 h-9" />주간활동서비스 계획서 작성 도우미</h1>
          <p className="text-base mt-2 opacity-90">성인 발달장애인 주간활동센터</p>
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
            {loading ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 flex flex-col items-center">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
                <p className="text-lg text-gray-600">이용자 특성에 맞는 프로그램을 추천하고 있습니다...</p>
                <p className="text-base text-gray-400 mt-2">인지능력: {userInfo.cognitive} | 인지수준: {userInfo.cognitiveLevel}</p>
              </div>
            ) : (
              <>
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

                <div className="bg-emerald-50 rounded-2xl shadow-lg p-6 border-2 border-emerald-200">
                  <h2 className="text-2xl font-bold text-emerald-800 mb-2">🤝 참여형 프로그램 추천</h2>
                  <p className="text-base text-emerald-600 mb-4">이용자 특성(인지능력: {userInfo.cognitive}, 인지수준: {userInfo.cognitiveLevel})에 맞는 프로그램입니다.</p>
                  <div className="space-y-3">
                    {participatory.map((p, i) => {
                      const isSelected = selectedParticipatory.includes(i);
                      return (
                        <div key={i} className={`bg-white rounded-lg p-4 border-2 transition-all ${isSelected ? 'border-emerald-500' : 'border-transparent'}`}>
                          <div className="flex items-center gap-3">
                            <button onClick={() => toggleParticipatory(i)} className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                              {isSelected && <Check className="w-5 h-5 text-white" />}
                            </button>
                            <span className="text-3xl">{p.icon}</span>
                            <div className="flex-1">
                              <p className="font-bold text-lg">{p.title}</p>
                              <p className="text-base text-gray-500">{p.category} | {p.desc}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <ProgramScheduleItem
                              schedule={participatorySchedules[i] || {}}
                              month={userInfo.month}
                              onDateToggle={(d) => toggleParticipatoryDate(i, d)}
                              onTimeChange={(f, v) => setParticipatorySchedules(prev => ({...prev, [i]: {...prev[i], [f]: v}}))}
                              color="emerald"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-amber-50 rounded-2xl shadow-lg p-6 border-2 border-amber-200">
                  <h2 className="text-2xl font-bold text-amber-800 mb-2">🎨 창의형 프로그램 추천</h2>
                  <p className="text-base text-amber-600 mb-4">이용자 특성에 맞는 창의 활동입니다.</p>
                  <div className="space-y-3">
                    {creative.map((p, i) => {
                      const isSelected = selectedCreative.includes(i);
                      return (
                        <div key={i} className={`bg-white rounded-lg p-4 border-2 transition-all ${isSelected ? 'border-amber-500' : 'border-transparent'}`}>
                          <div className="flex items-center gap-3">
                            <button onClick={() => toggleCreative(i)} className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-amber-500 border-amber-500' : 'border-gray-300'}`}>
                              {isSelected && <Check className="w-5 h-5 text-white" />}
                            </button>
                            <span className="text-3xl">{p.icon}</span>
                            <div className="flex-1">
                              <p className="font-bold text-lg">{p.title}</p>
                              <p className="text-base text-gray-500">{p.category} | {p.desc}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <ProgramScheduleItem
                              schedule={creativeSchedules[i] || {}}
                              month={userInfo.month}
                              onDateToggle={(d) => toggleCreativeDate(i, d)}
                              onTimeChange={(f, v) => setCreativeSchedules(prev => ({...prev, [i]: {...prev[i], [f]: v}}))}
                              color="amber"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(2)} className="flex-1 py-4 bg-gray-200 rounded-xl font-bold text-lg">← 이전 단계로</button>
                  <button onClick={() => setShowFinalPlan(true)} className="flex-1 py-5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold text-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all">
                    <Printer className="w-6 h-6" /> {userInfo.month}월 주간활동 계획서 만들기
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {showPreview && <SchedulePreviewModal year={2026} month={userInfo.month} events={events} fixedPrograms={fixedPrograms} externalPrograms={selectedExt} externalSchedules={extSchedules} participatory={participatory} selectedParticipatory={selectedParticipatory} participatorySchedules={participatorySchedules} creative={creative} selectedCreative={selectedCreative} creativeSchedules={creativeSchedules} dismissalTime={userInfo.dismissalTime} title="계획서 미리보기" onClose={() => setShowPreview(false)} />}
      {showFinalPlan && <SchedulePreviewModal year={2026} month={userInfo.month} events={events} fixedPrograms={fixedPrograms} externalPrograms={selectedExt} externalSchedules={extSchedules} participatory={participatory} selectedParticipatory={selectedParticipatory} participatorySchedules={participatorySchedules} creative={creative} selectedCreative={selectedCreative} creativeSchedules={creativeSchedules} dismissalTime={userInfo.dismissalTime} title="주간활동 계획서" onClose={() => setShowFinalPlan(false)} isFinal={true} />}
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

function ProgramScheduleItem({ schedule, month, onDateToggle, onTimeChange, color }) {
  const [showCal, setShowCal] = useState(false);
  const bgColor = color === 'emerald' ? 'bg-emerald-100' : 'bg-amber-100';
  const textColor = color === 'emerald' ? 'text-emerald-700' : 'text-amber-700';

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
      <div className="relative">
        <button onClick={() => setShowCal(!showCal)} className={`px-4 py-2 ${bgColor} ${textColor} rounded-lg text-base font-medium flex items-center gap-2`}>
          <Calendar className="w-5 h-5" /> 날짜 선택 {schedule.dates?.length > 0 && `(${schedule.dates.length})`}
        </button>
        {showCal && <MiniCalendar year={2026} month={month} selectedDates={schedule.dates || []} onDateToggle={onDateToggle} onClose={() => setShowCal(false)} />}
      </div>
      {schedule.dates?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {schedule.dates.map(d => <span key={d} className={`px-3 py-1 ${bgColor} rounded-lg text-base ${textColor}`}>{formatDate(new Date(d))}</span>)}
        </div>
      )}
      <div className="flex items-center gap-2">
        <TimeSelect value={schedule.startTime || ''} onChange={v => onTimeChange('startTime', v)} label="시작" />
        <span className="text-gray-400 text-lg">~</span>
        <TimeSelect value={schedule.endTime || ''} onChange={v => onTimeChange('endTime', v)} label="종료" />
      </div>
    </div>
  );
}
