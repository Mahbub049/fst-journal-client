import { permanentRedirect } from "next/navigation";

export default function IssuesPage() {
  permanentRedirect("/issues/archive");
}
