<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Регистрация</title>
    <link rel="stylesheet" href="styles.css"> <!-- Стили -->
</head>
<body>
    <h1>Регистрация</h1>
    <?php
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            require_once 'config.php';
            
            $username = $_POST['username'];
            $password = password_hash($_POST['password'], PASSWORD_DEFAULT);

            try {
                $stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (:username, :password)");
                $stmt->bindParam(':username', $username);
                $stmt->bindParam(':password', $password);
                $stmt->execute();
                
                header("Location: login.php");
                exit();
            } catch(PDOException $e) {
                echo "Ошибка регистрации: " . $e->getMessage();
            }
        }
    ?>
    <form method="post">
        <label for="username">Имя пользователя:</label><br>
        <input type="text" name="username" required><br><br>
        
        <label for="password">Пароль:</label><br>
        <input type="password" name="password" required><br><br>
        
        <button type="submit">Зарегистрироваться</button>
    </form>
</body>
</html>