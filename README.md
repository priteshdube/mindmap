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

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
