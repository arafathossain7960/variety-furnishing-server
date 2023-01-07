const express =require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
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


        // jwt token validation
        app.get('/jwt', async(req, res)=>{
            const email = req.query.email;
            const query = {email:email};
            const user = await userCollection.findOne(query);
            
            if(user){
                // we will add expiration time letter
                const token = jwt.sign({email},process.env.ACCESS_TOKEN);
                res.send({accessToken:token});
            }
           
            res.status(403).send({accessToken:''});
        })

        // save user information
        app.post('/user', async(req, res)=>{

            const userInfo = req.body;
            console.log(userInfo)
            const result = await userCollection.insertOne(userInfo);
            res.send(result);
        })
       
    }
    finally{

    }

}
run();











// testing route 
app.get('/', (req, res)=>{
    res.send('open variety furnishing ');
})

app.listen(port, ()=>{
    console.log(`the server is running on ${port} `)
})