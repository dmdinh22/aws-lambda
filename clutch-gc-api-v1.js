'use strict';

console.log('Loading lambda function');

const http = require('http');

exports.handler = async (event, context) => {
  return new Promise((resolve, reject) => {
    const apiKey = secret.apiKey;
    const apiSecret = secret.apiSecret;
    const brandId = secret.brandId;
    const locationId = secret.locationId;
    const terminalId = secret.terminalId;

    const userData = event;
    console.log('userData', userData);

    let cardNumber = userData.cardNumber;
    let cardPin = userData.cardPin;

    // Encode basic auth string
    const basicAuth = `${apiKey}:${apiSecret}`.toString('base64');

    let payload = {
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
        'Content-Length': JSON.stringify(userData).length,
        Authorization: 'Basic ' + basicAuth,
        brand: brandId,
        location: locationId,
        terminal: terminalId
      }
    };

    const req = http.request(options, res => {
      console.log(`statusCode: ${res.statusCode}`);

      res.on('payload', payload => {
        process.stdout.write(payload);
      });

      resolve('Success');
    });

    req.on('error', e => {
      console.error(error);
      reject(e.message);
    });

    // send the request
    req.write(payload);
    req.end();
  });
};
