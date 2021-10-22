const FabricCAServices = require('fabric-ca-client');
const {FileSystemWallet, Gateway, X509WalletMixin} = require('fabric-network');
const fs = require('fs');
const path = require('path');

var express = require('express');
var bodyParser = require('body-parser');

var appOrg1 = express();
var appOrg2 = express();
var appOrg3 = express();

appOrg1.use(bodyParser.json());
appOrg2.use(bodyParser.json());
appOrg3.use(bodyParser.json());

const envPath = path.resolve(__dirname, 'env.json');
const envJSON = fs.readFileSync(envPath, 'utf8');
const env = JSON.parse(envJSON);

const org1ConnectionPath = path.resolve(__dirname, env['org1']['connectionFile']);
const org1ConnectionJSON = fs.readFileSync(org1ConnectionPath, 'utf8');
const org1Connection = JSON.parse(org1ConnectionJSON);

const org2ConnectionPath = path.resolve(__dirname, env['org2']['connectionFile']);
const org2ConnectionJSON = fs.readFileSync(org2ConnectionPath, 'utf8');
const org2Connection = JSON.parse(org2ConnectionJSON);

const org3ConnectionPath = path.resolve(__dirname, env['org3']['connectionFile']);
const org3ConnectionJSON = fs.readFileSync(org3ConnectionPath, 'utf8');
const org3Connection = JSON.parse(org3ConnectionJSON);


const FabricClient = require('./fabricClient');
const {addAffiliationCA} = require("./fabricClient");

appOrg1.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

appOrg2.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

appOrg3.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
/////// TEST ///////////////////

appOrg1.get('/test', async function (req, res) {
    console.log(req.body)

    res.json(req.body);

    return res;
});

appOrg2.get('/test', async function (req, res) {
    console.log(req.body)

    res.json(req.body);

    return res;
});

appOrg3.get('/test', async function (req, res) {
    console.log(req.body)

    res.json(req.body);

    return res;
});


/////// enroll admin ////

appOrg1.post('/enrollAdmin', async function (req, res) {
    let result = await enrollAdminOrg("org1")
    res.json(result);
    return res;
});

appOrg2.post('/enrollAdmin', async function (req, res) {
    let result = await enrollAdminOrg("org2")
    res.json(result);
    return res;
});

appOrg3.post('/enrollAdmin', async function (req, res) {
    let result = await enrollAdminOrg("org3")
    res.json(result);
    return res;
});

async function enrollAdminOrg(org) {
    let orgConnection = await getOrgConnection(org)

    let caUrl = orgConnection.certificateAuthorities[env[org].caUrl].url
    let walletPathStr = env[org].walletPath
    let adminUserName = env[org].adminUserName
    let adminSecret = env[org].adminSecret
    let mspId = env[org].mspId

    return await FabricClient.enrollAdmin(FabricCAServices,
        FileSystemWallet,
        X509WalletMixin,
        path,
        caUrl,
        walletPathStr,
        adminUserName,
        adminSecret,
        mspId);
}


////// register user //////////
appOrg1.post('/registerUser', async function (req, res) {
    let registerUserReq = req.body;
    let result = false
    if (!isEmpty(registerUserReq["username"])) {
        result = await registerUserOrg("org1", registerUserReq["username"])
    }

    res.json(result);
    return res;
});


appOrg2.post('/registerUser', async function (req, res) {
    let registerUserReq = req.body;
    let result = false
    if (!isEmpty(registerUserReq["username"])) {
        result = await registerUserOrg("org2", registerUserReq["username"])
    }

    res.json(result);
    return res;
});


appOrg3.post('/registerUser', async function (req, res) {
    let registerUserReq = req.body;
    let result = false
    if (!isEmpty(registerUserReq["username"])) {
        result = await registerUserOrg("org3", registerUserReq["username"])
    }

    res.json(result);
    return res;
});


async function registerUserOrg(org, userName) {
    let orgConnection = await getOrgConnection(org)

    let caUrl = orgConnection.certificateAuthorities[env[org].caUrl].url
    let walletPathStr = env[org].walletPath
    let adminUserName = env[org].adminUserName
    let mspId = env[org].mspId
    let departmentName = env[org].departmentName

    return await FabricClient.registerUser(FileSystemWallet,
        X509WalletMixin,
        path,
        Gateway,
        orgConnection,
        caUrl,
        walletPathStr,
        adminUserName,
        mspId,
        userName,
        departmentName);
}


