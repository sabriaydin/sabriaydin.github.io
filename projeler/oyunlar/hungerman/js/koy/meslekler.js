/* HungerMan - köylü meslekleri: görünüm renkleri, takas listeleri, görev havuzları
   Takas: ver = oyuncunun verdikleri, al = oyuncunun aldığı. 288 = Sikke.
   0.32.0: seviye: köylü Kalfa, Usta ve Üstat olunca açılan takaslar; ozel: köyde Dost itibarına ulaşınca açılan takas;
   hediye: Kahraman itibarında köylünün günde bir kez verdiği hediyeler. Görev türleri: getir, oldur, mektup, teslimat, kesif, koruma, insa. */
import { YAPI_ID as Y, DUVAR_MALZEME, CIT_MALZEME, MEYVE_YAPRAK as M } from '../bloklar.js';
const S = 288;
const tk = (ver, al) => ({ ver, al });

export const MESLEKLER = {
  ciftci: {
    ad: 'Çiftçi', gomlek: '#7a9a3a', pantolon: '#5a4630', sapka: '#d8b85a',
    sabit: [tk([[291, 20]], [S, 1]), tk([[S, 1]], [293, 4])],
    havuz: [tk([[265, 16]], [S, 1]), tk([[S, 1]], [266, 4]), tk([[S, 1]], [292, 10]), tk([[36, 6]], [S, 1]), tk([[S, 2]], [52, 2]),
      tk([[328, 15]], [S, 1]), tk([[329, 15]], [S, 1]), tk([[S, 1]], [328, 6]), tk([[S, 1]], [330, 4]), tk([[S, 3]], [342, 1]), tk([[S, 2]], [104, 6])],
    gorev: [['getir', 291, 16], ['getir', 265, 20], ['getir', 266, 6], ['oldur', 'zombi', 4], ['mektup'], ['getir', 328, 16], ['getir', 329, 16], ['insa', 104, 12], ['koruma', 4], ['teslimat']],
    seviye: [[tk([[S, 3]], [475, 4]), tk([[559, 4]], [S, 1]), tk([[S, 1]], [364, 4]), tk([[S, 1]], [371, 4]), tk([[363, 10]], [S, 1])],
      [tk([[S, 4]], [343, 1]), tk([[S, 3]], [484, 2]), tk([[S, 4]], [M.elma.fidan, 1]), tk([[S, 4]], [M.kiraz.fidan, 1])],
      [tk([[S, 6]], [290, 1]), tk([[S, 10]], [344, 1]), tk([[S, 5]], [M.portakal.fidan, 1]), tk([[S, 5]], [M.zeytin.fidan, 1]), tk([[S, 8]], [388, 1])]],   // 0.34.0: tohum, fidan, tırpan
    ozel: tk([[S, 1]], [296, 8]), hediye: [[293, 4], [266, 4], [330, 4]],
    soz: ['Hasat zamanı bütün köy tarladadır.', 'Toprağı iyi işleyen, ekmeğini eksik etmez.', 'Tohum ekmeyi unutmayınız; buğday kendiliğinden yetişmez.']
  },
  kasap: {
    ad: 'Kasap', gomlek: '#b8463c', pantolon: '#3c3c48', onluk: '#ece8e0',
    sabit: [tk([[271, 6]], [S, 1]), tk([[S, 1]], [272, 3])],
    havuz: [tk([[275, 8]], [S, 1]), tk([[273, 6]], [S, 1]), tk([[S, 1]], [274, 3]), tk([[257, 15]], [S, 1]), tk([[277, 7]], [S, 1])],
    gorev: [['getir', 271, 8], ['getir', 273, 8], ['getir', 282, 6], ['oldur', 'kurt', 3], ['teslimat'], ['koruma', 4]],
    seviye: [[tk([[S, 2]], [464, 1]), tk([[279, 4]], [S, 1])], [tk([[S, 3]], [467, 2]), tk([[282, 10]], [S, 2])], [tk([[S, 6]], [462, 1]), tk([[S, 3]], [468, 2])]],
    ozel: tk([[S, 1]], [272, 6]), hediye: [[272, 3], [274, 3], [282, 2]],
    soz: ['Taze et, iyi bir kamp ateşinde pişirilmelidir.', 'Çiğ et yemek akıllıca değildir.', 'Çürük eti bana getirmeyiniz; şifacıya götürünüz.']
  },
  demirci: {
    ad: 'Demirci', gomlek: '#4a4a52', pantolon: '#2e2e34', onluk: '#5a3a22',
    sabit: [tk([[257, 12]], [S, 1]), tk([[261, 4]], [S, 1])],
    havuz: [tk([[264, 1]], [S, 5]), tk([[S, 12]], [139, 1]), tk([[S, 6]], [315, 1]), tk([[S, 5]], [312, 1]), tk([[S, 9]], [409, 1]), tk([[S, 4]], [408, 1]), tk([[S, 3]], [259, 6]), tk([[S, 14]], [264, 1]), tk([[S, 8]], [515, 2]), tk([[S, 4]], [473, 1])],
    gorev: [['getir', 261, 6], ['getir', 257, 24], ['getir', 264, 1], ['getir', 259, 10], ['getir', 61, 4], ['oldur', 'iskelet', 4], ['insa', 159, 3], ['kesif'], ['koruma', 5]],
    seviye: [[tk([[S, 7]], [410, 1]), tk([[S, 5]], [411, 1])], [tk([[S, 4]], [313, 1]), tk([[S, 20]], [412, 1])], [tk([[S, 28]], [413, 1]), tk([[S, 22]], [319, 1])]],
    ozel: tk([[S, 3]], [261, 4]), hediye: [[261, 2], [259, 4], [257, 8]],
    soz: ['Ocak hiç sönmez; kömür her zaman gereklidir.', 'İyi bir kılıç, iyi bir dosttur.', 'Demir, bakırdan sonra gelir; aceleye gerek yoktur.']
  },
  oduncu: {
    ad: 'Oduncu', gomlek: '#a8342c', pantolon: '#3e4a5e', sapka: '#5a3a22',
    sabit: [tk([[8, 12]], [S, 1]), tk([[S, 1]], [46, 12])],
    havuz: [tk([[256, 32]], [S, 1]), tk([[S, 2]], [50, 1]), tk([[S, 1]], [88, 2]), tk([[S, 1]], [110, 6]), tk([[S, 3]], [47, 1]), tk([[S, 1]], [48, 1]), tk([[S, 4]], [305, 1]), tk([[10, 12]], [S, 1])],
    gorev: [['getir', 8, 24], ['getir', 10, 16], ['getir', 256, 32], ['oldur', 'zombi', 5], ['mektup'], ['insa', 46, 8], ['kesif']],
    seviye: [[tk([[S, 1]], [38, 16]), tk([[S, 1]], [39, 16])], [tk([[S, 2]], [CIT_MALZEME[0].cit, 8]), tk([[S, 6]], [313, 1])], [tk([[S, 4]], [Y.dolap, 1]), tk([[S, 12]], [317, 1])]],
    ozel: tk([[S, 1]], [14, 24]), hediye: [[14, 16], [46, 8], [256, 16]],
    soz: ['Kesilen her ağacın yerine bir fidan dikilmelidir.', 'Gece ormanda dolaşmak tehlikelidir.', 'Meşale olmadan mağaraya girilmez.']
  },
  sifaci: {
    ad: 'Şifacı', gomlek: '#6a3e8a', pantolon: '#4a2e62', uzun: true,
    sabit: [tk([[S, 1]], [268, 2]), tk([[S, 3]], [289, 1])],
    havuz: [tk([[281, 10]], [S, 1]), tk([[36, 5]], [S, 1]), tk([[S, 1]], [331, 4]), tk([[S, 5]], [332, 1]), tk([[S, 5]], [333, 1]), tk([[S, 6]], [335, 1]), tk([[S, 7]], [140, 1]), tk([[295, 8]], [S, 1]), tk([[S, 8]], [290, 1]), tk([[263, 2]], [S, 1]), tk([[265, 12]], [S, 1])],
    gorev: [['getir', 36, 6], ['getir', 281, 12], ['oldur', 'zombi', 6], ['mektup'], ['getir', 295, 10], ['oldur', 'orumcek', 4], ['teslimat'], ['insa', 216, 3]],
    seviye: [[tk([[S, 6]], [336, 1]), tk([[S, 4]], [494, 2])], [tk([[S, 5]], [334, 1]), tk([[492, 1]], [S, 4])], [tk([[S, 14]], [493, 1]), tk([[S, 10]], [290, 2])]],
    ozel: tk([[S, 2]], [289, 1]), hediye: [[268, 2], [289, 1], [36, 3]],
    soz: ['Yaralarınızı ihmal etmeyiniz.', 'Mantar ve böğürtlen birçok derde devadır.', 'Uyku, en iyi ilaçtır.']
  },
  avci: {
    ad: 'Avcı', gomlek: '#4a6a3a', pantolon: '#5a4a32', sapka: '#3a4a2a',
    sabit: [tk([[282, 6]], [S, 1]), tk([[S, 1]], [287, 12])],
    havuz: [tk([[283, 10]], [S, 1]), tk([[S, 3]], [286, 1]), tk([[S, 4]], [401, 1]), tk([[279, 4]], [S, 1]), tk([[S, 2]], [400, 1])],
    gorev: [['getir', 283, 12], ['getir', 282, 8], ['oldur', 'kurt', 4], ['oldur', 'zombi', 8], ['oldur', 'iskelet', 5], ['oldur', 'orumcek', 5], ['kesif'], ['koruma', 6]],
    seviye: [[tk([[S, 4]], [402, 1]), tk([[S, 2]], [403, 1])], [tk([[S, 2]], [287, 24]), tk([[S, 5]], [462, 1])], [tk([[S, 10]], [315, 1]), tk([[S, 9]], [335, 1])]],
    ozel: tk([[S, 1]], [276, 4]), hediye: [[287, 12], [276, 2], [282, 2]],
    soz: ['Kurtlara saldırmadıkça size dokunmazlar.', 'Ok ile uzaktan avlanmak daha güvenlidir.', 'Tavşanlar hızlıdır; sabırlı olunuz.']
  },
  balikci: {
    ad: 'Balıkçı', gomlek: '#3a6a8a', pantolon: '#2e3a4a', sapka: '#e0b83a',
    sabit: [tk([[297, 6]], [S, 1]), tk([[S, 3]], [453, 1])],
    havuz: [tk([[S, 1]], [298, 3]), tk([[299, 1]], [S, 3]), tk([[S, 6]], [334, 1]), tk([[S, 6]], [454, 1]), tk([[S, 16]], [455, 1]), tk([[S, 9]], [456, 1]), tk([[S, 7]], [457, 1]), tk([[450, 2]], [S, 1]), tk([[451, 4]], [S, 1])],
    gorev: [['getir', 297, 12], ['getir', 451, 4], ['getir', 299, 2], ['getir', 450, 2], ['oldur', 'kopekbaligi', 1], ['mektup'], ['kesif'], ['teslimat']],
    seviye: [[tk([[S, 4]], [463, 2]), tk([[297, 12]], [S, 2])], [tk([[S, 3]], [299, 1]), tk([[S, 6]], [452, 3])], [tk([[S, 12]], [334, 2]), tk([[S, 20]], [264, 2])]],
    ozel: tk([[S, 1]], [298, 6]), hediye: [[298, 3], [297, 4], [299, 1]],
    soz: ['Deniz sakin göründüğünde bile dikkatli olunuz.', 'Mercan resiflerinin çevresinde balık bol olur.', 'Batık gemilerin sandıklarında değerli eşyalar bulunur; köpekbalıklarına dikkat ediniz.', 'Şamandıra suya daldığı anda olta çekilmelidir.']
  },
  /* ---------- 0.32.0: yeni meslekler ---------- */
  mimar: {
    ad: 'Mimar', gomlek: '#c8a45a', pantolon: '#4a4a5a', sapka: '#e8e0c8',
    sabit: [tk([[2, 32]], [S, 1]), tk([[S, 1]], [Y.cilaliTas, 12])],
    havuz: [tk([[S, 1]], [Y.parkeZemin, 12]), tk([[S, 1]], [Y.kareliZemin, 12]), tk([[S, 2]], [Y.beton, 16]), tk([[S, 1]], [35, 16]), tk([[15, 32]], [S, 1]), tk([[S, 2]], [Y.kil, 16]), tk([[S, 2]], [34, 16]), tk([[S, 1]], [DUVAR_MALZEME[1].duvar, 12])],
    seviye: [[tk([[S, 3]], [Y.cam + 4, 16]), tk([[S, 2]], [Y.raf, 4])], [tk([[S, 6]], [345, 1]), tk([[S, 4]], [Y.somine, 1])], [tk([[S, 8]], [Y.avize, 2]), tk([[S, 10]], [595, 2])]],
    ozel: tk([[S, 2]], [Y.beton + 5, 24]), hediye: [[Y.cilaliTas, 16], [Y.parkeZemin, 12], [Y.mum, 4]],
    gorev: [['getir', 2, 32], ['getir', 35, 24], ['getir', 34, 12], ['insa', 104, 12], ['insa', 46, 8], ['kesif'], ['teslimat']],
    soz: ['Sağlam bir ev, sağlam bir temelle başlar.', 'Merdiven ters konursa tavan kenarları daha güzel görünür.', 'Bir yapıyı beğendiyseniz, Yapı Planı ile başka yere de kurabilirsiniz.']
  },
  kutuphaneci: {
    ad: 'Kütüphaneci', gomlek: '#3a4a7a', pantolon: '#2a2a3a', uzun: true,
    sabit: [tk([[283, 12]], [S, 1]), tk([[S, 4]], [187, 1])],
    havuz: [tk([[282, 8]], [S, 1]), tk([[S, 2]], [Y.mum, 4]), tk([[S, 3]], [61, 2]), tk([[S, 2]], [331, 4]), tk([[S, 1]], [46, 16]), tk([[S, 5]], [514, 2]), tk([[S, 3]], [Y.raf, 2])],
    seviye: [[tk([[S, 6]], [333, 1]), tk([[S, 12]], [156, 1])], [tk([[S, 6]], [61, 6]), tk([[S, 10]], [493, 1])], [tk([[S, 20]], [264, 3]), tk([[S, 6]], [471, 8])]],
    ozel: tk([[S, 2]], [61, 3]), hediye: [[61, 2], [Y.mum, 3], [331, 2]],
    gorev: [['getir', 283, 16], ['getir', 282, 10], ['getir', 61, 3], ['mektup'], ['teslimat'], ['kesif'], ['kesif']],
    soz: ['Eski kitaplarda unutulmuş yapılardan söz edilir.', 'Bilgi, en değerli hazinedir.', 'Büyü masasının çevresine kitaplık dizilirse daha güçlü büyüler yapılır.']
  },
  coban: {
    ad: 'Çoban', gomlek: '#e8e0c8', pantolon: '#6a5a3a', sapka: '#8a6a3a',
    sabit: [tk([[291, 18]], [S, 1]), tk([[S, 1]], [49, 6])],
    havuz: [tk([[S, 1]], [114, 6]), tk([[S, 1]], [118, 6]), tk([[S, 1]], [116, 6]), tk([[S, 1]], [321, 3]), tk([[S, 1]], [325, 3]), tk([[S, 2]], [208, 4]), tk([[S, 3]], [47, 1]), tk([[S, 2]], [481, 1]), tk([[S, 1]], [346, 4])],
    seviye: [[tk([[S, 2]], [Y.perde, 2]), tk([[S, 3]], [Y.sancak, 2])], [tk([[S, 4]], [462, 1]), tk([[S, 2]], [479, 1])], [tk([[S, 6]], [Y.sancak + 28, 4]), tk([[S, 8]], [204, 2])]],
    ozel: tk([[S, 1]], [49, 16]), hediye: [[49, 8], [484, 2], [486, 2]],
    gorev: [['getir', 291, 20], ['getir', 49, 12], ['oldur', 'kurt', 4], ['koruma', 4], ['teslimat'], ['insa', 104, 16]],
    soz: ['Kurtlar sürüye geceleri yaklaşır.', 'Koyunlar makasla kırkılır; yün yeniden uzar.', 'Boyalı yünle evler çok daha renkli olur.']
  },
  asci: {
    ad: 'Aşçı', gomlek: '#f0ece4', pantolon: '#3a3a3a', onluk: '#e8e0d0', sapka: '#ffffff',
    sabit: [tk([[328, 14]], [S, 1]), tk([[S, 1]], [293, 5])],
    havuz: [tk([[329, 14]], [S, 1]), tk([[297, 8]], [S, 1]), tk([[S, 2]], [463, 2]), tk([[S, 2]], [465, 2]), tk([[S, 3]], [487, 1]), tk([[S, 2]], [488, 2]), tk([[480, 10]], [S, 1]), tk([[S, 2]], [232, 1])],
    seviye: [[tk([[S, 3]], [464, 2]), tk([[S, 2]], [469, 3])], [tk([[S, 4]], [490, 2]), tk([[S, 3]], [467, 3])], [tk([[S, 6]], [290, 1]), tk([[S, 8]], [622, 1])]],
    ozel: tk([[S, 1]], [269, 2]), hediye: [[487, 1], [490, 1], [465, 2]],
    gorev: [['getir', 328, 16], ['getir', 329, 16], ['getir', 297, 10], ['getir', 480, 8], ['teslimat'], ['koruma', 4]],
    soz: ['Tencerede pişen yemek hem doyurur hem güç verir.', 'Sıcak bir çorba soğuk gecelerde içinizi ısıtır.', 'Taze malzeme, iyi yemeğin sırrıdır.']
  }
};

