# Implementation Plan - Citizen Journalism Verification & Story Publishing Platform (PATRIKA)

**PATRIKA** is a full-stack Citizen Journalism Verification & Story Publishing Platform designed to bridge grassroots local reporting with rigorous, standardized fact-checking. The platform empowers citizens to report real-time local stories while preventing misinformation through structured multi-stage verification workflows, transparent credibility scoring, MongoDB data persistence, and an interactive hyperlocal news portal.

---

## User Review Required

> [!IMPORTANT]
> **Updated Architecture (Node.js + Express + MongoDB + React)**: 
> Per your request, we are implementing a **MongoDB** database architecture.
> 
> **Full-Stack Technical Architecture**:
> 1. **Backend**: Node.js + Express.js REST API with **Mongoose** models (`User`, `Story`, `VerificationLog`, `Report`).
> 2. **Database**: **MongoDB**. We will configure standard MongoDB connection (`MONGODB_URI` / `mongodb://localhost:27017/patrika`) with auto-fallback to `mongodb-memory-server` if local MongoDB daemon is offline. This guarantees the backend starts cleanly and persists data seamlessly without requiring complex database installation on your machine!
> 3. **Frontend**: Vite + React single-page app styled with Tailwind CSS, Lucide Icons, and Recharts analytics.
> 4. **1-Click Role Switcher Toolbar**: Included at the top of the app for effortless evaluation across all 4 user roles (*Citizen Reporter*, *Fact-Checker/Moderator*, *Reader*, *Platform Admin*).

---

## Backend MongoDB Schemas & REST APIs

### 1. `User` Schema
- `name` (String, required)
- `email` (String, unique, required)
- `role` (Enum: `'reporter'`, `'moderator'`, `'admin'`, `'reader'`)
- `location` (String: City/State)
- `reputationScore` (Number, default 100)
- `avatar` (String)

### 2. `Story` Schema
- `title` (String, required)
- `summary` (String)
- `content` (String, required)
- `category` (Enum: `'Civic Infrastructure'`, `'Environment'`, `'Local Governance'`, `'Crime & Safety'`, `'Health'`, `'Community Events'`, `'Breaking'`)
- `location` (Object: `{ city, district, neighborhood, lat, lng }`)
- `media` (Array of `{ url, type, caption }`)
- `evidenceAttachments` (Array of `{ title, url, type, description }`)
- `status` (Enum: `'draft'`, `'pending'`, `'in_review'`, `'edits_requested'`, `'approved'`, `'rejected'`)
- `trustScore` (Number, 0 to 100)
- `reporter` (Ref to `User`)
- `upvotes` (Number)
- `downvotes` (Number)
- `comments` (Array of `{ user, text, createdAt }`)
- `createdAt` / `updatedAt` (Timestamps)

### 3. `VerificationLog` Schema
- `storyId` (Ref to `Story`)
- `moderator` (Ref to `User`)
- `action` (Enum: `'approve'`, `'reject'`, `'request_edits'`, `'flag'`)
- `trustScoreAssigned` (Number)
- `checksCompleted` (Object: `{ mediaAuthenticity, sourceCrossCheck, locationVerified, metadataIntegrity }`)
- `notes` (String)
- `createdAt` (Timestamp)

### 4. `Report` Schema (Misinformation Flagging)
- `storyId` (Ref to `Story`)
- `reporterUser` (Ref to `User`)
- `reason` (Enum: `'Misleading Headline'`, `'Fake/Manipulated Media'`, `'Unverified Rumor'`, `'Out of Context'`)
- `details` (String)
- `status` (Enum: `'pending'`, `'reviewed'`, `'dismissed'`, `'action_taken'`)
- `createdAt` (Timestamp)

---

## 8 Interconnected Frontend Pages / Views

1. **Hyperlocal News Feed (`/feed`)**:
   - Live breaking news ticker & urgent event banners.
   - Filter by location (City/State/Neighborhood), category, trust level (100% Verified, Verified with Caveats, Community Alert), and sorting (Latest, Upvoted, Trending).
   - Rich media card layout with quick engagement actions, verified badge, and location tag.

2. **Article Reader & Verification Transparency View (`/story/:id`)**:
   - Full article text, multimedia gallery (images, videos, document attachments).
   - **Verification Breakdown Panel**: Displays reviewer notes, source evidence links, reverse image check result, metadata integrity, and transparent 0-100% Trust Score calculation.
   - Interactive engagement: Upvote/Downvote credibility, comment thread, share, bookmark, and "Report Misinformation" trigger.

