# Prompt — Westep Chatlar (2-bosqich)

Boshqa AI agentga to‘liq beriladigan topshiriq. Shu faylni o‘qigan agent kod yozadi. Yozilmagan narsa taxmin qilinmasin — kod uslubiga qarab qilinsin, uslub ham mos kelmasa savol berilsin.

---

Siz Westep (WeStep) academy uchun **Chatlar** modulini qurasiz. Bu 2-bosqich. 1-bosqich **O‘quvchilar CRM** (`/students`, `/students/:id`, `users.signup_method`) boshqa ish — unga tegmang, faqat Chatdan o‘quvchi kartasiga havola qo‘ying.

Namuna mahsulot: **TopReels** kabinetidagi **Inbox / Chatlar** va **Mijozlar** ajratilishi. Chat CRM ichida drawer emas.

## 1. Mahsulot qarorlari (o‘zgarmaydi)

- Menyuda ikkita alohida bo‘lim: **O‘quvchilar** (CRM, 1-bosqich) va **Chatlar** (shu topshiriq).
- Bitta inbox, ikkita kanal, TopReelsdagi IG/TG belgisidek:
  - **App** — o‘quvchi Westep mobil ilovasidan yozadi.
  - **Telegram** — **ota-ona boti** (`ParentTelegramBotService`, `parent_telegram_links`). O‘quvchi @westepbot login oqimi chat emas.
- Layout: chapda suhbatlar ro‘yxati, o‘ngda xabarlar + yozish maydoni.
- Chat oynasidan «O‘quvchini ochish» → `/students/:id` (CRM).
- AI avto-javob yo‘q.
- Operator takeover / AI pause yo‘q.
- Birinchi versiyada faqat matn (rasm/fayl keyin).

## 2. Repolar va stack

| Qism | Yo‘l | Stack |
|---|---|---|
| Superadmin | `~/Projects/westep-admin` | Vite, React 19, React Router 7, Tailwind, TanStack Query/Table, axios `apiClient` (`/api`) |
| Backend | `~/Projects/westep-backend` | Java 21, Spring Boot 3.5.6, PostgreSQL, Flyway, JWT, `@CheckPermission` |
| Mobil | `~/Projects/westep-RNative` | Expo / Expo Router, mavjud `src/features/notifications` |

Har repoda `AGENTS.md` / `CLAUDE.md` bo‘lsa, avval o‘qing. Kod uslubini buzmang.

**Namuna UI (faqat o‘qish, copy-paste qilmang):**
- `~/Projects/topreels/apps/web/components/InboxPanel.tsx` — chap thread, o‘ng chat, kanal badge, yuborish.
- `~/Projects/topreels/apps/web/components/PeoplePanel.tsx` — Mijozlar CRM; Chatlar buning ichida emas.

Westep admin dizayni: TailAdmin tokenlari (`brand-*`, `gray-*`, `success-*`). TopReels binafsha/pushti brendini ko‘chirmang.

## 3. Hozirgi holat (buzilmasin)

Ikki tomonlama support chat **yo‘q**. Bor narsalar:

- Push/inbox notification: `NotificationService`, admin `Bildirishnomalar` sahifasi — bu broadcast, chat emas. Aralashtirmang.
- Ota-ona boti webhook: `POST /api/telegram/webhook` → `ParentTelegramBotService.handleUpdate`.
  - `/start`, kontakt, telefon, `/report` / «natija», mini-app, `/start login_<code>` (o‘quvchi login) **o‘z holida qolsin**.
  - Hozir tushunilmagan matn: «Buyruq tushunilmadi» + kontakt so‘rash. **Bog‘langan ota-ona** yozgan oddiy matn endi support xabar bo‘lsin; bog‘lanmagan chatda eski «buyruq tushunilmadi» qolsin.
- `parent_telegram_links`: `chat_id` (unique), `parent_phone` (`998XXXXXXXXX`), `telegram_user_id`, `telegram_username`.
- Farzandlar: `users.parent_phone` = link `parent_phone`. Bitta ota-onada bir nechta bola bo‘lishi mumkin.
- Javob yuborish: `TelegramApiClient.sendMessage(chatId, text)`.
- Mobil: one-way `/notifications`. Yangi chat API kerak.

