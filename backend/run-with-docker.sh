#!/usr/bin/env bash
# Run the backend using a Maven Docker image (bash)
# Usage: cd backend && ./run-with-docker.sh

backend="$(pwd)"
echo "Starting backend with Docker (mounting $backend) ..."

docker run --rm -it \
  -v "$backend":/workspace \
  -w /workspace \
  -p 8080:8080 \
  maven:3.8.8-jdk-17 \
  mvn -DskipTests spring-boot:run
