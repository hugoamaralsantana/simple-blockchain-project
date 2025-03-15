import Blockchain from './src/blockchain.js';
import Transaction from './src/transaction.js';
import elliptic from 'elliptic';

// Init the elliptic curve stuff
const ec = new elliptic.ec('secp256k1');

// Helper for console logs
function logSection(title) {
  console.log('\n' + '='.repeat(40));
  console.log(`${title}`);
  console.log('='.repeat(40));
}

// Main function to run everything
async function runBlockchainDemo() {
  // Create a new blockchain
  logSection('CREATING BLOCKCHAIN');
  const coin = new Blockchain();
  console.log('New blockchain created');

  // Show genesis block
  const genesis = coin.chain[0];
  console.log('\nGenesis Block:');
  console.log(`Hash: ${genesis.hash}`);

  // Generate some wallets for testing
  logSection('SETTING UP WALLETS');

  // Make 3 wallets
  const key1 = ec.genKeyPair();
  const key2 = ec.genKeyPair();
  const key3 = ec.genKeyPair();

  // Get wallet addresses
  const addr1 = key1.getPublic('hex');
  const addr2 = key2.getPublic('hex');
  const addr3 = key3.getPublic('hex');

  console.log(`Person1: ${addr1.substring(0, 10)}...`);
  console.log(`Person2: ${addr2.substring(0, 10)}...`);
  console.log(`Person3: ${addr3.substring(0, 10)}...`);

  // Mine first block to get some coins
  logSection('MINING FIRST BLOCK');
  console.log('Person1 is mining...');

  let block1 = coin.minePendingTransactions(addr1);

  console.log(`Block mined: ${block1.hash.substring(0, 10)}...`);
  console.log(`Nonce: ${block1.nonce}`);

  // Check balances
  logSection('CHECKING BALANCES');

  const bal1 = coin.getBalanceOfAddress(addr1);
  const bal2 = coin.getBalanceOfAddress(addr2);
  const bal3 = coin.getBalanceOfAddress(addr3);

  console.log(`Person1: ${bal1} coins`);
  console.log(`Person2: ${bal2} coins`);
  console.log(`Person3: ${bal3} coins`);

  // Create some transactions
  logSection('MAKING TRANSACTIONS');

  // Person1 sends coins to Person2
  console.log('\nTransaction 1: Person1 -> Person2');
  try {
    coin.createTransaction(addr1, addr2, 30, key1);
    console.log('Transaction added to pending');
  } catch (error) {
    console.error('Failed:', error.message);
  }

  // Person1 sends coins to Person3
  console.log('\nTransaction 2: Person1 -> Person3');
  try {
    coin.createTransaction(addr1, addr3, 20, key1);
    console.log('Transaction added to pending');
  } catch (error) {
    console.error('Failed:', error.message);
  }

  // Show pending tx
  console.log('\nPending transactions:');
  coin.pendingTransactions.forEach((tx, i) => {
    console.log(
      `Tx ${i + 1}: From ${
        tx.fromAddress ? tx.fromAddress.substring(0, 10) + '...' : 'System'
      } to ${tx.toAddress.substring(0, 10)}... Amount: ${tx.amount}`
    );
  });

  // Mine second block with transactions
  logSection('MINING SECOND BLOCK');
  console.log('Person2 is mining to process transactions...');

  let block2 = coin.minePendingTransactions(addr2);

  console.log(`Block mined: ${block2.hash.substring(0, 10)}...`);
  console.log(`Chain length: ${coin.chain.length}`);

  // Check updated balances
  logSection('UPDATED BALANCES');

  console.log(`Person1: ${coin.getBalanceOfAddress(addr1)} coins`);
  console.log(`Person2: ${coin.getBalanceOfAddress(addr2)} coins`);
  console.log(`Person3: ${coin.getBalanceOfAddress(addr3)} coins`);

  // Try an invalid transaction
  logSection('TRYING INVALID TX');

  console.log('Person3 tries to send more coins than they have:');
  try {
    coin.createTransaction(addr3, addr1, 1000, key3);
    console.log('TX ADDED (this should not happen)');
  } catch (error) {
    console.error('TX REJECTED:', error.message);
  }

  // Valid transaction from Person3
  console.log('\nPerson3 sends 5 coins to Person1:');
  try {
    coin.createTransaction(addr3, addr1, 5, key3);
    console.log('Transaction added to pending');
  } catch (error) {
    console.error('Failed:', error.message);
  }

  // Mine another block
  logSection('MINING THIRD BLOCK');

  let block3 = coin.minePendingTransactions(addr3);

  console.log(`Block mined: ${block3.hash.substring(0, 10)}...`);
  console.log(`Current difficulty: ${coin.difficulty}`);

  // Verify chain
  logSection('CHAIN VALIDATION');

  const isValid = coin.isChainValid();
  console.log(`Blockchain valid? ${isValid ? 'YES ✓' : 'NO ✗'}`);

  // Print full blockchain
  logSection('FULL BLOCKCHAIN');

  coin.chain.forEach((block, i) => {
    console.log(`\nBlock #${i}:`);
    console.log(`Hash: ${block.hash.substring(0, 15)}...`);
    console.log(`Transactions: ${block.transactions.length}`);
  });

  // Final balances
  logSection('FINAL STATE');

  console.log(`Chain length: ${coin.chain.length} blocks`);
  console.log(`Difficulty: ${coin.difficulty}`);

  console.log('\nFinal balances:');
  console.log(`Person1: ${coin.getBalanceOfAddress(addr1)} coins`);
  console.log(`Person2: ${coin.getBalanceOfAddress(addr2)} coins`);
  console.log(`Person3: ${coin.getBalanceOfAddress(addr3)} coins`);

  // Demonstrate Merkle root functionality
  logSection('MERKLE ROOT DEMONSTRATION');

  // Show Merkle root from an existing block
  console.log('Showing Merkle root from Block #2:');
  const demoBlock = coin.chain[2]; // Use block #2 which has transactions
  console.log(`Block hash: ${demoBlock.hash.substring(0, 15)}...`);
  console.log(`Merkle root: ${demoBlock.merkleRoot.substring(0, 15)}...`);
  console.log(`Transaction count: ${demoBlock.transactions.length}`);

  // Verify Merkle root is valid
  console.log(`\nVerifying Merkle root integrity...`);
  console.log(
    `Merkle root valid: ${demoBlock.verifyMerkleRoot() ? 'YES ✓' : 'NO ✗'}`
  );

  // Demonstrate what happens when a transaction is tampered with
  logSection('TRANSACTION TAMPERING DETECTION');

  console.log('Attempting to tamper with a transaction in Block #2...');

  // Save original state for restoration
  const originalAmount = demoBlock.transactions[0].amount;
  const originalMerkleRoot = demoBlock.merkleRoot;

  // Tamper with transaction
  console.log(`\nOriginal transaction amount: ${originalAmount}`);
  demoBlock.transactions[0].amount += 50;
  console.log(
    `Modified transaction amount: ${demoBlock.transactions[0].amount}`
  );

  // Check if tampering is detected
  console.log(`\nVerifying Merkle root after tampering:`);
  console.log(
    `Merkle root still valid: ${
      demoBlock.verifyMerkleRoot()
        ? 'YES (problem!)'
        : 'NO (tampering detected!) ✓'
    }`
  );

  // Show what happens to blockchain validation after tampering
  console.log(`\nVerifying entire blockchain after transaction tampering:`);
  const isValidAfterTampering = coin.isChainValid();
  console.log(
    `Blockchain still valid: ${
      isValidAfterTampering ? 'YES (problem!)' : 'NO (tampering detected!) ✓'
    }`
  );

  // Restore original values for clean demo
  demoBlock.transactions[0].amount = originalAmount;
  demoBlock.merkleRoot = originalMerkleRoot;

  // Create a new block with Merkle root to show efficiency
  logSection('MERKLE ROOT EFFICIENCY');

  console.log(
    'Creating multiple transactions to demonstrate Merkle tree efficiency...'
  );

  // Add several transactions for the demo
  for (let i = 0; i < 8; i++) {
    // Alternate senders and receivers
    const sender = i % 2 === 0 ? addr1 : addr2;
    const receiver = i % 2 === 0 ? addr3 : addr1;
    const senderKey = i % 2 === 0 ? key1 : key2;

    try {
      coin.createTransaction(sender, receiver, 1, senderKey);
      console.log(
        `Created transaction #${i + 1}: ${sender.substring(
          0,
          10
        )}... -> ${receiver.substring(0, 10)}...`
      );
    } catch (error) {
      console.error(`Failed to create transaction #${i + 1}: ${error.message}`);
    }
  }

  // Mine a block with these transactions
  console.log('\nMining a block with multiple transactions...');
  const merkleBlock = coin.minePendingTransactions(addr1);

  // Show the benefit of Merkle trees
  console.log(`\nBlock has ${merkleBlock.transactions.length} transactions`);
  console.log(
    `But validation only needs the Merkle root: ${merkleBlock.merkleRoot.substring(
      0,
      15
    )}...`
  );
  console.log(
    `This provides efficient verification without processing each transaction individually`
  );

  // Final validation
  logSection('FINAL VALIDATION');

  const finalValidation = coin.isChainValid();
  console.log(
    `Final blockchain state valid: ${finalValidation ? 'YES ✓' : 'NO ✗'}`
  );
  console.log(`Total blocks in chain: ${coin.chain.length}`);
}

// Run everything
runBlockchainDemo().catch((error) => {
  console.error('Demo crashed:', error);
});
