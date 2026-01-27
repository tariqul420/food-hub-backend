import morgan from "morgan";
import { env } from "../../config/env";

const logger = env.isProduction ? morgan("combined") : morgan("dev");

export { logger };
