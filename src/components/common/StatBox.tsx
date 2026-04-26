type StatBoxProps = {
  label: string;
  value: string;
  note?: string;
};

export default function StatBox({
  label,
  value,
  note,
}: StatBoxProps) {
  return (
    <div className="rounded-none bg-[#C13C96] px-4 py-3 text-white">
      <p className="text-[10px] font-bold uppercase tracking-wide text-white/90">
        {label}
      </p>

      <h3 className="mt-1 text-[28px] font-bold leading-none">
        {value}
      </h3>

      {note ? (
        <p className="mt-1 text-[10px] text-white/90">
          {note}
        </p>
      ) : null}
    </div>
  );
}