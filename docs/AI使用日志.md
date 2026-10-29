# 数据库管理大作业 AI 使用日志

本日志按照课程要求真实记录 AI 使用过程。每条记录统一包含：使用工具、Prompt、Result、是否修改、修改内容和验证结果。没有生成业务代码的步骤会明确注明“未生成业务代码”，不虚构 AI 产出。

## AI-001 阅读作业文档并梳理第一阶段工作

**日期：** 2026-10-18
**使用工具：** Codex

### Prompt

```text
请阅读我的作业文档，梳理出第一阶段需要上叫什么工作，并告诉我接下来该怎么做
```

学生在需求基线整理过程中补充提出：

```text
我对 AI-001 的需求分析有一个补充意见：

我认为“匿名填写”应该表示对问卷创建者隐藏填写者身份，而不是允许未登录填写。系统内部可以保存 respondentId，用于登录验证和限制重复提交；但创建者查看匿名答卷、统计结果或调用相关 API 时，都不能得到 respondentId、用户名等身份信息。

这样既能满足作业中“填写问卷前需要登录”的要求，也能避免匿名答卷通过接口泄露填写者身份。

请检查这个意见是否合理，并告诉我应该在 docs/需求基线.md 的什么位置补充。文档由我亲自修改；完成并验证后，请由你更新 AI使用日志.md。
```

### Result 得到什么代码或结果

- 整理了用户注册登录、问卷管理、三种题型、条件跳转、填写提交和统计功能。
- 整理了 MongoDB 设计、测试、文档、项目报告和 AI 使用要求。
- 指出了“填写者需要登录”与“支持匿名填写”需要统一解释。
- 给出了第一阶段的开发顺序。
- AI 检查了学生提出的匿名隐私边界，确认该解释能够同时满足登录填写、重复提交控制和匿名保护要求，并指出应修改 `docs/需求基线.md` 第 8 节。
- 本次为需求分析，未生成业务代码。

### 是否修改

有修改。学生对 AI 的需求梳理进行了人工检查，主动提出匿名填写的身份保护规则，并亲自修改需求基线。

### 修改内容

- 确定采用 Node.js、Express、MongoDB 和 Mongoose。
- 将匿名填写解释为：填写者仍需登录，但创建者查看匿名答卷时看不到填写者身份。
- 明确系统内部可以保存 `respondentId`，用于身份认证和限制重复提交。
- 明确创建者查看匿名答卷、统计结果或调用相关 API 时，不得获得 `respondentId`、用户名等身份信息。
- 明确匿名保护必须由后端控制返回字段，不能只依靠前端隐藏。
- 增加 `allowMultipleSubmissions` 控制同一用户能否重复提交。
- 问卷状态采用 `draft`、`published` 和 `closed`。
- 确定跳转和校验规则必须存入 MongoDB，不能写死在程序中。

### 验证结果

已对照作业的项目目标、两阶段说明、技术要求、MongoDB 要求、AI 要求、测试要求、提交内容、评分表和初始用户需求检查。学生使用 `Select-String` 检查修改结果，确认 `docs/需求基线.md` 已包含匿名含义、`respondentId` 的内部用途、匿名 API 返回限制和后端字段控制要求。修改结果作为第一阶段需求基线采用。

## AI-002 建立项目骨架和需求文档

**日期：** 2026-10-18
**使用工具：** Codex

### Prompt

```text
请执行第一阶段第1步。D:\python\dataset> 路径下采用 Node.js、Express、MongoDB 和 Mongoose，在当前工作区创建 questionnaire-system 项目骨架。建立 docs/需求基线.md、docs/AI使用日志.md、docs/ai-evidence、src、tests 和 README.md。把已经梳理的全部第一阶段要求写入需求基线，并把 AI-001 使用日志写入日志文件。暂时不要实现业务功能。完成后检查目录和文件内容，说明创建了什么、如何验证，并给出下一步提示词。(下一步主要是教我怎么去做，而不是直接替我做）
```

2026-10-19，学生检查项目说明后补充提出：

```text
我检查了 AI-002 创建的 README.md，发现“当前仅建立项目骨架，尚未初始化 Node.js 依赖，也没有实现业务功能”已经与项目实际进度不一致。

我的修改意见是：README 不应该一直保留项目刚创建时的状态，而应该反映当前已经完成的环境配置、认证、问卷管理、题目管理、跳转规则和问卷发布功能。同时保留未完成的答卷提交、统计、自动测试和最终报告项目，方便后续检查进度。

请检查这个意见是否合理，并告诉我应该修改 README.md 的哪些位置以及具体内容。README 由我亲自修改；完成并验证后，请由你更新 AI-002 日志。
```

### Result 得到什么代码或结果

- 创建项目目录 `D:\python\dataset\questionnaire-system`。
- 创建 `docs/ai-evidence`、`src` 和 `tests` 目录。
- 生成 `README.md`、`docs/需求基线.md` 和 `docs/AI使用日志.md`。
- `docs/需求基线.md` 包含 15 个章节，覆盖全部第一阶段要求。
- 学生在项目开发推进后发现 README 仍停留在项目骨架阶段，提出 README 应持续反映真实完成状态。AI 检查意见后提供了当前目录说明和进度清单的修改内容。
- 本次只生成 Markdown 文档和空目录，未生成业务代码。

### 是否修改

有修改。项目骨架最初采用 AI 生成的目录和文档；随后学生主动发现 README 状态说明已经过期，并亲自更新目录说明和项目进度。

### 修改内容

- 项目位置按人工指定改为 `D:\python\dataset\questionnaire-system`。
- 明确本步骤不运行 `npm init`、不安装依赖、不编写业务代码。
- 确定后续采用“学生执行命令，AI 指导、检查和记录”的方式。
- 将 README 中“尚未初始化 Node.js 依赖，也没有实现业务功能”的过期说明改为当前实际进度。
- 补充 `controllers`、`middleware`、`models`、`routes` 和 `services` 等实际目录职责。
- 将认证、问卷管理、题目管理、跳转规则、发布和公开读取标记为已完成。
- 将答卷提交检查、统计、自动测试、API 文档和最终报告保留为待完成项目。

### 验证结果

- 三个 Markdown 文件均存在。
- `docs/ai-evidence`、`src` 和 `tests` 均存在。
- 当时不存在 `package.json`，`src` 和 `tests` 为空。
- 项目骨架和需求文档通过检查并采用。
- README 更新后，“尚未初始化 Node.js”或“没有实现业务功能”等过期描述匹配数量为 0。
- 学生最初使用未指定编码的 PowerShell 命令读取 README 时出现中文乱码；AI 随后使用 `Get-Content -Encoding UTF8` 重新读取，确认文件中的中文内容完整，乱码仅来自终端读取编码。
- 更新后的 README 与当前实际目录一致，并将尚未动态验证的答卷提交功能保留为进行中，没有提前标记完成。

## AI-003 检查 Node.js 环境并初始化项目

**日期：** 2026-10-18
**使用工具：** Codex

### Prompt

```text
请开始第一阶段第2步，但不要替我执行命令。请教我在 Windows PowerShell 中进入 D:\python\dataset\questionnaire-system，检查 Node.js 和 npm 是否安装，然后初始化 Node.js 项目。一次只给我一个操作，解释命令的用途、正常情况下应该看到什么结果，并等待我把终端输出发给你后再继续。不要安装 Express 或其他依赖，直到 Node.js 项目初始化确认成功。请把本次过程记录为 AI-003，并在每次回答末尾提供下一条提示词。
```

后续提示词提供了 `Get-Location`、`node --version`、`npm --version` 和 `npm init -y` 的真实终端输出，并要求 AI 检查初始化结果。

2026-10-19，学生检查初始化配置后补充提出：

```text
我检查了 AI-003 初始化生成的 package.json，发现其中没有记录项目使用的 Node.js 版本，也没有声明这是一个不需要发布到 npm 的课程项目。

我的修改意见是：在 package.json 中增加 "private": true，防止误执行 npm publish；同时增加 "engines": { "node": ">=22" }，明确项目使用和验证过的 Node.js 运行环境。这样其他人运行项目时能够提前发现 Node.js 版本不符合要求的问题。

请检查这个意见是否合理，并告诉我应该如何亲自修改和验证 package.json。完成验证后，请由你更新 AI-003 日志。
```

### Result 得到什么代码或结果

AI 提供并解释了以下命令：

```powershell
Set-Location -LiteralPath 'D:\python\dataset\questionnaire-system'
Get-Location
node --version
npm --version
npm init -y
Get-Content -LiteralPath '.\package.json'
```

npm 生成了基础 `package.json`。本步骤未生成业务源代码。

学生随后提出完善项目元数据的意见。AI 提供了使用 `npm pkg set` 修改配置、同步锁文件以及检查字段类型的命令。

### 是否修改

有修改。学生亲自执行所有初始化命令；初始 `package.json` 由 `npm init -y` 生成，随后学生主动提出并亲自增加私有项目标志和 Node.js 版本要求。

### 修改内容

- 新增 `package.json`。
- 在 `package.json` 中增加布尔值 `"private": true`，防止课程项目被误发布到 npm。
- 在 `package.json` 中增加 `"engines": { "node": ">=22" }`，声明经过验证的 Node.js 运行版本要求。
- 执行 `npm install --package-lock-only --ignore-scripts`，将 Node.js 版本要求同步到 `package-lock.json`。
- 没有安装第三方依赖。
- 没有修改 `src` 或编写业务代码。

### 验证结果

- 当前路径：`D:\python\dataset\questionnaire-system`。
- Node.js：`v22.17.0`。
- npm：`10.9.2`。
- `package.json` 名称为 `questionnaire-system`，版本为 `1.0.0`。
- `npm pkg get private engines` 返回 `private: true` 和 `engines.node: ">=22"`。
- Node.js 检查结果显示 `privateType: "boolean"`，确认没有将 `private` 错写成字符串。
- `package-lock.json` 根项目的 `engines.node` 同样为 `">=22"`，锁文件已经同步。
- Node.js 项目初始化成功，结果采用。

## AI-004 检查并启动 MongoDB 本地环境

**日期：** 2026-10-18
**使用工具：** Codex

### Prompt

```text
我已经执行 mongod --version、mongosh --version 和 Get-Service -Name MongoDB -ErrorAction SilentlyContinue，终端输出如下：

db version v8.3.11
mongosh 2.11.1
Stopped MongoDB MongoDB

请判断我的 MongoDB 环境状态。如果存在问题，教我解决；如果环境正常，再教我安装项目依赖。所有命令仍由我亲自执行，一次多给我几步操作，并你来继续更新 AI-004 日志。
```

启动服务失败后，学生继续提交了 `CouldNotStartService` 错误；提升权限后又提交 `{ ok: 1 }` 的连接结果，请求 AI 继续判断。

2026-10-19，学生再次执行 `Get-Service` 和 `mongosh`，要求确认 MongoDB 服务与数据库连接仍然正常，并明确不虚构代码修改或个人设计。

### Result 得到什么代码或结果

AI 判断 MongoDB 已安装但 Windows 服务处于停止状态，提供了以下诊断和验证命令：

```powershell
Start-Service -Name MongoDB
Get-Service -Name MongoDB
([Security.Principal.WindowsPrincipal]::new([Security.Principal.WindowsIdentity]::GetCurrent())).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
Start-Process powershell.exe -Verb RunAs
mongosh --quiet --eval "db.runCommand({ ping: 1 })"
```

本步骤得到的是环境诊断命令，没有生成业务代码。

### 是否修改

没有修改项目代码。学生根据 AI 建议，以管理员 PowerShell 启动 MongoDB Windows 服务。

### 修改内容

- MongoDB 服务状态由 `Stopped` 改为运行状态。
- 没有修改 MongoDB 安装文件或数据目录。
- 没有重新安装 MongoDB。

### 验证结果

- MongoDB Server：`8.3.11`。
- MongoDB Shell：`2.11.1`。
- 普通 PowerShell 管理员检查结果为 `False`。
- 提升权限后成功启动服务。
- `mongosh` 返回 `{ ok: 1 }`，本地 MongoDB 连接验证通过。
- 2026-10-19 复查时，MongoDB Windows 服务状态为 `Running`，`mongosh --quiet --eval "db.runCommand({ ping: 1 })"` 再次返回 `{ ok: 1 }`。
- 当前服务运行状态和数据库连接均正常；本次复查没有修改项目代码、MongoDB 配置或业务设计。

## AI-005 安装 Node.js 项目依赖

**日期：** 2026-10-18
**使用工具：** Codex

### Prompt

```text
我已经检查管理员权限，并在需要时使用管理员 PowerShell 重新启动 MongoDB。mongosh ping 返回 { ok: 1 }。请完成 AI-004 日志并开始 AI-005，教我亲自安装 Node.js 项目依赖。所有命令仍由我亲自执行，AI使用日志.md由你更新。
```

依赖安装完成后，学生提交了 `npm list --depth=0` 的完整结果，并要求检查依赖是否完整。

2026-10-19，学生检查依赖验证方式后补充提出：

```text
我检查了 AI-005 的依赖安装和验证过程，发现当时只使用 npm list --depth=0 检查依赖是否安装完整，没有形成可重复执行的运行依赖安全检查。

我的修改意见是：在 package.json 的 scripts 中增加 "audit:prod": "npm audit --omit=dev"，用于检查正式运行依赖的已知安全问题。以后可以通过 npm run audit:prod 重复执行检查。如果发现漏洞，应先查看具体依赖和影响，不直接使用 npm audit fix --force，避免强制升级破坏现有功能。

请检查这个意见是否合理，并教我亲自修改 package.json、同步 package-lock.json 和执行验证。完成后请由你更新 AI-005 日志。
```

### Result 得到什么代码或结果

AI 提供了以下安装和检查命令：

```powershell
npm install express mongoose dotenv bcryptjs jsonwebtoken cors helmet morgan
npm install --save-dev nodemon jest supertest
npm list --depth=0
```

本步骤未生成业务源代码；npm 自动更新了依赖配置。

AI 接受了学生增加可重复安全审计命令的意见，最初建议将 `audit:prod` 设置为 `npm audit --omit=dev`。该建议没有考虑学生本地使用的 npmmirror 不支持 npm Audit API，首次运行返回 404 和 `NOT_IMPLEMENTED`。根据实际错误，AI 建议只为审计命令显式指定 npm 官方 registry；学生亲自修改脚本并重新执行。

### 是否修改

有修改。最初安装依赖时，学生未修改 AI 给出的安装命令，依赖版本由 npm 实际解析确定。随后学生主动提出增加运行依赖安全检查，并根据首次审计的真实错误调整 AI 建议的脚本。

### 修改内容

- `package.json` 新增运行依赖和开发依赖。
- 新增或更新 `package-lock.json`。
- 创建或更新 `node_modules`。
- 在 `package.json` 中增加 `audit:prod` 脚本。
- 初版脚本为 `npm audit --omit=dev`；由于本地 registry 为 `https://registry.npmmirror.com/`，其 Audit API 返回 404，学生将脚本修改为 `npm audit --omit=dev --registry=https://registry.npmjs.org`。
- 只为安全审计命令指定 npm 官方 registry，没有修改全局 registry，也没有执行 `npm audit fix --force`。
- 没有修改业务源代码。

### 验证结果

运行依赖：`bcryptjs@3.0.3`、`cors@2.8.6`、`dotenv@18.0.8`、`express@5.3.0`、`helmet@8.3.0`、`jsonwebtoken@9.0.3`、`mongoose@9.11.2`、`morgan@1.12.1`。

开发依赖：`jest@30.5.2`、`nodemon@3.1.14`、`supertest@7.3.1`。

`npm list --depth=0` 没有显示缺失或无效依赖，安装结果采用。

- `npm config get registry` 确认日常 npm registry 为 `https://registry.npmmirror.com/`。
- 首次 `npm run audit:prod` 正确启动了审计命令，但因镜像未实现 Audit API 而失败；该结果不是依赖漏洞，也不是业务代码错误。
- 修改后的 `audit:prod` 已实际读取为 `npm audit --omit=dev --registry=https://registry.npmjs.org`。
- 再次运行返回 `found 0 vulnerabilities`，说明审计请求成功完成，并且执行当时没有检测到运行依赖的已知漏洞。

## AI-006 配置脚本 环境变量和最小服务

**日期：** 2026-10-18
**使用工具：** Codex

### Prompt

```text
请完成 AI-005 日志，然后开始 AI-006，教我亲自配置 package.json、环境变量示例和最小项目入口。不要直接替我修改这些文件；AI使用日志.md仍由你负责更新。
```

配置后，学生提交了 `package.json` 脚本、环境变量文件和 `src` 文件列表。发现入口文件被命名为 `sever.js` 后，学生按照建议重命名并提交健康检查结果：

```text
status message
------ -------
ok     Questionnaire API is running
```

2026-10-19，学生重新检查入口配置、`.env.example`、两个入口文件的语法和健康接口。第一次健康检查因开发服务没有运行而无法连接；学生在新终端执行 `npm run dev` 后再次请求健康接口，成功返回 `status: ok`。

### Result 得到什么代码或结果

AI 提供了以下代码和配置：

- `package.json`：入口改为 `src/server.js`，增加 `start`、`dev`、`test` 和 `test:watch` 脚本。
- `.env.example`：提供 `PORT`、`MONGODB_URI`、`JWT_SECRET`、`JWT_EXPIRES_IN` 和 `NODE_ENV` 示例。
- `.gitignore`：忽略 `node_modules/`、`.env`、`coverage/` 和日志文件。
- `src/app.js`：创建 Express 应用，配置 Helmet、CORS、JSON 解析、Morgan、健康检查接口和 404 响应。
- `src/server.js`：加载环境变量，连接 MongoDB，检查 URI，启动 HTTP 服务并处理启动错误。
- 使用 Node.js `crypto` 生成随机 JWT 密钥的命令。

### 是否修改

学生基本按照 AI 提供的内容创建文件。代码内容没有主动改写，但首次把 `server.js` 错写为 `sever.js`，随后根据检查结果进行了修正。

### 修改内容

- 将 npm 默认入口从 `index.js` 改为 `src/server.js`。
- 修改 npm 脚本并增加开发、启动和测试命令。
- 新建 `.env.example`、`.env`、`.gitignore`、`src/app.js` 和服务器入口文件。
- 将错误文件名 `src/sever.js` 重命名为 `src/server.js`。
- 为保护密钥，AI 只确认 `.env` 存在，没有读取或记录真实 `JWT_SECRET`。

### 验证结果

- `package.json` 的入口和 npm 脚本正确。
- `.env.example` 和 `.gitignore` 内容正确。
- `src/app.js` 和 `src/server.js` 内容与设计一致。
- `npm run dev` 能正常运行；学生报告新终端中无错误。
- `/api/health` 返回 `status: ok` 和 `Questionnaire API is running`。
- `server.js` 只有在 `mongoose.connect()` 成功后才监听端口，因此健康接口成功也证明 MongoDB 连接成功。
- 2026-10-19 复查时，`main`、`scripts.start` 和 `scripts.dev` 仍正确指向 `src/server.js`；`.env.example` 包含 PORT、MongoDB、JWT 和运行环境示例，没有暴露真实密钥。
- `node --check` 检查 `src/app.js` 和 `src/server.js` 均无语法错误。
- 第一次复查 `/api/health` 时提示无法连接，原因是开发服务当时未启动，不是代码、MongoDB 配置或健康接口错误。
- 学生启动 `npm run dev` 后，健康接口重新返回 `status: ok` 和 `Questionnaire API is running`；结合 `server.js` 的启动顺序，确认 MongoDB 连接、Express 服务和健康接口均正常。
- 最小服务、MongoDB 连接和健康接口全部通过，AI-006 完成并采用。

## AI-007 设计 MongoDB 数据模型

**日期：** 2026-10-18
**使用工具：** Codex
**状态：** 已完成

### Prompt

```text
请检查最小服务、MongoDB 连接和健康接口是否全部成功。如果成功，请完成 AI-006 日志并开始 AI-007；下一步继续由我亲自操作，AI使用日志.md由你更新，把前面的内容全都由文档里老师要求格式更改一下。请同时继续严格记录“得到什么代码、是否修改、修改了什么”。
```

学生完成数据库设计文档后提交了 10 个章节的检查结果，并要求重点检查嵌入与引用、索引、匿名填写、重复提交、题目快照和跳转规则，同时要求提供后续操作和代码。

2026-10-19，学生检查数据库设计后补充提出：

