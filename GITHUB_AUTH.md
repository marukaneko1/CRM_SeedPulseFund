# 🔐 GitHub Authentication Setup

## ❌ Current Issue:
Permission denied when trying to push to GitHub.

## ✅ Solution: Create a Personal Access Token

### **Step 1: Create GitHub Token**

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. **Note:** "CRM Upload"
4. **Expiration:** Choose duration (90 days or No expiration)
5. **Scopes:** Select these checkboxes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (if you want to use GitHub Actions)
6. Click **"Generate token"**
7. **COPY THE TOKEN** (you won't see it again!)

### **Step 2: Push Using Token**

```bash
cd /Users/marukaneko/CRM_SeedPulseFund

# Method 1: Use token in URL (one-time)
git push https://YOUR_TOKEN@github.com/seedpulsefund/CRM_SeedPulseFund.git main

# Method 2: Configure Git to use token (permanent)
git remote set-url origin https://YOUR_TOKEN@github.com/seedpulsefund/CRM_SeedPulseFund.git
git push -u origin main
```

### **Step 3: Or Use SSH Key (More Secure)**

```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy the public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub:
# Go to: https://github.com/settings/keys
# Click "New SSH key"
# Paste the key

# Change remote to SSH
cd /Users/marukaneko/CRM_SeedPulseFund
git remote set-url origin git@github.com:seedpulsefund/CRM_SeedPulseFund.git
git push -u origin main
```

---

## 🚀 Quick Fix (Use Token):

1. Generate token at: https://github.com/settings/tokens
2. Copy the token
3. Run this command (replace YOUR_TOKEN):

```bash
cd /Users/marukaneko/CRM_SeedPulseFund
git push https://YOUR_TOKEN@github.com/seedpulsefund/CRM_SeedPulseFund.git main
```

---

## ✅ After Successful Push:

Your repository will have:
- ✅ 79 files
- ✅ 17,000+ lines of code
- ✅ Complete CRM application
- ✅ All documentation

Visit: https://github.com/seedpulsefund/CRM_SeedPulseFund

