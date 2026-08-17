const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const rootDir = __dirname;
const productsPath = path.resolve(rootDir, 'data', 'products.csv');
const couponsPath = path.resolve(rootDir, 'data', 'coupons.csv');
const dbPath = path.resolve(rootDir, 'eshop-sut', 'backend', 'database.sqlite');

function parseCSV(filePath) {
    if (!fs.existsSync(filePath)) return [];
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

function importData() {
    const products = parseCSV(productsPath);
    const coupons = parseCSV(couponsPath);

    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('[ERROR]', err.message);
            process.exit(1);
        }
    });

    db.serialize(() => {
        // We do a simple approach: if not exists, insert it with dummy values
        const checkProd = db.prepare('SELECT id FROM products WHERE name = ?');
        const insertProd = db.prepare('INSERT INTO products (id, name, price, description, category_id) VALUES (?, ?, ?, ?, ?)');
        
        products.forEach(p => {
            checkProd.get([p.product_name], (err, row) => {
                if (!row) {
                    insertProd.run([p.product_id, p.product_name, p.product_price, 'Imported from CSV', 1]);
                    console.log(`Inserted product: ${p.product_name}`);
                }
            });
        });

        const checkCoupon = db.prepare('SELECT id FROM coupons WHERE code = ?');
        const insertCoupon = db.prepare('INSERT INTO coupons (code, type, discount_value) VALUES (?, ?, ?)');

        coupons.forEach(c => {
            checkCoupon.get([c.coupon_code], (err, row) => {
                if (!row) {
                    let type = c.expected_discount > 100 ? 'fixed' : 'percent';
                    insertCoupon.run([c.coupon_code, type, c.expected_discount]);
                    console.log(`Inserted coupon: ${c.coupon_code}`);
                }
            });
        });
    });

    db.close(() => {
        console.log('Database import step completed. All CSV data ensured in DB.');
    });
}

importData();
