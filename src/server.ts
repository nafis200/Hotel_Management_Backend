import app from "./app";

const port = 5000;

async function main() {
   app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}
main();
