# JobBoard Pro - User Guide

This guide covers the core features of JobBoard Pro.

## Feature 1: Post a Job Listing
Navigate to `http://localhost:3000/jobs/new`.
Fill in the title, department, description, salary range, and deadline. 
*Note: salary_min must be less than salary_max.*

## Feature 2: Browse & Search Jobs
The homepage (`/`) displays all open listings.
- Use the **Search** input to filter by skills.
- Use **Dropdowns** to filter by Department and Location.
- Use **Pagination** at the bottom to navigate results.

## Feature 3: Apply to a Job
Click on any job card to see details.
Fill the application form with your name, email, experience, and CV summary.
*Note: You cannot apply if the deadline has passed or the job is closed.*

## Feature 4: Application Status Workflow
Navigate to the Job Details page and click **"Pipeline Overview"**.
Here you can see all applicants.
- Click an applicant to see details.
- Add a **Note** (required).
- Use buttons to move status: `Shortlist` -> `Make Offer` or `Reject`.

## Feature 5: Job Analytics
Navigate to `http://localhost:3000/dashboard`.
View live stats:
- Total/Open/Closed Jobs
- Total Applications
- Top Department

## Feature 6: Close a Job
On the Application Pipeline page (`/jobs/[id]/applications`), click the **"Close Job"** button.
- This will reject all remaining `pending` applications automatically.
- No new applications will be accepted for this job.

---

### Example cURL (Create Job)
```bash
curl -X POST "http://localhost:8000/api/jobs" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Backend Developer",
       "department": "Engineering",
       "description": "FastAPI expert needed",
       "location": "remote",
       "salary_min": 50000,
       "salary_max": 80000,
       "required_skills": ["Python", "FastAPI"],
       "deadline": "2024-12-31"
     }'
```
