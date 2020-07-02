# idetix-utils

npm package for interacting with the idetix protocol.

## Installation

Use the follwoing command to add this package to your project:

```bash
npm install -s idetix-utils
```

## Utils

**Convert IPFS hashes from/to its components**

Check out the [link](https://ipfs-sec.stackexchange.cloudflare-ipfs.com/ethereum/A/question/17094.html) for IPFS hash conversion.

Also see detail [gas cost analysis](https://github.com/bc-ticketing/ipfs-multihash-analysis) of different types of different ways to store IPFS hashes in solidity.

**Smart contract constants**

`fungibleBaseId`: The first fungible ticket type that is created will have this id. This is due to the encoding: `1<<128 = 1000...000`

`nonFungibleBaseId`: The first non-fungible ticket type that is created will have this id. This is due to the encoding: `(1<<128 | TYPE_NF_BIT)` where `TYPE_NF_BIT=1<<256`.

> Note: `uint256` from solidity are too large for Javascript. Thus, we use [bignumber.js](https://github.com/MikeMcl/bignumber.js/).
