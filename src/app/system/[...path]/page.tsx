import { ModulePage } from "@/components/shared/ModulePage";

export default function SystemModulePage({ params }: { params: { path: string[] } }) {
  return <ModulePage portal="Account" path={params.path} />;
}
