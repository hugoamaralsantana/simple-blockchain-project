import cryptoJs from 'crypto-js';
import elliptic from 'elliptic';

const ec = new elliptic.ec('secp256k1');

class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.timestamp = Date.now();
    this.signature = null;
  }

  /**
   * Generates an SHA256 hash of the transaction
   * @returns {string} The transaction hash
   */
  calculateHash() {
    return cryptoJs
      .SHA256(this.fromAddress + this.toAddress + this.amount + this.timestamp)
      .toString();
  }

  /**
   * Signs the transaction with the given signing key
   * @param {Object} signingKey - The signing key (private)
   */
  signTransaction(signingKey) {
    // Only allow signing the transaction if you're the sender
    if (signingKey.getPublic('hex') !== this.fromAddress) {
      throw new Error('You cannot sign transactions for other wallets!');
    }

    const transactionHash = this.calculateHash();

    const signature = signingKey.sign(transactionHash, 'base64');

    this.signature = signature.toDER('hex');
  }

  /**
   * Verifies if transaction is valid
   * @returns {boolean} returns True if mined transaction or if signature matches fromAddress
   */
  isValid() {
    // Mining reward transactions don't contain a from address
    if (this.fromAddress === null) return true;

    // Check transaction for signature
    if (!this.signature || this.signature.length === 0) {
      throw new Error('No signature in this transaction');
    }

    // Verify the transaction signature
    const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
    return publicKey.verify(this.calculateHash(), this.signature);
  }
}

export default Transaction;