//// add affiliation /////
appOrg1.post('/addAffiliation', async function (req, res) {
    let addAffiliationReq = req.body;
    let result = false
    if (!isEmpty(addAffiliationReq["department"])) {
        result = await addAffiliationOrg("org1", addAffiliationReq["department"])
    }

    res.json(result);
    return res;
});

appOrg2.post('/addAffiliation', async function (req, res) {
    let addAffiliationReq = req.body;
    let result = false
    if (!isEmpty(addAffiliationReq["department"])) {
        result = await addAffiliationOrg("org2", addAffiliationReq["department"])
    }

    res.json(result);
    return res;
});

appOrg3.post('/addAffiliation', async function (req, res) {
    let addAffiliationReq = req.body;
    let result = false
    if (!isEmpty(addAffiliationReq["department"])) {
        result = await addAffiliationOrg("org3", addAffiliationReq["department"])
    }

    res.json(result);
    return res;
});


async function addAffiliationOrg(org, department) {

    let orgConnection = await getOrgConnection(org)

    let walletPathStr = env[org].walletPath
    let adminUserName = env[org].adminUserName
    let adminSecret = env[org].adminSecret


    return await FabricClient.addAffiliationCA(FileSystemWallet,
        path,
        orgConnection,
        walletPathStr,
        adminUserName,
        adminSecret,
        org,
        department
    );
}


