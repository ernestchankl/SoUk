# 蘇屋排球隊Stat App

手機優先的排球比賽記錄與分析工具。用簡化代碼記每一球，系統會自動計分，並算出攻擊效率、舉球、接發、Side-out 與 Break point。

資料存在瀏覽器本機，不需要帳號。

## 功能

- 建立比賽、雙方名單（背號、姓名、位置）
- 即時記錄台：發球、接發、舉球、攻擊、攔網、防守、自由球
- 簡化評價代碼：`# + ! - / =`
- 終結球自動得分（例如 `A#` 扣死、`S=` 發球失誤、`B#` 攔死）
- 來不及記細節時可用「+1」快速得分
- 撤銷上一筆
- 賽後分析：攻擊、發球、接發、舉球、攔網
- 匯出一頁 A4 比賽報告（列印 / 存成 PDF，或下載 HTML）
- 仍可匯入舊的 JSON 備份
- 內建一場示範賽，打開就能看分析

## 本機執行

需要 Node.js 20 或以上（GitHub Actions 使用 Node 24）。

```bash
npm install
npm run dev
```

瀏覽器開啟 [http://127.0.0.1:43123](http://127.0.0.1:43123)。

正式建置（靜態檔在 `out/`）：

```bash
npm run build
npm start
```

## 免費上線（不需要 Vercel Pro）

這個 App 沒有後端，資料存在手機瀏覽器，適合靜態託管。

**GitHub Pages（建議，完全免費）**

1. 把程式推到 `https://github.com/ernestchankl/VBData.git` 的 `main`
2. GitHub → Settings → Pages → Build and deployment → Source 選 **GitHub Actions**
3. 推送後 Actions 會自動發布

網址會是：https://ernestchankl.github.io/VBData/

**其他免費方案**

| 平台 | 費用 | 備註 |
| --- | --- | --- |
| GitHub Pages | 免費 | 已內建 Actions 工作流程 |
| Cloudflare Pages | 免費 | 連 GitHub 後選 Framework preset `Next.js (Static HTML Export)` |
| Netlify | 免費 | 連 GitHub，Build `npm run build`，Publish `out` |
| Vercel Hobby | 免費 | **不必 Pro**；Hobby 就能託管這個 App |

## 記錄方式

用簡化代碼記每一球：

- `*` 主隊、`a` 客隊
- 兩位數背號
- 技術代碼
- 評價

例如 `*12A#` 表示主隊 12 號攻擊得分。

會結束這一分的評價：

| 技術 | 終結 |
| --- | --- |
| 發球 S | `#` ACE、`=` 失誤 |
| 攻擊 A | `#` 扣死、`=` 失誤、`/` 被攔 |
| 攔網 B | `#` 攔死、`=` 犯規 |
| 接發 / 舉球 / 防守 | `=` 直接失分 |

計分採每球得分制。一般局 25 分、決勝局 15 分，需領先 2 分。

## 比賽報告

分析頁可開啟一頁 A4 報告，內容包含局分、雙方效率（含舉球）與球員表。

- **列印 / 存成 PDF**：打開系統列印對話框，印表機選「儲存為 PDF」或「Microsoft Print to PDF」。中文會跟瀏覽器字型一起印，不需要另外裝 PDF 套件。
- **下載 HTML**：之後用任何瀏覽器打開同一份報告再印。

## 技術

Next.js、TypeScript、Tailwind CSS、shadcn/ui。比賽資料寫入 `localStorage`。
