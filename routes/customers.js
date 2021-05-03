const router =  require('express').Router();
let Customer = require('../models/customers.model');

router.route('/').get(function (req, res) {
    Customer.find()
        .then((customers) => res.json(customers))
        .catch((err) => res.status(400).json('Error: '+err));
});

router.route('/add').post(function (req, res) {
    console.log(req.body);
    
    const newCustomer = new Customer({
        fname: req.body.fname,
        lname: req.body.lname,
        balance: req.body.balance,
        email: req.body.email,
        phone: req.body.phone,
    })

    newCustomer.save()
        .then(function(){
            res.json('Customer Added')
        })
        .catch((err) => res.status(400).json('Error: '+err))
})

module.exports = router;