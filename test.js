require('dotenv').config();
// const Web3 = require("web3");
// const web3 = new Web3();

let HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
    networks: {
        mainnet: {
            provider: () => new HDWalletProvider(process.env.KEY, process.env.PROVIDER),
            network_id: 1,       // mainnet
            gas: 2000000,
            gasPrice: 65000000000,  // check https://ethgasstation.info/
            confirmations: 2,    // # of confs to wait between deployments. (default: 0)
            timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
            skipDryRun: false     // Skip dry run before migrations? (default: false for public nets )
        },
        rinkeby: {
            provider: function() {
                return new HDWalletProvider(
                    {
                        mnemonic:process.env.Mnemonic,
                        providerOrUrl:process.env.PROVIDER,
                        chainId:4,
                    }
                );
            },
            network_id: 4,
            networkCheckTimeout: 100000000
        },
        coverage: {
            host: '127.0.0.1',
            port: 8555,
            network_id: "*",
        },
        local: {
            host: '127.0.0.1',
            port: 8545,
            network_id: "*",
        }
    },
    plugins: ["solidity-coverage"],
    compilers: {
        solc: {
            version: "^0.6.8",
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                },
            }
        }
    }
};
