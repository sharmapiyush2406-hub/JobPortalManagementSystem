package com.jobportal.server;

import com.jobportal.config.DBConnection;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

/**
 * Database Initializer & Migration Utility.
 * Reads database/schema.sql and executes table creations and seeds.
 */
public class InitDB {

    public static void main(String[] args) {
        System.out.println("==================================================");
        System.out.println("   JOB PORTAL MANAGEMENT SYSTEM - DB INITIALIZER");
        System.out.println("==================================================");

        File schemaFile = new File("database/schema.sql");
        if (!schemaFile.exists()) {
            schemaFile = new File("../database/schema.sql");
        }

        if (!schemaFile.exists()) {
            System.err.println("Error: database/schema.sql not found at " + schemaFile.getAbsolutePath());
            return;
        }

        System.out.println("Using Schema File: " + schemaFile.getAbsolutePath());
        System.out.println("Connecting to MySQL at: " + DBConnection.getUrl());
        System.out.println("User: " + DBConnection.getUser());

        // First attempt connecting to server root (without database specified) to ensure database exists
        String baseUrl = "jdbc:mysql://localhost:3306/?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8";
        try (Connection rootCon = DriverManager.getConnection(baseUrl, DBConnection.getUser(), DBConnection.getPassword());
             Statement rootStmt = rootCon.createStatement()) {

            System.out.println("[+] Connected to MySQL Server successfully!");
            rootStmt.execute("CREATE DATABASE IF NOT EXISTS job_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            System.out.println("[+] Database 'job_portal' verified/created.");

        } catch (Exception e) {
            System.out.println("[-] Notice: Root connection: " + e.getMessage());
            System.out.println("Proceeding with direct connection...");
        }

        // Execute SQL script statements
        try (Connection con = DBConnection.getConnection()) {
            if (con == null) {
                System.err.println("[-] Could not establish connection to 'job_portal' database.");
                System.err.println("Please check that MySQL Server is running and credentials in DBConnection.java or DB_PASSWORD match.");
                return;
            }

            System.out.println("[+] Connected to job_portal database. Executing schema.sql...");
            try (BufferedReader reader = new BufferedReader(new FileReader(schemaFile));
                 Statement st = con.createStatement()) {

                StringBuilder sql = new StringBuilder();
                String line;
                int count = 0;

                while ((line = reader.readLine()) != null) {
                    String trimmed = line.trim();
                    if (trimmed.startsWith("--") || trimmed.isEmpty() || trimmed.startsWith("/*")) {
                        continue;
                    }
                    sql.append(line).append("\n");
                    if (trimmed.endsWith(";")) {
                        String query = sql.toString().trim();
                        // Remove trailing semicolon
                        if (query.endsWith(";")) {
                            query = query.substring(0, query.length() - 1);
                        }
                        if (!query.isEmpty() && !query.toUpperCase().startsWith("CREATE DATABASE") && !query.toUpperCase().startsWith("DROP DATABASE") && !query.toUpperCase().startsWith("USE ")) {
                            try {
                                st.execute(query);
                                count++;
                            } catch (Exception ex) {
                                System.err.println("Warning on statement: " + ex.getMessage());
                            }
                        }
                        sql.setLength(0);
                    }
                }
                System.out.println("[+] Executed " + count + " SQL statements successfully!");
                System.out.println("[+] Database schema and sample data initialized successfully!");
            }
        } catch (Exception e) {
            System.err.println("Database error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
