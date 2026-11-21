# JOB PORTAL MANAGEMENT SYSTEM
### Full-Stack Web Application Using Core Java, Servlets, JDBC, React.js & MySQL
**Academic B.Tech Computer Science & Engineering Capstone / Major Project**

---

## 1. PROJECT OVERVIEW
The **Job Portal Management System** is an enterprise-grade full-stack web application developed to bridge the gap between job seekers (candidates) and employers through an administrator-managed job portal.

The application has been engineered strictly adhering to **Core Java Web Development** principles:
- **Backend Architecture**: Pure **Core Java**, **Java Servlets (`HttpServlet`)**, **JDBC (`PreparedStatement`)**, and **Apache Tomcat**.
- **Database**: **MySQL** relational database with relational constraints (`FOREIGN KEY ... ON DELETE CASCADE`, `UNIQUE(user_id, job_id)`).
- **Frontend Architecture**: **React.js** with **Vite**, **React Router v6**, and modern LinkedIn/Indeed inspired responsive CSS.
- **Security**: **BCrypt password hashing** (salt rounds = 10) and standard **HttpSession cookie management (`JSESSIONID`)**.
- **STRICT COMPLIANCE**: **Zero Spring Boot, Zero Spring MVC, Zero Hibernate/JPA, and Zero Node.js backend frameworks.** All business logic and database queries are written in pure Java and JDBC.

---

## 2. SYSTEM ARCHITECTURE & DATA FLOW

```
+-------------------------------------------------------------------------+
|                         REACT.JS FRONTEND (Vite)                        |
|   Pages: Home, Browse Jobs, Job Details, Dashboards, Manage Modules    |
|   Components: Navbar, Footer, JobCard, SearchBar, Sidebar, Modals       |
+-------------------------------------------------------------------------+
                                    |
                    RESTful JSON HTTP (Port 5173 -> 8080)
                    [Cookie: JSESSIONID | CORS credentials: include]
                                    v
+-------------------------------------------------------------------------+
|                      APACHE TOMCAT / DEV SERVER                         |
|   CorsFilter (CORS headers, preflight OPTIONS)                          |
|   AuthenticationFilter & AdminFilter (Session-based RBAC)               |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                         JAVA SERVLET LAYER                              |
|   AuthServlet        -> /api/auth/* (register, login, logout, me)       |
|   JobServlet         -> /api/jobs/* (CRUD, search, filters)             |
|   ApplicationServlet -> /api/applications/* (apply, status, workflows)   |
|   CandidateServlet   -> /api/candidate/* (profile, candidate stats)     |
|   AdminServlet       -> /api/admin/* (admin stats, candidate directory) |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                     DATA ACCESS LAYER (DAO)                             |
|   UserDAO.java        JobDAO.java        ApplicationDAO.java            |
|   BCrypt.java         PasswordUtil.java  JsonUtil.java                  |
+-------------------------------------------------------------------------+
                                    |
                             JDBC Driver (com.mysql.cj.jdbc.Driver)
                             PreparedStatement & Connection Pooling
                                    v
+-------------------------------------------------------------------------+
|                            MYSQL DATABASE                               |
|   Database: job_portal                                                  |
|   Tables: users, jobs, applications                                     |
+-------------------------------------------------------------------------+
```

---

## 3. PROJECT DIRECTORY STRUCTURE

