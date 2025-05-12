package com.example.cryptoapp.service;

import com.example.cryptoapp.model.Message;
import java.util.List;

public interface MessageService {
    void sendMessage(String sender, String recipient, String content);
    String decryptMessage(String encryptedContent);
    String encrypt(String content);
    List<Message> getAllMessages(); // Добавляем метод
}