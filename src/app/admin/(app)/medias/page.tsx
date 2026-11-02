import type { Metadata } from "next";
import { MediaLibrary } from "@/admin/components/media-library";

export const metadata: Metadata = { title: "Médiathèque" };

export default function MediaPage() {
  return <MediaLibrary />;
}
