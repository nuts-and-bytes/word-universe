# 单词宇宙 · Word Universe

把自己添加的单词画成可探索的星空，记录释义、例句和掌握程度。

[打开应用](https://nuts-and-bytes.github.io/word-universe/app/) · [项目首页](https://nuts-and-bytes.github.io/word-universe/) · [English](#english)

## 可以做什么

| 功能 | 使用结果 |
| --- | --- |
| 添加与搜索 | 保存单词、语言、释义、例句和标签 |
| 星空探索 | 通过 D3 力导向图拖拽、缩放和查看单词关系 |
| 掌握程度 | 用 0–3 级标记复习状态 |
| 可选语义向量 | 配置 OpenAI 后获取向量；未配置或调用失败时使用本地回退算法 |

默认的分类与回退算法是启发式处理，不代表经过模型验证的语义关系，也没有记忆效率提升的实测承诺。

## 本地运行

需要 Python 3，无需数据库或后端服务。

```sh
git clone https://github.com/nuts-and-bytes/word-universe.git
cd word-universe
python3 -m http.server 8000
```

打开 <http://localhost:8000/app/>。第一次使用可以先不配置 API Key，添加几个单词后查看星空和掌握度。

## AI、费用与数据

- 当前代码仅接入 OpenAI 的 embeddings 接口，使用 `text-embedding-3-small` 并截取返回向量的前 16 维参与计算；没有实现 MiniMax 向量接口。
- API Key 可通过应用设置填写，保存在当前浏览器 LocalStorage。启用后，新增单词会发送给 OpenAI，并可能产生该服务的 API 费用。
- 没有配置 Key 或请求失败时使用本地回退算法；回退不是实际模型推理。
- 单词与设置保存在当前浏览器，不会自动跨设备同步。清除站点数据或重置单词会删除记录，不能承诺数据永不丢失。
- 静态页面及依赖可能需要联网加载；本轮没有验证完整离线体验或真实模型调用。

## 结构、反馈与许可

- `app/app.js`：单词保存、分类、语义向量与星空交互。
- `app/index.html`、`app/style.css`：应用界面。
- `screenshots/`：已有截图，可能早于当前版本。
- [.github/workflows/pages.yml](.github/workflows/pages.yml)：`main` 的静态站点发布流程。

问题或使用反馈可提交 [Issue](https://github.com/nuts-and-bytes/word-universe/issues)。当前仓库没有独立 `LICENSE` 文件，许可证待维护者明确。

## English

Word Universe visualizes your vocabulary as an interactive galaxy. Add definitions, examples and tags, then track mastery from 0 to 3. [Try it](https://nuts-and-bytes.github.io/word-universe/app/), or serve this repository with `python3 -m http.server 8000` and open `/app/`.

It works without an API key using local heuristic fallback. Optional OpenAI embeddings send added words to OpenAI and may incur API charges; the implementation uses the first 16 returned dimensions. MiniMax is not implemented. Vocabulary and API settings use browser LocalStorage, with no automatic sync or guarantee against data loss. Full offline use and live model calls have not been verified in this documentation update. No standalone LICENSE file is currently present.
