<div align="center">

# dont-break

**Το επίπεδο εμπιστοσύνης για κώδικα γραμμένο από AI.**

[![PyPI](https://img.shields.io/pypi/v/dont-break)](https://pypi.org/project/dont-break/)
[![Python](https://img.shields.io/pypi/pyversions/dont-break)](https://pypi.org/project/dont-break/)
[![PyPI Downloads](https://static.pepy.tech/personalized-badge/dont-break?period=total&units=INTERNATIONAL_SYSTEM&left_color=BLACK&right_color=GREEN&left_text=downloads)](https://pepy.tech/projects/dont-break)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE)
[![Instagram](https://img.shields.io/badge/Instagram-dontbreak.dev-E4405F?logo=instagram&logoColor=white)](https://www.instagram.com/dontbreak.dev/)
[![Reddit](https://img.shields.io/badge/Reddit-u%2Fdont--break-FF4500?logo=reddit&logoColor=white)](https://www.reddit.com/user/dont-break/)

[🇬🇧 English](https://github.com/polymerix-labs/dont-break/blob/main/README.md) · [🇫🇷 Français](https://github.com/polymerix-labs/dont-break/blob/main/README.fr.md) · [🇸🇦 العربية](https://github.com/polymerix-labs/dont-break/blob/main/README.ar-SA.md) · [🇨🇿 Čeština](https://github.com/polymerix-labs/dont-break/blob/main/README.cs-CZ.md) · [🇩🇰 Dansk](https://github.com/polymerix-labs/dont-break/blob/main/README.da-DK.md) · [🇩🇪 Deutsch](https://github.com/polymerix-labs/dont-break/blob/main/README.de-DE.md) · **🇬🇷 Ελληνικά** · [🇪🇸 Español](https://github.com/polymerix-labs/dont-break/blob/main/README.es-ES.md) · [🇮🇷 فارسی](https://github.com/polymerix-labs/dont-break/blob/main/README.fa-IR.md) · [🇫🇮 Suomi](https://github.com/polymerix-labs/dont-break/blob/main/README.fi-FI.md) · [🇵🇭 Filipino](https://github.com/polymerix-labs/dont-break/blob/main/README.fil-PH.md) · [🇮🇱 עברית](https://github.com/polymerix-labs/dont-break/blob/main/README.he-IL.md) · [🇮🇳 हिन्दी](https://github.com/polymerix-labs/dont-break/blob/main/README.hi-IN.md) · [🇭🇺 Magyar](https://github.com/polymerix-labs/dont-break/blob/main/README.hu-HU.md) · [🇮🇩 Bahasa Indonesia](https://github.com/polymerix-labs/dont-break/blob/main/README.id-ID.md) · [🇮🇹 Italiano](https://github.com/polymerix-labs/dont-break/blob/main/README.it-IT.md) · [🇯🇵 日本語](https://github.com/polymerix-labs/dont-break/blob/main/README.ja-JP.md) · [🇰🇷 한국어](https://github.com/polymerix-labs/dont-break/blob/main/README.ko-KR.md) · [🇳🇱 Nederlands](https://github.com/polymerix-labs/dont-break/blob/main/README.nl-NL.md) · [🇳🇴 Norsk](https://github.com/polymerix-labs/dont-break/blob/main/README.no-NO.md) · [🇵🇱 Polski](https://github.com/polymerix-labs/dont-break/blob/main/README.pl-PL.md) · [🇧🇷 Português (Brasil)](https://github.com/polymerix-labs/dont-break/blob/main/README.pt-BR.md) · [🇷🇴 Română](https://github.com/polymerix-labs/dont-break/blob/main/README.ro-RO.md) · [🇷🇺 Русский](https://github.com/polymerix-labs/dont-break/blob/main/README.ru-RU.md) · [🇸🇪 Svenska](https://github.com/polymerix-labs/dont-break/blob/main/README.sv-SE.md) · [🇹🇭 ไทย](https://github.com/polymerix-labs/dont-break/blob/main/README.th-TH.md) · [🇹🇷 Türkçe](https://github.com/polymerix-labs/dont-break/blob/main/README.tr-TR.md) · [🇺🇦 Українська](https://github.com/polymerix-labs/dont-break/blob/main/README.uk-UA.md) · [🇺🇿 Oʻzbekcha](https://github.com/polymerix-labs/dont-break/blob/main/README.uz-UZ.md) · [🇻🇳 Tiếng Việt](https://github.com/polymerix-labs/dont-break/blob/main/README.vi-VN.md) · [🇨🇳 简体中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-CN.md) · [🇹🇼 繁體中文](https://github.com/polymerix-labs/dont-break/blob/main/README.zh-TW.md)

</div>

![Rule Studio: περιγράψτε τι δεν πρέπει ποτέ να χαλάσει, δείτε το γράφημα να το βρίσκει και να δοκιμάζει την προστασία](https://raw.githubusercontent.com/polymerix-labs/dont-break/main/docs/assets/screenshot.png)

Οι πράκτορες AI παραδίδουν κώδικα γρήγορα. Κανείς δεν παραδίδει εμπιστοσύνη μαζί του. Κάθε ομάδα που χρησιμοποιεί Cursor, Claude ή bots CI μοιράζεται τον ίδιο ανομολόγητο φόβο: την ημέρα που μια γρήγορη διόρθωση θα χαλάσει σιωπηλά το ένα πράγμα που δεν έπρεπε ποτέ να χαλάσει.

Το `dont-break` μετατρέπει αυτόν τον φόβο σε συμβόλαιο:

1. **Πείτε το με απλά λόγια.** "Κανείς δεν πρέπει να μπορεί να χαλάσει τον υπολογισμό τιμολογίων, ούτε καν έμμεσα." Χωρίς διαδρομές αρχείων, χωρίς κώδικα.
2. **Δείτε το να βρίσκεται.** Το dont-break διαβάζει τον ζωντανό χάρτη της βάσης κώδικά σας και φωτίζει κάθε σημείο που φέρει αυτή τη λογική, συμπεριλαμβανομένων διαδρομών που είχατε ξεχάσει ότι υπήρχαν.
3. **Δείτε το να δέχεται επίθεση.** Γράφει έναν κανόνα προστασίας, μετά αναπαράγει αλλαγές κώδικα εναντίον του για να αποδείξει ότι η προστασία πράγματι αντέχει. Δοκιμαστική εκτέλεση: τίποτα στον κώδικά σας δεν αγγίζεται.
4. **Ενεργοποιήστε τον.** Από εκεί και πέρα, κάθε επεξεργασία πράκτορα ελέγχεται έναντι του κανόνα πριν εφαρμοστεί. Ο πράκτοράς σας ακούει "αυτό είναι πιο ριψοκίνδυνο απ' όσο φαίνεται" αντί να το ανακαλύψετε στην παραγωγή.

```text
Εσείς:  "Μετονόμασε το PokemonService.fetchAll"
Πράκτορας: → get_dependents(PokemonService.fetchAll)   "23 σημεία κλήσης σε 4 modules"
           → get_impact(files: [...])                  "ακτίνα 3, αγγίζει ui/, cache/, api/"
           → get_do_not_touch()                        "Το PokemonService είναι επικίνδυνη ζώνη: fan-in 23, σταθερότητα 31"
Πράκτορας: "Αυτό είναι πιο ριψοκίνδυνο απ' όσο φαίνεται. Ορίστε τα 23 σημεία που θα χαλάσουν,
            και ένα ασφαλέστερο σχέδιο σε 2 βήματα."
```

Αυτή η συνομιλία γίνεται αυτόματα μόλις συνδεθείτε. Χωρίς prompt engineering: το skill του πράκτορα το διδάσκει.

## Εγκατάσταση

Απαιτεί **Python 3.9+** και **Node.js** (npm). Ο εξαγωγέας γραφήματος εγκαθίσταται μόνος του κατά την πρώτη εκτέλεση.

```bash
pip install dont-break
dont-break --wake
```

Αυτό ανοίγει ένα τοπικό UI στο `http://127.0.0.1:4040`, στη γλώσσα σας (32 διαθέσιμες). Συνδεθείτε, επιλέξτε φάκελο έργου, και ο χάρτης του κώδικά σας χτίζεται μόνος του: ένα ζωντανό τρισδιάστατο γράφημα κάθε module, κλήσης και εξάρτησης, με τις προστατευμένες ζώνες σας φωτισμένες από πάνω.

## Επιλέξτε τη μάχη σας

**"Ο πράκτοράς μου συνεχίζει να χαλάει πράγματα που δεν άνοιξε ποτέ"**<br>
Συνδέστε το dont-break στο Cursor ή στο Claude Desktop. Ο πράκτοράς σας ελέγχει τον αντίκτυπο και τις επικίνδυνες ζώνες πριν την επεξεργασία, όχι μετά.<br>
→ [Ρύθμιση σε Cursor / Claude (2 λεπτά)](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/cursor.md)

**"Θέλω το CI να μπλοκάρει καταστροφές, όχι να συζητά για στιλ"**<br>
Ένα job που αποτυγχάνει το merge όταν μια αλλαγή αγγίζει προστατευμένη ζώνη ή εύθραυστο κόμβο, βασισμένο στο πραγματικό γράφημα εξαρτήσεων, όχι σε εντυπώσεις.<br>
→ [GitHub Actions](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/github-actions.md) · [GitLab CI](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/gitlab-ci.md) · [pre-commit hook](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/pre-commit.md)

**"Θέλω απλώς να ανακρίνω τη βάση κώδικά μου"**<br>
`dbq dependents <id> | jq`: τι θα χαλάσει αν το αλλάξω αυτό; Το repo σας γίνεται μια βάση δεδομένων με δυνατότητα ερωτημάτων.<br>
→ [Συνταγές Shell + jq](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/shell.md)

**"Φτιάχνω τον δικό μου πράκτορα"**<br>
Τα ίδια 11 εργαλεία, εκτεθειμένα ως τυπικές ορισμοί TypeScript ή μια παραγόμενη προδιαγραφή OpenAPI 3.1.<br>
→ [LangChain / OpenAPI / δικοί σας πράκτορες](https://github.com/polymerix-labs/dont-break/blob/main/docs/agents/langchain.md)

## Τα 11 εργαλεία που αποκτά ο πράκτοράς σας

| Εργαλείο | Η ερώτηση που λύνει |
|------|----------------------|
| `find_symbol` | "Ποιος κόμβος είναι αυτό το όνομα / αρχείο;" (σημείο εισόδου) |
| `get_dependents` | "Τι θα χαλάσει αν το αλλάξω αυτό;" |
| `get_impact` | "Ποια είναι η ακτίνα επίδρασης αυτών των αλλαγών;" |
| `get_do_not_touch` | "Τι πρέπει να αρνηθώ να αγγίξω χωρίς να ρωτήσω;" |
| `get_dependencies` | "Από τι εξαρτάται αυτός ο κώδικας;" |
| `find_path` | "Γιατί μια αλλαγή στο A επηρεάζει το B;" |
| `get_arch_status` | "Πόσο προσεκτικά πρέπει να δουλέψω σε αυτό το repo;" |
| `check_change` | "Παραβιάζει αυτή η αλλαγή έναν κανόνα ομάδας;" |
| `propose_rule` | "Καταγραφή προειδοποίησης τώρα, ή αποκλεισμού προς έγκριση από άνθρωπο" |
| `pause_own_rule` | "Παύση κανόνα που δημιούργησε αυτό το token πράκτορα" |
| `append_rule_reason` | "Προσθήκη μίας αιτιολογίας, ποτέ επεξεργασία ή διαγραφή" |

Τα εργαλεία ερωτημάτων είναι μόνο για ανάγνωση, ανάλυση από την πλευρά του server, περιορισμένες απαντήσεις: πάντα ασφαλή για κλήση. Τα τρία εργαλεία κανόνων γράφουν κανόνες ομάδας υπό αυστηρά όρια: δεν μπορούν να ενεργοποιήσουν αποκλεισμό, να παύσουν τον κανόνα κάποιου άλλου, ή να ξαναγράψουν αιτιολογίες.

## Το δωμάτιο ελέγχου

- **Rule Studio**: περιγράψτε τι δεν πρέπει ποτέ να χαλάσει, δείτε το γράφημα να το βρίσκει, δοκιμάστε την προστασία ζωντανά πριν την ενεργοποίηση
- **Check**: προσομοιωτής πριν την επεξεργασία: επιλέξτε σπόρους, λάβετε κρίση ok/warn/block, ζωντανέψτε την ακριβή διαδρομή που θα ακολουθούσε μια βλάβη
- **Overview**: μια κρίση σε μία πρόταση, ενδείξεις σταθερότητας και πλοηγησιμότητας AI, οι κορυφαίες ενέργειες που θα ενίσχυαν την αρχιτεκτονική σας
- **Graph**: η τρισδιάστατη σκηνή Nebula, προστατευμένες ζώνες και διαδρομές μαρτύρων φωτισμένες ως επικαλύψεις
- **Agents**: συνδέστε Cursor, Claude ή CI με ένα κλικ, με ζωντανή επίδειξη προσπάθειας-να-χαλάσετε

Πρώτα το πληκτρολόγιο: το `cmd+K` ανοίγει την παλέτα εντολών.

## Συνδέστε τον πράκτορά σας σε 30 δευτερόλεπτα

1. Ανοίξτε την εφαρμογή dont-break → **Agents**.
2. Συνδεθείτε, συνδέστε τον φάκελο με ένα έργο, κάντε κλικ στο **Connect Cursor**: ένα κλικ εκδίδει ένα token με εμβέλεια το έργο και συμπληρώνει το `mcp.json`.
3. Επικολλήστε στο Cursor (ή τον πελάτη MCP σας).
4. Κάντε κλικ στο **Install agent skill**: γράφει το πρωτόκολλο ασφαλούς αλλαγής στο `AGENTS.md` του repo σας, ώστε οι πράκτορες να χρησιμοποιούν τα εργαλεία χωρίς να τους ζητηθεί.

## Άδεια χρήσης

Apache-2.0. Δείτε [LICENSE](https://github.com/polymerix-labs/dont-break/blob/main/LICENSE) και [NOTICE](https://github.com/polymerix-labs/dont-break/blob/main/NOTICE).
