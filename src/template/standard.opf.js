const getText = () => `<?xml version="1.0" encoding="UTF-8"?>
<package
  xmlns="http://www.idpf.org/2007/opf"
  version="3.0"
  xml:lang="ja"
  unique-identifier="unique-id"
  prefix="rendition: http://www.idpf.org/vocab/rendition/#
          epub-bundle-tool: https://wing-kai.github.io/epub-manga-creator/
          ebpaj: http://www.ebpaj.jp/
          fixed-layout-jp: http://www.digital-comic.jp/
          ibooks: http://vocabulary.itunes.apple.com/rdf/ibooks/vocabulary-extensions-1.0/"
>

<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">

<!-- 作品名 -->
<dc:title id="title">{{title}}</dc:title>
<meta refines="#title" property="file-as"></meta>

<!-- 著者名 -->
<!-- creator-list -->

<dc:subject>{{subject}}</dc:subject>

<!-- 出版社名 -->
<dc:publisher id="publisher">{{publisher}}</dc:publisher>
<meta refines="#publisher" property="file-as"></meta>

<!-- 言語 -->
<dc:language>ja</dc:language>

<!-- ファイルid -->
<dc:identifier id="unique-id">urn:uuid:{{uuid}}</dc:identifier>

<!-- 更新日 -->
<meta property="dcterms:modified">{{createTime}}</meta>

<!-- Fixed-Layout Documents指定 -->
<meta property="rendition:layout">pre-paginated</meta>
<meta property="rendition:spread">{{spread}}</meta>

<!-- etc. -->
<meta property="ibooks:specified-fonts">true</meta>
<meta property="ibooks:binding">false</meta>
<meta property="ebpaj:guide-version">1.1</meta>
<meta name="cover" content="cover"></meta>
<meta name="original-resolution" content="{{width}}x{{height}}"/>
<meta name="orientation-lock" content="none"/>

<meta property="fixed-layout-jp:viewport">width={{width}}, height={{height}}</meta>

</metadata>

<manifest>

<!-- navigation -->
<item media-type="application/xhtml+xml" id="toc" href="navigation-documents.xhtml" properties="nav"></item>

<!-- style -->
<item media-type="text/css" id="fixed-layout-jp" href="style/fixed-layout-jp.css"></item>

<!-- image -->
<!-- item-image -->

<!-- text -->
<!-- item-xhtml -->

</manifest>

<spine{{direction}}>

<!-- itemref-xhtml -->

</spine>

</package>`

export default getText