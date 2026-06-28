# Task Tracker — Full-Stack Mini App

A full-stack Task Tracker application built with Spring Boot, PostgreSQL, and React. The application allows users to manage projects and tasks with complete CRUD operations, filtering, sorting, and pagination.


## Tech Stack

| Layer        |     Technology                    |
|--------------|-----------------------------------|
| Backend      | Java 21, Spring Boot 3.5.4, Maven |
| Database     | PostgreSQL                        |
| ORM          | Spring Data JPA / Hibernate       |
| Frontend     | React, Vite, Axios                |
| Testing      | JUnit 5, Mockito, MockMvc, H2     |


## Prerequisites

- Java 21
- PostgreSQL
- Node.js 
- Maven


## Run Locally (Without Docker)

### 1. Create the database

```bash
psql -U postgres
```

```sql
CREATE DATABASE tasktracker;
```

Then import the schema:

```bash
psql -U postgres -d tasktracker -f src/main/resources/schema.sql
```

### 2. Run the Backend

```bash
mvnw spring-boot:run
```

The backend runs at:

```
http://localhost:8080
```

### 3. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at:

```
http://localhost:5173
```


## Run With Docker Compose (Recommended)

```bash
docker-compose up --build
```

| Service   | URL                      |
|-----------|--------------------------|
| Frontend  | http://localhost:5173    |
| Backend   | http://localhost:8080    |
| PostgreSQL| localhost:5432           |


---

## Run Tests

```bash
# Windows
mvnw.cmd test

# Linux/macOS
./mvnw test
```

All automated tests passed successfully (16 tests, 0 failures).


## API Endpoints

### Projects

| Method | Endpoint              | Description          | Status Codes   |
|--------|-----------------------|----------------------|----------------|
| GET    | `/api/projects`       | List all projects    | 200            |
| GET    | `/api/projects/{id}`  | Get project by ID    | 200, 404       |
| POST   | `/api/projects`       | Create project       | 201, 422       |
| PUT    | `/api/projects/{id}`  | Update project       | 200, 404, 422  |
| DELETE | `/api/projects/{id}`  | Delete project       | 204, 404       |


### Tasks

| Method | Endpoint                   | Description          | Status Codes        |
|--------|----------------------------|----------------------|---------------------|
| GET    | `/api/tasks`               | List tasks (filtered)| 200                 |
| GET    | `/api/tasks/{id}`          | Get task by ID       | 200, 404            |
| POST   | `/api/tasks`               | Create task          | 201, 404, 422       |
| PUT    | `/api/tasks/{id}`          | Update task          | 200, 404, 422       |
| PATCH  | `/api/tasks/{id}/complete` | Mark task as DONE    | 200, 404            |
| DELETE | `/api/tasks/{id}`          | Delete task          | 204, 404            |


### Task Query Parameters (GET `/api/tasks`)

| Param      | Type   | Example     | Description                  |
|------------|--------|-------------|------------------------------|
| `status`   | String | `TODO`      | Filter by status             |
| `priority` | String | `HIGH`      | Filter by priority           |
| `projectId`| Long   | `1`         | Filter by project            |
| `sortBy`   | String | `dueDate`   | Field to sort by             |
| `sortDir`  | String | `asc`/`desc`| Sort direction               |
| `page`     | int    | `0`         | Page number (0-indexed)      |
| `size`     | int    | `10`        | Page size                    |


### Example Request

Retrieve all tasks with **TODO** status and **HIGH** priority, sorted by due date in ascending order, with pagination:

```bash
curl "http://localhost:8080/api/tasks?status=TODO&priority=HIGH&sortBy=dueDate&sortDir=asc&page=0&size=10"
```


### Error Response Shape

```json
{
  "status": 422,
  "message": "Validation failed",
  "errors": ["title: Title is required"],
  "timestamp": "2025-01-01T10:00:00"
}
```

---


## Database Schema

```sql
-- Two related tables with foreign key
projects (id, name, description, created_at, updated_at)
tasks    (id, title, description, status, priority, due_date,
          created_at, updated_at, project_id → projects.id)
```

Full schema: [`src/main/resources/schema.sql`](src/main/resources/schema.sql)

### Indexes

```sql
CREATE INDEX idx_tasks_status   ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

These support the filtered list endpoint — filtering by `status`/`priority`
and sorting by `due_date` hit indexes instead of doing full table scans.

---

## Design Notes

### What I focused on

- **Clean layering** — Controller → Service → Repository. No business logic leaks into controllers, no raw entities returned from endpoints (DTOs only).
- **SQL-level filtering** — Filtering and sorting happen in the JPQL query via `findAllWithFilters`, not in-memory. Pagination is handled by Spring's `Pageable` so the DB only returns the requested page.
- **Meaningful HTTP status codes** — 201 on create, 204 on delete, 404 on missing resource, 422 on validation failure, 400 on bad input type.
- **Consistent error shape** — `GlobalExceptionHandler` ensures every error returns the same JSON structure so the frontend can handle errors uniformly.
- **Cascade delete** — Deleting a project deletes all its tasks via `ON DELETE CASCADE` at the DB level, backed by JPA `CascadeType.ALL`.


### Trade-offs made

| Decision                  | Reason |
|---------------------------|--------|
| No JWT auth               | Out of scope for the assignment; would add Spring Security + JWT filter in production |
| H2 for tests              | Avoids needing a real PostgreSQL instance in CI; `MODE=PostgreSQL` keeps behaviour close |
| Inline CSS in React       | Kept dependencies minimal and focused; would use Tailwind or CSS modules in production |
| No optimistic concurrency | Would add `@Version` on entities and handle `OptimisticLockException` in production |


### What I would add for production

- **JWT authentication** — Spring Security with stateless JWT tokens, per-user task ownership
- **GitHub Actions CI** — Build, test, and lint on every push
- **OpenAPI / Swagger** — `springdoc-openapi` for auto-generated API docs
- **Optimistic concurrency** — `@Version` field on `Task` entity to prevent lost updates
- **Environment-based config** — Separate `application-prod.properties` with secrets via environment variables, never hardcoded
- **Rate limiting** — Bucket4j or similar to protect the API in production
- **Soft deletes** — `deleted_at` timestamp instead of hard deletes for auditability

---

## AI Assistant Usage

This project was developed with assistance from **ChatGPT**, which was used for technical guidance and implementation support where needed.

### What ChatGPT was used for

| Area                | Usage                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------- |
| JPA entities        | Suggested `@CreationTimestamp`, `@UpdateTimestamp`, and enum mappings            |
| Exception handling  | Assisted in structuring `GlobalExceptionHandler` and HTTP status handling          |
| Test structure      | Guided the structure of unit (Mockito) and integration (MockMvc) tests                |
| React setup         | Assisted with setting up the Vite, React Router, and Axios project structure          |
| Docker Compose | Assisted with creating the `docker-compose.yml` configuration and guidance on running the application using Docker Compose. |
| Documentation       | Assisted in structuring this README                                                   |


AI was primarily used to improve development efficiency by assisting with repetitive boilerplate code, providing implementation guidance, and helping clarify technical concepts. This allowed more time to focus on application logic, testing, debugging, and verifying the final implementation.

### What I Wrote and Own

I was responsible for integrating the application, implementing the required features, testing functionality, resolving implementation issues, and validating the final solution against the assignment requirements. I verified all REST API endpoints using **Postman**, executed unit and integration tests, and reviewed all generated code before incorporating it into the project. I can confidently explain the architecture, design decisions, and implementation of every major component.


