import { Wallet } from '../types';
import { OSKeychain } from './os-keychain';
import { HardwareWallet } from './hardware-wallet';
import { EncryptedFileStorage } from './encrypted-storage';

export class KeyManager {
  private wallet: Wallet | null = null;
  private keychain: OSKeychain;
  private hardwareWallet?: HardwareWallet;
  private encryptedStorage: EncryptedFileStorage;

  constructor() {
    this.keychain = new OSKeychain();
    this.encryptedStorage = new EncryptedFileStorage();
  }

  async initializeWallet(
    method: 'create' | 'import-mnemonic' | 'import-private-key' | 'hardware',
    data?: string
  ): Promise<Wallet> {
    switch (method) {
      case 'create':
        this.wallet = await this.generateNewWallet();
        break;
      case 'import-mnemonic':
        this.wallet = await this.importFromMnemonic(data!);
        break;
      case 'import-private-key':
        this.wallet = await this.importFromPrivateKey(data!);
        break;
      case 'hardware':
        this.wallet = await this.connectHardwareWallet();
        break;
      default:
        throw new Error(`Unsupported wallet initialization method: ${method}`);
    }

    await this.storeWalletSecurely(this.wallet);
    return this.wallet;
  }

  async getPublicKey(): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }
    return this.wallet.publicKey;
  }

  async getAddress(): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }
    return this.wallet.address;
  }

  async signTransaction(transactionHash: string): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }
    // In real implementation, use isolated signing context
    const signature = await this.keychain.sign(transactionHash);
    return signature;
  }

  async signMessage(message: string): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }
    const signature = await this.keychain.sign(message);
    return signature;
  }

  async backupKeys(password: string): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }
    const encryptedBackup = await this.encryptedStorage.exportWallet(
      this.wallet,
      password
    );
    return encryptedBackup;
  }

  async restoreFromBackup(encryptedBackup: string, password: string): Promise<Wallet> {
    this.wallet = await this.encryptedStorage.importWallet(
      encryptedBackup,
      password
    );
    await this.storeWalletSecurely(this.wallet);
    return this.wallet;
  }

  async rotateKeys(): Promise<Wallet> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }
    const newWallet = await this.generateNewWallet();
    // TODO: Implement fund migration strategy
    this.wallet = newWallet;
    await this.storeWalletSecurely(this.wallet);
    return this.wallet;
  }

  private async generateNewWallet(): Promise<Wallet> {
    // Use @monad-xyz/mpc or ethers.js to generate wallet
    // For now, mock implementation
    const { ethers } = await import('ethers');
    const wallet = ethers.Wallet.createRandom();
    return {
      address: wallet.address,
      publicKey: wallet.publicKey,
    };
  }

  private async importFromMnemonic(mnemonic: string): Promise<Wallet> {
    const { ethers } = await import('ethers');
    const wallet = ethers.Wallet.fromPhrase(mnemonic);
    return {
      address: wallet.address,
      publicKey: wallet.publicKey,
    };
  }

  private async importFromPrivateKey(privateKey: string): Promise<Wallet> {
    const { ethers } = await import('ethers');
    const wallet = new ethers.Wallet(privateKey);
    return {
      address: wallet.address,
      publicKey: wallet.signingKey.publicKey,
    };
  }

  private async connectHardwareWallet(): Promise<Wallet> {
    if (!this.hardwareWallet) {
      this.hardwareWallet = new HardwareWallet();
    }
    return await this.hardwareWallet.connect();
  }

  private async storeWalletSecurely(wallet: Wallet): Promise<void> {
    // Store public key in OS keychain, never private key
    await this.keychain.storePublicKey(wallet.publicKey);
  }
}