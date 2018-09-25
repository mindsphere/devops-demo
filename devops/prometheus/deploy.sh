#!/usr/bin/env bash

GOPATH=$(go env GOPATH)
PROM_SRC_PATH="${GOPATH}/src/github.com/prometheus/prometheus"

APP_NAME="${APP_NAME:-prometheus}"

[[ -f "${PROM_CONF_FILE}" ]] || { echo "Missing PROM_CONF_FILE" && exit 1; }
[[ -n "${PROM_EXTERNAL_URL}" ]] || { echo "Missing PROM_EXTERNAL_URL" && exit 1; }

cp .cfignore ${PROM_SRC_PATH}
mkdir -p "${PROM_SRC_PATH}/mindsphere-conf/"
cp ${PROM_CONF_FILE} "${PROM_SRC_PATH}/mindsphere-conf/prometheus.yml"

cf push -p ${PROM_SRC_PATH} --no-start ${APP_NAME}
cf set-env ${APP_NAME} PROM_EXTERNAL_URL "${PROM_EXTERNAL_URL}"
cf start ${APP_NAME}
