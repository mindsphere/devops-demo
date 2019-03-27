/*
Copyright Siemens AG 2018
SPDX-License-Identifier: MIT
*/

const config = require('../config');
const request = require('superagent');
const jwt = require('jsonwebtoken');

const authData = {
  technicalUser: {
    token: null,
    expiresAt: new Date().getTime()
  }
};

const techUserOauthEndpoint = `https://${config.mdsp.tenant}.piam.${config.mdsp.region}.mindsphere.io/oauth/token`;

const authenticate = async () => {
  let technicalToken = authData.technicalUser.token;
  let expiresAt = authData.technicalUser.expiresAt;

  // Expire 1 minute early to account for clock differences
  const expiration = expiresAt - 60000;

  if (expiration > new Date().getTime()) {
    console.log('Found cached token');
  } else {
    // Expired, obtain a new token
    technicalToken = await request.post(techUserOauthEndpoint)
      .auth(config.tech_user.client_id, config.tech_user.client_secret)
      .send('grant_type=client_credentials')
      .then(data => {
        console.log('Obtained new technical user token');
        authData.technicalUser.token = data.body.access_token;
        authData.technicalUser.expiresAt = parseFloat(
          jwt.decode(data.body.access_token).exp) * 1000;
        return authData.technicalUser.token;
      });
  }

  if (!technicalToken) {
    throw new Error('empty technical token');
  }
  return technicalToken;
};

const findAddressTypes = async (token) => {
  const addressTypes = await request
    .get(`https://gateway.${config.mdsp.region}.mindsphere.io/api/notification/v3/recipient/addresstype`)
    .set('Authorization', `Bearer ${token}`)
    .then(res => { return res.body; });
  console.log('addressTypes:', JSON.stringify(addressTypes));
  return addressTypes;
};

const findCommunicationChannels = async (token) => {
  const communicationChannels = await request
    .get(`https://gateway.${config.mdsp.region}.mindsphere.io/api/notification/v3/communicationchannel/`)
    .set('Authorization', `Bearer ${token}`)
    .then(res => { return res.body; });
  console.log('communicationChannels:', JSON.stringify(communicationChannels));
  return communicationChannels;
};

const findParamTypes = async (token) => {
  const paramTypes = await request
    .get(`https://gateway.${config.mdsp.region}.mindsphere.io/api/notification/v3/paramtype/`)
    .set('Authorization', `Bearer ${token}`)
    .then(res => { return res.body; });
  console.log('paramTypes:', JSON.stringify(paramTypes));
  return paramTypes;
};

const findOrCreateRecipients = async (token, recipientEmail, recipientMobileNumber) => {
  const recipientIds = [];

  // Recipient 1
  const recipient1Name = 'testRecipientOne';
  const recipient1Json = {
    recipientname: recipient1Name,
    recipientdetail: [
      {
        address: recipientEmail,
        // Personal Mail
        addresstypeid: 1
      },
    ]
  };

  const recipient1List = await request
    .post(`https://gateway.${config.mdsp.region}.mindsphere.io/api/notification/v3/recipient/search`)
    .set('Authorization', `Bearer ${token}`)
    .send({ name: recipient1Name })
    .then(res => { return res.body; });

  // Use first found result, otherwise create a new recipient
  if (recipient1List.length) {
    recipientIds.push(recipient1List[0].recipientid);
  } else {
    const recipient1Id = await request
      .post(`https://gateway.${config.mdsp.region}.mindsphere.io/api/notification/v3/recipient/`)
      .set('Authorization', `Bearer ${token}`)
      .send(recipient1Json)
      .then(res => { return res.body; });
    recipientIds.push(recipient1Id);
  }

  // Recipient 2
  const recipient2Name = 'testRecipientTwo';
  const recipient2Json = {
    recipientname: recipient2Name,
    recipientdetail: [
      {
        address: recipientMobileNumber,
        // Personal Number
        addresstypeid: 4
      }
    ]
  };

  const recipient2List = await request
    .post(`https://gateway.${config.mdsp.region}.mindsphere.io/api/notification/v3/recipient/search`)
    .set('Authorization', `Bearer ${token}`)
    .send({ name: recipient2Name })
    .then(res => { return res.body; });

  // Use first found result, otherwise create a new recipient
  if (recipient2List.length) {
    recipientIds.push(recipient2List[0].recipientid);
  } else {
    const recipient2Id = await request
      .post(`https://gateway.${config.mdsp.region}.mindsphere.io/api/notification/v3/recipient/`)
      .set('Authorization', `Bearer ${token}`)
      .send(recipient2Json)
      .then(res => { return res.body; });
    recipientIds.push(recipient2Id);
  }

  console.log('recipientIds:', recipientIds);
  return recipientIds;
};

const findOrCreateRecipientGroup = async (token, recipientIds) => {
  const recipientGroupName = 'testRecipientGroup';
  const recipientIdsJson = recipientIds.map(recipientId => {
    return { recipientId: recipientId };
  });
  const recipientGroupJson = {
    groupName: recipientGroupName,
    recipientIds: recipientIdsJson
  };

  const recipientGroupList = await request
    .post(`https://gateway.${config.mdsp.region}.mindsphere.io/api/notification/v3/recipient/recipientgroup/search`)
    .set('Authorization', `Bearer ${token}`)
    .send({ name: recipientGroupName })
    .then(res => { return res.body; });

  // Use first found result, otherwise create a new recipient group
  let recipientGroupId = null;
  if (recipientGroupList.length) {
    recipientGroupId = recipientGroupList[0].groupId;
  } else {
    const recipientGroupResponse = await request
      .post(`https://gateway.${config.mdsp.region}.mindsphere.io/api/notification/v3/recipient/recipientgroup`)
      .set('Authorization', `Bearer ${token}`)
      .send(recipientGroupJson)
      .then(res => { return res.body; });
    recipientGroupId = recipientGroupResponse;
  }

  console.log('recipientGroupId:', recipientGroupId);
  return recipientGroupId;
};

