#!/usr/bin/env bash

GOPATH=$(go env GOPATH)
GF_SRC_PATH="${GOPATH}/src/github.com/grafana/grafana"

APP_NAME="${APP_NAME:-grafana}"
DB_SVC_NAME="${DB_SVC_NAME:-grafana-postgres}"

[[ -d "${GF_CONF_DIR}" ]] || { echo "Missing GF_CONF_DIR" && exit 1; }
[[ -n "${GF_DATABASE_URL}" ]] || { echo "Missing GF_DATABASE_URL" && exit 1; }
[[ -n "${GF_SMTP_PASSWORD}" ]] || { echo "Missing GF_SMTP_PASSWORD" && exit 1; }

cp .cfignore ${GF_SRC_PATH}
rm -rf "${GF_SRC_PATH}/mindsphere-conf"
cp -rf ${GF_CONF_DIR} "${GF_SRC_PATH}/mindsphere-conf"

cf push -p ${GF_SRC_PATH} --no-start ${APP_NAME}
cf set-env ${APP_NAME} GF_DATABASE_URL ${GF_DATABASE_URL}
cf set-env ${APP_NAME} GF_SMTP_PASSWORD ${GF_SMTP_PASSWORD}
cf bind-service ${APP_NAME} ${DB_SVC_NAME}
cf start ${APP_NAME}
