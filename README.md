# EVMBridge-validator

The EVMBridge-validator is a simple implementation of the validator for the related projects [EVMBridge Client](https://github.com/joYyHack/EVMBridge-client) and [EVMBridge Contract](https://github.com/joYyHack/EVMBridge). It provides a backend service to sign messages required for withdrawing or releasing tokens on the EVMBridge Contract.
 
Initially, the validator logic was implemented on the front-end side. However, to avoid exposing the private key of the validator at the moment of signing messages, the logic was moved to a separate repository.


## How it works
When a user initiates the withdrawal or release process on the EVMBridge Client, the client makes an HTTP call to the validator to get a signature. The validator then generates a signature using EIP712 and returns it to the client, allowing the user to proceed with the transaction.
