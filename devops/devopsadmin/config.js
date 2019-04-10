/*
Copyright Siemens AG 2018
SPDX-License-Identifier: MIT
*/

const config = {
  mdsp: {
    appname: 'mdsp:core:im',
    scope: 'userIamAdmin',
    tenant: process.env.MDSP_TENANT,
    region: process.env.MDSP_REGION
  },
  tech_user: {
    client_id: process.env.TECH_USER_CLIENT_ID,
    client_secret: process.env.TECH_USER_CLIENT_SECRET
  }
};

module.exports = config;
