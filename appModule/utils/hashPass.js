import bcrypt from "bcryptjs"

// export const hashPassword = async (password) => {
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);
//     return hashedPassword;
// } 

/**
 * Hash a password using bcrypt with configurable salt rounds
 * @param {string} password - The plain text password to hash
 * @param {number} saltRounds - The number of salt rounds (default: 10)
 * @returns {Promise<string>} - The hashed password
 * @throws {Error} - If password is invalid or hashing fails
 */

export const hashPassword = async (password, saltRounds = 10) => {
    try {
        // input validation
        if (!password || typeof password !== "string") {throw new Error('Password must be a non-empty string')};

        if (password.length < 1) {throw new Error('Password cannot be empty')};

        if (typeof saltRounds !== "number" || saltRounds < 4 || saltRounds > 15) {throw new Error('Salt rounds must be a number between 4 and 15')};

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        throw new Error(`Password hashing failed: ${error.message}`);
    }
}

/**
 * Compare a plain text password with a hashed password
 * @param {string} password - The plain text password
 * @param {string} hashedPassword - The hashed password to compare against
 * @returns {Promise<boolean>} - True if passwords match, false otherwise
 * @throws {Error} - If inputs are invalid or comparison fails
*/

export const comparePassword = async (password, hashedPassword) => {
    try {
        if (!password || typeof password !== "string") {throw new Error('Password must be a non-empty string')};
        if (!hashedPassword || typeof hashedPassword !== 'string') {throw new Error('Hashed password must be a non-empty string')};

        // Compare password
        const isMatch = await bcrypt.compare(password, hashedPassword);
        return isMatch;
    } catch (error) {
        throw new Error(`Password comparison failed: ${error.message}`);
    }
}
