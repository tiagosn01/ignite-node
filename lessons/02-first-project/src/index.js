const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(express.json());

const customers = [];

function verifyIfExitsAccountCPF(request, response, next) {
  const { cpf } = request.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);


  if(!customer) {
    return response.status(400).json({error: "Customer not found"});
  }

  request.customer = customer;

  return next();
}

function getBalance(statement) {
 const balance = statement.reduce((acc, operation) => {
    if(operation.type === 'credit') {
      return acc + operation.amount
    } else {
      return acc - operation.amount
    }
  }, 0)

  return balance;
}

app.post("/account", (request, response) => {
 const { cpf, name } = request.body;

 const customerAlreadyExists = customers.some((customer) => customer.cpf === cpf)

 if(customerAlreadyExists) {
   return response.status(400).json({error: "Customer already exists"})
 }

 customers.push({
   cpf,
   name,
   id: uuidv4(),
   statement: []
 })

 return response.status(201).send();

})

app.put("/account", verifyIfExitsAccountCPF, (request, response) => {
  const { name } = request.body;
  const { customer } = request;
  
  customer.name = name;
  

  return response.status(201).send();

})

// app.use(verifyIfExitsAccountCPF);

app.get("/account", verifyIfExitsAccountCPF, (request, response) => {

  const { customer } = request; 

  return response.status(200).json(customer);
})

app.delete("/account", verifyIfExitsAccountCPF, (request, response) => {

  const { customer } = request; 

  customers.splice(customer, 1);

  return response.status(200).json(customers);
})
app.get("/statement", verifyIfExitsAccountCPF, (request, response) => {

  const { customer } = request; 

  return response.status(200).json(customer.statement);
})
app.get("/statement/date", verifyIfExitsAccountCPF, (request, response) => {

  const { customer } = request; 
  const { date } = request.query; 

  const dateFormat = new Date(date + " 00:00");

  const statement = customer.statement.filter((statement) => statement.created_at.toDateString() === new Date(dateFormat).toDateString())

  return response.status(200).json(statement);
})

app.post("/deposit", verifyIfExitsAccountCPF, (request, response) => {

  const { customer } = request; 
  const { description, amount } = request.body; 

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit",
  }

  customer.statement.push(statementOperation);

  return response.status(201).send();
    
})
app.post("/withdraw", verifyIfExitsAccountCPF, (request, response) => {

  const { customer } = request; 
  const { amount } = request.body; 

  const balance = getBalance(customer.statement);

  if(balance < amount) {
    return response.status(400).json({error: 'Insufficient funds' })
  }


  const statementOperation = {
    amount,
    created_at: new Date(),
    type: "debit",
  }

  customer.statement.push(statementOperation);
  return response.status(201).send();
    
})

app.get("/balance", verifyIfExitsAccountCPF, (request, response) => {

  const { customer } = request;

  const balance = getBalance(customer.statement);

  return response.status(201).json(balance);
    
})



app.listen(3333);