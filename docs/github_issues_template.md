# GitHub Issues Templates

Dưới đây là 3 mẫu Issue chuẩn (được phân tích từ kết quả Performance Testing) để bạn copy/paste trực tiếp lên mục Issues của GitHub.

---

## Issue 1: [BUG] SQLite "Database is locked" during concurrent Login/Transactional requests

**Labels:** `bug`, `performance`, `critical`

### Description
During Load, Stress, and Spike testing with JMeter (22 concurrent threads), the application suffers a massive failure rate (~69.8%). The root cause is the SQLite database encountering write-lock contention (`SQLITE_BUSY: database is locked`). This happens because SQLite only supports a single writer at a time, and concurrent `POST /api/login` or Order APIs overwhelm the database lock queue.

### Steps to Reproduce
1. Start the Node.js backend server.
2. Run a JMeter Load Test with 22 Threads (Ramp-up: 22s) targeting `POST /api/login` and other transactional endpoints.
3. Observe the backend terminal or JMeter View Results Tree.

### Expected Behavior
The backend should queue the database transactions or use a connection pooling mechanism to handle concurrent requests without dropping them, returning 200 OK.

### Actual Behavior
The server immediately rejects concurrent requests with HTTP 500. JMeter reports ~69.8% overall error rate (with individual authenticated endpoints experiencing up to 95.1% failure due to cascade token failure). 
Log snippet: `Error: SQLITE_BUSY: database is locked`.

### Suggested Fix
1. Enable SQLite WAL (Write-Ahead Logging) mode to allow concurrent readers and one writer: `PRAGMA journal_mode=WAL;`.
2. Migrate to a robust RDBMS (e.g., PostgreSQL or MySQL) for production if high concurrency is expected.

---

## Issue 2: [BUG] "Account Lockout" logic triggers false positives under load and lacks auto-unlock

**Labels:** `bug`, `security`, `high-priority`

### Description
The system implements an Account Lockout mechanism (locks after >= 3 failed attempts). However, under load testing, the Node.js event loop gets blocked by heavy `bcrypt` hashing, causing requests to timeout or drop. The system incorrectly counts these dropped/timed-out requests as "failed logins", incrementing `login_attempts` by 2 instead of 1. As a result, valid accounts are permanently locked out after just 1 or 2 concurrent login attempts.

### Steps to Reproduce
1. Run a Load test with valid credentials in `credentials.csv`.
2. Send concurrent `POST /api/login` requests using 22 threads.
3. Attempt to log in manually via Postman or GUI with the same valid account.

### Expected Behavior
Valid credentials should not trigger a lockout, regardless of system load or timeouts. Lockouts should only trigger on explicit password mismatches.

### Actual Behavior
Accounts are locked out almost instantly during load tests. Subsequent API calls (Step 2, 3...) return `401/403` because the user cannot obtain a Token. There is no auto-unlock timer (e.g., unlock after 15 minutes), requiring manual DB intervention (`node reset_db.js`).

### Suggested Fix
1. Move `bcrypt` hashing to Node.js `worker_threads` to prevent blocking the Main Event Loop.
2. Fix the increment logic: only increment `login_attempts` on explicit HTTP 401 Wrong Password, not on HTTP 500 or timeout.
3. Implement a time-based unlock (e.g., `locked_until` timestamp) instead of a permanent boolean lock.

---

## Issue 3: [BUG] Apply Coupon API lacks validation, resulting in negative order totals

**Labels:** `bug`, `business-logic`

### Description
The `POST /api/apply-coupon` endpoint does not properly validate the discount amount against the cart's total value. During testing (Step 6), applying certain coupons (e.g., a fixed 500k discount on a 100k cart) can result in a negative total amount.

### Steps to Reproduce
1. Add a product worth 100,000 VND to the cart.
2. Send a `POST` request to `/api/apply-coupon` with a coupon code valued at 500,000 VND.
3. Check the returned cart total.

### Expected Behavior
The API should cap the discount at the cart's total value (making the minimum total 0), or reject the coupon if minimum purchase requirements are not met.

### Actual Behavior
The API blindly subtracts the coupon value, returning a negative total amount (e.g., `-400,000`), which allows users to theoretically checkout and "drain" money from the store.

### Suggested Fix
Add a validation check in the coupon controller:
```javascript
const finalTotal = Math.max(0, cartTotal - couponDiscount);
```
