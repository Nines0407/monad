import { SessionKey, PermissionSet } from '../types';
import { getPublicKey } from '@noble/ed25519';
import { randomBytes } from 'crypto';
import { Buffer } from 'buffer';

export class SessionKeyGenerator {
  private sessionKeys: Map<string, SessionKey> = new Map();

  async generateSessionKey(
    permissions: PermissionSet,
    _masterPublicKey: string,
    signature: string // signed by master key
  ): Promise<SessionKey> {
    // Generate new key pair
    const privateKey = randomBytes(32);
    const publicKey = await getPublicKey(privateKey);

    const sessionKey: SessionKey = {
      publicKey: Buffer.from(publicKey).toString('hex'),
      permissions,
      expiry: permissions.expiry,
      signature,
    };

    const keyId = this.calculateKeyId(sessionKey);
    this.sessionKeys.set(keyId, sessionKey);

    // Schedule cleanup on expiry
    const ttl = permissions.expiry - Date.now();
    if (ttl > 0) {
      setTimeout(() => {
        this.sessionKeys.delete(keyId);
      }, ttl);
    }

    return sessionKey;
  }

  async encodePermissions(permissions: PermissionSet): Promise<Uint8Array> {
    // Encode permissions into compact binary format
    // Format: 
    // - maxAmount: 8 bytes (bigint)
    // - expiry: 8 bytes (bigint)
    // - dailyLimit present flag: 1 byte (0x00 absent, 0x01 present)
    // - dailyLimit: 8 bytes (if present)
    // - tokenRestrictions count: 2 bytes (uint16)
    // - each token address: 20 bytes
    // - allowedRecipients count: 2 bytes (uint16)
    // - each recipient: 20 bytes
    // - allowedFunctions count: 2 bytes (uint16)
    // - each function selector: 4 bytes
    
    const buffer = new ArrayBuffer(1024); // initial size, will resize later
    const view = new DataView(buffer);
    let offset = 0;
    
    // maxAmount (8 bytes)
    const maxAmount = permissions.maxAmount;
    view.setBigUint64(offset, maxAmount, true);
    offset += 8;
    
    // expiry (8 bytes)
    const expiry = BigInt(permissions.expiry);
    view.setBigUint64(offset, expiry, true);
    offset += 8;
    
    // dailyLimit present flag
    const hasDailyLimit = permissions.dailyLimit !== undefined;
    view.setUint8(offset, hasDailyLimit ? 1 : 0);
    offset += 1;
    
    if (hasDailyLimit) {
      view.setBigUint64(offset, permissions.dailyLimit!, true);
      offset += 8;
    }
    
    // tokenRestrictions count
    const tokenRestrictions = permissions.tokenRestrictions || [];
    view.setUint16(offset, tokenRestrictions.length, true);
    offset += 2;
    
    // each token address (20 bytes each)
    for (const token of tokenRestrictions) {
      const hex = token.startsWith('0x') ? token.slice(2) : token;
      const bytes = Buffer.from(hex, 'hex');
      for (let i = 0; i < 20; i++) {
        view.setUint8(offset + i, bytes[i]);
      }
      offset += 20;
    }
    
    // allowedRecipients count
    const allowedRecipients = permissions.allowedRecipients;
    view.setUint16(offset, allowedRecipients.length, true);
    offset += 2;
    
    // each recipient (20 bytes each)
    for (const recipient of allowedRecipients) {
      const hex = recipient.startsWith('0x') ? recipient.slice(2) : recipient;
      const bytes = Buffer.from(hex, 'hex');
      for (let i = 0; i < 20; i++) {
        view.setUint8(offset + i, bytes[i]);
      }
      offset += 20;
    }
    
    // allowedFunctions count
    const allowedFunctions = permissions.allowedFunctions;
    view.setUint16(offset, allowedFunctions.length, true);
    offset += 2;
    
    // each function selector (4 bytes each)
    for (const func of allowedFunctions) {
      const hex = func.startsWith('0x') ? func.slice(2) : func;
      const bytes = Buffer.from(hex, 'hex');
      for (let i = 0; i < 4; i++) {
        view.setUint8(offset + i, bytes[i]);
      }
      offset += 4;
    }
    
    // Return only used portion of buffer
    return new Uint8Array(buffer, 0, offset);
  }

  validateSessionKey(keyId: string): boolean {
    const sessionKey = this.sessionKeys.get(keyId);
    if (!sessionKey) {
      return false;
    }

    if (Date.now() > sessionKey.expiry) {
      this.sessionKeys.delete(keyId);
      return false;
    }

    // Verify signature with master public key (placeholder)
    // In real implementation, verify using masterPublicKey
    return true;
  }

  revokeSessionKey(keyId: string): boolean {
    return this.sessionKeys.delete(keyId);
  }

  getSessionKey(keyId: string): SessionKey | undefined {
    return this.sessionKeys.get(keyId);
  }

  getAllSessionKeys(): SessionKey[] {
    return Array.from(this.sessionKeys.values());
  }

  async rotateSessionKeys(): Promise<void> {
    // In production, this would involve on-chain rotation
    // For now, just clear expired keys
    const now = Date.now();
    for (const [keyId, key] of this.sessionKeys.entries()) {
      if (now > key.expiry) {
        this.sessionKeys.delete(keyId);
      }
    }
  }

  private calculateKeyId(sessionKey: SessionKey): string {
    // Create deterministic ID from public key and expiry
    return `${sessionKey.publicKey.slice(0, 16)}_${sessionKey.expiry}`;
  }
}