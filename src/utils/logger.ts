import dayjs from "dayjs";
import pino from "pino";

const logger = pino({
    name: "lirredit_server",
    transport: {
        target: "pino-pretty"
    },
    base: {
        pid: false,
    },
    timestamp: () => `"time":"${dayjs().format()}"`
});

export default logger;