// Dependencies
const Web3 = require('web3');
const BN = require('bn.js');

// Artifacts
const RocketNodeAPI = artifacts.require('./contract/api/RocketNodeAPI');
const RocketNodeContract = artifacts.require('./contract/nodes/RocketNodeContract');
const RocketNodeSettings = artifacts.require('./contract/settings/RocketNodeSettings');

module.exports = async (done) => {

    const accounts = await web3.eth.getAccounts();

    // Get command-line arguments (remove args from truffle)
    let args = process.argv.splice(4);

    // Validate arguments
    if (args.length != 1) done('Incorrect number of arguments. Please enter: node contract address.');
    if (!Web3.utils.isAddress(args[0])) done('Node contract address is invalid.');

    // Parse arguments
    let [nodeContract] = args;


    try {
        // Get contract dependencies
        const rocketNodeAPI = await RocketNodeAPI.deployed();
        const rocketNodeContract = await RocketNodeContract.at(nodeContract);
        const rocketNodeSettings = await RocketNodeSettings.deployed();

        // See if the group registration requires a fee?
        let gasEstimate = await rocketNodeContract.depositReserveCancel.estimateGas({
            from: accounts[0]
        })
        // Perform add group
        let result = await rocketNodeContract.depositReserveCancel({
            from: accounts[0],
            gas: gasEstimate
        });
        // Show events
        result.logs.forEach(event => {
            console.log('********************************');
            console.log('EVENT: '+event['event'], );
            console.log('********************************');
            Object.keys(event['args']).forEach(arg => {
                console.log(' - '+arg+': ', BN.isBN(event['args'][arg].valueOf()) ? new BN(event['args'][arg].valueOf(), 18).toString() : event['args'][arg].valueOf());
            });
        });;
        console.log('********************************');
        // Complete
        console.log('Gas estimate: '+gasEstimate);
        done('Node contract deposit reservation cancelled: ' + args.join(', '));
      } catch (err) {
        console.log(err.message);
      }

};

