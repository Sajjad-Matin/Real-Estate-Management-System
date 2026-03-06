import type { FC, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card: FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-base border border-primary rounded-lg shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card;