/* 0.32.0: köylü seviyeleri (takas deneyimine göre) */
export const SEVIYELER = [{ ad: 'Çırak', xp: 0 }, { ad: 'Kalfa', xp: 12 }, { ad: 'Usta', xp: 36 }, { ad: 'Üstat', xp: 80 }];
export const seviyeBul = xp => { let s = 0; for (let i = 0; i < SEVIYELER.length; i++) if (xp >= SEVIYELER[i].xp) s = i; return s; };
/* Mesleğin simgesi (pencere başlığı) */
export const MESLEK_SIMGE = { ciftci: 291, kasap: 271, demirci: 139, oduncu: 301, sifaci: 289, avci: 286, balikci: 453, mimar: 345, kutuphaneci: 187, coban: 481, asci: 232 };
/* Bağlama göre genel sözler */
export const SOZ = {
  gece: ['Gece oldu; canavarlar dolaşırken köyden ayrılmayınız.', 'Karanlıkta tek başına dolaşmak tehlikelidir.', 'Meşalesiz gecelerde zombiler kapılara kadar gelir.'],
  sabah: ['Günaydın! Bugün güzel bir gün olacak.', 'Sabah erken kalkan yol alır.'],
  yagmur: ['Bu yağmur tarlalara iyi gelecek.', 'Islanmadan bir çatı altına giriniz.', 'Yağmurda balıklar daha çok vurur.'],
  kar: ['Soğukta sıcak tutan giysiler çok önemlidir.', 'Kar yağınca yollar kapanır.'],
  mesafeli: ['Yabancılarla ticarette dikkatli olunur.', 'Köyde sizin hakkınızda iyi şeyler söylenmiyor.'],
  dost: ['Hoş geldiniz dostum! Köyümüzün kapısı size her zaman açıktır.', 'Sizin gibi yardımseverler pek az bulunur.'],
  kahraman: ['Köyümüzün kahramanı! Size nasıl teşekkür etsek az.', 'Çocuklar bile sizin hikâyelerinizi anlatıyor.']
};

/* Eşyaların kabaca sikke değeri (görev ödülü hesabı) */
export const DEGER = { 2: 0.03, 35: 0.06, 34: 0.12, 49: 0.15, 480: 0.1, 328: 0.07, 329: 0.07, 295: 0.15, 61: 1.2, 291: 0.05, 265: 0.06, 266: 0.25, 271: 0.17, 273: 0.17, 282: 0.17, 261: 0.25, 257: 0.08, 264: 5, 259: 0.12, 8: 0.08, 10: 0.08, 256: 0.03, 36: 0.2, 281: 0.1, 283: 0.1, 297: 0.17, 451: 0.25, 299: 2.5, 450: 0.6 };
