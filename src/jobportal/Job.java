
package jobportal;

public class Job {

    private int jobId;
    private String title;
    private String company;
    private String location;
    private String salary;
    private String description;

    public Job(int jobId, String title, String company,
               String location, String salary,
               String description) {

        this.jobId = jobId;
        this.title = title;
        this.company = company;
        this.location = location;
        this.salary = salary;
        this.description = description;
    }

    public int getJobId() {
        return jobId;
    }

    public String getTitle() {
        return title;
    }

    public String getCompany() {
        return company;
    }

    public String getLocation() {
        return location;
    }

    public String getSalary() {
        return salary;
    }

    public String getDescription() {
        return description;
    }

    public void displayJob() {

        System.out.println("------------------------------");
        System.out.println("Job ID: " + jobId);
        System.out.println("Title: " + title);
        System.out.println("Company: " + company);
        System.out.println("Location: " + location);
        System.out.println("Salary: " + salary);
        System.out.println("Description: " + description);
        System.out.println("------------------------------");
    }
}
