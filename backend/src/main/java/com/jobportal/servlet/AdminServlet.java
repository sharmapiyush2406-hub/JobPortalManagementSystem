package com.jobportal.servlet;

import com.jobportal.dao.ApplicationDAO;
import com.jobportal.dao.UserDAO;
import com.jobportal.model.Application;
import com.jobportal.model.DashboardStats;
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
import java.util.stream.Collectors;

/**
 * Admin Servlet
 * Handles Administrator analytics, candidate management, and application overview.
 * Endpoints:
 *   GET /api/admin/dashboard
 *   GET /api/admin/candidates
 *   GET /api/admin/applications
 */
@WebServlet(name = "AdminServlet", urlPatterns = {"/api/admin/*"})
public class AdminServlet extends HttpServlet {

    private final UserDAO userDAO = new UserDAO();
    private final ApplicationDAO applicationDAO = new ApplicationDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession(false);
        User user = (session != null) ? (User) session.getAttribute("currentUser") : null;

        if (user == null || !user.isAdmin()) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_FORBIDDEN, "Access denied: Administrator privilege required.");
            return;
        }

        String pathInfo = req.getPathInfo();
        if (pathInfo == null) pathInfo = "";

        // 1. GET /api/admin/dashboard
        if ("/dashboard".equalsIgnoreCase(pathInfo)) {
            DashboardStats stats = applicationDAO.getAdminDashboardStats();
            JsonUtil.sendJsonResponse(resp, HttpServletResponse.SC_OK, stats);
            return;
        }

        // 2. GET /api/admin/candidates
        if ("/candidates".equalsIgnoreCase(pathInfo)) {
            String query = req.getParameter("search");
            List<User> candidates;
            if (query != null && !query.trim().isEmpty()) {
                candidates = userDAO.searchCandidates(query);
            } else {
                candidates = userDAO.getAllCandidates();
            }
            JsonUtil.sendJsonResponse(resp, HttpServletResponse.SC_OK, candidates);
            return;
        }

        // 3. GET /api/admin/applications
        if ("/applications".equalsIgnoreCase(pathInfo)) {
            String status = req.getParameter("status");
            List<Application> apps = applicationDAO.getAllApplications();

            if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("All")) {
                apps = apps.stream()
                        .filter(a -> status.equalsIgnoreCase(a.getStatus()))
                        .collect(Collectors.toList());
            }

            JsonUtil.sendJsonResponse(resp, HttpServletResponse.SC_OK, apps);
            return;
        }

        JsonUtil.sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Unknown admin endpoint: " + pathInfo);
    }
}
