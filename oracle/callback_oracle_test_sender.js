const oracleHelpers = require('./callback_oracle_helpers.js');
require('dotenv').config();

/// this programm creates a "testsender" whic sends getTemperature requests in x times
/// cliargument1 = "local" or "rinkeby" ; cliargument2 = time ; cliargument3 = true or leave it
/// example usage: node callback_oracle_test_sender.js local 12000 true

var deployEnv = process.argv[2];
var time = Number(process.argv[3]);
var withInit = process.argv[4];


function resolveAfter(_time,_oracleHelpers) {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log("-----------");
            resolve(mainthread(_oracleHelpers));
        },  time);
    })
}

async function mainthread(_oracleHelpers){
    await oracleHelpers.getTemperature(_oracleHelpers.contract);
}

async function main(){
    var pcs = await oracleHelpers.getProviderContractSigner(deployEnv);
    console.log(pcs.contract);
    if (withInit){
        await oracleHelpers.sendInit(String(process.env.ipfsComputation),pcs.signer,pcs.contract);
    }
    while (true){
        const result = await resolveAfter(time,pcs)
    }
}

main()
