<?php
$ftp_server = "ftpupload.net";
$ftp_username = "if0_42166310";
$ftp_password = "Joaquim2425";

$conn_id = ftp_connect($ftp_server) or die("Falha na conexao");
if (@ftp_login($conn_id, $ftp_username, $ftp_password)) {
    ftp_pasv($conn_id, true);
    
    $local_dir = "C:\\Users\\202412260030\\Documents\\GitHub\\Atualizacao-do-projeto\\Atualizacao-do-projeto";
    $remote_dir = "almoxarifadoteste.fwh.is/htdocs";
    
    $files = glob("$local_dir\\*.{php,css,html,js}", GLOB_BRACE);
    
    foreach ($files as $file) {
        $basename = basename($file);
        $remote_file = $remote_dir . "/" . $basename;
        
        echo "Uploading $basename...\n";
        if (ftp_put($conn_id, $remote_file, $file, FTP_BINARY)) {
            echo "Success: $basename\n";
        } else {
            echo "Failed: $basename\n";
        }
    }
    ftp_close($conn_id);
    echo "Sincronização completa!";
} else {
    echo "Falha no login FTP";
}
?>
