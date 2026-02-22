import React, { useState, useMemo } from 'react';
import { PROGRAM_DB } from './data/programs.js';
import { Search, ChevronDown, ChevronUp, X, Sparkles, BookOpen } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: '전체', color: 'bg-gray-500' },
  { id: '🎵 음악/예능',    label: '🎵 음악/예능',    color: 'bg-pink-500' },
  { id: '🎨 미술/공예',    label: '🎨 미술/공예',    color: 'bg-orange-500' },
  { id: '🧠 인지/학습',    label: '🧠 인지/학습',    color: 'bg-blue-500' },
  { id: '💆 신체/건강',    label: '💆 신체/건강',    color: 'bg-green-500' },
  { id: '💛 정서/관계',    label: '💛 정서/관계',    color: 'bg-yellow-500' },
  { id: '🎲 여가/놀이',    label: '🎲 여가/놀이',    color: 'bg-purple-500' },
  { id: '🌍 사회참여/외부', label: '🌍 사회참여',   color: 'bg-teal-500' },
  { id: '🏠 자립생활',     label: '🏠 자립생활',    color: 'bg-amber-600' },
  { id: '🌿 계절/자연',    label: '🌿 계절/자연',   color: 'bg-lime-600' },
  { id: '📅 기념일특화',   label: '📅 기념일',      color: 'bg-rose-500' },
  { id: '🤖 AI활용',      label: '🤖 AI활용',      color: 'bg-sky-500' },
  { id: '📸 미디어',      label: '📸 미디어',      color: 'bg-violet-500' },
  { id: '👷 직업',        label: '👷 직업',        color: 'bg-stone-500' },
];

// 서브카테고리 → 대분류 매핑
const CATEGORY_PARENT = {
  '🤖 AI·창작': '🤖 AI활용', '🤖 AI·음악': '🤖 AI활용', '🤖 AI·글쓰기': '🤖 AI활용',
  '🤖 AI·학습': '🤖 AI활용', '🤖 AI·신체': '🤖 AI활용', '🤖 AI·게임': '🤖 AI활용',
  '🤖 AI·진로': '🤖 AI활용', '🤖 AI·미디어': '🤖 AI활용', '🤖 AI·자립': '🤖 AI활용',
  '📸 미디어·사진': '📸 미디어', '📸 미디어·영상': '📸 미디어', '📸 미디어·방송': '📸 미디어',
  '📸 미디어·디자인': '📸 미디어', '📸 미디어·글쓰기': '📸 미디어', '📸 미디어·교육': '📸 미디어',
  '📸 미디어·SNS': '📸 미디어', '📸 미디어·오디오': '📸 미디어', '📸 미디어·AI': '📸 미디어',
  '👷 직업·탐색': '👷 직업', '👷 직업·기초': '👷 직업', '👷 직업·실습': '👷 직업', '👷 직업·역량': '👷 직업',
};
const getParentCategory = (cat) => CATEGORY_PARENT[cat] || cat;

const CAT_BG = {
  '🎵 음악/예능':    'bg-pink-50 border-pink-200',
  '🎨 미술/공예':    'bg-orange-50 border-orange-200',
  '🧠 인지/학습':    'bg-blue-50 border-blue-200',
  '💆 신체/건강':    'bg-green-50 border-green-200',
  '💛 정서/관계':    'bg-yellow-50 border-yellow-200',
  '🎲 여가/놀이':    'bg-purple-50 border-purple-200',
  '🌍 사회참여/외부': 'bg-teal-50 border-teal-200',
  '🏠 자립생활':     'bg-amber-50 border-amber-200',
  '🌿 계절/자연':    'bg-lime-50 border-lime-200',
  '📅 기념일특화':   'bg-rose-50 border-rose-200',
  '🤖 AI활용':      'bg-sky-50 border-sky-200',
  '📸 미디어':      'bg-violet-50 border-violet-200',
  '👷 직업':        'bg-stone-50 border-stone-200',
};

