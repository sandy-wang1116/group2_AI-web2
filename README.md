# 傳承規劃輔助與信託情境試算（純靜態網站）

## 檔案結構
index.html／assets/css/style.css／assets/js/tax-config.js（稅制參數）／assets/js/app.js（計算與畫面）

## 本機預覽
直接雙擊 index.html，或在資料夾執行 `python3 -m http.server 8080` 後開啟 http://localhost:8080

## 部署（擇一）
- GitHub Pages：推到 repo → Settings → Pages → 選 main 分支根目錄
- Netlify／Cloudflare Pages：拖曳整個資料夾上傳，無需 build
- 銀行內網：將資料夾放入 Nginx／IIS 靜態目錄即可；無外部 CDN、字型或 API，可離線運作

## 每年維護
財政部每年 11 月底公告次年免稅額、扣除額與課稅級距，只需修改 tax-config.js；
折現利率（郵局一年期定儲固定利率，目前 1.725%）亦於試算頁「進階假設」可手動調整，實際應以贈與日牌告為準。

## 法源（中華民國現行）
遺產及贈與稅法第 3-2、10-1、12-1、13、15、19 條；財政部 115 年度遺產稅及贈與稅免稅額、扣除額、課稅級距公告。
