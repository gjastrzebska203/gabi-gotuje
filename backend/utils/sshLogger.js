const fs = require("fs");
const path = require("path");
const Client = require("ssh2").Client;
const SftpClient = require("ssh2-sftp-client");

const sshConfig = {
  host: "sigma.ug.edu.pl",
  port: 22,
  username: "gjastrzebska",
  privateKey: fs.readFileSync("/home/gjastrzebska/.ssh/id_rsa"),
  passphrase: "gabi1410",
};

// przesyłanie logów przez SFTP
async function uploadLogFile(localFilePath, remoteFilePath) {
  const sftp = new SftpClient();

  try {
    await sftp.connect(sshConfig);
    await sftp.put(localFilePath, remoteFilePath);
    console.log(`Log przesłany do: ${remoteFilePath}`);
  } catch (err) {
    console.error("Błąd przesyłania logu:", err);
  } finally {
    await sftp.end();
  }
}

// wykonywanie komendy na zdalnym serwerze
function executeRemoteCommand(command) {
  return new Promise((resolve, reject) => {
    const conn = new Client();

    conn
      .on("ready", () => {
        conn.exec(command, (err, stream) => {
          if (err) return reject(err);

          let output = "";
          stream
            .on("data", (data) => (output += data.toString()))
            .on("close", () => {
              conn.end();
              resolve(output);
            });
        });
      })
      .connect(sshConfig);
  });
}

// zapisywanie logów lokalnie i przesyłanie ich na serwer
async function logMessage(message) {
  const logDir = path.join(__dirname, "../logs");
  const localLogFile = path.join(logDir, "app.log");
  const remoteLogFile1 = "/home/gjastrzebska/sem3/logs/app1.log";
  const remoteLogFile2 = "/home/gjastrzebska/sem3/logs/app2.log";

  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

  const logEntry = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(localLogFile, logEntry);

  console.log("Log zapisany lokalnie:", logEntry.trim());

  await uploadLogFile(localLogFile, remoteLogFile1);
  await executeRemoteCommand(`echo '${logEntry.trim()}' >> ${remoteLogFile2}`);
}

module.exports = { logMessage };
