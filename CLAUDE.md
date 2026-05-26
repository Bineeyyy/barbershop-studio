# CLAUDE.md — Barbershop Studio

Οδηγίες για Claude Code. Διάβασέ τες πριν κάνεις οποιαδήποτε αλλαγή.

## Τι είναι αυτό το project

Ένα **config-driven template** για ιστοσελίδες barbershop/κομμωτηρίων. ΕΝΑ design template, ΠΟΛΛΟΙ πελάτες. Κάθε πελάτης = ένα JSON config. Το `build.js` συνδυάζει template + config και βγάζει έτοιμο site.

**Κανόνας #1:** Ποτέ μην κάνεις copy-paste ολόκληρο το HTML για νέο πελάτη. Δημιουργείς ΜΟΝΟ ένα νέο config στο `clients/`.

**Κανόνας #2:** Bug fixes και βελτιώσεις design πάνε στο `template.html` — ποτέ στα αρχεία του `dist/`. Το `dist/` είναι generated output, σβήνεται και ξαναχτίζεται.

## Δομή

```
barbershop-studio/
├── template.html        # ΤΟ design. Όλα τα sites το μοιράζονται. Εδώ γίνονται design changes.
├── build.js             # Συνδυάζει template + κάθε config → dist/<slug>/index.html
├── clients/
│   ├── dante.json       # Πραγματικός πελάτης
│   └── _example.json    # Πρότυπο. Αρχεία με _ ΔΕΝ χτίζονται.
├── dist/                # GENERATED. Μην το επεξεργάζεσαι ποτέ στο χέρι.
│   └── dante/index.html
├── CLAUDE.md            # Αυτό το αρχείο
├── README.md
└── package.json
```

## Πώς να προσθέσεις νέο πελάτη (η πιο συχνή εργασία)

1. **Αντίγραψε** `clients/_example.json` σε `clients/<slug>.json` (το slug = μικρά λατινικά, χωρίς κενά, π.χ. `vintage-cuts`).
2. **Γέμισε** τα πεδία (βλέπε schema παρακάτω) με τα στοιχεία του πελάτη.
3. **Διάλεξε διαφορετική αισθητική** ώστε να μη μοιάζει με τους άλλους (βλέπε "Variety" παρακάτω).
4. **Τρέξε** `node build.js <slug>` (ή `node build.js` για όλους).
5. Το έτοιμο site είναι στο `dist/<slug>/index.html`.

Αν ο χρήστης δώσει φωτογραφία του χώρου ή Instagram link, χρησιμοποίησέ τα για να επιλέξεις χρώματα/αισθητική που ταιριάζουν στο πραγματικό μαγαζί.

## Config schema (clients/*.json)

| Πεδίο | Τι είναι |
|---|---|
| `slug` | Μοναδικό ID. Γίνεται ο φάκελος `dist/<slug>/`. |
| `shop.name` | Όνομα (μεγάλο, στο hero). |
| `shop.nameSuffix` | π.χ. "Barbershop". |
| `shop.tagline` | Μία φράση κάτω από το όνομα. |
| `shop.eyebrow` | Μικρό κείμενο πάνω από το όνομα. |
| `shop.logoStyle` | `"neon"` (script + glow, σαν Dante) ή `"engraved"` (serif κεφαλαία, χωρίς glow). |
| `theme.*` | Όλα τα χρώματα ως CSS variables. Βλέπε "Theme tokens". |
| `fonts.googleUrl` | Το πλήρες Google Fonts `<link href>`. |
| `fonts.display` | Headers font, π.χ. `"'Cinzel', serif"`. |
| `fonts.script` | Logo font (για neon), π.χ. `"'Sacramento', cursive"`. |
| `fonts.body` | Body font, π.χ. `"'Archivo', sans-serif"`. |
| `services[]` | `{id, name, desc, duration_min, price_eur}`. Τα `id` μοναδικά (1,2,3...). |
| `experience.title` | Χρησιμοποίησε `\n` για αλλαγή γραμμής. |
| `experience.intro` | Παράγραφος. |
| `experience.features[]` | 3 στοιχεία `{title, text}` (παίρνουν αυτόματα icons). |
| `studio.title` / `studio.intro` | Section "Ο Χώρος". |
| `locations[]` | `{address, city, phone, email?, mapQuery}`. 1 ή 2 (έως 4). |
| `hours.open` | Ώρα ανοίγματος (αριθμός, π.χ. 10). |
| `hours.closeWeekday` / `closeSaturday` | Ώρες κλεισίματος (αριθμοί). Τροφοδοτούν τα booking slots. |
| `hours.sundayClosed` | true/false. |
| `hours.display.*` | Τα strings που εμφανίζονται (`weekday`, `saturday`, `sunday`). |
| `social.instagram` / `instagramHandle` | URL + @handle. |

## Theme tokens (theme.*)

Κάθε ένα είναι CSS variable. Τα βασικά που αλλάζουν την αίσθηση:

