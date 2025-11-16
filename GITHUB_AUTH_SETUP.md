# 🔐 GitHub Authentication Setup

Ada beberapa cara untuk authenticate dengan GitHub:

## Opsi 1: Personal Access Token (Recommended - Cepat)

### Step 1: Generate PAT di GitHub
1. Go to https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Name: `talaqqi-academy-deploy`
4. Expiration: 90 days (atau custom)
5. Scopes: Pilih **`repo`** (full control of private repositories)
6. Click **"Generate token"**
7. **COPY token** (hanya bisa dilihat sekali!)

### Step 2: Update Git Remote dengan Token
```bash
git remote remove origin
git remote add origin https://YOUR_USERNAME:YOUR_TOKEN@github.com/academytalaqqi-dot/talaqqi-academy.git
```

**Ganti:**
- `YOUR_USERNAME` → `academytalaqqi-dot`
- `YOUR_TOKEN` → PAT yang di-copy dari GitHub

### Step 3: Push
```bash
git push -u origin main
```

---

## Opsi 2: SSH Key (More Secure)

### Step 1: Generate SSH Key (jika belum punya)
```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
# Press Enter untuk semua prompts
```

### Step 2: Add SSH Key ke SSH Agent
```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

### Step 3: Add Public Key ke GitHub
1. Copy public key:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
2. Go to https://github.com/settings/keys
3. Click **"New SSH key"**
4. Title: `MacBook`
5. Paste public key
6. Click **"Add SSH key"**

### Step 4: Update Remote ke SSH
```bash
git remote remove origin
git remote add origin git@github.com:academytalaqqi-dot/talaqqi-academy.git
git push -u origin main
```

---

## Opsi 3: Use GitHub CLI (Easiest)

```bash
# Install GitHub CLI (if not installed)
brew install gh

# Login
gh auth login
# Follow prompts - select HTTPS and authenticate

# Push
git push -u origin main
```

---

## Recommended: Opsi 1 (PAT) untuk Setup Cepat

**Steps:**
1. Generate PAT di https://github.com/settings/tokens/new
2. Use: `git remote add origin https://academytalaqqi-dot:YOUR_PAT@github.com/academytalaqqi-dot/talaqqi-academy.git`
3. `git push -u origin main`

Pilih opsi mana yang ingin digunakan?
