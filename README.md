# MindPath

A personalized mental wellness web app for students and professionals—journaling, mood tracking, AI-assisted insights, and career-focused support—built with Next.js.

## Team

| Name           |
| -------------- |
| Shreyash Hamal |
| Pritesh Dube   |
| Shubham Kafle  |
| Adhik Adhikari |

## Prerequisites

- **Node.js** 18.x or newer (LTS recommended)
- **npm** (comes with Node)
- Accounts / keys for: **Clerk** (auth), **MongoDB Atlas** (or compatible URI), **Google AI** (Gemini API), and optionally **Resend** (transactional email)

## Setup

### 1. Clone the repository

### 2. Install dependencies

```bash
cd mindmap
npm install
```

### 3. Environment variables

Create a file named `.env.local` in the project root (same folder as `package.json`). Next.js loads it automatically in development.

| Variable                            | Required | Description                                                      |
| ----------------------------------- | -------- | ---------------------------------------------------------------- |
| `MONGODB_URI`                       | Yes      | MongoDB connection string                                        |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes      | Clerk publishable key                                            |
| `CLERK_SECRET_KEY`                  | Yes      | Clerk secret key                                                 |
| `GEMINI_API_KEY`                    | Yes      | Google Gemini API key (AI chat, journal, mood, reports, support) |
| `GEMINI_MODEL`                      | No       | Model id (defaults to `gemini-2.5-flash`)                        |
| `RESEND_API_KEY`                    | No       | Resend API key for email features                                |

Example shape (use your real values, never commit secrets):

```env
MONGODB_URI=mongodb+srv://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
GEMINI_API_KEY=...
# GEMINI_MODEL=gemini-2.5-flash
# RESEND_API_KEY=re_...
```

## Obtaining API keys and credentials

Follow the services below in any order. Use the values in your `.env.local` file (see [Setup](#setup)). Never commit real keys to git.

### MongoDB (`MONGODB_URI`)

**Console:** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

1. Sign up or log in at [cloud.mongodb.com](https://cloud.mongodb.com/).
2. **Create a deployment** → choose the free **M0** tier (or higher) → pick a cloud region → create the cluster (may take a few minutes).
3. **Database Access** (left sidebar) → **Add New Database User** → choose **Password** authentication → save the username and password (you will need them in the URI).
4. **Network Access** → **Add IP Address** → for local development you can use **Allow Access from Anywhere** (`0.0.0.0/0`) or add your current IP only (more restrictive).
5. **Database** → **Connect** on your cluster → **Drivers** → copy the **connection string** (starts with `mongodb+srv://`).
6. Replace `<password>` in the string with your database user’s password (URL-encode special characters in the password if needed).
7. Optionally set a default database name in the path (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/mindpath`) or rely on the app’s connection options.

That full string is your `MONGODB_URI`.

### Clerk (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`)

**Dashboard:** [Clerk Dashboard](https://dashboard.clerk.com/)

1. Sign up or log in at [dashboard.clerk.com](https://dashboard.clerk.com/).
2. **Create application** → enter an application name → choose **Sign-in** methods you want (e.g. email).
3. Under **Configure** → **Developers** → **API Keys** (or **API Keys** in the sidebar, depending on UI version).
4. Copy **Publishable key** → this is `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.
5. Copy **Secret key** → this is `CLERK_SECRET_KEY` (keep it private; server-only).
6. For local dev, add `http://localhost:3000` under **Domains** / **Allowed origins** if the dashboard asks for authorized URLs (Clerk often pre-fills Next.js localhost).

### Google Gemini (`GEMINI_API_KEY`, optional `GEMINI_MODEL`)

**API keys:** [Google AI Studio](https://aistudio.google.com/apikey) · **Docs:** [Gemini API](https://ai.google.dev/)

1. Open [Google AI Studio — Get API key](https://aistudio.google.com/apikey) (or [ai.google.dev](https://ai.google.dev/) → **Get API key**).
2. Sign in with a Google account.
3. Click **Create API key** → choose or create a Google Cloud project when prompted.
4. Copy the key → set it as `GEMINI_API_KEY` in `.env.local`.
5. Optional: set `GEMINI_MODEL` to a model id your project supports (e.g. `gemini-2.5-flash`); if omitted, the app defaults to `gemini-2.5-flash`.

### Resend (`RESEND_API_KEY`) — optional

**Dashboard:** [Resend](https://resend.com/)

1. Create an account at [resend.com](https://resend.com/signup).
2. Open **API Keys** in the dashboard.
3. **Create API Key**, give it a name, copy the key (starts with `re_`) → set as `RESEND_API_KEY`.
4. For sending to real inboxes, complete domain verification in Resend per their docs; email features may be limited until that is done.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
