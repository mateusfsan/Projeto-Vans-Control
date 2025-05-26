# 🚐 VansControl

**VansControl** é um sistema em desenvolvimento para gerenciamento de vans escolares. O projeto inclui controle de rotas, motoristas, alunos e acompanhamento pelos pais, além de uma futura integração com **IoT usando sensores RFID**, que permitirá identificar automaticamente quando um aluno **entra ou sai da van**.

## 📜 Descrição

O sistema conta com três tipos de usuários: **Admin**, **Motorista** e **Pais**, cada um com funcionalidades específicas. Na próxima fase, será implementada a integração com **sensores RFID**, permitindo que:
- O motorista visualize em tempo real quais alunos estão na van.
- Os pais recebam notificações quando seus filhos embarcam ou desembarcam.

## 🚀 Tecnologias Utilizadas

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT (Autenticação)
- bcryptjs (Criptografia)
- WebSocket
- CORS, dotenv

### Frontend
- HTML5, CSS3, JavaScript
- Bootstrap + Bootstrap Icons

### IoT (em desenvolvimento)
- Sensores RFID
- Microcontroladores (ESP8266, ESP32, Arduino)
- MQTT ou WebSocket

## 🔑 Funcionalidades Principais

- Login seguro com JWT (Admin, Motorista e Pais)
- Gestão de motoristas e rotas
- Acompanhamento da van em tempo real
- Notificações para pais sobre entrada/saída dos alunos (**em desenvolvimento**)
- Painel do motorista com status dos alunos (**em desenvolvimento**)


## 🔧 Requisitos para Rodar

- Node.js (v14 ou superior)
- MongoDB
- Navegador web moderno
- Dispositivo IoT (para funcionalidades RFID — opcional por enquanto)



