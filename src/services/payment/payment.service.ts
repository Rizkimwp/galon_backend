import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Customers } from 'src/TypeOrm/entities/customers.entity';
import { Items } from 'src/TypeOrm/entities/items.entity';
import { Transaction } from 'src/TypeOrm/entities/transaction.entity';
import { TransactionDto } from 'src/dto/TransactionDto';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async findAll(): Promise<TransactionDto[]> {
    const res = await this.transactionRepository.find({
      relations: ['items', 'customers'],
    });
    return plainToInstance(TransactionDto, res);
  }

  async create(transactionDto: TransactionDto) {
    const transaction = new Transaction();
    transaction.tanggalPembelian = new Date(); // Tanggal pembelian diisi otomatis
    transaction.qty = transactionDto.qty;
    if (transactionDto.customerId) {
      transaction.customers = { id: transactionDto.customerId } as Customers;
    }
    if (transactionDto.itemId) {
      transaction.items = { id: transactionDto.itemId } as Items;
    }
    return await this.transactionRepository.save(transaction);
  }
}
