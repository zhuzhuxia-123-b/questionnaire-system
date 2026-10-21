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