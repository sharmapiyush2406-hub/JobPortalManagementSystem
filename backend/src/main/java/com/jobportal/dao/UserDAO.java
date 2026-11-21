package com.jobportal.dao;

import com.jobportal.config.DBConnection;
import com.jobportal.model.User;
import com.jobportal.util.PasswordUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for User operations (Candidates & Admins).
 * Uses JDBC PreparedStatements to prevent SQL Injection.
 */
public class UserDAO {

    /**
     * Registers a new user. Passwords must already be hashed.
     */
    public boolean registerUser(User user) {
        String sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
        Connection con = DBConnection.getConnection();
        if (con == null) return false;

        try (con;
             PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, user.getName());
            ps.setString(2, user.getEmail().trim().toLowerCase());
            ps.setString(3, user.getPassword());
            ps.setString(4, user.getRole() != null ? user.getRole().toUpperCase() : "CANDIDATE");

            int affected = ps.executeUpdate();
            if (affected > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        user.setUserId(rs.getInt(1));
                    }
                }
                return true;
            }
        } catch (SQLException e) {
            System.err.println("[UserDAO registerUser ERROR]: " + e.getMessage());
        }
        return false;
    }

    private User mapUser(ResultSet rs) throws SQLException {
        return new User(
                rs.getInt("user_id"),
                rs.getString("name"),
                rs.getString("email"),
                rs.getString("password"),
                rs.getString("role"),
                rs.getTimestamp("created_at")
        );
    }

    private User mapUserSafe(ResultSet rs) throws SQLException {
        User u = new User();
        u.setUserId(rs.getInt("user_id"));
        u.setName(rs.getString("name"));
        u.setEmail(rs.getString("email"));
        u.setRole(rs.getString("role"));
        u.setCreatedAt(rs.getTimestamp("created_at"));
        return u;
    }

    /**
     * Finds a user by email address (case-insensitive).
     */
    public User findUserByEmail(String email) {
        if (email == null) return null;
        String sql = "SELECT user_id, name, email, password, role, created_at FROM users WHERE LOWER(email) = LOWER(?)";

        Connection con = DBConnection.getConnection();
        if (con == null) return null;

        try (con;
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, email.trim());
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapUser(rs);
                }
            }
        } catch (SQLException e) {
            System.err.println("[UserDAO findUserByEmail ERROR]: " + e.getMessage());
        }
        return null;
    }

    /**
     * Finds a user by user_id.
     */
    public User findUserById(int userId) {
        String sql = "SELECT user_id, name, email, password, role, created_at FROM users WHERE user_id = ?";

        Connection con = DBConnection.getConnection();
        if (con == null) return null;

        try (con;
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapUser(rs);
                }
            }
        } catch (SQLException e) {
            System.err.println("[UserDAO findUserById ERROR]: " + e.getMessage());
        }
        return null;
    }

    /**
     * Authenticates user credentials using BCrypt verification.
     */
    public User authenticate(String email, String plainPassword) {
        User user = findUserByEmail(email);
        if (user == null) {
            return null;
        }

        if (PasswordUtil.checkPassword(plainPassword, user.getPassword())) {
            return user;
        }
        return null;
    }

    /**
     * Updates candidate profile information (name and email).
     */
    public boolean updateProfile(int userId, String name, String email) {
        String sql = "UPDATE users SET name = ?, email = ? WHERE user_id = ?";

        Connection con = DBConnection.getConnection();
        if (con == null) return false;

        try (con;
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, name);
            ps.setString(2, email.trim().toLowerCase());
            ps.setInt(3, userId);

            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[UserDAO updateProfile ERROR]: " + e.getMessage());
        }
        return false;
    }

    /**
     * Changes user password.
     */
    public boolean changePassword(int userId, String newHashedPassword) {
        String sql = "UPDATE users SET password = ? WHERE user_id = ?";

        Connection con = DBConnection.getConnection();
        if (con == null) return false;

        try (con;
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, newHashedPassword);
            ps.setInt(2, userId);

            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[UserDAO changePassword ERROR]: " + e.getMessage());
        }
        return false;
    }

    /**
     * Returns list of all registered candidates (role = 'CANDIDATE').
     * Excludes passwords for security.
     */
    public List<User> getAllCandidates() {
        return searchCandidates(null);
    }

    /**
     * Searches candidates by name or email.
     */
    public List<User> searchCandidates(String query) {
        List<User> list = new ArrayList<>();
        boolean hasFilter = query != null && !query.trim().isEmpty();
        String sql = "SELECT user_id, name, email, role, created_at FROM users WHERE role = 'CANDIDATE'"
                + (hasFilter ? " AND (name LIKE ? OR email LIKE ?)" : "")
                + " ORDER BY created_at DESC";

        Connection con = DBConnection.getConnection();
        if (con == null) return list;

        try (con;
             PreparedStatement ps = con.prepareStatement(sql)) {

            if (hasFilter) {
                String term = "%" + query.trim() + "%";
                ps.setString(1, term);
                ps.setString(2, term);
            }

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapUserSafe(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[UserDAO searchCandidates ERROR]: " + e.getMessage());
        }
        return list;
    }

    /**
     * Count total registered candidates.
     */
    public int getCandidateCount() {
        String sql = "SELECT COUNT(*) FROM users WHERE role = 'CANDIDATE'";
        Connection con = DBConnection.getConnection();
        if (con == null) return 0;

        try (con;
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            if (rs.next()) {
                return rs.getInt(1);
            }
        } catch (SQLException e) {
            System.err.println("[UserDAO getCandidateCount ERROR]: " + e.getMessage());
        }
        return 0;
    }
}
