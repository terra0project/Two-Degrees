require('dotenv').config();
const TemperatureToken = artifacts.require("TemperatureToken");
const contracts = require('../../contractAddresses.json');

module.exports = async function(callback) {

    const tempToken = await TemperatureToken.at(contracts.mainnet.TemperatureToken);

    try {

        await console.log("minting test token");

        await tempToken.mint(contracts.mainnet.GnosisSafe, 0, ('0x'));

        console.log("minted");

    } catch(error) {

        await console.log(error);

    }

    callback();
};
