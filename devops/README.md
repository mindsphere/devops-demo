# DevOpsAdmin on MindSphere CloudFoundry

*devopsadmin* is intended to be a showcase of administrative actions, by both
providing direct calls to MindSphere services using technical credentials
(e.g. notifications) and also act as a proxy for prometheus & grafana.

Three components are offered:

1. *devopsadmin* is provided  as a Node.js backend, full source code under
  directory `devopsadmin/`
1. *prometheus* is deployed from its github sources using
  the go buildpack. The directory `prometheus/` contains deployment
  scripts and sample configuration files
1. *grafana* is also deployed from its github sources using the go buildpack.
  The directory `grafana/` contains deployment scripts and sample
  configuration files

## Configuration

The following environment variables are recognized by the devopsadmin backend:

| Variable                     | Description                                 | Required |
|------------------------------|---------------------------------------------|----------|
| `MDSP_TENANT`                | MindSphere tenant identifier                | yes      |
| `MDSP_REGION`                | MindSphere region identifier                | yes      |
| `PROMETHEUS_URL`             | Full url of to-be-proxied Prometheus server | yes      |
| `GRAFANA_URL`                | Full url of to-be-proxied Grafana server    | yes      |
| `TECH_USER_CLIENT_ID`        | Technical user client id                    | yes      |
| `TECH_USER_CLIENT_SECRET`    | Technical user client secret                | yes      |
| `NOTIFICATION_EMAIL`         | Email address for notifications             | yes      |
| `NOTIFICATION_MOBILE_NUMBER` | Mobile number for notifications (E.164 fmt) | yes      |

The Technical User is required to be able to send notifications with the
`/notification` endpoint ([see the MindSphere documentation](https://developer.mindsphere.io/apis/advanced-notification/api-notification-overview.html#access)).

## Build and Run

```sh
yarn --cwd devopsadmin
yarn --cwd devopsadmin start
```

## MindSphere Deployment

A single `manifest.yml` is provided for all components (devopsadmin,
prometheus, grafana). This is a requirement since in an operator tenant,
all applications will be deployed in a single cf space.

The manifest uses template variables. In order to configure the required
variables, copy the `vars-file.yml.sample` file and adapt the values.

Each of the three components provides a deployment script and can be
deployed independently. Please refer to the [prometheus](prometheus/README.md)
and [grafana](grafana/README.md) readme files for details.

```sh
cd devopsadmin
CF_VARS_FILE=<path-to-vars-file.yml> \
./deploy_dev.sh

cd ../prometheus
CF_VARS_FILE=<vars-file.yml> \
PROM_CONF_FILE=<prometheus-conf-file> \
./deploy_dev.sh

cd ../grafana
CF_VARS_FILE=<vars-file.yml> \
GF_CONF_DIR=<grafana-conf-dir> \
./deploy_dev.sh
```

The following CSP policy is also required to be able to proxy components
(particularly the `script-src 'unsafe-eval'` option for Grafana). This needs
to be setup in the MindSphere Developer Cockpit before registering the app:

```
default-src 'self' static.eu1.mindsphere.io; style-src * 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval' static.eu1.mindsphere.io; img-src * data:;
```

## MindSphere Operator Tenant Deployment

The script `build_mdsp_zip.sh` can be used to generate a zip file that can be
provided (together with the manifest file) for MindSphere Operator tenant
deployment.

The manifest is templated, so remember to inform the MindSphere validation team
of the required parameter values for your environment.

Please also note that this script assumes that a previous deployment to
development was successfully performed (e.g. generate the static web view for
grafana, or copied the appropriate configuration files).

## Debug Proxy Requests

Set the following environment variable in the cloudfoundry manifest:

```
DEBUG: express-http-proxy
```

## License

This project is licensed under the MIT License
