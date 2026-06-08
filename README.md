# BUP FST Journal CMS

A dynamic journal/institutional website for the **Journal of FST**. The project includes a public journal website and an admin CMS for managing homepage content, pages, menus, issues, articles, editorial board members, call-for-papers content, media files, and footer/site settings.

---

## 1. Project Structure

```txt
project-root/
├── client/   # Next.js public website + admin frontend
└── server/   # Express.js + MongoDB backend API
```

---

## 2. Main Features

- Public journal homepage
- Dynamic navbar and dropdown menus
- Dynamic About and For Authors pages
- Issue archive and issue details
- Article listing and article detail pages
- Editorial board page
- Call for Papers page
- Search functionality
- Admin dashboard
- Admin CMS for pages, menus, issues, articles, editors, media, call for papers, homepage, and footer settings
- Cloudinary image/PDF upload support
- Admin login with password and OTP mechanism, if the Brevo OTP update is applied

---

## 3. Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui style components
- Axios
- Lucide React icons

### Backend

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT authentication
- bcrypt password hashing
- Cloudinary file storage
- Brevo email API for OTP, if enabled

---

## 4. Prerequisites

Install these before running the project:

```txt
Node.js 18 or higher
npm
MongoDB Atlas account or local MongoDB
Cloudinary account
Brevo account, only if email OTP login is enabled
```

Check Node.js version:

```bash
node -v
```

If it shows `v18.x`, `v20.x`, or higher, it is okay.

---

## 5. Installation Process

### Step 1: Extract or clone the project

Place the project in a folder like this:

```txt
BUP-FST-JOURNAL/
├── client/
└── server/
```

### Step 2: Install backend dependencies

```bash
cd server
npm install
```

### Step 3: Install frontend dependencies

Open another terminal:

```bash
cd client
npm install
```

---

## 6. Backend Environment Setup

Create a `.env` file inside the `server/` folder.

```txt
server/.env
```

Use this structure:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_jwt_secret
CLIENT_URL=http://localhost:3000

ADMIN_NAME=Admin
ADMIN_EMAIL=admin@example.com
ADMIN_INITIAL_PASSWORD=your_secure_initial_password
ADMIN_RESET_PASSWORD=false

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_verified_sender_email@example.com
BREVO_SENDER_NAME=Journal of FST Admin

ADMIN_OTP_EXPIRY_MINUTES=10
ADMIN_OTP_COOLDOWN_SECONDS=60
ADMIN_OTP_MAX_ATTEMPTS=5
```

Use `ADMIN_INITIAL_PASSWORD` only for creating the first admin account.

After the first admin is created in MongoDB, remove this line from `.env`:

```env
ADMIN_INITIAL_PASSWORD=your_secure_initial_password
```

Then restart the server.

This prevents the admin password from permanently staying in the environment file.

### If you need to reset the admin password

Temporarily add:

```env
ADMIN_INITIAL_PASSWORD=your_new_password
ADMIN_RESET_PASSWORD=true
```

Restart the backend once. After the password is reset, remove both lines:

```env
ADMIN_INITIAL_PASSWORD=your_new_password
ADMIN_RESET_PASSWORD=true
```

Then restart the backend again.

---

## 7. Frontend Environment Setup

Create a `.env.local` file inside the `client/` folder.

```txt
client/.env.local
```

For local development:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For production, use your deployed URLs:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
NEXT_PUBLIC_SITE_URL=https://your-frontend-domain.com
```

---

## 8. Cloudinary Setup

Create a Cloudinary account and collect these values from the Cloudinary dashboard:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

These are used for uploading:

- Journal cover images
- Issue cover images
- Article PDFs
- Call for Papers PDF/poster
- Editorial board profile photos
- Other media files

---

## 9. Brevo Email OTP Setup

This is needed only if the project uses the Brevo OTP login system.

### Step 1: Create Brevo account

Create an account at Brevo and verify your sender email/domain.

### Step 2: Create API key

Go to:

```txt
Brevo Dashboard → SMTP & API → API Keys
```

Create a new API key and place it in:

```env
BREVO_API_KEY=your_brevo_api_key
```

### Step 3: Set sender information

```env
BREVO_SENDER_EMAIL=your_verified_sender_email@example.com
BREVO_SENDER_NAME=Journal of FST Admin
```

The sender email must be verified in Brevo.

---

## 10. Run the Project Locally

### Start backend

```bash
cd server
npm run dev
```

Backend should run at:

```txt
http://localhost:5000
```

API health check:

