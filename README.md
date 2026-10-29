
# 基于 MongoDB 的在线问卷系统

## 1 项目简介

本项目是数据库管理课程大作业第一、第二阶段成果，使用 Node.js、Express、MongoDB 和 Mongoose 实现在线问卷系统。

第一阶段完成用户认证、问卷管理、四种题型、条件跳转、问卷填写、答案校验、匿名保护、重复提交控制和问卷统计。

第二阶段在第一阶段代码和旧数据基础上增量扩展，实现可复用题目、不可变版本历史、指定版本入卷、题目共享、题目使用情况、个人题目库、单题跨问卷统计和旧数据迁移。第一阶段代码、旧问卷、旧答卷和原有功能继续保留。

项目业务数据全部保存在 MongoDB 中，没有使用关系数据库，也没有使用现成问卷系统框架。

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

- `dotenv`：环境变量
- `cors`：跨域支持
- `helmet`：HTTP 安全响应头
- `morgan`：开发环境请求日志
- `nodemon`：开发环境自动重启

## 3 第一阶段功能

### 3.1 用户认证

- 用户注册和登录
- JWT 身份认证
- 密码使用 bcrypt 哈希保存
- 密码最少 8 个字符
- 拒绝超过 bcrypt 72 个 UTF-8 字节的密码
- 用户名唯一
- 接口不返回密码哈希
- 前端刷新后恢复登录状态

### 3.2 问卷管理

- 创建问卷
- 查看本人问卷
- 设置标题、说明和截止时间
- 设置匿名提交
- 设置是否允许重复提交
- 发布和关闭问卷
- 生成公开填写链接
- 草稿、已发布和已关闭状态管理
- 只有问卷创建者能够管理问卷

### 3.3 题目管理

支持四种题型：

- `singleChoice`：单选题
- `multipleChoice`：多选题
- `text`：文本题
- `number`：数字题

支持：

- 创建、查看、编辑和删除草稿题目
- 自动设置题目顺序
- 设置必答
- 选择题稳定 `optionId`
- 多选数量限制
- 文本长度限制
- 数字范围和整数限制
- 发布后题目只读
- 被跳转规则引用的题目删除保护

### 3.4 条件跳转

- 单选题按选项跳转
- 多选题按包含任一或全部选项跳转
- 数字题按比较条件跳转
- `goto` 跳转到后续题目
- `submit` 提前结束问卷
- 多条规则优先级
- 无规则命中时进入下一题
- 禁止自跳转、跨问卷跳转和向前跳转
- 循环检测
- 跳转规则存储在 MongoDB 中，不写死在代码中

### 3.5 问卷填写和答卷

- 通过公开链接读取问卷
- 填写和提交前必须登录
- 按实际路径逐题填写
- 支持上一题
- 修改前面答案后重新计算路径
- 前后端双重答案校验
- 保存实际访问路径
- 保存题目、题型和选项文字快照
- 匿名身份保护
- 重复提交控制
- 截止时间和问卷状态保护

匿名表示问卷创建者不能从统计结果中获得答卷者身份，不表示可以免登录填写。系统内部仍保存填写者标识，用于认证和限制重复提交。

### 3.6 问卷统计

- 整份问卷统计
- 单题统计
- 总答卷数
- 已回答数量
- 未回答数量
- 单选题选项人数
- 多选题选项次数
- 文本回答列表
- 数字数量、平均值、最小值和最大值
- 所有权保护
- 匿名身份字段保护

## 4 第二阶段功能

### 4.1 可复用题目

- 独立创建可复用题目
- 查看本人题目列表和详情
- 支持四种题型及校验规则
- 选择明确版本加入本人草稿问卷
- 同一题目可以被多份问卷使用
- 问卷保存题目内容快照
- 问卷记录 `questionItemId` 和 `questionVersionId`

### 4.2 不可变版本历史

- 每个逻辑题目具有递增版本号
- 历史版本内容不可直接覆盖
- 记录父版本 `parentVersionId`
- 记录恢复来源 `restoredFromVersionId`
- 创建新版本不自动升级已有问卷
- 恢复历史版本时复制内容并生成新版本
- 不删除原来的历史版本

### 4.3 指定版本入卷

问卷题目实例保存：

