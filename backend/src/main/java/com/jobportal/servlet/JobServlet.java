package com.jobportal.servlet;

import com.google.gson.JsonObject;
import com.jobportal.dao.JobDAO;
import com.jobportal.model.Job;
import com.jobportal.model.User;
import com.jobportal.util.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.List;

/**
 * Job Servlet
 * Handles Job browsing, filtering, search, and Admin CRUD operations.
 * Endpoints:
 *   GET    /api/jobs
 *   GET    /api/jobs/{id}
 *   GET    /api/jobs/search
 *   POST   /api/jobs (Admin only)
 *   PUT    /api/jobs/{id} (Admin only)
 *   DELETE /api/jobs/{id} (Admin only)
 */
@WebServlet(name = "JobServlet", urlPatterns = {"/api/jobs/*"})
public class JobServlet extends HttpServlet {

    private final JobDAO jobDAO = new JobDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();

        // 1. GET /api/jobs or /api/jobs/search
        if (pathInfo == null || pathInfo.equals("/") || pathInfo.equalsIgnoreCase("/search")) {
            String title = req.getParameter("title");
            if (title == null) title = req.getParameter("search");
            String location = req.getParameter("location");
            String jobType = req.getParameter("jobType");

            List<Job> jobs;
            if ((title != null && !title.trim().isEmpty()) ||
                (location != null && !location.trim().isEmpty()) ||
                (jobType != null && !jobType.trim().isEmpty())) {
                jobs = jobDAO.searchJobs(title, location, jobType);
            } else {
                jobs = jobDAO.getAllJobs();
            }

            JsonUtil.sendJsonResponse(resp, HttpServletResponse.SC_OK, jobs);
            return;
        }

        // 2. GET /api/jobs/{id}
        String idStr = pathInfo.substring(1);
        try {
            int jobId = Integer.parseInt(idStr);
            Job job = jobDAO.getJobById(jobId);
            if (job != null) {
                JsonUtil.sendJsonResponse(resp, HttpServletResponse.SC_OK, job);
            } else {
                JsonUtil.sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Job with ID " + jobId + " not found.");
            }
        } catch (NumberFormatException e) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid job ID format: " + idStr);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // Enforce Admin authorization
        if (!verifyAdmin(req, resp)) return;

        JsonObject json = JsonUtil.parseRequestBody(req);

        String title = json.has("title") ? json.get("title").getAsString().trim() : "";
        String company = json.has("company") ? json.get("company").getAsString().trim() : "";
        String location = json.has("location") ? json.get("location").getAsString().trim() : "";
        String salary = json.has("salary") ? json.get("salary").getAsString().trim() : "";
        String jobType = json.has("jobType") ? json.get("jobType").getAsString().trim() : "Full Time";
        String description = json.has("description") ? json.get("description").getAsString().trim() : "";
        String requirements = json.has("requirements") ? json.get("requirements").getAsString().trim() : "";

        if (title.isEmpty() || company.isEmpty() || location.isEmpty() || description.isEmpty()) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Title, Company, Location, and Description are required.");
            return;
        }

        Job job = new Job();
        job.setTitle(title);
        job.setCompany(company);
        job.setLocation(location);
        job.setSalary(salary.isEmpty() ? "Not Specified" : salary);
        job.setJobType(jobType);
        job.setDescription(description);
        job.setRequirements(requirements.isEmpty() ? "See job description for details." : requirements);

        boolean success = jobDAO.addJob(job);
        if (success) {
            JsonObject res = new JsonObject();
            res.addProperty("success", true);
            res.addProperty("message", "Job posted successfully!");
            res.add("job", JsonUtil.getGson().toJsonTree(job));
            JsonUtil.sendJsonResponse(resp, HttpServletResponse.SC_CREATED, res);
        } else {
            JsonUtil.sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to save job in database.");
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // Enforce Admin authorization
        if (!verifyAdmin(req, resp)) return;

        String pathInfo = req.getPathInfo();
        if (pathInfo == null || pathInfo.equals("/")) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Job ID missing from URL path.");
            return;
        }

        int jobId;
        try {
            jobId = Integer.parseInt(pathInfo.substring(1));
        } catch (NumberFormatException e) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid Job ID format.");
            return;
        }

        Job existing = jobDAO.getJobById(jobId);
        if (existing == null) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Job not found with ID " + jobId);
            return;
        }

        JsonObject json = JsonUtil.parseRequestBody(req);

        if (json.has("title")) existing.setTitle(json.get("title").getAsString().trim());
        if (json.has("company")) existing.setCompany(json.get("company").getAsString().trim());
        if (json.has("location")) existing.setLocation(json.get("location").getAsString().trim());
        if (json.has("salary")) existing.setSalary(json.get("salary").getAsString().trim());
        if (json.has("jobType")) existing.setJobType(json.get("jobType").getAsString().trim());
        if (json.has("description")) existing.setDescription(json.get("description").getAsString().trim());
        if (json.has("requirements")) existing.setRequirements(json.get("requirements").getAsString().trim());

        boolean success = jobDAO.updateJob(existing);
        if (success) {
            JsonObject res = new JsonObject();
            res.addProperty("success", true);
            res.addProperty("message", "Job updated successfully!");
            res.add("job", JsonUtil.getGson().toJsonTree(existing));
            JsonUtil.sendJsonResponse(resp, HttpServletResponse.SC_OK, res);
        } else {
            JsonUtil.sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to update job.");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // Enforce Admin authorization
        if (!verifyAdmin(req, resp)) return;

        String pathInfo = req.getPathInfo();
        if (pathInfo == null || pathInfo.equals("/")) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Job ID missing from URL path.");
            return;
        }

        int jobId;
        try {
            jobId = Integer.parseInt(pathInfo.substring(1));
        } catch (NumberFormatException e) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid Job ID format.");
            return;
        }

        boolean success = jobDAO.deleteJob(jobId);
        if (success) {
            JsonUtil.sendSuccess(resp, HttpServletResponse.SC_OK, "Job ID " + jobId + " and its applications were deleted successfully.");
        } else {
            JsonUtil.sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Job with ID " + jobId + " not found or could not be deleted.");
        }
    }

    /**
     * Helper to verify admin permissions for protected mutating routes.
     */
    private boolean verifyAdmin(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        HttpSession session = req.getSession(false);
        User user = (session != null) ? (User) session.getAttribute("currentUser") : null;

        if (user == null) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Login required.");
            return false;
        }
        if (!user.isAdmin()) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_FORBIDDEN, "Administrator access required.");
            return false;
        }
        return true;
    }
}
