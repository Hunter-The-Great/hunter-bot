const fastify = require("fastify")({ logger: false });

const start = async (client) => {
    fastify.post("/reminders", async (request) => {
        console.log(request.body);
        return "ok";
    });

    try {
        await fastify.listen({ host: "0.0.0.0", port: process.env.PORT });
        console.log("Listening on: " + process.env.PORT);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

module.exports = {
    start,
};
