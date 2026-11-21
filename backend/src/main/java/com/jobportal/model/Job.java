package com.jobportal.model;

import java.sql.Timestamp;

/**
 * Job Entity Model
 * Represents job postings created by Admin and browsed by Candidates.
 */
public class Job {
    private int jobId;
    private String title;
    private String company;
    private String location;
    private String salary;
    private String jobType; // e.g. Full Time, Part Time, Remote, Internship
    private String description;
    private String requirements;
    private Timestamp createdAt;

    public Job() {
    }

    public Job(int jobId, String title, String company, String location, String salary, 
               String jobType, String description, String requirements, Timestamp createdAt) {
        this.jobId = jobId;
        this.title = title;
        this.company = company;
        this.location = location;
        this.salary = salary;
        this.jobType = jobType;
        this.description = description;
        this.requirements = requirements;
        this.createdAt = createdAt;
    }

    // Simplified constructor compatible with existing project
    public Job(int jobId, String title, String company, String location, String salary, String description) {
        this(jobId, title, company, location, salary, "Full Time", description, "General technical requirements", null);
    }

    public int getJobId() {
        return jobId;
    }

    public void setJobId(int jobId) {
        this.jobId = jobId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getSalary() {
        return salary;
    }

    public void setSalary(String salary) {
        this.salary = salary;
    }

    public String getJobType() {
        return jobType != null ? jobType : "Full Time";
    }

    public void setJobType(String jobType) {
        this.jobType = jobType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getRequirements() {
        return requirements;
    }

    public void setRequirements(String requirements) {
        this.requirements = requirements;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
}
