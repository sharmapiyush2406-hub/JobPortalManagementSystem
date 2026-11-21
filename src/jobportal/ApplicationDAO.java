package jobportal;

import java.sql.*;

public class ApplicationDAO {

    // Apply for a job
    public void applyForJob(int jobId, String name, String email) {
        String checkJobSql = "SELECT job_id FROM jobs WHERE job_id = ?";
        String findUserSql = "SELECT user_id FROM users WHERE LOWER(email) = LOWER(?)";
        String createUserSql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, '$2a$10$x6y4Q0YJkKev2JjXbW1R6Of4lcvuG7n41a3tA0yWvK9Z9aW91a03m', 'CANDIDATE')";
        String insertAppSql = "INSERT INTO applications (user_id, job_id, status) VALUES (?, ?, 'Applied')";

        try (Connection con = DBConnection.getConnection()) {
            if (con == null) return;

            // 1. Check whether job exists
            try (PreparedStatement check = con.prepareStatement(checkJobSql)) {
                check.setInt(1, jobId);
                ResultSet rs = check.executeQuery();
                if (!rs.next()) {
                    System.out.println("Job does not exist!");
                    return;
                }
            }

            // 2. Find or register user
            int userId = -1;
            try (PreparedStatement psUser = con.prepareStatement(findUserSql)) {
                psUser.setString(1, email);
                ResultSet rs = psUser.executeQuery();
                if (rs.next()) {
                    userId = rs.getInt("user_id");
                }
            }

            if (userId == -1) {
                try (PreparedStatement psCreate = con.prepareStatement(createUserSql, Statement.RETURN_GENERATED_KEYS)) {
                    psCreate.setString(1, name);
                    psCreate.setString(2, email);
                    psCreate.executeUpdate();
                    ResultSet rs = psCreate.getGeneratedKeys();
                    if (rs.next()) {
                        userId = rs.getInt(1);
                    }
                }
            }

            // 3. Save candidate application
            try (PreparedStatement psApp = con.prepareStatement(insertAppSql)) {
                psApp.setInt(1, userId);
                psApp.setInt(2, jobId);
                psApp.executeUpdate();
                System.out.println("Application Submitted Successfully!");
            }

        } catch (SQLException e) {
            if (e.getErrorCode() == 1062) {
                System.out.println("You have already applied for this position!");
            } else {
                System.out.println("Error submitting application: " + e.getMessage());
            }
        }
    }

    // Admin can view all applications
    public void viewApplications() {
        String sql = "SELECT a.application_id, u.name AS candidate_name, u.email, j.title, j.company, a.application_date, a.status " +
                     "FROM applications a " +
                     "JOIN users u ON a.user_id = u.user_id " +
                     "JOIN jobs j ON a.job_id = j.job_id " +
                     "ORDER BY a.application_date DESC";

        try (Connection con = DBConnection.getConnection()) {
            if (con == null) return;

            Statement st = con.createStatement();
            ResultSet rs = st.executeQuery(sql);

            System.out.println("\n===== ALL APPLICATIONS =====");

            while (rs.next()) {
                System.out.println("----------------------------");
                System.out.println("Application ID : " + rs.getInt("application_id"));
                System.out.println("Candidate Name : " + rs.getString("candidate_name"));
                System.out.println("Candidate Email: " + rs.getString("email"));
                System.out.println("Job Title      : " + rs.getString("title"));
                System.out.println("Company        : " + rs.getString("company"));
                System.out.println("Applied Date   : " + rs.getTimestamp("application_date"));
                System.out.println("Status         : " + rs.getString("status"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
