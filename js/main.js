const addTodo = document.querySelector('#addTodo')
const containers = document.querySelectorAll('.container')
const done = document.querySelector('.done')
const welldone = document.querySelector('.welldone')
addTodo.addEventListener('keydown', (e) => {
    if (e.key === "Enter") {
        createTodo(e.target.value)
        e.target.value = ''
    }
})
const createTodo = (text) => {
    setElementToStorage(text);
    displayTodos();
}
const setElementToStorage = (text) => {
    const randomId = Math.random() * 100000
    let urgentStorage = JSON.parse(localStorage.getItem("urgent") || '[]')
    urgentStorage.push({ text, id: randomId, status: "urgent" });
    localStorage.setItem('urgent', JSON.stringify(urgentStorage))
    return randomId;
}
const dragEvent = (id, todo) => {
    todo.addEventListener('dragstart', (e) => {
        todo.classList.add('moving')
        updateStatus(id, e.target.parentElement.classList[1])
    })
    todo.addEventListener('dragend', (e) => {
        todo.classList.remove('moving')
        const indexOfTodo = [...e.target.parentElement.childNodes].indexOf(e.target);
        const currentContainer = e.target.parentElement.classList[1];
        console.log(currentContainer);
        if (currentContainer === "done") {
            borderAnimation(done)
        }
        if (currentContainer !== 'trashcan') {
            let currentStorage = JSON.parse(localStorage.getItem(currentContainer) || '[]')
            let movingStorage = JSON.parse(localStorage.getItem(`moving`))
            movingStorage.status = currentContainer
            currentStorage.splice(indexOfTodo, 0, movingStorage);
            localStorage.setItem(currentContainer, JSON.stringify(currentStorage))
        } else {
            const toDelete = document.querySelector('.trashcan .todo')
            toDelete.remove()
        }
    })

}
const updateStatus = (id, status) => {
    const storedTodos = JSON.parse(localStorage.getItem(status));
    const deletedElement = storedTodos.filter(todo => todo.id === id);
    const updatedTodos = storedTodos.filter(todo => todo.id !== id);
    localStorage.setItem(status, JSON.stringify(updatedTodos));
    localStorage.setItem(`moving`, JSON.stringify(deletedElement[0]))
}

containers.forEach(container => {
    container.addEventListener('dragover', (e) => {
        e.preventDefault();
        const theElementAfter = getDragAfterElement(container, e.clientY)
        const moving = document.querySelector('.moving')
        if (theElementAfter == null) {
            container.appendChild(moving)
        } else {
            container.insertBefore(moving, theElementAfter)
        }
    })
})

const displayTodos = () => {
    const containers = ['urgent', 'notUrgent', 'done']
    containers.forEach(container => {
        const todoContainer = document.querySelector(`.${container}`);
        todoContainer.innerHTML = '';
        const storage = JSON.parse(localStorage.getItem(container) || '[]')
        if (storage.length > 0) {
            storage.forEach(el => {
                const todo = document.createElement('p');
                todo.classList.add('todo');
                todo.setAttribute('draggable', 'true');
                todo.setAttribute('key', el.id);
                todo.textContent = el.text;
                todoContainer.append(todo);
                dragEvent(el.id, todo)
            })
        }

    })
}
const getDragAfterElement = (otherTodos, y) => {
    const notMovingDraggables = [...otherTodos.querySelectorAll('.todo:not(.moving)')];
    return notMovingDraggables.reduce((closest, child) => {
        const box = child.getBoundingClientRect()
        const offset = y - box.top - box.height / 2
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child }
        } else {
            return closest
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element
}
const borderAnimation = (container) => {
    container.classList.add('animate-border'); // Activate the animation
    welldone.textContent = "WELLDONE"
    welldone.style.color = "orange"
    // Remove the animation class after 3 seconds (same as animation duration)
    setTimeout(() => {
        container.classList.remove('animate-border');
        welldone.textContent = "DONE"
        welldone.style.color = ""
    }, 3000); // 3000ms = 3 seconds
}


displayTodos();