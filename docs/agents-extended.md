---
File Location: /Users/nihdev/Web/thuvienanh/docs/agents-extended.md
Last Updated: 2025-10-22
Version: 4.0.0 (Extended Documentation)
Parent: Agents.md (Core)
Maintainer: Nguyen Hai Ninh
---

# 📚 AGENTS.MD - EXTENDED DOCUMENTATION

**This file contains detailed guides, templates, and examples.**

**For core principles and rules, see:** `../Agents.md`

---

## Table of Contents

1. [Project Creation Automation](#project-creation-automation)
2. [Port Management System](#port-management-system)
3. [Auto-Restart System](#auto-restart-system)
4. [Naming Conventions](#naming-conventions)
5. [Server Paths & Storage](#server-paths--storage-configuration)
6. [Synology Storage System](#synology-storage-system)
7. [Quick Reference](#quick-reference)
8. [Templates Library](#templates-library)
9. [Prompt Library](#prompt-library)
10. [Best Practices](#best-practices-from-agentsmd)
11. [Apple Design System Specs](#apple-design-system-specs)
12. [Troubleshooting](#troubleshooting)
13. [MCP Servers Integration](#mcp-servers-integration)
14. [Project Cleanup System](#project-cleanup-system)
15. [Development Workflow](#development-workflow-for-low-codeai-assisted-projects)
16. [Liquid Glass Design System](#liquid-glass-design-system-comprehensive)
17. [Cloudflare Tunnel Deployment](#cloudflare-tunnel-deployment)

---


- Too perfect, no natural imperfections
- Garbage files left behind (*.backup,*.temp, etc.)

**Dấu hiệu code bởi human (mục tiêu):**

- Commits spread over time
- Varied animation timings
- Some variables refactored later
- Natural, conversational comments
- Visible iteration (v1 → v2 → v3)
- Some imperfections, then improved
- Clean workspace, no garbage files

---

# 📦 PROJECT CREATION AUTOMATION

## **Overview**

Automated script for creating new expense tracker projects with complete infrastructure setup.

**Features:**

- ✅ Auto-select available port
- ✅ Create project structure
- ✅ Setup PostgreSQL database
- ✅ Deploy to Ubuntu Server
- ✅ Configure PM2 process
- ✅ Setup Cloudflare Tunnel
- ✅ Update PORT_REGISTRY.md

## **Script Location**

```bash
/Users/nihdev/Web/1/create-new-project.sh
```

## **Usage**

### **Quick Start:**

```bash
cd /Users/nihdev/Web/1
./create-new-project.sh
```

### **Interactive Prompts:**

The script will ask for:

1. **Project name** (e.g., `expense-tracker-user3`)
2. **User name** (e.g., `User 3`)
3. **Domain** (e.g., `user3.ninh.app`)
4. **Port** (auto-suggested or manual)
5. **Google Sheets ID**

### **Example Session:**

```
============================================
Project Information
============================================
Enter project name: expense-tracker-john
Enter user name: John Doe
Enter domain: john.ninh.app
Enter port (press Enter for auto-select: 3002): 
Enter Google Sheets ID: 1AbC...XyZ

============================================
Project Configuration
============================================
Project Name:     expense-tracker-john
User Name:        John Doe
Domain:           john.ninh.app
Port:             3002
PM2 Name:         expense-tracker-john
Database:         expense_tracker_john_db
Google Sheets:    1AbC...XyZ
Synology Folder:  /Marketing/John_Doe/expense-tracker
Local Path:       /Users/nihdev/Web/John_Doe/expense-tracker-john
Server Path:      /data/Ninh/projects/expense-tracker-john

Continue with this configuration? (y/n): y
```

## **What the Script Does**

### **Step 1: Requirements Check**

- ✅ Verify SSH access to Ubuntu Server
- ✅ Check PORT_REGISTRY.md exists
- ✅ Verify template project exists

### **Step 2: Port Management**

- 📊 Read PORT_REGISTRY.md
- 🔍 Find next available port (3000, 3001, 3002, ...)
- ✅ Suggest port to user

### **Step 3: Project Creation**

- 📁 Create local project directory
- 📋 Copy template files from chitieuninh project
- ⚙️ Generate `.env.production` with correct values
- 🔧 Create `ecosystem.config.js` for PM2
- 📝 Update `drizzle.config.ts` with database name

### **Step 4: Database Setup**

- 🗄️ Create PostgreSQL database on server
- 📊 Push database schema using Drizzle
- ✅ Verify tables created

### **Step 5: Deployment**

- 📤 Sync files to Ubuntu Server
- 📦 Install npm dependencies
- 🏗️ Build Next.js application
- 🚀 Start PM2 process
- 💾 Save PM2 process list

### **Step 6: Cloudflare Tunnel**

- 🌐 Create DNS record
- 📝 Generate config snippet
- ⚠️ Prompt user to update config manually

### **Step 7: PORT_REGISTRY Update**

- 📝 Add new project entry
- ✅ Mark port as used
- 📤 Sync to server

## **Post-Deployment Steps**

After script completes, manually:

1. **Update Cloudflare Tunnel config:**

   ```bash
   ssh nihdev@100.115.191.19
   sudo nano /etc/cloudflared/config.yml
   # Add:
   #   - hostname: john.ninh.app
   #     service: http://localhost:3002
   sudo systemctl restart cloudflared
   ```

2. **Create Synology folder:**
   - Login to Synology: <http://192.168.1.58:5000>
   - Navigate to `/Marketing/John_Doe/`
   - Create folder: `expense-tracker/receipts/`

3. **Share Google Sheet:**
   - Open Google Sheet
   - Share with: `nihreport@qlct-455215.iam.gserviceaccount.com`
   - Permission: Editor

4. **Test deployment:**

   ```bash
   curl -I https://john.ninh.app
   # Should return: HTTP/2 200
   ```

## **Troubleshooting**

### **Script fails at database creation:**

```bash
# Manual fix:
ssh nihdev@100.115.191.19
docker exec -it postgresql-16 psql -U nihdev -d postgres
CREATE DATABASE expense_tracker_john_db;
\q
```

### **PM2 process won't start:**

```bash
# Check logs:
ssh nihdev@100.115.191.19
pm2 logs expense-tracker-john --lines 50

# Common issues:
# - Port already in use
# - Missing dependencies
# - Build errors
```

### **Domain not accessible:**

```bash
# Check Cloudflare Tunnel:
ssh nihdev@100.115.191.19
sudo systemctl status cloudflared
sudo journalctl -u cloudflared -n 50

# Check DNS:
dig john.ninh.app
```

## **Script Customization**

### **Change Template Project:**

Edit line 18 in script:

```bash
TEMPLATE_PROJECT="/Users/nihdev/Web/your-template-project"
```

### **Change Server:**

Edit lines 14-16:

```bash
UBUNTU_SERVER="your.server.ip"
UBUNTU_USER="your-username"
SUDO_PASS="your-password"
```

### **Change Port Range:**

Edit `get_next_available_port()` function:

```bash
local port=5000  # Start from 5000 instead of 3000
```

---

# 📋 PORT MANAGEMENT SYSTEM

## **PORT_REGISTRY.md**

Central registry for tracking port usage across all projects.

**Location:** `/Users/nihdev/Web/1/PORT_REGISTRY.md`

### **Format:**

```markdown
| Port | Project | PM2 Name | Domain | User | Status |
|------|---------|----------|--------|------|--------|
| 3000 | chitieuninh | chitieuninh | bangke.ninh.app | Ninh | ✅ Active |
| 3001 | expense-tracker-nvn | expense-tracker-nvn | nvn.ninh.app | Năm | ✅ Active |
| 3002 | - | - | - | - | 🟢 Available |
```

### **Rules:**

1. ✅ **Always check** PORT_REGISTRY.md before creating new project
2. ✅ **Update immediately** after deploying new project
3. ✅ **Sync to server** after every update
4. ✅ **Mark as inactive** when project is removed

### **Commands:**

```bash
# View registry
cat /Users/nihdev/Web/1/PORT_REGISTRY.md

# Check available ports
grep "🟢 Available" /Users/nihdev/Web/1/PORT_REGISTRY.md

# Sync to server
scp /Users/nihdev/Web/1/PORT_REGISTRY.md nihdev@100.115.191.19:/data/Ninh/projects/
```

---

# 🔄 AUTO-RESTART SYSTEM

## **PM2 Startup Configuration**

Ensures all projects auto-restart after server reboot.

### **Setup (Already Done):**

```bash
# On Ubuntu Server:
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u nihdev --hp /home/nihdev
pm2 save
```

### **Verification:**

```bash
# Check PM2 service
sudo systemctl status pm2-nihdev

# Test auto-restart
pm2 kill
pm2 resurrect
pm2 status
```

### **How It Works:**

```
Server Boot
    ↓
systemd starts pm2-nihdev.service
    ↓
PM2 reads /home/nihdev/.pm2/dump.pm2
    ↓
PM2 resurrects all saved processes
    ↓
Apps start on configured ports
    ↓
Cloudflare Tunnel routes traffic
    ↓
✅ All apps online
```

---

# 📚 NAMING CONVENTIONS

## **Project Names:**

```
expense-tracker-{user-slug}

Examples:
- expense-tracker-ninh
- expense-tracker-nvn
- expense-tracker-john-doe
```

## **PM2 Process Names:**

```
Same as project name

Examples:
- chitieuninh (legacy)
- expense-tracker-nvn
- expense-tracker-john-doe
```

## **Database Names:**

```
{project_name_with_underscores}_db

Examples:
- chitieuninh_db
- expense_tracker_nvn_db
- expense_tracker_john_doe_db
```

## **Domains:**

```
{user-slug}.ninh.app

Examples:
- bangke.ninh.app (legacy)
- nvn.ninh.app
- john.ninh.app
```

## **Synology Folders:**

```
/Marketing/{User Name}/DuAnCuaToi/{project-folder}/

Examples:
- /Marketing/Ninh/DuAnCuaToi/chitieuninh/
- /Marketing/Ninh/DuAnCuaToi/taskgd/
- /Marketing/NVN/DuAnCuaToi/expense-tracker/
- /Marketing/John_Doe/DuAnCuaToi/expense-tracker/
```

**Structure:**

- `/Marketing/Ninh/` - Root folder for user Ninh
- `/Marketing/Ninh/DuAnCuaToi/` - Projects container folder (all projects go here)
- `/Marketing/Ninh/DuAnCuaToi/{project-folder}/` - Each project has its own folder with subfolders:
  - `source/` - Source code, configuration files
  - `uploads/` - User uploaded files (images, videos, documents, attachments)
  - `database/` - Database backups, exports
  - `logs/` - Application logs, error logs
  - `docs/` - Project documentation, guides

**Example for TASKGD:**

```
/Marketing/Ninh/DuAnCuaToi/taskgd/
├── source/          # Source code (optional, usually on server)
├── uploads/         # User uploaded files (images, PDFs, etc.)
├── database/        # Database backups
├── logs/            # Application logs
└── docs/            # Documentation
```

**Naming Convention:**

- User folders: Proper case (e.g., `Ninh`, `John_Doe`, `NVN`)
- Container folder: `DuAnCuaToi` (fixed name for all users)
- Project folders: Lowercase (e.g., `chitieuninh`, `taskgd`)
- Subfolder names: Lowercase (e.g., `uploads`, `database`, `logs`)
- Full NFS path for uploads: `/volume1/Marketing/{User Name}/DuAnCuaToi/{project-folder}/uploads/`

---

# 🖥️ SERVER PATHS & STORAGE CONFIGURATION

## **Ubuntu Server Information**

**Server Details:**

- IP: `100.115.191.19`
- OS: Ubuntu 24.04.3 LTS (Noble Numbat)
- User: `nihdev`
- Kernel: 6.8.0-85-generic

## **Storage Configuration (Updated: 2025-10-21)**

### **Primary Storage: WD HDD 1TB**

- Device: `/dev/sdb2`
- Mount: `/data`
- Size: 932 GB
- Used: 5.6 GB (1%)
- Free: 926 GB (99%)
- **Status:** ✅ **PRIMARY STORAGE FOR ALL PROJECTS**

### **System Storage: Kingston SSD 224GB**

- Device: `/dev/sda`
- Mount: `/` (root)
- Size: 100 GB allocated
- Used: 14 GB
- Free: 80 GB
- **Status:** ✅ **SYSTEM DRIVE (Ubuntu Server)**

### **Removable Storage: Crucial SSD 240GB**

- Device: `/dev/sdc2`
- Mount: `/media/nihdev/SSD`
- Size: 224 GB
- **Status:** ⚠️ **CAN BE REMOVED** (data migrated to HDD)

## **Project Paths on Ubuntu Server**

### **Main Projects Directory:**

```
/data/Ninh/projects/
├── chitieuninh/              # Port 3000, PM2: chitieuninh
├── expense-tracker-nvn/      # Port 3001, PM2: expense-tracker-nvn
├── taskgd/                   # Port 3003, PM2: taskgd-api
└── vps-manager/              # Port 3004, PM2: vps-manager
```

### **Secondary Projects Directory:**

```
/data/2.Ninh/Web/
├── incanto_test_webapp/
├── NVN/
├── TVA/
└── v0-bcct-moi/
```

### **Backups Directory:**

```
/data/backups/
├── projects/                 # Project tar.gz backups
├── postgresql/               # Database backups
├── pm2/                      # PM2 configs
├── env-files/                # Environment files
└── images/                   # Docker images
```

### **Scripts & Utilities:**

```
/data/Ninh/
├── scripts/                  # Automation scripts
├── logs/                     # Application logs
├── postgresql/               # PostgreSQL data
└── postgresql-docker/        # PostgreSQL Docker configs
```

### **Symbolic Links (for backward compatibility):**

```
/home/nihdev/
├── newsale → /data/SSD-Backup-20251021-122132/newsale
└── PostgreSQL → /data/SSD-Backup-20251021-122132/PostgreSQL
```

## **Path Mapping: Mac ↔ Ubuntu Server**

| Mac Local | Ubuntu Server | Description |
|-----------|---------------|-------------|
| `/Users/nihdev/Web/1/` | `/data/Ninh/projects/` | Main workspace |
| `/Users/nihdev/Web/chitieuninh/` | `/data/Ninh/projects/chitieuninh/` | Chitieuninh project |
| `/Users/nihdev/Web/TASKGD/` | `/data/Ninh/projects/taskgd/` | TASKGD project |
| `/Users/nihdev/Web/thuvienanh/Agents.md` | `/data/Ninh/projects/Agents.md` | This file (synced) |
| `/Users/nihdev/Web/1/PORT_REGISTRY.md` | `/data/Ninh/projects/PORT_REGISTRY.md` | Port registry |

## **Sync Commands**

### **Sync Project from Mac to Server:**

```bash
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
  /Users/nihdev/Web/{project-name}/ \
  nihdev@100.115.191.19:/data/Ninh/projects/{project-name}/
```

### **Sync Project from Server to Mac:**

```bash
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
  nihdev@100.115.191.19:/data/Ninh/projects/{project-name}/ \
  /Users/nihdev/Web/{project-name}/
```

### **Sync Agents.md:**

```bash
# Mac → Server
scp "/Users/nihdev/Web/thuvienanh/Agents.md" \
  nihdev@100.115.191.19:/data/Ninh/projects/Agents.md

# Server → Mac
scp nihdev@100.115.191.19:/data/Ninh/projects/Agents.md \
  "/Users/nihdev/Web/thuvienanh/Agents.md"
```

## **Important Notes**

1. **All projects run from `/data`** (WD HDD 1TB)
2. **Crucial SSD can be removed** after unmounting
3. **Kingston SSD** runs Ubuntu (DO NOT REMOVE)
4. **Symbolic links** maintain backward compatibility
5. **926 GB free space** available on HDD

---

# 💾 SYNOLOGY STORAGE SYSTEM

<a name="synology-overview"></a>

## **Overview**

All project files (uploads, database backups, logs) are stored on Synology NAS for centralized storage, automatic backups, and easy management.

**Synology NAS:**

- IP: `192.168.1.58`
- Port: `5000`
- Web UI: <http://192.168.1.58:5000>
- NFS Server: Enabled

<a name="synology-folder-structure"></a>

## **Folder Structure**

Each project has a dedicated folder under `/Marketing/Ninh/DuAnCuaToi/` with the following subfolders:

```
/volume1/Marketing/Ninh/DuAnCuaToi/{project-folder}/
├── source/          # Source code (optional, usually on server)
├── uploads/         # User uploaded files (images, videos, PDFs, documents, attachments)
├── database/        # Database backups, SQL dumps, exports
├── logs/            # Application logs, error logs, access logs
└── docs/            # Project documentation, guides, manuals
```

**Full Hierarchy:**

```
/volume1/Marketing/
└── Ninh/                           # User folder
    └── DuAnCuaToi/                 # Projects container
        ├── chitieuninh/            # Project 1
        │   ├── uploads/
        │   ├── database/
        │   ├── logs/
        │   └── docs/
        ├── taskgd/                 # Project 2 (TASKGD)
        │   ├── uploads/
        │   ├── database/
        │   ├── logs/
        │   └── docs/
        └── {other-projects}/       # Future projects
```

**Example for TASKGD:**

```
/volume1/Marketing/Ninh/DuAnCuaToi/taskgd/
├── source/          # (optional)
├── uploads/         # Task attachments, user uploads
├── database/        # taskgd_db backups
├── logs/            # PM2 logs, error logs
└── docs/            # API docs, user guides
```

**Naming Rules:**

- User folder: Proper case (e.g., `Ninh`, `John_Doe`, `NVN`)
- Container folder: `DuAnCuaToi` (fixed name, same for all users)
- Project folder: Lowercase (e.g., `chitieuninh`, `taskgd`, `expense-tracker`)
- Subfolders: Lowercase (e.g., `uploads`, `database`, `logs`, `docs`)

<a name="synology-nfs-mount-setup"></a>

## **NFS Mount Setup**

**Prerequisites:**

1. Create project folder on Synology
2. Enable NFS sharing for the folder
3. Set NFS permissions for Ubuntu server IP

**Step-by-Step:**

### **1. Create Synology Folders**

Login to Synology (<http://192.168.1.58:5000>):

```
File Station → Marketing → Ninh → DuAnCuaToi → Create Folder: {project-folder}
Inside {project-folder}, create:
  - uploads/
  - database/
  - logs/
  - docs/
```

**For TASKGD:**

```
File Station → Marketing → Ninh → DuAnCuaToi → Create Folder: taskgd
Inside taskgd, create:
  - uploads/
  - database/
  - logs/
  - docs/
```

### **2. Enable NFS Sharing**

```
Control Panel → Shared Folder → Select folder → Edit
→ NFS Permissions → Create
  - Server: 100.115.191.19
  - Privilege: Read/Write
  - Squash: Map all users to admin
  - Enable asynchronous
  - Allow connections from non-privileged ports
→ OK
```

### **3. Mount NFS on Ubuntu Server**

```bash
# Install NFS client (one-time setup)
ssh nihdev@100.115.191.19
sudo apt update
sudo apt install nfs-common -y

# Create mount point
sudo mkdir -p /mnt/synology/{project-name}-uploads

# Test mount (temporary)
sudo mount -t nfs 192.168.1.58:/volume1/Marketing/Ninh/DuAnCuaToi/{project-folder}/uploads /mnt/synology/{project-name}-uploads

# Verify mount
df -h | grep synology
ls -la /mnt/synology/{project-name}-uploads/

# If successful, add to /etc/fstab for auto-mount on boot
echo "192.168.1.58:/volume1/Marketing/Ninh/DuAnCuaToi/{project-folder}/uploads /mnt/synology/{project-name}-uploads nfs defaults 0 0" | sudo tee -a /etc/fstab

# Test fstab
sudo mount -a
df -h | grep synology
```

### **4. Create Symlink in Project Directory**

```bash
cd /data/Ninh/projects/{project-name}

# Remove local uploads folder (if exists)
rm -rf uploads

# Create symlink to Synology mount
ln -s /mnt/synology/{project-name}-uploads uploads

# Verify symlink
ls -la uploads
# Should show: uploads -> /mnt/synology/{project-name}-uploads

# Test write
touch uploads/test.txt
# Verify on Synology: /Marketing/Ninh/{project-folder}/uploads/test.txt should exist
```

**Example for TASKGD:**

```bash
# On Synology: Create /Marketing/Ninh/DuAnCuaToi/taskgd/uploads/ and enable NFS

# On Ubuntu Server:
sudo mkdir -p /mnt/synology/taskgd-uploads
sudo mount -t nfs 192.168.1.58:/volume1/Marketing/Ninh/DuAnCuaToi/taskgd/uploads /mnt/synology/taskgd-uploads
echo "192.168.1.58:/volume1/Marketing/Ninh/DuAnCuaToi/taskgd/uploads /mnt/synology/taskgd-uploads nfs defaults 0 0" | sudo tee -a /etc/fstab
cd /data/Ninh/projects/taskgd
rm -rf uploads
ln -s /mnt/synology/taskgd-uploads uploads
touch uploads/test.txt
```

<a name="synology-configuration"></a>

## **Configuration**

**Environment Variables (.env.production):**

```bash
# File Upload (Synology)
SYNOLOGY_HOST=192.168.1.58
SYNOLOGY_PORT=5000
SYNOLOGY_PATH=/Marketing/Ninh/DuAnCuaToi/{project-folder}/uploads
```

**Example for TASKGD:**

```bash
SYNOLOGY_HOST=192.168.1.58
SYNOLOGY_PORT=5000
SYNOLOGY_PATH=/Marketing/Ninh/DuAnCuaToi/taskgd/uploads
```

**Application Code:**

No code changes needed! The symlink makes Synology storage transparent to the application:

```typescript
// Application writes to local path
const uploadsDir = path.join(__dirname, '../uploads');

// But files are actually stored on Synology via symlink:
// /data/Ninh/projects/taskgd/uploads -> /mnt/synology/taskgd-uploads
// /mnt/synology/taskgd-uploads -> 192.168.1.58:/volume1/Marketing/Ninh/DuAnCuaToi/taskgd/uploads
```

**Benefits:**

- ✅ Centralized storage on Synology NAS
- ✅ Automatic Synology snapshots (backup)
- ✅ Easy file management via Synology UI
- ✅ No code changes required (transparent via symlink)
- ✅ Accessible from multiple servers (if needed)
- ✅ Better disk space management

**Troubleshooting:**

```bash
# Check if NFS is mounted
df -h | grep synology

# Check symlink
ls -la /data/Ninh/projects/{project-name}/uploads

# Remount if needed
sudo umount /mnt/synology/{project-name}-uploads
sudo mount -a

# Check NFS server
showmount -e 192.168.1.58

# Check permissions
ls -la /mnt/synology/{project-name}-uploads/
```

---

<a name="synology-hybrid-approach"></a>

## **Hybrid Storage Approach (Recommended)**

For production applications, the **Hybrid Approach** combines the best of both local and network storage:

### **Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│                    HYBRID STORAGE STRATEGY                   │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────────┐
│   UBUNTU SERVER      │         │   SYNOLOGY NAS           │
│   (Primary Storage)  │◄────────┤   (Backup Storage)       │
│                      │  Rsync  │                          │
│  /data/Ninh/projects/│  Every  │  /Marketing/Ninh/        │
│  ├── taskgd/         │  Hour   │  DuAnCuaToi/             │
│  │   ├── uploads/    │────────►│  ├── taskgd/             │
│  │   ├── database/   │         │  │   ├── uploads/        │
│  │   └── logs/       │         │  │   ├── database/       │
│  └── ...             │         │  │   └── logs/           │
└──────────────────────┘         └──────────────────────────┘
        ▲                                    │
        │                                    │
        │         ┌──────────────────────────┘
        │         │  Manual restore if needed
        │         ▼
        └─── Fast local access
```

### **How It Works:**

1. **Primary Storage: Ubuntu Server**
   - Application reads/writes directly to local disk
   - Best performance (no network latency)
   - Simple, stable, fast

2. **Backup Storage: Synology NAS**
   - Automatic rsync every hour (or real-time)
   - Synology snapshots for point-in-time recovery
   - Easy file management via Web UI

3. **Benefits:**
   - ✅ **Performance:** Local disk speed (~0ms latency)
   - ✅ **Reliability:** Automatic backup to Synology
   - ✅ **Recovery:** Restore from Synology if needed
   - ✅ **Independence:** App works even if Synology is down
   - ✅ **Management:** Easy file browsing via Synology UI
   - ✅ **Scalability:** Can switch to full NFS later if needed

### **Setup: Hourly Rsync Backup**

**Step 1: Create backup script**

```bash
# Create scripts directory
mkdir -p /data/Ninh/scripts

# Create backup script
cat > /data/Ninh/scripts/backup-to-synology.sh << 'EOF'
#!/bin/bash
# ============================================================================
# SYNOLOGY BACKUP SCRIPT - HYBRID APPROACH
# ============================================================================
# Purpose: Backup projects from Ubuntu server to Synology NAS
# Schedule: Runs every hour via cron
# ============================================================================

set -e

# Configuration
SYNOLOGY_USER="nihdev"
SYNOLOGY_IP="192.168.1.58"
SYNOLOGY_BASE="/volume1/Marketing/Ninh/DuAnCuaToi"
LOCAL_BASE="/data/Ninh/projects"
LOG_FILE="/var/log/synology-backup.log"

# Projects to backup
PROJECTS=(
    "taskgd"
    "chitieuninh"
    "expense-tracker-nvn"
    "vps-manager"
)

# Log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

log "=========================================="
log "Starting Synology backup..."
log "=========================================="

# Backup each project
for PROJECT in "${PROJECTS[@]}"; do
    if [ -d "${LOCAL_BASE}/${PROJECT}" ]; then
        log "Backing up ${PROJECT}..."

        # Rsync to Synology
        rsync -avz --delete \
            --exclude 'node_modules' \
            --exclude '.git' \
            --exclude '*.log' \
            --exclude '.env.local' \
            "${LOCAL_BASE}/${PROJECT}/" \
            "${SYNOLOGY_USER}@${SYNOLOGY_IP}:${SYNOLOGY_BASE}/${PROJECT}/" \
            2>&1 | tee -a "${LOG_FILE}"

        if [ ${PIPESTATUS[0]} -eq 0 ]; then
            log "✅ ${PROJECT} backup completed"
        else
            log "❌ ${PROJECT} backup failed"
        fi
    else
        log "⚠️  ${PROJECT} directory not found, skipping..."
    fi
done

log "=========================================="
log "Backup completed at $(date)"
log "=========================================="
EOF

# Make executable
chmod +x /data/Ninh/scripts/backup-to-synology.sh
```

**Step 2: Setup SSH key for passwordless rsync**

```bash
# Generate SSH key (if not exists)
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N ""

# Copy to Synology
ssh-copy-id nihdev@192.168.1.58

# Test connection
ssh nihdev@192.168.1.58 "echo 'SSH connection OK'"
```

**Step 3: Setup cron job**

```bash
# Edit crontab
crontab -e

# Add this line (backup every hour at minute 0)
0 * * * * /data/Ninh/scripts/backup-to-synology.sh >> /var/log/synology-backup.log 2>&1

# Or backup every 30 minutes
*/30 * * * * /data/Ninh/scripts/backup-to-synology.sh >> /var/log/synology-backup.log 2>&1
```

**Step 4: Test backup**

```bash
# Run backup manually
/data/Ninh/scripts/backup-to-synology.sh

# Check log
tail -f /var/log/synology-backup.log

# Verify on Synology
ssh nihdev@192.168.1.58 "ls -la /volume1/Marketing/Ninh/DuAnCuaToi/taskgd/"
```

### **Setup: Real-time Sync (Advanced)**

For critical applications that need real-time backup:

```bash
# Install lsyncd
sudo apt update
sudo apt install lsyncd -y

# Create config directory
sudo mkdir -p /etc/lsyncd

# Configure lsyncd
sudo tee /etc/lsyncd/lsyncd.conf.lua << 'EOF'
settings {
    logfile = "/var/log/lsyncd/lsyncd.log",
    statusFile = "/var/log/lsyncd/lsyncd.status",
    statusInterval = 20,
    nodaemon = false,
}

-- Sync taskgd
sync {
    default.rsync,
    source = "/data/Ninh/projects/taskgd/",
    target = "nihdev@192.168.1.58:/volume1/Marketing/Ninh/DuAnCuaToi/taskgd/",
    delay = 5,
    rsync = {
        archive = true,
        compress = true,
        verbose = false,
        _extra = {
            "--exclude=node_modules",
            "--exclude=.git",
            "--exclude=*.log",
        }
    }
}

-- Add more projects as needed
-- sync {
--     default.rsync,
--     source = "/data/Ninh/projects/chitieuninh/",
--     target = "nihdev@192.168.1.58:/volume1/Marketing/Ninh/DuAnCuaToi/chitieuninh/",
--     delay = 5,
--     rsync = { archive = true, compress = true }
-- }
EOF

# Create log directory
sudo mkdir -p /var/log/lsyncd

# Enable and start lsyncd
sudo systemctl enable lsyncd
sudo systemctl start lsyncd

# Check status
sudo systemctl status lsyncd

# Monitor real-time sync
sudo tail -f /var/log/lsyncd/lsyncd.log
```

### **Comparison: Rsync vs Lsyncd**

| Feature | Hourly Rsync | Real-time Lsyncd |
|---------|--------------|------------------|
| **Sync Frequency** | Every hour | Immediate (5s delay) |
| **CPU Usage** | Low (periodic) | Medium (continuous) |
| **Backup Delay** | Up to 1 hour | ~5 seconds |
| **Complexity** | Simple | Moderate |
| **Best For** | Most projects | Critical data |
| **Resource Usage** | Minimal | Higher |

**Recommendation:**

- **Hourly Rsync:** For most projects (taskgd, chitieuninh, etc.)
- **Real-time Lsyncd:** Only for critical data (database backups, important uploads)

### **Recovery Procedure**

If Ubuntu server fails, restore from Synology:

```bash
# 1. SSH to new/recovered server
ssh nihdev@100.115.191.19

# 2. Create project directory
mkdir -p /data/Ninh/projects

# 3. Restore from Synology
rsync -avz --progress \
    nihdev@192.168.1.58:/volume1/Marketing/Ninh/DuAnCuaToi/taskgd/ \
    /data/Ninh/projects/taskgd/

# 4. Verify files
ls -la /data/Ninh/projects/taskgd/

# 5. Restart application
cd /data/Ninh/projects/taskgd
pm2 restart taskgd-api
```

### **Monitoring**

**Check backup status:**

```bash
# View recent backups
tail -100 /var/log/synology-backup.log

# Check last backup time
grep "Backup completed" /var/log/synology-backup.log | tail -1

# Check for errors
grep "❌" /var/log/synology-backup.log | tail -10

# Compare file counts
echo "Local files:"
find /data/Ninh/projects/taskgd/uploads -type f | wc -l
echo "Synology files:"
ssh nihdev@192.168.1.58 "find /volume1/Marketing/Ninh/DuAnCuaToi/taskgd/uploads -type f | wc -l"
```

**Setup monitoring alert (optional):**

```bash
# Create monitoring script
cat > /data/Ninh/scripts/check-backup-status.sh << 'EOF'
#!/bin/bash
LOG_FILE="/var/log/synology-backup.log"
LAST_BACKUP=$(grep "Backup completed" "${LOG_FILE}" | tail -1 | awk '{print $1, $2}')
LAST_BACKUP_TIMESTAMP=$(date -d "${LAST_BACKUP}" +%s 2>/dev/null || echo 0)
CURRENT_TIMESTAMP=$(date +%s)
HOURS_SINCE_BACKUP=$(( (CURRENT_TIMESTAMP - LAST_BACKUP_TIMESTAMP) / 3600 ))

if [ ${HOURS_SINCE_BACKUP} -gt 2 ]; then
    echo "⚠️  WARNING: Last backup was ${HOURS_SINCE_BACKUP} hours ago!"
    # Send notification (email, Slack, etc.)
else
    echo "✅ Backup is up to date (${HOURS_SINCE_BACKUP} hours ago)"
fi
EOF

chmod +x /data/Ninh/scripts/check-backup-status.sh

# Run daily check
crontab -e
# Add: 0 9 * * * /data/Ninh/scripts/check-backup-status.sh
```

# 🎯 QUICK REFERENCE

## **Create New Project:**

```bash
/Users/nihdev/Web/1/create-new-project.sh
```

## **Check Port Availability:**

```bash
grep "🟢 Available" /Users/nihdev/Web/1/PORT_REGISTRY.md
```

## **Deploy Updates:**

```bash
# Sync files
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
  ./ nihdev@100.115.191.19:/data/Ninh/projects/{project-name}/

# Rebuild and restart
ssh nihdev@100.115.191.19 'cd /data/Ninh/projects/{project-name} && npm install && npm run build && pm2 restart {pm2-name}'
```

## **Check PM2 Status:**

```bash
ssh nihdev@100.115.191.19 'pm2 status'
```

## **View Logs:**

```bash
ssh nihdev@100.115.191.19 'pm2 logs {pm2-name} --lines 50'
```

## **Restart Cloudflare Tunnel:**

```bash
ssh nihdev@100.115.191.19 'echo "haininh1" | sudo -S systemctl restart cloudflared'
```

---

# AGENTS.md

> A comprehensive guide for AI coding agents working with this project. This file contains all context, configurations, templates, and workflows needed for effective AI-assisted development.

---

## Table of Contents

- [📚 AGENTS.MD - EXTENDED DOCUMENTATION](#-agentsmd---extended-documentation)
  - [Table of Contents](#table-of-contents)
- [📦 PROJECT CREATION AUTOMATION](#-project-creation-automation)
  - [**Overview**](#overview)
  - [**Script Location**](#script-location)
  - [**Usage**](#usage)
    - [**Quick Start:**](#quick-start)
    - [**Interactive Prompts:**](#interactive-prompts)
    - [**Example Session:**](#example-session)
  - [**What the Script Does**](#what-the-script-does)
    - [**Step 1: Requirements Check**](#step-1-requirements-check)
    - [**Step 2: Port Management**](#step-2-port-management)
    - [**Step 3: Project Creation**](#step-3-project-creation)
    - [**Step 4: Database Setup**](#step-4-database-setup)
    - [**Step 5: Deployment**](#step-5-deployment)
    - [**Step 6: Cloudflare Tunnel**](#step-6-cloudflare-tunnel)
    - [**Step 7: PORT\_REGISTRY Update**](#step-7-port_registry-update)
  - [**Post-Deployment Steps**](#post-deployment-steps)
  - [**Troubleshooting**](#troubleshooting)
    - [**Script fails at database creation:**](#script-fails-at-database-creation)
    - [**PM2 process won't start:**](#pm2-process-wont-start)
    - [**Domain not accessible:**](#domain-not-accessible)
  - [**Script Customization**](#script-customization)
    - [**Change Template Project:**](#change-template-project)
    - [**Change Server:**](#change-server)
    - [**Change Port Range:**](#change-port-range)
- [📋 PORT MANAGEMENT SYSTEM](#-port-management-system)
  - [**PORT\_REGISTRY.md**](#port_registrymd)
    - [**Format:**](#format)
    - [**Rules:**](#rules)
    - [**Commands:**](#commands)
- [🔄 AUTO-RESTART SYSTEM](#-auto-restart-system)
  - [**PM2 Startup Configuration**](#pm2-startup-configuration)
    - [**Setup (Already Done):**](#setup-already-done)
    - [**Verification:**](#verification)
    - [**How It Works:**](#how-it-works)
- [📚 NAMING CONVENTIONS](#-naming-conventions)
  - [**Project Names:**](#project-names)
  - [**PM2 Process Names:**](#pm2-process-names)
  - [**Database Names:**](#database-names)
  - [**Domains:**](#domains)
  - [**Synology Folders:**](#synology-folders)
- [🖥️ SERVER PATHS \& STORAGE CONFIGURATION](#️-server-paths--storage-configuration)
  - [**Ubuntu Server Information**](#ubuntu-server-information)
  - [**Storage Configuration (Updated: 2025-10-21)**](#storage-configuration-updated-2025-10-21)
    - [**Primary Storage: WD HDD 1TB**](#primary-storage-wd-hdd-1tb)
    - [**System Storage: Kingston SSD 224GB**](#system-storage-kingston-ssd-224gb)
    - [**Removable Storage: Crucial SSD 240GB**](#removable-storage-crucial-ssd-240gb)
  - [**Project Paths on Ubuntu Server**](#project-paths-on-ubuntu-server)
    - [**Main Projects Directory:**](#main-projects-directory)
    - [**Secondary Projects Directory:**](#secondary-projects-directory)
    - [**Backups Directory:**](#backups-directory)
    - [**Scripts \& Utilities:**](#scripts--utilities)
    - [**Symbolic Links (for backward compatibility):**](#symbolic-links-for-backward-compatibility)
  - [**Path Mapping: Mac ↔ Ubuntu Server**](#path-mapping-mac--ubuntu-server)
  - [**Sync Commands**](#sync-commands)
    - [**Sync Project from Mac to Server:**](#sync-project-from-mac-to-server)
    - [**Sync Project from Server to Mac:**](#sync-project-from-server-to-mac)
    - [**Sync Agents.md:**](#sync-agentsmd)
  - [**Important Notes**](#important-notes)
- [💾 SYNOLOGY STORAGE SYSTEM](#-synology-storage-system)
  - [**Overview**](#overview-1)
  - [**Folder Structure**](#folder-structure)
  - [**NFS Mount Setup**](#nfs-mount-setup)
    - [**1. Create Synology Folders**](#1-create-synology-folders)
    - [**2. Enable NFS Sharing**](#2-enable-nfs-sharing)
    - [**3. Mount NFS on Ubuntu Server**](#3-mount-nfs-on-ubuntu-server)
    - [**4. Create Symlink in Project Directory**](#4-create-symlink-in-project-directory)
  - [**Configuration**](#configuration)
  - [**Hybrid Storage Approach (Recommended)**](#hybrid-storage-approach-recommended)
    - [**Architecture:**](#architecture)
    - [**How It Works:**](#how-it-works-1)
    - [**Setup: Hourly Rsync Backup**](#setup-hourly-rsync-backup)
    - [**Setup: Real-time Sync (Advanced)**](#setup-real-time-sync-advanced)
    - [**Comparison: Rsync vs Lsyncd**](#comparison-rsync-vs-lsyncd)
    - [**Recovery Procedure**](#recovery-procedure)
    - [**Monitoring**](#monitoring)
- [🎯 QUICK REFERENCE](#-quick-reference)
  - [**Create New Project:**](#create-new-project)
  - [**Check Port Availability:**](#check-port-availability)
  - [**Deploy Updates:**](#deploy-updates)
  - [**Check PM2 Status:**](#check-pm2-status)
  - [**View Logs:**](#view-logs)
  - [**Restart Cloudflare Tunnel:**](#restart-cloudflare-tunnel)
- [AGENTS.md](#agentsmd)
  - [Table of Contents](#table-of-contents-1)
  - [Agent System Overview](#agent-system-overview)
    - [Purpose](#purpose)
    - [Benefits](#benefits)
    - [Core Principles](#core-principles)
      - [🚨 NGUYÊN TẮC QUAN TRỌNG VỀ GIAO DIỆN (UI/UX)](#-nguyên-tắc-quan-trọng-về-giao-diện-uiux)
  - [Quick Start (5 Minutes)](#quick-start-5-minutes)
    - [Step 1: Run Setup Script](#step-1-run-setup-script)
    - [Step 2: Restart VSCode](#step-2-restart-vscode)
    - [Step 3: Activate Serena Project](#step-3-activate-serena-project)
    - [Step 4: Test Agent System](#step-4-test-agent-system)
    - [Quick Usage Examples](#quick-usage-examples)
  - [Configuration](#configuration-1)
    - [augment-agents.json](#augment-agentsjson)
    - [augment-templates.json](#augment-templatesjson)
    - [.vscode/settings.json](#vscodesettingsjson)
  - [Templates Library](#templates-library)
    - [1. Component Template](#1-component-template)
    - [2. Page Template](#2-page-template)
    - [3. API Route Template](#3-api-route-template)
    - [4. Hook Template](#4-hook-template)
    - [5. Service Template](#5-service-template)
  - [Prompt Library](#prompt-library)
    - [Component Creation Prompts](#component-creation-prompts)
    - [Page Creation Prompts](#page-creation-prompts)
    - [API Creation Prompts](#api-creation-prompts)
    - [Testing Prompts](#testing-prompts)
    - [Optimization Prompts](#optimization-prompts)
    - [Cleanup \& Refactoring Prompts](#cleanup--refactoring-prompts)
    - [Workflow Prompts](#workflow-prompts)
  - [Best Practices from agents.md](#best-practices-from-agentsmd)
    - [1. Keep It Focused](#1-keep-it-focused)
    - [2. Be Specific and Actionable](#2-be-specific-and-actionable)
    - [3. Include Testing Instructions](#3-include-testing-instructions)
    - [4. PR and Commit Guidelines](#4-pr-and-commit-guidelines)
    - [5. Monorepo Support](#5-monorepo-support)
    - [6. Security Considerations](#6-security-considerations)
    - [7. Development Environment Tips](#7-development-environment-tips)
  - [Usage Examples](#usage-examples)
    - [Example 1: Complete Login Feature](#example-1-complete-login-feature)
    - [Example 2: Dashboard with Analytics](#example-2-dashboard-with-analytics)
    - [Example 3: CRUD API for Products](#example-3-crud-api-for-products)
    - [Example 4: Reusable Data Table Component](#example-4-reusable-data-table-component)
    - [Example 5: Image Upload with Preview](#example-5-image-upload-with-preview)
  - [Apple Design System Specs](#apple-design-system-specs)
    - [Typography](#typography)
    - [Colors](#colors)
    - [Spacing](#spacing)
    - [Border Radius](#border-radius)
    - [Shadows](#shadows)
    - [Animations](#animations)
    - [Responsive Breakpoints](#responsive-breakpoints)
    - [Touch Targets](#touch-targets)
    - [Accessibility](#accessibility)
  - [Troubleshooting](#troubleshooting-1)
    - [Common Issues](#common-issues)
  - [MCP Servers Integration](#mcp-servers-integration)
    - [Serena MCP (Coding Tools)](#serena-mcp-coding-tools)
    - [Human MCP (AI Tools)](#human-mcp-ai-tools)
    - [Combining MCP Servers](#combining-mcp-servers)
  - [Project Cleanup System](#project-cleanup-system)
    - [Overview](#overview-2)
    - [Garbage Patterns](#garbage-patterns)
      - [Auto-Generated Documentation](#auto-generated-documentation)
      - [Backup \& Temporary Files](#backup--temporary-files)
      - [Log \& Cache Files](#log--cache-files)
      - [System Files](#system-files)
      - [Old Test Files](#old-test-files)
    - [Protected Patterns](#protected-patterns)
      - [Essential Configuration](#essential-configuration)
      - [Source Code \& Assets](#source-code--assets)
      - [Important Documentation](#important-documentation)
      - [System Directories](#system-directories)
    - [Cleanup Workflow](#cleanup-workflow)
      - [Phase 1: Scan \& Analysis](#phase-1-scan--analysis)
      - [Phase 2: Garbage Cleanup](#phase-2-garbage-cleanup)
      - [Phase 3: Structure Optimization](#phase-3-structure-optimization)
      - [Phase 4: Verification \& Reporting](#phase-4-verification--reporting)
    - [Usage Guide](#usage-guide)
      - [Quick Commands](#quick-commands)
      - [Augment Commands \& Keybindings](#augment-commands--keybindings)
    - [Quick Cleanup Script](#quick-cleanup-script)
    - [Best Practices](#best-practices)
      - [1. Always Run Dry-Run First](#1-always-run-dry-run-first)
      - [2. Backup Important Files](#2-backup-important-files)
      - [3. Review Scan Results](#3-review-scan-results)
      - [4. Run Cleanup Regularly](#4-run-cleanup-regularly)
      - [5. Configure .gitignore](#5-configure-gitignore)
      - [6. Customize Patterns](#6-customize-patterns)
      - [7. Test After Cleanup](#7-test-after-cleanup)
    - [Troubleshooting](#troubleshooting-2)
      - [Issue: Important file was deleted](#issue-important-file-was-deleted)
      - [Issue: Cleanup is too slow](#issue-cleanup-is-too-slow)
      - [Issue: False positives in scan](#issue-false-positives-in-scan)
      - [Issue: Cleanup fails with errors](#issue-cleanup-fails-with-errors)
  - [Development Workflow for Low-Code/AI-Assisted Projects](#development-workflow-for-low-codeai-assisted-projects)
    - [Frontend-First vs Backend-First Analysis](#frontend-first-vs-backend-first-analysis)
      - [Comparison Table](#comparison-table)
      - [Recommendation: **Frontend-First for AI-Assisted Development**](#recommendation-frontend-first-for-ai-assisted-development)
    - [Standard Project Structure](#standard-project-structure)
    - [Tech Stack Recommendations](#tech-stack-recommendations)
    - [Step-by-Step Development Workflow](#step-by-step-development-workflow)
      - [Workflow Diagram](#workflow-diagram)
      - [Phase 1: Project Initialization (15 minutes)](#phase-1-project-initialization-15-minutes)
      - [Phase 2: UI Design \& Mockups (30 minutes)](#phase-2-ui-design--mockups-30-minutes)
      - [Phase 3: Build UI Components (60 minutes)](#phase-3-build-ui-components-60-minutes)
      - [Phase 4: Create Pages with Mock Data (45 minutes)](#phase-4-create-pages-with-mock-data-45-minutes)
      - [Phase 5: Test UI/UX (30 minutes)](#phase-5-test-uiux-30-minutes)
      - [Phase 6: Backend Setup (60 minutes)](#phase-6-backend-setup-60-minutes)
      - [Phase 7: Create API Routes (90 minutes)](#phase-7-create-api-routes-90-minutes)
      - [Phase 8: Connect Frontend to Backend (60 minutes)](#phase-8-connect-frontend-to-backend-60-minutes)
      - [Phase 9: Add Authentication (45 minutes)](#phase-9-add-authentication-45-minutes)
      - [Phase 10: Testing \& Optimization (90 minutes)](#phase-10-testing--optimization-90-minutes)
      - [Phase 11: Deployment (30 minutes)](#phase-11-deployment-30-minutes)
    - [Total Estimated Time](#total-estimated-time)
    - [Best Practices for AI-Assisted Development](#best-practices-for-ai-assisted-development)
      - [1. Writing Effective Prompts](#1-writing-effective-prompts)
      - [2. Verifying AI-Generated Code](#2-verifying-ai-generated-code)
      - [3. Iterating and Refining](#3-iterating-and-refining)
      - [4. Common Pitfalls to Avoid](#4-common-pitfalls-to-avoid)
    - [Conclusion](#conclusion)
  - [Quick Reference](#quick-reference)
    - [Essential Commands](#essential-commands)
    - [Most Used Prompts](#most-used-prompts)
    - [File Structure Quick Reference](#file-structure-quick-reference)
    - [Support \& Resources](#support--resources)
- [🎨 LIQUID GLASS DESIGN SYSTEM (COMPREHENSIVE)](#-liquid-glass-design-system-comprehensive)
  - [📋 Table of Contents](#-table-of-contents)
  - [🎨 Kiến Trúc Thiết Kế](#-kiến-trúc-thiết-kế)
    - [**3-Layer Architecture**](#3-layer-architecture)
      - [**Layer 1: Background Layer (z-index: 0)**](#layer-1-background-layer-z-index-0)
      - [**Layer 2: Surface Layer (z-index: 1-9)**](#layer-2-surface-layer-z-index-1-9)
      - [**Layer 3: Content Layer (z-index: 10-50)**](#layer-3-content-layer-z-index-10-50)
  - [🌈 Hệ Thống Màu Sắc](#-hệ-thống-màu-sắc)
    - [**Background Gradients**](#background-gradients)
    - [**Blur Orbs**](#blur-orbs)
    - [**Glass Surfaces**](#glass-surfaces)
      - [**Level 1: 30% Opacity (Main Containers)**](#level-1-30-opacity-main-containers)
      - [**Level 2: 20% Opacity (Overlays)**](#level-2-20-opacity-overlays)
      - [**Level 3: 70% Opacity (Cards)**](#level-3-70-opacity-cards)
      - [**Level 4: 90% Opacity (Buttons)**](#level-4-90-opacity-buttons)
    - [**iOS Blue #007AFF**](#ios-blue-007aff)
    - [**Semantic Colors**](#semantic-colors)
      - [**Priority Colors**](#priority-colors)
      - [**Status Colors**](#status-colors)
    - [**Text Hierarchy**](#text-hierarchy)
  - [📝 Typography System](#-typography-system)
    - [**Font Stack**](#font-stack)
    - [**Font Sizes**](#font-sizes)
    - [**Font Weights**](#font-weights)
    - [**Line Height**](#line-height)
  - [📏 Spacing System (8pt Grid)](#-spacing-system-8pt-grid)
    - [**Base Unit: 4px**](#base-unit-4px)
    - [**Padding System**](#padding-system)
    - [**Gap System**](#gap-system)
    - [**Touch Targets: 44px Minimum**](#touch-targets-44px-minimum)
  - [🔘 Border Radius](#-border-radius)
    - [**Primary: 20px (1.25rem)**](#primary-20px-125rem)
    - [**Squircle Aesthetic**](#squircle-aesthetic)
    - [**Radius-to-Size Ratios**](#radius-to-size-ratios)
  - [🌓 Shadow System](#-shadow-system)
    - [**5% Opacity - Why So Subtle?**](#5-opacity---why-so-subtle)
    - [**Colored Shadows (Blue Glow)**](#colored-shadows-blue-glow)
  - [🎭 Backdrop Blur](#-backdrop-blur)
    - [**4 Levels**](#4-levels)
  - [🎬 Animation System](#-animation-system)
    - [**150ms Duration (iOS Standard)**](#150ms-duration-ios-standard)
    - [**Scale Animations**](#scale-animations)
  - [📱 Mobile-First Patterns](#-mobile-first-patterns)
    - [**448px Container (iPhone 14 Pro Max)**](#448px-container-iphone-14-pro-max)
  - [�� Interaction Patterns](#-interaction-patterns)
    - [**Tap Targets**](#tap-targets)
  - [🎨 Design Philosophy](#-design-philosophy)
    - [**5 Core Principles**](#5-core-principles)
  - [📊 Technical Specs](#-technical-specs)
    - [**Performance Budget**](#performance-budget)
    - [**Browser Support**](#browser-support)
    - [**Accessibility**](#accessibility-1)
- [🚀 CLOUDFLARE TUNNEL DEPLOYMENT](#-cloudflare-tunnel-deployment)
  - [**Overview**](#overview-3)
  - [**Prerequisites**](#prerequisites)
    - [**1. Server Requirements**](#1-server-requirements)
    - [**2. Installed Software**](#2-installed-software)
    - [**3. Cloudflare Tunnel**](#3-cloudflare-tunnel)
    - [**4. Domain**](#4-domain)
  - [**Deployment Architecture**](#deployment-architecture)
  - [**Step-by-Step Deployment Guide**](#step-by-step-deployment-guide)
    - [**Step 1: Prepare Local Project**](#step-1-prepare-local-project)
    - [**Step 2: Create Upload Directory Structure on Server**](#step-2-create-upload-directory-structure-on-server)
    - [**Step 3: Sync Files to Server**](#step-3-sync-files-to-server)
    - [**Step 4: Install Dependencies and Build on Server**](#step-4-install-dependencies-and-build-on-server)
    - [**Step 5: Create PostgreSQL Database**](#step-5-create-postgresql-database)
    - [**Step 6: Configure PM2 Process**](#step-6-configure-pm2-process)
    - [**Step 7: Update Cloudflare Tunnel Config**](#step-7-update-cloudflare-tunnel-config)
    - [**Step 8: Create DNS Route (CRITICAL)**](#step-8-create-dns-route-critical)
    - [**Step 9: Wait for DNS Propagation**](#step-9-wait-for-dns-propagation)
    - [**Step 10: Test Deployment**](#step-10-test-deployment)
  - [**Automated Deployment Script**](#automated-deployment-script)
  - [**Troubleshooting**](#troubleshooting-3)
    - [**Problem 1: HTTP 530 Error**](#problem-1-http-530-error)
    - [**Problem 2: Build Fails on Server**](#problem-2-build-fails-on-server)
    - [**Problem 3: Cloudflared Connection Timeout**](#problem-3-cloudflared-connection-timeout)
    - [**Problem 4: DNS Record Already Exists**](#problem-4-dns-record-already-exists)
    - [**Problem 5: PM2 Process Not Starting**](#problem-5-pm2-process-not-starting)
  - [**Best Practices**](#best-practices-1)
    - [**1. Always Use --overwrite-dns Flag**](#1-always-use---overwrite-dns-flag)
    - [**2. Always Install ALL Dependencies on Server**](#2-always-install-all-dependencies-on-server)
    - [**3. Always Wait for DNS Propagation**](#3-always-wait-for-dns-propagation)
    - [**4. Always Verify Each Step**](#4-always-verify-each-step)
    - [**5. Always Check Logs When Debugging**](#5-always-check-logs-when-debugging)
  - [**Quick Reference Commands**](#quick-reference-commands)
    - [**Deployment**](#deployment)
    - [**PM2 Management**](#pm2-management)
    - [**Cloudflare Tunnel**](#cloudflare-tunnel)
    - [**Testing**](#testing)
  - [**Success Checklist**](#success-checklist)
  - [**Real-World Example: Thư Viện Ảnh**](#real-world-example-thư-viện-ảnh)

---

## Agent System Overview

### Purpose

This Agent System enables **automated, efficient, and professional** development with AI coding assistants (Augment, Cursor, Copilot, etc.). It provides:

- 🚀 **Full Automation** - Create components, pages, APIs with simple prompts
- 🎨 **Apple Design System** - All UI follows Apple Human Interface Guidelines
- 🔧 **Clean Code** - High code quality, TypeScript strict mode
- 🧹 **Auto Cleanup** - Automatic workspace organization
- 🔌 **MCP Integration** - Serena (coding tools) + Human MCP (AI tools)
- 📱 **Responsive** - Mobile-first, all breakpoints covered
- ⚡ **Performance** - 60fps animations, <2s initial load

### Benefits

1. **Speed**: Generate production-ready code 10x faster
2. **Consistency**: All code follows same conventions and design system
3. **Quality**: Built-in best practices, TypeScript, testing
4. **Flexibility**: 8+ templates, 100+ prompts, customizable workflows
5. **Integration**: Works with Serena MCP (12+ coding tools) and Human MCP (27 AI tools)

### Core Principles

- ✅ **Vietnamese communication** - All interactions in Vietnamese
- ✅ **No auto-docs** - No auto-generated .md files
- ✅ **No auto-commit** - Manual git control
- ✅ **Concise output** - Brief, actionable reports
- ✅ **Immediate execution** - Execute tasks without unnecessary confirmations
- ✅ **Clean workspace** - Auto-cleanup of unused files
- ✅ **Deep analysis** - Thorough understanding before execution
- ✅ **Minimal output** - Think deeply, present concisely

#### 🚨 NGUYÊN TẮC QUAN TRỌNG VỀ GIAO DIỆN (UI/UX)

**KHÔNG TỰ Ý THAY ĐỔI UI:**

- ❌ **TUYỆT ĐỐI KHÔNG TỰ Ý THAY ĐỔI GIAO DIỆN** - Không được modify, refactor, hoặc "cải thiện" UI/UX components, layouts, styles, colors, spacing, animations khi không được yêu cầu rõ ràng
- ❌ **KHÔNG TỰ Ý "OPTIMIZE" UI** - Không được tự động apply best practices, design patterns, hoặc accessibility improvements cho UI nếu không được chỉ định
- ❌ **KHÔNG THAY ĐỔI DESIGN SYSTEM** - Giữ nguyên Apple Design System specs, colors, typography, spacing đã được định nghĩa
- ✅ **CHỈ THAY ĐỔI KHI ĐƯỢC YÊU CẦU** - Chỉ modify UI khi user explicitly request: "Thay đổi màu button", "Cải thiện layout", "Apply responsive design", etc.
- ✅ **HỎI TRƯỚC KHI THAY ĐỔI** - Nếu phát hiện UI issue hoặc có suggestion, hỏi user trước: "Tôi thấy button size không consistent, bạn có muốn tôi fix không?"

**Áp dụng cho:**

- Components (Button, Input, Card, Modal, etc.)
- Pages (Login, Dashboard, Profile, etc.)
- Layouts (Header, Sidebar, Footer)
- Styles (colors, spacing, typography, animations)
- Responsive breakpoints
- Dark mode
- Accessibility features

**Ngoại lệ duy nhất:**

- ✅ Bug fixes (UI broken, không render, errors)
- ✅ Security issues (XSS, injection vulnerabilities)
- ✅ Critical accessibility violations (WCAG failures)

---

## Quick Start (5 Minutes)

### Step 1: Run Setup Script

```bash
./setup-agent-system.sh
```

This automatically:

- ✅ Checks environment (Node.js, npm, uv)
- ✅ Creates folder structure
- ✅ Validates configuration files
- ✅ Creates example component
- ✅ Sets up .gitignore
- ✅ Checks MCP servers

### Step 2: Restart VSCode

```
Command Palette (Cmd+Shift+P) → "Developer: Reload Window"
```

Or close and reopen VSCode.

### Step 3: Activate Serena Project

Tell Augment AI:

```
Activate current directory as project
```

Serena will index your project code for tool usage.

### Step 4: Test Agent System

Try creating your first component:

```
Tạo component PrimaryButton kiểu button với Apple Design
```

Augment will automatically create:

- `src/components/PrimaryButton/PrimaryButton.tsx`
- `src/components/PrimaryButton/index.ts`

### Quick Usage Examples

**Create Component:**

```
Tạo component LoginForm kiểu form với Apple Design
```

**Create Page:**

```
Tạo page Dashboard tại route /dashboard
```

**Create API:**

```
Tạo API POST /api/auth/login
```

**Create Hook:**

```
Tạo hook useAuth
```

**Cleanup:**

```
Cleanup workspace và remove unused files
```

---

## Configuration

### augment-agents.json

Complete agent system configuration:

```json
{
  "agentSystem": {
    "version": "1.0.0",
    "language": "vietnamese",
    "principles": {
      "noAutoDocs": true,
      "noAutoCommit": true,
      "conciseOutput": true,
      "immediateExecution": true,
      "cleanWorkspace": true,
      "deepAnalysis": true,
      "minimalOutput": true
    },
    "designSystem": {
      "platform": "macOS",
      "typography": "-apple-system, Inter, SF Pro Display, sans-serif",
      "colors": "sf-symbols",
      "spacing": "8px-grid",
      "borderRadius": "8-16px",
      "shadows": "subtle-soft",
      "animations": {
        "timing": "cubic-bezier(0.4, 0.0, 0.2, 1)",
        "duration": {
          "fast": "200-300ms",
          "normal": "400-600ms"
        },
        "effects": {
          "scale": "1.02-1.05",
          "transitions": "fade-slide"
        }
      },
      "responsive": {
        "breakpoints": {
          "sm": "640px",
          "md": "768px",
          "lg": "1024px",
          "xl": "1280px"
        },
        "approach": "mobile-first",
        "touchTargets": "44x44px"
      }
    },
    "agents": {
      "execution": {
        "enabled": true,
        "autoConfirm": true,
        "priority": "high",
        "capabilities": [
          "code-generation",
          "file-creation",
          "dependency-management",
          "testing",
          "optimization"
        ]
      },
      "design": {
        "enabled": true,
        "strictAppleGuidelines": true,
        "priority": "high",
        "capabilities": [
          "ui-generation",
          "style-application",
          "responsive-design",
          "animation-implementation",
          "design-validation"
        ]
      },
      "analysis": {
        "enabled": true,
        "deepAnalysis": true,
        "priority": "medium",
        "capabilities": [
          "code-analysis",
          "performance-analysis",
          "security-analysis",
          "dependency-analysis",
          "architecture-review"
        ]
      },
      "fileManager": {
        "enabled": true,
        "autoCleanup": true,
        "priority": "low",
        "capabilities": [
          "workspace-cleanup",
          "file-organization",
          "duplicate-detection",
          "unused-code-removal",
          "structure-optimization"
        ]
      }
    },
    "mcpServers": {
      "serena": {
        "enabled": true,
        "useCases": [
          "code-search",
          "symbol-navigation",
          "file-operations",
          "project-onboarding"
        ]
      },
      "humanMcp": {
        "enabled": true,
        "useCases": [
          "visual-analysis",
          "image-generation",
          "document-processing",
          "speech-synthesis"
        ]
      }
    },
    "workflow": {
      "onTaskReceived": [
        "analyze-requirements",
        "check-design-needs",
        "execute-task",
        "apply-design-system",
        "optimize-code",
        "cleanup-workspace",
        "generate-report"
      ],
      "onFileCreated": [
        "validate-structure",
        "apply-formatting",
        "check-quality"
      ],
      "onProjectOpen": [
        "activate-serena-project",
        "load-agent-config",
        "check-dependencies"
      ]
    },
    "output": {
      "format": "concise",
      "language": "vietnamese",
      "structure": {
        "completed": "bullet-points",
        "pending": "brief-reasons",
        "suggestions": "1-2-key-points"
      },
      "maxLines": {
        "summary": 10,
        "details": 50
      }
    },
    "quality": {
      "codeStandards": "clean-code",
      "designStandards": "apple-hig",
      "performanceTargets": {
        "initialLoad": "<2s",
        "fps": "60fps",
        "bundleSize": "optimized"
      },
      "accessibility": {
        "wcag": "AA",
        "touchTargets": "44x44px",
        "contrast": "4.5:1"
      }
    }
  }
}
```

### augment-templates.json

Complete templates configuration:

```json
{
  "templates": {
    "component": {
      "name": "React Component (Apple Design)",
      "trigger": "@augment-task: create-component",
      "parameters": {
        "componentName": "string",
        "componentType": "button|input|card|modal|form|layout",
        "design": "apple-macos",
        "responsive": "boolean",
        "animations": "boolean"
      },
      "prompt": "Tạo React component {componentName} kiểu {componentType} với Apple Design System:\n- TypeScript interface đầy đủ\n- Responsive design (mobile-first)\n- Smooth animations (cubic-bezier)\n- Clean code, no comments\n- Export named\n- Tailwind CSS với Apple colors",
      "outputFiles": [
        "src/components/{componentName}/{componentName}.tsx",
        "src/components/{componentName}/index.ts"
      ]
    },
    "page": {
      "name": "Next.js Page (Apple Design)",
      "trigger": "@augment-task: create-page",
      "parameters": {
        "pageName": "string",
        "routePath": "string",
        "layoutType": "default|centered|sidebar|dashboard",
        "seo": "boolean"
      },
      "prompt": "Tạo Next.js page {pageName} tại route {routePath}:\n- App Router compatible\n- SEO optimized (metadata)\n- Apple Design System\n- Loading states\n- Error boundaries\n- TypeScript strict mode",
      "outputFiles": [
        "src/app/{routePath}/page.tsx",
        "src/app/{routePath}/loading.tsx",
        "src/app/{routePath}/error.tsx"
      ]
    },
    "api": {
      "name": "API Route (Type-safe)",
      "trigger": "@augment-task: create-api",
      "parameters": {
        "apiName": "string",
        "method": "GET|POST|PUT|DELETE|PATCH",
        "routePath": "string",
        "validation": "boolean",
        "auth": "boolean"
      },
      "prompt": "Tạo API route {apiName} với method {method}:\n- TypeScript types đầy đủ\n- Input validation (Zod)\n- Error handling\n- Security headers\n- Rate limiting ready\n- Clean response format",
      "outputFiles": [
        "src/app/api/{routePath}/route.ts",
        "src/types/api/{apiName}.ts"
      ]
    },
    "hook": {
      "name": "React Hook (Type-safe)",
      "trigger": "@augment-task: create-hook",
      "parameters": {
        "hookName": "string",
        "hookType": "state|effect|context|custom",
        "typescript": "boolean"
      },
      "prompt": "Tạo React hook {hookName}:\n- TypeScript generics\n- Clean implementation\n- Proper dependencies\n- Error handling\n- Memoization nếu cần",
      "outputFiles": [
        "src/hooks/{hookName}.ts"
      ]
    },
    "service": {
      "name": "Service Layer",
      "trigger": "@augment-task: create-service",
      "parameters": {
        "serviceName": "string",
        "serviceType": "api|database|auth|storage|cache",
        "singleton": "boolean"
      },
      "prompt": "Tạo service {serviceName} kiểu {serviceType}:\n- TypeScript class/functions\n- Error handling\n- Type-safe methods\n- Singleton pattern nếu cần\n- Clean architecture",
      "outputFiles": [
        "src/services/{serviceName}.ts",
        "src/types/{serviceName}.ts"
      ]
    },
    "util": {
      "name": "Utility Functions",
      "trigger": "@augment-task: create-util",
      "parameters": {
        "utilName": "string",
        "category": "string|number|array|object|date|validation"
      },
      "prompt": "Tạo utility functions {utilName} cho {category}:\n- Pure functions\n- TypeScript generics\n- Unit test ready\n- Tree-shakeable\n- JSDoc comments",
      "outputFiles": [
        "src/utils/{utilName}.ts"
      ]
    },
    "test": {
      "name": "Test Suite",
      "trigger": "@augment-task: create-test",
      "parameters": {
        "testTarget": "string",
        "testType": "unit|integration|e2e",
        "framework": "jest|vitest|playwright"
      },
      "prompt": "Tạo test suite cho {testTarget}:\n- {framework} framework\n- {testType} tests\n- Coverage đầy đủ\n- Mock data\n- Edge cases",
      "outputFiles": [
        "src/__tests__/{testTarget}.test.ts"
      ]
    },
    "style": {
      "name": "Style Module (Apple Design)",
      "trigger": "@augment-task: create-style",
      "parameters": {
        "styleName": "string",
        "styleType": "component|layout|theme|utilities"
      },
      "prompt": "Tạo style module {styleName}:\n- Tailwind CSS classes\n- Apple Design System\n- Responsive utilities\n- Animation classes\n- Dark mode support",
      "outputFiles": [
        "src/styles/{styleName}.css"
      ]
    }
  },
  "conventions": {
    "naming": {
      "components": "PascalCase",
      "files": "kebab-case or PascalCase",
      "functions": "camelCase",
      "constants": "UPPER_SNAKE_CASE",
      "types": "PascalCase",
      "interfaces": "PascalCase (prefix I optional)"
    },
    "structure": {
      "components": "src/components/{ComponentName}/{ComponentName}.tsx",
      "pages": "src/app/{route}/page.tsx",
      "api": "src/app/api/{route}/route.ts",
      "hooks": "src/hooks/{hookName}.ts",
      "utils": "src/utils/{category}/{utilName}.ts",
      "types": "src/types/{module}.ts",
      "styles": "src/styles/{module}.css",
      "tests": "src/__tests__/{target}.test.ts"
    },
    "imports": {
      "order": [
        "react",
        "next",
        "third-party",
        "components",
        "hooks",
        "utils",
        "types",
        "styles"
      ],
      "aliases": {
        "@/components": "src/components",
        "@/hooks": "src/hooks",
        "@/utils": "src/utils",
        "@/types": "src/types",
        "@/styles": "src/styles",
        "@/lib": "src/lib"
      }
    }
  },
  "quickCommands": {
    "component": "Tạo component {name} kiểu {type} với Apple Design",
    "page": "Tạo page {name} tại route {path}",
    "api": "Tạo API {method} {path}",
    "hook": "Tạo hook {name}",
    "test": "Tạo tests cho {target}",
    "optimize": "Optimize performance của {target}",
    "cleanup": "Cleanup workspace và remove unused code",
    "analyze": "Analyze project structure và code quality"
  }
}
```

### .vscode/settings.json

VSCode configuration for Augment Code:

```json
{
  "augment.codeEnabled": true,
  "augment.codeAgentSystem": true,
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "typescript.suggest.autoImports": true,
  "editor.inlineSuggest.enabled": true,
  "editor.quickSuggestions": {
    "strings": true
  },
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll": "explicit",
    "source.organizeImports": "explicit"
  },
  "files.exclude": {
    "**/.DS_Store": true,
    "**/*.bak": true,
    "**/*.tmp": true,
    "**/node_modules/.cache": true
  },
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/.git/objects/**": true,
    "**/.git/subtree-cache/**": true,
    "**/dist/**": true,
    "**/build/**": true
  }
}
```

---

## Templates Library

### 1. Component Template

**Command:**

```
Tạo component {name} kiểu {type} với Apple Design
```

**Types:** button, input, card, modal, form, layout

**Parameters:**

- `componentName`: Name of the component (PascalCase)
- `componentType`: button | input | card | modal | form | layout
- `design`: apple-macos (default)
- `responsive`: true (default)
- `animations`: true (default)

**Output Files:**

```
src/components/{ComponentName}/
  ├── {ComponentName}.tsx
  └── index.ts
```

**Example:**

```
Tạo component PrimaryButton kiểu button với Apple Design
```

**Generated Code:**

```typescript
// src/components/PrimaryButton/PrimaryButton.tsx
interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  onClick,
  variant = 'solid',
  size = 'md',
  disabled = false,
  loading = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        rounded-xl font-semibold transition-all duration-300
        ${size === 'sm' ? 'px-4 py-2 text-sm' : ''}
        ${size === 'md' ? 'px-6 py-3 text-base' : ''}
        ${size === 'lg' ? 'px-8 py-4 text-lg' : ''}
        ${variant === 'solid' ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
        ${variant === 'outline' ? 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50' : ''}
        ${variant === 'ghost' ? 'text-blue-500 hover:bg-blue-50' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-102'}
      `}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};
```

---

### 2. Page Template

**Command:**

```
Tạo page {name} tại route {path}
```

**Parameters:**

- `pageName`: Name of the page (PascalCase)
- `routePath`: Route path (e.g., /dashboard, /profile)
- `layoutType`: default | centered | sidebar | dashboard
- `seo`: true (default)

**Output Files:**

```
src/app/{path}/
  ├── page.tsx
  ├── loading.tsx
  └── error.tsx
```

**Example:**

```
Tạo page Dashboard tại route /dashboard
```

---

### 3. API Route Template

**Command:**

```
Tạo API {method} /api/{path}
```

**Parameters:**

- `apiName`: Name of the API (camelCase)
- `method`: GET | POST | PUT | DELETE | PATCH
- `routePath`: API route path
- `validation`: true (default)
- `auth`: false (default)

**Output Files:**

```
src/app/api/{path}/
  └── route.ts
src/types/api/
  └── {apiName}.ts
```

**Example:**

```
Tạo API POST /api/auth/login
```

---

### 4. Hook Template

**Command:**

```
Tạo hook {name}
```

**Parameters:**

- `hookName`: Name of the hook (use prefix)
- `hookType`: state | effect | context | custom
- `typescript`: true (default)

**Output Files:**

```
src/hooks/{hookName}.ts
```

**Example:**

```
Tạo hook useAuth
```

---

### 5. Service Template

**Command:**

```
Tạo service {name} kiểu {type}
```

**Parameters:**

- `serviceName`: Name of the service (PascalCase)
- `serviceType`: api | database | auth | storage | cache
- `singleton`: false (default)

**Output Files:**

```
src/services/{serviceName}.ts
src/types/{serviceName}.ts
```

**Example:**

```
Tạo service AuthService kiểu auth
```

---

## Prompt Library

### Component Creation Prompts

**Basic Component:**

```
Tạo component {ComponentName} với:
- TypeScript interface đầy đủ
- Apple Design System
- Responsive design
- Clean code, no comments
- Export named
```

**Form Component:**

```
Tạo form component {FormName} với:
- React Hook Form
- Zod validation
- TypeScript types
- Apple Design inputs
- Error handling
- Submit states
```

**Card Component:**

```
Tạo card component {CardName} với:
- Hover effects (scale 1.02)
- Smooth shadows
- Apple border radius (12px)
- Responsive padding
- Dark mode support
```

**Modal Component:**

```
Tạo modal component {ModalName} với:
- Backdrop blur
- Smooth fade-in animation
- ESC key close
- Click outside close
- Focus trap
- Apple Design System
```

**Button Component:**

```
Tạo button component {ButtonName} với:
- Variants: primary, secondary, ghost
- Sizes: sm, md, lg
- Loading state
- Disabled state
- Icon support
- Apple Design System
```

---

### Page Creation Prompts

**Basic Page:**

```
Tạo page {PageName} tại route /{route} với:
- Next.js App Router
- TypeScript
- SEO metadata
- Loading state
- Error boundary
- Apple Design layout
```

**Dashboard Page:**

```
Tạo dashboard page với:
- Sidebar navigation
- Header với user menu
- 4 stat cards
- Chart components
- Responsive grid
- Apple Design System
```

**Auth Page:**

```
Tạo {login|register|forgot-password} page với:
- Form validation
- Error messages
- Loading states
- Redirect logic
- Apple Design form
- Responsive layout
```

---

### API Creation Prompts

**Basic API Route:**

```
Tạo API {METHOD} /api/{path} với:
- TypeScript types
- Input validation (Zod)
- Error handling
- Response format chuẩn
- Security headers
```

**CRUD API:**

```
Tạo CRUD API cho {resource} với:
- GET /api/{resource} - List all
- GET /api/{resource}/[id] - Get one
- POST /api/{resource} - Create
- PUT /api/{resource}/[id] - Update
- DELETE /api/{resource}/[id] - Delete
- TypeScript types đầy đủ
- Validation cho mọi endpoint
```

**Auth API:**

```
Tạo authentication API với:
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/logout
- GET /api/auth/me
- JWT tokens
- Password hashing
- Input validation
```

---

### Testing Prompts

**Component Tests:**

```
Tạo tests cho component {ComponentName} với:
- Render tests
- Props tests
- Event handler tests
- Edge cases
- Accessibility tests
- TypeScript types
```

**API Tests:**

```
Tạo tests cho API {apiPath} với:
- Success cases
- Error cases
- Validation tests
- Auth tests
- Edge cases
```

---

### Optimization Prompts

**Code Analysis:**

```
Analyze {file/component/page} và report:
- Code quality issues
- Performance bottlenecks
- Security vulnerabilities
- Best practice violations
- Improvement suggestions
```

**Performance Optimization:**

```
Optimize {component/page} cho:
- Fast initial load (<2s)
- 60fps animations
- Small bundle size
- Lazy loading
- Code splitting
- Image optimization
```

**Accessibility Audit:**

```
Audit accessibility của {component/page}:
- WCAG AA compliance
- Keyboard navigation
- Screen reader support
- Color contrast
- Touch targets
- ARIA labels
```

---

### Cleanup & Refactoring Prompts

**Workspace Cleanup:**

```
Cleanup workspace:
- Remove unused files
- Remove unused imports
- Remove unused dependencies
- Remove backup files
- Organize file structure
- Format all code
```

**Code Refactoring:**

```
Refactor {file} theo:
- Clean Code principles
- DRY principle
- SOLID principles
- TypeScript best practices
- Remove code smells
- Improve readability
```

---

### Workflow Prompts

**Complete Feature Workflow:**

```
Tạo complete {feature} feature:

1. Activate current directory
2. Tạo page {FeaturePage} tại /{route}
3. Tạo components cần thiết
4. Tạo API routes
5. Tạo hooks
6. Tạo types
7. Tạo tests
8. Cleanup workspace
9. Report summary
```

**UI Design Workflow:**

```
Design và implement {component}:

1. Generate UI mockup với Human MCP
2. Analyze design requirements
3. Tạo component với Apple Design
4. Apply responsive design
5. Add smooth animations
6. Test accessibility
7. Optimize performance
```

---

## Best Practices from agents.md

Based on the AGENTS.md standard used by 20k+ open-source projects, here are the key best practices:

### 1. Keep It Focused

- **Do**: Provide agent-specific context that helps with code generation
- **Don't**: Duplicate information already in README.md
- **Example**: Include build commands, test commands, code style guidelines

### 2. Be Specific and Actionable

```markdown
## Setup commands

- Install deps: `pnpm install`
- Start dev server: `pnpm dev`
- Run tests: `pnpm test`

## Code style

- TypeScript strict mode
- Single quotes, no semicolons
- Use functional patterns where possible
```

### 3. Include Testing Instructions

```markdown
## Testing instructions

- Find the CI plan in the .github/workflows folder
- Run `pnpm turbo run test --filter <project_name>` to run every check
- From the package root you can just call `pnpm test`
- The commit should pass all tests before you merge
- To focus on one step, add the Vitest pattern: `pnpm vitest run -t "<test name>"`
- Fix any test or type errors until the whole suite is green
- Add or update tests for the code you change, even if nobody asked
```

### 4. PR and Commit Guidelines

```markdown
## PR instructions

- Title format: [<project_name>] <Title>
- Always run `pnpm lint` and `pnpm test` before committing
- Add tests for any new features
- Update documentation if needed
```

### 5. Monorepo Support

- Use nested AGENTS.md files for subprojects
- The closest AGENTS.md to the edited file takes precedence
- Each package can have tailored instructions

### 6. Security Considerations

```markdown
## Security

- Never commit API keys or secrets
- Use environment variables for sensitive data
- Run security audits before deployment
- Follow OWASP guidelines for web security
```

### 7. Development Environment Tips

```markdown
## Dev environment tips

- Use `pnpm dlx turbo run where <project_name>` to jump to a package
- Run `pnpm install --filter <project_name>` to add the package to your workspace
- Use `pnpm create vite@latest <project_name> -- --template react-ts` to spin up a new React + Vite package
- Check the name field inside each package's package.json to confirm the right name
```

---

## Usage Examples

### Example 1: Complete Login Feature

**Prompt:**

```
Tạo complete login feature với Apple Design
```

**Generated Files:**

```
src/app/login/
  ├── page.tsx              # Login page with SEO
  ├── loading.tsx           # Loading state
  └── error.tsx             # Error boundary

src/components/LoginForm/
  ├── LoginForm.tsx         # Form component with validation
  └── index.ts              # Barrel export

src/app/api/auth/login/
  └── route.ts              # API route with Zod validation

src/hooks/
  └── useAuth.ts            # Authentication hook

src/types/
  └── auth.ts               # TypeScript types
```

**Key Features:**

- ✅ Form validation with Zod
- ✅ Loading and error states
- ✅ TypeScript strict mode
- ✅ Apple Design System
- ✅ Responsive layout
- ✅ Accessibility compliant

---

### Example 2: Dashboard with Analytics

**Prompt:**

```
Tạo dashboard page với sidebar, header, và 4 stat cards showing user analytics
```

**Generated Files:**

```
src/app/dashboard/
  └── page.tsx

src/components/DashboardLayout/
  ├── DashboardLayout.tsx
  └── index.ts

src/components/Sidebar/
  ├── Sidebar.tsx
  └── index.ts

src/components/Header/
  ├── Header.tsx
  └── index.ts

src/components/StatCard/
  ├── StatCard.tsx
  └── index.ts
```

**Key Features:**

- ✅ Responsive grid layout
- ✅ Smooth animations on hover
- ✅ Real-time data updates
- ✅ Mobile-friendly sidebar
- ✅ Dark mode support

---

### Example 3: CRUD API for Products

**Prompt:**

```
Tạo CRUD API cho products với validation và TypeScript types
```

**Generated Files:**

```
src/app/api/products/
  └── route.ts              # GET, POST

src/app/api/products/[id]/
  └── route.ts              # GET, PUT, DELETE

src/types/api/
  └── products.ts           # TypeScript interfaces
```

**Key Features:**

- ✅ Full CRUD operations
- ✅ Zod validation schemas
- ✅ Error handling
- ✅ TypeScript types
- ✅ Security headers
- ✅ Rate limiting ready

---

### Example 4: Reusable Data Table Component

**Prompt:**

```
Tạo DataTable component với:
- Sorting
- Pagination
- Search
- Row selection
- Export to CSV
- Apple Design System
```

**Generated Component:**

```typescript
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  searchable?: boolean;
  sortable?: boolean;
  paginated?: boolean;
  selectable?: boolean;
  exportable?: boolean;
}

export function DataTable<T>({ ... }: DataTableProps<T>) {
  // Implementation with all features
}
```

**Key Features:**

- ✅ Generic TypeScript types
- ✅ Fully customizable
- ✅ Responsive design
- ✅ Keyboard navigation
- ✅ Accessibility compliant

---

### Example 5: Image Upload with Preview

**Prompt:**

```
Tạo ImageUpload component với:
- Drag and drop
- Preview before upload
- Multiple files
- Progress indicator
- File size validation
- Apple Design
```

**Key Features:**

- ✅ Drag & drop interface
- ✅ Image preview grid
- ✅ Upload progress
- ✅ File validation
- ✅ Error handling
- ✅ Responsive layout

---

## Apple Design System Specs

### Typography

**Font Family:**

```css
font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Display',
  'SF Pro Text', sans-serif;
```

**Font Sizes:**

```css
/* Headings */
h1: 2.5rem (40px) - font-weight: 700
h2: 2rem (32px) - font-weight: 600
h3: 1.5rem (24px) - font-weight: 600
h4: 1.25rem (20px) - font-weight: 600

/* Body */
body: 1rem (16px) - font-weight: 400
small: 0.875rem (14px) - font-weight: 400
caption: 0.75rem (12px) - font-weight: 400
```

**Line Heights:**

```css
headings: 1.2
body: 1.5
small: 1.4
```

---

### Colors

**Primary Colors:**

```css
/* Apple Blue */
--blue-50: #e3f2fd;
--blue-500: #007aff; /* Primary */
--blue-600: #0051d5;
--blue-700: #003d99;

/* Grays */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
```

**Semantic Colors:**

```css
/* Success */
--success: #34c759;

/* Warning */
--warning: #ff9500;

/* Error */
--error: #ff3b30;

/* Info */
--info: #5ac8fa;
```

**Dark Mode:**

```css
/* Automatically handled by Tailwind's dark: prefix */
dark:bg-gray-800;
dark:text-gray-100;
```

---

### Spacing

**8px Grid System:**

```css
/* Spacing scale */
0: 0px
1: 0.25rem (4px)
2: 0.5rem (8px)
3: 0.75rem (12px)
4: 1rem (16px)
5: 1.25rem (20px)
6: 1.5rem (24px)
8: 2rem (32px)
10: 2.5rem (40px)
12: 3rem (48px)
16: 4rem (64px)
20: 5rem (80px)
24: 6rem (96px)
```

**Common Patterns:**

```css
/* Card padding */
padding: 1.5rem (24px)

/* Section spacing */
margin-bottom: 2rem (32px)

/* Component gap */
gap: 1rem (16px)
```

---

### Border Radius

```css
/* Sizes */
--radius-sm: 0.5rem (8px)
--radius-md: 0.75rem (12px)
--radius-lg: 1rem (16px)
--radius-xl: 1.5rem (24px)

/* Usage */
buttons: 0.75rem (12px)
cards: 1rem (16px)
modals: 1.5rem (24px)
inputs: 0.5rem (8px)
```

---

### Shadows

```css
/* Elevation levels */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Soft shadows (Apple style) */
box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
```

---

### Animations

**Timing Functions:**

```css
/* Apple's standard easing */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
```

**Durations:**

```css
/* Fast interactions */
--duration-fast: 200ms;

/* Normal transitions */
--duration-normal: 300ms;

/* Slow animations */
--duration-slow: 500ms;
```

**Common Animations:**

```css
/* Hover scale */
transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
hover:scale-102 (transform: scale(1.02))

/* Fade in */
transition: opacity 0.3s ease-in-out;

/* Slide up */
transition: transform 0.3s ease-out;
transform: translateY(10px) → translateY(0)
```

---

### Responsive Breakpoints

```css
/* Mobile first approach */
sm: 640px; /* Small devices */
md: 768px; /* Tablets */
lg: 1024px; /* Laptops */
xl: 1280px; /* Desktops */
2xl: 1536px; /* Large screens */
```

**Usage:**

```tsx
<div className="w-full md:w-1/2 lg:w-1/3">
  {/* Full width on mobile, half on tablet, third on desktop */}
</div>
```

---

### Touch Targets

**Minimum Sizes:**

```css
/* Buttons and interactive elements */
min-height: 44px;
min-width: 44px;

/* Touch-friendly spacing */
gap: 12px; /* Between touch targets */
```

---

### Accessibility

**Color Contrast:**

```css
/* WCAG AA compliance */
Normal text: 4.5:1
Large text: 3:1
UI components: 3:1
```

**Focus States:**

```css
/* Visible focus indicators */
focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
outline: 2px solid var(--blue-500);
outline-offset: 2px;
```

**ARIA Labels:**

```tsx
<button aria-label="Close modal">
  <XIcon />
</button>
```

---

## Troubleshooting

### Common Issues

**Issue: Augment doesn't understand the task**

```
Solution: Use clearer format
"Tạo [type] [name] với [requirements]"

Example:
"Tạo React component LoginButton với Apple Design System, responsive, smooth animations"
```

**Issue: Output doesn't follow conventions**

```
Solution: Reference the configuration
"Refactor {file} theo conventions trong augment-templates.json"
```

**Issue: Design doesn't match Apple style**

```
Solution: Explicitly apply design system
"Apply Apple Design System vào {component} theo augment-agents.json"
```

**Issue: Need workspace cleanup**

```
Solution: Run cleanup command
"Cleanup workspace và remove unused files"
```

**Issue: Serena not activated**

```
Solution: Activate project
"Activate current directory as project"
```

**Issue: MCP server not responding**

```
Solution: Restart VSCode
Command Palette (Cmd+Shift+P) → "Developer: Reload Window"
```

---

## MCP Servers Integration

### Serena MCP (Coding Tools)

**Capabilities:**

- ✅ Semantic code search
- ✅ Symbol-level editing
- ✅ File operations
- ✅ Project onboarding
- ✅ Shell command execution
- ✅ LSP-based navigation

**Usage Examples:**

**Project Activation:**

```
"Activate current directory as project"
```

**Code Search:**

```
"Find all components in this project"
"Find all files containing authentication"
"Find symbol UserService"
"Find references of handleLogin"
```

**File Operations:**

```
"Read file src/services/auth.ts"
"Create file src/utils/validation.ts with email validation"
"List directory src/components"
```

**Code Editing:**

```
"Replace handleLogin body with new implementation"
"Insert after UserService class: new method getUserProfile"
```

---

### Human MCP (AI Tools)

**Capabilities:**

- ✅ Visual analysis (27 tools)
- ✅ Image generation
- ✅ Document processing
- ✅ Speech synthesis
- ✅ Advanced reasoning (Google Gemini)

**Usage Examples:**

**Image Generation:**

```
"Generate an image of a modern login form with Apple design"
"Generate a dashboard UI mockup with sidebar and charts"
"Generate a logo for my SaaS product"
```

**Visual Analysis:**

```
"Analyze this screenshot for UI/UX issues"
"Compare these 2 designs and suggest improvements"
"Identify accessibility issues in this image"
```

**Document Processing:**

```
"Read this PDF and summarize key points"
"Extract data from this Excel file"
"Convert this document to markdown"
```

**Speech Synthesis:**

```
"Convert this text to speech with professional voice"
"Narrate this documentation"
"Explain this code with voice"
```

---

### Combining MCP Servers

**Workflow Example:**

```
Step 1: "Generate a modern dashboard UI mockup" (Human MCP)
Step 2: Analyze the generated image
Step 3: "Activate current directory as project" (Serena)
Step 4: "Find all existing dashboard components" (Serena)
Step 5: "Tạo Dashboard component based on the mockup" (Augment + Design Agent)
Step 6: "Optimize performance của Dashboard component" (Analysis Agent)
```

---

## Project Cleanup System

### Overview

The **Project Cleanup System** is a specialized agent designed to automatically clean legacy projects, remove garbage files, and optimize project structure before applying the modern agent system.

**Why Cleanup is Important:**

- 🗑️ **Remove clutter** - Delete auto-generated docs, backup files, logs
- 📁 **Optimize structure** - Reorganize files into clean architecture
- ⚡ **Improve performance** - Reduce project size, faster builds
- 🧹 **Maintain quality** - Keep workspace clean and organized

**When to Run Cleanup:**

- ✅ Before applying Agents.md to legacy projects
- ✅ After major refactoring or migrations
- ✅ Weekly/monthly maintenance
- ✅ Before deployment or code reviews

---

### Garbage Patterns

Files and directories that will be automatically detected and removed:

#### Auto-Generated Documentation

| Pattern | Description | Examples |
|---------|-------------|----------|
| `**/*_SUMMARY.md` | Auto-generated summaries | `PROJECT_SUMMARY.md` |
| `**/*_REPORT.md` | Auto-generated reports | `ANALYSIS_REPORT.md` |
| `**/*_ANALYSIS.md` | Auto-generated analysis | `CODE_ANALYSIS.md` |
| `**/*_CHECKLIST.md` | Auto-generated checklists | `DEPLOY_CHECKLIST.md` |
| `**/README_AUTO.md` | Auto-generated READMEs | `README_AUTO.md` |
| `**/GUIDE_AUTO.md` | Auto-generated guides | `SETUP_GUIDE_AUTO.md` |
| `**/*_GENERATED.md` | Any generated markdown | `API_GENERATED.md` |

#### Backup & Temporary Files

| Pattern | Description | Examples |
|---------|-------------|----------|
| `**/*.bak` | Backup files | `index.js.bak` |
| `**/*.tmp` | Temporary files | `cache.tmp` |
| `**/*.temp` | Temp files | `upload.temp` |
| `**/*.backup` | Backup files | `config.backup` |
| `**/*.old` | Old versions | `app.old.js` |
| `**/*.orig` | Original files | `merge.orig` |
| `**/*.save` | Saved copies | `data.save` |

#### Log & Cache Files

| Pattern | Description | Examples |
|---------|-------------|----------|
| `**/*.log` | Log files | `error.log`, `debug.log` |
| `**/logs/**/*` | Log directories | `logs/2024/` |
| `**/.cache/**/*` | Cache directories | `.cache/webpack/` |
| `**/tmp/**/*` | Temp directories | `tmp/uploads/` |
| `**/temp/**/*` | Temp directories | `temp/sessions/` |

#### System Files

| Pattern | Description | Examples |
|---------|-------------|----------|
| `**/.DS_Store` | macOS metadata | `.DS_Store` |
| `**/Thumbs.db` | Windows thumbnails | `Thumbs.db` |
| `**/desktop.ini` | Windows config | `desktop.ini` |
| `**/.Spotlight-V100` | macOS Spotlight | `.Spotlight-V100` |
| `**/.Trashes` | macOS trash | `.Trashes` |

#### Old Test Files

| Pattern | Description | Examples |
|---------|-------------|----------|
| `**/__tests__/backup/**/*` | Test backups | `__tests__/backup/` |
| `**/*.test.bak.js` | Backup test files | `user.test.bak.js` |
| `**/*.spec.old.ts` | Old spec files | `api.spec.old.ts` |
| `**/test-reports/**/*` | Old test reports | `test-reports/2023/` |

---

### Protected Patterns

Files and directories that are **NEVER** deleted (protected):

#### Essential Configuration

| Pattern | Reason | Examples |
|---------|--------|----------|
| `**/package.json` | Dependencies | `package.json` |
| `**/package-lock.json` | Lock file | `package-lock.json` |
| `**/yarn.lock` | Yarn lock | `yarn.lock` |
| `**/tsconfig.json` | TypeScript config | `tsconfig.json` |
| `**/.env` | Environment vars | `.env`, `.env.local` |
| `**/.env.example` | Env template | `.env.example` |
| `**/.gitignore` | Git ignore | `.gitignore` |
| `**/.eslintrc.*` | ESLint config | `.eslintrc.js` |
| `**/.prettierrc` | Prettier config | `.prettierrc` |

#### Source Code & Assets

| Pattern | Reason | Examples |
|---------|--------|----------|
| `**/src/**/*` | Source code | `src/components/` |
| `**/public/**/*` | Public assets | `public/images/` |
| `**/assets/**/*` | Asset files | `assets/fonts/` |
| `**/components/**/*` | Components | `components/ui/` |
| `**/pages/**/*` | Pages | `pages/dashboard/` |

#### Important Documentation

| Pattern | Reason | Examples |
|---------|--------|----------|
| `**/README.md` | Main README | `README.md` |
| `**/agents.md` | This file! | `agents.md`, `Agents.md` |
| `**/augment-agents.json` | Agent config | `augment-agents.json` |
| `**/docs/important/**/*` | Important docs | `docs/important/` |

#### System Directories

| Pattern | Reason | Examples |
|---------|--------|----------|
| `**/node_modules` | Dependencies | `node_modules/` |
| `**/.git` | Git repository | `.git/` |
| `**/.vscode` | VSCode settings | `.vscode/` |

---

### Cleanup Workflow

The cleanup process runs in **4 phases**:

#### Phase 1: Scan & Analysis

**Objective:** Identify all garbage files and calculate potential space savings

**Actions:**

1. Scan entire project directory
2. Match files against garbage patterns
3. Exclude protected patterns
4. Calculate total size of garbage files
5. Generate scan report

**Output:**

```
📊 SCAN RESULTS:
✅ Found: 147 garbage files
✅ Found: 23 empty directories
💾 Total size: 45.67 MB
⏱️ Scan time: 2.34s
```

**Verification:**

- [ ] Review list of files to be deleted
- [ ] Confirm no important files are included
- [ ] Check total size is reasonable

---

#### Phase 2: Garbage Cleanup

**Objective:** Safely delete identified garbage files

**Actions:**

1. Create backup (optional, to `.trash/` directory)
2. Delete garbage files one by one
3. Track deleted files and errors
4. Calculate freed space

**Output:**

```
🗑️ CLEANUP PROGRESS:
✅ Deleted: 147/147 files
✅ Deleted: 23/23 directories
💾 Freed: 45.67 MB
❌ Errors: 0
⏱️ Cleanup time: 8.12s
```

**Verification:**

- [ ] All garbage files deleted
- [ ] No errors occurred
- [ ] Protected files untouched
- [ ] Project still builds successfully

---

#### Phase 3: Structure Optimization

**Objective:** Reorganize project structure for better maintainability

**Actions:**

1. Move misplaced files to correct directories
2. Group related files together
3. Remove empty directories
4. Apply naming conventions

**Reorganization Rules:**

```typescript
{
  // Documentation
  '**/*.md': 'docs/',
  '**/*.txt': 'docs/texts/',

  // Configuration
  '**/*.json': 'config/',
  '**/*.env*': 'config/environments/',

  // Source code
  '**/*.ts': 'src/',
  '**/*.tsx': 'src/components/',
  '**/*.css': 'src/styles/',

  // Assets
  '**/*.png': 'public/images/',
  '**/*.jpg': 'public/images/',
  '**/*.svg': 'public/icons/'
}
```

**Output:**

```
📁 STRUCTURE OPTIMIZATION:
✅ Moved: 34 files to correct locations
✅ Removed: 12 empty directories
✅ Renamed: 8 files to follow conventions
⏱️ Optimization time: 3.45s
```

---

#### Phase 4: Verification & Reporting

**Objective:** Verify cleanup success and generate comprehensive report

**Actions:**

1. Verify all garbage files removed
2. Verify protected files intact
3. Run project build test
4. Generate cleanup report
5. Save report to `docs/cleanup-report.md`

**Report Template:**

```markdown
# 🧹 PROJECT CLEANUP REPORT

**Date:** 2025-10-16 14:30:00
**Project:** /Users/user/my-project

## 📊 SUMMARY

- 🗑️ Files deleted: 147
- 📁 Directories deleted: 23
- 💾 Space freed: 45.67 MB
- ⏱️ Total time: 14.23s
- ❌ Errors: 0

## 🔍 DETAILS BY PHASE

### Phase 1: Scan & Analysis
- Files found: 147
- Directories found: 23
- Total size: 45.67 MB

### Phase 2: Garbage Cleanup
- Files deleted: 147
- Directories deleted: 23
- Freed space: 45.67 MB

### Phase 3: Structure Optimization
- Files moved: 34
- Empty dirs removed: 12
- Files renamed: 8

### Phase 4: Verification
- Build test: ✅ PASSED
- Protected files: ✅ INTACT
- Project health: ✅ GOOD

## 💡 RECOMMENDATIONS

1. Run cleanup weekly to prevent accumulation
2. Configure .gitignore to prevent garbage files
3. Use Agent System to maintain clean code
4. Review and update cleanup patterns regularly
```

---

### Usage Guide

#### Quick Commands

**Using npm scripts:**

```bash
# Scan for garbage files (dry-run, safe)
npm run cleanup:scan

# Run cleanup with dry-run (preview only)
npm run cleanup:run --dry

# Run actual cleanup (deletes files)
npm run cleanup:run

# Optimize project structure
npm run cleanup:optimize

# Full cleanup (all phases)
npm run cleanup:full
```

**Using Augment Code:**

```
"Scan project for garbage files"
"Run cleanup agent with dry-run"
"Execute full project cleanup"
"Optimize project structure"
```

---

#### Augment Commands & Keybindings

Add to `.vscode/settings.json` or use directly:

| Command | Keybinding | Description |
|---------|------------|-------------|
| `agent.cleanup.scan` | `Ctrl+Shift+C S` | Scan for garbage files |
| `agent.cleanup.run` | `Ctrl+Shift+C R` | Run cleanup (with confirmation) |
| `agent.cleanup.optimize` | `Ctrl+Shift+C O` | Optimize structure |
| `agent.cleanup.full` | `Ctrl+Shift+C F` | Full cleanup workflow |

**Command Configuration:**

```json
{
  "commands": {
    "agent.cleanup.scan": {
      "title": "Agent: Scan Project Garbage",
      "description": "Scan entire project for garbage files",
      "args": []
    },
    "agent.cleanup.run": {
      "title": "Agent: Run Cleanup",
      "description": "Execute cleanup with confirmation",
      "args": ["${dryRun}"]
    },
    "agent.cleanup.optimize": {
      "title": "Agent: Optimize Structure",
      "description": "Reorganize project structure",
      "args": []
    },
    "agent.cleanup.full": {
      "title": "Agent: Full Cleanup",
      "description": "Run complete cleanup workflow",
      "args": []
    }
  }
}
```

---

### Quick Cleanup Script

Save as `cleanup.sh` in project root:

```bash
#!/bin/bash
# Quick cleanup script for legacy projects

echo "🧹 PROJECT CLEANUP SCRIPT"
echo "========================="
echo ""

# Step 1: Scan
echo "📊 Step 1: Scanning for garbage files..."
npm run cleanup:scan

echo ""
echo "Review the scan results above."
read -p "Continue with cleanup? (y/n): " confirm

if [ "$confirm" != "y" ]; then
  echo "❌ Cleanup cancelled"
  exit 0
fi

# Step 2: Cleanup
echo ""
echo "🗑️ Step 2: Cleaning up garbage files..."
npm run cleanup:run

# Step 3: Optimize
echo ""
echo "📁 Step 3: Optimizing project structure..."
npm run cleanup:optimize

# Step 4: Report
echo ""
echo "✅ CLEANUP COMPLETED!"
echo ""
echo "📄 Check cleanup report at: docs/cleanup-report.md"
```

**Usage:**

```bash
chmod +x cleanup.sh
./cleanup.sh
```

---

### Best Practices

#### 1. Always Run Dry-Run First

```bash
# GOOD: Preview before deleting
npm run cleanup:scan
npm run cleanup:run --dry

# BAD: Delete without preview
npm run cleanup:run  # Dangerous!
```

#### 2. Backup Important Files

```bash
# Create backup before cleanup
git commit -am "Backup before cleanup"

# Or use cleanup with trash bin
npm run cleanup:run --trash
```

#### 3. Review Scan Results

```
✅ DO: Carefully review list of files to be deleted
✅ DO: Check for false positives
✅ DO: Verify protected patterns are working
❌ DON'T: Blindly run cleanup without review
```

#### 4. Run Cleanup Regularly

```
✅ Weekly: For active projects
✅ Monthly: For stable projects
✅ Before: Major refactoring, deployment, code review
✅ After: Migrations, dependency updates
```

#### 5. Configure .gitignore

Prevent garbage files from being committed:

```gitignore
# Logs
*.log
logs/

# Temporary files
*.tmp
*.temp
*.bak
*.backup

# System files
.DS_Store
Thumbs.db
desktop.ini

# Cache
.cache/
tmp/
temp/

# Auto-generated docs
*_REPORT.md
*_SUMMARY.md
*_ANALYSIS.md
```

#### 6. Customize Patterns

Adapt garbage patterns to your project:

```typescript
// Add project-specific patterns
const customGarbagePatterns = {
  files: [
    '**/*.old.js',           // Your old files
    '**/legacy/**/*',        // Legacy code
    '**/*-deprecated.*',     // Deprecated files
  ]
};
```

#### 7. Test After Cleanup

```bash
# Always test after cleanup
npm run build
npm run test
npm run lint
```

---

### Troubleshooting

#### Issue: Important file was deleted

**Solution:**

```bash
# Restore from trash bin (if enabled)
cp .trash/path/to/file ./path/to/file

# Or restore from git
git checkout HEAD -- path/to/file
```

#### Issue: Cleanup is too slow

**Solution:**

```bash
# Exclude large directories
npm run cleanup:scan --exclude="node_modules,dist,build"
```

#### Issue: False positives in scan

**Solution:**

```typescript
// Add to protected patterns
protectedPatterns: [
  '**/docs/important/**/*.md',  // Protect important docs
  '**/legacy/keep/**/*',        // Keep legacy files
]
```

#### Issue: Cleanup fails with errors

**Solution:**

```bash
# Run with verbose logging
npm run cleanup:run --verbose

# Check permissions
ls -la path/to/file

# Run with sudo (if needed)
sudo npm run cleanup:run
```

---

## Development Workflow for Low-Code/AI-Assisted Projects

### Frontend-First vs Backend-First Analysis

#### Comparison Table

| Aspect | Frontend-First | Backend-First |
|--------|---------------|---------------|
| **Visual Feedback** | ✅ Immediate UI preview | ❌ No visual output initially |
| **User Experience** | ✅ Early UX validation | ❌ Late UX validation |
| **AI Assistance** | ✅ Easier to describe UI | ⚠️ Harder to describe data structures |
| **Iteration Speed** | ✅ Fast visual iterations | ⚠️ Slower, need testing tools |
| **Motivation** | ✅ See progress quickly | ⚠️ Abstract progress |
| **Complexity** | ⚠️ May need mock data | ✅ Real data from start |
| **Best For** | UI-heavy apps, prototypes | Data-heavy apps, APIs |

#### Recommendation: **Frontend-First for AI-Assisted Development**

**Why Frontend-First is better with AI coding assistants:**

1. **Visual Validation** - You can immediately see if the AI generated correct UI
2. **Easier Prompts** - Describing UI is more natural than describing data structures
3. **Faster Iterations** - Visual feedback loop is faster than testing APIs
4. **Better Motivation** - Seeing progress keeps momentum
5. **AI Strengths** - AI excels at generating UI components from descriptions
6. **Mock Data** - Easy to use mock data initially, replace with real API later

**When to use Backend-First:**

- Building pure API services (no UI)
- Complex data modeling requirements
- Team has backend specialists
- Data structure is well-defined upfront

---

### Standard Project Structure

```
project-root/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Route groups
│   │   │   ├── login/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   └── error.tsx
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx     # Dashboard layout
│   │   │   ├── page.tsx       # Dashboard home
│   │   │   ├── users/
│   │   │   └── settings/
│   │   ├── api/               # API routes
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts
│   │   │   │   └── register/route.ts
│   │   │   ├── users/
│   │   │   │   ├── route.ts   # GET, POST /api/users
│   │   │   │   └── [id]/route.ts  # GET, PUT, DELETE /api/users/:id
│   │   │   └── products/
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Card/
│   │   │   └── Modal/
│   │   ├── forms/            # Form components
│   │   │   ├── LoginForm/
│   │   │   └── RegisterForm/
│   │   └── layouts/          # Layout components
│   │       ├── Header/
│   │       ├── Sidebar/
│   │       └── Footer/
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useUser.ts
│   │   └── useLocalStorage.ts
│   ├── lib/                  # Library code
│   │   ├── api.ts           # API client
│   │   ├── auth.ts          # Auth utilities
│   │   └── db.ts            # Database client
│   ├── services/            # Business logic
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   └── product.service.ts
│   ├── types/               # TypeScript types
│   │   ├── api/
│   │   │   ├── auth.ts
│   │   │   └── user.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   └── Product.ts
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   ├── validation.ts
│   │   ├── formatting.ts
│   │   └── constants.ts
│   ├── styles/              # Global styles
│   │   ├── globals.css
│   │   └── theme.css
│   └── __tests__/           # Tests
│       ├── components/
│       ├── hooks/
│       └── utils/
├── public/                  # Static assets
│   ├── images/
│   ├── fonts/
│   └── icons/
├── prisma/                  # Database schema (if using Prisma)
│   └── schema.prisma
├── .env.local              # Environment variables
├── .env.example            # Example env file
├── next.config.js          # Next.js config
├── tailwind.config.js      # Tailwind config
├── tsconfig.json           # TypeScript config
├── package.json
├── Agents.md               # This file
└── README.md
```

---

### Tech Stack Recommendations

**Frontend:**

- ✅ **Next.js 14+** - App Router, Server Components, API Routes
- ✅ **React 18+** - Latest features, Server Components
- ✅ **TypeScript** - Type safety, better AI assistance
- ✅ **Tailwind CSS** - Utility-first, Apple Design System compatible
- ✅ **Zod** - Runtime validation, type inference

**Backend/API:**

- ✅ **Next.js API Routes** - Serverless, same codebase
- ✅ **Prisma** - Type-safe ORM, great DX
- ✅ **PostgreSQL** - Robust, scalable
- ✅ **NextAuth.js** - Authentication made easy

**State Management:**

- ✅ **React Server Components** - Server-side state
- ✅ **Zustand** - Client-side global state (if needed)
- ✅ **React Query** - Server state management

**Testing:**

- ✅ **Vitest** - Fast, modern testing
- ✅ **Testing Library** - Component testing
- ✅ **Playwright** - E2E testing

**Deployment:**

- ✅ **Vercel** - Zero-config Next.js deployment
- ✅ **Supabase** - Database + Auth + Storage

---

### Step-by-Step Development Workflow

#### Workflow Diagram

```mermaid
graph TD
    A[Start Project] --> B[Initialize Next.js]
    B --> C[Setup Agent System]
    C --> D[Design UI Mockups]
    D --> E[Build UI Components]
    E --> F[Create Pages]
    F --> G[Add Mock Data]
    G --> H[Test UI/UX]
    H --> I{UI Complete?}
    I -->|No| D
    I -->|Yes| J[Design Data Models]
    J --> K[Setup Database]
    K --> L[Create API Routes]
    L --> M[Connect Frontend to API]
    M --> N[Replace Mock Data]
    N --> O[Add Authentication]
    O --> P[Write Tests]
    P --> Q[Optimize Performance]
    Q --> R[Deploy]
    R --> S[Done]
```

---

#### Phase 1: Project Initialization (15 minutes)

**Goal:** Setup Next.js project with Agent System

**Step 1.1: Create Next.js Project**

**Prompt:**

```
Setup new Next.js 14 project với:
- App Router
- TypeScript
- Tailwind CSS
- ESLint + Prettier
- src/ directory
- Apple Design System ready
```

**Expected Output:**

- Next.js project initialized
- Dependencies installed
- Basic folder structure created

**Verification:**

- [ ] `npm run dev` works
- [ ] TypeScript compiles without errors
- [ ] Tailwind CSS is working

**Estimated Time:** 5 minutes

---

**Step 1.2: Setup Agent System**

**Prompt:**

```
Copy Agents.md file vào project root và run setup script
```

**Manual Steps:**

```bash
# Copy Agents.md to project root
cp /path/to/Agents.md ./

# Run setup (if setup script exists)
./setup-agent-system.sh

# Or manually create structure
mkdir -p src/{components,app,hooks,lib,services,types,utils,styles,__tests__}
mkdir -p public/{images,fonts,icons}
```

**Verification:**

- [ ] Agents.md exists in root
- [ ] Folder structure matches standard
- [ ] VSCode settings configured

**Estimated Time:** 5 minutes

---

**Step 1.3: Activate MCP Servers**

**Prompt:**

```
Activate current directory as project
```

**Verification:**

- [ ] Serena MCP activated
- [ ] Can search code with Serena
- [ ] Human MCP available

**Estimated Time:** 2 minutes

---

#### Phase 2: UI Design & Mockups (30 minutes)

**Goal:** Design UI mockups for all major screens

**Step 2.1: Generate UI Mockups**

**Prompt:**

```
Generate UI mockups với Human MCP:

1. "Generate a modern login page with Apple design - clean, minimal, centered form"
2. "Generate a dashboard layout with sidebar, header, and 4 stat cards"
3. "Generate a user profile page with avatar, info cards, and edit form"
4. "Generate a data table page with search, filters, and pagination"
```

**Expected Output:**

- 4+ UI mockup images
- Saved in `public/mockups/`

**Verification:**

- [ ] All mockups generated
- [ ] Mockups follow Apple Design
- [ ] Mockups are clear and detailed

**Estimated Time:** 15 minutes

---

**Step 2.2: Analyze Mockups**

**Prompt:**

```
Analyze these mockups và list:
- Required components
- Color palette
- Typography needs
- Layout patterns
- Responsive breakpoints
```

**Expected Output:**

- Component list
- Design tokens
- Layout specifications

**Estimated Time:** 10 minutes

---

#### Phase 3: Build UI Components (60 minutes)

**Goal:** Create reusable UI components

**Step 3.1: Create Base Components**

**Prompts:**

```
1. "Tạo component Button với variants (primary, secondary, ghost), sizes (sm, md, lg), Apple Design"

2. "Tạo component Input với types (text, email, password), validation states, Apple Design"

3. "Tạo component Card với hover effects, shadows, Apple Design"

4. "Tạo component Modal với backdrop blur, animations, ESC close, Apple Design"
```

**Expected Output:**

```
src/components/ui/
  ├── Button/
  │   ├── Button.tsx
  │   └── index.ts
  ├── Input/
  ├── Card/
  └── Modal/
```

**Verification:**

- [ ] All components render correctly
- [ ] Props work as expected
- [ ] TypeScript types are correct
- [ ] Apple Design applied

**Estimated Time:** 30 minutes

---

**Step 3.2: Create Form Components**

**Prompts:**

```
1. "Tạo LoginForm component với email, password inputs, remember me checkbox, submit button, validation với Zod"

2. "Tạo RegisterForm component với name, email, password, confirm password, terms checkbox, validation"
```

**Expected Output:**

```
src/components/forms/
  ├── LoginForm/
  └── RegisterForm/
```

**Verification:**

- [ ] Forms validate correctly
- [ ] Error messages display
- [ ] Submit handlers work

**Estimated Time:** 20 minutes

---

**Step 3.3: Create Layout Components**

**Prompts:**

```
1. "Tạo Header component với logo, navigation, user menu, Apple Design"

2. "Tạo Sidebar component với navigation links, collapsible, responsive"

3. "Tạo Footer component với links, copyright, social icons"
```

**Expected Output:**

```
src/components/layouts/
  ├── Header/
  ├── Sidebar/
  └── Footer/
```

**Estimated Time:** 15 minutes

---

#### Phase 4: Create Pages with Mock Data (45 minutes)

**Goal:** Build all pages using components and mock data

**Step 4.1: Create Auth Pages**

**Prompts:**

```
1. "Tạo login page tại /login với LoginForm, Apple Design, SEO metadata"

2. "Tạo register page tại /register với RegisterForm, Apple Design"
```

**Expected Output:**

```
src/app/(auth)/
  ├── login/
  │   ├── page.tsx
  │   ├── loading.tsx
  │   └── error.tsx
  └── register/
```

**Verification:**

- [ ] Pages render correctly
- [ ] Forms work
- [ ] Loading states show
- [ ] Error boundaries work

**Estimated Time:** 15 minutes

---

**Step 4.2: Create Dashboard Page**

**Prompt:**

```
Tạo dashboard page tại /dashboard với:
- DashboardLayout (Header + Sidebar)
- 4 StatCard components với mock data
- Chart placeholder
- Responsive grid
- Apple Design
```

**Mock Data Prompt:**

```
Tạo mock data file src/lib/mockData.ts với:
- User stats (users, revenue, orders, growth)
- Chart data (monthly revenue)
- Recent activities
```

**Expected Output:**

```
src/app/(dashboard)/
  ├── layout.tsx
  └── page.tsx

src/lib/
  └── mockData.ts
```

**Verification:**

- [ ] Dashboard displays correctly
- [ ] Mock data shows
- [ ] Responsive on mobile
- [ ] Charts render (placeholder)

**Estimated Time:** 20 minutes

---

**Step 4.3: Create Data Table Page**

**Prompt:**

```
Tạo users page tại /dashboard/users với:
- DataTable component
- Search functionality
- Pagination
- Mock user data (20 users)
- Apple Design
```

**Expected Output:**

```
src/app/(dashboard)/users/
  └── page.tsx

src/components/ui/DataTable/
  ├── DataTable.tsx
  └── index.ts
```

**Estimated Time:** 15 minutes

---

#### Phase 5: Test UI/UX (30 minutes)

**Goal:** Verify all UI works correctly

**Step 5.1: Manual Testing**

**Checklist:**

- [ ] All pages load without errors
- [ ] Navigation works
- [ ] Forms validate correctly
- [ ] Buttons respond to clicks
- [ ] Modals open/close
- [ ] Responsive on mobile (375px)
- [ ] Responsive on tablet (768px)
- [ ] Responsive on desktop (1280px)
- [ ] Dark mode works (if implemented)
- [ ] Animations are smooth (60fps)

**Estimated Time:** 20 minutes

---

**Step 5.2: Accessibility Check**

**Prompt:**

```
Audit accessibility của tất cả pages:
- Keyboard navigation
- Screen reader support
- Color contrast
- Touch targets
- ARIA labels
```

**Verification:**

- [ ] Can navigate with keyboard only
- [ ] Focus indicators visible
- [ ] Color contrast >= 4.5:1
- [ ] Touch targets >= 44x44px

**Estimated Time:** 10 minutes

---

#### Phase 6: Backend Setup (60 minutes)

**Goal:** Setup database and create data models

**Step 6.1: Design Data Models**

**Prompt:**

```
Based on UI requirements, design database schema với Prisma:
- User model (id, name, email, password, role, createdAt)
- Product model (id, name, description, price, stock, createdAt)
- Order model (id, userId, products, total, status, createdAt)
- Relations between models
```

**Expected Output:**

```
prisma/
  └── schema.prisma
```

**Verification:**

- [ ] Schema is valid
- [ ] Relations are correct
- [ ] Indexes added for performance

**Estimated Time:** 20 minutes

---

**Step 6.2: Setup Database**

**Manual Steps:**

```bash
# Install Prisma
npm install prisma @prisma/client

# Initialize Prisma
npx prisma init

# Setup Supabase (or PostgreSQL)
# Get connection string from Supabase dashboard

# Add to .env.local
DATABASE_URL="postgresql://..."

# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push
```

**Verification:**

- [ ] Database connected
- [ ] Tables created
- [ ] Prisma Client generated

**Estimated Time:** 15 minutes

---

**Step 6.3: Seed Database**

**Prompt:**

```
Tạo seed script prisma/seed.ts với:
- 10 sample users
- 20 sample products
- 15 sample orders
- Realistic data using faker
```

**Run Seed:**

```bash
npx prisma db seed
```

**Verification:**

- [ ] Data seeded successfully
- [ ] Can query data with Prisma Studio

**Estimated Time:** 15 minutes

---

#### Phase 7: Create API Routes (90 minutes)

**Goal:** Build type-safe API routes

**Step 7.1: Create Auth API**

**Prompts:**

```
1. "Tạo API POST /api/auth/register với Zod validation, password hashing, Prisma"

2. "Tạo API POST /api/auth/login với email/password validation, JWT token generation"

3. "Tạo API GET /api/auth/me với JWT verification, return current user"
```

**Expected Output:**

```
src/app/api/auth/
  ├── register/route.ts
  ├── login/route.ts
  └── me/route.ts

src/types/api/
  └── auth.ts
```

**Verification:**

- [ ] Can register new user
- [ ] Can login with credentials
- [ ] JWT token returned
- [ ] Can get current user with token

**Estimated Time:** 30 minutes

---

**Step 7.2: Create CRUD APIs**

**Prompts:**

```
1. "Tạo CRUD API cho users:
   - GET /api/users (list with pagination)
   - GET /api/users/[id] (get one)
   - PUT /api/users/[id] (update)
   - DELETE /api/users/[id] (delete)
   - Validation với Zod
   - Auth required"

2. "Tạo CRUD API cho products tương tự users"
```

**Expected Output:**

```
src/app/api/users/
  ├── route.ts
  └── [id]/route.ts

src/app/api/products/
  ├── route.ts
  └── [id]/route.ts
```

**Verification:**

- [ ] All CRUD operations work
- [ ] Validation works
- [ ] Auth required
- [ ] Proper error handling

**Estimated Time:** 45 minutes

---

**Step 7.3: Test APIs**

**Prompt:**

```
Tạo tests cho tất cả API routes với Vitest:
- Success cases
- Validation errors
- Auth errors
- Edge cases
```

**Run Tests:**

```bash
npm run test
```

**Verification:**

- [ ] All tests pass
- [ ] Coverage > 80%

**Estimated Time:** 20 minutes

---

#### Phase 8: Connect Frontend to Backend (60 minutes)

**Goal:** Replace mock data with real API calls

**Step 8.1: Create API Client**

**Prompt:**

```
Tạo API client src/lib/api.ts với:
- Fetch wrapper với error handling
- JWT token management
- TypeScript types
- Request/response interceptors
```

**Expected Output:**

```typescript
// src/lib/api.ts
export const api = {
  auth: {
    login: (data) => fetch('/api/auth/login', ...),
    register: (data) => fetch('/api/auth/register', ...),
    me: () => fetch('/api/auth/me', ...),
  },
  users: {
    list: (params) => fetch('/api/users', ...),
    get: (id) => fetch(`/api/users/${id}`, ...),
    update: (id, data) => fetch(`/api/users/${id}`, ...),
    delete: (id) => fetch(`/api/users/${id}`, ...),
  },
};
```

**Estimated Time:** 20 minutes

---

**Step 8.2: Create React Hooks**

**Prompts:**

```
1. "Tạo hook useAuth với login, register, logout, user state"

2. "Tạo hook useUsers với list, get, update, delete, loading states"

3. "Tạo hook useProducts tương tự useUsers"
```

**Expected Output:**

```
src/hooks/
  ├── useAuth.ts
  ├── useUsers.ts
  └── useProducts.ts
```

**Estimated Time:** 25 minutes

---

**Step 8.3: Update Pages to Use Real Data**

**Prompts:**

```
1. "Update LoginForm để call useAuth hook thay vì mock"

2. "Update Dashboard page để fetch real stats từ API"

3. "Update Users page để use useUsers hook"
```

**Verification:**

- [ ] Login works with real API
- [ ] Dashboard shows real data
- [ ] Users table shows real data
- [ ] CRUD operations work

**Estimated Time:** 20 minutes

---

#### Phase 9: Add Authentication (45 minutes)

**Goal:** Protect routes and add auth flow

**Step 9.1: Setup NextAuth.js**

**Manual Steps:**

```bash
npm install next-auth
```

**Prompt:**

```
Setup NextAuth.js với:
- Credentials provider
- JWT strategy
- Session management
- Protected routes middleware
```

**Expected Output:**

```
src/app/api/auth/[...nextauth]/
  └── route.ts

middleware.ts
```

**Estimated Time:** 20 minutes

---

**Step 9.2: Protect Routes**

**Prompt:**

```
Add authentication protection:
- Redirect to /login if not authenticated
- Protect /dashboard/* routes
- Allow public access to /login, /register
```

**Verification:**

- [ ] Can't access dashboard without login
- [ ] Redirects to login
- [ ] After login, redirects to dashboard

**Estimated Time:** 15 minutes

---

**Step 9.3: Add User Menu**

**Prompt:**

```
Update Header component với:
- User avatar
- Dropdown menu (Profile, Settings, Logout)
- Logout functionality
```

**Estimated Time:** 10 minutes

---

#### Phase 10: Testing & Optimization (90 minutes)

**Goal:** Ensure quality and performance

**Step 10.1: Write Component Tests**

**Prompt:**

```
Tạo tests cho tất cả components với Testing Library:
- Render tests
- Props tests
- Event handler tests
- Accessibility tests
```

**Run Tests:**

```bash
npm run test
```

**Estimated Time:** 30 minutes

---

**Step 10.2: Write E2E Tests**

**Prompt:**

```
Tạo E2E tests với Playwright:
- Login flow
- Register flow
- Dashboard navigation
- CRUD operations
```

**Run E2E:**

```bash
npx playwright test
```

**Estimated Time:** 30 minutes

---

**Step 10.3: Performance Optimization**

**Prompts:**

```
1. "Analyze bundle size và optimize imports"

2. "Add lazy loading cho heavy components"

3. "Optimize images với next/image"

4. "Add caching strategies"
```

**Verification:**

- [ ] Lighthouse score > 90
- [ ] Initial load < 2s
- [ ] FPS = 60
- [ ] Bundle size optimized

**Estimated Time:** 20 minutes

---

**Step 10.4: Final Cleanup**

**Prompt:**

```
Cleanup workspace:
- Remove unused files
- Remove unused imports
- Remove unused dependencies
- Format all code
- Fix all linting errors
```

**Estimated Time:** 10 minutes

---

#### Phase 11: Deployment (30 minutes)

**Goal:** Deploy to production

**Step 11.1: Prepare for Deployment**

**Checklist:**

- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Environment variables documented
- [ ] README updated

**Estimated Time:** 10 minutes

---

**Step 11.2: Deploy to Vercel**

**Manual Steps:**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Or use Vercel Dashboard:**

1. Connect GitHub repo
2. Configure environment variables
3. Deploy

**Verification:**

- [ ] App deployed successfully
- [ ] All pages work
- [ ] API routes work
- [ ] Database connected

**Estimated Time:** 15 minutes

---

**Step 11.3: Post-Deployment**

**Checklist:**

- [ ] Test production URL
- [ ] Monitor errors (Sentry)
- [ ] Check analytics
- [ ] Document deployment process

**Estimated Time:** 5 minutes

---

### Total Estimated Time

| Phase | Time |
|-------|------|
| 1. Project Initialization | 15 min |
| 2. UI Design & Mockups | 30 min |
| 3. Build UI Components | 60 min |
| 4. Create Pages | 45 min |
| 5. Test UI/UX | 30 min |
| 6. Backend Setup | 60 min |
| 7. Create API Routes | 90 min |
| 8. Connect Frontend to Backend | 60 min |
| 9. Add Authentication | 45 min |
| 10. Testing & Optimization | 90 min |
| 11. Deployment | 30 min |
| **TOTAL** | **~8.5 hours** |

**Note:** Times are estimates for an experienced developer using AI assistance. Actual time may vary based on project complexity and familiarity with the stack.

---

### Best Practices for AI-Assisted Development

#### 1. Writing Effective Prompts

**Good Prompts:**

```
✅ "Tạo LoginForm component với email/password inputs, Zod validation, error states, submit handler, Apple Design"

✅ "Tạo API POST /api/users với Zod validation, Prisma create, error handling, return user without password"
```

**Bad Prompts:**

```
❌ "Make a login form"
❌ "Create user API"
```

**Tips:**

- Be specific about requirements
- Mention tech stack (Zod, Prisma, etc.)
- Specify design system (Apple Design)
- Include error handling requirements
- Mention TypeScript types

---

#### 2. Verifying AI-Generated Code

**Always Check:**

- [ ] TypeScript types are correct
- [ ] No `any` types
- [ ] Error handling exists
- [ ] Validation is present
- [ ] Security best practices followed
- [ ] Performance considerations
- [ ] Accessibility features

**Use Tools:**

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Test
npm run test

# Build
npm run build
```

---

#### 3. Iterating and Refining

**Workflow:**

1. Generate initial code with AI
2. Test manually
3. Identify issues
4. Refine with specific prompts
5. Test again
6. Repeat until perfect

**Example Iteration:**

```
Initial: "Tạo Button component"
→ Test → Missing loading state

Refine: "Add loading state với spinner vào Button component"
→ Test → Spinner too large

Refine: "Reduce spinner size to 16px trong Button component"
→ Test → Perfect!
```

---

#### 4. Common Pitfalls to Avoid

**Don't:**

- ❌ Accept AI code without testing
- ❌ Skip TypeScript type checking
- ❌ Ignore security warnings
- ❌ Use mock data in production
- ❌ Skip error handling
- ❌ Forget about accessibility
- ❌ Ignore performance

**Do:**

- ✅ Test every AI-generated component
- ✅ Verify TypeScript types
- ✅ Add proper error handling
- ✅ Implement validation
- ✅ Follow security best practices
- ✅ Optimize for performance
- ✅ Ensure accessibility

---

### Conclusion

This workflow enables you to build a complete, production-ready web application using AI coding assistants in approximately **8-10 hours**. The key is:

1. **Frontend-First Approach** - Visual feedback drives faster iterations
2. **Clear, Specific Prompts** - AI generates better code with detailed requirements
3. **Iterative Refinement** - Test, refine, repeat until perfect
4. **Quality Checks** - Always verify AI-generated code
5. **Best Practices** - Follow security, performance, and accessibility standards

With this Agent System and workflow, you can leverage AI to build professional applications 10x faster while maintaining high code quality.

---

## Quick Reference

### Essential Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Testing
npm run test             # Run unit tests
npm run test:e2e         # Run E2E tests
npm run type-check       # TypeScript check
npm run lint             # Lint code

# Database
npx prisma studio        # Open Prisma Studio
npx prisma db push       # Push schema to DB
npx prisma db seed       # Seed database
npx prisma generate      # Generate Prisma Client

# Deployment
vercel --prod            # Deploy to Vercel
```

---

### Most Used Prompts

**Component:**

```
Tạo component {Name} với {features}, Apple Design
```

**Page:**

```
Tạo page {Name} tại {route} với {components}, Apple Design
```

**API:**

```
Tạo API {method} {route} với Zod validation, Prisma, error handling
```

**Hook:**

```
Tạo hook use{Name} với {features}, loading states, error handling
```

---

### File Structure Quick Reference

```
src/
├── app/              # Pages & API routes
├── components/       # React components
│   ├── ui/          # Base components
│   ├── forms/       # Form components
│   └── layouts/     # Layout components
├── hooks/           # Custom hooks
├── lib/             # Library code
├── services/        # Business logic
├── types/           # TypeScript types
├── utils/           # Utilities
└── styles/          # Global styles
```

---

### Support & Resources

**Documentation:**

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Agents.md Standard](https://agents.md)

**MCP Servers:**

- [Serena GitHub](https://github.com/oraios/serena)
- [Human MCP GitHub](https://github.com/mrgoonie/human-mcp)

**Community:**

- [Augment Code Discord](https://discord.gg/augmentcode)
- [Next.js Discord](https://discord.gg/nextjs)

---

**Happy Building! 🚀**

---

**Version:** 3.0.0
**Last Updated:** 2025-10-20
**License:** MIT
**Author:** Nguyen Hai Ninh
**Developer:** Nguyen Hai Ninh (<haininh3496@gmail.com>)

---

# 🎨 LIQUID GLASS DESIGN SYSTEM (COMPREHENSIVE)

> **🔴 CRITICAL:** This is the PRIMARY design system for UI development.
> AI Agents MUST follow these guidelines when creating ANY UI components.

## 📋 Table of Contents

1. [🎨 Kiến Trúc Thiết Kế](#kiến-trúc-thiết-kế)
2. [🌈 Hệ Thống Màu Sắc](#hệ-thống-màu-sắc)
3. [📝 Typography System](#typography-system)
4. [📏 Spacing System](#spacing-system)
5. [🔘 Border Radius](#border-radius)
6. [🌓 Shadow System](#shadow-system)
7. [🎭 Backdrop Blur](#backdrop-blur)
8. [🎬 Animation System](#animation-system)
9. [📱 Mobile-First Patterns](#mobile-first-patterns)
10. [🎯 Interaction Patterns](#interaction-patterns)
11. [🎨 Design Philosophy](#design-philosophy)
12. [📊 Technical Specs](#technical-specs)

---

## 🎨 Kiến Trúc Thiết Kế

### **3-Layer Architecture**

Liquid Glass Design System được xây dựng trên kiến trúc 3 lớp:

```
Layer 3: Content Layer (z-index: 10-50)
         ↑
Layer 2: Surface Layer (z-index: 1-9) - Glass surfaces
         ↑
Layer 1: Background Layer (z-index: 0) - Gradients + Blur Orbs
```

#### **Layer 1: Background Layer (z-index: 0)**

**Purpose:** Tạo nền gradient với animated blur orbs

**Components:**

- Pastel gradient background (3 color stops)
- Animated blur orbs (3-5 orbs)
- Subtle animations (floating, pulsing)

**CSS Example:**

```css
.background-layer {
  position: fixed;
  inset: 0;
  z-index: 0;
  background: linear-gradient(
    135deg,
    #fef3f3 0%,    /* Soft pink */
    #f0f4ff 50%,   /* Soft blue */
    #fef9f3 100%   /* Soft peach */
  );
}

.blur-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  animation: float 20s ease-in-out infinite;
}

.blur-orb-1 {
  width: 288px;
  height: 288px;
  background: radial-gradient(circle, #ffc4d6 0%, transparent 70%);
  top: 10%;
  left: 15%;
}

.blur-orb-2 {
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, #c4d7ff 0%, transparent 70%);
  bottom: 20%;
  right: 10%;
}

.blur-orb-3 {
  width: 384px;
  height: 384px;
  background: radial-gradient(circle, #ffd4c4 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(20px, -20px); }
  50% { transform: translate(-15px, 15px); }
  75% { transform: translate(15px, 10px); }
}
```

#### **Layer 2: Surface Layer (z-index: 1-9)**

**Purpose:** Glass surfaces với backdrop blur

**4 Opacity Levels:**

| Level | Opacity | Blur | Use Case | Reasoning |
|-------|---------|------|----------|-----------|
| **Level 1** | 30% | 24px | Main containers | Subtle, see-through, elegant |
| **Level 2** | 20% | 40px | Overlays, modals | Very transparent, focus on content |
| **Level 3** | 70% | 12px | Cards, panels | More solid, better readability |
| **Level 4** | 90% | 4px | Buttons, inputs | Almost opaque, clear interaction |

**CSS Examples:**

```css
/* Level 1: Main Container (30% opacity) */
.glass-container {
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

/* Level 2: Modal Overlay (20% opacity) */
.glass-modal {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* Level 3: Card (70% opacity) */
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

/* Level 4: Button (90% opacity) */
.glass-button {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 1);
}
```

#### **Layer 3: Content Layer (z-index: 10-50)**

**Purpose:** Text, icons, interactive elements

**Z-index Strategy:**

- Text content: z-index: 10
- Icons: z-index: 15
- Buttons: z-index: 20
- Dropdowns: z-index: 30
- Modals: z-index: 40
- Tooltips: z-index: 50

**Best Practices:**

1. ✅ Always use relative z-index (not absolute values like 9999)
2. ✅ Group related elements in same z-index range
3. ✅ Leave gaps between ranges for future additions
4. ✅ Document z-index usage in comments

---

## 🌈 Hệ Thống Màu Sắc

### **Background Gradients**

**3-Stop Pastel Gradient:**

```css
background: linear-gradient(
  135deg,
  #fef3f3 0%,    /* Soft pink - Hue: 0°, Sat: 50%, Light: 97% */
  #f0f4ff 50%,   /* Soft blue - Hue: 220°, Sat: 100%, Light: 97% */
  #fef9f3 100%   /* Soft peach - Hue: 30°, Sat: 50%, Light: 97% */
);
```

**Why These Colors:**

- **Soft Pink (#fef3f3):** Warm, welcoming, reduces eye strain
- **Soft Blue (#f0f4ff):** Calm, professional, iOS-like
- **Soft Peach (#fef9f3):** Balanced, neutral, complements both

**Hue Rotation Analysis:**

- Pink (0°) → Blue (220°) = 220° rotation
- Blue (220°) → Peach (30°) = 170° rotation (via 360°)
- Creates smooth, harmonious transition

**Góc Độ 135deg:**

- Diagonal từ top-left → bottom-right
- Tạo depth và movement
- Không quá aggressive (như 90deg hoặc 180deg)

---

### **Blur Orbs**

**3 Orbs với Kích Thước Khác Nhau:**

| Orb | Size | Color | Position | Opacity | Blur | Animation |
|-----|------|-------|----------|---------|------|-----------|
| **Orb 1** | 288px | Pink (#ffc4d6) | Top-left (10%, 15%) | 0.6 | 80px | Float 20s |
| **Orb 2** | 320px | Blue (#c4d7ff) | Bottom-right (20%, 10%) | 0.6 | 80px | Float 25s |
| **Orb 3** | 384px | Peach (#ffd4c4) | Center (50%, 50%) | 0.6 | 80px | Float 30s |

**Why These Sizes:**

- **288px (18rem):** Base size, divisible by 8pt grid (288 = 36 × 8)
- **320px (20rem):** Medium size, divisible by 8pt grid (320 = 40 × 8)
- **384px (24rem):** Large size, divisible by 8pt grid (384 = 48 × 8)

**Mathematical Relationship:**

```
288px × 1.11 ≈ 320px
320px × 1.20 ≈ 384px
Ratio: 1 : 1.11 : 1.33
```

**Opacity 0.6 (60%):**

- Visible enough to create atmosphere
- Transparent enough to not distract
- Blends well with gradient background

**Blur 80px:**

- Large blur creates soft, dreamy effect
- Matches "liquid" aesthetic
- GPU-accelerated for performance

**Animation Timing:**

- Orb 1: 20s (fastest)
- Orb 2: 25s (medium)
- Orb 3: 30s (slowest)
- Different speeds create organic, natural movement

---

### **Glass Surfaces**

**4 Opacity Levels Explained:**

#### **Level 1: 30% Opacity (Main Containers)**

```css
background: rgba(255, 255, 255, 0.3);
backdrop-filter: blur(24px);
```

**Why 30%:**

- Subtle, elegant, see-through
- Shows background gradient and orbs
- Creates "floating" effect
- Best for large containers (main app container)

**Why 24px Blur:**

- Medium blur for balance
- Not too sharp (like 4px)
- Not too blurry (like 64px)
- Divisible by 8pt grid (24 = 3 × 8)

**Use Cases:**

- Main app container
- Dashboard background
- Large panels

---

#### **Level 2: 20% Opacity (Overlays)**

```css
background: rgba(255, 255, 255, 0.2);
backdrop-filter: blur(40px);
```

**Why 20%:**

- Very transparent
- Focus on content, not container
- Creates depth (layering effect)

**Why 40px Blur:**

- Heavy blur for dreamy effect
- Background becomes abstract
- Divisible by 8pt grid (40 = 5 × 8)

**Use Cases:**

- Modal overlays
- Dropdown menus
- Tooltips

---

#### **Level 3: 70% Opacity (Cards)**

```css
background: rgba(255, 255, 255, 0.7);
backdrop-filter: blur(12px);
```

**Why 70%:**

- More solid, better readability
- Still shows some background
- Good contrast for text

**Why 12px Blur:**

- Light blur for subtle effect
- Maintains sharpness
- Divisible by 8pt grid (12 = 1.5 × 8)

**Use Cases:**

- Task cards
- List items
- Content panels

---

#### **Level 4: 90% Opacity (Buttons)**

```css
background: rgba(255, 255, 255, 0.9);
backdrop-filter: blur(4px);
```

**Why 90%:**

- Almost opaque
- Clear interaction cue
- High contrast for text

**Why 4px Blur:**

- Minimal blur
- Maintains sharpness
- Divisible by 8pt grid (4 = 0.5 × 8)

**Use Cases:**

- Buttons
- Input fields
- Interactive elements

---

### **iOS Blue #007AFF**

**Color Values:**

| Format | Value | Notes |
|--------|-------|-------|
| **HEX** | #007AFF | iOS system blue |
| **RGB** | rgb(0, 122, 255) | R:0, G:122, B:255 |
| **HSL** | hsl(211, 100%, 50%) | Hue:211°, Sat:100%, Light:50% |
| **OKLCH** | oklch(0.55 0.22 250) | Perceptually uniform |

**Contrast Ratios:**

| Background | Contrast | WCAG Level |
|------------|----------|------------|
| White (#FFFFFF) | 4.5:1 | AA (normal text) |
| Light Gray (#F5F5F5) | 4.2:1 | AA (large text) |
| Glass 90% | 4.8:1 | AA (normal text) |
| Glass 70% | 3.5:1 | AA (large text only) |

**Why iOS Blue:**

- Universally recognized as "action" color
- High contrast on white/light backgrounds
- Accessible (WCAG AA compliant)
- Matches iOS Human Interface Guidelines

---

### **Semantic Colors**

#### **Priority Colors**

| Priority | Color | HEX | Use Case | Psychology |
|----------|-------|-----|----------|------------|
| **High** | Red | #FF3B30 | Urgent tasks | Attention, urgency |
| **Medium** | Orange | #FF9500 | Important tasks | Warning, caution |
| **Low** | Green | #34C759 | Normal tasks | Calm, safe |
| **None** | Gray | #8E8E93 | Backlog | Neutral, inactive |

**Color Psychology:**

- **Red:** Stimulates action, creates urgency
- **Orange:** Draws attention without alarm
- **Green:** Reassuring, positive
- **Gray:** Neutral, low priority

---

#### **Status Colors**

| Status | Color | HEX | Icon | Meaning |
|--------|-------|-----|------|---------|
| **Success** | Green | #34C759 | ✓ | Completed, success |
| **Warning** | Orange | #FF9500 | ⚠ | Needs attention |
| **Error** | Red | #FF3B30 | ✕ | Failed, error |
| **Info** | Blue | #007AFF | ℹ | Information |

---

### **Text Hierarchy**

**5 Levels với Contrast Ratios:**

| Level | Size | Weight | Color | Contrast | Use Case |
|-------|------|--------|-------|----------|----------|
| **H1** | 17px | 500 | #000000 | 21:1 | Page titles |
| **H2** | 15px | 500 | #000000 | 21:1 | Section headers |
| **Body** | 15px | 400 | #000000 | 21:1 | Main content |
| **Caption** | 13px | 400 | #3C3C43 | 10.7:1 | Metadata, timestamps |
| **Disabled** | 15px | 400 | #8E8E93 | 4.5:1 | Disabled text |

**Why These Contrast Ratios:**

- **21:1 (Black on White):** Maximum readability
- **10.7:1 (Dark Gray):** Still AAA compliant
- **4.5:1 (Medium Gray):** AA compliant (minimum)

**WCAG Compliance:**

- H1, H2, Body: AAA (7:1+)
- Caption: AAA (7:1+)
- Disabled: AA (4.5:1+)

---

## 📝 Typography System

### **Font Stack**

```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", 
             "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif;
```

**Fallback Chain Explained:**

1. **-apple-system:** macOS/iOS San Francisco font (primary)
2. **BlinkMacSystemFont:** Chrome on macOS
3. **SF Pro Display:** San Francisco for large text (20px+)
4. **SF Pro Text:** San Francisco for small text (<20px)
5. **Segoe UI:** Windows system font
6. **Roboto:** Android system font
7. **Helvetica Neue:** Older macOS fallback
8. **Arial:** Universal fallback
9. **sans-serif:** Generic fallback

**Why San Francisco:**

- Apple's system font since iOS 9 / macOS El Capitan
- Optimized for legibility at all sizes
- Dynamic tracking (letter-spacing adjusts by size)
- Optical sizes for different text sizes
- Professional, modern, clean

---

### **Font Sizes**

**iOS Standard Sizes:**

| Size | Use Case | Why This Size | Mathematical Relationship |
|------|----------|---------------|---------------------------|
| **17px** | Body text, buttons | iOS default body size | 12px × 1.417 |
| **15px** | Secondary text, labels | iOS secondary size | 12px × 1.25 |
| **13px** | Captions, metadata | iOS caption size | 12px × 1.083 |

**Mathematical Relationships:**

```
Base: 12px (not used, but foundation)
13px = 12px × 1.083 (small increment)
15px = 12px × 1.25  (25% larger)
17px = 12px × 1.417 (golden ratio-ish)

Also:
13px × 1.15 ≈ 15px
15px × 1.13 ≈ 17px
```

**Why These Specific Sizes:**

- **17px:** iOS default, proven optimal for mobile reading
- **15px:** Smaller but still comfortable, good for dense UIs
- **13px:** Minimum for comfortable reading (WCAG recommends 12px+)

**NOT Using:**

- 14px, 16px, 18px (not iOS standard)
- Arbitrary sizes (breaks consistency)

---

### **Font Weights**

**Only 2 Weights:**

| Weight | Value | Use Case | Why |
|--------|-------|----------|-----|
| **Regular** | 400 | Body text, captions | Default, most readable |
| **Medium** | 500 | Headers, emphasis | Subtle emphasis without being bold |

**Why Only 2 Weights:**

- **Simplicity:** Fewer choices = more consistent
- **iOS Standard:** iOS uses primarily 400 and 500
- **Performance:** Fewer font files to load
- **Readability:** 400 is optimal for body text, 500 for headers

**NOT Using:**

- 300 (Light): Too thin, poor readability
- 600 (Semibold): Too heavy, not iOS-like
- 700 (Bold): Too aggressive for this design

---

### **Line Height**

**Universal 1.5 Ratio:**

```css
line-height: 1.5; /* 150% of font size */
```

**Examples:**

- 17px font → 25.5px line-height
- 15px font → 22.5px line-height
- 13px font → 19.5px line-height

**Why 1.5:**

- **WCAG Recommendation:** 1.5 minimum for body text
- **Readability:** Comfortable spacing between lines
- **Universal:** Works for all font sizes
- **iOS Standard:** iOS uses ~1.4-1.5 for body text

**NOT Using:**

- 1.2 (too tight, hard to read)
- 1.8 (too loose, breaks visual flow)
- Variable line-heights (inconsistent)

---

## 📏 Spacing System (8pt Grid)

### **Base Unit: 4px**

**Why 4px:**

- **Divisible by 2:** Easy to halve (2px)
- **Divisible by 4:** Quarter grid (1px)
- **Divisible by 8:** Standard 8pt grid
- **iOS Standard:** iOS uses 4px/8px increments

**Grid Multiples:**

```
1× = 4px   (0.25rem)
2× = 8px   (0.5rem)
3× = 12px  (0.75rem)
4× = 16px  (1rem)
5× = 20px  (1.25rem)
6× = 24px  (1.5rem)
8× = 32px  (2rem)
11× = 44px (2.75rem) - iOS touch target
```

---

### **Padding System**

**Standard Padding: px-4 py-3 (16px × 12px)**

```css
padding: 12px 16px; /* py-3 px-4 */
```

**Ratio Analysis:**

- Horizontal: 16px (4 × 4px)
- Vertical: 12px (3 × 4px)
- Ratio: 4:3 (classic aspect ratio)

**Why 16px Horizontal:**

- Comfortable touch target width
- Aligns with 8pt grid (16 = 2 × 8)
- iOS standard for buttons

**Why 12px Vertical:**

- Balanced with 16px horizontal
- Creates rectangular (not square) buttons
- Aligns with 4pt grid (12 = 3 × 4)

---

### **Gap System**

| Gap | Value | Use Case | Why |
|-----|-------|----------|-----|
| **gap-2** | 8px | Tight spacing (icons + text) | Minimum comfortable gap |
| **gap-3** | 12px | Medium spacing (list items) | Balanced, not too tight |
| **gap-4** | 16px | Loose spacing (cards) | Comfortable breathing room |

---

### **Touch Targets: 44px Minimum**

**iOS Standard:**

- Minimum touch target: 44px × 44px
- Recommended: 48px × 48px

**Implementation:**

```css
.button {
  min-height: 44px; /* iOS minimum */
  padding: 12px 16px; /* Ensures 44px+ height */
}

.icon-button {
  width: 44px;
  height: 44px;
  padding: 10px; /* 44px - (10px × 2) = 24px icon */
}
```

**Why 44px:**

- **Apple HIG:** iOS Human Interface Guidelines standard
- **Accessibility:** Easy to tap for all users
- **Ergonomics:** Average fingertip is ~40-44px

---

## 🔘 Border Radius

### **Primary: 20px (1.25rem)**

```css
border-radius: 20px;
```

**Mathematical Reasoning:**

- 20px = 5 × 4px (perfect 8pt grid multiple)
- 20px = 1.25rem (clean rem value)
- 20px = 2.5 × 8px (8pt grid multiple)

**Why 20px:**

- **Squircle Aesthetic:** Mimics iOS app icon curves
- **Not Too Round:** 16px too subtle, 24px too round
- **Goldilocks Zone:** Just right for modern UI

---

### **Squircle Aesthetic**

**iOS 14+ App Icon Influence:**

- iOS app icons use "squircle" (square + circle hybrid)
- Not perfect circle, not sharp square
- Smooth, continuous curvature

**Optical Correction:**

- 20px radius on 80px element = 25% curve
- 20px radius on 48px element = 41.67% curve
- Creates consistent "roundness" feel

---

### **Radius-to-Size Ratios**

| Element | Size | Radius | Ratio | Visual Effect |
|---------|------|--------|-------|---------------|
| **Large Card** | 400px | 20px | 5% | Subtle rounding |
| **Medium Card** | 200px | 20px | 10% | Noticeable rounding |
| **Button** | 44px | 20px | 45% | Very round (pill-like) |
| **Avatar** | 40px | 20px | 50% | Perfect circle |
| **Tag** | 24px | 12px | 50% | Perfect circle |

---

## 🌓 Shadow System

### **5% Opacity - Why So Subtle?**

```css
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
```

**Reasoning:**

- **Glass Aesthetic:** Heavy shadows break illusion
- **Subtle Depth:** Just enough to create layering
- **Not Distracting:** Focus on content, not shadows
- **Modern:** Flat design with hint of depth

**Comparison:**

- Material Design: 10-20% opacity (too heavy)
- iOS: 5-8% opacity (subtle, elegant)
- Liquid Glass: 5% opacity (matches iOS)

---

### **Colored Shadows (Blue Glow)**

```css
/* Button hover state */
box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
```

**Why Blue Glow:**

- Matches iOS Blue (#007AFF)
- Creates "active" feeling
- Draws attention to interactive elements
- 30% opacity for visibility without overwhelming

---

## 🎭 Backdrop Blur

### **4 Levels**

| Level | Blur | Use Case | Effect |
|-------|------|----------|--------|
| **Level 1** | 4px | Buttons, inputs | Minimal blur, sharp |
| **Level 2** | 24px | Main containers | Medium blur, balanced |
| **Level 3** | 40px | Modals, overlays | Heavy blur, dreamy |
| **Level 4** | 64px | Full-screen overlays | Maximum blur, abstract |

**Effect Chain:**

```
Content → Backdrop Blur → Glass Overlay = Frosted Glass Effect
```

**Performance:**

- GPU-accelerated
- Use `will-change: backdrop-filter` for animations
- Limit to 3-4 blur layers max

---

## 🎬 Animation System

### **150ms Duration (iOS Standard)**

```css
transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
```

**Why 150ms:**

- iOS standard timing
- Fast enough to feel responsive
- Slow enough to be smooth
- Not jarring or abrupt

**Timing Function:**

- `cubic-bezier(0.4, 0, 0.2, 1)` = "ease-out"
- Starts fast, ends slow
- Natural, organic feel

---

### **Scale Animations**

| Element | Scale | Use Case |
|---------|-------|----------|
| **Large** | scale(0.98) | Cards, panels (2% shrink) |
| **Small** | scale(0.95) | Buttons, icons (5% shrink) |

**Why Different Scales:**

- Large elements: Subtle feedback (2%)
- Small elements: Noticeable feedback (5%)

---

## 📱 Mobile-First Patterns

### **448px Container (iPhone 14 Pro Max)**

```css
max-width: 448px; /* 28rem */
```

**Why 448px:**

- iPhone 14 Pro Max width: 430px
- 448px = 430px + 18px padding
- Divisible by 8pt grid (448 = 56 × 8)

---

## �� Interaction Patterns

### **Tap Targets**

- Entire row clickable (not just text)
- Icon + padding = 44px minimum
- Button area = 44px × full width

---

## 🎨 Design Philosophy

### **5 Core Principles**

1. **Minimalism:** Less is more
2. **Clarity:** Clear hierarchy
3. **Consistency:** Predictable patterns
4. **Lightness:** Airy, spacious
5. **Precision:** Mathematical accuracy

---

## 📊 Technical Specs

### **Performance Budget**

- Max blur layers: 4
- Max transition duration: 300ms
- Target FPS: 60

### **Browser Support**

- Chrome 76+
- Safari 9+
- Firefox 103+
- Edge 79+

### **Accessibility**

- WCAG AA compliant
- Contrast ratios: 4.5:1+
- Touch targets: 44px+
- Keyboard navigation

---

**🎉 Design System Complete!**

---

# 🚀 CLOUDFLARE TUNNEL DEPLOYMENT

## **Overview**

Complete automated deployment system for Next.js applications to Ubuntu Server with Cloudflare Tunnel, PM2, and PostgreSQL.

**Successfully deployed:** Thư Viện Ảnh (thuvienanh.ninh.app) - October 2025

**Key Features:**
- ✅ 100% automated deployment (no manual Cloudflare Dashboard config)
- ✅ Automatic DNS route creation with `cloudflared tunnel route dns --overwrite-dns`
- ✅ PM2 process management
- ✅ PostgreSQL database setup
- ✅ Upload directory structure creation
- ✅ HTTPS via Cloudflare Tunnel
- ✅ Tailscale VPN for secure server access

---

## **Prerequisites**

### **1. Server Requirements**

- **OS:** Ubuntu 24.04 LTS (or compatible)
- **User:** nihdev (with sudo access)
- **Password:** haininh1
- **IP:** 100.115.191.19 (Tailscale VPN)
- **SSH:** Tailscale must be connected on local machine

### **2. Installed Software**

```bash
# On Ubuntu Server
- Node.js 18+ (with npm)
- PostgreSQL 14+
- PM2 (npm install -g pm2)
- cloudflared (Cloudflare Tunnel client)
- rsync
```

### **3. Cloudflare Tunnel**

- **Tunnel Name:** ubuntu-server
- **Tunnel ID:** a9be71f0-d209-49c8-8b32-9c6f91aba33c
- **Config File:** /etc/cloudflared/config.yml
- **Credentials:** /etc/cloudflared/a9be71f0-d209-49c8-8b32-9c6f91aba33c.json
- **Service:** systemd (cloudflared.service)

### **4. Domain**

- **Root Domain:** ninh.app (managed by Cloudflare)
- **DNS:** Cloudflare DNS (proxied)

---

## **Deployment Architecture**

```
User Browser
    ↓ HTTPS
Cloudflare CDN (104.21.90.162, 172.67.202.115)
    ↓ Cloudflare Tunnel (QUIC/HTTP2)
Ubuntu Server (100.115.191.19)
    ↓ Cloudflared Service
    ↓ Ingress Rule Match
Next.js App (localhost:4000)
    ↓ PM2 Process Manager
    ↓ PostgreSQL Database (localhost:5432)
    ↓ Local File Storage (/data/Ninh/projects/)
```

---

## **Step-by-Step Deployment Guide**

### **Step 1: Prepare Local Project**

```bash
# Navigate to project directory
cd /Users/nihdev/Web/your-project

# Ensure .env.production exists
cat > .env.production << 'EOF'
NODE_ENV=production
PORT=4000
NEXT_TELEMETRY_DISABLED=1

DATABASE_URL=postgresql://nihdev:haininh1@100.115.191.19:5432/your_db_name
POSTGRES_HOST=100.115.191.19
POSTGRES_PORT=5432
POSTGRES_USER=nihdev
POSTGRES_PASSWORD=haininh1
POSTGRES_DB=your_db_name

UPLOAD_BASE_DIR=/data/Ninh/projects/your-project

NEXT_PUBLIC_API_URL=https://your-subdomain.ninh.app
EOF

# Build project locally
npm run build
```

### **Step 2: Create Upload Directory Structure on Server**

```bash
# SSH to server and create directories
ssh nihdev@100.115.191.19 << 'EOF'
sudo mkdir -p /data/Ninh/projects/your-project/{fabrics,collections,projects,events,albums,accessories,styles}/{moq,new,clearance,demo,general,all,residential,commercial,office,internal,external,training,decorative,rods}
sudo chown -R nihdev:nihdev /data/Ninh/projects/your-project
chmod -R 755 /data/Ninh/projects/your-project
EOF
```

### **Step 3: Sync Files to Server**

```bash
# Rsync project files (exclude node_modules, .git, etc.)
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.next' \
  --exclude '.env.local' \
  --exclude 'dist' \
  /Users/nihdev/Web/your-project/ \
  nihdev@100.115.191.19:/data/Ninh/projects/your-project/
```

### **Step 4: Install Dependencies and Build on Server**

```bash
# SSH to server
ssh nihdev@100.115.191.19

# Navigate to project directory
cd /data/Ninh/projects/your-project

# Install ALL dependencies (including devDependencies for build)
npm install

# Build project
npm run build

# Exit SSH
exit
```

### **Step 5: Create PostgreSQL Database**

```bash
# SSH to server and create database
ssh nihdev@100.115.191.19 << 'EOF'
sudo -u postgres psql -c "CREATE DATABASE your_db_name;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE your_db_name TO nihdev;"
EOF

# Run Prisma migrations (if using Prisma)
ssh nihdev@100.115.191.19 'cd /data/Ninh/projects/your-project && npx prisma migrate deploy'
```

### **Step 6: Configure PM2 Process**

Ensure `ecosystem.config.js` exists in project root:

```javascript
module.exports = {
  apps: [{
    name: 'your-project-name',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 4000',
    cwd: '/data/Ninh/projects/your-project',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    }
  }]
}
```

Start PM2 process:

```bash
ssh nihdev@100.115.191.19 'cd /data/Ninh/projects/your-project && pm2 start ecosystem.config.js && pm2 save'
```

### **Step 7: Update Cloudflare Tunnel Config**

Add ingress rule to `/etc/cloudflared/config.yml`:

```bash
ssh nihdev@100.115.191.19 << 'EOF'
echo "haininh1" | sudo -S tee -a /etc/cloudflared/config.yml > /dev/null << 'YAML'
  # Your Project Name
  - hostname: your-subdomain.ninh.app
    service: http://localhost:4000
YAML
EOF
```

Restart cloudflared service:

```bash
ssh nihdev@100.115.191.19 'echo "haininh1" | sudo -S systemctl restart cloudflared'
```

### **Step 8: Create DNS Route (CRITICAL)**

**This is the KEY step that makes domain work!**

```bash
# Create DNS route with --overwrite-dns flag
ssh nihdev@100.115.191.19 'cloudflared tunnel route dns --overwrite-dns a9be71f0-d209-49c8-8b32-9c6f91aba33c your-subdomain.ninh.app'

# Expected output:
# 2025-10-23T02:59:58Z INF Added CNAME your-subdomain.ninh.app which will route to this tunnel tunnelID=a9be71f0-d209-49c8-8b32-9c6f91aba33c
```

**Why `--overwrite-dns` is needed:**
- If DNS record already exists (A or AAAA), command will fail without this flag
- This flag overwrites existing DNS record with CNAME pointing to tunnel
- Without this, you get error: "An A, AAAA, or CNAME record with that host already exists"

### **Step 9: Wait for DNS Propagation**

```bash
# Wait 60-120 seconds for Cloudflare to propagate DNS changes
sleep 60
```

### **Step 10: Test Deployment**

```bash
# Test HTTPS domain
curl -I https://your-subdomain.ninh.app

# Expected: HTTP/2 200
# If you get HTTP 530, wait another 60 seconds and try again

# Test local access (via Tailscale)
curl -I http://100.115.191.19:4000

# Expected: HTTP/1.1 200
```

---

## **Automated Deployment Script**

Create `scripts/deploy-to-ubuntu.sh`:

```bash
#!/bin/bash
set -e

# Configuration
PROJECT_NAME="your-project"
SUBDOMAIN="your-subdomain"
PORT="4000"
DB_NAME="your_db_name"
SERVER_USER="nihdev"
SERVER_IP="100.115.191.19"
SERVER_PASSWORD="haininh1"
TUNNEL_ID="a9be71f0-d209-49c8-8b32-9c6f91aba33c"

LOCAL_PATH="/Users/nihdev/Web/${PROJECT_NAME}"
SERVER_PATH="/data/Ninh/projects/${PROJECT_NAME}"

echo "🚀 Starting deployment for ${PROJECT_NAME}..."

# Step 1: Build locally
echo "📦 Building project locally..."
cd "${LOCAL_PATH}"
npm run build

# Step 2: Create upload directories
echo "📁 Creating upload directories on server..."
ssh ${SERVER_USER}@${SERVER_IP} << EOF
sudo mkdir -p ${SERVER_PATH}/{fabrics,collections,projects,events,albums,accessories,styles}/{moq,new,clearance,demo,general,all,residential,commercial,office,internal,external,training,decorative,rods}
sudo chown -R ${SERVER_USER}:${SERVER_USER} ${SERVER_PATH}
chmod -R 755 ${SERVER_PATH}
EOF

# Step 3: Sync files
echo "📤 Syncing files to server..."
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.next' \
  --exclude '.env.local' \
  --exclude 'dist' \
  "${LOCAL_PATH}/" \
  ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/

# Step 4: Install dependencies and build
echo "🔧 Installing dependencies and building on server..."
ssh ${SERVER_USER}@${SERVER_IP} << EOF
cd ${SERVER_PATH}
npm install
npm run build
EOF

# Step 5: Create database
echo "🗄️ Creating PostgreSQL database..."
ssh ${SERVER_USER}@${SERVER_IP} << EOF
echo "${SERVER_PASSWORD}" | sudo -S -u postgres psql -c "CREATE DATABASE ${DB_NAME};" 2>/dev/null || echo "Database already exists"
echo "${SERVER_PASSWORD}" | sudo -S -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${SERVER_USER};"
EOF

# Step 6: Start/Restart PM2
echo "🔄 Starting PM2 process..."
ssh ${SERVER_USER}@${SERVER_IP} << EOF
cd ${SERVER_PATH}
pm2 describe ${PROJECT_NAME} > /dev/null 2>&1 && pm2 restart ${PROJECT_NAME} || pm2 start ecosystem.config.js
pm2 save
EOF

# Step 7: Update Cloudflare Tunnel config
echo "☁️ Updating Cloudflare Tunnel config..."
ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
# Check if hostname already exists in config
if ! grep -q "hostname: ${SUBDOMAIN}.ninh.app" /etc/cloudflared/config.yml; then
  echo "${SERVER_PASSWORD}" | sudo -S sed -i "/# Default catch-all/i \  # ${PROJECT_NAME}\n  - hostname: ${SUBDOMAIN}.ninh.app\n    service: http://localhost:${PORT}\n" /etc/cloudflared/config.yml
  echo "${SERVER_PASSWORD}" | sudo -S systemctl restart cloudflared
fi
EOF

# Step 8: Create DNS route
echo "🌐 Creating DNS route..."
ssh ${SERVER_USER}@${SERVER_IP} "cloudflared tunnel route dns --overwrite-dns ${TUNNEL_ID} ${SUBDOMAIN}.ninh.app"

# Step 9: Wait for propagation
echo "⏳ Waiting 60 seconds for DNS propagation..."
sleep 60

# Step 10: Test deployment
echo "🧪 Testing deployment..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://${SUBDOMAIN}.ninh.app)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Deployment successful!"
  echo "🌐 Domain: https://${SUBDOMAIN}.ninh.app"
  echo "📊 PM2 Status:"
  ssh ${SERVER_USER}@${SERVER_IP} "pm2 status | grep ${PROJECT_NAME}"
else
  echo "⚠️ Domain returned HTTP ${HTTP_CODE}"
  echo "Wait another 60 seconds and test manually:"
  echo "curl -I https://${SUBDOMAIN}.ninh.app"
fi

echo "🎉 Deployment complete!"
```

Make script executable:

```bash
chmod +x scripts/deploy-to-ubuntu.sh
```

Run deployment:

```bash
./scripts/deploy-to-ubuntu.sh
```

---

## **Troubleshooting**

### **Problem 1: HTTP 530 Error**

**Symptoms:**
```bash
curl -I https://your-subdomain.ninh.app
# HTTP/2 530
```

**Causes:**
1. DNS route not created
2. Cloudflare Tunnel not running
3. Ingress rule not matching
4. App not running on localhost:4000

**Solutions:**

```bash
# Check if DNS route exists
ssh nihdev@100.115.191.19 'cloudflared tunnel route dns list' 2>&1 | grep your-subdomain

# If not exists, create it
ssh nihdev@100.115.191.19 'cloudflared tunnel route dns --overwrite-dns a9be71f0-d209-49c8-8b32-9c6f91aba33c your-subdomain.ninh.app'

# Check cloudflared service
ssh nihdev@100.115.191.19 'echo "haininh1" | sudo -S systemctl status cloudflared'

# Check ingress rule
ssh nihdev@100.115.191.19 'cloudflared tunnel ingress rule https://your-subdomain.ninh.app'

# Check app is running
ssh nihdev@100.115.191.19 'curl -I http://localhost:4000'

# Check PM2 status
ssh nihdev@100.115.191.19 'pm2 status | grep your-project'
```

### **Problem 2: Build Fails on Server**

**Symptoms:**
```
Error: Cannot find module 'next'
```

**Cause:** Used `npm install --production` which doesn't install devDependencies

**Solution:**
```bash
# Use npm install WITHOUT --production flag
ssh nihdev@100.115.191.19 'cd /data/Ninh/projects/your-project && npm install && npm run build'
```

### **Problem 3: Cloudflared Connection Timeout**

**Symptoms:**
```
ERR Failed to dial a quic connection error="timeout: no recent network activity"
```

**Cause:** Network issues or firewall blocking QUIC protocol

**Solution:**
```bash
# Restart cloudflared service
ssh nihdev@100.115.191.19 'echo "haininh1" | sudo -S systemctl restart cloudflared'

# Wait 15 seconds for reconnection
sleep 15

# Check connections
ssh nihdev@100.115.191.19 'echo "haininh1" | sudo -S journalctl -u cloudflared -n 20 --no-pager | grep Registered'
```

### **Problem 4: DNS Record Already Exists**

**Symptoms:**
```
Failed to add route: code: 1003, reason: An A, AAAA, or CNAME record with that host already exists
```

**Solution:**
```bash
# Use --overwrite-dns flag
ssh nihdev@100.115.191.19 'cloudflared tunnel route dns --overwrite-dns a9be71f0-d209-49c8-8b32-9c6f91aba33c your-subdomain.ninh.app'
```

### **Problem 5: PM2 Process Not Starting**

**Symptoms:**
```
pm2 status
# Shows "errored" or "stopped"
```

**Solution:**
```bash
# Check PM2 logs
ssh nihdev@100.115.191.19 'pm2 logs your-project --lines 50'

# Delete and restart
ssh nihdev@100.115.191.19 'pm2 delete your-project && pm2 start ecosystem.config.js && pm2 save'
```

---

## **Best Practices**

### **1. Always Use --overwrite-dns Flag**

```bash
# ✅ CORRECT
cloudflared tunnel route dns --overwrite-dns a9be71f0-d209-49c8-8b32-9c6f91aba33c subdomain.ninh.app

# ❌ WRONG (will fail if DNS record exists)
cloudflared tunnel route dns a9be71f0-d209-49c8-8b32-9c6f91aba33c subdomain.ninh.app
```

### **2. Always Install ALL Dependencies on Server**

```bash
# ✅ CORRECT
npm install

# ❌ WRONG (missing devDependencies needed for build)
npm install --production
```

### **3. Always Wait for DNS Propagation**

```bash
# Create DNS route
cloudflared tunnel route dns --overwrite-dns ...

# Wait 60-120 seconds
sleep 60

# Then test
curl -I https://subdomain.ninh.app
```

### **4. Always Verify Each Step**

```bash
# After creating upload dirs
ssh nihdev@100.115.191.19 'ls -la /data/Ninh/projects/your-project'

# After syncing files
ssh nihdev@100.115.191.19 'ls -la /data/Ninh/projects/your-project/package.json'

# After building
ssh nihdev@100.115.191.19 'ls -la /data/Ninh/projects/your-project/.next'

# After starting PM2
ssh nihdev@100.115.191.19 'pm2 status | grep your-project'

# After creating DNS route
ssh nihdev@100.115.191.19 'cloudflared tunnel ingress rule https://subdomain.ninh.app'
```

### **5. Always Check Logs When Debugging**

```bash
# PM2 logs
ssh nihdev@100.115.191.19 'pm2 logs your-project --lines 100'

# Cloudflared logs
ssh nihdev@100.115.191.19 'echo "haininh1" | sudo -S journalctl -u cloudflared -n 50 --no-pager'

# System logs
ssh nihdev@100.115.191.19 'echo "haininh1" | sudo -S journalctl -xe'
```

---

## **Quick Reference Commands**

### **Deployment**

```bash
# Full deployment (one command)
./scripts/deploy-to-ubuntu.sh

# Manual deployment steps
npm run build
rsync -avz --exclude 'node_modules' --exclude '.git' /Users/nihdev/Web/project/ nihdev@100.115.191.19:/data/Ninh/projects/project/
ssh nihdev@100.115.191.19 'cd /data/Ninh/projects/project && npm install && npm run build'
ssh nihdev@100.115.191.19 'cd /data/Ninh/projects/project && pm2 start ecosystem.config.js && pm2 save'
ssh nihdev@100.115.191.19 'cloudflared tunnel route dns --overwrite-dns a9be71f0-d209-49c8-8b32-9c6f91aba33c subdomain.ninh.app'
```

### **PM2 Management**

```bash
# Status
ssh nihdev@100.115.191.19 'pm2 status'

# Logs
ssh nihdev@100.115.191.19 'pm2 logs project-name --lines 50'

# Restart
ssh nihdev@100.115.191.19 'pm2 restart project-name'

# Stop
ssh nihdev@100.115.191.19 'pm2 stop project-name'

# Delete
ssh nihdev@100.115.191.19 'pm2 delete project-name'

# Save PM2 list
ssh nihdev@100.115.191.19 'pm2 save'
```

### **Cloudflare Tunnel**

```bash
# Check tunnel status
ssh nihdev@100.115.191.19 'echo "haininh1" | sudo -S systemctl status cloudflared'

# Restart tunnel
ssh nihdev@100.115.191.19 'echo "haininh1" | sudo -S systemctl restart cloudflared'

# Check tunnel info
ssh nihdev@100.115.191.19 'cloudflared tunnel info a9be71f0-d209-49c8-8b32-9c6f91aba33c'

# Test ingress rule
ssh nihdev@100.115.191.19 'cloudflared tunnel ingress rule https://subdomain.ninh.app'

# View config
ssh nihdev@100.115.191.19 'cat /etc/cloudflared/config.yml'

# View logs
ssh nihdev@100.115.191.19 'echo "haininh1" | sudo -S journalctl -u cloudflared -n 50 --no-pager'
```

### **Testing**

```bash
# Test HTTPS domain
curl -I https://subdomain.ninh.app

# Test local app
curl -I http://100.115.191.19:4000

# Test from server
ssh nihdev@100.115.191.19 'curl -I http://localhost:4000'

# Test DNS resolution
dig subdomain.ninh.app A +short
dig subdomain.ninh.app CNAME +short
```

---

## **Success Checklist**

After deployment, verify:

- [ ] **App running locally:** `curl -I http://100.115.191.19:4000` → HTTP 200
- [ ] **PM2 process online:** `pm2 status | grep project-name` → online
- [ ] **Cloudflared running:** `systemctl status cloudflared` → active (running)
- [ ] **Ingress rule matched:** `cloudflared tunnel ingress rule https://subdomain.ninh.app` → Matched
- [ ] **DNS route created:** `cloudflared tunnel route dns list` → subdomain.ninh.app exists
- [ ] **Domain accessible:** `curl -I https://subdomain.ninh.app` → HTTP 200
- [ ] **Upload API working:** `curl -I https://subdomain.ninh.app/api/upload-local` → HTTP 405 (POST only)
- [ ] **Database connected:** Check app logs for successful DB connection

---

## **Real-World Example: Thư Viện Ảnh**

**Project:** thuvienanh (Image Library)
**Deployed:** October 23, 2025
**Domain:** https://thuvienanh.ninh.app
**Status:** ✅ Production

**Configuration:**

```bash
PROJECT_NAME="thuvienanh"
SUBDOMAIN="thuvienanh"
PORT="4000"
DB_NAME="thuvienanh_db"
SERVER_PATH="/data/Ninh/projects/thuvienanh"
```

**Deployment Time:** ~5 minutes (fully automated)

**Key Commands Used:**

```bash
# 1. Create DNS route (the critical step!)
ssh nihdev@100.115.191.19 'cloudflared tunnel route dns --overwrite-dns a9be71f0-d209-49c8-8b32-9c6f91aba33c thuvienanh.ninh.app'

# Output:
# 2025-10-23T02:59:58Z INF Added CNAME thuvienanh.ninh.app which will route to this tunnel tunnelID=a9be71f0-d209-49c8-8b32-9c6f91aba33c

# 2. Wait for propagation
sleep 60

# 3. Test
curl -I https://thuvienanh.ninh.app
# HTTP/2 200 ✅
```

**Lessons Learned:**

1. **Always use `--overwrite-dns` flag** - Saves 30+ minutes of manual DNS record deletion
2. **Wait 60-120 seconds after DNS route creation** - DNS propagation is not instant
3. **Use `npm install` not `npm install --production`** - Build needs devDependencies
4. **Verify cloudflared service is running** - Check with `systemctl status cloudflared`
5. **Test ingress rule matching** - Use `cloudflared tunnel ingress rule` to verify

---

**🎉 Cloudflare Tunnel Deployment Guide Complete!**

**For questions or issues, refer to:**
- Troubleshooting section above
- Cloudflare Tunnel docs: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- PM2 docs: https://pm2.keymetrics.io/docs/usage/quick-start/
