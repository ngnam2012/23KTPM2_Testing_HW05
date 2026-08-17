# HW05 - Performance Testing & AI Analysis

**Họ và tên:** NGUYỄN NHẬT NAM
**MSSV:** 23127092
**Lớp:** 23KTPM2
**Github Repository:** [Link đến Repo của bạn]
**Youtube Demo Video:** [Link đến Video của bạn]

## 1. Test Summary Report

Qua quá trình xây dựng kịch bản kiểm thử hiệu năng với JMeter (Data-driven qua CSV) và đánh giá bằng AI, dưới đây là tóm tắt kết quả:

- **Các kịch bản đã chạy:** Load Test (10 phút), Stress Test, Spike Test, Endurance Test (15 phút).
- **Các nhóm Endpoints được phủ (End-to-End Workflow):**
  - **Auth-heavy:** `POST /api/login`
  - **Read-heavy:** `GET /api/users/me`, `GET /api/products`, `GET /api/products/{id}`
  - **Transactional:** `POST /api/apply-coupon`, `POST /api/checkout`, `PUT /api/orders/{id}/cancel`
- **Endurance Threshold:**
  - **Max stable RPS:** Đạt mức **10.84 req/s** trong suốt 15 phút.
  - **Memory Ceiling / CPU:** Hệ thống duy trì ổn định không rò rỉ RAM (memory leak).
  - **Lỗi hệ thống (Bugs/Performance Issues):** Hệ thống có tỷ lệ lỗi (Error Rate) ổn định khoảng 71.74%, nguyên nhân không phải do hết tài nguyên mà do các giới hạn thiết kế / bugs nghiệp vụ.
- **Số lượng bugs phát hiện:** **4 Bugs chính** (Account Lockout bug, Coupon Negative Bug, SQLite Concurrent Lock, In-memory Cart Race Condition).

## 2. Assessment Table

| No. | Criteria | Grade | Self-Assessed Grade |
| --- | --- | --- | --- |
| **1** | Task 1 — Load testing | 20 | 20 |
| **2** | Task 1 — Stress testing | 20 | 20 |
| **3** | Task 1 — Spike testing | 20 | 20 |
| **4** | Task 2 — AI analysis + misinterpretation hunt | 10 | 10 |
| **5** | Task 3 — Continuous Performance Testing proposal | 10 | 10 |
| **6** | Agent Skills | 10 | 10 |
| | **Total** | **100** | **100** |

## 3. Nội dung Project

- `REPORT_HW05.md`: Báo cáo chính toàn diện (Main Report).
- `AI_Audit_Report.md`: Phụ lục thống kê việc sử dụng AI.
- `23127092_*.jmx`: 4 Kịch bản kiểm thử JMeter.
- `data/`: Dữ liệu cho Data-driven.
- `results/`: Kết quả Raw (`.jtl`) và thư mục báo cáo HTML.
- `import_data.js` & `register_users.js`: Scripts chuẩn bị dữ liệu / Accounts.
