/*
Project: AlphaID

*/

package main

/* Imports
 * 4 utility libraries for formatting, handling bytes, reading and writing JSON, and string manipulation
 * 2 specific Hyperledger Fabric specific libraries for Smart Contracts
 */

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	"github.com/hyperledger/fabric/protos/peer"
	"github.com/hyperledger/fabric-chaincode-go/pkg/cid"
)

// Define the Smart Contract structure
type SmartContract struct {
}

// Define the car structure, with 4 properties.  Structure tags are used by encoding/json library
type User struct {
	Name         string `json:"name"`
	Email        string `json:"email"`
	Role         string `json:"role"`
	PasswordHash string `json:"password_hash"`
	Dept         string `json:"dept"`
}

/*
 * The Init method is called when the Smart Contract "fabcar" is instantiated by the blockchain network
 * Best practice is to have any Ledger initialization in separate function -- see initLedger()
 */

func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) peer.Response {
	return shim.Success(nil)
}

func (s *SmartContract) updateCC(stub shim.ChaincodeStubInterface) peer.Response {
	return shim.Success(nil)
}

/*
 * The Invoke method is called as a result of an application request to run the Smart Contract "fabcar"
 * The calling application program has also specified the particular smart contract function to be called, with arguments
 */
func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) peer.Response {

	// Retrieve the requested Smart Contract function and arguments
	function, args := APIstub.GetFunctionAndParameters()
	// Route to the appropriate handler function to interact with the ledger appropriately
	if function == "queryUser" {
		return s.queryUser(APIstub, args)
	} else if function == "initLedger" {
		return s.initLedger(APIstub)
	} else if function == "createUser" {
		return s.createUser(APIstub, args)
	} else if function == "queryAllUsers" {
		return s.queryAllUsers(APIstub)
	} else if function == "totalUsers" {
		return s.totalUsers(APIstub)
	} else if function == "queryTest" {
		return s.queryTest(APIstub)
	} else if function == "updateCC" {
		return s.updateCC(APIstub)
	}

	return shim.Error("Invalid Smart Contract function name.")
}

// invoke

func (s *SmartContract) initLedger(APIstub shim.ChaincodeStubInterface) peer.Response {
	users := []User{
		User{Name: "Syed Md Hasnayeen", Email: "rumman@gmail.com", Role: "student", Dept: "CSE", PasswordHash: "f498cc540f98e18bec3bb51e03935b2cac0ea3b85cd0762226a5f28924dda3e5"},                //rumman1234
		User{Name: "Mirza Kamrul Bashar Shuhan", Email: "shuhan.mirza@gmail.com", Role: "student", Dept: "CSE", PasswordHash: "2860087d2a44a6b61ec5a829a8582bdf0580d270d6d44f05493cd245f5e053ca"}, //shuhan1234
		User{Name: "Rupasree Dey", Email: "rup@gmail.com", Role: "student", Dept: "CSE", PasswordHash: "dcf4ff0363ca39669e251360710f72ef66bfcfef2402c72735729fbfe06bc029"},                        //rup1234
		User{Name: "Md Sadek Ferdous Ripul", Email: "ripul.bd@gmail.com", Role: "faculty", Dept: "CSE", PasswordHash: "cc0c773e876f996d9dae9e56921a56d867e66ad18118f41ff48ddbc28c4fa725"},         //ripul1234
		User{Name: "Muntasir Mahdi", Email: "muntasir@gmail.com", Role: "student", Dept: "EEE", PasswordHash: "1ef8ded450bc1297a35df954e2e173782990b9dcf5a7fe41f291341b19931caa"},                 //muntasir1234
		User{Name: "Nuren Zabin Shuchi", Email: "shuchi@gmail.com", Role: "faculty", Dept: "EEE", PasswordHash: "12a15c8e2903a6a1844e73a455ae53e84be32c6fee3cbe331e75796024e5358d"},               //shuchi1234
	}

	i := 0
	for i < len(users) {
		fmt.Println("i is ", i)
		userAsBytes, _ := json.Marshal(users[i])
		APIstub.PutState("USER_"+users[i].Email, userAsBytes)
		fmt.Println("Added", users[i])
		i = i + 1
	}

	return shim.Success(nil)
}

func (s *SmartContract) createUser(APIstub shim.ChaincodeStubInterface, args []string) peer.Response {

	if len(args) != 5 {
		return shim.Error("Incorrect number of arguments. Expecting 5")
	}

	var user = User{Name: args[0], Email: args[1], Role: args[2], Dept: args[3], PasswordHash: args[4]}

	userAsBytes, _ := json.Marshal(user)
	tempKey := "USER_"
	tempKey += user.Email //countElements(APIstub, "USER_")
	APIstub.PutState(tempKey, userAsBytes)

	return shim.Success(nil)
}

// query

func (s *SmartContract) queryUser(APIstub shim.ChaincodeStubInterface, args []string) peer.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	userAsBytes, _ := APIstub.GetState("USER_" + args[0])

	return shim.Success(userAsBytes)
}

func (s *SmartContract) queryAllUsers(APIstub shim.ChaincodeStubInterface) peer.Response {
	return shim.Success([]byte(s.getAllElement(APIstub, "USER_")))
}

func (s *SmartContract) totalUsers(APIstub shim.ChaincodeStubInterface) peer.Response {
	ret := countElements(APIstub, "USER_")
	var buffer bytes.Buffer
	buffer.WriteString(ret)
	return shim.Success(buffer.Bytes())
}

func (s *SmartContract) queryTest(APIstub shim.ChaincodeStubInterface) peer.Response {

	startKey := "USER0"
	endKey := "USER99999999999999"

	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- queryAllUsers:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

// helper

func (s *SmartContract) getAllElement(APIstub shim.ChaincodeStubInterface, key string) []byte {

	startKey := key + " "
	endKey := key + "~"

	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return []byte(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return []byte(err.Error())
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	return buffer.Bytes()
}

func countElements(APIstub shim.ChaincodeStubInterface, key string) string {

	startKey := key + " "
	endKey := key + "~"

	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return ""
	}

	defer resultsIterator.Close()

	cnt := 0

	for resultsIterator.HasNext() {
		resultsIterator.Next()
		cnt++
	}

	return strconv.Itoa(cnt)
}

// The main function is only relevant in unit test mode. Only included here for completeness.
func main() { //kop

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
