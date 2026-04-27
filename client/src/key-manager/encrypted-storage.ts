import { Wallet } from '../types';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

export class EncryptedFileStorage {
  private readonly ALGORITHM = 'aes-256-gcm';
  private readonly SALT_LENGTH = 16;
  private readonly IV_LENGTH = 12;
  private readonly TAG_LENGTH = 16;

  async exportWallet(wallet: Wallet, password: string): Promise<string> {
    // Derive key from password
    const salt = randomBytes(this.SALT_LENGTH);
    const key = await this.deriveKey(password, salt);
    const iv = randomBytes(this.IV_LENGTH);

    const cipher = createCipheriv(this.ALGORITHM, key, iv);
    const walletData = JSON.stringify({
      address: wallet.address,
      publicKey: wallet.publicKey,
      timestamp: Date.now(),
    });

    let encrypted = cipher.update(walletData, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();

    // Combine salt + iv + tag + encrypted data
    const combined = Buffer.concat([salt, iv, tag, Buffer.from(encrypted, 'hex')]);
    return combined.toString('base64');
  }

  async importWallet(encryptedBackup: string, password: string): Promise<Wallet> {
    const combined = Buffer.from(encryptedBackup, 'base64');
    let offset = 0;
    const salt = combined.slice(offset, offset + this.SALT_LENGTH);
    offset += this.SALT_LENGTH;
    const iv = combined.slice(offset, offset + this.IV_LENGTH);
    offset += this.IV_LENGTH;
    const tag = combined.slice(offset, offset + this.TAG_LENGTH);
    offset += this.TAG_LENGTH;
    const encrypted = combined.slice(offset);

    const key = await this.deriveKey(password, salt);
    const decipher = createDecipheriv(this.ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    const walletData = JSON.parse(decrypted);
    return {
      address: walletData.address,
      publicKey: walletData.publicKey,
    };
  }

  private async deriveKey(password: string, salt: Buffer): Promise<Buffer> {
    // Use scrypt or PBKDF2 for key derivation
    const { scrypt } = await import('crypto');
    return new Promise((resolve, reject) => {
      scrypt(password, salt, 32, (err, derivedKey) => {
        if (err) reject(err);
        else resolve(derivedKey);
      });
    });
  }
}