const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient
const PORT = 2121
require('dotenv').config()


let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'todo'

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
    })
    
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())


app.get('/',async (request, response)=>{ // GET request under root that is used to display the todo list on the app's main page
    const todoItems = await db.collection('todos').find().toArray()
    const itemsLeft = await db.collection('todos').countDocuments({completed: false})
    response.render('index.ejs', { items: todoItems, left: itemsLeft })
    db.collection('todos').find().toArray() // Go to MongoDB collection named 'todos', find all of the documents (objects), and put them into an array
    .then(data => { // From the returned promise, pass the array into the variable data
        db.collection('todos').countDocuments({completed: false}) // Determine the documents from the todo that are marked 'incomplete'
        .then(itemsLeft => {
            response.render('index.ejs', { items: data, left: itemsLeft }) // Send a response by rendering the ejs with the data under the name 'items'
        })
    })
    .catch(error => console.error(error))
})

app.post('/addTodo', (request, response) => { // POST request under 'addTodo' route. Used to add a new todo item to the list
    db.collection('todos').insertOne({thing: request.body.todoItem, completed: false}) // Access the 'todos' collection in MongoDB, insert an item with the title recieved from the request (thing from the form in ejs) and the additional property of incomplete
    .then(result => { // After promise is recieved
        console.log('Todo Added') // Affirm that the todo item was added in the console
        response.redirect('/') // Refresh the page to see the changes of the create response
    })
    .catch(error => console.error(error))
})

app.put('/markComplete', (request, response) => {
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: true
          }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})

app.put('/markUnComplete', (request, response) => {
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: false
          }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})

app.delete('/deleteItem', (request, response) => {
    db.collection('todos').deleteOne({thing: request.body.itemFromJS})
    .then(result => {
        console.log('Todo Deleted')
        response.json('Todo Deleted')
    })
    .catch(error => console.error(error))

})

app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})
