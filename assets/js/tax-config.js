// 稅制參數：民國115年（2026）贈與稅。每年11月底財政部公告次年數值，僅需更新此檔。
window.TAX = {
  year: 115,
  gift: {
    exemption: 244,
    brackets: [{upTo: 2811, rate: .10, base: 0}, {upTo: 5621, rate: .15, base: 281.1}, {upTo: Infinity, rate: .20, base: 702.6}]
  },
  // 115年度綜合所得稅（財政部114/11/27公告，單位：萬元）；累進差額＝速算公式
  income: {exemption: 10.1, standard: 13.6, settlorRate: 0.40,
    brackets: [{upTo: 61, rate: .05, diff: 0}, {upTo: 138, rate: .12, diff: 4.27}, {upTo: 277, rate: .20, diff: 15.31}, {upTo: 519, rate: .30, diff: 43.01}, {upTo: Infinity, rate: .40, diff: 94.91}]},
  defaults: {discountRate: 1.725, usd: 31.5, jpy: 0.21, yieldRate: 5}
};
