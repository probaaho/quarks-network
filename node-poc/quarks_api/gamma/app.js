var express = require('express');
var app = express();
var bodyParser = require('body-parser');

Query = require('./module_query_queryAllUsers');
CUinvoke = require('./module_invoke_createUser');

app.use(bodyParser.json());

app.get('/queryAllUsers',async function(req,res){
    var g = await Query.main();
    res.send(g);
});

app.post('/createUser', async function(req,res){
    var user = req.body;
    console.log(user['name']);
    var g = await CUinvoke.main(user);
    res.json(g)
});

/*
app.get('/api/genres',function(req,res){
    Genre.getGenres(function(err,genres){
        if(err){
            throw err;
        }
        rses.json(genres);
    });
});

app.post('/api/genres',function(req,res){
    var genre = req.body;
    Genre.addGenre(genre,function(err,genre){
        if(err){
            throw err;
        }
        res.json(genre);
    });
});

app.get('/api/books',function(req,res){
    Book.getBooks(function(err,books){
        if(err){
            throw err;
        }
        res.json(books);
    });
});

app.post('/api/books',function(req,res){
    var book = req.body;
    Book.addBook(book,function(err,genre){
        if(err){
            throw err;
        }
        res.json(book);
    });
});

app.get('/api/books/:_id',function(req,res){
    Book.getBookById(req.params._id,function(err,book){
        if(err){
            throw err;
        }
        res.json(book);
    });
});
*/

app.listen(3000);
console.log('server running in port 3000');