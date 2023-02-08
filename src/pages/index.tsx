/* eslint-disable @typescript-eslint/no-misused-promises */
import { type NextPage } from "next";

import { signIn, signOut, useSession } from "next-auth/react";
import type { FormEvent } from "react";
import { useState } from "react";
import { api } from "../utils/api";

const Form = () => {
  const [message, setMessage] = useState("");
  const { data: session, status } = useSession();
  const utils = api.useContext();

  const postMessage = api.guestbook.postMessage.useMutation({
    onMutate: async (newEntry) => {
      await utils.guestbook.getAll.cancel();
      utils.guestbook.getAll.setData(undefined, (prevEntires) => {
        if (prevEntires) {
          return [newEntry, ...prevEntires];
        } else {
          return [newEntry];
        }
      });
    },
    onSettled: async () => {
      await utils.guestbook.getAll.invalidate();
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    postMessage.mutate({ name: session?.user?.name as string, message });
    setMessage("");
  };

  if (status !== "authenticated") return null;

  return (
    <form className="flex gap-2" onSubmit={handleSubmit}>
      <input
        type="text"
        className="rounded-md border-2 border-zinc-800 bg-neutral-900 px-4 py-2 focus:outline-none"
        placeholder="Your message..."
        minLength={2}
        maxLength={100}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <button
        type="submit"
        className="rounded-md border-2 border-zinc-800 p-2 focus:outline-none"
      >
        Submit
      </button>
    </form>
  );
};

const GuestbookEntries = () => {
  const { data: guestBookEntries, isLoading } = api.guestbook.getAll.useQuery();
  if (isLoading) return <div>Fetching messages....</div>;

  return (
    <div className="flex flex-col gap-4">
      {guestBookEntries?.map((entry, i) => (
        <div key={i}>
          <p>{entry.message}</p>
          <span>- {entry.name}</span>
        </div>
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <main className="flex flex-col items-center pt-4">Loading...</main>;
  }

  const handleLoginClick = () => signIn("discord").catch(console.log);
  return (
    <main className="flex flex-col items-center">
      <h1 className="pt-4 text-3xl">Guestbook</h1>
      <p>
        Tutorial for <code>create-t3-app</code>
      </p>
      <div className="pt-10">
        <div>
          {session ? (
            <>
              <p className="mb-4 text-center">Hi {session.user.name}</p>{" "}
              <button
                className="mx-auto block rounded-md bg-neutral-800 py-3 px-6 text-center hover:bg-neutral-700"
                onClick={() => signOut().catch(console.log)}
              >
                Logout
              </button>
              <GuestbookEntries />
              <div className="mt-6">
                <Form />
              </div>
            </>
          ) : (
            <button onClick={() => handleLoginClick()}>
              Login with discord
            </button>
          )}
        </div>
      </div>
    </main>
  );
};

export default Home;
