
package jobportal;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class JobDAO {

    // 1. Add a new job
    public void addJob(Job job) {

        String sql = "INSERT INTO jobs " +
            "(title, company, location, salary, description) " +
            "VALUES (?, ?, ?, ?, ?)";

        try (Connection con = DBConnection.getConnection()) {

            if (con == null) return;

            PreparedStatement ps = con.prepareStatement(sql);

            ps.setString(1, job.getTitle());
            ps.setString(2, job.getCompany());
            ps.setString(3, job.getLocation());
            ps.setString(4, job.getSalary());
            ps.setString(5, job.getDescription());

            ps.executeUpdate();

            System.out.println("Job Added Successfully!");

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    // 2. View all jobs
    public List<Job> getAllJobs() {

        List<Job> jobs = new ArrayList<>();

        String sql = "SELECT * FROM jobs";

        try (Connection con = DBConnection.getConnection()) {

            if (con == null) return jobs;

            Statement st = con.createStatement();

            ResultSet rs = st.executeQuery(sql);

            while (rs.next()) {

                Job job = new Job(
                    rs.getInt("job_id"),
                    rs.getString("title"),
                    rs.getString("company"),
                    rs.getString("location"),
                    rs.getString("salary"),
                    rs.getString("description")
                );

                jobs.add(job);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return jobs;
    }

    // 3. Search jobs by title
    public List<Job> searchJobs(String keyword) {

        List<Job> jobs = new ArrayList<>();

        String sql = "SELECT * FROM jobs WHERE title LIKE ?";

        try (Connection con = DBConnection.getConnection()) {

            if (con == null) return jobs;

            PreparedStatement ps = con.prepareStatement(sql);

            ps.setString(1, "%" + keyword + "%");

            ResultSet rs = ps.executeQuery();

            while (rs.next()) {

                Job job = new Job(
                    rs.getInt("job_id"),
                    rs.getString("title"),
                    rs.getString("company"),
                    rs.getString("location"),
                    rs.getString("salary"),
                    rs.getString("description")
                );

                jobs.add(job);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return jobs;
    }

    // 4. Delete a job
    public void deleteJob(int jobId) {

        String sql = "DELETE FROM jobs WHERE job_id = ?";

        try (Connection con = DBConnection.getConnection()) {

            if (con == null) return;

            PreparedStatement ps = con.prepareStatement(sql);

            ps.setInt(1, jobId);

            int rows = ps.executeUpdate();

            if (rows > 0) {
                System.out.println("Job Deleted Successfully!");
            } else {
                System.out.println("Job ID Not Found!");
            }

        } catch (SQLException e) {
            System.out.println(
                "Cannot delete job. It may have existing applications."
            );
        }
    }
}
