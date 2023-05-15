const express = require('express');
const app = express()
const jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 4000
const cors = require('cors');
app.use(cors())
app.use(express.json())
const users=require('./data.json');
const decode = require('jsonwebtoken/decode');


app.get('/', (req, res) => {
  res.send(`<h1 align="center" style="color:#333;font-size:20px;margin:10px 0;">Cars Doctor Server Is Runnings</h1>`)
})
app.get('/users', (req, res) => {
  res.send(users)
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.izhktyr.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const varifyJwt = (req, res, next) => {
  console.log('hitting varify jwt');
  const authorization=req.headers.authorization
  // console.log(authorization);
  if (!authorization) {
    return res.status(401).send({error:true,message:'Unauthorized Access'})
  }
  const token = authorization.split(' ')[1]
  // console.log(token);
  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({error:true,message:'Unauthorized Access'})
    }
    req.decoded = decoded
    next()
   })
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const carsCollection = client.db("carsDoctor").collection('services');
    const bookingCollection = client.db("carsDoctor").collection('bookings');

    //jwt tokens routes
    app.post('/jwt', (req, res) => {
      const user = req.body
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      res.send({token})
    })

    //Services Routes
    app.get('/services', async (req, res) => {
      const result = await carsCollection.find({}).toArray();
      res.send(result)
    })

    app.get('/services/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const options = {
        projection: { title: 1, service_id: 1, img: 1, price: 1, description: 1 },
      };
      const carsService = await carsCollection.findOne(query, options);
      res.send(carsService)
    })

    //Bookings Routes
    app.get('/bookings', varifyJwt, async (req, res) => {
      const decoded =req.decoded
      console.log('come back after varify', decoded);
      if (decoded.email !== req.query.email) {
        return res.status(403).send({error:1,message:'Forbidden Accessed'})
      }
      let query = {}
      // console.log(req.headers.authorization);
      if (req.query?.email) {
        query ={email:req.query.email}
      }
      const result = await bookingCollection.find(query).toArray()
      res.send(result)
    })

    app.post('/bookings', async (req, res) => {
      const booking = req.body
      // console.log(booking);
      const result = await bookingCollection.insertOne(booking);
      res.send(result)
    })

    app.delete('/bookings/:id',async (req,res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await bookingCollection.deleteOne(query);
      res.send(result)
    })

    app.patch('/bookings/:id', async (req, res) => {
      const id = req.params.id
      const filter={_id:new ObjectId(id)}
      const updateBooking = req.body
      console.log(updateBooking);
      const updateBookIngData = {
        $set: {
          status:updateBooking.status
        },
      };
      const result = await bookingCollection.updateOne(filter, updateBookIngData);
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`Crud Server Is Running On Port:http://localhost:${port}`);
})