```text
我检查了 AI-007 的数据库设计，发现文档说明了问卷状态和答卷快照，但没有明确问卷、题目和答卷的删除策略。

我的修改意见是：已经发布或关闭的问卷不应该物理删除，应通过 closed 状态停止填写并保留历史数据；题目只能在草稿状态删除；已经保存的 responses 不应因为问卷关闭或题目调整而级联删除。这样可以保护统计结果和历史答卷，也符合第二阶段需要保留旧数据的要求。

请检查这个意见是否合理，并告诉我应该在 docs/数据库设计.md 的什么位置补充。文档由我亲自修改；完成验证后，请由你更新 AI-007 日志。
```

### Result 得到什么代码或结果

AI 提供了完整的 `docs/数据库设计.md` 内容。学生据此建立 `users`、`surveys`、`questions` 和 `responses` 四个集合设计，包含字段、集合关系、嵌入与引用、索引、校验、统计方式和第二阶段扩展策略。本步骤生成的是数据库设计文档，没有生成 Mongoose Schema 代码。

学生随后发现原设计缺少明确的数据删除策略，提出使用问卷状态保留已发布数据、限制题目删除范围并禁止答卷级联删除。AI 检查后确认该意见与历史快照、统计和第二阶段兼容要求一致，并指出应在 responses 集合设计之后补充。

### 是否修改

有修改。数据库设计初稿主要采用 AI 提供的结构；AI 检查后提出过三处补充项，学生完成了相应修改。此后学生又主动发现数据删除策略缺失，亲自设计并补充了数据保留与删除规则。

### 修改内容

- 学生新增 `docs/数据库设计.md`。
- 需要在 answers 结构中增加选择题选项文字快照，避免选项名称修改后旧答卷无法解释。
- 需要明确允许重复提交时完全省略 `uniqueSubmissionKey` 字段，不能保存为 `null`，否则稀疏唯一索引可能仍索引 `null`。
- 需要增加“为什么不采用关系数据库结构”和“有意冗余设计”说明，直接回应作业要求。
- 增加数据保留与删除策略：草稿题目可以删除，发布后的题目不再物理删除。
- 已发布或已关闭的问卷使用 `closed` 状态停止填写，不进行物理删除。
- 问卷关闭、超过截止时间或题目配置调整时，不级联删除已经保存的 responses。
- 已提交答卷及其题目和选项快照作为历史记录保留，用于统计、审计和第二阶段兼容旧数据。

### 验证结果

- 已确认文档包含 10 个主要章节。
- `users`、`surveys`、`questions` 和 `responses` 的拆分合理，没有将所有数据放在一个集合。
- questions 使用独立集合，适合题目排序、跳转引用和第二阶段扩展。
- responses 嵌入 answers，符合一次提交共同写入和读取的访问模式。
- publicId、ownerId、题目顺序和答卷查询索引设计合理。
- respondentId 内部保存、anonymous 控制展示的方案能够同时满足登录和匿名要求。
- uniqueSubmissionKey 的唯一稀疏索引能够防止禁止重复时的并发重复提交，但必须省略而不是写 null。
- visitedQuestionIds 能记录真实跳转路径，用于只校验实际访问的必答题。
- 学生已补充选择题选项文字快照、`uniqueSubmissionKey` 省略规则、关系数据库对比和有意冗余说明。
- 数据保留与删除策略已放在 responses 集合设计之后、统计设计之前，位置与内容正确。
- 首次补充时产生了一个单独的空列表项；学生检查后将其删除，使用正则 `^\s*-\s*$` 复查时没有任何匹配结果。
- 数据库设计文档已通过全文检查，满足作业要求，AI-007 完成并采用。

## AI-008 实现 Mongoose 数据模型

**日期：** 2026-10-18
**使用工具：** Codex
**状态：** 已完成

### Prompt

```text
请检查数据库设计是否完整、是否满足作业要求，并重点检查嵌入与引用、索引、匿名填写、重复提交、题目快照和跳转规则。继续更新 AI-007 日志，严格记录“得到什么代码、是否修改、修改了什么”。所有项目文件仍由我亲自修改。请给接下来几部的操作以及代码
```

### Result 得到什么代码或结果

AI 将在学生补充数据库设计后提供 `User.js`、`Survey.js`、`Question.js`、`Response.js` 和模型加载检查代码。本条的具体代码见本次对话回复。

学生完成模型后提交的反馈为：

```text
我已经按要求修改 docs/数据库设计.md，并创建 User.js、Survey.js、Question.js、Response.js 和 models/index.js。

我对 AI 代码的修改情况：
未修

模型加载和索引检查输出：
[ 'User', 'Survey', 'Question', 'Response' ]
User [ [ { username: 1 }, { unique: true } ] ]
Survey 包含 publicId 唯一索引、ownerId 与 createdAt 组合索引、status 与 deadline 组合索引。
Question 包含 surveyId 与 order 唯一组合索引。
Response 包含 uniqueSubmissionKey 唯一稀疏索引，以及两个答卷查询组合索引。
```

AI 实际读取了五个模型文件和更新后的数据库设计文档，逐项检查字段、索引和校验逻辑。

### 是否修改

学生反馈“未修”，按“未修改 AI 提供的模型代码”记录。实际文件内容与 AI 提供的代码一致。

### 修改内容

- 学生创建 `src/models/User.js`。
- 学生创建 `src/models/Survey.js`。
- 学生创建 `src/models/Question.js`。
- 学生创建 `src/models/Response.js`。
- 学生创建 `src/models/index.js`。
- 学生按要求修改 `docs/数据库设计.md`。
- AI 没有直接修改上述项目文件，只更新 AI 使用日志。

### 验证结果

- 四个模型均能被 Node.js 正常加载。
- User 只包含 username 唯一索引，没有重复索引。
- Survey 包含 publicId 唯一索引和两个查询组合索引，没有重复索引。
- Question 包含 surveyId 与 order 唯一组合索引。
- Response 包含 uniqueSubmissionKey 唯一稀疏索引，以及问卷统计和用户提交查询索引。
- Question Schema 校验了选择题选项数量、非选择题禁止选项、optionId 重复、选择数量上下限、文本长度上下限、数字范围和跳转动作目标。
- Response 使用 `optionSnapshots` 保存选择题选项文字快照。
- `uniqueSubmissionKey` 没有默认值，允许重复提交时可以完全省略该字段。
- 跨文档规则，例如跳转目标属于同一问卷和循环跳转检查，保留到后续业务服务层实现。
- 2026-10-19 重新检查全部模型文件，`node --check` 均通过，四个模型仍能正常加载。
- 复查得到的 User、Survey、Question 和 Response 索引与初次检查一致，没有发现新增的重复索引或缺失索引。
- `uniqueSubmissionKeyRequired` 和 `uniqueSubmissionKeyDefault` 均为 `undefined`，确认该字段不是必填且没有默认值，允许重复提交时可以完全省略。
- answers 子文档实际包含 `questionId`、`questionType`、`questionTitle`、`value` 和 `optionSnapshots`，答卷题目与选择题选项快照结构完整。
- 本次复查没有修改模型代码或增加新的人工设计。
- AI-008 模型实现通过检查并采用。

## AI-009 实现用户注册 登录和身份认证

**日期：** 2026-10-18
**使用工具：** Codex
**状态：** 已完成

### Prompt

```text
请读取并检查我实际创建的模型文件，重点检查字段类型、索引重复、Schema 校验、uniqueSubmissionKey 和选择题快照。如果正确，请完成 AI-007 和 AI-008 日志；如果有问题，请指出文件和具体修改位置。所有项目文件仍由我亲自修改，AI使用日志.md由你更新。

我已经完成 AI-009 的注册、登录和 JWT 认证代码。

我对 AI 代码的修改情况：
写“未修改”

请读取并检查我实际创建的认证文件，确认密码哈希、JWT、状态码、错误处理和敏感字段是否正确。如果成功，请完成 AI-009 日志，并继续给我下一步操作和代码。所有项目文件由我亲自修改，AI使用日志.md由你更新。
```

### Result 得到什么代码或结果

模型检查通过后，AI 提供了用户注册、登录、JWT 认证中间件和当前用户接口代码。学生据此创建或修改了 `src/controllers/authController.js`、`src/middleware/auth.js`、`src/routes/authRoutes.js`、`src/app.js` 和 `src/server.js`。

AI 随后读取实际文件并检查：注册时使用 bcrypt 12 轮哈希密码；JWT 仅保存用户 id，并设置有效期；登录时显式读取 `passwordHash` 进行比较；响应通过公开用户转换函数排除密码哈希；认证中间件校验 Bearer Token；控制器区分 400、401、409 和 500 类错误。学生提供的成功登录结果中只包含 id、username 和 createdAt，没有敏感字段。

2026-10-19，学生检查注册代码后补充提出：

```text
我检查了 AI-009 的注册代码，发现目前只限制密码不能少于 8 个字符，没有处理 bcrypt 的 72 字节输入上限。

我的修改意见是：注册用户时，在调用 bcrypt.hash 之前使用 bcrypt.truncates(password) 检查密码是否会被截断。如果会截断，就返回 400，并提示密码不能超过 bcrypt 支持的 72 个 UTF-8 字节。这样可以避免两个只有 72 字节之后内容不同的密码生成相同的有效哈希。这里应该按 UTF-8 字节判断，不能简单按 JavaScript 字符数量判断。

请读取实际 authController.js，检查这个意见是否合理，并告诉我具体修改位置和测试方法。代码由我亲自修改；验证完成后，请由你更新 AI-009 日志。
```

AI 检查已安装的 bcryptjs 后确认其提供 `bcrypt.truncates()`，并说明应在注册密码最小长度检查之后、查询用户名和计算哈希之前拒绝超过 72 个 UTF-8 字节的密码。学生亲自完成代码修改。

### 是否修改

有修改。认证功能初版使用 AI 提供的代码；随后学生主动发现 bcrypt 输入长度限制未处理，并亲自为注册接口增加 72 个 UTF-8 字节上限检查。

### 修改内容

- 学生创建 `src/controllers/authController.js`，实现注册、登录、密码哈希和 JWT 签发。
- 学生创建 `src/middleware/auth.js`，实现 Bearer Token 校验和当前用户装载。
- 学生创建 `src/routes/authRoutes.js`，提供注册、登录和 `/me` 路由。
- 学生修改 `src/app.js`，挂载 `/api/auth` 路由并保留统一 404、500 错误响应。
- 学生修改 `src/server.js`，在启动时检查 `MONGODB_URI` 和 `JWT_SECRET`。
- 学生修改 `src/controllers/authController.js`，在 `bcrypt.hash()` 之前调用 `bcrypt.truncates(password)`；检测到密码会被截断时返回 400 和“密码不能超过 72 个 UTF-8 字节”。
- 上限按 bcryptjs 实际使用的 UTF-8 字节判断，没有错误地使用 JavaScript 字符数量代替字节数量。
- AI 没有直接修改认证业务文件，只读取检查并更新 AI 使用日志。
- 手工测试时，学生曾将 PowerShell 命令 `ConvertTo-Json` 输入为不存在的 `ConvertTo`，因此请求体没有生成，也没有向接口发送请求。AI 指出命令名称不完整，学生改用 `ConvertTo-Json` 后成功生成包含 username 和 password 的 JSON。该修正只涉及测试命令，没有修改项目代码。

### 验证结果

- 实际认证文件已通过静态检查，未发现密码明文返回、密码哈希默认暴露或 JWT 负载包含敏感字段的问题。
- 成功登录已验证；返回用户 id、username、createdAt，不含 password、passwordHash 或 JWT_SECRET。
- 已确认 `$duplicateBody` 能正确生成有效 JSON；JSON 中字段顺序不影响 Express 解析。
- 错误密码登录已实际返回 401 和“用户名或密码错误”，符合设计，并且没有泄露用户是否存在或其他敏感信息。
- 第一次使用 `node -e` 检查密码哈希时，PowerShell 调用原生命令的引号被剥离，使 JavaScript 字符串丢失引号并产生 `SyntaxError`。命令在连接 MongoDB 前已经终止，因此该结果不表示模型或数据库存在错误，后续改用适合 PowerShell 的引号写法重新检查。
- 数据库实际查询结果为 `hasPasswordHash: true`、`bcryptHash: true`，确认保存的是 bcrypt 哈希而不是明文密码。
- 重复注册实际返回 409 和“用户名已存在”。
- 携带有效 Token 访问 `GET /api/auth/me` 成功返回当前用户 id 和 username，没有返回 passwordHash。
- 不携带 Token 访问 `GET /api/auth/me` 实际返回 401 和“缺少有效的登录令牌”。
- 错误密码、密码哈希、重复注册、有效 Token 和缺少 Token 均完成动态验证，AI-009 完成并采用。
- 修改后的 `authController.js` 通过 `node --check`，没有语法错误。
- bcryptjs 边界检查结果为：72 个 ASCII 字节不截断、73 个 ASCII 字节会截断、24 个“密”字不截断、25 个“密”字会截断，证明判断依据是 UTF-8 字节数。
- 使用 73 字节密码调用注册接口实际返回 400 和“密码不能超过 72 个 UTF-8 字节”，超长密码没有进入哈希和用户创建流程。

## AI-010 实现问卷创建和本人问卷列表

**日期：** 2026-10-18
**使用工具：** Codex
**状态：** 已完成

### Prompt

```text
我已重新完成 AI-009 剩余验证，结果如下：

{ username: 'student01', hasPasswordHash: true, bcryptHash: true }
重复注册返回 409 和“用户名已存在”。
携带 Token 访问 /me 返回当前用户 id 和 username。
无 Token 访问 /me 返回 401 和“缺少有效的登录令牌”。
错误密码此前已经验证为 401。

请检查剩余结果；如果全部通过，请完成 AI-009 日志并开始 AI-010，继续由我亲自修改业务文件，AI使用日志.md由你更新。
```

### Result 得到什么代码或结果

AI-009 全部通过后，AI 读取现有 `Survey.js`、认证中间件、模型出口和 `app.js`，并据此提供 `surveyController.js`、`surveyRoutes.js` 以及在 `app.js` 中挂载路由的代码。代码用于创建草稿问卷和分页查询当前登录用户自己的问卷，并包含输入校验、所有权过滤、状态筛选和错误处理。

### 是否修改

未修改。学生明确反馈按 AI 提供的版本创建和修改文件。

### 修改内容

- 学生创建 `src/controllers/surveyController.js`，实现创建草稿问卷和分页查询本人问卷。
- 学生创建 `src/routes/surveyRoutes.js`，使用 JWT 认证中间件保护所有问卷管理接口。
- 学生修改 `src/app.js`，在 404 中间件之前挂载 `/api/surveys`。
- AI 没有直接修改业务文件，只读取实际文件、检查代码并维护 AI 使用日志。

### 验证结果

- `node -e "require('./src/app')"` 成功输出 `App loaded successfully`，说明新增模块能够正常解析和加载。
- AI 已读取三个实际文件，确认内容与提供版本一致。
- 创建接口的 ownerId 强制取自 `req.user.id`，客户端不能伪造所有者或创建时直接改变状态。
- 列表接口始终以当前用户 ownerId 作为查询条件，支持分页和合法状态筛选。
- `router.use(auth)` 同时保护 POST 和 GET 接口，路由挂载位置正确。
- 创建问卷成功，返回 id、ownerId、唯一 publicId、draft 状态、匿名与重复提交设置、截止时间及时间戳。
- 本人问卷列表成功返回新建问卷，分页结果为 page 1、limit 10、total 1、totalPages 1，当前用户匹配数量为 1。
- 未携带 Token 查询问卷返回 401 和“缺少有效的登录令牌”。
- 空白标题创建问卷返回 400 和“问卷标题不能为空”。
- page=0、limit=100 的请求先返回 400 和 page 参数错误，符合校验顺序。
- 第二个用户注册或登录成功，使用其 Token 查询时看不到第一个用户的问卷，匹配数量为 0，数据隔离通过。
- 动态结果中问卷中文标题和说明显示为问号，而同一终端的其他中文正常。初步判断为 Windows PowerShell 发送字符串请求体时的字符编码问题，需要改用显式 UTF-8 字节请求体并验证数据库列表能正确读回中文；在此之前 AI-010 保持进行中。
- 学生随后将 JSON 字符串显式转换为 UTF-8 字节，并使用 `application/json; charset=utf-8` 重新发送请求。
- 新问卷从 MongoDB 列表重新读取后，标题为“大学生学习情况调查”，说明内容正确；两项字符串比较结果均为 True。
- 中文问题属于 Windows PowerShell 测试请求编码，不是 Express 或 MongoDB 业务代码缺陷；业务代码无需修改。
- 创建、列表、分页、认证、参数校验、中文数据和不同用户隔离均验证通过，AI-010 完成并采用。
- 2026-10-19 复查时，`surveyController.js` 和 `surveyRoutes.js` 再次通过 `node --check`，应用成功加载并输出 `Survey modules loaded successfully`。
- 学生重新执行登录、本人问卷列表和未登录访问测试，并报告各项结果全部正常；本次没有提供逐项终端输出，因此日志不补写新的状态码、列表内容或数量，原有详细动态测试结果继续作为验证证据。
- 本次复查没有修改 AI-010 的业务代码或增加新的人工设计。

## AI-011 实现题目创建和题目列表

**日期：** 2026-10-18
**使用工具：** Codex
**状态：** 已完成

### Prompt

```text
我已经使用 UTF-8 字节请求体重新创建问卷，并从本人问卷列表重新读取。标题正确：True，说明正确：True。

请检查中文是否正确写入 MongoDB。如果通过，请完成 AI-010 日志并开始下一步。继续由我亲自修改业务文件，AI使用日志.md由你更新。
```

### Result 得到什么代码或结果

AI 确认 UTF-8 中文写入和读回正常。随后读取实际 `Question.js`、`Survey.js` 和数据库设计，开始提供题目创建与题目列表接口代码。该步骤覆盖 singleChoice、multipleChoice、text、number 四种题型，并复用 Schema 中的选项与 validation 校验。

2026-10-19，学生检查题目保存结果后补充提出：

```text
我检查了 AI-011 的题目数据结构，发现 multipleChoice 和 text 等非数字题的 validation 中也可能出现 integerOnly: false。原因是四种题型共用了 validationSchema，而 integerOnly 当前设置了 default: false。

我的修改意见是：不同题型只保存本题型真正适用的 validation 字段。multipleChoice 只保留 minSelections 和 maxSelections，text 只保留 minLength 和 maxLength，number 只保留 minValue、maxValue 和 integerOnly，singleChoice 不保存无关校验字段。这样可以减少 MongoDB 文档冗余，避免接口使用者误解字段含义。

请读取实际 Question.js 和 questionController.js，检查这个意见是否合理，并告诉我应该修改哪些位置。代码由我亲自修改；完成验证后，请由你更新 AI-011 日志。
```

AI 检查实际代码后确认问题存在，并指出只移除 `integerOnly` 默认值不足以阻止客户端提交其他题型的已知字段，因此需要同时在创建、编辑和序列化位置按题型规范化 validation。学生亲自完成修改。

### 是否修改

有修改。题目创建和列表初版采用 AI 提供的代码；随后学生主动发现不同题型会保存无关 validation 字段，并亲自修改 Schema 和控制器的规范化逻辑。

### 修改内容

- 学生创建 `src/controllers/questionController.js`，实现题目创建、题目列表、所有权检查、草稿状态限制、选项规范化和自动顺序。
- 学生创建 `src/routes/questionRoutes.js`，使用认证中间件保护题目接口。
- 学生修改 `src/app.js`，在 404 中间件之前挂载题目路由。
- 学生修改 `src/models/Question.js`，删除 `integerOnly` 的 `default: false`，防止非数字题自动产生该字段。
- 学生修改 `src/controllers/questionController.js`，增加按题型定义允许字段的 `normalizeValidation` 函数。
- 创建题目时只将规范化后的 validation 写入数据库；编辑题目或改变题型时重新过滤旧字段。
- 题目管理接口序列化时再次规范化 validation，使旧文档中的无关字段不会继续暴露给接口使用者。
- 本次没有批量改写已经发布的历史题目文档；新建和以后编辑的草稿题目按新规则保存，旧数据由序列化层过滤输出。
- AI 没有直接修改业务文件，只读取检查并维护本日志。

### 验证结果

