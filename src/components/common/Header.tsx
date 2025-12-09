import { Icon } from './Icon';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="dashboard-header">
      <h2>{title}</h2>
      <Icon name="Bell" />
    </header>
  );
}
