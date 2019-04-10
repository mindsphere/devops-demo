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
    // Disable X-XSS-Protection filter already set by the MindSphere Gateway
    app.use(helmet({
      xssFilter: false
    }));

    app.use(bodyparser.json());
    app.use(bodyparser.urlencoded({ extended: false }));
    app.use(cors());
  };

  const setupAuth = (app) => {
    if (process.env.VCAP_APPLICATION) {
      if (!process.env.MDSP_TENANT) throw new Error('missing MDSP_TENANT configuration');
      if (!process.env.MDSP_REGION) throw new Error('missing MDSP_REGION configuration');

      console.log(`Configured MindSphere Tenant: ${process.env.MDSP_TENANT}`);
      console.log(`Configured MindSphere Region: ${process.env.MDSP_REGION}`);
    }

    const NON_MDSP_USER = {
      id: '0000-0000',
      name: 'John Doe',
      email: 'john.doe@example.com',
    };

    const jwksClient = jwksrsa({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://${process.env.MDSP_TENANT}.piam.${process.env.MDSP_REGION}.mindsphere.io/token_keys`
    });
    const getKey = (header, callback) => {
      jwksClient.getSigningKey(header.kid, (err, key) => {
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
      });
    };
    const options = {
      issuer: `https://${process.env.MDSP_TENANT}.piam.${process.env.MDSP_REGION}.mindsphere.io/oauth/token`,
      algorithms: ['RS256']
    };

    // On API requests, expect a user identifier:
    // - local: use static identifier (same for all)
    // - mdsp: extract & use mdsp user identifier from jwt
    app.use('/v1/', (req, res, next) => {
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
                res.locals.todo_user = {
                  id: token.user_id,
                  name: token.user_name,
                  email: token.email,
                };
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
        res.locals.todo_user = NON_MDSP_USER;
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

    app.post('/v1/todo', (req, res) => {
      req.body.user_id = getCurrentUser(res).id;

      TodoModel.create(req.body)
        .then(
          (success) => {
            res.sendStatus(201);
          },
          (error) => {
            res.sendStatus(400);
          });
    });

    app.get('/v1/todo', (req, res) => {
      const userId = getCurrentUser(res).id;
      TodoModel.find({ user_id: userId })
        .then(
          (tasks) => {
            res.json(tasks);
          },
          (error) => {
            res.sendStatus(400);
          });
    });

    app.delete('/v1/todo/:id', (req, res) => {
      TodoModel.deleteOne(
        {
          _id: mongoose.Types.ObjectId(req.params.id),
          user_id: getCurrentUser(res).id,
        })
        .then(
          (success) => {
            res.sendStatus(200);
          },
          (error) => {
            res.sendStatus(400);
          });
    });

    app.get('/v1/me', (req, res) => {
      res.json(getCurrentUser(res));
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

  const getCurrentUser = (res) => {
    if (!res.locals.todo_user) {
      console.error('unknown user, no data available or unauthenticated');
    }
    return res.locals.todo_user;
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
