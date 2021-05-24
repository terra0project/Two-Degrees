var Dockerode = require('dockerode');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

var stopanddelete = async () => {
    try {
        const {stdout,stderr} = await exec('docker rmi $(docker images -q) -f');
        console.log(`stdout: ${stdout}`);
        const {stdout1,stderr1} = await exec('docker rm $(docker ps -a -q)');
        console.log(`stdout: ${stdout1}`);
    } catch (err){
        console.error(err);
    }
};


var buildandrun = async (dockerode) => {
    let imagename = 'gettemp';
    let stream = await dockerode.buildImage({
        context: 'ipfsdownload/unziped/',
        src: ['Dockerfile', 'gettemp.py']
    }, {t: imagename});
    var returnvalue = "";
    await new Promise((resolve, reject) => {
        dockerode.modem.followProgress(stream, (err, res) => err ? reject(err) : resolve(res));
        console.log("finished build");
    });

    try {
        const {stdout} = await exec('docker run '+imagename);
        console.log(`stdout: ${stdout}`);
        returnvalue = stdout;
    } catch (err){
        console.error(err);
        returnvalue = false;
    }
    return returnvalue;
};

var createdocker = () =>{
    let dockerode = new Dockerode({socketPath: '/var/run/docker.sock'});
    return dockerode;
};

module.exports = {
    stopanddelete,
    buildandrun,
    createdocker,
};
