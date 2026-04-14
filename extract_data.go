package main

import (
	"bufio"
	"bytes"
	"fmt"
	"os"
	"strings"
)

func main() {
	inputFile := "savdo.sql"
	outputFile := "data_only.sql"

	if len(os.Args) > 1 {
		inputFile = os.Args[1]
	}
	if len(os.Args) > 2 {
		outputFile = os.Args[2]
	}

	content, err := os.ReadFile(inputFile)
	if err != nil {
		fmt.Println("Xatolik:", err)
		return
	}

	// Agar fayl UTF-16 LE BOM bilan saqlangan bo'lsa (ba'zan bazani Windowsda dump qilinganda shunday bo'ladi)
	if bytes.HasPrefix(content, []byte{0xff, 0xfe}) {
		runes := make([]rune, 0, len(content)/2)
		for i := 2; i < len(content)-1; i += 2 {
			u16 := uint16(content[i]) | uint16(content[i+1])<<8
			runes = append(runes, rune(u16))
		}
		var buf bytes.Buffer
		for _, r := range runes {
			buf.WriteRune(r)
		}
		content = buf.Bytes()
	}

	reader := bufio.NewScanner(bytes.NewReader(content))
	buf := make([]byte, 1024*1024)
	reader.Buffer(buf, 50*1024*1024) // Kattaroq qatorlarni o'qish uchun bufer hajmini oshirildi

	out, err := os.Create(outputFile)
	if err != nil {
		fmt.Println("Yangi fayl yaratishda xatolik:", err)
		return
	}
	defer out.Close()

	writer := bufio.NewWriter(out)
	defer writer.Flush()

	// Foreign key xatoliklari bermasligi uchun replikatsiya rejimini yoqamiz
	writer.WriteString("SET session_replication_role = 'replica';\n\n")

	inCopyBlock := false
	countLines := 0

	for reader.Scan() {
		line := reader.Text()

		// COPY komandasi kelganda, blokni boshlaymiz
		if strings.HasPrefix(line, "COPY ") && strings.HasSuffix(line, "FROM stdin;") {
			inCopyBlock = true
			writer.WriteString(line + "\n")
			countLines++
			continue
		}

		if inCopyBlock {
			writer.WriteString(line + "\n")
			countLines++
			if line == "\\." {
				inCopyBlock = false // COPY blok yakunlandi
				writer.WriteString("\n")
			}
			continue
		}

		// Sequence lar qiymatini yangilash kodlarini ham ohamiz
		if strings.Contains(line, "SELECT pg_catalog.setval") {
			writer.WriteString(line + "\n")
			countLines++
			continue
		}

		// Ba'zan ma'lumotlar INSERT bilan saqlanadi
		if strings.HasPrefix(line, "INSERT INTO ") {
			writer.WriteString(line + "\n")
			countLines++
		}
	}

	if err := reader.Err(); err != nil {
		fmt.Println("Faylni o'qishda xatolik yuz berdi:", err)
	} else {
		fmt.Printf("Muvaffaqiyatli yakunlandi! %d ta qator ma'lumot %s ga saqlandi.\n", countLines, outputFile)
	}
}
