import React, { useState, useEffect } from 'react';
import { Calendar, Users, Sparkles, ChevronLeft, ChevronRight, Check, X, Printer, Plus, PartyPopper, CalendarDays, Download } from 'lucide-react';
import ProgramDBBrowser from './ProgramDBBrowser.jsx';
import { PROGRAM_DB } from './data/programs.js';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

const HOLIDAYS_2026 = {
  '2026-01-01': '신정', '2026-02-16': '설날 연휴', '2026-02-17': '설날',
  '2026-02-18': '설날 연휴', '2026-03-01': '삼일절', '2026-03-02': '대체공휴일',
  '2026-05-05': '어린이날', '2026-05-24': '부처님오신날', '2026-05-25': '대체공휴일',
  '2026-06-06': '현충일', '2026-08-15': '광복절', '2026-08-17': '대체공휴일',
  '2026-10-03': '개천절', '2026-10-04': '추석 연휴', '2026-10-05': '추석',
  '2026-10-06': '추석 연휴', '2026-10-09': '한글날', '2026-12-25': '크리스마스'
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

  useEffect(() => { setCYear(year); setCMonth(month - 1); }, [year, month]);

  const daysInMonth = new Date(cYear, cMonth + 1, 0).getDate();
  const firstDay = new Date(cYear, cMonth, 1).getDay();
  const days = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const isSelected = (day) => day && selectedDates.includes(`${cYear}-${String(cMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  const isWkday = (day) => day && isWeekday(new Date(cYear, cMonth, day));

  return (
    <div className="absolute z-50 bg-white rounded-xl shadow-xl p-4 border border-gray-300" style={{ minWidth: '280px' }}>
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => cMonth === 0 ? (setCMonth(11), setCYear(cYear - 1)) : setCMonth(cMonth - 1)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <span className="font-bold text-base text-gray-800">{cYear}년 {MONTHS[cMonth]}</span>
        <button onClick={() => cMonth === 11 ? (setCMonth(0), setCYear(cYear + 1)) : setCMonth(cMonth + 1)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-sm mb-1">
        {WEEKDAYS.map((d, i) => <div key={d} className={`text-center py-1 font-bold ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'}`}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => (
          <button key={i} onClick={() => day && isWkday(day) && onDateToggle(`${cYear}-${String(cMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)}
            disabled={!day || !isWkday(day)}
            className={`aspect-square rounded-lg text-sm font-medium transition-colors
              ${!day ? 'invisible' : ''}
              ${day && !isWkday(day) ? 'text-gray-300 cursor-not-allowed' : ''}
              ${day && isWkday(day) && !isSelected(day) ? 'hover:bg-indigo-100 text-gray-700' : ''}
              ${isSelected(day) ? 'bg-indigo-600 text-white font-bold' : ''}`}>
            {day}
          </button>
        ))}
      </div>
      <button onClick={onClose} className="mt-3 w-full py-2 bg-indigo-600 text-white rounded-lg text-base font-bold hover:bg-indigo-700 transition-colors">확인</button>
    </div>
  );
};

const TimeSelect = ({ value, onChange, label }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)}
    className="px-3 py-2.5 border-2 border-gray-300 rounded-lg text-base text-gray-800 bg-white focus:outline-none focus:border-indigo-500 font-medium">
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
      return { dateStr: ds, day: d.getDate(), isHoliday: holidayName !== '' || d.getDay() === 0 || d.getDay() === 6, holidayName };
    });
  };

  const downloadExcelFile = () => {
    try {
      const esc = (s) => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      const border = `<Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/></Borders>`;
      const mkStyle = (id, bg, fg, b, sz, ha='Center') =>
        `<Style ss:ID="${id}"><Interior ss:Color="${bg}" ss:Pattern="Solid"/><Font ss:Color="${fg}" ss:Bold="${b?1:0}" ss:Size="${sz}" ss:FontName="맑은 고딕"/><Alignment ss:Horizontal="${ha}" ss:Vertical="Center" ss:WrapText="1"/>${border}</Style>`;
      const stylesXml = `<Styles>
        ${mkStyle('hdr','#4338CA','#FFFFFF',1,15)}
        ${mkStyle('sub','#FFFFFF','#555555',0,11)}
        ${mkStyle('spc','#FFFFFF','#FFFFFF',0,4)}
        ${mkStyle('l_ev','#DC2626','#FFFFFF',1,11)} ${mkStyle('l_fi','#1D4ED8','#FFFFFF',1,11)}
        ${mkStyle('l_ex','#7C3AED','#FFFFFF',1,11)}
        ${mkStyle('w_hd','#D1D5DB','#111827',1,12,'Left')}
        ${mkStyle('c_hd','#E5E7EB','#111827',1,11)} ${mkStyle('c_ho','#E5E7EB','#DC2626',1,11)}
        ${mkStyle('t_ce','#F3F4F6','#374151',0,10)} ${mkStyle('g_ce','#E5E7EB','#374151',0,10)}
        ${mkStyle('ev_c','#DC2626','#FFFFFF',1,10)} ${mkStyle('fi_c','#1D4ED8','#FFFFFF',1,10)}
        ${mkStyle('ex_c','#7C3AED','#FFFFFF',1,10)} ${mkStyle('lu_c','#FCA5A5','#7F1D1D',0,10)}
        ${mkStyle('ho_c','#FEE2E2','#DC2626',1,12)} ${mkStyle('em_c','#FFFFFF','#000000',0,10)}
      </Styles>`;
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
          if (md) { a += ` ss:MergeDown="${md}"`; for (let c = col; c <= col + ma; c++) newCov[c] = md; }
          xml += sp.v != null ? `<Cell ${a}><Data ss:Type="String">${esc(sp.v)}</Data></Cell>` : `<Cell ${a}/>`;
          col += ma + 1;
        });
        xml += '</Row>';
        Object.keys(cov).forEach(k => { cov[k]--; if (cov[k] <= 0) delete cov[k]; });
        Object.entries(newCov).forEach(([k, v]) => { cov[k] = v; });
        return xml;
      };
      let rows = '';
      rows += buildRow([{ st:'hdr', v:`📋 ${year}년 ${month}월 ${title}`, ma:5 }], 36);
      rows += buildRow([{ st:'sub', v:'성인 발달장애인 주간활동센터', ma:5 }], 26);
      rows += buildRow([{ st:'spc', ma:5 }], 8);
      rows += buildRow([{st:'l_ev',v:'전체행사',ma:1},{st:'l_fi',v:'고정프로그램',ma:1},{st:'l_ex',v:'내외부프로그램',ma:1}], 28);
      rows += buildRow([{ st:'spc', ma:5 }], 8);
      weeks.forEach((wk, wi) => {
        const wd = getWeekDates(wk);
        rows += buildRow([{ st:'w_hd', v:`📌 ${wi+1}주차`, ma:5 }], 30);
        rows += buildRow([{ st:'c_hd', v:'시간', md:1 }, ...['월','화','수','목','금'].map((d, i) => ({ st: wd[i]?.isHoliday ? 'c_ho' : 'c_hd', v:`${d}요일` }))], 26);
        rows += buildRow(wd.map(info => {
          if (!info) return { st:'c_hd', v:'' };
          return { st: info.isHoliday ? 'c_ho' : 'c_hd', v:`${info.day}일${info.holidayName ? ' ('+info.holidayName+')' : ''}` };
        }), 26);
        timeSlots.forEach((slot, slotIdx) => {
          const specs = [{ st:'t_ce', v:slot }];
          wd.forEach(info => {
            if (!info) { specs.push({ st:'g_ce', v:'' }); return; }
            if (info.isHoliday) { if (slotIdx === 0) specs.push({ st:'ho_c', v: info.holidayName || '휴일', md: timeSlots.length - 1 }); return; }
            if (slot === '12:00~13:00') { specs.push({ st:'lu_c', v:'점심식사 및 위생지원' }); return; }
            const scheds = getAtTime(info.dateStr, slot);
            if (scheds.length) {
              const s = scheds[0];
              const st = s.type==='event' ? 'ev_c' : s.type==='external' ? 'ex_c' : 'fi_c';
              specs.push({ st, v: s.name === '월을 소개합니다' ? `${month}월을 소개합니다` : s.name });
            } else specs.push({ st:'em_c', v:'' });
          });
          rows += buildRow(specs, 30);
        });
        rows += buildRow([{ st:'spc', ma:5 }], 10);
      });
      const xml = [`<?xml version="1.0" encoding="UTF-8"?>`,`<?mso-application progid="Excel.Sheet"?>`,
        `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:o="urn:schemas-microsoft-com:office:office">`,
        stylesXml, `<Worksheet ss:Name="${esc(month+'월 계획서')}">`, `<Table>`,
        `<Column ss:Width="90"/><Column ss:Width="120"/><Column ss:Width="120"/><Column ss:Width="120"/><Column ss:Width="120"/><Column ss:Width="120"/>`,
        rows, `</Table></Worksheet></Workbook>`].join('');
      const blob = new Blob(['\uFEFF' + xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${year}년_${month}월_주간활동계획서.xls`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) { alert('엑셀 파일 생성에 실패했습니다: ' + e.message); }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b-2 border-gray-300 p-3 print:hidden shadow-sm">
        <div className="flex justify-center gap-3">
          <button onClick={downloadExcelFile} className="px-5 py-2.5 bg-indigo-700 text-white text-base font-bold rounded-lg flex items-center gap-2 hover:bg-indigo-800 transition-colors">
            <Download className="w-5 h-5" /> 엑셀 다운로드
          </button>
          <button onClick={() => window.print()} className="px-5 py-2.5 bg-slate-700 text-white text-base font-bold rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors">
            <Printer className="w-5 h-5" /> 인쇄
          </button>
          <button onClick={onClose} className="px-5 py-2.5 bg-white text-gray-700 text-base font-bold rounded-lg border-2 border-gray-400 hover:bg-gray-50 transition-colors">✕ 닫기</button>
        </div>
      </div>

      <div id="schedule-table-area" className="p-4 max-w-5xl mx-auto">
        {/* 제목 */}
        <table className="w-full border-collapse mb-3" style={{tableLayout:'fixed'}}>
          <tbody>
            <tr><td colSpan={6} className="text-center p-4 text-2xl font-bold text-white border-2 border-gray-800" style={{backgroundColor:'#4338CA'}}>📋 {year}년 {month}월 {title}</td></tr>
            <tr><td colSpan={6} className="text-center p-2 text-base font-medium text-gray-600 border-2 border-gray-800 border-t-0">성인 발달장애인 주간활동센터</td></tr>
          </tbody>
        </table>
        {/* 범례 */}
        <table className="w-full border-collapse mb-4" style={{tableLayout:'fixed'}}>
          <tbody>
            <tr>
              <td colSpan={2} className="text-center p-3 border-2 border-gray-800 text-base font-bold text-white" style={{backgroundColor:'#DC2626'}}>전체행사</td>
              <td colSpan={2} className="text-center p-3 border-2 border-gray-800 text-base font-bold text-white" style={{backgroundColor:'#1D4ED8'}}>고정프로그램</td>
              <td colSpan={2} className="text-center p-3 border-2 border-gray-800 text-base font-bold text-white" style={{backgroundColor:'#7C3AED'}}>내외부프로그램</td>
            </tr>
          </tbody>
        </table>

        {weeks.map((wk, wi) => {
          const wd = getWeekDates(wk);
          return (
            <div key={wi} className="mb-5 border-2 border-gray-800">
              <div className="px-4 py-2.5 font-bold border-b-2 border-gray-800 bg-gray-200 text-base text-gray-900">{wi + 1}주차</div>
              <table className="w-full border-collapse text-sm" style={{tableLayout:'fixed'}}>
                <thead>
                  <tr>
                    <th rowSpan={2} className="border-2 border-gray-700 p-2 bg-gray-100 align-middle text-base font-bold text-gray-800" style={{width:'80px'}}>시간</th>
                    {['월','화','수','목','금'].map((d,i) => (
                      <th key={d} className={`border-2 border-gray-700 p-2 bg-gray-100 text-base font-bold ${wd[i]?.isHoliday ? 'text-red-600' : 'text-gray-800'}`} style={{width:'18%'}}>{d}요일</th>
                    ))}
                  </tr>
                  <tr>
                    {['월','화','수','목','금'].map((d,i) => (
                      <th key={d} className={`border-2 border-gray-700 p-2 bg-gray-100 text-sm font-semibold ${wd[i]?.isHoliday ? 'text-red-600' : 'text-gray-700'}`} style={{width:'18%'}}>
                        {wd[i] ? `${wd[i].day}일` : ''}
                        {wd[i]?.holidayName && <span className="block text-red-600 text-xs font-bold">({wd[i].holidayName})</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot, slotIdx) => (
                    <tr key={slot}>
                      <td className="border-2 border-gray-600 p-1.5 bg-gray-50 text-center text-sm font-semibold text-gray-700">{slot}</td>
                      {wd.map((info, i) => {
                        if (!info) return <td key={i} className="border-2 border-gray-600 bg-gray-200"></td>;
                        if (info.isHoliday) {
                          if (slotIdx === 0) return (
                            <td key={i} rowSpan={timeSlots.length} className="border-2 border-gray-600 text-center text-red-600 font-bold text-lg align-middle" style={{backgroundColor:'#FEE2E2'}}>
                              {info.holidayName || '휴일'}
                            </td>
                          );
                          return null;
                        }
                        if (slot === '12:00~13:00') return (
                          <td key={i} className="border-2 border-gray-600 text-center text-sm font-bold text-red-900" style={{backgroundColor:'#FECACA'}}>점심식사 및 위생지원</td>
                        );
                        const scheds = getAtTime(info.dateStr, slot);
                        if (!scheds.length) return <td key={i} className="border-2 border-gray-600 bg-white"></td>;
                        const s = scheds[0];
                        const bg = s.type === 'event' ? '#DC2626' : s.type === 'external' ? '#7C3AED' : '#1D4ED8';
                        const displayName = s.name === '월을 소개합니다' ? `${month}월을 소개합니다` : s.name;
                        return <td key={i} className="border-2 border-gray-600 p-1 text-center text-sm font-bold text-white" style={{backgroundColor:bg}}>{displayName}</td>;
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
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; visibility: hidden; overflow: visible !important; margin: 0 !important; padding: 0 !important; }
          html { overflow: visible !important; margin: 0 !important; padding: 0 !important; }
          * { overflow: visible !important; }
          .fixed { position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; overflow: visible !important; }
          #schedule-table-area, #schedule-table-area * { visibility: visible !important; }
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

  const stepLabels = ['기본 정보', '프로그램 설정', '완성 및 출력'];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
      <header className="bg-white border-b-2 border-gray-300 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-700 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">계획서해방</h1>
              <p className="text-sm text-gray-500 mt-0.5 font-medium">주간활동 계획서 자동 작성</p>
            </div>
          </div>
        </div>
      </header>

      {/* 스텝 인디케이터 */}
      <div className="bg-white border-b-2 border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-0">
            {[1, 2, 3].map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base font-bold transition-colors border-2 ${step >= s ? 'bg-indigo-700 text-white border-indigo-700' : 'bg-white text-gray-400 border-gray-300'}`}>{s}</div>
                  <span className={`text-sm font-bold hidden sm:block ${step >= s ? 'text-indigo-700' : 'text-gray-400'}`}>{stepLabels[i]}</span>
                </div>
                {s < 3 && <div className={`flex-1 h-0.5 mx-3 ${step > s ? 'bg-indigo-500' : 'bg-gray-300'}`}></div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-6 pb-10">

        {/* ─── STEP 1 ─── */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-6 space-y-5">
            <div className="border-b-2 border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" /> 기본 정보 설정
              </h2>
              <p className="text-sm text-gray-500 mt-1">계획서 작성에 필요한 기본 설정입니다</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-base font-bold text-gray-800 mb-2">월 선택</label>
                <select value={userInfo.month} onChange={e => setUserInfo({...userInfo, month: +e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-base font-medium text-gray-800 bg-white focus:outline-none focus:border-indigo-500">
                  {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-base font-bold text-gray-800 mb-2">하원 시간</label>
                <div className="flex gap-3">
                  {['16:00','17:00'].map(t => (
                    <button key={t} onClick={() => setUserInfo({...userInfo, dismissalTime: t})}
                      className={`flex-1 py-3 rounded-xl border-2 text-base font-bold transition-colors ${userInfo.dismissalTime === t ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300 text-gray-700 bg-white hover:border-indigo-400'}`}>{t}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-base font-bold text-gray-800 mb-2">휠체어 사용</label>
                <div className="flex gap-3">
                  {[false, true].map(v => (
                    <button key={String(v)} onClick={() => setUserInfo({...userInfo, wheelchair: v})}
                      className={`flex-1 py-3 rounded-xl border-2 text-base font-bold transition-colors ${userInfo.wheelchair === v ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300 text-gray-700 bg-white hover:border-indigo-400'}`}>{v ? '예' : '아니오'}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-base font-bold text-gray-800 mb-2">인지능력</label>
                <div className="flex gap-3">
                  {['상', '중', '하'].map(level => (
                    <button key={level} onClick={() => setUserInfo({...userInfo, cognitive: level})}
                      className={`flex-1 py-3 rounded-xl border-2 text-base font-bold transition-colors ${userInfo.cognitive === level ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300 text-gray-700 bg-white hover:border-indigo-400'}`}>{level}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-base font-bold text-gray-800 mb-2">인지수준</label>
                <div className="grid grid-cols-2 gap-3">
                  {['유치원', '초등 저학년', '초등 고학년', '중학생'].map(level => (
                    <button key={level} onClick={() => setUserInfo({...userInfo, cognitiveLevel: level})}
                      className={`py-3 rounded-xl border-2 text-base font-bold transition-colors ${userInfo.cognitiveLevel === level ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300 text-gray-700 bg-white hover:border-indigo-400'}`}>{level}</button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={() => setStep(2)}
              className="w-full py-4 bg-indigo-700 text-white rounded-xl font-bold text-lg hover:bg-indigo-800 transition-colors mt-2">
              다음 단계 →
            </button>
          </div>
        )}

        {/* ─── STEP 2 ─── */}
        {step === 2 && (
          <div className="space-y-4">
            {/* 전체 행사 */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-gray-100">
                <div className="w-1.5 h-6 bg-red-500 rounded-full"></div>
                <h2 className="text-lg font-bold text-gray-900">전체 행사</h2>
              </div>
              <div className="relative">
                <button onClick={() => setShowEventCal(!showEventCal)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-800 rounded-lg text-base font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors border-2 border-gray-300">
                  <Plus className="w-5 h-5" /> 행사 추가
                </button>
                {showEventCal && (
                  <MiniCalendar year={2026} month={userInfo.month} selectedDates={events.map(e => e.date)}
                    onDateToggle={d => events.find(e => e.date === d) ? setEvents(events.filter(e => e.date !== d)) : setEvents([...events, { date: d, name: '', startTime: '09:00', endTime: '17:00' }])}
                    onClose={() => setShowEventCal(false)} />
                )}
              </div>
              {events.length > 0 && (
                <div className="mt-3 space-y-2">
                  {events.map((ev, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-3 flex items-center gap-2 border-2 border-gray-200">
                      <span className="text-sm font-bold text-gray-700 whitespace-nowrap w-20">{formatDate(new Date(ev.date))}</span>
                      <input value={ev.name} onChange={e => { const n = [...events]; n[i].name = e.target.value; setEvents(n); }}
                        placeholder="행사명" className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg text-base font-medium focus:outline-none focus:border-indigo-500" />
                      <TimeSelect value={ev.startTime} onChange={v => { const n = [...events]; n[i].startTime = v; setEvents(n); }} label="시작" />
                      <TimeSelect value={ev.endTime} onChange={v => { const n = [...events]; n[i].endTime = v; setEvents(n); }} label="종료" />
                      <button onClick={() => setEvents(events.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500 transition-colors"><X className="w-5 h-5" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 고정 프로그램 */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-gray-100">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                <h2 className="text-lg font-bold text-gray-900">고정 프로그램</h2>
              </div>
              <div className="space-y-2">
                {Object.entries(fixedPrograms).map(([key, prog]) => (
                  <FixedItem key={key} pKey={key} prog={prog} info={FIXED_INFO[key]} month={userInfo.month} dismissalTime={userInfo.dismissalTime}
                    onToggle={() => setFixedPrograms(p => ({...p, [key]: {...p[key], enabled: !p[key].enabled}}))}
                    onDateToggle={d => toggleFixedDate(key, d)}
                    onTimeChange={(f, v) => setFixedPrograms(p => ({...p, [key]: {...p[key], [f]: v}}))} />
                ))}
              </div>
            </div>

            {/* 내외부 프로그램 */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-1 pb-3 border-b-2 border-gray-100">
                <div className="w-1.5 h-6 bg-violet-600 rounded-full"></div>
                <h2 className="text-lg font-bold text-gray-900">내외부 프로그램</h2>
                <span className="ml-auto text-sm font-bold text-gray-500">최대 5개 ({selectedExt.length}/5)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 mb-4">
                {EXTERNAL_PROGRAMS.map((prog, idx) => {
                  const sel = selectedExt.includes(idx), dis = !sel && selectedExt.length >= 5;
                  return (
                    <button key={idx} onClick={() => !dis && toggleExt(idx)} disabled={dis}
                      className={`p-3 rounded-xl border-2 text-left text-sm font-semibold transition-colors ${sel ? 'border-indigo-600 bg-indigo-600 text-white' : dis ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed' : 'border-gray-300 bg-white hover:border-indigo-400 text-gray-800'}`}>
                      <span>{prog.icon} {prog.name}</span>
                      <span className={`ml-1 font-bold ${sel ? 'text-indigo-200' : prog.type === '협' ? 'text-red-500' : 'text-gray-400'}`}>({prog.type})</span>
                    </button>
                  );
                })}
              </div>
              {selectedExt.length > 0 && (
                <div className="space-y-2 border-t-2 border-gray-200 pt-4">
                  {selectedExt.map(idx => (
                    <ExtItem key={idx} idx={idx} prog={EXTERNAL_PROGRAMS[idx]} schedule={extSchedules[idx] || {}} month={userInfo.month}
                      onDateToggle={d => toggleExtDate(idx, d)}
                      onTimeChange={(f, v) => setExtSchedules(p => ({...p, [idx]: {...p[idx], [f]: v}}))} />
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-4 bg-white text-gray-700 rounded-xl font-bold text-base border-2 border-gray-300 hover:bg-gray-50 transition-colors">← 이전</button>
              <button onClick={() => setStep(3)} className="flex-1 py-4 bg-indigo-700 text-white rounded-xl font-bold text-base hover:bg-indigo-800 transition-colors">다음 →</button>
            </div>
          </div>
        )}

        {/* ─── STEP 3 ─── */}
        {step === 3 && (
          <div className="space-y-4">
            {events.filter(e => e.name).length > 0 && (
              <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-3 pb-3 border-b-2 border-gray-100">
                  <div className="w-1.5 h-6 bg-red-500 rounded-full"></div>
                  <h2 className="text-lg font-bold text-gray-900">전체 행사</h2>
                </div>
                <div className="space-y-2">
                  {events.filter(e => e.name).map((ev, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4 flex items-center gap-3 border-2 border-gray-200">
                      <span className="text-2xl">🎉</span>
                      <div>
                        <p className="font-bold text-base text-gray-900">{ev.name}</p>
                        <p className="text-sm text-gray-600 mt-0.5 font-medium">{formatDate(new Date(ev.date))} · {ev.startTime}~{ev.endTime}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3 pb-3 border-b-2 border-gray-100">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                <h2 className="text-lg font-bold text-gray-900">고정 프로그램</h2>
              </div>
              <div className="space-y-2">
                {Object.entries(fixedPrograms).filter(([_, p]) => p.enabled && p.dates?.length > 0).map(([key, prog]) => (
                  <div key={key} className="bg-gray-50 rounded-xl p-4 flex items-center gap-3 border-2 border-gray-200">
                    <span className="text-2xl">{FIXED_INFO[key]?.icon}</span>
                    <div>
                      <p className="font-bold text-base text-gray-900">{key === 'monthIntro' ? `${userInfo.month}${FIXED_INFO[key]?.name}` : FIXED_INFO[key]?.name}</p>
                      <p className="text-sm text-gray-600 mt-0.5 font-medium">{prog.dates.map(d => formatDate(new Date(d))).join(', ')} · {prog.startTime}~{prog.endTime}</p>
                    </div>
                  </div>
                ))}
                {Object.entries(fixedPrograms).filter(([_, p]) => p.enabled && p.dates?.length > 0).length === 0 && (
                  <p className="text-base text-gray-500 font-medium">선택된 고정 프로그램이 없습니다.</p>
                )}
              </div>
            </div>

            {selectedExt.length > 0 && (
              <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-3 pb-3 border-b-2 border-gray-100">
                  <div className="w-1.5 h-6 bg-violet-600 rounded-full"></div>
                  <h2 className="text-lg font-bold text-gray-900">내외부 프로그램</h2>
                </div>
                <div className="space-y-2">
                  {selectedExt.map(idx => {
                    const prog = EXTERNAL_PROGRAMS[idx];
                    const schedule = extSchedules[idx] || {};
                    return (
                      <div key={idx} className="bg-gray-50 rounded-xl p-4 flex items-center gap-3 border-2 border-gray-200">
                        <span className="text-2xl">{prog.icon}</span>
                        <div>
                          <p className="font-bold text-base text-gray-900">
                            {prog.name}
                            <span className={`ml-2 text-sm font-bold ${prog.type === '협' ? 'text-red-600' : 'text-gray-500'}`}>({prog.type})</span>
                          </p>
                          <p className="text-sm text-gray-600 mt-0.5 font-medium">
                            {schedule.dates?.length > 0 ? schedule.dates.map(d => formatDate(new Date(d))).join(', ') : '날짜 미선택'}
                            {schedule.startTime && schedule.endTime && ` · ${schedule.startTime}~${schedule.endTime}`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button onClick={() => setShowPreview(true)}
              className="w-full py-4 bg-white text-indigo-700 rounded-xl font-bold text-base border-2 border-indigo-500 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
              <CalendarDays className="w-5 h-5" /> {userInfo.month}월 계획서 미리보기
            </button>

            <ProgramDBBrowser
              currentMonth={userInfo.month}
              wheelchair={userInfo.wheelchair}
              cognitiveInfo={{ cognitive: userInfo.cognitive, cognitiveLevel: userInfo.cognitiveLevel }}
            />

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-4 bg-white text-gray-700 rounded-xl font-bold text-base border-2 border-gray-300 hover:bg-gray-50 transition-colors">← 이전</button>
              <button onClick={() => setShowFinalPlan(true)}
                className="flex-1 py-4 bg-indigo-700 text-white rounded-xl font-bold text-base hover:bg-indigo-800 transition-colors flex items-center justify-center gap-2">
                <Printer className="w-5 h-5" /> {userInfo.month}월 계획서 만들기
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
    <div className={`rounded-xl border-2 transition-colors ${prog.enabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'}`}>
      <div className="flex items-start gap-3 p-3.5">
        <button onClick={onToggle}
          className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${prog.enabled ? 'bg-indigo-600 border-indigo-600' : 'border-gray-400 bg-white'}`}>
          {prog.enabled && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{info.icon}</span>
            <span className={`text-base font-bold ${prog.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
              {pKey === 'monthIntro' ? `${month}${info.name}` : info.name}
            </span>
          </div>
          {prog.rule && <p className="text-sm text-gray-500 mt-0.5 font-medium">{prog.rule}</p>}
          {prog.enabled && (
            <div className="mt-3 space-y-2.5">
              <div className="relative">
                <button onClick={() => setShowCal(!showCal)}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors border-2 border-gray-300">
                  <Calendar className="w-4 h-4" /> 날짜 선택 {prog.dates?.length > 0 && `(${prog.dates.length})`}
                </button>
                {showCal && <MiniCalendar year={2026} month={month} selectedDates={prog.dates || []} onDateToggle={onDateToggle} onClose={() => setShowCal(false)} />}
              </div>
              {prog.dates?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {prog.dates.map(d => <span key={d} className="px-2.5 py-1 bg-indigo-100 rounded-lg text-sm text-indigo-800 font-bold border border-indigo-300">{formatDate(new Date(d))}</span>)}
                </div>
              )}
              <div className="flex items-center gap-2">
                <TimeSelect value={prog.startTime} onChange={v => onTimeChange('startTime', v)} label="시작" />
                <span className="text-gray-500 text-base font-bold">~</span>
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
    <div className="bg-gray-50 rounded-xl border-2 border-gray-200 p-3.5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{prog.icon}</span>
        <span className="text-base font-bold text-gray-900">{prog.name}</span>
        <span className={`text-sm font-bold ${prog.type === '협' ? 'text-red-600' : 'text-gray-500'}`}>({prog.type})</span>
      </div>
      <div className="space-y-2.5">
        <div className="relative">
          <button onClick={() => setShowCal(!showCal)}
            className="px-3 py-2 bg-white text-gray-700 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-100 transition-colors border-2 border-gray-300">
            <Calendar className="w-4 h-4" /> 날짜 선택 {schedule.dates?.length > 0 && `(${schedule.dates.length})`}
          </button>
          {showCal && <MiniCalendar year={2026} month={month} selectedDates={schedule.dates || []} onDateToggle={onDateToggle} onClose={() => setShowCal(false)} />}
        </div>
        {schedule.dates?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {schedule.dates.map(d => <span key={d} className="px-2.5 py-1 bg-indigo-100 rounded-lg text-sm text-indigo-800 font-bold border border-indigo-300">{formatDate(new Date(d))}</span>)}
          </div>
        )}
        <div className="flex items-center gap-2">
          <TimeSelect value={schedule.startTime || ''} onChange={v => onTimeChange('startTime', v)} label="시작" />
          <span className="text-gray-500 text-base font-bold">~</span>
          <TimeSelect value={schedule.endTime || ''} onChange={v => onTimeChange('endTime', v)} label="종료" />
        </div>
      </div>
    </div>
  );
}
