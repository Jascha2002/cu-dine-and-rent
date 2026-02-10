import Layout from "@/components/layout/Layout";

export default function Impressum() {
  return (
    <Layout>
      <section className="bg-primary text-primary-foreground">
        <div className="container py-12 md:py-16">
          <h1 className="font-serif text-3xl md:text-4xl">Impressum</h1>
        </div>
      </section>

      <div className="container max-w-3xl py-10 md:py-16">
        <div className="prose prose-sm max-w-none space-y-8">
          <section>
            <h2 className="font-serif text-xl">Angaben gemäß § 5 TMG</h2>
            <p>
              CU Kantine & Catering<br />
              Inhaber: Christian Peter Urban<br />
              Lange Straße 52<br />
              07551 Gera
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl">Kontakt</h2>
            <p>
              Telefon: <a href="tel:+493654222241" className="text-primary hover:underline">0365 - 4222241</a><br />
              E-Mail: <a href="mailto:info@cu-kantine.de" className="text-primary hover:underline">info@cu-kantine.de</a>
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <p>
              Christian Peter Urban<br />
              Lange Straße 52<br />
              07551 Gera
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl">Streitschlichtung</h2>
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
              <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                https://ec.europa.eu/consumers/odr/
              </a>.
            </p>
            <p>
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl">Haftung für Inhalte</h2>
            <p>
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten
              nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
              Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
              Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
              Tätigkeit hinweisen.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl">Haftung für Links</h2>
            <p>
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen
              Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr
              übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder
              Betreiber der Seiten verantwortlich.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
