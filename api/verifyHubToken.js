import jwt from 'jsonwebtoken';

const HUB_JWT_SECRET = process.env.HUB_JWT_SECRET;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!HUB_JWT_SECRET) {
    console.error('[verifyHubToken] HUB_JWT_SECRET not configured');
    return res.status(500).json({ error: '서버 설정 오류: HUB_JWT_SECRET 미설정' });
  }

  try {
    const { token } = req.body || {};
    if (!token) return res.status(400).json({ error: '토큰이 필요합니다.' });

    const payload = jwt.verify(token, HUB_JWT_SECRET);

    // 이 앱 전용 토큰인지 확인
    if (payload.app !== 'plan1') {
      return res.status(403).json({ error: '이 앱에 대한 접근 권한이 없는 토큰입니다.' });
    }
    if (payload.iss !== 'bokseobang-hub') {
      return res.status(403).json({ error: '신뢰할 수 없는 발급자입니다.' });
    }

    return res.status(200).json({
      valid: true,
      user: {
        id: payload.sub,
        name: payload.name,
        org: payload.org,
        role: payload.role,
        plan_end: payload.plan_end,
      },
      exp: payload.exp, // seconds epoch
    });
  } catch (err) {
    const msg =
      err.name === 'TokenExpiredError'
        ? '세션이 만료되었습니다. 복서방 허브에서 다시 접속해주세요.'
        : '유효하지 않은 토큰입니다.';
    return res.status(401).json({ valid: false, error: msg, code: err.name });
  }
}
