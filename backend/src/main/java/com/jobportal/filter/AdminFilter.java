package com.jobportal.filter;

import com.jobportal.model.User;
import com.jobportal.util.JsonUtil;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

/**
 * Filter that enforces ADMIN role on restricted endpoints.
 */
public class AdminFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {}

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        // Skip preflight OPTIONS
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            chain.doFilter(req, res);
            return;
        }

        HttpSession session = request.getSession(false);
        User user = (session != null) ? (User) session.getAttribute("currentUser") : null;

        if (user == null) {
            JsonUtil.sendError(response, HttpServletResponse.SC_UNAUTHORIZED, "Admin login required.");
            return;
        }

        if (!user.isAdmin()) {
            JsonUtil.sendError(response, HttpServletResponse.SC_FORBIDDEN, "Access denied: Administrator privilege required.");
            return;
        }

        chain.doFilter(req, res);
    }

    @Override
    public void destroy() {}
}
