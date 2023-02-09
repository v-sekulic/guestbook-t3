/* eslint-disable @typescript-eslint/no-misused-promises */
import { signIn } from "next-auth/react";

export const GmailButton = () => {
  const handleLoginClick = () => signIn("google").catch(console.log);
  return <button onClick={() => handleLoginClick()}>Sign in with gmail</button>;
};
