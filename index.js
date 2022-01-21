// Import dependencies available in the autotask environment
const { DefenderRelayProvider, DefenderRelaySigner } = require('defender-relay-client/lib/ethers');
const { ethers } = require('ethers');

const OPENQ_ABI = [{"inputs":[{"internalType":"string","name":"_id","type":"string"},{"internalType":"address","name":"_payoutAddress","type":"address"}],"name":"claimBounty","outputs":[],"stateMutability":"nonpayable","type":"function"}]
const OPENQ_ADDRESS = `0xD318206C31159A1dB5c2e27E7f41DD5AD95D7C19`;

// Entrypoint for the Autotask
exports.handler = async function(event) {
  const { issueId, payoutAddress } = event.request.body;
  console.log(`Attempting to claim issue ${issueId} to payoutAddress ${payoutAddress}`)
  const provider = new DefenderRelayProvider(event);
  const signer = new DefenderRelaySigner(event, provider, { speed: 'fastest' });
  const openQ = new ethers.Contract(OPENQ_ADDRESS, OPENQ_ABI, signer);
  const options = { gasLimit: 3000000 };
  const txn = await openQ.claimBounty(issueId, payoutAddress, options);
  console.log(`Called claimBounty in ${txn.hash}`);
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