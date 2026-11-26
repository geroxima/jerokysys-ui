package com.jerokysys.ui;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

/**
 * Endpoint de diagnóstico para la demo de sticky/replicación.
 * No lo usa la SPA.
 */
public class SessionInfoServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession session = request.getSession(true);

        Integer visits = (Integer) session.getAttribute("visits");
        if (visits == null) {
            visits = 0;
            session.setAttribute("visits", visits);
        }

        String node = System.getProperty("ui.node", "unknown");
        String sessionId = session.getId();

        response.setContentType("application/json;charset=UTF-8");
        response.setHeader("Cache-Control", "no-store");
        response.getWriter().printf(
                "{\"node\":\"%s\",\"visits\":%d,\"sessionId\":\"%s\"}",
                node, visits, sessionId);
    }
}
