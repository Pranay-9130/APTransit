import { Module } from "@nestjs/common";
import { NetworkController } from "./network.controller";
import { NetworkRepository } from "./network.repository";
import { NetworkService } from "./network.service";

@Module({
  controllers: [NetworkController],
  providers: [NetworkService, NetworkRepository],
  exports: [NetworkService],
})
export class NetworkModule {}
