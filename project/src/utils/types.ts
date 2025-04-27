export type Language = {
  code: string;
  name: string;
  flag: string;
};

export type NavigationItem = {
  id: string;
  title: string;
  path: string;
};

export type FeatureCardProps = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
};