declare module "express-validator" {
  import { Request } from "express";

  export function validationResult(req: Request): {
    isEmpty(): boolean;
    array(): Array<{ param: string; msg: string }>;
  };

  export function body(field: string): any;
  export function param(field: string): any;
}
