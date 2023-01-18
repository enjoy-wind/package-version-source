# package-version-source

此插件用于记录构建的生产包溯源，记录的git仓库名、分支、及hash

# package-version-source

## Usage

```js
import { getMetaRevised } from 'package-version-source'
import { createHtmlPlugin } from 'vite-plugin-html'
createHtmlPlugin({
    minify: false,
    inject: {
        data: {
            injectSource: getMetaRevised(),
        },
    },
})
```

```html(meta位置添加)
  <%- injectSource %>
```

## Notice
此插件需要配合createHtmlPlugin插件搭配使用,通过ejs语法，替换占位符，版本溯源位于index.html>meta标签中,使用案例中是vite的集成方案,webpack请用对应的HTML-生成插件.


