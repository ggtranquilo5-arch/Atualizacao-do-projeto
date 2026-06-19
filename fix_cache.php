<?php
$dir = "C:\\Users\\202412260030\\Documents\\GitHub\\Atualizacao-do-projeto\\Atualizacao-do-projeto";
$files = glob("$dir\\*.php");
$v = time();
foreach ($files as $f) {
    $c = file_get_contents($f);
    if (strpos($c, 'premium.css') !== false) {
        // replace premium.css (and any existing version string) with premium.css?v=X
        $c = preg_replace('/premium\.css(\?v=\d+)?/', 'premium.css?v=' . $v, $c);
        file_put_contents($f, $c);
    }
}
echo "Cache busted with v=$v";
