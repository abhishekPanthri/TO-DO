document.addEventListener('DOMContentLoaded', () => {
    const completedTasks = JSON.parse(localStorage.getItem('completedTasks')) || [];
    const completedTaskCountElement = document.getElementById('completed-task-count');
    const completedTaskList = document.getElementById('completed-task-list');

    // Check if completed tasks exceed the limit
    if (completedTasks.length > 10) {
        localStorage.setItem('completedTasks', JSON.stringify([])); // Clear completed tasks
        alert('Completed tasks exceeded the limit of 10. The list has been cleared.');
        completedTaskCountElement.textContent = 'Completed Tasks: 0';
        return;
    }

    completedTaskCountElement.textContent = `Completed Tasks: ${completedTasks.length}`;

    completedTasks.forEach(task => {
        const listItem = document.createElement('li');
        listItem.className = 'completed-task-item';
        listItem.textContent = `${task.text} - ${task.date} ${task.time} (Priority: ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)})`;
        completedTaskList.appendChild(listItem);
    });
});
