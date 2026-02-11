import { motion } from "framer-motion";
import { ChefHat, Heart, Phone, MessageCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: [0, 0, 0.2, 1] as const },
  }),
};

export default function UeberUns() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary text-primary-foreground">
        <div className="container py-16 md:py-24">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 font-serif text-4xl md:text-5xl"
          >
            Über uns
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="max-w-2xl text-lg text-primary-foreground/85"
          >
            Frisch. Regional. Mit Herz gekocht.
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="container py-16 md:py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mx-auto max-w-3xl space-y-8 text-foreground/90 leading-relaxed"
        >
          <motion.p variants={fadeUp} custom={0} className="text-lg">
            Bei CU Kantine &amp; Catering steht eines immer im Mittelpunkt:{" "}
            <strong>frisch gekochtes Essen mit ehrlicher Hausmannskost.</strong> Wir
            glauben daran, dass man Qualität schmeckt – und genau deshalb wird bei
            uns täglich frisch gekocht. Convenience-Produkte kommen nur selten zum
            Einsatz. Unsere Soßen werden selbst gezogen, unsere Gerichte mit
            Sorgfalt zubereitet – so, wie man es von echter Küche erwartet.
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={1}
            className="rounded-xl border border-border bg-muted p-6"
          >
            <div className="mb-2 flex items-center gap-2 text-primary">
              <ChefHat className="h-5 w-5" />
              <span className="font-serif text-lg font-semibold">Erfolg ab Tag 1</span>
            </div>
            <p className="text-muted-foreground">
              Schon der Start zeigte, wie groß der Bedarf nach guter, bodenständiger
              Küche ist: Bereits am ersten Tag wurden innerhalb von 45 Minuten über
              100 Essen ausgegeben – zusätzlich gingen zahlreiche Portionen außer
              Haus. Ein Erfolg, der uns motiviert und bestätigt.
            </p>
          </motion.div>

          <motion.p variants={fadeUp} custom={2}>
            Neben dem täglichen Kantinenangebot sind wir auch im Bereich Catering
            flexibel und offen für individuelle Wünsche. Ob warm oder kalt, ob
            Braten, Buffet oder Fingerfood – wir gestalten jedes Catering passend
            zum Anlass und zur Veranstaltung.
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={3}
            className="rounded-xl border border-border bg-muted p-6"
          >
            <div className="mb-2 flex items-center gap-2 text-primary">
              <Heart className="h-5 w-5" />
              <span className="font-serif text-lg font-semibold">
                Christian Urban – Koch aus Leidenschaft
              </span>
            </div>
            <p className="text-muted-foreground">
              Hinter CU Kantine &amp; Catering steht Christian Urban, gelernter Koch
              und gebürtiger Wiesbadener. Seine Ausbildung absolvierte er im Hotel
              Lamm in Bad Herrenalb-Rotensol. Was ursprünglich als „vernünftige
              Lehre" begann, ist heute seine echte Leidenschaft: Kochen ist für ihn
              nicht nur Beruf, sondern Passion. Oder wie er selbst sagt:
            </p>
            <blockquote className="mt-3 border-l-4 border-primary pl-4 font-serif text-lg italic text-foreground">
              „In der Küche fühle ich mich wie der Rockstar auf der Bühne."
            </blockquote>
          </motion.div>

          <motion.div variants={fadeUp} custom={4} className="flex items-start gap-3 rounded-xl border border-border bg-card p-6">
            <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-muted-foreground">
              Für Fragen, Bestellungen oder Catering-Anfragen sind wir
              unkompliziert erreichbar – unter anderem über unseren WhatsApp-Kanal{" "}
              <strong>„CU Kantine und Catering"</strong>.
            </p>
          </motion.div>

          <motion.p
            variants={fadeUp}
            custom={5}
            className="text-center font-serif text-2xl font-bold text-primary"
          >
            Frisch. Regional. Mit Herz gekocht.
          </motion.p>
        </motion.div>
      </section>
    </Layout>
  );
}
