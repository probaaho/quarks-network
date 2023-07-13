#!/bin/bash

servers=("one.quarks.com" "two.quarks.com" "three.quarks.com")

quarks_one_ip=one.quarks.com
quarks_two_ip=two.quarks.com
quarks_three_ip=three.quarks.com
quarks_four_ip=four.quarks.com

pem_key="${PWD}/pem/quarks-pk.pem"
vm_user=shuhan

project_path=~/quarks-network/node-poc
project_docker_path=~/quarks-network/node-poc/deployment

ssh_cmd="ssh -o StrictHostKeyChecking=no -i ${pem_key}"
ssh_quarks_one="${ssh_cmd} ${vm_user}@${quarks_one_ip}"
ssh_quarks_two="${ssh_cmd} ${vm_user}@${quarks_two_ip}"
ssh_quarks_three="${ssh_cmd} ${vm_user}@${quarks_three_ip}"
ssh_quarks_four="${ssh_cmd} ${vm_user}@${quarks_four_ip}"
scp_cmd='scp -o StrictHostKeyChecking=no'

run_command_on_server() {
  local server="$1"
  local command="$2"
  ssh -o StrictHostKeyChecking=no -i "$pem_key" "$vm_user@$server" "$command"
}

run_in_all_servers() {
  local command="$1"
  # Check if the command is provided
  if [ -z "$command" ]; then
    echo "Please provide a command to execute."
    exit 1
  fi

  # Run the command on servers in parallel
  for server in "${servers[@]}"; do
    run_command_on_server "$server" "$command" &
  done
  wait
}

# Function to start a new Terminal window and run a command
run_in_new_terminal() {
  local command="$1"
  /usr/bin/env osascript -e "tell app \"Terminal\" to do script \"$command\""
}

destroy_network() {
  echo '################## Docker kill and rm ##############################################'

  run_in_all_servers 'docker rm -f $(docker ps -a -q) && docker volume rm $(docker volume ls -q) && docker rmi $(docker images net-peer* -q)'

}

sync_project() {
  echo '################## Sync Git ##############################################'
  
  run_in_all_servers 'cd ~/quarks-network/ && git pull --rebase'
}

destroy_network
sync_project


echo "################## Node Initiation in org1 org2 org3 org4 ####################################"

run_in_new_terminal "$ssh_quarks_one 'cd ~/quarks-network/node-poc/deployment && docker-compose -f docker-compose-org1.yml up'"
run_in_new_terminal "$ssh_quarks_two 'cd ~/quarks-network/node-poc/deployment && docker-compose -f docker-compose-org2.yml up'"
run_in_new_terminal "$ssh_quarks_three 'cd ~/quarks-network/node-poc/deployment && docker-compose -f docker-compose-org3.yml up'"
run_in_new_terminal "$ssh_quarks_four 'cd ~/quarks-network/node-poc/deployment && docker-compose -f docker-compose-org4.yml up'"


echo '################## CLI Initiation #####################################'
$ssh_quarks_one 'cd ~/quarks-network/node-poc/deployment && docker-compose -f docker-compose-org1cli.yml up -d'
$ssh_quarks_two 'cd ~/quarks-network/node-poc/deployment && docker-compose -f docker-compose-org2cli.yml up -d'
$ssh_quarks_three 'cd ~/quarks-network/node-poc/deployment && docker-compose -f docker-compose-org3cli.yml up -d'
$ssh_quarks_four 'cd ~/quarks-network/node-poc/deployment && docker-compose -f docker-compose-org4cli.yml up -d'

echo "DONE"
sleep 10000

echo "################# wait for 10 seconds #################################"
sleep 10

echo
echo "################## Channel-123 Creation and Joining #######################################"
# create channel-123 from peer0 on org1
# it connects to orderer0
docker exec cli1 peer channel create -o orderer0.example.com:7050 -c channel-1234 -f ./network-config/channel-1234.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
docker exec cli1 peer channel create -o orderer0.example.com:7050 -c channel-123 -f ./network-config/channel-123.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
docker exec cli1 peer channel create -o orderer0.example.com:7050 -c channel-12 -f ./network-config/channel-12.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
docker exec cli1 peer channel create -o orderer0.example.com:7050 -c channel-1 -f ./network-config/channel-1.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

docker exec cli1 peer channel join -b channel-1234.block

docker exec -e CORE_PEER_ADDRESS=peer0.org1.example.com:7051 -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt cli1 peer channel join -b channel-1234.block

