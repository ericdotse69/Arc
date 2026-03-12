# Product Specification: Arc — Focus, Quantified

## 1. Core Identity
Arc is an elite, high-performance tracking system for scientists, researchers, and journalists. It quantifies deep work through an engineered Pomodoro system and maps mental energy patterns.

## 2. Tech Stack & Best Practices
* **Architecture:** Clean Architecture (Separation of concerns: Routes -> Controllers -> Services -> Data Access).
* **Backend:** Node.js, Express, TypeScript, PostgreSQL (using Prisma or raw `pg` for typed queries).
* **Frontend:** Vite, React, TypeScript, Tailwind CSS.
* **Code Quality:** Strict typing, DRY principles, modular functions, early returns for error handling, RESTful API design.

## 3. Design System (German / Bauhaus Aesthetic)
* **Philosophy:** "Less, but better." Purely functional, no unnecessary ornamentation.
* **Palette:** Stark monochromatic (Zinc-950 background, Zinc-50 text) with one accent color (pure Red-600 for active states/timers).
* **Typography:** Strict sans-serif (Inter) and monospaced numbers (`tabular-nums`) for the timer.
* **Layout:** Rigid grid system, sharp edges (no rounded corners), generous whitespace, distinct borders.

## 4. Core Data Model (MVP)
* `User`: id, email, password_hash, created_at
* `Session`: id, user_id, start_time, end_time, total_duration, category (e.g., "Data Analysis"), cognitive_load (1-10), status (completed/interrupted)
