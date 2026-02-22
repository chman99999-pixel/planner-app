export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ accessCode: process.env.ACCESS_CODE || '2026' });
}
