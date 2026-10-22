# Hdpeduct — Web Application & Backend

Engineered piping solutions website with admin catalogue management and product image upload backend.

---

## Quick Start (Run Locally)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## Hosting on Render (Recommended Solution)

The easiest and most reliable way to host this project on Render is as a **single Web Service** that serves both your frontend website and your backend upload API together. This eliminates CORS issues and requires only a single free Render service.

### Step-by-Step Render Deployment

1. **Push your code to GitHub / GitLab**.
2. Go to your [Render Dashboard](https://dashboard.render.com/) and click **New +** > **Web Service**.
3. Connect your repository.
4. Configure the service settings:
   - **Name**: `hdpeduct` (or your choice)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Click **Create Web Service**.
6. Once deployed, click the generated Render URL (e.g., `https://hdpeduct.onrender.com`).
   - Your frontend website will load directly at the root `/`.
   - Your product images will be served at `/images/...`.
   - Image uploads will work seamlessly via `/upload`.

---

### Important Note on Uploaded Images on Render Free Tier
- **Ephemeral Storage**: On Render's Free tier, the filesystem is ephemeral, meaning any newly uploaded images in `images/` will reset whenever the free service spins down or restarts.
- **For Permanent Uploads**:
  - Add a **Render Persistent Disk** (Mount Path: `/opt/render/project/src/images`), or
  - Integrate a cloud media service such as Cloudinary or AWS S3.
