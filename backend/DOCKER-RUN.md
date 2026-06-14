Run backend with Docker

These scripts let you run the Spring Boot backend without installing Maven locally. They mount the `backend/` folder into a Maven Docker image and run `spring-boot:run`.

PowerShell (Windows):

```
# from repo root
cd backend
./run-with-docker.ps1
```

Bash (Linux/macOS/Cygwin/Git Bash):

```
cd backend
./run-with-docker.sh
```

Notes:
- Requires Docker to be installed and running.
- The container uses `maven:3.8.8-jdk-17` which matches the project Java version defined in `pom.xml`.
- The app will be accessible on port `8080` of your host.
- To build a jar instead of running directly, replace the `mvn -DskipTests spring-boot:run` command with `mvn -DskipTests clean package` and run the produced jar with `java -jar target/*.jar` inside a suitable JDK image or locally if JDK is installed.
