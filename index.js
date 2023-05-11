const express = require('express');
const app = express()
require('dotenv').config()
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
const port = process.env.PORT || 4000
const cors = require('cors');
app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
  res.send(`<h1 align="center" style="color:#333;font-size:20px;margin:10px 0;">Cars Doctor Server Is Runnings</h1>`)
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

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const carsCollection = client.db("carsDoctor").collection('services');

    app.get('/services', async (req, res) => {
      const result = await carsCollection.find({}).toArray();
      res.send(result)
    })

    app.get('/services/:id',async (req,res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const options = {
        projection: { title: 1,service_id:1,img:1,price:1,description:1},
      };
      const carsService = await carsCollection.findOne(query,options);
      res.send(carsService)
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