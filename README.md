# EVMBridge-validator

The EVMBridge-validator is a simple implementation of the validator for the related projects [EVMBridge Client](https://github.com/joYyHack/EVMBridge-client) and [EVMBridge Contract](https://github.com/joYyHack/EVMBridge). It provides a backend service to sign messages required for withdrawing or releasing tokens on the EVMBridge Contract.
 
Initially, the validator logic was implemented on the front-end side. However, to avoid exposing the private key of the validator at the moment of signing messages, the logic was moved to a separate repository.


## How it works
When a user initiates the withdrawal or release process on the EVMBridge Client, the client makes an HTTP call to the validator to get a signature. The validator then generates a structure of withdrawal request with valid values. Then created structure is signed using EIP712 and the signature is returned to the client, allowing the user to proceed with the transaction. The signature then will be verified in the Validator contract of the [EVMBridge Contract](https://github.com/joYyHack/EVMBridge) project.

## .ENV File
In order to run validator the .env file must be specified with the followed structure
```bash
PORT="port"
VALIDATOR_PRIV_KEY="priv-key"
VALIDATOR_PUB_KEY="pub-key"
ALCHEMY_SEPOLIA_API_KEY="api-key"
ALCHEMY_MUMBAI_API_KEY="api-key"
```

## Instalation
```bash
git clone https://github.com/joYyHack/EVMBridge-validator.git
npm install
npm run build
npm run start
```
