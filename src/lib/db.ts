import { randomUUID } from "crypto";

type RoleRecord = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: string[];
};

type UserRecord = {
  id: string;
  role: string;
};

type ClientRecord = {
  id: string;
  name: string;
};

type ExpenseRecord = {
  id: string;
  title: string;
  amount: number;
  category: string;
  status: string;
  createdAt: Date;
  clientId: string | null;
  userId: string;
  project?: string;
  description?: string | null;
  level?: string;
};

type ExpenseRecordWithClient = ExpenseRecord & {
  client?: { name: string } | null;
};

type DemoDb = {
  roles: RoleRecord[];
  users: UserRecord[];
  clients: ClientRecord[];
  expenses: ExpenseRecord[];
};

const demoDb: DemoDb =
  (globalThis as { __demoDb?: DemoDb }).__demoDb ?? {
    roles: [],
    users: [],
    clients: [],
    expenses: [],
  };

(globalThis as { __demoDb?: DemoDb }).__demoDb = demoDb;

function sortRoles(
  roles: RoleRecord[],
  orderBy?: Array<{ isSystem?: "desc" | "asc"; name?: "desc" | "asc" }>
) {
  if (!orderBy || orderBy.length === 0) return roles;
  return [...roles].sort((a, b) => {
    for (const order of orderBy) {
      if (order.isSystem) {
        if (a.isSystem !== b.isSystem) {
          return order.isSystem === "desc"
            ? Number(b.isSystem) - Number(a.isSystem)
            : Number(a.isSystem) - Number(b.isSystem);
        }
      }
      if (order.name) {
        const comparison = a.name.localeCompare(b.name);
        if (comparison !== 0) {
          return order.name === "desc" ? -comparison : comparison;
        }
      }
    }
    return 0;
  });
}

export const db = {
  role: {
    async findMany({
      where,
      orderBy,
    }: {
      where?: { key?: { in?: string[] } };
      orderBy?: Array<{ isSystem?: "desc" | "asc"; name?: "desc" | "asc" }>;
    } = {}) {
      const filtered = where?.key?.in
        ? demoDb.roles.filter((role) => where.key?.in?.includes(role.key))
        : demoDb.roles;
      return sortRoles(filtered, orderBy);
    },
    async findUnique({ where }: { where: { id?: string; key?: string } }) {
      if (where.id) {
        return demoDb.roles.find((role) => role.id === where.id) ?? null;
      }
      if (where.key) {
        return demoDb.roles.find((role) => role.key === where.key) ?? null;
      }
      return null;
    },
    async create({ data }: { data: Omit<RoleRecord, "id"> }) {
      const record: RoleRecord = { ...data, id: randomUUID() };
      demoDb.roles.push(record);
      return record;
    },
    async update({
      where,
      data,
    }: {
      where: { id: string };
      data: Partial<Omit<RoleRecord, "id" | "key" | "isSystem">> & {
        permissions?: string[];
        name?: string;
        description?: string | null;
      };
    }) {
      const index = demoDb.roles.findIndex((role) => role.id === where.id);
      if (index === -1) return null;
      demoDb.roles[index] = { ...demoDb.roles[index], ...data };
      return demoDb.roles[index];
    },
    async delete({ where }: { where: { id: string } }) {
      const index = demoDb.roles.findIndex((role) => role.id === where.id);
      if (index === -1) return null;
      const [removed] = demoDb.roles.splice(index, 1);
      return removed ?? null;
    },
  },
  user: {
    async groupBy({
      by,
      _count,
    }: {
      by: string[];
      _count: { _all: true };
    }) {
      if (!by.includes("role") || !_count?._all) return [];
      const counts = new Map<string, number>();
      for (const user of demoDb.users) {
        counts.set(user.role, (counts.get(user.role) ?? 0) + 1);
      }
      return Array.from(counts.entries()).map(([role, count]) => ({
        role,
        _count: { _all: count },
      }));
    },
    async count({ where }: { where: { role?: string } }) {
      if (!where?.role) return demoDb.users.length;
      return demoDb.users.filter((user) => user.role === where.role).length;
    },
  },
  expense: {
    async findMany({
      where,
      orderBy,
      include,
    }: {
      where?: { userId?: string };
      orderBy?: { createdAt?: "desc" | "asc" };
      include?: { client?: { select?: { name?: true } } };
    } = {}): Promise<ExpenseRecordWithClient[]> {
      const filtered = where?.userId
        ? demoDb.expenses.filter((expense) => expense.userId === where.userId)
        : demoDb.expenses;
      const sorted = orderBy?.createdAt
        ? [...filtered].sort((a, b) =>
            orderBy.createdAt === "desc"
              ? b.createdAt.getTime() - a.createdAt.getTime()
              : a.createdAt.getTime() - b.createdAt.getTime()
          )
        : filtered;

      if (!include?.client?.select?.name) {
        return sorted.map((expense) => ({ ...expense }));
      }

      return sorted.map((expense) => ({
        ...expense,
        client: expense.clientId
          ? { name: demoDb.clients.find((c) => c.id === expense.clientId)?.name ?? "Cliente" }
          : null,
      }));
    },
    async count({ where }: { where?: { userId?: string; status?: string } } = {}) {
      return demoDb.expenses.filter((expense) => {
        if (where?.userId && expense.userId !== where.userId) return false;
        if (where?.status && expense.status !== where.status) return false;
        return true;
      }).length;
    },
    async create({ data }: { data: Omit<ExpenseRecord, "id" | "createdAt"> }) {
      const record: ExpenseRecord = {
        ...data,
        id: randomUUID(),
        createdAt: new Date(),
      };
      demoDb.expenses.push(record);
      return record;
    },
  },
};
