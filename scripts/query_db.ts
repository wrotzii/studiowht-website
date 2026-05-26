import db from 'better-sqlite3';
const database = db('qr-database.sqlite');
console.log(database.prepare("SELECT * FROM pages").all());
