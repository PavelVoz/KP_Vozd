document.addEventListener('DOMContentLoaded', function() {
    // Инициализация приложения
    initApp();
    
    // Обработчики событий
    setupEventListeners();
    
    // Загрузка данных
    loadRequests();
});

function initApp() {
    // Плавная прокрутка для навигации
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Анимация статистики
    animateStats();
    
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    
    mobileMenuBtn.addEventListener('click', function() {
        nav.classList.toggle('show');
    });
}
document.addEventListener('DOMContentLoaded', function() {
    // Проверка авторизации
    const currentUser = AuthService.getCurrentUser();
    const isAdmin = AuthService.isAdmin();
    
    if (!currentUser) {
        // Перенаправление на страницу входа, если пользователь не авторизован
        window.location.href = 'login.html'; // Нужно создать эту страницу
        return;
    }
    
    // Обновление UI в зависимости от роли
    updateUIForUser(currentUser, isAdmin);
    
    // Инициализация приложения
    initApp();
    setupEventListeners();
    loadRequests();
    
    // Добавляем логотип курсовой работы
    addCourseWorkBadge();
});

function updateUIForUser(user, isAdmin) {
    // Показываем имя пользователя
    const userInfoElement = document.createElement('div');
    userInfoElement.className = 'user-info';
    userInfoElement.innerHTML = `
        <span>${user.name}</span>
        ${isAdmin ? '<span class="admin-badge">Администратор</span>' : ''}
        <button id="logoutBtn" class="btn btn-outline btn-small">Выйти</button>
    `;
    
    const header = document.querySelector('.header-inner');
    const authButtons = document.querySelector('.auth-buttons');
    authButtons.replaceWith(userInfoElement);
    
    // Обработчик выхода
    document.getElementById('logoutBtn').addEventListener('click', () => {
        AuthService.logout();
        window.location.href = 'login.html';
    });
    
    // Скрываем/показываем элементы в зависимости от роли
    if (isAdmin) {
        document.getElementById('createRequestBtn').style.display = 'none';
        const adminLink = document.createElement('li');
        adminLink.innerHTML = '<a href="dashboard.html">Панель управления</a>';
        document.querySelector('.nav ul').appendChild(adminLink);
    }
}

function addCourseWorkBadge() {
    const badge = document.createElement('div');
    badge.className = 'course-work-badge';
    badge.innerHTML = 'Курсовая работа<br>Система учета заявок';
    document.body.appendChild(badge);
}
function setupEventListeners() {
    // Открытие модального окна для новой заявки
    const createRequestBtn = document.getElementById('createRequestBtn');
    const requestModal = document.getElementById('requestModal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    
    createRequestBtn.addEventListener('click', function() {
        requestModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });
    
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            requestModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    });
    
    // Закрытие модального окна при клике вне его
    window.addEventListener('click', function(e) {
        if (e.target === requestModal) {
            requestModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Отправка формы заявки
    const requestForm = document.getElementById('requestForm');
    requestForm.addEventListener('submit', function(e) {
        e.preventDefault();
        submitRequest();
    });
    
    // Фильтрация заявок
    const filterStatus = document.getElementById('filterStatus');
    filterStatus.addEventListener('change', function() {
        loadRequests(this.value);
    });
    
    // Обновление списка заявок
    const refreshRequests = document.getElementById('refreshRequests');
    refreshRequests.addEventListener('click', function() {
        loadRequests(filterStatus.value);
    });
}

function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumber = entry.target;
                const target = parseInt(statNumber.getAttribute('data-count'));
                const duration = 2000;
                const step = target / (duration / 16);
                let current = 0;
                
                const counter = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        clearInterval(counter);
                        current = target;
                    }
                    statNumber.textContent = Math.floor(current);
                }, 16);
                
                statNumber.classList.add('counting');
                observer.unobserve(statNumber);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(statNumber => {
        observer.observe(statNumber);
    });
}

async function loadRequests(status = 'all') {
    try {
        const requests = await API.getRequests(status);
        renderRequests(requests);
    } catch (error) {
        console.error('Ошибка при загрузке заявок:', error);
        alert('Не удалось загрузить заявки. Пожалуйста, попробуйте позже.');
    }
}

