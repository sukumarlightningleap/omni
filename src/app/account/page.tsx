import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AccountClient from "./AccountClient";

export default async function AccountPage() {
  const session = await auth();

  if (!session) {
    redirect("/login?callbackUrl=/account");
  }

  return <AccountClient />;
}
