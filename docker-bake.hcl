# Docker Bake configuration for SAF CLI
# Build single- or multi-platform

# Variables for customization
variable "DOCKER_HUB_REPO" {
  default = "mitre/saf"
}

variable "TAG_SUFFIXES" {
  default = "dev"
}

variable "BASE_CONTAINER" {
  default = "node:22-alpine"
}

variable "YARNREPO_MIRROR" {
  default = "https://registry.npmjs.org"
}

# Common configuration shared by all targets
target "_common" {
  dockerfile = "Dockerfile"
  tags = concat([for suffix in split(",", TAG_SUFFIXES) : "${DOCKER_HUB_REPO}:${trimspace(suffix)}"])
  args = {
    BASE_CONTAINER = "${BASE_CONTAINER}"
  }
  labels = {
    "org.opencontainers.image.source" = "https://github.com/mitre/saf"
    "org.opencontainers.image.licenses" = "Apache-2.0"
    "org.opencontainers.image.description" = "The MITRE Security Automation Framework (SAF) Command Line Interface (CLI) brings together applications, techniques, libraries, and tools developed by MITRE and the security community to streamline security automation for systems and DevOps pipelines"
    "org.opencontainers.image.created" = "${timestamp()}"
  }
}

# Multi-architecture (default)
target "default" {
  inherits = ["_common"]
  platforms = ["linux/amd64", "linux/arm64"]
}

# AMD64 only
target "amd64" {
  inherits = ["_common"]
  platforms = ["linux/amd64"]
}

# ARM64 only
target "arm64" {
  inherits = ["_common"]
  platforms = ["linux/arm64"]
}
