import express from "express";
import { getProperties, getProperty, updateProperty, deleteProperty } from "../controllers/propertyController.js";
import { protect } from "../controllers/authController.js";

const propertyRouter = express.Router();

propertyRouter.route("/").get(getProperties);
propertyRouter
  .route("/:id")
  .get(getProperty)
  .put(protect, updateProperty)
  .delete(protect, deleteProperty);

export { propertyRouter };