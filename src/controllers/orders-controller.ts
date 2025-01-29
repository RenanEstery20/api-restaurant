import { Request, Response, NextFunction } from 'express';
import { knex } from "@/database/knex"
import z from 'zod';
import { AppError } from '@/utils/AppError';

class OrdersController {

  public async create(request: Request, response: Response, next: NextFunction) {
    try {
      const bodySchema = z.object({
        table_session_id: z.number(),
        product_id: z.number(),
        quantity: z.number(),
      })

      const {table_session_id, product_id, quantity} = bodySchema.parse(request.body);

      //checa se a sessao da mesa existe
      const session = await knex<TablesSessionRepository>("table_sessions")
      .where({id: table_session_id})
      .first();

      //checa se a mesa esta fechada
      if(!session) {
       throw new AppError("session table not found");
      }

      //checa se a mesa esta fechada
      if(session.closed_at){
        throw new AppError("this table is closed");
      }

      //checa se o produto existe
      const product = await knex<ProductRepository>("products")
      .where({id: product_id})
      .first();

      //checa se o produto existe
      if(!product){
        throw new AppError("product not found");
      }

    
      await knex<OrderRepository>("orders").insert({
        table_session_id,
        product_id,
        quantity,
        price: product.price,
      })

      return response.status(201).json()

    } catch (error) {
      next(error);
    }
  }

  public async index(request: Request, response: Response, next: NextFunction) {
    try {
      const {  table_session_id } = request.params;

      const order = await knex("orders")
      .select(
        "orders.id",
        "orders.table_session_id",
        "orders.product_id",
        "products.name",
        "orders.price",
        "orders.quantity",
        knex.raw("orders.price * orders.quantity as total"),
        "orders.created_at",
        "orders.updated_at"
      )
      .join("products", "products.id", "orders.product_id")
      .where( { table_session_id} )
      .orderBy("orders.created_at", "desc");

      return response.json(order);
    } catch (error) {
      next(error);
    }
  }


  public async show(request: Request, response: Response, next: NextFunction) {
    try {
      const { table_session_id } = request.params;

      const order = await knex("orders")
      .select(
        knex.raw("COALESCE(SUM(orders.price * orders.quantity), 0) as total"),
        knex.raw("COALESCE(SUM(orders.quantity), 0) as quantity")
      ).where({table_session_id}).first()

      return response.json(order)
    } catch (error) {
      next(error);
    }
  }
}

export { OrdersController };
