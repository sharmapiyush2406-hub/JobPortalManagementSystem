package com.jobportal.servlet;

import com.google.gson.JsonObject;
import com.jobportal.dao.ApplicationDAO;
import com.jobportal.dao.JobDAO;
import com.jobportal.model.Application;
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
 * Application Servlet
 * Handles job applications, status updates, and candidate/admin views.
 * Endpoints:
 *   POST /api/applications
 *   GET  /api/applications/my
 *   GET  /api/applications (Admin)
 *   PUT  /api/applications/{id}/status (Admin)
 */
@WebServlet(name = "ApplicationServlet", urlPatterns = {"/api/applications/*"})
public class ApplicationServlet extends HttpServlet {

    private final ApplicationDAO applicationDAO = new ApplicationDAO();
    private final JobDAO jobDAO = new JobDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession(false);
        User user = (session != null) ? (User) session.getAttribute("currentUser") : null;

        if (user == null) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Please log in to view applications.");
            return;
        }

        String pathInfo = req.getPathInfo();
        if (pathInfo == null) pathInfo = "";

        // 1. GET /api/applications/my (Candidate's own applications)
        if ("/my".equalsIgnoreCase(pathInfo)) {
            List<Application> myApps = applicationDAO.getCandidateApplications(user.getUserId());
            JsonUtil.sendJsonResponse(resp, HttpServletResponse.SC_OK, myApps);
            return;
        }

        // 2. GET /api/applications (Admin view)
        if (pathInfo.isEmpty() || pathInfo.equals("/")) {
            if (!user.isAdmin()) {
                JsonUtil.sendError(resp, HttpServletResponse.SC_FORBIDDEN, "Access denied. Admin role required.");
                return;
            }

            List<Application> allApps = applicationDAO.getAllApplications();
            JsonUtil.sendJsonResponse(resp, HttpServletResponse.SC_OK, allApps);
            return;
        }

        JsonUtil.sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Resource not found.");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession(false);
        User user = (session != null) ? (User) session.getAttribute("currentUser") : null;

        if (user == null) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Please log in as a candidate to apply.");
            return;
        }

        if (user.isAdmin()) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Administrators cannot apply for jobs. Please use a candidate account.");
            return;
        }

        JsonObject json = JsonUtil.parseRequestBody(req);
        if (!json.has("jobId")) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Job ID is required to apply.");
            return;
        }

        int jobId = json.get("jobId").getAsInt();

        // Check if job exists
        Job job = jobDAO.getJobById(jobId);
        if (job == null) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_NOT_FOUND, "The job you are applying for does not exist.");
            return;
        }

        // Check duplicate application
        if (applicationDAO.hasCandidateApplied(user.getUserId(), jobId)) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_CONFLICT, "You have already applied for this position (" + job.getTitle() + " at " + job.getCompany() + ").");
            return;
        }

        boolean applied = applicationDAO.applyForJob(user.getUserId(), jobId);
        if (applied) {
            JsonObject res = new JsonObject();
            res.addProperty("success", true);
            res.addProperty("message", "Application submitted successfully for " + job.getTitle() + "!");
            JsonUtil.sendJsonResponse(resp, HttpServletResponse.SC_CREATED, res);
        } else {
            JsonUtil.sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to submit application. Please try again.");
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession(false);
        User user = (session != null) ? (User) session.getAttribute("currentUser") : null;

        if (user == null || !user.isAdmin()) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_FORBIDDEN, "Access denied: Administrator privilege required.");
            return;
        }

        String pathInfo = req.getPathInfo();
        if (pathInfo == null || !pathInfo.endsWith("/status")) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid endpoint. Use PUT /api/applications/{id}/status");
            return;
        }

        // Path is /{id}/status
        String[] parts = pathInfo.split("/");
        if (parts.length < 3) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Application ID missing.");
            return;
        }

        int appId;
        try {
            appId = Integer.parseInt(parts[1]);
        } catch (NumberFormatException e) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid Application ID.");
            return;
        }

        JsonObject json = JsonUtil.parseRequestBody(req);
        if (!json.has("status")) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "New status is required.");
            return;
        }

        String newStatus = json.get("status").getAsString().trim();
        if (!newStatus.equalsIgnoreCase("Applied") &&
            !newStatus.equalsIgnoreCase("Shortlisted") &&
            !newStatus.equalsIgnoreCase("Rejected")) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Status must be 'Applied', 'Shortlisted', or 'Rejected'.");
            return;
        }

        boolean updated = applicationDAO.updateApplicationStatus(appId, newStatus);
        if (updated) {
            JsonObject res = new JsonObject();
            res.addProperty("success", true);
            res.addProperty("message", "Application status updated to '" + newStatus + "'.");
            res.addProperty("applicationId", appId);
            res.addProperty("status", newStatus);
            JsonUtil.sendJsonResponse(resp, HttpServletResponse.SC_OK, res);
        } else {
            JsonUtil.sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Application ID " + appId + " not found.");
        }
    }
}
