/**
 * Creates a directory if it doesn't exists
 * @param {Entry} rootDirEntry Root directory of the device
 * @returns {Promise<String>} Resolves with the directory path
 */
exports.createDirectory = (rootDirEntry) => {
  return new Promise((resolve, reject) => {
    rootDirEntry.getDirectory('ImageSearch', {
      create: true
    }, (dirEntry) => {
      let saveDir = dirEntry.nativeURL;
      saveDir = saveDir.replace(/^file:\/\//gi, '');
      resolve(saveDir);
    }, (err) => {
      reject(err);
    });
  });
};

/**
 * Checks for the required permissions. If it doesn't have the permissions it requests them.
 * @param {*} cordova cordova.plugins.permissions
 * @param {Array<String>} permissions A list of the permissions that are required
 */
exports.checkReqPerms = (cordova, permissions) => {
  return new Promise((resolve, reject) => {
    cordova.checkPermission(permissions, (status) => {
      if (status.hasPermission) return resolve();
      cordova.requestPermissions(permissions, (success) => {
        if (!success.hasPermission) return reject(new Error('Need the r/w permissions for external storage.'));
        resolve();
      }, (err) => {
        reject(err);
      });
    }, (err) => {
      reject(err);
    });
  });
};