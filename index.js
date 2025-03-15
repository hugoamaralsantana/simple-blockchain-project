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
}

// Run everything
runBlockchainDemo().catch((error) => {
  console.error('Demo crashed:', error);
});
