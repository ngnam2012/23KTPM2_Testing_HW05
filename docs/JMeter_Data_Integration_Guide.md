# Hướng dẫn tích hợp Dữ liệu CSV và Biến số vào JMeter Test Plan

Dưới đây là hướng dẫn chi tiết để thiết lập cấu hình **CSV Data Set Config**, trích xuất dữ liệu (Extractors) và quản lý **HTTP Header** để các bước trong workflow 10-bước của bạn hoạt động mượt mà.

---

## 1. Cấu hình CSV Data Set Config

Bạn cần tạo 4 phần tử `CSV Data Set Config` (Click chuột phải vào Thread Group > Add > Config Element > CSV Data Set Config), tương ứng với 4 file dữ liệu.

### A. credentials.csv (Quản lý Account & Login)
File này chứa 22 dòng dữ liệu đăng nhập. Vì SUT có "login lockout bug" (sai password bị khóa tài khoản), ta phải đảm bảo tài khoản không bị dẫm chân lên nhau nếu số Thread <= 22, và có cơ chế tái sử dụng (recycle) an toàn nếu Thread > 22.

- **Filename**: `data/credentials.csv` (Đường dẫn tương đối từ vị trí lưu file .jmx)
- **Variable Names (comma-delimited)**: `email,password`
- **Delimiter**: `,` (dấu phẩy)
- **Allow quoted data**: `False`
- **Recycle on EOF**: `True` *(Chú ý: Vì Thread có thể > 22, khi đọc hết 22 dòng, nó cần quay lại dòng đầu tiên)*
- **Stop thread on EOF**: `False`
- **Sharing mode**: `All threads` *(Các thread sẽ lần lượt lấy các account khác nhau theo thứ tự để chia đều 22 account)*

### B. profiles.csv (Cập nhật Profile)
Dùng cho request `PUT /api/users/me` (Bước 3) và `POST /api/checkout` (Bước 8).
- **Filename**: `data/profiles.csv`
- **Variable Names (comma-delimited)**: `name,shipping_address,phone`
- **Recycle on EOF**: `True` *(Chỉ có 10 dòng, chắc chắn cần lặp lại dữ liệu)*
- **Stop thread on EOF**: `False`
- **Sharing mode**: `All threads` (hoặc `Current thread` đều được, vì dữ liệu này không nhạy cảm về lockout)

### C. products.csv (Tìm kiếm & Thêm vào giỏ hàng)
Dùng cho request `GET /api/products?search=...`, `GET /api/products/<id>` và `POST /api/cart`.
- **Filename**: `data/products.csv`
- **Variable Names**: `search_keyword,product_id,product_name,product_price`
- **Recycle on EOF**: `True`
- **Stop thread on EOF**: `False`
- **Sharing mode**: `All threads`

### D. coupons.csv (Áp dụng Coupon)
Dùng cho `POST /api/apply-coupon`.
- **Filename**: `data/coupons.csv`
- **Variable Names**: `coupon_code,expected_discount`
- **Recycle on EOF**: `True`
- **Stop thread on EOF**: `False`
- **Sharing mode**: `All threads`

---

## 2. Trích xuất Token (JSON Extractor)

Sau khi gọi `POST /api/login` (Bước 1), bạn cần lấy giá trị JWT token để dùng cho các request có yêu cầu Auth.

- **Vị trí**: Click chuột phải vào HTTP Request `POST /api/login` > Add > Post Processors > **JSON Extractor**.
- **Cấu hình**:
  - **Names of created variables**: `token`
  - **JSON Path expressions**: `$.token` (Giả sử response là `{"message": "...", "token": "<jwt>"}`)
  - **Match No. (0 for Random)**: `1`
  - **Default Values**: `NOT_FOUND` *(Để dễ debug nếu không lấy được token)*

---

## 3. Trích xuất OrderId (JSON Extractor)

Sau khi gọi `POST /api/checkout` (Bước 8), bạn cần lấy `orderId` để truyền vào `PUT /api/orders/<id>/cancel` (Bước 10).

- **Vị trí**: Click chuột phải vào HTTP Request `POST /api/checkout` > Add > Post Processors > **JSON Extractor**.
- **Cấu hình**:
  - **Names of created variables**: `extracted_orderId`
  - **JSON Path expressions**: `$.orderId`
  - **Match No. (0 for Random)**: `1`
  - **Default Values**: `NO_ORDER_ID`

Lúc này, ở Bước 10 (`PUT /api/orders/${extracted_orderId}/cancel`), bạn thay trực tiếp ID trên đường dẫn URL.

---

## 4. Quản lý Header (HTTP Header Manager)

Nhiều endpoint (Bước 2, 3, 7, 8, 9, 10) yêu cầu xác thực qua token. Bạn không cần set thủ công ở từng request.

- **Vị trí**: Click chuột phải vào **Thread Group** (nếu tất cả đều cần, hoặc tại HTTP Request cụ thể) > Add > Config Element > **HTTP Header Manager**.
- Thiết lập biến Authorization và Content-Type:
  - **Name**: `Authorization`  |  **Value**: `Bearer ${token}`
  - **Name**: `Content-Type`   |  **Value**: `application/json` *(Dùng chung cho tất cả các POST/PUT gửi body JSON)*

> [!TIP]
> **Lưu ý với API không cần Auth:** Bước 4, 5, 6 không yêu cầu Auth. Nếu bạn đặt HTTP Header Manager ở tầng Thread Group, header Authorization cũng sẽ bị đẩy vào các request này. Dù vậy, Node.js SUT thông thường sẽ bỏ qua (ignore) các header này nếu endpoint không yêu cầu auth, nên việc để chung vẫn an toàn. Nếu muốn cẩn thận, hãy tạo 1 HTTP Header Manager riêng và chỉ kéo-thả nó vào các HTTP Request cần Auth.

---

## 5. Cảnh báo quan trọng: Số Thread lớn hơn Số Account
Nếu bạn cấu hình **Thread > 22**, hệ thống bắt buộc phải quay vòng lại (Recycle) tài khoản. Dù `Recycle on EOF = True` và `Sharing mode = All threads` giúp phân phối tài khoản đều đặn, nhưng sẽ có thời điểm 2 Thread chạy song song với *cùng một tài khoản đăng nhập*.
- **Rủi ro**: Nếu SUT thiết kế chức năng Cart dạng in-memory gắn chặt với `user_id` (ví dụ: `carts[user_id] = [...]`), hai thread thao tác song song vào một giỏ hàng có thể dẫn đến việc tính sai `total_amount` khi Checkout (Bước 8).
- **Khắc phục**: Trừ phi bạn đang chủ đích test Stress testing để tìm race condition, tốt nhất nên giữ giới hạn **Thread Count = 22** cho kịch bản Load test bình thường trên hệ thống này.
