import {ethers} from 'ethers';

const RPC_URL = 'https://opt-mainnet.g.alchemy.com/v2/D1Feqixbv9g-dwtyIzy7Bg6jiQRKgVJd';
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export {sleep, RPC_URL, provider};