```
JobPortalManagementSystem/
├── database/
│   └── schema.sql                 # Complete MySQL schema, constraints & seed data
├── db.properties                  # MySQL configuration (URL, user, password)
├── init-database.bat              # 1-Click Database Initializer
├── run-backend.bat                # 1-Click Java Backend Server (Port 8080)
├── run-frontend.bat               # 1-Click React Frontend (Port 5173)
├── jobportal.war                  # Ready-to-deploy Tomcat WAR file (2.8 MB)
│
├── backend/                       # Java Servlet & JDBC Backend Source
│   ├── pom.xml                    # Maven dependency management & WAR packaging
│   └── src/main/
│       ├── java/com/jobportal/
│       │   ├── config/
│       │   │   └── DBConnection.java     # JDBC Connection Manager
│       │   ├── model/
│       │   │   ├── User.java             # User entity (Candidate & Admin)
│       │   │   ├── Job.java              # Job posting entity
│       │   │   ├── Application.java      # Application entity with joined fields
│       │   │   └── DashboardStats.java   # Analytics metrics DTO
│       │   ├── dao/
│       │   │   ├── UserDAO.java          # User CRUD, auth & search
│       │   │   ├── JobDAO.java           # Job CRUD, filters & counts
│       │   │   └── ApplicationDAO.java   # Application workflow & stats
│       │   ├── servlet/
│       │   │   ├── AuthServlet.java      # /api/auth/* endpoints
│       │   │   ├── JobServlet.java       # /api/jobs/* endpoints
│       │   │   ├── ApplicationServlet.java # /api/applications/* endpoints
│       │   │   ├── CandidateServlet.java # /api/candidate/* endpoints
│       │   │   └── AdminServlet.java     # /api/admin/* endpoints
│       │   ├── filter/
│       │   │   ├── CorsFilter.java       # CORS header injection & preflight
│       │   │   ├── AuthenticationFilter.java # Candidate session verification
│       │   │   └── AdminFilter.java      # Role-based ADMIN gatekeeper
│       │   ├── util/
│       │   │   ├── BCrypt.java           # OpenBSD Blowfish password hashing
│       │   │   ├── PasswordUtil.java     # Hash generation & validation
│       │   │   └── JsonUtil.java         # Request reader & Gson serialization
│       │   └── server/
│       │       ├── DevServer.java        # Embedded runner (port 8080)
│       │       └── InitDB.java           # Database schema auto-runner
│       └── webapp/
│           ├── WEB-INF/
│           │   └── web.xml               # Servlet mappings, filters, sessions
│           └── index.html                # Tomcat welcome & API documentation
│
├── frontend/                      # Modern React.js Frontend
│   ├── package.json               # React 18, React Router v6, Lucide Icons
│   ├── vite.config.js             # Vite development server with /api proxy
│   ├── index.html                 # HTML entry point with Inter & Plus Jakarta fonts
│   └── src/
│       ├── main.jsx               # React Root & AuthProvider mounting
│       ├── App.jsx                # Route definitions & Role-based Guards
│       ├── context/
│       │   └── AuthContext.jsx    # Session management & user state
│       ├── services/
│       │   └── api.js             # REST API client with credentials: include
│       ├── components/
│       │   ├── Navbar.jsx         # Responsive Navigation bar with role badges
│       │   ├── Footer.jsx         # Professional Academic project footer
│       │   ├── JobCard.jsx        # Job card with details & direct apply
│       │   ├── SearchBar.jsx      # Multi-field keyword, location & type search
│       │   ├── Sidebar.jsx        # Admin dashboard navigation sidebar
│       │   ├── DashboardCard.jsx  # Colored metric overview cards
│       │   ├── StatusBadge.jsx    # Applied / Shortlisted / Rejected badges
│       │   ├── LoadingSpinner.jsx # Clean animated loader
│       │   └── ConfirmationModal.jsx # Action confirmation dialogs
│       ├── pages/
│       │   ├── Home.jsx           # Landing page with hero, stats & jobs
│       │   ├── Login.jsx          # Candidate login screen
│       │   ├── Register.jsx       # Candidate registration with validation
│       │   ├── BrowseJobs.jsx     # Responsive job catalog with filters
│       │   ├── JobDetails.jsx     # Dedicated job description & apply page
│       │   ├── CandidateDashboard.jsx # Candidate analytics & recent apps
│       │   ├── MyApplications.jsx # Candidate's application tracking
│       │   ├── CandidateProfile.jsx # Edit details & change password
│       │   ├── AdminLogin.jsx     # Dedicated admin login with demo autofill
│       │   ├── AdminDashboard.jsx # Admin metrics & application funnel
│       │   ├── ManageJobs.jsx     # Admin Job CRUD (Add/Edit/Delete/Search)
│       │   ├── ManageApplications.jsx # Review applications & shortlist/reject
│       │   ├── ManageCandidates.jsx # Candidate directory & application history
│       │   └── NotFound.jsx       # Custom 404 page
│       └── styles/
│           └── index.css          # Design system & responsive styles
│
├── lib/                           # Standalone runtime JARs
│   ├── mysql-connector-j-26.10.0.jar
│   ├── javax.servlet-api-4.0.1.jar
│   └── gson-2.10.1.jar
└── src/jobportal/                 # Preserved original console CLI source
```

