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
      }

      env {
        SUCCULENT_ADDR = "https://succulent-backend$BRANCH_SUFFIX.jazz.tools"
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