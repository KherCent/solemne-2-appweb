# Stage 1: Build
FROM maven:3.8.8-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
# Descargar dependencias para cachear
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=builder /app/target/incidentportal-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
