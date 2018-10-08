#!/usr/bin/env bash

APP_NAME="${APP_NAME:-devopsadmin}"

[[ -n "${PROMETHEUS_URL}" ]] || { echo "Missing PROMETHEUS_URL" && exit 1; }
[[ -n "${GRAFANA_URL}" ]] || { echo "Missing GRAFANA_URL" && exit 1; }
[[ -n "${TECH_USER_OAUTH_ENDPOINT}" ]] || { echo "Missing TECH_USER_OAUTH_ENDPOINT" && exit 1; }
[[ -n "${TECH_USER_CLIENT_ID}" ]] || { echo "Missing TECH_USER_CLIENT_ID" && exit 1; }
[[ -n "${TECH_USER_CLIENT_SECRET}" ]] || { echo "Missing TECH_USER_CLIENT_SECRET" && exit 1; }

cf push ${APP_NAME} --no-start
cf set-env ${APP_NAME} PROMETHEUS_URL ${PROMETHEUS_URL}
cf set-env ${APP_NAME} GRAFANA_URL ${GRAFANA_URL}
cf set-env ${APP_NAME} TECH_USER_OAUTH_ENDPOINT ${TECH_USER_OAUTH_ENDPOINT}
cf set-env ${APP_NAME} TECH_USER_CLIENT_ID ${TECH_USER_CLIENT_ID}
cf set-env ${APP_NAME} TECH_USER_CLIENT_SECRET ${TECH_USER_CLIENT_SECRET}
cf start ${APP_NAME}
