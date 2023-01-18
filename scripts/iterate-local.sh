#!/bin/bash
#set -x
while read line; do
    lineargs=$(go run ./scripts "$line")
    soroban invoke --wasm contract/target/wasm32-unknown-unknown/release/ifttt_project.wasm --id 1 --fn publish --arg ${lineargs:0}
    if [ "$?" != "0" ]; then
        exit 1
    fi
done <./poems/10-words.txt
