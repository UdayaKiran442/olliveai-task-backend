import { Hono } from "hono";
import z from "zod";
import { loginUser } from "../constroller/user.controller";
import { CreateUserInDBError, GetUserByEmailFromDBError, LoginUserError } from "../exceptions/user.exceptions";

const userRoute = new Hono();

const UserLoginSchema = z.object({
	email: z.string(),
	userId: z.string(),
});

export type IUserLoginSchema = z.infer<typeof UserLoginSchema>;

userRoute.post("/login", async (c) => {
	try {
		const validation = UserLoginSchema.safeParse(await c.req.json());
		if (!validation.success) {
			throw validation.error;
		}
		const user = await loginUser(validation.data);
		return c.json({ success: true, user });
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errMessage = JSON.parse(error.message);
			return c.json({ success: false, error: errMessage[0], message: errMessage[0].message }, 401);
		}
		if (error instanceof LoginUserError || error instanceof CreateUserInDBError || error instanceof GetUserByEmailFromDBError) {
			return c.json({ success: false, error: error.message }, 401);
		}
        return c.json({ success: false, error: (error as Error).message }, 500);
	}
});

export default userRoute;
