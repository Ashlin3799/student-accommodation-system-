# Student Accommodation Management System — Sprint 1 & Sprint 2

A Node.js + Express + MongoDB application for the SIT725 Student Accommodation Management System. The project includes Authentication & Access Control, Admin Review & Approval, Complaint Management, Reporting & Dashboard, Application Management, and Room Management. Sprint 2 extends the working MVP with complaint status management, admin complaint integration, search/filtering, testing, and final integration improvements.

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
- **File or view complaints** at `/complaints.html`. Students can submit complaints and view their latest stored status.
- **Manage complaints as an admin** at `/admin/complaints.html`. Admins can search/filter complaints and update individual complaint statuses to Pending, In Progress, or Resolved.
- **Admin dashboard** (`/admin/dashboard.html`) shows live room, application, and complaint statistics, plus submitted applications with Approve/Reject actions.

## Module → API reference

| Module | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login` |
| Rooms | `GET /api/rooms` (supports `search`, `type`, `status`, `minPrice`, `maxPrice`, `sort`), `GET /api/rooms/:id`, `POST /api/rooms` |
| Applications | `POST /api/applications`, `GET /api/applications/:studentId`, `GET /api/applications`, `PATCH /api/applications/:id` |
| Complaints | `POST /api/complaints`, `GET /api/complaints`, `GET /api/complaints/student/:studentId`, `GET /api/complaints/:id`, `PATCH /api/complaints/:id/status`, `PATCH /api/complaints/student/:studentId/status` |
| Dashboard | `GET /api/dashboard/stats` (admin-only, requires a Bearer token) |

## Notes for teammates

- The `.env` file is included here for convenience so this runs immediately
  on a fresh clone — in a real production setting you'd keep `.env` out of
  version control (see `.gitignore`) and share secrets separately.
- `src/config/db.js` exists as an alternative Mongo connection helper with
  retry logic but isn't currently wired into `server.js` — feel free to use
  it in Sprint 2 if you want reconnect behaviour.

# Room Management Module - Sanika

This is my part of the group project for Sprint 1 — the Room Management module of the student accommodation system. This document covers what I built, how it works, and how I tested it.

## Overview

Rooms are stored in MongoDB, with fields covering the room number, building, floor, type, capacity, current occupancy, price, currency, status (available, occupied, reserved, or maintenance), amenities, images, and a description. The API allows the rest of the app to create rooms, list and filter them, look up a single room, update one, or delete one.

Most of the validation is handled directly in the Mongoose schema rather than in the route code — room numbers must be unique, capacity must be at least 1, price can't be negative, and status has to be one of a fixed set of values. Keeping validation in the schema means there's a single source of truth for what counts as a valid room, instead of duplicating those checks across different route handlers.

## Endpoints

* **`GET /api/rooms`** — lists rooms. Supports filtering by `type`, `status`, and a price range (`minPrice`/`maxPrice`), a `search` param that does a case-insensitive match across room number, building, and amenities, and a `sort` param (e.g. `price_asc`).
* **`GET /api/rooms/:id`** — returns a single room, or a 404 if it doesn't exist.
* **`POST /api/rooms`** — creates a room. Rejects the request if required fields are missing, and fills in sensible defaults for anything optional (occupied starts at 0, currency defaults to USD, status defaults to available, amenities/images/description default to empty). If Mongoose raises a validation error — an invalid status, a negative capacity or price — it comes back as a 400. If the room number already exists, MongoDB raises a duplicate-key error, which gets translated into a 409.
* **`PUT /api/rooms/:id`** — applies a partial update. It won't let `occupied` exceed `capacity`, returns a 404 if the room doesn't exist, and a 400 if the request doesn't contain any recognised fields.
* **`DELETE /api/rooms/:id`** — deletes a room, returning a 404 if it isn't found.

## Testing

I wrote a Jest and Supertest suite in `tests/room.test.js` — 18 tests, all passing. It runs against a mocked Room model rather than a live database, so it's fast and doesn't depend on MongoDB being available.

One decision worth explaining: I didn't rely on Jest's automatic mocking (`jest.mock('../src/models/Room')`) on its own. Automocking doesn't reliably pick up methods on Mongoose models — things like `find` or `create` can end up `undefined` instead of proper mock functions, which causes tests to fail in confusing ways that have nothing to do with the actual logic being tested. Instead, I wrote the mock explicitly, defining each method as a `jest.fn()`, which guarantees every method exists and lets me control exactly what it returns in each test.

The suite covers:

* listing rooms with no filters, and with type, status, and price filters combined
* the search behaviour across multiple fields
* sorting
* 404 responses when getting, updating, or deleting a room that doesn't exist
* missing required fields on creation
* schema validation errors — invalid status, negative capacity, negative price
* duplicate room numbers, returning a 409
* the rule that occupied can't exceed capacity on update
* rejecting updates that contain no valid fields
* successful create, update, and delete operations with the correct defaults applied

To run it:


npm install
npm test

This should show 18 tests passing.

One important clarification: these tests run entirely in the terminal. They don't touch a real database and won't appear anywhere in the browser. To see the module actually working against real data, you run `npm start` and open `localhost:3000/index.html`. The two are separate forms of evidence — the tests confirm the logic and error handling in isolation, and the browser shows it working end to end.

## Integration with the rest of the project

The frontend's room search and listing page calls `GET /api/rooms` using the same filter and sort parameters described above. Errors are handled through the shared `errorHandler.js` middleware used across the whole app, so a 400 or 404 from this module looks consistent with errors from any other module in the project. The seed data for a room also matches the shape that other modules — bookings, for example — expect when referencing a room by its ID.

## Key Files

The main files for this module are:


src/
├── models/
│   └── Room.js
├── routes/
│   └── room.js
└── controllers/
    └── roomController.js

tests/
├── room.test.js
└── testApp.js

seed/
└── seedRooms.js

# Complaint Module - Clive

## Overview

The Complaint Module is Clive's contribution to the Student Accommodation Management System. It supports the complete complaint workflow between students and administrators.

Students can submit accommodation-related complaints and view their complaint history. Administrators can view all submitted complaints, search and filter complaint records, and update the status of an individual complaint.

The module uses HTML, CSS and JavaScript on the frontend, Node.js and Express on the backend, and MongoDB with Mongoose for persistent storage.

## Main Features

### Student Complaint Submission

Students can submit a complaint using:

- Student ID
- Student Name
- Complaint Description

New complaints are stored in MongoDB and automatically receive the status `Pending`.

### Student Complaint History

Students can enter their Student ID to retrieve previously submitted complaints. Each complaint shows:

- Complaint description
- Student ID and student name
- Submission date/time
- Current complaint status

### Admin Complaint Management

Administrators can open:

```text
/admin/complaints.html
```

The admin complaint page displays all complaints and allows the administrator to update the exact complaint selected using its MongoDB `_id`.

Supported statuses are:

- `Pending`
- `In Progress`
- `Resolved`

The status update is persisted to MongoDB, so the updated value is also visible when the student reloads their complaint history.

### Complaint Search and Filtering

The admin complaint page supports client-side filtering by:

- Student ID
- Student name
- Complaint description text
- Status (`Pending`, `In Progress`, or `Resolved`)

The search field and status dropdown can be used together, and the **Clear** button resets all filters.

## Validation

Validation is implemented on both the frontend and backend.

Rules include:

- Student ID is required
- Student Name is required
- Complaint Description is required
- Complaint description must contain at least 5 characters
- Complaint description cannot exceed 500 characters
- Status must be one of `Pending`, `In Progress`, or `Resolved`
- Invalid MongoDB complaint IDs return an appropriate client error instead of crashing the server

## Complaint Data Model

The Mongoose Complaint model contains:

```text
studentId
studentName
description
status
createdAt
updatedAt
```

The status field is restricted to:

```text
Pending
In Progress
Resolved
```

and defaults to `Pending` when a new complaint is created.

## Complaint API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/complaints` | Submit a new complaint |
| `GET` | `/api/complaints` | Retrieve all complaints for the admin interface |
| `GET` | `/api/complaints/student/:studentId` | Retrieve complaints belonging to one student |
| `GET` | `/api/complaints/:id` | Retrieve one complaint using its MongoDB `_id` |
| `PATCH` | `/api/complaints/:id/status` | Update the status of one specific complaint |
| `PATCH` | `/api/complaints/student/:studentId/status` | Update the latest complaint for a student ID (mainly useful for testing/manual API use) |