- 三个文件均通过 `node --check`。
- 应用成功加载并输出 `Question routes loaded successfully`，nodemon 未报告加载错误。
- AI 读取实际文件后确认内容与提供版本一致。
- 题目只能添加到当前用户拥有的草稿问卷；题目列表同样先验证问卷所有权。
- 选择题至少需要两个选项，文本题和数字题不能保存选项；选项缺少 optionId 时自动生成稳定标识。
- 题目按当前最大 order 加一追加，Question Schema 的唯一组合索引继续防止同一问卷顺序重复。
- singleChoice、multipleChoice、text 和 number 四种题型均成功创建，中文题目正常保存。
- 四道题的 order 依次为 1、2、3、4，列表总数为 4，顺序判断结果为 True。
- 单选题生成 4 个非空且互不重复的 optionId，多选题保存 minSelections=1、maxSelections=2，文本题和数字题保存各自校验规则。
- minSelections=2、maxSelections=1 的非法多选题返回 400 和“最多选择数量不能小于最少选择数量”，请求后题目总数仍为 4，证明非法数据没有写入。
- 第二个用户访问第一个用户的题目列表返回 404 和“问卷不存在或不属于当前用户”，跨用户隔离通过。
- 四种题型、选项标识、顺序、Schema 校验和所有权均通过动态验证，AI-011 完成并采用。
- 修改后的 `Question.js` 和 `questionController.js` 均通过 `node --check`，应用成功加载并输出 `Validation normalization loaded successfully`。
- 学生在草稿问卷中创建四道临时题，并故意为每种题型提交适用字段与无关字段。自动检查结果为 singleChoice、multipleChoice、text 和 number 四项全部 `True`。
- singleChoice 的 validation 为空；multipleChoice 只保留 `minSelections` 和 `maxSelections`；text 只保留 `minLength` 和 `maxLength`；number 只保留 `minValue`、`maxValue` 和 `integerOnly`。
- 学生完成临时题目删除后，AI 只读查询 MongoDB，标题以 `ValidationTest-` 开头的题目剩余数量为 0，测试数据已清理。

## AI-012 实现题目编辑和删除

**日期：** 2026-10-18
**使用工具：** Codex
**状态：** 已完成

### Prompt

```text
我已经完成 AI-011 的动态测试。四种题型创建成功，顺序为 1、2、3、4；选项 ID 非空且唯一；非法多选校验返回 400 且总数仍为 4；第二个用户访问返回 404。

请逐项检查实际结果。如果全部通过，请完成 AI-011 日志并开始下一步。所有业务文件继续由我亲自修改，AI使用日志.md由你更新。
```

### Result 得到什么代码或结果

AI 确认 AI-011 全部通过，开始提供题目完整编辑与删除接口。编辑接口复用创建时的题型、标题、选项和 validation 规则，并保留稳定 optionId；删除接口限制为本人草稿问卷，并为后续跳转规则预留被引用题目保护。

### 是否修改

未修改。学生明确反馈按 AI 提供的版本完成代码。

### 修改内容

- 学生修改 `src/controllers/questionController.js`，增加题目编辑和删除函数。
- 学生修改 `src/routes/questionRoutes.js`，增加 PATCH 和 DELETE 路由。
- AI 没有直接修改业务文件，只读取实际文件、检查代码并维护日志。

### 验证结果

- 应用成功加载并输出 `Question update routes loaded successfully`。
- AI 读取实际文件后确认内容与提供版本一致。
- 编辑和删除均限制为当前用户拥有的草稿问卷，并验证 questionId 属于指定问卷。
- 编辑支持题型、标题、必答、选项和 validation；提交已有 optionId 时能够保持选项稳定标识，Schema 校验仍在保存时执行。
- 删除前查询其他题目的 jumpRules，已被跳转规则引用的题目返回 409。
- 单选题标题和选项文字成功编辑，编辑前后 optionId 比较结果为 True，稳定标识得到保留。
- 将数字题修改为 minValue=30、maxValue=24 时返回 400 和“最大值不能小于最小值”；重新查询仍为原来的 0 至 24，非法修改没有写入数据库。
- 第二个用户尝试编辑第一个用户的题目时返回 404 和“问卷不存在或不属于当前用户”。
- 临时题目成功创建为 order 5，随后 DELETE 返回“题目删除成功”，remainingQuestions 为 4。
- 最终列表总数为 4，临时题目匹配数量为 0，四种核心题型均保留。
- 编辑、稳定 optionId、Schema 校验、越权保护和删除均通过动态验证，AI-012 完成并采用。
- 2026-10-19 在 validation 规范化修改后再次执行题目编辑与删除回归流程，删除接口返回“题目删除成功”，重新查询时标题匹配的编辑测试题剩余数量为 0。
- 学生本轮没有提供 `optionId` 比较和 validation 字段数量的终端输出，因此日志没有补写这两项的新结论；稳定 `optionId` 继续以本条原有动态测试为证据，validation 规范化以 AI-011 的四题型测试为证据。
- 本次回归没有增加新的人工设计，也没有修改 AI-012 的编辑和删除业务代码。

## AI-013 实现和校验题目跳转规则

**日期：** 2026-10-18
**使用工具：** Codex
**状态：** 已完成

### Prompt

```text
初始 Prompt：
我已经完成 AI-012 的动态测试：选项 ID 保持不变；非法数字范围返回 400 且原值未变化；第二个用户越权编辑返回 404；临时题目删除成功，最终仍有四道题。

请逐项检查。如果全部通过，请完成 AI-012 日志并开始下一步。所有业务文件继续由我亲自修改，AI使用日志.md由你更新。

后续个人设计 Prompt：
我检查了 AI-013 的跳转循环检测，发现当前有向图只包含显式 goto 规则，没有包含规则未命中时默认进入下一题的顺序路径。

例如第 3 题 goto 第 2 题，而第 2 题没有命中跳转规则时会默认进入第 3 题，运行时可能形成“第 3 题 → 第 2 题 → 第 3 题”的循环，但只检查显式 goto 边时可能发现不了。

我的修改意见是：第一阶段只允许 goto 跳转到 order 更大的后续题目，不允许跳回当前题或前面的题目。这样能直接避免默认顺序与向后跳转形成隐含循环，也让填写流程始终向前推进。原来的循环检测仍然保留，作为额外保护。

请读取实际 questionController.js 的跳转规则代码，检查这个意见是否合理，并告诉我具体修改位置和测试方法。代码由我亲自修改；完成验证后，请由你更新 AI-013 日志。

完成验证 Prompt：
我已经完成 AI-013 向前跳转限制的动态测试，全部通过，请更新 AI-013 日志，记录我的 Prompt、设计意见、questionController.js 修改、动态验证和临时数据清理结果，然后继续处理 AI-014。
```

### Result 得到什么代码或结果

AI 确认 AI-012 通过，开始提供跳转规则专用接口。初始设计包含题型与 operator 匹配、选项值校验、同问卷目标校验、submit 与 goto 结构校验、优先级唯一性，以及替换规则后对整份问卷进行显式 goto 有向图循环检测。

学生随后指出：实际填写流程在跳转规则未命中时会顺序进入下一题，只检查显式 goto 边可能遗漏由“向前跳转加默认顺序”形成的隐含循环。AI 检查实际代码后确认该分析合理，并给出在 `updateJumpRules` 中增加顺序约束以及进行动态验证、清理临时数据的操作步骤。

### 是否修改

已修改。初始跳转规则功能按 AI 提供的版本实现；之后由学生主动发现默认顺序路径未纳入显式循环图的问题，提出只允许 goto 跳转到后续题目的设计，并亲自完成代码修改。

### 修改内容

- 学生修改 `src/controllers/questionController.js`，增加题型操作符配置、有向图循环检测和跳转规则更新函数。
- 学生修改 `src/routes/questionRoutes.js`，增加跳转规则 PUT 接口。
- 学生在 `updateJumpRules` 的同问卷目标检查之后增加 `targetQuestion.order <= question.order` 判断；当前题、前序题作为 goto 目标时返回 400 和“goto 只能跳转到后续题目”。
- 原有显式 goto 有向图循环检测继续保留，作为顺序约束之外的额外保护。
- AI 没有直接修改业务文件，只读取实际文件、检查代码并维护日志。

### 验证结果

- 应用成功加载并输出 `Jump rule route loaded successfully`。
- AI 读取实际文件后确认内容与提供版本一致。
- singleChoice、multipleChoice、text 和 number 分别限制为适用的操作符；value 按题型验证。
- goto 目标必须是同一问卷的其他题目，submit 禁止携带 targetQuestionId。
- priority 必须是非负整数且同一道题内不能重复，保存前按 priority 排序。
- 循环检测会将当前题目的规则替换为本次新规则，再对整份问卷的 goto 有向图执行深度优先搜索。
- 单选题 equals 指定 optionId 后 goto 文本题的规则成功保存，目标 ID 和 priority 均正确。
- 数字题 gte 12 后 submit 的规则成功保存，targetQuestionId 为空。
- 无效 optionId 返回 400；另一问卷的真实题目作为目标返回 400；临时跨问卷题目随后成功清理。
- 自跳转返回 400；文本题反向跳回单选题会与已有规则形成两题循环，返回 409。
- 第二个用户配置规则返回 404；删除被单选题规则引用的文本题返回 409。
- 最终列表显示单选题和数字题各保留 1 条合法规则，多选题和文本题为 0，非法请求没有覆盖已有规则。
- 增加顺序约束后，`questionController.js` 语法检查和应用模块加载通过。
- 学生在草稿问卷中按顺序创建三道临时题，确认题目 order 依次递增。
- 第一题 goto 第三题的合法向后续题目跳转保存成功。
- 第三题 goto 第二题的非法向前跳转被拒绝，返回 400 和“goto 只能跳转到后续题目”。
- 非法更新失败后，第一题的合法 goto 规则和第三题原有的 submit 规则均保持不变，说明失败请求没有覆盖已保存规则。
- 学生先清空临时题目的跳转规则，再删除三道临时题；清理后匹配本次测试前缀的题目数量为 0。
- 合法 goto、合法 submit、值校验、同问卷约束、前向顺序约束、循环检测、越权保护、引用删除保护和临时数据清理均通过，AI-013 完成并采用。

## AI-014 实现问卷发布 关闭和公开读取

**日期：** 2026-10-18
**使用工具：** Codex
**状态：** 已完成

### Prompt

```text
我已经完成 AI-013 的动态测试。合法 goto 和 submit 保存成功；无效 optionId、跨问卷目标、自跳转、两题循环和越权配置均被拒绝；被引用题目不能删除；最终只保留两条合法规则。

请逐项检查。如果全部通过，请完成 AI-013 日志并开始下一步。所有业务文件继续由我亲自修改，AI使用日志.md由你更新。

补充验证 Prompt：
我已经重新完成 AI-014 的静态检查和状态回归测试。登录令牌存在；本人问卷列表中同时存在 published、closed 和 draft 问卷；已发布问卷公开读取返回 4 道题且不包含 ownerId；草稿问卷和关闭问卷公开访问均返回 404 和“公开问卷不存在或尚未发布”。

请逐项检查。如果全部正常，请更新 AI-014 的验证结果，不额外虚构人工设计或代码修改，然后继续处理 AI-015。
```

### Result 得到什么代码或结果

AI 确认 AI-013 通过，开始提供问卷发布、关闭和公开读取接口。发布前检查至少一道题、截止时间和所有 goto 目标；公开接口使用 publicId，不暴露 ownerId，并只返回 published 且未截止的问卷。

### 是否修改

未修改。学生明确反馈按 AI 提供的版本完成代码。

### 修改内容

- 学生创建 `src/controllers/surveyLifecycleController.js`，实现发布前校验、发布、关闭和公开读取。
- 学生修改 `src/routes/surveyRoutes.js`，增加需要登录的发布和关闭接口。
- 学生创建 `src/routes/publicSurveyRoutes.js`，提供不需要登录的 publicId 读取接口。
- 学生修改 `src/app.js`，在 404 中间件之前挂载 `/api/public`。
- AI 没有直接修改业务文件，只读取实际文件、检查代码并维护日志。

### 验证结果

- 应用成功加载并输出 `Survey lifecycle routes loaded successfully`。
- AI 读取四个实际文件后确认内容与提供版本一致。
- 发布前检查问卷属于当前用户、状态为 draft、截止时间未过、至少包含一道题、goto 目标有效且跳转图无循环。
- 关闭仅允许当前用户关闭 published 问卷。
- 公开读取不经过认证，只允许读取 published 且未截止的问卷；响应不包含 ownerId 等管理字段。
- 用于关闭测试的草稿问卷成功添加一道文本题并发布，发布状态为 published，未登录公开读取返回 1 道题。
- 该测试问卷随后成功关闭，状态变为 closed 且 closedAt 有值；关闭后公开访问返回 404 和“公开问卷不存在或尚未发布”。
- 第二个用户操作主问卷时返回“问卷不存在或不属于当前用户”，所有权保护生效。
- 主问卷发布后尝试修改题目返回 409 和“只有草稿问卷可以编辑题目”，发布锁定生效。
- 新建草稿问卷后直接通过 publicId 访问返回 404 和“公开问卷不存在或尚未发布”。
- 主问卷状态确认为 published，并具有 publicId 和 publishedAt。
- 未登录公开读取主问卷成功返回四道题；单选题和数字题各有一条规则，多选题和文本题规则数为 0。
- 公开响应的 ownerId 字段检查结果为 False，没有暴露创建者身份。
- 后续回归测试确认当前登录令牌有效，本人问卷列表仍同时包含 published、closed 和 draft 三种状态。
- 已发布问卷通过 publicId 未登录读取成功，返回 4 道题、正确的中文标题和说明，`ownerId` 字段检查结果仍为 False。
- 当前公开序列化返回问卷标题、说明和 publicId，不返回内部 id、status 等管理字段；这不影响填写端识别和读取公开问卷。
- 草稿问卷和关闭问卷再次通过公开接口访问时均返回 404 和“公开问卷不存在或尚未发布”，状态限制回归通过。
- 草稿、published、closed 三种状态、所有权、公开字段和发布后锁定均通过动态验证，AI-014 完成并采用。

## AI-015 实现答卷提交 答案校验和路径记录

**日期：** 2026-10-18
**使用工具：** Codex
**状态：** 已完成

### Prompt

```text
我已经补齐 AI-014 的剩余验证：主问卷为 published；公开读取返回四题且不包含 ownerId；第二用户不能发布；发布后不能编辑题目；草稿公开访问返回 404。测试问卷发布、关闭和关闭后 404 也已验证。

请检查这些补充结果；如果全部通过，请完成 AI-014 日志并开始下一步。所有业务文件继续由我亲自修改，AI使用日志.md由你更新。

补充验证 Prompt：
我已经完成 AI-015 第一组检查，合法答卷提交成功，answerCount 为 3，visitedQuestionIds 为第一、第三和第四题，路径不包含被跳过的第二题。请继续教我验证重复提交、必答题、非法选项、跳过题目的多余答案、答案快照和数据库记录，暂时不要更新 AI-015 日志。

完成验证 Prompt：
我已经完成 AI-015 的匿名提交验证。请逐项检查；如果全部通过，请完成 AI-015 日志，记录得到的代码、是否修改、实际验证、匿名身份保护、重复提交、路径和快照结果，不额外虚构人工修改，然后继续处理下一步。
```

### Result 得到什么代码或结果

AI 确认 AI-014 通过，读取实际 Response 和 Question Schema 后提供答卷提交功能。得到的代码由服务层校验四种题型答案、执行跳转规则并生成 `visitedQuestionIds`、题目快照和选项快照；控制器校验发布状态、截止时间、匿名选择和重复提交，并在不允许重复时设置唯一提交键。公开路由使用 JWT 中间件，保证填写问卷前必须登录。

### 是否修改

未修改。学生没有反馈对 AI-015 业务代码进行人工修改；后续读取的实际文件与 AI 提供的结构一致。本条只记录实际创建、检查和测试结果，不虚构人工设计。

### 修改内容

- 学生创建 `src/services/responseValidationService.js`，实现答案结构、四种题型、必答题、跳转规则、实际路径和路径外多余答案校验。
- 学生创建 `src/controllers/responseController.js`，实现发布状态、截止时间、匿名设置、重复提交和答卷保存。
- 学生修改 `src/routes/publicSurveyRoutes.js`，增加需要 JWT 登录的 `POST /api/public/surveys/:publicId/responses`。
- 代码使用已有 `Response` 模型保存 `respondentId`、`anonymous`、答案快照、`visitedQuestionIds`、`surveyVersion` 和 `uniqueSubmissionKey`。
- AI 没有直接修改业务文件，只读取实际文件、提供验证命令、独立核对结果并维护日志。

### 验证结果

- `responseValidationService.js`、`responseController.js`、`publicSurveyRoutes.js` 和 `Response.js` 均通过语法检查，应用模块成功加载并输出 `AI-015 modules loaded successfully`。
- 未登录提交返回 401 和“缺少有效的登录令牌”，登录要求生效。
- 主问卷合法答卷提交成功，生成答卷 ID `6ad611ca46f2581c20a0e0bf`，`answerCount` 为 3，`surveyVersion` 为 1。
- 第一题命中 goto 后，实际路径依次包含第一、第三和第四题，不包含被跳过的第二题。
- 同一用户再次提交主问卷返回 409 和“该用户已经提交过此问卷”，数据库唯一提交键保护生效。
- 空答案数组返回 400，并指出第一题为必答题；无效单选 optionId 返回 400 和“请选择有效选项”。
- 在第一题已跳过第二题的情况下仍携带第二题答案，返回 400 和“答案包含填写路径中未访问的题目”。
- MongoDB 中的主问卷答卷保存了内部 `respondentId`、`surveyVersion: 1` 和由 surveyId、respondentId 组成的 `uniqueSubmissionKey`。
- 主问卷答卷保存三项题目类型和题目标题快照；单选答案同时保存稳定 optionId 和“大学一年级”选项文字快照，文本题和数字题的 `optionSnapshots` 为空数组。
- 匿名测试创建两份独立问卷：允许匿名问卷 ID 为 `6ad6129c46f2581c20a0e0c1`，禁止匿名问卷 ID 为 `6ad6129c46f2581c20a0e0c2`；测试完成后两份问卷均关闭并具有 `closedAt`。
- 允许匿名问卷实际保存 1 份答卷，`anonymous` 为 true，内部 `respondentId` 仍存在，答案数和访问路径数均为 1，且唯一提交键存在。
- 禁止匿名问卷的答卷数量为 0；实际控制器在 `anonymous` 为 true 且 `allowAnonymous` 为 false 时返回 400，不会创建答卷。
- 提交接口的响应对象不返回 `respondentId`；数据库内部保留该字段用于登录校验和限制重复提交，符合“匿名是对外隐藏身份而非免登录”的需求基线。
- 临时 MongoDB 检查脚本均已删除；成功提交的答卷作为路径、快照、匿名和后续统计测试数据保留。
- 登录限制、四种答案校验、跳转路径、重复提交、题目与选项快照、匿名内部身份保留和禁止匿名保护均完成验证，AI-015 完成并采用。

## AI-016 实现问卷统计和单题统计

**日期：** 2026-10-19
**使用工具：** Codex
**状态：** 已完成

### Prompt

```text
初始 Prompt：
我已经完成 AI-015 的匿名提交验证。请逐项检查；如果全部通过，请完成 AI-015 日志，记录得到的代码、是否修改、实际验证、匿名身份保护、重复提交、路径和快照结果，不额外虚构人工修改，然后继续处理下一步。

代码检查 Prompt：
我已经完成 AI-016 的 statisticsController.js 和 surveyRoutes.js 配置。我对 AI-016 代码的修改情况：未修改。语法检查和模块加载结果为 Statistics route loaded successfully。请读取并检查我实际创建的统计代码，重点检查 MongoDB 聚合、单选统计、多选统计、文本列表、数字平均值、单题查询、所有权保护和匿名身份字段。如果正确，请继续教我动态测试。

个人设计 Prompt：
我检查了 AI-016 的统计结果结构，发现接口虽然返回整份问卷的 responseCount 和每道题的 totalAnswers，但没有直接显示有多少份答卷没有回答该题。

由于系统支持条件跳转，不同答卷可能经过不同题目。例如主问卷的第二题会被第一题的 goto 规则跳过，只看 totalAnswers 不够直观。

我的修改意见是：为每道题增加 notAnsweredCount，计算方式为 responseCount - totalAnswers。这个字段不命名为 skippedCount，因为未回答既可能是被条件跳转跳过，也可能是非必答题没有填写，不能全部解释成“跳过”。

请读取实际 statisticsController.js，检查这个意见是否合理，并告诉我具体修改位置和测试方法。代码由我亲自修改；完成验证前暂时不要更新 AI-016 日志。

完成验证 Prompt：
我已经完成 AI-016 的全部动态测试全部通过，请完成 AI-016 日志，记录我的 Prompt、个人设计意见、statisticsController.js 修改、MongoDB 聚合、整份和单题统计、四种题型结果、权限保护及匿名身份保护，然后继续处理下一步。所有业务文件仍由我亲自修改，AI使用日志.md由你更新。
```

### Result 得到什么代码或结果

