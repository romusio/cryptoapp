pragma solidity ^0.8.0;

contract MessageContract {
    struct Message {
        address sender;
        string recipient;
        string encryptedContent;
        uint256 timestamp;
    }

    Message[] public messages;

    event MessageAdded(uint256 indexed messageId);

    function addMessage(string memory recipient, string memory encryptedContent) public {
        messages.push(Message({
            sender: msg.sender,
            recipient: recipient,
            encryptedContent: encryptedContent,
            timestamp: block.timestamp
        }));
        emit MessageAdded(messages.length - 1);
    }

    function getMessageCount() public view returns (uint256) {
        return messages.length;
    }

    function getMessage(uint256 index) public view returns (address, string memory, string memory, uint256) {
        Message memory message = messages[index];
        return (message.sender, message.recipient, message.encryptedContent, message.timestamp);
    }
}