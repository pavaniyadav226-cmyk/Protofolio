document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    const taskCount = document.getElementById('task-count');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const filterButtons = document.querySelectorAll('.filter-btn');

    // Application State
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';

    // Theme Switcher Logic
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        htmlElement.setAttribute('data-theme', newTheme);
    });

    // Save Tasks to LocalStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Render Tasks based on current filter
    function renderTasks() {
        todoList.innerHTML = '';

        // Filter tasks
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'active') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true;
        });

        if (filteredTasks.length === 0) {
            todoList.innerHTML = `<p style="text-align: center; color: var(--text-secondary); padding: 1rem;">No tasks found.</p>`;
        }

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `todo-item ${task.completed ? 'completed' : ''}`;
            li.setAttribute('data-id', task.id);

            li.innerHTML = `
                <div class="task-left">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="task-text">${escapeHTML(task.text)}</span>
                </div>
                <div class="task-actions">
                    <button class="btn-icon edit" title="Edit Task">✏️</button>
                    <button class="btn-icon delete" title="Delete Task">🗑️</button>
                </div>
            `;
            todoList.appendChild(li);
        });

        // Update active item count
        const activeCount = tasks.filter(t => !t.completed).length;
        taskCount.textContent = `${activeCount} item${activeCount === 1 ? '' : 's'} left`;
    }

    // Create Task (CRUD - Create)
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = todoInput.value.trim();
        if (!text) return;

        const newTask = {
            id: Date.now().toString(),
            text: text,
            completed: false
        };

        tasks.push(newTask);
        saveTasks();
        renderTasks();
        todoInput.value = '';
    });

    // Delegated Event Listener for Update & Delete (CRUD - Read, Update, Delete)
    todoList.addEventListener('click', (e) => {
        const target = e.target;
        const itemElement = target.closest('.todo-item');
        if (!itemElement) return;
        const taskId = itemElement.getAttribute('data-id');

        // Toggle Completed Status (Update)
        if (target.classList.contains('task-checkbox')) {
            tasks = tasks.map(task => {
                if (task.id === taskId) {
                    return { ...task, completed: target.checked };
                }
                return task;
            });
            saveTasks();
            renderTasks();
        }

        // Delete Task (Delete)
        if (target.classList.contains('delete')) {
            tasks = tasks.filter(task => task.id !== taskId);
            saveTasks();
            renderTasks();
        }

        // Edit Task Text (Update)
        if (target.classList.contains('edit')) {
            const taskObj = tasks.find(t => t.id === taskId);
            const newText = prompt('Edit your task:', taskObj.text);
            if (newText !== null && newText.trim() !== '') {
                taskObj.text = newText.trim();
                saveTasks();
                renderTasks();
            }
        }
    });

    // Filter Navigation Handling
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderTasks();
        });
    });

    // Clear Completed Tasks
    clearCompletedBtn.addEventListener('click', () => {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
    });

    // Helper to sanitize input strings
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    // Initial Render on Page Load
    renderTasks();
});
