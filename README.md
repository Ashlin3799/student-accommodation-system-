# Student Accommodation Management System — Sprint 1

A Node.js + Express + MongoDB application covering all six Sprint 1 modules:
Authentication & Access Control, Admin Review & Approval, Complaint Module,
Reporting & Dashboard, Application Module, and Room Management.

This is a cleaned-up version of the Sprint 1 codebase — a handful of bugs
found during integration testing (a server-crashing require path, a
hardcoded login bypass, a scoping bug in the admin dashboard script, a
mismatched sort parameter, and some duplicate/dead files) have been fixed,
and a registration page was added so the app is fully usable from the
browser with no manual API calls required.

## Prerequisites

- **Node.js** (v18 or newer) — check with `node -v`
- **MongoDB** running locally on `127.0.0.1:27017`, OR a free
  [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   A working `.env` file is already included, pointing at a local MongoDB
   instance:
   ```
   PORT=3000
   MONGO_URI=mongodb://127.0.0.1:27017/student_accommodation
   JWT_SECRET=dev-secret-change-me
   ```
   - If you're using **MongoDB Compass / a local install**, just make sure
     the MongoDB service is running — the included `.env` will work as-is.
   - If you're using **MongoDB Atlas**, replace the `MONGO_URI` line with
     your Atlas connection string.
   - Change `JWT_SECRET` to anything you like before sharing this beyond
     your own machine.

3. **(Optional) Seed sample room data**
   ```bash
   npm run seed
   ```
   Populates the `rooms` collection with 10 sample rooms so the room
   directory isn't empty on first load.

4. **Start the server**
   ```bash
   npm start
   ```
   or, for auto-restart on file changes during development:
   ```bash
   npm run dev
   ```
   You should see:
   ```
   MongoDB connected successfully
   Server running on http://localhost:3000
   ```

5. **Open the app**
   Go to `http://localhost:3000` in your browser.

## Using the app

- **Register** a new account at `/register.html` (choose "Student" or
  "Admin" as the account type), or use the link on the login page.
- **Log in** at `/login.html` — students are redirected to
  `/student/dashboard.html`, admins to `/admin/dashboard.html`.
- **Browse rooms** at `/index.html` — search, filter by type/status/price,
  and sort.
- **Apply for a room / track status** at `/application.html`.
- **File or view complaints** at `/complaints.html`.
- **Admin dashboard** (`/admin/dashboard.html`) shows live room, application,
  and complaint statistics, plus a list of submitted applications with
  Approve/Reject actions.

## Module → API reference

| Module | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login` |
| Rooms | `GET /api/rooms` (supports `search`, `type`, `status`, `minPrice`, `maxPrice`, `sort`), `GET /api/rooms/:id`, `POST /api/rooms` |
| Applications | `POST /api/applications`, `GET /api/applications/:studentId`, `GET /api/applications`, `PATCH /api/applications/:id` |
| Complaints | `POST /api/complaints`, `GET /api/complaints`, `GET /api/complaints/student/:studentId`, `GET /api/complaints/:id` |
| Dashboard | `GET /api/dashboard/stats` (admin-only, requires a Bearer token) |

## Notes for teammates

- The `.env` file is included here for convenience so this runs immediately
  on a fresh clone — in a real production setting you'd keep `.env` out of
  version control (see `.gitignore`) and share secrets separately.
- `src/config/db.js` exists as an alternative Mongo connection helper with
  retry logic but isn't currently wired into `server.js` — feel free to use
  it in Sprint 2 if you want reconnect behaviour.
