import { Label, ListBox, Select } from "@heroui/react";
import { useTenants } from "../hooks/useRAG";

interface Props {
  selectedTenant: string | null;
  onTenantChange: (tenant: string | null) => void;
}

export function TenantSelector({ selectedTenant, onTenantChange }: Props) {
  const { data: tenants, isLoading, isError } = useTenants();

  if (isLoading)
    return <div className="text-gray-500 text-sm">Cargando tenants...</div>;
  if (isError)
    return <div className="text-red-500 text-sm">Error cargando tenants</div>;
  if (!tenants || !Array.isArray(tenants) || tenants.length === 0)
    return (
      <div className="text-gray-500 text-sm">No hay tenants disponibles</div>
    );

  return (
    <div className="w-full max-w-xs">
      <Select
        placeholder="Selecciona un tenant"
        value={selectedTenant}
        onChange={(val) => {
          if (!val) {
            onTenantChange(null);
            return;
          }
          if (Array.isArray(val)) {
            onTenantChange(val[0]?.toString() || null);
          } else {
            onTenantChange(val.toString());
          }
        }}
      >
        <Label>Organización (Tenant)</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {tenants.map((tenant) => (
              <ListBox.Item key={tenant} id={tenant} textValue={tenant}>
                {tenant}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
    </div>
  );
}
