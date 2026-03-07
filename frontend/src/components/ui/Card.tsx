import type { FC, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void; // ✅ Add this
}

const Card: FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      className={`bg-base border border-primary rounded-lg shadow-sm p-6 ${className}`}
      onClick={onClick} // ✅ Add this
    >
      {children}
    </div>
  );
};

export default Card;