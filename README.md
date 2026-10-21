# 基于 MongoDB 的在线问卷系统

## 1 项目简介

本项目是数据库管理课程大作业第一阶段成果，使用 Node.js、Express、MongoDB 和 Mongoose 实现一个简化的在线问卷系统。

系统支持用户注册和登录、问卷创建与管理、四种题型、可配置条件跳转、登录后填写问卷、匿名身份保护、重复提交控制、答卷保存以及统计结果查看。

项目业务数据全部保存在 MongoDB 中，没有使用关系数据库，也没有使用现成的问卷系统框架。

## 2 技术栈

### 后端

- Node.js
- Express
- MongoDB
- Mongoose
- JSON Web Token
- bcryptjs

### 前端

- HTML
- CSS
- 原生 JavaScript

### 测试

- Jest
- Supertest
- 独立 MongoDB 测试数据库

### 其他依赖

- `dotenv`：读取环境变量
- `cors`：跨域请求支持
- `helmet`：设置常用 HTTP 安全响应头
- `morgan`：开发环境请求日志
- `nodemon`：开发环境自动重启服务

## 3 已完成功能

### 3.1 用户认证

- 用户注册
- 用户登录
- JWT 身份认证
- 刷新页面后恢复登录状态
- 退出登录
- 密码使用 bcrypt 哈希保存
- 密码最少 8 个字符
- 拒绝超过 bcrypt 72 个 UTF-8 字节限制的密码
- 用户名唯一
- 接口不返回密码哈希

### 3.2 问卷管理

- 创建问卷
- 设置问卷标题和说明
- 设置截止时间
- 设置是否允许匿名提交
- 设置是否允许同一用户重复提交
- 查看本人创建的问卷列表
- 按问卷状态筛选
- 发布草稿问卷
- 关闭已发布问卷
- 生成公开访问编号和公开填写链接
- 只有创建者能够管理自己的问卷

问卷状态包括：

- `draft`：草稿，不能公开填写
- `published`：已发布，在截止时间前可以填写
- `closed`：已关闭，不能继续填写

### 3.3 题目管理

系统支持以下四种题型：

- `singleChoice`：单选题
- `multipleChoice`：多选题
- `text`：文本题
- `number`：数字题

支持的题目功能包括：

- 创建题目
- 查看题目列表
- 编辑草稿问卷中的题目
- 删除草稿问卷中的题目
- 自动设置题目顺序
- 设置是否必答
- 为选择题设置稳定的 `optionId`
- 防止删除正在被跳转规则引用的题目
- 发布后题目进入只读状态

### 3.4 答案校验

单选题支持：

- 检查选项是否存在
- 检查必答要求

多选题支持：

- 最少选择数量
- 最多选择数量
- 固定选择数量
- 拒绝重复选项
- 拒绝无效选项

文本题支持：

- 最少字符数
- 最多字符数
- 自动去除首尾空白

数字题支持：

- 最小值
- 最大值
- 是否必须为整数
- 拒绝非有限数字

前端提供即时中文提示，后端会对所有提交内容重新校验，不能依靠前端绕过校验。

### 3.5 条件跳转

跳转规则保存在 MongoDB 中，不写死在程序代码里。

系统支持：

- 单选题按选项跳转
- 多选题按包含任一选项或包含全部选项跳转
- 数字题按大于、大于等于、小于或小于等于条件跳转
- `goto`：跳转到后续题目
- `submit`：提前结束并提交问卷
- 多条规则优先级
- 无规则命中时进入下一题
- 禁止跳转到自身
- 禁止跳转到其他问卷的题目
- 禁止向前跳转
- 循环检测
- 被跳过的必答题不参与最终必答校验

### 3.6 问卷填写与答卷保存

- 通过公开链接读取已发布问卷
- 填写和提交前必须登录
- 按实际路径逐题填写
- 支持上一题
- 修改前面答案后重新计算后续路径
- 拒绝提交未访问题目的答案
- 保存实际访问的题目路径
- 保存题目标题和题型快照
- 保存选择题选项文字快照
- 保存问卷数据版本
- 支持匿名提交
- 支持禁止或允许同一用户重复提交
- 草稿、关闭和超过截止时间的问卷不能提交

匿名表示问卷创建者不能从统计结果中获得填写者身份，不表示可以免登录提交。系统内部仍保存填写者标识，用于认证和限制重复提交。

### 3.7 统计功能

问卷创建者可以查看：

- 整份问卷统计
- 单道题统计
- 总答卷数
- 每道题的已回答数量
- 每道题的未回答数量

不同题型的统计内容包括：

- 单选题：每个选项的选择人数
- 多选题：每个选项的选择次数
- 文本题：所有文本回答
- 数字题：有效数字数量、平均值、最小值和最大值

统计接口只允许问卷创建者访问，不返回 `respondentId`、答卷者用户名或 `uniqueSubmissionKey`。

### 3.8 前端页面

