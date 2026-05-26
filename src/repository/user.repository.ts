import { eq } from "drizzle-orm";
import db from "./db";
import { users } from "./schema";
import { CreateUserInDBError, GetUserByEmailFromDBError } from "../exceptions/user.exceptions";
import type { IUserLoginSchema } from "../routes/user.route";


export async function getUserByEmailFromDB(email: string) {
    try {
        return await db.select().from(users).where(eq(users.email, email));
    } catch (error) {
        throw new GetUserByEmailFromDBError("Error getting user by email from DB", { cause: (error as Error).message });
    }
}

export async function createUserInDB(payload: IUserLoginSchema) {
    try {
        const insertPayload = {
            userId: payload.userId,
            email: payload.email,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        await db.insert(users).values(insertPayload)
        return insertPayload
    } catch (error) {
        throw new CreateUserInDBError("Error creating user in DB", { cause: (error as Error).message });
    }
}