---

## 4. DATABASE SCHEMA DESIGN (MySQL)

### Table 1: `users`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for user |
| `name` | VARCHAR(100) | NOT NULL | User's full name |
| `email` | VARCHAR(150) | NOT NULL, UNIQUE | User email (used for login) |
| `password` | VARCHAR(255) | NOT NULL | BCrypt hashed password |
| `role` | ENUM | NOT NULL, DEFAULT 'CANDIDATE' | 'CANDIDATE' or 'ADMIN' |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation time |

### Table 2: `jobs`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `job_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for job |
| `title` | VARCHAR(150) | NOT NULL | Job role title |
| `company` | VARCHAR(150) | NOT NULL | Hiring company name |
| `location` | VARCHAR(100) | NOT NULL | Office city or 'Remote' |
| `salary` | VARCHAR(100) | NOT NULL | Compensation range |
| `job_type` | VARCHAR(50) | NOT NULL, DEFAULT 'Full Time' | Full Time, Remote, Part Time |
| `description`| TEXT | NOT NULL | Detailed duties and scope |
| `requirements`| TEXT | NOT NULL | Skills & qualifications |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Posting date |

### Table 3: `applications`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `application_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique application ID |
| `user_id` | INT | FOREIGN KEY (`users.user_id`) | Candidate who applied |
| `job_id` | INT | FOREIGN KEY (`jobs.job_id`) | Job being applied for |
| `application_date`| TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Submission timestamp |
| `status` | ENUM | DEFAULT 'Applied' | 'Applied', 'Shortlisted', 'Rejected' |

> **Key Integrity Constraints:**
> 1. `CONSTRAINT uq_user_job UNIQUE (user_id, job_id)` prevents candidate from submitting duplicate applications for the same job.
> 2. `ON DELETE CASCADE` on foreign keys ensures that deleting a job or user automatically purges associated applications cleanly without leaving orphan records.

---

## 5. DEFAULT CREDENTIALS

| Account Type | Email Address | Password | Role |
| :--- | :--- | :--- | :--- |
| **Portal Administrator** | `admin@jobportal.com` | `admin123` | **ADMIN** |
| **Demo Candidate 1** | `rahul.sharma@example.com` | `candidate123` | **CANDIDATE** |
| **Demo Candidate 2** | `priya.patel@example.com` | `candidate123` | **CANDIDATE** |

---

## 6. PREREQUISITES & INSTALLATION

