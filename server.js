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
   topics: [ScVal(ScSymbol("ifttt_evt")), ScVal(ScSymbol("gdoc"))]
   value: rust 'Bytes' - requested text line converted to utf8 byte array

  */
 
  
  let latestLedger = await getLatestLedger(horizonServer); 
  while (latestLedger < 5) {
    console.log('waiting for network to be at least 5 ledgers old, currently is at ' + latestLedger);
    await new Promise(r => setTimeout(r, 3000));
    latestLedger = await getLatestLedger(horizonServer)
  }

  let pagingToken = null;
  let endLedger = latestLedger
  let startLedger = latestLedger - 4
  while (true) {
    try {
      console.log('getting events for ledger range ' + startLedger + ' - ' + endLedger);
      let events = await rpcServer
          .getEvents(startLedger, endLedger, [
             {
              // base64 encoded topic ScVal's
              topics: [["AAAABQAAAAlpZnR0dF9ldnQAAAA=", "AAAABQAAAARnZG9j"]],
              type: "contract"
             } 
           ],
           pagingToken,
           10);

      startLedger = endLedger;
      pagingToken = null
      if (events != null) {
        console.log("found " + events.length + " ifttt contract events")
        for (const evt of events) {
            console.log("processing contract event %j",evt.id);
            startLedger = Number(evt.ledger);
            pagingToken = evt.pagingToken
            let parsedLine = SorobanClient.xdr.ScVal.fromXDR(input=evt.value.xdr, format='base64').obj().bin().toString('utf8');
            let jsonPayload = { "value1" : parsedLine}
            let resp = await axios.post(NetworkConfig.ifttt_webhook_url, jsonPayload);
            console.log('successfully pushed ifttt webhook request for event line ' + parsedLine);
        }
      }

    } catch (err) {
        console.log('http services error, will retry from ledger ' + latestLedger);
        console.log(err);
    } finally {
      await new Promise(r => setTimeout(r, 7000));
      endLedger = await getLatestLedger(horizonServer);
      if (! endLedger > startLedger) {
        startLedger = endLedger-1;
      }
    }
  }
}

async function getLatestLedger(horizonServer) {
  try {
     let horizonLatestLedger = await horizonServer.ledgers().limit(1).order("desc").call();
     return horizonLatestLedger.records.length > 0 ? horizonLatestLedger.records[0].sequence : 0;
   } catch (error) {
     return 0;
   }

}

eventLoop();

