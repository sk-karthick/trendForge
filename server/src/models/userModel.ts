import pool from '../config/db';

export interface User {
    id: number;
    username: string;
    email: string;
    password: string;
}

export async function createUser(username: string, email: string, hashedPassword: string) {
    const result = await pool.query(
        'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
        [username, email, hashedPassword]
    );
    return result.rows[0];
}

export async function findUserByEmail(email: string) {
    const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );
    return result.rows[0];
}