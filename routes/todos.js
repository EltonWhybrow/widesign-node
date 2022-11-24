
const express = require('express');
const router = express.Router();

const Todo = require("../models/todos")

router.get('/', (req, res) => {
    Todo.find()
        .then((result) => {
            console.log(result)
            res.send(result)
        })
        .catch((err) => {
            console.log('>>>>> error', err)
        })
})

router.get('/todo/:id', (req, res) => {
    const todoID = req.params.id;

    Todo.findOne(
        { 'id': todoID },
        { id: 1, _id: 1, title: 1, description: 1, notes: 1, category: 1, reminder: 1, completed: 1 }
    )
        .then((result) => {
            res.send(result)
        })
        .catch((err) => {
            console.log('>>>>> error', err)
        })
})

router.delete('/todo/:id', (req, res) => {
    const todoID = req.params.id;

    Todo.deleteOne(
        { 'id': todoID },
        { id: 1, _id: 1, title: 1, description: 1, notes: 1, category: 1, reminder: 1, completed: 1 }
    )
        .then((result) => {
            res.send(result)
        })
        .catch((err) => {
            console.log('>>>>> error', err)
        })
})

router.put('/todo/:id', (req, res) => {
    const todoID = req.params.id;
    const updatedTodo = req.body;

    Todo.updateOne(
        { 'id': todoID },
        {
            title: updatedTodo.title,
            description: updatedTodo.description,
            notes: updatedTodo.notes,
            category: updatedTodo.category,
            reminder: updatedTodo.reminder,
            completed: updatedTodo.completed
        }
    )
        .then((result) => {
            res.send(updatedTodo)
        })
        .catch((err) => {
            console.log('>>>>> error here', err)
        })
})

// POST new todo to database
router.put('/add', async (req, res) => {
    let todo = req.body;
    try {
        const todo = new Todo({
            id: req.body.id,
            title: req.body.title,
            description: req.body.description,
            notes: req.body.notes,
            category: req.body.category,
            reminder: req.body.reminder,
            completed: req.body.completed
        })

        // Mongoose save to database
        todo.save()

            .then((todo) => {
                res.json(todo)
            })
            .catch((err) => {
                console.log('>>>>> error saving todo', err)
            })
    } catch {
        res.sendStatus(500).send()
    }

})

module.exports = router;