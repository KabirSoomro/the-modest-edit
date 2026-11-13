# The Modest Edit — University E-Commerce Project (2026)
**Student Name:** Ghulam Kabir  
**Roll Number:** 2k23/CSM/40  
**Department:** Department of Computer Science, University of Sindh  
**Subject:** E-Commerce  
**Submitted To:** Sir Zuhaib Maqsood  
**Submission Date:** 17 November 2026  
**Contact / WhatsApp:** 03168465697 (+92 316 8465697)  
**Email:** gkabeersoomro@gmail.com  
**Location:** Hyderabad, Sindh, Pakistan  
**Project Name:** The Modest Edit  
**Tagline:** *"Modest. Modern. Mine."*  
**Tech Stack:** Pure Vanilla HTML5, CSS3, Modern JavaScript (ES6+). Zero frameworks, zero external dependencies (only Google Fonts).

---

## 1. Quick Start Guide
To launch and view the website:
1. Double-click `start-server.bat` in this folder to start the local server at `http://localhost:8080/`.
2. Or simply double-click `index.html` in Windows File Explorer to browse 100% offline.
3. No external build steps or npm installations are required — all navigation, cart state, facet filters, Quick View modal, and checkout validation run entirely client-side using native HTML5 and `localStorage`.

---

## 2. Product Catalog Architecture (106 Products Across 6 Categories)
The catalog contains **106 distinct, authentic items** with verified imagery, real Pakistani PKR market pricing, complete specifications, and realistic stock:
1. **Modest Fashion (26 items, IDs 1-12 & 71-84):** Chiffon abayas, everyday kimonos, Turkish front-zip coat abayas, Dubai butterfly kaftan Nida abayas, luxury velvet & zari Eid abayas, 180° umbrella flare abayas, pintuck daily workwear abayas with wudu-friendly zipped cuffs & phone pockets, organza overlay occasion abayas, Saudi jet-black crepe bishts, crinkle linen summer abayas, double-breasted trench cut abayas, balloon sleeve embroidered abayas, reversible dual-tone travel abayas, batwing Farashas, and liquid satin tiered abayas.
2. **Winter Collection (14 items, IDs 13-26):**
   - *Kids:* Boys' hooded winter puffers (Rs. 2,800), girls' floral quilted jackets (Rs. 2,900), fleece-lined windbreakers (Rs. 2,400), knitted beanie & scarf sets (Rs. 1,400).
   - *Women:* Long quilted puffer coats (Rs. 6,500), belted wool trench coats (Rs. 7,200), teddy fleece zip jackets (Rs. 4,600), Kashmiri Tilla embroidered shawls (Rs. 3,800), chunky cardigans (Rs. 3,400), velvet trim winter abayas (Rs. 6,800).
   - *Men:* Lightweight hooded puffers (Rs. 5,400), heavyweight storm parkas (Rs. 6,800), polar fleece zip pullovers (Rs. 3,200), classic quilted bombers (Rs. 4,800).
3. **Skincare Essentials (28 items, IDs 27-42 & 85-96):**
   - *Local Pakistani Creams & Derma Solutions:* Dermive oil-free moisturizing cream (Rs. 1,150), Maxdif skin brightening & dark spot fade cream (Rs. 1,450), Vince Extra Glow night cream (Rs. 1,280), Saeed Ghani Mughlai Ubtan cream (Rs. 550), Golden Pearl herbal blemish beauty cream (Rs. 450), Conatural organic rose hydrating gel (Rs. 1,350), Acneline overnight pimple drying lotion (Rs. 850).
   - *Targeted Acne Cleansers & Face Washes:* AcneClear tea tree & salicylic acid purifying gel (Rs. 780), MandelAC 1% mandelic acid clarifying wash for cystic acne (Rs. 1,150), Saeed Ghani neem & tulsi foaming cleanser (Rs. 620), Golden Glow rice water brightening cleanser (Rs. 890), Sebovash oil-free pH 5.5 daily wash (Rs. 950).
   - *Active Serums & Sun Protection:* 10% Niacinamide + Zinc, 2% BHA liquid exfoliant, 0.2% Granactive retinoid, 2% Alpha Arbutin, Cica calming sun stick, SPF 50+ invisible sunscreen, hydrocolloid pimple patches.
