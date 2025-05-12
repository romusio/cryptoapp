console.log('app.js loaded');

const contractABI = fetch('/cryptoapp/static/contractABI.json')
    .then(res => res.json());

const web3 = new Web3('http://127.0.0.1:7545');
contractABI.then(abi => {
    const contractAddress = "0x9E161729a6f731f23f638910ab0359047c485e10"; // Замени на свой адрес
    const contract = new web3.eth.Contract(abi, contractAddress);

    async function sendMessageToContract(recipient, messageContent) {
        try {
            const accounts = await web3.eth.getAccounts();
            const sender = accounts[0];

            const response = await fetch('/cryptoapp/api/messages/encrypt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: messageContent })
            });
            if (!response.ok) {
                throw new Error(`Encryption failed: ${await response.text()}`);
            }
            const encryptedContent = await response.text();

            await contract.methods.addMessage(recipient, encryptedContent).send({
                from: sender,
                gas: '1000000'
            });
            console.log('Message sent to contract:', { sender, recipient, encryptedContent });
            return true;
        } catch (error) {
            console.error('Error sending message to contract:', error);
            return false;
        }
    }

    async function getMessagesFromContract() {
        try {
            const count = await contract.methods.getMessageCount().call();
            const messages = [];

            for (let i = 0; i < count; i++) {
                const message = await contract.methods.getMessage(i).call();
                messages.push({
                    sender: message[0],
                    recipient: message[1],
                    encryptedContent: message[2],
                    timestamp: message[3]
                });
            }
            return messages;
        } catch (error) {
            console.error('Error fetching messages from contract:', error);
            return [];
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const themeButton = document.getElementById('themeToggle');
        if (themeButton) {
            console.log('Theme button found');
            themeButton.addEventListener('click', () => {
                console.log('Theme toggle clicked');
                const isDarkTheme = document.body.classList.toggle('dark-theme');
                themeButton.textContent = isDarkTheme ? 'Светлая тема' : 'Темная тема';
                themeButton.classList.add('animate__pulse');
                setTimeout(() => themeButton.classList.remove('animate__pulse'), 500);
            });
        } else {
            console.error('Theme button not found in DOM');
        }

        const sendMessageForm = document.getElementById('sendMessageForm');
        if (sendMessageForm) {
            sendMessageForm.addEventListener('submit', async (event) => {
                event.preventDefault();

                const sender = document.getElementById('sender').value;
                const recipient = document.getElementById('recipient').value;
                const message = document.getElementById('message').value;

                const button = document.querySelector('#sendMessageForm button');
                button.classList.add('animate__shakeX');
                setTimeout(() => button.classList.remove('animate__shakeX'), 500);

                const contractSuccess = await sendMessageToContract(recipient, message);
                if (!contractSuccess) {
                    alert('Ошибка при отправке сообщения в блокчейн');
                    return;
                }

                const headers = { 'Content-Type': 'application/json' };
                console.log('Sending message to server:', { sender, recipient, message });

                try {
                    const response = await fetch('/cryptoapp/api/messages/send', {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify({ sender, recipient, message })
                    });

                    if (response.ok) {
                        console.log('Server response:', await response.text());
                        alert('Сообщение отправлено!');
                        document.getElementById('sendMessageForm').reset();

                        const messages = await getMessagesFromContract();
                        console.log('Messages from contract:', messages);
                    } else {
                        console.error('Response status:', response.status);
                        const errorText = await response.text();
                        console.error('Response text:', errorText);
                        alert(`Ошибка при отправке сообщения на сервер: ${errorText}`);
                    }
                } catch (error) {
                    console.error('Fetch error:', error);
                    alert('Ошибка при отправке сообщения на сервер');
                }
            });
        }

        const viewMessagesButton = document.getElementById('viewMessagesButton');
        const messagesContainer = document.getElementById('messagesContainer');
        if (viewMessagesButton && messagesContainer) {
            viewMessagesButton.addEventListener('click', async () => {
                try {
                    const response = await fetch('/cryptoapp/api/messages/all', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    if (response.ok) {
                        const messages = await response.json();
                        messagesContainer.innerHTML = '';
                        messages.forEach(msg => {
                            const messageElement = document.createElement('div');
                            messageElement.className = 'message';
                            messageElement.innerHTML = `
                                <strong>Отправитель:</strong> ${msg.sender}<br>
                                <strong>Получатель:</strong> ${msg.recipient}<br>
                                <strong>Сообщение:</strong> ${msg.encryptedContent}<br>
                                <strong>Время:</strong> ${new Date(msg.timestamp).toLocaleString()}<br>
                            `;
                            messagesContainer.appendChild(messageElement);
                        });
                    } else {
                        messagesContainer.innerHTML = '<p>Ошибка при загрузке сообщений</p>';
                    }
                } catch (error) {
                    console.error('Error fetching messages:', error);
                    messagesContainer.innerHTML = '<p>Ошибка при загрузке сообщений</p>';
                }
            });
        } else {
            console.error('View messages button or container not found');
        }

        const viewBlockchainMessagesButton = document.getElementById('viewBlockchainMessagesButton');
        if (viewBlockchainMessagesButton && messagesContainer) {
            viewBlockchainMessagesButton.addEventListener('click', async () => {
                try {
                    const messages = await getMessagesFromContract();
                    messagesContainer.innerHTML = '';
                    for (const msg of messages) {
                        const response = await fetch('/cryptoapp/api/messages/decrypt', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ encryptedContent: msg.encryptedContent })
                        });
                        const decryptedContent = await response.text();
                        const messageElement = document.createElement('div');
                        messageElement.className = 'message';
                        messageElement.innerHTML = `
                            <strong>Отправитель (адрес):</strong> ${msg.sender}<br>
                            <strong>Получатель:</strong> ${msg.recipient}<br>
                            <strong>Сообщение:</strong> ${decryptedContent}<br>
                            <strong>Время:</strong> ${new Date(msg.timestamp * 1000).toLocaleString()}<br>
                        `;
                        messagesContainer.appendChild(messageElement);
                    }
                } catch (error) {
                    console.error('Error fetching blockchain messages:', error);
                    messagesContainer.innerHTML = '<p>Ошибка при загрузке сообщений из блокчейна</p>';
                }
            });
        } else {
            console.error('View blockchain messages button or container not found');
        }
    });
});
const themeButton = document.getElementById('themeToggle');
if (themeButton) {
    console.log('Theme button found');
    themeButton.addEventListener('click', () => {
        console.log('Theme toggle clicked');
        const isDarkTheme = document.body.classList.toggle('dark-theme');
        themeButton.textContent = isDarkTheme ? 'Светлая тема' : 'Темная тема';
        themeButton.classList.add('animate__pulse');
        setTimeout(() => themeButton.classList.remove('animate__pulse'), 500);
    });
} else {
    console.log('Theme button not found');
}