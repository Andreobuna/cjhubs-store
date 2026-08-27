$p=Get-Content -LiteralPath 'product.html' -Raw
$p=$p.Replace('<script src="assets/js/comments.js?v=20260827a"></script>','<script src="assets/js/comments.js?v=20260827a"></script>`r`n<script src="assets/js/ratings-ui.js?v=20260827a"></script>')
Set-Content -LiteralPath 'product.html' -Value $p
