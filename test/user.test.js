import { expect } from "chai";
import supertest from "supertest";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const request = supertest("https://sandbox.manteca.dev/crypto");

function sleep(ms) {
  // Funcion para generar un restraso en el tiempo de ejecucion de los test de lock order y transaccion
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("Suite Usuarios", function () {
  this.timeout(50000);

  var Id = "";
  var uploadUrl = "";
  var uploadUrl2 = "";
  var codeOrder = "";

  // it("get user by id", async function () {
  //   const response = await request
  //     .get(`/v1/user/100005464`)
  //     .set("md-api-key", "65JWR38-X374162-GF1QV5J-1E3KK3C")
  //     .set("Content-Type", "application/json");
  //   expect(response.status).to.equal(200);
  // });

  before(async function () {
    const response = await request
      .post("/v1/user/")
      .set("md-api-key", "65JWR38-X374162-GF1QV5J-1E3KK3C")
      .set("Content-Type", "application/json")
      .send({
        name: "MICAELA GONZALEZ",
        email: "micag61@yahoo.com.ar",
        legalId: "27380640592",
        phoneNumber: "5492615051261",
        country: "Argentina",
        civilState: "SOLTERO",
      });

    Id = response.body.numberId;
    expect(response.status).to.equal(200);
  });

  it("Se debe asignar una cuenta bancaria", async function () {
    const response = await request
      .post(`/v1/user/${Id}/bankaccount/ARS`)
      .set("md-api-key", "65JWR38-X374162-GF1QV5J-1E3KK3C")
      .set("Content-Type", "application/json")
      .send({ cbu: "alias.alias.alias61", description: "HSBC" });

    expect(response.status).to.equal(200);
  });

  it("Se obtiene la url de carga de docs", async function () {
    const response = await request
      .post(`/v1/documentation/${Id}/uploadUrl`)
      .set("md-api-key", "65JWR38-X374162-GF1QV5J-1E3KK3C")
      .set("Content-Type", "application/json")
      .send({
        docType: "DNI_FRONT",
        fileName: "pic1.png",
      });

    uploadUrl = response.body.url;
    expect(response.status).to.equal(200);
  });

  it("Se envia el archivo a la url", async function () {
    const awsUrl = supertest(`${uploadUrl}`);
    const imagePath = path.resolve(__dirname, "../images/pic1.png");

    const imageBuffer = fs.readFileSync(imagePath);

    const response = await awsUrl.put(""); // Simulo el envio de un archivo (Vacio, no necesario para validar en esta instancia)

    expect(response.status).to.equal(200);
  });

  it("Se obtiene la url de carga de docs 2", async function () {
    const response = await request
      .post(`/v1/documentation/${Id}/uploadUrl`)
      .set("md-api-key", "65JWR38-X374162-GF1QV5J-1E3KK3C")
      .set("Content-Type", "application/json")
      .send({
        docType: "DNI_BACK",
        fileName: "pic2.png",
      });

    uploadUrl2 = response.body.url;
    expect(response.status).to.equal(200);
  });

  it("Se envia el archivo a la url 2", async function () {
    const awsUrl = supertest(`${uploadUrl2}`);
    const imagePath = path.resolve(__dirname, "../images/pic1.png");

    const imageBuffer = fs.readFileSync(imagePath);

    const response = await awsUrl.put(""); // Simulo el envio de un archivo (Vacio, no necesario para validar en esta instancia)

    expect(response.status).to.equal(200);
  });

  it("Se crea un lock de orden", async function () {
    await sleep(20000); // Llamo a la funcion sleep para generar un retraso en la ejecucion del test. Esto es por que no es inmediata la validación de documentos, lo que no me permite acceder a un lock inmediatamente
    const data = { coin: "USDT_ARS", operation: "SELL", userId: Id };
    const response = await request
      .post("/v1/order/lock")
      .set("md-api-key", "65JWR38-X374162-GF1QV5J-1E3KK3C")
      .set("Content-Type", "application/json")
      .send(data);

    codeOrder = response.body.code;

    expect(response.status).to.equal(200);
  });

  it("Transacción", async function () {
    await sleep(2000);
    const response = await request
      .post("/v1/order")
      .set("md-api-key", "65JWR38-X374162-GF1QV5J-1E3KK3C")
      .set("Content-Type", "application/json")
      .send({
        userId: Id,
        amount: "10",
        coin: "USDT_ARS",
        operation: "SELL",
        code: codeOrder,
      });
    expect(response.status).to.equal(200);
  });
});

// describe("Suite Order", function () {
//   this.timeout(25000);

//   before(async function () {
//     if (!Id) {
//       throw new Error("El usuario no fue creado. numberId no está definido.");
//     }
//   });

//   it("Se crea un lock de orden", async function () {
//     const response = await request
//       .post("/v1/order/lock")
//       .set("md-api-key", "65JWR38-X374162-GF1QV5J-1E3KK3C")
//       .set("Content-Type", "application/json")
//       .send({ coin: "USDT_ARS", operation: "SELL", userId: Id });

//     codeOrder = response.body.code;

//     expect(response.status).to.equal(200);
//   });

//   it("Transacción", async function () {
//     const response = await request
//       .post("/v1/order")
//       .set("md-api-key", "65JWR38-X374162-GF1QV5J-1E3KK3C")
//       .set("Content-Type", "application/json")
//       .send({
//         userId: Id,
//         amount: "10",
//         coin: "USDT_ARS",
//         operation: "SELL",
//         code: codeOrder,
//       });
//     expect(response.status).to.equal(200);
//   });
// });
