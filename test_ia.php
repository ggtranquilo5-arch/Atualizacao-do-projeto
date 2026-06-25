<?php
session_start();
$_POST = ['action' => 'ia_query', 'pergunta' => '/ajuda'];
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SESSION['usuario_id'] = 1;
$_SESSION['nivel_acesso'] = 'ceo';
include 'ia.php';