const CAT_BADGE = {
  '🎵 음악/예능':    'bg-pink-100 text-pink-700',
  '🎨 미술/공예':    'bg-orange-100 text-orange-700',
  '🧠 인지/학습':    'bg-blue-100 text-blue-700',
  '💆 신체/건강':    'bg-green-100 text-green-700',
  '💛 정서/관계':    'bg-yellow-100 text-yellow-700',
  '🎲 여가/놀이':    'bg-purple-100 text-purple-700',
  '🌍 사회참여/외부': 'bg-teal-100 text-teal-700',
  '🏠 자립생활':     'bg-amber-100 text-amber-700',
  '🌿 계절/자연':    'bg-lime-100 text-lime-700',
  '📅 기념일특화':   'bg-rose-100 text-rose-700',
  '🤖 AI활용':      'bg-sky-100 text-sky-700',
  '📸 미디어':      'bg-violet-100 text-violet-700',
  '👷 직업':        'bg-stone-100 text-stone-700',
};

const COG_LABEL = { 1: '인지 낮음', 2: '인지 중간', 3: '인지 높음' };
const COG_COLOR = { 1: 'bg-red-100 text-red-700', 2: 'bg-yellow-100 text-yellow-700', 3: 'bg-green-100 text-green-700' };
const WC_LABEL  = { O: '휠체어 가능', '△': '휠체어 일부', X: '휠체어 어려움' };
const WC_COLOR  = { O: 'bg-blue-100 text-blue-700', '△': 'bg-gray-200 text-gray-600', X: 'bg-red-100 text-red-500' };
const IN_COLOR  = { '실내': 'bg-indigo-100 text-indigo-700', '실외': 'bg-emerald-100 text-emerald-700', '실내/외': 'bg-cyan-100 text-cyan-700' };

// 현재 월에 추천되는 프로그램인지 확인
const isRecommendedForMonth = (prog, month) => {
  if (!prog.months) return false;
  const m = prog.months;
  if (m === '1-12') return true;
  const rangeMatch = m.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) {
    const [, from, to] = rangeMatch.map(Number);
    return month >= from && month <= to;
  }
  const nums = m.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  return nums.includes(month);
};

