#!/bin/bash

#./chaincode_deploy name version_integer action
#./chaincode_deploy mycc 0 init
#name version init/upgrade
#docker exec cli1 peer chaincode install -n mycc -p github.com/chaincode -v v0
#docker exec cli1 peer chaincode instantiate -o orderer0.example.com:7050 -C mychannel -n mycc github.com/chaincode -v v0 -c '{\"Args\": [\"a\", \"100\"]}'

echo
echo "################### Initiating Chaincode Deployment ##################"

if  [ $# -eq 3 ]
then
    cc_name=$1
    cc_version=$2
    cc_action=$3

    ##chaincode install
    echo
    echo "######## Chaincode Install ###########"

    docker exec cli1 rm -rf /opt/gopath/src/github.com/chaincode
    docker exec cli2 rm -rf /opt/gopath/src/github.com/chaincode
    docker exec cli3 rm -rf /opt/gopath/src/github.com/chaincode

    docker cp chaincode cli1:/opt/gopath/src/github.com/chaincode
    docker cp chaincode cli2:/opt/gopath/src/github.com/chaincode
    docker cp chaincode cli3:/opt/gopath/src/github.com/chaincode

    docker exec cli1 peer chaincode install -n $cc_name -p github.com/chaincode -v v$cc_version
    docker exec cli2 peer chaincode install -n $cc_name -p github.com/chaincode -v v$cc_version
    docker exec cli3 peer chaincode install -n $cc_name -p github.com/chaincode -v v$cc_version

    echo
    echo "####### Chaincode Instantiate ########"
    
    if [ $cc_action = init ]
    then
        echo "### INIT ###"
        docker exec cli1 peer chaincode instantiate -o orderer0.example.com:7050 -C channel-123 -n $cc_name github.com/chaincode -v v$cc_version -c '{"Args": ["initLedger"]}'
        docker exec cli1 peer chaincode instantiate -o orderer0.example.com:7050 -C channel-1 -n $cc_name github.com/chaincode -v v$cc_version -c '{"Args": ["initLedger"]}'
        docker exec cli2 peer chaincode instantiate -o orderer1.example.com:7050 -C channel-23 -n $cc_name github.com/chaincode -v v$cc_version -c '{"Args": ["initLedger"]}'




    
    elif [ $cc_action = upgrade ]
    then
        echo "### UPGRADE ###"
        docker exec cli1 peer chaincode upgrade -o orderer0.example.com:7050 -C channel-123 -n $cc_name github.com/chaincode -v v$cc_version -c '{"Args": ["updateCC"]}'
        docker exec cli1 peer chaincode upgrade -o orderer0.example.com:7050 -C channel-1 -n $cc_name github.com/chaincode -v v$cc_version -c '{"Args": ["updateCC"]}'
        docker exec cli2 peer chaincode upgrade -o orderer1.example.com:7050 -C channel-23 -n $cc_name github.com/chaincode -v v$cc_version -c '{"Args": ["updateCC"]}'
    fi
fi