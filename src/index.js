const express = require ("express");
const axios = require ("axios");
const { createClient } = require ("redis")
const responseTime = require ("response-time")

const app = express();

app.use(responseTime());

// Conecting to redis
const client = createClient({
    host:"127.0.0.1",
    port:6379
});

async function main() {
    await client.connect();
    app.listen(3000);
    console.log("Server listen on port 3000");
};

// Get a single Pokemon
app.get("/Pokemon/:name", async (req, res, next) => {
    try {
        const reply = await client.get(req.params.name);

        if (reply) {
            console.log("using cache data");
            return res.send(JSON.parse(reply));
        };

        const response = await axios.get(
            "https://pokeapi.co/api/v2/pokemon/" + req.params.name
        );
        const saveResult = await client.set(
            req.params.name,
            JSON.stringify(response.data),
            {
                EX: 15
            }
        );

        console.log ("saved data:", saveResult);

        res.send(response.data);
        }   

        catch (error){
        console.log(error)
        res.send(error.message);
        }
    });

main();