AI 提供 `statisticsController.js` 和统计路由代码。统计控制器先校验问卷所有权，再使用 MongoDB 聚合对 `responses.answers` 解包并按 `questionId` 分组，最后按题型生成单选选项人数、多选选项次数、文本内容列表和数字列表及平均值。接口支持整份问卷统计和 `questionId` 单题查询，并只返回统计数据，不返回填写者身份字段。

在检查初版统计输出时，AI提示可以进一步区分问卷答卷总数和每题回答数；学生确认条件跳转场景确实需要明确展示未回答数量，采用 `notAnsweredCount` 名称并说明不能将其直接命名为 `skippedCount`，随后亲自完成代码修改和验证。

### 是否修改

已修改。初始统计接口采用 AI 提供的版本；学生随后在 `statisticsController.js` 中增加每道题的 `notAnsweredCount`，并为文本题和数字题按过滤后的有效答案数量重新计算该字段。

### 修改内容

- 学生创建 `src/controllers/statisticsController.js`，实现整份问卷和单道题统计。
- 学生修改 `src/routes/surveyRoutes.js`，增加需要 JWT 登录的 `GET /api/surveys/:surveyId/statistics` 路由。
- MongoDB 聚合先按 surveyId 筛选答卷，使用 `$unwind` 展开 answers，再使用 `$group` 按 questionId 收集答案值。
- 学生将 `buildQuestionStatistics` 增加 `responseCount` 参数，并在公共题目统计中加入 `notAnsweredCount: Math.max(responseCount - totalAnswers, 0)`。
- 文本题和数字题会过滤无效类型的旧数据，因此学生使用过滤后的 `textValues.length` 或 `numberValues.length` 重新计算 `totalAnswers` 和 `notAnsweredCount`。
- 调用 `buildQuestionStatistics` 时增加传入整份问卷的 `responseCount`。
- AI 没有直接修改业务文件，只读取实际代码、提供实现与验证步骤、复核接口结果并维护日志。

### 验证结果

- `statisticsController.js` 和 `surveyRoutes.js` 通过语法检查，应用成功加载并输出 `Statistics route loaded successfully`；修改后模块继续正常加载。
- 主问卷统计接口返回 200，`responseCount` 为 1，共返回四道题。
- 第一题单选共有 1 份答案，“大学一年级”计数为 1，其余三个选项为 0；选项计数合计等于该题回答人数。
- 第二题多选因第一题 goto 规则被跳过，`totalAnswers` 为 0、`notAnsweredCount` 为 1，三个选项计数均为 0。
- 第三题文本统计返回“每天按照学习计划完成任务”，`totalAnswers` 为 1、`notAnsweredCount` 为 0。
- 第四题数字统计返回数值 12，平均值为 12，`totalAnswers` 为 1、`notAnsweredCount` 为 0。
- 四道题均满足 `totalAnswers + notAnsweredCount = responseCount`。
- 使用第二题 questionId 查询单题统计返回 200，`questionCount` 为 1，只包含第二题及其正确的回答数、未回答数和选项零计数。
- 未登录读取统计返回 401 和“缺少有效的登录令牌”。
- 第二个用户读取主问卷统计返回 404 和“问卷不存在或不属于当前用户”，所有权保护生效。
- 主问卷统计 JSON 中不包含 `respondentId`、`username` 或 `uniqueSubmissionKey`。
- 已关闭的匿名测试问卷仍可由创建者查看统计，返回 1 份答卷和文本“这是一份匿名测试答卷”，`totalAnswers` 为 1、`notAnsweredCount` 为 0。
- 匿名问卷统计 JSON 同样不包含 `respondentId`、`username` 或 `uniqueSubmissionKey`，匿名身份保护由后端返回字段控制。
- MongoDB 聚合、整份与单题统计、四种题型、条件跳转后的未回答数量、登录认证、所有权及匿名身份保护全部通过，AI-016 完成并采用。


## AI-017 编写自动化 API 测试

**日期：** 2026-10-19 至 2026-10-20
**使用工具：** Codex、Windows PowerShell、Jest、Supertest、MongoDB、Mongoose
**状态：** 已完成

### Prompt

```text
初始 Prompt：
我已经完成 AI-017 的 Jest 配置、独立测试数据库配置和健康接口测试。我对 AI-017 当前代码的修改情况：未修改。请继续教我编写创建问卷、添加题目、跳转逻辑、答案校验、提交问卷和统计结果的自动化 API 测试。所有测试文件由我亲自创建，AI使用日志.md由你更新。

首次故障 Prompt：
运行测试后，tests/questionnaire-flow.test.js 和 tests/health.test.js 的 beforeAll 均超过 30000 ms；tests/setup.js 在 mongoose.connect 时超时，afterAll 又触发“测试只能清理 questionnaire_system_test 数据库”。

测试服务器故障 Prompt：
单独运行健康测试时，Jest globalSetup 报错“测试服务器启动超时”。检查后发现 mongosh 返回 connect ECONNREFUSED 127.0.0.1:27017，MongoDB Windows 服务状态为 Stopped。

完成验证 Prompt：
我已经运行完整 AI-017 测试套件。Tests: 8 passed, 8 total；测试结束后 3101 端口仍在监听为 False；questionnaire_system_test 的集合检查结果为 []。请完成最终检查并更新 AI-017 日志，真实记录最初的数据库连接超时、MongoDB 服务停止的原因、测试架构调整、最终测试结果和清理验证。
```

### Result 得到什么代码或结果

AI 提供 Jest 和 Supertest 自动化测试方案，覆盖健康接口、404、问卷创建、题目添加、跳转规则、非法答案、答卷提交、重复提交、统计、权限保护和敏感身份字段保护。

初版方案在 Jest 生命周期钩子中直接使用 Mongoose 连接并清理测试数据库，实际运行时连接钩子超时。根据真实错误，测试结构改为由 Jest 的 globalSetup 启动独立 Node 子进程；该子进程连接专用测试库并启动 Express，测试文件通过 Supertest 请求本地测试服务器，globalTeardown 负责关闭服务和清理测试库。

调整后第一次运行仍出现测试服务器启动超时。继续检查发现 MongoDB Windows 服务为 Stopped，mongosh 返回 ECONNREFUSED；管理员 PowerShell 启动 MongoDB 后，测试恢复正常。这次故障属于运行环境未启动，不是业务接口代码错误。

### 是否修改

已修改测试架构。学生最初按 AI 提供的直接连接方案创建测试配置，出现真实超时后，又按诊断结果亲自调整为独立测试服务器方案；业务功能代码没有因本次测试故障而修改。

### 修改内容

- 配置 `jest.config.js`，使用 Node 测试环境、`globalSetup`、`globalTeardown`、30 秒测试超时和串行测试脚本。
- 初版 `tests/setup.js` 在 Jest 钩子中直接连接 `questionnaire_system_test`；由于实际运行中连接超时，该文件及对应 `setupFilesAfterEnv` 配置被移除。
- 创建 `tests/testServer.js`，在普通 Node 子进程中连接 `questionnaire_system_test`，校验数据库名称，测试前清空测试库，并在 `127.0.0.1:3101` 启动 Express。
- 创建 `tests/globalSetup.js`，使用 `child_process.fork` 启动测试服务器并等待 IPC 的 ready 消息。
- 创建 `tests/globalTeardown.js`，向子进程发送 shutdown 消息，关闭 HTTP 服务，清空专用测试数据库并断开 Mongoose。
- 创建 `tests/health.test.js`，测试 `GET /api/health` 返回 200 和不存在接口返回 404。
- 创建 `tests/questionnaire-flow.test.js`，使用动态用户名避免测试间冲突，并通过 Supertest 覆盖六项核心业务流程。
- 测试服务器只允许清理名称严格等于 `questionnaire_system_test` 的数据库，避免误删开发数据库。
- AI 没有直接修改业务文件；学生亲自创建和调整测试文件，AI负责提供代码、分析失败输出、指导验证并维护日志。

### 验证结果

- 初次完整测试失败：两个测试文件的 Mongoose `beforeAll` 均超过 30000 ms，未进入具体接口断言；清理钩子因连接未完成而触发数据库名称安全检查。
- 改为独立测试服务器后，健康测试第一次仍在 globalSetup 阶段超时。
- 环境检查确认 MongoDB Windows 服务状态为 Stopped，连接 `127.0.0.1:27017` 返回 `ECONNREFUSED`；使用管理员 PowerShell 启动服务后，MongoDB 状态和 ping 恢复正常。
- `tests/health.test.js` 随后通过，健康接口和 404 响应均符合预期。
- `tests/questionnaire-flow.test.js` 单独运行结果为 6 passed、0 failed，用时 5.291 秒。
- 创建问卷测试确认标题、draft 状态、匿名设置和禁止重复提交设置正确。
- 添加题目测试确认顺序、题型、必答属性、选项数量和稳定 optionId 正确。
- 跳转测试确认合法向后 goto 成功，向前 goto 返回 400 和“goto 只能跳转到后续题目”。
- 答案校验测试确认无效 optionId 返回 400 和有效选项提示。
- 答卷测试确认合法提交返回 201、实际路径跳过第二题，并以 409 阻止同一用户重复提交。
- 统计测试确认四道题统计、`notAnsweredCount`、单选计数、文本内容、数字平均值和单题查询正确。
- 统计接口未登录访问返回 401，非问卷所有者访问返回 404；统计 JSON 不包含 `respondentId`、`username` 或 `uniqueSubmissionKey`。
- 完整 `npm test` 最终结果为 8 passed、0 failed，无快照。
- 完整测试结束后，3101 端口监听检查为 False，说明 globalTeardown 已关闭测试服务器。
- `questionnaire_system_test` 的集合列表为 `[]`，说明测试数据已清理；开发数据库未被清理。
- 自动化测试、测试数据库隔离、失败诊断、服务关闭和数据清理全部完成，AI-017 完成并采用。


## AI-018 实现前端界面与公开填写流程

**日期：** 2026-10-20
**使用工具：** Codex、Windows PowerShell、浏览器及开发者工具、浏览器自动化、HTML、CSS、JavaScript、Express、Jest、MongoDB
**状态：** 已完成

### Prompt

```text
初始前端 Prompt：
我已经完成 AI-018 的 public 前端骨架，并在 app.js 中配置 Express 静态文件服务。我对当前 AI-018 代码的修改情况：未修改。请读取并检查 src/app.js、public/index.html、public/css/styles.css 和 public/js/app.js。如果正确，请继续教我启动服务并验证首页、CSS、JavaScript 和 /api/health。暂时不要更新 AI-018 日志。

功能迭代 Prompt：
请继续教我实现前端注册、登录、令牌保存和当前用户显示；本人问卷列表和创建问卷；题目管理入口和四种题型创建；题目编辑和删除；跳转规则配置；问卷发布、关闭、公开链接和公开只读页面。所有业务文件由我亲自修改，暂时不要更新 AI-018 日志。

界面修改 Prompt：
我发现登录和注册同时显示容易让用户误以为有两个登录框，因此我把认证区域改成单卡片的登录/注册标签切换。我已经修改 index.html、styles.css 和 app.js。请检查这项由我根据实际使用体验提出的界面修改，以及认证流程具体怎么进行。暂时不要更新 AI-018 日志。

公开填写 Prompt：
我已经完成 AI-018 前端问卷生命周期和公开读取动态测试，结果通过，请继续教我实现公开问卷填写、条件跳转和答卷提交界面。暂时不要更新 AI-018 日志。改什么代码就给我完整代码。

动态检查和修复 Prompt：
请直接帮我把需要检查的检查完。动态测试发现浏览器原生 min、max 和 step 校验可能阻止 JavaScript submit 事件，导致页面保留旧的自定义错误提示；公开问卷接口的旧题目可能在 validation 中返回不属于该题型的字段。我决定在 response-form 上增加 novalidate，并让 surveyLifecycleController.js 的公开题目序列化按题型筛选 validation 字段。文件由我亲自修改，完成验证前暂时不要更新 AI-018 日志。

日志完成 Prompt：
AI-018 的修复回归测试已经全部通过。请更新 AI使用日志.md 中的 AI-018，严格使用老师要求的“使用工具、Prompt、Result、是否修改、修改内容、验证结果”格式，并如实记录 AI 提供的代码、我的界面和校验改进、最终验证以及临时数据清理。
```

### Result 得到什么代码或结果

AI 分阶段提供并检查了前端骨架和完整交互代码，包括 Express 静态文件服务、首页健康状态、注册登录、JWT 令牌保存与恢复、本人问卷列表、创建问卷、四种题型管理、题目编辑删除、跳转规则配置、问卷发布关闭、公开链接、公开问卷读取、逐题填写、前端答案校验、条件跳转、上一题、匿名选择和答卷提交。

主要得到和使用的前端文件包括 `public/index.html`、`public/survey.html`、`public/css/styles.css`、`public/js/api.js`、`public/js/app.js`、`public/js/surveys.js`、`public/js/questions.js`、`public/js/jumpRules.js` 和 `public/js/publicSurvey.js`；后端配合修改涉及 `src/app.js` 和 `src/controllers/surveyLifecycleController.js`。

AI 检查时发现三项实际问题：初版登录和注册表单同时显示，容易被误认为两个登录框；数字框的浏览器原生校验可能截断 JavaScript 提交事件并保留旧提示；公开问卷序列化没有过滤旧题目中与题型无关的 validation 字段。学生根据实际使用体验和动态测试结果决定并完成相应修改。

### 是否修改

已修改。学生最初采用的大部分 AI 前端代码未修改，后续根据实际界面体验和动态验证结果提出三项个人改进并亲自完成。AI 提供代码、检查实际文件、分析错误和执行回归验证，学生负责业务文件的实际写入与调整。

### 修改内容

- 学生发现登录和注册同时显示容易造成误解，将认证区域改为单卡片结构，通过“登录/注册”标签切换表单，并修改 `public/index.html`、`public/css/styles.css` 和 `public/js/app.js`。
- 保留 JWT 存入本地存储、刷新恢复 `/api/auth/me`、退出清除令牌、错误密码和重复用户名提示等认证逻辑。
- 增加本人问卷列表、创建中文问卷、状态筛选、截止时间、匿名和重复提交配置界面。
- 增加四种题型创建、编辑、删除和只读状态界面，并保留稳定 optionId。
- 增加跳转规则编辑器，支持不同题型操作符、规则优先级、goto、submit 和只允许向后续题目跳转。
- 增加问卷发布和关闭确认、公开链接复制、公开只读页面及关闭后错误提示。
- 在 `public/survey.html` 和 `public/js/publicSurvey.js` 中实现登录后逐题填写、必答和题型校验、上一题、路径重算、条件跳转、匿名选择及答卷提交。
- 学生根据动态测试结果在 `response-form` 上增加 `novalidate`，避免浏览器原生校验阻断 JavaScript 的统一中文错误提示。
- 学生在 `surveyLifecycleController.js` 增加按题型筛选 validation 字段的映射和规范化函数，使公开接口兼容旧数据：单选题返回空对象，多选题只返回选择数量字段，文本题只返回长度字段，数字题只返回数值范围和整数限制字段。
- AI 在最终动态测试中创建专用临时用户和问卷；验证完成后按用户名和公开编号精确删除临时用户、问卷、题目和答卷，没有删除原有业务数据。

### 验证结果

- 首页、CSS、JavaScript 和 `/api/health` 均返回 200，静态资源 Content-Type 正确，健康状态显示正常。
- 注册、登录、刷新恢复登录、退出、重新登录、错误密码和重复用户名测试通过；登录和注册标签切换符合单卡片设计。
- 本人问卷列表、中文标题与说明、截止时间、匿名设置、重复提交设置、状态筛选和退出后隐藏测试通过。
- 四种题型创建、顺序、编辑、稳定 optionId、删除和发布后只读测试通过。
- 跳转规则配置、合法 goto、submit、优先级、无效目标和只允许向后续题目跳转测试通过。
- 问卷发布、取消确认、关闭、公开链接、公开读取、草稿和关闭问卷不可公开访问测试通过。
- 未登录用户可以读取公开问卷标题和说明，但答题表单隐藏；登录后正常显示第一题。
- 单选必答、多选必答和最大选择数量、文本必答与长度、数字上下限和整数限制均能阻止非法答案。
- 普通顺序提交保存 4 个答案并访问 4 道题；goto 路径跳过第二题，保存 3 个答案并访问 3 道题；提前 submit 规则保存 1 个答案并访问 1 道题。
- 上一题能够恢复当前路径中的答案；返回前题后重新向前时，会清除后续旧路径答案，避免提交未访问题目的答案。
- 匿名提交成功，数据库内部仍保存 `respondentId` 和唯一提交键；禁止匿名的问卷不显示匿名选项；禁止重复提交时返回 409。
- 关闭问卷显示“公开问卷不存在或尚未发布”，过期问卷显示“问卷已超过截止时间”，无效令牌返回 401。
- 公开接口不包含 `ownerId`、`respondentId` 或 `username`，匿名和公开读取没有泄露身份字段。
- 增加 `novalidate` 后，数字 `-1` 显示“不能小于 0”，数字 `25` 显示“不能大于 24”，旧错误提示不再残留。
- validation 回归结果：`singleChoice` 为 `{}`；`multipleChoice` 只包含 `minSelections,maxSelections`；`text` 只包含 `minLength,maxLength`；`number` 只包含 `minValue,maxValue,integerOnly`。
- 浏览器控制台错误数量为 0，移动端断点和公开填写按钮布局样式存在。
- 完整 `npm test` 最终结果为 8 passed、0 failed，无快照。
- 测试结束后 3101 端口监听为 False，`questionnaire_system_test` 集合列表为 `[]`。
- 本轮临时测试账号、问卷、题目和答卷均已清理，临时浏览器页面与开发服务已关闭。
- AI-018 前端功能、个人修改、公开填写和最终回归全部完成并采用。

## AI-019 实现问卷统计前端

**日期：** 2026-10-20
**使用工具：** Codex、Windows PowerShell、浏览器自动化、HTML、CSS、JavaScript、Express、MongoDB、Jest、Supertest
**状态：** 已完成

### Prompt

```text
初始 Prompt：
请开始 AI-019。先读取当前 surveys.js、index.html、styles.css 和后端 statisticsController.js，教我实现问卷创建者的前端统计查看功能。界面需要支持从已发布或已关闭问卷进入统计页面；显示总答卷数；显示每题 totalAnswers 和 notAnsweredCount；单选和多选显示各选项数量；文本题显示回答列表；数字题显示数量、平均值、最小值和最大值；不显示 respondentId、username 或 uniqueSubmissionKey；支持整份问卷统计和单题筛选。业务文件由我亲自修改，改什么文件就给我完整代码。AI使用日志.md 仍由 AI 负责，完成验证前暂时不要写入 AI-019。

检查与验证 Prompt：
我已经完成 AI-019 的 surveys.js、statistics.html、statistics.js 和 statistics.css。我对当前 AI-019 代码的修改情况：未修改。请读取并检查我实际创建的四个文件。如果正确，请直接帮我动态测试已发布和已关闭问卷的统计入口、总答卷数、四种题型结果、单题筛选、刷新、未登录访问、不同用户越权访问和敏感字段保护。完成验证前暂时不要更新 AI-019 日志。

日志完成 Prompt：
AI-019 的静态检查和动态验证已经全部通过。请更新 docs/AI使用日志.md 中的 AI-019，严格使用老师要求的“使用工具、Prompt、Result、是否修改、修改内容、验证结果”格式，并如实记录前端统计代码、未修改情况、功能与权限验证、敏感字段保护、Jest 结果及临时数据清理。
```

### Result 得到什么代码或结果

AI 读取并分析现有问卷列表界面、页面样式和后端统计接口，提供了问卷创建者使用的前端统计实现：在 `public/js/surveys.js` 中为已发布和已关闭问卷增加统计入口；创建 `public/statistics.html` 作为独立统计页面；创建 `public/js/statistics.js` 负责身份检查、统计请求、题型渲染、单题筛选和刷新；创建 `public/css/statistics.css` 负责统计概览、表格、文本列表、数字指标和响应式布局。

统计页面能够使用后端已有的 MongoDB 聚合结果，显示整份问卷的总答卷数及每题 `totalAnswers` 和 `notAnsweredCount`。单选题和多选题显示每个选项的计数，文本题显示回答列表，数字题根据统计接口返回的数据展示有效数量、平均值、最小值和最大值。页面支持整份问卷统计、按题筛选和保持当前筛选条件刷新。

### 是否修改

未修改。学生按照 AI 提供的完整代码亲自创建或替换 `public/js/surveys.js`、`public/statistics.html`、`public/js/statistics.js` 和 `public/css/statistics.css`，本阶段没有对 AI 提供的代码进行额外调整。AI 没有直接修改这些业务文件，只读取实际文件并完成静态检查、API 测试、浏览器动态测试和清理验证。

