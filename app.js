require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const connectDB = require('./server/config/db');
const cookieParser = require('cookie-parser'); 
const MongoStore =require('connect-mongo'); 
const session = require('express-session');
 



const app = express();
const PORT = 5000 || process.env.PORT;

//connect to DB
connectDB();
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(express.urlencoded({extended:true }));
app.use(express.json());
app.use(cookieParser()); 
app.use(session({
    secret:'real madrid',
    resave:false,
    saveUninitialized:true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB__URI
    }),
    
}));

app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');


app.use('/', require('./server/routes/main'));

app.use('/', require('./server/routes/admin'));



app.listen(PORT, (req,res) => {
console.log(`Listening on this port ${PORT}`);
});