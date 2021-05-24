require('dotenv').config();
const TemperatureToken = artifacts.require("TemperatureToken");
const TemperatureOracle = artifacts.require("TemperatureOracle");
const contracts = require('../../contractAddresses.json');

module.exports = async function(callback) {

    const tempToken = await TemperatureToken.at(contracts.mainnet.TemperatureToken);
    const tempOracle = await TemperatureOracle.at(contracts.mainnet.TemperatureOracle);

    try {

        await console.log("initializing temperature oracle");

        await tempOracle.initialize(
            tempToken.address,
            contracts.oAddress,
            contracts.ipfsDocker,
            contracts.mainnet.GnosisSafe
        );

        console.log("initialized");

    } catch(error) {

        await console.log(error);

    }

    callback();
};
