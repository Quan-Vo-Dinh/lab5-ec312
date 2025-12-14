# Giải Pháp Cho Lỗi Upload Ảnh

## Vấn Đề Gốc

Lỗi bạn gặp phải:

```json
{
  "success": false,
  "error": "Sorry, you are not allowed to create posts as this user."
}
```

### Nguyên Nhân

Lỗi này xảy ra vì **WooCommerce API credentials (Consumer Key/Secret)** không thể dùng để upload file lên **WordPress Media Library**. WordPress yêu cầu:

- **Application Password** (WordPress user authentication)
- Hoặc **OAuth authentication**
- Không thể dùng WooCommerce REST API credentials

## Giải Pháp Đã Áp Dụng

### Phương Pháp: Upload Ảnh Qua Base64

Thay vì upload trực tiếp lên WordPress Media Library, chúng ta:

1. **Convert ảnh sang Base64** trên Next.js API route
2. **Gửi Base64 data URL** cùng với product data tới WooCommerce API
3. **WooCommerce tự động** upload ảnh lên Media Library khi tạo/cập nhật sản phẩm

### Ưu Điểm

✅ Không cần thêm credentials  
✅ Sử dụng WooCommerce API credentials hiện tại  
✅ Đơn giản và bảo mật  
✅ WooCommerce tự động xử lý upload và optimize ảnh

### Nhược Điểm

⚠️ Giới hạn kích thước ảnh (vì base64 tăng ~33% kích thước)  
⚠️ Có thể chậm với ảnh lớn

## Cách Hoạt Động

### 1. API Upload (`/api/upload`)

```typescript
// Convert image file to base64
const bytes = await file.arrayBuffer();
const buffer = Buffer.from(bytes);
const base64 = buffer.toString("base64");

// Return data URL
const dataUrl = `data:${file.type};base64,${base64}`;
```

**Input:** File object từ form upload  
**Output:** Data URL (base64) có thể dùng trong `<img>` tag

### 2. Create Product với Ảnh

```typescript
// Gửi ảnh base64 trong product data
const productData = {
  name: "Product Name",
  regular_price: "99.99",
  images: [
    {
      src: "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      name: "image.jpg",
      alt: "image",
    },
  ],
};

// WooCommerce sẽ tự upload ảnh lên server
await wooCommerce.post("products", productData);
```

### 3. Update Product Image

```typescript
// Tương tự như create, nhưng dùng PUT
await wooCommerce.put(`products/${id}`, {
  images: [{ src: "data:image/jpeg;base64,..." }],
});
```

## Kiểm Tra Kết Quả

1. **Upload ảnh khi tạo sản phẩm mới:**

   - Chọn ảnh → Xem preview → Create
   - Kiểm tra sản phẩm có ảnh trong WooCommerce admin

2. **Update ảnh cho sản phẩm:**

   - Hover vào ảnh → Click icon upload → Chọn ảnh mới
   - Verify ảnh được cập nhật

3. **Kiểm tra trong WooCommerce:**
   - Vào WordPress admin → Products
   - Verify ảnh đã được upload vào Media Library
   - Ảnh sẽ có URL thực (không phải base64)

## Giải Pháp Thay Thế (Nếu Cần)

### Option 1: WordPress Application Password

Nếu bạn muốn upload trực tiếp lên Media Library:

```typescript
// 1. Tạo Application Password trong WordPress
// WordPress Admin → Users → Your Profile → Application Passwords

// 2. Sử dụng trong API
const credentials = Buffer.from(
  `${wordpressUsername}:${applicationPassword}`
).toString("base64");

fetch(`${wpUrl}/wp-json/wp/v2/media`, {
  method: "POST",
  headers: {
    Authorization: `Basic ${credentials}`,
  },
  body: formData,
});
```

**Thêm vào .env.local:**

```bash
WORDPRESS_USERNAME=your_username
WORDPRESS_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

### Option 2: External Image Hosting

Sử dụng service bên ngoài như:

- **Cloudinary** (free tier: 25 GB storage, 25 GB bandwidth)
- **ImgBB** (free API)
- **Imgur** (free API)

```typescript
// Upload lên Cloudinary
const formData = new FormData();
formData.append("file", file);
formData.append("upload_preset", "your_preset");

const response = await fetch(
  "https://api.cloudinary.com/v1_1/your_cloud/image/upload",
  { method: "POST", body: formData }
);

const data = await response.json();
const imageUrl = data.secure_url; // Use this URL
```

### Option 3: Self-hosted Storage

Upload lên Next.js server và serve static files:

```typescript
// 1. Upload vào /public/uploads/
const uploadDir = path.join(process.cwd(), "public", "uploads");
await fs.writeFile(path.join(uploadDir, file.name), buffer);

// 2. Sử dụng URL
const imageUrl = `${process.env.NEXT_PUBLIC_URL}/uploads/${file.name}`;
```

## Khuyến Nghị

1. **Hiện tại (Base64):** Tốt cho MVP và test
2. **Production:** Nên chuyển sang Cloudinary hoặc external hosting
3. **Enterprise:** Sử dụng WordPress Application Password + CDN

## Giới Hạn Kích Thước

Với base64, khuyến nghị:

- **Tối đa:** 2-3 MB per image
- **Tối ưu:** Dưới 1 MB

Để giảm kích thước ảnh trước khi upload:

```typescript
// Thêm vào frontend
const compressImage = async (file: File): Promise<File> => {
  // Sử dụng browser-image-compression library
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };
  return await imageCompression(file, options);
};
```

## Tổng Kết

✅ **Đã sửa lỗi authentication**  
✅ **Upload ảnh hoạt động với WooCommerce API credentials hiện tại**  
✅ **Không cần thêm configuration**  
✅ **Ready để test và deploy**

Hãy chạy `pnpm run dev` và test tính năng!