## 4. UX

### 4.1 Admin — `/chats`

Chap:

- Qidiruv: ism, telefon, oxirgi xabar.
- Filtr: Hammasi · App · Telegram · O‘qilmagan.
- Har qator: avatar/initsial, nom, oxirgi xabar preview, vaqt, kanal badge (App / Telegram), o‘qilmagan nuqta.
- Telegram nom: `Ota-ona · {bolalar ismlari}`. App nom: o‘quvchi ismi.

O‘ng:

- Header: nom, kanal, qisqa holat (obuna/kirish usuli agar CRM API bersa), «O‘quvchini ochish».
- Telegram + bir nechta bola: bolalarni chip qilib ko‘rsat, birinchisini yoki tanlanganini CRM ga och.
- Xabarlar: ota-ona/o‘quvchi chapda, admin o‘ngda (`brand-500`).
- Past: textarea + Yuborish. Bo‘sh yuborilmasin.
- Thread yo‘q: bo‘sh holat.

Realtime: admin 3–5 soniya polling (yoki mavjud bo‘lsa SSE). WebSocket majburiy emas.

### 4.2 Mobil — o‘quvchi

- Profil yoki yordam: «Yordam / Chat» — admin bilan suhbat.
- Ro‘yxat emas, bitta thread (shu o‘quvchi ↔ support).
- Yangi xabar: in-app + mavjud Expo push (`DelayedNotificationService` / notification type yangi, masalan `SUPPORT_CHAT`).
- Ota-ona botidagi xabar o‘quvchi ilovasida ko‘rinmasin va aksincha.

## 5. Ma’lumot modeli (Flyway)

Yangi jadvallar, `AbsEntity` maydonlari (`id`, `created_at`, `updated_at`, `active`, `deleted`).

**`support_threads`**

- `channel` `APP` | `TELEGRAM` (check constraint)
- `student_user_id` UUID NULL FK `users` — APP da majburiy, unique (o‘quvchida 1 App thread)
- `parent_telegram_link_id` UUID NULL FK `parent_telegram_links` — TELEGRAM da majburiy, unique
- `last_message_at`, `last_message_preview` (qisqa)
- `student_unread_count`, `admin_unread_count` int default 0
- APP: `student_user_id NOT NULL AND parent_telegram_link_id IS NULL`
- TELEGRAM: `parent_telegram_link_id NOT NULL`

**`support_messages`**

- `thread_id` FK
- `sender_type` `STUDENT` | `PARENT` | `ADMIN`
- `sender_user_id` UUID NULL (admin yoki o‘quvchi `users.id`)
- `body` TEXT, trim, bo‘sh emas, max ~4000
- `telegram_message_id` NULL (idempotent webhook)
- `created_at`

Index: `thread_id + created_at`, `last_message_at desc`.

Migration: `src/main/resources/db/migration/VYYYYMMDD_##__....sql`. Entity qo‘shsangiz Flyway yozing.

## 6. Backend API

Permission: yangi `SUPPORT_CHAT_MANAGE` — `ADMIN` va `SUPER_ADMIN` (`RolePermissionMatrix`). Controllerda `@CheckPermission`. Superadmin panel shu ruxsat bilan.

Prefix: `/api/admin/chats` (admin), `/api/support-chat` (o‘quvchi).

Admin (JWT + permission):

- `GET /api/admin/chats?channel=&unread=&search=&page=&size=` — threadlar, `last_message_at desc`
- `GET /api/admin/chats/{threadId}/messages?page=&size=` — xabarlar, ochilganda `admin_unread_count=0`
- `POST /api/admin/chats/{threadId}/messages` `{ "body": "..." }`
  - APP: `support_messages` + o‘quvchiga push/inbox
  - TELEGRAM: `support_messages` + `TelegramApiClient.sendMessage(link.chatId, body)`. Bot o‘chsa xabar DB da qolsin, adminga xato ko‘rinsin.

O‘quvchi (JWT, STUDENT):

