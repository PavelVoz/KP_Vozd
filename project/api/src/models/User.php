<?php
class User
{
    protected $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAll()
    {
        $statement = $this->pdo->query("SELECT * FROM users");
        return $statement->fetchAll();
    }

    public function find($id)
    {
        $statement = $this->pdo->prepare("SELECT * FROM users WHERE id = :id");
        $statement->execute(['id' => $id]);
        return $statement->fetch();
    }

    public function create(array $data)
    {
        $statement = $this->pdo->prepare("INSERT INTO users (name, email, password) VALUES (:name, :email, :password)");
        $statement->execute([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => password_hash($data['password'], PASSWORD_DEFAULT),
        ]);
        return $this->find($this->pdo->lastInsertId());
    }

    public function update($id, array $data)
    {
        $statement = $this->pdo->prepare("UPDATE users SET name = :name, email = :email WHERE id = :id");
        $statement->execute([
            'name' => $data['name'],
            'email' => $data['email'],
            'id' => $id,
        ]);
        return $this->find($id);
    }

    public function delete($id)
    {
        $statement = $this->pdo->prepare("DELETE FROM users WHERE id = :id");
        $statement->execute(['id' => $id]);
        return ['message' => 'User deleted successfully'];
    }
}