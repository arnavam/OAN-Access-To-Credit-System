import { FormCard } from './FormCard';
import { InputField } from './InputField';

export interface RegisteredAddressFields {
  registered_street: string;
  registered_city: string;
  registered_country: string;
  registered_postal_code: string;
}

interface RegisteredAddressSectionProps {
  fields: RegisteredAddressFields;
  onChange: (fields: Partial<RegisteredAddressFields>) => void;
}

export function RegisteredAddressSection({ fields, onChange }: RegisteredAddressSectionProps) {
  return (
    <FormCard title="Registered Address" bodyClassName="space-y-5">
      <InputField
        label="Street address"
        required
        placeholder="Enter Street address"
        value={fields.registered_street}
        onChange={(e) => onChange({ registered_street: e.target.value })}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <InputField
          label="Kebele / Village"
          placeholder="Enter Kebele / Village"
        />
        <InputField
          label="Woreda / District"
          placeholder="Enter Woreda / District"
        />
        <InputField
          label="City"
          required
          placeholder="Enter City"
          value={fields.registered_city}
          onChange={(e) => onChange({ registered_city: e.target.value })}
        />
        <InputField
          label="Country"
          required
          placeholder="Enter Country"
          value={fields.registered_country}
          onChange={(e) => onChange({ registered_country: e.target.value })}
        />
        <InputField
          label="Postal code"
          required
          placeholder="Enter Postal code"
          value={fields.registered_postal_code}
          onChange={(e) => onChange({ registered_postal_code: e.target.value })}
        />
        <InputField
          label="Website"
          placeholder="Enter Website"
          hint="Your website - used as your network address - can be added later"
        />
      </div>
    </FormCard>
  );
}
