import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customers } from 'src/TypeOrm/entities/customers.entity';
import { CostumerDto } from 'src/dto/CustomerDto';
import { DeleteResult, Repository } from 'typeorm';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customers)
    private customersRepository: Repository<Customers>,
  ) {}

  async findAll() {
    const customer = await this.customersRepository.find();
    return customer;
  }

  async findOne(id: number): Promise<Customers> {
    const customer = await this.customersRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async create(customerData: Partial<Customers>): Promise<Customers> {
    const customer = this.customersRepository.create(customerData);
    return await this.customersRepository.save(customer);
  }

  async update(id: number, data: CostumerDto): Promise<Customers> {
    const costumer = await this.customersRepository.findOne({ where: { id } });
    if (!costumer) {
      throw new NotFoundException('costumer not found');
    }

    // Lakukan validasi hanya jika data yang diberikan ada
    if (data.nama) {
      costumer.nama = data.nama;
    }
    if (data.nomor_telepon) {
      costumer.nomor_telepon = data.nomor_telepon;
    }
    if (data.alamat) {
      costumer.alamat = data.alamat;
    }

    // Simpan perubahan
    await this.customersRepository.save(costumer);

    return costumer;
  }

  async remove(id: number): Promise<DeleteResult> {
    const costumer = await this.customersRepository.findOne({ where: { id } });
    const deleteResult = await this.customersRepository.delete(costumer);
    if (!costumer) {
      throw new NotFoundException('Customer tidak ditemukan');
    }
    return deleteResult;
  }
}
