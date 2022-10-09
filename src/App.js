import {useState} from 'react';
import {
  Avatar,
  CardHeader,
  Link,
  Grid,
  Paper,
  TextField,
  Typography,
  Button,
  Tooltip,
} from '@mui/material';
import {useNavigate} from 'react-router-dom';

import {findBalanceAndApprovalSlot, toBytes32} from './TokenGodmode';

import logo from './logo.png';
import {ethers} from 'ethers';
import {provider} from './constants';

const RPC_URL = 'https://opt-mainnet.g.alchemy.com/v2/D1Feqixbv9g-dwtyIzy7Bg6jiQRKgVJd';

function App() {
  const [invalidHash, setInvalidHash] = useState(false);
  const [txHash, setTxHash] = useState('');

  const [godmoding, setGodmoding] = useState(false);
  const [callResult, setCallResult] = useState(null);
  const [tokenSlotDump, setTokenSlotDump] = useState(null);
  const [tokenAddress, setTokenAddress] = useState('0x4200000000000000000000000000000000000006');
  const [senderAddress, setSenderAddress] = useState('0x3Ef35c1162249e7Fe9178eF1f8dad35958158e93');
  const [contractAddress, setContractAddress] = useState(
    '0x4200000000000000000000000000000000000006'
  );
  const [callData, setCallData] = useState(
    '0xa9059cbb0000000000000000000000004a6f22eda42f0a523a2713ff28a27f352168209f000000000000000000000000000000000000000000000000000000000bebc200'
  );

  const [invalidTokenAddress, setInvalidTokenAddress] = useState(false);
  const [invalidContractAddress, setInvalidContractAddress] = useState(false);
  const [invalidSenderAddress, setInvalidSenderAddress] = useState(false);

  const navigate = useNavigate();

  const tokenGodmode = async () => {
    let hasInvalid = false;

    setInvalidTokenAddress(false);
    setInvalidSenderAddress(false);
    setInvalidContractAddress(false);

    if (tokenAddress.length !== 42) {
      setInvalidTokenAddress(true);
      hasInvalid = true;
    }
    if (senderAddress.length !== 42) {
      setInvalidSenderAddress(true);
      hasInvalid = true;
    }
    if (contractAddress.length !== 42) {
      setInvalidContractAddress(true);
      hasInvalid = true;
    }

    if (hasInvalid) {
      return;
    }

    setGodmoding(true);

    const {isSolidityFormat, approveSlot, balanceOfSlot} = await findBalanceAndApprovalSlot(
      tokenAddress,
      RPC_URL
    );

    // Calculate overrides
    let approveStorage;
    let balanceStorage;

    if (isSolidityFormat) {
      balanceStorage = ethers.utils.solidityKeccak256(
        ['uint256', 'uint256'],
        [senderAddress, balanceOfSlot] // key, slot (solidity)
      );
      approveStorage = ethers.utils.solidityKeccak256(
        ['uint256', 'uint256'],
        [
          contractAddress,
          ethers.utils.solidityKeccak256(['uint256', 'uint256'], [senderAddress, approveSlot]), // key2, key1, slot (solidity)
        ]
      );
    } else {
      balanceStorage = ethers.utils.solidityKeccak256(
        ['uint256', 'uint256'],
        [balanceOfSlot, senderAddress] // slot, key (vyper)
      );
      approveStorage = ethers.utils.solidityKeccak256(
        ['uint256', 'uint256'],
        [
          approveSlot,
          ethers.utils.solidityKeccak256(['uint256', 'uint256'], [senderAddress, contractAddress]), // key2, key1, slot (solidity)
        ]
      );
    }

    const storageOverrides = {
      [tokenAddress]: {
        stateDiff: {
          [balanceStorage]: toBytes32(ethers.constants.MaxUint256),
          [approveStorage]: toBytes32(ethers.constants.MaxUint256),
        },
      },
    };

    setTokenSlotDump({
      isSolidityFormat,
      approveSlot,
      balanceOfSlot,
      approveStorage,
      balanceStorage,
    });

    const stackTraceData = await provider
      .send('eth_call', [
        {from: senderAddress, to: contractAddress, data: callData},
        'latest',
        storageOverrides,
      ])
      .catch(e => `error ${e.toString()}`);

    setCallResult(stackTraceData);
    setGodmoding(false);
  };

  return (
    <>
      <div style={{paddingTop: '25px'}} />
      <Grid container spacing={1}>
        <Grid item xs={1}></Grid>
        <Grid item xs={10}>
          <CardHeader
            avatar={
              <Link href="/">
                <Avatar alt="logo" src={logo} />
              </Link>
            }
            title={
              <Typography variant="h4" component="h4">
                Shrimps.farms - Optimism Tools
              </Typography>
            }
          />
          <br />
          <Paper style={{padding: '20px'}} variant="outlined">
            <Typography variant="h5" component="h5">
              Transaction Tracer
            </Typography>
            <br />
            <TextField
              error={invalidHash}
              helperText={invalidHash && 'Invalid tx hash'}
              onChange={e => setTxHash(e.target.value)}
              value={txHash}
              fullWidth
              label="Optimism tx hash"
              id="fullWidth"
            />
            <br />
            <br />
            <Button
              onClick={() => {
                if (txHash.length !== 66 && txHash.slice(0, 2) !== '0x') {
                  setInvalidHash(true);
                  return;
                }
                navigate(`/tx/${txHash}`);
              }}
              variant="contained"
            >
              Trace Tx
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={1}></Grid>
      </Grid>

      <div style={{paddingTop: '50px'}} />

      <Grid container spacing={1}>
        <Grid item xs={1}></Grid>
        <Grid item xs={10}>
          <Paper style={{padding: '20px'}} variant="outlined">
            <Tooltip
              title="Simulates calls to the contract address as if although you have a bunch of said tokens, which are also pre-approved to the contract."
              placement="top-start"
            >
              <Typography variant="h5" component="h5">
                Token Godmode
              </Typography>
            </Tooltip>
            <br />
            <TextField
              error={invalidTokenAddress}
              helperText={invalidTokenAddress && 'Invalid token address'}
              onChange={e => setTokenAddress(e.target.value)}
              value={tokenAddress}
              fullWidth
              label="Token Address"
              id="fullWidth"
            />
            <br />
            <br />
            <TextField
              error={invalidSenderAddress}
              helperText={invalidSenderAddress && 'Invalid sender address'}
              onChange={e => setSenderAddress(e.target.value)}
              value={senderAddress}
              fullWidth
              label="Sender Address"
              id="fullWidth"
            />
            <br />
            <br />
            <TextField
              error={invalidContractAddress}
              helperText={invalidContractAddress && 'Invalid contract address'}
              onChange={e => setContractAddress(e.target.value)}
              value={contractAddress}
              fullWidth
              label="Contract Address"
              id="fullWidth"
            />
            <br />
            <br />
            <TextField
              label="Call data"
              fullWidth
              multiline
              rows={4}
              value={callData}
              onChange={e => setCallData(e.target.value)}
            />
            <br />
            <br />
            <Button variant="contained" onClick={() => tokenGodmode()}>
              Token Godmode Call
            </Button>
            <br />
            <br />
            {godmoding && 'Godmoding...'}
            {!godmoding && tokenSlotDump !== null && (
              <TextField
                label="Balance and Approve slots"
                fullWidth
                multiline
                rows={4}
                value={`const ethers = require('ethers')
const balanceOfSlot = ${tokenSlotDump.balanceOfSlot}
const approveSlot = ${tokenSlotDump.approveSlot}

const balanceStorage = ethers.utils.solidityKeccak256(
  ['uint256', 'uint256'],
  ${
    tokenSlotDump.isSolidityFormat ? '[balanceOfSlot, userAddress]' : '[userAddress, balanceOfSlot]'
  }
);

const approveStorage = ethers.utils.solidityKeccak256(
  ['uint256', 'uint256'],
  [
    ${tokenSlotDump.isSolidityFormat ? 'approveSlot' : 'recipientAddress'},
    ethers.utils.solidityKeccak256(['uint256', 'uint256'], [userAddress, ${
      tokenSlotDump.isSolidityFormat ? 'recipientAddress' : 'approveSlot'
    }])]
);
`}
              />
            )}
            {!godmoding && callResult !== null && (
              <span style={{fontFamily: 'monospace'}}>return: {callResult}</span>
            )}
          </Paper>
        </Grid>
        <Grid item xs={1}></Grid>
      </Grid>
      <div style={{paddingBottom: '30px'}} />
    </>
  );
}

export default App;
