# Kiritilgan O'zgartirishlar Hisoboti

SavdoSklad loyihasidagi barcha `.go` fayllar tahlil qilinib, Go tilining maxsus imkoniyatlari (goroutine, kanal, thread-safe yondashuvlar va taymerlar) qo'llanilgan joylarga batafsil, o'zbek tilida izohlar yozildi. Quyida ularning ro'yxati keltirilgan:

| Fayl nomi | Qator(lar) | Go tili vositasi | Izoh mazmuni |
| :--- | :--- | :--- | :--- |
| `pkg/cache/tgcache.go` | 5-7 | `sync.Map` | Parallel so'rovlar kelganda (masalan API va Bot bir vaqtda ulanganda) xotira (cache) bilan xavfsiz (thread-safe) ishlash imkoniyati haqida. |
| `cmd/desktop/main.go` | 287-289 | `go func()` | Backend serverini asosiy oqim (UI oynasi) ishini bloklab qo'ymasligi uchun asinxron fonda ishga tushirish jarayoni. |
| `cmd/desktop/main.go` | 295-297 | `go func()` | Telegram bot API serveridan (polling orqali) xabarlarni kutishi va bu jarayon butun dasturni to'xtatib qo'ymasligi haqida. |
| `internal/telegram/bot.go` | 67-69 | `channel` (<-chan) | Goroutine'lar o'rtasida ma'lumot almashish uchun xavfsiz kanal (channel) yordamida Telegramdan kelayotgan xabarlarni oqim kabi qabul qilish mexanizmi. |
| `internal/telegram/bot.go` | 88-89 | `time.Ticker` | Ma'lum bir intervallarda (har daqiqada) avtomatik ravishda signal yuborib turuvchi taymer vositasi tushuntirildi. |
| `internal/telegram/bot.go` | 91-95 | `go func()`, `range chan` | Kunlik hisobotlarni asinxron tekshiruvchi funksiya hamda kanalga kelgan xabarni `range` orqali bloklanmasdan kutib turish va qabul qilish. |
| `internal/usecase/general.go` | 220-222 | `go` keyword | Savdo muvaffaqiyatli yakunlangach, Telegram orqali xabar yuborish tezligi Internetga bog'liq bo'lganligi sababli, jarayon tez tugashi va mijoz kutib qolmasligi uchun xabar jo'natish `go` so'zi bilan fonda chaqirilishi. |
| `internal/usecase/general.go` | 267-268 | `go` keyword | Savdoga yangi mahsulot qo'shilganda mijozga darhol, so'rovni sekinlashtirmasdan bildirishnoma xabarini asinxron yuborish holati. |
| `internal/usecase/general.go` | 294-295 | `go` keyword | Ma'lumot yangilanganda tezkor qayta xabar berishda dastur tezligini tushirmaslik va xabar yetib borishini kutmaslik uchun jarayon alohida ishga tushirilishi izohlandi. |