### 修改内容

- 在 `public/js/surveys.js` 中增加统计页面 URL 构造与“查看统计”按钮；按钮只为 `published` 和 `closed` 状态问卷显示，草稿问卷不显示。
- 创建 `public/statistics.html`，包含问卷标题、登录状态、总答卷数、题目数、题目筛选、刷新按钮和题目统计列表。
- 创建 `public/js/statistics.js`，调用 `/api/auth/me` 校验当前用户，再调用 `GET /api/surveys/:surveyId/statistics`；选择单题时增加 `questionId` 查询参数。
- 按题型分别渲染统计结果：单选和多选显示选项及数量，文本题显示回答列表，数字题显示数量、平均值、最小值和最大值。
- 统计渲染只使用汇总字段，不展示 `respondentId`、答卷者 `username` 或 `uniqueSubmissionKey`。
- 创建 `public/css/statistics.css`，增加概览指标卡、选项统计表、文本回答列表、数字统计网格及移动端布局。
- 本阶段业务文件采用 AI 提供的版本，学生未对代码进行修改。

### 验证结果

- `public/js/surveys.js` 和 `public/js/statistics.js` 均通过 Node.js 语法检查；四个文件内容完整，HTML 元素、JavaScript 选择器和样式类相互匹配。
- 浏览器中的已发布问卷和已关闭问卷均显示“查看统计”按钮，草稿问卷不显示统计入口；点击已发布问卷按钮能够打开包含正确 `surveyId` 的统计页面。
- 主问卷统计接口和页面均正常加载，显示问卷状态为“已发布”、总答卷数为 1、当前题目数为 4。
- 单选题显示 4 个选项，“大学一年级”计数为 1，其余选项为 0；该题 `totalAnswers` 为 1、`notAnsweredCount` 为 0。
- 多选题因条件跳转未被回答，三个选项计数均为 0，`totalAnswers` 为 0、`notAnsweredCount` 为 1。
- 文本题显示“每天按照学习计划完成任务”，`totalAnswers` 为 1、`notAnsweredCount` 为 0。
- 数字题显示有效数字数量为 1、平均值为 12、最小值为 12、最大值为 12，`notAnsweredCount` 为 0。
- 选择第二题进行单题统计后，页面显示 `questionCount` 为 1，只渲染该多选题；点击刷新后仍保持当前单题筛选并重新加载成功。
- 已关闭问卷的统计页面能够正常打开，正确显示“已关闭”状态和对应答卷数量。
- 未登录打开统计页面时，统计内容保持隐藏并提示“查看统计需要登录”；统计 API 返回 401 和“缺少有效的登录令牌”。
- 使用其他用户访问主问卷统计时，API 返回 404 和“问卷不存在或不属于当前用户”，页面隐藏统计内容，问卷所有权保护生效。
- 统计 API 原始 JSON 和统计结果中均不包含 `respondentId`、答卷者 `username` 或 `uniqueSubmissionKey`。页面中的当前登录账号仅用于显示创建者自身的认证状态，不包含答卷者身份。
- 完整 `npm test` 结果为 8 passed、0 failed，共 2 个测试套件，无快照失败。
- 测试结束后 3101 端口监听为 False，`questionnaire_system_test` 集合列表为 `[]`，测试服务器和测试数据库均已清理。
- AI-019 动态测试使用的临时账号已精确删除，没有产生临时答卷，账号剩余数量为 0；浏览器测试标签页和开发服务均已关闭。
- AI-019 的统计入口、统计展示、题型结果、单题筛选、刷新、权限控制、敏感字段保护和自动化回归全部通过并采用。

## AI-020 第一阶段最终验收与提交材料收尾

**日期：** 2026-10-21
**使用工具：** Codex、Windows PowerShell、Node.js、Jest、Supertest、MongoDB、Mongoose
**状态：** 已完成

### Prompt

```text
最终验收 Prompt：
请开始 AI-020。重新读取大作业原始文档、docs/需求基线.md、docs/数据库设计.md、README.md 和当前项目目录，对第一阶段进行完整验收检查。逐项检查用户、问卷、题目、答卷和统计功能；登录认证、匿名保护、重复提交、条件跳转和数据权限；MongoDB 集合、索引、嵌入与引用设计；前后端功能和自动化测试；README、数据库设计、API 文档、AI 使用日志和最终报告；以及提交目录中的敏感文件风险。先输出检查结果和建议顺序，不直接修改业务文件。

文档收尾 Prompt：
请依次教我完善 README、docs/API说明.md、docs/关键逻辑说明.md、docs/测试用例与结果.md、docs/第一阶段项目完成报告.md 和 docs/AI使用说明.md。文档由我亲自修改，完成最终检查前暂时不要更新 AI-020 日志。

最终日志 Prompt：
请更新 docs/AI使用日志.md 中的 AI-020，严格使用“使用工具、Prompt、Result、是否修改、修改内容、验证结果”格式。记录第一阶段最终验收、文档补齐、测试 8 项通过、敏感文件排除，以及提交前发现并修复 styles.css 末尾截断问题。
```

### Result 得到什么代码或结果

AI 重新对照原始作业文档和实际项目，形成第一阶段完整验收清单，确认用户认证、问卷生命周期、四种题型、数据配置跳转、答案校验、匿名保护、重复提交控制、答卷快照、整份与单题统计、前端页面和自动化测试均已实现。

AI 提供并核对了 README、API 说明、关键逻辑说明、测试用例与结果、第一阶段项目完成报告和 AI 使用说明的完整内容与检查方法。验收过程中发现 API 说明曾包含重复内容，学生删除重复和残缺部分，只保留一份完整版本；各文档随后通过标题、关键字段和内容完整性检查。

提交前格式检查发现 `public/css/styles.css` 在移动端媒体查询末尾被截断，只保留了空的 `width:` 属性，并缺少两个右花括号。AI 定位具体位置并给出修复命令，学生将其补为 `width: 100%;`，闭合按钮规则和媒体查询，同时清理文档行尾空格及 API 文档末尾多余空行。

### 是否修改

已修改。学生根据 AI 的验收结果亲自补齐和整理项目文档，删除 API 说明中的重复内容，并修复 `public/css/styles.css` 末尾截断问题。AI 没有替学生修改业务实现文件，负责读取要求、核对实际文件、指出问题、提供修改位置与命令，并更新本次 AI 使用日志。

### 修改内容

- 更新 `README.md`，补充项目简介、技术栈、已完成功能、目录结构、Node.js 与 MongoDB 环境要求、`npm ci`、环境变量配置、启动开发测试命令、页面入口和提交排除项。
- 创建并核对 `docs/API说明.md`，记录认证、问卷、题目、公开填写、答卷提交和统计接口的路径、请求字段、响应结构、认证要求及状态码；删除重复和残缺内容。
- 创建并核对 `docs/关键逻辑说明.md`，说明认证、所有权、生命周期、题型校验、跳转优先级、向后续题目跳转限制、循环保护、填写路径、匿名、重复提交、快照、统计和测试隔离。
- 创建并核对 `docs/测试用例与结果.md`，记录测试步骤、输入、预期输出、实际输出和结论。
- 创建并核对 `docs/第一阶段项目完成报告.md`，覆盖项目目标、系统设计、MongoDB 设计、跳转设计、校验设计、AI 使用过程、测试结果、问题和解决方法。
- 创建并核对 `docs/AI使用说明.md`，总结 AI 提供的帮助、AI 建议的不足、学生完成的修改和学生自己的设计。
- 清理 README 与 AI 日志中的行尾空格，删除 API 说明末尾多余空行。
- 修复 `public/css/styles.css` 的移动端 `.public-navigation button` 规则，将空属性补为 `width: 100%;`，并补齐缺失的两个右花括号。
- 检查提交范围，确认只包含源代码、前端、测试、文档、依赖锁定文件、示例环境变量和必要配置；真实环境变量、依赖目录、覆盖率、日志及临时文件均被排除。

### 验证结果

- 第一阶段要求的用户、问卷、题目、答卷、统计、登录认证、匿名保护、重复提交、条件跳转和数据权限功能均已完成。
- MongoDB 的 `users`、`surveys`、`questions` 和 `responses` 模型、关键索引、引用关系、题目与选项快照及数据保留策略均有实现和文档说明。
- README、需求基线、数据库设计、API 说明、关键逻辑说明、测试用例与结果、AI 使用日志、AI 使用说明和项目完成报告均存在且内容完整。
- JavaScript 文件语法检查全部通过，应用模块能够正常加载。
- 完整 Jest 测试结果为 2 个测试套件、8 项测试全部通过，无失败和快照。
- 测试结束后 3101 端口未继续监听，`questionnaire_system_test` 数据库集合列表为 `[]`，测试服务器和测试数据清理正常。
- `.gitignore` 包含 `.env`、`node_modules/`、`coverage/`、日志和 npm 调试日志规则；最终候选文件检查中风险文件数量为 0。
- README 中的环境变量值为公开示例，占位密钥与本机真实密钥不同；真实 `.env` 未进入提交范围。
- `styles.css` 末尾修复后移动端按钮规则完整；提交前空白检查不再报告行尾空格、文档末尾空行或 CSS 空属性。
- 第一阶段代码、测试、文档、报告和 AI 使用材料已完成最终验收，可以进入报告链接填写、PDF 导出和课程平台提交步骤。

## AI-021 第二阶段需求分析与需求基线建立

**日期：** 2026-10-26
**使用工具：** Codex、Windows PowerShell、python-docx、Markdown
**状态：** 已完成

### Prompt

```text
初始 Prompt：
请开始第二阶段第1步。开始前仔细阅读《大作业一》和《大作业一：需求变更》，不要遗漏要求；在第一阶段原项目基础上建立第二阶段需求文档，不修改业务代码。文档由我亲自创建，AI 使用日志从 AI-021 开始由 AI 记录。

格式问题反馈 Prompt：
你给我的第二阶段需求基线格式有问题。

完成验证 Prompt：
我已经补齐第二阶段需求基线。检查结果为：二级标题数量 27，代码围栏数量 2，REQ-S2-01 至 REQ-S2-08 全部存在，文件最后一行为项目能够在干净环境中安装、迁移、运行和测试。请检查实际文件，并由你更新 AI-021。
```

### Result 得到什么代码或结果

AI 重新读取并逐项核对《大作业一》和《大作业一：需求变更》，确认第二阶段必须在第一阶段代码、数据库和文档基础上修改扩展，不得推倒重做，必须保留旧数据、旧功能和第一阶段核心结构，并继续完成前后端程序、MongoDB 设计、测试、文档、完整报告及真实 AI 使用记录。

AI 根据需求变更中的八项用户反馈，提供了 `docs/第二阶段需求基线.md` 的完整内容。文档覆盖保存和复用题目、共享题目、保护旧问卷、版本历史、多版本共存、题目使用情况、题目库和单题跨问卷统计，并补充第一阶段功能基线、现有结构限制、MongoDB 设计约束、数据迁移与兼容、权限保护、测试范围、前端范围、API 范围、文档要求、AI 使用要求、最终报告要求、实施顺序和阶段完成判定。

### 是否修改

已修改。学生按照 AI 提供的内容亲自创建 `docs/第二阶段需求基线.md`，随后发现 AI 最初输出的外层 Markdown 代码围栏与文档内部代码围栏发生嵌套，复制后的文件只到第 10.3 节。学生没有把不完整文档作为最终结果，而是指出格式问题。AI 读取实际文件确认内容被截断，改用四反引号外层格式提供剩余内容，学生亲自补齐文档。

### 修改内容

- 创建 `docs/第二阶段需求基线.md`，保留第一阶段功能和数据作为第二阶段兼容基线。
- 将需求变更整理为 `REQ-S2-01` 至 `REQ-S2-08` 八项可验收需求。
- 明确可复用题目、题目版本、问卷题目使用关系、共享关系、题目库和答卷快照需要在逻辑上分离。
- 明确已发布和已关闭问卷固定使用原题目版本，修改题目时创建新版本，旧问卷和旧答卷不受影响。
- 补充历史版本恢复、多版本共存、题目使用情况和跨问卷统计的权限与验收标准。
- 补充第一阶段旧数据迁移、重复执行保护、旧公开链接、旧答卷、跳转规则和统计结果兼容要求。
- 补充第一阶段回归测试和第二阶段新增测试基线。
- 补充第二阶段需要更新的 README、数据库设计、API、关键逻辑、测试、数据迁移、AI 说明和完整报告范围。
- 根据学生发现的格式问题，补齐原来缺失的第 10.4 节至第 27 节，没有修改业务代码。

### 验证结果

- 实际文件以 UTF-8 正常读取，没有乱码。
- 文件包含 27 个二级标题，没有重复或空标题。
- `REQ-S2-01` 至 `REQ-S2-08` 均在需求总览和对应详细章节中出现。
- Markdown 代码围栏数量为 2，开始与结束成对，没有未闭合代码块。
- “不得推倒重做”“旧数据必须保留”“第一阶段自动化测试继续通过”“跨问卷统计”“题目库”“AI-021”和“最终报告”等关键要求均存在。
- 文件最后一项为“项目能够在干净环境中安装、迁移、运行和测试”。
- 文档已覆盖两份作业文档中与第二阶段有关的功能、兼容、测试、提交和报告要求。
- 本步骤只建立和检查需求文档，没有修改第一阶段业务代码。

## AI-022 第二阶段 MongoDB 数据结构与迁移方案设计

**日期：** 2026-10-26
**使用工具：** Codex、Windows PowerShell、JavaScript、Mongoose、MongoDB、Markdown
**状态：** 已完成

### Prompt

```text
初始 Prompt：
请开始第二阶段第2步。读取现有 User、Survey、Question、Response 模型、数据库设计和第二阶段需求基线，分析需要新增或调整的集合、字段、引用、索引与旧数据迁移方案。先完成设计，不修改业务代码；文档由我亲自修改，AI 使用日志由你从 AI-022 继续记录。

完成验证 Prompt：
我已经把第二阶段数据库设计追加到 docs/数据库设计.md。文档保留原第 1 至 12 节，新增第 13 至 31 节；questionItems、questionVersions、questionShares、questionBanks、questions 和 responses 调整、旧数据迁移、迁移验证及回滚兼容内容均存在。设计正确，请更新 AI-022，并继续教我建立新模型前的数据库备份与旧数据基线检查。
```

### Result 得到什么代码或结果

AI 读取第一阶段实际的 `User.js`、`Survey.js`、`Question.js`、`Response.js`、模型出口文件、数据库设计和第二阶段需求基线，确认第一阶段的 `questions` 同时保存问卷归属、顺序、题目内容、必答设置、校验和跳转规则，并被答卷答案、填写路径和跳转目标引用，因此不能删除或重新生成原题目记录。

AI 提供了第二阶段增量数据库设计：保留原 `users`、`surveys`、`questions` 和 `responses`；新增 `questionItems` 保存逻辑题目、`questionVersions` 保存不可变版本、`questionShares` 保存共享关系、`questionBanks` 保存嵌入式题库条目，并建议使用 `schemaMigrations` 记录迁移过程。现有 `questions` 继续作为问卷题目实例，增加逻辑题目和版本引用；`responses.answers` 增加相同引用用于跨问卷统计，同时保留原 questionId、填写路径和题目选项快照。

### 是否修改

未修改设计内容。学生按照 AI 提供的设计亲自将第 13 至 31 节追加到 `docs/数据库设计.md`。AI 没有修改模型、控制器、路由、数据库或其他业务代码，只读取实际文件、提出设计方案并检查学生完成的文档。

### 修改内容

- 在原数据库设计后增加第二阶段调整目标和新集合关系，不覆盖第一阶段设计记录。
- 设计 `questionItems`，保存题目所有者、当前推荐版本、最新版本号、归档状态和旧题目标识。
- 设计 `questionVersions`，保存不可变题目内容、版本号、直接父版本和恢复来源版本。
- 设计 `questionShares`，通过独立集合记录使用权限、有效状态、共享与取消时间。
- 设计 `questionBanks`，使用嵌入数组保存逻辑题目、推荐版本、顺序和加入时间。
- 保留 `questions._id`、surveyId、order、required 和 jumpRules，并增加 questionItemId、questionVersionId、contentSource 和 schemaVersion。
- 明确跳转规则继续引用同一问卷内的 Question 实例，不直接引用公共版本。
- 为 `responses.answers` 增加 questionItemId 和 questionVersionId，并继续保留题目、题型和选项快照。
- 设计逻辑题目、版本、共享、题库、问卷使用情况和答卷统计所需索引。
- 不建立独立的题目使用情况和统计结果集合，分别从 questions 与 responses 聚合，避免重复数据失去同步。
- 设计版本号原子分配、唯一索引、历史版本不可变、恢复时创建新版本及归档策略。
- 设计第一阶段旧题目到逻辑题目和 v1 的迁移、答卷答案引用补充、问卷版本更新、迁移记录、幂等检查和迁移后验证。
- 明确迁移采用新增字段与集合的方式，不删除第一阶段兼容字段，并保留回滚能力。

### 验证结果

- `docs/数据库设计.md` 原第 1 至 12 节仍然存在，新增第 13 至 31 节，共 19 个新增二级章节。
- 新增章节没有重复标题或空标题。
- 文档中的 14 个 Markdown 代码围栏开始与结束成对。
- questionItems、questionVersions、questionShares 和 questionBanks 的用途、字段、引用和索引均有说明。
- questions 与 responses 的保留字段、新增字段、引用方向和索引均有说明。
- 题目版本不保存 order、required 和 jumpRules，问卷专属配置与公共题目内容已分离。
- 原 Question._id、jumpRules.targetQuestionId、answers.questionId 和 visitedQuestionIds 均被保留，避免破坏第一阶段数据。
- 迁移方案不会根据相同标题自动合并旧题，避免把无关题目错误识别为同一道逻辑题目。
- legacyQuestionId 唯一稀疏索引、版本唯一组合索引和迁移记录共同支持幂等执行。
- 题目库采用嵌入条目，并说明了适用规模、重复校验和未来拆分条件。
- 跨问卷统计基于 responses.answers 中的逻辑题目和版本引用，不依赖标题，也不新建可能失去同步的统计集合。
- 数据权限、删除归档、迁移后验证和回滚兼容策略完整。
- 本步骤没有修改业务代码，也没有修改数据库数据或索引。

## AI-023 第二阶段修改前数据库备份与旧数据基线

**日期：** 2026-10-26
**使用工具：** Codex、Windows PowerShell、MongoDB、MongoDB Database Tools、mongosh、mongodump
**状态：** 已完成

### Prompt

```text
初始 Prompt：
请继续教我建立新模型前的数据库备份与旧数据基线检查。

流程改进 Prompt：
我认为数据库备份流程应该先检查 MongoDB 服务、数据库连接以及 mongodump 和 mongorestore，不能默认工具已经安装；Git 也不需要每一步都推送。AI 日志应按完整功能阶段合并记录。

完成验证 Prompt：
我已经安装 MongoDB Database Tools，确认 mongodump 和 mongorestore 版本为 100.19.1，重新启动 MongoDB 并通过 ping 检查；备份目录包含 users、surveys、questions 和 responses 四个核心 BSON 文件。旧数据数量为 users 6、surveys 7、questions 12、responses 3。请完成 AI-023，然后开始新模型与迁移阶段，不再进行哈希、恢复演练或 Git 提交。
```

### Result 得到什么代码或结果

AI 最初给出的备份流程直接使用 `mongodump` 和 `mongorestore`，没有先确认 MongoDB Database Tools 是否安装，也没有先检查 MongoDB Windows 服务状态。实际执行时发现两个工具均不可用，MongoDB 服务为 Stopped，数据库连接返回 `ECONNREFUSED 127.0.0.1:27017`。

学生根据实际问题提出改进意见：备份前应依次检查服务、连接和工具，Git 不需要在每个小步骤提交或推送，AI 日志应按完整功能阶段合并。AI 接受该意见并简化流程，指导学生安装 MongoDB Database Tools、重新启动 MongoDB、执行连接检查、创建阶段一修改前备份，并只保留作业需要的旧数据数量基线检查。

最终在 `D:\python\dataset\questionnaire-backups\stage1-before-stage2-20261026-104856` 创建了 `questionnaire_system` 数据库备份。备份包含四个核心集合的 BSON 数据文件和对应元数据文件，随后通过只读统计得到第一阶段旧数据数量基线。

### 是否修改

已修改开发环境和备份流程，未修改项目业务代码、MongoDB 原数据或第一阶段功能。学生亲自安装 MongoDB Database Tools、启动 MongoDB 服务、执行备份和数量检查，并提出简化流程与合并日志的改进意见。AI 没有生成或修改业务代码。

