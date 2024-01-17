job "succulent-backend$BRANCH_SUFFIX" {
  region     = "global"
  datacenters = ["*"]

  group "static" {
    count = 1

    network {
      port "http" {
        to = 3331
      }
    }

    constraint {
      attribute = "${node.class}"
      operator  = "="
      value     = "mesh"
    }

    constraint {
      attribute = "${node.datacenter}"
      operator  = "="
      value     = "london"
    }

    spread {
      attribute = "${node.datacenter}"
      weight    = 100
    }

    constraint {
      distinct_hosts = true
    }

    task "server" {
      driver = "docker"

      config {
        image = "$DOCKER_TAG"
        ports = ["http"]

        auth = {
          username = "$DOCKER_USER"
          password = "$DOCKER_PASSWORD"
        }

        mount {
          type   = "bind"
          source = "configs/SucculentSchedulerCredentials.json"
          target = "/usr/src/app/SucculentSchedulerCredentials.json"
        }
      }

      env {
        SUCCULENT_BACKEND_ADDR = "https://succulent-backend$BRANCH_SUFFIX.jazz.tools"
        SUCCULENT_FRONTEND_ADDR = "https://succulent$BRANCH_SUFFIX.jazz.tools"
      }

      template {
        data = <<EOH
        {{ with nomadVar "nomad/jobs/succulent-backend" }}{
          "accountID": "{{ .accountID }}",
          "accountSecret": "{{ .accountSecret }}"
        }{{ end }}
        EOH
        destination = "configs/SucculentSchedulerCredentials.json"
      }

      service {
        tags = ["public"]
        name = "succulent-backend$BRANCH_SUFFIX"
        port = "http"
        provider = "consul"
      }

      resources {
        cpu    = 500 # MHz
        memory = 500 # MB
      }
    }
  }
}
# deploy bump 4