# Prometheus on MindSphere CloudFoundry

## Tested Environment

```sh
$ cf version
cf version 6.38.0+7ddf0aadd.2018-08-07

$ go version
go version go1.10.1 darwin/amd64

$ yarn --version
1.7.0
```

## Configuration

The following environment variables are recognized by the prometheus server:

| Variable     | Description | Required |
|--------------|-------------|----------|
| `PROM_EXTERNAL_URL` | External Prometheus URL | yes |

## Deploy to MindSphere

Prometheus is deployed from its github sources. Since Prometheus is a Golang
project and we require some custom configuration files to be uploaded when
deploying to cloudfoundry, a script is provided that copies the relevant files
into the checked out sources.

1. Copy and adapt `conf/prometheus.yml.sample` to `conf/prometheus.yml`,
  specifically:
    - `targets` of `todo` job, point to the internal address of the todo app

1. Follow the instructions on the [devopsadmin readme](../README.md) and copy
  and adapt the cf vars file with the required configuration

1. Download the prometheus source code. This will save the code to your
  `${GOPATH}` (typically `~/go` or `~/.go`)

    ```sh
    go get github.com/prometheus/prometheus/cmd/...
    ```

1. Checkout the latest tested version (`v2.5.0` at the time of writing):
    ```sh
    cd ${GOPATH}/src/github.com/prometheus/prometheus
    git checkout v2.5.0
    ```

1. The manifest will bind itself to a LogMe (ELK) service to gather all logs,
  make sure you have created it in advance:

    ```sh
    cf create-service logme logme-xs devopsadmin-logme
    ```

1. Ensure you are in the right CloudFoundry space and push to MindSphere. The
  command will also copy the required configuration files to the prometheus
  source before push:

    ```sh
    CF_VARS_FILE="<path>" \
    PROM_CONF_FILE="<path>" \
    ./deploy_dev.sh
    ```

  The param `CF_VARS_FILE` is your CloudFoundry adapted vars file.
  
  The param `PROM_CONF_FILE` points to your adapted configuration file.

## Local Build and Execution

In case you want to build & run locally the prometheus distribution:

```sh
cd "$(go env GOPATH)/src/github.com/prometheus/prometheus"
make build

./prometheus --config.file=your_config.yml
```

## License

This project is licensed under the MIT License
