import { compare } from "bcrypt-ts";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { getUser, getUserById, getUserByPhone, getUserByEmailOrPhone } from "@/db/queries";

import { authConfig } from "./auth.config";

export const {
	handlers: { GET, POST },
	auth,
	signIn,
	signOut,
} = NextAuth({
	...authConfig,
	providers: [
		Credentials({
			credentials: {},
			async authorize({ email, phone, password, loginType }: any) {
				let users: any[] = [];

				try {
					if (loginType === "phone" && phone) {
						users = await getUserByPhone(phone);
					} else if (loginType === "email" && email) {
						users = await getUser(email);
					} else {
						const identifier = email || phone;
						if (identifier) {
							users = await getUserByEmailOrPhone(identifier);
						}
					}
				} catch (dbError) {
					console.error("❌ Database error during user lookup:", dbError);
					return null;
				}

				if (users.length === 0) {
					return null;
				}

				if (!users[0].password) {
					return null;
				}

				try {
					let passwordsMatch = await compare(password, users[0].password);

					if (passwordsMatch) return users[0] as any;

					return null;
				} catch (passwordError) {
					console.error("❌ Password comparison error:", passwordError);
					return null;
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
			}

			return token;
		},
		async session({ session, token }: { session: any; token: any }) {
			if (session.user && token.id) {
				session.user.id = token.id as string;

				try {
					const userFromDb = await getUserById(token.id as string);

					if (userFromDb.length > 0) {
						session.user.role = userFromDb[0].role;
					}
				} catch (dbError) {
					console.error("❌ Database error in session callback:", dbError);
				}
			}

			return session;
		},
	},
});
