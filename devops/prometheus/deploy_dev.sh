#!/usr/bin/env bash

[[ -f "${CF_VARS_FILE}" ]] || { echo "Missing CF_VARS_FILE" && exit 1; }
[[ -f "${PROM_CONF_FILE}" ]] || { echo "Missing PROM_CONF_FILE" && exit 1; }

GOPATH=$(go env GOPATH)
PROM_SRC_PATH="${GOPATH}/src/github.com/prometheus/prometheus"

cp .cfignore ${PROM_SRC_PATH}
mkdir -p "${PROM_SRC_PATH}/mindsphere-conf/"
cp ${PROM_CONF_FILE} "${PROM_SRC_PATH}/mindsphere-conf/prometheus.yml"

cf push prometheus \
    -f ../manifest.yml \
    -p "${PROM_SRC_PATH}" \
    --vars-file "${CF_VARS_FILE}"
