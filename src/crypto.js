import crypto from 'crypto';

const ivBase64 = 'c9QCX0vq6XHVlnOIsft8Z2G6TXIXKZaEgYa/ft/mqh8=';

export const encryptState = (input) => {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ivBase64, 'base64'), iv)
    let encrypted = cipher.update(input, 'utf8', 'base64')
    encrypted += cipher.final('base64')
    return {
        ciphertext: encrypted,
        iv: iv.toString('base64'),
        authTag: cipher.getAuthTag().toString('base64')
    }
}

export const decryptState = (data) => {
    const { ciphertext, iv, authTag } = JSON.parse(Buffer.from(data, 'base64').toString('utf8'));
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ivBase64, 'base64'), Buffer.from(iv, 'base64'))
    decipher.setAuthTag(Buffer.from(authTag, 'base64'))
    let decrypted = decipher.update(ciphertext, 'base64', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
}