3. **Story Submission Wizard (`/submit`)**:
   - 4-step story creation workflow:
     1. *Basic Details*: Headline, summary, full story, category selection.
     2. *Location & Mapping*: City/District selection, neighborhood, coordinate preview.
     3. *Multimedia & Evidence*: File uploader for photos, videos, and source proof (eyewitness notes, government notices, photo metadata preview).
     4. *Verification Checklist*: Self-declarations on source origin and ethical journalism code.
   - Saves directly to MongoDB backend.

4. **Reporter Workspace & Profile (`/dashboard`)**:
   - Overview of submitted stories from MongoDB with real-time status badges (*Draft*, *Pending Verification*, *In Review*, *Edits Requested*, *Verified & Published*, *Rejected*).
   - Detailed Submission Timeline (showing reviewer step history from MongoDB `VerificationLog`).
   - Reporter Credibility Badge & Reputation Metrics.

5. **Fact-Checker Verification Desk (`/verify`)**:
   - Queue of pending citizen submissions fetched from MongoDB backend.
   - **Verification Workbench**: Side-by-side view of story content vs. uploaded evidence attachments.
   - Fact-checking tools: Image metadata inspector, source reliability checklist, location cross-reference tool.
   - Action Modal: Approve & Publish (updates story status and saves `VerificationLog` in MongoDB), Request Edits, Reject, or Flag as Suspicious.

6. **Admin Panel & Platform Analytics (`/admin`)**:
   - Real-time MongoDB aggregation metrics: Total Stories, % Verified Content, Misinformation Mitigation Count, Avg Verification Turnaround Time.
   - Interactive Analytics Charts (Category distribution, Regional reporting heat map, Verification decision breakdown).
   - User Management Table (Promote readers, modify roles).
   - Flagged Content Resolution Inbox (Review user-reported stories from MongoDB `Report` collection).

7. **Auth & Persona Manager (`/auth`)**:
   - Login & Registration forms with role selection.
   - Quick-switch pre-configured demo accounts (Citizen Journalist Ananya, Moderator Vikram, Admin Priya, Public Reader Rahul).

8. **Fact-Checking Standards & Media Literacy Hub (`/literacy`)**:
   - Guidelines inspired by IFCN (International Fact-Checking Network) and PIB verification standards.
   - Educational guide for citizens on spotting manipulated media and ethical reporting practices.

---

## System Architecture & File Structure

```
PATRIKA/
├── package.json                   # Monorepo/Root package configuration
├── server/                        # Express.js + MongoDB Backend
│   ├── package.json
│   ├── server.js                  # Main Express entry & MongoDB connection engine
│   ├── config/
│   │   └── db.js                  # Mongoose connection with Memory-Server fallback
│   ├── models/
│   │   ├── User.js                # Mongoose User Schema
│   │   ├── Story.js               # Mongoose Story Schema
│   │   ├── VerificationLog.js     # Mongoose Verification Log Schema
│   │   └── Report.js              # Mongoose Report Schema
│   ├── routes/
│   │   ├── authRoutes.js          # Authentication REST endpoints
│   │   ├── storyRoutes.js         # Stories CRUD & search/filter endpoints
│   │   ├── verificationRoutes.js  # Fact-checker approval/rejection endpoints
│   │   ├── reportRoutes.js        # Misinformation reporting endpoints
│   │   └── statsRoutes.js         # Admin KPIs & MongoDB aggregations
│   └── seed/
│       └── seedDatabase.js        # Realistic local news database seeder
├── client/                        # React + Vite Frontend
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── App.jsx
│   │   ├── context/
│   │   │   └── AppContext.jsx     # API Integration & Global State
│   │   ├── services/
│   │   │   └── api.js             # Axios / Fetch client to Express backend
│   │   ├── components/            # Reusable UI components
│   │   └── pages/                 # 8 Interconnected views
```

---

## Verification Plan

### Backend & Database Verification
1. Seed MongoDB database with realistic local news stories, users, and moderation history via `npm run seed`.
2. Test Express REST API endpoints (`GET /api/stories`, `POST /api/stories`, `PUT /api/stories/:id/verify`, `GET /api/stats`) using backend tests or HTTP fetch.

### Frontend Integration Verification
1. Run `npm run dev` to launch Express API and Vite React frontend concurrently.
2. Verify full story submission saved directly to MongoDB.
3. Verify moderator approval updates MongoDB story document status and creates a `VerificationLog` entry.
4. Verify admin analytics read live MongoDB document aggregates.
