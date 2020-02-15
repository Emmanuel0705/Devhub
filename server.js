const express = require('express');
const app = express();
const connectDb = require('./config/db')
const cors = require('cors'); 
app.use(cors());
app.use(express.json({extended: false}))
connectDb()
app.get('/',(req,res)=> res.send('AP RUNNING'))
app.use('/api/users',require('./routes/api/users'))
app.use('/api/profile',require('./routes/api/profile'))
app.use('/api/posts',require('./routes/api/posts'))
app.use('/api/auth',require('./routes/api/auth'))
const PORT = process.env.PORT || 5000;
app.listen(PORT,(console.log(`App Running On Port ${PORT}`)))