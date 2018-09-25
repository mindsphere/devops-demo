# DevOps Admin on MindSphere CloudFoundry

## Configuration

The following environment variables are recognized by the todo backend:

| Variable     | Description | Required |
|--------------|-------------|----------|
| `PROMETHEUS_URL`   | Full url of to-be-proxied Prometheus server | yes | *empty* |
| `GRAFANA_URL` | Full url of to-be-proxied Grafana server | yes |

## Build and Run

```sh
yarn
yarn start
```

## MindSphere Deployment

Adapt the `PROMETHEUS_URL` and `GRAFANA_URL` variables to the internal
CloudFoundry addresses of your to-be-proxied Prometheus and Grafana
applications. Then push:

```sh
APP_NAME="devopsadmin" \
PROMETHEUS_URL="<internal-cf-prometheus-url>" \
GRAFANA_URL="<internal-cf-grafana-url>" \
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
