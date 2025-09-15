import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Parâmetro url é obrigatório' });
    }
    const allowedHosts = new Set(['api.pagar.me', 'pagar.me']);
    const parsed = new URL(url);
    if (![...allowedHosts].some(h => parsed.hostname === h || parsed.hostname.endsWith(`.${h}`))) {
      return res.status(400).json({ error: 'Host não permitido' });
    }
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Falha ao obter imagem do QR' });
    }
    const contentType = response.headers.get('content-type') || 'image/png';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=60');
    const arrayBuffer = await response.arrayBuffer();
    return res.end(Buffer.from(arrayBuffer));
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao obter QR Code' });
  }
}
