import { KeyManager } from './index';

describe('KeyManager', () => {
  let keyManager: KeyManager;

  beforeEach(() => {
    keyManager = new KeyManager();
  });

  test('should create new wallet', async () => {
    const wallet = await keyManager.initializeWallet('create');
    expect(wallet).toHaveProperty('address');
    expect(wallet).toHaveProperty('publicKey');
    expect(wallet.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  test('should import from mnemonic', async () => {
    const mnemonic = 'test test test test test test test test test test test junk';
    const wallet = await keyManager.initializeWallet('import-mnemonic', mnemonic);
    expect(wallet.address).toBeDefined();
  });

  test('should get public key after initialization', async () => {
    await keyManager.initializeWallet('create');
    const publicKey = await keyManager.getPublicKey();
    expect(publicKey).toMatch(/^0x[a-fA-F0-9]{66}$/);
  });

  test('should get address after initialization', async () => {
    await keyManager.initializeWallet('create');
    const address = await keyManager.getAddress();
    expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  test('should sign transaction', async () => {
    await keyManager.initializeWallet('create');
    const signature = await keyManager.signTransaction('0x1234');
    expect(signature).toBeDefined();
  });

  test('should backup and restore wallet', async () => {
    await keyManager.initializeWallet('create');
    const backup = await keyManager.backupKeys('password123');
    expect(backup).toBeDefined();

    const restoredWallet = await keyManager.restoreFromBackup(backup, 'password123');
    expect(restoredWallet.address).toBeDefined();
  });

  test('should rotate keys', async () => {
    await keyManager.initializeWallet('create');
    const oldAddress = await keyManager.getAddress();
    const newWallet = await keyManager.rotateKeys();
    expect(newWallet.address).not.toBe(oldAddress);
  });
});