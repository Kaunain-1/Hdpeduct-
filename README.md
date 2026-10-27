# Hdpeduct (LDPE-Duck) — Web Application & Backend

Engineered piping solutions website with dark theme mode, full-stack admin catalogue management, server-side image uploads, and cross-device synchronization (PC, mobile, tablet).

---

## Features & Implementation

1. **Dark Theme Mode Restored**:
   - The dark mode toggle button (`#themeToggle`) is active in the navigation header.
   - Smooth switching between the crisp Light theme and high-contrast Dark theme.
   - Theme choice is automatically remembered in `localStorage`.

2. **Server-Side Image Upload & Cross-Device Sync**:
   - **Direct Server Upload**: When an admin user uploads product images from a PC, the files are transmitted to `POST /upload` and saved directly to the server's `./images/` directory.
   - **Universal Relative Image Paths**: Uploaded images are stored with root-relative paths (`/images/filename.ext`), ensuring they load reliably on phone browsers, PCs, and cloud hosting (Render) without hardcoded localhost URLs.
   - **Automatic Catalogue Synchronization**: Any product additions, edits, or image updates are saved to `./data/catalogue.json` via `POST /api/data`.
   - **Immediate Mobile Visibility**: When visitors open the site on their mobile devices, `fetchServerData()` retrieves the latest catalogue from `GET /api/data` so all products and images are instantly visible to everyone.
   - **No 4 MB Browser Storage Limits**: Replaced raw base64 client storage with instant object URL previews and server disk writes.

---

## Updating Your GitHub Repository (`LDPE-Duck`)

Because this environment does not have direct access to your personal GitHub credentials or outbound network, use either of the two easy methods below to update your GitHub repo:

### Method 1: Using Git in VS Code or Terminal (Fastest)

1. Open your project folder in VS Code or your terminal.
2. Replace `index.html`, `Sample_hdpeduct.html`, `file-upload.js`, and the `data/` folder with the updated files from this package.
3. Run the following commands:
   ```bash
   git add .
   git commit -m "Restore dark theme mode and keep server image saving"
   git push origin main
   ```
   *(Replace `main` with `master` if your default branch is `master`)*

4. If your project is connected to Render, Render will automatically detect the new commit and redeploy your live site!

### Method 2: Via GitHub Website (No Command Line Needed)

1. Go to your GitHub repository in your web browser: `https://github.com/YOUR_USERNAME/LDPE-Duck`
2. Click **Add file** > **Upload files**.
3. Drag and drop:
   - `index.html`
   - `Sample_hdpeduct.html`
   - `file-upload.js`
   - `data/catalogue.json` (inside a `data` folder)
4. At the bottom, type a commit message: `Restore dark theme mode and keep server image saving`.
5. Click **Commit changes**.

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

## Hosting on Render

This project is configured as a single unified service that serves both your static website and backend API.

- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment**: Node
- **Port**: Handled automatically via `process.env.PORT` (defaults to 3000 locally).

### Note on Persistent Storage
On Render's Free tier, disk storage is ephemeral (resets when the container sleeps). For 100% permanent file persistence across restarts, you can:
- Attach a **Render Persistent Disk** mounted at `/opt/render/project/src/images` and `/opt/render/project/src/data`, or
- Use a cloud media provider like Cloudinary or AWS S3.
