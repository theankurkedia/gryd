import { icons } from 'lucide-react-native';
import React from 'react';

interface Props {
  name: string;
  color: string;
  size: number;
}

const Icon = ({ name, color, size }: Props) => {
  const LucideIcon = icons[name as keyof typeof icons];

  return <LucideIcon color={color} size={size} />;
};

export default Icon;
