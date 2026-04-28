import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getApiInfo() {
    return {
      name: "MESO Backend",
      version: "1.0.0",
      status: "running",
      docs: "/api/docs",
      health: "/api/v1/health",
    };
  }

  getHealth() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      uptime: process.uptime(),
    };
  }
}
