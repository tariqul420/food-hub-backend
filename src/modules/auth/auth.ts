import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../../database/prisma";

 export const auth = betterAuth({
   database: prismaAdapter(prisma, {
     provider: "postgresql",
   }),
   baseURL: process.env.BETTER_AUTH_URL || "https://foodhub-api.tariqul.dev",
   secret: process.env.BETTER_AUTH_SECRET,
   trustedOrigins: [process.env.SITE_URL || "https://foodhub.tariqul.dev"],
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
   cookie: {
     httpOnly: true,
     secure: process.env.NODE_ENV === "production",
     sameSite: "lax",
     domain: process.env.NODE_ENV === "production" ? ".tariqul.dev" : undefined,
     path: "/",
   },
 });
