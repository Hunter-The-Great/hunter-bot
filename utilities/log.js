const { Client, ContentType, ContentEncoding } = require("@axiomhq/axiom-node");
//require("isomorphic-fetch");

const axiom = new Client({
    token: process.env.AXIOM_TOKEN,
    orgId: process.env.AXIOM_ORG_ID,
});

module.exports = {
    axiom,
    ContentType,
    ContentEncoding,
};
