import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { card } = req.body;
    if (!card) {
      return res.status(400).json({ success: false, error: 'Objeto card ausente no body' });
    }
    const { number, holder_name, exp_month, exp_year, cvv } = card;
    if (!number || !holder_name || !exp_month || !exp_year || !cvv) {
      return res.status(400).json({ success: false, error: 'Dados do cartão incompletos' });
    }
    const PAGARME_API_KEY = process.env.PAGARME_API_KEY;
    if (!PAGARME_API_KEY || !PAGARME_API_KEY.startsWith('sk_')) {
      return res.status(500).json({ success: false, error: 'PAGARME_API_KEY ausente ou inválida no backend.' });
    }
    const response = await fetch('https://api.pagar.me/core/v5/cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(PAGARME_API_KEY + ':').toString('base64')}`
      },
      body: JSON.stringify({ number, holder_name, exp_month, exp_year, cvv })
    });
    const responseData = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ success: false, error: responseData.errors || responseData.message || 'Erro na API do Pagar.me' });
    }
    return res.status(200).json({ success: true, card_hash: responseData.id });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message || 'Erro interno do servidor' });
  }
}
