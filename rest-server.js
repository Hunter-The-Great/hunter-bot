const fastify = require("fastify")({ logger: false });

// Declare a route

// Run the server!
const start = async (client) => {
    fastify.post("/reminders", async (request, reply) => {
        console.log(request.body);
        return { hello: "world" };
    });

    try {
        await fastify.listen({ port: 3000 });
        console.log("Listening on port 3000.");
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

module.exports = {
    start,
};
