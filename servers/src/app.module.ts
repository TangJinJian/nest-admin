import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'
import { RedisModuleOptions } from 'nestjs-redis'
import { APP_GUARD } from '@nestjs/core'

import configuration from './config/index'

import { RedisUtilModule } from './common/libs/redis/redis.module'

import { UserModule } from './system/user/user.module'
import { AuthModule } from './system/auth/auth.module'
import { MenuModule } from './system/menu/menu.module'
import { RoleModule } from './system/role/role.module'
import { PermModule } from './system/perm/perm.module'
import { RolesGuard } from './common/guards/roles.guard'

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      cache: true,
      load: [configuration],
      isGlobal: true,
    }),
    // 数据库
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'mysql',
          entities: ['dist/**/*.entity{.ts,.js}'],
          keepConnectionAlive: true,
          ...config.get('db.mysql'),
          // cache: {
          //   type: 'ioredis',
          //   ...config.get('redis'),
          //   alwaysEnabled: true,
          //   duration: 3 * 1000, // 缓存3s
          // },
        } as TypeOrmModuleOptions
      },
    }),
    // libs redis
    RedisUtilModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        return config.get<RedisModuleOptions>('redis')
      },
      inject: [ConfigService],
    }),
    // 系统基础模块
    UserModule,
    AuthModule,
    MenuModule,
    RoleModule,
    PermModule,
    // 业务功能模块
  ],
  // 全局守卫
  // providers: [
  //   {
  //     provide: APP_GUARD,
  //     useClass: RolesGuard,
  //   },
  // ],
})
export class AppModule {}
