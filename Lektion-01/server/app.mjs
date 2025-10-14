import cors from "cors"; // Tillåter förfrågningar fån andra domäner (Cross-Origin Recource Sharing)
import express from "express";
import fs from "fs"; // Node.js filsystem-modul för att läsa och skriva filer
import { dirname } from "path"; // Hjälper oss att få sökvägen till den aktuella mappen
import { fileURLToPath } from "url"; // Hjälper oss att få sökvägen till den aktuella filen
import { v4 as uuidv4 } from "uuid"; // Används för att skapa unika ID:n

const __filename = fileURLToPath(import.meta.url); // Hjälper oss att få sökvägen till den aktuella filen
const __dirname = dirname(__filename); // Hjälper oss att få sökvägen till den aktuella mappen

const app = express(); // Skapa Express-applikationen

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const filePath = `${__dirname}/messages.json`; // Skapa fullständign sökväg till JSON-fil
const data = fs.readFileSync(filePath, "utf-8"); // Läs fil som text

const saveMessage = (messageData) => {
  let messages = [];
  if (fs.existsSync(filePath)) {
    // Kontrollera om filen faktiskt finns
    messages = JSON.parse(data); // Konvertera JSON-text till JavaScript array
  }

  messages.push(messageData); // Lägg till det nya meddelande-objektet sist i arrayen

  // Spara tillbaka hela arrayen till filen
  // JSON.stringify() konverterar JS till JSON-text
  // null, 2 gör JSON-filen lättläst med indentering
  fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));
};

const getMessages = () => {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(data);
    }

    return [];
  } catch (error) {
    console.log("Fel vid läsning av meddelanden:", error);
    return [];
  }
};

const deleteMessage = (messageId) => {
  try {
    // Kontrollera om filen finns
    if (!fs.existsSync(filePath)) {
      return false; // Returnera false om filen inte finns
    }

    let messages = JSON.parse(data); // Konvertera till JavaScript array

    // Filtrera bort meddelandet med matchande ID
    // filter() skapar en NY array som INTE innehåller meddelandet vi vill radera
    const filteredMessages = messages.filter((msg) => msg.id !== messageId);

    // Kolla om något faktiskt raderades genom att jämföra längden på varje array
    if (messages.length === filteredMessages.length) {
      return false; // Inget meddelande med det ID:t hittades
    }

    // Spara den uppdaterade arrayen (Utan det raderade meddelandet)
    fs.writeFileSync(filePath, JSON.stringify(filteredMessages, null, 2));
    return true;
  } catch (error) {
    console.log("Fel vid radering:", error);
    return false;
  }
};

// Lägg till funktion för att updatera ett message objekt
const updateMessage = (messageId, updates) => {
  try {
    // Kontrollera om filen finns
    if (!fs.existsSync(filePath)) {
      return false;
    }

    // Hämta meddelanden från messages.json
    const currentData = fs.readFileSync(filePath, "utf-8");
    let messages = JSON.parse(currentData); // Omvandla datan i currentData till en JS-array

    // Hämta index för meddelandet som ska uppdateras
    const messageIndex = messages.findIndex((msg) => msg.id === messageId);

    if (messageIndex === -1) {
      return false;
    }

    // Uppdatera endast de fält som har skickats in, behåll resten
    messages[messageIndex] = {
      ...messages[messageIndex],
      ...updates,
      id: messageId,
      updatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));

    return true;
  } catch (error) {
    console.log("Fel vid uppdatering:", error);
    return false;
  }
};

app.post("/messages", (req, res) => {
  const { name, message } = req.body;
  console.log("hejsan", name, message);

  const id = uuidv4();

  try {
    const messageData = {
      name,
      message,
      timestamp: new Date().toISOString(),
      id,
    };

    saveMessage(messageData);

    res.status(201).json("Saved successfully");
  } catch (error) {
    console.log("Error: ", error);
    res.status(500).json("Inernal server error");
  }
});

app.get("/messages", (req, res) => {
  try {
    const messages = getMessages();

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.log("Fel vid hämtning av meddelanden:", error);

    res.status(500).json({ success: false });
  }
});

app.delete("/messages/:id", (req, res) => {
  console.log("radera meddelande");
  const messageId = req.params.id;

  console.log({ ID: messageId });

  try {
    const deleted = deleteMessage(messageId);

    if (deleted) {
      res.status(200).json({ success: true });
    } else {
      res.status(404).json({ success: false });
    }
  } catch (error) {
    console.log("Error:", error);

    res.status(500).json({ success: false });
  }
});

app.patch("/messages/:id", (req, res) => {
  // Läs ut id och meddelande och spara i två variabler
  const messageId = req.params.id;
  const updates = req.body;

  console.log("Uppdatera meddelande:", messageId, updates);

  try {
    // Anropar updateMessage och sparar svaret i en variabel
    const result = updateMessage(messageId, updates);

    if (result === true) {
      res.status(201).json({
        success: true,
      });
    } else {
      res.status(404).json({
        success: false,
      });
    }
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({
      success: false,
      error: "Serverfel",
    });
  }
});

export default app;
