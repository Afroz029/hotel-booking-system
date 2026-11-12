import { Inngest } from "inngest";
import User from "../models/User.js";

export const inngest = new Inngest({
    id: "quick-stay",
    eventKey: process.env.INNGEST_EVENT_KEY,
    signingKey: process.env.INNGEST_SIGNING_KEY
});

const syncUserCreation = inngest.createFunction(
    { id: 'sync-user-from-clerk' },
    { event: 'clerk/user.created' },

    async ({ event }) => {
        const { id, email_addresses, first_name, last_name, image_url } = event.data;

        const email = email_addresses?.[0]?.email_address || "";
        const username = `${first_name || ""} ${last_name || ""}`.trim() || email.split("@")[0] || "User";

        const userData = {
            _id: id,
            email,
            username,
            image: image_url || ""
        };

        await User.findByIdAndUpdate(id, userData, { upsert: true, new: true });
    }
);

const syncUserDeletion = inngest.createFunction(
    { id: 'delete-user-from-clerk' },
    { event: 'clerk/user.deleted' },

    async ({ event }) => {
        const { id } = event.data;
        if (id) {
            await User.findByIdAndDelete(id);
        }
    }
);

const syncUserUpdation = inngest.createFunction(
    { id: 'update-user-from-clerk' },
    { event: 'clerk/user.updated' },

    async ({ event }) => {
        const { id, email_addresses, first_name, last_name, image_url } = event.data;

        const email = email_addresses?.[0]?.email_address || "";
        const username = `${first_name || ""} ${last_name || ""}`.trim() || email.split("@")[0] || "User";

        const userData = {
            _id: id,
            email,
            username,
            image: image_url || ""
        };

        await User.findByIdAndUpdate(id, userData, { upsert: true, new: true });
    }
);

export const functions = [
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdation
];
