const apiUrl = 'http://localhost:3000/api/data';

// Загрузка сотрудников из API при загрузке страницы
let employees = [];

async function fetchEmployees() {
    const response = await fetch(apiUrl);
    employees = await response.json();
}

async function addEmployee(employee) {
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employee)
    });
    return response.json();
}

async function updateEmployee(index, employee) {
    await fetch(`${apiUrl}/${index}`, { // Используем индекс для уникальности
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employee)
    });
}

async function deleteEmployee(index) {
    await fetch(`${apiUrl}/${index}`, {
        method: 'DELETE'
    });
}

// Функция для отображения сотрудников
async function displayEmployees() {
    const list = document.getElementById('list');
    list.innerHTML = ''; // Очищаем список перед обновлением
    const searchTerm = document.getElementById('search').value.toLowerCase();

    employees.forEach((emp, index) => {
        if (emp["Фамилия"].toLowerCase().includes(searchTerm)) {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${emp["Фамилия"]} ${emp["Имя"]} ${emp["Отчество"] ? emp["Отчество"] : ''}</strong><br>
                <em>Должность: ${emp["Должность"]}</em><br>
                <em>Подразделение: ${emp["Подразделение"]}</em><br>
                <em>Организация: ${emp["Организация"]}</em><br>
                <em>Email: ${emp["E-mail"]}</em><br>
                <em>Телефон: ${emp["Контактный номер"]}</em>
            `;

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Редактировать';
            editBtn.onclick = function() {
                const password = prompt("Введите пароль для редактирования:");
                if (password === "111") { // Замените "111" своим паролем
                    // Заполнение формы данными сотрудника
                    Array.from(document.getElementById('employeeForm').elements).forEach((input) => {
                        if (input.tagName === "INPUT") {
                            const key = input.placeholder;
                            input.value = emp[key] || ""; // Заполнение формы
                        }
                    });
                    // Установка индекса редактируемого сотрудника
                    document.getElementById('employeeForm').setAttribute('data-index', index);
                    document.getElementById('createEmployee').classList.remove('hidden');
                    document.getElementById('employeeList').classList.add('hidden');
                } else {
                    alert("Неверный пароль.");
                }
            };
            li.appendChild(editBtn);

            const delBtn = document.createElement('button');
            delBtn.textContent = 'Удалить';
            delBtn.onclick = async function() {
                const password = prompt("Введите пароль для подтверждения удаления:");
                if (password === "111") { // Замените "111" своим паролем
                    if (confirm("Вы уверены, что хотите удалить этого сотрудника?")) {
                        await deleteEmployee(index); // Удаляем сотрудника из API
                        employees.splice(index, 1); // Удаляем сотрудника из массива
                        displayEmployees(); // Обновляем отображение
                    }
                } else {
                    alert("Неверный пароль.");
                }
            };
            li.appendChild(delBtn);
            list.appendChild(li);
        }
    });
}

// Отображаем форму создания сотрудника
document.getElementById('createBtn').onclick = function() {
    document.getElementById('createEmployee').classList.remove('hidden');
    document.getElementById('employeeList').classList.add('hidden');
};

// Отображаем список сотрудников
document.getElementById('viewBtn').onclick = function() {
    document.getElementById('employeeList').classList.remove('hidden');
    document.getElementById('createEmployee').classList.add('hidden');
    displayEmployees(); // Показываем сотрудников при открытии списка
};

// Обработка отправки формы
document.getElementById('employeeForm').onsubmit = async function(e) {
    e.preventDefault(); // Предотвращаем перезагрузку страницы
    
    const index = this.getAttribute('data-index'); // Получаем индекс сотрудника для редактирования
    const formData = Array.from(this.elements).reduce((acc, input) => {
        if (input.tagName === "INPUT") {
            acc[input.placeholder] = input.value.trim();
        }
        return acc;
    }, {});

    if (index !== null && index !== "") {
        // Если это обновление существующего сотрудника
        await updateEmployee(index, formData); // Обновляем запись на сервере
        employees[index] = formData; // Обновляем массив сотрудников
    } else {
        // Добавляем нового сотрудника в массив
        await addEmployee(formData); // Сохраняем нового сотрудника на сервере
        employees.push(formData); // Добавляем в массив
    }

    this.reset(); // Сбрасываем форму
    alert("Сотрудник добавлен или обновлен!"); // Уведомляем о добавлении
    displayEmployees(); // Обновляем список сотрудников
    this.removeAttribute('data-index'); // Удаляем атрибут
};

// Поиск сотрудников
document.getElementById('search').addEventListener('input', displayEmployees);

// Вызов функции для отображения сотрудников при загрузке страницы
window.onload = async function() {
    await fetchEmployees(); // Загружаем сотрудников с сервера
    displayEmployees(); // Отображаем список
};