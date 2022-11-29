const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const app = express()
const port = process.env.PORT || 5000

// middlewares
app.use(cors())
app.use(express.json())

// Database Connection



const uri = process.env.DB_URI
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    const categorysCollecation = client.db('laptop').collection('categorys')   
    const categoryProductsCollecation = client.db('laptop').collection('categoryproducts')

    app.get('/categorys', async (req, res) => {
      const query = {};
      const categorys = await categorysCollecation.find(query).toArray();
      res.send(categorys);
  });


  app.get('/categorys/:id', async (req, res) => {
    const id = req.params.id;
    const query = { id: id };
    const category = await categoryProductsCollecation.find(query).toArray();
    res.send(category);
})











    // const usersCollecation = client.db('laptop').collection('user')

    // app.put('/user/:email', async (req, res) => {
    //   const email = req.params.email
    //   const user = req.body
    //   const filter = { email: email }
    //   const options = { upsert: true}
    //   const updateDoc = {
    //     $set: user,
    //   }
    //   const result = await usersCollecation.updateOne(filter, updateDoc, options)
    //   console.log(result)

    //   const token = jwt.sign(user, process.env.TOKEN, {
    //     expiresIn: '1d',
    //   })
    // })


    console.log('Database Connected...')
  } finally {
  }
}

run().catch(err => console.error(err))

app.get('/', (req, res) => {
  res.send('Server is running...')
})

app.listen(port, () => {
  console.log(`Server is running...on ${port}`)
})