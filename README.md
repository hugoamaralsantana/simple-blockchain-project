# Blockchain Learning Project

A simple JavaScript blockchain implementation for educational purposes. This project demonstrates core blockchain concepts including transactions, mining, wallet management, chain validation, and Merkle trees.

## Features

- Blockchain data structure with cryptographic security
- Proof-of-work mining algorithm with adjustable difficulty
- Digital signature implementation (secp256k1 elliptic curve)
- Transaction validation and processing
- Wallet balance management
- Chain integrity validation
- Merkle tree implementation for efficient transaction verification

## Project Structure

```
├── src/
│   ├── block.js         # Block class implementation
│   ├── transaction.js   # Transaction class implementation
│   ├── blockchain.js    # Main blockchain implementation
│   ├── merkleTree.js    # Merkle tree implementation
├── index.js             # Demo script showcasing blockchain functionality
```

## Dependencies

- `crypto-js`: For cryptographic hash functions
- `elliptic`: For key generation and digital signatures

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

## Usage

Run the demo script to see the blockchain in action:

```
node index.js
```

The demo script showcases:

- Blockchain initialization with genesis block
- Wallet creation
- Transaction creation and signing
- Block mining
- Balance checking
- Chain validation
- Merkle root functionality and tamper detection

## Example Code

### Creating a blockchain instance

```javascript
import Blockchain from './src/blockchain.js';
const myCoin = new Blockchain();
```

### Generating a wallet

```javascript
import elliptic from 'elliptic';
const ec = new elliptic.ec('secp256k1');

// Generate key pair
const myKey = ec.genKeyPair();
const myWalletAddress = myKey.getPublic('hex');
```

### Creating a transaction

```javascript
// Create and sign a transaction
myCoin.createTransaction(fromAddress, toAddress, amount, privateKey);
```

### Mining a block

```javascript
// Mine a block (includes pending transactions + reward)
myCoin.minePendingTransactions(minerAddress);
```

### Checking balance

```javascript
const balance = myCoin.getBalanceOfAddress(walletAddress);
console.log(`Balance: ${balance}`);
```

### Validating the blockchain

```javascript
const isValid = myCoin.isChainValid();
console.log(`Blockchain valid: ${isValid}`);
```

### Verifying a block's Merkle root

```javascript
const isValid = block.verifyMerkleRoot();
console.log(`Merkle root valid: ${isValid}`);
```

## How It Works

1. **Blocks**: Each block contains a timestamp, transactions, a reference to the previous block, a difficulty level, a nonce value used in mining, and a Merkle root.

2. **Transactions**: Transactions represent the transfer of value from one wallet to another. Each transaction is signed by the sender's private key.

3. **Mining**: Mining is the process of finding a hash that meets a specific difficulty requirement (e.g., starting with a certain number of zeros). This is achieved by incrementing a nonce value until a valid hash is found.

4. **Chain Validation**: The blockchain can be validated by:

   - Verifying that each block correctly references the previous block's hash
   - Recalculating and verifying each block's hash
   - Verifying all transactions in each block are valid
   - Verifying the Merkle root of each block

5. **Merkle Trees**: A Merkle tree is a binary tree of hashes where:
   - Leaf nodes are hashes of individual transactions
   - Non-leaf nodes are hashes of their child nodes
   - The root of the tree (Merkle root) represents all transactions in the block
   - Provides efficient verification that a transaction is part of a block

## Key Concepts Demonstrated

- **Immutability**: Once a block is added to the chain, its contents cannot be changed without invalidating all subsequent blocks.
- **Proof of Work**: Mining demonstrates the computational effort required to add blocks to the chain.
- **Decentralization**: The system design allows for independent verification of the entire chain.
- **Digital Signatures**: Transactions are securely signed and verified using public-key cryptography.
- **Merkle Trees**: Enables efficient verification of transaction inclusion without processing each transaction individually.

## Benefits of Merkle Trees

1. **Efficiency**: Reduces the amount of data needed to verify transactions
2. **Scalability**: Verification complexity grows logarithmically with the number of transactions
3. **Light Clients**: Enables SPV (Simplified Payment Verification) for lightweight applications
4. **Tamper Detection**: Any change to a transaction will change the Merkle root
5. **Proof Generation**: Can generate inclusion proofs that a specific transaction exists in a block

## License

[MIT](LICENSE)

## Disclaimer

This project is for educational purposes only and is not intended for use in production systems or real cryptocurrency applications.