4. **Haircare & Shampoos (10 items, IDs 97-106):**
   - Conatural intense hair growth & anti-hairfall shampoo (Sulfate-free Biotin & Argan) (Rs. 1,650), Saeed Ghani Amla, Reetha & Shikakai herbal scalp detox shampoo (Rs. 580), Vatika Naturals Black Seed (Kalonji) nourishing shampoo (Rs. 650), Vince Keratin damage repair & anti-frizz shampoo (Rs. 1,200), Hemani Onion & Biotin revitalizing shampoo (Rs. 850), Tea Tree & Zinc Pyrithione anti-dandruff shampoo (Rs. 750), Hemani 7-in-1 herbal miracle growth hair oil (Rs. 980), Saeed Ghani pure castor & rosemary scalp tonic (Rs. 720), Conatural intense keratin deep conditioning mask (Rs. 1,850), Vatika Moroccan argan hair mayonnaise cream (Rs. 1,100).
5. **Makeup & Beauty (15 items, IDs 43-57):** Soft matte foundations (6 South Asian undertones), crease-proof concealers, lengthening tubing mascaras (wudu-friendly), velvet cream-to-powder blush pots, micro-blurring setting powders, peptide lip glow oils, waterproof felt-tip liners, teardrop microfiber beauty sponges.
6. **Accessories & Hijabs (13 items, IDs 58-70):** Premium modal & jersey hijabs, magnetic snap pins, bamboo undercaps, cloud laptop sleeves, canvas shopper totes, and satin scrunchie sets.

---

## 2. Project Architecture & File Structure
```
/The Modest Edit
├── index.html          # Editorial homepage with hero, categories, bestsellers & USP
├── shop.html           # Full 10-item catalog with search, price slider & category filters
├── product.html        # Dynamic PDP reading ?id= with size selector & product worth economics
├── cart.html           # Shopping bag with free-shipping meter & live order summary
├── checkout.html       # Cash on Delivery checkout with Pakistani phone validation & order modal
├── about.html          # Brand story, 4-pillar differentiation, pricing manifesto & 4 KPI cards
├── marketing.html      # 3-phase growth timeline, revenue formula, interactive simulator & SEO table
├── contact.html        # WhatsApp concierge, Hyderabad/Lahore details, interactive form & FAQ accordion
├── assignment.html     # Formal University Assignment Report (A4 PDF Print-Ready with 1-click upload)
├── README.md           # Submission documentation & assignment guide
├── css/
│   ├── style.css       # Design tokens, variables, typography, sticky header, drawer, toasts
│   ├── shop.css        # Product cards, catalog grid, PDP 2-column layout, cart & checkout modal
│   └── pages.css       # Editorial layouts for About, Marketing timeline, KPI cards & Contact
├── js/
│   ├── products.js     # Master 10-product catalog data array with pricing & helper functions
│   ├── cart.js         # localStorage CRUD engine (add, remove, update, subtotal & free delivery)
│   ├── shop.js         # Real-time multi-facet filtering (search, categories, price slider, sort)
│   ├── product.js      # URLSearchParams PDP logic, size/qty handlers & related recommendations
│   ├── checkout.js     # Form validation (Pakistani phone 03XX-XXXXXXX) & simulated order placement
│   └── main.js         # Sticky navbar scroll listener, mobile drawer, toasts & viewport animations
└── images/             # High-res Unsplash editorial photography with auto-fallback onerror handlers
```

---

## 3. Assignment Requirement Mapping
Each page and module directly maps to the university grading rubric:

