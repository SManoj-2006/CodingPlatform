import { requireAuth } from "@clerk/express";
import User from "../models/User.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const auth = req.auth();
      const clerkId = auth?.userId;

      if (!clerkId) return res.status(401).json({ message: "Unauthorized - invalid token" });

      // find user in db by clerk ID
      let user = await User.findOne({ clerkId });

      if (!user) {
        const claims = auth?.sessionClaims || {};
        const name =
          claims?.name ||
          [claims?.given_name, claims?.family_name].filter(Boolean).join(" ") ||
          claims?.username ||
          "User";
        const email =
          claims?.email ||
          claims?.email_address ||
          (Array.isArray(claims?.email_addresses) ? claims.email_addresses[0] : undefined) ||
          `${clerkId}@clerk.local`;
        const profileImage = claims?.image_url || "";

        user = await User.create({
          clerkId,
          name,
          email,
          profileImage,
        });
      }

      if (!user) return res.status(404).json({ message: "User not found" });

      // attach user to req
      req.user = user;

      next();
    } catch (error) {
      console.error("Error in protectRoute middleware", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
];