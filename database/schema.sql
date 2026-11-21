-- ========================================================
-- JOB PORTAL MANAGEMENT SYSTEM - DATABASE SCHEMA
-- Core Java, Servlets, JDBC, MySQL & React Full-Stack Project
-- ========================================================

-- ========================================================
-- 1. TABLE: users
-- Stores both Candidate and Admin accounts
-- Passwords are encrypted using BCrypt ($2a$10$...)
-- ========================================================
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('CANDIDATE', 'ADMIN') NOT NULL DEFAULT 'CANDIDATE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ========================================================
-- 2. TABLE: jobs
-- Stores job postings created and managed by Admin
-- ========================================================
CREATE TABLE IF NOT EXISTS jobs (
    job_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    company VARCHAR(150) NOT NULL,
    location VARCHAR(100) NOT NULL,
    salary VARCHAR(100) NOT NULL,
    job_type VARCHAR(50) NOT NULL DEFAULT 'Full Time',
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_jobs_title (title),
    INDEX idx_jobs_location (location),
    INDEX idx_jobs_job_type (job_type)
) ENGINE=InnoDB;

-- ========================================================
-- 3. TABLE: applications
-- Stores job applications submitted by candidates
-- Unique constraint prevents duplicate applications
-- ========================================================
CREATE TABLE IF NOT EXISTS applications (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    job_id INT NOT NULL,
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Applied', 'Shortlisted', 'Rejected') NOT NULL DEFAULT 'Applied',
    CONSTRAINT fk_application_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_application_job FOREIGN KEY (job_id) 
        REFERENCES jobs(job_id) ON DELETE CASCADE,
    CONSTRAINT uq_user_job UNIQUE (user_id, job_id),
    INDEX idx_applications_user (user_id),
    INDEX idx_applications_job (job_id)
) ENGINE=InnoDB;

-- ========================================================
-- 4. SEED DATA (Default Admin and Candidates)
-- Default Admin: admin@jobportal.com / admin123
-- Sample Candidates: rahul.sharma@example.com, priya.patel@example.com / candidate123
-- ========================================================
INSERT IGNORE INTO users (name, email, password, role) VALUES 
('System Admin', 'admin@jobportal.com', '$2a$10$np0qkIO.BYbULH4fVafvyusC79ExDVc3fI2fOkWtduNkOILbEpTZe', 'ADMIN'),
('Rahul Sharma', 'rahul.sharma@example.com', '$2a$10$DD.m/LHfyFwHQTcsxxa7nO8YDWRTve9Hojw99w4hdjgjInM0299iC', 'CANDIDATE'),
('Priya Patel', 'priya.patel@example.com', '$2a$10$DD.m/LHfyFwHQTcsxxa7nO8YDWRTve9Hojw99w4hdjgjInM0299iC', 'CANDIDATE');

-- Note: The BCrypt hash above matches passwords hashed via jBCrypt for 'admin123' and 'candidate123'.

-- ========================================================
-- 5. SAMPLE JOB LISTINGS
-- Diverse IT categories with realistic details
-- ========================================================
INSERT INTO jobs (title, company, location, salary, job_type, description, requirements) VALUES
(
    'Java Developer',
    'Infosys Ltd',
    'Bangalore, India',
    '₹6,50,000 - ₹9,00,000 P.A.',
    'Full Time',
    'We are seeking a talented Java Developer to design, implement, and maintain high-volume, low-latency enterprise applications. You will collaborate with cross-functional teams to build robust web services, optimize SQL queries, and ensure maximum performance.',
    'Strong knowledge of Core Java (OOP, Collections, Multithreading), Servlets, JDBC, and SQL. Understanding of RESTful architecture, Git, and Maven. Bachelor\'s degree in Computer Science or related field.'
),
(
    'Frontend Developer (React.js)',
    'TCS Digital',
    'Hyderabad, India',
    '₹6,00,000 - ₹8,50,000 P.A.',
    'Full Time',
    'Looking for a passionate React.js Developer to build responsive user interfaces for modern web applications. You will translate wireframes into clean, reusable React components and integrate with RESTful backend APIs.',
    'Proficiency in React.js, JavaScript (ES6+), HTML5, CSS3, React Router, and state management. Experience consuming REST APIs and writing modular UI components.'
),
(
    'Full Stack Java Developer',
    'Wipro Technologies',
    'Pune, India',
    '₹8,00,000 - ₹12,00,000 P.A.',
    'Full Time',
    'Join our innovative engineering team as a Full Stack Developer. You will be responsible for end-to-end development, connecting dynamic React frontend dashboards with reliable Java Servlet and JDBC backend architectures.',
    'Strong skills in Java, Servlets, JDBC, MySQL, HTML5/CSS3, and modern React. Good understanding of database indexing, session management, and HTTP protocols.'
),
(
    'Software Engineer',
    'Cognizant',
    'Chennai, India',
    '₹5,50,000 - ₹7,50,000 P.A.',
    'Full Time',
    'Responsible for analyzing system specifications, debugging code, unit testing, and developing new business logic modules for enterprise client platforms.',
    'Solid foundation in Data Structures, Algorithms, Core Java, and Relational Database Systems. Excellent problem-solving and communication skills.'
),
(
    'Data Analyst',
    'Accenture Solutions',
    'Gurgaon, India',
    '₹6,00,000 - ₹8,00,000 P.A.',
    'Remote',
    'Seeking an analytical mindset to inspect, clean, transform, and model data. You will work closely with management to provide key business metrics and data-driven recommendations.',
    'Expertise in SQL, Excel, and Python for data analysis. Understanding of relational database schemas and data visualization tools like Power BI or Tableau.'
),
(
    'Python Developer',
    'Zoho Corporation',
    'Bangalore, India',
    '₹7,00,000 - ₹10,50,000 P.A.',
    'Full Time',
    'Design and develop backend services, automation scripts, and data processing pipelines. Collaborate with frontend engineers to expose clean endpoints.',
    'Strong command of Python, OOP concepts, SQL database design, and API development. Familiarity with Linux environments and version control (Git).'
),
(
    'Web Developer',
    'Tech Mahindra',
    'Noida, India',
    '₹5,00,000 - ₹7,00,000 P.A.',
    'Full Time',
    'Design and maintain engaging responsive corporate websites and customer portals. Work with modern JavaScript, CSS frameworks, and semantic HTML5.',
    'Expertise in HTML5, CSS3, JavaScript, Bootstrap/Tailwind, and REST APIs. Experience with cross-browser compatibility and web performance optimization.'
),
(
    'DevOps & Cloud Engineer',
    'HCL Technologies',
    'Bangalore, India',
    '₹9,00,000 - ₹13,50,000 P.A.',
    'Remote',
    'Manage cloud infrastructure, CI/CD deployment pipelines, automated monitoring, and Apache Tomcat application server configurations.',
    'Experience with Linux, Docker, AWS/Azure, CI/CD tools, Tomcat server administration, and shell scripting. Strong troubleshooting skills.'
);

-- ========================================================
-- 6. SAMPLE APPLICATIONS
-- Pre-populating some applications for demonstration
-- ========================================================
INSERT IGNORE INTO applications (user_id, job_id, status) VALUES
(2, 1, 'Shortlisted'),
(2, 3, 'Applied'),
(3, 2, 'Applied'),
(3, 4, 'Rejected');
