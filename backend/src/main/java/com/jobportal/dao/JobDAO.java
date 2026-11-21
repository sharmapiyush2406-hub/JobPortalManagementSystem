package com.jobportal.dao;

import com.jobportal.config.DBConnection;
import com.jobportal.model.Job;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for Job operations.
 * Handles CRUD for jobs and flexible search/filter queries.
 */
public class JobDAO {

    /**
     * Maps ResultSet row to Job model.
     */
    private Job mapRowToJob(ResultSet rs) throws SQLException {
        return new Job(
                rs.getInt("job_id"),
                rs.getString("title"),
                rs.getString("company"),
                rs.getString("location"),
                rs.getString("salary"),
                rs.getString("job_type"),
                rs.getString("description"),
                rs.getString("requirements"),
                rs.getTimestamp("created_at")
        );
    }

    /**
     * Adds a new job posting.
     */
    public boolean addJob(Job job) {
        String sql = "INSERT INTO jobs (title, company, location, salary, job_type, description, requirements) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?)";

        Connection con = DBConnection.getConnection();
        if (con == null) return false;

        try (con;
             PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, job.getTitle());
            ps.setString(2, job.getCompany());
            ps.setString(3, job.getLocation());
            ps.setString(4, job.getSalary());
            ps.setString(5, job.getJobType());
            ps.setString(6, job.getDescription());
            ps.setString(7, job.getRequirements());

            int rows = ps.executeUpdate();
            if (rows > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        job.setJobId(rs.getInt(1));
                    }
                }
                return true;
            }
        } catch (SQLException e) {
            System.err.println("[JobDAO addJob ERROR]: " + e.getMessage());
        }
        return false;
    }

    /**
     * Retrieves all jobs ordered by most recent first.
     */
    public List<Job> getAllJobs() {
        return searchJobs(null, null, null);
    }

    /**
     * Retrieves a single job by its ID.
     */
    public Job getJobById(int jobId) {
        String sql = "SELECT * FROM jobs WHERE job_id = ?";

        Connection con = DBConnection.getConnection();
        if (con == null) return null;

        try (con;
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, jobId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRowToJob(rs);
                }
            }
        } catch (SQLException e) {
            System.err.println("[JobDAO getJobById ERROR]: " + e.getMessage());
        }
        return null;
    }

    /**
     * Updates an existing job record.
     */
    public boolean updateJob(Job job) {
        String sql = "UPDATE jobs SET title = ?, company = ?, location = ?, salary = ?, job_type = ?, " +
                     "description = ?, requirements = ? WHERE job_id = ?";

        Connection con = DBConnection.getConnection();
        if (con == null) return false;

        try (con;
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, job.getTitle());
            ps.setString(2, job.getCompany());
            ps.setString(3, job.getLocation());
            ps.setString(4, job.getSalary());
            ps.setString(5, job.getJobType());
            ps.setString(6, job.getDescription());
            ps.setString(7, job.getRequirements());
            ps.setInt(8, job.getJobId());

            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[JobDAO updateJob ERROR]: " + e.getMessage());
        }
        return false;
    }

    /**
     * Deletes a job record. Foreign keys to applications will cascade.
     */
    public boolean deleteJob(int jobId) {
        String sql = "DELETE FROM jobs WHERE job_id = ?";

        Connection con = DBConnection.getConnection();
        if (con == null) return false;

        try (con;
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, jobId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[JobDAO deleteJob ERROR]: " + e.getMessage());
        }
        return false;
    }

    /**
     * Flexible search & filter for jobs (title, company, location, job type).
     */
    public List<Job> searchJobs(String titleKeyword, String locationKeyword, String jobType) {
        List<Job> jobs = new ArrayList<>();
        StringBuilder sql = new StringBuilder("SELECT * FROM jobs WHERE 1=1 ");
        List<Object> params = new ArrayList<>();

        if (titleKeyword != null && !titleKeyword.trim().isEmpty()) {
            sql.append("AND (title LIKE ? OR company LIKE ? OR description LIKE ?) ");
            String term = "%" + titleKeyword.trim() + "%";
            params.add(term);
            params.add(term);
            params.add(term);
        }

        if (locationKeyword != null && !locationKeyword.trim().isEmpty()) {
            sql.append("AND location LIKE ? ");
            params.add("%" + locationKeyword.trim() + "%");
        }

        if (jobType != null && !jobType.trim().isEmpty() && !jobType.equalsIgnoreCase("All")) {
            sql.append("AND job_type = ? ");
            params.add(jobType.trim());
        }

        sql.append("ORDER BY created_at DESC");

        Connection con = DBConnection.getConnection();
        if (con == null) return jobs;

        try (con;
             PreparedStatement ps = con.prepareStatement(sql.toString())) {

            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    jobs.add(mapRowToJob(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[JobDAO searchJobs ERROR]: " + e.getMessage());
        }
        return jobs;
    }

    /**
     * Returns total number of jobs.
     */
    public int getJobCount() {
        String sql = "SELECT COUNT(*) FROM jobs";
        Connection con = DBConnection.getConnection();
        if (con == null) return 0;

        try (con;
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            if (rs.next()) {
                return rs.getInt(1);
            }
        } catch (SQLException e) {
            System.err.println("[JobDAO getJobCount ERROR]: " + e.getMessage());
        }
        return 0;
    }
}
