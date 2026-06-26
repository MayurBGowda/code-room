import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";

// Create Inngest client
export const inngest = new Inngest({ id: "code-room" });

// Sync Clerk user to MongoDB
const syncUser = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: ["clerk/user.created", "user.created"] }, // Now listens for both
  async ({ event }) => {
    await connectDB();

    // Use event.data as normal
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

// Delete user from MongoDB
const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user-from-db" },
  { event: ["clerk/user.deleted", "user.deleted"] }, // Now listens for both
  async ({ event }) => {
    await connectDB();

    await User.deleteOne({ clerkId: event.data.id });

    console.log("🗑️ User deleted from MongoDB");

    return { success: true };
  }
);

export const functions = [syncUser, deleteUserFromDB];