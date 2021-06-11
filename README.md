# Elvin-Js

名称来源一位网友 "艾文"

基于mitojs魔改, 用于"自建前端监控", 代码已全部开源。

[mitojs](https://github.com/clouDr-f2e/mitojs)

`Elvin-Js` 前端监控数据上报。

由 `Elvin-Js` 生产数据 `Elvin-Api` 消费数据,`Elvin-Web` 查看。

[Elvin-Api](https://github.com/galaxy-softwares/elvin-api)

[Elvin-Web](https://github.com/galaxy-softwares/elvin-web)

## 使用

Vue2 NPM包形式使用

```js

npm install elvin-js

import { init, RportVue } from 'elvin-js'

init({
  monitorId: 'monitor_id1623225668'  // 创建项目时自动分配
})
```