### 修改内容

- 安装 MongoDB Database Tools 100.19.1，获得 `mongodump.exe` 和 `mongorestore.exe`。
- 将 MongoDB Windows 服务从 Stopped 恢复为 Running。
- 使用 `mongosh` 执行 `db.runCommand({ ping: 1 })`，得到 `{ ok: 1 }`。
- 在项目目录之外创建带时间戳的第一阶段数据库备份，避免备份文件进入项目提交范围。
- 备份 `users`、`surveys`、`questions` 和 `responses` 四个第一阶段核心集合及其元数据。
- 使用只读 `countDocuments` 记录第二阶段修改前的旧数据数量。
- 根据学生意见取消本阶段不必要的哈希、恢复演练和逐步 Git 操作，后续按完整功能阶段更新 AI 日志。

### 验证结果

- `mongodump` 和 `mongorestore` 版本均为 100.19.1，可以正常执行。
- MongoDB 服务状态为 Running，数据库 ping 结果为 `{ ok: 1 }`。
- 备份目录存在，`questionnaire_system` 子目录可以正常读取。
- `users.bson`、`surveys.bson`、`questions.bson` 和 `responses.bson` 均存在且文件大小大于 0。
- 四个集合对应的 `.metadata.json` 文件均存在，备份结构完整。
- 修改前旧数据基线为：users 6 条、surveys 7 条、questions 12 条、responses 3 条。
- 本阶段没有修改、删除或迁移数据库原记录，也没有修改业务文件。
- 备份阶段已经结束，可以进入第二阶段新模型和旧数据迁移实现。

## AI-024 第二阶段题目版本模型与旧数据迁移

**日期：** 2026-10-26
**使用工具：** Codex、Windows PowerShell、Node.js、Mongoose、MongoDB、mongosh、Jest、Supertest
**状态：** 已完成

### Prompt

```text
模型设计 Prompt：
我认为迁移脚本直接运行就修改数据库风险较高。迁移脚本应默认使用 dry-run，只读取并显示目标数据库、旧题目数、旧答卷数和预计修改数量；只有明确传入 --apply 时才执行迁移。脚本应拒绝空数据库名、显示实际数据库名称，并且能够重复运行，第二次执行不能产生重复的 questionItems 或 questionVersions。请先教我创建新增模型并扩展现有模型，模型和迁移全部验证后再统一记录 AI-024。

模型问题修正 Prompt：
我已经把 SchemaMigration.js 的 errors 改为 errorDetails，并同步修改数据库设计第 27.6 节。本次对 AI 模型代码的实际修改是：发现 AI 使用了 Mongoose 保留路径 errors，我将其改为 errorDetails，避免模型加载警告；其他模型代码未修改。

迁移实现 Prompt：
请给我完整的默认 dry-run、显式 --apply、显示目标数据库且可重复执行的迁移脚本。重点检查迁移前引用、旧字段保留、幂等 upsert、迁移记录和错误处理。先运行 dry-run，确认没有写入后再执行 --apply。

迁移兼容修正 Prompt：
我已经把迁移脚本中的两处 new: true 改为 returnDocument: 'after'，语法检查通过。请检查第一次迁移、第二次迁移的幂等性和第一阶段回归测试，完成验证后更新 AI-024。
```

### Result 得到什么代码或结果

AI 根据第二阶段数据库设计提供了 `QuestionItem.js`、`QuestionVersion.js`、`QuestionShare.js`、`QuestionBank.js` 和 `SchemaMigration.js` 五个新增 Mongoose 模型，并提供了对 `Question.js`、`Response.js` 和 `models/index.js` 的兼容扩展。新增结构用于区分逻辑题目、不可变内容版本、共享关系、题库条目和迁移记录；第一阶段的问卷题目实例、答卷快照和原有引用继续保留。

AI 还提供了 `scripts/migrate-stage2-question-versioning.js`。脚本默认执行 dry-run，只有显式使用 `--apply` 才写入数据库；运行时显示目标数据库，拒绝空数据库名和系统数据库，迁移前检查问卷、题目、跳转目标、答卷答案与填写路径引用，并通过 `legacyQuestionId` 和版本唯一索引进行幂等 upsert。迁移过程保留原题目和答卷字段，补充逻辑题目、版本引用和 schemaVersion，并使用 `schemaMigrations` 记录状态、数量和错误详情。

第一次 dry-run 检查到 users 6 条、surveys 7 条、questions 12 条、responses 3 条，预计迁移题目 12 条、答卷 3 条、问卷 7 条，引用问题为 0；运行前后 questionItems、questionVersions 和 schemaMigrations 均为 0，确认 dry-run 没有写入。第一次正式迁移处理 22 个对象并成功完成，第二次正式迁移处理 0 个、跳过 22 个，证明重复执行不会生成重复数据。

### 是否修改

已修改。学生亲自创建和扩展模型文件及迁移脚本。除两处兼容性修正外，模型和迁移主体采用 AI 提供的代码：学生发现 AI 在 `SchemaMigration` 中使用了 Mongoose 保留路径 `errors`，将其改为 `errorDetails`，并同步修订数据库设计；学生还发现迁移脚本使用了 Mongoose 9 已弃用的 `new: true`，将两处改为 `returnDocument: 'after'`。默认 dry-run、显式 `--apply`、显示并保护目标数据库以及幂等迁移均为学生提出的流程和安全设计意见。

### 修改内容

- 新增 `src/models/QuestionItem.js`，记录逻辑题目、所有者、当前版本、最新版本号、状态和旧题目标识，并为所有者、状态和 `legacyQuestionId` 建立索引。
- 新增 `src/models/QuestionVersion.js`，保存不可变题型、标题、选项和校验配置，以及版本号、父版本和恢复来源，并建立题目与版本号唯一索引。
- 新增 `src/models/QuestionShare.js`，记录逻辑题目、共享用户、共享状态和时间，并防止同一题目向同一用户重复建立共享记录。
- 新增 `src/models/QuestionBank.js`，使用嵌入条目保存题库中的逻辑题目和推荐版本，并校验同一题库不能重复加入同一道题。
- 新增 `src/models/SchemaMigration.js`，记录迁移模式、状态、计数、完成时间和错误详情；将 AI 最初使用的保留路径 `errors` 改为 `errorDetails`。
- 扩展 `Question.js`，增加 `questionItemId`、`questionVersionId`、`contentSource` 和 `schemaVersion`，同时保持第一阶段旧题目可以继续加载。
- 扩展 `Response.js`，为答卷及答案增加版本架构和逻辑题目、版本引用，同时继续保留 questionId、题目与选项快照和 visitedQuestionIds。
- 更新 `src/models/index.js`，统一导出第一阶段和第二阶段共 9 个模型。
- 新增 `scripts/migrate-stage2-question-versioning.js`，实现默认 dry-run、显式写入、数据库保护、迁移前引用检查、旧字段保留、幂等迁移、迁移记录和错误处理。
- 将迁移脚本中的两处 `new: true` 改为 `returnDocument: 'after'`，消除 Mongoose 9 弃用警告。
- 执行第一次正式迁移，为 12 道旧题分别建立 12 个逻辑题目和 12 个 v1 版本，并升级 12 道问卷题目、3 份答卷和 7 份问卷的第二阶段引用与架构版本。

### 验证结果

- 五个新增模型和三个扩展模型均通过 Node.js 语法检查，`models/index.js` 能够加载 User、Survey、Question、Response、QuestionItem、QuestionVersion、QuestionShare、QuestionBank 和 SchemaMigration 共 9 个模型。
- 新模型使用明确集合名 `questionItems`、`questionVersions`、`questionShares`、`questionBanks` 和 `schemaMigrations`，集合名称和索引检查均通过。
- QuestionVersion 的 questionItemId、versionNumber、type、title、options 和 validation 均为不可变字段；题目版本唯一索引和题库重复条目校验生效。
- 第一阶段 schemaVersion 1 的 Question 和 Response 仍可加载，第二阶段 schemaVersion 2 数据要求具备对应逻辑题目和版本引用。
- 迁移脚本语法检查通过，默认 dry-run 没有写入数据；目标数据库为 `questionnaire_system`，迁移前引用问题数量为 0。
- 第一次正式迁移后，旧集合数量保持 users 6、surveys 7、questions 12、responses 3；新增 questionItems 12、questionVersions 12、schemaMigrations 1。
- 第一次迁移记录状态为 completed，processedCount 为 22、skippedCount 为 0、failedCount 为 0、errorDetails 为空。
- 第二次执行 `--apply` 后，旧集合和新增集合数量均未变化，processedCount 为 0、skippedCount 为 22、failedCount 为 0、errorDetails 为空，幂等性验证通过。
- 迁移后缺少题目引用的 Question 数量为 0，缺少版本引用的 Response 数量为 0，未升级 Survey 数量为 0，缺少 currentVersionId 的 QuestionItem 数量为 0。
- 第一阶段完整 Jest 回归测试结果为 2 个测试套件、8 项测试全部通过，无失败和快照。
- 测试结束后 3101 端口未继续监听，`questionnaire_system_test` 集合列表为 `[]`，测试服务器和测试数据均已清理。
- 本阶段没有执行 Git 提交或推送。

## AI-025 可复用题目与不可变版本管理

**日期：** 2026-10-26 至 2026-10-28
**使用工具：** Codex、Windows PowerShell、Node.js、Express、Mongoose、MongoDB、mongosh、Jest、Supertest
**状态：** 已完成

### Prompt

```text
设计 Prompt：
我认为 QuestionVersion 必须保持真正不可变：不提供修改或删除历史版本的接口；编辑可复用题目时创建递增的新版本；恢复历史版本时也应复制历史内容生成一个新版本，而不是把 currentVersionId 直接改回旧版本。已有问卷继续引用原 questionVersionId，不自动升级。请检查这个设计意见，并教我实现可复用题目的创建、本人列表、详情、新版本、历史版本和恢复接口。

代码检查 Prompt：
我已经创建 questionItemController.js、questionItemRoutes.js，并更新 app.js。当前 AI-025 代码未修改，语法检查和应用模块加载通过。请读取实际代码，检查历史版本不可变、版本递增、并发冲突、恢复生成新版本、问卷字段隔离、所有权和失败清理，并继续教我动态测试。

问题修正 Prompt：
动态测试登录时，服务器收到的请求体变成了以 123、13、10 等数字组成的字符串并返回服务器内部错误。请根据实际错误定位原因，恢复登录后继续 AI-025 测试。

完成验证 Prompt：
我已经完成版本创建、历史查询、版本恢复、权限、旧问卷兼容、临时数据清理和 Jest 回归。请更新 AI-025 日志，然后开始下一阶段，不要执行 Git 提交或推送。
```

### Result 得到什么代码或结果

AI 提供了 `src/controllers/questionItemController.js` 和 `src/routes/questionItemRoutes.js`，并更新 `src/app.js` 挂载 `/api/question-items`。接口支持创建可复用题目及 v1、查询本人题目列表、查看题目详情、创建递增新版本、查询完整版本历史以及从旧版本恢复生成新版本。

版本创建采用“先验证并保存新版本，再以 currentVersionId 和 latestVersionNumber 为条件更新 QuestionItem”的方式处理并发冲突。版本号唯一索引防止相同题目产生重复版本号；条件更新失败时删除未启用的新版本。初始逻辑题目保存失败时也会删除已创建的 v1，避免残留孤立版本。

路由没有提供历史版本的 PATCH 或 DELETE。`surveyId`、`order`、`required` 和 `jumpRules` 被定义为问卷实例专属字段，不能写入公共题目版本。恢复旧版本时复制该版本的题型、标题、选项和校验内容，生成新的递增版本，并分别记录 parentVersionId 和 restoredFromVersionId。

动态测试过程中，AI 最初提供的 PowerShell UTF-8 辅助函数将 `byte[]` 通过函数输出管道展开成 `System.Object[]`，请求体被发送为以空格分隔的数字字符串。测试还发现 Express 已将非法 JSON 标记为 400，但原全局错误处理统一返回了 500。AI 根据实际错误提供修正方案，学生改为直接声明强类型 `byte[]`，并更新 `app.js`，使 `entity.parse.failed` 返回明确的 400 和“请求体必须是有效的 JSON”。

### 是否修改

已修改。学生最初采用 AI 提供的可复用题目控制器、路由和应用挂载代码，随后根据真实动态测试完成两项修正：不再使用会展开数组的 PowerShell UTF-8 辅助函数，改为直接生成强类型 `System.Byte[]`；修改 `app.js` 的全局错误处理中间件，为非法 JSON 单独返回 400。历史版本不可变、恢复时创建新版本和旧问卷不自动升级是学生在编码前提出并采用的设计意见。

### 修改内容

- 新增 `src/controllers/questionItemController.js`，实现可复用题目创建、本人列表、详情、新版本、版本历史和历史恢复。
- 新增 `src/routes/questionItemRoutes.js`，挂载对应认证接口，但不提供历史版本原地修改或删除路由。
- 更新 `src/app.js`，挂载 `/api/question-items`，并为 JSON 解析失败增加 400 错误响应。
- 创建可复用题目时同时创建 QuestionItem 和 v1；任一步骤失败时清理未完成数据。
- 新版本继承未修改的内容，保留原 optionId，并将版本号递增、父版本指向修改前的当前版本。
- 恢复旧版本时生成新的版本记录，当前版本向前推进，旧版本内容和 ID 保持不变。
- 使用 QuestionItem 的 ownerId 进行所有权保护；未登录返回 401，其他用户访问或创建版本返回 404。
- 禁止将 surveyId、order、required 和 jumpRules 写入公共题目版本，保持题目内容与问卷配置分离。
- 使用版本唯一索引、条件更新和失败补偿处理并发冲突，不要求本地 MongoDB 配置副本集事务。
- 将测试请求体改为显式 `[byte[]]` UTF-8 编码，避免 PowerShell 将字节数组展开成数字字符串。
- 精确清理 AI-025 新建逻辑题目及三个版本、迁移题目的临时新版本和临时第二用户。

### 验证结果

- `questionItemController.js`、`questionItemRoutes.js` 和 `app.js` 均通过 Node.js 语法检查，应用模块加载成功。
- 问卷专属字段写入公共题目时返回 400；可复用题目成功创建 v1，并能从本人列表和详情接口读取。
- 创建 v2 后，parentVersionId 指向 v1、原 optionId 保持不变、QuestionItem.currentVersionId 指向 v2。
- 从 v1 恢复后生成 v3；v3 的父版本为 v2、restoredFromVersionId 为 v1、内容与 v1 一致、当前版本指向 v3。
- 恢复后历史版本总数为 3，v1 和 v2 的内容均未被修改。
- 对历史版本执行 PATCH 和 DELETE 均返回 404，非法请求后版本数量不变。
- 未登录访问返回 401；其他用户查看题目或创建版本均返回 404，所有权保护生效。
- 对迁移后的逻辑题目创建临时新版本后，QuestionItem.currentVersionId 发生变化，但旧问卷的 questionVersionId 和题目标题均保持原值，旧问卷没有自动升级。
- 修正 UTF-8 请求体后，请求体类型为 `System.Byte[]`，登录成功获得 Token；非法 JSON 返回 400，不再错误返回 500。
- 临时数据清理后，正式数据库恢复为 users 6、surveys 7、questions 12、responses 3、questionItems 12、questionVersions 12，AI-025 临时用户数量为 0。
- 完整 Jest 回归结果为 2 个测试套件、8 项测试全部通过，无失败和快照。
- 测试结束后 3101 端口未继续监听，`questionnaire_system_test` 集合列表为 `[]`。
- 本阶段没有执行 Git 提交或推送。

## AI-026 指定版本复用与题目使用情况查询

**日期：** 2026-10-28
**使用工具：** Codex、Windows PowerShell、Node.js、Express、Mongoose、MongoDB、mongosh、Jest、Supertest
**状态：** 已完成

### Prompt

```text
设计 Prompt：
我认为从可复用题目添加到问卷时，应明确保存实际采用的 questionVersionId，不能只保存或动态读取 QuestionItem.currentVersionId。后端应把该版本内容复制到 Question 快照，同时记录 questionItemId、questionVersionId、contentSource='library' 和 schemaVersion=2；required、order 和 jumpRules 继续由问卷实例单独管理。以后逻辑题目的当前版本变化时，已有问卷不能自动升级。

实现 Prompt：
请读取实际模型、控制器和路由，教我实现将本人可复用题目的指定版本添加到草稿问卷、保存内容快照、查询逻辑题目被本人哪些问卷和版本使用，并阻止未登录、越权、已发布或已关闭问卷复用。业务文件由我亲自修改，完成验证前不要更新日志或执行 Git 操作。

完成验证 Prompt：
我已经完成显式版本复用、快照、usage、权限和状态保护测试，精确清理临时数据并运行完整回归测试。请完成 AI-026 日志并开始下一阶段，不要执行 Git 提交或推送。
```

### Result 得到什么代码或结果

AI 提供了 `src/controllers/questionReuseController.js`，实现将本人可复用题目的明确版本复制到本人草稿问卷。请求必须同时包含 questionItemId 和 questionVersionId，后端验证逻辑题目所有权、有效状态、版本归属和问卷状态后，将版本中的题型、标题、选项和校验配置复制为新的 Question 快照，同时保存逻辑题目与版本引用。

AI 提供了 `src/controllers/questionUsageController.js`，查询同一道逻辑题目在本人问卷中的使用情况。结果包含使用次数、问卷数量、各版本使用次数、是否为当前版本，以及每个问卷实例的题目快照、问卷状态、题目顺序和必答设置，不读取 responses，也不返回填写者身份。

AI 更新了 `questionRoutes.js` 和 `questionItemRoutes.js`，分别增加指定版本复用接口和使用情况接口。现有第一阶段题目创建、编辑、删除和跳转接口继续保留。

### 是否修改

未修改 AI 提供的 AI-026 业务代码。学生提出并采用了“复用时明确记录 questionVersionId、复制内容快照、问卷不自动跟随 currentVersionId 更新”的设计意见，并亲自创建两个控制器、更新两个路由文件、执行全部动态测试和临时数据清理。

### 修改内容

- 新增 `src/controllers/questionReuseController.js`，实现 `POST /api/surveys/:surveyId/questions/from-library`。
- 复用请求只允许 questionItemId、questionVersionId 和 required，禁止覆盖题型、标题、选项、校验、顺序或跳转规则。
- 验证问卷属于当前用户且状态为 draft，验证逻辑题目属于当前用户且状态为 active，并验证指定版本属于该逻辑题目。
- 将指定版本的 type、title、options 和 validation 复制到 Question，保存 questionItemId、questionVersionId、contentSource 为 library、schemaVersion 为 2。
- required 作为问卷实例配置单独保存，order 根据问卷已有题目自动递增，jumpRules 初始化为空数组。
- 新增 `src/controllers/questionUsageController.js`，实现 `GET /api/question-items/:questionItemId/usage`。
- usage 只统计当前用户拥有的问卷，返回使用总数、去重问卷数、各版本使用数和分页后的问卷题目实例。
- 更新 `src/routes/questionRoutes.js`，挂载从可复用题目添加问卷的路由。
- 更新 `src/routes/questionItemRoutes.js`，挂载逻辑题目使用情况路由。
- 保留旧问卷和已存在 Question 的 questionVersionId，不根据 QuestionItem.currentVersionId 自动更新。
- 精确清理两份本人测试问卷、一个越权测试问卷、两个问卷题目快照、一个临时逻辑题目、两个版本和一个临时用户。

### 验证结果

- 两个新增控制器和两个更新后的路由均通过 Node.js 语法检查，应用模块加载成功。
- 创建逻辑题目 v1 和 v2 后，分别将历史版本 v1 与当前版本 v2 加入两份不同草稿问卷，两个请求均成功。
- 复用 v1 时 isCurrentVersion 为 false，复用 v2 时 isCurrentVersion 为 true，证明接口使用请求指定的版本而非动态读取当前版本。
- 两个 Question 快照分别保留 v1 和 v2 的标题、选项及版本引用；required 可分别设置，contentSource 均为 library、schemaVersion 均为 2、jumpRules 均为空。
- usage 查询得到 usageCount 2、surveyCount 2；v1 和 v2 各使用 1 次，并能正确区分当前版本。
- usage JSON 不包含 respondentId、答卷者 username 或 uniqueSubmissionKey。
- 复用请求试图传入 title 覆盖版本内容时返回 400，失败后问卷题目数量不变。
- 未登录访问复用和 usage 接口均返回 401。
- 其他用户不能把当前用户题目加入自己的问卷，不能向当前用户问卷添加题目，也不能查看当前用户题目 usage，三项均返回 404。
- 问卷发布后继续复用返回 409；问卷关闭后继续复用返回 409。
- 所有失败请求完成后 usageCount 仍为 2、surveyCount 仍为 2；v1 对应 published 问卷，v2 对应 closed 问卷。
- 临时数据清理后正式数据库恢复为 users 6、surveys 7、questions 12、responses 3、questionItems 12、questionVersions 12，AI-026 临时用户和临时问卷数量均为 0。
- 完整 Jest 回归结果为 2 个测试套件、8 项测试全部通过，无失败和快照。
- 测试结束后 3101 端口未继续监听，`questionnaire_system_test` 集合列表为 `[]`。
- 本阶段没有执行 Git 提交或推送。

