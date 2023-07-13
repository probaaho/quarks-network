#!/bin/bash

#./chaincode_deploy name version_integer action
#./chaincode_deploy mycc 0 init
#name version init/upgrade
#docker exec cli1 peer chaincode install -n mycc -p github.com/chaincode -v v0
#docker exec cli1 peer chaincode instantiate -o orderer0.example.com:7050 -C mychannel -n mycc github.com/chaincode -v v0 -c '{\"Args\": [\"a\", \"100\"]}'


servers=("one.quarks.com" "two.quarks.com" "three.quarks.com" "four.quarks.com")

quarks_one_ip=one.quarks.com
quarks_two_ip=two.quarks.com
quarks_three_ip=three.quarks.com
quarks_four_ip=four.quarks.com

pem_key="${PWD}/pem/quarks-pk.pem"
vm_user=shuhan

project_path=~/quarks-network/node-poc
project_docker_path=~/quarks-network/node-poc/deployment
project_chaincode_path=/home/quarks/quarks-network/node-poc/chaincode

ssh_cmd="ssh -o StrictHostKeyChecking=no -i ${pem_key}"
ssh_quarks_one="${ssh_cmd} ${vm_user}@${quarks_one_ip}"
ssh_quarks_two="${ssh_cmd} ${vm_user}@${quarks_two_ip}"
ssh_quarks_three="${ssh_cmd} ${vm_user}@${quarks_three_ip}"
ssh_quarks_four="${ssh_cmd} ${vm_user}@${quarks_four_ip}"
scp_cmd='scp -o StrictHostKeyChecking=no'


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

    $ssh_quarks_one 'docker exec cli1 rm -rf /opt/gopath/src/github.com/chaincode && cd ~/quarks-network/node-poc && docker cp chaincode cli1:/opt/gopath/src/github.com/chaincode' 

    $ssh_quarks_one "docker exec cli1 peer chaincode install -n ${cc_name} -p github.com/chaincode -v v${cc_version}"
    $ssh_quarks_one "docker exec -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp -e CORE_PEER_ADDRESS=peer0.org2.example.com:7051 -e CORE_PEER_LOCALMSPID="Org2MSP" -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt cli1 peer chaincode install -n ${cc_name} -p github.com/chaincode -v v${cc_version}"
    $ssh_quarks_one "docker exec -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp -e CORE_PEER_ADDRESS=peer0.org3.example.com:7051 -e CORE_PEER_LOCALMSPID="Org3MSP" -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt cli1 peer chaincode install -n ${cc_name} -p github.com/chaincode -v v${cc_version}"
    $ssh_quarks_one "docker exec -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org4.example.com/users/Admin@org4.example.com/msp -e CORE_PEER_ADDRESS=peer0.org4.example.com:7051 -e CORE_PEER_LOCALMSPID="Org4MSP" -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org4.example.com/peers/peer0.org4.example.com/tls/ca.crt cli1 peer chaincode install -n ${cc_name} -p github.com/chaincode -v v${cc_version}"

    echo
    echo "####### Chaincode Instantiate ########"
    
    if [ $cc_action = init ]
    then
        echo "### INIT ###"
        $ssh_quarks_one "docker exec cli1 peer chaincode instantiate -o orderer0.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C channel-1234 -n $cc_name -v v$cc_version -c '{\"Args\": [\"initLedger\"]}'"
        $ssh_quarks_one "docker exec cli1 peer chaincode instantiate -o orderer0.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C channel-123 -n $cc_name -v v$cc_version -c '{\"Args\": [\"initLedger\"]}'"
        $ssh_quarks_one "docker exec cli1 peer chaincode instantiate -o orderer0.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C channel-12 -n $cc_name -v v$cc_version -c '{\"Args\": [\"initLedger\"]}'"
        $ssh_quarks_one "docker exec cli1 peer chaincode instantiate -o orderer0.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C channel-1 -n $cc_name -v v$cc_version -c '{\"Args\": [\"initLedger\"]}'"

    
    elif [ $cc_action = upgrade ]
    then
        echo "### UPGRADE ###"
        # $ssh_quarks_one "docker exec cli1 peer chaincode upgrade -o orderer0.example.com:7050 -C channel-123 -n $cc_name github.com/chaincode -v v$cc_version -c '{\"Args\": [\"updateCC\"]}'"
        # $ssh_quarks_one "docker exec cli1 peer chaincode upgrade -o orderer0.example.com:7050 -C channel-1 -n $cc_name github.com/chaincode -v v$cc_version -c '{\"Args\": [\"updateCC\"]}'"
        # $ssh_quarks_two "docker exec cli2 peer chaincode upgrade -o orderer1.example.com:7050 -C channel-23 -n $cc_name github.com/chaincode -v v$cc_version -c '{\"Args\": [\"updateCC\"]}'"
    fi
fi