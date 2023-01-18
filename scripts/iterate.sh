#!/bin/bash
set -x
while read line; do
    lineargs=$(go run ./scripts "$line")
    soroban invoke --id $(cat contract-id.txt) --secret-key $(cat seckey) --rpc-url http://localhost:8000/soroban/rpc --network-passphrase 'Test SDF Future Network ; October 2022' --fn publish --arg ${lineargs:0}
    if [ "$?" != "0" ]; then
        exit 1
    fi
done <./poems/10-words.txt
