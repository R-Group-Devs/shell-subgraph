#!/bin/bash

echo "LFG" \
  && NETWORK=goerli yarn prepare && yarn codegen && NETWORK=goerli yarn deploy \
  && NETWORK=mainnet yarn prepare && yarn codegen && NETWORK=mainnet yarn deploy \
  && NETWORK=matic yarn prepare && yarn codegen && NETWORK=matic yarn deploy \
  && NETWORK=mumbai yarn prepare && yarn codegen && NETWORK=mumbai yarn deploy \
  && NETWORK=rinkeby yarn prepare && yarn codegen && NETWORK=rinkeby yarn deploy \
  && rm subgraph.yaml
