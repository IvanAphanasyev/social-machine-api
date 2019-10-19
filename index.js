const koa = require("koa");
const bodyParser = require("koa-bodyparser");
const logger = require("koa-logger");
require("dotenv").config();
const api = require("./routes");
const db = require("./models");
const cors = require("@koa/cors");

const Router = require("koa-router");
const router = new Router();
router.use("/api", api.routes(), api.allowedMethods());

const corsOpt = {
  origin: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  exposedHeaders: ["x-auth-token"]
};

const app = new koa();

app
  .use(logger())
  .use(cors())
  .use(bodyParser())
  .use(router.routes());

const port = process.env.PORT || 3000;

app.on("error", (err, ctx) => {
  console.log(err);
  ctx.writable = false;
  let message = "";
  let status = err.status || 500;
  //if (!ctx || ctx.headerSend || !ctx.writable) return;
  switch (err.name) {
    case "SequelizeValidationError": {
      err.errors.forEach(element => {
        message += `${element.message}\n`;
      });
      status = 400;
    }
    default: {
      message = err.message;
    }
  }
  /*
  ctx.status = status;
  ctx.res.end(message);*/
});

db.sequelize
  .sync()
  .then(() => {
    app.listen(port, () => {
      console.log(`server listening on ${port} port, ${process.pid} pid`);
    });
  })
  .catch(console.log);