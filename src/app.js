const tabris = require('tabris');
const utils = require('./utils.js');

let image = '';
let imgUrl = '';
const corPerms = cordova.plugins.permissions;
const permissions = [
  corPerms.READ_EXTERNAL_STORAGE,
  corPerms.WRITE_EXTERNAL_STORAGE,
  corPerms.INTERNET
];

tabris.ui.contentView.background = '#303030';
tabris.ui.statusBar.background = '#181818';

let activityIndicator = new tabris.ActivityIndicator({
  centerX: 0,
  centerY: 0,
  visible: false,
  tintColor: '#6479A5'
}).appendTo(tabris.ui.contentView);

let textInput = new tabris.TextInput({
  message: 'Fill in a search term to search',
  enterKeyType: 'done',
  centerX: 0,
  top: 5,
  background: '#5C5C5C',
  textColor: '#868686',
  fillColor: '#868686',
  borderColor: '#868686'
}).appendTo(tabris.ui.contentView);

let searchButton = new tabris.Button({
  centerX: -40,
  top: [textInput, 5],
  text: 'Search',
  background: '#6479A5'
}).appendTo(tabris.ui.contentView);

let saveButton = new tabris.Button({
  left: [searchButton, 1],
  top: [textInput, 5],
  text: 'Save',
  enabled: false,
  background: '#6479A5'
}).appendTo(tabris.ui.contentView);

let imageView = new tabris.ImageView({
  centerX: 0,
  centerY: 0,
  scaleMode: 'fit',
  width: tabris.device.screenWidth,
  height: 400
}).appendTo(tabris.ui.contentView);

let copyrightTextView = new tabris.TextView({
  centerX: 0,
  bottom: -1,
  width: 300,
  height: 20,
  alignment: 'center',
  text: '\u00A9 Pepijn - (Kurozero)',
  textColor: '#5C5C5C'
}).appendTo(tabris.ui.contentView);

let nextButton = new tabris.Button({
  centerX: 0,
  bottom: [copyrightTextView, 35],
  text: 'Next',
  enabled: false,
  background: '#6479A5'
}).appendTo(tabris.ui.contentView);

let nsfwCheckBox = new tabris.CheckBox({
  left: 25,
  right: [nextButton, 25],
  bottom: [copyrightTextView, 42],
  text: 'Explicit Content',
  checkedTintColor: '#6479A5',
  tintColor: '#6479A5',
  textColor: '#5C5C5C'
}).appendTo(tabris.ui.contentView);

let postCreation = new tabris.TextView({
  centerX: 0,
  width: tabris.device.screenWidth,
  alignment: 'center',
  bottom: [nsfwCheckBox, 15],
  textColor: '#6479A5',
  text: 'Link to the post: \n',
  enabled: false
}).appendTo(tabris.ui.contentView);

let webView = new tabris.WebView({
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  visible: false,
  enabled: false
}).appendTo(tabris.ui.contentView);

function getImage(searchTerm) {
  return new Promise((resolve, reject) => {
    fetch('http://konachan.net/post.json?tags=' + searchTerm + '+order:random&limit=1')
      .then(res => res.json())
      .then(json => {
        if (!json[0]) return reject(new Error('No image was found for: ' + searchTerm));
        activityIndicator.visible = true;
        saveButton.enabled = false;
        nextButton.enabled = false;
        imageView.enabled = false;
        postCreation.enabled = false;
        switch (json[0].rating) {
          case 's':
            postCreation.text = 'Link to the post: \nhttp://konachan.net/post/show/' + json[0].id;
            image = json[0].id + '.jpg';
            imgUrl = 'http:' + json[0].jpeg_url;
            imageView.image = 'http:' + json[0].jpeg_url;
            resolve();
            break;
          case 'q':
            getImage(searchTerm)
              .catch(err => console.error(err));
            resolve();
            break;
          case 'e':
            getImage(searchTerm)
              .catch(err => console.error(err));
            resolve();
        }
      }).catch(err => reject(err));
  });
}

