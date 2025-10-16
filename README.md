# Thư Viện Ảnh VẢI

Website quản lý thư viện ảnh vải chuyên nghiệp cho Marketing và Sales team.

---

## 🚀 Deploy to Windows 10 via Tailscale

**NEW!** Hướng dẫn deploy ứng dụng lên Windows 10 sử dụng Docker qua mạng Tailscale.

### **Quick Start:**
```bash
# One-click deploy
./deploy-now.sh
```

### **Hướng dẫn chi tiết:**
- 📖 **[START_HERE.md](START_HERE.md)** - Bắt đầu từ đây (6 bước đơn giản)
- 🚀 **[QUICK_START_WINDOWS_DOCKER.md](QUICK_START_WINDOWS_DOCKER.md)** - Quick start 3 bước
- 📚 **[DEPLOY_TO_WINDOWS_TAILSCALE.md](DEPLOY_TO_WINDOWS_TAILSCALE.md)** - Hướng dẫn đầy đủ
- 🔐 **[SETUP_SSH_WINDOWS.md](SETUP_SSH_WINDOWS.md)** - Setup SSH cho remote deploy

### **Scripts hỗ trợ:**
- `./deploy-now.sh` - One-click deploy
- `./check-windows-connection.sh` - Kiểm tra kết nối
- `./sync-to-windows.sh` - Sync code từ Mac sang Windows
- `./remote-deploy.sh` - Deploy menu từ xa

### **Cấu hình hiện tại:**
- 🖥️ **Windows 10:** `100.101.50.87` (Tailscale)
- 💻 **Mac Dev:** `/Users/nihdev/Web/thuvienanh`
- 🗄️ **PostgreSQL:** Windows at `D:\Ninh\pg\tva`

---

## Tính năng chính

- 📊 Dashboard tổng quan với thống kê
- 🔍 Tìm kiếm và lọc vải thông minh
- 📁 Quản lý bộ sưu tập
- 🎨 Giao diện hiện đại, responsive
- 👥 Phân quyền người dùng

## Công nghệ sử dụng

- **Frontend**: Next.js 14, React, TypeScript
- **Database**: PostgreSQL 15 + pgAdmin 4
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **Storage**: Synology NAS (SMB/FileStation) + Local fallback
- **Deployment**: Docker + Docker Compose

## Cài đặt và chạy

### Với Docker (Khuyến nghị)

```bash
# Build và chạy với docker-compose
docker-compose up --build

# Hoặc chạy background
docker-compose up -d --build
```

### Development local

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Mở [http://localhost:4000](http://localhost:4000) để xem ứng dụng.

## Cấu trúc dự án

```
├── app/                 # Next.js App Router
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── api/            # API routes
├── components/         # React components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Header.tsx      # Header component
│   ├── Sidebar.tsx     # Sidebar navigation
│   └── MainContent.tsx # Main content area
├── Dockerfile          # Docker configuration
├── docker-compose.yml  # Docker Compose setup
└── README.md          # Documentation
```

## Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build production
- `npm run start` - Chạy production server
- `npm run lint` - Kiểm tra code style

## Docker Commands

```bash
# Build image
docker build -t fabric-library .

# Run container
docker run -p 4000:4000 fabric-library

# Stop all containers
docker-compose down

# View logs
docker-compose logs -f
```

## Môi trường

- Node.js 18+
- Docker & Docker Compose (cho deployment)

## License

Private - Chỉ sử dụng nội bộ công ty.
