# Giải Pháp Cuối Cùng - Upload Ảnh Qua Next.js

## Vấn Đề Đã Giải Quyết

### Lỗi 1: Authentication Error
```json
{
  "error": "Sorry, you are not allowed to create posts as this user."
}
```
**Nguyên nhân:** WooCommerce credentials không thể dùng để upload lên WordPress Media Library.

### Lỗi 2: Base64 URL Error  
```json
{
  "error": "Error getting remote image . Error: No URL Provided."
}
```
**Nguyên nhân:** WooCommerce API không chấp nhận base64 data URLs trong trường `src`.

### Lỗi 3: Wrong URL Error
```json
{
  "error": "Error getting remote image http://localhost:8000/uploads/..."
}
```
**Nguyên nhân:** Code sử dụng WooCommerce URL thay vì Next.js URL.

## Giải Pháp Hoàn Chỉnh

### Kiến Trúc

```
┌─────────────┐      ┌──────────────┐      ┌──────────────┐
│   Browser   │ ───> │   Next.js    │ ───> │ WooCommerce  │
│             │      │  (port 3000) │      │ (port 8000)  │
└─────────────┘      └──────────────┘      └──────────────┘
                            │
                            │ Save image
                            ▼
                     /public/uploads/
```

### Luồng Hoạt Động

1. **User chọn ảnh** → Browser
2. **Upload ảnh** → Next.js API (`/api/upload`)
3. **Lưu ảnh** → `/public/uploads/` folder
4. **Trả về URL** → `http://localhost:3000/uploads/filename.jpg`
5. **Tạo/Update product** → Gửi URL này tới WooCommerce
6. **WooCommerce download** → Lấy ảnh từ Next.js URL
7. **WooCommerce lưu** → Vào WordPress Media Library

### Ưu Điểm

✅ **Không cần WordPress credentials**  
✅ **Sử dụng WooCommerce API credentials hiện tại**  
✅ **WooCommerce tự download và optimize ảnh**  
✅ **Ảnh được lưu vĩnh viễn trong WordPress**  
✅ **Không giới hạn kích thước như base64**  

## Cấu Hình

### 1. Environment Variables

File `.env.local`:
```bash
# WooCommerce Store URL (WordPress URL)
NEXT_PUBLIC_WC_URL=http://localhost:8000

# Next.js App URL (QUAN TRỌNG - để tạo URL cho ảnh upload)
NEXT_PUBLIC_URL=http://localhost:3000

# WooCommerce REST API Credentials
WC_CONSUMER_KEY=ck_your_key
WC_CONSUMER_SECRET=cs_your_secret
```

### 2. Folder Structure

```
project/
├── public/
│   └── uploads/           # Ảnh được lưu tạm ở đây
│       ├── .gitkeep      # Giữ folder trong git
│       └── timestamp-filename.jpg
├── app/
│   ├── api/
│   │   ├── upload/
│   │   │   └── route.ts  # API upload ảnh
│   │   └── products/
│   └── page.tsx          # UI
└── .env.local
```

### 3. .gitignore

```
# uploaded images
/public/uploads/*
!/public/uploads/.gitkeep
```

## Cách Sử Dụng

### Tạo Sản Phẩm Với Ảnh

1. Click "Add New Product"
2. Nhập tên và giá
3. Click "Choose File" và chọn ảnh
4. Preview ảnh sẽ hiện
5. Click "Create Product"

**Quy trình:**
- Ảnh upload lên `/api/upload`
- Lưu vào `/public/uploads/`
- Nhận URL: `http://localhost:3000/uploads/xxx.jpg`
- Gửi URL tới WooCommerce API
- WooCommerce download từ Next.js
- Lưu vào WordPress Media Library

### Cập Nhật Ảnh Sản Phẩm

1. Hover chuột vào ảnh sản phẩm
2. Icon upload hiện ra
3. Click và chọn ảnh mới
4. Ảnh tự động cập nhật

## Testing

