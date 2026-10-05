# O‘quvchilar CRM — dizayn (1-bosqich)

**Sana:** 2026-10-05  
**Status:** Tasdiqlangan  
**Maqsad:** Superadminga o‘quvchilar ro‘yxati, statistika va kirish usuli (Telefon / Google / Telegram). TopReelsdagi Mijozlar kabi alohida bo‘lim.

## Tasdiqlangan qarorlar

- Menyuda **O‘quvchilar** alohida. **Chatlar** 2-bosqich (prompt: `docs/prompts/chatlar-boshqa-ai.md`).
- Layout: KPI + qidiruv/filtr + jadval; qator → alohida sahifa (drawer emas).
- Kirish usuli: `PHONE` | `GOOGLE` | `TELEGRAM`. Bazaga yoziladi; taxmin faqat backfill uchun.
- To‘liq kartochka: profil, obuna, qurilmalar, to‘lovlar.
- Chatlar menyuda 1-bosqichda yo‘q.

## Repolar

| Repo | Vazifa |
|---|---|
| `westep-backend` | `signup_method`, admin students API, Flyway, test |
| `westep-admin` | `/students`, `/students/:id`, menyu |

Mobil va Chatlar — scope tashqarida.

---

## 1. Ma’lumot

`users.signup_method VARCHAR(16) NOT NULL` — enum `SignupMethod { PHONE, GOOGLE, TELEGRAM }`.

Yoziladi faqat **yangi** user ochilganda:

- `AuthService` register → `PHONE`
- `GoogleAuthService` create → `GOOGLE`
- `TelegramAuthService.createStudent` → `TELEGRAM`

Mavjud userga Telegram/Google ulansa, `signup_method` o‘zgarmaydi.

**Backfill**

1. `phone LIKE 'google_%'` → `GOOGLE`
2. `telegram_user_id IS NOT NULL` → `TELEGRAM`
3. qolgani → `PHONE`

---

## 2. API

Ruxsat: mavjud `ADMIN_MANAGE_USERS`. Prefix: `/api/admin/students`.

`GET /api/admin/students`

Query: `search`, `signupMethod`, `subscriptionStatus` (`ACTIVE|PAST_DUE|CANCELLED|EXPIRED|NONE`), `page`, `size` (default 20, max 100). Tartib: `createdAt desc`.

Faqat `role=STUDENT`, `active=true`, `deleted=false`.

Item:

```
id, firstname, lastname, phone, displayPhone,
signupMethod, parentPhone, age, gender,
subscriptionStatus, planName, subscriptionEndsAt,
platform, lastSeenAt, createdAt
```

`displayPhone`: `google_…` → `Google akkaunt`; haqiqiy raqam `+998 ·· ·· ·· XX XX`.

`GET /api/admin/students/stats`

```
total, phone, google, telegram, paying, newThisWeek
```

`paying` = ACTIVE obunasi bor o‘quvchilar. `newThisWeek` = `createdAt` so‘nggi 7 kun (Asia/Tashkent).

`GET /api/admin/students/{id}` — kartochka: profil + obunalar + qurilmalar + to‘lovlar (`transactions` shu user).

`GET /api/admin/students/export.csv` — bir xil filtr, UTF-8 CSV.

404: STUDENT emas yoki o‘chirilgan.

---

## 3. Admin UI

TailAdmin tokenlari. TopReels binafsha palitrasini ko‘chirmaslik.

**`/students`**

- KPI: Jami, Telefon, Google, Telegram, To‘lovchi, Shu hafta.
- Qidiruv: ism, telefon, ota-ona telefoni.
- Filtr: kirish usuli, obuna.
- Jadval: o‘quvchi, kirish badge, obuna, ota-ona, qurilma, oxirgi kirish. Qator → `/students/:id`.
- CSV tugmasi. Server pagination.

**`/students/:id`**

Uzun sahifa: header (ism, badge’lar) → Profil | Obuna | Qurilmalar | To‘lovlar.

Menyu Asosiy: **O‘quvchilar** (`GroupIcon`), Boshqaruv panelidan keyin.

---

## 4. Test

- Backfill SQL: google prefix, telegram id, qolgani PHONE.
- Yangi register/google/telegram create `signup_method` qo‘yadi; bind qilish o‘zgartirmaydi.
- List faqat STUDENT; search/filter.
- Stats sonlari.
- CSV header.

Admin: `npm run build`.

## 5. Qilmang

- Chatlar, AI javob, tracking/attribution.
- `signup_method` ni keyingi login bilan almashtirish.
- Production deploy so‘ralmasa.
