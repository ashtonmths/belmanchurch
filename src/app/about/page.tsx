import AboutClient from "./AboutClient";
import { api } from "~/trpc/server";

export const revalidate = 3600;

export default async function AboutPage() {
  const priests = await api.misc.getAllPriests();
  return <AboutClient initialPriests={priests} />;
}
