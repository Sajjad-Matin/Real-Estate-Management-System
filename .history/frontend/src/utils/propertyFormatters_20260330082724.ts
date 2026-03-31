import { format } from "date-fns";

export const formatPropertyTitle = (title: string, region: string) => {
  return `${title} - (${region})`;
};

export const formatPropertyDate = (dateString: string | Date | undefined) => {
  if (!dateString) return "N/A";
  return format(new Date(dateString), "MMM d, yyyy");
};
