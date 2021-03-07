var Generator = require("yeoman-generator");
module.exports = class extends Generator {
  // The name `constructor` is important here
  constructor(args, opts) {
    // Calling the super constructor is important so our generator is correctly set up
    super(args, opts);
  }

  async question() {
    const answers = await this.prompt([
      {
        type: "input",
        name: "name",
        message: "Your project name",
        default: this.appname, // Default to current folder name
      },
    ]);
    this.answers = answers;
  }

  init() {
    const pkgJson = {
      name: this.answers.name,
      version: "1.0.0",
      description: "",
      scripts: {
        build: "webpack build",
        test: 'mocha --require @babel/register',
        coverage: 'nyc mocha',
      },
      keywords: [],
      author: "",
      license: "ISC",
      devDependencies: {},
      dependencies: {},
    };

    this.fs.extendJSON(this.destinationPath("package.json"), pkgJson);
    this.npmInstall(["vue"], { "save-dev": false });
    this.npmInstall(
      [
        "webpack",
        "webpack-cli",
        "vue-loader",
        "vue-style-loader",
        "css-loader",
        "vue-template-compiler",
        "copy-webpack-plugin",
        "mocha",
        "nyc",
        "@babel/core",
        "@babel/register",
        "@babel/preset-env",
        "babel-loader",
        "babel-plugin-istanbul",
        "@istanbuljs/nyc-config-babel",
      ],
      { "save-dev": true }
    );
  }

  copyTemplates() {
    this.fs.copyTpl(
      this.templatePath(".babelrc"),
      this.destinationPath(".babelrc"),
      {}
    );
    this.fs.copyTpl(
      this.templatePath(".nycrc"),
      this.destinationPath(".nycrc"),
      {}
    );
    this.fs.copyTpl(
      this.templatePath("test/sample-test.js"),
      this.destinationPath("test/sample-test.js"),
      {}
    );
    this.fs.copyTpl(
      this.templatePath("HelloWorld.vue"),
      this.destinationPath("src/HelloWorld.vue"),
      {}
    );
    this.fs.copyTpl(
      this.templatePath("webpack.config.js"),
      this.destinationPath("webpack.config.js"),
      {}
    );
    this.fs.copyTpl(
      this.templatePath("main.js"),
      this.destinationPath("src/main.js"),
      {}
    );
    this.fs.copyTpl(
      this.templatePath("index.html"),
      this.destinationPath("src/index.html"),
      { title: this.answers.name }
    );
  }
};
