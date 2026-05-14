# JobBoard Pro - User Guide

Welcome to JobBoard Pro! This guide explains how to use the platform once the development servers are up and running (see `README.md` for startup instructions).

## 🏢 For Hiring Managers (HR)

**1. Posting a New Job**
* Navigate to the homepage at `http://localhost:3000`.
* Click the **"+ Post a Job"** button in the top right navigation bar.
* Fill out the form details (Title, Salary, Required Skills, Deadline, etc.) and submit. The job will instantly appear on the "Open Roles" page.

**2. Managing Candidates (The Pipeline)**
* Click **"View & Apply"** on any job you have created.
* To view the applicants for that specific job, navigate to the pipeline view: `http://localhost:3000/jobs/[ID]/applications` (replace `[ID]` with the job's ID number).
* Here, you can review candidates and use the workflow buttons to move them through the pipeline. 
* **Workflow Rules:** Candidates must move sequentially (**Pending** ➡️ **Shortlisted** ➡️ **Offered**). You can **Reject** a candidate at any time. *Note: You must type a note in the text box before changing a status!*

**3. Viewing Analytics**
* Click **"Dashboard"** in the top navigation bar.
* This page provides a real-time, database-driven overview of platform metrics, including Total Jobs, Open Jobs, Average Applications per Job, and your Top Hiring Department.

**4. Closing a Job**
* To simulate manually closing a job, use the FastAPI interactive docs (`http://localhost:8000/docs`). 
* Execute the `PATCH /api/jobs/{id}/close` endpoint.
* **System Automation:** Closing a job automatically hides it from the frontend listings and automatically moves any candidates still in the "Pending" stage to "Rejected".

---

## 🧑‍💻 For Job Seekers (Applicants)

**1. Browsing and Filtering**
* Visit the homepage to view all open, active roles. 
* Use the **Filter Bar** at the top of the page to search for specific Departments, Locations (e.g., "Remote"), or Required Skills. The pagination will automatically adjust based on your search.

**2. Applying to a Role**
* Click **"View & Apply"** on any job card to read the full description.
* Fill out the candidate form at the bottom of the page.
* **Application Rules:** * You can only apply to a specific job once per email address. 
  * If the job has reached its "Max Applicants" cap, or if the deadline has passed, your submission will be safely blocked by the system.