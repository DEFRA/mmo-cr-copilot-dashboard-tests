mmo-cr-copilot-dashboard-tests

A WebdriverIO journey test suite for the MMO Catch Recording Copilot dashboard.

- [Local](#local)
  - [Requirements](#requirements)
    - [Node.js](#nodejs)
  - [Setup](#setup)
  - [Running local tests](#running-local-tests)
  - [Debugging local tests](#debugging-local-tests)
- [What the suite covers](#what-the-suite-covers)
- [Production](#production)
  - [Debugging tests](#debugging-tests)
- [BrowserStack](#browserstack)
- [Licence](#licence)
  - [About the licence](#about-the-licence)

## Local Development

### Requirements

#### Node.js

Please install [Node.js](http://nodejs.org/) `>= v20` and [npm](https://nodejs.org/) `>= v9`. You will find it
easier to use the Node Version Manager [nvm](https://github.com/creationix/nvm)

To use the correct version of Node.js for this application, via nvm:

```bash
nvm use
```

### Setup

Install application dependencies:

```bash
npm install
```

### Running local tests

The suite runs against the deployed dashboard, so nothing needs to be started locally:

```bash
npm run test:local
```

Point the env variable somewhere else with
`DASHBOARD_BASE_URL`, which every wdio config honours:

```bash
DASHBOARD_BASE_URL=https://example.com npm run test:local
```

### Debugging local tests

```bash
npm run test:local:debug
```

## What the suite covers

[test/specs/dashboard.e2e.js](test/specs/dashboard.e2e.js) holds eleven smoke-level journeys, driven through
[test/page-objects/dashboard.page.js](test/page-objects/dashboard.page.js):

1. Page shell — title, `#root`, skip link and document language
2. Service header — logo, heading, tagline, sprint selector, settings and theme controls
3. Global overview landing view and breadcrumb
4. All eight dashboard sections render
5. Headline KPI cards resolve past their loading state
6. Live commit stream renders rows in its accessible table
7. Quality gate summary and the three persona cards
8. Sprint selector opens its quick ranges
9. Theme toggle flips `data-theme` between light and dark
10. Repository drill-down updates the heading and breadcrumb, and Back returns
11. Settings shows the persona mapping and audit log tables

All of it is read-only — no test writes a persona mapping or an audit log entry.

The dashboard renders `Loading…` placeholders until the analytics backend responds, so `waitForDataToLoad()` runs in
`beforeEach`. Several headings are upper-cased by CSS, which means `getText()` returns upper case; the page object
locates those by DOM text with XPath instead.

## Production

### Running the tests

Tests are run from the CDP-Portal under the Test Suites section. Before any changes can be run, a new docker image must be built, this will happen automatically when a pull request is merged into the `main` branch.
You can check the progress of the build under the actions section of this repository. Builds typically take around 1-2 minutes.

The results of the test run are made available in the portal.

## Requirements of CDP Environment Tests

1. Your service builds as a docker container using the `.github/workflows/publish.yml`
   The workflow tags the docker images allowing the CDP Portal to identify how the container should be run on the platform.
   It also ensures its published to the correct docker repository.

2. The Dockerfile's entrypoint script should return exit code of 0 if the test suite passes or 1/>0 if it fails

3. Test reports should be published to S3 using the script in `./bin/publish-tests.sh`

## Running on GitHub

Alternatively you can run the test suite as a GitHub workflow.
Test runs on GitHub are not able to connect to the CDP Test environments. Instead, they run the tests agains a version of the services running in docker.
A docker compose `compose.yml` is included as a starting point, which includes the databases (mongodb, redis) and infrastructure (localstack) pre-setup.

Steps:

1. Edit the compose.yml to include your services.
2. Modify the scripts in docker/scripts to pre-populate the database, if required and create any localstack resources.
3. Test the setup locally with `docker compose up` and `npm run test:github`
4. Set up the workflow trigger in `.github/workflows/journey-tests`.

By default, the provided workflow will run when triggered manually from GitHub or when triggered by another workflow.

If you want to use the repository exclusively for running docker composed based test suites consider displaying the publish.yml workflow.

## BrowserStack

Two wdio configuration files are provided to help run the tests using BrowserStack in both a GitHub workflow (`wdio.github.browserstack.conf.js`) and from the CDP Portal (`wdio.browserstack.conf.js`).
They can be run from npm using the `npm run test:browserstack` (for running via portal) and `npm run test:github:browserstack` (from GitHib runner).
See the CDP Documentation for more details.

Both configs read `BROWSERSTACK_USER` and `BROWSERSTACK_KEY`. Use a BrowserStack **service account**, never a
personal login token, and never commit the values — this repository is public.

The same credentials have to be stored in two places, because GitHub Actions secrets never reach a container running on
the platform and CDP Portal secrets are not visible to GitHub:

- **GitHub runs** — `Settings -> Secrets and variables -> Actions`, then bind them to the env of the step that runs the
  tests.
- **Portal runs** — the **Secrets** tab on the test suite in the CDP Portal. A redeploy is required before a new or
  changed secret takes effect.

Outbound traffic from CDP environments goes through the Squid proxy; `.browserstack.com` is on the default non-prod
allow list, so no `cdp-tenant-config` change is needed.

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government licence v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable
information providers in the public sector to license the use and re-use of their information under a common open
licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
