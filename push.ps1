# Quick auto-commit and push
$msg = if ($args[0]) { $args[0] } else { "Update — $(Get-Date -Format 'yyyy-MM-dd HH:mm')" }
git add .
git commit -m $msg
git push origin master
