import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './controllers/users/users.controller';
import { CustomerController } from './controllers/customers/customers.controller';
import { CustomersService } from './services/customers/customers.service';
import { Customers } from './TypeOrm/entities/customers.entity';
import { CourierService } from './services/courier/courier.service';
import { CourierController } from './controllers/courier/courier.controller';
import { Courier } from './TypeOrm/entities/courier.entity';
import { DeliveryService } from './services/delivery/delivery.service';
import { DeliveryController } from './controllers/delivery/delivery.controller';
import { Delivery } from './TypeOrm/entities/delivery.entity';
import { Items } from './TypeOrm/entities/items.entity';
import { ItemsController } from './controllers/items/items.controller';
import { ItemsService } from './services/items/items.service';
import { PaymentController } from './controllers/payment/payment.controller';
import { PaymentService } from './services/payment/payment.service';
import { Transaction } from './TypeOrm/entities/transaction.entity';
import { ReportService } from './services/report/report.service';
import { ReportController } from './controllers/report/report.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),

    TypeOrmModule.forFeature([
      Customers,
      Courier,
      Delivery,
      Items,
      Transaction,
    ]),
  ],
  controllers: [
    AppController,
    UsersController,
    CustomerController,
    CourierController,
    DeliveryController,
    ItemsController,
    PaymentController,
    ReportController,
  ],
  providers: [
    AppService,
    CourierService,
    CustomersService,
    DeliveryService,
    ItemsService,
    PaymentService,
    ReportService,
  ],
})
export class AppModule {}
