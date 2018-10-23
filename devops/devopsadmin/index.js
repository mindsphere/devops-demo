/*
Copyright Siemens AG 2018
SPDX-License-Identifier: MIT
*/

const express = require('express');
const app = express();
const request = require('superagent');
const jwt = require('jsonwebtoken');
const includes = require('lodash.includes');
const proxy = require('express-http-proxy');

const config = require('./config');
const services = require('./services');

const asyncHandler = (func) =>
  (req, res, next) => Promise.resolve(func(req, res, next)).catch(next);

// Middleware for checking the scopes in the user token
app.use('/', function (req, res, next) {
  let scopes = [];

  if (req.headers.authorization) {
    let splitAuthHeader = req.headers.authorization.split(' ');
    if (splitAuthHeader[0].toLowerCase() === 'bearer') {
      let token = jwt.decode(splitAuthHeader[1], {complete: true});

      if (token.payload != null) {
        scopes = token.payload.scope;
      }
    }
  }
  if (includes(scopes, `${config.mdsp.appname}.${config.mdsp.scope}`)) {
    next();
  } else {
    console.log('unauthorized request');
    res.status(403).send('no access!');
  }
});

const rootHtml = `
<p>Hello authorized user with scope: ${config.mdsp.appname}.${config.mdsp.scope}</p>
<ul>
  <li><a href="/http/">/http/</a></li>
  <li><a href="/env/">/env/</a></li>
  <li><a href="/jwt/">/jwt/</a></li>
  <li><a href="/users/">/users/</a></li>
  <li><a href="/prometheus/">/prometheus/</a></li>
  <li><a href="/grafana/">/grafana/</a></li>
  <li><a href="/simple-notification/">/simple-notification/</a></li>
  <li><a href="/complex-notification/">/complex-notification/</a></li>
</ul>
`;
app.get('/', (req, res) => res.send(rootHtml));

app.get('/http/', function (req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(req.headers));
});

app.get('/env/', function (req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(process.env));
});

app.get('/jwt/', function (req, res) {
  let authorizationHeader = req.get('authorization');

  if (authorizationHeader != null) {
    authorizationHeader = authorizationHeader.replace('Bearer ', '');
    authorizationHeader = authorizationHeader.replace('bearer ', '');
    token = jwt.decode(authorizationHeader, { complete: true })
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(token));
});

app.get('/users/', function (req, res) {
  let authorizationHeader = req.get('authorization');
  request
  .get('https://gateway.eu1.mindsphere.io/api/im/v3/Users?attributes=meta,name,userName,active')
  .set('Authorization', authorizationHeader)
  .set('Accept', 'application/json')
  .then(function(data) {
      res.json({
        resources: data.body.resources
      });
  }).catch(err => {
      console.error(err.message, err.status);
      res.status(err.status).json({message: 'Failed to fetch users'});
  });
});

app.use('/grafana/', proxy(process.env.GRAFANA_URL, {
  https: true,
  proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
    proxyReqOpts.headers.authorization = '';
    return proxyReqOpts;
  }
}));

app.use('/prometheus/', proxy(process.env.PROMETHEUS_URL, {
  https: true,
  proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
    proxyReqOpts.headers.authorization = '';
    return proxyReqOpts;
  }
}));

app.get('/simple-notification/', asyncHandler(async (req, res, next) => {
  try {
    const data = await services.notification
      .sendSimpleNotification(process.env.NOTIFICATION_EMAIL);
    res.json({
      message: 'Notification sent',
      result: data.body
    });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
}));

app.get('/complex-notification/', asyncHandler(async (req, res, next) => {
  try {
    const data = await services.notification
      .sendComplexNotification(process.env.NOTIFICATION_EMAIL, process.env.NOTIFICATION_MOBILE_NUMBER);
    res.json({
      message: 'Notification sent',
      result: data.body
    });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
}));

app.listen(process.env.PORT || 3000, function(){
  console.log('Express listening on port', this.address().port);
});
