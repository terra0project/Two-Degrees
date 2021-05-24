/*global artifacts, web3, contract, before, it, accounts*/

const { expect } = require('chai');
const { constants, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const TemperatureOracle = artifacts.require('TemperatureOracle');
const TemperatureToken = artifacts.require('TemperatureToken');
const Metadata = artifacts.require('Metadata');
// gnosis safe
const { toWei } = web3.utils;

contract('Temperature Oracle', (accounts) => {
    let tempOracle;
    let tempToken;
    let metaData;

    before('deploy', async () => {
        metaData = await Metadata.new();
        tempOracle = await TemperatureOracle.new();
        tempToken = await TemperatureToken.new(metaData.address, tempOracle.address);
    });
    it('functions cannot be called before initialization', async () => {
        await expectRevert(
            tempOracle.setBurnableSafe(false),
            "contract not initialized"
        );
    });
    it('can be initialized', async () => {
        await tempOracle.initialize(tempToken.address, accounts[0], "QmPLewGEFfP7sL1gBC5QVHTWcie7RKBUTbLPFXEQJfw3St", accounts[9]);
        expect(await tempOracle.initialized()).to.equal(true);
    });
    it('cannot be initialized twice', async () => {
        await expectRevert(
            tempOracle.initialize(tempToken.address, accounts[0], "QmPLewGEFfP7sL1gBC5QVHTWcie7RKBUTbLPFXEQJfw3St", accounts[9]),
            "contract already initialized"
        );
    });
    it('returns burnable state variable as false on deployment: IPFS', async () => {
        expect(await tempOracle.isBurnableIPFS()).to.equal(false); //defaults to false
    });
    it('returns burnable state variable as false on deployment: Safe', async () => {
        expect(await tempOracle.isBurnableSafe()).to.equal(false); //defaults to false
    });
    it('temperatureNumerator & temperatureDenuminator are 100 on initialization', async () => {
        expect((await tempOracle.temperatureNumerator()).toString()).to.equal('100');
        expect((await tempOracle.temperatureDenuminator()).toString()).to.equal('100');
    });
    it('cannot burn tokens before checks set vars as true', async () => {
        await expectRevert(
            tempOracle.burn([0,1,2]),
            'tokens cannot be burned - temperature must be verified by ipfs script'
        );
    });
    it('only safe can change burnable boolean', async () => {
        await expectRevert(
            tempOracle.setBurnableSafe(true,{from:accounts[1]}),
            "sender not gnosis safe"
        );
    });
    it('call gettemp -> Should emit CallTemp event', async () => {
        let tx = await tempOracle.getTemperature();
        await expectEvent.inTransaction(tx.tx, tempOracle, 'CallTemp', {_ipfsDocker:"QmPLewGEFfP7sL1gBC5QVHTWcie7RKBUTbLPFXEQJfw3St"});
        let callid = await tempOracle.callid();
        expect(callid.toString()).to.equal('2');
    });
    it('_callback can only be called by o address', async () => {
        let t_numerator = 101;
        await expectRevert(
            tempOracle._callback(t_numerator,{from: accounts[5]}),
            "caller not oAddress"
        );
    });
    it('_callback -> stores the temperature', async () => {
        let t_numerator = 101;
        let tx = await tempOracle._callback(t_numerator,{from: accounts[0]});
        await expectEvent.inTransaction(tx.tx,
            tempOracle,
            'LogTemp'
        );
        await expectEvent.inTransaction(tx.tx,
            tempOracle,
            'LogTemp'
        );
        const _t_numerator = await tempOracle.temperatureNumerator();
        expect(t_numerator.toString()).to.equal(_t_numerator.toString());
    });
    it('only owner can update ipfs', async () => {
        let newIPFS = "qNPLewGEFfP7sL1gBC5QVHTWcie7RKBUTbLPFXEQJfw3St";
        await tempOracle.setIPFSDocker(newIPFS);
        expect(await tempOracle.ipfsDocker()).to.equal(newIPFS);
    });
    it('cant burn tokens unless both booleans == true', async () => {
        await tempOracle._callback(210,{from: accounts[0]});
        await tempToken.mint(accounts[3],0,constants.ZERO_BYTES32);
        await expectRevert(
            tempOracle.burn(0,{from:accounts[0]}),
            "tokens cannot be burned - temperature must be verified by safe"
        );
    });
    it('safe can set burnable boolean to true', async () => {
        await tempOracle.setBurnableSafe(true,{from:accounts[9]});
        expect(await tempOracle.canBurnGnosisSafe()).to.equal(true);
    });
    it('can burn tokens', async () => {
        await tempOracle.burn(0,{from:accounts[0]});
    });
    it('only owner can update oaddress', async () => {
        let newO = accounts[5];

        await expectRevert(
            tempOracle.setOAddress(newO,{from: accounts[5]}),
            "Ownable: caller is not the owner"
        );

        await tempOracle.setOAddress(newO);
        expect(await tempOracle.oAddress()).to.equal(newO);
    });
});