```txt
http://localhost:5000/api/health
```

### Start frontend

Open a second terminal:

```bash
cd client
npm run dev
```

Frontend should run at:

```txt
http://localhost:3000
```

Admin login page:

```txt
http://localhost:3000/admin/login
```

---

## 11. Default Important Routes

### Public Routes

```txt
/
/about/about-the-journal
/about/aims-scope
/about/policies-ethics
/about/open-access-statement
/about/abstracting-indexing
/contact
/issues/current
/issues/archive
/issues/special
/issues/most-cited
/issues/most-read
/editorial-board
/call-for-papers
/search?q=keyword
```

### For Authors Routes

```txt
/for-authors/author-guidelines
/for-authors/submission-guidelines
/for-authors/peer-review-process
/for-authors/article-processing-charge
/for-authors/copyright-licensing
/for-authors/templates
```

### Admin Routes

```txt
/admin/login
/admin/dashboard
/admin/homepage
/admin/pages
/admin/menus
/admin/issues
/admin/articles
/admin/editorial-board
/admin/call-for-papers
/admin/media
/admin/settings
```

---

## 12. Production Build

### Backend build

```bash
cd server
npm run build
npm start
```

### Frontend build

```bash
cd client
npm run build
npm start
```

---

## 13. Deployment Notes

### Backend deployment

The backend can be deployed on platforms such as:

- Render
- Railway
- Vercel serverless setup, if configured properly
- VPS

Required backend environment variables in production:

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
CLIENT_URL=https://your-frontend-domain.com

ADMIN_NAME=Admin
ADMIN_EMAIL=admin@example.com

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_verified_sender_email@example.com
BREVO_SENDER_NAME=Journal of FST Admin

ADMIN_OTP_EXPIRY_MINUTES=10
ADMIN_OTP_COOLDOWN_SECONDS=60
ADMIN_OTP_MAX_ATTEMPTS=5
```

### Frontend deployment

The frontend can be deployed on Vercel.

Required frontend environment variables in production:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
NEXT_PUBLIC_SITE_URL=https://your-frontend-domain.com
```

After changing environment variables on Vercel, redeploy the frontend.

---

## 14. Admin Usage Flow

1. Login from `/admin/login`.
2. Manage homepage content from `/admin/homepage`.
3. Manage static/dynamic pages from `/admin/pages`.
4. Manage navbar items from `/admin/menus`.
5. Manage issues from `/admin/issues`.
6. Manage articles from `/admin/articles`.
7. Manage editorial board members from `/admin/editorial-board`.
8. Manage call-for-papers content from `/admin/call-for-papers`.
9. Upload and manage media from `/admin/media`.
10. Manage footer and site settings from `/admin/settings`.

---

## 15. Common Problems and Fixes

### Problem: Public site does not show admin changes

Check that frontend uses the correct backend URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

For deployment, make sure the frontend points to the deployed backend API.

### Problem: Login shows invalid email or password

Possible reasons:

- Admin email is different from the email stored in MongoDB.
- Old admin password is still stored in MongoDB.
- Password was changed but server was not restarted.

To reset password temporarily:

```env
ADMIN_INITIAL_PASSWORD=your_new_password
ADMIN_RESET_PASSWORD=true
```

Restart backend once, then remove those two lines.

### Problem: OTP email is not sent

Check:

```env
BREVO_API_KEY=
BREVO_SENDER_EMAIL=
BREVO_SENDER_NAME=
```

Also make sure the sender email is verified in Brevo.

### Problem: Image or PDF upload fails

Check Cloudinary variables:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Problem: CORS error

Make sure backend has the correct frontend URL:

```env
CLIENT_URL=http://localhost:3000
```

For production:

```env
CLIENT_URL=https://your-frontend-domain.com
```

---

## 16. Security Notes

- Do not commit `.env` or `.env.local` to GitHub.
- Use a strong `JWT_SECRET`.
- Do not keep the first admin password permanently in `.env`.
- Use a verified Brevo sender email for OTP.
- Use a strong admin password.
- Keep MongoDB and Cloudinary credentials private.

---

## 17. Useful Commands

### Backend

```bash
cd server
npm install
npm run dev
npm run build
npm start
```

### Frontend

```bash
cd client
npm install
npm run dev
npm run build
npm start
```

---

## 18. Project Purpose

This project is a dynamic journal website and CMS for the Journal of FST. It is designed to manage public journal information, issues, articles, editorial board data, call-for-papers content, media files, and footer/site content from an admin panel.

It is not a manuscript submission/review management system yet.
