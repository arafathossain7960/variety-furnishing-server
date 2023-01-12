const express =require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;


// building middleware 
app.use(cors());
app.use(express.json());

// mongodb uri and client
const uri = `mongodb+srv://${process.env.userDB}:${process.env.passwordDB}@cluster0.f6i98.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


// custom middle ware
const verifyJwt=(req, res, next)=>{

    const authorizationHeader = req.headers.authorization;
    if(!authorizationHeader){
      return  res.status(401).send('unAuthorized access')
    }
    const token = authorizationHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded)=>{
        if(err){
            return res.status(403).send({massage:'forbidden access'})
        }
        res.decoded = decoded;
        next();
    })

    
}



// mongodb connection
function run(){
    try{
        const userCollection = client.db('variety_furnishing').collection('userCollection');
        const productsCollection = client.db('variety_furnishing').collection('productsCollection');
        const bookingCollection = client.db('variety_furnishing').collection('bookingCollection');
        const reportCollection = client.db('variety_furnishing').collection('reportCollection');


        // jwt token validation
        app.get('/jwt', async(req, res)=>{
            const email = req.query.email;
            const query = {email:email};
            const user = await userCollection.findOne(query);
            
            if(user){
                // we will add expiration 
                const token = jwt.sign({email},process.env.ACCESS_TOKEN);
                res.send({accessToken:token});
            }
           
            res.status(403).send({accessToken:''});
        })
        //get all sellers for add min 
        app.get('/sellers', async(req, res)=>{
            const query ={accountType:'seller'};
            const sellers = await userCollection.find(query).toArray();
            res.send(sellers);

        })
        //get all buyers for add min 
        app.get('/buyers', async(req, res)=>{
            const query ={accountType:'buyer'};
            const sellers = await userCollection.find(query).toArray();
            res.send(sellers);

        })
        // get products based on category
        app.get('/products', async(req, res)=>{
            const category = req.query.category;

            const query = {productCategory:category};
            const result = await productsCollection.find(query).toArray();
            res.send(result);
        })
        // get single product for advertisement
        app.get('/products/advertise/:id', async(req, res)=>{
            const id = req.params.id;
            const query ={_id:ObjectId(id)};
            const result = await productsCollection.findOne(query);
            res.send(result);
        })

        // get myProducts based on specific seller
        app.get('/myProducts', async(req, res)=>{
            const sellerEmail = req.query.sellerEmail;
            const query = {sellerEmail: sellerEmail};
            const result = await productsCollection.find(query).toArray();
            res.send(result);
        })

        // delete specific seller's products
        app.delete('/myProducts/delete/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)}
            const result = await productsCollection.deleteOne(query);
            res.send(result);

        })
        // check admin
        app.get('/user/admin/:email', async(req, res)=>{
            const email = req.params.email;
            const query = {email};
            const user = await userCollection.findOne(query);
            res.send({isAdmin:user?.role ==='admin'});
        })
        // check seller
        app.get('/user/seller/:email', async(req, res)=>{
            const email = req.params.email;
            const query = {email};
            const user = await userCollection.findOne(query);
            res.send({isSeller:user?.accountType ==='seller'});
        })

        // save user information
        app.post('/user', async(req, res)=>{

            const userInfo = req.body;
            const result = await userCollection.insertOne(userInfo);
            res.send(result);
        })

        // delete user
        app.delete('/user/:id',async(req, res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const result = await userCollection.deleteOne(query);
            res.send(result)

            
        })
        // make admin 
        app.put('/user/admin/:id',async(req, res)=>{
            const id = req.params.id;
            const filter = {_id:ObjectId(id)};
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                  role: 'admin'
                },
              };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result)

            
        })
        // make seller verified
        app.put('/user/verify/:sellerEmail',(req, res)=>{
            const sellerEmail= req.params.sellerEmail;
            const filter = {sellerEmail};
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    sellerVerified: true
                },
              };
            const update = productsCollection.updateOne(filter, updateDoc, options);
              res.send(update);
            

            
        })

        // save product 
        app.post('/addproduct', async(req, res)=>{

            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.send(result);
        })


        //booking information area------------
      
            // get booking
        app.get('/bookingInfo', async(req, res)=>{
            const userEmail= req.query.email;
            // const decodedEmail = req.decoded.email;
            // if(userEmail !== decodedEmail){
            //     res.status(403).send({massage:'forbidden access'})
            // }
            const query = {userEmail:userEmail};
            const result = await bookingCollection.find(query).toArray();
            res.send(result);
        }) 
            // post booking
            app.post('/bookingInfo', async(req, res)=>{
            const bookingInfo = req.body;
            const result = await bookingCollection.insertOne(bookingInfo);
            res.send(result)

        })
        // put booking
        app.put('/bookingInfo', async(req, res)=>{
            const id=req.query.id;
           


            const filter ={_id:ObjectId(id)};
            const options = { upsert: true };
            const updateBooking = {
                $set: {
                  payment:true 
                }
              };
              const result = await bookingCollection.updateOne(filter,updateBooking,options)
              res.send(result);
            })

            // Report to admin route

            // get report
            app.get('/report', async(req, res)=>{
                const query ={};
                const result =await reportCollection.find(query).toArray();
                res.send(result);
            })


            // post report
            app.post('/report',async(req, res)=>{
                const report = req.body;
                const result =await reportCollection.insertOne(report);
                res.send(result)
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