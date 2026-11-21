package com.jobportal.model;

import java.util.List;

/**
 * DTO for Dashboard Statistics
 */
public class DashboardStats {
    // Admin metrics
    private int totalJobs;
    private int totalCandidates;
    private int totalApplications;
    private int pendingApplications;
    private int shortlistedApplications;
    private int rejectedApplications;

    // Candidate metrics
    private int candidateTotalApplications;
    private int candidateShortlistedCount;
    private int candidateRejectedCount;
    private int candidatePendingCount;

    // Recent items
    private List<Application> recentApplications;
    private List<Job> recentJobs;

    public DashboardStats() {
    }

    public int getTotalJobs() {
        return totalJobs;
    }

    public void setTotalJobs(int totalJobs) {
        this.totalJobs = totalJobs;
    }

    public int getTotalCandidates() {
        return totalCandidates;
    }

    public void setTotalCandidates(int totalCandidates) {
        this.totalCandidates = totalCandidates;
    }

    public int getTotalApplications() {
        return totalApplications;
    }

    public void setTotalApplications(int totalApplications) {
        this.totalApplications = totalApplications;
    }

    public int getPendingApplications() {
        return pendingApplications;
    }

    public void setPendingApplications(int pendingApplications) {
        this.pendingApplications = pendingApplications;
    }

    public int getShortlistedApplications() {
        return shortlistedApplications;
    }

    public void setShortlistedApplications(int shortlistedApplications) {
        this.shortlistedApplications = shortlistedApplications;
    }

    public int getRejectedApplications() {
        return rejectedApplications;
    }

    public void setRejectedApplications(int rejectedApplications) {
        this.rejectedApplications = rejectedApplications;
    }

    public int getCandidateTotalApplications() {
        return candidateTotalApplications;
    }

    public void setCandidateTotalApplications(int candidateTotalApplications) {
        this.candidateTotalApplications = candidateTotalApplications;
    }

    public int getCandidateShortlistedCount() {
        return candidateShortlistedCount;
    }

    public void setCandidateShortlistedCount(int candidateShortlistedCount) {
        this.candidateShortlistedCount = candidateShortlistedCount;
    }

    public int getCandidateRejectedCount() {
        return candidateRejectedCount;
    }

    public void setCandidateRejectedCount(int candidateRejectedCount) {
        this.candidateRejectedCount = candidateRejectedCount;
    }

    public int getCandidatePendingCount() {
        return candidatePendingCount;
    }

    public void setCandidatePendingCount(int candidatePendingCount) {
        this.candidatePendingCount = candidatePendingCount;
    }

    public List<Application> getRecentApplications() {
        return recentApplications;
    }

    public void setRecentApplications(List<Application> recentApplications) {
        this.recentApplications = recentApplications;
    }

    public List<Job> getRecentJobs() {
        return recentJobs;
    }

    public void setRecentJobs(List<Job> recentJobs) {
        this.recentJobs = recentJobs;
    }
}
