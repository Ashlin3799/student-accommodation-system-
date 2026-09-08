# Student Accommodation System (SIT725 Group Assignment)

A Node.js + Express + MongoDB application. This individual submission covers the 
**Application Module**: students can submit room applications and track their status 
(Pending/Approved/Rejected), and includes Docker containerisation.

## Features
- `POST /api/applications` — submit a new room application
- `GET /api/applications/:studentId` — check a student's application status
- `PATCH /api/applications/:id` — admin approve/reject an application
- `GET /api/student` — returns submitter's name and student ID
- Duplicate application prevention (a student cannot have two active applications)
- Simple frontend to submit and track applications

## Tech Stack
- Node.js + Express
- MongoDB (via Mongoose)
- Docker for containerisation

---

## Running with Docker (Recommended)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- MongoDB running locally on your machine, accessible at `localhost:27017`
  (e.g. via MongoDB Community Server + Compass, or `mongod` running as a service)

### Configuration
This app requires a `MONGO_URI` environment variable pointing to a MongoDB instance.

1. Copy `.env.example` to `.env`:
2. Open `.env` and set the connection string. Since MongoDB runs on the **host machine** 
   (not inside the container), use Docker's special hostname to reach it:
      > Note: `host.docker.internal` allows the container to connect to MongoDB running 
   > on your local machine. This is required on Docker Desktop (Windows/Mac).

No other secrets or credentials are required — this project uses a local, unauthenticated 
MongoDB instance for simplicity, so there is no password to provide.

### Build and Run

1. Build the Docker image:
docker build -t accommodation-app .
2. Run the container:
docker run -p 3000:3000 --env-file .env accommodation-app
3. Open your browser at:
http://localhost:3000

### Verifying it works
- Visit `http://localhost:3000` — submit a test application via the form.
- Visit `http://localhost:3000/api/student` — should return:
```json
  {
    "name": "Purva Dilip Dongre",
    "studentId": "s225385045"
  }
```
- Check MongoDB (via Compass, connecting to `localhost:27017`) — the `accommodation-app` 
  database should contain an `applications` collection with your submitted data, confirming 
  the database integration works end-to-end.

---

## Running without Docker (for local development)

1. Install dependencies:
npm install
2. Create `.env` from `.env.example` and set:
MONGO_URI=mongodb://localhost:27017/accommodation-app
   (use `localhost`, not `host.docker.internal`, when running outside Docker)
3. Start the app:npm start
4. Visit `http://localhost:3000`
