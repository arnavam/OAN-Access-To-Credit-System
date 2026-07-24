import { FormCard } from './FormCard';
import { InputField } from './InputField';

export function OrganisationSection() {
  return (
    <FormCard title="Organisation" bodyClassName="space-y-5">
      <InputField
        label="Legal entity name"
        required
        placeholder="Enter Legal entity name"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <InputField
          label="First Name"
          required
          placeholder="Enter First Name"
        />
        <InputField
          label="Last Name"
          required
          placeholder="Enter Last Name"
        />
        <InputField
          label="Brand / display name"
          placeholder="Enter if different from legal name"
          hint="If different from legal name"
        />
        <InputField
          label="Entity type"
          required
          placeholder="Enter Entity type"
        />
        <InputField
          label="Tax registration number"
          required
          placeholder="Enter Tax registration number"
          hint="Tax Identification number (9-10 characters)"
        />
      </div>
    </FormCard>
  );
}
