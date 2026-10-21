import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { FlowLine } from "@/components/brand/flow-line"
import { Container } from "@/components/primitives/container"
import { RevealGroup, RevealItem } from "@/components/primitives/reveal"
import { Section } from "@/components/primitives/section"
import { SectionHeading } from "@/components/primitives/section-heading"
import { Button } from "@/components/ui/button"
import { routes } from "@/config/routes"

/**
 * Arabuluculuk hakkında genel bilgilendirme. Metinler 6325 sayılı Hukuk Uyuşmazlıklarında
 * Arabuluculuk Kanunu'nun ilgili hükümlerinin özetidir; hukuki görüş değildir.
 */
const principles = [
  {
    title: "İradi olma ve eşitlik",
    body: "Taraflar arabulucuya başvurmak, süreci sürdürmek, sonuçlandırmak veya süreçten vazgeçmek konusunda serbesttir ve süreç boyunca eşit haklara sahiptir.",
    source: "6325 s. Kanun, m. 3",
  },
  {
    title: "Gizlilik",
    body: "Aksi kararlaştırılmadıkça arabulucu, süreç kapsamında edindiği bilgi, belge ve kayıtları gizli tutar; taraflar ve görüşmelere katılanlar da bu gizliliğe uymak zorundadır.",
    source: "6325 s. Kanun, m. 4",
  },
  {
    title: "Dava şartı arabuluculuk",
    body: "Kanunda sayılan bazı uyuşmazlıklarda, dava açılmadan önce arabulucuya başvurulmuş olması zorunludur.",
    source: "İlgili kanun hükümleri",
  },
] as const

export function MediationSection() {
  return (
    <Section
      surface="ink"
      aria-labelledby="arabuluculuk-baslik"
      className="relative isolate overflow-hidden"
    >
      <FlowLine
        variant="sweep"
        className="absolute -bottom-6 -left-[5%] -z-10 h-40 w-[60%] opacity-40"
      />
      <Container className="grid gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <SectionHeading
            id="arabuluculuk-baslik"
            marker={routes.mediation.marker}
            title="Arabuluculuk"
            lede="Arabuluculuk; tarafların, tarafsız ve bağımsız bir arabulucunun katılımıyla uyuşmazlıklarını müzakere yoluyla çözmeyi amaçladığı bir yöntemdir."
          />
          <Button asChild variant="onDark" className="mt-10">
            <Link href={routes.mediation.href}>
              Arabuluculuk hakkında
              <ArrowRight aria-hidden="true" strokeWidth={1.5} />
            </Link>
          </Button>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <h3 className="eyebrow text-paper/60">Temel ilkeler</h3>
          <RevealGroup as="ol" className="mt-4 border-t border-paper/25">
            {principles.map((item, index) => (
              <RevealItem
                as="li"
                key={item.title}
                className="grid gap-3 border-b border-border py-7 sm:grid-cols-[3rem_1fr]"
              >
                <span
                  aria-hidden="true"
                  className="pt-2 eyebrow text-stone tabular-nums"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h4 className="text-h3">{item.title}</h4>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                  <p className="mt-3 text-xs tracking-wide text-stone">
                    {item.source}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            Bu bilgiler genel niteliktedir; somut bir uyuşmazlık için hukuki
            görüş yerine geçmez.
          </p>
        </div>
      </Container>
    </Section>
  )
}