## AI-027 题目共享、软撤销与接收者复用

**日期：** 2026-10-28
**使用工具：** Codex、Windows PowerShell、Node.js、Express、Mongoose、MongoDB、mongosh、Jest、Supertest
**状态：** 已完成

### Prompt

```text
设计 Prompt：
我认为撤销题目共享只能阻止接收者以后继续复用，不能删除或修改接收者已经加入问卷的 Question 快照；共享记录应软撤销，再次共享时重新激活原记录，不能创建重复关系。接收者只有 use 权限，可以查看共享题目及版本并添加到自己的草稿问卷，但不能创建版本、恢复历史、归档、撤销共享或转发给其他用户。

时间语义改进 Prompt：
我提出共享记录保留首次创建时间 createdAt，而 sharedAt 表示最近一次激活时间；重复共享 active 记录时不更新时间，只有 revoked 重新激活时才更新 sharedAt。请检查这个语义是否合理。

代码检查 Prompt：
我已经创建 questionShareController.js，并更新 questionReuseController.js 和 questionItemRoutes.js。当前 AI-027 代码未修改，请检查不能共享给自己、唯一共享关系、软撤销、重新激活、接收者只有 use 权限、共享版本查看、撤销后禁止新复用以及已有问卷快照不受影响，并继续教我动态测试。

完成验证 Prompt：
我已经完成共享与权限、接收者复用、软撤销、已有快照保留、重新激活和时间语义测试，并精确清理临时数据、完成 Jest 回归。请更新 AI-027 日志，不要执行 Git 提交或推送。
```

### Result 得到什么代码或结果

AI 提供了 `src/controllers/questionShareController.js`，实现题目所有者按用户名共享、查看本人发出的共享、软撤销共享、接收者查看收到的有效共享和查看共享题目的版本。共享关系以 questionItemId 与 sharedWithUserId 的唯一组合保存，避免同一道题向同一用户创建重复记录。

AI 更新了 `src/controllers/questionReuseController.js`，使题目所有者或持有 active、use 共享权限的接收者能够把明确指定的历史版本或当前版本加入本人草稿问卷。复用时仍然复制版本内容并保存 questionItemId、questionVersionId 和 Question 快照，不动态依赖 QuestionItem.currentVersionId。

AI 更新了 `src/routes/questionItemRoutes.js`，增加发出共享、收到共享、共享版本、软撤销和接收者复用所需路由，并把固定的 received-shares 路由放在动态 `/:questionItemId` 路由之前。

共享生命周期测试证明：首次共享创建一条 active 记录；重复共享 active 记录返回 alreadyActive 且不更新时间；软撤销把原记录改为 revoked；重复撤销保持幂等；重新共享时激活同一记录而不创建重复关系。撤销后接收者不能再查看共享版本或新复用题目，但撤销前已经加入问卷的 Question 快照、题目标题和 questionVersionId 均保持不变。

### 是否修改

未修改 AI 提供的 AI-027 业务代码。学生亲自创建和更新对应文件，并提出共享生命周期与时间语义设计：撤销只影响未来复用、已有问卷快照不回收；接收者只具有 use 权限；createdAt 永久表示首次创建时间，sharedAt 表示最近一次激活时间，active 状态重复共享不更新时间，revoked 状态重新激活时才更新 sharedAt。实际代码检查确认已符合该意见，因此没有额外修改业务代码。

### 修改内容

- 新增 `src/controllers/questionShareController.js`，实现按用户名共享、本人发出共享列表、软撤销、收到共享列表和共享版本查询。
- 更新 `src/controllers/questionReuseController.js`，允许 active、use 权限的共享接收者将指定版本加入本人草稿问卷。
- 更新 `src/routes/questionItemRoutes.js`，挂载共享和接收者复用相关认证路由，并保证固定路由与动态参数路由顺序正确。
- 禁止向自己共享题目，目标用户不存在时拒绝共享，并且只有逻辑题目所有者可以建立或撤销共享。
- 通过唯一共享关系复用原 QuestionShare；首次共享创建记录，软撤销保留记录，重新共享激活原记录。
- 保留 createdAt 作为首次创建时间；首次共享设置 sharedAt，active 重复共享不修改 sharedAt 和 updatedAt，revoked 重新激活时更新 sharedAt 并清除 revokedAt。
- 接收者只拥有 use 权限，可以查看有效共享及其版本并复用到自己的草稿问卷，不能创建新版本、恢复历史版本、转发或撤销共享。
- 共享复用继续要求显式 questionVersionId，并生成独立 Question 内容快照；required、order 和 jumpRules 仍属于问卷实例。
- 撤销共享后禁止接收者继续查看共享版本和创建新的复用快照，但不删除或修改撤销前已经写入问卷的快照。
- 精确清理 AI-027 临时共享记录、接收者问卷及两个快照、逻辑题目及两个版本和临时接收者账号。

### 验证结果

- `questionShareController.js`、`questionReuseController.js` 和 `questionItemRoutes.js` 均通过 Node.js 语法检查，应用模块加载成功。
- 向自己共享返回 400；首次按用户名共享成功，生成 active、use 共享记录。
- 对 active 共享再次执行共享操作返回 alreadyActive，共享记录 ID、createdAt、sharedAt 和 updatedAt 均保持不变，没有产生重复关系。
- 所有者发出共享列表与接收者收到共享列表均能读取同一条记录；接收者可以查看 v1、v2 历史版本，结果不包含 passwordHash、令牌或其他敏感认证信息。
- 接收者不能创建版本、恢复历史、转发共享或撤销共享，相关越权请求均被拒绝。
- 接收者成功把共享题目的明确 v1 加入本人草稿问卷，返回的 accessType、shareId 和 questionVersionId 均正确。
- 所有者软撤销后，共享记录 ID 与 createdAt 保持不变，status 变为 revoked、revokedAt 被设置；重复撤销返回 alreadyRevoked，时间和记录数量不变。
- 撤销后共享从接收者有效列表消失，共享版本与新复用请求均返回 404；此前加入问卷的 v1 快照、标题和版本引用仍然存在且未改变。
- 重新共享返回 reactivated，继续使用原 shareId，createdAt 保持首次创建时间，sharedAt 更新为最近激活时间，revokedAt 被清除，记录状态恢复为 active。
- 重新激活后接收者可以继续把明确 v2 加入问卷，最终同一问卷同时保存 v1 和 v2 两份独立内容快照。
- 保护测试和共享生命周期测试完成后，临时数据已精确清理；只读诊断确认目标用户、问卷、题目、版本和共享记录均不存在。
- 正式数据库恢复为 users 6、surveys 7、questions 12、responses 3、questionItems 12、questionVersions 12、questionShares 0。
- 完整 Jest 回归结果为 2 个测试套件、8 项测试全部通过，无失败和快照。
- 测试结束后 3101 端口未继续监听，`questionnaire_system_test` 集合列表为 `[]`。
- 本阶段没有执行 Git 提交或推送。

## AI-028 本人题目库与指定版本入卷

**日期：** 2026-10-29
**使用工具：** Codex、Windows PowerShell、Node.js、Express、Mongoose、MongoDB、mongosh、Jest、Supertest
**状态：** 已完成

### Prompt

```text
功能范围 Prompt：
采用精简方案实现最低必要的题目库功能：本人题目库创建、列表、详情、修改名称和说明、加入题目、移除题目、设置推荐版本，以及从题目库把指定版本加入本人草稿问卷。不实现题目库共享、标签、搜索、公开市场或复杂归档。完成整个题目库功能后再统一测试和记录日志。

个人设计意见 Prompt：
我认为题目库只保存 questionItemId 和 preferredVersionId 引用，不复制题目正文；修改题目库推荐版本只影响以后选题时的建议，不修改已经加入问卷的 Question 快照；从题目库移除题目也不能删除逻辑题目、历史版本或已有问卷数据。

代码检查 Prompt：
我已经创建 questionBankController.js、questionBankRoutes.js，并更新 app.js。当前 AI-028 代码未修改，请检查题目库所有权、重复名称、重复加题、推荐版本归属、显式版本入卷、草稿状态限制和引用式存储，并一次性教我完成动态测试。

问题修复 Prompt：
动态测试创建第二个新逻辑题目时出现“数据唯一性冲突”。请检查实际模型和数据库索引，定位原因并教我修复，完成全部测试后再统一清理和回归。

完成验证 Prompt：
我已经完成 AI-028 动态测试、精确清理临时数据并只运行一次完整 Jest 回归。请更新 AI-028 日志，如实记录最小题目库功能、引用式存储设计意见、动态测试发现并修复的问题、清理和回归结果，不执行 Git 操作。
```

### Result 得到什么代码或结果

AI 提供了 `src/controllers/questionBankController.js`，实现本人题目库创建、列表、详情、名称和说明修改、加入题目、移除题目、设置推荐版本，以及把题目库中逻辑题目的明确版本加入本人草稿问卷。

AI 提供了 `src/routes/questionBankRoutes.js` 并更新 `src/app.js`，将全部题目库接口放在 JWT 认证和所有权保护下。题目库只管理当前用户拥有的逻辑题目，不扩展题目库共享、标签、搜索、公开市场或复杂归档功能。

从题目库加入问卷时继续复用 AI-026 的显式版本机制：请求指定 questionItemId、questionVersionId 和目标 surveyId，后端验证逻辑题目、版本、题目库和问卷所有权以及草稿状态，然后复制版本内容形成 Question 快照。题目库的 preferredVersionId 仅作为推荐值，不替代请求中明确选择的版本。

动态测试发现 `QuestionItem.legacyQuestionId` 同时配置 `default: null` 和 sparse 唯一索引。MongoDB 会把显式 BSON null 作为索引值，导致创建第二个新逻辑题目时发生唯一性冲突。AI 根据实际错误定位到该模型兼容问题，并建议取消默认 null、仅让迁移旧题目保存 legacyQuestionId，同时清理数据库中已有的显式 null 字段。

### 是否修改

有修改。最初未修改 AI 提供的 AI-028 题目库控制器、路由和应用挂载代码；动态测试发现模型缺陷后，学生亲自删除 `QuestionItem.js` 中 `legacyQuestionId` 的 `default: null`，并使用 `$unset` 清理数据库中 BSON 类型为 null 的 legacyQuestionId。其余 AI-028 业务代码未修改。

学生提出并采用了引用式题目库设计：题目库只保存逻辑题目和推荐版本引用，不复制题目正文；推荐版本变化不追溯修改已有问卷快照；从题目库移除题目不删除逻辑题目、历史版本或已有问卷数据。

### 修改内容

- 新增 `src/controllers/questionBankController.js`，实现题目库创建、本人列表、详情、名称和说明修改、加入题目、移除题目、推荐版本设置及指定版本入卷。
- 新增 `src/routes/questionBankRoutes.js`，为题目库接口统一配置 JWT 认证。
- 更新 `src/app.js`，挂载 `/api/question-banks` 路由。
- 题目库的 `items` 只保存 questionItemId、preferredVersionId、order 和 addedAt，不复制题型、标题、选项或 validation 正文。
- 创建和查询题目库时只允许访问当前用户的题目库；加入题目时验证逻辑题目属于当前用户且状态有效。
- 同一用户的题目库名称保持唯一；同一道逻辑题目不能重复加入同一题目库。
- preferredVersionId 必须属于对应 questionItemId；修改推荐版本不更新已存在的 Question 快照。
- 从题目库加入问卷时要求明确选择版本，并继续保存 questionItemId、questionVersionId、contentSource 为 library、schemaVersion 为 2 以及独立内容快照。
- 只允许向本人 draft 问卷加入题目；未登录、他人题目、他人题目库、他人问卷以及 published 或 closed 问卷均被拒绝。
- 从题目库移除条目只删除题目库内的引用，不删除 QuestionItem、QuestionVersion 或已有 Question 快照。
- 修改 `src/models/QuestionItem.js`，移除 legacyQuestionId 的 `default: null`，使未迁移的新逻辑题目真正缺少该字段，从而与 sparse 唯一索引语义一致。
- 使用 `$unset` 清理一个显式 null 的 legacyQuestionId；验证显式 null 数量为 0，后续成功创建不同用户的新逻辑题目。
- 精确清理 AI-028 临时题目库、问卷及快照、两个逻辑题目、三个版本和临时用户；未扩大删除范围。

### 验证结果

- `questionBankController.js`、`questionBankRoutes.js` 和更新后的 `app.js` 均通过 Node.js 语法检查，应用模块加载成功。
- 所有者登录成功；未登录访问题目库接口返回 401。
- 题目库创建、本人列表、详情和名称说明修改成功；同一用户重复名称被唯一性保护拒绝。
- 本人逻辑题目可以加入题目库；重复加入被拒绝；其他用户的逻辑题目不能加入本人题目库。
- 推荐版本可以从 v1 调整为 v2，且必须属于对应逻辑题目。
- 从题目库向本人草稿问卷加入明确的 v1 和 v2 均成功，两份 Question 分别保存对应版本 ID 和内容快照，历史版本与当前版本能够共存。
- 修改 preferredVersionId 后，已经加入问卷的 v1 快照标题、内容和 questionVersionId 保持不变。
- MongoDB 原始题目库文档只保存 questionItemId 和 preferredVersionId 等引用字段，没有复制题目正文。
- 未登录、不同用户越权、非法内容覆盖以及向 published 或 closed 问卷复用均被拒绝，失败操作没有产生额外题目快照。
- 从题目库移除题目后，逻辑题目、v1 和 v2 历史版本以及已经加入问卷的两个快照均继续存在。
- 动态测试首次创建其他用户逻辑题目时发现 sparse 唯一索引与 `default: null` 冲突；修复后显式 null 数量为 0，第二个新逻辑题目创建成功，后续全部动态测试通过。
- 临时数据精确清理后，正式数据库恢复为 users 6、surveys 7、questions 12、responses 3、questionItems 12、questionVersions 12、questionBanks 0、questionShares 0，AI-028 临时用户为 0。
- 完整 Jest 回归只运行一次，结果为 2 个测试套件、8 项测试全部通过，无失败和快照。
- 测试结束后 3101 端口未继续监听，`questionnaire_system_test` 集合列表为 `[]`。
- 本阶段没有执行 Git 提交或推送。

## AI-029 单题跨问卷与跨版本统计

**日期：** 2026-10-29
**使用工具：** Codex、Windows PowerShell、Node.js、Express、Mongoose、MongoDB 聚合、Supertest、Jest
**状态：** 已完成

### Prompt

```text
设计 Prompt：
我认为跨问卷统计必须先按当前用户拥有的问卷过滤，不能因为题目被共享，就让题目所有者查看其他用户问卷的答卷；被共享用户也只能统计自己问卷中的数据。

跨版本统计不应把不同版本的答案直接强行合并。接口可以提供逻辑题目的整体数量汇总，但四种题型的具体结果应按 questionVersionId 分组；选择题在同一版本内按稳定 optionId 统计，不能只按选项文字合并。接口还应支持通过 questionVersionId 查询具体版本。

notAnsweredCount 不应简单使用去重答卷数减回答数。同一逻辑题目可能以不同版本或多个实例出现在问卷中，因此应计算 answerOpportunityCount，即各题目实例对应问卷答卷数之和，再使用 answerOpportunityCount - totalAnswers。responseCount 单独表示纳入统计的去重答卷总数。

实现 Prompt：
请读取实际统计控制器、题目、版本、问卷、答卷、认证和路由代码，实现 GET /api/question-items/:questionItemId/cross-survey-statistics。只实现本人问卷范围、版本筛选、四种题型分版本统计、权限和敏感字段保护，不实现缓存、导出、图表或跨用户统计。

完成验证 Prompt：
我已经完成一次性动态测试、精确清理临时数据并只运行一次完整 Jest 回归。请更新 AI-029 日志，记录权限边界、版本分组、answerOpportunityCount、MongoDB 聚合、四种题型、版本筛选、跨用户隔离和敏感字段保护，不执行 Git 操作。
```

### Result 得到什么代码或结果

AI 提供了 `src/controllers/crossSurveyStatisticsController.js`，实现基于稳定 questionItemId 的单题跨问卷统计。控制器先筛选当前登录用户拥有的问卷，再查找这些问卷中的 Question 实例，使用 MongoDB 聚合统计各问卷答卷数量并按 answers.questionVersionId 收集答案。

AI 更新了 `src/routes/questionItemRoutes.js`，新增经过 JWT 认证的 `GET /api/question-items/:questionItemId/cross-survey-statistics` 路由，并保留已有题目、版本、共享和 usage 路由。

接口同时返回 surveyCount、questionInstanceCount、responseCount、answerOpportunityCount、totalAnswers、notAnsweredCount 和 versionCount；具体题型结果按版本独立返回。单选和多选在版本内部按 optionId 计数，文本题返回回答列表，数字题返回数量、平均值、最小值和最大值。

### 是否修改

未修改 AI 提供的 AI-029 业务代码。学生亲自创建控制器、更新路由、执行一次性动态测试、精确清理临时数据并完成一次完整回归测试。

学生提出并采用了三项设计意见：统计权限以当前用户拥有的问卷为边界；不同版本不强制合并题型结果；使用 answerOpportunityCount 而不是去重 responseCount 计算未回答数量。

### 修改内容

- 新增 `src/controllers/crossSurveyStatisticsController.js`。
- 更新 `src/routes/questionItemRoutes.js`，挂载跨问卷统计认证路由。
- 先按 Survey.ownerId 筛选当前用户问卷，再查询这些问卷中引用目标 questionItemId 的题目实例。
- 题目所有者不会因为共享关系自动获得接收者问卷的答卷数据；共享接收者也只能读取自己问卷中的统计。
- 支持可选 questionVersionId 参数，并验证版本必须属于目标逻辑题目；非所有者只能筛选本人问卷实际使用的版本。
- 使用 Response.aggregate 按 surveyId统计答卷数量，并展开 answers 后按 questionVersionId 收集目标题目答案。
- responseCount 表示纳入范围内的去重答卷数量；answerOpportunityCount 按每个 Question 实例所在问卷的答卷数累加。
- notAnsweredCount 使用 `answerOpportunityCount - totalAnswers` 计算，能够处理同一逻辑题目在同一问卷出现多个实例的情况。
- 不同版本始终分别返回版本号、题型、标题、问卷数、实例数、答卷数、回答机会数、回答数和未回答数，不按标题或选项文字强行合并。
- 单选和多选仅在相同版本内按稳定 optionId 统计；文本和数字统计也分别绑定具体版本。
- 响应只返回统计和问卷范围信息，不读取或返回 respondentId、答卷者 username、uniqueSubmissionKey、passwordHash 或令牌。
- 精确清理 3 个临时用户、4 个逻辑题目、5 个版本、4 份问卷、11 个题目快照、5 份答卷和 1 条共享记录。

### 验证结果

- 新控制器和更新后的路由通过 Node.js 语法检查，Express 应用模块加载成功。
- 未登录访问返回 401；题目所有者读取跨问卷统计成功；无题目使用关系的用户返回 404。
- 所有者统计只包含本人 3 份问卷，明确排除接收者问卷；接收者统计只包含自己的 1 份问卷，不能读取所有者的 3 份问卷。
- 同一逻辑题目在本人问卷中包含 4 个实例和 4 份去重答卷，统计得到 answerOpportunityCount 6、totalAnswers 5、notAnsweredCount 1，证明多个实例没有被 responseCount 错误折叠。
- v1 在 2 份问卷的 3 个实例中统计，responseCount 3、answerOpportunityCount 5、totalAnswers 4、notAnsweredCount 1；v2 独立统计为 1 份问卷、1 个实例和 1 个回答。
- v1 单选选项 yes 为 3、no 为 1；v2 的 often 为 1、rarely 为 0，两个版本的不同选项没有按文字或位置强行合并。
- 使用 questionVersionId 筛选 v1 后，只返回 v1 及对应的 2 份问卷、3 个实例、3 份答卷、5 次回答机会和 4 个实际回答。
- 多选题跨两份问卷统计得到 3 个回答，m1 和 m2 各被选择 2 次。
- 文本题回答机会为 3、实际回答为 2、未回答为 1，并返回两条文本回答。
- 数字题返回 3 个回答，平均值 20、最小值 10、最大值 30。
- 非法 questionVersionId 返回 400；属于其他逻辑题目的版本返回 404。
- 对统计结果进行字符串检查，未发现 respondentId、username、uniqueSubmissionKey 或 passwordHash。
- 临时数据精确清理后，正式数据库恢复为 users 6、surveys 7、questions 12、responses 3、questionItems 12、questionVersions 12、questionShares 0、questionBanks 0，AI-029 临时用户为 0。
- 完整 Jest 回归只运行一次，结果为 2 个测试套件、8 项测试全部通过，无失败和快照。
- 测试结束后 3101 端口未继续监听，`questionnaire_system_test` 集合列表为 `[]`。
- 本阶段没有执行 Git 提交或推送。

