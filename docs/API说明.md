# 在线问卷系统 API 说明

## 1 文档说明

本文档记录在线问卷系统第一阶段和第二阶段已经实现的 HTTP API。

系统使用 Node.js、Express、MongoDB 和 Mongoose 开发，接口默认返回 JSON 数据。

基础地址：

```text
http://localhost:3000
```

主要接口前缀：

| 前缀                    | 功能                               |
| ----------------------- | ---------------------------------- |
| `/api/health`         | 服务健康检查                       |
| `/api/auth`           | 用户认证                           |
| `/api/surveys`        | 本人问卷、题目和统计               |
| `/api/public`         | 公开问卷读取和答卷提交             |
| `/api/question-items` | 可复用题目、版本、共享和跨问卷统计 |
| `/api/question-banks` | 本人题目库                         |

除注册、登录、健康检查和公开问卷读取外，其余接口都需要 JWT。

---

## 2 通用约定

### 2.1 请求和响应格式

需要请求体的接口使用：

```http
Content-Type: application/json; charset=utf-8
```

响应格式：

```http
Content-Type: application/json; charset=utf-8
```

### 2.2 JWT 认证

登录成功后取得 `token`，后续受保护接口需要发送：

```http
Authorization: Bearer <token>
```

没有令牌、令牌无效或令牌过期时返回：

```json
{
  "message": "缺少有效的登录令牌"
}
```

状态码：

```text
401 Unauthorized
```

### 2.3 权限隐藏原则

访问不属于当前用户的数据时，接口通常返回 `404`，避免泄露资源是否存在。

```json
{
  "message": "资源不存在或不属于当前用户"
}
```

### 2.4 时间格式

接口中的时间统一使用 ISO 8601 字符串，例如：

```text
2026-10-29T08:30:00.000Z
```

### 2.5 MongoDB ID

`userId`、`surveyId`、`questionId`、`questionItemId` 和 `questionVersionId` 等 ID 均为 MongoDB ObjectId 字符串。

---

## 3 通用状态码

| 状态码  | 含义                                 |
| ------- | ------------------------------------ |
| `200` | 查询、修改或操作成功                 |
| `201` | 数据创建成功                         |
| `400` | 请求字段、JSON、题型或答案不合法     |
| `401` | 未登录、令牌缺失或令牌无效           |
| `404` | 资源不存在、无权访问或不属于当前用户 |
| `409` | 重复数据、状态冲突或并发版本冲突     |
| `500` | 服务器内部错误                       |

---

# 第一阶段接口

## 4 系统接口

### 4.1 健康检查

```http
GET /api/health
```

认证要求：不需要登录。

成功响应：

```json
{
  "status": "ok",
  "message": "Questionnaire API is running"
}
```

状态码：

```text
200 OK
```

---

## 5 用户认证接口

### 5.1 用户注册

```http
POST /api/auth/register
```

认证要求：不需要登录。

请求体：

```json
{
  "username": "student01",
  "password": "Test123456!"
}
```

字段说明：

| 字段         | 类型   | 必填 | 说明                                                   |
| ------------ | ------ | ---: | ------------------------------------------------------ |
| `username` | String |   是 | 用户名，必须唯一                                       |
| `password` | String |   是 | 至少 8 个字符，不能超过 bcrypt 支持的 72 个 UTF-8 字节 |

成功响应包含新用户的安全字段，不返回密码哈希：

```json
{
  "user": {
    "id": "用户ID",
    "username": "student01",
    "createdAt": "创建时间"
  }
}
```

状态码：

```text
201 Created
```

用户名重复：

```json
{
  "message": "用户名已存在"
}
```

状态码：

```text
409 Conflict
```

---

### 5.2 用户登录

```http
POST /api/auth/login
```

认证要求：不需要登录。

请求体：

```json
{
  "username": "student01",
  "password": "Test123456!"
}
```

成功响应：

```json
{
  "token": "JWT令牌",
  "user": {
    "id": "用户ID",
    "username": "student01"
  }
}
```

状态码：

```text
200 OK
```

用户名或密码错误：

```json
{
  "message": "用户名或密码错误"
}
```

状态码：

```text
401 Unauthorized
```

---

### 5.3 获取当前用户

```http
GET /api/auth/me
```

认证要求：需要登录。

成功响应：

```json
{
  "user": {
    "id": "用户ID",
    "username": "student01"
  }
}
```

状态码：

```text
200 OK
```

---

## 6 问卷管理接口

### 6.1 创建问卷

```http
POST /api/surveys
```

认证要求：需要登录。

请求体示例：

```json
{
  "title": "大学生学习情况调查",
  "description": "用于了解大学生的学习情况",
  "allowAnonymous": true,
  "preventDuplicate": true,
  "deadline": "2026-12-31T23:59:59.000Z"
}
```

字段说明：

| 字段                 | 类型      | 必填 | 说明                     |
| -------------------- | --------- | ---: | ------------------------ |
| `title`            | String    |   是 | 问卷标题                 |
| `description`      | String    |   否 | 问卷说明                 |
| `allowAnonymous`   | Boolean   |   否 | 是否允许对创建者匿名     |
| `preventDuplicate` | Boolean   |   否 | 是否限制同一用户重复提交 |
| `deadline`         | Date/null |   否 | 截止时间                 |

新问卷初始状态为 `draft`。

成功响应：

```json
{
  "message": "问卷创建成功",
  "survey": {
    "id": "问卷ID",
    "title": "大学生学习情况调查",
    "description": "用于了解大学生的学习情况",
    "status": "draft",
    "publicId": "公开访问ID",
    "allowAnonymous": true,
    "preventDuplicate": true,
    "deadline": "2026-12-31T23:59:59.000Z"
  }
}
```

状态码：

```text
201 Created
```

---

### 6.2 查询本人问卷

```http
GET /api/surveys?page=1&limit=20
```

认证要求：需要登录。

查询参数：

| 参数      | 说明     |
| --------- | -------- |
| `page`  | 页码     |
| `limit` | 每页数量 |

成功响应包含本人问卷和分页信息：

