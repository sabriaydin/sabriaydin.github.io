# Parola Defteri sitesi

Site tamamen bağımsızdır: dış kütüphane, font, çerez veya izleyici kullanmaz. Tüm yollar göreli olduğundan herhangi bir barındırmada, herhangi bir klasörde olduğu gibi çalışır (GitHub Pages, Netlify, Apache, nginx, IIS, hosting paneli).

## Yayınlama
- **Mevcut sitenizin içinde:** zip'in içindekileri sitenizde bir klasöre yükleyin (örn. `parola-defteri`) ve `sitem.com/parola-defteri/` adresine bağlantı verin.
- **Ayrı GitHub Pages sitesi:** yeni depo açıp içindekileri yükleyin, Settings > Pages > Branch: `main`, `/ (root)`.

## Yeni güncelleme yazısı ekleme
Her güncelleme `posts` klasöründe ayrı bir metin dosyasıdır: `1.txt`, `2.txt`, `3.txt`...
1. `posts` klasöründe yeni dosya oluşturun. Adı sıradaki numara olsun (son yazı `1.txt` ise `2.txt`). Numaralar atlanmamalı.
2. İçeriği şöyle yazın (başlık satırlarından sonra bir boş satır bırakın):

```
surum: 1.1.0
tarih: 2026-10-15
baslik: Yeni özellikler

Kısa bir giriş cümlesi (isteğe bağlı).

- İlk değişiklik
- İkinci değişiklik
- **Kalın yazı** ve [bağlantı](https://ornek.com) kullanabilirsiniz
```

3. Dosyayı yükleyin (GitHub'da Add file > Create new file > Commit changes). Yazı sitede görünür.
- En büyük numaralı yazı en üstte görünür.
- İndir butonundaki sürüm numarası en yeni yazıdan kendiliğinden alınır.
- Yazıyı silmek için dosyayı silin. Ortadan silerseniz sonraki numaraları yeniden adlandırın.
- Dosyayı Not Defteri ile kaydederken kodlamayı UTF-8 seçin.

## Sürüm yayınlarken (`veri.js`)
- `indir`: programın indirme adresi.
- `eposta`: "Bize ulaşın!" butonunun açacağı e-posta adresi (örn. `iletisim@sitem.com`).
- `sha256`: dosyanın SHA-256 kodu. PowerShell'de `Get-FileHash .\ParolaDefteri.zip` ile bulunur. VirusTotal butonu bundan kendiliğinden oluşur; kod sitede gösterilmez.
- Dosyayı virustotal.com'a yüklemeyi unutmayın, buton o rapora gider.
