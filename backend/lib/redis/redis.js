import Redis from "ioredis"
import dotenv from "dotenv"

dotenv.config();

export const redis = new Redis(process.env.UPSTASH_REDIS_URL);

export const storeRefreshTokenRD = async (accountId, refreshToken) => {
  if (!accountId || !refreshToken) {throw new Error('Missing required parameters: accountId and refreshToken are required')}
  const key = `refresh_token:${accountId}`;
  // Store token with 7-day expiry (in seconds)
  const result = await redis.set(key, refreshToken, "EX", 7*24*60*60);
  if (result !== 'OK') {throw new Error(`Failed to store refresh token for account: ${accountId}`)}
  return true;
}