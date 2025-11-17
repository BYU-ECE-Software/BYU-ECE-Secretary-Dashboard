import type { User } from "./user";

export interface Key {
  number: number;
  userId?: number | null;
  user?: User | null;
}
