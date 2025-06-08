import { redis } from "./redis.js";

/**
 * Generic function to get cached data
 * @param {string} key - Redis key
 * @param {boolean} parseJson - Whether to parse the data as JSON
 * @returns {Promise<any>} - The cached data or null
 */
export const getCachedData = async (key, parseJson = true) => {
  try {
    const cachedData = await redis.get(key);
    
    if (!cachedData) return null;
    
    return parseJson ? JSON.parse(cachedData) : cachedData;
  } catch (error) {
    console.error(`Error retrieving cached data for key ${key}:`, error);
    return null;
  }
};

/**
 * Generic function to set cached data
 * @param {string} key - Redis key
 * @param {any} data - Data to cache
 * @param {number} expiry - Cache expiration in seconds
 * @param {boolean} stringify - Whether to stringify the data
 * @returns {Promise<boolean>} - Whether the operation was successful
 */
export const setCachedData = async (key, data, expiry, stringify = true) => {
  try {
    const dataToCache = stringify ? JSON.stringify(data) : data;
    await redis.set(key, dataToCache, "EX", expiry);
    return true;
  } catch (error) {
    console.error(`Error caching data for key ${key}:`, error);
    return false;
  }
};

/**
 * Delete a cached item
 * @param {string} key - Redis key
 * @returns {Promise<boolean>} - Whether the operation was successful
 */
export const deleteCachedData = async (key) => {
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error(`Error deleting cached data for key ${key}:`, error);
    return false;
  }
};

/**
 * Cache exists check with optional expiry extension
 * @param {string} key - Redis key
 * @param {number|null} extendExpiry - If provided, extend cache TTL by this many seconds
 * @returns {Promise<boolean>} - Whether the key exists
 */
export const cacheExists = async (key, extendExpiry = null) => {
  try {
    const exists = await redis.exists(key);
    
    // If key exists and we want to extend expiry
    if (exists && extendExpiry) {
      await redis.expire(key, extendExpiry);
    }
    
    return exists === 1;
  } catch (error) {
    console.error(`Error checking cache existence for key ${key}:`, error);
    return false;
  }
};