- `questionItemId`
- `questionVersionId`
- `contentSource`
- `schemaVersion`
- 标题、题型、选项和校验规则快照

`required`、`order` 和 `jumpRules` 继续属于具体问卷中的题目实例。

### 4.4 题目共享

- 所有者按用户名共享题目
- 接收者查看收到的共享及版本
- 接收者只有 `use` 权限
- 接收者可以将指定版本加入自己的草稿问卷
- 接收者不能修改、恢复或覆盖所有者版本
- 共享关系使用唯一记录
- 软撤销共享
- 重新共享时激活原记录
- 撤销后禁止新的复用
- 撤销前已有问卷快照继续保留

### 4.5 题目使用情况

- 查看逻辑题目被本人哪些问卷使用
- 显示问卷 ID、标题和状态
- 显示题目顺序和必答状态
- 显示实际采用的版本
- 统计使用次数和问卷数量
- 创建新版本后旧问卷仍引用原版本

### 4.6 个人题目库

- 创建和查看本人题目库
- 查看题目库详情
- 修改名称和说明
- 向题目库加入题目
- 从题目库移除题目
- 设置推荐版本
- 从题目库选择指定版本加入草稿问卷
- 题目库只保存题目和版本引用
- 移除题目不删除逻辑题目、历史版本或问卷快照

### 4.7 单题跨问卷统计

- 只统计当前用户拥有的问卷
- 支持逻辑题目整体统计
- 支持 `questionVersionId` 筛选
- 不兼容版本分开显示
- 单选和多选按稳定 `optionId` 统计
- 文本题返回回答列表
- 数字题返回数量、平均值、最小值和最大值
- 返回问卷数、题目实例数和去重答卷数
- 返回回答机会数、实际回答数和未回答数
- 不返回 `respondentId`、答卷者用户名或 `uniqueSubmissionKey`

未回答数量计算方式：

```text
notAnsweredCount =
answerOpportunityCount - totalAnswers
```

### 4.8 旧数据迁移

- 保留第一阶段集合和字段
- 为旧题目建立逻辑题目和初始版本
- 为旧问卷题目补充题目和版本引用
- 为旧答案补充逻辑题目和版本引用
- 保留旧问卷内容和旧答卷
- 记录迁移状态和失败详情
- 默认 dry-run
- 只有显式传入 `--apply` 才写入数据库
- 支持重复执行，不产生重复版本

## 5 MongoDB 集合

### 第一阶段核心集合

- `users`
- `surveys`
- `questions`
- `responses`

### 第二阶段新增集合

- `questionItems`：逻辑题目标识和当前推荐版本
- `questionVersions`：不可变题目版本内容
- `questionShares`：题目共享关系
- `questionBanks`：个人题目库和题目引用
- `schemaMigrations`：迁移状态、数量和错误记录

详细字段、引用、嵌入、索引、快照、迁移和兼容设计参见：

```text
docs/数据库设计.md
```

## 6 项目目录

```text
questionnaire-system/
├─ docs/
│  ├─ AI使用日志.md
│  ├─ AI使用说明.md
│  ├─ API说明.md
│  ├─ 关键逻辑说明.md
│  ├─ 数据库设计.md
│  ├─ 数据迁移说明.md
│  ├─ 测试用例与结果.md
│  ├─ 需求基线.md
│  ├─ 第二阶段需求基线.md
│  ├─ 第一阶段项目完成报告.md
│  └─ 第二阶段项目完成报告.md
├─ public/
│  ├─ css/
│  │  ├─ resources.css
│  │  ├─ statistics.css
│  │  └─ styles.css
│  ├─ js/
│  │  ├─ api.js
│  │  ├─ app.js
│  │  ├─ jumpRules.js
│  │  ├─ publicSurvey.js
│  │  ├─ questions.js
│  │  ├─ resources.js
│  │  ├─ statistics.js
│  │  └─ surveys.js
│  ├─ index.html
│  ├─ resources.html
│  ├─ statistics.html
│  └─ survey.html
├─ scripts/
│  └─ migrate-stage2-question-versioning.js
├─ src/
│  ├─ controllers/
│  ├─ middleware/
│  ├─ models/
│  ├─ routes/
│  ├─ services/
│  ├─ app.js
│  └─ server.js
├─ tests/
│  ├─ globalSetup.js
│  ├─ globalTeardown.js
│  ├─ health.test.js
│  ├─ questionnaire-flow.test.js
│  ├─ stage2-resources.test.js
│  └─ testServer.js
├─ .env.example
├─ .gitignore
├─ jest.config.js
├─ package.json
├─ package-lock.json
└─ README.md
```

