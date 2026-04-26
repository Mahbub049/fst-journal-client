type InfoBoxProps = {
  label: string;
  value: string;
};

export default function InfoBox({ label, value }: InfoBoxProps) {
  return (
    <div className="rounded-none bg-white px-3 py-2 text-[#0B2346] shadow-none">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <h3 className="mt-1 text-[15px] font-bold leading-none">{value}</h3>
    </div>
  );
}