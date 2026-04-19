package cache

import "sync"

// TgAuthCache stores random tokens (string) mapping to user IDs (int).
// It's used for securely linking telegram accounts to web accounts.
var TgAuthCache sync.Map
