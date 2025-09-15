class PagarmeService {
  constructor(apiKey, baseUrl = 'https://api.pagar.me/core/v5') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  getHeaders() {
    return {
      'Authorization': `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  async createOrder(orderData) {
    try {
      const orderPayload = this.prepareOrderPayload(orderData);

      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(orderPayload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(JSON.stringify(error));
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  prepareOrderPayload(orderData) {
    return {
      ...orderData
    };
  }
}

export default PagarmeService;