- 登录和注册标签切换
- 当前用户显示
- 本人问卷列表
- 创建问卷表单
- 题目创建、编辑和删除
- 跳转规则配置
- 问卷发布与关闭
- 公开链接
- 逐题填写
- 中文答案校验提示
- 问卷统计页面
- 单题统计筛选
- 响应式页面布局

## 4 MongoDB 数据设计

项目使用以下四个主要集合：

- `users`：用户账号和密码哈希
- `surveys`：问卷基本信息、状态和填写配置
- `questions`：题目、选项、校验配置和跳转规则
- `responses`：答卷、填写路径和题目快照

设计原则：

- 不把所有数据放进一个集合
- 问卷与题目使用引用关系
- 答卷中的答案使用嵌入结构
- 跳转规则作为题目配置保存在 MongoDB 中
- 答卷保存题目和选项快照，保护历史数据
- 使用唯一索引限制用户名、公开编号和禁止重复提交的答卷
- 已发布和已关闭问卷保留历史答卷
- 为第二阶段的数据结构变化保留版本字段

详细设计参见 `docs/数据库设计.md`。

## 5 项目目录

```text
questionnaire-system/
├─ docs/
│  ├─ ai-evidence/             AI 使用和测试证据目录
│  ├─ API说明.md              已实现 API 的路径、参数和响应说明
│  ├─ 关键逻辑说明.md          认证、权限、跳转、校验、提交和统计逻辑
│  ├─ AI使用日志.md            AI 提示词、输出、人工修改和验证记录
│  ├─ AI使用说明.md            AI 帮助、错误、人工修改和个人设计总结
│  ├─ 第一阶段项目完成报告.md  第一阶段设计、实现、测试和问题总结
│  ├─ 测试用例与结果.md        测试步骤、输入、预期结果和实际结果
│  ├─ 数据库设计.md            MongoDB 集合、字段、索引和关系设计
│  └─ 需求基线.md              第一阶段需求与验收基线
├─ public/
│  ├─ css/
│  │  ├─ statistics.css        统计页面样式
│  │  └─ styles.css            公共页面样式
│  ├─ js/
│  │  ├─ api.js                前端 API 请求与令牌管理
│  │  ├─ app.js                登录、注册和当前用户界面
│  │  ├─ jumpRules.js          跳转规则配置
│  │  ├─ publicSurvey.js       公开问卷填写与提交
│  │  ├─ questions.js          题目管理
│  │  ├─ statistics.js         统计页面逻辑
│  │  └─ surveys.js            问卷创建与列表管理
│  ├─ index.html               系统首页
│  ├─ statistics.html          问卷统计页面
│  └─ survey.html              公开问卷填写页面
├─ src/
│  ├─ controllers/             认证、问卷、题目、答卷和统计控制器
│  ├─ middleware/              JWT 身份认证中间件
│  ├─ models/                  Mongoose 数据模型
│  ├─ routes/                  Express API 路由
│  ├─ services/                答案校验与路径计算服务
│  ├─ app.js                   Express 应用配置
│  └─ server.js                MongoDB 连接与服务启动入口
├─ tests/
│  ├─ globalSetup.js           Jest 全局启动配置
│  ├─ globalTeardown.js        Jest 全局清理配置
│  ├─ health.test.js           健康接口测试
│  ├─ questionnaire-flow.test.js
│  │                           问卷核心流程测试
│  └─ testServer.js            独立测试服务器
├─ .env.example                环境变量示例
├─ .gitignore                  Git 忽略配置
├─ jest.config.js              Jest 配置
├─ package.json                项目信息、依赖和脚本
├─ package-lock.json           npm 依赖锁定文件
└─ README.md                   项目说明和运行方法
```

## 6 环境要求

本项目开发和验证时使用：

- Windows 10 或 Windows 11
- Node.js 22 或更高版本
- npm 10 或更高版本
- MongoDB 8
- mongosh 2

项目在 `package.json` 中声明：

```json
{
  "engines": {
    "node": ">=22"
  }
}
```

检查本机环境：

```powershell
node --version
npm --version
mongod --version
mongosh --version
```

## 7 安装依赖

进入项目目录：

```powershell
Set-Location -LiteralPath 'D:\python\dataset\questionnaire-system'
```

按照 `package-lock.json` 安装完全一致的依赖：

```powershell
npm ci
```

`npm ci` 会根据锁文件重新安装依赖，适合首次运行、验收和提交后的环境恢复。

开发过程中如果只是普通安装，也可以使用：

```powershell
npm install
```

提交项目时不需要提交 `node_modules`，评阅者可以通过 `npm ci` 恢复依赖。

## 8 配置环境变量

复制环境变量示例：

```powershell
Copy-Item `
    -LiteralPath '.\.env.example' `
    -Destination '.\.env'
```

`.env` 需要包含：

