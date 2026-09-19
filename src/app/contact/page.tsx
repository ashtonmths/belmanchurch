import ContactClient from "./ContactClient";
import { env } from "~/env";

export default function ContactPage() {
  return <ContactClient parishEmail={env.SMTP_USER} />;
}