utils.checkReqPerms(corPerms, permissions)
  .then(() => {
    textInput.on('accept', () => {
      if (nsfwCheckBox.checked === false) {
        if (textInput.text.includes('rating:e')) return console.error('To search for explicit content click the checkbox');
        fetch('http://konachan.net/post.json?tags=' + textInput.text + '+order:random&limit=1')
          .then(res => res.json())
          .then(json => {
            if (!json[0]) return console.error('No image was found for: ' + textInput.text);
            activityIndicator.visible = true;
            saveButton.enabled = false;
            nextButton.enabled = false;
            imageView.enabled = false;
            postCreation.enabled = false;
            switch (json[0].rating) {
              case 's':
                postCreation.text = 'Link to the post: \nhttp://konachan.net/post/show/' + json[0].id;
                image = json[0].id + '.jpg';
                imgUrl = 'http:' + json[0].jpeg_url;
                imageView.image = 'http:' + json[0].jpeg_url;
                break;
              case 'q':
                getImage(textInput.text)
                  .catch(err => console.error(err));
                break;
              case 'e':
                getImage(textInput.text)
                  .catch(err => console.error(err));
            }
          }).catch(err => console.error(err));
      } else if (nsfwCheckBox.checked === true) {
        nextButton.enabled = false;
        saveButton.enabled = false;
        imageView.enabled = false;
        postCreation.enabled = false;
        fetch('http://konachan.net/post.json?tags=' + textInput.text + '+order:random&limit=1')
          .then(res => res.json())
          .then(json => {
            if (!json[0]) return console.error('No image was found for: ' + textInput.text);
            activityIndicator.visible = true;
            postCreation.text = 'Link to the post: \nhttp://konachan.net/post/show/' + json[0].id;
            image = json[0].id + '.jpg';
            imgUrl = 'http:' + json[0].jpeg_url;
            imageView.image = 'http:' + json[0].jpeg_url;
          }).catch(err => console.error(err));
      }
      searchButton.enabled = false;
    });

    textInput.on('textChanged', () => {
      searchButton.enabled = true;
    });

    searchButton.on('select', () => {
      if (nsfwCheckBox.checked === false) {
        if (textInput.text.includes('rating:e')) return console.error('To search for explicit content click the checkbox');
        fetch('http://konachan.net/post.json?tags=' + textInput.text + '+order:random&limit=1')
          .then(res => res.json())
          .then(json => {
            if (!json[0]) return console.error('No image was found for: ' + textInput.text);
            activityIndicator.visible = true;
            saveButton.enabled = false;
            nextButton.enabled = false;
            imageView.enabled = false;
            postCreation.enabled = false;
            switch (json[0].rating) {
              case 's':
                postCreation.text = 'Link to the post: \nhttp://konachan.net/post/show/' + json[0].id;
                image = json[0].id + '.jpg';
                imgUrl = 'http:' + json[0].jpeg_url;
                imageView.image = 'http:' + json[0].jpeg_url;
                break;
              case 'q':
                getImage(textInput.text)
                  .catch(err => console.error(err));
                break;
              case 'e':
                getImage(textInput.text)
                  .catch(err => console.error(err));
            }
          }).catch(err => console.error(err));
      } else if (nsfwCheckBox.checked === true) {
        nextButton.enabled = false;
        saveButton.enabled = false;
        imageView.enabled = false;
        postCreation.enabled = false;
        fetch('http://konachan.net/post.json?tags=' + textInput.text + '+order:random&limit=1')
          .then(res => res.json())
          .then(json => {
            if (!json[0]) return console.error('No image was found for: ' + textInput.text);
            activityIndicator.visible = true;
            postCreation.text = 'Link to the post: \nhttp://konachan.net/post/show/' + json[0].id;
            image = json[0].id + '.jpg';
            imgUrl = 'http:' + json[0].jpeg_url;
            imageView.image = 'http:' + json[0].jpeg_url;
          }).catch(err => console.error(err));
      }
      searchButton.enabled = false;
    });

    nextButton.on('select', () => {
      if (nsfwCheckBox.checked === false) {
        if (textInput.text.includes('rating:e')) return console.error('To search for explicit content click the checkbox');
        fetch('http://konachan.net/post.json?tags=' + textInput.text + '+order:random&limit=1')
          .then(res => res.json())
          .then(json => {
            if (!json[0]) return console.error('No image was found for: ' + textInput.text);
            activityIndicator.visible = true;
            saveButton.enabled = false;
            nextButton.enabled = false;
            imageView.enabled = false;
            postCreation.enabled = false;
            switch (json[0].rating) {
              case 's':
                postCreation.text = 'Link to the post: \nhttp://konachan.net/post/show/' + json[0].id;
                image = json[0].id + '.jpg';
                imgUrl = 'http:' + json[0].jpeg_url;
                imageView.image = 'http:' + json[0].jpeg_url;
                break;
              case 'q':
                getImage(textInput.text)
                  .catch(err => console.error(err));
                break;
              case 'e':
                getImage(textInput.text)
                  .catch(err => console.error(err));
            }
          }).catch(err => console.error(err));
      } else if (nsfwCheckBox.checked === true) {
        nextButton.enabled = false;
        saveButton.enabled = false;
        imageView.enabled = false;
        postCreation.enabled = false;
        fetch('http://konachan.net/post.json?tags=' + textInput.text + '+order:random&limit=1')
          .then(res => res.json())
          .then(json => {
            if (!json[0]) return console.error('No image was found for: ' + textInput.text);
            activityIndicator.visible = true;
            postCreation.text = 'Link to the post: \nhttp://konachan.net/post/show/' + json[0].id;
            image = json[0].id + '.jpg';
            imgUrl = 'http:' + json[0].jpeg_url;
            imageView.image = 'http:' + json[0].jpeg_url;
          }).catch(err => console.error(err));
      }
    });

    imageView.on('swipeLeft', () => {
      if (nsfwCheckBox.checked === false) {
        if (textInput.text.includes('rating:e')) return console.error('To search for explicit content click the checkbox');
        fetch('http://konachan.net/post.json?tags=' + textInput.text + '+order:random&limit=1')
          .then(res => res.json())
          .then(json => {
            if (!json[0]) return console.error('No image was found for: ' + textInput.text);
            activityIndicator.visible = true;
            saveButton.enabled = false;
            nextButton.enabled = false;
            imageView.enabled = false;
            postCreation.enabled = false;
            switch (json[0].rating) {
              case 's':
                postCreation.text = 'Link to the post: \nhttp://konachan.net/post/show/' + json[0].id;
                image = json[0].id + '.jpg';
                imgUrl = 'http:' + json[0].jpeg_url;
                imageView.image = 'http:' + json[0].jpeg_url;
                break;
              case 'q':
                getImage(textInput.text)
                  .catch(err => console.error(err));
                break;
              case 'e':
                getImage(textInput.text)
                  .catch(err => console.error(err));
            }
          }).catch(err => console.error(err));
      } else if (nsfwCheckBox.checked === true) {
        nextButton.enabled = false;
        saveButton.enabled = false;
        imageView.enabled = false;
        postCreation.enabled = false;
        fetch('http://konachan.net/post.json?tags=' + textInput.text + '+order:random&limit=1')
          .then(res => res.json())
          .then(json => {
            if (!json[0]) return console.error('No image was found for: ' + textInput.text);
            activityIndicator.visible = true;
            postCreation.text = 'Link to the post: \nhttp://konachan.net/post/show/' + json[0].id;
            image = json[0].id + '.jpg';
            imgUrl = 'http:' + json[0].jpeg_url;
            imageView.image = 'http:' + json[0].jpeg_url;
          }).catch(err => console.error(err));
      }
    });

    saveButton.on('select', () => {
      utils.checkReqPerms(corPerms, permissions)
        .then(() => {
          window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, (dirEntry) => {
            utils.createDirectory(dirEntry).then(dir => {
              fetch(imgUrl)
                .then(res => res.arrayBuffer())
                .then(buff => {
                  tabris.fs.writeFile(dir + image, buff)
                    .then(() => console.error('Saved image to: ' + dir + image))
                    .catch(err => console.error(err));
                }).catch(err => console.error(err));
            }).catch(err => {
              console.error(err);
            });
          }, (err) => {
            console.error(err);
          });
        }).catch(err => console.error(err));
    });
    let touchStartTime;
    imageView.on('touchStart', ({
                                  timeStamp: tsStart
                                }) => {
      touchStartTime = tsStart;
    });
    imageView.on('touchEnd', ({
                                timeStamp: tsEnd
                              }) => {
      const diff = tsEnd - touchStartTime;
      if (diff >= 1000) {
        new tabris.ActionSheet({
          actions: [{
            title: 'Download Image'
          },
            {
              title: 'Cancel',
              style: 'cancel'
            }
          ]
        }).on({
          select: ({
                     target: actionSheet,
                     index
                   }) => {
            if (actionSheet.actions[index].title === 'Download Image') {
              utils.checkReqPerms(corPerms, permissions)
                .then(() => {
                  window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, (dirEntry) => {
                    utils.createDirectory(dirEntry).then(dir => {
                      fetch(imgUrl)
                        .then(res => res.arrayBuffer())
                        .then(buff => {
                          tabris.fs.writeFile(dir + image, buff)
                            .then(() => console.error('Saved image to: ' + dir + image))
                            .catch(err => console.error(err));
                        }).catch(err => console.error(err));
                    }).catch(err => {
                      console.error(err);
                    });
                  }, (err) => {
                    console.error(err);
                  });
                }).catch(err => console.error(err));
            } else if (actionSheet.actions[index].title === 'Cancel') {
              actionSheet.close();
            }
          }
        }).open();
      }
    });

    imageView.on('load', () => {
      activityIndicator.visible = false;
      nextButton.enabled = true;
      saveButton.enabled = true;
      imageView.enabled = true;
      postCreation.enabled = true;
    });

    nsfwCheckBox.on('checkedChanged', () => {
      if (nsfwCheckBox.checked === false) {
        // Back to safe content only
      } else if (nsfwCheckBox.checked === true) {
        new tabris.AlertDialog({
          title: 'Enable Explicit Content',
          message: 'Are you sure you want to enable explicit content?',
          buttons: {
            ok: 'Yes',
            cancel: 'No'
          }
        }).on({
          closeOk: () => {
            // nsfwCheckBox.checked = true;
          },
          closeCancel: () => {
            nsfwCheckBox.checked = false;
          }
        }).open();
      }
    });

    postCreation.on('tap', () => {
      textInput.enabled = false;
      textInput.visible = false;
      searchButton.enabled = false;
      searchButton.visible = false;
      saveButton.enabled = false;
      saveButton.visible = false;
      imageView.enabled = false;
      imageView.visible = false;
      postCreation.enabled = false;
      postCreation.visible = false;
      nsfwCheckBox.enabled = false;
      nsfwCheckBox.visible = false;
      nextButton.enabled = false;
      nextButton.visible = false;
      const url = postCreation.text.replace(/^Link to the post: /i, '');
      webView.url = url;
      webView.visible = true;
      webView.enabled = true;
    });

    tabris.app.on('backNavigation', (event) => {
      if (webView.visible === true && webView.canGoBack === true) {
        webView.goBack();
      } else if (webView.visible === true && webView.canGoBack === false) {
        webView.visible = false;
        webView.enabled = false;
        event.preventDefault();
        textInput.enabled = true;
        textInput.visible = true;
        searchButton.visible = true;
        saveButton.enabled = true;
        saveButton.visible = true;
        imageView.enabled = true;
        imageView.visible = true;
        postCreation.enabled = true;
        postCreation.visible = true;
        nsfwCheckBox.enabled = true;
        nsfwCheckBox.visible = true;
        nextButton.enabled = true;
        nextButton.visible = true;
      }
    });
  }).catch(err => console.error(err));