```dotenv
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/questionnaire_system
JWT_SECRET=请替换为足够长的随机字符串
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

各变量用途：

- `PORT`：Express 服务端口
- `MONGODB_URI`：MongoDB 数据库连接地址
- `JWT_SECRET`：JWT 签名密钥，不能使用公开示例值
- `JWT_EXPIRES_IN`：登录令牌有效期
- `NODE_ENV`：运行环境

可以使用 Node.js 生成随机 JWT 密钥：

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

将输出结果复制到 `.env` 的 `JWT_SECRET`。

`.env` 可能包含真实密钥，只能保存在本地，不能提交或放进压缩包。项目只提交 `.env.example`。

## 9 启动 MongoDB

查询 MongoDB Windows 服务状态：

```powershell
Get-Service -Name MongoDB -ErrorAction SilentlyContinue
```

如果服务未运行，请使用管理员 PowerShell 执行：

```powershell
Start-Service -Name MongoDB
```

检查数据库连接：

```powershell
mongosh --quiet --eval "db.runCommand({ ping: 1 })"
```

正常结果应包含：

```text
{ ok: 1 }
```

## 10 启动项目

### 开发模式

开发模式使用 nodemon，代码变化后自动重启：

```powershell
npm run dev
```

正常情况下终端应显示：

```text
MongoDB connected
Server running at http://localhost:3000
```

### 普通启动

```powershell
npm start
```

普通启动使用：

```text
node src/server.js
```

### 健康检查

另开一个 PowerShell 终端执行：

```powershell
Invoke-RestMethod `
    -Uri 'http://localhost:3000/api/health' `
    -Method Get
```

正常结果：

```text
status  : ok
message : Questionnaire API is running
```

## 11 页面入口

服务启动后可以访问以下页面。

### 系统首页

```text
http://localhost:3000/
```

首页用于：

- 注册
- 登录
- 创建问卷
- 查看本人问卷
- 管理题目
- 配置跳转规则
- 发布或关闭问卷
- 进入统计页面

### 公开问卷页面

```text
http://localhost:3000/survey.html?publicId=<问卷公开编号>
```

示例：

```text
http://localhost:3000/survey.html?publicId=113ce77197840cf9
```

公开问卷信息可以直接读取，但填写和提交前必须登录。

### 问卷统计页面

```text
http://localhost:3000/statistics.html?surveyId=<问卷ID>
```

统计页面需要先在同一浏览器中登录，并且只有问卷创建者能够访问。

### 健康接口

```text
http://localhost:3000/api/health
```

## 12 运行自动化测试

运行完整测试：

```powershell
npm test
```

测试使用：

- Jest
- Supertest
- `questionnaire_system_test` 独立测试数据库
- `127.0.0.1:3101` 独立测试服务器

测试开始前会清理测试数据库，测试结束后会关闭测试服务器并再次清理测试数据库。

测试代码具有数据库名称保护，只允许清理：

```text
questionnaire_system_test
```

不会清理开发数据库：

```text
questionnaire_system
```

当前自动化测试覆盖：

- 健康接口
- 404 接口
- 创建问卷
- 添加题目
- 合法跳转
- 非法向前跳转
- 非法选项校验
- 问卷提交
- 重复提交保护
- 路径记录
- 统计结果
- 单题统计
- 未登录访问保护
- 跨用户访问保护
- 敏感身份字段保护

单独运行健康测试：

```powershell
npm test -- --runTestsByPath tests/health.test.js
```

单独运行核心流程测试：

```powershell
npm test -- --runTestsByPath tests/questionnaire-flow.test.js
```

监听模式：

```powershell
npm run test:watch
```

测试前必须确保 MongoDB 服务已经启动。

## 13 生产依赖安全检查

运行正式依赖安全检查：

```powershell
npm run audit:prod
```

该脚本显式使用 npm 官方 registry，因为部分 npm 镜像没有实现 Audit API。

不要在未分析影响的情况下直接执行：

```text
npm audit fix --force
```

强制升级可能导致依赖版本不兼容。

## 14 第一阶段完成情况

### 已完成

- [X] 项目环境和配置
- [X] MongoDB 数据模型
- [X] 用户注册、登录和 JWT 认证
- [X] 问卷创建、列表、发布、关闭和公开读取
- [X] 四种题型的创建、编辑和删除
- [X] 按题型保存校验配置
- [X] 条件跳转和循环保护
- [X] 问卷填写、答案校验和答卷保存
- [X] 匿名身份保护
- [X] 重复提交控制
- [X] 整份问卷和单题统计
- [X] 前端操作页面
- [X] Jest 自动化测试
- [X] MongoDB 数据库设计文档
- [X] AI 使用日志

### 文档收尾中

- [X] API 说明
- [X] 关键逻辑说明
- [X] 测试用例与结果文档
- [X] 第一阶段项目完成报告
- [X] 最终 AI 使用说明

## 15 提交说明

提交内容应包括：

- `src`
- `public`
- `tests`
- `docs`
- `.env.example`
- `.gitignore`
- `jest.config.js`
- `package.json`
- `package-lock.json`
- `README.md`

提交前必须排除：

- `.env`
- `node_modules`
- `coverage`
- `*.log`
- `npm-debug.log*`
- 临时测试文件
- 编辑器缓存
- 本机 MongoDB 数据文件

提交前建议在干净目录中执行：

```powershell
npm ci
npm test
npm start
```

确认依赖可以恢复、自动化测试通过并且项目可以正常启动。
