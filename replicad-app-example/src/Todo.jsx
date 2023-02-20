import React from "react";

export default function Todo({todo, toggleTodo}){
    function hangleTodoClick(){
        toggleTodo(todo.id);
    }
    return (

        <div>
            <label>
                <input type = "checkbox" checked = {todo.complete} onChange={hangleTodoClick}/>
                {todo.name}
            </label>
        </div>

    )
}