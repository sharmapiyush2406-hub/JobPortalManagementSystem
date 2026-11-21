package com.jobportal.servlet;

import com.google.gson.JsonObject;
import com.jobportal.dao.UserDAO;
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
 * Authentication Servlet
 * Handles Registration, Login, Logout, and Session Status verification.
 * Endpoints:
 *   POST /api/auth/register
 *   POST /api/auth/login
 *   POST /api/auth/logout
 *   GET  /api/auth/me
 */
@WebServlet(name = "AuthServlet", urlPatterns = {"/api/auth/*"})
public class AuthServlet extends HttpServlet {

    private final UserDAO userDAO = new UserDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();
        if (pathInfo == null) pathInfo = "";

        if ("/me".equalsIgnoreCase(pathInfo)) {
            handleGetMe(req, resp);
        } else {
            JsonUtil.sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Unknown auth endpoint: " + pathInfo);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();
        if (pathInfo == null) pathInfo = "";

        switch (pathInfo.toLowerCase()) {
            case "/register":
                handleRegister(req, resp);
                break;
            case "/login":
                handleLogin(req, resp);
                break;
            case "/logout":
                handleLogout(req, resp);
                break;
            default:
                JsonUtil.sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Unknown auth endpoint: " + pathInfo);
                break;
        }
    }

    /**
     * Handles candidate registration.
     */
    private void handleRegister(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        JsonObject json = JsonUtil.parseRequestBody(req);

        String name = json.has("name") ? json.get("name").getAsString().trim() : "";
        String email = json.has("email") ? json.get("email").getAsString().trim().toLowerCase() : "";
        String password = json.has("password") ? json.get("password").getAsString() : "";
        String confirmPassword = json.has("confirmPassword") ? json.get("confirmPassword").getAsString() : "";

        // Form validations
        if (name.isEmpty() || email.isEmpty() || password.isEmpty()) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "All fields (Name, Email, Password) are required.");
            return;
        }

        // Email format regex validation
        if (!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Please enter a valid email address.");
            return;
        }

        if (password.length() < 6) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Password must be at least 6 characters long.");
            return;
        }

        if (confirmPassword != null && !confirmPassword.isEmpty() && !password.equals(confirmPassword)) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Password and Confirm Password do not match.");
            return;
        }

        // Check if email already registered
        if (userDAO.findUserByEmail(email) != null) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_CONFLICT, "An account with this email already exists.");
            return;
        }

        // Hash password with BCrypt
        String hashedPassword = PasswordUtil.hashPassword(password);

        User newUser = new User();
        newUser.setName(name);
        newUser.setEmail(email);
        newUser.setPassword(hashedPassword);
        newUser.setRole("CANDIDATE");

        boolean success = userDAO.registerUser(newUser);
        if (success) {
            // Establish session
            HttpSession session = req.getSession(true);
            session.setAttribute("currentUser", newUser);

            JsonObject resObj = new JsonObject();
            resObj.addProperty("success", true);
            resObj.addProperty("message", "Registration successful! Welcome to JobPortal.");
            resObj.add("user", JsonUtil.getGson().toJsonTree(newUser));

            JsonUtil.sendJsonResponse(resp, HttpServletResponse.SC_CREATED, resObj);
        } else {
            JsonUtil.sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Registration failed due to a database error.");
        }
    }

    /**
     * Handles candidate and admin login.
     */
    private void handleLogin(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        JsonObject json = JsonUtil.parseRequestBody(req);

        String email = json.has("email") ? json.get("email").getAsString().trim() : "";
        String password = json.has("password") ? json.get("password").getAsString() : "";

        if (email.isEmpty() || password.isEmpty()) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Email and Password are required.");
            return;
        }

        User user = userDAO.authenticate(email, password);
        if (user == null) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Invalid email or password.");
            return;
        }

        // Create session
        HttpSession session = req.getSession(true);
        session.setAttribute("currentUser", user);

        JsonObject resObj = new JsonObject();
        resObj.addProperty("success", true);
        resObj.addProperty("message", "Login successful! Welcome back, " + user.getName());
        resObj.add("user", JsonUtil.getGson().toJsonTree(user));

        JsonUtil.sendJsonResponse(resp, HttpServletResponse.SC_OK, resObj);
    }

    /**
     * Handles user logout.
     */
    private void handleLogout(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        HttpSession session = req.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        JsonUtil.sendSuccess(resp, HttpServletResponse.SC_OK, "Logged out successfully.");
    }

    /**
     * Returns currently authenticated user details.
     */
    private void handleGetMe(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        HttpSession session = req.getSession(false);
        User user = (session != null) ? (User) session.getAttribute("currentUser") : null;

        if (user == null) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Not logged in.");
            return;
        }

        JsonObject resObj = new JsonObject();
        resObj.addProperty("success", true);
        resObj.add("user", JsonUtil.getGson().toJsonTree(user));

        JsonUtil.sendJsonResponse(resp, HttpServletResponse.SC_OK, resObj);
    }
}
