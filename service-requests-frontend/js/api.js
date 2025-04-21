// Имитация API для работы с заявками
const API = {
    // Получить список заявок
    async getRequests(status = 'all') {
        // В реальном приложении здесь был бы fetch к бэкенду
        console.log(`Запрос заявок со статусом: ${status}`);
        
        // Имитация задержки сети
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Локальное хранилище заявок
        let requests = JSON.parse(localStorage.getItem('service_requests')) || [];
        
        // Генерация тестовых данных, если хранилище пустое
        if (requests.length === 0) {
            requests = this.generateMockData();
            localStorage.setItem('service_requests', JSON.stringify(requests));
        }
        
        // Фильтрация по статусу
        if (status !== 'all') {
            requests = requests.filter(request => request.status === status);
        }
        
        return requests;
    },
    
    // Получить одну заявку по ID
    async getRequest(id) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const requests = JSON.parse(localStorage.getItem('service_requests')) || [];
        const request = requests.find(req => req.id == id);
        
        if (!request) {
            throw new Error('Заявка не найдена');
        }
        
        return request;
    },
    
    // Создать новую заявку
    async createRequest(requestData) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const requests = JSON.parse(localStorage.getItem('service_requests')) || [];
        const newRequest = {
            id: Date.now(),
            ...requestData,
            status: 'new',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        requests.push(newRequest);
        localStorage.setItem('service_requests', JSON.stringify(requests));
        
        return newRequest;
    },
    
    // Обновить заявку
    async updateRequest(id, requestData) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const requests = JSON.parse(localStorage.getItem('service_requests')) || [];
        const index = requests.findIndex(req => req.id == id);
        
        if (index === -1) {
            throw new Error('Заявка не найдена');
        }
        
        const updatedRequest = {
            ...requests[index],
            ...requestData,
            updatedAt: new Date().toISOString()
        };
        
        requests[index] = updatedRequest;
        localStorage.setItem('service_requests', JSON.stringify(requests));
        
        return updatedRequest;
    },
    
    // Отменить заявку
    async cancelRequest(id) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const requests = JSON.parse(localStorage.getItem('service_requests')) || [];
        const index = requests.findIndex(req => req.id == id);
        
        if (index === -1) {
            throw new Error('Заявка не найдена');
        }
        
        requests[index].status = 'cancelled';
        requests[index].updatedAt = new Date().toISOString();
        localStorage.setItem('service_requests', JSON.stringify(requests));
        
        return requests[index];
    },
        // Получить все заявки (для админа)
        async getAllRequests(filter = {}) {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            let requests = JSON.parse(localStorage.getItem('service_requests')) || [];
            
            // Фильтрация по статусу
            if (filter.status && filter.status !== 'all') {
                requests = requests.filter(request => request.status === filter.status);
            }
            
            // Поиск по описанию проблемы
            if (filter.search) {
                const searchTerm = filter.search.toLowerCase();
                requests = requests.filter(request => 
                    request.problem.toLowerCase().includes(searchTerm)
                );
            }
            
            // Добавляем информацию о пользователях
            const users = JSON.parse(localStorage.getItem(AuthService.USERS_KEY)) || [];
            requests = requests.map(request => {
                const user = users.find(u => u.id === request.userId);
                return {
                    ...request,
                    userName: user ? user.name : 'Неизвестный',
                    userEmail: user ? user.email : ''
                };
            });
            
            return requests;
        },
        
        // Получить всех пользователей (для админа)
        async getUsers() {
            await new Promise(resolve => setTimeout(resolve, 300));
            return JSON.parse(localStorage.getItem(AuthService.USERS_KEY)) || [];
        },
        
        // Создать заявку (теперь с userId)
        async createRequest(requestData) {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const user = AuthService.getCurrentUser();
            if (!user) throw new Error('Пользователь не авторизован');
            
            const requests = JSON.parse(localStorage.getItem('service_requests')) || [];
            const newRequest = {
                id: Date.now(),
                ...requestData,
                userId: user.id,
                status: 'new',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            requests.push(newRequest);
            localStorage.setItem('service_requests', JSON.stringify(requests));
            
            return newRequest;
        },
        
        // ... остальные методы ...
    // Генерация тестовых данных
    generateMockData() {
        const types = ['computer', 'laptop', 'printer', 'server', 'other'];
        const statuses = ['new', 'in_progress', 'completed', 'cancelled'];
        const problems = [
            'Не включается',
            'Не работает клавиатура',
            'Не печатает принтер',
            'Медленно работает',
            'Перегревается',
            'Не загружается система',
            'Нет доступа в интернет',
            'Не работает монитор'
        ];
        
        const requests = [];
        const now = new Date();
        
        for (let i = 0; i < 15; i++) {
            const daysAgo = Math.floor(Math.random() * 30);
            const createdAt = new Date(now);
            createdAt.setDate(now.getDate() - daysAgo);
            
            requests.push({
                id: 1000 + i,
                type: types[Math.floor(Math.random() * types.length)],
                model: `Model ${Math.floor(Math.random() * 1000)}`,
                problem: problems[Math.floor(Math.random() * problems.length)],
                urgency: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
                address: daysAgo % 2 === 0 ? `ул. Примерная, ${Math.floor(Math.random() * 100)}` : '',
                status: statuses[Math.floor(Math.random() * statuses.length)],
                createdAt: createdAt.toISOString(),
                updatedAt: createdAt.toISOString()
            });
        }
        
        localStorage.setItem('service_requests', JSON.stringify(requests));
        return requests;
    }
};