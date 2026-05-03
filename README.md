# 夫妻深夜话题生成器

一个面向夫妻的轻量 Web MVP。

当前版本特性：

1. 首页随机生成话题
2. 分类浏览话题
3. 跳过和换题
4. 手机优先的静态页面体验

## 本地打开

这是一个零依赖静态站点，直接用浏览器打开项目根目录下的 `index.html` 即可。

如果需要本地服务预览，可以在项目根目录启动内置静态文件服务：

```powershell
npm start
```

然后访问 `http://127.0.0.1:5173`。

## 部署到 GitHub Pages

1. 将仓库推送到 GitHub。
2. 在仓库设置中打开 `Pages`。
3. 选择从默认分支部署。
4. 根目录作为发布目录。
5. 等待 GitHub Pages 构建完成后，用生成的地址访问即可。

## 项目结构

```text
.
├─ doc/
├─ src/
│  ├─ app.js
│  ├─ data/
│  ├─ lib/
│  └─ styles/
├─ test/
│  ├─ app-contract.test.js
│  ├─ app-runtime.test.js
│  └─ topic-engine.test.js
├─ tools/
│  └─ serve-static.js
├─ index.html
├─ package.json
└─ README.md
```

## 检查与测试

```powershell
npm run check
npm test
```

测试覆盖：

1. 题库分类和随机逻辑
2. 首页静态资源引用
3. 页面脚本加载顺序
4. 页面初始化和分类交互
