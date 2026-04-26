import Container from "@/components/common/Container";

type TopBreadcrumbProps = {
  items: string[];
};

export default function TopBreadcrumb({ items }: TopBreadcrumbProps) {
  return (
    <div className="bg-[#005A78] py-2">
      <Container>
        <p className="text-[11px] font-semibold text-white">
          {items.join(" > ")}
        </p>
      </Container>
    </div>
  );
}