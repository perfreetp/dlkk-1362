import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function getIconByName(name: string): LucideIcon {
  const pascalCaseName = name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  const icon = (LucideIcons as unknown as Record<string, LucideIcon>)[pascalCaseName];
  return icon || LucideIcons.Wrench;
}
