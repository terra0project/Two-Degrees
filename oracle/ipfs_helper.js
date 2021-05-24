require('dotenv').config();
const IPFS = require('ipfs-core');
const fs = require('fs');
var AdmZip = require("adm-zip");


async function initializeNode(){
    const ipfs = await IPFS.create();
    return ipfs;
}

function zipfiles(){
    var path = './ipfsupload/archive.zip';
    zip.addLocalFile('./computation-archive/Dockerfile');
    zip.addLocalFile('./computation-archive/gettemp.py');
    var willSendthis = zip.toBuffer();
    zip.writeZip(path);
    return willSendthis;
}

async function upload(file,ipfsnode){  ///this creates the node
    const { cid } = await ipfsnode.add(file);
    console.info(cid);
    return cid;
}

function writeIpfstoenv(ipfs){
    console.log("legacy function");
}

async function main(){
    var node = await initializeNode();
    await getData(process.env.ipfsComputation, node)
}

const getData = async (ipfshash, ipfsnode) => {
    const stream = ipfsnode.cat(ipfshash);

    var data = [];

    for await (const chunk of stream) {
        data.push(chunk);
    }
    var pathdownload = './ipfsdownload/archive.zip';

    fs.writeFile(pathdownload, Buffer.concat(data), (err) => {
    // throws an error, you could also catch it here
        if (err) throw err;
        // success case, the file was saved
        console.log('zip saved!');
        var zip = new AdmZip(pathdownload);
        zip.extractAllTo('./ipfsdownload/unziped/',true);
        console.log("Extracted ZIP");
    });
};


module.exports = {
    getData,
    initializeNode,
};
