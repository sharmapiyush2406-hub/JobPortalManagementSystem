package com.jobportal.servlet;

import com.google.gson.JsonObject;
import com.jobportal.dao.ApplicationDAO;
import com.jobportal.dao.UserDAO;
import com.jobportal.model.DashboardStats;
import com.jobportal.model.User;
import com.jobportal.util.JsonUtil;
import com.jobportal.util.PasswordUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

/**
 * Candidate Servlet
 * Handles Candidate Profile and Dashboard Analytics.
 * Endpoints:
 *   GET /api/candidate/profile
 *   PUT /api/candidate/profile
 *   GET /api/candidate/dashboard
 */
@WebServlet(name = "CandidateServlet", urlPatterns = {"/api/candidate/*"})
public class CandidateServlet extends HttpServlet {

    private final UserDAO userDAO = new UserDAO();
    private final ApplicationDAO applicationDAO = new ApplicationDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession(false);
        User sessionUser = (session != null) ? (User) session.getAttribute("currentUser") : null;

        if (sessionUser == null) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Please log in.");
            return;
        }

        String pathInfo = req.getPathInfo();
        if (pathInfo == null) pathInfo = "";

        if ("/profile".equalsIgnoreCase(pathInfo)) {
            User user = userDAO.findUserById(sessionUser.getUserId());
            if (user != null) {
                JsonUtil.sendJsonResponse(resp, HttpServletResponse.SC_OK, user);
            } else {
                JsonUtil.sendError(resp, HttpServletResponse.SC_NOT_FOUND, "User profile not found.");
            }
            return;
        }

        if ("/dashboard".equalsIgnoreCase(pathInfo)) {
            DashboardStats stats = applicationDAO.getCandidateDashboardStats(sessionUser.getUserId());
            JsonUtil.sendJsonResponse(resp, HttpServletResponse.SC_OK, stats);
            return;
        }

        JsonUtil.sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Unknown candidate endpoint.");
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession(false);
        User sessionUser = (session != null) ? (User) session.getAttribute("currentUser") : null;

        if (sessionUser == null) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Please log in.");
            return;
        }

        String pathInfo = req.getPathInfo();
        if (pathInfo == null) pathInfo = "";

        if ("/profile".equalsIgnoreCase(pathInfo)) {
            JsonObject json = JsonUtil.parseRequestBody(req);

            String name = json.has("name") ? json.get("name").getAsString().trim() : "";
            String email = json.has("email") ? json.get("email").getAsString().trim().toLowerCase() : "";
            String newPassword = json.has("newPassword") ? json.get("newPassword").getAsString() : "";
            String currentPassword = json.has("currentPassword") ? json.get("currentPassword").getAsString() : "";

            if (name.isEmpty() || email.isEmpty()) {
                JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Name and Email cannot be empty.");
                return;
            }

            // Check if email changed and if duplicate
            User existing = userDAO.findUserByEmail(email);
            if (existing != null && existing.getUserId() != sessionUser.getUserId()) {
                JsonUtil.sendError(resp, HttpServletResponse.SC_CONFLICT, "This email is already taken by another user.");
                return;
            }

            // If changing password, verify current password
            if (newPassword != null && !newPassword.trim().isEmpty()) {
                if (newPassword.length() < 6) {
                    JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "New password must be at least 6 characters.");
                    return;
                }

                User freshUser = userDAO.findUserById(sessionUser.getUserId());
                if (currentPassword == null || !PasswordUtil.checkPassword(currentPassword, freshUser.getPassword())) {
                    JsonUtil.sendError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Current password verification failed.");
                    return;
                }

                String hashed = PasswordUtil.hashPassword(newPassword);
                userDAO.changePassword(sessionUser.getUserId(), hashed);
            }

            boolean updated = userDAO.updateProfile(sessionUser.getUserId(), name, email);
            if (updated) {
                sessionUser.setName(name);
                sessionUser.setEmail(email);
                session.setAttribute("currentUser", sessionUser);

                JsonObject res = new JsonObject();
                res.addProperty("success", true);
                res.addProperty("message", "Profile updated successfully!");
                res.add("user", JsonUtil.getGson().toJsonTree(sessionUser));
                JsonUtil.sendJsonResponse(resp, HttpServletResponse.SC_OK, res);
            } else {
                JsonUtil.sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to update profile.");
            }
            return;
        }

        JsonUtil.sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Unknown candidate endpoint.");
    }
}
