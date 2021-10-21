/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const org = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'org.json'), 'utf8')).name;

const envPath = path.resolve(__dirname, 'env.json');
const envJSON = fs.readFileSync(envPath, 'utf8');
const env = JSON.parse(envJSON);


const ccpPath = path.resolve(__dirname, env[org].connectionFile);
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

async function getContract(){

    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), env[org].walletPath);
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the admin user.
        const adminExists = await wallet.exists(env[org].adminUserName);
        if (adminExists) {
            console.log(`An identity for the admin user ${env[org].adminUserName} already exists in the wallet`);
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: env[org].adminUserName , discovery: { enabled: false } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(env[org].channelName);

        // Get the contract from the network.
        const contract = network.getContract(env[org].contractName);

        return contract;

    }
    catch (error) {
        console.error(`Failed to create contract: ${error}`);
        return null;
    }


}


async function createUser(userEntry) {
    try {

        const contract = await getContract();

        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR10', 'Dave')
        
        //await contract.submitTransaction('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom');
        await contract.submitTransaction('createUser', userEntry['name'],userEntry['email'],userEntry['role'],userEntry['dept'],userEntry['password']); //as per chaincode
        
        console.log('Transaction has been submitted');
        return userEntry

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        return 'Failed to submit transaction: ' + error;
        //process.exit(1);
    }
}

async function initLedger() {
    try {

        const contract = await getContract();

        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR10', 'Dave')
        
        //await contract.submitTransaction('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom');
        await contract.submitTransaction('initLedger');
        
        console.log('Transaction has been submitted');

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
    }
}


module.exports.createUser = createUser;
module.exports.initLedger = initLedger;


//var text = '{"name": "Shihab","email": "shihab@gmail.com","role": "student","password": "shihab1234","dept": "CSE"}';
// /var obj = JSON.parse(text)

//createUser(obj);

//initLedger();
