import Image from "next/image";
import Container from "@/components/common/Container";
import InfoBox from "@/components/common/InfoBox";
import StatBox from "@/components/common/StatBox";

export default function JournalHero() {
  return (
    <section className="bg-[#005A78] py-6 text-white">
      <Container>
        <div className="grid items-center gap-8 md:grid-cols-[120px_1fr_130px]">
          <div className="flex items-start justify-center md:justify-start">
            <div className="relative h-[150px] w-[105px] overflow-hidden border border-white/30 bg-[#114E69] shadow-lg">
              <Image
                src="/images/cover.jpg"
                alt="Journal of FST cover"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div>
            <h1 className="text-[28px] font-bold leading-tight md:text-[34px]">
              International Journal of Computer Vision
            </h1>

            <div className="mt-4 grid gap-3 md:grid-cols-[1.2fr_1fr]">
              <InfoBox label="Publishing model" value="Hybrid" />

              <div className="grid grid-cols-2 gap-3">
                <InfoBox label="Electronic ISSN" value="1573-1405" />
                <InfoBox label="Print ISSN" value="0920-5691" />
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <StatBox label="CiteScore" value="7.3" />
            <StatBox label="Impact Factor" value="7.9" />
          </div>
        </div>
      </Container>
    </section>
  );
}