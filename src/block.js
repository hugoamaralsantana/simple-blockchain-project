import cryptoJs from 'crypto-js';

class Block {
  constructor(timestamp, transactions, previousHash = '', difficulty = 0) {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.difficulty = difficulty;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  // Calculates current block's hash
  calculateHash() {
    return cryptoJs
      .SHA256(
        this.previousHash +
          this.timestamp +
          JSON.stringify(this.transactions) +
          this.nonce
      )
      .toString();
  }

  /**
   * Runs Proof-of-Work (mining)
   */
  mineBlock() {
    //Create a string with 'difficulty' number of zeros (e.g., 0000)
    const target = Array(this.difficulty + 1).join('0');

    while (this.hash.substring(0, this.difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }

    console.log(`Block mined: ${this.hash}`);
  }

  /**
   * Validates all transactions in the block
   * @returns {boolean} True if all transactions are valid
   */
  hasValidTransactions() {
    for (const transaction of this.transactions) {
      if (!transaction.isValid()) {
        return false;
      }
    }
    return true;
  }
}

export default Block;
