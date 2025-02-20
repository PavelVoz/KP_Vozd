<?php
class Ticket
{
    protected $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAll()
    {
        $statement = $this->pdo->query("SELECT * FROM tickets");
        return $statement->fetchAll();
    }

    public function find($id)
    {
        $statement = $this->pdo->prepare("SELECT * FROM tickets WHERE id = :id");
        $statement->execute(['id' => $id]);
        return $statement->fetch();
    }

    public function create(array $data)
    {
        $statement = $this->pdo->prepare("INSERT INTO tickets (user_id, title, description) VALUES (:user_id, :title, :description)");
        $statement->execute([
            'user_id' => $data['user_id'],
            'title' => $data['title'],
            'description' => $data['description'],
        ]);
        return $this->find($this->pdo->lastInsertId());
    }

    public function update($id, array $data)
    {
        $statement = $this->pdo->prepare("UPDATE tickets SET title = :title, description = :description WHERE id = :id");
        $statement->execute([
            'title' => $data['title'],
            'description' => $data['description'],
            'id' => $id,
        ]);
        return $this->find($id);
    }

    public function delete($id)
    {
        $statement = $this->pdo->prepare("DELETE FROM tickets WHERE id = :id");
        $statement->execute(['id' => $id]);
        return ['message' => 'Ticket deleted successfully'];
    }
}