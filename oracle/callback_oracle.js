/* eslint-disable no-constant-condition */
require('dotenv').config();
const { utils } = require('ethers')
const oracleHelpers = require('./callback_oracle_helpers.js');
const deployaddreses = require(String(process.env.contractadress));
const dockerHelpers = require('./docker_helper.js');
const ipfsHelper = require('./ipfs_helper.js');
const ms = require('milliseconds');

/// this program listens to contract events and sends back temperature

var deployEnv = process.argv[2];
var lastcall = Date.now();
var ipfsnode;
var transactionHashes = [];


var blocknumber = {"rinkeby":process.env.rinkebyblocknumber,
    "mainnet": process.env.mainnetblocknumbe}


const checkintervall = (milliLast,milliNow) => {
    var duration = milliNow - milliLast;
    var returnvalue = false;
    if (ms.seconds(60) < duration){
        returnvalue = true;
    }
    return returnvalue;
};


const buildimageandrun = async(ipfsnode) => {
    var denominator = 100;
    await ipfsHelper.getData(process.env.ipfsComputation, ipfsnode);
    await dockerHelpers.stopanddelete();
    var docker = await dockerHelpers.createdocker();
    var getresult = await dockerHelpers.buildandrun(docker);
    var numerator = Number(getresult) * denominator;
    return numerator;
};

const comptemp = async (tempnow,tcontract) => {
    var getnumerator = await oracleHelpers.getterTemperature(tcontract);
    var returnvalue = true;
    if (getnumerator == tempnow){
        returnvalue = false;
    }
    return returnvalue;
};

const initnode = async (pcs) => {
    const maddress = deployaddreses[deployEnv].TemperatureOracle;
    const provider = pcs.provider;

    var filter = {
        fromBlock: Number(blocknumber[deployEnv]),
        toBlock:  "latest",
        address: maddress,
        topics: [
            utils.id("CallTemp(string,uint256)")
        ]
    };

    var providerevents = await provider.getLogs(filter);
    for(var i of providerevents){
        transactionHashes.push(i.transactionHash);
    }
};


const checkifnotexist = (txhash) => {
    var returnvalue = true;
    if (transactionHashes.includes(txhash)){
        returnvalue = false;
        console.log("transaction exits in memory");
    }
    else{
        console.log("transaction not included");
    }
    return returnvalue;
};

const mainthread = async (pcs) => {

    var currentlenght = transactionHashes.length;
    var newtransactions = false;
    console.log("old length:");
    console.log(currentlenght);
    const provider = pcs.provider;
    const maddress = deployaddreses[deployEnv].TemperatureOracle;
    var blocknumber = await provider.getBlockNumber();

    var filter = {
        fromBlock: blocknumber - 3,
        toBlock:  "latest",
        address: maddress,
        topics: [
            utils.id("CallTemp(string,uint256)")
        ]
    };

    var providerevents = await provider.getLogs(filter);
    console.log("new events:")
    console.log(providerevents);
    for (var transaction of providerevents){
        if (checkifnotexist(transaction.transactionHash)){
            transactionHashes.push(transaction.transactionHash);
            newtransactions = true;
        }
    }

    console.log("new length:");
    console.log(transactionHashes.length);

    if (newtransactions){
        console.log("_______________");
        console.log("new transaction");
        console.log("_______________");
        var now = Date.now();
        if(checkintervall(lastcall,now)){
            lastcall = now;
            const numerator = await buildimageandrun(ipfsnode);
            const boolsametemp = await comptemp(numerator,pcs.contract);
            if (boolsametemp){
                await oracleHelpers.sendTemperature(numerator,pcs.signer,pcs.contract);
                console.log("send temperature");
            }else{
                console.log("same temp no sending");
            }
        }
        else{
            console.log("transaction ignored - stop spamming");
        }
    }
};

function resolveAfter(time,pcs) {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log("-----------");
            console.log(String(new Date().toString()));
            resolve(mainthread(pcs));
        },  time);
    });
}


const main = async () => {
    var pcs = await oracleHelpers.getProviderContractSigner(deployEnv);
    ipfsnode = await ipfsHelper.initializeNode();
    await initnode(pcs);
    console.log("initalized and got:");
    console.log(transactionHashes);
    while (true){
        await resolveAfter(ms.seconds(30),pcs);
    }
};

//console.log(process.env.rinkebyblocknumber)
main();
