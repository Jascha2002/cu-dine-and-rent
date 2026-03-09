import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { UtensilsCrossed, PartyPopper, Truck, Clock, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import heroImg from "@/assets/hero-kantine.jpg";
import heroVideo from "@/assets/hero-video.mp4";
import kantineImg from "@/assets/card-kantine.jpg";
import cateringImg from "@/assets/card-catering.jpg";
import equipmentImg from "@/assets/card-equipment.jpg";
import { useEffect, useState } from "react";
function useOrderableStatus() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const cutoff = new Date(now);
  cutoff.setHours(11, 15, 0, 0);
  const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
  const isOrderable = isWeekday && now < cutoff;
  return {
    isOrderable
  };
}
const fadeUp = {
  hidden: {
    opacity: 0,
    y: 30
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.5,
      ease: [0, 0, 0.2, 1] as const
    }
  })
};
const areas = [{
  title: "Kantinen",
  description: "4 Standorte in Gera – täglich frisch, regional und zu fairem Preis.",
  image: kantineImg,
  icon: UtensilsCrossed,
  link: "/kantinen",
  linkLabel: "Standorte ansehen"
}, {
  title: "Catering-Service",
  description: "Von Hochzeit bis Firmenfeier – individuelle Catering-Konzepte für jeden Anlass.",
  image: cateringImg,
  icon: PartyPopper,
  link: "/catering",
  linkLabel: "Catering anfragen"
}, {
  title: "Equipment-Vermietung",
  description: "Feldküche, Outdoor-Bar & Grill – professionelles Equipment für Ihr Event.",
  image: equipmentImg,
  icon: Truck,
  link: "/vermietung",
  linkLabel: "Equipment ansehen"
}];
export default function Index() {
  const {
    isOrderable
  } = useOrderableStatus();
  return <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <video
            src={heroVideo}
            autoPlay
            muted
            playsInline
            poster={heroImg}
            className="h-full w-full object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40" />
        </div>

        <div className="container relative py-20 md:py-32">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }} className="max-w-2xl">
            <h1 className="mb-6 font-serif text-4xl leading-tight text-primary-foreground md:text-5xl lg:text-6xl">
              Herzlich Willkommen
            </h1>
            <p className="mb-4 text-2xl font-bold italic text-accent md:text-3xl">
              „Weniger BLAA, mehr MHH…!"
            </p>
            <p className="mb-8 text-lg leading-relaxed text-primary-foreground/90 md:text-xl">
              Wir als CU Kantine & Catering möchten mit unserem Team Orte schaffen, an denen gutes, frisches und
              gesundes Essen für alle zugänglich ist. Frische Küche, fairer Preis, kurze Wege und Regionalität –
              das ist unser Anspruch!
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/vorbestellen">
                  <Clock className="mr-2 h-4 w-4" /> Jetzt vorbestellen
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-foreground text-background hover:bg-foreground/80">
                <Link to="/kantinen/bzo">Speiseplan ansehen</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Areas grid */}
      <section className="container py-16 md:py-24 bg-secondary-foreground">
        <motion.div initial="hidden" whileInView="visible" viewport={{
        once: true,
        margin: "-100px"
      }} className="mb-12 text-center">
          <motion.h2 variants={fadeUp} custom={0} className="mb-3 text-3xl px-0 mx-0 my-[11px] py-[16px] font-serif font-bold text-secondary md:text-5xl">
            Unser Angebot
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="mx-auto max-w-xl text-secondary text-3xl">
            Von der täglichen Mittagsversorgung über individuelle Catering-Konzepte bis hin zur Equipment-Vermietung
            für Ihre Veranstaltung.
          </motion.p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {areas.map((area, i) => <motion.div key={area.title} variants={fadeUp} custom={i + 2} initial="hidden" whileInView="visible" viewport={{
          once: true,
          margin: "-50px"
        }}>
              <Card className="group overflow-hidden border-border/50 transition-shadow hover:shadow-lg">
                <div className="relative h-52 overflow-hidden">
                  <img src={area.image} alt={area.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 text-primary-foreground">
                    <area.icon className="h-5 w-5" />
                    <span className="font-serif text-xl">{area.title}</span>
                  </div>
                </div>
                <CardContent className="p-5">
                  <p className="mb-4 text-sm text-muted-foreground">{area.description}</p>
                  <Button asChild variant="ghost" className="group/btn p-0 text-primary hover:bg-transparent">
                    <Link to={area.link} className="flex items-center gap-1">
                      {area.linkLabel}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>)}
        </div>
      </section>

      {/* Pre-order CTA */}
      <section className="bg-muted">
        <div className="container py-16 md:py-20">
          <motion.div initial="hidden" whileInView="visible" viewport={{
          once: true
        }} className="mx-auto max-w-3xl text-center">
            <motion.h2 variants={fadeUp} custom={0} className="mb-3 font-serif text-3xl md:text-4xl">
              Mittagstisch vorbestellen
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mb-2 text-muted-foreground">
              BZO Gera/Zwötzen · Täglich bis 11:15 Uhr · Abholung 11:30–13:30 Uhr
            </motion.p>
            <motion.p variants={fadeUp} custom={2} className="mb-2 text-lg font-semibold text-primary">
              Einheitspreis: 6,50 € pro Hauptgericht
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="mb-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              Auch telefonisch unter 0365 / 4222241
            </motion.div>
            <motion.div variants={fadeUp} custom={4} className="flex flex-wrap justify-center gap-3">
              {isOrderable ? <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link to="/vorbestellen">
                    <Clock className="mr-2 h-4 w-4" /> Jetzt vorbestellen
                  </Link>
                </Button> : <Button size="lg" disabled className="opacity-60">
                  Ab morgen wieder bestellbar
                </Button>}
              <Button asChild size="lg" variant="outline">
                <Link to="/kantinen/bzo">Speiseplan ansehen</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/catering">Catering anfragen</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/vermietung">Vermietung buchen</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </Layout>;
}