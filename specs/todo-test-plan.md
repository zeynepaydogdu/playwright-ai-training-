# TodoMVC test planı

## Kapsam ve inceleme yöntemi

- Uygulama: https://demo.playwright.dev/todomvc/
- Kapsam: görev ekleme, silme, tamamlama, tamamlanmışları temizleme ve All / Active / Completed filtreleri.
- Senaryolar pozitif, negatif ve sınır değer kontrollerini içerir.
- **Beklenen sonuç** testte doğrulanması gereken davranıştır; **Gözlenen davranış** tarayıcı incelemesinde gerçekten görülen sonuçtur. Bunlar özellikle ayrı tutulmuştur.
- İnceleme entegre tarayıcıdaki Playwright kontrolüyle yapıldı. Playwright MCP sunucusu başlatılamadı (`npx` bulunamadı).
- Keşif sonunda oluşturulan görevler silinerek liste boş bırakıldı.

## Senaryolar

| ID | Tür | İşlem / girdi | Beklenen sonuç | Gözlenen davranış |
|---|---|---|---|---|
| ADD-01 | Pozitif | `Buy milk` girip Enter'a bas. | Görev bir kez listeye eklenir, giriş alanı temizlenir ve aktif görev sayısı 1 olur. | Görev eklendi, alan temizlendi ve `1 item left` gösterildi. |
| ADD-02 | Pozitif | Aynı başlığı (`Buy milk`) ikinci kez ekle. | Yinelenen başlık engellenmiyorsa ayrı bir görev olarak görünür ve aktif sayısı 2 olur. | İkinci görev ayrı satır olarak eklendi; sayaç 2 oldu. |
| ADD-03 | Sınır değeri | Başlığa başta ve sonda boşluk ekleyerek `  spaced task  ` gir. | Başlık başındaki/sonundaki boşluklar kırpılır; görev metni `spaced task` olur. | Görüntülenen başlık `spaced task` oldu. |
| ADD-04 | Sınır değeri | 256 karakterlik bir başlığı ekle. | Girdi için uzunluk sınırı yoksa 256 karakterin tamamı kayıpsız saklanıp gösterilir. | Girişin `maxLength` değeri sınırsızdı (`-1`); 256 karakter kabul edildi ve tam uzunlukta gösterildi. |
| ADD-05 | Negatif | Boş alanla Enter'a bas. | Boş görev oluşturulmaz; görev listesi ve sayaç değişmez. | Boş görev eklenmedi; liste ve sayaç değişmedi. |
| ADD-06 | Negatif / sınır değeri | Yalnızca boşluklardan oluşan bir değer girip Enter'a bas. | Boşluklar kırpıldıktan sonra değer boş kalacağından görev oluşturulmaz. | Görev eklenmedi; mevcut liste ve sayaç değişmedi. |
| DEL-01 | Pozitif | Bir görev satırını hover edip Delete (×) düğmesine bas. | Yalnızca seçilen görev kaldırılır; diğer görevler ve aktif sayısı doğru kalır. | Seçilen aktif yinelenen `Buy milk` silindi; diğer satırlar kaldı ve sayaç 2'den 1'e indi. |
| DEL-02 | Sınır değeri | Listedeki son görevi sil. | Görev listesi boşalır; sayaç, filtreler ve görev kontrolleri gizlenir. Yeni görev giriş alanı kullanılabilir kalır. | Son görev silinince liste ve sayaç/filtre/kontrol alanı kayboldu; başlık ve giriş alanı kaldı. |
| COMP-01 | Pozitif | Tek bir aktif görevin checkbox'ını seç. | Görev tamamlandı olarak işaretlenir, aktif sayısı bir azalır ve Clear completed görünür. | Checkbox seçili oldu, sayaç 3'ten 2'ye indi ve Clear completed göründü. |
| COMP-02 | Pozitif | “Mark all as complete” checkbox'ını seç. | Tüm görevler tamamlanır; aktif sayısı 0 olur ve toplu checkbox seçili görünür. | İki görev de seçili oldu; sayaç `0 items left` gösterdi ve toplu checkbox seçiliydi. |
| COMP-03 | Pozitif | Tamamlanmış bir görevin checkbox'ını tekrar seç. | Görev yeniden aktif olur; aktif sayısı bir artar ve filtre görünümü buna göre güncellenir. | Bu tersine çevirme etkileşimi ayrıca denenmedi. |
| FIL-01 | Pozitif | Bir tamamlanmış ve en az bir aktif görev varken All filtresini seç. | Tamamlanmış ve aktif görevlerin tümü görünür. | İki tür görev de All görünümünde listelendi. |
| FIL-02 | Pozitif | Active filtresini seç. | Yalnızca tamamlanmamış görevler görünür; sayaç tüm görünüm için doğru kalır. | Yalnızca iki aktif görev listelendi; sayacın değeri 2 olarak kaldı. |
| FIL-03 | Pozitif | Completed filtresini seç. | Yalnızca tamamlanmış görevler görünür. | Yalnızca tamamlanmış `Buy milk` satırı listelendi. |
| FIL-04 | Sınır değeri | Tüm görevler tamamlanmışken Active filtresini seç. | Sonuç listesi boş olur; sayaç 0 gösterir ve filtreler kullanılabilir kalır. | Liste boş kaldı; sayaç 0 ve filtre bağlantıları görünür durumdaydı. |
| CLR-01 | Pozitif | Aktif ve tamamlanmış görevler varken Clear completed'a bas. | Tamamlanmış görevler silinir; aktif görevler korunur ve sayaç aktif sayısını gösterir. | Tamamlanmış görev silindi; aktif `Read docs` kaldı ve sayaç 1 oldu. |
| CLR-02 | Sınır değeri | Tüm görevler tamamlanmışken Clear completed'a bas. | Liste boşalır; görev listesi ve sayaç/filtre/kontrol alanı gizlenir. | Tüm tamamlanmış görevler kaldırıldı; yalnızca başlık ve giriş alanı kaldı. |

## Uygulama notları

- Her senaryoyu bağımsız, temiz bir listeyle çalıştırın; sayaç doğrulamalarında yalnızca görünür satırları değil, aktif görev sayısını da kontrol edin.
- Filtre senaryolarında aynı görev kümesinin All, Active ve Completed görünümlerindeki üyeliğini karşılaştırın.
- ADD-04 için 256 karakter, incelenen davranışı belgeleyen bir sınır örneğidir; uygulamada azami uzunluk belirlediği anlamına gelmez.
- COMP-03 gözlemlenmediği için, uygulama davranışı doğrulanmış kabul edilmemeli; çalıştırılacak senaryo olarak tutulmalıdır.
