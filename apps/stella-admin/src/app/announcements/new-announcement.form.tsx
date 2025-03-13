"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/trpc/client";
import { useRouter } from "next-nprogress-bar";
import React, { useState } from "react";

export default function NewAnnouncementForm() {
  const [message, setMessage] = useState("");
  const { mutate, isPending } = api.announcement.createAnnouncement.useMutation(
    {
      onSuccess: () => {
        setMessage("");
        toast({
          description: "Announcement created successfully",
        });
        router.refresh();
      },
      onError: (e) => {
        let message = "Something went wrong while creating an announcement.";

        if (e.data?.zodError?.formErrors[0])
          message = e.data.zodError.formErrors[0];

        toast({
          description: message,
          variant: "destructive",
        });
      },
    },
  );
  const router = useRouter();

  return (
    <div className="my-4">
      <h2 className="my-2 text-lg font-semibold">Create New</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutate(message);
        }}
      >
        <Textarea
          placeholder="Message"
          rows={5}
          className="resize-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button className="mt-2 w-full" isLoading={isPending}>
          Submit
        </Button>
      </form>
    </div>
  );
}
