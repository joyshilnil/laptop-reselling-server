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




function verifyJWT(req, res, next) {

  const authHeader = req.headers.authorization;
  if (!authHeader) {
      return res.status(401).send('unauthorized access');
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.TOKEN, function (err, decoded) {
      if (err) {
          return res.status(403).send({ message: 'forbidden access' })
      }
      req.decoded = decoded;
      next();
  })

}





async function run() {
  try {
    const categorysCollecation = client.db('laptop').collection('categorys')   
    const categoryProductsCollecation = client.db('laptop').collection('categoryproducts')
    const bookingsCollecation = client.db('laptop').collection('bookings')
    const usersCollecation = client.db('laptop').collection('users')



    app.get('/categorys', async (req, res) => {
      const query = {};
      const categorys = await categorysCollecation.find(query).toArray();
      res.send(categorys);
      // console.log(categorys);
  });


  app.get('/categorys/:id', async (req, res) => {
    const id = req.params.id;
    const query = { id: id };
    const category = await categoryProductsCollecation.find(query).toArray();
    res.send(category);
})

app.get('/bookings', verifyJWT, async (req, res) => {
  const email = req.query.email;
  const decodedEmail = req.decoded.email;

  if (email !== decodedEmail) {
      return res.status(403).send({ message: 'forbidden access' });
  }


  const query = { email: email };
  const bookings = await bookingsCollecation.find(query).toArray();
  res.send(bookings);
})


app.post('/bookings', async (req, res) => {
  const booking = req.body;


  const query = {
    productId: booking.productId,
}

const alreadyBooked = await bookingsCollecation.find(query).toArray();

if (alreadyBooked.length){
    const message = 'This is product already book'
    return res.send({acknowledged: false, message})
}

  const result = await bookingsCollecation.insertOne(booking);
  res.send(result);
})



app.post('/users', async (req, res) => {
  const user = req.body;
  const result = await usersCollecation.insertOne(user);
  res.send(result);
});



// JWT 

app.get('/jwt', async (req, res) => {
  const email = req.query.email;
  const query = { email: email };
  const user = await usersCollecation.findOne(query);
  if (user) {
      const token = jwt.sign({ email }, process.env.TOKEN, { expiresIn: '1d' })
      return res.send({ accessToken: token });
  }
  res.status(403).send({ accessToken: '' })
});



app.get('/users', async (req, res) => {
  const query = {};
  const users = await usersCollecation.find(query).toArray();
  res.send(users);
});

app.get('/users/admin/:email', async (req, res) => {
  const email = req.params.email;
  const query = { email }
  const user = await usersCollecation.findOne(query);
  res.send({ isAdmin: user?.role === 'admin' });
})

app.get('/users/sellers/:email', async (req, res) => {
  const email = req.params.email;
  const query = { email }
  const user = await usersCollecation.findOne(query);
  res.send({ isSellers: user?.role === 'Seller' });
})


app.get('/categoryname', async (req, res) => {
  const query = {}
  const result = await categorysCollecation.find(query).project({ id: 1, name:2 }).toArray();
  res.send(result);
})

app.post('/categorys/:id', async (req, res) => {
  const product = req.body;
  const result = await categoryProductsCollecation.insertOne(product);
  res.send(result);
});




app.get('/categorys/:id', async (req, res) => {
  const email = req.query.email;
  const query = { email: email };
  const categorys = await categoryProductsCollecation.find(query).toArray();
  res.send(categorys);
})

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