### Required Software:
1. **Java Development Kit (JDK 17 or higher)** (JDK 22 is installed and pre-configured).
2. **MySQL Server 8.0 or higher** (installed at `C:\Program Files\MySQL\MySQL Server 8.0`).
3. **Node.js (v18 or higher)** and **npm** (v22.23.1 installed).
4. **Apache Tomcat 9 or 10** (Optional: only needed if demonstrating deployment inside Tomcat's manager).

---

## 7. STEP-BY-STEP EXECUTION GUIDE

### Step 1: Configure MySQL Password
Open the file [db.properties](file:///c:/Users/sharm/OneDrive/Desktop/JobPortalManagementSystem/db.properties) in the project root:
```properties
db.url=jdbc:mysql://localhost:3306/job_portal?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8
db.user=root
db.password=YOUR_MYSQL_ROOT_PASSWORD
```
Replace `YOUR_MYSQL_ROOT_PASSWORD` with your actual MySQL root password.

---

### Step 2: Initialize Database (`schema.sql`)
Run the 1-click batch script or command:
```cmd
init-database.bat
```
*Or execute directly via MySQL CLI / Workbench:*
```cmd
mysql -u root -p < database/schema.sql
```
This automatically creates the `job_portal` database, builds the 3 tables, applies constraints, and populates the default admin and diverse sample job records (Java Developer, Frontend Developer, Full Stack Developer, Software Engineer, Data Analyst, Python Developer, Web Developer, DevOps).

---

### Step 3: Start the Backend Server (Port 8080)
Double-click `run-backend.bat` or run in terminal:
```cmd
run-backend.bat
```
*Output will display:*
```
=======================================================
 JOB PORTAL MANAGEMENT SYSTEM - JAVA BACKEND SERVER
 Server running at: http://localhost:8080/
 REST API available at: http://localhost:8080/api/
=======================================================
```

---

### Step 4: Start the React Frontend (Port 5173)
In a new terminal window, double-click `run-frontend.bat` or run:
```cmd
run-frontend.bat
```
Open your browser and navigate to:
**http://localhost:5173**

---

### Step 5: (Alternative) Deploy `jobportal.war` on Apache Tomcat
If your professor requires deploying the WAR directly into Apache Tomcat:
1. Locate the pre-built [jobportal.war](file:///c:/Users/sharm/OneDrive/Desktop/JobPortalManagementSystem/jobportal.war) in the project root.
2. Copy `jobportal.war` into your Tomcat `webapps/` folder:
   ```cmd
   copy jobportal.war "C:\Program Files\Apache Software Foundation\Tomcat 9.0\webapps\"
   ```
3. Start Tomcat using `bin\startup.bat`.
4. Access the full application in browser at:
   **http://localhost:8080/jobportal/**

---

## 8. COMPLETE REST API SPECIFICATION

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new candidate with name, email, password |
| `POST` | `/api/auth/login` | Public | Authenticate candidate or admin; creates session |
| `POST` | `/api/auth/logout` | Authenticated | Destroys current session cookie |
| `GET` | `/api/auth/me` | Authenticated | Returns current authenticated user |
| `GET` | `/api/jobs` | Public | List all jobs with optional `title`, `location`, `jobType` filter |
| `GET` | `/api/jobs/{id}` | Public | Get single job details by ID |
| `POST` | `/api/jobs` | **Admin** | Create new job posting |
| `PUT` | `/api/jobs/{id}` | **Admin** | Update existing job posting |
| `DELETE`| `/api/jobs/{id}` | **Admin** | Delete job posting (cascades applications) |
| `POST` | `/api/applications` | **Candidate**| Submit job application (`{ jobId: 1 }`) |
| `GET` | `/api/applications/my` | **Candidate**| Retrieve all applications of logged-in candidate |
| `GET` | `/api/applications` | **Admin** | List all candidate applications with status |
| `PUT` | `/api/applications/{id}/status` | **Admin** | Update application status (`Applied`, `Shortlisted`, `Rejected`) |
| `GET` | `/api/candidate/profile` | **Candidate**| Retrieve profile details |
| `PUT` | `/api/candidate/profile` | **Candidate**| Update candidate name, email, or password |
| `GET` | `/api/candidate/dashboard` | **Candidate**| Get candidate stats (total applied, shortlisted, pending) |
| `GET` | `/api/admin/dashboard` | **Admin** | Get admin stats (jobs, candidates, applications breakdown) |
| `GET` | `/api/admin/candidates` | **Admin** | Candidate directory with search support |

---

## 9. JAVA FILE-BY-FILE TECHNICAL EXPLANATION

1. **`DBConnection.java`**:
   - Manages JDBC connection lifecycle using `DriverManager.getConnection()`.
   - Uses a tiered configuration resolution mechanism: System properties -> Environment variables -> `db.properties` -> Default fallbacks.
   - Explicitly initializes `com.mysql.cj.jdbc.Driver` via `Class.forName()`.

2. **`BCrypt.java` & `PasswordUtil.java`**:
   - Implements OpenBSD Blowfish password hashing algorithm.
   - Generates randomized cryptographic salts (16 bytes, 10 log rounds) preventing rainbow table attacks.
   - `PasswordUtil.checkPassword(plain, hash)` performs constant-time comparison to prevent timing attacks.

3. **`UserDAO.java`**:
   - Encapsulates SQL queries for `users` table using `PreparedStatement` to eliminate SQL injection vulnerabilities.
   - Implements `registerUser()`, `findUserByEmail()`, `findUserById()`, `authenticate()`, `updateProfile()`, and `getAllCandidates()`.

4. **`JobDAO.java`**:
   - Handles CRUD for `jobs` table.
   - Implements dynamic parameterized SQL generation in `searchJobs()` matching title, company, location, and employment type.

5. **`ApplicationDAO.java`**:
   - Handles application submissions with prior duplicate checking via `hasCandidateApplied()`.
   - Implements joined queries between `applications`, `users`, and `jobs` for candidate and admin dashboards.
   - Implements `updateApplicationStatus()` to advance candidates through hiring stages.

6. **`CorsFilter.java`**:
   - Intercepts all incoming HTTP requests to append required CORS response headers (`Access-Control-Allow-Origin`, `Access-Control-Allow-Credentials`, `Access-Control-Allow-Methods`).
   - Responds to preflight `OPTIONS` requests immediately with HTTP 200 OK.

7. **`AuthenticationFilter.java` & `AdminFilter.java`**:
   - Intercepts protected servlet endpoints to inspect `request.getSession(false)`.
   - Verifies whether `currentUser` exists and whether `user.role.equals("ADMIN")`. Returns HTTP 401/403 with JSON errors on unauthorized attempts.

8. **`AuthServlet.java`**:
   - Handles registration and login.
   - On successful credentials validation, creates an `HttpSession` storing the authenticated `User` object.

9. **`JobServlet.java`, `ApplicationServlet.java`, `CandidateServlet.java`, `AdminServlet.java`**:
   - Implement HTTP methods (`doGet`, `doPost`, `doPut`, `doDelete`).
   - Read JSON bodies using `JsonUtil.parseRequestBody()` and write formatted JSON responses using Google Gson.

---

## 10. AT LEAST 25 VIVA VOCE QUESTIONS & ANSWERS

### Q1: What is the main objective of this project?
**Answer**: To build an integrated, responsive full-stack Job Portal connecting job seekers with hiring companies through an administrative panel, engineered strictly using Core Java Servlets, JDBC, React, and MySQL without heavy frameworks like Spring Boot.

### Q2: Why did you use Java Servlets instead of Spring Boot?
**Answer**: Java Servlets provide a fundamental understanding of Java Enterprise Edition (EE) architecture, request-response lifecycles, HTTP method dispatching (`doGet`, `doPost`), session tracking, and filter pipelines, fulfilling the core computer science requirements without relying on framework magic.

### Q3: What is the difference between `GenericServlet` and `HttpServlet`?
**Answer**: `GenericServlet` is protocol-independent and implements the basic `Servlet` interface with `service()`. `HttpServlet` is an abstract class that extends `GenericServlet` and specifically provides HTTP protocol support with specialized methods such as `doGet()`, `doPost()`, `doPut()`, `doDelete()`, and `doOptions()`.

### Q4: Explain the life cycle of a Java Servlet.
**Answer**: 
1. **Loading and Instantiation**: The servlet container loads the servlet class and instantiates it.
2. **Initialization (`init()`)**: Executed once when the servlet is first initialized.
3. **Request Handling (`service()`)**: Executed for each incoming client request, dispatching to `doGet`, `doPost`, etc.
4. **Destruction (`destroy()`)**: Invoked once when container shuts down to release resources.

### Q5: How is JDBC used in this project?
**Answer**: Java Database Connectivity (JDBC) acts as the bridge between Java Servlets and MySQL. We use `DriverManager` to obtain `Connection` instances, `PreparedStatement` to run parameterized SQL queries, and `ResultSet` to iterate through relational database records.

### Q6: Why did you use `PreparedStatement` instead of `Statement`?
**Answer**:
1. **Security**: `PreparedStatement` automatically escapes input parameters, completely preventing SQL Injection attacks.
2. **Performance**: Pre-compiled by the database engine, allowing faster repetitive execution with varying parameter bindings.

### Q7: How are user sessions handled across React and Java Servlets?
**Answer**: We utilize Tomcat's standard `HttpSession` mechanism. When a user logs in, `request.getSession(true)` creates a session with a unique `JSESSIONID` cookie returned in the `Set-Cookie` HTTP header. The React frontend includes `credentials: 'include'` in all fetch requests so the browser automatically sends back the `JSESSIONID` cookie.

### Q8: What is CORS and how did you resolve CORS issues between React (port 5173) and Tomcat (port 8080)?
**Answer**: Cross-Origin Resource Sharing (CORS) is a browser security mechanism blocking requests from a different origin. We resolved it in two ways:
1. Created `CorsFilter.java` in Java to send `Access-Control-Allow-Origin: http://localhost:5173` and `Access-Control-Allow-Credentials: true`.
2. Configured Vite's proxy in `vite.config.js` to route `/api/*` directly to `http://localhost:8080`.

### Q9: How is password security implemented?
**Answer**: Passwords are never stored in plain text. We implemented BCrypt hashing with 10 salt rounds in `BCrypt.java` and `PasswordUtil.java`. Each password receives a unique 16-byte cryptographic salt before hashing.

### Q10: How do you prevent duplicate job applications?
**Answer**: Duplicate applications are prevented at two layers:
1. **Database Layer**: A composite unique constraint `CONSTRAINT uq_user_job UNIQUE (user_id, job_id)` in MySQL.
2. **Application DAO Layer**: `ApplicationDAO.hasCandidateApplied(userId, jobId)` checks before insertion and returns HTTP 409 Conflict if an application already exists.

### Q11: What happens to candidate applications when an admin deletes a job?
**Answer**: Because the foreign key is defined with `ON DELETE CASCADE`:
```sql
CONSTRAINT fk_application_job FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE
```
When a job is deleted, all dependent rows in the `applications` table are automatically and cleanly deleted by MySQL without leaving orphan records.

### Q12: How are roles (Candidate vs Admin) enforced?
**Answer**: Role-based access control (RBAC) is enforced on the server in `AdminFilter.java`. Even if someone attempts to call `/api/admin/*` or `/api/jobs` via Postman, the filter verifies that `session.getAttribute("currentUser").getRole().equals("ADMIN")` before allowing execution.

### Q13: What is the purpose of `web.xml`?
**Answer**: `web.xml` is the Web Application Deployment Descriptor in Java EE. It declares servlet mappings (e.g. `/api/auth/*` -> `AuthServlet`), filter pipelines (`CorsFilter`, `AdminFilter`), and session timeout settings.

### Q14: What is a `.war` file?
**Answer**: A Web Application Archive (`.war`) is a packaged JAR file containing compiled Java bytecode (`WEB-INF/classes`), libraries (`WEB-INF/lib`), deployment descriptor (`WEB-INF/web.xml`), and frontend assets, structured for standard deployment on Java Servlet containers like Apache Tomcat.

### Q15: How does React communicate with Java Servlets?
**Answer**: React components call asynchronous functions defined in `api.js` using `fetch()`. The Servlets parse incoming JSON using `JsonUtil.readRequestBody()` and return JSON responses serialized with Google Gson.

### Q16: What is the role of `try-with-resources` in JDBC?
**Answer**: Introduced in Java 7, `try-with-resources` automatically closes any resource implementing `AutoCloseable` (such as `Connection`, `PreparedStatement`, and `ResultSet`) at the end of the block, preventing database connection leaks even if an SQL exception occurs.

### Q17: What HTTP status codes are used in your REST endpoints?
**Answer**:
- `200 OK`: Successful retrieval or update.
- `201 Created`: Successful creation of user, job, or application.
- `400 Bad Request`: Validation failure or missing required fields.
- `401 Unauthorized`: Not logged in or invalid credentials.
- `403 Forbidden`: Authenticated user lacks required role (e.g. Candidate calling Admin endpoint).
- `404 Not Found`: Job, application, or endpoint not found.
- `409 Conflict`: Duplicate email registration or duplicate job application.
- `500 Internal Server Error`: Unexpected database or server exception.

### Q18: What is the difference between `doGet` and `doPost`?
**Answer**: `doGet` is idempotent and used for retrieving data without mutating state; parameters are sent in the URL query string. `doPost` is non-idempotent and used for submitting data (registration, login, application); payload is sent in the HTTP request body.

### Q19: How did you ensure passwords are not exposed in API responses?
**Answer**: In the `User.java` model, the `password` field is declared as `private transient String password`. When Gson serializes a `User` object into JSON, the `transient` keyword instructs Gson to skip the password field completely.

### Q20: Explain the candidate workflow in your application.
**Answer**:
1. Candidate registers at `/register`.
2. Candidate logs in at `/login` and is redirected to `/candidate/dashboard`.
3. Candidate searches and filters jobs at `/jobs`.
4. Candidate views details at `/jobs/:id` and clicks **Apply Now**.
5. Application is persisted in MySQL with status `Applied`.
6. Candidate monitors progress under **My Applications** (`Applied` -> `Shortlisted` or `Rejected`).

### Q21: Explain the admin workflow in your application.
**Answer**:
1. Admin logs in with `admin@jobportal.com` / `admin123` at `/admin/login`.
2. Admin views metrics on `/admin/dashboard` (Total Jobs, Applications, Status Distribution).
3. Admin posts or edits openings under `/admin/jobs`.
4. Admin reviews candidacies under `/admin/applications` and clicks **Shortlist** or **Reject**.
5. Candidate dashboard immediately reflects the updated status.

### Q22: What design patterns did you use in this project?
**Answer**:
- **DAO (Data Access Object) Pattern**: Separating database persistence operations (`UserDAO`, `JobDAO`, `ApplicationDAO`) from servlet controller logic.
- **MVC (Model-View-Controller) Pattern**: Model (`User`, `Job`), View (React UI), Controller (`HttpServlet` classes).
- **Singleton / Factory Pattern**: `DBConnection.getConnection()` centralized database connection management.
- **Intercepting Filter Pattern**: `CorsFilter` and `AuthenticationFilter` intercepting requests before reaching servlets.

### Q23: Why is React used for the frontend instead of JSP?
**Answer**: React provides a modern Single Page Application (SPA) architecture with virtual DOM diffing, component reusability, seamless state management, and superior UI responsiveness without requiring full-page browser reloads for every user interaction.

### Q24: What is the purpose of `Statement.RETURN_GENERATED_KEYS` in JDBC?
**Answer**: When an `INSERT` statement executes on a table with an `AUTO_INCREMENT` primary key, `RETURN_GENERATED_KEYS` instructs JDBC to retrieve the generated ID immediately, allowing the model object to be populated with its new ID without executing an additional SQL query.

### Q25: Can this application run without installing external Apache Tomcat?
**Answer**: Yes. We developed `DevServer.java` using Java SE's built-in `com.sun.net.httpserver.HttpServer`. It runs on port 8080 and handles all REST API routing through the exact same JDBC DAO layer, while `jobportal.war` is also provided for standard Apache Tomcat deployment.

---

## 11. SHORT PRESENTATION SCRIPT (PROJECT VIVA DEFENSE)

> **"Respected Evaluators and Faculty Members, Good morning.**
>
> Today, I am proud to present our final year capstone project: **'Job Portal Management System'**.
>
> In today's competitive job market, candidate-recruiter coordination is often fragmented. Our system bridges this gap by providing an end-to-end, responsive web platform that connects job seekers with hiring companies through an administrative management panel.
>
> **Technology Stack & Architecture:**
> Rather than relying on high-level frameworks like Spring Boot where business logic is obscured behind annotations, we intentionally built our backend using **Core Java, Java Servlets (`HttpServlet`), and JDBC**. 
>
> Our backend follows the **MVC and DAO architectural patterns**:
> - **Servlets** act as REST controllers handling HTTP requests and sessions.
> - **DAOs** execute safe, parameterized SQL queries using `PreparedStatement` to prevent SQL Injection.
> - **BCrypt** hashing secures all candidate and administrator credentials.
> - **MySQL** enforces referential integrity through foreign key cascades and composite unique constraints that prevent duplicate applications.
>
> On the frontend, we created a responsive **React.js Single Page Application** inspired by LinkedIn and Indeed, featuring real-time job searching, multi-criteria filtering, candidate application tracking, and an administrative control panel.
>
> **Live Demonstration:**
> Now, I would like to demonstrate our key workflows:
> 1. Candidate registration, authentication, and session cookie validation.
> 2. Searching and filtering jobs by keyword, location, and job type.
> 3. One-click job application with duplicate submission prevention.
> 4. Administrator login, real-time analytics dashboard, job CRUD operations, and shortlisting candidate applications.
>
> Thank you, and I look forward to your questions."
