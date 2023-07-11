#!/bin/bash

rm -rf crypto-config
rm -rf network-config
mkdir network-config

# add bin directory to PATH
export PATH=${PWD}/bin:${PWD}:$PATH

# define fabric config directory 
export FABRIC_CFG_PATH=${PWD}/fabric-config

# generates certificates and keys on crypto-config directory
cryptogen generate --config=./fabric-config/crypto-config.yaml

# generate orderer.block on config directory
configtxgen -profile OrdererGenesis -outputBlock ./network-config/orderer.block

export CHANNEL1234_NAME=channel-1234
export CHANNEL1234_PROFILE=Channel-1234

export CHANNEL123_NAME=channel-123
export CHANNEL123_PROFILE=Channel-123

export CHANNEL12_NAME=channel-12
export CHANNEL12_PROFILE=Channel-12

export CHANNEL1_NAME=channel-1
export CHANNEL1_PROFILE=Channel-1


# generate channel config transaction on config/channel.tx
configtxgen -profile ${CHANNEL1234_PROFILE} -outputCreateChannelTx ./network-config/${CHANNEL1234_NAME}.tx -channelID ${CHANNEL1234_NAME}
configtxgen -profile ${CHANNEL123_PROFILE} -outputCreateChannelTx ./network-config/${CHANNEL123_NAME}.tx -channelID ${CHANNEL123_NAME}
configtxgen -profile ${CHANNEL12_PROFILE} -outputCreateChannelTx ./network-config/${CHANNEL12_NAME}.tx -channelID ${CHANNEL12_NAME}
configtxgen -profile ${CHANNEL1_PROFILE} -outputCreateChannelTx ./network-config/${CHANNEL1_NAME}.tx -channelID ${CHANNEL1_NAME}

# generate anchor peer transaction on config/Org1MSPanchors.tx
configtxgen -profile ${CHANNEL1234_PROFILE} -outputAnchorPeersUpdate ./network-config/Org1MSPanchors_${CHANNEL1234_NAME}.tx -channelID ${CHANNEL1234_NAME} -asOrg Org1MSP
configtxgen -profile ${CHANNEL1234_PROFILE} -outputAnchorPeersUpdate ./network-config/Org2MSPanchors_${CHANNEL1234_NAME}.tx -channelID ${CHANNEL1234_NAME} -asOrg Org2MSP
configtxgen -profile ${CHANNEL1234_PROFILE} -outputAnchorPeersUpdate ./network-config/Org3MSPanchors_${CHANNEL1234_NAME}.tx -channelID ${CHANNEL1234_NAME} -asOrg Org3MSP
configtxgen -profile ${CHANNEL1234_PROFILE} -outputAnchorPeersUpdate ./network-config/Org3MSPanchors_${CHANNEL1234_NAME}.tx -channelID ${CHANNEL1234_NAME} -asOrg Org4MSP

configtxgen -profile ${CHANNEL123_PROFILE} -outputAnchorPeersUpdate ./network-config/Org1MSPanchors_${CHANNEL123_NAME}.tx -channelID ${CHANNEL123_NAME} -asOrg Org1MSP
configtxgen -profile ${CHANNEL123_PROFILE} -outputAnchorPeersUpdate ./network-config/Org2MSPanchors_${CHANNEL123_NAME}.tx -channelID ${CHANNEL123_NAME} -asOrg Org2MSP
configtxgen -profile ${CHANNEL123_PROFILE} -outputAnchorPeersUpdate ./network-config/Org3MSPanchors_${CHANNEL123_NAME}.tx -channelID ${CHANNEL123_NAME} -asOrg Org3MSP

configtxgen -profile ${CHANNEL12_PROFILE} -outputAnchorPeersUpdate ./network-config/Org1MSPanchors_${CHANNEL12_NAME}.tx -channelID ${CHANNEL12_NAME} -asOrg Org1MSP
configtxgen -profile ${CHANNEL12_PROFILE} -outputAnchorPeersUpdate ./network-config/Org2MSPanchors_${CHANNEL12_NAME}.tx -channelID ${CHANNEL12_NAME} -asOrg Org2MSP

configtxgen -profile ${CHANNEL1_PROFILE} -outputAnchorPeersUpdate ./network-config/Org1MSPanchors_${CHANNEL1_NAME}.tx -channelID ${CHANNEL1_NAME} -asOrg Org1MSP
