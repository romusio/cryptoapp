const Web3 = require("web3");

// Настройте подключение к Ganache
const web3 = new Web3("http://127.0.0.1:7545");

async function testConnection() {
    try {
        // Получите список аккаунтов
        const accounts = await web3.eth.getAccounts();
        console.log("Аккаунты в Ganache:", accounts);

        // Получите баланс первого аккаунта
        const balance = await web3.eth.getBalance(accounts[0]);
        console.log("Баланс первого аккаунта:", web3.utils.fromWei(balance, "ether"), "ETH");
    } catch (error) {
        console.error("Ошибка подключения к Ganache:", error);
    }
}

testConnection();