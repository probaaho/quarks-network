# hlf cluster on multiple hosts

Read more infomarions from [here](https://medium.com/coinmonks/hyperledger-fabric-cluster-on-multiple-hosts-af093f00436)

req:
- docker
- node v10 -- nvm -- npm



network:
- two instances quarks-one[10.100.222.178] quarks-two [10.100.222.179]
- quarks-one will only host org1 materials, quarks-two will host others
- 