## 7 环境要求

本项目开发和验证环境：

- Windows 10 或 Windows 11
- Node.js 22 或更高版本
- npm 10 或更高版本
- MongoDB 8
- mongosh 2

检查环境：

```powershell
node --version
npm --version
mongod --version
mongosh --version
```

## 8 安装依赖

进入项目目录：

```powershell
Set-Location -LiteralPath `
    'D:\python\dataset\questionnaire-system'
```

安装锁定版本的依赖：

```powershell
npm ci
```

开发环境也可以执行：

```powershell
npm install
```

`node_modules` 不提交，评阅者可以通过 `npm ci` 恢复依赖。

## 9 配置环境变量

复制环境变量示例：

```powershell
Copy-Item `
    -LiteralPath '.\.env.example' `
    -Destination '.\.env'
```

`.env` 示例：

```dotenv
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/questionnaire_system
JWT_SECRET=请替换为足够长的随机字符串
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

生成随机 JWT 密钥：

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

`.env` 包含本地密钥，不能提交。项目只提交 `.env.example`。

## 10 启动 MongoDB

检查服务：

```powershell
Get-Service -Name MongoDB `
    -ErrorAction SilentlyContinue
```

如未运行，请在管理员 PowerShell 中执行：

```powershell
Start-Service -Name MongoDB
```

检查连接：

```powershell
mongosh `
    'mongodb://127.0.0.1:27017/questionnaire_system' `
    --quiet `
    --eval 'printjson(db.runCommand({ ping: 1 }))'
```

正常结果：

```text
{ ok: 1 }
```

## 11 第二阶段数据迁移

如果数据库中存在第一阶段旧数据，先备份数据库，再执行迁移。

### 11.1 默认 dry-run

```powershell
node `
    '.\scripts\migrate-stage2-question-versioning.js' `
    --dry-run
```

dry-run 只显示：

- 目标数据库
- 旧题目数量
- 旧答卷数量
- 预计迁移数量
- 引用问题

不会写入或修改数据。

### 11.2 正式迁移

确认 dry-run 的数据库和数量正确后，显式执行：

```powershell
node `
    '.\scripts\migrate-stage2-question-versioning.js' `
    --apply
```

迁移完成后再次执行 `--apply`，脚本不会重复创建 `questionItems` 或 `questionVersions`。

全新空数据库不需要迁移旧数据，可以直接启动项目。

## 12 启动项目

### 开发模式

```powershell
npm run dev
```

### 普通启动

```powershell
npm start
```

正常输出：

```text
MongoDB connected
Server running at http://localhost:3000
```

健康检查：

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

## 13 页面入口

### 系统首页

```text
http://localhost:3000/
```

用于注册、登录、问卷创建、问卷列表、题目管理、跳转配置、发布、关闭和问卷统计。

### 第二阶段题目资源管理

```text
http://localhost:3000/resources.html
```

用于：

- 可复用题目
- 版本历史
- 恢复历史版本
- 指定版本入卷
- 题目使用情况
- 共享和软撤销
- 接收共享
- 个人题目库
- 跨问卷统计

访问前需要先在系统首页登录。

### 公开问卷页面

```text
http://localhost:3000/survey.html?publicId=<问卷公开编号>
```

公开问卷信息可以读取，但填写和提交前必须登录。

### 问卷统计页面

```text
http://localhost:3000/statistics.html?surveyId=<问卷ID>
```

只有问卷创建者能够查看。

### 健康接口

```text
http://localhost:3000/api/health
```

## 14 自动化测试

运行完整测试：

```powershell
npm test
```

测试环境：

- 测试数据库：`questionnaire_system_test`
- 测试服务器：`127.0.0.1:3101`
- 测试开始前清理数据库
- 测试结束后关闭服务器并再次清理数据库
- 不会清理开发数据库 `questionnaire_system`

当前测试结果：