function renderRequests(requests) {
    const container = document.getElementById('requestsContainer');
    container.innerHTML = '';
    
    if (requests.length === 0) {
        container.innerHTML = '<div class="no-requests">Нет заявок для отображения</div>';
        return;
    }
    
    requests.forEach(request => {
        const requestElement = document.createElement('div');
        requestElement.className = 'request-item';
        requestElement.innerHTML = `
            <div class="request-id">${request.id}</div>
            <div class="request-date">${formatDate(request.createdAt)}</div>
            <div class="request-type">${getTypeName(request.type)}</div>
            <div class="request-problem">${request.problem.substring(0, 50)}${request.problem.length > 50 ? '...' : ''}</div>
            <div class="request-status status-${request.status}">${getStatusName(request.status)}</div>
            <div class="request-actions">
                <button class="action-btn view-btn" data-id="${request.id}" title="Просмотреть">
                    <i class="fas fa-eye"></i>
                </button>
                ${request.status === 'new' || request.status === 'in_progress' ? `
                <button class="action-btn edit-btn" data-id="${request.id}" title="Редактировать">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn cancel-btn" data-id="${request.id}" title="Отменить">
                    <i class="fas fa-times"></i>
                </button>
                ` : ''}
            </div>
        `;
        
        container.appendChild(requestElement);
    });
    
    // Добавляем обработчики для кнопок действий
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => viewRequest(btn.getAttribute('data-id')));
    });
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editRequest(btn.getAttribute('data-id')));
    });
    
    document.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', () => cancelRequest(btn.getAttribute('data-id')));
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}

function getTypeName(type) {
    const types = {
        'computer': 'Компьютер',
        'laptop': 'Ноутбук',
        'printer': 'Принтер',
        'server': 'Сервер',
        'other': 'Другое'
    };
    return types[type] || type;
}

function getStatusName(status) {
    const statuses = {
        'new': 'Новая',
        'in_progress': 'В работе',
        'completed': 'Завершена',
        'cancelled': 'Отменена'
    };
    return statuses[status] || status;
}

async function submitRequest() {
    const form = document.getElementById('requestForm');
    const formData = new FormData(form);
    const requestData = Object.fromEntries(formData.entries());
    
    try {
        await API.createRequest(requestData);
        alert('Заявка успешно создана!');
        form.reset();
        document.getElementById('requestModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        loadRequests();
    } catch (error) {
        console.error('Ошибка при создании заявки:', error);
        alert('Не удалось создать заявку. Пожалуйста, попробуйте позже.');
    }
}

async function viewRequest(id) {
    try {
        const request = await API.getRequest(id);
        // Здесь можно открыть модальное окно с подробной информацией о заявке
        alert(`Заявка #${request.id}\nТип: ${getTypeName(request.type)}\nПроблема: ${request.problem}\nСтатус: ${getStatusName(request.status)}`);
    } catch (error) {
        console.error('Ошибка при просмотре заявки:', error);
        alert('Не удалось загрузить данные заявки.');
    }
}

async function editRequest(id) {
    try {
        const request = await API.getRequest(id);
        // Заполняем форму данными заявки для редактирования
        document.getElementById('requestType').value = request.type;
        document.getElementById('requestModel').value = request.model || '';
        document.getElementById('requestProblem').value = request.problem;
        document.getElementById('requestUrgency').value = request.urgency || 'medium';
        document.getElementById('requestAddress').value = request.address || '';
        
        // Показываем модальное окно
        const requestModal = document.getElementById('requestModal');
        requestModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Изменяем обработчик формы для обновления заявки
        const form = document.getElementById('requestForm');
        form.onsubmit = async function(e) {
            e.preventDefault();
            const formData = new FormData(form);
            const requestData = Object.fromEntries(formData.entries());
            
            try {
                await API.updateRequest(id, requestData);
                alert('Заявка успешно обновлена!');
                requestModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                loadRequests();
            } catch (error) {
                console.error('Ошибка при обновлении заявки:', error);
                alert('Не удалось обновить заявку. Пожалуйста, попробуйте позже.');
            }
        };
    } catch (error) {
        console.error('Ошибка при редактировании заявки:', error);
        alert('Не удалось загрузить данные заявки для редактирования.');
    }
}

async function cancelRequest(id) {
    if (confirm('Вы уверены, что хотите отменить эту заявку?')) {
        try {
            await API.cancelRequest(id);
            alert('Заявка успешно отменена!');
            loadRequests();
        } catch (error) {
            console.error('Ошибка при отмене заявки:', error);
            alert('Не удалось отменить заявку. Пожалуйста, попробуйте позже.');
        }
    }
}