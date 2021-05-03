const { Router } = require('express');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const customerSchema = new Schema({
    fname: String,
    lname: String,
    balance: String,
    email: String,
    phone: String,
});

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;