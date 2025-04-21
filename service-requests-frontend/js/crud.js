// CRUD операции для заявок (используют API)
const RequestCRUD = {
    async create(requestData) {
        return await API.createRequest(requestData);
    },
    
    async read(id) {
        return await API.getRequest(id);
    },
    
    async readAll(status = 'all') {
        return await API.getRequests(status);
    },
    
    async update(id, requestData) {
        return await API.updateRequest(id, requestData);
    },
    
    async delete(id) {
        // В нашем случае "удаление" - это отмена заявки
        return await API.cancelRequest(id);
    }
};

// Пример использования:
// RequestCRUD.create({type: 'computer', problem: 'Не включается'});
// RequestCRUD.readAll('new');
// RequestCRUD.update(123, {problem: 'Не работает монитор'});
// RequestCRUD.delete(123);