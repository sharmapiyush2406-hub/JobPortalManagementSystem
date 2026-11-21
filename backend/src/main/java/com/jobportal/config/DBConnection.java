package com.jobportal.config;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

/**
 * Database Connection Manager using standard JDBC.
 * Reads configuration in order of precedence:
 *   1. JVM System Properties (-Ddb.url, -Ddb.user, -Ddb.password)
 *   2. Environment Variables (DB_URL, DB_USER, DB_PASSWORD)
 *   3. db.properties file (in classpath or project root)
 *   4. Fallback defaults
 */
public class DBConnection {

    private static final String DEFAULT_URL = 
            "jdbc:mysql://localhost:3306/job_portal?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8";
    private static final String DEFAULT_USER = "root";
    private static final String DEFAULT_PASSWORD = "";

    private static final Properties props = new Properties();

    static {
        try {
            // Explicitly load MySQL JDBC Driver
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            System.err.println("[DBConnection ERROR] MySQL JDBC Driver not found on classpath!");
        }

        // Attempt loading db.properties from file system or classpath
        try {
            File propFile = new File("db.properties");
            if (!propFile.exists()) {
                propFile = new File("../db.properties");
            }
            if (propFile.exists()) {
                try (InputStream in = new FileInputStream(propFile)) {
                    props.load(in);
                }
            } else {
                try (InputStream in = DBConnection.class.getClassLoader().getResourceAsStream("db.properties")) {
                    if (in != null) {
                        props.load(in);
                    }
                }
            }
        } catch (Exception ignored) {
        }
    }

    private static String getSetting(String sysProp, String envVar, String propKey, String defaultValue) {
        String value = System.getProperty(sysProp);
        if (value != null && !value.trim().isEmpty()) {
            return value.trim();
        }
        value = System.getenv(envVar);
        if (value != null && !value.trim().isEmpty()) {
            return value.trim();
        }
        value = props.getProperty(propKey);
        if (value != null && !value.trim().isEmpty()) {
            return value.trim();
        }
        return defaultValue;
    }

    public static String getUrl() {
        return getSetting("db.url", "DB_URL", "db.url", DEFAULT_URL);
    }

    public static String getUser() {
        return getSetting("db.user", "DB_USER", "db.user", DEFAULT_USER);
    }

    public static String getPassword() {
        return getSetting("db.password", "DB_PASSWORD", "db.password", DEFAULT_PASSWORD);
    }

    public static Connection getConnection() {
        try {
            String url = getUrl();
            String user = getUser();
            String password = getPassword();

            return DriverManager.getConnection(url, user, password);
        } catch (SQLException e) {
            System.err.println("[DBConnection ERROR] Failed to connect to MySQL database!");
            System.err.println("URL: " + getUrl() + " | User: " + getUser());
            System.err.println("Message: " + e.getMessage());
            return null;
        }
    }

    public static boolean testConnection() {
        try (Connection con = getConnection()) {
            return con != null && !con.isClosed();
        } catch (Exception e) {
            return false;
        }
    }
}
