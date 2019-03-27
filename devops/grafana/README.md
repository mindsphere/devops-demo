# Grafana on MindSphere CloudFoundry

## Tested Environment

```sh
$ cf version
cf version 6.38.0+7ddf0aadd.2018-08-07

$ go version
go version go1.10.1 darwin/amd64

$ node --version
v8.12.0

$ yarn --version
1.7.0
```

## Configuration

The following environment variables are recognized by the todo backend:

| Variable     | Description | Required |
|--------------|-------------|----------|
| `GF_DATABASE_URL` | Full url of db, including user / password | yes |
| `GF_SMTP_PASSWORD` | Password of smtp server for email notifications | yes |

## CloudFoundry Deployment

Grafana is deployed from its github sources. Since Grafana is a Golang
project and we require some custom configuration files to be uploaded when
deploying to cloudfoundry, a script is provided that copies the relevant files
into the checked out sources.

1. Copy and adapt the directory `sample-conf/`, specifically:
    - In `defaults.custom.ini`, set  `server.domain` and `smtp` configuration
    - In `datasources/prometheus.yaml`, set the appropriate url of prometheus

1. Download the grafana source code. This will save the code to your
  `${GOPATH}` (typically `~/go` or `~/.go`):

    ```sh
    go get github.com/grafana/grafana
    ```

1. Checkout the latest tested version (`v5.3.4` at the time of writing):

    ```sh
    cd ${GOPATH}/src/github.com/grafana/grafana
    git checkout v5.3.4
    ```

1. Build the grafana static web interface locally. This is required because we
  don't want to depend on two buildpacks (go & nodejs). Building the webpack
  locally before uploading to CloudFoundry allows us to keep the deployment
  within a single buildpack. It is only required once:

    ```sh
    yarn --cwd "$(go env GOPATH)/src/github.com/grafana/grafana"
    yarn --cwd "$(go env GOPATH)/src/github.com/grafana/grafana" --prod run build
    ```

1. Provision the required db service for grafana:

    ```sh
    cf create-service postgresql94 postgresql-xs grafana-postgres
    ```

1. The manifest will bind itself to a LogMe (ELK) service to gather all logs,
  make sure you have created it in advance:

    ```sh
    cf create-service logme logme-xs devopsadmin-logme
    ```

1. Ensure you are in the right CloudFoundry space and deploy Grafana. The
  command will also copy the required configuration files to the local grafana
  source directory before push:

    ```sh
    CF_VARS_FILE="<path>" \
    GF_CONF_DIR="<path>" \
    ./deploy_dev.sh
    ```

  The param `CF_VARS_FILE` is your CloudFoundry adapted vars file.

  The param `GF_CONFIG_DIR` points to your adapted configuration directory
  that will be uploaded

## Limitations: Alerting Notification Channels

As of grafana v5, [auto-provisioning of alerting setup is not possible](http://docs.grafana.org/administration/provisioning/):

> We hope to extend this system to later add support for users, orgs and alerts
> as well.

In order to configure a *Notification Channel*:

- Login into grafana
- Go to `Alerting > Notification channels > Add channel`
- Set values:
  - Name: `MindSphere DevOps`
  - Type: `Email`
  - Send on all alerts: `checked`
  - Email addresses: `devops@example.com`

## Grafana Dashboards Json Export

Import any dashboard into grafana, then save the resulting json found under
`dashboard -> settings -> view json`

**IMPORTANT** Do not use the `dashboard -> share -> save/view json` option,
this will save a templated wrong json that can't be used for file provisioning

## Local Build and Execution

In case you want to build & run locally the grafana distribution:

```sh
cd "$(go env GOPATH)/src/github.com/grafana/grafana"
go run build.go setup
go run build.go build
yarn run build

bin/*/grafana-server
```

## License

This project is licensed under the MIT License
