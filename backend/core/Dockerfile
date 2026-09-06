# ---- Build Stage ----
FROM gradle:8.14-jdk21 AS build
WORKDIR /app

COPY . .
RUN chmod +x gradlew
RUN gradle build -x test --no-daemon

# ---- Runtime Stage ----
FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]