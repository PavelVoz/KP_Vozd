<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Вход</title>
    <link rel="stylesheet" href="styles.css"> <!-- Стили -->
</head>
<body>
    <h1>Вход</h1>
    <?php
        session_start(); // Инициализируем сессию
        
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            require_once 'config.php';
            
            $username = $_POST['username'];
            $password = $_POST['password'];

            try {
                $stmt = $conn->prepare("SELECT * FROM users WHERE username = :username");
                $stmt->bindParam(':username', $username);
                $stmt->execute();
                $user = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($user && password_verify($password, $user['password'])) {
                    $_SESSION['logged_in'] = true;
                    $_SESSION['user_id'] = $user['id'];
                    $_SESSION['role'] = $user['role'];
                    
                    header("Location: dashboard.php");
                    exit();
                } else {
                    echo "Неверное имя пользователя или пароль.";
                }
            } catch(PDOException $e) {
                echo "Ошибка входа: " . $e->getMessage();
            }
        }
    ?>
    <form method="post">
        <label for="username">Имя пользователя:</label><br>
        <input type="text" name="username" required><br><br>
        
        <label for="password">Пароль:</label><br>
        <input type="password" name="password" required><br><br>
        
        <button type="submit">Войти</button>
    </form>
</body>
</html>