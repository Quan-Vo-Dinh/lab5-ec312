# Hướng Dẫn Sử Dụng Tính Năng Upload Ảnh

## Tổng Quan

Tính năng upload và cập nhật ảnh sản phẩm đã được triển khai thành công cho ứng dụng Mini Product Manager.

## Các Tính Năng Đã Triển Khai

### 1. Upload Ảnh Khi Tạo Sản Phẩm Mới

- Khi tạo sản phẩm mới, bạn có thể chọn ảnh từ máy tính
- Hệ thống sẽ hiển thị preview ảnh trước khi upload
- Ảnh sẽ được upload lên WooCommerce Media Library
- Sản phẩm mới sẽ được tạo với ảnh đã upload

**Cách sử dụng:**

1. Click nút "Add New Product"
2. Điền thông tin sản phẩm (Tên, Giá)
3. Click "Choose File" trong phần "Product Image"
4. Chọn ảnh từ máy tính
5. Xem preview ảnh
6. Click "Create Product"

### 2. Cập Nhật Ảnh Cho Sản Phẩm Hiện Có

- Hover chuột vào ảnh sản phẩm trong danh sách để hiển thị nút upload
- Click vào icon upload để chọn ảnh mới
- Ảnh sẽ được cập nhật ngay lập tức

**Cách sử dụng:**

1. Hover chuột vào ảnh sản phẩm trong bảng danh sách
2. Icon upload sẽ hiện ra với overlay màu đen mờ
3. Click vào icon upload
4. Chọn ảnh mới từ máy tính
5. Đợi ảnh được upload và cập nhật

## API Endpoints

### 1. Upload Image - `/api/upload`

**Method:** POST  
**Content-Type:** multipart/form-data

**Request Body:**

```
file: File (image file)
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 123,
    "src": "https://your-store.com/wp-content/uploads/2023/image.jpg",
    "alt": "Image alt text"
  }
}
```

### 2. Create Product with Image - `/api/products`

**Method:** POST  
**Content-Type:** application/json

**Request Body:**

```json
{
  "name": "Product Name",
  "regular_price": "99.99",
  "images": [
    {
      "src": "https://your-store.com/wp-content/uploads/2023/image.jpg",
      "alt": "Image alt text"
    }
  ]
}
```

### 3. Update Product Image - `/api/products/[id]`

**Method:** PUT  
**Content-Type:** application/json

**Request Body:**

```json
{
  "images": [
    {
      "src": "https://your-store.com/wp-content/uploads/2023/new-image.jpg",
      "alt": "New image alt text"
    }
  ]
}
```

## Files Đã Thay Đổi

### 1. `/app/api/upload/route.ts` (NEW)

- API endpoint mới để upload ảnh lên WooCommerce Media Library
- Sử dụng WordPress REST API `/wp-json/wp/v2/media`
- Xác thực bằng Basic Authentication

### 2. `/app/api/products/route.ts` (UPDATED)

- Cập nhật POST endpoint để hỗ trợ tham số `images`
- Cho phép tạo sản phẩm với ảnh

### 3. `/app/api/products/[id]/route.ts` (UPDATED)

- Cập nhật PUT endpoint để hỗ trợ cập nhật `images`
- Cho phép cập nhật cả giá và ảnh

### 4. `/app/page.tsx` (UPDATED)

- Thêm UI để chọn ảnh khi tạo sản phẩm
- Thêm preview ảnh trước khi upload
- Thêm nút upload ảnh (hiện khi hover) cho mỗi sản phẩm
- Thêm các state và functions để xử lý upload

## Lưu Ý Kỹ Thuật

### Authentication

- API upload sử dụng Basic Authentication với WooCommerce credentials
- Credentials được lấy từ environment variables:
  - `NEXT_PUBLIC_WC_URL`: URL của WooCommerce store
  - `WC_CONSUMER_KEY`: Consumer key
  - `WC_CONSUMER_SECRET`: Consumer secret

### File Upload

- Chấp nhận tất cả các định dạng ảnh (image/\*)
- File được convert thành Buffer trước khi upload
- Upload qua WordPress Media Library REST API
- Trả về ID và URL của ảnh đã upload

### UI/UX Features

- Preview ảnh trước khi tạo sản phẩm
- Loading indicator khi đang upload
- Hover effect để hiện nút upload trên ảnh sản phẩm
- Disable controls khi đang upload để tránh spam

## Cách Test

1. **Test Upload Ảnh Khi Tạo Sản Phẩm:**

   ```
   - Click "Add New Product"
   - Nhập tên: "Test Product with Image"
   - Nhập giá: "99.99"
   - Chọn một ảnh từ máy
   - Verify preview hiện đúng
   - Click "Create Product"
   - Verify sản phẩm được tạo với ảnh
   ```

2. **Test Cập Nhật Ảnh:**

   ```
   - Hover vào ảnh của một sản phẩm
   - Verify icon upload hiện ra
   - Click icon upload
   - Chọn ảnh mới
   - Verify ảnh được cập nhật
   - Refresh trang để verify persistence
   ```

3. **Test Error Handling:**
   ```
   - Thử upload file không phải ảnh
   - Thử upload ảnh quá lớn
   - Thử upload khi không có kết nối
   ```

## Yêu Cầu

- WooCommerce REST API enabled
- Valid API credentials trong .env.local
- WordPress Media Library accessible
- Internet connection để upload lên server

## Troubleshooting

### Lỗi "Failed to upload image"

- Kiểm tra WooCommerce credentials
- Verify WordPress Media Library có thể truy cập
- Kiểm tra quyền upload file trên server

### Ảnh không hiện sau khi upload

- Kiểm tra CORS settings
- Verify URL của ảnh có thể truy cập công khai
- Clear cache và refresh lại trang

### Upload chậm

- Giảm kích thước ảnh trước khi upload
- Kiểm tra tốc độ kết nối internet
- Optimize server upload limits

## Future Enhancements

1. **Multiple Images**: Hỗ trợ upload nhiều ảnh cho một sản phẩm
2. **Image Cropping**: Cho phép crop/resize ảnh trước khi upload
3. **Drag & Drop**: Thêm drag & drop interface
4. **Image Gallery**: Hiển thị gallery cho sản phẩm có nhiều ảnh
5. **Compression**: Tự động nén ảnh trước khi upload
6. **Progress Bar**: Hiển thị tiến trình upload cho file lớn
