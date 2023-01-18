#!/bin/bash
#set -x
while read line; do
    lineargs=$(echo -n "$line" | jq -cRs 'split(" ")')
    soroban invoke --id $(cat contract-id.txt) --secret-key $(cat seckey) --rpc-url http://localhost:8000/soroban/rpc --network-passphrase 'Test SDF Future Network ; October 2022' --fn publish --arg ${lineargs:0}
    if [ "$?" != "0" ]; then
        exit 1
    fi
done <10-words.txt