```json
{
  "surveys": [
    {
      "id": "问卷ID",
      "title": "大学生学习情况调查",
      "status": "published",
      "publicId": "公开访问ID",
      "allowAnonymous": true,
      "preventDuplicate": true,
      "publishedAt": "发布时间",
      "closedAt": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

状态码：

```text
200 OK
```

---

### 6.3 发布问卷

```http
POST /api/surveys/:surveyId/publish
```

认证要求：需要登录，且问卷必须属于当前用户。

限制：

- 只有 `draft` 状态问卷可以发布；
- 问卷必须包含有效题目；
- 发布后题目内容不能继续通过第一阶段题目接口修改。

成功响应：

```json
{
  "message": "问卷发布成功",
  "survey": {
    "id": "问卷ID",
    "status": "published",
    "publicId": "公开访问ID",
    "publishedAt": "发布时间"
  }
}
```

状态码：

```text
200 OK
```

状态不允许发布时返回 `409`。

---

### 6.4 关闭问卷

```http
POST /api/surveys/:surveyId/close
```

认证要求：需要登录，且问卷必须属于当前用户。

限制：只有已经发布的问卷可以关闭。

成功响应：

```json
{
  "message": "问卷关闭成功",
  "survey": {
    "id": "问卷ID",
    "status": "closed",
    "closedAt": "关闭时间"
  }
}
```

状态码：

```text
200 OK
```

问卷关闭后不能继续公开填写，但历史答卷仍保留。

---

## 7 问卷题目管理接口

支持题型：

| 类型               | 说明   |
| ------------------ | ------ |
| `singleChoice`   | 单选题 |
| `multipleChoice` | 多选题 |
| `text`           | 文本题 |
| `number`         | 数字题 |

### 7.1 创建题目

```http
POST /api/surveys/:surveyId/questions
```

认证要求：需要登录，问卷必须属于当前用户且状态为 `draft`。

单选题示例：

```json
{
  "type": "singleChoice",
  "title": "你目前所在的年级是？",
  "required": true,
  "options": [
    {
      "label": "大学一年级"
    },
    {
      "label": "大学二年级"
    }
  ]
}
```

多选题示例：

```json
{
  "type": "multipleChoice",
  "title": "你常用哪些学习方式？",
  "required": false,
  "options": [
    {
      "label": "在线课程"
    },
    {
      "label": "阅读教材"
    }
  ],
  "validation": {
    "minSelections": 1,
    "maxSelections": 2
  }
}
```

文本题示例：

```json
{
  "type": "text",
  "title": "请描述你的学习计划",
  "required": false,
  "validation": {
    "minLength": 2,
    "maxLength": 200
  }
}
```

数字题示例：

```json
{
  "type": "number",
  "title": "你每天学习多少小时？",
  "required": true,
  "validation": {
    "minValue": 0,
    "maxValue": 24,
    "integerOnly": false
  }
}
```

成功响应：

```json
{
  "message": "题目创建成功",
  "question": {
    "id": "题目ID",
    "surveyId": "问卷ID",
    "order": 1,
    "type": "singleChoice",
    "title": "你目前所在的年级是？",
    "required": true,
    "options": [
      {
        "optionId": "稳定选项ID",
        "label": "大学一年级"
      }
    ],
    "validation": {},
    "jumpRules": []
  }
}
```

状态码：

```text
201 Created
```

---

### 7.2 查询问卷题目

```http
GET /api/surveys/:surveyId/questions
```

认证要求：需要登录，问卷必须属于当前用户。

成功响应：

```json
{
  "questions": [
    {
      "id": "题目ID",
      "surveyId": "问卷ID",
      "order": 1,
      "type": "singleChoice",
      "title": "你目前所在的年级是？",
      "required": true,
      "options": [],
      "validation": {},
      "jumpRules": []
    }
  ],
  "total": 1
}
```

状态码：

```text
200 OK
```

---

### 7.3 编辑题目

```http
PATCH /api/surveys/:surveyId/questions/:questionId
```

认证要求：需要登录，问卷属于当前用户且状态为 `draft`。

请求体只需包含需要修改的字段：

```json
{
  "title": "修改后的题目内容",
  "required": false
}
```

选择题编辑时可以保留原 `optionId`：

```json
{
  "options": [
    {
      "optionId": "原选项ID",
      "label": "修改后的选项文字"
    }
  ]
}
```

成功响应返回修改后的题目。

状态码：

```text
200 OK
```

---

### 7.4 删除题目

```http
DELETE /api/surveys/:surveyId/questions/:questionId
```

认证要求：需要登录，问卷属于当前用户且状态为 `draft`。

如果题目仍被其他跳转规则引用，则拒绝删除。

成功响应：

```json
{
  "message": "题目删除成功",
  "deletedQuestionId": "题目ID",
  "remainingQuestions": 3
}
```

状态码：

```text
200 OK
```

---

### 7.5 配置跳转规则

```http
PUT /api/surveys/:surveyId/questions/:questionId/jump-rules
```

认证要求：需要登录，问卷属于当前用户且状态为 `draft`。

跳转到后续题目：

```json
{
  "jumpRules": [
    {
      "optionId": "选项ID",
      "action": "goto",
      "targetQuestionId": "后续题目ID"
    }
  ]
}
```

提前提交：

```json
{
  "jumpRules": [
    {
      "optionId": "选项ID",
      "action": "submit"
    }
  ]
}
```

限制：

- `optionId` 必须属于当前题目；
- `targetQuestionId` 必须属于同一问卷；
- `goto` 只能跳到 `order` 更大的后续题目；
- 不允许自跳转；
- 不允许形成跳转循环。

成功响应返回更新后的题目和跳转规则。

状态码：

```text
200 OK
```

---

## 8 公开问卷与答卷接口

### 8.1 公开读取问卷

```http
GET /api/public/surveys/:publicId
```

认证要求：不需要登录。

只有 `published` 状态且未超过截止时间的问卷可以读取。

成功响应：

```json
{
  "survey": {
    "id": "问卷ID",
    "title": "大学生学习情况调查",
    "description": "问卷说明",
    "publicId": "公开访问ID",
    "allowAnonymous": true,
    "preventDuplicate": true,
    "deadline": null
  },
  "questions": [
    {
      "id": "题目ID",
      "order": 1,
      "type": "singleChoice",
      "title": "题目内容",
      "required": true,
      "options": [],
      "validation": {},
      "jumpRules": []
    }
  ]
}
```

公开响应不包含 `ownerId`。

草稿、已关闭或不存在的问卷返回：

```text
404 Not Found
```

---

### 8.2 提交答卷

```http
POST /api/public/surveys/:publicId/responses
```

认证要求：必须登录。

请求体：

```json
{
  "anonymous": false,
  "answers": [
    {
      "questionId": "题目ID",
      "value": "选项ID"
    },
    {
      "questionId": "文本题ID",
      "value": "文本答案"
    },
    {
      "questionId": "数字题ID",
      "value": 8
    }
  ],
  "visitedQuestionIds": [
    "实际经过的题目ID"
  ]
}
```

多选题的 `value` 为选项 ID 数组：

```json
{
  "questionId": "多选题ID",
  "value": [
    "选项ID1",
    "选项ID2"
  ]
}
```

限制：

- 必答题必须填写；
- 选项必须属于对应题目；
- 数字和文本必须满足 validation；
- 答案必须符合实际条件跳转路径；
- `anonymous=true` 仅在问卷允许匿名时有效；
- 开启重复提交限制后，同一用户不能重复提交。

成功响应：

```json
{
  "message": "答卷提交成功",
  "response": {
    "id": "答卷ID",
    "anonymous": false,
    "answerCount": 3,
    "visitedQuestionIds": [],
    "surveyVersion": 1,
    "submittedAt": "提交时间"
  }
}
```

状态码：

```text
201 Created
```

重复提交返回：

```text
409 Conflict
```

---

## 9 单份问卷统计接口

### 9.1 查询整份问卷统计

```http
GET /api/surveys/:surveyId/statistics
```

认证要求：需要登录，且问卷必须属于当前用户。

成功响应包含：

```json
{
  "survey": {
    "id": "问卷ID",
    "title": "问卷标题"
  },
  "responseCount": 10,
  "questionCount": 4,
  "questions": []
}
```

每道题通用字段：

```json
{
  "questionId": "题目ID",
  "order": 1,
  "type": "singleChoice",
  "title": "题目内容",
  "totalAnswers": 8,
  "notAnsweredCount": 2
}
```

选择题额外返回：

```json
{
  "options": [
    {
      "optionId": "选项ID",
      "label": "选项文字",
      "count": 5
    }
  ]
}
```

文本题额外返回回答列表，数字题额外返回：

```json
{
  "average": 6.5,
  "minimum": 2,
  "maximum": 10
}
```

统计结果不返回 `respondentId`、答卷者用户名或 `uniqueSubmissionKey`。

---

### 9.2 查询单题统计

```http
GET /api/surveys/:surveyId/statistics?questionId=:questionId
```

认证和返回结构与整份统计相同，但 `questions` 只包含指定题目。

---

# 第二阶段接口

## 10 可复用题目和版本接口

### 10.1 创建可复用题目

```http
POST /api/question-items
```

认证要求：需要登录。

请求体：

```json
{
  "type": "singleChoice",
  "title": "你是否使用过在线题库？",
  "options": [
    {
      "label": "是"
    },
    {
      "label": "否"
    }
  ],
  "validation": {},
  "changeNote": "创建初始版本"
}
```

不得提交以下问卷专属字段：

- `surveyId`
- `order`
- `required`
- `jumpRules`

成功响应：

```json
{
  "message": "可复用题目创建成功",
  "questionItem": {
    "id": "逻辑题目ID",
    "ownerId": "所有者ID",
    "currentVersionId": "版本ID",
    "latestVersionNumber": 1,
    "status": "active",
    "schemaVersion": 1,
    "currentVersion": {
      "id": "版本ID",
      "versionNumber": 1,
      "type": "singleChoice",
      "title": "你是否使用过在线题库？",
      "options": [],
      "validation": {},
      "changeNote": "创建初始版本"
    }
  }
}
```

状态码：

```text
201 Created
```

---

### 10.2 查询本人可复用题目

```http
GET /api/question-items?page=1&limit=20&status=active
```

认证要求：需要登录。

`status` 可选值：

```text
active
archived
all
```

成功响应包含：

```json
{
  "questionItems": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "pages": 0
  }
}
```

---

### 10.3 查询可复用题目详情

```http
GET /api/question-items/:questionItemId
```

认证要求：需要登录，题目必须属于当前用户。

成功响应：

```json
{
  "questionItem": {
    "id": "逻辑题目ID",
    "currentVersionId": "当前版本ID",
    "latestVersionNumber": 3,
    "status": "active",
    "currentVersion": {}
  }
}
```

---

### 10.4 创建新版本

```http
POST /api/question-items/:questionItemId/versions
```

认证要求：需要登录，题目必须属于当前用户。

请求体可以提供完整内容，也可以只提供需要改变的字段：

```json
{
  "title": "修改后的题目内容",
  "changeNote": "调整题目措辞"
}
```

成功响应：

```json
{
  "message": "题目新版本创建成功",
  "questionItem": {
    "id": "逻辑题目ID",
    "currentVersionId": "新版本ID",
    "latestVersionNumber": 2
  },
  "version": {
    "id": "新版本ID",
    "questionItemId": "逻辑题目ID",
    "versionNumber": 2,
    "parentVersionId": "上一版本ID",
    "restoredFromVersionId": null,
    "title": "修改后的题目内容",
    "changeNote": "调整题目措辞"
  }
}
```

历史版本不会被修改。

发生并发版本冲突时返回：

```text
409 Conflict
```

---

### 10.5 查看版本历史

```http
GET /api/question-items/:questionItemId/versions?page=1&limit=20
```

认证要求：需要登录，题目必须属于当前用户。

成功响应：

```json
{
  "questionItemId": "逻辑题目ID",
  "currentVersionId": "当前版本ID",
  "latestVersionNumber": 3,
  "versions": [
    {
      "id": "版本ID",
      "versionNumber": 3,
      "parentVersionId": "版本2的ID",
      "restoredFromVersionId": "被恢复的版本ID",
      "type": "singleChoice",
      "title": "题目内容",
      "options": [],
      "validation": {},
      "changeNote": "恢复历史版本"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "pages": 1
  }
}
```

系统不提供修改或删除历史版本的接口。

---

### 10.6 恢复历史版本

```http
POST /api/question-items/:questionItemId/versions/:versionId/restore
```

认证要求：需要登录，题目必须属于当前用户。

请求体：

```json
{
  "changeNote": "恢复第一个版本的内容"
}
```

恢复不会直接把 `currentVersionId` 指回旧版本，而是复制旧版本内容并创建新的递增版本。

成功响应：

```json
{
  "message": "历史版本恢复成功",
  "restoredFromVersionId": "历史版本ID",
  "questionItem": {},
  "version": {
    "id": "新版本ID",
    "versionNumber": 4,
    "parentVersionId": "恢复前当前版本ID",
    "restoredFromVersionId": "历史版本ID"
  }
}
```

状态码：

```text
201 Created
```

---

## 11 指定版本加入问卷

### 11.1 从可复用题目加入草稿问卷

```http
POST /api/surveys/:surveyId/questions/from-library
```

认证要求：需要登录。

请求体：

```json
{
  "questionItemId": "逻辑题目ID",
  "questionVersionId": "明确采用的版本ID",
  "required": true
}
```

限制：

- 问卷必须属于当前用户；
- 问卷必须处于 `draft` 状态；
- 当前用户必须拥有该逻辑题目，或拥有有效的 `use` 共享权限；
- `questionVersionId` 必须属于指定逻辑题目；
- 不允许通过请求体覆盖题目正文、选项或校验规则。

成功响应：

```json
{
  "message": "可复用题目已加入问卷",
  "source": {
    "accessType": "owner",
    "shareId": null,
    "questionItemId": "逻辑题目ID",
    "questionVersionId": "版本ID",
    "versionNumber": 1,
    "isCurrentVersion": false
  },
  "question": {
    "id": "问卷题目实例ID",
    "surveyId": "问卷ID",
    "order": 1,
    "required": true,
    "type": "singleChoice",
    "title": "版本内容快照",
    "options": [],
    "validation": {},
    "jumpRules": [],
    "questionItemId": "逻辑题目ID",
    "questionVersionId": "采用的版本ID",
    "contentSource": "library",
    "schemaVersion": 2
  }
}
```

状态码：

```text
201 Created
```

逻辑题目以后创建新版本时，已经加入问卷的快照和 `questionVersionId` 不会自动变化。

---

## 12 题目使用情况接口

### 12.1 查询本人问卷中的使用情况

```http
GET /api/question-items/:questionItemId/usage?page=1&limit=20
```

认证要求：需要登录，逻辑题目必须属于当前用户。

成功响应：

```json
{
  "questionItem": {
    "id": "逻辑题目ID",
    "currentVersionId": "当前版本ID",
    "latestVersionNumber": 3
  },
  "summary": {
    "usageCount": 2,
    "surveyCount": 2,
    "versions": []
  },
  "usages": [
    {
      "questionId": "问卷题目实例ID",
      "order": 1,
      "required": true,
      "questionVersionId": "实际采用的版本ID",
      "contentSource": "library",
      "schemaVersion": 2,
      "snapshot": {
        "title": "问卷中保存的题目快照"
      },
      "survey": {
        "id": "问卷ID",
        "title": "问卷标题",
        "status": "published"
      }
    }
  ],
  "pagination": {}
}
```

只返回当前用户本人问卷中的使用情况。

---

## 13 题目共享接口

### 13.1 按用户名共享题目

```http
POST /api/question-items/:questionItemId/shares
```

认证要求：需要登录，逻辑题目必须属于当前用户。

请求体：

```json
{
  "username": "receiver01"
}
```

限制：

- 不能共享给自己；
- 接收者必须存在；
- 接收者权限固定为 `use`；
- 同一题目和接收者只保留一条共享关系。

首次共享返回 `201`；共享已存在或重新激活时返回 `200`。

成功响应包含：

```json
{
  "message": "题目共享成功",
  "action": "created",
  "share": {
    "id": "共享ID",
    "questionItemId": "逻辑题目ID",
    "sharedWithUser": {
      "id": "接收者ID",
      "username": "receiver01"
    },
    "permission": "use",
    "status": "active",
    "sharedAt": "最近激活时间",
    "revokedAt": null,
    "createdAt": "首次创建时间"
  }
}
```

`createdAt` 保留首次创建时间，`sharedAt` 表示最近一次激活时间。

---

### 13.2 查看发出的共享

```http
GET /api/question-items/:questionItemId/shares?page=1&limit=20
```

认证要求：需要登录，逻辑题目必须属于当前用户。

成功响应包含共享记录和分页信息。

---

### 13.3 软撤销共享

```http
DELETE /api/question-items/:questionItemId/shares/:shareId
```

认证要求：需要登录，逻辑题目和共享记录必须属于当前用户。

成功响应：

```json
{
  "message": "题目共享已撤销",
  "action": "revoked",
  "share": {
    "id": "共享ID",
    "status": "revoked",
    "revokedAt": "撤销时间"
  }
}
```

撤销后：

- 接收者不能继续把该题目的新版本加入问卷；
- 接收者已经加入问卷的 Question 快照不会删除或改变；
- 再次共享时重新激活原共享记录，不创建重复关系。

---

### 13.4 查看收到的共享

```http
GET /api/question-items/received-shares?page=1&limit=20
```

认证要求：需要登录。

只返回当前用户收到且仍有效的共享。

---

### 13.5 查看共享题目的版本

```http
GET /api/question-items/received-shares/:questionItemId/versions?page=1&limit=20
```

认证要求：需要登录，且当前用户必须拥有有效共享。

成功响应包含：

```json
{
  "share": {
    "id": "共享ID",
    "permission": "use",
    "status": "active"
  },
  "owner": {
    "id": "所有者ID",
    "username": "所有者用户名"
  },
  "questionItem": {},
  "versions": [],
  "pagination": {}
}
```

接收者只能查看和复用，不能：

- 创建新版本；
- 恢复历史版本；
- 归档所有者题目；
- 撤销所有者发出的共享；
- 将共享权限转发给其他用户。

---

## 14 题目库接口

题目库采用引用式存储，只保存：

- `questionItemId`
- `preferredVersionId`
- 题目在库中的顺序和加入时间

题目正文仍保存在 `questionVersions` 集合。

### 14.1 创建题目库

```http
POST /api/question-banks
```

认证要求：需要登录。

请求体：

```json
{
  "name": "数据库课程题目库",
  "description": "保存数据库课程常用题目"
}
```

成功响应：

```json
{
  "message": "题目库创建成功",
  "questionBank": {
    "id": "题目库ID",
    "name": "数据库课程题目库",
    "description": "保存数据库课程常用题目",
    "status": "active",
    "itemCount": 0
  }
}
```

状态码：

```text
201 Created
```

同一用户的题目库名称不能重复。

---

### 14.2 查询本人题目库列表

```http
GET /api/question-banks?page=1&limit=20
```

认证要求：需要登录。

成功响应：

```json
{
  "questionBanks": [],
  "pagination": {}
}
```

---

### 14.3 查询题目库详情

```http
GET /api/question-banks/:bankId
```

认证要求：需要登录，题目库必须属于当前用户。

详情中的每个题目包含：

```json
{
  "questionItemId": "逻辑题目ID",
  "preferredVersionId": "推荐版本ID",
  "preferredVersion": {},
  "currentVersionId": "当前版本ID",
  "currentVersion": {},
  "isPreferredCurrent": false,
  "order": 1,
  "addedAt": "加入时间",
  "available": true
}
```

---

### 14.4 修改题目库名称或说明

```http
PATCH /api/question-banks/:bankId
```

认证要求：需要登录，题目库必须属于当前用户。

请求体：

```json
{
  "name": "修改后的题目库名称",
  "description": "修改后的说明"
}
```

成功响应返回修改后的题目库。

---

### 14.5 将逻辑题目加入题目库

```http
POST /api/question-banks/:bankId/items
```

认证要求：需要登录，题目库和逻辑题目都必须属于当前用户。

请求体：

```json
{
  "questionItemId": "逻辑题目ID",
  "preferredVersionId": "推荐版本ID"
}
```

限制：

- 同一逻辑题目不能重复加入同一个题目库；
- 推荐版本必须属于该逻辑题目。

状态码：

```text
200 OK
```

---

### 14.6 修改推荐版本

```http
PATCH /api/question-banks/:bankId/items/:questionItemId/preferred-version
```

认证要求：需要登录。

请求体：

```json
{
  "preferredVersionId": "新的推荐版本ID"
}
```

修改推荐版本只影响以后选题时的建议，不修改已经加入问卷的快照。

---

### 14.7 从题目库移除题目

```http
DELETE /api/question-banks/:bankId/items/:questionItemId
```

认证要求：需要登录。

移除操作只删除题目库中的引用，不会删除：

- `QuestionItem`
- `QuestionVersion`
- 已加入问卷的 Question 快照
- 已有答卷

状态码：

```text
200 OK
```

---

### 14.8 从题目库加入草稿问卷

```http
POST /api/question-banks/:bankId/items/:questionItemId/add-to-survey
```

认证要求：需要登录。

请求体：

```json
{
  "surveyId": "草稿问卷ID",
  "questionVersionId": "明确采用的版本ID",
  "required": true
}
```

限制：

- 题目库属于当前用户；
- 题目属于该题目库；
- 逻辑题目属于当前用户；
- 版本属于该逻辑题目；
- 问卷属于当前用户且为 `draft`。

成功后保存实际采用的版本 ID 和题目内容快照。

状态码：

```text
201 Created
```

---

## 15 跨问卷单题统计接口

### 15.1 查询逻辑题目的跨问卷统计

```http
GET /api/question-items/:questionItemId/cross-survey-statistics
```

认证要求：需要登录。

权限规则：

- 只统计当前用户拥有的问卷；
- 题目所有者不能查看其他用户问卷中的答卷；
- 共享接收者只能统计自己问卷中的数据；
- 不进行跨用户统计。

成功响应：

```json
{
  "questionItem": {
    "id": "逻辑题目ID",
    "currentVersionId": "当前版本ID",
    "latestVersionNumber": 2,
    "status": "active"
  },
  "filter": {
    "questionVersionId": null,
    "ownedSurveysOnly": true
  },
  "summary": {
    "surveyCount": 3,
    "questionInstanceCount": 4,
    "responseCount": 4,
    "answerOpportunityCount": 6,
    "totalAnswers": 5,
    "notAnsweredCount": 1,
    "versionCount": 2
  },
  "surveys": [],
  "versions": []
}
```

字段含义：

| 字段                       | 说明                                      |
| -------------------------- | ----------------------------------------- |
| `surveyCount`            | 纳入统计的本人问卷数量                    |
| `questionInstanceCount`  | 逻辑题目在本人问卷中的实例数量            |
| `responseCount`          | 纳入统计的去重答卷总数                    |
| `answerOpportunityCount` | 每个题目实例对应问卷答卷数之和            |
| `totalAnswers`           | 实际保存的答案数量                        |
| `notAnsweredCount`       | `answerOpportunityCount - totalAnswers` |
| `versionCount`           | 纳入统计的版本数量                        |

不同版本不会强行合并，而是在 `versions` 中分别统计。

---

### 15.2 按指定版本统计

```http
GET /api/question-items/:questionItemId/cross-survey-statistics?questionVersionId=:questionVersionId
```

指定版本必须属于该逻辑题目，并且当前用户有权查看其本人问卷中的使用数据。

---

### 15.3 单选和多选统计结构

```json
{
  "questionVersionId": "版本ID",
  "versionNumber": 1,
  "title": "题目内容",
  "type": "singleChoice",
  "isCurrentVersion": false,
  "surveyCount": 2,
  "questionInstanceCount": 2,
  "responseCount": 3,
  "answerOpportunityCount": 3,
  "totalAnswers": 2,
  "notAnsweredCount": 1,
  "options": [
    {
      "optionId": "稳定选项ID",
      "label": "是",
      "count": 2
    }
  ]
}
```

选择题在同一个版本内按稳定 `optionId` 统计，不只按选项文字合并。

---

### 15.4 文本题统计结构

```json
{
  "questionVersionId": "版本ID",
  "type": "text",
  "totalAnswers": 2,
  "notAnsweredCount": 1,
  "values": [
    "文本回答一",
    "文本回答二"
  ]
}
```

---

### 15.5 数字题统计结构

```json
{
  "questionVersionId": "版本ID",
  "type": "number",
  "totalAnswers": 3,
  "notAnsweredCount": 0,
  "values": [
    3,
    6,
    9
  ],
  "average": 6,
  "minimum": 3,
  "maximum": 9
}
```

---

## 16 数据和隐私保护

以下敏感字段不会出现在公开问卷、普通统计和跨问卷统计结果中：

- `passwordHash`
- `respondentId`
- 答卷者 `username`
- `uniqueSubmissionKey`
- JWT 密钥
- 数据库连接密码

匿名答卷的身份保护由后端返回字段控制，不能只依靠前端隐藏。

系统内部可以保存 `respondentId`，用于登录校验和限制重复提交，但问卷创建者查看匿名答卷或统计结果时不能获得填写者身份。

---

## 17 第二阶段兼容原则

第二阶段接口遵守以下兼容规则：

1. 第一阶段的用户、问卷、题目和答卷接口继续可用；
2. 第一阶段旧题目通过迁移关联到 `questionItems` 和 `questionVersions`；
3. 问卷题目始终保存内容快照；
4. 可复用题目创建新版本时不自动修改旧问卷；
5. 恢复历史版本时创建新版本，不修改历史记录；
6. 撤销共享不删除接收者已有问卷快照；
7. 从题目库移除题目不删除逻辑题目或历史数据；
8. 第一阶段答卷继续使用 `schemaVersion=1`；
9. 完整使用第二阶段题目引用的新答卷使用 `schemaVersion=2`；
10. 新答卷答案快照保存 `questionItemId` 和 `questionVersionId`，供跨问卷统计使用。

---

## 18 页面入口

| 页面                   | 地址                                                          |
| ---------------------- | ------------------------------------------------------------- |
| 系统首页               | `http://localhost:3000/`                                    |
| 公开问卷填写页         | `http://localhost:3000/survey.html?publicId=<publicId>`     |
| 第一阶段统计页         | `http://localhost:3000/statistics.html?surveyId=<surveyId>` |
| 第二阶段题目资源管理页 | `http://localhost:3000/resources.html`                      |

---

## 19 PowerShell 调用示例

### 19.1 登录并保存令牌

```powershell
$loginJson = @{
    username = 'student01'
    password = 'Test123456!'
} | ConvertTo-Json -Compress

[byte[]]$loginBody =
    [System.Text.Encoding]::UTF8.GetBytes(
        $loginJson
    )

$loginResult = Invoke-RestMethod `
    -Uri 'http://localhost:3000/api/auth/login' `
    -Method Post `
    -ContentType 'application/json; charset=utf-8' `
    -Body $loginBody

$token = $loginResult.token
```

### 19.2 查询可复用题目

```powershell
Invoke-RestMethod `
    -Uri 'http://localhost:3000/api/question-items?page=1&limit=20' `
    -Method Get `
    -Headers @{
        Authorization = "Bearer $token"
    }
```

### 19.3 查询跨问卷统计

```powershell
Invoke-RestMethod `
    -Uri "http://localhost:3000/api/question-items/$questionItemId/cross-survey-statistics" `
    -Method Get `
    -Headers @{
        Authorization = "Bearer $token"
    }
```

---

## 20 文档维护说明

接口发生变化时，应同步检查：

- 路由路径；
- HTTP 方法；
- JWT 认证要求；
- 请求字段；
- 响应字段；
- 状态码；
- 所有权和共享权限；
- 第一阶段旧数据兼容性；
- 匿名身份和敏感字段保护；
- 对应 Jest 自动化测

# 问卷系统 API 说明

## 1 文档说明

本文档说明问卷系统第一阶段已经实现的 HTTP API，包括认证、问卷管理、题目管理、跳转规则、公开问卷、答卷提交和统计查询。

默认服务地址：

```text
http://localhost:3000
```

默认请求和响应格式：

```text
application/json
```

除特别说明外：

- 所有请求体使用 JSON。
- 所有响应体使用 JSON。
- MongoDB ObjectId 在接口中使用字符串表示。
- 日期时间使用 ISO 8601 格式。
- 受保护接口必须携带 JWT。
- 错误响应统一包含 `message` 字段。

错误响应示例：

```json
{
  "message": "错误原因"
}
```

本文档中的 ID、公开编号、时间和令牌仅为格式示例，实际值由系统生成。

## 2 JWT 身份认证

登录或注册成功后，接口会返回 JWT：

```json
{
  "token": "<JWT>"
}
```

访问受保护接口时，需要设置请求头：

```http
Authorization: Bearer <JWT>
```

未提供令牌时返回：

```http
401 Unauthorized
```

```json
{
  "message": "缺少有效的登录令牌"
}
```

令牌无效或过期时返回：

```http
401 Unauthorized
```

```json
{
  "message": "登录令牌无效或已过期"
}
```

令牌对应的用户已经不存在时返回：

```http
401 Unauthorized
```

```json
{
  "message": "登录用户不存在"
}
```

## 3 接口总览

| 功能             | 方法   | 路径                                                        | 是否登录 |
| ---------------- | ------ | ----------------------------------------------------------- | -------- |
| 健康检查         | GET    | `/api/health`                                             | 否       |
| 用户注册         | POST   | `/api/auth/register`                                      | 否       |
| 用户登录         | POST   | `/api/auth/login`                                         | 否       |
| 当前用户         | GET    | `/api/auth/me`                                            | 是       |
| 创建问卷         | POST   | `/api/surveys`                                            | 是       |
| 本人问卷列表     | GET    | `/api/surveys`                                            | 是       |
| 发布问卷         | POST   | `/api/surveys/:surveyId/publish`                          | 是       |
| 关闭问卷         | POST   | `/api/surveys/:surveyId/close`                            | 是       |
| 创建题目         | POST   | `/api/surveys/:surveyId/questions`                        | 是       |
| 本人问卷题目列表 | GET    | `/api/surveys/:surveyId/questions`                        | 是       |
| 编辑题目         | PATCH  | `/api/surveys/:surveyId/questions/:questionId`            | 是       |
| 删除题目         | DELETE | `/api/surveys/:surveyId/questions/:questionId`            | 是       |
| 配置跳转规则     | PUT    | `/api/surveys/:surveyId/questions/:questionId/jump-rules` | 是       |
| 公开读取问卷     | GET    | `/api/public/surveys/:publicId`                           | 否       |
| 提交答卷         | POST   | `/api/public/surveys/:publicId/responses`                 | 是       |
| 问卷统计         | GET    | `/api/surveys/:surveyId/statistics`                       | 是       |

## 4 公共接口

### 4.1 健康检查

检查 Express 服务是否正常运行。

```http
GET /api/health
```

不需要登录。

成功状态码：

```http
200 OK
```

成功响应：

```json
{
  "status": "ok",
  "message": "Questionnaire API is running"
}
```

## 5 用户认证接口

### 5.1 用户注册

```http
POST /api/auth/register
```

不需要登录。

请求体：

```json
{
  "username": "student01",
  "password": "Test123456!"
}
```

字段说明：

| 字段         | 类型   | 必填 | 规则                                                   |
| ------------ | ------ | ---- | ------------------------------------------------------ |
| `username` | String | 是   | 去除首尾空格并转为小写，长度 3 至 30                   |
| `password` | String | 是   | 至少 8 个字符，不能超过 bcrypt 支持的 72 个 UTF-8 字节 |

成功状态码：

```http
201 Created
```

成功响应：

```json
{
  "user": {
    "id": "66f000000000000000000001",
    "username": "student01",
    "createdAt": "2030-01-01T08:00:00.000Z"
  },
  "token": "<JWT>"
}
```

可能的错误：

| 状态码 | 情况                      | 响应信息                            |
| ------ | ------------------------- | ----------------------------------- |
| 400    | 用户名长度不合法          | `用户名长度必须为 3 至 30 个字符` |
| 400    | 密码少于 8 个字符         | `密码长度不能少于 8 个字符`       |
| 400    | 密码超过 72 个 UTF-8 字节 | `密码不能超过 72 个 UTF-8 字节`   |
| 409    | 用户名已存在              | `用户名已存在`                    |

接口不会返回 `passwordHash`。

### 5.2 用户登录

```http
POST /api/auth/login
```

不需要登录。

请求体：

```json
{
  "username": "student01",
  "password": "Test123456!"
}
```

成功状态码：

```http
200 OK
```

成功响应：

```json
{
  "user": {
    "id": "66f000000000000000000001",
    "username": "student01",
    "createdAt": "2030-01-01T08:00:00.000Z"
  },
  "token": "<JWT>"
}
```

可能的错误：

| 状态码 | 情况                 | 响应信息                 |
| ------ | -------------------- | ------------------------ |
| 400    | 用户名或密码为空     | `用户名和密码不能为空` |
| 401    | 用户不存在或密码错误 | `用户名或密码错误`     |

### 5.3 获取当前用户

```http
GET /api/auth/me
```

需要登录。

请求头：

```http
Authorization: Bearer <JWT>
```

成功状态码：

```http
200 OK
```

成功响应：

```json
{
  "user": {
    "id": "66f000000000000000000001",
    "username": "student01"
  }
}
```

## 6 问卷管理接口

### 6.1 创建问卷

```http
POST /api/surveys
```

需要登录。

请求体：

```json
{
  "title": "大学生学习情况调查",
  "description": "用于了解大学生的学习时间和学习方式",
  "deadline": "2030-12-31T15:59:59.000Z",
  "allowAnonymous": true,
  "allowMultipleSubmissions": false
}
```

字段说明：

| 字段                         | 类型             | 必填 | 规则                               |
| ---------------------------- | ---------------- | ---- | ---------------------------------- |
| `title`                    | String           | 是   | 去除首尾空格，最长 100 个字符      |
| `description`              | String           | 否   | 去除首尾空格，最长 1000 个字符     |
| `deadline`                 | Date/String/null | 否   | 非空时必须是有效日期且晚于当前时间 |
| `allowAnonymous`           | Boolean          | 否   | 默认 `false`                     |
| `allowMultipleSubmissions` | Boolean          | 否   | 默认 `false`                     |

成功状态码：

```http
201 Created
```

成功响应：

```json
{
  "survey": {
    "id": "66f000000000000000000010",
    "ownerId": "66f000000000000000000001",
    "title": "大学生学习情况调查",
    "description": "用于了解大学生的学习时间和学习方式",
    "allowAnonymous": true,
    "allowMultipleSubmissions": false,
    "status": "draft",
    "publicId": "113ce77197840cf9",
    "deadline": "2030-12-31T15:59:59.000Z",
    "publishedAt": null,
    "closedAt": null,
    "schemaVersion": 1,
    "createdAt": "2030-01-01T08:00:00.000Z",
    "updatedAt": "2030-01-01T08:00:00.000Z"
  }
}
```

可能的错误：

| 状态码 | 情况                     | 示例响应信息                     |
| ------ | ------------------------ | -------------------------------- |
| 400    | 标题为空                 | `问卷标题不能为空`             |
| 400    | 标题超过限制             | `问卷标题不能超过 100 个字符`  |
| 400    | 说明不是字符串           | `问卷说明必须是字符串`         |
| 400    | 截止时间格式无效         | `截止时间格式无效`             |
| 400    | 截止时间已经过去         | `截止时间必须晚于当前时间`     |
| 400    | 布尔字段类型错误         | `allowAnonymous 必须是布尔值`  |
| 409    | 公开编号发生极低概率冲突 | `问卷公开编号冲突，请重新提交` |

### 6.2 查询本人问卷列表

```http
GET /api/surveys
```

需要登录。

查询参数：

| 参数       | 类型    | 必填 | 默认值 | 规则                                   |
| ---------- | ------- | ---- | ------ | -------------------------------------- |
| `page`   | Integer | 否   | `1`  | 大于或等于 1                           |
| `limit`  | Integer | 否   | `10` | 1 至 50                                |
| `status` | String  | 否   | 无     | `draft`、`published` 或 `closed` |

请求示例：

```http
GET /api/surveys?page=1&limit=10&status=published
```

成功状态码：

```http
200 OK
```

成功响应：

```json
{
  "surveys": [
    {
      "id": "66f000000000000000000010",
      "ownerId": "66f000000000000000000001",
      "title": "大学生学习情况调查",
      "description": "用于了解大学生的学习时间和学习方式",
      "allowAnonymous": true,
      "allowMultipleSubmissions": false,
      "status": "published",
      "publicId": "113ce77197840cf9",
      "deadline": "2030-12-31T15:59:59.000Z",
      "publishedAt": "2030-01-02T08:00:00.000Z",
      "closedAt": null,
      "schemaVersion": 1,
      "createdAt": "2030-01-01T08:00:00.000Z",
      "updatedAt": "2030-01-02T08:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

接口只查询当前用户创建的问卷。

可能的错误：

| 状态码 | 情况            | 响应信息                                     |
| ------ | --------------- | -------------------------------------------- |
| 400    | `page` 非法   | `page 必须是大于或等于 1 的整数`           |
| 400    | `limit` 非法  | `limit 必须是 1 到 50 之间的整数`          |
| 400    | `status` 非法 | `status 只能是 draft、published 或 closed` |

### 6.3 发布问卷

```http
POST /api/surveys/:surveyId/publish
```

需要登录。

没有请求体。

发布条件：

- 问卷属于当前用户。
- 问卷状态必须是 `draft`。
- 问卷至少包含一道题。
- 截止时间尚未到达。
- 所有 `goto` 目标有效。
- 跳转规则不存在循环。

成功状态码：

```http
200 OK
```

成功响应：

```json
{
  "message": "问卷发布成功",
  "survey": {
    "id": "66f000000000000000000010",
    "title": "大学生学习情况调查",
    "description": "用于了解大学生的学习时间和学习方式",
    "status": "published",
    "publicId": "113ce77197840cf9",
    "deadline": "2030-12-31T15:59:59.000Z",
    "publishedAt": "2030-01-02T08:00:00.000Z",
    "closedAt": null,
    "schemaVersion": 1,
    "publicPath": "/api/public/surveys/113ce77197840cf9"
  }
}
```

可能的错误：

| 状态码 | 情况                       | 响应信息                           |
| ------ | -------------------------- | ---------------------------------- |
| 404    | 问卷不存在或不属于当前用户 | `问卷不存在或不属于当前用户`     |
| 409    | 问卷不是草稿               | `只有草稿问卷可以发布`           |
| 400    | 截止时间已经过去           | `截止时间必须晚于当前时间`       |
| 400    | 问卷没有题目               | `问卷至少需要一道题才能发布`     |
| 409    | 跳转目标无效               | `问卷包含无效的跳转目标`         |
| 409    | 存在跳转循环               | `问卷跳转规则存在循环，不能发布` |

### 6.4 关闭问卷

```http
POST /api/surveys/:surveyId/close
```

需要登录。

没有请求体。

只有当前用户拥有的 `published` 问卷可以关闭。

成功状态码：

```http
200 OK
```

成功响应：

```json
{
  "message": "问卷关闭成功",
  "survey": {
    "id": "66f000000000000000000010",
    "title": "大学生学习情况调查",
    "description": "用于了解大学生的学习时间和学习方式",
    "status": "closed",
    "publicId": "113ce77197840cf9",
    "deadline": "2030-12-31T15:59:59.000Z",
    "publishedAt": "2030-01-02T08:00:00.000Z",
    "closedAt": "2030-01-03T08:00:00.000Z",
    "schemaVersion": 1,
    "publicPath": "/api/public/surveys/113ce77197840cf9"
  }
}
```

可能的错误：

| 状态码 | 情况                       | 响应信息                       |
| ------ | -------------------------- | ------------------------------ |
| 404    | 问卷不存在或不属于当前用户 | `问卷不存在或不属于当前用户` |
| 409    | 问卷不是已发布状态         | `只有已发布问卷可以关闭`     |

## 7 题目管理接口

题目类型：

| 类型               | 含义   |
| ------------------ | ------ |
| `singleChoice`   | 单选题 |
| `multipleChoice` | 多选题 |
| `text`           | 文本题 |
| `number`         | 数字题 |

校验字段：

| 题型               | 可用的 `validation` 字段                  |
| ------------------ | ------------------------------------------- |
| `singleChoice`   | 无                                          |
| `multipleChoice` | `minSelections`、`maxSelections`        |
| `text`           | `minLength`、`maxLength`                |
| `number`         | `minValue`、`maxValue`、`integerOnly` |

与题型无关的校验字段不会保存或返回。

### 7.1 创建题目

```http
POST /api/surveys/:surveyId/questions
```

需要登录。

只有当前用户拥有的草稿问卷可以添加题目。题目顺序由服务端自动设置。

创建单选题：

```json
{
  "type": "singleChoice",
  "title": "你目前所在的年级是？",
  "required": true,
  "options": [
    {
      "label": "大学一年级"
    },
    {
      "label": "大学二年级"
    }
  ]
}
```

创建多选题：

```json
{
  "type": "multipleChoice",
  "title": "你经常使用哪些学习方式？",
  "required": false,
  "options": [
    {
      "label": "课堂听讲"
    },
    {
      "label": "自主学习"
    },
    {
      "label": "小组讨论"
    }
  ],
  "validation": {
    "minSelections": 1,
    "maxSelections": 2
  }
}
```

创建文本题：

```json
{
  "type": "text",
  "title": "请简要描述你的学习计划。",
  "required": true,
  "validation": {
    "minLength": 2,
    "maxLength": 200
  }
}
```

创建数字题：

```json
{
  "type": "number",
  "title": "你每天平均学习多少小时？",
  "required": true,
  "validation": {
    "minValue": 0,
    "maxValue": 24,
    "integerOnly": false
  }
}
```

字段说明：

| 字段                   | 类型    | 必填       | 规则                     |
| ---------------------- | ------- | ---------- | ------------------------ |
| `type`               | String  | 是         | 四种支持的题型之一       |
| `title`              | String  | 是         | 非空，最长 500 个字符    |
| `required`           | Boolean | 否         | 默认 `false`           |
| `options`            | Array   | 选择题必填 | 选择题至少两个选项       |
| `options[].optionId` | String  | 否         | 未提供时由服务端生成     |
| `options[].label`    | String  | 选择题必填 | 非空，最长 200 个字符    |
| `validation`         | Object  | 否         | 根据题型筛选字段         |
| `jumpRules`          | Array   | 否         | 创建时只能省略或传空数组 |

成功状态码：

```http
201 Created
```

成功响应示例：

```json
{
  "question": {
    "id": "66f000000000000000000101",
    "surveyId": "66f000000000000000000010",
    "order": 1,
    "type": "singleChoice",
    "title": "你目前所在的年级是？",
    "required": true,
    "options": [
      {
        "optionId": "16fdd53b3b79",
        "label": "大学一年级"
      },
      {
        "optionId": "9f17f1556b10",
        "label": "大学二年级"
      }
    ],
    "validation": {},
    "jumpRules": [],
    "createdAt": "2030-01-01T08:00:00.000Z",
    "updatedAt": "2030-01-01T08:00:00.000Z"
  }
}
```

常见错误：

| 状态码 | 情况                       | 示例响应信息                                                |
| ------ | -------------------------- | ----------------------------------------------------------- |
| 404    | 问卷不存在或不属于当前用户 | `问卷不存在或不属于当前用户`                              |
| 409    | 问卷不是草稿               | `只有草稿问卷可以添加题目`                                |
| 400    | 题型无效                   | `题型只能是 singleChoice、multipleChoice、text 或 number` |
| 400    | 标题为空                   | `题目内容不能为空`                                        |
| 400    | 选择题选项不足             | `单选题和多选题至少需要两个选项`                          |
| 400    | 非选择题包含选项           | `文本题和数字题不能包含选项`                              |
| 400    | 创建时直接提供规则         | `请先创建题目，再单独配置跳转规则`                        |
| 409    | 并发创建造成顺序冲突       | `题目顺序冲突，请重新提交`                                |

### 7.2 查询问卷题目列表

```http
GET /api/surveys/:surveyId/questions
```

需要登录。

只能查询当前用户拥有的问卷。

成功状态码：

```http
200 OK
```

成功响应：

```json
{
  "questions": [
    {
      "id": "66f000000000000000000101",
      "surveyId": "66f000000000000000000010",
      "order": 1,
      "type": "singleChoice",
      "title": "你目前所在的年级是？",
      "required": true,
      "options": [
        {
          "optionId": "16fdd53b3b79",
          "label": "大学一年级"
        }
      ],
      "validation": {},
      "jumpRules": [],
      "createdAt": "2030-01-01T08:00:00.000Z",
      "updatedAt": "2030-01-01T08:00:00.000Z"
    }
  ],
  "total": 1
}
```

问卷不存在或不属于当前用户时返回：

```http
404 Not Found
```

```json
{
  "message": "问卷不存在或不属于当前用户"
}
```

### 7.3 编辑题目

```http
PATCH /api/surveys/:surveyId/questions/:questionId
```

需要登录。

只有当前用户拥有的草稿问卷可以编辑题目。

可编辑字段：

- `type`
- `title`
- `required`
- `options`
- `validation`

请求示例：

```json
{
  "title": "你目前所在的年级是？（修改后）",
  "required": true,
  "options": [
    {
      "optionId": "16fdd53b3b79",
      "label": "大学一年级"
    },
    {
      "optionId": "9f17f1556b10",
      "label": "大学二年级"
    }
  ]
}
```

编辑选择题时，应传回原来的 `optionId`，这样可以保持选项标识稳定。

不能通过此接口修改 `jumpRules`。跳转规则必须使用专用接口。

成功状态码：

```http
200 OK
```

成功响应：

```json
{
  "question": {
    "id": "66f000000000000000000101",
    "surveyId": "66f000000000000000000010",
    "order": 1,
    "type": "singleChoice",
    "title": "你目前所在的年级是？（修改后）",
    "required": true,
    "options": [
      {
        "optionId": "16fdd53b3b79",
        "label": "大学一年级"
      },
      {
        "optionId": "9f17f1556b10",
        "label": "大学二年级"
      }
    ],
    "validation": {},
    "jumpRules": [],
    "createdAt": "2030-01-01T08:00:00.000Z",
    "updatedAt": "2030-01-02T08:00:00.000Z"
  }
}
```

常见错误：

| 状态码 | 情况                       | 响应信息                         |
| ------ | -------------------------- | -------------------------------- |
| 404    | 问卷不存在或不属于当前用户 | `问卷不存在或不属于当前用户`   |
| 409    | 问卷不是草稿               | `只有草稿问卷可以编辑题目`     |
| 404    | 题目不存在或不属于该问卷   | `题目不存在`                   |
| 400    | 包含 `jumpRules`         | `跳转规则必须通过专用接口配置` |
| 400    | 没有可编辑字段             | `没有提供可编辑的题目字段`     |

### 7.4 删除题目

```http
DELETE /api/surveys/:surveyId/questions/:questionId
```

需要登录。

只有当前用户拥有的草稿问卷可以删除题目。

如果其他题目的 `goto` 规则正在引用该题目，删除会被拒绝。

成功状态码：

```http
200 OK
```

成功响应：

```json
{
  "message": "题目删除成功",
  "deletedQuestionId": "66f000000000000000000105",
  "remainingQuestions": 4
}
```

常见错误：

| 状态码 | 情况                       | 响应信息                               |
| ------ | -------------------------- | -------------------------------------- |
| 404    | 问卷不存在或不属于当前用户 | `问卷不存在或不属于当前用户`         |
| 409    | 问卷不是草稿               | `只有草稿问卷可以删除题目`           |
| 404    | 题目不存在                 | `题目不存在`                         |
| 409    | 题目正在被规则引用         | `该题目正在被跳转规则引用，不能删除` |

### 7.5 配置跳转规则

```http
PUT /api/surveys/:surveyId/questions/:questionId/jump-rules
```

需要登录。

只有当前用户拥有的草稿问卷可以配置跳转规则。

请求体必须完整提供该题目的全部规则：

```json
{
  "jumpRules": [
    {
      "operator": "equals",
      "value": "16fdd53b3b79",
      "action": "goto",
      "targetQuestionId": "66f000000000000000000103",
      "priority": 0
    },
    {
      "operator": "equals",
      "value": "9f17f1556b10",
      "action": "submit",
      "priority": 1
    }
  ]
}
```

规则字段：

| 字段                 | 类型    | 必填          | 说明                              |
| -------------------- | ------- | ------------- | --------------------------------- |
| `operator`         | String  | 是            | 条件操作符                        |
| `value`            | Mixed   | 是            | 选项 ID、选项 ID 数组、文本或数字 |
| `action`           | String  | 是            | `goto` 或 `submit`            |
| `targetQuestionId` | String  | `goto` 必填 | 目标必须是同一问卷的后续题目      |
| `priority`         | Integer | 否            | 非负整数；省略时使用数组位置      |

支持的操作符：

| 题型               | 操作符                                       |
| ------------------ | -------------------------------------------- |
| `singleChoice`   | `equals`                                   |
| `multipleChoice` | `containsAny`、`containsAll`             |
| `text`           | `equals`                                   |
| `number`         | `equals`、`gt`、`gte`、`lt`、`lte` |

多选规则示例：

```json
{
  "operator": "containsAny",
  "value": [
    "option-id-a",
    "option-id-b"
  ],
  "action": "goto",
  "targetQuestionId": "66f000000000000000000104",
  "priority": 0
}
```

数字规则示例：

```json
{
  "operator": "gte",
  "value": 8,
  "action": "submit",
  "priority": 0
}
```

成功状态码：

```http
200 OK
```

成功响应：

```json
{
  "question": {
    "id": "66f000000000000000000101",
    "surveyId": "66f000000000000000000010",
    "order": 1,
    "type": "singleChoice",
    "title": "你目前所在的年级是？",
    "required": true,
    "options": [
      {
        "optionId": "16fdd53b3b79",
        "label": "大学一年级"
      },
      {
        "optionId": "9f17f1556b10",
        "label": "大学二年级"
      }
    ],
    "validation": {},
    "jumpRules": [
      {
        "operator": "equals",
        "value": "16fdd53b3b79",
        "action": "goto",
        "targetQuestionId": "66f000000000000000000103",
        "priority": 0
      }
    ],
    "createdAt": "2030-01-01T08:00:00.000Z",
    "updatedAt": "2030-01-02T08:00:00.000Z"
  }
}
```

主要校验规则：

- 同一道题的优先级不能重复。
- 单选规则必须使用有效 `optionId`。
- 多选规则的 `value` 必须是无重复项的有效 `optionId` 数组。
- 数字规则的值必须是有限数字。
- `goto` 必须设置有效目标。
- `goto` 只能跳转到同一问卷的后续题目。
- `submit` 不能设置 `targetQuestionId`。
- 规则不能形成循环。

常见错误：

| 状态码 | 情况                   | 示例响应信息                                 |
| ------ | ---------------------- | -------------------------------------------- |
| 409    | 问卷不是草稿           | `只有草稿问卷可以配置跳转规则`             |
| 400    | `jumpRules` 不是数组 | `jumpRules 必须是数组`                     |
| 400    | 操作符不支持           | `题型 number 不支持操作符 containsAny`     |
| 400    | 规则值无效             | `单选题规则的 value 必须是有效的 optionId` |
| 400    | 目标是自身             | `题目不能跳转到自身`                       |
| 400    | 目标属于其他问卷       | `跳转目标必须属于同一份问卷`               |
| 400    | 向前跳转               | `goto 只能跳转到后续题目`                  |
| 400    | `submit` 包含目标    | `submit 规则不能设置 targetQuestionId`     |
| 409    | 形成循环               | `跳转规则不能形成循环`                     |

## 8 公开问卷和答卷接口

### 8.1 公开读取问卷

```http
GET /api/public/surveys/:publicId
```

不需要登录。

只有状态为 `published` 且未超过截止时间的问卷可以公开读取。

成功状态码：

```http
200 OK
```

成功响应：

```json
{
  "survey": {
    "publicId": "113ce77197840cf9",
    "title": "大学生学习情况调查",
    "description": "用于了解大学生的学习时间和学习方式",
    "allowAnonymous": true,
    "allowMultipleSubmissions": false,
    "deadline": "2030-12-31T15:59:59.000Z",
    "schemaVersion": 1,
    "publishedAt": "2030-01-02T08:00:00.000Z"
  },
  "questions": [
    {
      "id": "66f000000000000000000101",
      "order": 1,
      "type": "singleChoice",
      "title": "你目前所在的年级是？",
      "required": true,
      "options": [
        {
          "optionId": "16fdd53b3b79",
          "label": "大学一年级"
        }
      ],
      "validation": {},
      "jumpRules": [
        {
          "operator": "equals",
          "value": "16fdd53b3b79",
          "action": "goto",
          "targetQuestionId": "66f000000000000000000103",
          "priority": 0
        }
      ]
    }
  ]
}
```

公开响应不会返回：

- `ownerId`
- 创建者用户名
- 内部问卷 `_id`
- 填写者身份
- 答卷数据

可能的错误：

| 状态码 | 情况                     | 响应信息                     |
| ------ | ------------------------ | ---------------------------- |
| 404    | 编号不存在、草稿或已关闭 | `公开问卷不存在或尚未发布` |
| 410    | 超过截止时间             | `问卷已超过截止时间`       |

### 8.2 提交答卷

```http
POST /api/public/surveys/:publicId/responses
```

需要登录。

单选题答案使用一个 `optionId`：

```json
{
  "questionId": "66f000000000000000000101",
  "value": "16fdd53b3b79"
}
```

多选题答案使用 `optionId` 数组：

```json
{
  "questionId": "66f000000000000000000102",
  "value": [
    "option-id-a",
    "option-id-b"
  ]
}
```

文本题答案使用字符串：

```json
{
  "questionId": "66f000000000000000000103",
  "value": "每天按照学习计划完成任务"
}
```

数字题答案使用 JSON 数字：

```json
{
  "questionId": "66f000000000000000000104",
  "value": 5
}
```

完整请求体示例：

```json
{
  "anonymous": true,
  "answers": [
    {
      "questionId": "66f000000000000000000101",
      "value": "16fdd53b3b79"
    },
    {
      "questionId": "66f000000000000000000103",
      "value": "每天按照学习计划完成任务"
    },
    {
      "questionId": "66f000000000000000000104",
      "value": 5
    }
  ]
}
```

字段说明：

| 字段                     | 类型    | 必填 | 说明                             |
| ------------------------ | ------- | ---- | -------------------------------- |
| `anonymous`            | Boolean | 否   | 默认 `false`；问卷必须允许匿名 |
| `answers`              | Array   | 是   | 实际填写路径上的答案             |
| `answers[].questionId` | String  | 是   | 题目 ID                          |
| `answers[].value`      | Mixed   | 是   | 根据题型使用不同类型             |

提交规则：

- 问卷必须处于 `published` 状态。
- 问卷不能超过截止时间。
- 填写者必须登录。
- 答案必须属于当前问卷。
- 同一道题不能提交多个答案。
- 必答题必须填写。
- 每个答案必须通过题型校验。
- 被跳过的题目不要求回答。
- 不能提交填写路径中未访问的题目。
- `anonymous: true` 只在问卷允许匿名时有效。
- 禁止重复提交时，同一用户只能成功提交一次。
- 允许重复提交时，不创建唯一提交键，可以保存多份答卷。

成功状态码：

```http
201 Created
```

成功响应：

```json
{
  "message": "答卷提交成功",
  "response": {
    "id": "66f000000000000000000201",
    "anonymous": true,
    "answerCount": 3,
    "visitedQuestionIds": [
      "66f000000000000000000101",
      "66f000000000000000000103",
      "66f000000000000000000104"
    ],
    "surveyVersion": 1,
    "submittedAt": "2030-01-03T08:00:00.000Z"
  }
}
```

提交成功响应不会返回：

- `respondentId`
- 用户名
- `uniqueSubmissionKey`
- 密码或密码哈希

常见错误：

| 状态码 | 情况                     | 示例响应信息                       |
| ------ | ------------------------ | ---------------------------------- |
| 401    | 未登录                   | `缺少有效的登录令牌`             |
| 404    | 问卷不存在、草稿或已关闭 | `公开问卷不存在或尚未发布`       |
| 410    | 超过截止时间             | `问卷已超过截止时间`             |
| 400    | 问卷不允许匿名           | `该问卷不允许匿名提交`           |
| 400    | `answers` 不是数组     | `answers 必须是数组`             |
| 400    | 缺少必答题               | `题目名称：该题为必答题`         |
| 400    | 选项无效                 | `题目名称：请选择有效选项`       |
| 400    | 多选数量不足             | `题目名称：至少选择 N 项`        |
| 400    | 文本超过限制             | `题目名称：不能超过 N 个字符`    |
| 400    | 数字超出范围             | `题目名称：不能大于 N`           |
| 400    | 包含未访问题目           | `答案包含填写路径中未访问的题目` |
| 409    | 禁止重复提交时再次提交   | `该用户已经提交过此问卷`         |

## 9 统计接口

### 9.1 查询整份问卷统计

```http
GET /api/surveys/:surveyId/statistics
```

需要登录。

只有问卷创建者能够访问。草稿、已发布和已关闭问卷均可以由创建者查看统计。

成功状态码：

```http
200 OK
```

成功响应示例：

```json
{
  "survey": {
    "id": "66f000000000000000000010",
    "title": "大学生学习情况调查",
    "status": "published"
  },
  "responseCount": 1,
  "questionCount": 4,
  "questions": [
    {
      "questionId": "66f000000000000000000101",
      "order": 1,
      "type": "singleChoice",
      "title": "你目前所在的年级是？",
      "totalAnswers": 1,
      "notAnsweredCount": 0,
      "options": [
        {
          "optionId": "16fdd53b3b79",
          "label": "大学一年级",
          "count": 1
        },
        {
          "optionId": "9f17f1556b10",
          "label": "大学二年级",
          "count": 0
        }
      ]
    },
    {
      "questionId": "66f000000000000000000102",
      "order": 2,
      "type": "multipleChoice",
      "title": "你经常使用哪些学习方式？",
      "totalAnswers": 0,
      "notAnsweredCount": 1,
      "options": [
        {
          "optionId": "option-id-a",
          "label": "课堂听讲",
          "count": 0
        }
      ]
    },
    {
      "questionId": "66f000000000000000000103",
      "order": 3,
      "type": "text",
      "title": "请简要描述你的学习计划。",
      "totalAnswers": 1,
      "notAnsweredCount": 0,
      "values": [
        "每天按照学习计划完成任务"
      ]
    },
    {
      "questionId": "66f000000000000000000104",
      "order": 4,
      "type": "number",
      "title": "你每天平均学习多少小时？",
      "totalAnswers": 1,
      "notAnsweredCount": 0,
      "values": [
        5
      ],
      "average": 5
    }
  ]
}
```

字段说明：

| 字段                 | 含义                                            |
| -------------------- | ----------------------------------------------- |
| `responseCount`    | 当前问卷保存的答卷总数                          |
| `questionCount`    | 本次返回的题目数量                              |
| `totalAnswers`     | 回答了该题的答卷数量                            |
| `notAnsweredCount` | `responseCount - totalAnswers`                |
| `options[].count`  | 选项被选择的次数                                |
| `values`           | 文本或数字答案列表                              |
| `average`          | 有效数字答案的平均值；没有数字答案时为 `null` |

数字统计 API 返回 `values` 和 `average`。统计前端使用 `values` 计算并显示最小值和最大值。

`notAnsweredCount` 不能直接解释为“跳过数量”，因为未回答可能由条件跳转造成，也可能是非必答题没有填写。

### 9.2 查询单道题统计

```http
GET /api/surveys/:surveyId/statistics?questionId=:questionId
```

需要登录。

请求示例：

```http
GET /api/surveys/66f000000000000000000010/statistics?questionId=66f000000000000000000102
```

成功响应与整份统计结构相同，但：

- `questionCount` 为 `1`。
- `questions` 只包含指定题目。
- `responseCount` 仍然是整份问卷的答卷总数。

可能的错误：

| 状态码 | 情况                       | 响应信息                       |
| ------ | -------------------------- | ------------------------------ |
| 400    | `questionId` 格式无效    | `questionId 格式无效`        |
| 404    | 问卷不存在或不属于当前用户 | `问卷不存在或不属于当前用户` |
| 404    | 题目不存在或不属于该问卷   | `题目不存在或不属于该问卷`   |

统计响应不会返回：

- `respondentId`
- 答卷者用户名
- `uniqueSubmissionKey`
- 单份答卷的填写者身份

## 10 通用状态码

| 状态码 | 含义                             |
| ------ | -------------------------------- |
| 200    | 查询或修改成功                   |
| 201    | 创建或提交成功                   |
| 400    | 请求参数、答案或业务校验失败     |
| 401    | 未登录、令牌无效或登录用户不存在 |
| 404    | 资源不存在或资源不属于当前用户   |
| 409    | 状态冲突、重复提交或唯一索引冲突 |
| 410    | 问卷已超过截止时间               |
| 500    | 未处理的服务器内部错误           |

未知接口返回：

```http
404 Not Found
```

```json
{
  "message": "接口不存在"
}
```

未处理的服务端错误返回：

```http
500 Internal Server Error
```

```json
{
  "message": "服务器内部错误"
}
```

## 11 PowerShell 调用示例

### 11.1 登录并保存令牌

```powershell
$loginBody = @{
    username = 'student01'
    password = 'Test123456!'
} | ConvertTo-Json

$loginResult = Invoke-RestMethod `
    -Uri 'http://localhost:3000/api/auth/login' `
    -Method Post `
    -ContentType 'application/json; charset=utf-8' `
    -Body $loginBody

$token = $loginResult.token
```

### 11.2 携带令牌读取本人问卷

```powershell
Invoke-RestMethod `
    -Uri 'http://localhost:3000/api/surveys?page=1&limit=50' `
    -Method Get `
    -Headers @{
        Authorization = "Bearer $token"
    }
```

### 11.3 使用 UTF-8 字节请求体创建中文问卷

```powershell
$surveyJson = @{
    title = '大学生学习情况调查'
    description = '用于了解学习情况'
    allowAnonymous = $true
    allowMultipleSubmissions = $false
} | ConvertTo-Json -Depth 10

$surveyBody = [System.Text.Encoding]::UTF8.GetBytes(
    $surveyJson
)

Invoke-RestMethod `
    -Uri 'http://localhost:3000/api/surveys' `
    -Method Post `
    -ContentType 'application/json; charset=utf-8' `
    -Headers @{
        Authorization = "Bearer $token"
    } `
    -Body $surveyBody
```

在 Windows PowerShell 中提交中文 JSON 时，使用 UTF-8 字节数组可以避免中文请求体编码错误。