```text
Test Suites: 3 passed, 3 total
Tests:       14 passed, 14 total
Snapshots:   0 total
```

### 第一阶段测试

```powershell
npm test -- `
    --runTestsByPath `
    tests/health.test.js `
    tests/questionnaire-flow.test.js
```

覆盖：

- 健康接口
- 创建问卷
- 添加题目
- 跳转逻辑
- 答案校验
- 提交和重复提交
- 问卷统计
- 权限和敏感字段保护

### 第二阶段测试

```powershell
npm test -- `
    --runTestsByPath `
    tests/stage2-resources.test.js
```

覆盖：

- 创建可复用题目
- 版本递增
- 恢复历史版本生成新版本
- 指定版本入卷
- 内容快照和旧版本保护
- 题目使用情况
- 共享、软撤销和重新激活
- 接收者权限
- 题目库和推荐版本
- 跨问卷统计和版本筛选
- 跨用户数据隔离
- 问卷状态保护

测试结束后检查：

```powershell
$listener = Get-NetTCPConnection `
    -LocalPort 3101 `
    -State Listen `
    -ErrorAction SilentlyContinue

"测试端口仍在监听：$([bool]$listener)"

mongosh `
    'mongodb://127.0.0.1:27017/questionnaire_system_test' `
    --quiet `
    --eval 'printjson(db.getCollectionNames())'
```

正常结果：

```text
测试端口仍在监听：False
[]
```

## 15 生产依赖安全检查

```powershell
npm run audit:prod
```

该脚本显式使用 npm 官方 registry，因为部分镜像没有实现 Audit API。

不要在未分析影响时直接执行：

```text
npm audit fix --force
```

## 16 文档

- `docs/需求基线.md`：第一阶段需求
- `docs/第二阶段需求基线.md`：第二阶段八项变更需求
- `docs/数据库设计.md`：集合、字段、引用、嵌入和索引
- `docs/API说明.md`：API 路径、字段、响应和状态码
- `docs/关键逻辑说明.md`：认证、跳转、版本、共享和统计逻辑
- `docs/数据迁移说明.md`：备份、dry-run、正式迁移和兼容说明
- `docs/测试用例与结果.md`：测试步骤、输入、输出和结果
- `docs/AI使用日志.md`：AI 提示词、结果、人工修改和验证
- `docs/AI使用说明.md`：AI 帮助、错误、人工修改和个人设计
- `docs/第一阶段项目完成报告.md`：第一阶段报告
- `docs/第二阶段项目完成报告.md`：第二阶段演进和最终完成报告

## 17 完成情况

### 第一阶段

- [X] 用户注册、登录和 JWT 认证
- [X] 问卷创建、列表、发布和关闭
- [X] 四种题型
- [X] 条件跳转
- [X] 问卷填写和答案校验
- [X] 匿名和重复提交保护
- [X] 整份问卷和单题统计
- [X] 第一阶段前端和自动化测试

### 第二阶段

- [X] 第一阶段 Git 基线和旧数据备份
- [X] 第二阶段需求和数据库设计
- [X] 新集合、字段和索引
- [X] 默认 dry-run 和幂等迁移
- [X] 可复用题目
- [X] 不可变版本历史
- [X] 恢复历史版本
- [X] 指定版本入卷和内容快照
- [X] 题目共享、软撤销和重新激活
- [X] 题目使用情况
- [X] 个人题目库
- [X] 单题跨问卷统计
- [X] 第二阶段前端
- [X] 第一阶段回归测试
- [X] 第二阶段自动化测试
- [X] AI 使用日志

## 18 提交说明

应提交：

- `src`
- `public`
- `scripts`
- `tests`
- `docs`
- `.env.example`
- `.gitignore`
- `jest.config.js`
- `package.json`
- `package-lock.json`
- `README.md`

不得提交：

- `.env`
- `node_modules`
- `coverage`
- `*.log`
- `npm-debug.log*`
- 临时测试文件
- 数据库备份
- 本机 MongoDB 数据文件
- 编辑器缓存

提交前应在干净目录中执行：

```powershell
npm ci
node .\scripts\migrate-stage2-question-versioning.js --dry-run
npm test
npm start
```

确认依赖能够恢复、迁移脚本能够运行、14 项测试通过，并且三个页面入口可以访问。
