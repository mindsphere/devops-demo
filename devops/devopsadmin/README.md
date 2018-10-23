# DevOps Admin on MindSphere CloudFoundry

## Configuration

The following environment variables are recognized by the todo backend:

| Variable     | Description | Required |
|--------------|-------------|----------|
| `PROMETHEUS_URL`   | Full url of to-be-proxied Prometheus server | yes | *empty* |
| `GRAFANA_URL` | Full url of to-be-proxied Grafana server | yes |
| `TECH_USER_OAUTH_ENDPOINT` | Full url of oauth endpoint to be used for technical user login | yes |
| `TECH_USER_CLIENT_ID` | Technical user client id | yes |
| `TECH_USER_CLIENT_SECRET` | Technical user client secret | yes |

The Technical User is required to be able to send notifications with the
`/notification` endpoint ([see the MindSphere documentation](https://developer.mindsphere.io/apis/advanced-notification/api-notification-overview.html#access)).

## Build and Run

```sh
yarn
yarn start
```

## MindSphere Deployment

Adapt the `PROMETHEUS_URL` and `GRAFANA_URL` variables to the internal
CloudFoundry addresses of your to-be-proxied Prometheus and Grafana
applications.

Also provide directly, or add as gitlab-ci protected variables, the values
for `TECH_USER_OAUTH_ENDPOINT`, `TECH_USER_CLIENT_ID`, and
`TECH_USER_CLIENT_SECRET`.

If you want to use the notification samples, provide an email on the variable
`NOTIFICATION_EMAIL` and a mobile number on `NOTIFICATION_MOBILE_NUMBER`.

Then push:

```sh
APP_NAME="devopsadmin" \
PROMETHEUS_URL="<internal-cf-prometheus-url>" \
GRAFANA_URL="<internal-cf-grafana-url>" \
TECH_USER_OAUTH_ENDPOINT="<technical-user-oauth-endpoint>" \
TECH_USER_CLIENT_ID="<technical-user-client-id>" \
TECH_USER_CLIENT_SECRET="<technical-user-client-secret>" \
NOTIFICATION_EMAIL="<email-address>" \
NOTIFICATION_MOBILE_NUMBER="<mobile-number>" \
./deploy.sh
```

The following CSP policy is required to be able to proxy components
(e.g. Grafana). This needs to be setup in the MindSphere Developer Cockpit,
before registering the app:

```
default-src 'self' static.eu1.mindsphere.io; style-src * 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval' static.eu1.mindsphere.io; img-src * data:;
```

If you want to send all logs to LogMe (ELK), you can bind the app to the
appropriate service name (see [main README.md](../../README.md)):

```sh
cf bind-service devopsadmin todo-logme
```

## Debug Proxy Requests

Set the following environment variable in the cloudfoundry manifest:

```
DEBUG: express-http-proxy
```

## License

This project is licensed under the MIT License
