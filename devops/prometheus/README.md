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

The following environment variables are recognized by the todo backend:

| Variable     | Description | Required |
|--------------|-------------|----------|
| `PROM_EXTERNAL_URL` | External Prometheus URL | yes |

## Deploy to MindSphere

1. Copy and adapt `conf/prometheus.yml.sample` to `conf/prometheus.yml`,
   specifically:
   - `targets` of `todo` job, point to the internal address of the todo app

1. Download the prometheus source code. This will save the code to your
   `${GOPATH}` (typically `~/go` or `~/.go`)

     ```sh
     go get github.com/prometheus/prometheus/cmd/...
     ```

1. Ensure you are in the right CloudFoundry space and push to MindSphere. The
   command will also copy the required configuration files to the prometheus
   source before push.

     ```sh
     APP_NAME="prometheus" \
     PROM_CONF_FILE="<path>" \
     PROM_EXTERNAL_URL="<url>" \
     ./deploy.sh
     ```

   The param `PROM_CONFIG_FILE` points to your adapted configuration file.

   The parameter `PROM_EXTERNAL_URL` is the address under which prometheus
   should be reachable from the internet. If using the *devopsadmin* component
   for this, it will be `<external-devopsadmin-url>/prometheus/`

   The optional parameter `APP_NAME` is the name that will be used to push
   the application.

If you want to send all logs to LogMe (ELK), you can bind the app to the
appropriate service name (see [main README.md](../../README.md)):

```sh
cf bind-service prometheus todo-logme
```

## Local Build and Execution

In case you want to build & run locally the prometheus distribution:

```sh
cd "$(go env GOPATH)/src/github.com/prometheus/prometheus"
make build

./prometheus --config.file=your_config.yml
```

## License

This project is licensed under the MIT License
