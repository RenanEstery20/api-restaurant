import { NextFunction, Request, Response } from "express";
import { knex } from "@/database/knex"
import { z } from "zod"
import { AppError } from "@/utils/AppError";

class TablesSessionsController {

    async create(request: Request, response: Response, next: NextFunction) {
        try {
            const bodySchema = z.object({
                table_id: z.number(),
            })

            const {table_id} = bodySchema.parse(request.body)

            //Validação para não permitir abrir uma nova sessão para uma mesa que já possui uma sessão aberta
            const session = await knex<TablesSessionRepository>(
                "table_sessions"
            ).where({table_id}).orderBy("opened_at", "desc").first()

            if (session && !session.closed_at) {
                throw new AppError("There is already a session opened for this table")

            }
            

            await knex<TablesSessionRepository>("table_sessions").insert({
                table_id,
                opened_at: knex.fn.now()
            })

            return response.status(201).json()
        } catch (error) {
            next(error)
        }
    }
    
    async index(request: Request, response: Response, next: NextFunction) {
        try {
            const sessions = await knex<TablesSessionRepository>("table_sessions").orderBy("closed_at")
            return response.json(sessions)
        } catch (error) {
            next(error)
        }
    }

    async update(request: Request, response: Response, next: NextFunction) {
        try {
            const id = z
                .string()
                .transform((value) => Number(value))
                .refine((value) => !isNaN(value), {message: "Invalid ID"})
                .parse(request.params.id)

            const session = await knex<TablesSessionRepository>("table_sessions").where({id}).first()

            //Validação para não permitir fechar uma sessão que já está fechada
            if (!session) {
                throw new AppError("Session not found", 404)
            }
            
            //Validação para não permitir fechar uma sessão que já está fechada
            if (session.closed_at) {
                throw new AppError("Session already closed")
            }

            await knex<TablesSessionRepository>("table_sessions")
            .update({
                closed_at: knex.fn.now()
            })
            .where({id})

            return response.json()
        } catch (error) {
            next(error)
        }
    }


}


export { TablesSessionsController }