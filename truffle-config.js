module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "5777" // Подключение к любому network_id (5777 для Ganache)
    }
  },
  compilers: {
    solc: {
      version: "0.8.0" // Версия компилятора Solidity
    }
  }
};