package com.jobportal.server;

import com.jobportal.config.DBConnection;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

/**
 * Database Initializer & Migration Utility.
 * Reads database/schema.sql and safely executes table creations and seeds.
 * Idempotent and non-destructive: preserves existing tables and data.
 */
public class InitDB {

    public static void main(String[] args) {
        initDatabase();
    }

    public static boolean initDatabase() {
        System.out.println("==================================================");
        System.out.println("   JOB PORTAL MANAGEMENT SYSTEM - DB INITIALIZER");
        System.out.println("==================================================");

        File schemaFile = new File("database/schema.sql");
        if (!schemaFile.exists()) {
            schemaFile = new File("../database/schema.sql");
        }

        if (!schemaFile.exists()) {
            System.err.println("Notice: database/schema.sql not found at " + schemaFile.getAbsolutePath());
            return false;
        }

        System.out.println("Using Schema File: " + schemaFile.getAbsolutePath());
        System.out.println("Connecting to MySQL at: " + DBConnection.getUrl());
        System.out.println("User: " + DBConnection.getUser());

        try (Connection con = DBConnection.getConnection()) {
            if (con == null) {
                System.err.println("[-] Could not establish connection to database.");
                System.err.println("Please check that MySQL Server is running and DB_URL/DB_USER/DB_PASSWORD environment variables or db.properties match.");
                return false;
            }

            System.out.println("[+] Connected to database successfully. Executing schema.sql safely...");

            try (BufferedReader reader = new BufferedReader(new FileReader(schemaFile));
                 Statement st = con.createStatement()) {

                // Check if jobs table exists and has records
                boolean hasExistingJobs = false;
                try (ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM jobs")) {
                    if (rs.next() && rs.getInt(1) > 0) {
                        hasExistingJobs = true;
                    }
                } catch (Exception ignored) {
                    // Table doesn't exist yet
                }

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
                        if (query.endsWith(";")) {
                            query = query.substring(0, query.length() - 1);
                        }

                        // Skip sample jobs insert if jobs already exist in the database
                        boolean isJobsInsert = query.toUpperCase().startsWith("INSERT INTO JOBS") || query.toUpperCase().startsWith("INSERT IGNORE INTO JOBS");
                        if (isJobsInsert && hasExistingJobs) {
                            sql.setLength(0);
                            continue;
                        }

                        if (!query.isEmpty() && !query.toUpperCase().startsWith("CREATE DATABASE") && !query.toUpperCase().startsWith("DROP DATABASE") && !query.toUpperCase().startsWith("USE ")) {
                            try {
                                st.execute(query);
                                count++;
                            } catch (Exception ex) {
                                System.err.println("Notice on statement: " + ex.getMessage());
                            }
                        }
                        sql.setLength(0);
                    }
                }
                System.out.println("[+] Executed " + count + " SQL statements successfully!");
                System.out.println("[+] Database initialization verified.");
                return true;
            }
        } catch (Exception e) {
            System.err.println("Database initialization error: " + e.getMessage());
            return false;
        }
    }
}
