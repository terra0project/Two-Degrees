require('dotenv').config();
const TemperatureToken = artifacts.require("TemperatureToken");
const contracts = require('../../contractAddresses.json');

module.exports = async function(callback) {

    const tempToken = await TemperatureToken.at(contracts.rinkeby.TemperatureToken);

    try {

        await console.log("minting test token");

        await tempToken.mint(process.env.DUMMYSAFE, 1, ('0x'));

        console.log("minted");

    } catch(error) {

        await console.log(error);

    }

    callback();
};
