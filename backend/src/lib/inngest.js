import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";
import { deleteStreamUser, upsertStreamUser } from "./stream.js";

export const inngest = new Inngest({ id: "talent-iq" });

const syncUser = inngest.createFunction(
  { id: "sync-user" },
  { event: "webhook/request.received" },
  async ({ event }) => {
    await connectDB();

    const webhookEvent = event.data?.data;

    if (webhookEvent?.type !== "user.created") return;

    const { id, email_addresses, first_name, last_name, image_url } =
      webhookEvent.data;

    const newUser = {
      clerkId: id,
      email: email_addresses?.[0]?.email_address,
      name: `${first_name || ""} ${last_name || ""}`.trim(),
      profileImage: image_url,
    };

    await User.findOneAndUpdate(
      { clerkId: id },
      newUser,
      { upsert: true, new: true }
    );

    await upsertStreamUser({
      id: newUser.clerkId.toString(),
      name: newUser.name,
      image: newUser.profileImage,
    });
  }
);

const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user-from-db" },
  { event: "webhook/request.received" },
  async ({ event }) => {
    await connectDB();

    const webhookEvent = event.data?.data;

    if (webhookEvent?.type !== "user.deleted") return;

    const { id } = webhookEvent.data;

    await User.deleteOne({ clerkId: id });
    await deleteStreamUser(id.toString());
  }
);

export const functions = [syncUser, deleteUserFromDB];