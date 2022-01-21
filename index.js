// Import dependencies available in the autotask environment
const { DefenderRelayProvider, DefenderRelaySigner } = require('defender-relay-client/lib/ethers');
const { ethers } = require('ethers');

const OPENQ_ABI = [{"inputs":[{"internalType":"string","name":"_id","type":"string"},{"internalType":"address","name":"_payoutAddress","type":"address"}],"name":"claimBounty","outputs":[],"stateMutability":"nonpayable","type":"function"}]
const OPENQ_ADDRESS = `0x5fB848E68Ed73D38195c9970Ac19a627f2fbFaf1`;

// Entrypoint for the Autotask
exports.handler = async function(event) {
  const { issueId, payoutAddress } = event.request.body;
  const provider = new DefenderRelayProvider(event);
  const signer = new DefenderRelaySigner(event, provider, { speed: 'fastest' });
  const openQ = new ethers.Contract(OPENQ_ADDRESS, OPENQ_ABI, signer);
  const txn = await openQ.claimBounty(issueId, payoutAddress);
  console.log(`Called execute in ${txn.hash}`);
  return { txn: txn.hash };
}

// To run locally (this code will not be executed in Autotasks)
if (require.main === module) {
  require('dotenv').config();
  const { API_KEY: apiKey, API_SECRET: apiSecret } = process.env;
  exports.handler({ apiKey, apiSecret })
    .then(() => process.exit(0))
    .catch(error => { console.error(error); process.exit(1); });
}