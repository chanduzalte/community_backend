// app.js
const express = require('express');
const app = express();
require('dotenv').config();
const routes = require('./routes/index'); // Import the combined routes
const mongoose = require('mongoose');
const cors = require('cors');


// Connect to the MongoDB database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(console.log("MongoDB is Successfully connected")).catch((err)=>console.log(err));

app.use('/uploads', express.static('uploads'));



const corsOptions = {
  origin: process.env.CORS_URL,
  credentials: true,
}

app.use(express.json());
app.use(cors(corsOptions));


// Use the combined routes under the '/api' path
app.use('/api', routes);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
