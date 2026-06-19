# Deployment Guide — Content Moderation App

Your app has two parts that deploy to two different places:

- **backend/** (Express + MongoDB) → deploys to **Render**
- **frontend/** (React) → deploys to **Vercel**
- Database → **MongoDB Atlas** (free cloud database)

Do the steps in order. Check each box as you go.

---

## ✅ Step 1 — Code on GitHub  (DONE)

Your code is already pushed to GitHub.

---

## ✅ Step 2 — MongoDB Atlas database  (DONE)

You created a free cluster, a database user, and allowed network access from anywhere.

**Your connection string (MONGO_URI):**

```
mongodb+srv://saimzafar12000_db_user:PASSWORD@cluster0.trrdvw9.mongodb.net/content-moderation?appName=Cluster0
```

> Replace `PASSWORD` with your database user password.
> If the password contains an `@`, write it as `%40` (e.g. `pirate@12900` → `pirate%4012900`).
> Easier option: change the password in Atlas (Database Access → Edit) to letters + numbers only, then no encoding is needed.

Keep this string saved — you need it in Step 3.

---

## ⬜ Step 3 — Deploy the backend to Render

1. Go to **render.com** → sign up / log in **with GitHub**.
2. Click **New +** → **Web Service**.
3. Connect GitHub and select your **content-moderation** repo.
4. Fill in:
   - **Name:** `content-moderation-api`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** **Free**
5. Open **Environment Variables** and add these three:

   | Key | Value |
   |-----|-------|
   | `MONGO_URI` | your connection string from Step 2 |
   | `JWT_SECRET` | any long random text, e.g. `mysupersecretkey9281` |
   | `GEMINI_API_KEY` | your Google Gemini API key |

6. Click **Create Web Service** and wait a few minutes for it to build.
7. When done, Render gives you a URL like:
   `https://content-moderation-api.onrender.com`
8. Open that URL in your browser. You should see:
   `{"message":"Content Moderation API is running"}`

✅ **Copy this Render URL — you need it in Step 4.**

---

## ⬜ Step 4 — Deploy the frontend to Vercel

1. Go to **vercel.com** → sign up / log in **with GitHub**.
2. Click **Add New** → **Project**.
3. Import your **content-moderation** repo.
4. Fill in:
   - **Root Directory:** `frontend`  (click Edit and select the frontend folder)
   - **Framework Preset:** Create React App (auto-detected)
5. Open **Environment Variables** and add:

   | Key | Value |
   |-----|-------|
   | `REACT_APP_API_URL` | your Render URL + `/api`  (e.g. `https://content-moderation-api.onrender.com/api`) |

6. Click **Deploy** and wait a couple of minutes.
7. Vercel gives you a live URL like `https://content-moderation.vercel.app`.

✅ Open it — your app is live!

---

## ⬜ Step 5 — Test it

- Open your Vercel URL.
- Register an account, log in, submit content, check the admin pages.
- If something doesn't load, check the browser console (F12) and the Render logs.

---

## Notes / Gotchas

- **First request is slow:** Render's free tier "sleeps" after inactivity. The first visit after a while takes ~30–60 seconds to wake up. Normal.
- **File uploads:** Uploaded images are stored on Render's disk, which resets on each redeploy (free tier). For permanent storage, move uploads to Cloudinary or AWS S3 later.
- **Auto-deploy:** After this, every `git push` to GitHub automatically redeploys both Render and Vercel.
- **Change a secret later?** Update it in the Render/Vercel dashboard (Environment Variables), then redeploy.
