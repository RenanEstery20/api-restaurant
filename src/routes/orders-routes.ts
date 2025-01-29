import { Router } from "express";

import { OrdersController } from "@/controllers/orders-controller";

const ordersRouter = Router();
const ordersController = new OrdersController()

ordersRouter.post("/", ordersController.create);
ordersRouter.get("/table-session/:table_session_id/total", ordersController.show);
ordersRouter.get("/table-session/:table_session_id", ordersController.index);

export { ordersRouter };
