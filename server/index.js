const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;
const upload = multer({ dest: 'uploads/' }); // 临时存放切片的目录

// 允许所有跨域请求
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// 存储所有接收到的切片信息
let chunksInfo = {};

app.post('/upload', upload.single('file'), (req, res) => {
  const { chunkIndex, totalChunks, esign_id } = req.body;

  if (!chunksInfo[esign_id]) {
    chunksInfo[esign_id] = [];
  }

  chunksInfo[esign_id][chunkIndex] = req.file.path;

  // 如果所有切片都已上传完成，合并切片
  if (chunksInfo[esign_id].length == totalChunks) {
    const mergedDir = path.join(__dirname, 'merged_files');
    if (!fs.existsSync(mergedDir)) {
      fs.mkdirSync(mergedDir, { recursive: true });
    }
    const outputFilePath = path.join(mergedDir, `${esign_id}.pdf`);
    const writeStream = fs.createWriteStream(outputFilePath);

    for (let i = 0; i < totalChunks; i++) {
      const data = fs.readFileSync(chunksInfo[esign_id][i]);
      writeStream.write(data);
    }

    writeStream.end(() => {
      res.json({ message: 'File uploaded and merged successfully', url: `/merged_files/${esign_id}.pdf` });
      delete chunksInfo[esign_id]; // 清除缓存信息
    });
  } else {
    res.json({ message: `Chunk ${chunkIndex + 1} uploaded successfully` });
  }
});

app.use('/merged_files', express.static(path.join(__dirname, 'merged_files')));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
