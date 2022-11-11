# Debitable - Radix
Radix implementation of <b>Debitable</b> using the [Alphanet Javascript SDK](https://docs.radixdlt.com/main/scrypto/alphanet/javascript-sdk.html).

## Pre-requisites
1. Node >= 12.17.0
2. The Alphanet wallet installed. Instructions [here](https://docs.radixdlt.com/main/scrypto/alphanet/wallet-extension.html)
3. Scrypto v0.6.0. Instructions to install [here](https://docs.radixdlt.com/main/scrypto/getting-started/install-scrypto.html) and update [here](https://docs.radixdlt.com/main/scrypto/getting-started/updating-scrypto.html)

## Building the Scrypto code
1. Enter the scrypto directory in a terminal: `cd scrypto`
1. Build the code: `scrypto build`
1. Two important files (`debitable.abi` and `debitable.wasm`) will be generated in `scrypto/target/wasm32-unknown-unknown/release/`

## Deploy the package to Alphanet
1. Go to the [package deployer website](https://alphanet-deployer.radixdlt.com/)
2. Upload both `debitable.abi` and `debitable.wasm`
3. Click on "publish package"
4. The wallet should open up and ask you to submit the transaction
5. On the wallet click on "submit"
6. The deployed package address should get displayed. **You will need it for the next step**.

## Interacting with our package
1. Open `src/index.ts` in the editor of your choice and set the value of the variable `packageAddress` to the previously obtained package address.
2. In a terminal go to the root of this project (Radix-Debitable)
3. Install the npm dependencies: `npm install`
4. Start the local server with `npm start`
5. Open up your browser at the provided URL if it doesn't open automatically.
6. Make sure that you have created an account on the wallet extension.
7. Use the Wallet Extension and Identification Address to interact with the system.
