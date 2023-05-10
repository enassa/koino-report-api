const fs = require("fs");
const Pdfmake = require("pdfmake");

const getHtmlBody = (user, resetUrl, header, name) => `<html><body> 
<h1 style='color:#5856d6'>Koinovote.org - ${header || "Password reset"}</h1>
<p > Hi ${name || user.email},</p>
<p>Please click on the link below to reset your password. Please note that the link will expire in 15 minutes.</p>
<p'> Reset your password:  ${resetUrl}</p>
</body</html>`;
const getCreatedElectionBody = (
  votinglink,
  resultsLink,
  electionTitle,
  password
) => `
<html>
  <body>
    <h1 style="color:green;">Election info</h1>
    <div style="display:flex;">
      <strong>Title of election: </strong>
      <span> ${electionTitle}</span>
    </div>
    <div style="display:flex;">
      <strong>Voting link: </strong>
      <span> ${votinglink}</span>
    </div>
    <div style="display:flex;">
      <strong>Results link:</strong>
      <span> ${resultsLink}</span>
    </div>
    <div style="display:flex;">
      <strong>Password to results page:</strong>
      <span> ${password}</span>
    </div>
  </body>
</html>
`;
const getRandomStringKey = (limit = 5) => {
  return Math.random(0).toString();
};
const getRandomInt = (max = 999999) => {
  return Math.floor(Math.random() * max);
};
// prettier-ignore
const generateRandomId = () => {
  var S4 = function() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
 };
 return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
};
// prettier-ignore
const generateRandomNoDashes = () =>  {
  var S4 = function() {
     return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };
  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

const generateShortId = () => {
  var S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return S4() + S4() + "" + S4() + "" + S4();
};

const generateVeryShortId = () => {
  var S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return S4() + S4() + "" + S4();
};
const generateSuperShortId = () => {
  var S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return S4() + S4();
};

const createPdf = (pdfName) => {
  var fonts = {
    Roboto: {
      normal: __dirname + "/fonts/roboto/Roboto-Regular.ttf",
      bold: "/fonts/roboto/Roboto-Regular.ttf",
      italics: "fonts/roboto/Roboto-Italic.ttf",
      bolditalics: "fonts/roboto/Roboto-MediumItalic.ttf",
    },
  };

  let pdfmake = new Pdfmake(fonts);

  let docDefination = {
    content: ["Hello World!"],
  };

  let pdfDoc = pdfmake.createPdfKitDocument(docDefination, {});
  pdfDoc.pipe(fs.createWriteStream(__dirname + `/pdfs/${pdfName}.pdf`));
  pdfDoc.end();
};
const replaceSpaceWithUnderscore = (stringToReplace) => {
  let results;
  try {
    results = stringToReplace.replace(/ /g, "_");
  } catch {}
  return results;
};

const corsAcceptedUrls = [
  "https://koinovoter.web.app",
  "http://localhost:3000",
  "http://localhost:5000",
];
const clientBaseUrl =
  process.env.NODE_ENV === "production"
    ? "https://koinovoter.web.app"
    : "http://localhost:3000";

const password = "dLc2oCkLQGvmKy3m";
const mongPath =
  process.env.NODE_ENV === "production"
    ? `mongodb+srv://koinoreport:${password}@koinoreport.kd67xh6.mongodb.net`
    : `mongodb://127.0.0.1:27017`;

module.exports = {
  clientBaseUrl,
  corsAcceptedUrls,
  password,
  mongPath,
  getHtmlBody,
  getRandomStringKey,
  getRandomInt,
  generateRandomId,
  generateShortId,
  generateVeryShortId,
  generateSuperShortId,
  generateRandomNoDashes,
  getCreatedElectionBody,
  createPdf,
  replaceSpaceWithUnderscore,
};
