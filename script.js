// script.js
document.addEventListener("DOMContentLoaded", () => {
    const filterButtons = document.querySelectorAll(".filter-btn");
    const taskBoxes = document.querySelectorAll(".task-box");
    const taskList = document.querySelector(".task-list");
    const topTotalAmount = document.querySelector(".top-total-amount");
    const categoryBadges = document.querySelectorAll(".category-badge");
    let selectedTasks = [];

    // Filter Tasks
    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            const filter = button.dataset.filter;
            taskBoxes.forEach(task => {
                const taskType = task.dataset.type;
                if (filter === "all" || taskType === filter) {
                    task.classList.remove("hidden");
                } else {
                    task.classList.add("hidden");
                }
            });
        });
    });

    // Add Task on Click (Prevent Re-Selection)
    taskBoxes.forEach(task => {
        task.addEventListener("click", () => {
            const taskName = task.querySelector("span").textContent;
            const price = parseFloat(task.dataset.price || 0);
            const unit = task.dataset.unit || "jobs";
            const taskPart = task.closest(".category-box").dataset.part;
            const taskId = `${taskName}-${Date.now()}`; // Unique ID for duplicates

            // Check if this exact task (by name) is already selected
            if (!selectedTasks.some(t => t.name === taskName)) {
                selectedTasks.push({ id: taskId, name: taskName, price, quantity: 1, unit, remarks: "", part: taskPart });
                task.classList.add("selected");
                renderSelectedTasks();
                updateCategoryBadges();
                addRemoveIcon(task);
            }
        });
    });

    // Render Selected Tasks
    function renderSelectedTasks() {
        taskList.innerHTML = "";
        selectedTasks.forEach((task, index) => {
            const isLitres = task.unit === "litres";
            const quantityLabel = isLitres ? "Litres" : "Jobs";
            const taskItem = document.createElement("div");
            taskItem.classList.add("selected-task-item");
            taskItem.innerHTML = `
                <div class="task-header">
                    <span>${task.name}</span>
                    <div class="job-input">
                        <label>${quantityLabel}:</label>
                        <input type="number" min="1" value="${task.quantity}">
                    </div>
                    <button class="remove-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div class="subtotal">Subtotal: $${(task.price * task.quantity).toFixed(2)}</div>
                <div class="task-remarks">
                    <textarea placeholder="Add notes for this task...">${task.remarks}</textarea>
                </div>
            `;
            taskList.appendChild(taskItem);

            // Quantity Input (Jobs or Litres)
            const quantityInput = taskItem.querySelector("input");
            const subtotalElement = taskItem.querySelector(".subtotal");
            quantityInput.addEventListener("input", () => {
                task.quantity = parseInt(quantityInput.value) || 1;
                subtotalElement.textContent = `Subtotal: $${(task.price * task.quantity).toFixed(2)}`;
                updateTotals();
            });

            // Remarks Input
            const remarksInput = taskItem.querySelector("textarea");
            remarksInput.addEventListener("input", () => {
                task.remarks = remarksInput.value;
            });

            // Remove Button in Sidebar
            const removeBtn = taskItem.querySelector(".remove-btn");
            removeBtn.addEventListener("click", () => {
                const taskName = task.name;
                selectedTasks = selectedTasks.filter(t => t.name !== taskName);
                const originalTask = Array.from(taskBoxes).find(t => t.querySelector("span").textContent === taskName);
                if (originalTask) originalTask.classList.remove("selected");
                renderSelectedTasks();
                updateCategoryBadges();
                removeRemoveIcon(originalTask);
            });
        });
        updateTotals();
    }

    // Update Totals
    function updateTotals() {
        const total = selectedTasks.reduce((sum, task) => sum + task.price * task.quantity, 0);
        topTotalAmount.textContent = `$${total.toFixed(2)}`; // Only update top total
    }

    // Update Category Badges
    function updateCategoryBadges() {
        const taskCountByPart = {};
        selectedTasks.forEach(task => {
            taskCountByPart[task.part] = (taskCountByPart[task.part] || 0) + 1;
        });

        categoryBadges.forEach(badge => {
            const part = badge.closest(".category-box").dataset.part;
            badge.textContent = taskCountByPart[part] || 0;
        });
    }

    // Add Remove Icon to Task Box
    function addRemoveIcon(task) {
        const removeIcon = document.createElement("div");
        removeIcon.classList.add("task-remove");
        removeIcon.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 18L18 6M6 6l12 12" />
            </svg>
        `;
        removeIcon.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent triggering task click
            const taskName = task.querySelector("span").textContent;
            selectedTasks = selectedTasks.filter(t => t.name !== taskName);
            task.classList.remove("selected");
            renderSelectedTasks();
            updateCategoryBadges();
            removeRemoveIcon(task);
        });
        task.appendChild(removeIcon);
    }

    // Remove Remove Icon from Task Box
    function removeRemoveIcon(task) {
        if (task) {
            const removeIcon = task.querySelector(".task-remove");
            if (removeIcon) removeIcon.remove();
        }
    }

    // Initialize remove icons for already selected tasks (if any)
    taskBoxes.forEach(task => {
        if (task.classList.contains("selected")) {
            addRemoveIcon(task);
        }
    });
});