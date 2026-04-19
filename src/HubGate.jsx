import React from 'react';
import { Sparkles, Lock, AlertCircle } from 'lucide-react';
import { useHubAuth } from './useHubAuth';

const HUB_URL = 'https://www.bokji-ai.co.kr/';

export default function HubGate({ children }) {
  const { status, user, error } = useHubAuth();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-indigo-500 mx-auto animate-pulse" />
          <p className="mt-4 text-gray-600">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  if (status === 'authenticated') {
    return (
      <>
        <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-2 text-sm text-indigo-800 text-center">
          <span className="font-semibold">{user.name}</span> 선생님 · {user.org || '복서방'} 허브 세션 (30분)
        </div>
        {children}
      </>
    );
  }

  // unauthenticated / expired
  const isExpired = status === 'expired';
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${isExpired ? 'bg-amber-100' : 'bg-rose-100'}`}>
          {isExpired ? <AlertCircle className="w-9 h-9 text-amber-500" /> : <Lock className="w-9 h-9 text-rose-500" />}
        </div>
        <h1 className="text-2xl font-bold mt-4">
          {isExpired ? '세션이 만료되었어요' : '복서방 로그인이 필요해요'}
        </h1>
        <p className="text-gray-600 mt-3 leading-relaxed">
          {isExpired
            ? '30분 세션이 지났습니다. 복서방 허브에서 다시 접속해주세요.'
            : '계획서 해방은 복서방에 로그인한 선생님만 사용하실 수 있습니다. 허브에서 이 앱을 열어주세요.'}
        </p>
        {error && (
          <p className="text-sm text-rose-500 mt-3">{error}</p>
        )}
        <a
          href={HUB_URL}
          className="inline-block mt-6 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition"
        >
          복서방 허브로 이동 →
        </a>
      </div>
    </div>
  );
}
