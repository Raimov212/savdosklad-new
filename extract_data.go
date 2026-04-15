package main

import (
	"bufio"
	"fmt"
	"os"
	"regexp"
	"strings"
)

func main() {
	inputFile := "Savdo.sql"; outputFile := "data_only_v7.sql"
	if len(os.Args) > 1 { inputFile = os.Args[1] }
	if len(os.Args) > 2 { outputFile = os.Args[2] }

	file, err := os.Open(inputFile)
	if err != nil { fmt.Printf("Xatolik: %v\n", err); return }
	defer file.Close()

	out, err := os.Create(outputFile)
	if err != nil { fmt.Printf("Xatolik: %v\n", err); return }
	defer out.Close()

	writer := bufio.NewWriter(out)
	defer writer.Flush()

	writer.WriteString("SET session_replication_role = 'replica';\n\n")

	scanner := bufio.NewScanner(file)
	buf := make([]byte, 1024*1024)
	scanner.Buffer(buf, 100*1024*1024) 

	inCopyBlock := false; skipBlock := false
	copyRegex := regexp.MustCompile(`(?i)^COPY\s+public\."([^"]+)"\s+\((.*)\)\s+FROM\s+stdin;`)
	setvalRegex := regexp.MustCompile(`(?i)SELECT\s+pg_catalog\.setval\('([^']+)',\s*(\d+),\s*(\w+)\);`)
	
	skipTables := map[string]bool{
		"product_changes": true, "ProductChanges": true,
		"verifications": true, "Verifications": true,
		"__EFMigrationsHistory": true,
	}

	tableMapping := map[string]string{
		"Businesses": "businesses", "Calculations": "calculations",
		"Categories": "categories", "Clients": "clients",
		"Expenses": "expenses", "FixedCosts": "fixed_costs",
		"FixedFactedCosts": "fixed_facted_costs", "Money": "money",
		"Products": "products", "Refunds": "refunds",
		"TotalExpenses": "total_expenses", "TotalRefunds": "total_refunds",
		"TotalTransactions": "total_transactions", "Transactions": "transactions",
		"Users": "users",
	}

	colMapping := map[string]string{
		"Id": "id", "UserId": "\"userId\"", "BusinessId": "\"businessId\"",
		"CreatedAt": "\"createdAt\"", "UpdatedAt": "\"updatedAt\"",
		"Name": "name", "Description": "description",
		"BusinessAccountNumber": "\"businessAccountNumber\"", "Balance": "balance",
		"TotalIncome": "\"totalIncome\"", "IncomeTax": "\"incomeTax\"",
		"TotalExpense": "\"totalExpense\"", "TotalFixedCosts": "\"totalFixedCosts\"",
		"Salary": "salary", "SalaryTax": "\"salaryTax\"", "Profit": "profit",
		"Month": "month", "Year": "year", "TotalSale": "\"totalSale\"",
		"AddedMoney": "\"addedMoney\"", "Fullname": "\"fullName\"",
		"Phone": "phone", "Address": "address", "Value": "value",
		"TotalExpenseId": "\"totalExpenseId\"", "ExpenseDate": "\"expenseDate\"",
		"Amount": "amount", "Type": "type", "IsDeleted": "\"isDeleted\"",
		"FixedCostId": "\"fixedCostId\"", "Date": "date",
		"AmountType": "\"amountType\"", "OldPrice": "\"oldPrice\"",
		"NewPrice": "\"newPrice\"", "OldDiscount": "\"oldDiscount\"",
		"NewDiscount": "\"newDiscount\"", "OldQuantity": "\"oldQuantity\"",
		"NewQuantity": "\"newQuantity\"", "ProductId": "\"productId\"",
		"ShortDescription": "\"shortDescription\"", "FullDescription": "\"fullDescription\"",
		"Price": "price", "Discount": "discount", "Quantity": "quantity",
		"Images": "images", "Barcode": "barcode", "Country": "country",
		"CategoryId": "\"categoryId\"", "isDeleted": "\"isDeleted\"",
		"ProductPrice": "\"productPrice\"", "ProductQuantity": "\"productQuantity\"",
		"TotalRefundId": "\"totalRefundId\"", "TransactionId": "\"transactionId\"",
		"Total": "total", "Cash": "cash", "Card": "card", "Click": "click",
		"Debt": "debt", "ClientNumber": "\"clientNumber\"",
		"DebtLimitDate": "\"debtLimitDate\"", "ClientId": "\"clientId\"",
		"TotalTransactionId": "\"totalTransactionId\"", "Firstname": "\"firstName\"",
		"Lastname": "\"lastName\"", "PhoneNumber": "\"phoneNumber\"",
		"Username": "\"userName\"", "Password": "password", "Role": "role",
		"InviterCode": "\"inviterCode\"", "OfferCode": "\"offerCode\"",
		"IsVerified": "\"isVerified\"", "IsExpired": "\"isExpired\"",
		"TelegramUserId": "\"telegramUserId\"", "ExpirationDate": "\"expirationDate\"",
		"VerifierUserId": "\"verifierUserId\"",
	}

	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "\\") && line != "\\." && !strings.HasPrefix(line, "\\t") { continue }

		if inCopyBlock {
			if !skipBlock {
				// SANITIZE: Replace -infinity and infinity with a safe date string for Go
				line = strings.ReplaceAll(line, "-infinity", "2000-01-01 00:00:00+00")
				line = strings.ReplaceAll(line, "infinity", "2099-01-01 00:00:00+00")
				writer.WriteString(line + "\n")
			}
			if line == "\\." { inCopyBlock = false; skipBlock = false; writer.WriteString("\n") }
			continue
		}

		if matches := copyRegex.FindStringSubmatch(line); matches != nil {
			oldT := matches[1]; oldCols := matches[2]
			newT, ok := tableMapping[oldT]
			if !ok { newT = strings.ToLower(oldT) }
			if skipTables[newT] || skipTables[oldT] { inCopyBlock = true; skipBlock = true; continue }

			colParts := strings.Split(oldCols, ",")
			newCols := make([]string, 0, len(colParts))
			for _, cp := range colParts {
				cp = strings.TrimSpace(cp); cp = strings.Trim(cp, "\"")
				newCol, ok := colMapping[cp]
				if !ok { newCol = strings.ToLower(cp) }
				newCols = append(newCols, newCol)
			}
			writer.WriteString(fmt.Sprintf("COPY %s (%s) FROM stdin;\n", newT, strings.Join(newCols, ", ")))
			inCopyBlock = true; skipBlock = false; continue
		}

		if matches := setvalRegex.FindStringSubmatch(line); matches != nil {
			oldSeq := matches[1]; val := matches[2]; isCalled := matches[3]
			cleanSeq := strings.Trim(strings.ReplaceAll(oldSeq, "public.", ""), "\"")
			skip := false
			for st := range skipTables {
				if strings.Contains(strings.ToLower(cleanSeq), strings.ToLower(st)) { skip = true; break }
			}
			if skip { continue }

			newSeq := strings.ToLower(cleanSeq)
			for oldT, newT := range tableMapping {
				if strings.HasPrefix(cleanSeq, oldT) {
					newSeq = strings.Replace(newSeq, strings.ToLower(oldT), newT, 1)
					break
				}
			}
			writer.WriteString(fmt.Sprintf("SELECT pg_catalog.setval('%s', %s, %s);\n", newSeq, val, isCalled))
		}
	}
	fmt.Printf("Muvaffaqiyatli! data_only_v7.sql yaratildi (-infinity qiymatlari tozalandi).\n")
}
