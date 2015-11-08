'use strict';
var GulpConfig = (function () {
    function gulpConfig() {
        this.dist = './dist';

        this.sources = 'app';
        this.publicRoot = this.sources + '/public';
        this.startScript = this.sources + "/app.js";

        this.backendTypeScriptFiles = [this.sources + '/**/*.ts', '!' + this.publicRoot];
        this.frontendTypeScriptFiles = this.publicRoot + '/**/*.ts';

        this.scssFiles = this.publicRoot + '/scss/*.scss';
        this.cssDir = this.publicRoot + '/styles';

        this.typings = './typings';
        this.libraryTypeScriptDefinitions = './typings/**/*.ts';

        this.bowerComponents = this.sources + '/public/components';

        this.browsersyncRestartDelay = 1000;
    }
    return gulpConfig;
})();
module.exports = GulpConfig;