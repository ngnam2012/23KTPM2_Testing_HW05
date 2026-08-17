**Khoa Công nghệ Thông tin (FIT) – Trường Đại học Khoa học Tự nhiên (HCMUS)**

**CS423 / CSC13003 – Kiểm chứng Phần mềm (AI-augmented · 2026)**

**CHÍNH SÁCH AI · BIỂU MẪU — 2026 v1.0**

# **AI Audit Report — Mẫu 5 mục cho mỗi Artifact**

*Phụ lục bắt buộc đính kèm cho mọi bài tập có dùng AI (HW#01–HW#06, Seminar).*

*Tài liệu được biên soạn lại từ Med Kharbach, PhD (2026) — Mẫu Chính sách Sử dụng AI cho Giáo dục Đại học. Giấy phép CC BY-NC-SA 4.0. Phiên bản này được FIT@HCMUS điều chỉnh cho môn CS423 / CSC15003 Kiểm chứng Phần mềm.*

## **1. Thông tin Sinh viên**

| Mục | Giá trị |
| :---- | :---- |
| **Họ tên sinh viên (in hoa):** | NGUYỄN NHẬT NAM |
| **MSSV:** | 23127092 |
| **Lớp / Khoá:** | 23KTPM2 |
| **Mã bài tập (ví dụ HW#00, HW#02):** | HW05-AI |
| **Ngày làm bài:** | 17/08/2026 |
| **Công cụ AI đã dùng:** | Gemini 3.1 Pro (High) |
| **Công cụ AI đã dùng:** | [x] Có  [ ] Không |

## **2. Hướng dẫn (đọc trước khi điền)**

* Thêm 1 hàng cho mỗi artifact AI sinh (test case, script, checklist, OpenAPI spec, JMeter plan…).  
* Dán nguyên văn prompt — KHÔNG paraphrase.  
* Dán nguyên văn output AI (hoặc kèm screenshot có chú thích trong báo cáo).  
* Gắn nhãn: VALID / INVALID / INCOMPLETE.  
* Lý do phải dẫn chiếu slide, mục ISTQB, hoặc RFC kỹ thuật.  
* Hiển thị bản sửa với phần thay đổi được tô sáng.

## **3. Bảng Audit — 1 hàng / artifact**

| (1) Prompt + Công cụ | (2) Output AI | (3) Verdict | (4) Lý do (ISTQB/HW05) | (5) Bản SV sửa |
| :---- | :---- | :---- | :---- | :---- |
| **Tool**: Gemini 3.1 Pro<br>**Thời gian**: 21:08 15/08/2026<br>**Prompt**: "Tôi đang làm bài tập Performance Testing cho ứng dụng EShop.<br><br>**SUT:**<br>- Backend: Node.js + Express 4.x, single-threaded event loop<br>- Database: SQLite3 (file-based, single-writer lock)<br>- localhost:3000<br>- Cart lưu in-memory (JS object), không persist vào DB<br><br>**Hardware:**<br>- CPU: Intel i7-1260P (12 cores / 16 threads, 4.70 GHz boost)<br>- RAM: 32 GB LPDDR5<br>- Disk: NVMe SSD<br>- OS: Windows 11 Pro<br><br>**Workflow 10 bước (3 endpoint groups):**<br><br>1. POST /api/login — Auth-heavy<br>   Body: {\"email\":\"...\",\"password\":\"...\"}<br>   Response: {\"message\":\"Login successful\",\"token\":\"<jwt>\",\"user\":{...}}<br><br>2. GET /api/users/me — Read (cần Authorization: Bearer <token>)<br>   Response: {id, name, email, role, ...}<br><br>3. PUT /api/users/me — Transactional (cần auth)<br>   Body: {\"name\":\"...\",\"shipping_address\":\"...\",\"phone\":\"...\"}<br>   Response: {\"message\":\"Profile updated\"}<br><br>4. GET /api/products?search=<keyword> — Read-heavy (không cần auth)<br>   Response: [product objects]<br><br>5. GET /api/products/<id> — Read-heavy (không cần auth)<br>   Response: {id, name, price, ...}<br><br>6. POST /api/apply-coupon — Transactional (KHÔNG cần auth)<br>   Body: {\"code\":\"SAVE10\",\"total_amount\":500000,\"user_id\":1}<br>   Response: {\"success\":true,\"coupon_id\":...,\"discount_amount\":...,\"final_amount\":...}<br><br>7. POST /api/cart — Transactional (cần auth)<br>   Body: {\"id\":1,\"name\":\"Sản phẩm A\",\"price\":100000,\"quantity\":2}<br>   Response: {\"message\":\"Added to cart\"}<br><br>8. POST /api/checkout — Transactional (cần auth)<br>   Body: {\"total_amount\":200000,\"shipping_address\":\"123 Le Loi, TP.HCM\"}<br>   Response: {\"message\":\"Checkout successful\",\"orderId\":<number>}<br><br>9. GET /api/orders/my-orders — Read (cần auth)<br>   Response: [order objects]<br><br>10. PUT /api/orders/<id>/cancel — Transactional (cần auth)<br>    Response: {\"message\":\"Order canceled successfully\"}<br><br>**Data:** 22 accounts, 5 products (id 1-5), 3 valid coupons (SAVE10, BIGBUY, VIP100)<br><br>**Lưu ý:**<br>- Login lockout bug: sai password → login_attempts += 2, lock khi >= 3 → 1 lần sai = lock<br>- SQLite single-writer: bottleneck cho transactional endpoints<br><br>Thiết kế **Load Test** bằng JMeter. Đề xuất + justify:<br>1. Thread count<br>2. Ramp-up period<br>3. Loop count hoặc Duration<br>4. Think-time giữa các bước" | `Load_Test_Plan_Proposal.md`: Đề xuất Thread Count (20-22), Ramp-up (10-22s), Loop/Duration (5-10m), không xử lý dữ liệu động. | INCOMPLETE | ISTQB Performance Testing (Syllabus 4.2.3): Load profile phải phản ánh đúng workload model. Cấu hình AI thiếu Think-time và Data-Driven (CSV) để xử lý cơ chế Lockout. | Bổ sung `Uniform Random Timer` vào kịch bản. Chuyển sang đọc account từ file CSV (Data-Driven) và dùng script `reset_db.js` giữa các lần chạy. |
| **Tool**: Gemini 3.1 Pro<br>**Thời gian**: 21:11 15/08/2026<br>**Prompt**: "Assertions cho mỗi bước workflow:<br>1. Response Assertion (HTTP status code)<br>2. JSON Assertion (kiểm tra field cần thiết)<br>3. Duration Assertion (threshold cho localhost + SQLite)<br><br>Lưu ý:<br>- Login: cần kiểm tra có \"token\"<br>- Product detail id=2,4: price trả dạng string (SUT bug)<br>- Apply-coupon: KHÔNG dùng Authorization<br>- Đề xuất Duration threshold hợp lý cho SUT local" | `JMeter_Assertions_Guide.md`: Đề xuất Threshold cho các loại request (Read ~300ms, Auth ~1500ms, Transactional ~2000ms), JSON Path Assertion... | VALID | Phân tích đúng đặc tính Single-writer lock của SQLite và event-loop của Node.js, cấu hình Assertion phù hợp với SLA. | Giữ nguyên và áp dụng vào JMeter. |
| **Tool**: Gemini 3.1 Pro<br>**Thời gian**: 21:16 15/08/2026<br>**Prompt**: "Thiết kế **Stress Test** cùng workflow 10 bước.<br><br>Mục tiêu: tăng dần load vượt capacity → tìm breaking point.<br><br>Context:<br>- Load test baseline: [ĐIỀN SAU KHI CHẠY LOAD TEST]<br>- Node.js single-thread + SQLite single-writer<br>- Tất cả accounts dùng đúng password → không lockout bình thường<br><br>Đề xuất:<br>1. Thread count pattern (start → step → max)<br>2. Implement stepping: plugin hay nhiều Thread Group?<br>3. Duration mỗi step<br>4. Think-time<br>5. Tiêu chí breaking point: error rate ?, response time ?<br>6. Xử lý nếu lockout xảy ra (timeout → server tưởng sai pass)" | `Stress_Test_Plan_Proposal.md`: Đề xuất dùng bzm - Concurrency Thread Group, bypass Login. | INCOMPLETE | ISTQB PT Syllabus (Section 4.2.4): Stress Test cần xác định breaking point. AI sinh ra cấu hình tĩnh (cố định load) khiến việc tìm điểm gãy gặp khó khăn. | Đã áp dụng `Stepping Thread Group` (Ramp-up Steps) để tăng tải theo từng bậc rõ ràng, giúp nhận ra điểm gãy dễ hơn. |
| **Tool**: Gemini 3.1 Pro<br>**Thời gian**: 21:30 15/08/2026<br>**Prompt**: "Thiết kế **Spike Test** — đột ngột tăng load rồi giảm.<br><br>Đề xuất:<br>1. Baseline threads (từ Load test)<br>2. Spike threads (gấp bao nhiêu?)<br>3. Spike duration<br>4. Recovery period<br>5. Số spike<br>6. JMeter implementation<br><br>Lưu ý: cart in-memory → memory pressure, SQLite lock contention tăng khi spike." | `Spike_Test_Plan_Proposal.md`: Baseline 22 threads, Spike 100 threads, cấu hình bzm - Ultimate Thread Group. | VALID | ISTQB PT Syllabus: Đánh giá khả năng hồi phục (Recovery). Chiến lược của AI đánh giá đúng giới hạn của Node.js Garbage Collector. | Giữ nguyên và áp dụng. |
| **Tool**: Gemini 3.1 Pro<br>**Thời gian**: 21:41 15/08/2026<br>**Prompt**: "3 loại listener/report KHÁC NHAU cho 3 test plan (không lặp).<br><br>Đề xuất listener cho:<br>1. Load Test → ?<br>2. Stress Test → ?<br>3. Spike Test → ?<br><br>Giải thích tại sao phù hợp. Cho JMeter CLI command chạy test + xuất .jtl + HTML report." | `JMeter_Listeners_and_CLI_Guide.md`: Aggregate Report cho Load, Response Times Over Time cho Stress, TPS cho Spike. Kèm lệnh CLI. | VALID | Phân bổ Listener đúng mục đích giám sát của từng loại test (Baseline vs Breaking Point vs Recovery). | Giữ nguyên và chạy CLI. |
| **Tool**: Gemini 3.1 Pro<br>**Thời gian**: 22:50 15/08/2026<br>**Prompt**: "Đóng vai một chuyên gia DevOps, hãy giúp tôi viết Proposal cho mô hình Continuous Performance Testing tích hợp CI/CD cho dự án EShop (Node.js + SQLite). Yêu cầu: Đề xuất quy trình watch SUT commits, điều kiện để trigger test, cách cảnh báo khi p95 regression. Vẽ sơ đồ luồng (Flowchart) bằng cú pháp Mermaid. Thảo luận các trade-offs (ví dụ: cost, false alarms)." | `cpt_eshop_proposal.md`: Quy trình Watch commits, Alert P95 regression, Sơ đồ luồng Mermaid, thảo luận Trade-offs. | VALID | Đề xuất đầy đủ, hợp logic CI/CD và nêu rõ các giới hạn về false alarms của SQLite trên CI, bám sát HW05 Spec. | Giữ nguyên. |

## **4. Tổng kết Độ chính xác AI**

| Chỉ số | Số lượng | Tỉ lệ |
| :---- | :---- | :---- |
| **Tổng artifact AI sinh đã audit** | 6 | 100% |
| **VALID (đúng, dùng nguyên)** | 4 | 66.7% |
| **INVALID (sai; loại bỏ)** | 0 | 0% |
| **INCOMPLETE (chấp nhận sau khi sửa)** | 2 | 33.3% |
