import crypto from 'crypto';

const passphrase = 'Funrun21@';
const ivBase64 = 'c9QCX0vq6XHVlnOIsft8Z2G6TXIXKZaEgYa/ft/mqh8=';
const iv = Buffer.from(ivBase64, 'base64');

// Derive 256-bit key from passphrase using SHA-256
const key = crypto.createHash('sha256').update(passphrase).digest();

export function encryptState(data) {
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

export function decryptState(encryptedData) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
}