$ssh_quarks_one 'docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/var/hyperledger/users/Admin@org1.example.com/msp" peer0.org1.example.com peer channel create -o orderer0.example.com:7050 -c channel-123 -f /var/hyperledger/configs/channel-123.tx'
# join peer0 to channel
$ssh_quarks_one 'docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/var/hyperledger/users/Admin@org1.example.com/msp" peer0.org1.example.com peer channel join -b channel-123.block'

echo
echo "################## Channel-23 Creation and Joining #######################################"
# create channel-23 from peer0 on org2
# it connects to orderer0
$ssh_quarks_two 'docker exec -e "CORE_PEER_LOCALMSPID=Org2MSP" -e "CORE_PEER_MSPCONFIGPATH=/var/hyperledger/users/Admin@org2.example.com/msp" peer0.org2.example.com peer channel create -o orderer1.example.com:7050 -c channel-23 -f /var/hyperledger/configs/channel-23.tx'
# join peer0 to channel
$ssh_quarks_two 'docker exec -e "CORE_PEER_LOCALMSPID=Org2MSP" -e "CORE_PEER_MSPCONFIGPATH=/var/hyperledger/users/Admin@org2.example.com/msp" peer0.org2.example.com peer channel join -b channel-23.block'

echo
echo "################## Channel-1 Creation and Joining #######################################"
# create channel-1 from peer0 on org1
# it connects to orderer0
$ssh_quarks_one 'docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/var/hyperledger/users/Admin@org1.example.com/msp" peer0.org1.example.com peer channel create -o orderer0.example.com:7050 -c channel-1 -f /var/hyperledger/configs/channel-1.tx'
# join peer0 to channel
$ssh_quarks_one 'docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/var/hyperledger/users/Admin@org1.example.com/msp" peer0.org1.example.com peer channel join -b channel-1.block'

echo
echo "################## Channel Block Sharing #############################################"
echo "block copy"
$ssh_quarks_one 'docker cp peer0.org1.example.com:/channel-123.block .'
$ssh_quarks_two 'docker cp peer0.org2.example.com:/channel-23.block .'

echo "block copy to other host"
$ssh_quarks_one "$scp_cmd -r channel-123.block quarks@$quarks_two_ip:~/"

echo "block set to peers"
$ssh_quarks_two 'docker cp channel-123.block peer0.org2.example.com:/channel-123.block'
$ssh_quarks_two 'docker cp channel-123.block peer0.org3.example.com:/channel-123.block'

$ssh_quarks_two 'docker cp channel-23.block peer0.org3.example.com:/channel-23.block'

echo "removing blocks"
$ssh_quarks_one 'rm channel-123.block'

$ssh_quarks_two 'rm channel-123.block'
$ssh_quarks_two 'rm channel-23.block'

echo
echo "#############################channel join of peers####################"
$ssh_quarks_two 'docker exec -e "CORE_PEER_LOCALMSPID=Org2MSP" -e "CORE_PEER_MSPCONFIGPATH=/var/hyperledger/users/Admin@org2.example.com/msp" peer0.org2.example.com peer channel join -b channel-123.block'
$ssh_quarks_two 'docker exec -e "CORE_PEER_LOCALMSPID=Org3MSP" -e "CORE_PEER_MSPCONFIGPATH=/var/hyperledger/users/Admin@org3.example.com/msp" peer0.org3.example.com peer channel join -b channel-123.block'
$ssh_quarks_two 'docker exec -e "CORE_PEER_LOCALMSPID=Org3MSP" -e "CORE_PEER_MSPCONFIGPATH=/var/hyperledger/users/Admin@org3.example.com/msp" peer0.org3.example.com peer channel join -b channel-23.block'

docker exec cli1 peer chaincode instantiate -o orderer0.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C channel-1 -n mycc github.com/chaincode -v v0 -c '{"Args": ["initLedger"]}'
docker exec cli1 peer chaincode invoke -o orderer0.example.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C channel-1 -n mycc --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt -c '{"Args":["addMessage", "Hello"]}'

./chaincode_deploy.sh mycc 0 init

#
#echo
#echo "############################# Ledger Init ###########################"
#curl --location --request POST 'beta.alphaid.com:3000/initLedger/' \
#--data-raw ''

echo
echo "%%%%%%%%% congratulations %%%%%%%%%%%%"
echo "%%%%%%%%% Quarks POC DEPLOYED %%%%%%%%%%%%"
./art_print.sh

echo ">>>>>>>_"
read -n 1 -p "press enter to tear down the network" mainmenuinput

destroy_network
