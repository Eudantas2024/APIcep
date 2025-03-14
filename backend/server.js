const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Address = require("../backend/model/Address");

// Carrega as variáveis de ambiente do arquivo .ENV
dotenv.config();

// Cria uma instância do Express -> Servidor
const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Permite qualquer origem para req.
  res.header("Access-Control-Allow-Methods", "GET", "POST"); // Permite apenas métodos GET e POST
  res.header("Access-Control-Allow-Headers", "Content-Type"); // Permite o cabeçalho nas req.
  next();
});

// JSON nas requisições / Config do Express
app.use(express.json());

app.get("/api/cep/:cep", async (req, res) => {
  const { cep } = req.params; // Extrai o Cep

  try {
    // Requisição GET para a API ViaCep, passando um Cep
    const response = await axios.get(`https://viacep.com.br/ws/${cep}/json`);
    res.json(response.data); // Retorna da API a resposta conforme o CEP
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar o CEP!" }); // Em caso de erro
  }
});

// Rota POST para salvar um endereço no MongoDB
app.post('/api/address', async (req, res) => {
  const { cep, logradouro, bairro, cidade, estado } = req.body; // Extrai as informações do corpo da requisição

  try {
    // Cria um novo documento de endereço usando o modelo Address
    const newAddress = new Address({ cep, logradouro, bairro, cidade, estado });
    await newAddress.save(); // Salva o novo endereço no MongoDB
    res.status(201).json({ message: 'Endereço salvo com sucesso!', data: newAddress }); // Retorna sucesso com os dados salvos
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar o endereço' }); // Retorna erro caso o salvamento falhe
  }
});

// Obtem as variaveis do .ENV
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

// Define o Link de conexão com o MongoDB Atlas
const mongoURI = `mongodb+srv://${dbUser}:${dbPassword}@clusterapi.28dvo.mongodb.net/?retryWrites=true&w=majority&appName=ClusterAPI`;

// Porta que roda o servidor
const port = 3001;

mongoose
  .connect(mongoURI) // Conecta ao banco de dados com o Link gerado
  .then(() => {
    // Quando for conexão bem sucedida
    console.log("Conectou ao Banco");
    app.listen(port, () => {
      console.log(`Servidor rodando em http://localhost:${port}`);
    });
  })
  .catch((err) => console.log("Erro ao conectar ao MongoDB", err));