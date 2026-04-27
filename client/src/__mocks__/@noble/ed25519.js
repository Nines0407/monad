// Mock for @noble/ed25519
module.exports = {
  getPublicKey: async (privateKey) => {
    // Return a mock public key (32 bytes)
    return new Uint8Array(32).fill(1);
  },
  getPublicKeyAsync: async (privateKey) => {
    return new Uint8Array(32).fill(1);
  },
  sign: async (message, privateKey) => {
    return new Uint8Array(64).fill(2);
  },
  signAsync: async (message, privateKey) => {
    return new Uint8Array(64).fill(2);
  },
  verify: async (signature, message, publicKey) => {
    return true;
  },
  verifyAsync: async (signature, message, publicKey) => {
    return true;
  }
};