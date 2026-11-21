package com.jobportal.util;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * Utility class for JSON parsing, formatting and HTTP response output.
 */
public class JsonUtil {

    private static final Gson gson = new GsonBuilder()
            .setDateFormat("yyyy-MM-dd HH:mm:ss")
            .serializeNulls()
            .create();

    public static Gson getGson() {
        return gson;
    }

    /**
     * Reads the entire body of an HttpServletRequest as a String.
     */
    public static String readRequestBody(HttpServletRequest request) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = request.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        }
        return sb.toString();
    }

    /**
     * Parses request body into a JsonObject.
     */
    public static JsonObject parseRequestBody(HttpServletRequest request) throws IOException {
        String body = readRequestBody(request);
        if (body == null || body.trim().isEmpty()) {
            return new JsonObject();
        }
        return JsonParser.parseString(body).getAsJsonObject();
    }

    /**
     * Parses request body into a specific class.
     */
    public static <T> T fromJson(HttpServletRequest request, Class<T> clazz) throws IOException {
        String body = readRequestBody(request);
        return gson.fromJson(body, clazz);
    }

    /**
     * Converts any Java Object to JSON String.
     */
    public static String toJson(Object obj) {
        return gson.toJson(obj);
    }

    /**
     * Sends a JSON response with status code.
     */
    public static void sendJsonResponse(HttpServletResponse response, int statusCode, Object data) throws IOException {
        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(statusCode);
        try (PrintWriter out = response.getWriter()) {
            out.print(gson.toJson(data));
            out.flush();
        }
    }

    /**
     * Sends a standardized JSON error response.
     */
    public static void sendError(HttpServletResponse response, int statusCode, String message) throws IOException {
        JsonObject obj = new JsonObject();
        obj.addProperty("success", false);
        obj.addProperty("error", message);
        sendJsonResponse(response, statusCode, obj);
    }

    /**
     * Sends a standardized JSON success response.
     */
    public static void sendSuccess(HttpServletResponse response, int statusCode, String message) throws IOException {
        JsonObject obj = new JsonObject();
        obj.addProperty("success", true);
        obj.addProperty("message", message);
        sendJsonResponse(response, statusCode, obj);
    }
}
