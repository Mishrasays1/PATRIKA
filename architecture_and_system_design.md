# PATRIKA — System Architecture & Technical Product Documentation

> **PATRIKA**: A Next-Generation Community-Verified Citizen News & Fact-Checking Platform.

---

## 1. Executive Summary & Product Vision

**PATRIKA** is a decentralized, citizen-centric news platform designed to combat misinformation and fake news through real-time community verification, transparent truth voting, and open citizen journalism.

### Key Capabilities & Architectural Pillars
- **Google OAuth 2.0 Identity & Session Management**: Seamless single-click authentication using Google OAuth 2.0, automatically provisioning unique handles (`@username`) for every user.
- **Unified Citizen Interface**: A single, clean, accessible interface where all users are empowered to publish news stories, inspect community flag reasons, participate in **Truth / False** voting (strictly 1 vote per user), comment, and manage their published stories.
- **Persistent Data Store**: Powered by live **MongoDB Atlas Cloud Database**, ensuring zero data loss across user profiles, news submissions, community votes, comments, and misinformation flag reports.
- **Single Vote Constraint (Truth vs False)**: State engine that enforces one vote per user per story (preventing simultaneous upvoting and downvoting, allowing seamless vote switching).
- **Community Misinformation Flagging**: Allows readers to report misleading news with specific reasons (*Misleading Headline*, *Manipulated Image*, *Unverified Claim*, *Outdated Event*) with support to **edit** or **delete** their flag report.
- **Security & Rate Limiting**: Built-in Express API rate limiting (protecting endpoints from brute-force and spam attacks).

---

## 2. System Architecture Overview

```mermaid
flowchart TD
    subgraph Client ["Client Tier (React 18 + Vite + Tailwind CSS)"]
        UI["Unified News Stream (ReaderHome.jsx)"]
        Submit["Publisher Workspace (SubmitStory.jsx)"]
        Detail["Article View (ArticleDetail.jsx)"]
        Profile["Profile Drawer (ProfileModal.jsx)"]
        FlagModal["Flag Report Drawer (ReportModal.jsx)"]
        AuthGate["Google OAuth Gatekeeper (OAuthLanding.jsx)"]
    end

    subgraph Server ["Server Tier (Node.js + Express.js API)"]
        ServerJS["Express Server Core (server.js)"]
        RateLimit["Rate Limiter Middleware"]
        AuthRoute["Auth Routes (/api/auth)"]
        StoryRoute["Story Routes (/api/stories)"]
        ReportRoute["Report Routes (/api/reports)"]
        StatsRoute["Stats Routes (/api/stats)"]
    end

    subgraph Database ["Database Tier (MongoDB Atlas Cloud Cluster)"]
        MongoUsers[("users Collection")]
        MongoStories[("stories Collection")]
        MongoReports[("reports Collection")]
    end

    AuthGate -->|OAuth Credential Token| AuthRoute
    UI -->|GET /api/stories| StoryRoute
    Submit -->|POST /api/stories (Choose File Upload)| StoryRoute
    Detail -->|POST /api/stories/:id/vote| StoryRoute
    Detail -->|POST/PUT/DELETE /api/stories/:id/comments| StoryRoute
    FlagModal -->|POST/PUT/DELETE /api/reports| ReportRoute
    Profile -->|PUT /api/auth/profile/:id| AuthRoute

    ServerJS --> RateLimit
    RateLimit --> AuthRoute
    RateLimit --> StoryRoute
    RateLimit --> ReportRoute

    AuthRoute <--> MongoUsers
    StoryRoute <--> MongoStories
    ReportRoute <--> MongoReports
```

---

## 3. Core Database Schemas (MongoDB Atlas)

