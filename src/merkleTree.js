import cryptoJs from 'crypto-js';

class MerkleTree {
  constructor(transactions) {
    this.transactions = transactions;
    this.root = this.calculateMerkleRoot();
  }

  hashTransaction(transaction) {
    return cryptoJs.SHA256(JSON.stringify(transaction)).toString();
  }

  calculateMerkleRoot() {
    let leaves = this.transactions.map((transaction) =>
      this.hashTransaction(transaction)
    );

    // If no transactions, return empty hash
    if (leaves.length === 0) {
      return cryptoJs.SHA256('').toString();
    }

    // Handle odd number of transactions by duplicating the last one
    if (leaves.length % 2 === 1) {
      leaves.push(leaves[leaves.length - 1]);
    }

    while (leaves.length > 1) {
      let level = [];

      for (let i = 0; i < leaves.length; i += 2) {
        const combinedHash = cryptoJs
          .SHA256(leaves[i] + leaves[i + 1])
          .toString();
        level.push(combinedHash);
      }

      // move up a level in the tree
      leaves = level;

      // If there's odd number of nodes at this level, we duplicate the last one
      if (leaves.length % 2 === 1 && leaves.length > 1) {
        leaves.push(leaves[leaves.length - 1]);
      }
    }

    //return Merkle root
    return leaves[0];
  }
}
