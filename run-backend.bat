@echo off
echo ========================================================
echo   JOB PORTAL MANAGEMENT SYSTEM - JAVA BACKEND SERVER
echo   Core Java Servlets, JDBC, MySQL, Port 8080
echo ========================================================
java -cp "lib/*;backend/target/classes" com.jobportal.server.DevServer 8080
pause
