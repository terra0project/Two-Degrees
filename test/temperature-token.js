/*global artifacts, web3, contract, before, it, accounts, context*/

const { expect } = require('chai');
const { constants, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const TemperatureOracle = artifacts.require('TemperatureOracle');
const TemperatureToken = artifacts.require('TemperatureToken');
const Metadata = artifacts.require('Metadata');
const { toWei } = web3.utils;

contract('Temperature Token', (accounts) => {
    let tempOracle;
    let tempToken;
    let metaData;
    let testIPFS = 'md.twodegrees.terra0.org';

    before('deploy', async () => {
        metaData = await Metadata.new();
        tempOracle = await TemperatureOracle.new();
        tempToken = await TemperatureToken.new(metaData.address, tempOracle.address);
    });
    it('can only be minted by Owner', async () => {
        await expectRevert(
            tempToken.mint(accounts[0], 0, ((constants.ZERO_BYTES32).toString()),{from:accounts[1]}),
            'Ownable: caller is not the owner'
        );
    });
    it('can be minted with data', async () => {
        let tx = await tempToken.mint(accounts[1],0, ((constants.ZERO_BYTES32).toString()));
        await expectEvent.inTransaction(tx.tx, tempToken, 'Transfer');
        let linkedIPFS = await tempToken.tokenURI(0);
        expect(linkedIPFS.toString()).to.equal(testIPFS);
    });
    it('can only be burned by oracle', async () => {
        await expectRevert(
            tempToken.burn(0),
            'caller not temperature oracle'
        );
    });
    it('returns token data', async () => {
        expect(await tempToken.tokenURI(0)).to.equal("md.twodegrees.terra0.org");
    });
    it('only owner can set a new metadata contract', async () => {
        let newMetadata = await Metadata.new();
        await expectRevert(
            tempToken.updateMetadata(newMetadata.address,{from:accounts[1]}),
            'Ownable: caller is not the owner'
        );
    });
    it('sets a new metadata contract', async () => {
        let newMetadata = await Metadata.new();
        await tempToken.updateMetadata(newMetadata.address);
        expect(await tempToken.metadata()).to.equal(newMetadata.address);
    });
    it('only owner can set a new temperature oracle contract', async () => {
        let newOracle = await TemperatureOracle.new();
        await expectRevert(
            tempToken.updateTempOracle(newOracle.address,{from:accounts[1]}),
            'Ownable: caller is not the owner'
        );
    });
    it('sets a new temperature oracle contract', async () => {
        let newOracle = await TemperatureOracle.new();
        await tempToken.updateTempOracle(newOracle.address);
        expect(await tempToken.temperatureOracle()).to.equal(newOracle.address);
    });
    it('onlyOracle can burn tokens', async () => {
        await tempToken.mint(accounts[3],1,constants.ZERO_BYTES32);
        await expectRevert(
            tempToken.burn(1,{from:accounts[2]}),
            "caller not temperature oracle"
        );
    });
});
