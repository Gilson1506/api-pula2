export default function handler(req, res) {
  res.status(200).json({
    message: '✅ API de integração com Pagar.me rodando!'
  });
}