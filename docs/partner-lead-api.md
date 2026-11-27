# Linkora Lead-API für Partner

Leads direkt aus Ihrem System an Linkora übermitteln – ohne Formular. Das Format entspricht der
gängigen Lead-API (gleiche Feldnamen, Werte und Antworten), Sie können Ihren bestehenden Export
also unverändert verwenden.

## Zugang

Den API-Schlüssel erhalten Sie von uns. Er beginnt mit `lk_live_` und wird bei jeder Anfrage
mitgeschickt:

```
Authorization: Bearer lk_live_…
```

Bitte geheim halten (nicht im Browser/Frontend verwenden). Bei Verdacht auf Missbrauch erzeugen
wir einen neuen – der alte ist dann sofort ungültig.

## Lead senden

```
POST https://calendra-group.online/api/leads/inbound
Content-Type: application/json
```

Ein Lead pro Anfrage. Höchstens **60 Leads pro Minute**.

### Beispiel Treppenlift

```bash
curl -X POST https://calendra-group.online/api/leads/inbound \
  -H "Authorization: Bearer lk_live_…" \
  -H "Content-Type: application/json" \
  -d '{
    "externalId": "crm-48213",
    "kategorie": "TREPPENLIFT",
    "anrede": "FRAU",
    "vorname": "Erika",
    "nachname": "Muster",
    "telefon": "0171 2345678",
    "email": "erika@example.de",
    "strasse": "Hauptstraße",
    "hausnummer": "12a",
    "plz": "80331",
    "ort": "München",
    "liftTyp": "SITZLIFT",
    "treppenform": "KURVIG",
    "innenAussen": "INNEN",
    "etagen": 1,
    "nutzer": "SELBST",
    "eigentuemer": "EIGENTUM",
    "zeitrahmen": "M1_3",
    "pflegegrad": "PG2",
    "datenschutzOk": true,
    "kontaktWunsch": "TELEFON",
    "besteErreichbarkeit": "vormittags",
    "rueckrufVon": "2026-12-01T10:00",
    "rueckrufBis": "2026-12-01T12:00",
    "notizen": "Treppe mit Podest"
  }'
```

### Beispiel Hausnotruf

```json
{
  "externalId": "crm-48214",
  "kategorie": "HAUSNOTRUF",
  "anrede": "HERR",
  "vorname": "Hans",
  "nachname": "Beispiel",
  "telefon": "030 1234567",
  "strasse": "Lindenweg",
  "hausnummer": "3",
  "plz": "10115",
  "ort": "Berlin",
  "pflegegrad": "PG3",
  "hausnotrufBedarf": true,
  "krankenkasse": "AOK Nordost",
  "datenschutzOk": true,
  "kontaktWunsch": "TELEFON"
}
```

## Felder

| Feld | Pflicht | Werte / Format |
|---|---|---|
| `externalId` | empfohlen | Ihre eigene ID (max. 100 Zeichen, `A–Z a–z 0–9 . _ : -`). Wird dieselbe ID erneut gesendet, entsteht **kein** zweiter Lead. |
| `kategorie` | ja | `TREPPENLIFT`, `HAUSNOTRUF` |
| `anrede` | ja | `HERR`, `FRAU`, `KEINE_ANGABE` |
| `vorname`, `nachname` | ja | Text |
| `telefon` | ja | mind. 6 Ziffern, beliebiges Format |
| `email` | nein | gültige E-Mail |
| `strasse`, `hausnummer`, `ort` | ja | Text |
| `plz` | ja | 5-stellige deutsche PLZ |
| `pflegegrad` | ja | `KEIN`, `PG1`–`PG5`, `BEANTRAGT` |
| `datenschutzOk` | ja | muss `true` sein – Einwilligung des Kunden liegt vor |
| `kontaktWunsch` | ja | `TELEFON`, `EMAIL`, `BEIDES` |
| `besteErreichbarkeit` | nein | Freitext, z. B. „nachmittags ab 15 Uhr“ |
| `rueckrufVon`, `rueckrufBis` | nein | Wunschzeit `YYYY-MM-DDTHH:MM` in deutscher Ortszeit; `rueckrufBis` nur zusammen mit `rueckrufVon` |
| `geburtsdatum` | nein | `YYYY-MM-DD` |
| `notizen` | nein | Freitext (max. 5000 Zeichen) |

**Nur Treppenlift** (dort Pflicht, bei Hausnotruf ignoriert):

| Feld | Werte |
|---|---|
| `liftTyp` | `SITZLIFT`, `PLATTFORMLIFT`, `HUBLIFT`, `UNBEKANNT` |
| `treppenform` | `GERADE`, `KURVIG`, `MEHRERE_ETAGEN`, `WENDELTREPPE`, `UNKLAR` |
| `innenAussen` | `INNEN`, `AUSSEN`, `INNEN_UND_AUSSEN` |
| `etagen` | Zahl 1–10 |
| `nutzer` | `SELBST`, `ANGEHOERIGER` |
| `eigentuemer` | `EIGENTUM`, `MIETE` |
| `zeitrahmen` | `SOFORT`, `M1_3`, `M3_6`, `SPAETER`, `UNKLAR` |
| `zeitrahmenText`, `haustyp`, `entscheider` | optional, Freitext |

**Nur Hausnotruf** (dort Pflicht): `hausnotrufBedarf: true`, `krankenkasse` (Text).

## Antworten

| Status | Bedeutung | Body |
|---|---|---|
| `201` | Lead angelegt | `{"id": "…", "status": "NEU", "created": true, "possibleDuplicate": false}` |
| `200` | `externalId` war schon da (oder gleiche Telefonnummer in derselben Kategorie) – nichts Neues angelegt | `{"id": "…", "status": "…", "created": false}` |
| `400` | Kein gültiges JSON | Fehlermeldung |
| `401` | Schlüssel fehlt, falsch oder entzogen | `{"error": "unauthorized"}` |
| `422` | Pflichtfeld fehlt / ungültiger Wert | `{"error": "validation_failed", "fieldErrors": {"plz": "PLZ unbekannt (5-stellige deutsche PLZ)"}}` |
| `429` | Mehr als 60 Leads pro Minute | `{"error": "rate_limited"}` – kurz warten und erneut senden |
| `500` | Fehler bei uns | erneut senden (mit derselben `externalId` ohne Risiko) |

`possibleDuplicate: true` heißt: Es gibt bereits einen Lead mit diesem Namen und dieser PLZ. Der
Lead wird trotzdem angelegt und geprüft.

## Empfehlung für den ersten Versand

1. Zuerst **einen** Lead senden und die Antwort prüfen (`201`).
2. Danach die übrigen Leads nacheinander senden (max. 60 pro Minute).
3. Bei `422` die `fieldErrors` korrigieren und denselben Lead erneut senden.
