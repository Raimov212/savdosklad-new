package cache

import "sync"

// TgAuthCache stores random tokens (string) mapping to user IDs (int).
// It's used for securely linking telegram accounts to web accounts.
// Go tili imkoniyati - "sync.Map": Go tilida xavfsiz (thread-safe) tarzda parallel xotira (cache) 
// bilan ishlash vositasi. Bir vaqtning o'zida bir nechta goroutine'lar (masalan, Telegram bot va API server) 
// map'ga murojaat qilganda ma'lumotlar buzilmasligi uchun oddiy map o'rniga sync.Map qo'llanilgan.
var TgAuthCache sync.Map

// PasswordResetCache stores reset codes (string) mapping to user names (string).
var PasswordResetCache sync.Map
