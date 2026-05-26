# ✂ Barbershop Studio

Ένα design template για ιστοσελίδες barbershop/κομμωτηρίων. **Ένα template, πολλοί πελάτες.** Κάθε πελάτης είναι ένα μικρό JSON config — όχι αντίγραφο κώδικα.

Φτιαγμένο για να το δουλεύεις με **Claude Code** στο PowerShell.

## Η ιδέα

```
template.html  (το design — ΕΝΑ για όλους)
      +
clients/dante.json  (τα στοιχεία ΑΥΤΟΥ του πελάτη)
      ↓  node build.js
dist/dante/index.html  (έτοιμο site)
```

Νέος πελάτης = νέο `clients/<slug>.json`. Bug fix = μία αλλαγή στο `template.html` → rebuild όλους. Ποτέ δεν επαναλαμβάνεις δουλειά.

## Setup (PowerShell)

```powershell
# Χρειάζεσαι Node.js 18+
node --version

# Μπες στον φάκελο
cd barbershop-studio

# Χτίσε όλους τους πελάτες
node build.js

# Preview στον browser (και στο κινητό μέσω local IP)
node serve.js
# → http://localhost:4000/
```

Δεν υπάρχουν dependencies να εγκαταστήσεις — όλα τρέχουν με σκέτο Node.

## Δουλεύοντας με Claude Code

Το `CLAUDE.md` λέει στον Claude Code ακριβώς πώς δουλεύει το project. Άνοιξε Claude Code μέσα στον φάκελο:

```powershell
cd barbershop-studio
claude
```

Μετά απλά ζήτα ό,τι θες σε φυσική γλώσσα:

```
> Φτιάξε νέο πελάτη "Vintage Cuts" στην Καλαμάτα. Σκούρο μπλε/χρυσό
  theme, engraved logo. Κούρεμα 14€, Γένια 10€, Combo 20€.
  Ωράριο Δευ-Σαβ 9-20, Κυριακή κλειστά. Τηλ 27210 12345.

> Χτίσε τον και δείξε μου τι άλλαξε.

> Άλλαξε το accent χρώμα του Dante σε πιο βαθύ κόκκινο.

> Πρόσθεσε υπηρεσία "Χτένισμα γαμπρού 35€" σε όλους τους πελάτες.
```

Ο Claude Code θα δημιουργήσει/επεξεργαστεί τα config, θα τρέξει το build, και θα σου δείξει το αποτέλεσμα.

### Πρώτη φορά: τρέξε `/init`

Μέσα στο Claude Code session, τρέξε μία φορά:

```
> /init
```

Διαβάζει το `CLAUDE.md` και τη δομή ώστε σε επόμενα sessions να είναι αμέσως έτοιμος.

## Δομή

```
barbershop-studio/
├── template.html      # Το design. Εδώ γίνονται design changes (αλλάζει ΟΛΟΥΣ).
├── build.js           # Χτίζει τα sites.
├── serve.js           # Local preview server (zero deps).
├── clients/
│   ├── dante.json     # Πραγματικός πελάτης (Θεσσαλονίκη).
│   └── _example.json  # Πρότυπο για νέους πελάτες (warm/light variant).
├── dist/              # Generated. Μην το πειράζεις στο χέρι.
├── CLAUDE.md          # Οδηγίες για Claude Code.
└── package.json
```

## Πώς διαφέρει κάθε site

Τρεις μοχλοί (όλα στο config του κάθε πελάτη):

1. **Χρώματα** (`theme`) — accent + background mood. Cool/warm, dark/light.
2. **Γραμματοσειρές** (`fonts`) — display + script + body trio.
3. **Logo style** (`shop.logoStyle`) — `neon` (glow) ή `engraved` (serif κεφαλαία).

Ο `dante` είναι dark + neon. Το `_example` (Apollon) είναι warm + engraved — δες πόσο διαφορετικά δείχνουν με το ίδιο template.

## Deploy

Κάθε `dist/<slug>/` είναι ένα στατικό site. Ανέβασέ το όπου θες:

- **Vercel:** `vercel deploy dist/dante` (ή σύνδεσε το repo και όρισε output dir).
- **Netlify:** drag-drop τον φάκελο `dist/dante`.
- **Custom domain ανά πελάτη:** κάθε site σε δικό του domain/subdomain.

> Αυτά είναι στατικά sites με demo booking. Για πραγματικές κρατήσεις, σύνδεσε το booking με το ξεχωριστό backend project (Express + SQLite + Google Calendar) — δες το `CLAUDE.md`, ενότητα "Production".

## Σημείωση

Το booking στο template είναι **demo** (δεν αποθηκεύει). Λειτουργεί τέλεια για να δείξεις στον πελάτη πώς θα είναι. Για ζωντανές κρατήσεις χρειάζεται το backend.
