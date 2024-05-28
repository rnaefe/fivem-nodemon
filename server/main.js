const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

var state = false;

let resourceList = {};

createResourceList();

setInterval(() => {
  if (state) {
    checkResourceChanges();
  }
}, 60000);

function createResourceList() {
  const resourceNum = GetNumResources();

  for (let i = 0; i < resourceNum; i++) {
    const resourceName = GetResourceByFindIndex(i);

    if (resourceName && GetResourceState(resourceName) === "started") {
      addResourceToList(resourceName);
    }
  }
}

function addResourceToList(resourceName) {
  const resourcePath = GetResourcePath(resourceName);
  const files = getLuaFiles(resourcePath);
  const fileHashes = {};

  files.forEach(file => {
    if (!isStreamFile(file)) {
      const fileName = path.relative(resourcePath, file);
      const fileHash = hashFile(file);
      if (fileHash) {
        fileHashes[fileName] = fileHash;
      }
    }
  });

  resourceList[resourceName] = fileHashes;
}

function getLuaFiles(directory) {
  const luaFiles = [];

  const files = fs.readdirSync(directory);
  files.forEach(file => {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      luaFiles.push(...getLuaFiles(filePath));
    } else if (path.extname(filePath) === ".lua") {
      luaFiles.push(filePath);
    }
  });

  return luaFiles;
}

function hashFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const hash = crypto.createHash("sha1").update(content).digest("hex");
    return hash;
  } catch (error) {
    console.error(`error: ${error.message}`);
    return null;
  }
}

function checkResourceChanges() {
  const currentResources = new Set();
  const resourceNum = GetNumResources();

  for (let i = 0; i < resourceNum; i++) {
    const resourceName = GetResourceByFindIndex(i);
    currentResources.add(resourceName);

    if (!resourceList[resourceName] && GetResourceState(resourceName) === "started") {
      console.log(`New resource detected: ${resourceName}`);
      addResourceToList(resourceName);
    }
  }

  for (const resourceName in resourceList) {
    if (!currentResources.has(resourceName)) {
      console.log(`Resource removed or stopped: ${resourceName}`);
      delete resourceList[resourceName];
      continue;
    }

    const resource = resourceList[resourceName];
    const currentFiles = getLuaFiles(GetResourcePath(resourceName));

    currentFiles.forEach(file => {
      if (!isStreamFile(file)) {
        const fileName = path.relative(GetResourcePath(resourceName), file);
        const fileHash = hashFile(file);

        if (fileHash && resource[fileName] !== fileHash) {
          console.log(`"resource ${resourceName}" file name "${fileName}" change detected.`);
          resource[fileName] = fileHash;
          StopResource(resourceName);
          StartResource(resourceName);
        }
      }
    });
  }
}

function isStreamFile(filePath) {
  const relativePath = path.relative(GetResourcePath(path.dirname(filePath)), filePath);
  return relativePath.startsWith("stream");
}

RegisterCommand("autorestart", function() {
  state = !state;
  console.log(`Auto-restart is now ${state ? "enabled" : "disabled"}.`);
});
