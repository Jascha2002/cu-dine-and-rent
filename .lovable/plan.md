

# CU Kantine & Catering – MVP Website

## Überblick
Professionelle Website für ein Gastronomie-Unternehmen aus Gera mit 4 Kantinen-Standorten, Catering-Service und Equipment-Vermietung. **MVP-Fokus: Kantinen + Vorbestellung BZO**, mit Lovable Cloud Backend von Anfang an.

---

## Phase 1: MVP (Jetzt umsetzen)

### 🎨 Design-System
- Farbschema: Dunkelgrün (#006a4b), Weiß, Terracotta (#e07856), Anthrazit (#25292a)
- Modern, clean, gastro-freundlich, mobile-first
- Lucide React Icons durchgehend

### 📄 Seiten & Navigation

**Header (sticky):**
- Logo "CU Kantine & Catering", Kontaktinfo, Zeitanzeige "Bestellbar bis 11:15 Uhr" mit Countdown
- Navigation: Startseite, Kantinen (Dropdown), Vorbestellen (hervorgehoben), Vermietung, Catering, Über uns, Kontakt
- Admin-Login Icon, Mobile Hamburger-Menü

**1. Startseite**
- Hero mit Willkommenstext und Unternehmensphilosophie
- 3 Bereichs-Cards: Kantinen, Catering, Equipment-Vermietung (mit KI-generierten Bildern)
- Prominenter CTA "Mittagstisch vorbestellen" mit Zeitlogik (vor/nach 11:15 Uhr)
- CTAs: Vorbestellen, Speiseplan, Catering anfragen, Vermietung buchen

**2. Kantinen-Bereich**
- Übersicht: Grid mit 4 Standort-Cards (BZO hervorgehoben)
- Detail-Seite pro Standort: Adresse, Öffnungszeiten, Kontakt, Beschreibung, Bildergalerie
- **Wochenkarte**: Tabellarische Darstellung (Mo-Fr), Menü 1/2/Veg je 6,50€, Suppe 2,50€, Dessert variabel, Allergene, PDF-Export, KW-Anzeige
- **Lieblingsgerichte-Umfrage**: Freitext-Eingabe, Kategorie-Auswahl, Live-Top-10-Ranking mit Fortschrittsbalken, 1 Stimme pro Gerät

**3. Mittagstisch-Vorbestellung (nur BZO)**
- Zeitbasierte Logik: Bestellbar bis 11:15 Uhr, danach gesperrt, Countdown-Timer
- Kontingent-System: "Noch X von Y verfügbar", automatische Sperrung bei Ausbuchen
- **4-Schritt-Bestellprozess:**
  1. Gerichte auswählen (Anzahl, Warenkorb-Sidebar)
  2. Abhol-Details (Name, Tel, Email, Abholzeit-Slot, Vor-Ort/Mitnehmen)
  3. Zahlung (SumUp-Platzhalter, vorerst Hinweis auf Kartenzahlung vor Ort)
  4. Bestätigung (Bestellnummer, Details, Email-Hinweis)
- Hinweis "Auch telefonisch unter 0365 / 4222241"
- FAQ-Accordion mit allen relevanten Fragen
- Stornierungsfunktion (vor 11:15 Uhr)

**4. Weitere Seiten (Platzhalter mit Struktur)**
- Equipment-Vermietung: Übersicht + Detail-Seiten (Feldküche, Outdoor-Bar, Grill), Direktbuchung + Anfrage-Formulare, Varianten, Kaution, Preisberechnung
- Catering: Konfigurator (Anlass, Personen, Budget → Paketvorschläge), Kategorien-Übersicht
- Über uns: Philosophie, Team, Geschichte
- Kontakt: Formular + Kontaktdaten + Facebook
- Rechtliches: Impressum, Datenschutz, AGB (Vorbestellung + Vermietung), Cookie-Banner, Widerruf

**Footer:** 5 Spalten, Schnelllinks, Standorte, Service, Kontakt, rechtliche Links

### 🔧 Admin-Bereich
- Login mit Email/Passwort (Supabase Auth, Rollen-System)
- **Dashboard**: Tages-Statistiken, Schnellzugriff
- **Vorbestellungs-Verwaltung**: Kontingent pro Tag einstellen, Tagesübersicht aller Bestellungen, Status-Management, Telefon-Bestellungen manuell hinzufügen, CSV/PDF-Export (Küchenliste)
- **Wochenkarten-Verwaltung**: Pro KW erstellen/bearbeiten, Veröffentlichen (aktiviert Vorbestellung), PDF-Export, Kopierfunktion
- **Vermietungs-Verwaltung**: Buchungen + Anfragen verwalten, Status-Workflow, Mietobjekte bearbeiten
- **Voting-Verwaltung**: Umfrage zurücksetzen, Ergebnisse exportieren
- **Einstellungen**: Bestellschluss-Uhrzeit, Stornierungsfristen, Kontingente

### 💾 Backend (Lovable Cloud / Supabase)
- **Datenbank-Tabellen**: Standorte, Wochenkarten, Gerichte, Vorbestellungen, Kontingente, Equipment, Buchungen, Anfragen, Voting, Kontaktanfragen
- **Auth**: Admin-Login mit Rollen-System (separate user_roles Tabelle)
- **RLS-Policies**: Öffentlicher Lesezugriff auf Speisekarten/Equipment, Admin-Schreibzugriff
- **Edge Functions**: Bestellnummern-Generierung, Kontingent-Prüfung, Email-Benachrichtigungen (Platzhalter)
- **Zahlungsintegration**: SumUp-Platzhalter vorbereitet, vorerst Hinweis auf Vor-Ort-Zahlung

### ✨ Features & UX
- Zeitbasierte Vorbestellungs-Logik mit Countdown
- Kontingent-Management mit Live-Anzeige
- Responsive: Mobile Cards statt Tabellen für Wochenkarte
- Animationen: Fade-in, Hover-Effekte, Countdown, Success-Animations
- Formular-Validierung (Zod)
- Accessibility: Semantisches HTML, ARIA, Keyboard-Navigation
- LocalStorage für Vote-Limitierung

---

## Phase 2 (Später)
- SumUp-Zahlungsintegration mit echten API-Keys
- Email-Benachrichtigungen (Bestätigungen, Stornierungen)
- Bildergalerie mit echten Fotos
- Erweiterte Catering-Konfiguration
- SMS-Benachrichtigungen

