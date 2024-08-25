import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Customer } from 'src/TypeOrm/entities/customer.entity';

import { Repository } from 'typeorm';
import { User } from 'src/TypeOrm/entities/user.entity';
import { CreateCustomerDto } from 'src/dto/customersDto';

import { Role } from 'src/enum/role';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createCustomer(
    createCustomerDto: CreateCustomerDto,
  ): Promise<Customer> {
    const { pin, name, phoneNumber, address } = createCustomerDto;

    // Validate PIN length
    if (pin.length !== 6) {
      throw new BadRequestException('PIN Harus 6 Karakter.');
    }

    // Check if the phoneNumber already exists
    const existingUser = await this.userRepository.findOne({
      where: { username: phoneNumber },
    });

    if (existingUser) {
      throw new ConflictException('Nomor telepon sudah terdaftar.');
    }
    const hashedPassword = await bcrypt.hash(pin, 10);
    // Create new user
    const newUser = new User();
    newUser.id = uuidv4();
    newUser.username = phoneNumber;
    newUser.name = name;
    newUser.password = hashedPassword; // Consider hashing the password
    newUser.role = Role.CUSTOMER;

    const savedUser = await this.userRepository.save(newUser);

    // Create new customer linked to the user
    const customer = new Customer();
    customer.id = uuidv4();
    customer.name = name;
    customer.phoneNumber = phoneNumber;
    customer.points = 0;
    customer.address = address;
    customer.user = savedUser;

    return await this.customerRepository.save(customer);
  }
  async getCustomerById(customerId: string): Promise<Customer> {
    console.log(`Looking for customer with ID: ${customerId}`);

    const customer = await this.customerRepository.findOne({
      where: {
        user: { id: customerId },
      },
    });

    if (!customer) {
      console.error('Customer not found');
      throw new NotFoundException('Customer not found');
    }

    console.log('Customer found:', customer);

    return customer;
  }
}
