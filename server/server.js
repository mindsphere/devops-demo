/*
Copyright Siemens AG 2018
SPDX-License-Identifier: MIT
*/

const http = require('http');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyparser = require('body-parser');
const promBundle = require('express-prom-bundle');
const swaggerUi = require('swagger-ui-express');
const jwt = require('jsonwebtoken');
const jwksrsa = require('jwks-rsa');

const mongoose = require('mongoose');
const TodoModel = require('./model');

const openApiSpecUrls = require('./openapi-spec-urls.js');


const TodoServer = function() {

  const setupDb = () => {
    let mongoUrl = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/todo';

    if (process.env.VCAP_SERVICES) {
      const cf_vcap_services = JSON.parse(process.env.VCAP_SERVICES);
      mongoUrl = cf_vcap_services.mongodb32[0].credentials.uri;
    }

    mongoose.connect(mongoUrl, { useNewUrlParser: true })
      .then(()=> {
        console.log('Connected to ' + mongoUrl);
      })
      .catch(()=> {
        console.error('Error Connecting to ' + mongoUrl);
        process.exit(1);
      });
  };

  const setupWebserver = (app) => {
    // Security handler
    app.use(helmet());

    app.use(bodyparser.json());
    app.use(bodyparser.urlencoded({ extended: false }));
    app.use(cors());
  };

  const setupAuth = (app) => {
    if (process.env.VCAP_APPLICATION) {
      if (!process.env.JWKS_URI) throw new Error('missing JWKS_URI configuration');
      if (!process.env.JWT_ISSUER) throw new Error('missing JWT_ISSUER configuration');

      console.log(`JWT jwksUri: ${process.env.JWKS_URI}`);
      console.log(`JWT expected issuer: ${process.env.JWT_ISSUER}`);
    }

    const NON_MDSP_USER_ID = '<default>';

    const jwksClient = jwksrsa({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: process.env.JWKS_URI
    });
    const getKey = (header, callback) => {
      jwksClient.getSigningKey(header.kid, (err, key) => {
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
      });
    };
    const options = {
      issuer: process.env.JWT_ISSUER,
      algorithms: ['RS256']
    };

    // On API requests, expect a user identifier:
    // - local: use static identifier (same for all)
    // - mdsp: extract & use mdsp user identifier from jwt
    app.use('/todo', (req, res, next) => {
      if (process.env.VCAP_APPLICATION) {
        if (req.headers.authorization) {
          let splitAuthHeader = req.headers.authorization.split(' ');
          if (splitAuthHeader[0].toLowerCase() === 'bearer') {
            new Promise((resolve, reject) => {
              jwt.verify(splitAuthHeader[1], getKey, options, (err, token) => {
                if (err || !token) {
                  reject(err);
                }
                resolve(token);
              });
            }).then((token) => {
              if (token.user_id) {
                res.locals.todo_user_id = token.user_id;
                next();
              } else {
                next('cannot find user id in token');
              }
            }).catch((err) => {
              next(err);
            });
          }
        }
      } else {
        res.locals.todo_user_id = NON_MDSP_USER_ID;
        next();
      }
    });

    // TODO protect prometheus metrics access
  };

  const setupEndpoints = (app) => {
    // Static mappings
    app.use(express.static(__dirname + '/static/'));
    app.use('/api-specs', express.static(__dirname + '/specs/'));

    // Prometheus metrics
    app.use(promBundle({includeMethod: true, includePath: true}));

    const openApiSpecUrls = require('./openapi-spec-urls.js');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(null, {
      explorer: true,
      swaggerOptions: {
        validatorUrl: null,
        urls: openApiSpecUrls,
        requestInterceptor: (request) => {
          const getCookie = (name) => {
            const pair = document.cookie.match(new RegExp(name + '=([^;]+)'));
            return !!pair ? pair[1] : null;
          };
          request.headers['x-xsrf-token'] = getCookie('XSRF-TOKEN');
          request.headers.origin = `${window.location.protocol}//${window.location.host}/`;

          // HORRIBLE, HORRIBLE HACK, KITTEN DIE BECAUSE OF THIS
          // Solves https://github.com/swagger-api/swagger-js/issues/1027
          //
          // Check if the url matches '/api/specs' (url points to developer.mindsphere.io);
          // if not, then replace the host by the actual url of the todo app
          // so that 'Try me out' links work properly
          if (request.url.indexOf('http') !== -1) {
            const url = new URL(request.url);
            if (url.pathname.indexOf('/api/specs') === -1) {
              url.hostname = window.location.hostname;
              request.url = url.href;
            }
          }

          return request;
        }
      }
    }));

    app.post('/todo', (req, res) => {
      req.body.user_id = getCurrentUserId(res);

      TodoModel.create(req.body)
        .then(
          (success) => {
            res.sendStatus(201);
          },
          (error) => {
            res.sendStatus(400);
          });
    });

    app.get('/todo', (req, res) => {
      const userId = getCurrentUserId(res);
      TodoModel.find({ user_id: userId })
        .then(
          (tasks) => {
            res.json(tasks);
          },
          (error) => {
            res.sendStatus(400);
          });
    });

    app.delete('/todo/:id', (req, res) => {
      TodoModel.deleteOne(
        {
          _id: mongoose.Types.ObjectId(req.params.id),
          user_id: getCurrentUserId(res)
        })
        .then(
          (success) => {
            res.sendStatus(200);
          },
          (error) => {
            res.sendStatus(400);
          });
    });

    app.get('/health_check', (req, res) => {
      if (mongoose.connection.readyState === 1) {
        res.sendStatus(200);
      }
      else {
        res.sendStatus(503);
      }
    });

    // Send all other request to the angular app
    app.get('*', (req, res) => {
      res.sendFile(__dirname + '/static/');
    });
  };

  const getCurrentUserId = (res) => {
    if (!res.locals.todo_user_id) {
      console.error('unknown user id');
    }
    return res.locals.todo_user_id;
  };

  this.run = () => {
    const app = express();
    const server = http.createServer(app);

    setupDb();
    setupWebserver(app);
    setupAuth(app);
    setupEndpoints(app);

    server.listen(process.env.PORT || 3000, function() {
      console.log('Listening on port', server.address().port);
    });
  }
};

const todoServer = new TodoServer();
todoServer.run();
