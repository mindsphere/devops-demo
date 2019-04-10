#!/usr/bin/env bash

[[ -f "${CF_VARS_FILE}" ]] || { echo "Missing CF_VARS_FILE" && exit 1; }

cf push devopsadmin \
    -f ../manifest.yml \
    -p . \
    --vars-file "${CF_VARS_FILE}"
