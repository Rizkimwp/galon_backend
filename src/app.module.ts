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
import { Delivery } from './TypeOrm/entities/delivery.entity';
import { CustomersService } from './services/customers/customers.service';
import { OrderService } from './services/order/order.service';
import { DeliveryService } from './services/delivery/delivery.service';
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
      Product,
      Order,
      Courier,
      Delivery,
      User,
      OrderProduct,
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
  ],
  providers: [
    AppService,
    UsersService,
    CustomersService,
    OrderService,
    DeliveryService,
    ProductService,
    OtpService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*'); // Apply to all routes or specific routes
  }
}
