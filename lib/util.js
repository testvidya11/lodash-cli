;(function() {
  'use strict';

  /** Load Node.js modules */
  var fs = require('fs'),
      path = require('path');

  /** Load other modules */
  var _ = require('lodash');

  /** Used to indicate if running in Windows */
  var isWindows = process.platform == 'win32';

  /*--------------------------------------------------------------------------*/

  /**
   * The path separator.
   *
   * @memberOf util.path
   * @type string
   */
  var sep = path.sep || (isWindows ? '\\' : '/');

  /**
   * The escaped path separator used for inclusion in RegExp strings.
   *
   * @memberOf util.path
   * @type string
   */
  var sepEscaped = sep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  /** Used to determine if a path is prefixed with a drive letter, dot, or slash */
  var rePrefixed = RegExp('^(?:' + (isWindows ? '[a-zA-Z]:|' : '') + '\\.?)' + sepEscaped);

  /*--------------------------------------------------------------------------*/

  /**
   * Makes the given `dirname` directory, without throwing errors for existing
   * directories and making parent directories as needed.
   *
   * @memberOf util.fs
   * @param {string} dirname The path of the directory.
   * @param {number|string} [mode='0777'] The permission mode.
   */
  function mkdirpSync(dirname, mode) {
    // ensure relative paths are prefixed with `./`
    if (!rePrefixed.test(dirname)) {
      dirname = '.' + sep + dirname;
    }
    dirname.split(sep).reduce(function(currPath, segment) {
      currPath += sep + segment;
      try {
        currPath = fs.realpathSync(currPath);
      } catch(e) {
        fs.mkdirSync(currPath, mode);
      }
      return currPath;
    });
  }

  /**
   * Removes files or directories and their contents recursively.
   *
   * @memberOf util.fs
   * @param {string} pathname The path of the file or directory.
   */
  function rmrfSync(pathname) {
    // safety first, limit to modifying lodash-cli
    if (pathname.indexOf(path.dirname(__dirname) + sep) != 0) {
      return;
    }
    try {
      pathname = fs.realpathSync(pathname);
    } catch(e) {
      return;
    }
    if (!fs.statSync(pathname).isDirectory()) {
      fs.unlinkSync(pathname);
      return;
    }
    fs.readdirSync(pathname).forEach(function(identifier) {
      var currPath = path.join(pathname, identifier);
      if (fs.statSync(currPath).isDirectory()) {
        rmrfSync(currPath);
      } else {
        fs.unlinkSync(currPath);
      }
    });
    fs.rmdirSync(pathname);
  }

  /*--------------------------------------------------------------------------*/

  /**
   * The utility object.
   *
   * @type Object
   */
  var util = {

   /**
    * The file system object.
    *
    * @memberOf util
    * @type Object
    */
    'fs': _.defaults(_.cloneDeep(fs), {
      'existsSync': fs.existsSync || path.existsSync,
      'mkdirpSync': mkdirpSync,
      'rmrfSync': rmrfSync
    }),

   /**
    * The path object.
    *
    * @memberOf util
    * @type Object
    */
    'path': _.defaults(_.cloneDeep(path), {
      'sep': sep,
      'sepEscaped': sepEscaped
    })
  };

  /*--------------------------------------------------------------------------*/

  // export
  module.exports = util;
}());
