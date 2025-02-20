<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Панель управления</title>
    <link rel="stylesheet" href="styles.css"> <!-- Стили -->
</head>
<body>
    <?php
        session_start();
        
        if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in']) {
            header("Location: login.php");
            exit();
        }
        
        require_once 'config.php';
        
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            if (isset($_POST['create_ticket'])) { // Создание новой заявки
                $title = $_POST['title'];
                $description = $_POST['description'];

                try {
                    $stmt = $conn->prepare("INSERT INTO tickets (user_id, title, description) VALUES (:user_id, :title, :description)");
                    $stmt->bindParam(':user_id', $_SESSION['user_id']);
                    $stmt->bindParam(':title', $title);
                    $stmt->bindParam(':description', $description);
                    $stmt->execute();

                    echo "Заявка успешно создана!";
                } catch(PDOException $e) {
                    echo "Ошибка создания заявки: " . $e->getMessage();
                }
            } elseif (isset($_POST['edit_ticket'])) { // Редактирование заявки
                if ($_SESSION['role'] === 'admin') {
                    // Проверяем наличие новых значений
                    $new_title = isset($_POST['new_title']) ? trim($_POST['new_title']) : '';
                    $new_description = isset($_POST['new_description']) ? trim($_POST['new_description']) : '';

                    // Проверяем, заполнены ли обязательные поля
                    if (empty($new_title)) {
                        echo "Название заявки не может быть пустым.";
                    } elseif (empty($new_description)) {
                        echo "Описание заявки не может быть пустым.";
                    } else {
                        $ticket_id = $_POST['ticket_id'];

                        try {
                            $stmt = $conn->prepare("UPDATE tickets SET title=:new_title, description=:new_description WHERE id=:ticket_id");
                            $stmt->bindParam(':ticket_id', $ticket_id);
                            $stmt->bindParam(':new_title', $new_title);
                            $stmt->bindParam(':new_description', $new_description);
                            $stmt->execute();

                            echo "Заявка успешно отредактирована!";
                        } catch(PDOException $e) {
                            echo "Ошибка редактирования заявки: " . $e->getMessage();
                        }
                    }
                } else {
                    echo "У вас недостаточно прав для редактирования заявки.";
                }
            } elseif (isset($_POST['delete_ticket'])) { // Удаление заявки
                if ($_SESSION['role'] === 'admin') {
                    $ticket_id = $_POST['ticket_id'];

                    try {
                        $stmt = $conn->prepare("DELETE FROM tickets WHERE id=:ticket_id");
                        $stmt->bindParam(':ticket_id', $ticket_id);
                        $stmt->execute();

                        echo "Заявка успешно удалена!";
                    } catch(PDOException $e) {
                        echo "Ошибка удаления заявки: " . $e->getMessage();
                    }
                } else {
                    echo "У вас недостаточно прав для удаления заявки.";
                }
            }
        }
    ?>
    
    <?php
        if (isset($_SESSION['username'])) {
            echo "<h1>Добро пожаловать, " . $_SESSION['username'] . "! </h1>";
        } else {
            echo "<h1>Привет! Кажется, ваше имя пользователя не было найдено.</h1>";
        }
    ?>
    
    <a href="logout.php">Выход</a>
    
    <h2>Создать заявку</h2>
    <form method="post">
        <label for="title">Название заявки:</label><br>
        <input type="text" name="title" required><br><br>
        
        <label for="description">Описание проблемы:</label><br>
        <textarea name="description" rows="10" cols="50" required></textarea><br><br>
        
        <button type="submit" name="create_ticket">Создать заявку</button>
    </form>
    
    <h2>Все заявки</h2>
    <?php
        try {
            // Определяем, кто запрашивает заявки: обычный пользователь или администратор
            if ($_SESSION['role'] === 'admin') {
                // Администратор видит все заявки
                $stmt = $conn->query("SELECT * FROM tickets ORDER BY created_at DESC");
            } else {
                // Обычные пользователи видят только свои заявки
                $stmt = $conn->prepare("SELECT * FROM tickets WHERE user_id = :user_id ORDER BY created_at DESC");
                $stmt->bindParam(':user_id', $_SESSION['user_id']);
            }
            
            $stmt->execute();
            $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (count($tickets) > 0) {
                foreach ($tickets as $ticket) {
                    echo "<div class='ticket'>
                            <p><strong>ID заявки:</strong> {$ticket['id']}</p>
                            <p><strong>Название:</strong> {$ticket['title']}</p>
                            <p><strong>Статус:</strong> {$ticket['status']}</p>
                            <p><strong>Дата создания:</strong> {$ticket['created_at']}</p>";
                    
                    // Показываем кнопки редактирования и удаления только администраторам
                    if ($_SESSION['role'] === 'admin') {
                        echo "
                            <form method='post' style='display: inline-block; margin-right: 10px;'>
                                <input type='hidden' name='ticket_id' value='{$ticket['id']}'>
                                <button type='submit' name='edit_ticket'>Редактировать</button>
                            </form>
                            <form method='post' style='display: inline-block;'>
                                <input type='hidden' name='ticket_id' value='{$ticket['id']}'>
                                <button type='submit' name='delete_ticket'>Удалить</button>
                            </form>
                        ";
                    }

                    echo "</div>";
                }
            } else {
                echo "Нет активных заявок.";
            }
        } catch(PDOException $e) {
            echo "Ошибка получения заявок: " . $e->getMessage();
        }
    ?>
</body>
</html>