### Example Status Update

```bash
curl -X PATCH \
http://localhost:3000/api/complaints/COMPLAINT_MONGODB_ID/status \
-H "Content-Type: application/json" \
-d '{"status":"In Progress"}'
```

For the admin UI, the MongoDB complaint `_id` endpoint is preferred because one student can submit multiple complaints and the administrator must update the exact complaint selected.

## Complaint Module Testing

The complaint module can be tested with Jest and Supertest. The automated suite should cover the main success and validation cases, including:

- Successful complaint submission
- Missing Student ID
- Missing Student Name
- Complaint description below the minimum length
- Complaint description above the maximum length
- Retrieving all complaints
- Retrieving complaints for a specific student
- Retrieving one complaint by ID
- Complaint-not-found responses
- Updating status to `In Progress`
- Updating status to `Resolved`
- Rejecting an invalid status
- Rejecting a missing status

Run the complaint tests with:

```bash
npx jest tests/complaint.test.js --runInBand
```

The complete end-to-end browser workflow should also be checked manually:

```text
Student submits complaint
        ↓
Complaint stored as Pending
        ↓
Admin views complaint
        ↓
Admin changes status to In Progress
        ↓
Admin changes status to Resolved
        ↓
Student reloads complaint history
        ↓
Updated status is displayed
```

## Key Complaint Files

```text
controllers/
└── complaintController.js

models/
└── Complaint.js

routes/
└── complaintRoutes.js

public/
├── complaints.html
├── admin/
│   └── complaints.html
└── js/
    ├── complaints.js
    └── adminComplaints.js

tests/
├── complaint.test.js
└── complaintTestApp.js
```

## Sprint 2 Tasks - Clive

Clive's Sprint 2 complaint work includes:

| Task | Estimated Time | Status |
|---|---:|---|
| PATCH complaint status API | 5 hours | Completed |
| Complaint - admin integration | 5 hours | Completed |
| Complaint filtering/search | 4 hours | Completed |
| Complaint module testing | 5 hours | Testing / evidence |

These tasks extend the Sprint 1 complaint functionality into a complete student-to-admin complaint-management workflow.