const findOrCreateTemplateSet = async (token) => {
  const templateSetName = 'testTemplateSet';
  const templateInfo = {
    templateParam: [
      {
        paramName: 'Source Name',
        defaultValue: 'devopsadmin',
        placeHolderName: 'name',
        // STRING
        paramTypeId: 4
      }
    ],
    templatesetName: templateSetName,
    templateChannelAndFile: [
      {
        // Email
        communicationChannel: 1,
        fileName: 'templateEmail.html',
        operation: 'ADD'
      },
      {
        // SMS
        communicationChannel: 2,
        fileName: 'templateSms.html',
        operation: 'ADD'
      }
    ]
  };

  const templateSetList = await request
    .get(`https://gateway.${config.mdsp.region}.mindsphere.io/api/notification/v3/template/templatesets`)
    .set('Authorization', `Bearer ${token}`)
    .query({ templatesetname: templateSetName })
    .then(res => { return res.body; });

  // Use first found result, otherwise create a new template set
  let templateSet = null;
  if (templateSetList.length) {
    templateSet = templateSetList[0];
  } else {
    const templateSetResponse = await request
      .post(`https://gateway.${config.mdsp.region}.mindsphere.io/api/notification/v3/template/`)
      .set('Authorization', `Bearer ${token}`)
      .field('templateInfo', JSON.stringify(templateInfo))
      .attach('templateFiles', __dirname + '/templateEmail.html')
      .attach('templateFiles', __dirname + '/templateSms.html')
      .then(res => { return res.body; });
    templateSet = templateSetResponse;
  }

  console.log('templateSet:', JSON.stringify(templateSet));
  return templateSet;
};

const findOrCreateCommunicationCategory = async (token, recipientGroupId, templateSet) => {
  if (!recipientGroupId) throw new Error('missing recipientGroupId');
  if (!templateSet) throw new Error('missing templateSet');

  const commCategoryName = 'testCommunicationCategory';
  const templatesJson = templateSet.templateList.map(template => {
    return {
      templateId: template.templateId,
      templatesetId: templateSet.templatesetId,
      commChannelName: template.commChannelName
    };
  });
  const commCategoryJson = {
    msgCategoryName: commCategoryName,
    subject: 'complex devopsadmin MindSphere notification',
    priority: 1,
    from: 'devopsadmin',
    recipients: [
      {
        recipientGroupId: recipientGroupId,
        position: 'TO'
      }
    ],
    templates: templatesJson
  };

  const commCategoryList = await request
    .get(`https://gateway.${config.mdsp.region}.mindsphere.io/api/notification/v3/communicationcategories/`)
    .set('Authorization', `Bearer ${token}`)
    .then(res => { return res.body.filter(c => c.msgCategoryName === commCategoryName); });

  // Find result by name
  let commCategoryId = null;
  if (commCategoryList.length) {
    commCategoryId = commCategoryList[0].msgCategoryId;
  } else {
    const commCategoryResponse = await request
      .post(`https://gateway.${config.mdsp.region}.mindsphere.io/api/notification/v3/communicationcategories/`)
      .set('Authorization', `Bearer ${token}`)
      .send(commCategoryJson)
      .then(res => { return res.body; });
    commCategoryId = commCategoryResponse;
  }

  console.log('commCategoryId:', commCategoryId);
  return commCategoryId;
};

const sendSimpleNotification = async (recipientEmail) => {
  const messageJson = {
    body: {
      message: 'A notification has been triggered from devopsadmin through MindSphere'
    },
    recipientsTo: recipientEmail,
    from: 'devopsadmin',
    subject: 'simple devopsadmin MindSphere notification'
  };

  const technicalToken = await authenticate();
  return await request
    .post(`https://gateway.${config.mdsp.region}.mindsphere.io/api/notification/v3/publisher/messages`)
    .set('Authorization', `Bearer ${technicalToken}`)
    .send(messageJson);
};

const sendComplexNotification = async (recipientEmail, recipientMobileNumber) => {
  const technicalToken = await authenticate();

  // Log in the console the valid types
  const addressTypes = await findAddressTypes(technicalToken);
  const communicationChannels = await findCommunicationChannels(technicalToken);
  const paramTypes = await findParamTypes(technicalToken);

  // Create recipient, recipient group, template, and communication category
  // Set delivery to both an email address and a mobile phone
  const recipientIds = await findOrCreateRecipients(technicalToken, recipientEmail, recipientMobileNumber);
  const recipientGroupId = await findOrCreateRecipientGroup(technicalToken, recipientIds);
  const templateSet = await findOrCreateTemplateSet(technicalToken);
  const commCategoryId = await findOrCreateCommunicationCategory(technicalToken, recipientGroupId, templateSet);

  const messageJson = {
    body: {
      name: 'devopsadmin'
    },
    messageCategoryId: commCategoryId
  };

  // Trigger actual message delivery to both email and mobile
  return await request
    .post(`https://gateway.${config.mdsp.region}.mindsphere.io/api/notification/v3/publisher/messages`)
    .set('Authorization', `Bearer ${technicalToken}`)
    .send(messageJson);
};

const service = {
  sendSimpleNotification: sendSimpleNotification,
  sendComplexNotification: sendComplexNotification
};

module.exports = service;
