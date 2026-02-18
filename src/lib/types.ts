export interface RoleCatalogItem {
  id: string;
  key: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: string[];
  userCount: number;
}

export interface UserExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: string;
  status: string;
  createdAt: string;
  clientName: string | null;
}
