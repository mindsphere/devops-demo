/*
Copyright Siemens AG 2019
SPDX-License-Identifier: MIT
*/

const {MindConnectAgent, retry} = require('@mindconnect/mindconnect-nodejs');

(async function () {

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const configuration = require('./agentconfig.json');
  const agent = new MindConnectAgent(configuration);
  const log = (text) => {
    console.log(`[${new Date().toISOString()}] ${text.toString()}`);
  };
  const RETRYTIMES = 5; // retry the operation before giving up and throwing exception

  for (let index = 0; index < 5; index++) {
    try {

      log(`Iteration : ${index}`);
      // onboarding the agent
      if (!agent.IsOnBoarded()) {
        // wrapping the call in the retry function makes the agent a bit more resilient
        // if you don't want to retry the operations you can always just call await agent.OnBoard(); instead.
        await retry(RETRYTIMES, () => agent.OnBoard());
        log('Agent onboarded');
      }

      if (!agent.HasDataSourceConfiguration()) {
        await retry(RETRYTIMES, () => agent.GetDataSourceConfiguration());
        log('Configuration acquired');
      }

      // Temperature -> 1550254343268
      // Humidity -> 1550254356765
      // Pressure -> 1550254392023
      // Acceleration -> 1550254437246
      // Displacement -> 1550254490776
      // Frequency -> 1550254506107
      // Velocity -> 1550254518553
      const values = [
        {
          'dataPointId': '1550254343268',
          'qualityCode': '0',
          'value': (Math.sin(index) * (20 + index % 2) + 25).toString()
        },
        {
          'dataPointId': '1550254392023',
          'qualityCode': '0',
          'value': (Math.cos(index) * (20 + index % 25) + 25).toString()
        },
        {
          'dataPointId': '1550254356765',
          'qualityCode': '0',
          'value': ((index + 30) % 100).toString()
        },
        {
          'dataPointId': '1550254437246',
          'qualityCode': '0',
          'value': (1000.0 + index).toString()
        },
        {
          'dataPointId': '1550254506107',
          'qualityCode': '0',
          'value': (60.0 + (index * 0.1)).toString()
        },
        {
          'dataPointId': '1550254490776',
          'qualityCode': '0',
          'value': (index % 10).toString()
        },
        {
          'dataPointId': '1550254518553',
          'qualityCode': '0',
          'value': (50.0 + index).toString()
        }
      ];

      // same like above, you can also just call  await agent.PostData(values) if you don't want to retry the operation
      // this is how to send the data with specific timestamp
      // await agent.PostData(values, new Date(Date.now() - 86400 * 1000));

      await retry(RETRYTIMES, () => agent.PostData(values));
      log('Data posted');
      await sleep(1000);

      const event = {
        // 'entityId': agent.ClientId(), // use assetid if you want to send event somewhere else :)
        'entityId': "84eb75eb8c6448708128918ac492995e",
        'sourceType': 'Event',
        'sourceId': 'application',
        'source': 'Meowz',
        'severity': 20, // 0-99 : 20:error, 30:warning, 40: information
        'timestamp': new Date().toISOString(),
        'description': 'Test'
      };

      // send event with current timestamp; you can also just call agent.PostEvent(event) if you don't want to retry the operation
      await retry(RETRYTIMES, () => agent.PostEvent(event));
      log('event posted');
      await sleep(1000);

      // upload file;  you can also just call await agent.Upload(...) if you don't want to retry the operation
      await retry(RETRYTIMES, () => agent.Upload('package.json', 'application/json', 'Demo File', true, "84eb75eb8c6448708128918ac492995e"));
      log('file uploaded');
      await sleep(1000);

      // const yesterday = new Date();
      // yesterday.setDate(yesterday.getDate() - 1);
      // const bulk = [
      //   {
      //      'timestamp': yesterday.toISOString(),
      //      'values': [
      //        {
      //          'dataPointId': 'DP-Temperature',
      //          'qualityCode': '0',
      //          'value': '10'
      //        },
      //        {
      //          'dataPointId': 'DP-Pressure',
      //          'qualityCode': '0',
      //          'value': '10'
      //        }
      //      ]
      //   },
      //   {
      //     'timestamp': new Date().toISOString(),
      //     'values': [
      //       {
      //         'dataPointId': 'DP-Temperature',
      //         'qualityCode': '0',
      //         'value': '10'
      //       },
      //       {
      //         'dataPointId': 'DP-Pressure',
      //         'qualityCode': '0',
      //         'value': '10'
      //       }
      //     ]
      //   }
      // ];
      //
      // await retry(RETRYTIMES, () => agent.BulkPostData(bulk));
      // log('bulk data uploaded');
      // await sleep(1000);

    } catch (err) {
      // add proper error handling (e.g. store data somewhere, retry later etc. )
      console.error(err);
    }
  }
})();
