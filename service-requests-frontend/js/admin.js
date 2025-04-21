document.addEventListener('DOMContentLoaded', function() {
    // Проверка прав администратора
    if (!AuthService.isAdmin()) {
        window.location.href = 'index.html';
        return;
    }
    
    // Показываем информацию об администраторе
    const user = AuthService.getCurrentUser();
    document.getElementById('adminName').textContent = user.name;
    
    // Инициализация админ-панели
    initAdminDashboard();
    setupAdminEventListeners();
    
    // Добавляем логотип курсовой работы
    addCourseWorkBadge();
});

function initAdminDashboard() {
    // Загрузка статистики
    loadAdminStats();
    
    // Загрузка заявок
    loadAdminRequests();
}

function setupAdminEventListeners() {
    // Фильтрация заявок
    document.getElementById('adminFilterStatus').addEventListener('change', function() {
        loadAdminRequests({ status: this.value });
    });
    
    // Поиск заявок
    document.getElementById('adminSearchBtn').addEventListener('click', function() {
        const searchTerm = document.getElementById('adminSearch').value;
        loadAdminRequests({ search: searchTerm });
    });
    
    // Навигация по разделам
    document.querySelectorAll('.nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href').substring(1);
            showAdminSection(target);
        });
    });
    
    // Выход из системы
    document.getElementById('logoutBtn').addEventListener('click', function() {
        AuthService.logout();
        window.location.href = 'login.html';
    });
}

async function loadAdminStats() {
    try {
        const requests = await API.getAllRequests();
        const users = await API.getUsers();
        
        document.getElementById('totalRequests').textContent = requests.length;
        document.getElementById('activeRequests').textContent = 
            requests.filter(r => r.status === 'new' || r.status === 'in_progress').length;
        document.getElementById('usersCount').textContent = users.length;
    } catch (error) {
        console.error('Ошибка при загрузке статистики:', error);
    }
}

async function loadAdminRequests(filter = {}) {
    try {
        const requests = await API.getAllRequests(filter);
        renderAdminRequests(requests);
    } catch (error) {
        console.error('Ошибка при загрузке заявок:', error);
        alert('Не удалось загрузить заявки');
    }
}

function renderAdminRequests(requests) {
    const container = document.getElementById('adminRequestsContainer');
    container.innerHTML = '';
    
    if (requests.length === 0) {
        container.innerHTML = '<div class="no-data">Нет заявок для отображения</div>';
        return;
    }
    
    requests.forEach(request => {
        const requestElement = document.createElement('div');
        requestElement.className = 'request-item';
        requestElement.innerHTML = `
            <div class="request-id">${request.id}</div>
            <div class="request-date">${formatDate(request.createdAt)}</div>
            <div class="request-user" title="${request.userEmail}">${request.userName}</div>
            <div class="request-type">${getTypeName(request.type)}</div>
            <div class="request-problem">${request.problem.substring(0, 50)}${request.problem.length > 50 ? '...' : ''}</div>
            <div class="request-status status-${request.status}">${getStatusName(request.status)}</div>
            <div class="request-actions">
                <button class="action-btn view-btn" data-id="${request.id}" title="Просмотреть">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn status-btn" data-id="${request.id}" title="Изменить статус">
                    <i class="fas fa-exchange-alt"></i>
                </button>
            </div>
        `;
        
        container.appendChild(requestElement);
    });
    
    // Обработчики для кнопок
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => viewAdminRequest(btn.getAttribute('data-id')));
    });
    
    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.addEventListener('click', () => openStatusModal(btn.getAttribute('data-id')));
    });
}

function showAdminSection(sectionId) {
    document.querySelectorAll('.admin-section').forEach(section => {
        section.style.display = 'none';
    });
    
    document.getElementById(sectionId).style.display = 'block';
}

function openStatusModal(requestId) {
    const modal = document.getElementById('changeStatusModal');
    document.getElementById('requestId').value = requestId;
    modal.style.display = 'block';
    
    // Обработчик формы
    document.getElementById('changeStatusForm').onsubmit = async function(e) {
        e.preventDefault();
        const newStatus = document.getElementById('newStatus').value;
        const comment = document.getElementById('statusComment').value;
        
        try {
            await API.updateRequest(requestId, { 
                status: newStatus,
                comment: comment 
            });
            modal.style.display = 'none';
            loadAdminRequests();
        } catch (error) {
            console.error('Ошибка при изменении статуса:', error);
            alert('Не удалось изменить статус');
        }
    };
}

function addCourseWorkBadge() {
    const badge = document.createElement('div');
    badge.className = 'course-work-badge';
    badge.innerHTML = 'Курсовая работа<br>Система учета заявок';
    document.body.appendChild(badge);
}