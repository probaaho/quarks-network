var express = require('express');
var app = express();
var bodyParser = require('body-parser');

Query = require('./module_query');
Invoke = require('./module_invoke');

const fs = require('fs');
const path = require('path');
const org = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'org.json'), 'utf8')).name;


app.use(bodyParser.json());

app.get('/queryAllUsers',async function(req,res){
    var g = await Query.queryAllUsers();
    res.send(g);
});

app.get('/queryUser',async function(req,res){
    let email = req.query.email;
    let user = await Query.queryUser(email);

    try {
        JSON.parse(user.toString());
        
        res.send(user);
    }catch (error) {
        res.status(404)
        res.send('USER_DOES_NOT_EXIST')
    }
});

app.post('/createUser', async function(req,res){
    var user = req.body;
    console.log(user['name']);
    var g = await Invoke.createUser(user);
    res.json(g)
});

app.post('/initLedger', async function(req,res){
    await Invoke.initLedger();
    res.json("SUCCESS")
});


app.listen(3000);
console.log(org)
console.log('server running in port 3000');