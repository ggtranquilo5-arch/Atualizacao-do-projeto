<?php
$files = glob('*.php');
foreach($files as $f) {
    if(in_array($f, ['db.php', 'fix_cache.php', 'ftp_sync.php', 'patch_darkmode.php', 'patch_ajax.php'])) continue;
    $c = file_get_contents($f);
    if(strpos($c, 'ajax_spa.js') === false && strpos($c, '</body>') !== false) {
        $c = str_replace('</body>', '<script src="ajax_spa.js?v=<?= time() ?>"></script></body>', $c);
        file_put_contents($f, $c);
        echo "Patched $f\n";
    }
}
?>
