# Run the backend using a Maven Docker image (PowerShell)
# Usage: Open PowerShell in the backend folder and run: .\run-with-docker.ps1

$backend = (Get-Location).Path
Write-Host "Starting backend with Docker (mounting $backend) ..."

docker run --rm -it \
  -v "$backend:/workspace" \
  -w /workspace \
  -p 8080:8080 \
  maven:3.8.8-jdk-17 \
  mvn -DskipTests spring-boot:run
