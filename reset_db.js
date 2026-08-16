const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'eshop-sut/backend/database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run("UPDATE users SET login_attempts=0, locked_until=NULL;");
    db.run("DELETE FROM orders;");
});

db.close(() => {
    console.log("Database lockout reset and orders cleared successfully!");
});
