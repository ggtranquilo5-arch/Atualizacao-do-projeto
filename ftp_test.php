<?php
$ftp_server = "ftpupload.net";
$ftp_username = "if0_42166310";
$ftp_password = "Joaquim2425";

$conn_id = ftp_connect($ftp_server);
if (!$conn_id) die("Falha na conexao");

if (ftp_login($conn_id, $ftp_username, $ftp_password)) {
    ftp_pasv($conn_id, true);
    $contents = ftp_nlist($conn_id, "almoxarifadoteste.fwh.is/htdocs");
    print_r($contents);
    ftp_close($conn_id);
} else {
    echo "Falha no login";
}
?>
