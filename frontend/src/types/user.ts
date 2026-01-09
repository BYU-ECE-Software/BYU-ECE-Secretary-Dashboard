export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  byuId?: string | null;
  netId?: string | null;
  positionId: number;
}
