// TodoItem class that generates a simple task element
class TodoItem {
    constructor(taskTitle, timestamp = null, completed = false) {
        this.taskTitle = taskTitle;
        this.timestamp = timestamp;
        this.completed = completed;
    }

    generateElement() {
        // Same code as in your generateTaskElement function
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center"; // Bootstrap classes

        const titleDiv = document.createElement("div");
        titleDiv.className = "task-title";
        titleDiv.textContent = this.taskTitle;

        const timestampDiv = document.createElement("div");
        timestampDiv.className = "timestamp"; // Bootstrap class for muted text
        timestampDiv.textContent = this.timestamp ? this.timestamp : `${new Date().toLocaleString()}`;

        const closeDiv = document.createElement("div");
        closeDiv.className = "close text-danger"; // Bootstrap class for red text
        closeDiv.style.cursor = "pointer"; // Make the close button look clickable
        closeDiv.textContent = "\u00D7";

        if (this.completed) {
            li.classList.add('checked');
        }

        li.append(titleDiv, timestampDiv, closeDiv);
        attachTaskEvents(li, titleDiv);  // Attach events to each task for editing and closing
        return li;
    }
}

// TodoItemPremium class that extends TodoItem to add an icon
class TodoItemPremium extends TodoItem {
    constructor(taskTitle, iconURL, timestamp = null, completed = false) {
        super(taskTitle, timestamp, completed);
        this.iconURL = iconURL;
    }

    generateElement() {
        const li = super.generateElement();

        const iconDiv = document.createElement("img");
        iconDiv.src = this.iconURL;
        iconDiv.className = "task-icon";
        iconDiv.width = 20;
        iconDiv.height = 20;

        li.append(iconDiv);
        return li;
    }
}

// Initialize all the UI elements
const init = () => {
    addTaskRemovalListeners();
    addTaskToggleListeners();
    addTitleEditListeners();
    attachKeydownEvents();
    attachBulkActions();
    initSortingDropdown();
    loadTasks();
    loadSortPreference();
    addClearStorageListeners();
    attachRandomPickListener();
};


// Attach event listeners to close buttons for task removal
const addTaskRemovalListeners = () => {
    document.querySelectorAll(".close").forEach(btn => {
        btn.addEventListener("click", function() {
            const listItem = this.closest('li'); // Get the closest li (list item) of the clicked close button
            listItem.remove(); // Remove the list item from the DOM
        });
    });
};


// Toggle 'checked' class on list items upon click
const addTaskToggleListeners = () => {
    document.querySelector('ul').addEventListener('click', ev => {
        if (ev.target.tagName === 'LI' || ev.target.classList.contains('task-title')) {
            ev.target.closest('LI').classList.toggle('checked');
            saveTasks()
        }
    });
};

// Handle task title editing upon double-click
const promptForTitleUpdate = (titleDiv, listItem) => {
    const currentTitle = titleDiv.textContent.trim();
    const newTitle = prompt("Please edit your task title:", currentTitle);
    if (newTitle !== null && newTitle.trim() !== "") {
        titleDiv.textContent = newTitle.trim();
        listItem.querySelector(".timestamp").textContent = `(Modified) ${new Date().toLocaleString()}`;
        const taskList = document.getElementById("myUL");
        taskList.prepend(listItem);
    }
};

// Attach event listeners for double-clicking to edit tasks
const addTitleEditListeners = () => {
    document.querySelectorAll(".task-title").forEach(titleDiv => {
        titleDiv.addEventListener("dblclick", function() {
            const listItem = this.closest("LI");
            promptForTitleUpdate(this, listItem);
        });
    });
};

const addClearStorageListeners = () => {
    document.getElementById("clear-storage").addEventListener("click", () => {
        localStorage.clear();
        location.reload();
    });
};

// Create a new task and append to the list
const addNewTask = () => {
    const inputValue = document.getElementById("myInput").value.trim();
    if (inputValue === '') {
        alert("Kindly enter a task before proceeding.");
        return;
    }
    const li = generateTaskElement(inputValue);
    const taskList = document.getElementById("myUL");
    taskList.prepend(li);
    document.getElementById("myInput").value = "";
    addTaskRemovalListeners();
    saveTasks();
};

// Create a new task element
const generateTaskElement = (taskTitle, timestamp = null, completed = false) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center"; // Bootstrap classes

    const titleDiv = document.createElement("div");
    titleDiv.className = "task-title";

    const timestampDiv = document.createElement("div");
    timestampDiv.className = "timestamp"; // Bootstrap class for muted text

    const closeDiv = document.createElement("div");
    closeDiv.className = "close text-danger"; // Bootstrap class for red text
    closeDiv.style.cursor = "pointer"; // Make the close button look clickable

    titleDiv.textContent = taskTitle;
    timestampDiv.textContent = `${new Date().toLocaleString()}`;
    closeDiv.textContent = "\u00D7";

    if (timestamp) {
        timestampDiv.textContent = timestamp;
    } else {
        timestampDiv.textContent = `${new Date().toLocaleString()}`;
    }
    if (completed) {
        li.classList.add('checked');
    }

    li.append(titleDiv, timestampDiv, closeDiv);
    attachTaskEvents(li, titleDiv);
    return li;
};


