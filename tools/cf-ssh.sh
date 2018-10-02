#!/usr/bin/env bash
#
# Copyright Siemens AG 2018
# SPDX-License-Identifier: MIT
#
# Easy ssh to MindSphere CloudFoundry apps and services
#
# https://google.github.io/styleguide/shell.xml
#

set -e

VERBOSE="false"
function .log () {
  if [[ ${VERBOSE} == "true" ]]; then
    echo -e "[info] $@"
  fi
}

function .err () {
  echo -e "[$(date +'%Y-%m-%dT%H:%M:%S%z')]: $@" >&2
}

function show_help() {
  cat << EOF
Usage: ${0##*/} -a APP_NAME [-i APP_INDEX] -- [EXTRA_SSH_PARAMS...]

Open an ssh connection to a CloudFoundry application running in MindSphere,
with an optional local port forwarding. It will also respect the settings of
the 'HTTP_PROXY' env var to forward the connection.

    -a APP_NAME        the application to connect to, as returned by 'cf apps'
    -i APP_INDEX       optional index of the application instance, in case of
                        multiple replicas
                        (default: 0)
    EXTRA_SSH_PARAMS   optional extra standard openssh parameters, they will be
                        provided as-is to the ssh command
                        (example: -L8080:localhost:80)

    -v                 verbose output
    -h                 display this help and exit

This assumes that access to the appropriate CloudFoundry deployment has been
correctly setup in the environment, particularly:

    * 'cf target' and 'cf apps' work properly

The following shell tools MUST be installed:
    * proxytunnel (if using HTTP_PROXY)
    * jq
    * sshpass

Example invocation:
    $ ./cf-ssh.sh -v -a my-app -- -L8080:localhost:8080 -L8081:localhost:8081
EOF
}

function main () {
  # Default argument values
  local arg_app_name=""
  local arg_app_index="0"

  local sed_cmd="sed"


  # Expects 'proxytunnel' binary in PATH if HTTP_PROXY is set
  if [[ -n "${HTTP_PROXY}" ]]; then
    [[ $(type -P proxytunnel) ]] || { .err "HTTP_PROXY set and 'proxytunnel' not found in PATH\nPlease install 'proxytunnel'"; exit 1; }
  fi

  # Check required command line tools
  [[ $(type -P jq) ]] || { .err "'jq' not found in PATH\nPlease install 'jq'"; exit 1; }
  [[ $(type -P sshpass) ]] || { .err "'sshpass' not found in PATH\nPlease install 'sshpass'\nIf you are on macOS, please check: https://gist.github.com/arunoda/7790979#installing-on-os-x"; exit 1; }

  # Expect gsed in case we are in macOS
  if [[ $OSTYPE == darwin* ]]; then
    [[ $(type -P gsed) ]] || { .err "Running macOS and 'gsed' not found in PATH\nPlease install 'gsed', e.g. 'brew install gnu-sed'"; exit 1; }
    sed_cmd="gsed"
  fi

  # Resetting OPTIND is necessary if getopts was used previously in the script.
  # It is a good idea to make OPTIND local if you process options in a function.
  OPTIND=1

  while getopts "a:i:hvd" opt; do
    case "${opt}" in
      h)
        show_help
        exit 0
        ;;
      v)
        VERBOSE="true"
        ;;
      a)
        arg_app_name="${OPTARG}"
        ;;
      i)
        arg_app_index="${OPTARG}"
        ;;
    esac
  done

  shift "$((OPTIND-1))" # Shift off the options and optional --.

  # If there are input files (for example) that follow the options, they
  # will remain in the "$@" positional parameters.
  local arg_extra_ssh_params=$@

  .log "detected params: APP_NAME: '${arg_app_name}', APP_INDEX: '${arg_app_index}', EXTRA_SSH_PARAMS: '${arg_extra_ssh_params}'"

  if [[ -z "${arg_app_name}" ]]; then
    .err "missing parameter: APP_NAME: ${arg_app_name}"
    exit 1
  fi

  if [[ -z "${arg_app_index}" ]]; then
    .err "missing parameter: APP_INDEX: '${arg_app_index}"
    exit 1
  fi

  # Obtain GUID of APP from CF
  readonly cf_app_guid="$(cf app ${arg_app_name} --guid)"
  if [[ -z "${cf_app_guid}" ]]; then
    .err "could not find GUID for app ${arg_app_name}"
    exit 1
  fi
  .log "queried GUID of ${arg_app_name}: ${cf_app_guid}"

  # Parse the SSH endpoint into url and port
  local cf_ssh_endpoint="$(cf curl /v2/info | jq -r '.app_ssh_endpoint')"
  .log "queried CF SSH endpoint: ${cf_ssh_endpoint}"

  readonly url_sed_expr="s/\([^/]*\/\/\)\?\([^@]*@\)\?\([^:/]*\)\(:\([0-9]\{1,5\}\)\)\?.*/"
  readonly cf_ssh_endpoint_url="$(echo "${cf_ssh_endpoint}" | ${sed_cmd} -e "${url_sed_expr}\3/")"
  local cf_ssh_endpoint_port="$(echo "${cf_ssh_endpoint}" | ${sed_cmd} -e "${url_sed_expr}\5/")"

  if [[ -z "${cf_ssh_endpoint_port}" ]]; then
    cf_ssh_endpoint_port="22"
  fi
  .log "CF SSH endpoint url: ${cf_ssh_endpoint_url}, port: ${cf_ssh_endpoint_port}"

  # Obtain One-Time Password from CF
  readonly cf_ssh_otp="$(cf ssh-code)"
  if [[ -z "${cf_ssh_otp}" ]]; then
    .err "could not obtain one-time password"
    exit 1
  else
    .log "obtained one-time password"
  fi

  # Build SSH user as 'cf:<app_guid>:<app_index>'
  readonly cf_ssh_user="cf:${cf_app_guid}/${arg_app_index}"

  # No hostkey checking to support prompt-less sshpass
  readonly cf_ssh_no_host_check_opt="StrictHostKeyChecking=no"

  # Setup ProxyCommand in case proxy env var is set
  local cf_ssh_proxy_command
  if [[ ${HTTP_PROXY} ]]; then
    local http_proxy_stripped=${HTTP_PROXY#http://}
    cf_ssh_proxy_command="ProxyCommand=proxytunnel -q -p ${http_proxy_stripped} -d %h:%p"
    .log "detected http proxy, using ssh option: ${cf_ssh_proxy_command}"
  fi

  .log "ssh command user: ${cf_ssh_user}"
  .log "ssh command endpoint url: ${cf_ssh_endpoint_url}"
  .log "ssh command endpoint port: ${cf_ssh_endpoint_port}"

  # Use different ssh commands in case we are using a proxy command
  if [[ -z ${cf_ssh_proxy_command} ]]; then
    sshpass -p "${cf_ssh_otp}" ssh -4 -p "${cf_ssh_endpoint_port}" -o "${cf_ssh_no_host_check_opt}" $arg_extra_ssh_params "${cf_ssh_user}"@"${cf_ssh_endpoint_url}"
  else
    sshpass -p "${cf_ssh_otp}" ssh -4 -p "${cf_ssh_endpoint_port}" -o "${cf_ssh_proxy_command}" -o "${cf_ssh_no_host_check_opt}" $arg_extra_ssh_params "${cf_ssh_user}"@"${cf_ssh_endpoint_url}"
  fi

  exit 0
}

main "$@"

