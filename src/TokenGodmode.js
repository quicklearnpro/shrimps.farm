import ganache from 'ganache';
import {ethers} from 'ethers';
import erc20Abi from './abi/ERC20.json';

const toBytes32 = bn => {
  return ethers.utils.hexlify(ethers.utils.zeroPad(bn.toHexString(), 32));
};

// Magic number to check
const MAGIC_NUMBER = ethers.utils.parseEther('42');
const MAGIC_NUMBER_BYTES32 = toBytes32(MAGIC_NUMBER);

// Shouldn't be more than 200 slots... right
const MAX_SLOT_ITER = 400;

const findBalanceAndApprovalSlot = async (tokenAddress, rpcUrl) => {
  // evm_setAccountStorageAt
  // eth_getStorageAt
  const provider = new ethers.providers.Web3Provider(
    ganache.provider({wallet: {defaultBalance: 0}, fork: {url: rpcUrl}})
  );
  const token = new ethers.Contract(tokenAddress, erc20Abi, provider);

  // Randomly create a wallet lol
  const wallet = ethers.Wallet.createRandom();
  const userAddress = wallet.address;

  const wallet2 = ethers.Wallet.createRandom();
  const userAddress2 = wallet2.address;

  // Slots
  let balanceOfSlot = null;
  let approveSlot = null;
  let isSolidityFormat = true;

  // Solidity is key, slot
  for (let i = 0; i <= MAX_SLOT_ITER; i++) {
    const slot = ethers.utils.solidityKeccak256(
      ['uint256', 'uint256'],
      [userAddress, i] // key, slot (solidity)
    );

    // CHANGE AND SEE
    await provider.send('evm_setAccountStorageAt', [tokenAddress, slot, MAGIC_NUMBER_BYTES32]);
    await provider.send('evm_mine', []);

    // Check balanceOf
    const bal = await token.balanceOf(userAddress);

    if (bal.eq(MAGIC_NUMBER)) {
      balanceOfSlot = i;
      break;
    }
  }

  // Vyper    is slot, key
  if (balanceOfSlot === null) {
    for (let i = 0; i <= MAX_SLOT_ITER; i++) {
      const slot = ethers.utils.solidityKeccak256(
        ['uint256', 'uint256'],
        [i, userAddress] // slot, key (vyper)
      );

      // CHANGE AND SEE
      await provider.send('evm_setAccountStorageAt', [tokenAddress, slot, MAGIC_NUMBER_BYTES32]);
      await provider.send('evm_mine', []);

      // Check balanceOf
      const bal = await token.balanceOf(userAddress);

      if (bal.eq(MAGIC_NUMBER)) {
        balanceOfSlot = i;
        isSolidityFormat = false;
        break;
      }
    }
  }

  // Checks if solidity formar
  for (let i = 0; i <= MAX_SLOT_ITER; i++) {
    const slot = isSolidityFormat
      ? ethers.utils.solidityKeccak256(
          ['uint256', 'uint256'],
          [
            userAddress2,
            ethers.utils.solidityKeccak256(['uint256', 'uint256'], [userAddress, i]), // key2, key1, slot (solidity)
          ]
        )
      : ethers.utils.solidityKeccak256(
          ['uint256', 'uint256'],
          [i, ethers.utils.solidityKeccak256(['uint256', 'uint256'], [userAddress, userAddress2])] // slot, key1, key2 (vyper)
        );

    await provider.send('evm_setAccountStorageAt', [tokenAddress, slot, MAGIC_NUMBER_BYTES32]);
    await provider.send('evm_mine', []);

    const allowance = await token.allowance(userAddress, userAddress2);
    if (allowance.eq(MAGIC_NUMBER)) {
      approveSlot = i;
      break;
    }
  }

  return {
    balanceOfSlot,
    approveSlot,
    isSolidityFormat,
  };
};

export {findBalanceAndApprovalSlot, toBytes32};
