import { ProductService } from "../dao/products.mongo.dao.js"

const service = new ProductService()

export class ProductController {
    constructor() {
    }

    async addProduct(product) {
        try {
            return await service.addProduct()
        } catch (err) {
            return err.message
        }
    }

    async getProducts() {
        try {
            return await service.getProducts()
        } catch (err) {
            return err.message
        }
        
    }

    async getProduct(id) {
        try {
            return await service.getProduct()
        } catch (err) {
            return err.message
        }
    }

    async updateProduct(id, newContent) {
        try {
            return await service.updateProduct()
        } catch (err) {
            return err.message
        }
    }

    async deleteProduct(id) {
        try {
            return await service.deleteProduct()
        } catch (err) {
            return err.message
        }
    }
}