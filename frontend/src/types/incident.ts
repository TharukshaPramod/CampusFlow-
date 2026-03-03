export type Incident = {
  id: string;
  title: string;
  status: "open" | "in_progress" | "resolved";
};
