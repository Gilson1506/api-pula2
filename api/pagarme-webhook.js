export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔔 Webhook recebido:', JSON.stringify(req.body, null, 2));
    const { type, data } = req.body;
    if (!type || !data) {
      console.log('❌ Webhook inválido: dados ausentes');
      return res.status(400).json({ success: false, error: 'Dados do webhook inválidos' });
    }

    // Processar diferentes tipos de notificação
    switch (type) {
      case 'charge.paid':
        // TODO: Implementar lógica para cobrança paga
        break;
      case 'charge.payment_failed':
        // TODO: Implementar lógica para falha no pagamento
        break;
      case 'charge.pending':
        // TODO: Implementar lógica para cobrança pendente
        break;
      case 'order.canceled':
        // TODO: Implementar lógica para pedido cancelado
        break;
      case 'order.closed':
        // TODO: Implementar lógica para pedido fechado
        break;
      case 'order.created':
        // TODO: Implementar lógica para pedido criado
        break;
      case 'order.paid':
        // TODO: Implementar lógica para pedido pago
        break;
      case 'order.payment_failed':
        // TODO: Implementar lógica para falha no pagamento do pedido
        break;
      case 'order.updated':
        // TODO: Implementar lógica para pedido atualizado
        break;
      case 'transaction.status_changed':
        // TODO: Implementar lógica para mudança de status de transação
        break;
      case 'order.status_changed':
        // TODO: Implementar lógica para mudança de status de pedido
        break;
      case 'charge.status_changed':
        // TODO: Implementar lógica para mudança de status de cobrança
        break;
      default:
        console.log(`ℹ️ Tipo de webhook não tratado: ${type}`);
    }

    // Sempre retornar 200 para o Pagar.me
    return res.status(200).json({ success: true, message: 'Webhook processado' });
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    return res.status(200).json({ success: false, error: 'Erro interno' });
  }
}
