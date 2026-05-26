import type { Context, Next } from "hono";

import type { AuthContext } from "../types/types";
import { decodeToken } from "../utils/jwt.utils";
import type { JWTPayload } from "hono/utils/jwt/types";

export async function authMiddleware(c: Context<AuthContext>, next: Next) {
	try {
		const token = c.req.header("Authorization");
		if (!token) {
			return c.json({ error: "Unauthorized: Missing or invalid token" }, 401);
		}

		const decoded = decodeToken(token) as JWTPayload;
        const userId = decoded.sub as string;
		// Attach decoded user info (e.g., userId) to context
		c.set("user", {
			userId: userId,
        });

		await next();
	} catch (error) {
		return c.json({ message: "Unauthorized: Invalid or expired token", error: error }, 401);
	}
}
