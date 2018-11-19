import secret from './secret';
('use strict');

const https = require('https');

exports.handler = async (event, context) => {
  return new Promise((resolve, reject) => {
    const apiKey = secret.apiKey;
    const apiSecret = secret.apiSecret;
    const brandId = secret.brandId;
    const locationId = secret.locationId;
    const terminalId = secret.terminalId;

    const userData = event;

    let cardNumber = userData.cardNumber;
    let cardPin = userData.cardPin;

    // Encode basic auth string
    const basicAuth = new Buffer.from(`${apiKey}:${apiSecret}`).toString(
      'base64'
    );

    let formattedPayload = {
      filters: {
        cardNumber: cardNumber
      },
      returnFields: {
        balances: true,
        customer: true,
        isEnrolled: true
      },
      includeInactive: true,
      pin: cardPin,
      forcePinValidation: true
    };

    const options = {
      host: secret.host,
      path: secret.path,
      port: secret.port,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + basicAuth,
        brand: brandId,
        location: locationId,
        terminal: terminalId
      }
    };

    const req = https.request(options, res => {
      console.log(`statusCode: ${res.statusCode}`);
      console.log(`headers: ${options.headers}`);
      console.log(`event: ${event.cardNumber}`);

      res.setEncoding('utf8');
      let body = '';
      res.on('data', chunk => {
        body += chunk;
      });
      res.on(
        'end',
        () => resolve(JSON.parse(body))
        //resolve(JSON.parse(body).cards[0].balances[0].amount)
      );
    });

    req.on('error', e => {
      console.error(e);
      reject(e.message);
    });

    // send the request
    req.write(JSON.stringify(formattedPayload));

    req.end();
  });
};
