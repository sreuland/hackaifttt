// server.js

const axios = require('axios');
const SorobanClient = require('soroban-client')
const StellarSdk = require("stellar-sdk");
const {formatInTimeZone} = require('date-fns-tz')

const NetworkConfig = {
  rpc_url: process.env.RPC_URL,
  horizon_url: process.env.HORIZON_URL,
  ifttt_webhook_url: process.env.IFTTT_WEBHOOK_URL
}

async function eventLoop() {
  console.log('IFTTT Event loop started ');
  let rpcServer
  let horizonServer
  try {
    rpcServer = new SorobanClient.Server(NetworkConfig.rpc_url, {allowHttp: true});
    horizonServer = new StellarSdk.Server(NetworkConfig.horizon_url, {allowHttp: true});
  } catch (error) {
    console.log('init error ');
    console.log(error);
    return
  }

  /*

   requires contract event data model:
   topics: ["ifttt_evt", "gdoc"]
   value: rust 'Bytes' - requested text line converted to utf8 byte array

  */

  let horizonLatestLedger = await horizonServer.ledgers().limit(1).order("desc").call();
  let latestLedger = horizonLatestLedger.records.length > 0 ? horizonLatestLedger.records[0].sequence : 0;
  let pagingToken = null;
  while (true) {
    try {
      console.log('getting events for ledger range ' + latestLedger + ' - ' + (latestLedger + 10));
      let events = await rpcServer
          .getEvents(latestLedger, latestLedger + 10, [
             {
              topics: [["aWZ0dHRfZXZlbnQK", "Z2RvYwo="]],
              type: "contract"
             } 
           ],
           pagingToken,
           10);

      for (evt in events) {
          console.log('processing contract event ' + evt.id);
          latestLedger = evt.ledger
          pagingToken = evt.pagingToken
          let parsedLine = SorobanClient.xdr.SCVal.fromXDR(evt.value.xdr, format='base64').obj().bin().toString('utf8');
          let jsonPayload = { "value1" : parsedLine}
          let resp = await axios.post(NetworkConfig.ifttt_webhook_url, jsonPayload);
          console.log('successfully pushed ifttt webhook request for line ' + parsedLine);
      }
    } catch (err) {
        console.log('http services error, will retry from ledger ' + latestLedger);
        console.log(err);
    } finally {
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

eventLoop();

