import { ModulePage } from "@/components/shared/ModulePage";

export default function AdminModulePage({ params }: { params: { path: string[] } }) {
  return <ModulePage portal="Admin" path={params.path} />;
}
