package com.jobportal.server;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.jobportal.dao.ApplicationDAO;
import com.jobportal.dao.JobDAO;
import com.jobportal.dao.UserDAO;
import com.jobportal.model.Application;
import com.jobportal.model.DashboardStats;
import com.jobportal.model.Job;
import com.jobportal.model.User;
import com.jobportal.util.JsonUtil;
import com.jobportal.util.PasswordUtil;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

/**
 * DevServer: Lightweight embedded HTTP server built into Java SE.
 * Runs on port 8080.
 * Routes all API endpoints (/api/auth, /api/jobs, /api/applications, /api/candidate, /api/admin)
 * through our JDBC DAOs and Models.
 * Handles CORS, cookies, and sessions.
 * Enables 1-click startup without external Tomcat configuration.
 */
public class DevServer {

    private static final int PORT = 8080;
    private static final Map<String, User> sessions = new ConcurrentHashMap<>();

    private static final UserDAO userDAO = new UserDAO();
    private static final JobDAO jobDAO = new JobDAO();
    private static final ApplicationDAO applicationDAO = new ApplicationDAO();

    public static void main(String[] args) throws IOException {
        int port = PORT;
        String envPort = System.getenv("PORT");
        if (envPort != null && !envPort.trim().isEmpty()) {
            try {
                port = Integer.parseInt(envPort.trim());
            } catch (Exception ignored) {}
        } else if (args.length > 0) {
            try {
                port = Integer.parseInt(args[0]);
            } catch (Exception ignored) {}
        }

        // Safe database auto-initialization on startup
        try {
            InitDB.initDatabase();
        } catch (Exception e) {
            System.err.println("[DevServer] Database auto-init notice: " + e.getMessage());
        }

        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.setExecutor(Executors.newFixedThreadPool(10));

        server.createContext("/api", new ApiHandler());
        server.createContext("/", new WelcomeHandler());

        System.out.println("=======================================================");
        System.out.println(" JOB PORTAL MANAGEMENT SYSTEM - JAVA BACKEND SERVER");
        System.out.println(" Server running on port: " + port);
        System.out.println(" REST API available at: http://localhost:" + port + "/api/");
        System.out.println("=======================================================");

        server.start();
    }

