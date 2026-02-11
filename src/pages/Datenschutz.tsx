import Layout from "@/components/layout/Layout";

export default function Datenschutz() {
  return (
    <Layout>
      <section className="bg-primary text-primary-foreground">
        <div className="container py-12 md:py-16">
          <h1 className="font-serif text-3xl md:text-4xl">Datenschutzerklärung</h1>
        </div>
      </section>

      <div className="container max-w-3xl py-10 md:py-16">
        <div className="prose prose-sm max-w-none space-y-8 text-foreground">
          <section>
            <h2 className="font-serif text-xl">1. Verantwortlicher</h2>
            <p>
              CU Kantine &amp; Catering<br />
              Inhaber: Christian Peter Urban<br />
              Lange Straße 52, 07551 Gera<br />
              Telefon: 0365 – 4222241<br />
              E-Mail: info@cu-kantine.de
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl">2. Erhebung und Speicherung personenbezogener Daten</h2>
            <p>
              Beim Besuch unserer Website werden automatisch Informationen durch den Browser übermittelt
              und in Server-Logfiles gespeichert: Browsertyp/-version, Betriebssystem, Referrer-URL,
              Hostname des zugreifenden Rechners, Uhrzeit der Serveranfrage und IP-Adresse. Eine
              Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl">3. Kontaktformular</h2>
            <p>
              Wenn Sie uns über das Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben
              (Name, E-Mail-Adresse, Nachricht) zwecks Bearbeitung der Anfrage und für den Fall von
              Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung
              weiter. Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl">4. Cookies</h2>
            <p>
              Unsere Website verwendet Cookies. Dabei handelt es sich um kleine Textdateien, die Ihr
              Browser automatisch erstellt und auf Ihrem Endgerät speichert. Cookies richten auf Ihrem
              Gerät keinen Schaden an und enthalten keine Viren.
            </p>
            <p>
              Wir verwenden ein Cookie, um Ihre Einwilligung zur Cookie-Nutzung zu speichern
              (cookie-consent). Dieses Cookie ist technisch notwendig und wird lokal in Ihrem Browser
              gespeichert. Sie können Ihren Browser so einstellen, dass Sie über das Setzen von Cookies
              informiert werden und Cookies nur im Einzelfall erlauben.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl">5. Ihre Rechte</h2>
            <p>Sie haben gegenüber uns folgende Rechte hinsichtlich der Sie betreffenden personenbezogenen Daten:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
              <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
              <li>Recht auf Löschung (Art. 17 DSGVO)</li>
              <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Recht auf Widerspruch (Art. 21 DSGVO)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl">6. Beschwerderecht bei einer Aufsichtsbehörde</h2>
            <p>
              Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung
              Ihrer personenbezogenen Daten zu beschweren. Zuständige Aufsichtsbehörde ist der
              Thüringer Landesbeauftragte für den Datenschutz und die Informationsfreiheit.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl">7. Hosting</h2>
            <p>
              Diese Website wird extern gehostet. Die personenbezogenen Daten, die auf dieser Website
              erfasst werden, werden auf den Servern des Hosters gespeichert. Hierbei kann es sich um
              IP-Adressen, Kontaktanfragen, Meta- und Kommunikationsdaten, Vertragsdaten,
              Kontaktdaten, Namen und Websitezugriffe handeln.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
