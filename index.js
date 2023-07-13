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
      const date=req.query.date;
      const query={};
      const options=await appoinmentOptionsCollection.find(query).toArray();
      const bookingQuery={appoinmentDate:date};
      const alreadyyBooked=await bookingsCollection.find(bookingQuery).toArray();
      options.forEach(option=>{
        const optionBooked=alreadyyBooked.filter(book=>book.treatment===option.name);
        const bookedSlots=optionBooked.map(book=>book.slot);
        const remainingSlots=option.slots.filter(slot=>!bookedSlots.includes(slot))
        option.slots=remainingSlots;
        // console.log("new request",option.name,remainingSlots.length,date);
      })
      res.send(options)
    })

    app.get("v2/appoinmentOptions",async(req,res)=>{
      const date=req.query.date;
      const options= await appoinmentOptionsCollection.aggregate([
        {
          $lookup:{
            from: "bookings",
            localField: "name",
            foreignField: "treatment",
            pipeline: [
              {
                $match:{
                  $expr:{
                    $ep:['$appoinmentDate',date]
                  }
                }
              }
            ],
            as: "booked"
          }
        },
        {
          $project:{
            name:1,
            slots:1,
            booked:{
              $map:{
                input:'$booked',
                as:"book",
                in:"$$book.slot"
              }
            }
          }
        },
        {
           $project:{
            name:1,
            slots:{
              $setDifference:["$slots","$booked"]
            }
           } 
        }
      ]).toArray();
      res.send(options)
    })


    app.post("/bookings",async(req,res)=>{
      const booking=req.body;
      console.log(booking);
      const query={
        appoinmentDate:booking.appoinmentDate,
        email:booking.enail,
        treatment:booking.treatment
      }
      const alreadyBooked=await bookingsCollection.find(query).toArray()
      
      if (alreadyBooked.length) {
        const message=`You already have a booking on ${booking.appoinmentDate}`
        return res.send({acknowledged:false,message})
      }
      
      const result=await bookingsCollection.insertOne(booking);
      res.send(result)
    })
  } 
  finally{
    
  }
}
run().catch(console.dir);


app.get('/', async(req, res) => {
  res.send('Wellcome to Doctors portal')
})

app.listen(port, () => {
  console.log(`Doctors Portal listening on port ${port}`)
})