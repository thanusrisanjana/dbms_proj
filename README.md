# AttendEase 

This is a Next.js application for managing student attendance, built within Firebase Studio.

## Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:9002`.

## Simulated Authentication

This application uses a **simulated authentication** system stored in `localStorage` for demonstration purposes. **No actual database or backend authentication is implemented yet.**

**Credentials:**

*   **Admin:**
    *   Email: `admin@example.com`
    *   Password: any 6+ characters
*   **Teacher:**
    *   Email: `teacher@example.com`
    *   Password: any 6+ characters
*   **Student:**
    *   Email: `student@example.com` (or any other `@example.com` email)
    *   Password: any 6+ characters

You can switch roles by logging out and logging in with a different `@example.com` email prefix. The "Register" page also allows simulating the creation of Student or Teacher accounts (using `@example.com` emails).

## Features (Role-Based)

*   **Admin:**
    *   View Dashboard stats (overall).
    *   Manage Attendance (mark, view, export).
    *   Manage Students (CRUD operations).
    *   Review Absence Explanations (Approve/Reject).
    *   Manage Users (CRUD operations for non-admins).
*   **Teacher:**
    *   View Dashboard stats (overall).
    *   Manage Attendance (mark, view, export).
    *   View Students (Read-only).
    *   Review Absence Explanations (Approve/Reject).
*   **Student:**
    *   View Dashboard stats (personal).
    *   View Personal Attendance records.
    *   Submit and View Personal Absence Explanations.
    *   View Personal Profile (basic).

## Database

**Currently, this application does not use a database (like MongoDB or Firestore).** All data displayed (students, users, attendance, absences) is placeholder data defined directly in the component files or generated dynamically for simulation. Saving actions (like marking attendance, adding users, submitting absences) are logged to the console but do not persist beyond the current session state.

## Next Steps (Potential)

*   Integrate MongoDb Authentication.
*   Connect to a database to persist data.
*   Implement real file uploads for absence documents (e.g., to Cloud Storage) using multer.
*   Refine role-based permissions and data fetching.
*   Add more detailed reporting features.
*   Implement notifications (e.g., for teachers when an absence is submitted).
