/*
Copyright Siemens AG 2018
SPDX-License-Identifier: MIT
*/

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

module.exports = config;
