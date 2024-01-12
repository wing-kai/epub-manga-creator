const getText = () => `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html
 xmlns="http://www.w3.org/1999/xhtml"
 xmlns:epub="http://www.idpf.org/2007/ops"
 xml:lang="ja"
>
<head>
<meta charset="UTF-8" />
<title>{{title}}</title>
<link rel="stylesheet" type="text/css" href="../style/fixed-layout-jp.css"/>
<meta name="viewport" content="width={{width}}, height={{height}}"/>
<style>img{width:{{width}}px;height:{{height}}px}</style>
</head>
<body>
<div class="main">
<img src="{{imageSource}}" style="{{style}}"/>
</div>
</body>
</html>`

export default getText