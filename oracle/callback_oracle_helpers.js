require('dotenv').config();
const { Contract, Wallet, providers, BigNumber, } = require('ethers')
const deployaddreses = require(String(process.env.contractadress));
const abi = require(String(process.env.contractpath));

var deployEnv = process.argv[2];

async function getProviderContractSigner(deployEnv){

    const provider = {
        "local": function(){
            const url = "http://localhost:8545";
            const newprovider = new providers.JsonRpcProvider(url);
            return newprovider;
        },
        "rinkeby": function(){
            const newprovider = new providers.AlchemyProvider(4, process.env.alchemyurlrinkeby);
            return newprovider;
        },
        "mainnet": function(){
            const newprovider = new providers.AlchemyProvider(1, process.env.alchemyurlmainnet);
            return newprovider;
        }
    };

    const signer = {
        "local": async function(_provider){
            var _signer = await _provider.getSigner(0);
            return _signer;
        },
        "rinkeby": function(_provider){
            var newwallet =   new Wallet(process.env.oaddress);
            var wallet = newwallet.connect(_provider);
            return wallet;
        },
        "mainnet": function(_provider){
            var newwallet =  new Wallet(process.env.oaddress);
            var wallet = newwallet.connect(_provider);
            return wallet;
        }
    };

    const contractabi = abi.abi;
    const new_provider = provider[deployEnv]();
    const new_signer = await signer[deployEnv](new_provider);
    const new_contract = new Contract(deployaddreses[deployEnv].TemperatureOracle,
        contractabi,
        new_signer);

    return {
        provider: new_provider,
        contract: new_contract,
        signer: new_signer,
    };
}

async function sendTemperature(numerator,signer,contract){
    let tx = await contract._callback(numerator);
    await tx.wait();
    console.log("transaction send");
}

async function sendInit(
    ipfsDocker,
    signer,
    contract){
    var tempToken = deployaddreses[deployEnv].TemperatureToken;
    let oaddress = await signer.getAddress();
    // console.log(deployaddreses[deployEnv].TemperatureToken)
    // console.log(oaddress)
    // console.log(ipfsDocker)
    let tx = await contract.initialize(String(tempToken),String(oaddress),String(ipfsDocker),String(deployaddreses["mainnet"].GnosisSafe));
    await tx.wait();
    console.log("transaction send");
}

async function getterTemperature(contract){
    var temp1 = await contract.functions.temperatureNumerator();
    var asbignumber = BigNumber.from(temp1[0]).toNumber();
    return asbignumber;
}


async function gettercallid(contract){
    var callid = await contract.functions.callid();
    var asbignumber = BigNumber.from(callid[0]).toNumber();
    return asbignumber;
}

async function getTemperature(contract){
    let tx = await contract.functions.getTemperature();
    await tx.wait();
    console.log("transaction send");
}


module.exports = {
    getProviderContractSigner,
    sendTemperature,
    sendInit,
    getterTemperature,
    gettercallid,
    getTemperature
};
