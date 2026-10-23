// 稅制參數：民國115年（2026）。每年11月底財政部公告次年數值，僅需更新此檔。
// 來源：財政部115年度遺產稅及贈與稅免稅額、扣除額、課稅級距公告；遺產及贈與稅法第10-1、13、19條。
window.TAX = {
  year: 115,
  estate: {
    exemption: 1333, spouse: 553, child: 56, funeral: 138, minorExtraPerYear: 56,
    brackets: [{upTo: 5621, rate: .10, base: 0}, {upTo: 11242, rate: .15, base: 562.1}, {upTo: Infinity, rate: .20, base: 1405.25}],
    lowerBound: [0, 5621, 11242]
  },
  gift: {
    exemption: 244,
    brackets: [{upTo: 2811, rate: .10, base: 0}, {upTo: 5621, rate: .15, base: 281.1}, {upTo: Infinity, rate: .20, base: 702.6}],
    lowerBound: [0, 2811, 5621]
  },
  defaults: {discountRate: 1.725, usd: 31.5, jpy: 0.21}
};
