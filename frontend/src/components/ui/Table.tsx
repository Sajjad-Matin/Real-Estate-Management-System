import type { FC, ReactNode } from "react";

interface TableProps {
  children: ReactNode;
}

export const Table: FC<TableProps> = ({ children }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        {children}
      </table>
    </div>
  );
};

interface TableHeaderProps {
  children: ReactNode;
}

export const TableHeader: FC<TableHeaderProps> = ({ children }) => {
  return (
    <thead className="bg-elevated border-b border-primary">
      {children}
    </thead>
  );
};

interface TableBodyProps {
  children: ReactNode;
}

export const TableBody: FC<TableBodyProps> = ({ children }) => {
  return (
    <tbody className="divide-y divide-primary">
      {children}
    </tbody>
  );
};

interface TableRowProps {
  children: ReactNode;
  onClick?: () => void;
}

export const TableRow: FC<TableRowProps> = ({ children, onClick }) => {
  return (
    <tr 
      className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

interface TableHeadProps {
  children: ReactNode;
  className?: string;
}

export const TableHead: FC<TableHeadProps> = ({ children, className = '' }) => {
  return (
    <th className={`px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
};

interface TableCellProps {
  children: ReactNode;
  className?: string;
}

export const TableCell: FC<TableCellProps> = ({ children, className = '' }) => {
  return (
    <td className={`px-6 py-4 text-sm ${className}`}>
      {children}
    </td>
  );
};