- `GET /api/support-chat/thread` — o‘z APP threadini yaratadi/qaytaradi
- `GET /api/support-chat/messages`
- `POST /api/support-chat/messages` `{ "body": "..." }` — `admin_unread_count++`, `sender_type=STUDENT`

DTO: `record`. Entityni to‘g‘ridan-to‘g‘ri qaytarmang. Soft-delete: `deleted=false`.

## 7. Telegram oqimi

`ParentTelegramBotService.handleUpdate` oxiridagi «buyruq tushunilmadi» ni o‘zgartiring:

1. Avval login (`telegramBotLoginService.handleStart` / `handleContact`) — o‘zgarishsiz.
2. Kontakt / telefon / `/start` / hisobot / mini-app — o‘zgarishsiz.
3. Bog‘langan `ParentTelegramLink` + oddiy matn → TELEGRAM thread (yo‘q bo‘lsa yarat) + `PARENT` xabar. `telegram_message_id` bilan dublikat yo‘q.
4. Bog‘lanmagan + tushunilmagan → eski «buyruq tushunilmadi».

Admin javobi bot orqali ota-onaga ketadi. Bot commandlari (`/start`, hisobot) chat xabari bo‘lmasin.

## 8. Admin frontend (`westep-admin`)

- Route `/chats` — `allRoutes.tsx`.
- Sidebar **Asosiy**: **Chatlar** (`ChatIcon` bor: `src/icons/chat.svg`). Badge ixtiyoriy (`admin_unread` yig‘indisi).
- Pattern: `src/pages/AdminNotifications/` + `src/api/adminNotifications/` (api + `use*.ts` hook).
- `CommonTable` chat uchun mos emas — Inbox ikki ustunli layout.
- Dark/light, mobil: avval ro‘yxat, thread ochilsa to‘liq chat, orqaga.

## 9. Mobil (`westep-RNative`)

- `src/features/support-chat/` — api, screen, types.
- Profil yoki yordamdan ochiladigan stack screen. Tabbarga yangi asosiy tab qo‘ymang.
- Mavjud `apiClient`, token, notification presentation uslubi.
- Expo versiya/build raqamini so‘ramasdan o‘zgartirmang; EAS submit qilmang.

## 10. Testlar

Backend (JUnit 5 + Mockito, mavjud uslub):

- Bog‘langan ota-ona matni thread + message yaratadi; `/start` va hisobot yaratmaydi.
- Login `/start login_` support thread yaratmaydi.
- App POST faqat o‘z threadiga.
- Admin TELEGRAM javobi `sendMessage` chaqiradi; APP javobi chaqirmaydi.
- Bo‘sh body 400.

Admin: `npm run build` o‘tsin. Mobil: mavjud test patterniga 1–2 unit.

## 11. Qilmang

- O‘quvchilar CRM (`/students`, `signup_method`) ni qayta yozmang.
- `Notification` broadcastni chatga aylantirmang.
- `user_attributions` / tracking qayta tiklamang.
- TopReels kodini Westepga ko‘chirmang; faqat UX tuzilma.
- Secret, bot token, `.p8` ni log/javobga chiqarmang.
- Production deploy/restart so‘ralmasa qilmang.
- Chatlar ichiga CRM jadvalini, CRM ichiga chat drawerni qo‘ymang.

## 12. Ish tartibi

1. Backend: migration + entity + service + webhook oqimi + test.
2. Admin `/chats` sahifasi.
3. Mobil yordam chati + push.
4. Qo‘lda: ota-ona bot matn → admin ko‘radi → javob Telegramda; o‘quvchi app → admin → o‘quvchida.

## 13. Tayyor deyish

- Ota-ona botining login/hisobot/kontakt oqimi ishlaydi.
- Bog‘langan ota-ona matni Chatlarda Telegram thread.
- O‘quvchi appdan yozsa App thread.
- Ikkala kanal bitta `/chats` da, aralashmaydi.
- Admin javobi to‘g‘ri kanalga ketadi.
- CRM havolasi `/students/:id` (sahifa bo‘lmasa, baribir shu path).
