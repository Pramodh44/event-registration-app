# EventSphere - Full-Stack Event Registration Application

EventSphere is a premium, full-stack event registration portal built with **Next.js 16 (App Router)**, **MongoDB (Mongoose)**, and **Tailwind CSS v4**. It features high-fidelity glassmorphism designs, robust validation safeguards, search debouncing, dual-strategy filtering, operational metrics dashboard, and database-backed event tracking.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.x or later (developed and built on v22.14.0)
- **MongoDB**: A running MongoDB instance (Atlas connection string provided in `.env.local`)

### 2. Installation
Clone the repository and install packages:
```bash
npm install
```

### 3. Seed Database
We provide a seed script that removes existing collections and populates the database with **8 Events**, **10 Registrations**, and **6 Analytics logs**:
```bash
node lib/run-seed.js
```

### 4. Running Locally
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to interact with the app.

### 5. Production Build
Verify compilation:
```bash
npm run build
```

---

## 🎨 Core Features

- **Events Portal**: A visually stunning dashboard listing events with categories, modes, descriptions, and dynamic seat capacity progress bars.
- **Search & Filters**: Debounced search by title and filter options for Category and Mode.
- **Dual-Filtering Strategy**: A toggle allows organizers to compare:
  - **Client-Side Filtering**: Fetches all events once and filters in React state.
  - **API-side Filtering**: Passes queries through URL parameters to execute MongoDB filter queries.
- **Registration Form**: Collects attendee details with phone/email regex validations, programmatic double-registration blocks, and seat allocation capacity limits.
- **Organizer Dashboard**: Displays real-time aggregate statistics (events count, check-ins, occupancy percentages, and referral source metrics).
- **CSV Data Export**: Downloads CSV streams of attendee listings (either globally or filtered per-event).
- **Live Action Tracking Log**: Displays database-tracked user actions directly on the organizer panel in real-time.

---

## 📊 Analytics Event Tracking System

We implement a dual logging utility [lib/analytics.ts](file:///c:/Users/pramo\event-registration-app/lib/analytics.ts) that outputs styled indicators to the browser console *and* writes persistent records to the `Analytics` MongoDB collection.

### Tracked Events

| Event Action | Triggers When | Payload Data |
| :--- | :--- | :--- |
| `event_list_viewed` | User lands on the page or switches back to the Events Portal | `{ path: "/", defaultTab: "events" }` |
| `event_search_performed` | User types in search input (debounced by 500ms) | `{ query: "react", mode: "client \| server" }` |
| `event_filter_applied` | User selects category or location dropdown values | `{ type: "category \| mode", value: "Workshop", mode: "client \| server" }` |
| `event_card_clicked` | User clicks "View Details" to open the event modal | `{ eventId: "...", eventName: "...", category: "..." }` |
| `registration_submitted` | User clicks "Claim My Seat" to submit registration form | `{ eventId: "...", eventName: "...", email: "..." }` |
| `registration_success` | Backend returns successful reservation response | `{ eventId: "...", eventName: "...", email: "...", name: "..." }` |
| `registration_failed` | Registration fails validation or throws server error | `{ eventId: "...", eventName: "...", email: "...", error: "..." }` |
| `csv_exported` | Organizer triggers registration CSV download | `{ eventId: "all \| eventId", eventName: "..." }` |
| `analytics_logs_tab_viewed` | Organizer toggles the tracking log visual feed | `none` |

---

## 💡 Product Thinking: How Analytics Improve the Product

Storing and visualizing user activity metrics provides organizers with crucial product insights:
1. **Conversion Funnel Tracking**: By comparing `event_card_clicked` vs `registration_submitted` vs `registration_success`, organizers can see exactly where users drop off. If card clicks are high but submissions are low, the event description might not be compelling or the registration form requires too much fields.
2. **Channel Optimization**: Tracking registration `source` (LinkedIn, WhatsApp, Instagram) allows marketing budgets to be spent where conversions actually happen.
3. **Demand Forecasting**: Search and filter logs (`event_search_performed` and `event_filter_applied`) show what categories users are looking for. If search logs show frequent queries for "Python" or "Docker" which are not current events, organisers can create new listings to meet that user demand.
4. **Fraud & Abuse Detection**: Storing client IPs and user-agents in the logs allows rate-limiting or blocking automated bots attempting to hog seats on popular events.

---

## 🛠️ Backend API Endpoints

- **GET `/api/events`**: Retrieve events (supports query parameters `search`, `category`, and `mode` for server-side filtering).
- **GET `/api/events/:id`**: Fetch details for a specific event.
- **POST `/api/events`**: Create a new event.
- **POST `/api/events/:id/register`**: Submit attendee registration (validates fields, blocks duplicates, decrements vacancy).
- **GET `/api/events/:id/registrations`**: Retrieve attendee registrations for a specific event.
- **GET `/api/registrations/export`**: Download registrations CSV stream (supports optional query param `?eventId=...`).
- **GET `/api/dashboard`**: Aggregate and calculate dashboard statistics.
- **GET/POST `/api/analytics`**: Push a new tracking action or retrieve the latest logs.
