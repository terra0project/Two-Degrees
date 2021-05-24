const dockerHelpers = require('./docker_helper.js');
const ipfsHelper = require('./ipfs_helper.js');


async function main(){
    var denominator = 100;
    var node = await ipfsHelper.initializeNode();
    await ipfsHelper.getData(process.env.ipfsComputation, node);
    await dockerHelpers.stopanddelete();
    var docker = await dockerHelpers.createdocker();
    var getresult = await dockerHelpers.buildandrun(docker);
    var numerator = Number(getresult) * denominator;
    console.log(numerator,denominator);
}

main();
