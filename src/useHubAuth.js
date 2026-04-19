import { useState, useEffect } from 'react';

const STORAGE_KEY = 'bokseobangHubSession';

// URL 쿼리/해시에서 token 추출 후 주소표시줄에서 즉시 제거
function popTokenFromUrl() {
  if (typeof window === 'undefined') return null;

  // 1) ?token=... 쿼리 파라미터 우선
  const params = new URLSearchParams(window.location.search);
  const qToken = params.get('token');
  if (qToken) {
    params.delete('token');
    const newUrl =
      window.location.pathname +
      (params.toString() ? '?' + params.toString() : '') +
      window.location.hash;
    window.history.replaceState(null, '', newUrl);
    return qToken;
  }

  // 2) #token=... 해시 (레거시 호환)
  const hash = window.location.hash || '';
  const m = hash.match(/(?:^#|&)token=([^&]+)/);
  if (!m) return null;
  const token = decodeURIComponent(m[1]);
  const cleanHash = hash.replace(/(?:^#|&)token=[^&]+/, '').replace(/^#&/, '#');
  const newUrl =
    window.location.pathname +
    window.location.search +
    (cleanHash === '#' ? '' : cleanHash);
  window.history.replaceState(null, '', newUrl);
  return token;
}

export function useHubAuth() {
  const [state, setState] = useState({
    status: 'loading', // 'loading' | 'authenticated' | 'unauthenticated' | 'expired'
    user: null,
    error: null,
    expiresAt: null, // ms epoch
  });

  useEffect(() => {
    let cancelled = false;

    async function verify(token) {
      try {
        // planner-app에 HUB_JWT_SECRET 없이 복서방 중앙 검증 엔드포인트 사용
        // (CORS * 허용, 복서방에서 시크릿 일원 관리)
        const resp = await fetch('https://www.bokji-ai.co.kr/api/hub?action=verifyToken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await resp.json();
        if (cancelled) return;

        if (!resp.ok || !data.valid) {
          sessionStorage.removeItem(STORAGE_KEY);
          setState({
            status: data.error?.includes('만료') || data.code === 'TokenExpiredError' ? 'expired' : 'unauthenticated',
            user: null,
            error: data.error || '인증에 실패했습니다.',
            expiresAt: null,
          });
          return;
        }

        // 복서방 verifyToken 응답: { valid, payload }
        const payload = data.payload || {};
        const session = {
          token,
          user: {
            id: payload.sub,
            name: payload.name,
            org: payload.org,
            role: payload.role,
            plan_end: payload.plan_end,
          },
          expiresAt: (payload.exp || 0) * 1000,
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        setState({
          status: 'authenticated',
          user: session.user,
          error: null,
          expiresAt: session.expiresAt,
        });
      } catch (err) {
        if (cancelled) return;
        setState({
          status: 'unauthenticated',
          user: null,
          error: '네트워크 오류가 발생했습니다.',
          expiresAt: null,
        });
      }
    }

    // 1) URL의 새 토큰 우선 (쿼리/해시)
    const newToken = popTokenFromUrl();
    if (newToken) {
      verify(newToken);
      return () => { cancelled = true; };
    }

    // 2) sessionStorage의 기존 세션 시도
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        if (session?.token && session?.expiresAt && Date.now() < session.expiresAt) {
          // 저장된 토큰도 서버 검증 (시크릿 교체 등 대비)
          verify(session.token);
          return () => { cancelled = true; };
        }
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }

    setState({ status: 'unauthenticated', user: null, error: null, expiresAt: null });
    return () => { cancelled = true; };
  }, []);

  // 만료 자동 감지 (30분 타이머)
  useEffect(() => {
    if (state.status !== 'authenticated' || !state.expiresAt) return;
    const ms = state.expiresAt - Date.now();
    if (ms <= 0) {
      setState(s => ({ ...s, status: 'expired', user: null }));
      sessionStorage.removeItem(STORAGE_KEY);
      return;
    }
    const t = setTimeout(() => {
      setState(s => ({ ...s, status: 'expired', user: null }));
      sessionStorage.removeItem(STORAGE_KEY);
    }, ms);
    return () => clearTimeout(t);
  }, [state.status, state.expiresAt]);

  return state;
}
