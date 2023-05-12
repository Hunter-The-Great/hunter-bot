const fastify = require("fastify")({ logger: false });

// Declare a route

// Run the server!
const start = async (client) => {
    fastify.post("/reminders", async (request, reply) => {
        console.log(request.body);
        return { hello: "world" };
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