// /////// MEDMAN ///////////////////
//
// appOrg1.get('/registered-product-list', async function (req, res) {
//
//     const contract = await getContract("medman", "all");
//
//
//     var products = await contract.evaluateTransaction('queryAllProducts');
//
//     res.json(JSON.parse(products.toString()));
//
//     return res;
// });
//
// appOrg1.get('/invoice-list', async function (req, res) {
//
//     var invoices;
//
//     channels = env["medman"].channels;
//     for (var channel in channels) {
//         if (channel != 'all') {
//             const contract = await getContract("medman", channel);
//             var invoiceTemp = await contract.evaluateTransaction('queryAllInvoices');
//
//             if (invoices != null) {
//                 invoices = invoices.concat(JSON.parse(invoiceTemp.toString()));
//             } else {
//                 invoices = JSON.parse(invoiceTemp.toString());
//             }
//         }
//     }
//
//     res.json(invoices);
//
//     return res;
// });
//
// appOrg1.post('/sell-transaction', async function (req, res) {
//
//     var invoiceReq = req.body;
//     var buyerMspId;
//     console.log(invoiceReq);
//
//     const contract = await getContract("medman", "all");
//
//     var userMspIdsBytes = await contract.evaluateTransaction('queryAllUsers');
//
//     var userMspIds = JSON.parse(userMspIdsBytes.toString());
//     for (var userKeys in userMspIds) {
//         record = userMspIds[userKeys]["Record"];
//         if (record['id'] === invoiceReq["buyer_id"]) {
//             buyerMspId = record['msp_id'];
//         } else if (record['msp_id'] === env["medman"].mspId) {
//             invoiceReq["seller_id"] = record['id']
//         }
//
//         if (invoiceReq["seller_id"] != null && buyerMspId != null) {
//             break;
//         }
//     }
//
//     const contract2 = await getContract("medman", "all");
//
//     var invoiceAsBytes = await contract2.evaluateTransaction('queryCalculateVatofInvoice', JSON.stringify(invoiceReq));
//
//     var channelXY = getInterOrgChannelName(env["medman"].mspId, buyerMspId)
//     const contractXY = await getContract("medman", channelXY);
//
//     var invoiceIDAsBytes = await contractXY.submitTransaction('sellTransaction', invoiceAsBytes.toString());
//
//     var invoice = JSON.parse(invoiceAsBytes.toString());
//     invoice["id"] = invoiceIDAsBytes.toString();
//
//     res.json(invoice);
//
//     return res;
// });
//
//
// /////// MEDDIS ///////////////////
//
// appOrg2.get('/registered-product-list', async function (req, res) {
//
//     const contract = await getContract("meddis", "all");
//
//     var products = await contract.evaluateTransaction('queryAllProducts');
//
//     res.json(JSON.parse(products.toString()));
//
//     return res;
// });
//
// appOrg2.get('/invoice-list', async function (req, res) {
//
//     var invoices;
//
//     channels = env["meddis"].channels;
//     for (var channel in channels) {
//         if (channel != 'all') {
//             const contract = await getContract("meddis", channel);
//             var invoiceTemp = await contract.evaluateTransaction('queryAllInvoices');
//
//             if (invoices != null) {
//                 invoices = invoices.concat(JSON.parse(invoiceTemp.toString()));
//             } else {
//                 invoices = JSON.parse(invoiceTemp.toString());
//             }
//         }
//     }
//
//     res.json(invoices);
//
//     return res;
// });
//
// appOrg2.post('/sell-transaction', async function (req, res) {
//
//     try {
//         var invoiceReq = req.body;
//         var buyerMspId;
//
//         const contract = await getContract("meddis", "all");
//
//         var userMspIdsBytes = await contract.evaluateTransaction('queryAllUsers');
//
//         var userMspIds = JSON.parse(userMspIdsBytes.toString());
//         for (var userKeys in userMspIds) {
//             record = userMspIds[userKeys]["Record"];
//             if (record['id'] === invoiceReq["buyer_id"]) {
//                 buyerMspId = record['msp_id'];
//             } else if (record['msp_id'] === env["meddis"].mspId) {
//                 invoiceReq["seller_id"] = record['id']
//             }
//
//             if (invoiceReq["seller_id"] != null && buyerMspId != null) {
//                 break;
//             }
//         }
//
//         const contract2 = await getContract("meddis", "all");
//
//         var invoiceAsBytes = await contract2.evaluateTransaction('queryCalculateVatofInvoice', JSON.stringify(invoiceReq));
//
//         var channelXY = getInterOrgChannelName(env["meddis"].mspId, buyerMspId)
//         const contractXY = await getContract("meddis", channelXY);
//
//         var invoiceIDAsBytes = await contractXY.submitTransaction('sellTransaction', invoiceAsBytes.toString());
//
//         var invoice = JSON.parse(invoiceAsBytes.toString());
//         invoice["id"] = invoiceIDAsBytes.toString();
//
//         res.json(invoice);
//
//         return res;
//     } catch (error) {
//         console.log(error)
//     }
//
//     res.json("");
//
//     return res;
// });
//
// appOrg2.post('/confirm-invoice', async function (req, res) {
//
//     try {
//         var invoiceId = req.body["id"].toString();
//
//         var tempSplit = invoiceId.split('-')
//         var channelXY = tempSplit[1] + '-' + tempSplit[2]
//
//         const contractXY = await getContract("meddis", channelXY);
//
//         var invoiceAsBytes = await contractXY.submitTransaction('confirmInvoice', invoiceId);
//
//         var invoice = JSON.parse(invoiceAsBytes.toString());
//         invoice["id"] = invoiceId;
//
//         res.json(invoice);
//
//         return res;
//     } catch (error) {
//         console.log(error)
//     }
//
//     res.json("");
//
//     return res;
// });
//
//
// /////// MEDSHOP ///////////////////
//
// appOrg3.get('/registered-product-list', async function (req, res) {
//
//     const contract = await getContract("medshop", "all");
//
//
//     var products = await contract.evaluateTransaction('queryAllProducts');
//
//     res.json(JSON.parse(products.toString()));
//
//     return res;
// });
//
// appOrg3.get('/invoice-list', async function (req, res) {
//
//     var invoices;
//
//     channels = env["medshop"].channels;
//     for (var channel in channels) {
//         if (channel != 'all') {
//             const contract = await getContract("medshop", channel);
//             var invoiceTemp = await contract.evaluateTransaction('queryAllInvoices');
//
//             if (invoices != null) {
//                 invoices = invoices.concat(JSON.parse(invoiceTemp.toString()));
//             } else {
//                 invoices = JSON.parse(invoiceTemp.toString());
//             }
//         }
//     }
//
//     res.json(invoices);
//
//     return res;
// });
// /*
// appOrg3.post('/sell-transaction', async function (req, res) {
//
//     try {
//         var invoiceReq = req.body;
//         var buyerMspId;
//
//         const contract = await getContract("medshop", "all");
//
//         var userMspIdsBytes = await contract.evaluateTransaction('queryAllUsers');
//
//         var userMspIds = JSON.parse(userMspIdsBytes.toString());
//         for (var userKeys in userMspIds) {
//             record = userMspIds[userKeys]["Record"];
//             if (record['id'] === invoiceReq["buyer_id"]) {
//                 buyerMspId = record['msp_id'];
//             }
//             else if( record['msp_id'] === env["medshop"].mspId){
//                 invoiceReq["seller_id"] = record['id']
//             }
//
//             if(invoiceReq["seller_id"] != null && buyerMspId != null ){
//                 break;
//             }
//         }
//
//         const contract2 = await getContract("medshop", "all");
//
//         var invoiceAsBytes = await contract2.evaluateTransaction('queryCalculateVatofInvoice', JSON.stringify(invoiceReq));
//
//         var channelXY = getInterOrgChannelName(env["medshop"].mspId, buyerMspId)
//         const contractXY = await getContract("medshop", channelXY);
//
//         var invoiceIDAsBytes = await contractXY.submitTransaction('sellTransaction', invoiceAsBytes.toString());
//
//         var invoice = JSON.parse(invoiceAsBytes.toString());
//         invoice["id"] = invoiceIDAsBytes.toString();
//
//         res.json(invoice);
//
//         return res;
//     }
//     catch (error) {
//         console.log(error)
//     }
//
//     res.json("");
//
//     return res;
// });
// */
//
// // consumer-sell-transaction
// appOrg3.post('/sell-transaction', async function (req, res) {
//
//     try {
//         var invoiceReq = req.body;
//
//         const contract = await getContract("medshop", "all");
//
//         var userMspIdsBytes = await contract.evaluateTransaction('queryAllUsers');
//
//         var userMspIds = JSON.parse(userMspIdsBytes.toString());
//         for (var userKeys in userMspIds) {
//             record = userMspIds[userKeys]["Record"];
//
//             if (record['msp_id'] === env["medshop"].mspId) {
//                 invoiceReq["seller_id"] = record['id'];
//                 break;
//             }
//         }
//
//         const contract2 = await getContract("medshop", "all");
//
//         var invoiceAsBytes = await contract2.evaluateTransaction('queryCalculateVatofInvoice', JSON.stringify(invoiceReq));
//
//         var channelXY = getInterOrgChannelName(env["medshop"].mspId, env["nbr"].mspId)
//         const contractXY = await getContract("medshop", channelXY);
//
//         var invoiceIDAsBytes = await contractXY.submitTransaction('sellTransaction', invoiceAsBytes.toString());
//
//         var invoice = JSON.parse(invoiceAsBytes.toString());
//         invoice["id"] = invoiceIDAsBytes.toString();
//
//
//         /// TODO have to run it from nbr
//         sendVATreciept(invoice)
//         invoice["buyer_approved"] = true;
//         ////
//
//
//         res.json(invoice);
//         return res;
//     } catch (error) {
//         console.log(error)
//     }
//
//     res.json("");
//
//     return res;
// });
//
// appOrg3.post('/confirm-invoice', async function (req, res) {
//
//     try {
//         var invoiceId = req.body["id"].toString();
//
//         var tempSplit = invoiceId.split('-')
//         var channelXY = tempSplit[1] + '-' + tempSplit[2]
//
//         const contractXY = await getContract("medshop", channelXY);
//
//         var invoiceAsBytes = await contractXY.submitTransaction('confirmInvoice', invoiceId);
//
//         var invoice = JSON.parse(invoiceAsBytes.toString());
//         invoice["id"] = invoiceId;
//
//         res.json(invoice);
//
//         return res;
//     } catch (error) {
//         console.log(error)
//     }
//
//     res.json("");
//
//     return res;
// });


