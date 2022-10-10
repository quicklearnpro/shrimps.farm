import {useState} from 'react';
import {Avatar, CardHeader, Link, Grid, Paper, TextField, Typography, Button} from '@mui/material';
import {useNavigate} from 'react-router-dom';

import logo from './logo.png';

function App() {
  const [invalidHash, setInvalidHash] = useState(false);
  const [txHash, setTxHash] = useState('');

  const navigate = useNavigate();

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
      {/* 
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
      </Grid> */}
      <div style={{paddingBottom: '30px'}} />
    </>
  );
}

export default App;
