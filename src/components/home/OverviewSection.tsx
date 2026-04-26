export default function OverviewSection() {
  return (
    <section className="rounded-none bg-[#EAF1F5] px-8 py-6">
      <h2 className="text-[24px] font-bold text-[#111827]">Overview</h2>

      <div className="mt-5 space-y-4 text-[13px] leading-7 text-slate-700">
        <p>
          International Journal of Computer Vision (IJCV) details the science
          and engineering of this rapidly growing field. Regular articles
          present the technical advances of broad general interest.
        </p>

        <p>
          Survey articles offer critical reviews of the state of the art and or
          tutorial presentations of pertinent topics.
        </p>

        <p className="font-semibold text-slate-800">Coverage includes:</p>

        <p>
          – Mathematical, physical and computational aspects of computer
          vision: image formation, processing, analysis, and interpretation;
          machine learning techniques; statistical approaches; sensors.
        </p>

        <p>
          – Applications: image-based rendering, computer graphics, robotics,
          photo interpretation, image retrieval, video analysis and annotation,
          multimedia, and more.
        </p>

        <p>
          – Connections with human perception: computational and architectural
          aspects of human vision.
        </p>

        <p>
          The journal also features book reviews, position papers, editorials by
          leading scientific figures, as well as additional online material such
          as still images, video sequences, data sets, and software.
        </p>
      </div>
    </section>
  );
}