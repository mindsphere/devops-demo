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

const config = {
  mdsp: {
    appname: 'mdsp:core:im',
    scope: 'userIamAdmin'
  },
  tech_user: {
    oauth_endpoint: process.env.TECH_USER_OAUTH_ENDPOINT,
    client_id: process.env.TECH_USER_CLIENT_ID,
    client_secret: process.env.TECH_USER_CLIENT_SECRET
  }
};

// Technical user token, used for accessing the mindsphere API
let technicalToken = null;

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
  <li><a href="/notification/">/notification/</a></li>
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

app.get('/notification/', (req, res) => {
  // Obtain technical user token if not available
  const obtainToken = new Promise((resolve, reject) => {
    if (!technicalToken) {
      request.post(config.tech_user.oauth_endpoint)
        .auth(config.tech_user.client_id, config.tech_user.client_secret)
        .send('grant_type=client_credentials')
        .then(data => {
          technicalToken = data.body.access_token;
          console.log('Obtained technical user token');
          resolve(technicalToken);
        })
        .catch(err => {
          console.error(err.status, err.message);
          res.status(err.status).json({message: 'Failed to obtain technical user token'});
          reject();
        });
    } else {
      console.log('Found cached token');
      resolve(technicalToken);
    }
  });

  // Call the notification api based on the token
  // If it fails with 401 invalidate the token, otherwise fail
  obtainToken.then((technicalToken) => {
    const authHeader = `Bearer ${technicalToken}`;
    const emailJson = {
      body: {
        message: 'A notification has been triggered from devopsadmin through MindSphere'
      },
      recipientsTo: 'mindsphere.devops@gmail.com',
      from: 'devopsadmin',
      subject: 'devopsadmin MindSphere notification'
    };
    request
      .post('https://gateway.eu1.mindsphere.io/api/notification/v3/publisher/messages')
      .set('Authorization', authHeader)
      .send(emailJson)
      .then(data => {
        res.json(data.body);
      })
      .catch(err => {
        // Invalidate technical user token if needed
        if (err.status === 401) {
          console.log('Invalidating technical user token');
          technicalToken = null;
        }
        res.status(err.status).json({
          status: err.status,
          message: `Failed to send email: ${err.message}`
        });
      });
  });
});

app.listen(process.env.PORT || 3000, function(){
  console.log('Express listening on port', this.address().port);
});
