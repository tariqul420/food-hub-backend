import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../../database/prisma";

 export const auth = betterAuth({
   database: prismaAdapter(prisma, {
     provider: "postgresql",
   }),
   baseURL: process.env.BETTER_AUTH_URL || "https://foodhub-b.vercel.app",
   secret: process.env.BETTER_AUTH_SECRET,
   trustedOrigins: [process.env.SITE_URL || "https://foodhubx.vercel.app"],
   user: {
     additionalFields: {
       role: {
         type: "string",
         defaultValue: "CUSTOMER",
         required: true,
       },
     },
   },
   emailAndPassword: {
     enabled: true,
   },
   rateLimit: {
     window: 10,
     max: 100,
   },
   account: {
     accountLinking: {
       enabled: true,
       trustedProviders: ["google"],
     },
   },
   session: {
     cookieCache: {
       enabled: true,
       maxAge: 60 * 60 * 24 * 7,
     },
     expiresIn: 60 * 60 * 24 * 7,
     updateAge: 60 * 60 * 24,
     cookieName: "better-auth.session_token",
   },
 });
