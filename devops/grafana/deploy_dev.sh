#!/usr/bin/env bash

[[ -f "${CF_VARS_FILE}" ]] || { echo "Missing CF_VARS_FILE" && exit 1; }
[[ -d "${GF_CONF_DIR}" ]] || { echo "Missing GF_CONF_DIR" && exit 1; }

GOPATH=$(go env GOPATH)
GF_SRC_PATH="${GOPATH}/src/github.com/grafana/grafana"

cp .cfignore ${GF_SRC_PATH}
rm -rf "${GF_SRC_PATH}/mindsphere-conf"
cp -rf ${GF_CONF_DIR} "${GF_SRC_PATH}/mindsphere-conf"

cf push grafana \
    -f ../manifest.yml \
    -p "${GF_SRC_PATH}" \
    --vars-file "${CF_VARS_FILE}"
