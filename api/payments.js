import PagarmeService from './services/pagarmeService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const PAGARME_API_KEY = process.env.PAGARME_API_KEY;
    if (!PAGARME_API_KEY || typeof PAGARME_API_KEY !== 'string') {
      return res.status(500).json({ success: false, error: 'PAGARME_API_KEY ausente. Defina no ambiente do Vercel.' });
    }
    if (!PAGARME_API_KEY.startsWith('sk_')) {
      return res.status(401).json({ success: false, error: 'Chave inválida. Use a SECRET KEY (sk_...) no ambiente.' });
    }

    const { amount, customer, payments } = req.body;
    if (!amount || !customer || !Array.isArray(payments) || payments.length === 0) {
      return res.status(400).json({ success: false, error: 'Dados incompletos. Verifique amount, customer e payments.' });
    }

    const pagarmeService = new PagarmeService(PAGARME_API_KEY);
    const responseData = await pagarmeService.createOrder(req.body);

    // Extrai atalho do PIX
    const lastPixTx = Array.isArray(responseData?.charges)
      ? responseData.charges.find(c => (
          c?.payment_method === 'pix' ||
          c?.last_transaction?.payment_method === 'pix' ||
          c?.last_transaction?.transaction_type === 'pix'
        ))?.last_transaction
      : undefined;

    const pixShortcut = lastPixTx ? {
      status: lastPixTx.status,
      qr_code_base64: lastPixTx?.pix?.qr_code_base64 || lastPixTx?.qr_code_base64,
      qr_code: lastPixTx?.pix?.qr_code || lastPixTx?.qr_code,
      expires_at: lastPixTx?.pix?.expires_at || lastPixTx?.expires_at,
      id: lastPixTx?.id
    } : null;

    res.status(200).json({ success: true, data: responseData, pix: pixShortcut });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || error });
  }
}
