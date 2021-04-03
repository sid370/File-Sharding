#!/usr/bin/env node

const chalk = require("chalk");
var inquirer = require("inquirer");
const { exec, spawn } = require("child_process");
const { fs } = require("fs");
global.fetch = require("node-fetch");

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
            console.log(chalk.cyan("file copied"));

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
                console.log();
                console.log(chalk.cyan("UUID: "), chalk.yellow(res.UUID));
                console.log();
                exec(`rm ${answers.dir}`, (err, stdout, stderr) => {
                  if (stderr)
                    console.log(
                      chalk.blue("File Added to Blockchain"),
                      chalk.red(
                        "Initial Termination Unsuccessful, Manual deletion required"
                      )
                    );
                  else
                    console.log(
                      chalk.blue(
                        "File Added to the Blockchain and Terminated from initial directory"
                      )
                    );
                });
              })
              .catch((err) => {
                console.log(chalk.reset(err));
              });
          });
        }
      });
  });
