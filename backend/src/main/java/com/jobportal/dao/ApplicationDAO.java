package com.jobportal.dao;

import com.jobportal.config.DBConnection;
import com.jobportal.model.Application;
import com.jobportal.model.DashboardStats;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for Applications.
 * Manages job applications, duplicate checks, status workflows and dashboard analytics.
 */
public class ApplicationDAO {

    /**
     * Helper to map joined ResultSet row to Application model.
     */
    private Application mapJoinedRow(ResultSet rs) throws SQLException {
        Application app = new Application();
        app.setApplicationId(rs.getInt("application_id"));
        app.setUserId(rs.getInt("user_id"));
        app.setJobId(rs.getInt("job_id"));
        app.setApplicationDate(rs.getTimestamp("application_date"));
        app.setStatus(rs.getString("status"));

        app.setCandidateName(rs.getString("candidate_name"));
        app.setCandidateEmail(rs.getString("candidate_email"));
        app.setJobTitle(rs.getString("job_title"));
        app.setCompany(rs.getString("company"));
        app.setLocation(rs.getString("location"));
        app.setSalary(rs.getString("salary"));
        app.setJobType(rs.getString("job_type"));
        return app;
    }

    /**
     * Checks if a candidate has already applied for a specific job.
     */
    public boolean hasCandidateApplied(int userId, int jobId) {
        String sql = "SELECT application_id FROM applications WHERE user_id = ? AND job_id = ?";
        Connection con = DBConnection.getConnection();
        if (con == null) return false;

        try (con;
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, userId);
            ps.setInt(2, jobId);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        } catch (SQLException e) {
            System.err.println("[ApplicationDAO hasCandidateApplied ERROR]: " + e.getMessage());
        }
        return false;
    }

    /**
     * Submits an application for a candidate.
     */
    public boolean applyForJob(int userId, int jobId) {
        // Prevent duplicate application
        if (hasCandidateApplied(userId, jobId)) {
            return false;
        }

        String sql = "INSERT INTO applications (user_id, job_id, status) VALUES (?, ?, 'Applied')";
        Connection con = DBConnection.getConnection();
        if (con == null) return false;

        try (con;
             PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setInt(1, userId);
            ps.setInt(2, jobId);

            int rows = ps.executeUpdate();
            return rows > 0;
        } catch (SQLException e) {
            System.err.println("[ApplicationDAO applyForJob ERROR]: " + e.getMessage());
        }
        return false;
    }

    /**
     * Internal helper to retrieve applications with candidate and job details.
     * When userId is provided, filters for that candidate; otherwise returns all.
     */
    private List<Application> fetchApplications(Integer userId) {
        List<Application> list = new ArrayList<>();
        StringBuilder sql = new StringBuilder(
                "SELECT a.application_id, a.user_id, a.job_id, a.application_date, a.status, " +
                "u.name AS candidate_name, u.email AS candidate_email, " +
                "j.title AS job_title, j.company, j.location, j.salary, j.job_type " +
                "FROM applications a " +
                "JOIN users u ON a.user_id = u.user_id " +
                "JOIN jobs j ON a.job_id = j.job_id "
        );

        if (userId != null) {
            sql.append("WHERE a.user_id = ? ");
        }
        sql.append("ORDER BY a.application_date DESC");

        Connection con = DBConnection.getConnection();
        if (con == null) return list;

        try (con;
             PreparedStatement ps = con.prepareStatement(sql.toString())) {

            if (userId != null) {
                ps.setInt(1, userId);
            }

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapJoinedRow(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[ApplicationDAO fetchApplications ERROR]: " + e.getMessage());
        }
        return list;
    }

    /**
     * Retrieves all applications submitted by a specific candidate.
     */
    public List<Application> getCandidateApplications(int userId) {
        return fetchApplications(userId);
    }

    /**
     * Admin view: Retrieves all applications across all candidates and jobs.
     */
    public List<Application> getAllApplications() {
        return fetchApplications(null);
    }

    /**
     * Updates status of an application ('Applied', 'Shortlisted', 'Rejected').
     */
    public boolean updateApplicationStatus(int applicationId, String newStatus) {
        String sql = "UPDATE applications SET status = ? WHERE application_id = ?";
        Connection con = DBConnection.getConnection();
        if (con == null) return false;

        try (con;
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, newStatus);
            ps.setInt(2, applicationId);

            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[ApplicationDAO updateApplicationStatus ERROR]: " + e.getMessage());
        }
        return false;
    }

    /**
     * Computes statistics for Admin dashboard.
     */
    public DashboardStats getAdminDashboardStats() {
        DashboardStats stats = new DashboardStats();
        Connection con = DBConnection.getConnection();
        if (con == null) return stats;

        try (con) {
            // Jobs count
            try (PreparedStatement ps = con.prepareStatement("SELECT COUNT(*) FROM jobs");
                 ResultSet rs = ps.executeQuery()) {
                if (rs.next()) stats.setTotalJobs(rs.getInt(1));
            }

            // Candidates count
            try (PreparedStatement ps = con.prepareStatement("SELECT COUNT(*) FROM users WHERE role = 'CANDIDATE'");
                 ResultSet rs = ps.executeQuery()) {
                if (rs.next()) stats.setTotalCandidates(rs.getInt(1));
            }

            // Total Applications
            try (PreparedStatement ps = con.prepareStatement("SELECT COUNT(*) FROM applications");
                 ResultSet rs = ps.executeQuery()) {
                if (rs.next()) stats.setTotalApplications(rs.getInt(1));
            }

            // Status breakdowns
            try (PreparedStatement ps = con.prepareStatement("SELECT status, COUNT(*) FROM applications GROUP BY status");
                 ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    String st = rs.getString(1);
                    int count = rs.getInt(2);
                    if ("Applied".equalsIgnoreCase(st)) {
                        stats.setPendingApplications(count);
                    } else if ("Shortlisted".equalsIgnoreCase(st)) {
                        stats.setShortlistedApplications(count);
                    } else if ("Rejected".equalsIgnoreCase(st)) {
                        stats.setRejectedApplications(count);
                    }
                }
            }
        } catch (SQLException e) {
            System.err.println("[ApplicationDAO getAdminDashboardStats ERROR]: " + e.getMessage());
        }

        return stats;
    }

    /**
     * Computes statistics for a specific Candidate's dashboard.
     */
    public DashboardStats getCandidateDashboardStats(int userId) {
        DashboardStats stats = new DashboardStats();
        Connection con = DBConnection.getConnection();
        if (con == null) return stats;

        try (con) {
            // Total available jobs in portal
            try (PreparedStatement ps = con.prepareStatement("SELECT COUNT(*) FROM jobs");
                 ResultSet rs = ps.executeQuery()) {
                if (rs.next()) stats.setTotalJobs(rs.getInt(1));
            }

            // Candidate's application counts
            String sql = "SELECT status, COUNT(*) FROM applications WHERE user_id = ? GROUP BY status";
            try (PreparedStatement ps = con.prepareStatement(sql)) {
                ps.setInt(1, userId);
                try (ResultSet rs = ps.executeQuery()) {
                    int total = 0;
                    while (rs.next()) {
                        String st = rs.getString(1);
                        int count = rs.getInt(2);
                        total += count;
                        if ("Applied".equalsIgnoreCase(st)) {
                            stats.setCandidatePendingCount(count);
                        } else if ("Shortlisted".equalsIgnoreCase(st)) {
                            stats.setCandidateShortlistedCount(count);
                        } else if ("Rejected".equalsIgnoreCase(st)) {
                            stats.setCandidateRejectedCount(count);
                        }
                    }
                    stats.setCandidateTotalApplications(total);
                }
            }

            // Recent applications for this candidate
            stats.setRecentApplications(getCandidateApplications(userId));

        } catch (SQLException e) {
            System.err.println("[ApplicationDAO getCandidateDashboardStats ERROR]: " + e.getMessage());
        }

        return stats;
    }
}