## AI-030 第二阶段前端整合

**日期：** 2026-10-29
**使用工具：** Codex、HTML、CSS、JavaScript、浏览器及开发者工具、应用内浏览器自动化、Windows PowerShell、MongoDB、mongosh、Jest、Supertest
**状态：** 已完成

### Prompt

```text
设计 Prompt：
我认为第二阶段功能应集中在一个“题目资源管理”页面中，使用简单标签区域切换，不推倒重写第一阶段已有页面。页面复用现有 JWT 和 api.js，只提供课程验收需要的操作，不实现拖拽、图表库、复杂搜索、分页组件或高级视觉效果。

功能 Prompt：
实现本人可复用题目创建、列表和详情；版本历史、新版本和恢复；使用情况；按用户名共享、发出共享和软撤销；接收共享、查看版本并加入本人草稿问卷；本人题目库管理和指定版本入卷；跨问卷统计和版本筛选；未登录时提示登录，并且不显示敏感身份字段。

验收 Prompt：
我已经完成 AI-030 第一组验收，请继续完成共享、题目库和跨问卷统计验收。全部功能完成后统一清理临时数据，只运行一次完整 Jest 回归，验证完成前不要更新日志或执行 Git 操作。

完成 Prompt：
请在全部前端验收、临时数据精确清理和 Jest 回归通过后更新 AI-030 日志，如实记录 AI 提供的前端文件、我的最小页面设计意见、动态验证和最终清理结果。
```

### Result 得到什么代码或结果

AI 提供了 `public/resources.html`，建立独立的“题目资源管理”页面，并使用四个标签区域组织本人题目、共享题目、题目库和跨问卷统计功能。页面保留返回第一阶段问卷首页的入口，没有重写原有首页、公开填写页或统计页。

AI 提供了 `public/css/resources.css`，实现第二阶段资源页所需的基础布局、标签切换、表单、结果区和状态提示样式，没有引入 UI 框架、图表库或高级视觉效果。

AI 提供了 `public/js/resources.js`，复用现有 `public/js/api.js` 的 JWT 请求机制，连接 AI-025 至 AI-029 已实现的后端接口。脚本支持可复用题目及版本、使用情况、共享生命周期、共享版本入卷、题目库操作、指定版本入卷、跨问卷统计和版本筛选，并对输出结果进行敏感字段过滤。

### 是否修改

未修改 AI 提供的 AI-030 前端代码。学生亲自把 `resources.html`、`resources.css` 和 `resources.js` 复制到项目对应目录，完成语法检查、分组动态验收、临时数据清理和完整回归测试。

学生提出并采用了最小前端整合设计：第二阶段集中使用一个资源管理页面和简单标签切换；复用第一阶段 JWT 与 `api.js`；只实现课程验收必要操作，不增加拖拽、复杂搜索、分页组件、图表库、公开市场或高级视觉效果。

### 修改内容

- 新增 `public/resources.html`，提供本人题目、共享题目、题目库和跨问卷统计四个功能区。
- 新增 `public/css/resources.css`，提供资源页面独立样式，不影响第一阶段原页面。
- 新增 `public/js/resources.js`，调用已有认证、题目版本、使用情况、共享、题目库、复用和跨问卷统计接口。
- 未登录访问资源页时只显示登录提示；登录后显示当前用户及功能区域。
- 本人题目区域支持创建题目、查看列表和详情、查看版本、创建递增版本、恢复历史版本、查看使用情况，以及把明确版本加入本人草稿问卷。
- 共享区域支持按用户名共享、查看发出记录、软撤销、查看收到共享及全部版本，以及把明确版本加入接收者自己的草稿问卷。
- 题目库区域支持创建、列表、名称说明修改、加入题目、移除题目、推荐版本设置和指定版本入卷。
- 跨问卷统计区域支持全部版本统计和指定 questionVersionId 筛选，并显示问卷数、题目实例数、去重答卷数、回答机会数、实际回答数和未回答数。
- 结果展示过滤 `passwordHash`、`token`、`respondentId` 和 `uniqueSubmissionKey` 等敏感字段。
- 第二阶段前端没有修改第一阶段已有 `index.html`、`styles.css`、认证页面、问卷页面或统计页面。

### 验证结果

- `resources.js` 通过 Node.js 语法检查；`resources.html` 的 CSS、`api.js` 和 `resources.js` 引用正确，Express 应用模块加载成功。
- 未登录访问 `/resources.html` 时显示“需要登录”，不会展示题目资源数据；使用第一阶段账号登录后可以恢复资源页登录状态。
- 本人题目组验证通过：创建单选可复用题目 v1，创建保留稳定 optionId 的 v2，恢复 v1 内容生成 v3；历史 v1 和 v2 保持不变，currentVersionId 指向 v3。
- 使用情况和显式版本入卷验证通过；同一逻辑题目的 v1、v3 可以同时形成独立 Question 快照，版本变化不会自动升级已有问卷。
- 共享组验证通过：所有者按用户名共享后，接收者看到同一逻辑题目的 v1、v2、v3，权限为 use；接收者成功把明确 v2 作为必答题加入自己的草稿问卷。
- 所有者软撤销后，接收者收到共享数量变为 0，不能继续从共享入口新复用；接收者问卷中的 v2 标题、必答状态和版本快照继续存在。
- 再次共享后原共享记录 ID `6ae2fe67f365197e10925b3d` 重新变为 active，接收者再次看到三个版本，证明软撤销和重新激活的前端流程有效。
- 题目库组验证通过：创建并修改题目库名称和说明，加入逻辑题目，将推荐版本从 v3 改为 v2，并从题目库把明确 v1 加入本人草稿问卷。
- 从题目库移除条目后 itemCount 变为 0；源逻辑题目和三个历史版本仍可读取，已有问卷快照和跨问卷统计不受影响。
- 跨问卷统计组验证通过：全部版本统计只包含当前用户 1 份问卷和 4 个题目实例；v1 筛选只返回 2 个 v1 实例；刷新全部数据后仍能重新读取统计。
- 当前临时问卷没有答卷，因此 responseCount、answerOpportunityCount、totalAnswers 和 notAnsweredCount 均为 0；字段含义和版本分组展示正确。
- 页面统计和结果输出未出现 `respondentId`、`uniqueSubmissionKey` 等敏感字段；浏览器控制台 error 日志为空。
- 清理前执行只读对象关系检查，确认 2 份临时问卷、6 个临时题目快照、1 个逻辑题目、3 个版本、1 个题目库、1 个共享和 1 个临时接收用户关系唯一，并且没有答卷、其他问卷引用、其他共享或题目库引用。
- 精确清理后全部 AI-030 目标对象数量为 0；正式数据库恢复为 users 6、surveys 7、questions 12、responses 3、questionItems 12、questionVersions 12、questionShares 0、questionBanks 0。
- 完整 Jest 回归只运行一次，结果为 2 个测试套件、8 项测试全部通过，无失败和快照。
- 测试结束后 3101 端口未继续监听，`questionnaire_system_test` 集合列表为 `[]`。
- 本阶段没有执行 Git 提交或推送。

## AI-031 第二阶段自动化 API 测试与答案版本快照修复

**日期：** 2026-10-29
**使用工具：** Codex、Node.js、Express、Jest、Supertest、MongoDB、Mongoose、Windows PowerShell、mongosh
**状态：** 已完成

### Prompt

```text
测试设计 Prompt：
请为第二阶段新增功能编写最小但完整的自动化 API 测试，覆盖可复用题目版本、恢复生成新版本、指定版本入卷、共享与软撤销、题目库、使用情况和跨问卷统计。继续使用独立测试数据库，测试后必须清理端口和数据库。先读取现有 Jest 架构并设计测试范围，不修改业务代码；测试文件由我亲自创建，完成全部验证后再统一更新日志，不执行 Git 提交或推送。

测试实现 Prompt：
根据现有 globalSetup、globalTeardown、testServer 和第一阶段测试风格，提供完整的 tests/stage2-resources.test.js。新增测试应覆盖版本递增和不可变恢复、明确版本引用与题目快照、共享撤销和重新激活、题目库引用式存储、跨问卷按版本统计、认证和所有权保护。

问题修复 Prompt：
新增 6 项测试中有 5 项通过，但跨问卷统计的 answerOpportunityCount 正确而 totalAnswers 预期为 2、实际为 0。请根据真实数据链路定位原因，不要通过修改测试期望掩盖问题，并教我完成兼容第一阶段普通题目的最小修复。

完成 Prompt：
第二阶段新增测试、完整 Jest 回归、3101 端口清理、测试数据库清理和测试进程检查均已通过。请如实记录最初失败、实际原因、我的代码修改和最终验证结果，不执行 Git 操作。
```

### Result 得到什么代码或结果

AI 读取并分析了现有 Jest 架构，确认测试由 `tests/globalSetup.js` 启动独立服务器，`tests/testServer.js` 固定使用 3101 端口和 `questionnaire_system_test` 数据库，`tests/globalTeardown.js` 负责关闭服务器并删除测试数据库；现有第一阶段测试无需改动。

AI 提供了完整的 `tests/stage2-resources.test.js`，新增 6 项第二阶段 API 测试，覆盖可复用题目版本与恢复、指定版本入卷与 usage、共享及软撤销、题目库、跨问卷统计，以及认证、所有权和问卷状态保护。

第一次单独执行新增测试时，版本、入卷、共享、题目库和权限保护 5 项通过，跨问卷统计测试失败：统计可以正确得到 2 份问卷、3 个题目实例、2 份答卷和 3 次回答机会，但 `totalAnswers` 预期为 2、实际为 0。

AI 沿 `Question` 快照、`buildSubmission`、`Response.answers` 和跨问卷 MongoDB 聚合链路定位到真实原因：第二阶段 Question 已保存 `questionItemId` 和 `questionVersionId`，Response 模型及迁移脚本也支持这两个字段，但新答卷提交时没有把它们复制到答案快照；跨问卷统计按这两个字段匹配答案，因此无法把新答案归入具体逻辑题目和版本。

### 是否修改

学生最初未修改 AI 提供的 `tests/stage2-resources.test.js`，亲自创建文件并执行语法检查和新增测试。

自动化测试发现真实集成问题后，学生修改了 `src/services/responseValidationService.js` 和 `src/controllers/responseController.js`。测试断言没有降低或改成错误的 0，跨问卷统计控制器也没有通过特殊测试分支绕过问题。

学生提出并采用了兼容设计：新答案必须从实际 Question 快照复制 `questionItemId` 和 `questionVersionId`；只有问卷中的全部题目都是第二阶段版本化题目时，才将新 Response 标记为 `schemaVersion: 2`。混合使用第一阶段普通题目和第二阶段复用题目时保持 `schemaVersion: 1`，但复用题目的答案仍保存版本引用，保证统计可用并避免破坏第一阶段数据。

### 修改内容

- 新增 `tests/stage2-resources.test.js`，使用 Supertest 调用运行在 3101 端口的真实 Express 测试服务器。
- 可复用题目测试验证 v1、v2 和恢复生成的 v3 同时存在；v2 的 parentVersionId 指向 v1，v3 的 parentVersionId 指向 v2、restoredFromVersionId 指向 v1，历史版本内容不被覆盖。
- 指定版本入卷测试验证 Question 保存 `questionItemId`、实际采用的 `questionVersionId`、`contentSource: library`、`schemaVersion: 2` 及内容快照，逻辑题目后来产生新版本时已有问卷快照不自动升级。
- usage 测试验证同一逻辑题目的不同版本可以在问卷中共存，并正确返回 usageCount、surveyCount 和各版本使用数量。
- 共享测试验证唯一共享关系、接收者 use 权限、明确版本复用、软撤销后阻止新复用、已有问卷快照保留，以及重新激活时继续使用原 shareId。
- 题目库测试验证创建、列表、修改、加入题目、拒绝重复加入、推荐版本修改、明确历史版本入卷和移除条目；移除后逻辑题目、历史版本和已有问卷快照继续存在。
- 跨问卷统计测试验证只统计当前用户拥有的问卷，按 v1、v2 分组，返回 surveyCount、questionInstanceCount、responseCount、answerOpportunityCount、totalAnswers 和 notAnsweredCount，并支持 questionVersionId 筛选和跨用户数据隔离。
- 权限和状态测试验证未登录返回 401、不同用户越权返回 404，以及已发布或已关闭问卷不能继续复用题目。
- 在 `src/services/responseValidationService.js` 的答案快照中增加 `questionItemId` 和 `questionVersionId`，来源为实际填写的 Question 快照。
- 在 `src/controllers/responseController.js` 中判断问卷是否全部采用版本化题目；全部版本化时写入 `schemaVersion: 2`，混合或第一阶段题目保持 `schemaVersion: 1`。
- 测试数据全部使用运行时生成的唯一用户名、逻辑题目、问卷、共享和题目库，不依赖正式数据库中的现有账号或业务数据。

### 验证结果

- `tests/stage2-resources.test.js`、`responseValidationService.js` 和 `responseController.js` 均通过 Node.js 语法检查，Express 应用模块加载成功。
- 第一次单独执行 AI-031 测试时，6 项中 5 项通过；唯一失败准确复现新答卷缺少逻辑题目和版本引用的问题，错误为 `totalAnswers` 预期 2、实际 0。
- 修复后重新单独运行 AI-031，6 项第二阶段测试全部通过，跨问卷统计能够把新提交答案归入正确的 questionItemId 和 questionVersionId。
- 版本历史测试通过：创建新版本递增，恢复历史版本生成新版本，原有版本保持不可变。
- 指定版本入卷、内容快照、usage、共享软撤销、重新激活、题目库引用、推荐版本和已有快照保护均通过。
- 跨问卷统计得到 2 份本人问卷、3 个题目实例、2 份答卷、3 次回答机会、2 个实际回答和 1 个未回答；v1、v2 分组、版本筛选及接收者问卷隔离通过。
- 统计响应未包含 respondentId、答卷者 username 或 uniqueSubmissionKey。
- 完整 Jest 回归结果为 3 个测试套件、14 项测试全部通过，无失败和快照。
- 测试结束后 3101 端口未继续监听，`questionnaire_system_test` 集合列表为 `[]`，没有遗留 `tests/testServer.js` 测试服务器进程。
- 正式数据库没有被测试清理逻辑访问或删除。
- 本阶段没有执行 Git 提交或推送。

## AI-032 第二阶段收尾验收与提交文档补齐

**日期：** 2026-10-29
**使用工具：** Codex、Windows PowerShell、Node.js、MongoDB、mongosh、Jest、Supertest、Git 只读检查
**状态：** 已完成

### Prompt

```text
验收 Prompt：
请重新读取第一阶段作业文档、第二阶段需求变更文档、第二阶段需求基线、数据库设计、当前业务代码、前端、测试和 AI 使用日志，逐项对照第二阶段八项要求。先只输出已完成、缺失、需要补充的文档、提交风险和是否存在超出要求的冗余功能，不修改业务代码，不执行 Git 操作。

收尾 Prompt：
第二阶段八项主要功能已经完成。请按提交优先级一个一个补齐文档，不再增加非必要业务功能；文档需要准确反映实际代码、数据迁移、测试和 AI 使用情况。

报告精简 Prompt：
根据老师的提交截图，第二阶段只需要在第一阶段 GitHub 仓库上传修改后的代码，并提交项目完成报告 PDF。报告最前面放仓库链接，文件名为 2026_ECNU_PJ1_2_白淑静.pdf。请删除与作业要求无关的冗余内容，只保留项目目标、第二阶段需求、系统和数据库设计、关键实现、迁移、测试、问题解决、AI 使用和总结。

最终检查 Prompt：
检查第二阶段文档是否齐全，运行最终完整 Jest 测试，检查测试端口和数据库清理情况，并确认 .env、node_modules、备份和临时文件没有进入 Git 候选文件。通过后更新 AI-032，不记录 Git 提交和上传过程。
```

### Result 得到什么代码或结果

AI 对照两份作业文档和第二阶段八项需求完成收尾验收，确认题目保存与复用、共享、旧问卷保护、历史版本恢复、多版本共存、使用情况、题目库和跨问卷统计均已实现。第一阶段用户、问卷、题目、答卷、匿名、跳转、统计和测试功能继续保留。

AI 发现业务功能已经基本完成，当前主要缺口是第二阶段提交文档没有完整反映新增模型、接口、迁移、测试和 AI 使用过程，因此建议停止增加非必要功能，优先补齐文档和执行最终提交检查。

AI 提供了更新后的 `README.md`，以及完整的 `docs/API说明.md`、`docs/关键逻辑说明.md`、`docs/测试用例与结果.md`、`docs/数据迁移说明.md`、`docs/AI使用说明.md` 和 `docs/第二阶段项目完成报告.md` 内容。

根据老师提交截图，AI 将最初较长的第二阶段报告精简为只包含课程要求所需内容的版本，并确认报告最前面包含 GitHub 仓库地址，最终 PDF 应命名为 `2026_ECNU_PJ1_2_白淑静.pdf`。

### 是否修改

学生亲自使用 UTF-8 保存和更新了第二阶段提交文档。AI-032 没有修改业务代码，没有新增接口或数据库集合。

学生根据提交要求提出报告不应重复 API 文档、运行手册和全部实现细节，只需覆盖作业文档要求。根据该意见，第二阶段完成报告从过长版本精简为项目目标、八项需求、系统设计、MongoDB 设计、关键实现、数据迁移、测试、问题解决、AI 使用和总结。

### 修改内容

- 更新 `README.md`，补充第二阶段功能、技术栈、数据集合、迁移命令、测试结果、页面入口、文档目录和提交排除项。
- 更新 `docs/API说明.md`，统一记录第一阶段与第二阶段接口路径、认证要求、请求字段、响应结构、状态码、权限和敏感字段保护。
- 更新 `docs/关键逻辑说明.md`，补充不可变版本、恢复生成新版本、显式版本入卷、共享软撤销、题目库引用式存储、跨问卷统计和迁移兼容逻辑。
- 更新 `docs/测试用例与结果.md`，记录第一阶段 8 项和第二阶段 6 项自动化测试的步骤、输入、预期结果、实际结果与结论，并记录迁移及前端验收结果。
- 新增 `docs/数据迁移说明.md`，记录备份、旧数据基线、默认 dry-run、显式 `--apply`、引用检查、第一次迁移、第二次幂等迁移、问题修复和回滚方案。
- 更新 `docs/AI使用说明.md`，总结 AI 在两个阶段提供的帮助、AI 出现的问题、学生完成的修改、学生提出的设计和验证方法。
- 新增并精简 `docs/第二阶段项目完成报告.md`，报告最前面放置 GitHub 仓库链接，正文只保留作业要求相关内容。
- 未把 Git 初始化、提交、GitHub 推送或上传过程写入 AI 日志。

### 验证结果

- 最终检查确认 `README.md`、第二阶段需求基线、数据库设计、API 说明、关键逻辑说明、数据迁移说明、测试用例与结果、AI 使用日志、AI 使用说明和第二阶段完成报告共 10 个必要文档全部存在且文件大小大于 0。
- 第二阶段完成报告最前面包含仓库地址 `https://github.com/zhuzhuxia-123-b/questionnaire-system`，并包含姓名白淑静、学号 10245501436、第二阶段名称和完成日期。
- 最终完整 Jest 回归结果为 3 个测试套件、14 项测试全部通过，无失败和快照。
- 测试结束后 3101 端口未继续监听，`questionnaire_system_test` 集合列表为 `[]`。
- `.env` 被 `.gitignore` 的 `.env` 规则排除，`node_modules` 被 `node_modules/` 规则排除。
- Git 已跟踪风险文件数量为 0；本次 34 个修改或新增候选文件中风险文件数量为 0。
- 检查范围内没有发现 `.env`、`node_modules`、coverage、数据库备份、日志、tmp、bak 或 old 临时文件进入提交候选。
- 本阶段没有执行 Git 提交或推送。

