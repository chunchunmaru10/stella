import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/server";
import NewAnnouncementForm from "./new-announcement.form";

export default async function AnnouncementPage() {
  const announcements = await api.announcement.getAnnouncements.query();

  return (
    <>
      <h1 className="text-2xl font-bold">Announcements</h1>
      <NewAnnouncementForm />
      <div className="flex flex-col gap-4">
        {announcements.map((announcement) => (
          <Card key={announcement.message}>
            <CardContent className="p-4">
              <p>{announcement.message}</p>
              <p className="mt-4 text-gray-500">
                Created: {announcement.createdAt.toDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
