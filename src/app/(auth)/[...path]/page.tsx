import { ModulePage } from "@/components/shared/ModulePage";

export default function AuthModulePage({ params }: { params: { path: string[] } }) {
  return <ModulePage portal="Account" path={params.path} />;
}
