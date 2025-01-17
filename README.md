# Prison Staff Hub UI App

Application can be built with for dev mode

```bash
npm run compile-sass 
npm run start:dev
```

The application will automatically pick up front end changes and it will restart if there are any changes in /backend or /views.
Other changes will require a manual restart.

Run locally as docker

```bash
docker run -p 3000:3000 -d \
     --name prisonstaffhub \
     mojdigitalstudio/prisonstaffhub:latest
```

Run remotely as docker

```bash
docker run -p 3000:3000 -d \
     --name prisonstaffhub \
     -e API_ENDPOINT_URL=https://api-dev.prison.service.justice.gov.uk/ \
     -e OAUTH_ENDPOINT_URL=https://sign-in-dev.hmpps.service.justice.gov.uk/auth/ \
     -e API_GATEWAY_TOKEN=<add here> \
     -e API_CLIENT_SECRET=<add here> \
     -e API_GATEWAY_PRIVATE_KEY=<add here> \
     mojdigitalstudio/prisonstaffhub:latest
```

## Cypress integration tests

The `integration-tests` directory contains a set of Cypress integration tests for the `prisonstaffhub` application.
These tests use WireMock to stub the application's dependencies on the prisonApi, oauth and whereabouts RESTful APIs.

### Running the Cypress tests

You need to fire up the wiremock server first:
```docker-compose -f docker-compose-test.yaml up```

This will give you useful feedback if the app is making requests that you haven't mocked out. You can see
the request log at `localhost:9191/__admin/requests/` and a JSON representation of the mocks `localhost:9191/__admin/mappings`.

### Starting feature tests node instance

A separate node instance needs to be started for the feature tests. This will run on port 3008 and won't conflict
with any of the api services, e.g. prisonApi or oauth. It will also not conflict with the Groovy integration tests.

```npm run start-feature --env=cypress.env```

Note that the circleci will run `start-feature-no-webpack` instead, which will rely on a production webpack build
rather than using the dev webpack against the assets.

### Running the tests

With the UI:
```
npm run int-test-ui
```

Just on the command line (any console log outputs will not be visible, they appear in the browser the Cypress UI fires up):
```
npm run int-test
```

### Useful links

- Spock: http://spockframework.org/
- Geb: http://www.gebish.org/
- Groovy: http://groovy-lang.org/index.html
- Gradle: https://gradle.org/
- WireMock: http://wiremock.org/
- Chromedriver: https://sites.google.com/a/chromium.org/chromedriver

## Feature toggles
- **SOC API:**
This will enable/disable to ability to refer a prisoner to the SOC service and view their SOC profile if already referred.
To enable the feature, change the environment variable of **SOC_API_ENABLED** to **true**. Any other value will disable the feature. 

#### Phase Name Banner
To show the phase name banner add the environment variable ``` SYSTEM_PHASE=ENV_NAME ```. 
This will trigger the banner to become visible showing the given name.