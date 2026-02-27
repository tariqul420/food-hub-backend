import morgan from "morgan";
import { envVars } from "./env";

const logger = envVars.isProduction ? morgan("combined") : morgan("dev");

export { logger };
