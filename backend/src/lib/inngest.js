import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";

export const inngest = new Inngest({ id: "code-room" });

const syncUser = inngest.createFunction(
  { id: "sync-user-from-clerk", triggers: [{ event: "clerk/user.created" }, { event: "user.created" }] },
  async ({ event }) => {
    await connectDB();

    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    const existingUser = await User.findOne({ clerkId: id });

    if (!existingUser) {
      await User.create({
        clerkId: id,
        name: `${first_name || ""} ${last_name || ""}`.trim(),
        email: email_addresses?.[0]?.email_address,
        profileImage: image_url || "",
      });
      console.log("✅ User synced to MongoDB");
    }

    return { success: true };
  }
);

const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user-from-db", triggers: [{ event: "clerk/user.deleted" }, { event: "user.deleted" }] },
  async ({ event }) => {
    await connectDB();
    await User.deleteOne({ clerkId: event.data.id });
    console.log("🗑️ User deleted from MongoDB");
    return { success: true };
  }
);

export const functions = [syncUser, deleteUserFromDB];