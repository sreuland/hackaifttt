// server.js

const axios = require('axios');
const SorobanClient = require('soroban-client')

const NetworkConfig = {
  rpc_url: process.env.RPC_URL,
  ifttt_webhook_url: process.env.IFTTT_WEBHOOK_URL
}

async function eventLoop() {
  console.log('IFTTT Event loop started ');
  let rpcServer
  try {
    rpcServer = new SorobanClient.Server(NetworkConfig.rpc_url, {allowHttp: true});
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

  let latestLedger = 0;
  let pagingToken = null;
  while (true) {
    try {
      console.log('getting events for ledger range ' + latestLedger + ' - ' + (latestLedger + 10));
      let events = await rpcServer
          .getEvents(latestLedger, latestLedger + 10, [
             {
              // 2 topics on event, "ifttt_evt" , "gdoc"
              topics: [["aWZ0dHRfZXZlbnQK", "Z2RvYwo="]],
              type: "contract"
             } 
           ],
           pagingToken,
           10);

      for (evt in events) {
          console.log('processing contract event ' + evt.id);
          //TODO
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


