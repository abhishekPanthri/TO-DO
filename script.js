document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('todo-input');
    const dateInput = document.getElementById('todo-date');
    const timeInput = document.getElementById('todo-time');
    const prioritySelector = document.getElementById('priority-selector');
    const addButton = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const searchInput = document.getElementById('search-input');
    const themeToggle = document.getElementById('theme-toggle');
    const dateIcon = document.getElementById('date-icon');
    const timeIcon = document.getElementById('time-icon');

    // Initialize Flatpickr for the calendar
    const flatpickrInstance = flatpickr(dateInput, {
        dateFormat: "d-m-Y", // Change format to DD-MM-YYYY
        allowInput: true,
        position: "auto", // Automatically position the calendar near the icon
        onReady: (selectedDates, dateStr, instance) => {
            if (instance.calendarContainer) { // Ensure calendarContainer exists
                const setButton = document.createElement('button');
                setButton.textContent = 'Set';
                setButton.className = 'flatpickr-set-btn';
                setButton.addEventListener('click', () => {
                    instance.close(); // Close the calendar pop-up
                });
                instance.calendarContainer.appendChild(setButton);
            }
        },
    });

    // Show Flatpickr pop-up when the calendar icon is clicked
    dateIcon.addEventListener('click', () => {
        flatpickrInstance.open();
    });

    // Initialize Flatpickr for the time picker
    const flatpickrTimeInstance = flatpickr(timeInput, {
        enableTime: true, // Enable time selection
        noCalendar: true, // Disable calendar
        dateFormat: "h:i K", // Format as HH:MM AM/PM
        time_24hr: false, // Use 12-hour format with AM/PM
        position: "auto", // Automatically position the time picker near the icon
        onReady: (selectedDates, dateStr, instance) => {
            if (instance.calendarContainer) { // Ensure calendarContainer exists
                const setButton = document.createElement('button');
                setButton.textContent = 'Set';
                setButton.className = 'flatpickr-set-btn';
                setButton.addEventListener('click', () => {
                    instance.close(); // Close the time picker pop-up
                });
                instance.calendarContainer.appendChild(setButton);
            }
        },
    });

    // Show Flatpickr pop-up when the clock icon is clicked
    timeIcon.addEventListener('click', () => {
        flatpickrTimeInstance.open();
    });

    // Load tasks from localStorage on page load
    function loadTasksFromLocalStorage() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => {
            addTaskToDOM(task.text, task.date, task.time, task.priority);
        });
    }

    // Save tasks to localStorage
    function saveTasksToLocalStorage() {
        const tasks = [];
        document.querySelectorAll('.todo-item').forEach(item => {
            const taskTextElement = item.querySelector('.task-text');
            const taskDateElement = item.querySelector('.task-date');
            const taskTimeElement = item.querySelector('.task-time');

            // Ensure all required elements exist before accessing their properties
            if (taskTextElement && taskDateElement && taskTimeElement) {
                const taskText = taskTextElement.textContent;
                const taskDate = taskDateElement.textContent;
                const taskTime = taskTimeElement.textContent;
                const taskPriority = item.className.split(' ')[1].replace('-priority', '');

                tasks.push({ text: taskText, date: taskDate, time: taskTime, priority: taskPriority });
            }
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Save deleted tasks to localStorage
    function saveDeletedTaskToLocalStorage(task) {
        const deletedTasks = JSON.parse(localStorage.getItem('deletedTasks')) || [];
        deletedTasks.push(task);
        localStorage.setItem('deletedTasks', JSON.stringify(deletedTasks));
    }

    // Restore deleted tasks from localStorage
    function restoreDeletedTask(task) {
        addTaskToDOM(task.text, task.date, task.time, task.priority); // Add task back to the DOM
        saveTasksToLocalStorage();

        // Remove the restored task from deletedTasks
        const deletedTasks = JSON.parse(localStorage.getItem('deletedTasks')) || [];
        const updatedDeletedTasks = deletedTasks.filter(
            t => !(t.text === task.text && t.date === task.date && t.time === task.time && t.priority === task.priority)
        );
        localStorage.setItem('deletedTasks', JSON.stringify(updatedDeletedTasks));
    }

    // Add task to the DOM
    function addTaskToDOM(taskText, taskDate, taskTime, taskPriority) {
        const listItem = document.createElement('li');
        listItem.className = `todo-item ${taskPriority}-priority`; // Add priority-specific class

        const taskDetailsContainer = document.createElement('div');
        taskDetailsContainer.style.flex = '1';
        taskDetailsContainer.style.display = 'flex';
        taskDetailsContainer.style.flexDirection = 'column';

        const taskSpan = document.createElement('span');
        taskSpan.className = 'task-text';
        taskSpan.textContent = taskText;
        taskSpan.style.fontWeight = 'bold';

        const dateTimeSpan = document.createElement('span');
        dateTimeSpan.className = 'task-datetime';
        dateTimeSpan.textContent = `${taskDate} ${taskTime}`;
        dateTimeSpan.style.fontSize = '0.9rem';
        dateTimeSpan.style.color = '#666';

        taskDetailsContainer.appendChild(taskSpan);
        taskDetailsContainer.appendChild(dateTimeSpan);

        const prioritySpan = document.createElement('span');
        prioritySpan.className = 'priority';
        prioritySpan.textContent = `Priority: ${taskPriority.charAt(0).toUpperCase() + taskPriority.slice(1)}`;
        prioritySpan.style.fontSize = '0.8rem';
        prioritySpan.style.color = '#888';

        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = 'edit-btn';
        editButton.addEventListener('click', () => {
            input.value = taskText;
            dateInput.value = taskDate;
            timeInput.value = taskTime;
            prioritySelector.value = taskPriority;
            todoList.removeChild(listItem);
            saveTasksToLocalStorage();
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-btn';
        deleteButton.addEventListener('click', () => {
            const deletedTask = {
                text: taskText,
                date: taskDate,
                time: taskTime,
                priority: taskPriority,
            };
            saveDeletedTaskToLocalStorage(deletedTask); // Save deleted task
            todoList.removeChild(listItem);
            saveTasksToLocalStorage();
        });

        buttonContainer.appendChild(editButton);
        buttonContainer.appendChild(deleteButton);

        listItem.appendChild(taskDetailsContainer);
        listItem.appendChild(prioritySpan);
        listItem.appendChild(buttonContainer);
        todoList.appendChild(listItem);
    }

    // Add Task
    addButton.addEventListener('click', () => {
        const taskText = input.value.trim();
        const taskDate = dateInput.value;
        const taskTime = timeInput.value;
        const taskPriority = prioritySelector.value;

        if (taskText === '' || taskDate === '' || taskTime === '') {
            alert('Please fill in all fields before adding a task.');
            return;
        }

        addTaskToDOM(taskText, taskDate, taskTime, taskPriority);
        saveTasksToLocalStorage();

        // Refresh only the relevant input fields
        input.value = ''; // Clear the task text input
        dateInput.value = ''; // Clear the date input
        timeInput.value = ''; // Clear the time input
        prioritySelector.value = 'low'; // Reset the priority selector to "low"
    });

    // Load tasks on page load
    loadTasksFromLocalStorage();

    // Search Tasks
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const tasks = document.querySelectorAll('.todo-item');
        tasks.forEach(task => {
            const taskText = task.querySelector('.task-text').textContent.toLowerCase();
            task.style.display = taskText.includes(searchTerm) ? 'flex' : 'none';
        });
    });

    // Toggle Night Mode
    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('night-mode');
        const todoContainer = document.querySelector('.todo-container');
        todoContainer.classList.toggle('night-mode');

        // Toggle night mode for all tasks
        document.querySelectorAll('.todo-item').forEach(item => {
            item.classList.toggle('night-mode');
        });

        // Toggle night mode for inputs and buttons
        [input, dateInput, timeInput, prioritySelector, searchInput].forEach(element => {
            element.classList.toggle('night-mode');
        });

        // Toggle night mode for buttons and links
        document.querySelectorAll('button, .analytics-link').forEach(button => {
            button.classList.toggle('night-mode');
        });

        // Toggle night mode for headings and paragraphs
        document.querySelectorAll('h1, h2, p').forEach(element => {
            element.classList.toggle('night-mode');
        });
    });
});
