const express = require('express');
const session = require('express-session');

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: "hospital",
    resave: false,
    saveUninitialized: true
}));

app.use(express.static('public'));

const web = require('./routes/web');
const admin = require('./routes/admin');
const doctor = require('./routes/doctor');
const customer = require('./routes/customer');

app.use('/', web);
app.use('/admin', admin);
app.use('/doctor', doctor);
app.use('/customer', customer);

app.listen(3000);