### 3.1 User Model (`users` Collection)
```json
{
  "_id": "ObjectId",
  "name": "String (Full Name)",
  "username": "String (Unique Lowercase Handle, e.g. rahul_verma)",
  "email": "String (Unique Lowercase Email)",
  "role": "String ('reporter' | 'reader' | 'moderator' | 'admin')",
  "avatar": "String (URL)",
  "bio": "String",
  "reputationScore": "Number (Default: 90)",
  "badges": ["Array of Strings"],
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### 3.2 Story Model (`stories` Collection)
```json
{
  "_id": "ObjectId",
  "title": "String",
  "summary": "String",
  "content": "String",
  "category": "String ('Civic Infrastructure' | 'Environment' | 'Local Governance' | 'Crime & Safety' | 'Health & Sanitation')",
  "media": [
    {
      "url": "String (Base64 or Image URL)",
      "type": "image",
      "caption": "String"
    }
  ],
  "reporter": "ObjectId (ref: User)",
  "upvotes": "Number (Truth Count)",
  "downvotes": "Number (False Count)",
  "votes": [
    {
      "userId": "String",
      "voteType": "'truth' | 'false'"
    }
  ],
  "comments": [
    {
      "_id": "ObjectId",
      "userId": "String",
      "userName": "String",
      "userAvatar": "String",
      "text": "String",
      "createdAt": "ISODate"
    }
  ],
  "flagsCount": "Number",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### 3.3 Misinformation Report Model (`reports` Collection)
```json
{
  "_id": "ObjectId",
  "storyId": "ObjectId (ref: Story)",
  "reporterId": "ObjectId (ref: User)",
  "reporterName": "String",
  "reason": "String ('Misleading Headline' | 'Manipulated / Fake Image' | 'Unverified Source Claim' | 'Outdated News Event' | 'Spam')",
  "details": "String",
  "status": "String ('pending' | 'resolved')",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

---

## 4. API Endpoints Specification

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Server health & MongoDB Atlas connectivity status |
| `POST` | `/api/auth/google` | Verifies Google OAuth credential & returns JWT token |
| `GET` | `/api/auth/users` | Returns list of registered users for handle validation |
| `PUT` | `/api/auth/profile/:id` | Updates user profile & handle (with unique handle validation) |
| `GET` | `/api/stories` | Retrieves stories with category/search filters |
| `POST` | `/api/stories` | Publishes a new story (supports Base64 file upload) |
| `DELETE` | `/api/stories/:id` | Deletes a published story (author/admin authorization) |
| `POST` | `/api/stories/:id/vote` | Enforces 1 vote per user (`truth` vs `false`, with vote toggle) |
| `POST` | `/api/stories/:id/comments` | Posts a new reader comment |
| `PUT` | `/api/stories/:id/comments/:cId` | Edits a reader comment |
| `DELETE` | `/api/stories/:id/comments/:cId` | Deletes a reader comment |
| `GET` | `/api/reports` | Returns misinformation flag reports |
| `POST` | `/api/reports` | Submits a flag report (enforces 1 flag per user per story) |
| `PUT` | `/api/reports/:id` | Edits an existing flag report |
| `DELETE` | `/api/reports/:id` | Deletes a flag report & decrements story flag count |

---

## 5. Automated Testing & Verification Suite

The platform includes a native integration test suite (`server/tests/integration.test.js`) verifying all 8 critical workflows:

```bash
node server/tests/integration.test.js
```

### Verified Test Cases:
1. **Server Health Endpoint**: Confirms live MongoDB Atlas connection.
2. **Google OAuth Gateway**: Validates token decoding and user creation.
3. **Unique Username Engine**: Confirms handle uniqueness enforcement and duplicate rejection.
4. **News Publishing**: Validates article creation with file attachments.
5. **Single-Vote Engine (Truth/False)**: Confirms 1 vote per user rule and vote switching.
6. **Misinformation Flagging**: Validates flag creation, duplicate prevention, editing, and deletion.
7. **Comment Engine**: Validates comment creation, editing, and deletion.
8. **Story Removal**: Validates story deletion from MongoDB Atlas.

---

## 6. Step-by-Step Production Deployment Guide

### Phase 1: Backend Deployment (Render / Railway / Heroku)
1. **Environment Variables Config**:
   Configure the following environment variables on your deployment provider:
   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://<db_user>:<db_password>@<cluster>.mongodb.net/patrika?retryWrites=true&w=majority
   JWT_SECRET=patrika_production_jwt_secret_2026
   GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
   GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
   ```
2. **Start Command**:
   ```bash
   node server/server.js
   ```

### Phase 2: Frontend Deployment (Vercel / Netlify / Cloudflare Pages)
1. **Environment Variables**:
   ```env
   VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
   ```
2. **Build Settings**:
   - **Build Command**: `cd client && npm run build`
   - **Output Directory**: `client/dist`
3. **Google Cloud Console OAuth Authorized Origins**:
   Add your deployed frontend URL (e.g. `https://patrika-news.vercel.app`) to:
   - **Authorized JavaScript origins** in Google Cloud Console Credentials.
   - **Authorized redirect URIs**.

---
*Document Version: 2.0 | Last Updated: August 2026 | Platform Status: Verified Production Ready*