// Attach events to each task for editing and closing
const attachTaskEvents = (li, titleDiv) => {
    titleDiv.addEventListener("dblclick", function() {
        promptForTitleUpdate(titleDiv, li);
    });
    li.querySelector(".close").addEventListener("click", function() {
        li.style.display = "none";
    });
};

// Set up keyboard shortcuts for task input
const attachKeydownEvents = () => {
    document.addEventListener("keydown", e => {
        if (e.key === "Enter" && e.target.id === "myInput") {
            addNewTask();
        } else if (e.key === "Escape") {
            document.getElementById("myInput").value = "";
        }
    });
};

// Attach bulk task actions for delete and remove
const attachBulkActions = () => {
    document.getElementById("rem-all").addEventListener("click", allTasksRemoval);
    document.getElementById("rem-completed").addEventListener("click", completedTasksRemoval);
};

// Delete all tasks with confirmation
const allTasksRemoval = () => {
    const taskList = document.getElementById("myUL");
    const totalTasks = taskList.querySelectorAll('li').length;
    const uncompletedTasks = taskList.querySelectorAll('li:not(.checked)').length;

    // Check if the list is empty
    if (totalTasks === 0) {
        alert("There are no tasks to delete.");
        return;
    }

    const shouldDelete = uncompletedTasks === 0 || confirm(`Are you certain? You have ${uncompletedTasks} pending tasks.`);
    if (shouldDelete) {
        taskList.textContent = '';
    }
    saveTasks();
};

// Remove completed tasks from the list
const completedTasksRemoval = () => {
    const completedTasks = document.querySelectorAll('li.checked');
    if (completedTasks.length === 0) {
        alert("There are no completed tasks to remove.");
        return;
    }

    completedTasks.forEach(item => {
        item.remove();
    });
    saveTasks();
};


const sortTasks = (order) => {
    const taskList = document.getElementById("myUL");
    const tasks = Array.from(taskList.children);
    tasks.sort((a, b) => {
        const dateA = new Date(a.querySelector(".timestamp").textContent.trim());
        const dateB = new Date(b.querySelector(".timestamp").textContent.trim());
        return order === "asc" ? dateA - dateB : dateB - dateA;
    });
    tasks.forEach(task => taskList.appendChild(task)); // Re-render tasks in sorted order
    saveSortPreference();
};


const initSortingDropdown = () => {
    const dropdown = document.getElementById("sort-dropdown");
    dropdown.addEventListener("change", function() {
        const sortBy = this.value;
        sortTasks(sortBy);
        saveSortPreference();
    });
};

// Function to save tasks to local storage
const saveTasks = () => {
    const tasks = Array.from(document.querySelectorAll('li')).map(li => {
        return {
            title: li.querySelector(".task-title").textContent.trim(),
            timestamp: li.querySelector(".timestamp").textContent.trim(),
            completed: li.classList.contains('checked')
        };
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
};



// Function to load tasks from local storage
const loadTasks = () => {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    tasks.forEach(task => {
        const li = generateTaskElement(task.title, task.timestamp, task.completed);
        document.getElementById("myUL").appendChild(li);
    });
};


// Function to save sorting preference to local storage
const saveSortPreference = () => {
    const sortPreference = document.getElementById("sort-dropdown").value;
    localStorage.setItem('sortPreference', sortPreference);
};

// Function to load sorting preference from local storage
const loadSortPreference = () => {
    const sortPreference = localStorage.getItem('sortPreference');
    if (sortPreference) {
        document.getElementById("sort-dropdown").value = sortPreference;
        sortTasks(sortPreference);
    }
};

// Attach event listener to pick a random task
const attachRandomPickListener = () => {
    document.getElementById("pick-random").addEventListener("click", pickRandomTask);
};

// Function to pick a random task and highlight it
const pickRandomTask = () => {
    const tasks = document.querySelectorAll('li:not(.checked)'); // Select all tasks that are not completed
    if (tasks.length === 0) {
        alert("No tasks available to pick.");
        return;
    }

    // Deselect any previously selected task
    document.querySelectorAll('.active').forEach(task => {
        task.classList.remove('active');
    });

    // Randomly pick a task and highlight it
    const randomIndex = Math.floor(Math.random() * tasks.length);
    tasks[randomIndex].classList.add('active');
};


// Kickstart the application
init();
