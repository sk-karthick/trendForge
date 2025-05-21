import db from '../config/db';
import { QueryResult } from 'pg';

interface AngelOneCredentials {
  user_id: string;
  client_id: string;
  password?: string;
  totp?: string;
  mpin?: string;
  historic_api_key?: string;
  realtime_api_key?: string;
  refresh_token?: string;
  feed_token?: string;
  jwt_token?: string;
}

// Create or update user’s Angel One credentials
export const storeAngelOneTokens = async (credentials: AngelOneCredentials): Promise<void> => {
  const {
    user_id,
    client_id,
    password,
    totp,
    mpin,
    historic_api_key,
    realtime_api_key,
    refresh_token,
    feed_token,
    jwt_token
  } = credentials;

  const query = `
    INSERT INTO user_angel_credentials (
      user_id,
      client_id,
      password,
      totp,
      mpin,
      historic_api_key,
      realtime_api_key,
      refresh_token,
      feed_token,
      jwt_token,
      created_at,
      updated_at
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      client_id = EXCLUDED.client_id,
      password = EXCLUDED.password,
      totp = EXCLUDED.totp,
      mpin = EXCLUDED.mpin,
      historic_api_key = EXCLUDED.historic_api_key,
      realtime_api_key = EXCLUDED.realtime_api_key,
      refresh_token = EXCLUDED.refresh_token,
      feed_token = EXCLUDED.feed_token,
      jwt_token = EXCLUDED.jwt_token,
      updated_at = NOW();
  `;

  await db.query(query, [
    user_id,
    client_id,
    password,
    totp,
    mpin,
    historic_api_key,
    realtime_api_key,
    refresh_token,
    feed_token,
    jwt_token
  ]);
};
