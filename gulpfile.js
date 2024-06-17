const gulp = require("gulp");
const fs = require("fs/promises");
const { exec } = require("child_process");

async function clean() {
   try {
      await fs.rm("./build", { recursive: true });
   } catch (err) {
      console.log(err);
   }
   try {
      await fs.mkdir("./build");
   } catch (err) {
      console.log(err);
   }
}

async function copy() {
   await fs.copyFile("./package.json", "./build/package.json");
   await fs.copyFile("./package-lock.json", "./build/package-lock.json");
   await fs.copyFile("./Dockerfile", "./build/Dockerfile");
   await fs.copyFile("./.dockerignore", "./build/.dockerignore");
   await fs.copyFile("./LICENSE", "./build/LICENSE");
}

async function copyFolders() {
   await gulp.src("./views/**", { base: "." }).pipe(gulp.dest("./build/"));
   await gulp.src("./public/**", { base: "." }).pipe(gulp.dest("./build/"));
}

async function typescript() {
   await new Promise((resolve, reject) => {
      exec("tsc", (error, stdout, stderr) => {
         if (error) {
            reject(error);
         } else {
            resolve(stdout);
         }
      });
   });
}

var build = gulp.series(clean, gulp.parallel(copy, copyFolders, typescript));
exports.default = build;
