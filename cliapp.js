#!/usr/bin/env node

const chalk = require("chalk");
var inquirer = require("inquirer");
const { exec, spawn } = require("child_process");
const { fs } = require("fs");
global.fetch = require("node-fetch");
const ora = require("ora");
const spinner = ora({ color: "blue" });
const yargs = require("yargs");
const figlet = require("figlet");

figlet("File-Sharding", (err, data) => {
  console.log(data);
  console.log();
  yargs.command({
    command: "gen",
    describe: "Generate File",
    builder: {
      uuid: {
        describe: "UUID",
        demandOption: false,
      },
    },

    handler(argv) {
      if (argv.uuid !== "") {
        console.log();
        spinner.start("Generating your file...");
        console.log();
        fetch("http://localhost:4000/genfile/" + argv.uuid, {
          method: "Get",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((res) => res.text())
          .then((res) => {
            spinner.stop();
            console.log(chalk.yellow("Regenerated Text: "), res);
          });
      }
    },
  });
  const p = yargs.parse();
  //console.log(p)
  if (p._.length !== 0) return;

  inquirer
    .prompt([
      {
        type: "text",
        message: "File-Directory: ",
        name: "dir",
      },
    ])
    .then((answers) => {
      inquirer
        .prompt([
          {
            type: "confirm",
            message: "Are you sure you want to do this? ",
            name: "confirmation",
          },
        ])
        .then((ans) => {
          if (ans.confirmation) {
            //const check=spawn("[ ! -f '."+answers.dir+"' ] && echo `Path does not exist`")
            //console.log(answers.dir);
            const command = `cp ${answers.dir} "/media/siddhant/Data Volume/Winter-Semester-2021/A1- Crypto/J-Component/File-Sharding/uploads/"`;

            exec(command, (err, stdout, stderr) => {
              if (stderr) {
                console.warn(chalk.red(stderr));
              }
              //console.log(chalk.cyan("Processing..."));
              console.log();
              spinner.start("Processing the File...\n");

              var splt = answers.dir.split("/");
              var fname = splt[splt.length - 1];
              //console.log("FileName: ", fname);
              fetch(`http://localhost:4000/cli/file/${fname}`, {
                method: "POST",
                mode: "cors",
                headers: {
                  "Content-Type": "application/json",
                },
              })
                .then((res) => res.json())
                .then((res) => {
                  spinner.stop();
                  console.log();
                  console.log(chalk.cyan("UUID: "), chalk.yellow(res.UUID));
                  console.log();
                  exec(`rm ${answers.dir}`, (err, stdout, stderr) => {
                    if (stderr)
                      console.log(
                        chalk.blue("File Added to Blockchain"),
                        chalk.red.bold.bgWhite(
                          "Initial Termination Unsuccessful, Manual deletion required"
                        )
                      );
                    else
                      console.log(
                        chalk.red.bold(
                          "File Added to the Blockchain and Terminated from initial directory"
                        )
                      );
                  });
                })
                .catch((err) => {
                  spinner.stop();
                  console.log(chalk.reset(err));
                });
            });
          }
        });
    });
});
