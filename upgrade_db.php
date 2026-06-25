<?php
$host = 'localhost';
$dbname = 'almoxarifado';
$user = 'root';
$pass = ''; 
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->exec("ALTER TABLE usuarios MODIFY COLUMN nivel_acesso ENUM('ceo', 'admin', 'comum') NOT NULL DEFAULT 'comum'");
    $pdo->exec("UPDATE usuarios SET nivel_acesso = 'ceo' WHERE id = 1");
    echo "Database upgraded successfully!";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
