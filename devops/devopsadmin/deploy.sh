#!/usr/bin/env bash

APP_NAME="${APP_NAME:-devopsadmin}"

[[ -n "${PROMETHEUS_URL}" ]] || { echo "Missing PROMETHEUS_URL" && exit 1; }
[[ -n "${GRAFANA_URL}" ]] || { echo "Missing GRAFANA_URL" && exit 1; }

cf push ${APP_NAME} --no-start
cf set-env ${APP_NAME} PROMETHEUS_URL ${PROMETHEUS_URL}
cf set-env ${APP_NAME} GRAFANA_URL ${GRAFANA_URL}
cf start ${APP_NAME}
