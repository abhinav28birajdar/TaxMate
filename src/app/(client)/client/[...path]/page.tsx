import { ModulePage } from "@/components/shared/ModulePage";

export default function CustomerModulePage({ params }: { params: { path: string[] } }) {
  return <ModulePage portal="Customer" path={params.path} />;
}
