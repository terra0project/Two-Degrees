const TemperatureToken = artifacts.require('TemperatureToken');
const TemperatureOracle = artifacts.require('TemperatureOracle');
const Metadata = artifacts.require('Metadata');

const contracts = require('../contractAddresses.json');
const fs = require("fs");

module.exports = async function (deployer, network) {
    const { toWei } = web3.utils;

    if (network === 'mainnet') {

        await deployer.deploy(Metadata);
        await deployer.deploy(TemperatureOracle);
        await deployer.deploy(TemperatureToken, Metadata.address, TemperatureOracle.address);

        contracts.mainnet.Metadata = Metadata.address;
        contracts.mainnet.TemperatureToken = TemperatureToken.address;
        contracts.mainnet.TemperatureOracle = TemperatureOracle.address;

        fs.writeFile('./contractAddresses.json', JSON.stringify(contracts), (err) => {
            if (err) throw err;
        });

    } else if (network === 'rinkeby') {

        await deployer.deploy(Metadata);
        await deployer.deploy(TemperatureOracle);
        await deployer.deploy(TemperatureToken, Metadata.address, TemperatureOracle.address);

        contracts.rinkeby.Metadata = Metadata.address;
        contracts.rinkeby.TemperatureToken = TemperatureToken.address;
        contracts.rinkeby.TemperatureOracle = TemperatureOracle.address;

        fs.writeFile('./contractAddresses.json', JSON.stringify(contracts), (err) => {
            if (err) throw err;
        });

    } else if (network === 'local') {

        await deployer.deploy(Metadata);
        await deployer.deploy(TemperatureOracle);
        await deployer.deploy(TemperatureToken, Metadata.address, TemperatureOracle.address);

        contracts.local.Metadata = Metadata.address;
        contracts.local.TemperatureToken = TemperatureToken.address;
        contracts.local.TemperatureOracle = TemperatureOracle.address;

        fs.writeFile('./contractAddresses.json', JSON.stringify(contracts), (err) => {
            if (err) throw err;
        });
    }
};
