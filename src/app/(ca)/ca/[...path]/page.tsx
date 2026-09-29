import { ModulePage } from "@/components/shared/ModulePage";

export default function CAModulePage({ params }: { params: { path: string[] } }) {
  return <ModulePage portal="CA" path={params.path} />;
}
