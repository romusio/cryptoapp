package com.example.cryptoapp.service;

import com.example.cryptoapp.model.Message;
import com.example.cryptoapp.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;

@Service
@Transactional
public class MessageServiceImpl implements MessageService {

    @Autowired
    private MessageRepository messageRepository;

    private static SecretKey secretKey;

    static {
        try {
            KeyGenerator keyGen = KeyGenerator.getInstance("AES");
            keyGen.init(128);
            secretKey = keyGen.generateKey();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void sendMessage(String sender, String recipient, String content) {
        String encryptedContent = encrypt(content);
        if (encryptedContent == null) {
            throw new RuntimeException("Failed to encrypt message content");
        }
        Message message = new Message();
        message.setSender(sender);
        message.setRecipient(recipient);
        message.setEncryptedContent(encryptedContent);
        message.setTimestamp(LocalDateTime.now());
        System.out.println("Attempting to save message: " + message);
        Message savedMessage = messageRepository.save(message);
        System.out.println("Saved encrypted message: " + savedMessage);
    }

    @Override
    public String decryptMessage(String encryptedContent) {
        try {
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            byte[] decodedBytes = Base64.getDecoder().decode(encryptedContent);
            byte[] decryptedBytes = cipher.doFinal(decodedBytes);
            return new String(decryptedBytes);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public String encrypt(String content) {
        try {
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            byte[] encryptedBytes = cipher.doFinal(content.getBytes());
            return Base64.getEncoder().encodeToString(encryptedBytes);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public List<Message> getAllMessages() {
        List<Message> messages = messageRepository.findAll();
        for (Message message : messages) {
            String decryptedContent = decryptMessage(message.getEncryptedContent());
            if (decryptedContent != null) {
                message.setEncryptedContent(decryptedContent);
            } else {
                message.setEncryptedContent("Ошибка расшифровки");
            }
        }
        return messages;
    }
}