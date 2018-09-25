/*
Copyright Siemens AG 2018
SPDX-License-Identifier: MIT
*/

// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html
const grid = require('url').parse(process.env.SELENIUM_URL || '');

module.exports = function (config) {
  config.set({
    basePath: '',
    hostname: process.env.SELENIUM_URL ? require('ip').address() : 'localhost',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-webdriver-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('karma-junit-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, '../coverage'),
      reports: ['text-summary', 'html', 'lcovonly'],
      fixWebpackSourcePaths: true
    },
    junitReporter: {
      outputDir: require('path').join(__dirname, '../coverage'), // results will be saved as $outputDir/$browserName.xml
      outputFile: undefined, // if included, results will be saved as $outputDir/$browserName/$outputFile
      suite: '', // suite will become the package name attribute in xml testsuite element
      useBrowserName: true, // add browser name to report and classes names
      nameFormatter: undefined, // function (browser, result) to customize the name attribute in xml testcase element
      classNameFormatter: undefined, // function (browser, result) to customize the classname attribute in xml testcase element
      properties: {}, // key value pair of properties to add to the <properties> section of the report
      xmlVersion: null // use '1' if reporting to be per SonarQube 6.2 XML format
    },
    customLaunchers: {
      'Chrome-Webdriver': {
        base: 'WebDriver',
        config: {
          hostname: grid.hostname,
          port: grid.port
        },
        browserName: 'chrome'
      }
    },
    angularCli: {
      environment: 'dev'
    },
    reporters: ['progress', 'kjhtml', 'junit'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: !process.env.SELENIUM_URL,
    browsers: [process.env.SELENIUM_URL ? 'Chrome-Webdriver' : 'Chrome'],
    singleRun: process.env.SELENIUM_URL,
    browserNoActivityTimeout: 120000
  });
};
