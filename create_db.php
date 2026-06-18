<?php
$host = 'localhost';
$user = 'root';
$pass = '';

try {
    // Connect to MySQL server first without DB
    $pdo = new PDO("mysql:host=$host;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Conectado ao MySQL com sucesso!\n";
    
    // Create database if not exists
    $pdo->exec("CREATE DATABASE IF NOT EXISTS almoxarifado CHARACTER SET utf8 COLLATE utf8_general_ci");
    echo "Banco de dados 'almoxarifado' criado ou já existente.\n";
    
    // Connect to the specific database
    $pdo->exec("USE almoxarifado");
    
    // Read the SQL dump file
    $sqlFile = __DIR__ . '/almoxarifado_pronto.sql';
    if (!file_exists($sqlFile)) {
        die("Arquivo SQL não encontrado em: $sqlFile\n");
    }
    
    $sql = file_get_contents($sqlFile);
    
    // Execute the SQL dump
    $pdo->exec($sql);
    echo "Importação do arquivo SQL concluída com sucesso!\n";

} catch (PDOException $e) {
    die("Erro ao inicializar banco de dados: " . $e->getMessage() . "\n");
}
?>
