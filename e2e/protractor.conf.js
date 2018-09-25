/*
Copyright Siemens AG 2018
SPDX-License-Identifier: MIT
*/

// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');
const { JUnitXmlReporter } = require('jasmine-reporters');
const { spawn } = require('child_process');

exports.config = {
  allScriptsTimeout: 11000,
  specs: [
    './src/**/*.e2e-spec.ts'
  ],
  capabilities: {
    'browserName': 'chrome'
  },
  directConnect: !process.env.SELENIUM_URL,
  seleniumAddress: process.env.SELENIUM_URL,
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function() {}
  },
  onPrepare() {
    require('ts-node').register({
      project: require('path').join(__dirname, './tsconfig.e2e.json')
    });
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));

    jasmine.getEnv().addReporter(new JUnitXmlReporter({
      savePath: 'test-reports/',
      consolidateAll: true
    }));
  },

  beforeLaunch() {
    if(!process.env.MONGODB_URL) {
      process.env.MONGODB_URL = 'mongodb://localhost:27017/e2e';
    }
    backendProcess = spawn('yarn', ['start'], {cwd: require('path').join(__dirname, '../server')});

    backendProcess.stdout.on('data', function (data) {
      console.log('backend stdout: ' + data);
    });

    backendProcess.stderr.on('data', function (data) {
      console.log('backend stderr: ' + data);
    });
  },
  onCleanUp() {
    backendProcess.kill();
  }
};

let backendProcess;

if (!process.env.SELENIUM_URL) {
  const chromedriver = require('chromedriver');
  exports.config.chromeDriver = chromedriver.path;
  console.log('Using ChromeDriver: ', exports.config.chromeDriver);
}
