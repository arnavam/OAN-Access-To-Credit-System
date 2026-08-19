
interface PasswordRequirementsProps {
  password?: string;
}

export const RULES = [
  { label: 'At least 8 characters', test: (v: string) => v.length >= 8 && v.length <= 64 },
  { label: 'A letter', test: (v: string) => /[A-Za-z]/.test(v) },
  { label: 'A number', test: (v: string) => /\d/.test(v) },
  { label: 'A symbol', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

export function PasswordRequirements({ password = '' }: PasswordRequirementsProps) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1">
      {RULES.map((rule) => {
        const met = rule.test(password);
        return (
          <li
            key={rule.label}
            className={`text-xs font-medium ${met ? 'text-[#16A34A] dark:text-[#16A34A]' : 'text-gray-400'}`}
          >
            {met ? '✓' : '•'} {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
