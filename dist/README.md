# SavdoSklad — Windows o'rnatish qo'llanmasi

## Talablar
- Windows 10 yoki undan yuqori
- PostgreSQL 14+ o'rnatilgan bo'lishi kerak

## O'rnatish

### 1-qadam: Papkani nusxalash
`SavdoSklad` papkasini kompyuterga ko'chirib oling (masalan `C:\SavdoSklad\`).

### 2-qadam: PostgreSQL sozlash
PostgreSQL da yangi database yarating:
```
CREATE DATABASE savdosklad;
```

### 3-qadam: Konfiguratsiya
`.env` faylni oching va quyidagilarni o'zgartiring:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=SIZNING_PAROLINGIZ
DB_NAME=savdosklad
```

### 4-qadam: Dasturni ishga tushirish
`SavdoSklad-Desktop.exe` ni ikki marta bosing.

## Muammo yechimi
- **Oyna ochilmasa** — WebView2 Runtime o'rnating: https://developer.microsoft.com/microsoft-edge/webview2/
- **DB xatosi** — PostgreSQL ishlab turganini va `.env` dagi ma'lumotlar to'g'riligini tekshiring
