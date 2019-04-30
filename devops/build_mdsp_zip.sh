#!/usr/bin/env bash

GOPATH=$(go env GOPATH)
PROM_SRC_PATH="${GOPATH}/src/github.com/prometheus/prometheus"
GF_SRC_PATH="${GOPATH}/src/github.com/grafana/grafana"
BUILDDIR="build_zip"

which zip > /dev/null || { echo \"Please install the 'zip' command\"; exit 1; }

rm -f devopsadmin.zip
rm -rf ${BUILDDIR}

mkdir ${BUILDDIR}
cp README.md vars-file.yml.sample ${BUILDDIR}
cp -r devopsadmin ${BUILDDIR}
cp -r ${PROM_SRC_PATH} ${BUILDDIR}
cp -r ${GF_SRC_PATH} ${BUILDDIR}

pushd ${BUILDDIR}
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
mv ${BUILDDIR}/devopsadmin.zip .
