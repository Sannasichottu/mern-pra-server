const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
require('dotenv').config();

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(fileUpload({
    useTempFiles: true
}))

//Routes
app.use('/user',require('./routes/userRouter'))
app.use('/api',require('./routes/upload'))



/*
app.use('/',(req,res,next) => {
    res.json({msg: "Hello Nanba!"})
})*/

//connect to mongo
const uri = process.env.DB_URI
mongoose.set('strictQuery',false)
mongoose.connect(uri,err=>{
    if(err)throw err
})

const connection = mongoose.connection;

connection.once('open',()=>{
    console.log("Database connect successfully")
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log('Server is running on port',PORT)
})
