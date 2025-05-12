const MessageContract = artifacts.require("MessageContract");

module.exports = function (deployer) {
    deployer.deploy(MessageContract);
};