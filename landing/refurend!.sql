
/*Ombor qoldig'ini to'g'rilash: Xatolik tuzatilgunga qadar amalga oshirilgan qaytarishlar natijasida omborda kamayib qolgan mahsulotlarni quyidagi SQL so'rovi orqali bir marta to'g'rilab olishingiz mumkin.

Bu so'rov xatolik tuzatilgan vaqtgacha (2026-05-09 19:15:00) bo'lgan barcha qaytarilgan mahsulotlar sonini hisoblab, ularni qaytadan ombor qoldig'iga qo'shib qo'yadi:


Eslatma: Bu amalni faqat bir marta bajarish kifoya. Keyingi barcha qaytarishlar endi avtomatik ravishda ombor qoldig'ini yangilab boradi.*/

UPDATE products p
SET quantity = p.quantity + sub.total_refunded
FROM (
    SELECT "productId", SUM("productQuantity") as total_refunded
    FROM refunds
    WHERE "createdAt" < '2026-05-09 19:15:00'
    GROUP BY "productId"
) sub
WHERE p.id = sub."productId";