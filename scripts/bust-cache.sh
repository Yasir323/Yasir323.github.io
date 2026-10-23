#!/bin/sh
# Stamp asset URLs in index.html with a content hash (e.g. app.js?v=1a2b3c4d)
# so browsers fetch fresh copies after each deploy. GitHub Pages caches for 10 min.
set -e
cd "$(dirname "$0")/.."
for f in style.css data.js app.js; do
  h=$(git hash-object "$f" | cut -c1-8)
  sed -i.bak -E "s#(href|src)=\"$f(\?v=[0-9a-f]*)?\"#\1=\"$f?v=$h\"#" index.html
done
rm -f index.html.bak
