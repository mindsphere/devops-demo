# cf-ssh.sh

Automates ssh connectivity to MindSphere applications running in CloudFoundry.

When running MindSphere applications,
[ssh access requires several steps](https://developer.mindsphere.io/paas/paas-cloudfoundry-ssh.html).
To aid in this task, the script provides the following functionality:

* Automates the generation of the required one-time password
* Tunnels appropriately ssh connections when proxy settings are detected

Tested in Debian Linux 9.5 and macOS 10.13+

## Prerequisites

1. Assumes that access to the appropriate CloudFoundry deployment has been
  correctly setup in the environment, particularly 'cf target' and
  'cf apps' work properly

1. The following shell commands are available in the environment:
    * openssh client
    * *(if using HTTP_PROXY)* proxytunnel
    * jq
    * sshpass  
      If you are on macOS, please check: https://gist.github.com/arunoda/7790979#installing-on-os-x
    * *(only on macOS)* gnu-sed

## Recipes

### How to ssh to a running application

```sh
cf-ssh.sh -v -a my-app
```

### How to open a local tunnel to a remote application port

The following command tunnels local port `8081` to remote port `8080`:

```sh
cf-ssh.sh -v -a my-app -- -L8080:localhost:8080
```

Multiple ports are also possible, the options after `--` are just standard
OpenSSH options:

```sh
cf-ssh.sh -v -a my-app -- -L8080:localhost:8080 -L8081:localhost:8081
```

### How to open a local tunnel to a remote db service

MindSphere does not allow direct ssh access to services, so an intermediate
reachable application that is bound to the service is needed.

Steps:

1. Obtain the db connection details by checking the environment variable
  `VCAP_SERVICES` of the application bound to the service (use `cf env <app>`)
1. Extract from this data: db url, db port, user, password
1. Create an ssh tunnel, forwarding a local port to the remote one:

    ```sh
    cf-ssh.sh -v -a my-app -- -L8888:<db-url>:<db-port>
    ```

1. Now in a different terminal, using your preferred db browser, connect to
  the db using the local tunnel at `localhost:8888`, providing the user and
  password you extracted earlier