    static class WelcomeHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(200, -1);
                return;
            }

            String html = "<!DOCTYPE html><html><head><title>Job Portal API</title><style>"
                    + "body{font-family:sans-serif;max-width:700px;margin:40px auto;padding:20px;background:#f3f6f8;color:#1e293b;}"
                    + ".card{background:white;padding:30px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.06);}"
                    + "h1{color:#0a66c2;}code{background:#e2e8f0;padding:2px 6px;border-radius:4px;}"
                    + "</style></head><body><div class='card'>"
                    + "<h1>Job Portal Management System API</h1>"
                    + "<p>Status: <strong>Running (Port 8080)</strong></p>"
                    + "<p>Core Java &bull; JDBC &bull; MySQL &bull; React Full-Stack</p>"
                    + "<p>Test Endpoint: <a href='/api/jobs'>/api/jobs</a></p>"
                    + "</div></body></html>";

            byte[] bytes = html.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "text/html; charset=UTF-8");
            exchange.sendResponseHeaders(200, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        }
    }

    static class ApiHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);

            String method = exchange.getRequestMethod().toUpperCase();
            if ("OPTIONS".equalsIgnoreCase(method)) {
                exchange.sendResponseHeaders(200, -1);
                return;
            }

            String path = exchange.getRequestURI().getPath(); // e.g. /api/jobs or /api/auth/login
            User currentUser = getSessionUser(exchange);

            try {
                if (path.startsWith("/api/auth")) {
                    handleAuth(exchange, method, path, currentUser);
                } else if (path.startsWith("/api/jobs")) {
                    handleJobs(exchange, method, path, currentUser);
                } else if (path.startsWith("/api/applications")) {
                    handleApplications(exchange, method, path, currentUser);
                } else if (path.startsWith("/api/candidate")) {
                    handleCandidate(exchange, method, path, currentUser);
                } else if (path.startsWith("/api/admin")) {
                    handleAdmin(exchange, method, path, currentUser);
                } else {
                    sendJson(exchange, 404, "{\"error\": \"Endpoint not found\"}");
                }
            } catch (Exception e) {
                e.printStackTrace();
                sendJson(exchange, 500, "{\"error\": \"Internal server error: " + escape(e.getMessage()) + "\"}");
            }
        }
    }

    // ==========================================
    // 1. AUTH ROUTING
    // ==========================================
    private static void handleAuth(HttpExchange exchange, String method, String path, User currentUser) throws IOException {
        if ("/api/auth/register".equalsIgnoreCase(path) && "POST".equals(method)) {
            JsonObject json = parseJson(exchange);
            String name = getString(json, "name");
            String email = getString(json, "email").toLowerCase();
            String password = getString(json, "password");
            String confirmPassword = getString(json, "confirmPassword");

            if (name.isEmpty() || email.isEmpty() || password.isEmpty()) {
                sendJson(exchange, 400, "{\"error\": \"Name, email, and password are required\"}");
                return;
            }
            if (!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
                sendJson(exchange, 400, "{\"error\": \"Please enter a valid email address\"}");
                return;
            }
            if (password.length() < 6) {
                sendJson(exchange, 400, "{\"error\": \"Password must be at least 6 characters\"}");
                return;
            }
            if (!confirmPassword.isEmpty() && !password.equals(confirmPassword)) {
                sendJson(exchange, 400, "{\"error\": \"Passwords do not match\"}");
                return;
            }
            if (userDAO.findUserByEmail(email) != null) {
                sendJson(exchange, 409, "{\"error\": \"An account with this email already exists\"}");
                return;
            }

            User user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setPassword(PasswordUtil.hashPassword(password));
            user.setRole("CANDIDATE");

            if (userDAO.registerUser(user)) {
                String sessionId = createSession(exchange, user);
                JsonObject res = new JsonObject();
                res.addProperty("success", true);
                res.addProperty("message", "Registration successful!");
                res.addProperty("sessionId", sessionId);
                res.addProperty("token", sessionId);
                res.add("user", JsonUtil.getGson().toJsonTree(user));
                sendJson(exchange, 201, JsonUtil.toJson(res));
            } else {
                sendJson(exchange, 500, "{\"error\": \"Registration failed. Database error.\"}");
            }
        } else if ("/api/auth/login".equalsIgnoreCase(path) && "POST".equals(method)) {
            JsonObject json = parseJson(exchange);
            String email = getString(json, "email");
            String password = getString(json, "password");

            if (email.isEmpty() || password.isEmpty()) {
                sendJson(exchange, 400, "{\"error\": \"Email and password are required\"}");
                return;
            }

            User user = userDAO.authenticate(email, password);
            if (user == null) {
                sendJson(exchange, 401, "{\"error\": \"Invalid email or password\"}");
                return;
            }

            String sessionId = createSession(exchange, user);
            JsonObject res = new JsonObject();
            res.addProperty("success", true);
            res.addProperty("message", "Login successful!");
            res.addProperty("sessionId", sessionId);
            res.addProperty("token", sessionId);
            res.add("user", JsonUtil.getGson().toJsonTree(user));
            sendJson(exchange, 200, JsonUtil.toJson(res));
        } else if ("/api/auth/logout".equalsIgnoreCase(path) && "POST".equals(method)) {
            clearSession(exchange);
            sendJson(exchange, 200, "{\"success\": true, \"message\": \"Logged out successfully\"}");
        } else if ("/api/auth/me".equalsIgnoreCase(path) && "GET".equals(method)) {
            if (currentUser == null) {
                sendJson(exchange, 401, "{\"error\": \"Not logged in\"}");
                return;
            }
            JsonObject res = new JsonObject();
            res.addProperty("success", true);
            res.add("user", JsonUtil.getGson().toJsonTree(currentUser));
            sendJson(exchange, 200, JsonUtil.toJson(res));
        } else {
            sendJson(exchange, 404, "{\"error\": \"Unknown auth route\"}");
        }
    }

    // ==========================================
    // 2. JOBS ROUTING
    // ==========================================
    private static void handleJobs(HttpExchange exchange, String method, String path, User currentUser) throws IOException {
        String sub = path.substring("/api/jobs".length()); // e.g. "" or "/" or "/1" or "/search"
        if (sub.startsWith("/")) sub = sub.substring(1);

        if ("GET".equals(method)) {
            if (sub.isEmpty() || "search".equalsIgnoreCase(sub)) {
                Map<String, String> query = parseQuery(exchange.getRequestURI().getRawQuery());
                String title = query.getOrDefault("title", query.get("search"));
                String location = query.get("location");
                String jobType = query.get("jobType");

                List<Job> jobs;
                if (title != null || location != null || jobType != null) {
                    jobs = jobDAO.searchJobs(title, location, jobType);
                } else {
                    jobs = jobDAO.getAllJobs();
                }
                sendJson(exchange, 200, JsonUtil.toJson(jobs));
            } else {
                try {
                    int id = Integer.parseInt(sub);
                    Job job = jobDAO.getJobById(id);
                    if (job != null) {
                        sendJson(exchange, 200, JsonUtil.toJson(job));
                    } else {
                        sendJson(exchange, 404, "{\"error\": \"Job not found\"}");
                    }
                } catch (NumberFormatException e) {
                    sendJson(exchange, 400, "{\"error\": \"Invalid Job ID\"}");
                }
            }
        } else if ("POST".equals(method)) {
            if (currentUser == null || !currentUser.isAdmin()) {
                sendJson(exchange, 403, "{\"error\": \"Admin access required\"}");
                return;
            }
            JsonObject json = parseJson(exchange);
            Job job = new Job();
            job.setTitle(getString(json, "title"));
            job.setCompany(getString(json, "company"));
            job.setLocation(getString(json, "location"));
            job.setSalary(getString(json, "salary"));
            job.setJobType(getString(json, "jobType").isEmpty() ? "Full Time" : getString(json, "jobType"));
            job.setDescription(getString(json, "description"));
            job.setRequirements(getString(json, "requirements"));

            if (job.getTitle().isEmpty() || job.getCompany().isEmpty()) {
                sendJson(exchange, 400, "{\"error\": \"Title and Company are required\"}");
                return;
            }

            if (jobDAO.addJob(job)) {
                sendJson(exchange, 201, "{\"success\": true, \"message\": \"Job added successfully!\", \"job\": " + JsonUtil.toJson(job) + "}");
            } else {
                sendJson(exchange, 500, "{\"error\": \"Failed to add job\"}");
            }
        } else if ("PUT".equals(method)) {
            if (currentUser == null || !currentUser.isAdmin()) {
                sendJson(exchange, 403, "{\"error\": \"Admin access required\"}");
                return;
            }
            try {
                int id = Integer.parseInt(sub);
                Job job = jobDAO.getJobById(id);
                if (job == null) {
                    sendJson(exchange, 404, "{\"error\": \"Job not found\"}");
                    return;
                }
                JsonObject json = parseJson(exchange);
                if (json.has("title")) job.setTitle(getString(json, "title"));
                if (json.has("company")) job.setCompany(getString(json, "company"));
                if (json.has("location")) job.setLocation(getString(json, "location"));
                if (json.has("salary")) job.setSalary(getString(json, "salary"));
                if (json.has("jobType")) job.setJobType(getString(json, "jobType"));
                if (json.has("description")) job.setDescription(getString(json, "description"));
                if (json.has("requirements")) job.setRequirements(getString(json, "requirements"));

                if (jobDAO.updateJob(job)) {
                    sendJson(exchange, 200, "{\"success\": true, \"message\": \"Job updated successfully!\", \"job\": " + JsonUtil.toJson(job) + "}");
                } else {
                    sendJson(exchange, 500, "{\"error\": \"Failed to update job\"}");
                }
            } catch (NumberFormatException e) {
                sendJson(exchange, 400, "{\"error\": \"Invalid Job ID\"}");
            }
        } else if ("DELETE".equals(method)) {
            if (currentUser == null || !currentUser.isAdmin()) {
                sendJson(exchange, 403, "{\"error\": \"Admin access required\"}");
                return;
            }
            try {
                int id = Integer.parseInt(sub);
                if (jobDAO.deleteJob(id)) {
                    sendJson(exchange, 200, "{\"success\": true, \"message\": \"Job deleted successfully\"}");
                } else {
                    sendJson(exchange, 404, "{\"error\": \"Job not found or could not be deleted\"}");
                }
            } catch (NumberFormatException e) {
                sendJson(exchange, 400, "{\"error\": \"Invalid Job ID\"}");
            }
        }
    }

    // ==========================================
    // 3. APPLICATIONS ROUTING
    // ==========================================
    private static void handleApplications(HttpExchange exchange, String method, String path, User currentUser) throws IOException {
        if (currentUser == null) {
            sendJson(exchange, 401, "{\"error\": \"Authentication required\"}");
            return;
        }

        String sub = path.substring("/api/applications".length());
        if (sub.startsWith("/")) sub = sub.substring(1);

        if ("POST".equals(method) && sub.isEmpty()) {
            if (currentUser.isAdmin()) {
                sendJson(exchange, 400, "{\"error\": \"Admins cannot apply for jobs\"}");
                return;
            }
            JsonObject json = parseJson(exchange);
            if (!json.has("jobId")) {
                sendJson(exchange, 400, "{\"error\": \"jobId is required\"}");
                return;
            }
            int jobId = json.get("jobId").getAsInt();

            if (applicationDAO.hasCandidateApplied(currentUser.getUserId(), jobId)) {
                sendJson(exchange, 409, "{\"error\": \"You have already applied for this job\"}");
                return;
            }

            if (applicationDAO.applyForJob(currentUser.getUserId(), jobId)) {
                sendJson(exchange, 201, "{\"success\": true, \"message\": \"Application submitted successfully!\"}");
            } else {
                sendJson(exchange, 500, "{\"error\": \"Failed to submit application\"}");
            }
        } else if ("GET".equals(method) && "my".equalsIgnoreCase(sub)) {
            List<Application> apps = applicationDAO.getCandidateApplications(currentUser.getUserId());
            sendJson(exchange, 200, JsonUtil.toJson(apps));
        } else if ("GET".equals(method) && sub.isEmpty()) {
            if (!currentUser.isAdmin()) {
                sendJson(exchange, 403, "{\"error\": \"Admin access required\"}");
                return;
            }
            List<Application> allApps = applicationDAO.getAllApplications();
            sendJson(exchange, 200, JsonUtil.toJson(allApps));
        } else if ("PUT".equals(method) && sub.endsWith("/status")) {
            if (!currentUser.isAdmin()) {
                sendJson(exchange, 403, "{\"error\": \"Admin access required\"}");
                return;
            }
            String[] parts = sub.split("/");
            try {
                int appId = Integer.parseInt(parts[0]);
                JsonObject json = parseJson(exchange);
                String newStatus = getString(json, "status");

                if (applicationDAO.updateApplicationStatus(appId, newStatus)) {
                    sendJson(exchange, 200, "{\"success\": true, \"message\": \"Application status updated to " + newStatus + "\"}");
                } else {
                    sendJson(exchange, 404, "{\"error\": \"Application not found\"}");
                }
            } catch (Exception e) {
                sendJson(exchange, 400, "{\"error\": \"Invalid application ID format\"}");
            }
        }
    }

    // ==========================================
    // 4. CANDIDATE ROUTING
    // ==========================================
    private static void handleCandidate(HttpExchange exchange, String method, String path, User currentUser) throws IOException {
        if (currentUser == null) {
            sendJson(exchange, 401, "{\"error\": \"Authentication required\"}");
            return;
        }

        if ("/api/candidate/profile".equalsIgnoreCase(path)) {
            if ("GET".equals(method)) {
                User user = userDAO.findUserById(currentUser.getUserId());
                sendJson(exchange, 200, JsonUtil.toJson(user));
            } else if ("PUT".equals(method)) {
                JsonObject json = parseJson(exchange);
                String name = getString(json, "name");
                String email = getString(json, "email").toLowerCase();
                String newPassword = getString(json, "newPassword");
                String currentPassword = getString(json, "currentPassword");

                if (name.isEmpty() || email.isEmpty()) {
                    sendJson(exchange, 400, "{\"error\": \"Name and email cannot be empty\"}");
                    return;
                }

                User existing = userDAO.findUserByEmail(email);
                if (existing != null && existing.getUserId() != currentUser.getUserId()) {
                    sendJson(exchange, 409, "{\"error\": \"Email is already registered\"}");
                    return;
                }

                if (!newPassword.isEmpty()) {
                    User fresh = userDAO.findUserById(currentUser.getUserId());
                    if (!PasswordUtil.checkPassword(currentPassword, fresh.getPassword())) {
                        sendJson(exchange, 401, "{\"error\": \"Current password incorrect\"}");
                        return;
                    }
                    userDAO.changePassword(currentUser.getUserId(), PasswordUtil.hashPassword(newPassword));
                }

                if (userDAO.updateProfile(currentUser.getUserId(), name, email)) {
                    currentUser.setName(name);
                    currentUser.setEmail(email);
                    sendJson(exchange, 200, "{\"success\": true, \"message\": \"Profile updated successfully!\", \"user\": " + JsonUtil.toJson(currentUser) + "}");
                } else {
                    sendJson(exchange, 500, "{\"error\": \"Failed to update profile\"}");
                }
            }
        } else if ("/api/candidate/dashboard".equalsIgnoreCase(path) && "GET".equals(method)) {
            DashboardStats stats = applicationDAO.getCandidateDashboardStats(currentUser.getUserId());
            sendJson(exchange, 200, JsonUtil.toJson(stats));
        } else {
            sendJson(exchange, 404, "{\"error\": \"Not found\"}");
        }
    }

    // ==========================================
    // 5. ADMIN ROUTING
    // ==========================================
    private static void handleAdmin(HttpExchange exchange, String method, String path, User currentUser) throws IOException {
        if (currentUser == null || !currentUser.isAdmin()) {
            sendJson(exchange, 403, "{\"error\": \"Admin access required\"}");
            return;
        }

        if ("/api/admin/dashboard".equalsIgnoreCase(path) && "GET".equals(method)) {
            DashboardStats stats = applicationDAO.getAdminDashboardStats();
            sendJson(exchange, 200, JsonUtil.toJson(stats));
        } else if ("/api/admin/candidates".equalsIgnoreCase(path) && "GET".equals(method)) {
            Map<String, String> query = parseQuery(exchange.getRequestURI().getRawQuery());
            String search = query.get("search");
            List<User> list = (search != null && !search.isEmpty()) ? userDAO.searchCandidates(search) : userDAO.getAllCandidates();
            sendJson(exchange, 200, JsonUtil.toJson(list));
        } else if ("/api/admin/applications".equalsIgnoreCase(path) && "GET".equals(method)) {
            Map<String, String> query = parseQuery(exchange.getRequestURI().getRawQuery());
            String status = query.get("status");
            List<Application> list = applicationDAO.getAllApplications();
            if (status != null && !status.isEmpty() && !"All".equalsIgnoreCase(status)) {
                list = list.stream().filter(a -> status.equalsIgnoreCase(a.getStatus())).collect(Collectors.toList());
            }
            sendJson(exchange, 200, JsonUtil.toJson(list));
        } else {
            sendJson(exchange, 404, "{\"error\": \"Not found\"}");
        }
    }

    // ==========================================
    // HELPERS: CORS, SESSIONS, JSON, QUERY
    // ==========================================
    private static void addCorsHeaders(HttpExchange exchange) {
        String allowedFrontend = System.getenv("FRONTEND_URL");
        if (allowedFrontend == null || allowedFrontend.trim().isEmpty()) {
            allowedFrontend = System.getenv("CORS_ORIGIN");
        }

        String requestOrigin = exchange.getRequestHeaders().getFirst("Origin");
        String originToSet = null;

        if (requestOrigin != null && !requestOrigin.trim().isEmpty()) {
            String ro = requestOrigin.trim();
            if (allowedFrontend != null && !allowedFrontend.trim().isEmpty()) {
                String[] allowedList = allowedFrontend.split(",");
                boolean matched = false;
                for (String allowed : allowedList) {
                    String clean = allowed.trim();
                    if (clean.equalsIgnoreCase(ro) || clean.equals("*") || clean.equalsIgnoreCase(ro.replaceFirst("/$", ""))) {
                        originToSet = ro;
                        matched = true;
                        break;
                    }
                }
                if (!matched) {
                    originToSet = allowedList[0].trim();
                }
            } else {
                originToSet = ro;
            }
        } else if (allowedFrontend != null && !allowedFrontend.trim().isEmpty() && !allowedFrontend.trim().equals("*")) {
            originToSet = allowedFrontend.trim().split(",")[0].trim();
        }

        if (originToSet != null && !originToSet.equals("*")) {
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", originToSet);
            exchange.getResponseHeaders().set("Access-Control-Allow-Credentials", "true");
        } else {
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        }

        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Origin, Accept, Cookie");
        exchange.getResponseHeaders().set("Access-Control-Expose-Headers", "Set-Cookie, Authorization");
    }

    private static User getSessionUser(HttpExchange exchange) {
        // 1. Check Authorization: Bearer <sessionId> header
        String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            User u = sessions.get(token);
            if (u != null) return u;
        }

        // 2. Check Cookie: JSESSIONID=<sessionId>
        String cookieHeader = exchange.getRequestHeaders().getFirst("Cookie");
        if (cookieHeader != null) {
            String[] cookies = cookieHeader.split(";");
            for (String c : cookies) {
                String[] pair = c.trim().split("=");
                if (pair.length == 2 && "JSESSIONID".equalsIgnoreCase(pair[0])) {
                    return sessions.get(pair[1]);
                }
            }
        }
        return null;
    }

    private static String createSession(HttpExchange exchange, User user) {
        String sid = UUID.randomUUID().toString();
        sessions.put(sid, user);

        String proto = exchange.getRequestHeaders().getFirst("X-Forwarded-Proto");
        boolean isHttps = "https".equalsIgnoreCase(proto) || System.getenv("RENDER") != null;
        String cookiePolicy = isHttps ? "; SameSite=None; Secure" : "; SameSite=Lax";

        exchange.getResponseHeaders().add("Set-Cookie", "JSESSIONID=" + sid + "; Path=/; HttpOnly" + cookiePolicy);
        return sid;
    }

    private static void clearSession(HttpExchange exchange) {
        String proto = exchange.getRequestHeaders().getFirst("X-Forwarded-Proto");
        boolean isHttps = "https".equalsIgnoreCase(proto) || System.getenv("RENDER") != null;
        String cookiePolicy = isHttps ? "; SameSite=None; Secure" : "; SameSite=Lax";

        String cookieHeader = exchange.getRequestHeaders().getFirst("Cookie");
        if (cookieHeader != null) {
            String[] cookies = cookieHeader.split(";");
            for (String c : cookies) {
                String[] pair = c.trim().split("=");
                if (pair.length == 2 && "JSESSIONID".equalsIgnoreCase(pair[0])) {
                    sessions.remove(pair[1]);
                }
            }
        }

        String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            sessions.remove(authHeader.substring(7).trim());
        }

        exchange.getResponseHeaders().add("Set-Cookie", "JSESSIONID=deleted; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT" + cookiePolicy);
    }

    private static JsonObject parseJson(HttpExchange exchange) throws IOException {
        InputStream is = exchange.getRequestBody();
        BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) sb.append(line);
        if (sb.length() == 0) return new JsonObject();
        try {
            return JsonParser.parseString(sb.toString()).getAsJsonObject();
        } catch (Exception e) {
            return new JsonObject();
        }
    }

    private static String getString(JsonObject obj, String key) {
        return (obj != null && obj.has(key) && !obj.get(key).isJsonNull()) ? obj.get(key).getAsString().trim() : "";
    }

    private static Map<String, String> parseQuery(String rawQuery) {
        Map<String, String> map = new HashMap<>();
        if (rawQuery == null || rawQuery.isEmpty()) return map;
        String[] pairs = rawQuery.split("&");
        for (String pair : pairs) {
            String[] kv = pair.split("=");
            if (kv.length == 2) {
                map.put(URLDecoder.decode(kv[0], StandardCharsets.UTF_8), URLDecoder.decode(kv[1], StandardCharsets.UTF_8));
            } else if (kv.length == 1) {
                map.put(URLDecoder.decode(kv[0], StandardCharsets.UTF_8), "");
            }
        }
        return map;
    }

    private static void sendJson(HttpExchange exchange, int status, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static String escape(String s) {
        if (s == null) return "";
        return s.replace("\"", "\\\"");
    }
}
