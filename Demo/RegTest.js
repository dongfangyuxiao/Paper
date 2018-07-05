var pattern = /^<script.*?>([\d\D]+?)<\/script>$/img;
var text = `<script> aaa </script>`;
var result;
while ((result = pattern.exec(text)) != null) {
  console.log(result);
  console.log('Matched \'' + result[1] + '\'' +
    ' at position ' + result.index + '; next search begins at ' + pattern.lastIndex);
}