/////// functions
function isEmpty(str) {
    return (!str || str.length === 0);
}

async function getOrgConnection(org) {
    let orgConnectionPath = path.resolve(__dirname, env[org]['connectionFile']);
    let orgConnectionJSON = fs.readFileSync(orgConnectionPath, 'utf8');
    return JSON.parse(orgConnectionJSON)
}

async function getContract(org, channel) {
    try {

        const ccpPath = path.resolve(__dirname, env[org].connectionFile);
        const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
        const ccp = JSON.parse(ccpJSON);


        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), env[org].walletPath);
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(env[org].adminUserName);
        if (!userExists) {
            console.log(`An identity for the user "${env[org].adminUserName}" does not exist in the wallet`);
            console.log('Run the registerUser.js application before retrying'); //TODO:Check this line
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet, identity: env[org].adminUserName,
            discovery: {enabled: false}
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(env[org].channels[channel]);

        // Get the contract from the network.
        return network.getContract(env[org].contractName);
        // // Evaluate the specified transaction.
        // // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        // // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')

        // //const result = await contract.evaluateTransaction('queryAllInvoices');
        // const result = await contract.evaluateTransaction('test');
        // //const result = await contract.evaluateTransaction('queryUserPubKey', 'test_zxcuser_0@becbuster.com');
        // console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        // return result;

    } catch (error) {
        console.error(`Failed to create contract: ${error}`);
        return null;
    }
}

appOrg1.listen(3001, "0.0.0.0");
console.log('quarks api org1 running in port 3001');

appOrg2.listen(3002, "0.0.0.0");
console.log('quarks api org2 running in port 3002');

appOrg3.listen(3003, "0.0.0.0");
console.log('quarks api org3 running in port 3003');

