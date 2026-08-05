export type DashboardRole =
  | "admin"
  | "seller"
  | "dealer"
  | "commissioner";

export type DashboardUser = {
  id?: number | string;
  name?: string;
  email?: string;
  role?: DashboardRole | string;
  roles?: Array<
    | string
    | {
        name?: string;
      }
  >;
};
