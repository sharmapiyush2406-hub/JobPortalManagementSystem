package jobportal;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.util.Properties;

public class DBConnection {

    private static final String DEFAULT_URL =
        "jdbc:mysql://localhost:3306/job_portal?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8";

    private static final String DEFAULT_USER = "root";
    private static final String DEFAULT_PASSWORD = "";
    private static final Properties props = new Properties();

    static {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            File file = new File("db.properties");
            if (file.exists()) {
                try (InputStream in = new FileInputStream(file)) {
                    props.load(in);
                }
            }
        } catch (Exception ignored) {
        }
    }

    public static Connection getConnection() {
        try {
            String url = System.getProperty("db.url", System.getenv("DB_URL") != null ? System.getenv("DB_URL") : props.getProperty("db.url", DEFAULT_URL));
            String user = System.getProperty("db.user", System.getenv("DB_USER") != null ? System.getenv("DB_USER") : props.getProperty("db.user", DEFAULT_USER));
            String pass = System.getProperty("db.password", System.getenv("DB_PASSWORD") != null ? System.getenv("DB_PASSWORD") : props.getProperty("db.password", DEFAULT_PASSWORD));

            Connection con = DriverManager.getConnection(url, user, pass);
            return con;
        } catch (Exception e) {
            System.out.println("Database Connection Failed: " + e.getMessage());
            return null;
        }
    }
}
