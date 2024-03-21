import { Router } from "express";
import { CartController } from "../controllers/cart.controller.js";
import cartModel from "../models/cart.model.js";
import { ticketService } from "../dao/ticket.dao.js";

const router = Router();
const controller = new CartController();
const ticketDao = new ticketService();

router.get("/", async (req, res) => {
  try {
    const limit = req.query.limit;
    const carts = await controller.getCarts();

    if (limit) {
      const limitedCarts = carts.slice(0, limit);
      res.status(206).json(limitedCarts);
    } else {
      res.status(200).json({ carts: carts });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "error", error: err.message });
  }
});

router.get("/top", async (req, res) => {
  try {
    res.status(200).send({ status: "OK", data: await controller.getTopCart() });
  } catch (err) {
    res.status(500).send({ status: "ERR", data: err.message });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const cart = await cartModel.findById(cartId).populate("products.product");

    if (!cart)
      return res
        .status(404)
        .json({ error: `The cart with id ${cartId} does not exist` });

    res.status(200).json({ status: "success", payload: cart });
  } catch (err) {
    return res.status(500).json({ status: "error", error: err.message });
  }
});

router.get("/:cid/purchase", async (req, res) => {
  try {
    const cartId = req.params.cid;

    const cart = await cartModel.findById(cartId).populate("products.product").populate("user");

    if (!cart) {
      return res
        .status(404)
        .json({ error: `The cart with id ${cartId} does not exist` });
    }

    const ticketDetails = {
      code: "código_único_aquí",
      purchase_datetime: new Date(),
      amount: cart.total,
      purchaser: cart.user.email,
    };

    const createdTicket = await ticketDao.createTicket(ticketDetails);

    res.status(201).json({ status: "success", payload: createdTicket });
  } catch (err) {
    return res.status(500).json({ status: "error", error: err.message });
  }
});

router.put("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const updatedCart = await cartModel.updateOne(
      { _id: cid },
      { products: req.body }
    );
    res.json({ status: "success", payload: updatedCart });
  } catch (err) {
    return res.status(500).json({ status: "error", error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const cart = req.body;

    if (cart._id) {
      return res.status(400).json({ error: "Cart already exists" });
    }

    if (!cart.products || cart.products.length === 0) {
      return res
        .status(400)
        .json({ error: "Cart must have at least one product" });
    }

    for (const product of cart.products) {
      const existingProduct = await productModel.findById(product.product);
      if (!existingProduct) {
        return res
          .status(400)
          .json({ error: `Product ${product.product} does not exist` });
      }
    }

    const addCart = await cartModel.create(cart);
    res.status(201).json({ status: "success", payload: addCart });
  } catch (err) {
    return res.status(500).json({ status: "error", error: err.message });
  }
});

export default router;