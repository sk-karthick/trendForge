// scripts/initDb.ts
import pool from '../db';

async function init() {
    try {
        await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        );
    `);
        console.log('users table created');
    } catch (err) {
        console.error('Error creating table:', err);
    } finally {
        pool.end();
    }
}

init();
