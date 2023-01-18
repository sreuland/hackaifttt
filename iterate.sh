#!/bin/bash

while read line; do
    lineargs=$(echo -n "$line" | jq -cRs 'split(" ")')
    cmd="${@:1} ${lineargs:0}"
    ${cmd}
done <10-words.txt
