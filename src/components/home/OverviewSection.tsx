export default function OverviewSection() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-8">
      <div className="max-w-3xl">
        <p className="journal-subheading">About the Journal</p>

        <h2 className="journal-heading mt-3">Overview</h2>

        <div className="mt-6 space-y-5 text-[15px] leading-8 text-slate-600">
          <p>
            BUP Faculty of Science & Technology Journal is a peer-reviewed
            academic publication dedicated to research in computing, engineering,
            applied science, technology, and interdisciplinary innovation.
          </p>

          <p>
            The journal welcomes original research articles, review papers,
            technical studies, and scholarly contributions that address current
            academic and practical challenges in science and technology.
          </p>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="font-medium text-slate-900">Coverage includes:</p>

            <ul className="mt-4 space-y-3 text-slate-600">
              <li>
                Computing, artificial intelligence, data science, cybersecurity,
                software engineering, and information systems.
              </li>
              <li>
                Engineering applications, emerging technologies, applied
                sciences, and interdisciplinary research.
              </li>
              <li>
                Research with academic contribution, practical relevance, and
                potential social or industrial impact.
              </li>
            </ul>
          </div>

          <p>
            The journal aims to support researchers, faculty members, students,
            and professionals by providing a reliable platform for scholarly
            communication and research visibility.
          </p>
        </div>
      </div>
    </section>
  );
}