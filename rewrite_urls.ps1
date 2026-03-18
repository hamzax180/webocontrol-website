$dir = "c:\Users\hamza\OneDrive\Desktop\TOP IMPORTANT FOLDER\my company"
$files = Get-ChildItem -Path $dir -Recurse -File -Include *.html,*.js -Exclude node_modules,dist

foreach ($f in $files) {
    $content = Get-Content -Path $f.FullName -Raw
    $newContent = $content -replace '/frontend/home\.html', '/'
    $newContent = $newContent -replace '/frontend/home', '/'
    $newContent = $newContent -replace '/frontend/([a-zA-Z0-9_-]+)\.html', '/$1'
    $newContent = $newContent -replace '/frontend/', '/'
    
    if ($content -ne $newContent) {
        Set-Content -Path $f.FullName -Value $newContent -NoNewline
        Write-Host "Updated $($f.FullName)"
    }
}
