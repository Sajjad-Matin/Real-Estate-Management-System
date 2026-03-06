import { type ButtonHTMLAttributes, type FC } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'secondary';
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button: FC<ButtonProps> = ({
  variant = 'primary',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    success: 'bg-success-600 hover:bg-success-700 text-white',
    warning: 'bg-warning-600 hover:bg-warning-700 text-white',
    danger: 'bg-danger-600 hover:bg-danger-700 text-white',
    secondary: 'border border-primary hover:bg-gray-100 dark:hover:bg-gray-700 text-primary',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;