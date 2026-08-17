/**
 * register_users.js
 * Script to register/seed test users from data/credentials.csv (and data/profiles.csv)
 * into the SQLite database before running JMeter / k6 Performance Tests.
 *
 * Usage:
 *   node register_users.js          (Direct DB insertion & lockout reset - Recommended)
 *   node register_users.js --api    (Register via HTTP POST http://localhost:3000/api/register)
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const http = require('http');

// Locate directories
const rootDir = __dirname;
const credentialsPath = path.resolve(rootDir, 'data', 'credentials.csv');
const profilesPath = path.resolve(rootDir, 'data', 'profiles.csv');
const dbPath = path.resolve(rootDir, 'eshop-sut', 'backend', 'database.sqlite');

function parseCSV(filePath) {
    if (!fs.existsSync(filePath)) {
        console.warn(`[WARN] File not found: ${filePath}`);
        return [];
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length <= 1) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row = {};
        headers.forEach((h, idx) => {
            row[h] = values[idx] || '';
        });
        data.push(row);
    }
    return data;
}

async function registerViaDB() {
    console.log('====================================================');
    console.log('  Registering Test Users directly into SQLite DB');
    console.log('====================================================');
    console.log(`Database Path: ${dbPath}`);

    const credentials = parseCSV(credentialsPath);
    const profiles = parseCSV(profilesPath);

    if (credentials.length === 0) {
        console.error('[ERROR] No credentials found in data/credentials.csv');
        return;
    }

    console.log(`Loaded ${credentials.length} accounts from data/credentials.csv`);
    console.log(`Loaded ${profiles.length} profiles from data/profiles.csv`);

    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('[ERROR] Failed to connect to SQLite database:', err.message);
            process.exit(1);
        }
    });

    db.serialize(() => {
        // Reset any existing lockouts
        db.run('UPDATE users SET login_attempts = 0, locked_until = NULL');

        const checkStmt = db.prepare('SELECT id FROM users WHERE email = ?');
        const insertStmt = db.prepare(
            'INSERT INTO users (name, email, password, role, login_attempts, locked_until, shipping_address, phone) VALUES (?, ?, ?, ?, 0, NULL, ?, ?)'
        );
        const updateStmt = db.prepare(
            'UPDATE users SET name = ?, password = ?, role = ?, login_attempts = 0, locked_until = NULL, shipping_address = ?, phone = ? WHERE email = ?'
        );

        let processed = 0;
        let inserted = 0;
        let updated = 0;

        credentials.forEach((cred, index) => {
            const profile = profiles[index % profiles.length] || {};
            const name = profile.name || (cred.email === 'admin@eshop.com' ? 'Admin User' : `Test User ${index + 1}`);
            const address = profile.shipping_address || '123 Nguyen Trai, Q5, TP.HCM';
            const phone = profile.phone || '0901234567';
            const role = cred.email === 'admin@eshop.com' ? 'admin' : 'user';

            checkStmt.get([cred.email], (err, row) => {
                if (err) {
                    console.error(`[ERROR] Checking ${cred.email}:`, err.message);
                } else if (row) {
                    updateStmt.run([name, cred.password, role, address, phone, cred.email], (uErr) => {
                        if (uErr) console.error(`[ERROR] Updating ${cred.email}:`, uErr.message);
                        else updated++;
                    });
                } else {
                    insertStmt.run([name, cred.email, cred.password, role, address, phone], (iErr) => {
                        if (iErr) console.error(`[ERROR] Inserting ${cred.email}:`, iErr.message);
                        else inserted++;
                    });
                }

                processed++;
                if (processed === credentials.length) {
                    checkStmt.finalize();
                    insertStmt.finalize();
                    updateStmt.finalize();

                    db.all('SELECT id, name, email, role, login_attempts, locked_until FROM users', (allErr, rows) => {
                        console.log('----------------------------------------------------');
                        console.log(`[SUCCESS] Completed DB Sync:`);
                        console.log(`  - Newly Inserted: ${inserted}`);
                        console.log(`  - Updated/Reset:  ${updated}`);
                        console.log(`  - Total Users in DB: ${rows ? rows.length : 0}`);
                        console.log('----------------------------------------------------');
                        if (rows) {
                            console.log('Sample Users:');
                            rows.slice(0, 5).forEach(u => console.log(`  [ID: ${u.id}] ${u.email} | Name: ${u.name} | Role: ${u.role} | Locked: ${u.locked_until || 'No'}`));
                            if (rows.length > 5) {
                                console.log(`  ... and ${rows.length - 5} more users.`);
                            }
                        }
                        db.close();
                    });
                }
            });
        });
    });
}

function registerUserViaHttp(user) {
    return new Promise((resolve) => {
        const data = JSON.stringify(user);
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: '/api/register',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data),
            },
            timeout: 3000,
        }, (res) => {
            let body = '';
            res.on('data', chunk => { body += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200 || res.statusCode === 201) {
                    resolve({ success: true, email: user.email, message: 'Registered successfully' });
                } else {
                    resolve({ success: false, email: user.email, status: res.statusCode, body });
                }
            });
        });

        req.on('error', (err) => {
            resolve({ success: false, email: user.email, error: err.message });
        });

        req.write(data);
        req.end();
    });
}

async function registerViaAPI() {
    console.log('====================================================');
    console.log('  Registering Test Users via HTTP API (POST /api/register)');
    console.log('====================================================');

    const credentials = parseCSV(credentialsPath);
    const profiles = parseCSV(profilesPath);

    if (credentials.length === 0) {
        console.error('[ERROR] No credentials found in data/credentials.csv');
        return;
    }

    console.log(`Found ${credentials.length} accounts to register at http://localhost:3000/api/register...\n`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < credentials.length; i++) {
        const cred = credentials[i];
        const profile = profiles[i % profiles.length] || {};
        const name = profile.name || (cred.email === 'admin@eshop.com' ? 'Admin User' : `Test User ${i + 1}`);

        const res = await registerUserViaHttp({
            name: name,
            email: cred.email,
            password: cred.password
        });

        if (res.success) {
            console.log(`[OK] Registered: ${cred.email} (Name: ${name})`);
            successCount++;
        } else {
            console.log(`[FAILED] ${cred.email}: ${res.error || res.body || res.status}`);
            failCount++;
        }
    }

    console.log('\n----------------------------------------------------');
    console.log(`[SUMMARY] Finished API registration: ${successCount} Succeeded, ${failCount} Failed.`);
    console.log('----------------------------------------------------');
}

// Execution switch based on CLI argument
if (process.argv.includes('--api')) {
    registerViaAPI();
} else {
    registerViaDB();
}
