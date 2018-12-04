var HttpsProxyAgent = require('https-proxy-agent');
var proxyConfig = [
  {
    context: '/api',
    target: 'https://gateway.eu1.mindsphere.io',
    secure: true,
    changeOrigin: true,
    logLevel: 'debug'
  },
  {
    context: '/v1',
    target: 'http://localhost:3000',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug'
  }
];

function setupForCorporateProxy(proxyConfig) {
  console.log('Checking corporate proxy settings');
  var proxyServer = process.env.http_proxy || process.env.HTTP_PROXY;
  if (proxyServer) {
    var agent = new HttpsProxyAgent(proxyServer);
    console.log('Using corporate proxy server: ' + proxyServer);
    proxyConfig.forEach(function(entry) {
      // Do not proxy requests targeted to localhost
      if (entry.target.search(/localhost|127\.0\.0\.1/i) < 0) {
        entry.agent = agent;
      } else {
        console.log('Ignoring proxy for localhost target entry:', entry);
      }
    });
  } else {
    console.log('No proxy detected, using direct connection');
  }
  return proxyConfig;
}

module.exports = setupForCorporateProxy(proxyConfig);
