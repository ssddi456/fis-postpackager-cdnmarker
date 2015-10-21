fis-postpostpackager-cdnmarker

----------


### 介绍

标记资源是否使用cdn，并修改css文件中引入的资源的路径为相对路径，
以适应各种cdn服务。

### 使用

修改```fis-conf.js```,添加

```js
fis.config.set('modules.postpackager', 'cdnmarker');
```

以使用此插件。
添加资源配置,表明何种资源需要使用cdn：

```js
fis.config.merge({
    roadmap: {
        path : [{
            reg : '**.css',
            useCdn : true
        }]
    }
});
```

编译后的```map.json```将增加```useCdn```字段：

```js
{
  ...
  "global:static/css/mod.css": {
      "uri": "/static/css/mod.css",
      "type": "css",
      "pkg": "global:p0",
      "useCdn": true
  },
  ...
}
```

如果使用了某种静态packager,如```fis-packager-simple```也将被标记:

```js
{
  ...
  "pkg": {
      "global:p0": {
          "uri": "/static/pkg/g-common.css",
          "type": "css",
          "has": [
              "global:static/css/reset.css",
              "global:static/css/base.css",
              "global:static/css/grid.css",
              "global:static/css/mod.css"
          ],
          "useCdn": true
      },
  }
  ...
}
```

同时被标记的css文件中的资源的路径将被修改为相对路径，
