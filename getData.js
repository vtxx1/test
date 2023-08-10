const fetch = require('node-fetch');

class getData {
  async fetchData(url) {
    try {
      const response = await fetch(url);
      const data = await response.text();
      return data;
    } catch (error) {
      throw new Error(`Houve um erro ao fazer uma requisição: ${error.message}`);
    }
  }
}

module.exports = getData;