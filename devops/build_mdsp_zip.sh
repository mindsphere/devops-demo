#!/usr/bin/env bash

GOPATH=$(go env GOPATH)
PROM_SRC_PATH="${GOPATH}/src/github.com/prometheus/prometheus"
GF_SRC_PATH="${GOPATH}/src/github.com/grafana/grafana"

which zip > /dev/null || { echo \"Please install the 'zip' command\"; exit 1; }

rm -f devopsadmin.zip
rm -rf build_zip

mkdir build_zip
cp -r devopsadmin build_zip
cp -r ${PROM_SRC_PATH} build_zip
cp -r ${GF_SRC_PATH} build_zip

pushd build_zip
zip -r devopsadmin . \
    -x 'devopsadmin/node_modules/*' \
    -x 'prometheus/.git/*' \
    -x 'prometheus/node_modules/*' \
    -x 'prometheus/data/*' \
    -x 'prometheus/promtool' \
    -x 'prometheus/prometheus' \
    -x 'grafana/.git/*' \
    -x 'grafana/bin/*' \
    -x 'grafana/node_modules/*'
popd
mv build_zip/devopsadmin.zip .