/* ───────── 프로그램 카드 ───────── */
function ProgramCard({ prog, currentMonth }) {
  const [expanded, setExpanded] = useState(false);
  const badgeColor = CAT_BADGE[prog.category] || CAT_BADGE[getParentCategory(prog.category)] || 'bg-gray-100 text-gray-700';
  const recommended = isRecommendedForMonth(prog, currentMonth);

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-md transition-all">
      <div className="p-4">
        {/* 뱃지 */}
        <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
          <span className={`text-sm px-2.5 py-0.5 rounded-lg font-bold ${badgeColor}`}>
            {prog.category}
          </span>
          {recommended && (
            <span className="text-sm px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 font-bold border border-indigo-200">
              {currentMonth}월 추천 ★
            </span>
          )}
          {prog.holiday && (
            <span className="text-sm px-2.5 py-0.5 rounded-lg bg-rose-100 text-rose-700 font-bold border border-rose-200">
              {prog.holiday}
            </span>
          )}
        </div>

        {/* 제목 + 설명 */}
        <h3 className="font-bold text-gray-900 text-base leading-snug">{prog.title}</h3>
        <p className="text-gray-600 text-sm mt-1 leading-relaxed">{prog.desc}</p>

        {/* 태그 */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {prog.cognitiveLevel.map(lv => (
            <span key={lv} className={`text-sm px-2 py-0.5 rounded-lg font-bold ${COG_COLOR[lv]}`}>
              {COG_LABEL[lv]}
            </span>
          ))}
          <span className={`text-sm px-2 py-0.5 rounded-lg font-bold ${WC_COLOR[prog.wheelchair]}`}>
            {WC_LABEL[prog.wheelchair]}
          </span>
          <span className={`text-sm px-2 py-0.5 rounded-lg font-bold ${IN_COLOR[prog.indoor] || 'bg-gray-100 text-gray-700'}`}>
            {prog.indoor}
          </span>
          <span className="text-sm px-2 py-0.5 rounded-lg bg-gray-100 text-gray-700 font-bold">
            {prog.duration}분
          </span>
        </div>
      </div>

      {/* 펼치기 */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2.5 bg-gray-50 border-t border-gray-100 text-sm font-bold text-gray-500 flex items-center justify-center gap-1.5 hover:bg-gray-100 transition-colors"
      >
        {expanded ? <><ChevronUp className="w-4 h-4" /> 접기</> : <><ChevronDown className="w-4 h-4" /> 자세히 보기</>}
      </button>

      {/* 상세 */}
      {expanded && (
        <div className="px-4 pb-4 pt-3 bg-gray-50 space-y-3 border-t border-gray-100">
          {prog.materials && (
            <div>
              <p className="text-sm font-bold text-gray-800 mb-1">준비물</p>
              <p className="text-sm text-gray-600 leading-relaxed">{prog.materials}</p>
            </div>
          )}
          {prog.summary && (
            <div>
              <p className="text-sm font-bold text-gray-800 mb-1">활동 내용</p>
              <p className="text-sm text-gray-600 leading-relaxed">{prog.summary}</p>
            </div>
          )}
          {prog.effects && (
            <div>
              <p className="text-sm font-bold text-gray-800 mb-1">기대 효과</p>
              <p className="text-sm text-gray-600 leading-relaxed">{prog.effects}</p>
            </div>
          )}
          {prog.note && (
            <div>
              <p className="text-sm font-bold text-gray-800 mb-1">비고</p>
              <p className="text-sm text-gray-600 leading-relaxed">{prog.note}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ───────── 카테고리 버튼 그리드 ───────── */
function CategoryButtons({ categories, activeCategory, onSelect, counts }) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map(cat => {
        const isActive = activeCategory === cat.id;
        const count = cat.id === 'all' ? null : (counts[cat.id] || 0);
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
              isActive
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 border border-gray-200 hover:border-indigo-200'
            }`}
          >
            {cat.label}
            {count != null && (
              <span className={`ml-1.5 text-sm ${isActive ? 'text-indigo-200' : 'text-gray-400'}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ───────── 메인 브라우저 ───────── */
export default function ProgramDBBrowser({ currentMonth, wheelchair, cognitiveInfo }) {
  const [showFullDB, setShowFullDB] = useState(false);
  // 추천 섹션
  const [recCategory, setRecCategory] = useState('all');
  const [recShowCount, setRecShowCount] = useState(10);
  // 전체 DB 섹션
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [filterCog, setFilterCog] = useState([]);
  const [filterWC, setFilterWC] = useState(false);
  const [filterIndoor, setFilterIndoor] = useState('');
  const [filterMonth, setFilterMonth] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [fullShowCount, setFullShowCount] = useState(10);

  // 인지능력 매핑
  const cogLevel = cognitiveInfo?.cognitive === '상' ? 3 : cognitiveInfo?.cognitive === '중' ? 2 : 1;

  // 추천 프로그램 (현재 월에 해당하는 프로그램만)
  const recommended = useMemo(() => {
    return PROGRAM_DB.filter(p => {
      if (!p.cognitiveLevel.includes(cogLevel)) return false;
      if (wheelchair && p.wheelchair === 'X') return false;
      if (!isRecommendedForMonth(p, currentMonth)) return false;
      return true;
    });
  }, [cogLevel, wheelchair, currentMonth]);

  // 추천 중 카테고리 필터
  const recFiltered = useMemo(() => {
    if (recCategory === 'all') return recommended;
    return recommended.filter(p => p.category === recCategory || getParentCategory(p.category) === recCategory);
  }, [recommended, recCategory]);

  // 추천에 존재하는 카테고리 + 개수
  const recCatCounts = useMemo(() => {
    const counts = {};
    recommended.forEach(p => {
      const parent = getParentCategory(p.category);
      counts[parent] = (counts[parent] || 0) + 1;
      if (parent !== p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    return counts;
  }, [recommended]);

  // 추천에 있는 대분류 카테고리만 필터
  const recCategories = useMemo(() => {
    const available = CATEGORIES.filter(c => c.id === 'all' || recCatCounts[c.id]);
    return available;
  }, [recCatCounts]);

  // 전체 DB 필터
  const filtered = useMemo(() => {
    return PROGRAM_DB.filter(p => {
      if (activeCategory !== 'all' && p.category !== activeCategory && getParentCategory(p.category) !== activeCategory) return false;
      if (searchText && !p.title.includes(searchText) && !p.desc.includes(searchText) && !p.category.includes(searchText)) return false;
      if (filterCog.length > 0 && !filterCog.some(lv => p.cognitiveLevel.includes(lv))) return false;
      if (filterWC && p.wheelchair === 'X') return false;
      if (filterIndoor && p.indoor !== filterIndoor && p.indoor !== '실내/외') return false;
      if (filterMonth && !isRecommendedForMonth(p, currentMonth)) return false;
      return true;
    });
  }, [activeCategory, searchText, filterCog, filterWC, filterIndoor, filterMonth, currentMonth]);

  const toggleCog = (lv) => setFilterCog(prev => prev.includes(lv) ? prev.filter(x => x !== lv) : [...prev, lv]);
  const hasActiveFilter = filterCog.length > 0 || filterWC || filterIndoor || filterMonth || searchText;

  const catCounts = useMemo(() => {
    const counts = { all: PROGRAM_DB.length };
    PROGRAM_DB.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
      const parent = getParentCategory(p.category);
      if (parent !== p.category) {
        counts[parent] = (counts[parent] || 0) + 1;
      }
    });
    return counts;
  }, []);

  const cogLabel = cogLevel === 3 ? '높음' : cogLevel === 2 ? '중간' : '낮음';

  // 카테고리 변경 시 보여주는 개수 초기화
  const handleRecCategory = (id) => {
    setRecCategory(id);
    setRecShowCount(10);
  };
  const handleFullCategory = (id) => {
    setActiveCategory(id);
    setFullShowCount(10);
  };

  return (
    <div className="space-y-4">
      {/* ===== 추천 프로그램 ===== */}
      <div className="bg-white rounded-2xl shadow-md">
        <div className="px-5 pt-5 pb-4">
          {/* 섹션 헤더 */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">이용자 맞춤 추천</h2>
              <p className="text-sm text-gray-500 mt-0.5">인지 {cogLabel}{wheelchair ? ' · 휠체어' : ''} · {currentMonth}월</p>
            </div>
            <span className="text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
              {recommended.length}개
            </span>
          </div>
          <CategoryButtons
            categories={recCategories}
            activeCategory={recCategory}
            onSelect={handleRecCategory}
            counts={recCatCounts}
          />
        </div>

        <div className="px-4 pb-4">
          {recFiltered.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-3xl mb-2">📂</p>
              <p className="text-base font-medium">해당 카테고리에 추천 프로그램이 없습니다</p>
            </div>
          ) : (
            <>
              <p className="text-sm font-bold text-gray-500 mb-3">
                {recFiltered.length}개{recFiltered.length > recShowCount && ` (${recShowCount}개 표시 중)`}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recFiltered.slice(0, recShowCount).map(prog => (
                  <ProgramCard key={prog.id} prog={prog} currentMonth={currentMonth} />
                ))}
              </div>
              {recFiltered.length > recShowCount && (
                <button
                  onClick={() => setRecShowCount(prev => prev + 10)}
                  className="w-full mt-4 py-3 bg-gray-50 text-gray-600 rounded-xl text-base font-bold hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  더보기 ({recFiltered.length - recShowCount}개 남음)
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ===== 전체 프로그램 DB ===== */}
      <div className="bg-white rounded-2xl shadow-md">
        <button
          onClick={() => setShowFullDB(!showFullDB)}
          className="w-full px-5 py-4 flex items-center gap-3 hover:bg-gray-50 rounded-2xl transition-colors"
        >
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-gray-600" />
          </div>
          <div className="text-left flex-1">
            <h2 className="text-lg font-bold text-gray-900">전체 프로그램 DB</h2>
            <p className="text-sm font-medium text-gray-500 mt-0.5">총 {PROGRAM_DB.length}개 · 카테고리별 검색</p>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <span className="text-sm font-bold">{showFullDB ? '접기' : '펼치기'}</span>
            {showFullDB ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {showFullDB && (
          <>
            <div className="px-5 pb-3 border-t border-gray-100 pt-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchText}
                    onChange={e => { setSearchText(e.target.value); setFullShowCount(10); }}
                    placeholder="프로그램명 검색..."
                    className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-xl text-base font-medium focus:border-indigo-500 focus:outline-none"
                  />
                  {searchText && (
                    <button onClick={() => setSearchText('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2.5 border-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-colors ${hasActiveFilter ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'}`}
                >
                  {hasActiveFilter ? `필터 ${[filterCog.length > 0, filterWC, !!filterIndoor, filterMonth].filter(Boolean).length}` : '필터'}
                  {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {showFilters && (
                <div className="mt-3 p-4 bg-gray-50 rounded-xl space-y-3 border border-gray-200">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-bold text-gray-600 w-16">인지레벨</span>
                    {[1, 2, 3].map(lv => (
                      <button key={lv} onClick={() => toggleCog(lv)}
                        className={`text-sm px-3 py-1.5 rounded-xl border-2 font-bold transition-colors ${filterCog.includes(lv) ? COG_COLOR[lv] + ' border-current' : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'}`}>
                        {COG_LABEL[lv]}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-bold text-gray-600 w-16">기타</span>
                    <button onClick={() => setFilterWC(!filterWC)}
                      className={`text-sm px-3 py-1.5 rounded-xl border-2 font-bold transition-colors ${filterWC ? 'bg-indigo-100 text-indigo-800 border-indigo-400' : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'}`}>
                      휠체어 가능
                    </button>
                    {['실내', '실외'].map(v => (
                      <button key={v} onClick={() => setFilterIndoor(filterIndoor === v ? '' : v)}
                        className={`text-sm px-3 py-1.5 rounded-xl border-2 font-bold transition-colors ${filterIndoor === v ? 'bg-indigo-100 text-indigo-800 border-indigo-400' : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'}`}>
                        {v}
                      </button>
                    ))}
                    <button onClick={() => setFilterMonth(!filterMonth)}
                      className={`text-sm px-3 py-1.5 rounded-xl border-2 font-bold transition-colors ${filterMonth ? 'bg-indigo-100 text-indigo-800 border-indigo-400' : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'}`}>
                      {currentMonth}월 추천
                    </button>
                    {hasActiveFilter && (
                      <button onClick={() => { setFilterCog([]); setFilterWC(false); setFilterIndoor(''); setFilterMonth(false); setSearchText(''); }}
                        className="text-sm px-3 py-1.5 rounded-xl border-2 border-red-200 text-red-600 bg-white hover:bg-red-50 font-bold transition-colors">
                        초기화
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-b border-gray-100">
              <CategoryButtons
                categories={CATEGORIES}
                activeCategory={activeCategory}
                onSelect={handleFullCategory}
                counts={catCounts}
              />
            </div>

            <div className="px-4 py-4">
              <p className="text-sm font-bold text-gray-500 mb-3">
                {hasActiveFilter || activeCategory !== 'all'
                  ? <><span className="text-indigo-700">{filtered.length}개</span> 검색됨 (전체 {PROGRAM_DB.length}개)</>
                  : <span>프로그램 이름과 내용을 참고하세요</span>
                }
              </p>

              {filtered.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-3xl mb-2">🔍</p>
                  <p className="text-base font-medium">검색 결과가 없습니다</p>
                  <p className="text-sm mt-1">필터 조건을 바꿔보세요</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filtered.slice(0, fullShowCount).map(prog => (
                      <ProgramCard key={prog.id} prog={prog} currentMonth={currentMonth} />
                    ))}
                  </div>
                  {filtered.length > fullShowCount && (
                    <button
                      onClick={() => setFullShowCount(prev => prev + 10)}
                      className="w-full mt-4 py-3 bg-gray-50 text-gray-600 rounded-xl text-base font-bold hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      더보기 ({filtered.length - fullShowCount}개 남음)
                    </button>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
