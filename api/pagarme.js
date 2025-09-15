import PagarmeService from './services/pagarmeService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const PAGARME_API_KEY = process.env.PAGARME_API_KEY;
    if (!PAGARME_API_KEY || typeof PAGARME_API_KEY !== 'string') {
      return res.status(500).json({ success: false, error: 'PAGARME_API_KEY ausente no backend. Defina no arquivo .env e reinicie o servidor.' });
    }
    if (!PAGARME_API_KEY.startsWith('sk_')) {
      return res.status(401).json({ success: false, error: 'Chave inválida. Use a SECRET KEY (sk_...) no .env, não a public key (pk_...).' });
    }

    const { amount, customer, payments } = req.body;
    if (!amount || !customer || !Array.isArray(payments) || payments.length === 0) {
      return res.status(400).json({ success: false, error: 'Dados incompletos. Verifique amount, customer e payments.' });
    }

    const pagarmeService = new PagarmeService(PAGARME_API_KEY);
    const responseData = await pagarmeService.createOrder(req.body);

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
      qr_code_url: lastPixTx?.qr_code_url,
      emv: lastPixTx?.pix?.emv,
      failure_reason:
        lastPixTx?.gateway_response?.message ||
        lastPixTx?.message ||
        lastPixTx?.status_reason ||
        undefined
    } : undefined;

    return res.status(201).json({
      success: true,
      id: responseData.id,
      status: responseData.status,
      payments: responseData.payments,
      charges: responseData.charges,
      pix: pixShortcut,
      last_transaction: lastPixTx
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor',
      details: error.details || error.raw || { note: 'sem-detalhes-retornados-pelo-servico' },
      pagarme_status: error.status || undefined,
      sent_payload: error.payload || undefined
    });
  }
}
