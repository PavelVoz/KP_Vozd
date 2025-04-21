class AuthService {
    static CURRENT_USER_KEY = 'current_user';
    static USERS_KEY = 'app_users';
    
    // Инициализация тестовых пользователей
    static init() {
        if (!localStorage.getItem(this.USERS_KEY)) {
            const users = [
                { id: 1, email: 'user@example.com', password: 'user123', name: 'Иван Петров', role: 'user' },
                { id: 2, email: 'admin@example.com', password: 'admin123', name: 'Администратор', role: 'admin' }
            ];
            localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
        }
    }
    
    // Вход в систему
    static login(email, password) {
        const users = JSON.parse(localStorage.getItem(this.USERS_KEY));
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
            return user;
        }
        return null;
    }
    
    // Выход из системы
    static logout() {
        localStorage.removeItem(this.CURRENT_USER_KEY);
    }
    
    // Получение текущего пользователя
    static getCurrentUser() {
        const user = localStorage.getItem(this.CURRENT_USER_KEY);
        return user ? JSON.parse(user) : null;
    }
    
    // Проверка роли
    static isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    }
}

// Инициализация при загрузке
AuthService.init();