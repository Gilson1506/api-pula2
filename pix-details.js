import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { transaction_id } = req.query;
    if (!transaction_id) {
      return res.status(400).json({ success: false, error: 'transaction_id é obrigatório' });
    }
    const PAGARME_API_KEY = process.env.PAGARME_API_KEY;
    if (!PAGARME_API_KEY || !PAGARME_API_KEY.startsWith('sk_')) {
      return res.status(500).json({ success: false, error: 'PAGARME_API_KEY ausente ou inválida no backend.' });
    }
    const url = `https://api.pagar.me/core/v5/transactions/${encodeURIComponent(transaction_id)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(PAGARME_API_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(response.status).json({ success: false, error: data?.errors || data?.message || 'Falha ao consultar transação' });
    }
    const pix = {
      status: data?.status,
      qr_code_base64: data?.pix?.qr_code_base64 || data?.qr_code_base64,
      qr_code_url: data?.qr_code_url,
      qr_code: data?.pix?.qr_code || data?.qr_code,
      emv: data?.pix?.emv
    };
    return res.json({ success: true, transaction_id, pix, raw: data });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Erro ao buscar detalhes do PIX' });
  }
}
