import fs from 'node:fs'

const oneMinute = 60 * 1000

const user = process.env.BROWSERSTACK_USERNAME || process.env.BROWSERSTACK_USER
const key = process.env.BROWSERSTACK_ACCESS_KEY || process.env.BROWSERSTACK_KEY
const projectName = process.env.BROWSERSTACK_PROJECT_NAME || 'MMO CR Copilot Dashboard Tests'
const buildName =
  process.env.BROWSERSTACK_BUILD_NAME ||
  `mmo-cr-copilot-dashboard-tests-${process.env.ENVIRONMENT || 'local'}`

const isLocalhost =
  !process.env.DASHBOARD_BASE_URL ||
  process.env.DASHBOARD_BASE_URL.includes('localhost') ||
  process.env.DASHBOARD_BASE_URL.includes('127.0.0.1')
const useBrowserstackLocal =
  process.env.BROWSERSTACK_LOCAL !== undefined
    ? process.env.BROWSERSTACK_LOCAL === 'true'
    : isLocalhost

export const config = {
  //
  // ====================
  // Runner Configuration
  // ====================
  runner: 'local',

  //
  // Set a base URL in order to shorten url command calls.
  baseUrl:
    process.env.DASHBOARD_BASE_URL ||
    'https://mmo-cr-copilot-dashboard.dev.cdp-int.defra.cloud',

  // BrowserStack credentials
  user,
  key,

  // Tests to run
  specs: ['./test/specs/**/*.js'],
  exclude: [],
  maxInstances: 5,

  // BrowserStack common capabilities applied to all browsers
  commonCapabilities: {
    'bstack:options': {
      projectName,
      buildName,
      debug: true,
      networkLogs: true,
      consoleLogs: 'info'
    }
  },

  // Target browsers / devices
  capabilities: [
    {
      browserName: 'chrome',
      'bstack:options': {
        browserVersion: 'latest',
        os: 'Windows',
        osVersion: '11'
      }
    }
  ],

  services: [
    [
      'browserstack',
      {
        testObservability: true,
        testObservabilityOptions: {
          user,
          key,
          projectName,
          buildName
        },
        acceptInsecureCerts: true,
        browserstackLocal: useBrowserstackLocal,
        ...(process.env.PROXY_HOST
          ? {
              opts: {
                proxyHost: process.env.PROXY_HOST,
                proxyPort: process.env.PROXY_PORT || 3128
              }
            }
          : {})
      }
    ]
  ],

  logLevel: 'info',

  logLevels: {
    webdriver: 'error'
  },

  // Number of failures before the test suite bails.
  bail: 0,
  waitforTimeout: 10000,
  waitforInterval: 200,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  framework: 'mocha',

  reporters: [
    [
      'spec',
      {
        addConsoleLogs: true,
        realtimeReporting: true,
        color: false
      }
    ],
    [
      'allure',
      {
        outputDir: 'allure-results'
      }
    ]
  ],

  // Options to be passed to Mocha.
  mochaOpts: {
    ui: 'bdd',
    timeout: oneMinute
  },

  // Hooks
  afterTest: async function (test, context, { error }) {
    if (error) {
      await browser.takeScreenshot()
    }
  },

  onComplete: function (exitCode, config, capabilities, results) {
    // !Do Not Remove! Required for test status to show correctly in portal.
    if (results?.failed && results.failed > 0) {
      fs.writeFileSync('FAILED', JSON.stringify(results))
    }
  }
}

