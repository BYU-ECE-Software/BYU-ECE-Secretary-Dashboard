import type { User } from "./user";

export interface Locker {
  number: number;
  userId?: number | null;
  className?: string | null;
  endDate?: string | null;
  user?: User | null;
}
