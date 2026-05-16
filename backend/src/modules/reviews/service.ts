import { MedusaService } from "@medusajs/framework/utils"
import ProductReview from "./models/product-review"

class ReviewsModuleService extends MedusaService({
  ProductReview,
}) {}

export default ReviewsModuleService
