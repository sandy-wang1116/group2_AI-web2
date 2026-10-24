# 信託節稅獲利雙贏模型（純靜態網站）
檔案：index.html／assets/css/style.css／assets/js/tax-config.js（贈與稅參數）／assets/js/app.js（計算與畫面）
本機預覽：雙擊 index.html，或 `python3 -m http.server 8080`。
部署：GitHub Pages（注意：Pages 資料夾模式只認「/ (root)」或「/docs」，若以資料夾部署請將 doc 改名為 docs，或把內容放 repo 根目錄）、Netlify／Cloudflare Pages（拖曳資料夾）、或內網 Nginx／IIS 靜態目錄。無外部 CDN，可離線運作。
維護：財政部每年11月底公告次年免稅額與級距，只需改 tax-config.js；折現利率（郵局一年期定儲固定利率，現行 1.725%）可於頁面調整，實際以贈與日牌告為準。
