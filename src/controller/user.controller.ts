import { CreateUserInDBError, GetUserByEmailFromDBError, LoginUserError } from "../exceptions/user.exceptions";
import { createUserInDB, getUserByEmailFromDB } from "../repository/user.repository";
import type { IUserLoginSchema } from "../routes/user.route";

export async function loginUser(payload: IUserLoginSchema) {
	try {
		// check if user exists in db
		const user = await getUserByEmailFromDB(payload.email);
		if (user.length > 0) {
			// if exists, return user details
			return user[0];
		}
		// if not, create user and return user details
		return await createUserInDB(payload);
	} catch (error) {
		if (error instanceof GetUserByEmailFromDBError || error instanceof CreateUserInDBError) {
			throw error;
		}
		throw new LoginUserError("Error logging in user", { cause: (error as Error).message });
	}
}
