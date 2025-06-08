import crypto from 'crypto';

export const generateVerificationToken = (length = 6) => {
    const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const bytes = crypto.randomBytes(length);
    let token = '';
    for (let i = 0; i < length; i++) {
        token += characters[bytes[i] % characters.length];
    }
    return token;
};