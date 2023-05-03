const ReportSchema = require("../models/Reportmodel");
const mongoose = require("mongoose");
// const getConnection = require("../app");
const express = require("express");
const router = express.Router();
const reader = require("xlsx");
const excelToJson = require("convert-excel-to-json");
var path = require("path");
var root = path.dirname(require.main.filename);
var tmp = require("tmp");
var fs = require("fs");
const multer = require("multer");
const { response } = require("express");
const { file } = require("tmp");
const PDFJS = require("pdfjs");
let Reports;

// Display list of all Genre.
exports.uploadReportCards = function (req, res) {
  const alls = [];
  const extraInfo = JSON.parse(req.body.extraInfo);
  const schoolCode = extraInfo.schoolCode;
  const schoolName = extraInfo.schoolName;
  const className = extraInfo.className;
  const semester = extraInfo.semester;
  const formNumber = extraInfo.formNumber;
  const graduationYear = extraInfo.className.split("_")[2];
  try {
    // module.exports = Students;
    const successUploads = [];
    const failedUploads = [];
    const saveFile = (singleFile) => {
      // =========== Get unique id and create a new file name ========
      const fileUniqueID = singleFile?.name?.slice(17, 27);
      const newFileName = `${graduationYear}_${formNumber}_${semester}_${fileUniqueID}.pdf`;
      let filePath = `${__dirname}/uploads/${newFileName}`;

      // ============= Check if file exist on disk ============
      let fileExist = fs.existsSync(filePath);
      if (fileExist) {
        failedUploads.push({
          name: singleFile.name,
          error: "File already exist",
          nameOndisk: newFileName,
        });
        return;
      } else {
        // ========== Save file if file does not exist
        singleFile.mv(filePath, async (error) => {
          try {
            if (error) {
              return res.status(200).send({
                error: error.message,
                message:
                  "Could not save file, probably coul dnot find storage location",
                ok: true,
                succes: false,
              });
            }

            //=========== Check if file information exist in DB ===================
            const report = await Reports.findOne({ File_Name: newFileName });
            if (report) {
              failedUploads.push({
                name: singleFile.name,
                error: "File already exist",
                nameOndisk: newFileName,
              });
              console.log("found file");
              return;
            }

            console.log("creating data in db", fileUniqueID);
            // ====================== Save file information in DB ==========
            await Reports.create({
              Unique_Id: fileUniqueID,
              Graduation_Year: graduationYear,
              FormNumber: formNumber,
              Semester: semester,
              File_Name: newFileName,
              AmountPaid: 0,
              DownloadCount: 0,
              AccessExpiry: Date.now(),
              DownloadsLeft: true,
              Locked: true,
            });
            successUploads.push({
              name: singleFile.name,
              error: "File already exist",
              nameOndisk: newFileName,
            });
            console.log("successUploads", successUploads);
          } catch (error) {
            failedUploads.push({
              name: singleFile.name,
              reason: error.message,
              nameOndisk: newFileName,
            });
          }
        });
      }
    };

    const SaveReports = () => {
      // ======= End upload process if there are no fils ==========
      if (req.files === null) {
        return res.status(400);
      }
      // Loop though the files and process each for uploading
      req.files.files.map((myFile) => {
        saveFile(myFile);
      });
      res.status(201).json({
        data: { uploaded: [...successUploads], faiiledUploads: failedUploads },
        extraInfo,
        success: true,
        status: 201,
      });
    };

    // ======================= Connect file information DB ========================
    let connectionUrl = `mongodb://localhost/${schoolCode}_${schoolName}`;
    let connected = mongoose.connect(connectionUrl);
    mongoose.Promise = global.Promise;
    connected.then(() => {
      const con = mongoose.createConnection(connectionUrl);
      con.on("open", () => {
        mongoose.connection.db
          .listCollections({ name: "reports_" + className })
          .next(async (err, names) => {
            // ======= check if a report collection exist for the year =======
            if (names) {
              console.log("exist");
              SaveReports();
            } else {
              console.log("does not exist");
              Reports = mongoose.model(
                "reports_" + extraInfo.className,
                ReportSchema
              );
              SaveReports();
            }
          });
      });
    });
  } catch (error) {
    res.status(200).json({
      error: error.message,
      success: false,
      status: 200,
    });
  }
};

// Display detail page for a specific Genre.
// exports.genre_detail = function (req, res) {
//   res.send("NOT IMPLEMENTED: Genre detail: " + req.params.id);
// };

// Display Genre create form on GET.
// exports.genre_create_get = function (req, res) {
//   res.send("NOT IMPLEMENTED: Genre create GET");
// };
// const getPdfText = async (path) => {
//   const pdf = await PDFJS.getDocument(path);

//   const pagePromises = [];
//   for (let j = 1; j <= pdf.numPages; j++) {
//     const page = pdf.getPage(j);

//     pagePromises.push(
//       page.then((page) => {
//         const textContent = page.getTextContent();
//         return textContent.then((text) => {
//           return text.items.map((s) => s.str).join("");
//         });
//       })
//     );
//   }

//   const texts = await Promise.all(pagePromises);
//   return texts.join("");
// };