### 1. Test Upload API

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@/path/to/image.jpg"
```

Response:
```json
{
  "success": true,
  "data": {
    "src": "http://localhost:3000/uploads/1765726441464-image.jpg",
    "name": "image.jpg",
    "alt": "image"
  }
}
```

### 2. Verify Image Accessible

```bash
curl http://localhost:3000/uploads/1765726441464-image.jpg
```

Hoặc mở trong browser.

### 3. Test Create Product

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "regular_price": "99.99",
    "images": [{
      "src": "http://localhost:3000/uploads/1765726441464-image.jpg"
    }]
  }'
```

### 4. Verify trong WooCommerce

- Vào WordPress Admin → Products
- Kiểm tra product vừa tạo có ảnh
- Vào Media Library → Ảnh đã được import

## Lưu Ý Quan Trọng

### 1. Next.js Phải Chạy

⚠️ **Next.js app phải chạy** khi WooCommerce download ảnh!

Nếu Next.js không chạy:
```json
{
  "error": "Failed to connect to localhost port 3000"
}
```

### 2. Port Configuration

- **Next.js:** Port 3000 (default)
- **WordPress/WooCommerce:** Port 8000 (theo config của bạn)

Đảm bảo `NEXT_PUBLIC_URL` đúng port Next.js!

### 3. Network Access

Nếu WordPress chạy trong Docker:
- Không dùng `localhost:3000`
- Dùng `host.docker.internal:3000` (Mac/Windows)
- Hoặc IP máy host

```bash
# Trong .env.local (nếu WordPress trong Docker)
NEXT_PUBLIC_URL=http://host.docker.internal:3000
```

### 4. Production Deployment

Trong production:
```bash
# .env.production
NEXT_PUBLIC_URL=https://your-domain.com
NEXT_PUBLIC_WC_URL=https://your-wordpress.com
```

## Troubleshooting

### Lỗi "Could not connect to server"

**Nguyên nhân:** WooCommerce không thể connect tới Next.js URL

**Giải pháp:**
1. Kiểm tra Next.js đang chạy: `pnpm run dev`
2. Kiểm tra `NEXT_PUBLIC_URL` đúng
3. Kiểm tra port 3000 không bị block
4. Nếu dùng Docker, dùng `host.docker.internal`

### Ảnh Không Hiển Thị

**Kiểm tra:**
1. File có trong `/public/uploads/` không?
2. URL trả về đúng không?
3. Có thể access trực tiếp URL không?

### Permission Error

```bash
# Đảm bảo folder có quyền ghi
chmod 755 public/uploads
```

## Tối Ưu Hóa

### 1. Giới Hạn Kích Thước File

```typescript
// Thêm vào /api/upload/route.ts
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

if (buffer.length > MAX_FILE_SIZE) {
  return NextResponse.json({
    success: false,
    error: "File too large. Maximum 5MB"
  }, { status: 400 });
}
```

### 2. Validate File Type

```typescript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

if (!ALLOWED_TYPES.includes(file.type)) {
  return NextResponse.json({
    success: false,
    error: "Invalid file type"
  }, { status: 400 });
}
```

### 3. Cleanup Old Files

Tạo cron job để xóa ảnh cũ (sau khi WooCommerce đã download):

```typescript
// app/api/cleanup/route.ts
import { readdir, unlink, stat } from 'fs/promises';
import path from 'path';

export async function POST() {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  const files = await readdir(uploadDir);
  
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;
  
  for (const file of files) {
    if (file === '.gitkeep') continue;
    
    const filepath = path.join(uploadDir, file);
    const stats = await stat(filepath);
    
    // Xóa file cũ hơn 1 giờ
    if (now - stats.mtimeMs > ONE_HOUR) {
      await unlink(filepath);
    }
  }
  
  return NextResponse.json({ success: true });
}
```

## Kết Luận

✅ Giải pháp hoạt động ổn định  
✅ Không cần authentication phức tạp  
✅ Tận dụng WooCommerce API để xử lý ảnh  
✅ Dễ deploy và maintain  

**Lưu ý:** Next.js app phải chạy khi tạo/update sản phẩm để WooCommerce có thể download ảnh!
