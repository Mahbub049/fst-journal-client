import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Digital Inauguration | Journal of FST",
  description:
    "Ceremonial digital inauguration of the Journal of FST, Bangladesh University of Professionals.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function InaugurationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
