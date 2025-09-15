export default function handler(req, res) {
  res.status(200).json({
    message: 'API is running',
    endpoints: [
      '/api/test',
      '/api/pagarme',
      '/api/generate-card-hash',
      '/api/pix-details',
      '/api/qr-image',
      '/api/pagarme-webhook'
    ]
  });
}