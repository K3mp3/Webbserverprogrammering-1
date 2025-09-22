import cors from "cors"; // Tillåter förfrågningar fån andra domäner (Cross-Origin Recource Sharing)
import express from "express";
import fs from "fs"; // Node.js filsystem-modul för att läsa och skriva filer
import { dirname } from "path"; // Hjälper oss att få sökvägen till den aktuella mappen
import { fileURLToPath } from "url"; // Hjälper oss att få sökvägen till den aktuella filen

const __filename = fileURLToPath(import.meta.url); // Hjälper oss att få sökvägen till den aktuella filen
const __dirname = dirname(__filename); // Hjälper oss att få sökvägen till den aktuella mappen

const app = express(); // Skapa Express-applikationen

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const saveMessage = (messageData) => {
  const filePath = `${__dirname}/messages.json`; // Skapa fullständign sökväg till JSON-fil

  let messages = [];
  if (fs.existsSync(filePath)) {
    // Kontrollera om filen faktiskt finns
    const data = fs.readFileSync(filePath, "utf-8"); // Läs fil som text
    messages = JSON.parse(data); // Konvertera JSON-text till JavaScript array
  }

  messages.push(messageData); // Lägg till det nya meddelande-objektet sist i arrayen

  // Spara tillbaka hela arrayen till filen
  // JSON.stringify() konverterar JS till JSON-text
  // null, 2 gör JSON-filen lättläst med indentering
  fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));
};

const getMessages = () => {
  const filePath = `${__dirname}/messages.json`;

  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }

    return [];
  } catch (error) {
    console.log("Fel vid läsning av meddelanden:", error);
    return [];
  }
};

app.post("/messages", (req, res) => {
  const { name, message } = req.body;
  console.log("hejsan", name, message);

  try {
    const messageData = {
      name,
      message,
      timestamp: new Date().toISOString(),
    };

    saveMessage(messageData);

    res.status(201).json("Saved successfully");
  } catch (error) {
    console.log("Error: ", error);
    res.status(500).json("Inernal server error");
  }
});

app.get("/messages", (req, res) => {
  console.log("Hämta meddelanden");

  try {
    const messages = getMessages();
    console.log("Messages", messages);
  } catch (error) {}
});

export default app;
