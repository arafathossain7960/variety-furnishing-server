const express =require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;


// middleware 
app.use(cors());
app.use(express.json());

// mongodb uri and client
const uri = `mongodb+srv://${process.env.userDB}:${process.env.passwordDB}@cluster0.f6i98.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// mongodb connection

function run(){
    try{
        const userCollection = client.db('variety_furnishing').collection('userCollection');

       
    }
    finally{

    }

}
run();

console.log(uri)









// testing route 
app.get('/', (req, res)=>{
    res.send('open variety furnishing ');
})

app.listen(port, ()=>{
    console.log(`the server is running on ${port} `)
})