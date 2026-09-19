import BethkatiClient from "./BethkatiClient";
import { api } from "~/trpc/server";

export const revalidate = 3600;

export default async function BethkatiPage() {
  const issues = await api.misc.getAllBethkati();
  return <BethkatiClient initialIssues={issues} />;
}
