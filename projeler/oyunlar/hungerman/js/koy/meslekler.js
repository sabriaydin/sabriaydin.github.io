/* HungerMan - köylü meslekleri: görünüm renkleri, takas listeleri, görev havuzları
   Takas: ver = oyuncunun verdikleri, al = oyuncunun aldığı. 288 = Sikke. */
const S = 288;
const tk = (ver, al) => ({ ver, al });

export const MESLEKLER = {
  ciftci: {
    ad: 'Çiftçi', gomlek: '#7a9a3a', pantolon: '#5a4630', sapka: '#d8b85a',
    sabit: [tk([[291, 20]], [S, 1]), tk([[S, 1]], [293, 4])],
    havuz: [tk([[265, 16]], [S, 1]), tk([[S, 1]], [266, 4]), tk([[S, 1]], [292, 10]), tk([[36, 6]], [S, 1]), tk([[S, 2]], [52, 2]),
      tk([[328, 15]], [S, 1]), tk([[329, 15]], [S, 1]), tk([[S, 1]], [328, 6]), tk([[S, 1]], [330, 4]), tk([[S, 3]], [342, 1]), tk([[S, 2]], [104, 6])],
    gorev: [['getir', 291, 16], ['getir', 265, 20], ['getir', 266, 6], ['oldur', 'zombi', 4], ['mektup'], ['getir', 328, 16], ['getir', 329, 16]],
    soz: ['Hasat zamanı bütün köy tarladadır.', 'Toprağı iyi işleyen, ekmeğini eksik etmez.', 'Tohum ekmeyi unutmayınız; buğday kendiliğinden yetişmez.']
  },
  kasap: {
    ad: 'Kasap', gomlek: '#b8463c', pantolon: '#3c3c48', onluk: '#ece8e0',
    sabit: [tk([[271, 6]], [S, 1]), tk([[S, 1]], [272, 3])],
    havuz: [tk([[275, 8]], [S, 1]), tk([[273, 6]], [S, 1]), tk([[S, 1]], [274, 3]), tk([[257, 15]], [S, 1]), tk([[277, 7]], [S, 1])],
    gorev: [['getir', 271, 8], ['getir', 273, 8], ['getir', 282, 6], ['oldur', 'kurt', 3]],
    soz: ['Taze et, iyi bir kamp ateşinde pişirilmelidir.', 'Çiğ et yemek akıllıca değildir.', 'Çürük eti bana getirmeyiniz; şifacıya götürünüz.']
  },
  demirci: {
    ad: 'Demirci', gomlek: '#4a4a52', pantolon: '#2e2e34', onluk: '#5a3a22',
    sabit: [tk([[257, 12]], [S, 1]), tk([[261, 4]], [S, 1])],
    havuz: [tk([[264, 1]], [S, 5]), tk([[S, 12]], [139, 1]), tk([[S, 6]], [315, 1]), tk([[S, 5]], [312, 1]), tk([[S, 9]], [409, 1]), tk([[S, 4]], [408, 1]), tk([[S, 3]], [259, 6]), tk([[S, 14]], [264, 1]), tk([[S, 8]], [515, 2]), tk([[S, 4]], [473, 1])],
    gorev: [['getir', 261, 6], ['getir', 257, 24], ['getir', 264, 1], ['getir', 259, 10], ['getir', 61, 4], ['oldur', 'iskelet', 4]],
    soz: ['Ocak hiç sönmez; kömür her zaman gereklidir.', 'İyi bir kılıç, iyi bir dosttur.', 'Demir, bakırdan sonra gelir; aceleye gerek yoktur.']
  },
  oduncu: {
    ad: 'Oduncu', gomlek: '#a8342c', pantolon: '#3e4a5e', sapka: '#5a3a22',
    sabit: [tk([[8, 12]], [S, 1]), tk([[S, 1]], [46, 12])],
    havuz: [tk([[256, 32]], [S, 1]), tk([[S, 2]], [50, 1]), tk([[S, 1]], [88, 2]), tk([[S, 1]], [110, 6]), tk([[S, 3]], [47, 1]), tk([[S, 1]], [48, 1]), tk([[S, 4]], [305, 1]), tk([[10, 12]], [S, 1])],
    gorev: [['getir', 8, 24], ['getir', 10, 16], ['getir', 256, 32], ['oldur', 'zombi', 5], ['mektup']],
    soz: ['Kesilen her ağacın yerine bir fidan dikilmelidir.', 'Gece ormanda dolaşmak tehlikelidir.', 'Meşale olmadan mağaraya girilmez.']
  },
  sifaci: {
    ad: 'Şifacı', gomlek: '#6a3e8a', pantolon: '#4a2e62', uzun: true,
    sabit: [tk([[S, 1]], [268, 2]), tk([[S, 3]], [289, 1])],
    havuz: [tk([[281, 10]], [S, 1]), tk([[36, 5]], [S, 1]), tk([[S, 1]], [331, 4]), tk([[S, 5]], [332, 1]), tk([[S, 5]], [333, 1]), tk([[S, 6]], [335, 1]), tk([[S, 7]], [140, 1]), tk([[295, 8]], [S, 1]), tk([[S, 8]], [290, 1]), tk([[263, 2]], [S, 1]), tk([[265, 12]], [S, 1])],
    gorev: [['getir', 36, 6], ['getir', 281, 12], ['oldur', 'zombi', 6], ['mektup'], ['getir', 295, 10], ['oldur', 'orumcek', 4]],
    soz: ['Yaralarınızı ihmal etmeyiniz.', 'Mantar ve böğürtlen birçok derde devadır.', 'Uyku, en iyi ilaçtır.']
  },
  avci: {
    ad: 'Avcı', gomlek: '#4a6a3a', pantolon: '#5a4a32', sapka: '#3a4a2a',
    sabit: [tk([[282, 6]], [S, 1]), tk([[S, 1]], [287, 12])],
    havuz: [tk([[283, 10]], [S, 1]), tk([[S, 3]], [286, 1]), tk([[S, 4]], [401, 1]), tk([[279, 4]], [S, 1]), tk([[S, 2]], [400, 1])],
    gorev: [['getir', 283, 12], ['getir', 282, 8], ['oldur', 'kurt', 4], ['oldur', 'zombi', 8], ['oldur', 'iskelet', 5], ['oldur', 'orumcek', 5]],
    soz: ['Kurtlara saldırmadıkça size dokunmazlar.', 'Ok ile uzaktan avlanmak daha güvenlidir.', 'Tavşanlar hızlıdır; sabırlı olunuz.']
  },
  balikci: {
    ad: 'Balıkçı', gomlek: '#3a6a8a', pantolon: '#2e3a4a', sapka: '#e0b83a',
    sabit: [tk([[297, 6]], [S, 1]), tk([[S, 3]], [453, 1])],
    havuz: [tk([[S, 1]], [298, 3]), tk([[299, 1]], [S, 3]), tk([[S, 6]], [334, 1]), tk([[S, 6]], [454, 1]), tk([[S, 16]], [455, 1]), tk([[S, 9]], [456, 1]), tk([[S, 7]], [457, 1]), tk([[450, 2]], [S, 1]), tk([[451, 4]], [S, 1])],
    gorev: [['getir', 297, 12], ['getir', 451, 4], ['getir', 299, 2], ['getir', 450, 2], ['oldur', 'kopekbaligi', 1], ['mektup']],
    soz: ['Deniz sakin göründüğünde bile dikkatli olunuz.', 'Mercan resiflerinin çevresinde balık bol olur.', 'Batık gemilerin sandıklarında değerli eşyalar bulunur; köpekbalıklarına dikkat ediniz.', 'Şamandıra suya daldığı anda olta çekilmelidir.']
  }
};

/* Eşyaların kabaca sikke değeri (görev ödülü hesabı) */
export const DEGER = { 328: 0.07, 329: 0.07, 295: 0.15, 61: 1.2, 291: 0.05, 265: 0.06, 266: 0.25, 271: 0.17, 273: 0.17, 282: 0.17, 261: 0.25, 257: 0.08, 264: 5, 259: 0.12, 8: 0.08, 10: 0.08, 256: 0.03, 36: 0.2, 281: 0.1, 283: 0.1, 297: 0.17, 451: 0.25, 299: 2.5, 450: 0.6 };
