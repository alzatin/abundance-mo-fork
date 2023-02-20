import React from 'react'
import Todo from './Todo.jsx'

export default function TodoList({todos, toggleTodo}) {
    return (
        todos.map(todo => {
            return <Todo key = {todo.id} todo = {todo} toggleTodo = {toggleTodo}/>
        })
    );
}