| Page | Assignment Requirement Fulfilled | Core Features Demonstrated |
|---|---|---|
| **`index.html`** | Brand Identity, Value Proposition & Navigation | Sticky navbar with live reactive cart badge, editorial hero layout, 4 category cards with query links, 4 bestselling product cards, "Why Pakistani Women Trust Us" 4-point differentiation, value transparency banner, and newsletter signup with toast notification. |
| **`shop.html`** | Product Catalog & Multi-Facet Filtering | Complete 10-product database rendering from `products.js`, live keyword search, dynamic price slider (Rs. 500 – Rs. 6,500), multi-select category checkboxes, 4-way sorting, dynamic result counts, and quick-add to cart. |
| **`product.html`** | Dynamic Product Detail Page (PDP) | Parameter parsing via `URLSearchParams(?id=X)`, 2-column editorial layout, size selector pills (S/M/L or Standard), increment/decrement quantity controllers, stock indicator, 4 trust badges, "Product Worth" pricing breakdown, and related products. |
| **`cart.html`** | Cart State Management & Persistence | Persistent `localStorage` shopping bag, reactive item counter, dynamic line totals, instant item removal, animated free delivery progress meter (threshold: Rs. 3,000), and empty state illustration with call-to-action. |
| **`checkout.html`** | Localized Checkout & Order Validation | Cash on Delivery (COD) flow tailored for Pakistan, client-side regex validation for Pakistani mobile numbers (`03XX-XXXXXXX`), city selection, order summary sidebar, 1.5s simulated network spinner, full-screen order confirmation modal with `#TME-XXXX` reference, and automatic cart reset. |
| **`about.html`** | Business Case, Unit Economics & KPIs | Two-paragraph founding narrative, 4 expanded competitive moats, transparent cost-to-retail price comparison table (Raw materials, stitching, packaging vs. boutique rates), 4 commercial KPIs (Repeat rate, LTV:CAC, AOV, Niche authority), and natural-light photography philosophy. |
| **`marketing.html`** | Go-To-Market Plan & Financial Modeling | 3-Phase timeline (Pre-launch seeding, Meta ads launch, Retargeting retention), mathematical formula (`Revenue = Sessions × CVR × AOV`), 3-month financial milestones, interactive simulation calculator widget, Google Keyword Planner audience search volume table for Pakistan, and 2 target customer personas (Areeba & Zahra). |
| **`contact.html`** | Customer Relationship Management & FAQs | Direct WhatsApp concierge integration (`+92 300 1234567`), email, Gulberg III Lahore studio location, business hours, interactive form with frontend validation and toast confirmation, collapsible 4-part FAQ accordion, and embedded Google Map. |

---

## 4. 6 Recommended Screenshots for Submission

1. **Homepage Hero & Bestsellers (`index.html`)**:
   - *What to capture:* The top announcement bar, sticky header, Playfair Display headline (*"Modest. Modern. Mine."*), and the Bestsellers grid showing badges, star ratings, and PKR pricing.
2. **Interactive Shop Catalog with Active Filters (`shop.html`)**:
   - *What to capture:* The sidebar with an active category filter or search query (e.g., searching *"serum"* or selecting *"Skincare"*), the adjusted price slider, and the filtered product grid with live result counter.
3. **Product Detail Page with "Product Worth" Economics (`product.html?id=1`)**:
   - *What to capture:* The 2-column layout showing the high-res abaya, selected size pill, quantity adjuster, and the *"Transparent Pricing & Product Worth"* breakdown card comparing cost price, selling price, and traditional boutique markups.
4. **Shopping Cart with Unlocked Free Shipping (`cart.html`)**:
   - *What to capture:* Cart rows showing line totals, quantity controls, the 100% completed green free-shipping progress meter (*"🎉 Mubarak! You've unlocked FREE Nationwide Delivery"*), and the Order Summary sidebar.
5. **Cash on Delivery Checkout & Success Modal (`checkout.html`)**:
   - *What to capture:* The full-screen confirmation modal displaying the generated order reference (e.g. `#TME-4008`), customer details in Lahore, and delivery notes after clicking "Place Order".
6. **Marketing Strategy & Revenue Simulator (`marketing.html`)**:
   - *What to capture:* The 3-phase visual roadmap, the Google Keyword Planner Pakistan search volume table, and the interactive revenue simulation slider demonstrating projected monthly PKR revenue.

---

## 5. Design Tokens & Palette Reference
- **Primary (Warm Brown):** `#8B6F47`
- **Secondary (Sage Green):** `#A3B18A`
- **Background Cream:** `#F5EFE6`
- **Surface Pure:** `#FFFFFF` / Surface Card: `#FCFAF6`
- **Text Charcoal:** `#2D2D2D`
- **Accent Gold:** `#C9A961`
- **Typography:** Headings: *Playfair Display* | Body: *Inter / Poppins*
- **Footer Attribution:** *"Built by Kabir — E-Commerce Assignment 2026"*
