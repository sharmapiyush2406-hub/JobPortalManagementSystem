package com.jobportal.util;

import org.mindrot.jbcrypt.BCrypt;

/**
 * Utility class for hashing passwords and verifying plain passwords
 * against stored BCrypt hashes using standard jBCrypt library.
 */
public class PasswordUtil {

    /**
     * Hashes a plain text password using BCrypt with salt rounds = 10.
     * @param plainPassword the plain text password
     * @return the BCrypt hashed string
     */
    public static String hashPassword(String plainPassword) {
        if (plainPassword == null || plainPassword.isEmpty()) {
            throw new IllegalArgumentException("Password cannot be null or empty");
        }
        return BCrypt.hashpw(plainPassword, BCrypt.gensalt(10));
    }

    /**
     * Verifies a plain text password against a stored BCrypt hash.
     * @param plainPassword candidate password
     * @param hashedPassword stored hash
     * @return true if password matches, false otherwise
     */
    public static boolean checkPassword(String plainPassword, String hashedPassword) {
        if (plainPassword == null || hashedPassword == null || hashedPassword.trim().isEmpty()) {
            return false;
        }
        try {
            return BCrypt.checkpw(plainPassword, hashedPassword);
        } catch (Exception e) {
            System.err.println("[PasswordUtil checkPassword ERROR]: " + e.getMessage());
            return false;
        }
    }
}
