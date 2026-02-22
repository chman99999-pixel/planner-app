import React, { useState } from 'react';
import { Lock } from 'lucide-react';

export default function AccessGate({ onGranted }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const verify = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/getConfig');
      const data = await res.json();
      if (code.trim() === data.accessCode) {
        sessionStorage.setItem('access_granted', 'true');
        onGranted();
      } else {
        setError('접근 코드가 올바르지 않습니다.');
      }
    } catch {
      setError('확인 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-indigo-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">계획서 해방</h1>
        <p className="text-sm text-gray-500 mb-6">접근 코드를 입력하세요</p>
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && verify()}
          placeholder="접근 코드"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-300 mb-3"
          autoFocus
        />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <button
          onClick={verify}
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-60"
        >
          {loading ? '확인 중...' : '입장하기'}
        </button>
        <p className="text-xs text-gray-400 mt-4">복지인 서류해방 회원만 이용 가능합니다</p>
      </div>
    </div>
  );
}
