const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const port =process.env.PORT ||5000


const app = express();

app.use(cors());
app.use(express.json());

// doctor_admin
// EIXGjkkMvVSHKFSo

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gnhfc1r.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
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
    const appoinmentOptionsCollection = client.db("b6doctorsportal").collection("appoinmentOptions");
    const bookingsCollection = client.db("b6doctorsportal").collection("bookings");
    app.get("/appoinmentOptions",async(req,res)=>{
      const query={};
      const options=await appoinmentOptionsCollection.find(query).toArray();
      res.send(options)
    })

    app.post("/bookings",async(req,res)=>{
      const booking=req.body;
      console.log(booking);
      const result=await bookingsCollection.insertOne(booking);
      res.send(result)
    })
  } 
  finally{
    
  }
}
run().catch(console.dir);


app.get('/', async(req, res) => {
  res.send('Doctors portal')
})

app.listen(port, () => {
  console.log(`Doctors Portal listening on port ${port}`)
})