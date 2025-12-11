# 🚀 GitHub Deployment Guide for Aura AGI

## Step-by-Step Instructions to Push to GitHub

### Prerequisites
- Git installed on your machine
- GitHub account created
- Repository created at: https://github.com/ennersmai/Aura_AGI

---

## 1. Initialize Git Repository

Open PowerShell/Terminal in the `aura-app` directory:

```powershell
cd C:\Users\Mai\Desktop\Aura\Aura-Core\aura-app

# Initialize git repository
git init

# Configure git (if not already done)
git config user.name "Mai"
git config user.email "your-email@example.com"
```

---

## 2. Prepare Files for Commit

### A. Rename README for GitHub

```powershell
# Rename the GitHub README to be the main README
Move-Item README_GITHUB.md README.md -Force

# Or on Linux/Mac:
# mv README_GITHUB.md README.md
```

### B. Verify .gitignore

Make sure `.gitignore` exists and `.env` is listed:

```powershell
cat .gitignore | Select-String ".env"
```

Should output: `.env`

---

## 3. Stage All Files

```powershell
# Add all files (respecting .gitignore)
git add .

# Verify what will be committed
git status
```

**Important**: Ensure `.env` file is **NOT** in the staged files!

---

## 4. Create Initial Commit

```powershell
git commit -m "🧠 Initial commit: Aura AGI v0.3.0

- Emotion Engine: 27D physics-based emotions
- Learning Engine: 6-phase learning cycle
- Meta-Cognitive Orchestrator: L1/L2/L3 architecture
- Vector embeddings for semantic search
- Identity, Goal, and Reflection engines
- Full-stack: FastAPI backend + Next.js frontend
- Docker Compose deployment
"
```

---

## 5. Connect to GitHub Remote

```powershell
# Add GitHub repository as remote
git remote add origin https://github.com/ennersmai/Aura_AGI.git

# Verify remote is set
git remote -v
```

Should output:
```
origin  https://github.com/ennersmai/Aura_AGI.git (fetch)
origin  https://github.com/ennersmai/Aura_AGI.git (push)
```

---

## 6. Push to GitHub

### Option A: Using HTTPS (Recommended for first time)

```powershell
# Set default branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

**You'll be prompted for GitHub credentials:**
- Username: `ennersmai`
- Password: Use a **Personal Access Token** (not your GitHub password)

### How to Generate Personal Access Token:
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name: "Aura AGI Deployment"
4. Scopes: Check `repo` (Full control of private repositories)
5. Generate token
6. **Copy the token** (you won't see it again!)
7. Use this token as your password when pushing

---

### Option B: Using SSH (If configured)

```powershell
# Change remote to SSH
git remote set-url origin git@github.com:ennersmai/Aura_AGI.git

# Push to GitHub
git push -u origin main
```

---

## 7. Verify Deployment

Visit your repository: https://github.com/ennersmai/Aura_AGI

You should see:
- ✅ All files uploaded
- ✅ README.md displayed on the main page
- ✅ Folder structure visible
- ✅ `.env` file **NOT** present (security!)

---

## 8. Add Repository Topics (Optional but Recommended)

On GitHub, click "⚙️ Settings" → "About" → "Add topics":

Suggested topics:
```
artificial-intelligence
agi
chatbot
emotion-engine
fastapi
nextjs
surrealdb
machine-learning
cognitive-architecture
llm
vector-search
semantic-search
docker
python
typescript
```

---

## 9. Create Branch Protection Rules (Optional)

For team collaboration:

1. Go to: Settings → Branches
2. Add rule for `main` branch:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging

---

## 10. Future Updates

When making changes:

```powershell
# Check status
git status

# Stage changes
git add .

# Commit with descriptive message
git commit -m "✨ Add new feature: [description]"

# Push to GitHub
git push origin main
```

---

## Common Issues & Solutions

### Issue 1: "Repository not found"
```powershell
# Verify remote URL
git remote -v

# Update if incorrect
git remote set-url origin https://github.com/ennersmai/Aura_AGI.git
```

### Issue 2: ".env file accidentally committed"
```powershell
# Remove from git (but keep locally)
git rm --cached .env

# Commit the removal
git commit -m "🔒 Remove .env from version control"

# Push
git push origin main
```

### Issue 3: "Authentication failed"
- Make sure you're using a **Personal Access Token**, not your password
- Token must have `repo` scope
- For SSH, ensure your SSH key is added to GitHub: https://github.com/settings/keys

### Issue 4: "Large file rejected"
GitHub has a 100MB file size limit. Check:

```powershell
# Find large files
Get-ChildItem -Recurse | Where-Object {$_.Length -gt 50MB} | Select-Object FullName, @{Name="SizeMB";Expression={[math]::Round($_.Length / 1MB, 2)}}
```

Add large files to `.gitignore` or use Git LFS.

---

## Repository Structure on GitHub

After pushing, your repo should look like:

```
ennersmai/Aura_AGI (main)
├── README.md                      (from README_GITHUB.md)
├── .gitignore
├── docker-compose.unified.yml
├── Dockerfile
├── pyproject.toml
├── env.example
├── QUICKSTART.md
├── CONFIG_REFACTOR_COMPLETE.md
├── VECTOR_EMBEDDINGS.md
├── PHASE2_COMPLETED.md
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.ts
│   └── src/
├── src/
│   └── aura/
│       ├── engines/
│       ├── orchestrator/
│       ├── llm/
│       ├── models/
│       └── main.py
├── scripts/
│   ├── init_db.py
│   └── init_schema.surql
└── docs/
    ├── Cognitive_architecture_PRD.md
    ├── Emotion_engine_Translation_layer_FRD.md
    └── Learning_engine_FRD.md
```

---

## Next Steps After Deployment

1. **Add Repository Description** on GitHub:
   > "🧠 Aura AGI - Local AI Companion with 27D Physics-Based Emotions, Structural Learning, and True Cognitive Architecture"

2. **Add Website URL** (if you deploy to Vercel/Netlify):
   > https://aura-agi.vercel.app

3. **Enable Discussions** (for community):
   - Settings → Features → ✅ Discussions

4. **Add License Badge** (already in README):
   - MIT License included

5. **Create Release**:
   - Releases → "Create a new release"
   - Tag: `v0.3.0`
   - Title: "🧠 Aura AGI v0.3.0 - Initial Release"
   - Description: Copy from README highlights

---

## Security Checklist ✅

Before pushing, verify:
- [ ] `.env` file is **NOT** committed (check `git status`)
- [ ] `.gitignore` includes `.env` and `.env.local`
- [ ] `env.example` is committed (safe template)
- [ ] No API keys in any committed files
- [ ] No personal information in code
- [ ] No database credentials in plain text

---

## Congratulations! 🎉

Your Aura AGI project is now live on GitHub!

**Repository URL**: https://github.com/ennersmai/Aura_AGI

Share it with the world! 🌍

---

**Need Help?**
- GitHub Docs: https://docs.github.com/en/get-started
- Git Cheat Sheet: https://education.github.com/git-cheat-sheet-education.pdf

