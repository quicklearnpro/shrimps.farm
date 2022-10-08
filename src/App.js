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
    </>
  );
}

export default App;
