# Boshqaruv markazi — Frontend Dizayn Rejasi

Ushbu hujjat Westep admin panelidagi "Boshqaruv markazi" (8 haftalik sotuv rejasi: Reja, Ko'rsatkichlar, Kunlik marketing, Maktablar) bo'limining frontend dizayn konsepsiyasi, token tizimi, ASCII wireframe'lari va UX qoidalarini belgilaydi.

---

## 1. Dizayn tamoyillari va Mavjud Token Tizimi

Mahsulot — yakka asoschi (CEO) tomonidan ertalab 10 soniyada asosiy savollarga javob olish uchun ishlatiladigan ichki operatsion asbob. Panel TailAdmin va Tailwind v4 asosida qurilgan. Hech qanday yangi tashqi CSS kutubxona yoki yangi shrift kiritilmaydi.

### Tokenlar:
- **Asosiy fon va yuzalar:**
  - Light rejim: `bg-gray-50`, kartalar `bg-white`, chegaralar `border-gray-200`.
  - Dark rejim: `dark:bg-gray-900`, kartalar `dark:bg-white/[0.03]`, chegaralar `dark:border-gray-800`.
- **Ma'noli (semantik) ranglar:**
  - **Bajarildi / Chiqdi / Muvaffaqiyat:** Yashil (`success-500`, `bg-success-50`, `text-success-700`, `dark:bg-success-500/10`, `dark:text-success-300`).
  - **Jarayonda / Tasdiqlangan / Brend:** Ko'k (`brand-500`, `bg-brand-50`, `text-brand-600`).
  - **Navbatda / Qoralama / Neytral:** Kulrang (`gray-500`, `bg-gray-100`, `text-gray-700`).
  - **To'xtab qoldi / Xato / Rad etildi:** Qizil (`error-500`, `bg-error-50`, `text-error-700`).
  - **Kechikkan muddat / Minimum chegara:** Sariq/Qahrabo (`warning-500`, `bg-warning-50`, `text-warning-700`).
- **Ishlatiladigan mavjud komponentlar:**
  - `ComponentCard`, `CommonTable`, `Button`, `Badge`, `Modal`, `StatusToast`, `PageMeta`, `PageBreadcrumb`.
  - Grafik uchun faqat loyihada mavjud bo'lgan `react-apexcharts`.

---

## 2. Jasoratni bitta joyga sarflash: "Esda qolarli element"

* **Qayerda:** `/growth/metrics` ("Ko'rsatkichlar") sahifasining tepa qismidagi **"Maqsadga yo'l" (Path to Goal)** bloki.
* **Nega aynan u:** CEO har kuni ertalab 10 soniya ichida eng asosiy savolga — *"Biz tirik qolish minimumiga (30 ta oila / 9 mln so'm) va 8 haftalik asosiy maqsadga (100 ta oila / 30 mln so'm) qanchalik yaqinmiz?"* degan savolga zudlik bilan javob olishi kerak.
* **Vizual ko'rinishi:** Katta aniq raqamlar, progress chizig'ida vertikal minimum marker (sariq chiziq) va 100% maqsad cheti. Bu ko'zga birinchi tashlanadigan asosiy mayoq hisoblanadi. Qolgan barcha bo'limlar esa toza, osoyishta va tartibli analitik jadvallardan iborat bo'ladi.

---

## 3. Sahifalar ASCII Wireframe'lari

### A. Reja (`/growth/plan`)

#### Desktop:
```
+----------------------------------------------------------------------------------------------------+
| Reja — 8 hafta (6-okt — 29-noy)                                                [+ Yangi vazifa]    |
+----------------------------------------------------------------------------------------------------+
| [!] DIQQAT / BUGUN:                                                                                |
|  * [M4] Matematika diagnostikasini tuzatish — Muddat: Bugun (2026-10-06)   [Jarayonda v] [Tahrirlash]|
|  * [M2] Do'kon to'lov qoidalarini tekshirish — Kechikdi (kecha)            [To'xtab qoldi v]       |
+----------------------------------------------------------------------------------------------------+
| Hafta tanlash:                                                                                     |
| [ Hammasi · 3/39 ] [ 1-hafta · 2/14 ] [ 2-hafta · 0/8 ] ... [ 8-hafta · 0/2 ]                     |
| Filtr: [ Barcha yo'nalishlar v ]                                                                    |
+----------------------------------------------------------------------------------------------------+
| Hafta   | Kod | Vazifa nomi va izoh              | Yo'nalish | Muddat     | Holat       | Amallar  |
+---------+-----+----------------------------------+-----------+------------+-------------+----------+
| 1-hafta | M1  | Bazaviy raqamlar (prod o'qish)   | Mahsulot  | 2026-10-06 | [Bajarildi] | [Tahrir] |
| 1-hafta | M4  | Diagnostika → joylashtirish test | Mahsulot  | 2026-10-08 | [Jarayondav]| [Tahrir] |
+---------+-----+----------------------------------+-----------+------------+-------------+----------+
```

#### Mobile (375px):
```
+-----------------------------------+
| Reja — 8 hafta                    |
| [+ Yangi vazifa]                  |
+-----------------------------------+
| [!] Bugungi / kechikkanlar (2)    |
| * M4 Diagnostika (Bugun)          |
|   [Jarayonda v]                   |
+-----------------------------------+
| Haftalar:                         |
| [Hammasi] [1-h (2/14)] [2-h] ...  |
+-----------------------------------+
| Jadval (gorizontal scroll):       |
| Kod | Vazifa | Holat | Amal       |
+-----------------------------------+
```

---

### B. Ko'rsatkichlar (`/growth/metrics`)

#### Desktop:
```
+----------------------------------------------------------------------------------------------------+
| Ko'rsatkichlar · Joriy: 1-hafta (Reja: 2026-10-06)          [Ertalabki hisobotni hozir yuborish]   |
+----------------------------------------------------------------------------------------------------+
| MAQSADGA YO'L (ASOSIY MAYOQ):                                                                      |
| +---------------------------------------------+ +------------------------------------------------+ |
| | To'lovchi oilalar                           | | Tushum                                         | |
| | 12 ta                                       | | 3 600 000 so'm                                 | |
| | [======|..................................] | | [======|.....................................] | |
| |        ^ min: 30                  maqsad:100| |        ^ min: 9 mln              maqsad: 30 mln| |
| +---------------------------------------------+ +------------------------------------------------+ |
+----------------------------------------------------------------------------------------------------+
| FUNNEL (KONVERSIYA ZANJIRI):                                                                       |
| [Ro'yxat: 240] ---> [Diag: 180 (75%)] ---> [7-kun: 90 (38%)] ---> [Sinov: 45] ---> [To'lov: 12]  |
+----------------------------------------------------------------------------------------------------+
| Haftalik dinamika grafigi (ApexCharts) & Jadval:                                                   |
| [ 1-hafta ... 8-hafta ro'yxat, diagnostika va to'lovlar chizig'i ]                                 |
+----------------------------------------------------------------------------------------------------+
| Segmentlar solishtirmasi (G'olib ajratiladi):                                                      |
| * 5-8 sinf (Abituriyentdan ko'ra arzonroq ro'yxat)  vs  9-11 sinf (Yuqori to'lov konversiyasi)    |
+----------------------------------------------------------------------------------------------------+
| Manbalar (UTM / Promo-kodlar jadvali)                                                              |
+----------------------------------------------------------------------------------------------------+
```

#### Mobile (375px):
```
+-----------------------------------+
| Ko'rsatkichlar                    |
| [Hisobotni yuborish]              |
+-----------------------------------+
| To'lovchi oilalar: 12             |
| [====|.............] min:30 / 100 |
| Tushum: 3.6 mln                   |
| [====|.............] min:9M / 30M |
+-----------------------------------+
| Voronka (Vertikal qadamlar):      |
| Ro'yxat: 240                      |
|  v 75%                            |
| Diagnostika: 180                  |
|  v 50%                            |
| Sinov: 45                         |
|  v 26%                            |
| To'lov: 12                        |
+-----------------------------------+
```

---

### C. Kunlik marketing (`/growth/marketing`)

#### Desktop:
```
+----------------------------------------------------------------------------------------------------+
| Kunlik marketing (Kontent kalendari)                                              [+ Yangi post]   |
| Sana oralig'i: [ 2026-10-06 ] — [ 2026-10-19 ]                                                    |
+----------------------------------------------------------------------------------------------------+
| 2026-10-06 (Bugun, Dushanba)                                                                       |
| -------------------------------------------------------------------------------------------------- |
| 19:00 | TG Kanal | Barchaga | PISA 2022 natijalari: 81% o'quvchida bo'shliq... [Tasdiqlangan] [Tahrir] |
| 21:00 | TG Kanal | 9-11 sinf| Bugungi masala #1: Funksiya grafigi...           [Qoralama]    [Tasdiqlash]|
+----------------------------------------------------------------------------------------------------+
| 2026-10-07 (Seshanba)                                                                              |
| -------------------------------------------------------------------------------------------------- |
| 19:00 | TG Kanal | 5-8 sinf | Matematikadan qanday qilib 1 oyda...             [Qoralama]    [Tasdiqlash]|
+----------------------------------------------------------------------------------------------------+
```

#### Mobile (375px) va Tahrirlash oynasi (Telegram Bubble & Belgilar):
```
+-----------------------------------+
| Kunlik marketing                  |
| [+ Yangi post]                    |
+-----------------------------------+
| 06.10 19:00 · TG Kanal            |
| "PISA 2022 natijalari..."         |
| Holat: Tasdiqlangan               |
| [Tahrirlash]                      |
+-----------------------------------+
| MODAL (Tahrirlash):               |
| [Vaqt] [Kanal] [Segment]          |
| +-------------------------------+ |
| | Telegram pufagi ko'rinishi:   | |
| | PISA natijalari bo'yicha...   | |
| | 19:00                         | |
| +-------------------------------+ |
| Matn: [.......................]   |
| Belgilar soni: 245 / 4000         |
| [Bekor qilish]       [Tasdiqlash] |
+-----------------------------------+
```

---

### D. Maktablar (`/growth/schools`)

#### Desktop:
```
+----------------------------------------------------------------------------------------------------+
| Xususiy maktablar (Pilot dasturi)                                              [+ Maktab qo'shish] |
+----------------------------------------------------------------------------------------------------+
| BOSQICHLAR VORONKASI:                                                                              |
| [Yangi: 4] -> [Murojaat: 3] -> [Demo: 2] -> [Pilot: 1] -> [Litsenziya: 0] | [Rad etdi: 1]          |
+----------------------------------------------------------------------------------------------------+
| Maktab nomi      | Shahar   | Kontakt / Mas'ul       | Bosqich    | O'quvchi | Narx      | Keyingi qadam|
+------------------+----------+------------------------+------------+----------+-----------+--------------+
| Vosiq International| Toshkent | Dilshod aka (Direktor) | Pilot      | 120 ta   | 1.5M so'm | 2026-10-08   |
| Oxbridge Academy | Toshkent | Malika opa             | Murojaat   | 80 ta    | —         | [!] Kechikdi |
+------------------+----------+------------------------+------------+----------+-----------+--------------+
```

---

## 4. O'z-o'zini tanqid va "Bitta aksessuarni olib tashlash" (Chanel printsipi)

- **Nimadan voz kechildi:** 
  1. Hamma narsani bir xil 20 ta mayda kartaga bo'lib tashlashdan voz kechildi.
  2. Ko'zni charchatuvchi neon AI-gradientlari va har bir kartaga mayda kirish animatsiyalari berilmadi.
  3. Ko'rsatkichlar sahifasida bir nechta murakkab grafiklarni tiqishtirmay, faqat **bitta** sokin haftalik trend grafigi qoldirildi.
  4. Marketing sahifasida oddiy quruq jadval o'rniga, inson idrokiga eng qulay bo'lgan **kunlar bo'yicha vizual guruhlash** tanlandi.
- **Accessibility tekshiruvi:**
  - Barcha modal oynalarda `<label>` ko'rinib turadi.
  - Ranglarning kontrasti WCAG 2.1 AA (kamida 4.5:1) talabiga javob beradi.
  - Barcha tugmalar kamida 44px balandlikda/hit-areaga ega.
  - O'chirish amallari oldidan qat'iy tasdiq so'raladi.
