document.addEventListener('DOMContentLoaded', () => {
    // Fetch task data from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let deletedTasks = JSON.parse(localStorage.getItem('deletedTasks')) || [];

    // Count tasks by priority
    const priorityCounts = {
        low: 0,
        medium: 0,
        high: 0,
    };

    tasks.forEach(task => {
        priorityCounts[task.priority]++;
    });

    // Render the pie chart for active tasks
    const ctx = document.getElementById('priorityChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Low Priority', 'Medium Priority', 'High Priority'],
            datasets: [{
                data: [priorityCounts.low, priorityCounts.medium, priorityCounts.high],
                backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
            },
        },
    });

    // Function to update the deleted tasks pie chart
    function updateDeletedTasksChart(chart, deletedTasks) {
        const deletedPriorityCounts = {
            low: 0,
            medium: 0,
            high: 0,
        };

        deletedTasks.forEach(task => {
            deletedPriorityCounts[task.priority]++;
        });

        chart.data.datasets[0].data = [
            deletedPriorityCounts.low,
            deletedPriorityCounts.medium,
            deletedPriorityCounts.high,
        ];
        chart.update();
    }

    // Render the pie chart for deleted tasks
    const deletedCtx = document.createElement('canvas');
    deletedCtx.id = 'deletedPriorityChart';
    deletedCtx.width = 400;
    deletedCtx.height = 400;
    document.querySelector('.todo-container').appendChild(deletedCtx);

    const deletedTasksChart = new Chart(deletedCtx.getContext('2d'), {
        type: 'pie',
        data: {
            labels: ['Low Priority', 'Medium Priority', 'High Priority'],
            datasets: [{
                data: [0, 0, 0], // Initial data
                backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
            },
        },
    });

    // Initial update of the deleted tasks chart
    updateDeletedTasksChart(deletedTasksChart, deletedTasks);

    // Display the number of deleted tasks
    const deletedTaskCountElement = document.createElement('p');
    deletedTaskCountElement.textContent = `Deleted Tasks: ${deletedTasks.length}`;
    document.querySelector('.todo-container').appendChild(deletedTaskCountElement);

    // Display the list of deleted tasks with restore and delete buttons
    const deletedTaskList = document.createElement('ul');
    deletedTaskList.id = 'deleted-task-list';
    deletedTaskList.style.listStyle = 'none';
    deletedTaskList.style.padding = '0';

    deletedTasks.forEach((task, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'deleted-task-item';
        listItem.style.display = 'flex';
        listItem.style.justifyContent = 'space-between';
        listItem.style.alignItems = 'center';
        listItem.style.padding = '10px';
        listItem.style.borderBottom = '1px solid #ddd';

        const taskText = document.createElement('span');
        taskText.textContent = `${task.text} - ${task.date} ${task.time} (Priority: ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)})`;

        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';

        const restoreButton = document.createElement('button');
        restoreButton.textContent = 'Restore';
        restoreButton.className = 'restore-btn';
        restoreButton.addEventListener('click', () => {
            restoreDeletedTask(task); // Restore the clicked task
            deletedTasks.splice(index, 1); // Remove the task from the deletedTasks array
            localStorage.setItem('deletedTasks', JSON.stringify(deletedTasks)); // Update localStorage
            listItem.remove(); // Remove the task from the UI
            deletedTaskCountElement.textContent = `Deleted Tasks: ${deletedTasks.length}`; // Update the count
            updateDeletedTasksChart(deletedTasksChart, deletedTasks); // Update the chart
        });

        const deletePermanentlyButton = document.createElement('button');
        deletePermanentlyButton.textContent = 'Permanently Delete';
        deletePermanentlyButton.className = 'delete-btn';
        deletePermanentlyButton.addEventListener('click', () => {
            deletedTasks.splice(index, 1); // Remove the task from the deletedTasks array
            localStorage.setItem('deletedTasks', JSON.stringify(deletedTasks)); // Update localStorage
            listItem.remove(); // Remove the task from the UI
            deletedTaskCountElement.textContent = `Deleted Tasks: ${deletedTasks.length}`; // Update the count
            updateDeletedTasksChart(deletedTasksChart, deletedTasks); // Update the chart
        });

        buttonContainer.appendChild(restoreButton);
        buttonContainer.appendChild(deletePermanentlyButton);

        listItem.appendChild(taskText);
        listItem.appendChild(buttonContainer);
        deletedTaskList.appendChild(listItem);
    });

    document.querySelector('.todo-container').appendChild(deletedTaskList);

    // Add a restore all button for deleted tasks
    const restoreAllButton = document.createElement('button');
    restoreAllButton.textContent = 'Restore All Deleted Tasks';
    restoreAllButton.className = 'restore-btn';
    restoreAllButton.addEventListener('click', () => {
        deletedTasks.forEach(task => {
            restoreDeletedTask(task); // Restore each deleted task
        });
        localStorage.setItem('deletedTasks', JSON.stringify([])); // Clear deleted tasks
        alert('All deleted tasks have been restored!');
        location.reload(); // Reload the page to update analytics
    });
    document.querySelector('.todo-container').appendChild(restoreAllButton);

    // Restore deleted task function
    function restoreDeletedTask(task) {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push(task); // Add the restored task to active tasks
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
});