- `ink` — το πιο σκούρο background (σχεδόν μαύρο).
- `char`, `char-2`, `smoke` — διαβαθμίσεις surface (cards, sections).
- `line` — borders.
- `bone`, `bone-dim`, `bone-faint` — κείμενο (φωτεινό → αχνό).
- `amber`, `amber-bright` — **το κύριο accent / CTA χρώμα**. Άλλαξέ το για instant νέα ταυτότητα.
- `neon`, `neon-glow` — το glow του logo (όταν logoStyle: neon).
- `brick`, `green` — διακοσμητικά accents (textures, tiles).

**Για light theme:** δώσε φωτεινά `ink/char` και σκούρα `bone`. Δες πώς το κάνει το `_example.json` (warm/earthy).

## Variety — κάνε κάθε site διαφορετικό

Ο στόχος είναι κάθε πελάτης να ΜΗΝ μοιάζει με τον προηγούμενο. Δούλεψε 3 μοχλούς:

1. **Χρώματα** — άλλαξε `amber` (accent) + `ink/char` (background mood). Cool vs warm, dark vs light.
2. **Γραμματοσειρές** — άλλαξε το font trio. Ζευγάρια που δουλεύουν:
   - Classic/luxe: Cinzel + Sacramento + Archivo (Dante)
   - Warm/vintage: Cormorant Garamond + Pacifico + Sora
   - Modern/bold: Bebas Neue + Caveat + Inter Tight
   - Editorial: Playfair Display + Dancing Script + Manrope
   Πάντα ενημέρωσε ΚΑΙ το `fonts.googleUrl` με τα νέα families.
3. **Logo style** — `neon` vs `engraved` αλλάζει δραματικά το hero.

Αν χρειάζεται πιο ριζική διαφοροποίηση (διαφορετικό layout, όχι μόνο χρώματα), τότε ΝΑΙ άλλαξε το `template.html` — αλλά πρόσεξε ότι αλλάζει ΟΛΟΥΣ τους πελάτες. Αν θες layout μόνο για έναν, ρώτα τον χρήστη αν προτιμά να φτιάξουμε δεύτερο template.

## Production (σύνδεση με backend)

Το template έχει mock booking (δεν αποθηκεύει — απλό demo). Για κανονική λειτουργία:

- Στο `template.html`, στη `submitBooking()`, αντικατάστησε το `setTimeout(...)` με πραγματικό `fetch('/api/bookings', {...})` προς το Express backend (το ξεχωριστό project `barbershop-booking`).
- Ομοίως, η `mockTaken()` πρέπει να γίνει `fetch('/api/slots?...')`.
- Το backend (Express + SQLite + Google Calendar) ζει σε ξεχωριστό repo. Ένα backend μπορεί να σερβίρει πολλούς πελάτες αν προσθέσεις `shop_id` στα queries.

Μη συνδέσεις το backend χωρίς να σε το ζητήσει ρητά ο χρήστης.

## Εντολές

Απαιτείται Node.js 18+. Καμία dependency να εγκαταστήσεις.

- `node build.js` — χτίζει όλους τους πελάτες.
- `node build.js dante` — χτίζει μόνο τον `dante`.
- `npm run build` — ίδιο με `node build.js`.
- `node serve.js` (ή `npm run serve`) — local preview στο http://localhost:4000/ με λίστα όλων των built πελατών. Zero dependencies.

## Πώς το build.js γράφει στο template

Το `build.js` (~60 γραμμές) κάνει string replacement σε 4 markers του `template.html`:

| Marker | Που μπαίνει | Τι γίνεται |
|---|---|---|
| `__TITLE__` | `<title>` | `shop.name + nameSuffix` |
| `<!--__FONTS__-->` | `<head>` | `<link>` προς `fonts.googleUrl` |
| `/*__THEME__*/` | μέσα σε `<style>` | `:root{--ink:...;--amber:...;...}` (όλο το `theme` + fonts ως CSS variables) |
| `/*__CONFIG__*/` | μέσα σε `<script>` | `const CONFIG = {...}` — όλο το JSON. Το template JS διαβάζει από `CONFIG.shop.name`, `CONFIG.services`, `CONFIG.hours`, κλπ. |

Αν επεξεργαστείς το `template.html`, **μην αφαιρέσεις αυτά τα 4 placeholders** — σπάει το build. Όλα τα δυναμικά κομμάτια του site (services list, hours, locations, booking slots) διαβάζονται runtime από το `CONFIG` object.

## Τι ΝΑ ΜΗΝ κάνεις

- ❌ Μην επεξεργάζεσαι αρχεία στο `dist/` (χάνονται στο επόμενο build).
- ❌ Μην αντιγράφεις HTML για νέο πελάτη (μόνο config).
- ❌ Μην βάζεις πραγματικά credentials (API keys, passwords) στα config — αυτά είναι public.
- ❌ Μην εφευρίσκεις στοιχεία πελάτη (τηλέφωνα, διευθύνσεις). Αν λείπουν, ρώτα ή άσε placeholder και σημείωσέ το.
