$a=[char]60
$b=[char]62
$s='script src="assets/js/comments.js?v=20260827a"'
$old=[string]::Concat($a,$s,$b,[char]47,'script',$b)
$new=$old+[Environment]::NewLine+[string]::Concat($a,'script src="assets/js/ratings-ui.js?v=20260827a"',$b,[char]47,'script',$b)
$p=[IO.File]::ReadAllText('product.html')
$p=$p.Replace($old,$new)
[IO.File]::WriteAllText('product.html',$p)
