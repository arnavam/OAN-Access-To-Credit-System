import { FormCard } from './FormCard';
import { InputField } from './InputField';

export function RegisteredAddressSection() {
  return (
    <FormCard title="Registered Address" bodyClassName="space-y-5">
      <InputField
        label="Street address"
        required
        placeholder="Enter Street address"
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
        />
        <InputField
          label="Country"
          required
          placeholder="Enter Country"
        />
        <InputField
          label="Postal code"
          required
          placeholder="Enter Postal code"
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
