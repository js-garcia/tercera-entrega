import { UserService } from "../dao/users.mongo.dao.js"
import { faker } from '@faker-js/faker';
import{ createHash } from '../utils.js';

const service = new UserService()

export class UserController {
    constructor() {
    }

    async getUsers() {
        try {
            return await service.getUsers()
        } catch (err) {
            return err.message
        }
        
    }

    async getUsersPaginated(page, limit) {
        try {
            return await service.getUsersPaginated()
        } catch (err) {
            return err.message
        }
    }
    
    async generateMockUsers(qty){
        const mockCarts = [];
        const mockUsers = [];
        const possibleRoles = ['user','admin'];
        for (let i = 0; i < qty; i++){
            const carts = {
                _id:faker.database.mongodbObjectId(),
                products:[],
                total: 0
            }
            mockCarts.push(carts);

            const user= {
                _id: faker.database.mongodbObjectId(),
                first_name: faker.person.firstName(),
                last_name: faker.person.lastName(),
                email: faker.internet.email(),
                age: faker.number.int(70) + 1,
                gender: faker.person.sex(),
                password: createHash(faker.internet.password({ length: 8 })),
                cart: mockCarts[i]._id,
                //cart: 0,
                role: faker.helpers.arrayElement(Object.values(possibleRoles))
            };
            mockUsers.push(user);
        }
        return [mockCarts, mockUsers];
    }
}