
package jobportal;

import java.util.List;
import java.util.Scanner;

public class Main {

    static Scanner sc = new Scanner(System.in);

    static JobDAO jobDAO = new JobDAO();

    static ApplicationDAO applicationDAO =
        new ApplicationDAO();

    public static void main(String[] args) {

        while (true) {

            System.out.println("\n================================");
            System.out.println("     JOB PORTAL MANAGEMENT");
            System.out.println("================================");

            System.out.println("1. Candidate Module");
            System.out.println("2. Admin Module");
            System.out.println("3. Exit");

            System.out.print("Enter your choice: ");

            int choice = readInt();

            switch (choice) {

                case 1:
                    candidateMenu();
                    break;

                case 2:
                    adminLogin();
                    break;

                case 3:
                    System.out.println("Thank you for using Job Portal!");
                    sc.close();
                    return;

                default:
                    System.out.println("Invalid Choice!");
            }
        }
    }

    // Candidate menu
    public static void candidateMenu() {

        while (true) {

            System.out.println("\n===== CANDIDATE MENU =====");

            System.out.println("1. View All Jobs");
            System.out.println("2. Search Jobs");
            System.out.println("3. Apply For Job");
            System.out.println("4. Back");

            System.out.print("Enter choice: ");

            int choice = readInt();

            switch (choice) {

                case 1:
                    displayJobs(jobDAO.getAllJobs());
                    break;

                case 2:
                    System.out.print("Enter job title: ");
                    String keyword = sc.nextLine();

                    displayJobs(jobDAO.searchJobs(keyword));
                    break;

                case 3:
                    System.out.print("Enter Job ID: ");
                    int jobId = readInt();

                    System.out.print("Enter your name: ");
                    String name = sc.nextLine();

                    System.out.print("Enter your email: ");
                    String email = sc.nextLine();

                    if (!email.matches(
                        "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
                    )) {
                        System.out.println("Invalid email address!");
                        break;
                    }

                    applicationDAO.applyForJob(
                        jobId, name, email
                    );
                    break;

                case 4:
                    return;

                default:
                    System.out.println("Invalid Choice!");
            }
        }
    }

    // Admin login
    public static void adminLogin() {

        System.out.print("Enter Admin Password: ");

        String password = sc.nextLine();

        if (password.equals("admin123")) {

            System.out.println("Login Successful!");

            adminMenu();

        } else {

            System.out.println("Incorrect Password!");
        }
    }

    // Admin menu
    public static void adminMenu() {

        while (true) {

            System.out.println("\n===== ADMIN MENU =====");

            System.out.println("1. Add New Job");
            System.out.println("2. View All Jobs");
            System.out.println("3. Delete Job");
            System.out.println("4. View Applications");
            System.out.println("5. Logout");

            System.out.print("Enter choice: ");

            int choice = readInt();

            switch (choice) {

                case 1:

                    System.out.print("Enter Job Title: ");
                    String title = sc.nextLine();

                    System.out.print("Enter Company: ");
                    String company = sc.nextLine();

                    System.out.print("Enter Location: ");
                    String location = sc.nextLine();

                    System.out.print("Enter Salary: ");
                    String salary = sc.nextLine();

                    System.out.print("Enter Description: ");
                    String description = sc.nextLine();

                    Job job = new Job(
                        0, title, company,
                        location, salary, description
                    );

                    jobDAO.addJob(job);
                    break;

                case 2:
                    displayJobs(jobDAO.getAllJobs());
                    break;

                case 3:

                    System.out.print("Enter Job ID to delete: ");

                    int id = readInt();

                    jobDAO.deleteJob(id);
                    break;

                case 4:
                    applicationDAO.viewApplications();
                    break;

                case 5:
                    System.out.println("Admin Logged Out!");
                    return;

                default:
                    System.out.println("Invalid Choice!");
            }
        }
    }

    // Display job list
    public static void displayJobs(List<Job> jobs) {

        if (jobs.isEmpty()) {
            System.out.println("No Jobs Found!");
            return;
        }

        for (Job job : jobs) {
            job.displayJob();
        }
    }

    // Read integer safely
    public static int readInt() {

        while (true) {

            try {
                int value = Integer.parseInt(sc.nextLine());
                return value;

            } catch (NumberFormatException e) {
                System.out.print("Enter a valid number: ");
            }
        }
    }
}
