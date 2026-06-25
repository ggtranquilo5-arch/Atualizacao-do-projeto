<?php
// Detecta se está rodando localmente (XAMPP) ou na InfinityFree
if ($_SERVER['HTTP_HOST'] == 'localhost' || $_SERVER['HTTP_HOST'] == '127.0.0.1') {
    $host = 'localhost';
    $dbname = 'almoxarifado';
    $user = 'root';
    $pass = ''; 
} else {
    $host = 'sql101.infinityfree.com';
    $dbname = 'if0_42166310_Almoxarifado';
    $user = 'if0_42166310';
    $pass = 'Joaquim2425';
}
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("Erro de conexão com o banco de dados: " . $e->getMessage());
}
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS logs_atividades (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT,
        acao VARCHAR(100),
        detalhes TEXT,
        data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    // Atualização estrutural para o novo cargo CEO
    $pdo->exec("ALTER TABLE usuarios MODIFY COLUMN nivel_acesso ENUM('ceo', 'admin', 'comum') NOT NULL DEFAULT 'comum'");
    // Definir o usuário mestre (id 1) como CEO
    $pdo->exec("UPDATE usuarios SET nivel_acesso = 'ceo' WHERE id = 1");
} catch (PDOException $e) {
}
if (isset($_SESSION['usuario_id'])) {
    if (isset($_SESSION['ultima_atividade']) && (time() - $_SESSION['ultima_atividade'] > 1800)) {
        session_unset();
        session_destroy();
        header("Location: index.php?timeout=1");
        exit;
    }
    $_SESSION['ultima_atividade'] = time();

    // Sincronização em Tempo Real do Nível de Acesso
    try {
        $check = $pdo->prepare("SELECT status, nivel_acesso FROM usuarios WHERE id = ?");
        $check->execute([$_SESSION['usuario_id']]);
        $user_db = $check->fetch();
        if ($user_db) {
            if ($user_db['status'] === 'banido') {
                session_unset();
                session_destroy();
                header("Location: index.php?erro=" . urlencode("Sua conta foi banida."));
                exit;
            }
            if (isset($_SESSION['nivel_acesso']) && $_SESSION['nivel_acesso'] !== $user_db['nivel_acesso']) {
                $_SESSION['nivel_acesso'] = $user_db['nivel_acesso'];
            }
        } else {
            session_unset();
            session_destroy();
            header("Location: index.php");
            exit;
        }
    } catch (PDOException $e) {}
}
?>
