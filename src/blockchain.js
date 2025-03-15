import Block from './block.js';
import Transaction from './transaction.js';
import elliptic from 'elliptic';
const ec = new elliptic.ec('secp256k1');

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 0;
    this.pendingTransactions = [];
    this.miningReward = 100;
  }

  createGenesisBlock() {
    return new Block(
      Date.parse('2023-01-01'),
      [new Transaction(null, 'genesis-wallet', 1000)],
      '0',
      this.difficulty
    );
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  getTotalDifficulty() {
    return this.chain.reduce(
      (total, block) => total + Math.pow(2, block.difficulty),
      0
    );
  }

  createTransaction(fromAddress, toAddress, amount, privateKey) {
    //check sender for sufficient balance
    if (fromAddress) {
      const balance = this.getBalanceOfAddress(fromAddress);
      if (balance < amount) {
        throw new Error('Insufficient Funds');
      }
    } else {
      throw new Error('Invalid fromAddress');
    }

    const transaction = new Transaction(fromAddress, toAddress, amount);

    if (fromAddress && privateKey) {
      // Convert private key string to key object
      const keyPair = ec.keyFromPrivate(privateKey);
      transaction.signTransaction(keyPair);
    }

    if (!transaction.isValid() && fromAddress !== null) {
      throw new Error('Cannot add invalid transaction to chain');
    }

    this.pendingTransactions.push(transaction);
    return transaction;
  }

  minePendingTransactions(miningRewardAddress) {
    const rewardTransaction = new Transaction(
      null,
      miningRewardAddress,
      this.miningReward
    );
    this.pendingTransactions.push(rewardTransaction);

    const block = new Block(
      Date.now(),
      this.pendingTransactions,
      this.getLatestBlock().hash
    );

    block.difficulty = this.difficulty;

    block.mineBlock();

    this.chain.push(block);

    this.adjustDifficulty();

    this.pendingTransactions = [];

    return block;
  }

  adjustDifficulty() {
    this.difficulty++;
    console.log(`Difficulty incremented to: ${this.difficulty}`);
  }

  resetDifficulty() {
    this.difficulty = 0;
    console.log(`Difficulty reset to 0`);
  }

  getBalanceOfAddress(address) {
    let balance = 0;
    const transactions = this.getTransactionsForAddress(address);

    for (const transaction of transactions) {
      //If address is sender, subtract
      if (transaction.fromAddress === address) {
        balance -= transaction.amount;
      }

      // If address is reciever, add
      if (transaction.toAddress === address) {
        balance += transaction.amount;
      }
    }

    return balance;
  }

  getTransactionsForAddress(address) {
    const transactions = [];

    //Check each block in chain
    for (const block of this.chain) {
      // Check each transaction in block
      for (const transaction of block.transactions) {
        // Check if to or from addresses match target address
        if (
          transaction.fromAddress === address ||
          transaction.toAddress === address
        ) {
          transactions.push(transaction);
        }
      }
    }

    return transactions;
  }

  isChainValid() {
    // Check each block in the chain

    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Check if Merkle root is valid
      if (!currentBlock.verifyMerkleRoot()) {
        console.error('Invalid Merkle root in block');
        return false;
      }

      // Check if block's transactions are valid
      if (!currentBlock.hasValidTransactions()) {
        console.error('Block in Chain contains invalid transactions');
        return false;
      }

      // Check if block's hash is valid
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        console.error('Invalid Block hash in chain');
        return false;
      }

      // Check if block's previousHash points to the has of the previous block
      if (currentBlock.previousHash !== previousBlock.hash) {
        console.error('Block hash link broken');
        return false;
      }
    }
    return true;
  }

  getAllBlocks() {
    return this.chain;
  }

  getBlockByIndex(index) {
    if (index < 0 || index >= this.chain.length) {
      throw new Error('Block search index out of range');
    }

    return this.chain[index];
  }

  getBlockByHash(hash) {
    return this.chain.find((block) => block.hash === hash);
  }

  getTransactionByHash(hash) {
    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.calculateHash() === hash) {
          return tx;
        }
      }
    }

    return null;
  }
}

export default Blockchain;
