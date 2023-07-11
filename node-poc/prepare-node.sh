#!/bin/bash
sudo apt-get install git
sudo apt-get install curl
sudo apt-get install jq
sudo apt-get -y install docker-compose
sudo systemctl enable docker
sudo usermod -a -G docker $USER

wget https://golang.org/dl/go1.20.5.linux-amd64.tar.gz
sudo tar -xvf go1.20.5.linux-amd64.tar.gz
rm -rf go1.20.5.linux-amd64.tar.gz

sudo rm -rf /usr/local/go
sudo mv go /usr/local
echo export GOROOT=/usr/local/go | tee -a ~/.profile
echo export GOPATH=\$HOME/go | tee -a ~/.profile
echo export PATH=\$GOPATH/bin:\$GOROOT/bin:\$PATH | tee -a ~/.profile