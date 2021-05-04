const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bodyParser = require("body-parser");
const ejs = require("ejs");

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));


// MONGOOSE DB CONNECTION START
mongoose.connect("mongodb+srv://banker:"+process.env.MONGOPASS+"@cluster0.3mrha.mongodb.net/bankDB", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

const connection = mongoose.connection;
connection.once('open', () => {
    console.log('MongoDB connected Successfully');
});
// DATABASE MODEL START
const customerSchema = new Schema({
    fname: String,
    lname: String,
    ano: String,
    bank: String,
    balance: String,
    email: String,
    phone: String,
    address: String,
    date: String,
});
const Customer = mongoose.model('Customer', customerSchema);

const tranSchema = new Schema({
    name: String,
    transid: String,
    ano: String,
    bank: String,
    amount: String,
    date: String,
});
const Transaction = mongoose.model('Transaction', tranSchema);
// DATABASE MODEL END
// MONGOOSE DB CONNECTION END

// WEBSITE ROUTES START
app.get("/", function (req, res) {
    Customer.find()
        .then((customers) => Transaction.find()
                            .then(function(transactions){
                                res.render('home', {AllCustomers: customers, Transactions: transactions, success: ''})
                            })
                            .catch((err) => re11s.status(400).json('Error: '+err)))
        .catch((err) => res.status(400).json('Error: '+err));
    // res.render("home");
});

app.post("/customers/add", function (req, res){

    const newCustomer = new Customer({
        fname: req.body.fname,
        lname: req.body.lname,
        ano: Date.now(),
        bank: req.body.bank,
        balance: req.body.balance,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        date: (new Date()).toString(),
    })

    newCustomer.save()
        .then(function(){
            res.json('Customer Added')
        })
        .catch((err) => res.status(400).json('Error: '+err))
})

app.post('/transactions/add', function (req, res) {
    const newTransaction= new Transaction({
        name: req.body.name,
        transid: 'TSF000'+Math.floor(Math.random() * 10000000),
        ano: req.body.ano,
        bank: req.body.bank,
        amount: req.body.amount,
        date: (new Date()).toString(),
    })

    newTransaction.save()
        .then(function(){
            res.json('Transaction Added')
        })
        .catch((err) => res.status(400).json('Error: '+err))
});

app.get('/customers', function (req, res) {
    Customer.find()
        .then((customers) => Transaction.find()
                            .then((transactions) => res.render('customers', {AllCustomers: customers, Transactions: transactions}))
                            .catch((err) => res.status(400).json('Error: '+err)))
        .catch((err) => res.status(400).json('Error: '+err));
});

app.get('/customers/:id', function (req, res) {
    Customer.findById(req.params.id)
        .then((customer) => Transaction.find()
                            .then((transactions) => res.render('customer', {Details: customer, Transactions: transactions}))
                            .catch((err) => res.status(400).json('Error: '+err)))
        .catch((err) => res.status(400).json('Error: '+err));
})

app.get('/transferto/:id/', function (req, res) {
    Customer.findOne({_id: req.params.id})
        .then((customer) => Transaction.find()
                            .then((transactions) => res.render('transferto', {Details: customer, Transactions: transactions, success: ''}))
                            .catch((err) => res.status(400).json('Error: '+err)))
        .catch((err) => res.status(400).json('Error: '+err));
})

app.post('/transferto/:id', function (req, res) {

    Customer.findById(req.params.id)
        .then((customer) => {

            const newTransaction= new Transaction({
                name: customer.fname+' '+customer.lname,
                transid: 'TSF000'+Math.floor(Math.random() * 10000000),
                ano: customer.ano,
                bank: customer.bank,
                amount: req.body.amount,
                date: (new Date()).toString(),
            })
        
            newTransaction.save()
                .then(
                    Customer.findById(req.params.id)
                    .then((customer) => {
                        Customer.updateOne({_id: req.params.id},
                            {
                                $set: {
                                    balance: ((parseInt(customer.balance) + parseInt(req.body.amount))).toString()
                                }
                            }, {new: true}).then(function(){
                                Customer.findOne({_id: req.params.id})
                                .then((customer) => Transaction.find()
                                                    .then((transactions) => res.render('transferto', {Details: customer, Transactions: transactions, success: 'Transaction Successfull!'}))
                                                    .catch((err) => res.status(400).json('Error: '+err)))
                                .catch((err) => res.status(400).json('Error: '+err));
                            })
                    })
                )
                .catch((err) => res.status(400).json('Error: '+err))
        })
        .catch((err) => res.status(400).json('Error: '+err));
    
})


app.post('/transfer', function (req, res) {
    var value = (req.body.ac).substring((req.body.ac).length-13, (req.body.ac).length);
    Customer.findOne({ano: value})
        .then((customer) => {
            const newTransaction= new Transaction({
                name: customer.fname+' '+customer.lname,
                transid: 'TSF000'+Math.floor(Math.random() * 10000000),
                ano: customer.ano,
                bank: customer.bank,
                amount: req.body.amount,
                date: (new Date()).toString(),
            })
        
            newTransaction.save()
                .then(
                    Customer.findOne({ano: value})
                    .then((customer) => {
                        Customer.updateOne({ano: value},
                            {
                                $set: {
                                    balance: ((parseInt(customer.balance) + parseInt(req.body.amount))).toString()
                                }
                            }, {new: true}).then(function(){
                                // res.redirect('/customers');
                                Customer.find()
                                .then((customers) => Transaction.find()
                                                    .then(function(transactions){
                                                        res.render('home', {AllCustomers: customers, Transactions: transactions, success: 'Transaction Successfull!'})
                                                    })
                                                    .catch((err) => re11s.status(400).json('Error: '+err)))
                                .catch((err) => res.status(400).json('Error: '+err));
                            })
                    })
                )
                .catch((err) => res.status(400).json('Error: '+err))
        })
        .catch((err) => res.status(400).json('Error: '+err));
});

app.get('/customer/:id', function (req, res) {
        
    Customer.findById(req.params.id)
        .then((customer) => Transaction.find()
            .then((alltransactions) => Transaction.find({ano: customer.ano})
                .then((transaction) => res.render('customer', {Transactions: alltransactions, Details: customer, CustomerTrans: transaction}))
                .catch((err) => res.status(400).json('Error: '+err)))
            .catch((err) => res.status(400).json('Error: '+err)))
        .catch((err) => res.status(400).json('Error: '+err));
})

app.get('/about', function (req, res) {
    Customer.find()
        .then((customers) => Transaction.find()
                            .then(function(transactions){
                                res.render('about', {AllCustomers: customers, Transactions: transactions, success: ''})
                            })
                            .catch((err) => re11s.status(400).json('Error: '+err)))
        .catch((err) => res.status(400).json('Error: '+err));
});
// WEBSITE ROUTES END 

const port = process.env.PORT || 5000

app.listen(port, function () {
    console.log('Server is running');
})
