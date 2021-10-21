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


async function testInvoke(){
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

async function testQuery(){
    try {

        const contract = await getContract();

        // Evaluate the specified transaction.
        // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
        const result = await contract.evaluateTransaction('queryUser','rup@gmail.com0');
        //const result = await contract.evaluateTransaction('queryAllUsers');

        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        return result;

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}

//testInvoke()
testQuery()
