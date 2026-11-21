@echo off
echo ========================================================
echo   JOB PORTAL MANAGEMENT SYSTEM - DATABASE INITIALIZER
echo   Executing database/schema.sql into MySQL...
echo ========================================================
java -cp "lib/*;backend/target/classes" com.jobportal.server.InitDB
pause
