# Westep Admin Paneli — To'liq Qayta Dizayn va Modernizatsiya Rejasi

Ushbu hujjat Westep admin panelining barcha mavjud (eski) bo'limlarini zamonaviy, qulay, yoqimli va yagona dizayn tizimiga keltirish bo'yicha bosh reja hisoblanadi.

---

## 1. Dizayn Tamoyillari va Asosiy Qoidalar

1. **Yagona dizayn tili (Design System):**
   * Mavjud TailAdmin va Tailwind v4 tokenlaridan unumli foydalanish (`brand-*`, `gray-*`, `success-*`, `warning-*`, `error-*`).
   * Light va Dark mavzularida yuqori kontrast (WCAG 2.1 AA talablariga mos).
   * Ortiqcha sun'iy gradientlar va ko'zni toliqtiruvchi elementlardan xoli, sokin va professional interfeys (Linear, Vercel, Stripe uslubida).

2. **Domenlarga asoslangan axborot arxitekturasi (Domain-Driven Navigation):**
   * Hozirgi tartibsiz 17 ta bir xil qatorli menyuni 4 ta mantiqiy domenga ajratish:
     1. **Asosiy (Executive):** Boshqaruv paneli, O'sish (8 hafta).
     2. **Ta'lim & Tarbiya (EdTech Core):** Kunlik odatlar, Sovg'alar va buyurtmalar, Coinlar, Kurs moderatsiyasi, Roadmap shablonlari, Qiziqish testi, Kasb tanlovlari.
     3. **B2B & Moliya (Partners & Billing):** Bizneslar, Biznes domenlari, To'lov sozlamalari, Obuna paketlari.
     4. **Tizim & Sozlamalar (System & Ops):** Lavozimlar (Roles), Taxonomy, Ilova tarjimalari, Bildirishnomalar.

3. **Yadro komponentlar sifati (Quality Floor):**
   * **`CommonTable`:** React Hook xatolarini to'liq bartaraf etish, skeleton loading, zamonaviy bo'sh holat (empty state), gorizontal aylantirish (375px mobil moslashuvchanlik).
   * **Modallar va Formalar:** Har bir input uchun aniq ko'rinuvchi `<label>`, to'g'ri fokus halqasi (`focus:ring-2 focus:ring-brand-500`), tushunarli xatolik matnlari.
   * **Harakatlar va Tasdiqlar:** Xavfli amallar (o'chirish, rad etish) oldidan aniq tasdiqlash dialoglari.

4. **Mikromatnlar (UX Copy):**
   * Lotin alifbosidagi o'zbek tilida, faol fe'llar ("Saqlash", "Tasdiqlash", "Qo'shish", "Bekor qilish").
   * Bo'sh holatlarda foydalanuvchiga nima qilish kerakligini ko'rsatish ("Hozircha hech qanday odat qo'shilmagan — birinchisini yarating").

---

## 2. Bosqichma-bosqich Qayta Dizayn Rejasi

### 0-bosqich: Yadro Komponentlar va Navigatsiya (Foundation)
- [ ] **`CommonTable.tsx`:** Shartli hook chaqiruvlarini tuzatish, Skeleton yuklanish animatsiyasi, bo'sh holat dizayni.
- [ ] **`AppSidebar.tsx`:** Menyuni 4 ta aniq domenga ajratish, mos piktogrammalar (icons), faol holat indikatorlari.

### 1-bosqich: Asosiy Boshqaruv Markazi (Dashboard / Home - `/`)
- [ ] Soxta e-commerce widgetlarini (USA/France xaritasi, kiyim-kechak buyurtmalari) olib tashlash.
- [ ] **Westep Superadmin Hub:**
  - 8 haftalik o'sish ko'rsatkichlari xulosasi (Maqsadga yo'l).
  - Tezkor navbat ko'rsatkichlari: Kutilayotgan sovg'a buyurtmalari, moderatsiyadagi kurslar, bugungi faol odatlar.
  - Tezkor amallar (Quick Action buttons).

### 2-bosqich: Ta'lim & Tarbiya Bo'limi (EdTech Core)
- [ ] **`HabitsPage.tsx` (Kunlik odatlar):** Yosh toifalari bo'yicha ajratish, coin mukofoti ko'rinishi, modal formadagi label va layout.
- [ ] **`GiftsPage.tsx` & `CoinSettingsPage.tsx` (Sovg'alar & Coinlar):** Sovg'a katalogi, zaxira ko'rsatkichi, coin qoidalari.
- [ ] **`GiftOrdersPage.tsx` (Sovg'a buyurtmalari):** Buyurtma bosqichlari (Yangi, Tasdiqlangan, Jo'natilgan...), Sirli sovg'a modali.
- [ ] **`CourseModerationPage.tsx` (Kurs moderatsiyasi):** Kurslar tekshiruvi, muallif ma'lumotlari, tasdiqlash va rad etish sababi.
- [ ] **`RoadmapTemplatesPage.tsx` (Roadmap konstruktori):** Bosqichlar va ko'nikmalar vizual iyerarxiyasi.
- [ ] **`InterestQuizQuestionsPage.tsx` & `StudentProfessionsReview.tsx`:** Diagnostik savollar va kasb tanlovlari.

### 3-bosqich: B2B, Biznes va Moliya Bo'limi
- [ ] **`BusinessesPage.tsx` & `BusinessDomainsPage.tsx`:** Hamkor o'quv markazlari va maktablar kartalari/jadvali, domen sozlamalari.
- [ ] **`SubscriptionPlansPage.tsx` & `AddSubscriptionPlan.tsx`:** Tariflar taqqoslashi, narxlar va imkoniyatlar ro'yxati.
- [ ] **`PlatformPaymentSettingsPage.tsx`:** To'lov tizimlari (Payme, Click, Uzum) holati va sozlamalari.

### 4-bosqich: Tizim va Sozlamalar Bo'limi
- [ ] **`Roles.tsx` & `AddRole.tsx`:** Rollar va ruxsatnomalar boshqaruvi.
- [ ] **`TaxonomyPage.tsx`:** Kategoriya va fanlar tizimi.
- [ ] **`AppTranslationsPage.tsx`:** Mobil ilova tarjima kalitlari va qidiruv tizimi.
- [ ] **`AdminNotificationsPage.tsx`:** Bildirishnomalar tarixi va rejalashtirish.

---

## 3. Sifat va Ishonchlilik Ko'rsatkichlari

- **ESLint:** Mavjud 18 ta muammo soni oshmasligi, aksincha kamayishi kerak (`CommonTable` dagi 2 ta hook xatosini to'g'irlash orqali 16 tagacha kamaytirish).
- **TypeScript & Build:** Har bir bosqichdan so'ng `npm run build` 100% muvaffaqiyatli chiqishi shart.
- **API va Xulq-atvor:** Mavjud barcha API endpointlar va funksionallik to'liq saqlanadi.
