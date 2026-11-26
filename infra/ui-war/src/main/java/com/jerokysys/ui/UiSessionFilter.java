package com.jerokysys.ui;

import java.io.IOException;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

/**
 * Crea la HttpSession en las navegaciones HTML para que Tomcat emita el
 * JSESSIONID con el jvmRoute (ui1/ui2). Ese cookie es lo que Apache usa para
 * sticky sessions. No toca la autenticación: el JWT sigue en sessionStorage.
 */
public class UiSessionFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        String path = request.getRequestURI()
                .substring(request.getContextPath().length());
        String accept = request.getHeader("Accept");

        boolean htmlRequest = (accept != null && accept.contains("text/html"))
                || "/".equals(path)
                || path.endsWith("/");

        boolean excluded = "/health.txt".equals(path) || path.startsWith("/session/");

        if (!excluded && htmlRequest) {
            HttpSession session = request.getSession(true);
            Integer visits = (Integer) session.getAttribute("visits");
            session.setAttribute("visits", visits == null ? 1 : visits + 1);
        }

        // Header útil para ver qué nodo respondió (y para logs de Apache).
        response.setHeader("X-UI-Node", System.getProperty("ui.node", "unknown"));

        chain.doFilter(req, res);
    }
}
