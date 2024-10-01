import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Customer } from './TypeOrm/entities/customer.entity';
import { AuthController } from './controllers/auth/auth.controller';
import { UsersController } from './controllers/users/users.controller';
import { User } from './TypeOrm/entities/user.entity';
import { UsersModule } from './services/users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { Product } from './TypeOrm/entities/product.entity';
import { Order } from './TypeOrm/entities/order.entity';

import { CustomersService } from './services/customers/customers.service';
import { OrderService } from './services/order/order.service';

import { OrderController } from './controllers/order/order.controller';
import { DeliveryController } from './controllers/delivery/delivery.controller';
import { CustomersController } from './controllers/customers/customers.controller';

import { ProductController } from './controllers/product/product.controller';
import { ProductService } from './services/product/product.service';
import { ChatModule } from './chat/chat.module';
import { OrderProduct } from './TypeOrm/entities/orderproduct.entity';
import { UsersService } from './services/users/users.service';
import { Courier } from './TypeOrm/entities/courier.entity';
import { AuthMiddleware } from './auth/AuthMiddleware';
import { OtpService } from './services/otp/otp.service';
import { OtpController } from './controllers/otp/otp.controller';
import { Delivery } from './TypeOrm/entities/delivery.entity';
import { DeliveryService } from './services/delivery/delivery.service';
import { DeliveryGateway } from './services/delivery/delivery.gateway';
import { RewardController } from './controllers/reward/reward.controller';
import { RewardService } from './services/reward/reward.service';
import { Reward } from './TypeOrm/entities/reward.entity';

import { FileService } from './services/file/file.service';
import { CourierService } from './services/courier/courier.service';
import { CourierController } from './controllers/courier/courier.controller';
import { InvoiceController } from './controllers/invoice/invoice.controller';
import { InvoiceService } from './services/invoice/invoice.service';
import { Invoice } from './TypeOrm/entities/invoice.entity';
import { Payment } from './TypeOrm/entities/payment.entity';
import { PaymentService } from './services/payment/payment.service';
import { PaymentController } from './controllers/payment/payment.controller';
import { CourierEarnings } from './TypeOrm/entities/courier_earnings.entity';
import { EarningService } from './services/earning/earning.service';
import { EarningController } from './controllers/earning/earning.controller';
import { Keuangan } from './TypeOrm/entities/keuangan.entity';
import { KeuanganService } from './services/keuangan/keuangan.service';
import { KeuanganController } from './controllers/keuangan/keuangan.controller';
import { Redeem } from './TypeOrm/entities/redeem.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Memastikan konfigurasi tersedia secara global
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'appgalon',
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),

    UsersModule,
    AuthModule,
    ChatModule,
    TypeOrmModule.forFeature([
      Customer,
      Delivery,
      Product,
      Order,
      Courier,
      User,
      OrderProduct,
      Reward,
      Invoice,
      Payment,
      CourierEarnings,
      Keuangan,
      Redeem,
    ]),
  ],
  controllers: [
    AppController,
    UsersController,
    AuthController,
    OrderController,
    DeliveryController,
    CustomersController,
    ProductController,
    OtpController,
    RewardController,
    CourierController,
    InvoiceController,
    PaymentController,
    EarningController,
    KeuanganController,
  ],
  providers: [
    FileService,
    AppService,
    UsersService,
    CustomersService,
    OrderService,
    ProductService,
    OtpService,
    DeliveryService,
    DeliveryGateway,
    RewardService,
    CourierService,
    InvoiceService,
    PaymentService,
    EarningService,
    KeuanganService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*'); // Apply to all routes or specific routes
  }
}
