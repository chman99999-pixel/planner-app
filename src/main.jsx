import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AccessGate from './components/AccessGate.jsx'

function Root() {
  // 'checking' | 'granted' | 'denied'
  const [authState, setAuthState] = useState('checking');

  useEffect(() => {
    const check = async () => {
      // 이미 이번 세션에서 인증됐으면 바로 통과
      if (sessionStorage.getItem('access_granted') === 'true') {
        setAuthState('granted');
        return;
      }

      // URL ?ac= 파라미터 확인
      const params = new URLSearchParams(window.location.search);
      const ac = params.get('ac');
      if (ac) {
        // URL에서 ac 즉시 제거 (노출 방지)
        params.delete('ac');
        const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
        window.history.replaceState(null, '', newUrl);

        // 코드 검증
        try {
          const res = await fetch('/api/getConfig');
          const data = await res.json();
          if (ac === data.accessCode) {
            sessionStorage.setItem('access_granted', 'true');
            setAuthState('granted');
            return;
          }
        } catch {
          // 오류 시 수동 입력 화면으로
        }
      }

      setAuthState('denied');
    };

    check();
  }, []);

  if (authState === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-indigo-400 text-sm">잠시만 기다려 주세요...</p>
      </div>
    );
  }

  if (authState === 'denied') {
    return <AccessGate onGranted={() => setAuthState('granted')} />;
  }

  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
