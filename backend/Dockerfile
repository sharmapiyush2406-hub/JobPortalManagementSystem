# ========================================================
# JOB PORTAL MANAGEMENT SYSTEM - BACKEND DOCKERFILE
# Multi-stage build using Eclipse Temurin Java 17 & Maven
# ========================================================

# --------------------------------------------------------
# Stage 1: Build the Maven application
# --------------------------------------------------------
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build

# Copy Maven Project Object Model (POM)
COPY pom.xml .

# Download dependencies offline to leverage Docker layer caching
RUN mvn dependency:go-offline -B || true

# Copy application source code and resources
COPY src ./src

# Copy library jars and database schema
COPY lib ./lib
COPY database ./database

# Compile and package application (maven-dependency-plugin copies jars to target/dependency)
RUN mvn clean package -DskipTests

# --------------------------------------------------------
# Stage 2: Production Runtime Environment (JRE 17)
# --------------------------------------------------------
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Default port fallback (Render injects dynamic PORT at runtime)
ENV PORT=8080

# Copy compiled classes and packaged dependencies from builder stage
COPY --from=builder /build/target/classes ./target/classes
COPY --from=builder /build/target/dependency ./target/dependency

# Copy lib jars and SQL schema files
COPY --from=builder /build/lib ./lib
COPY --from=builder /build/database ./database

# Setup fallback paths for ../lib and ../database so both ./ and ../ lookups resolve
RUN mkdir -p /app/../lib /app/../database && \
    cp -rn ./lib/* /app/../lib/ 2>/dev/null || true && \
    cp -rn ./database/* /app/../database/ 2>/dev/null || true

# Expose port (overridden dynamically by Render at runtime via PORT environment variable)
EXPOSE 8080

# Launch standalone DevServer with target/classes, target/dependency, and lib on classpath
CMD ["java", "-cp", "target/classes:target/dependency/*:lib/*:../lib/*", "com.jobportal.server.DevServer"]
