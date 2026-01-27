import { Request, Response } from "express";
import { prisma } from "../../database/prisma";
import asyncHandler from "../../shared/utils/asyncHandler";
import { fail, success } from "../../shared/utils/response";
import { OrdersService } from "./orders.service";

export const OrdersController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const { customerId, providerProfileId, deliveryAddress, items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) return fail(res, 400, "No items provided");

    // fetch meals to compute prices
    const mealIds = items.map((i: any) => i.mealId).filter(Boolean);
    const meals = await prisma.meal.findMany({ where: { id: { in: mealIds } } });
    const mealMap: any = {};
    meals.forEach((m) => (mealMap[m.id] = m));

    const orderItems = items.map((it: any) => {
      const meal = mealMap[it.mealId];
      const unitPrice = meal ? meal.price : it.unitPrice || 0;
      const quantity = it.quantity || 1;
      return {
        mealId: it.mealId,
        mealTitle: meal ? meal.title : it.mealTitle || "",
        unitPrice,
        quantity,
        subtotal: unitPrice * quantity,
      };
    });

    const total = orderItems.reduce((s: number, it: any) => s + it.subtotal, 0);

    const data: any = {
      customerId: customerId || null,
      providerProfileId: providerProfileId || null,
      deliveryAddress,
      total,
      items: { create: orderItems },
    };

    const created = await OrdersService.create(data);
    return success(res, created, "Order created");
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.query.customerId as string | undefined;
    const orders = await OrdersService.list(customerId);
    return success(res, orders);
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const order = await OrdersService.get(req.params.id);
    if (!order) return fail(res, 404, "Order not found");
    return success(res, order);
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;
    const updated = await OrdersService.updateStatus(req.params.id, status);
    return success(res, updated, "Order status updated");
  }),
};
